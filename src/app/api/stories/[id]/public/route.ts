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
    const supabase = createSupabaseServerClient()

    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          cultural_background,
          cultural_affiliations,
          bio,
          elder_status,
          profiles!inner (
            avatar_url
          )
        ),
        media:media_assets (
          id,
          url,
          type,
          caption,
          cultural_tags,
          alt_text
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .eq('is_public', true)
      .single()

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

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
        cultural_affiliations: story.storyteller.cultural_affiliations,
        bio: story.storyteller.bio,
        elder_status: story.storyteller.elder_status,
        avatar_url: story.storyteller.profiles?.[0]?.avatar_url,
        story_count: storyCount || 1
      } : null,
      media: story.media || []
    }

    return NextResponse.json({ story: transformedStory }, { status: 200 })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
