import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/search
 * Get search analytics metrics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const timeRange = searchParams.get('time_range') || '30d'

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
    }

    // In production, this would query a search_logs table
    // For now, we'll generate mock data based on actual content

    // Get total number of searches (mock)
    const totalSearches = Math.floor(Math.random() * 1000) + 500

    // Get unique users (mock)
    const uniqueUsers = Math.floor(Math.random() * 50) + 20

    // Avg results per search
    const avgResultsPerSearch = 8.5

    // Avg search time
    const avgSearchTimeMs = 145

    // Top queries - get actual themes from database
    const { data: themes } = await supabase
      .from('narrative_themes')
      .select('theme_name, usage_count')
      .order('usage_count', { ascending: false })
      .limit(15)

    const topQueries = themes?.map(t => ({
      query: t.theme_name,
      count: Math.floor(Math.random() * 50) + 10
    })) || []

    // Search trends - generate daily data
    const searchTrends: Array<{ date: string; count: number }> = []
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      searchTrends.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      })
    }

    // Click-through rate
    const resultClickRate = 0.65 + Math.random() * 0.2 // 65-85%

    // No results rate
    const noResultsRate = 0.05 + Math.random() * 0.1 // 5-15%

    // Filter usage
    const filterUsage = [
      { filter: 'Themes', count: Math.floor(Math.random() * 100) + 50 },
      { filter: 'Date Range', count: Math.floor(Math.random() * 80) + 40 },
      { filter: 'Cultural Groups', count: Math.floor(Math.random() * 60) + 30 },
      { filter: 'Content Type', count: Math.floor(Math.random() * 90) + 45 },
      { filter: 'Languages', count: Math.floor(Math.random() * 40) + 20 }
    ]

    // Search types
    const searchTypes = [
      { type: 'keyword', count: Math.floor(totalSearches * 0.6) },
      { type: 'semantic', count: Math.floor(totalSearches * 0.3) },
      { type: 'both', count: Math.floor(totalSearches * 0.1) }
    ]

    const metrics = {
      total_searches: totalSearches,
      unique_users: uniqueUsers,
      avg_results_per_search: avgResultsPerSearch,
      avg_search_time_ms: avgSearchTimeMs,
      top_queries: topQueries,
      search_trends: searchTrends,
      result_click_rate: resultClickRate,
      no_results_rate: noResultsRate,
      filter_usage: filterUsage,
      search_types: searchTypes
    }

    return NextResponse.json({
      success: true,
      metrics,
      time_range: timeRange
    })

  } catch (error) {
    console.error('Error in search analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
