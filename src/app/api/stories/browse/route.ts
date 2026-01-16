import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/stories/browse
 * Browse stories with filters and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Sorting
    const sort = searchParams.get('sort') || 'recent'
    let orderBy: { column: string; ascending: boolean } = { column: 'created_at', ascending: false }

    switch (sort) {
      case 'recent':
        orderBy = { column: 'created_at', ascending: false }
        break
      case 'oldest':
        orderBy = { column: 'created_at', ascending: true }
        break
      case 'popular':
        orderBy = { column: 'views_count', ascending: false }
        break
      case 'alphabetical':
        orderBy = { column: 'title', ascending: true }
        break
      case 'most-commented':
        // Note: comments_count column doesn't exist yet, falling back to recent
        orderBy = { column: 'created_at', ascending: false }
        break
    }

    // Build query - fetch stories without join to avoid FK issues
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        summary,
        content,
        story_type,
        story_image_url,
        views_count,
        cultural_themes,
        created_at,
        storyteller_id
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('is_public', true)

    // Apply filters
    const themes = searchParams.get('themes')
    if (themes) {
      const themeArray = themes.split(',')
      query = query.contains('cultural_themes', themeArray)
    }

    // Note: cultural_groups filter would require a join - skipping for now
    // const culturalGroups = searchParams.get('cultural_groups')

    const mediaTypes = searchParams.get('media_types')
    if (mediaTypes) {
      const types = mediaTypes.split(',')
      query = query.in('story_type', types)
    }

    // Note: language column doesn't exist in stories table

    // Apply sorting and pagination
    const { data: stories, error, count } = await query
      .order(orderBy.column, { ascending: orderBy.ascending })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    // Fetch storytellers for the stories
    const storytellerIds = [...new Set((stories || []).map(s => s.storyteller_id).filter(Boolean))]
    const storytellersMap: Record<string, { id: string; display_name: string; cultural_background?: string; public_avatar_url?: string }> = {}

    if (storytellerIds.length > 0) {
      const { data: storytellers } = await supabase
        .from('storytellers')
        .select('id, display_name, cultural_background, public_avatar_url')
        .in('id', storytellerIds)

      for (const st of storytellers || []) {
        storytellersMap[st.id] = st
      }
    }

    // Transform data
    const transformedStories = (stories || []).map(story => {
      const storyteller = story.storyteller_id ? storytellersMap[story.storyteller_id] : null
      return {
        id: story.id,
        title: story.title,
        excerpt: story.summary || story.content?.substring(0, 200) + '...',
        story_type: story.story_type,
        featured_image_url: story.story_image_url,
        view_count: story.views_count || 0,
        cultural_tags: story.cultural_themes || [],
        created_at: story.created_at,
        storyteller: {
          id: storyteller?.id,
          display_name: storyteller?.display_name || 'Anonymous',
          cultural_background: storyteller?.cultural_background,
          avatar_url: storyteller?.public_avatar_url
        }
      }
    })

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      {
        stories: transformedStories,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: totalPages
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in browse API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
