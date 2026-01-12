import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/stories/search
 * Full-text search for published stories
 *
 * Query Parameters:
 * - q: Search query (keywords)
 * - themes: Comma-separated theme filters
 * - tags: Comma-separated tag filters
 * - cultural_group: Cultural group filter
 * - audience: Target audience filter
 * - article_type: Article type filter (for editorial content)
 * - storyteller_id: Filter by specific storyteller
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 * - sort: Sort order - 'relevance' (default), 'recent', 'popular', 'alphabetical'
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)

    const { searchParams } = new URL(request.url)

    // Search query
    const query = searchParams.get('q') || ''

    // Filters
    const themes = searchParams.get('themes')?.split(',').filter(Boolean) || []
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const culturalGroup = searchParams.get('cultural_group')
    const audience = searchParams.get('audience')
    const articleType = searchParams.get('article_type')
    const storytellerId = searchParams.get('storyteller_id')

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    // Sorting
    const sort = searchParams.get('sort') || 'relevance'

    // Build base query
    // Note: Some columns (slug, comments_count, audience) added in migration 20260111000001
    // They may not exist yet - query will fail gracefully
    let dbQuery = supabase
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
        cultural_themes,
        language,
        published_at,
        created_at,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          cultural_background,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('status', 'published')

    // Full-text search using search_vector
    if (query) {
      // Use websearch_to_tsquery for natural language queries
      // Supports phrases in quotes, AND/OR operators, etc.
      dbQuery = dbQuery.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      })
    }

    // Apply filters
    if (culturalGroup) {
      dbQuery = dbQuery.contains('cultural_themes', [culturalGroup])
    }

    if (storytellerId) {
      dbQuery = dbQuery.eq('storyteller_id', storytellerId)
    }

    // Note: These filters require migration 20260111000001
    // Commenting out until migration applied:
    // if (themes.length > 0) {
    //   dbQuery = dbQuery.overlaps('themes', themes)
    // }
    // if (tags.length > 0) {
    //   dbQuery = dbQuery.overlaps('tags', tags)
    // }
    // if (audience) {
    //   dbQuery = dbQuery.eq('audience', audience)
    // }
    // if (articleType) {
    //   dbQuery = dbQuery.eq('article_type', articleType)
    // }

    // Apply sorting
    switch (sort) {
      case 'relevance':
        // When searching, sort by relevance (ts_rank)
        // When no query, fall back to recent
        if (query) {
          // PostgreSQL ts_rank for relevance scoring
          // Note: Supabase doesn't expose ts_rank directly, so we order by published_at
          // For production, consider using RPC function for true relevance ranking
          dbQuery = dbQuery.order('published_at', { ascending: false })
        } else {
          dbQuery = dbQuery.order('published_at', { ascending: false })
        }
        break

      case 'recent':
        dbQuery = dbQuery.order('published_at', { ascending: false })
        break

      case 'popular':
        dbQuery = dbQuery.order('views_count', { ascending: false })
        break

      case 'alphabetical':
        dbQuery = dbQuery.order('title', { ascending: true })
        break

      case 'most_commented':
        dbQuery = dbQuery.order('comments_count', { ascending: false })
        break

      default:
        dbQuery = dbQuery.order('published_at', { ascending: false })
    }

    // Apply pagination
    const { data: stories, error, count } = await dbQuery
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error searching stories:', error)
      return NextResponse.json(
        { error: 'Failed to search stories', details: error.message },
        { status: 500 }
      )
    }

    // Transform data for response
    const transformedStories = (stories || []).map(story => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt || story.content?.substring(0, 200) + '...',
      story_type: story.story_type,
      story_image_url: story.story_image_url,
      reading_time_minutes: story.reading_time,
      view_count: story.views_count || 0,
      cultural_themes: story.cultural_themes || [],
      language: story.language,
      published_at: story.published_at,
      storyteller: story.storyteller ? {
        id: story.storyteller.id,
        display_name: story.storyteller.display_name || 'Anonymous',
        cultural_background: story.storyteller.cultural_background,
        avatar_url: story.storyteller.avatar_url
      } : null
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      stories: transformedStories,
      search: {
        query,
        filters: {
          themes: themes.length > 0 ? themes : undefined,
          tags: tags.length > 0 ? tags : undefined,
          cultural_group: culturalGroup || undefined,
          audience: audience || undefined,
          article_type: articleType || undefined,
          storyteller_id: storytellerId || undefined
        },
        sort
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_more: page < totalPages
      }
    })

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
