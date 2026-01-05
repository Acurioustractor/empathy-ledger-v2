import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get current story
    const { data: currentStory } = await supabase
      .from('stories')
      .select('*, storyteller:storytellers!storyteller_id(id)')
      .eq('id', id)
      .single()

    if (!currentStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isOwner = currentStory.storyteller_id === profile?.id

    const { data: collaboration } = await supabase
      .from('story_collaborators')
      .select('can_edit')
      .eq('story_id', id)
      .eq('collaborator_id', profile?.id)
      .eq('status', 'accepted')
      .single()

    const canEdit = isOwner || collaboration?.can_edit

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Update story
    const { data: story, error: updateError } = await supabase
      .from('stories')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating story:', updateError)
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      )
    }

    // Create version if significant change
    const contentChanged = body.content && body.content !== currentStory.content
    const titleChanged = body.title && body.title !== currentStory.title

    if (contentChanged || titleChanged) {
      // Get latest version number
      const { data: latestVersion } = await supabase
        .from('story_versions')
        .select('version_number')
        .eq('story_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      const nextVersionNumber = (latestVersion?.version_number || 0) + 1

      await supabase.from('story_versions').insert({
        story_id: id,
        version_number: nextVersionNumber,
        title: story.title,
        content: story.content,
        metadata: {
          story_type: story.story_type,
          cultural_sensitivity_level: story.cultural_sensitivity_level
        },
        created_by: user.id,
        change_summary: body.change_summary || null
      })
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Error in PATCH /api/stories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get story
    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('id', id)
      .single()

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user is owner (only owner can delete)
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (story.storyteller_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied - only owner can delete' },
        { status: 403 }
      )
    }

    // Soft delete by setting deleted_at
    const { error: deleteError } = await supabase
      .from('stories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting story:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/stories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
