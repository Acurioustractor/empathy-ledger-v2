import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/public/featured-stories
 * Get featured stories for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Fetch featured stories that are published and public
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        excerpt,
        content,
        story_type,
        featured_image_url,
        reading_time_minutes,
        views_count,
        likes_count,
        cultural_tags,
        cultural_territory,
        created_at,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          cultural_background,
          profiles!inner (
            avatar_url
          )
        )
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Error fetching featured stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch featured stories' },
        { status: 500 }
      )
    }

    // Transform the data to match expected format
    const transformedStories = (stories || []).map(story => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt || story.content?.substring(0, 200) + '...',
      story_type: story.story_type,
      featured_image_url: story.featured_image_url,
      reading_time_minutes: story.reading_time_minutes,
      views_count: story.views_count || 0,
      likes_count: story.likes_count || 0,
      cultural_tags: story.cultural_tags || [],
      cultural_territory: story.cultural_territory,
      created_at: story.created_at,
      storyteller: {
        display_name: story.storyteller?.display_name || 'Anonymous',
        cultural_background: story.storyteller?.cultural_background,
        avatar_url: story.storyteller?.profiles?.[0]?.avatar_url
      }
    }))

    return NextResponse.json(
      {
        stories: transformedStories,
        count: transformedStories.length
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in featured-stories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
