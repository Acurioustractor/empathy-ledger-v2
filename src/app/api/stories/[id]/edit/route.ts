import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
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

    // Get story with full details
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers!storyteller_id (
          id,
          full_name,
          avatar_url
        ),
        project:projects!project_id (
          id,
          title
        ),
        media:story_media (
          id,
          media_asset:media_assets!media_asset_id (*)
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to edit
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isOwner = story.storyteller_id === profile?.id

    // Check if user is a collaborator with edit permission
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

    return NextResponse.json({ story, isOwner, canEdit: true })
  } catch (error) {
    console.error('Error in GET /api/stories/[id]/edit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
