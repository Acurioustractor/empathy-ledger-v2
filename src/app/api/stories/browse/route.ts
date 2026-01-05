import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/stories/browse
 * Browse stories with filters and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
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
        orderBy = { column: 'comments_count', ascending: false }
        break
    }

    // Build query
    let query = supabase
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
        cultural_tags,
        language,
        created_at,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          cultural_background,
          profile:profiles!storytellers_profile_id_fkey (
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('is_public', true)

    // Apply filters
    const themes = searchParams.get('themes')
    if (themes) {
      const themeArray = themes.split(',')
      query = query.contains('cultural_tags', themeArray)
    }

    const culturalGroups = searchParams.get('cultural_groups')
    if (culturalGroups) {
      const groups = culturalGroups.split(',')
      query = query.in('storytellers.cultural_background', groups)
    }

    const mediaTypes = searchParams.get('media_types')
    if (mediaTypes) {
      const types = mediaTypes.split(',')
      query = query.in('story_type', types)
    }

    const languages = searchParams.get('languages')
    if (languages) {
      const langs = languages.split(',')
      query = query.in('language', langs)
    }

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

    // Transform data
    const transformedStories = (stories || []).map(story => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt || story.content?.substring(0, 200) + '...',
      story_type: story.story_type,
      featured_image_url: story.featured_image_url,
      reading_time_minutes: story.reading_time_minutes,
      views_count: story.views_count || 0,
      cultural_tags: story.cultural_tags || [],
      language: story.language,
      created_at: story.created_at,
      storyteller: {
        id: story.storyteller?.id,
        display_name: story.storyteller?.display_name || 'Anonymous',
        cultural_background: story.storyteller?.cultural_background,
        avatar_url: story.storyteller?.profile?.avatar_url
      }
    }))

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
