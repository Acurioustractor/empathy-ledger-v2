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

    // Get story and check ownership/permissions (similar to publish)
    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id')
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

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Permission denied - only owner can unpublish' },
        { status: 403 }
      )
    }

    // Unpublish story
    const { data: unpublishedStory, error: unpublishError } = await supabase
      .from('stories')
      .update({
        status: 'draft',
        is_public: false,
        unpublished_at: new Date().toISOString(),
        unpublish_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (unpublishError) {
      console.error('Error unpublishing story:', unpublishError)
      return NextResponse.json(
        { error: 'Failed to unpublish story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: unpublishedStory })
  } catch (error) {
    console.error('Error in POST /api/stories/[id]/unpublish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
