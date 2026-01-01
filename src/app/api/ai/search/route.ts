import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { 


  intelligentSearchSystem,
  searchContent,
  getSearchSuggestions,
  findSimilarStories
} from '@/lib/ai/intelligent-search-system'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || searchParams.get('query') || ''
    const userId = searchParams.get('user_id')
    const action = searchParams.get('action') || 'search'
    const contentTypes = searchParams.get('content_types')?.split(',') as ('story' | 'storyteller' | 'gallery' | 'media')[]
    const maxResults = parseInt(searchParams.get('max_results') || '10')
    const elderApprovedOnly = searchParams.get('elder_approved_only') === 'true'
    const culturalSensitivity = searchParams.get('cultural_sensitivity') as 'any' | 'low' | 'medium' | 'high'
    const storyId = searchParams.get('story_id')
    const timeframe = searchParams.get('timeframe') as 'day' | 'week' | 'month'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const supabase = createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, display_name, cultural_affiliations, is_elder')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let result

    switch (action) {
      case 'search':
        if (!query.trim()) {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          )
        }

        result = await intelligentSearchSystem.search({
          query,
          user_id: userId,
          filters: {
            content_types: contentTypes,
            cultural_sensitivity: culturalSensitivity,
            elder_approved_only: elderApprovedOnly
          },
          max_results: maxResults
        })

        // Log search for analytics
        await supabase
          .from('search_analytics')
          .insert({
            user_id: userId,
            query,
            content_types: contentTypes || ['story'],
            filters_applied: {
              cultural_sensitivity: culturalSensitivity,
              elder_approved_only: elderApprovedOnly
            },
            results_count: result.results.length,
            cultural_context: user.cultural_affiliations || [],
            searched_at: new Date().toISOString()
          })
          .catch(error => {
            console.error('Failed to log search analytics:', error)
          })

        return NextResponse.json({
          success: true,
          search_results: result.results,
          search_insights: result.insights,
          search_stats: {
            total_found: result.total_found,
            culturally_filtered: result.culturally_filtered,
            returned: result.results.length
          },
          metadata: {
            user_id: userId,
            query,
            filters_applied: {
              content_types: contentTypes,
              cultural_sensitivity: culturalSensitivity,
              elder_approved_only: elderApprovedOnly
            },
            searched_at: new Date().toISOString()
          }
        })

      case 'suggestions':
        if (!query.trim() || query.length < 2) {
          return NextResponse.json({
            success: true,
            suggestions: [],
            message: 'Query too short for suggestions'
          })
        }

        const suggestions = await getSearchSuggestions(query, userId, maxResults)
        
        return NextResponse.json({
          success: true,
          suggestions,
          partial_query: query,
          metadata: {
            user_id: userId,
            generated_at: new Date().toISOString()
          }
        })

      case 'similar':
        if (!storyId) {
          return NextResponse.json(
            { error: 'Story ID is required for similar content search' },
            { status: 400 }
          )
        }

        const similarResults = await findSimilarStories(storyId, userId, maxResults)
        
        return NextResponse.json({
          success: true,
          similar_content: similarResults,
          reference_story_id: storyId,
          metadata: {
            user_id: userId,
            found_similar: similarResults.length,
            generated_at: new Date().toISOString()
          }
        })

      case 'trending':
        const trendingData = await intelligentSearchSystem.getTrendingSearches(userId, timeframe)
        
        return NextResponse.json({
          success: true,
          trending_data: trendingData,
          timeframe: timeframe || 'week',
          metadata: {
            user_id: userId,
            retrieved_at: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: search, suggestions, similar, or trending' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('AI search error:', error)
    
    return NextResponse.json(
      { 
        error: 'Search request failed',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query, 
      user_id, 
      filters = {}, 
      search_context = {}, 
      max_results = 10 
    } = body

    if (!query || !user_id) {
      return NextResponse.json(
        { error: 'Query and user_id are required' },
        { status: 400 }
      )
    }

    // Verify user
    const supabase = createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, display_name, cultural_affiliations, is_elder')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Perform advanced search with custom context
    const searchResults = await intelligentSearchSystem.search({
      query,
      user_id,
      filters: {
        content_types: filters.content_types,
        cultural_sensitivity: filters.cultural_sensitivity,
        story_types: filters.story_types,
        languages: filters.languages,
        time_period: filters.time_period,
        cultural_affiliations: filters.cultural_affiliations,
        elder_approved_only: filters.elder_approved_only,
        community_only: filters.community_only
      },
      search_context: {
        current_story_id: search_context.current_story_id,
        browsing_context: search_context.browsing_context,
        emotional_state: search_context.emotional_state,
        learning_goals: search_context.learning_goals
      },
      max_results
    })

    // Enhanced logging for advanced search
    await supabase
      .from('search_analytics')
      .insert({
        user_id,
        query,
        content_types: filters.content_types || ['story'],
        filters_applied: filters,
        search_context: search_context,
        results_count: searchResults.results.length,
        cultural_context: user.cultural_affiliations || [],
        advanced_search: true,
        searched_at: new Date().toISOString()
      })
      .catch(error => {
        console.error('Failed to log advanced search analytics:', error)
      })

    return NextResponse.json({
      success: true,
      search_results: searchResults.results,
      search_insights: searchResults.insights,
      search_stats: {
        total_found: searchResults.total_found,
        culturally_filtered: searchResults.culturally_filtered,
        returned: searchResults.results.length
      },
      applied_filters: filters,
      search_context: search_context,
      metadata: {
        user_id,
        user_context: {
          cultural_affiliations: user.cultural_affiliations,
          is_elder: user.is_elder
        },
        query_processed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI advanced search error:', error)
    
    return NextResponse.json(
      { 
        error: 'Advanced search request failed',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Search analytics and insights
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user_id, timeframe = 'month', search_query } = body

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'Action and user_id are required' },
        { status: 400 }
      )
    }

    // Verify user permissions
    const supabase = createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, is_elder, community_roles')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only elders or users with analytics roles can access detailed analytics
    const hasAnalyticsAccess = user.is_elder || 
                              (user.community_roles && user.community_roles.includes('analytics'))

    if (!hasAnalyticsAccess && action !== 'personal_history') {
      return NextResponse.json(
        { error: 'Insufficient permissions for search analytics' },
        { status: 403 }
      )
    }

    let result

    switch (action) {
      case 'personal_history':
        // Get user's personal search history
        const startDate = new Date()
        if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7)
        else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1)
        else startDate.setFullYear(startDate.getFullYear() - 1)

        const { data: personalHistory } = await supabase
          .from('search_analytics')
          .select('query, content_types, results_count, searched_at')
          .eq('user_id', user_id)
          .gte('searched_at', startDate.toISOString())
          .order('searched_at', { ascending: false })
          .limit(50)

        result = {
          personal_search_history: personalHistory || [],
          timeframe,
          total_searches: personalHistory?.length || 0
        }
        break

      case 'community_trends':
        // Get community search trends (requires elevated permissions)
        const trendingData = await intelligentSearchSystem.getTrendingSearches(user_id, timeframe as 'day' | 'week' | 'month')
        
        result = {
          community_trends: trendingData,
          timeframe
        }
        break

      case 'search_insights':
        // Get insights about a specific search query
        if (!search_query) {
          return NextResponse.json(
            { error: 'search_query is required for insights action' },
            { status: 400 }
          )
        }

        // Get related searches and themes for this query
        const relatedData = await intelligentSearchSystem['generateRelatedSearches'](
          { query: search_query, user_id },
          { primary_intent: 'story_search', search_themes: [], cultural_context: [], emotional_context: [] }
        )

        result = {
          search_query,
          related_searches: relatedData,
          query_analysis: 'Advanced query analysis would go here'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: personal_history, community_trends, or search_insights' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      analytics_data: result,
      metadata: {
        user_id,
        user_permissions: {
          is_elder: user.is_elder,
          has_analytics_access: hasAnalyticsAccess
        },
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Search analytics error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve search analytics',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}