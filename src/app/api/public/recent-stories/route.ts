import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/public/recent-stories
 * Get recently published stories for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    // Fetch recent published stories
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
        created_at,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          cultural_background
        )
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recent stories' },
        { status: 500 }
      )
    }

    // Transform the data
    const transformedStories = (stories || []).map(story => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt || story.content?.substring(0, 150) + '...',
      story_type: story.story_type,
      featured_image_url: story.featured_image_url,
      reading_time_minutes: story.reading_time_minutes,
      views_count: story.views_count || 0,
      created_at: story.created_at,
      storyteller: {
        display_name: story.storyteller?.display_name || 'Anonymous',
        cultural_background: story.storyteller?.cultural_background
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
    console.error('Error in recent-stories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
