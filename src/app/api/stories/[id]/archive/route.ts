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
    const { reason } = body

    // Get story and check ownership
    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id, status')
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

    if (story.storyteller_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied - only owner can archive' },
        { status: 403 }
      )
    }

    // Archive story (also unpublish if currently published)
    const updates: any = {
      status: 'archived',
      archived_at: new Date().toISOString(),
      archive_reason: reason || null,
      updated_at: new Date().toISOString()
    }

    if (story.status === 'published') {
      updates.is_public = false
      updates.unpublished_at = new Date().toISOString()
    }

    const { data: archivedStory, error: archiveError } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (archiveError) {
      console.error('Error archiving story:', archiveError)
      return NextResponse.json(
        { error: 'Failed to archive story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: archivedStory })
  } catch (error) {
    console.error('Error in POST /api/stories/[id]/archive:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
