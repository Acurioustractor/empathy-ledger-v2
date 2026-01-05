import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/themes
 * Get theme analytics (distribution, trends, growth)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const timeRange = searchParams.get('time_range') || '30days'

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date threshold for current period
    let currentDateThreshold: Date | null = null
    let previousDateThreshold: Date | null = null

    if (timeRange !== 'all') {
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90
      currentDateThreshold = new Date()
      currentDateThreshold.setDate(currentDateThreshold.getDate() - days)

      // Previous period for trend calculation
      previousDateThreshold = new Date()
      previousDateThreshold.setDate(previousDateThreshold.getDate() - (days * 2))
    }

    // Get current period themes
    let currentQuery = supabase
      .from('story_themes')
      .select('theme, created_at, stories!inner(id, tenant_id, project_id)')

    if (organizationId) {
      currentQuery = currentQuery.eq('stories.tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      currentQuery = currentQuery.eq('stories.project_id', projectId)
    }

    if (currentDateThreshold) {
      currentQuery = currentQuery.gte('created_at', currentDateThreshold.toISOString())
    }

    const { data: currentThemes, error: themesError } = await currentQuery

    if (themesError) {
      console.error('Error fetching themes:', themesError)
      return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
    }

    // Get previous period themes for trend calculation
    let previousThemes: any[] = []
    if (previousDateThreshold && currentDateThreshold) {
      let previousQuery = supabase
        .from('story_themes')
        .select('theme, created_at, stories!inner(id, tenant_id, project_id)')
        .gte('created_at', previousDateThreshold.toISOString())
        .lt('created_at', currentDateThreshold.toISOString())

      if (organizationId) {
        previousQuery = previousQuery.eq('stories.tenant_id', organizationId)
      }

      if (projectId && projectId !== 'all') {
        previousQuery = previousQuery.eq('stories.project_id', projectId)
      }

      const { data } = await previousQuery
      previousThemes = data || []
    }

    // Aggregate current theme counts
    const currentThemeCounts: Record<string, number> = {}
    currentThemes?.forEach(item => {
      currentThemeCounts[item.theme] = (currentThemeCounts[item.theme] || 0) + 1
    })

    // Aggregate previous theme counts
    const previousThemeCounts: Record<string, number> = {}
    previousThemes.forEach(item => {
      previousThemeCounts[item.theme] = (previousThemeCounts[item.theme] || 0) + 1
    })

    const totalCurrentStories = currentThemes?.length || 1 // Avoid division by zero
    const totalPreviousStories = previousThemes.length || 1

    // Calculate trends and format themes
    const themes = Object.entries(currentThemeCounts)
      .map(([theme, count]) => {
        const previousCount = previousThemeCounts[theme] || 0
        const growth = previousCount > 0
          ? Math.round(((count - previousCount) / previousCount) * 100)
          : count > 0 ? 100 : 0

        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (growth > 10) trend = 'up'
        else if (growth < -10) trend = 'down'

        return {
          theme,
          count,
          percentage: Math.round((count / totalCurrentStories) * 100),
          trend,
          growth,
          previous_count: previousCount
        }
      })
      .sort((a, b) => b.count - a.count)

    // Calculate summary stats
    const stats = {
      total_themes: themes.length,
      total_theme_instances: currentThemes?.length || 0,
      avg_themes_per_story: themes.length > 0
        ? Math.round((currentThemes?.length || 0) / new Set(currentThemes?.map(t => t.stories.id)).size * 10) / 10
        : 0,
      top_theme: themes[0]?.theme || null,
      fastest_growing: themes.reduce((max, t) => t.growth > max.growth ? t : max, themes[0] || { growth: 0 })
    }

    return NextResponse.json({
      themes,
      stats,
      time_range: timeRange
    })
  } catch (error) {
    console.error('Error in analytics themes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
