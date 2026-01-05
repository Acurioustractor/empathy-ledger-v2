import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { version_id, reason } = body

    if (!version_id) {
      return NextResponse.json(
        { error: 'version_id is required' },
        { status: 400 }
      )
    }

    // Get story and check permissions
    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id, title, content')
      .eq('id', id)
      .single()

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isOwner = story.storyteller_id === profile?.id

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

    // Get version to restore
    const { data: version } = await supabase
      .from('story_versions')
      .select('*')
      .eq('id', version_id)
      .eq('story_id', id)
      .single()

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }

    // Get latest version number
    const { data: latestVersion } = await supabase
      .from('story_versions')
      .select('version_number')
      .eq('story_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    const nextVersionNumber = (latestVersion?.version_number || 0) + 1

    // Save current state as a new version before restoring
    await supabase.from('story_versions').insert({
      story_id: id,
      version_number: nextVersionNumber,
      title: story.title,
      content: story.content,
      created_by: user.id,
      change_summary: 'Pre-restore snapshot'
    })

    // Restore story to the selected version
    const { data: restoredStory, error: updateError } = await supabase
      .from('stories')
      .update({
        title: version.title,
        content: version.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error restoring story:', updateError)
      return NextResponse.json(
        { error: 'Failed to restore version' },
        { status: 500 }
      )
    }

    // Create restore version record
    await supabase.from('story_versions').insert({
      story_id: id,
      version_number: nextVersionNumber + 1,
      title: version.title,
      content: version.content,
      created_by: user.id,
      restored_from: version_id,
      change_summary: reason || `Restored to Version ${version.version_number}`
    })

    return NextResponse.json({ story: restoredStory })
  } catch (error) {
    console.error('Error in POST /api/stories/[id]/restore:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
