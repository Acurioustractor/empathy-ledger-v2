import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/public/recent-stories
 * Get recently published stories for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    // Fetch recent published stories
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        summary,
        content,
        story_type,
        story_image_url,
        views_count,
        created_at,
        storyteller_id
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

    // Transform the data
    const transformedStories = (stories || []).map(story => {
      const storyteller = story.storyteller_id ? storytellersMap[story.storyteller_id] : null
      return {
        id: story.id,
        title: story.title,
        excerpt: story.summary || story.content?.substring(0, 150) + '...',
        story_type: story.story_type,
        featured_image_url: story.story_image_url,
        views_count: story.views_count || 0,
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
    console.error('Error in recent-stories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
