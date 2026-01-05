import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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
      .select('*, storyteller:storytellers!storyteller_id(id)')
      .eq('id', id)
      .single()

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Check permissions
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
        { error: 'Permission denied - cannot publish' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!story.title || story.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Story must have a title' },
        { status: 400 }
      )
    }

    if (!story.content || story.content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Story content is too short' },
        { status: 400 }
      )
    }

    if (!story.cultural_tags || story.cultural_tags.length === 0) {
      return NextResponse.json(
        { error: 'Story must have at least one cultural theme' },
        { status: 400 }
      )
    }

    // Check if sacred content requires Elder approval
    if (story.cultural_sensitivity_level === 'sacred' && !story.elder_approved) {
      return NextResponse.json(
        { error: 'Sacred content requires Elder approval before publishing' },
        { status: 403 }
      )
    }

    // Publish story
    const { data: publishedStory, error: publishError } = await supabase
      .from('stories')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (publishError) {
      console.error('Error publishing story:', publishError)
      return NextResponse.json(
        { error: 'Failed to publish story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: publishedStory })
  } catch (error) {
    console.error('Error in POST /api/stories/[id]/publish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
