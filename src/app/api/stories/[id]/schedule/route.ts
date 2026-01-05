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
    const { scheduled_at } = body

    if (!scheduled_at) {
      return NextResponse.json(
        { error: 'scheduled_at is required' },
        { status: 400 }
      )
    }

    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Get story and check permissions
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

    const { data: collaboration } = await supabase
      .from('story_collaborators')
      .select('can_publish')
      .eq('story_id', id)
      .eq('collaborator_id', profile?.id)
      .eq('status', 'accepted')
      .single()

    const canPublish = isOwner || collaboration?.can_publish

    if (!canPublish) {
      return NextResponse.json(
        { error: 'Permission denied - cannot schedule publishing' },
        { status: 403 }
      )
    }

    // Schedule story
    const { data: scheduledStory, error: scheduleError } = await supabase
      .from('stories')
      .update({
        status: 'scheduled',
        scheduled_publish_at: scheduledDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (scheduleError) {
      console.error('Error scheduling story:', scheduleError)
      return NextResponse.json(
        { error: 'Failed to schedule story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: scheduledStory })
  } catch (error) {
    console.error('Error in POST /api/stories/[id]/schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
