import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/public/featured-stories
 * Get featured stories for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch featured stories that are published and public
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        excerpt,
        content,
        story_type,
        story_image_url,
        reading_time,
        views_count,
        likes_count,
        cultural_themes,
        created_at,
        storyteller_id
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Error fetching featured stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch featured stories' },
        { status: 500 }
      )
    }

    // Fetch storytellers separately
    const storytellerIds = [...new Set((stories || []).map(s => s.storyteller_id).filter(Boolean))]
    let storytellersMap: Record<string, { display_name: string; cultural_background?: string; public_avatar_url?: string }> = {}

    if (storytellerIds.length > 0) {
      const { data: storytellers } = await supabase
        .from('storytellers')
        .select('id, display_name, cultural_background, public_avatar_url')
        .in('id', storytellerIds)

      for (const st of storytellers || []) {
        storytellersMap[st.id] = st
      }
    }

    // Transform the data to match expected format
    const transformedStories = (stories || []).map(story => {
      const storyteller = story.storyteller_id ? storytellersMap[story.storyteller_id] : null
      return {
        id: story.id,
        title: story.title,
        excerpt: story.excerpt || story.content?.substring(0, 200) + '...',
        story_type: story.story_type,
        featured_image_url: story.story_image_url,
        reading_time_minutes: story.reading_time,
        views_count: story.views_count || 0,
        likes_count: story.likes_count || 0,
        cultural_tags: story.cultural_themes || [],
        created_at: story.created_at,
        storyteller: {
          display_name: storyteller?.display_name || 'Anonymous',
          cultural_background: storyteller?.cultural_background,
          avatar_url: storyteller?.public_avatar_url
        }
      }
    })

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
