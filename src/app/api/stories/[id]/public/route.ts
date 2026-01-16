import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/stories/[id]/public
 * Get full public story with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    // First get the story with storyteller
    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          cultural_background,
          bio,
          avatar_url
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .eq('is_public', true)
      .single()

    if (error || !story) {
      console.error('Error fetching public story:', error)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Fetch media assets separately (no direct FK relationship)
    const { data: media } = await supabase
      .from('media_assets')
      .select('id, url, type, caption, cultural_tags, alt_text')
      .eq('story_id', id)

    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('storyteller_id', story.storyteller_id)
      .eq('status', 'published')

    const transformedStory = {
      ...story,
      storyteller: story.storyteller ? {
        id: story.storyteller.id,
        display_name: story.storyteller.display_name,
        cultural_background: story.storyteller.cultural_background,
        bio: story.storyteller.bio,
        avatar_url: story.storyteller.avatar_url,
        story_count: storyCount || 1
      } : null,
      media: media || []
    }

    return NextResponse.json({ story: transformedStory }, { status: 200 })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
