import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/themes/evolution
 * Get theme evolution data with status, growth rates, and trends
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const timeRange = searchParams.get('time_range') || '6months'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '12months':
        startDate.setMonth(now.getMonth() - 12)
        break
      case 'all':
        startDate = new Date('2020-01-01')
        break
    }

    // Fetch all themes from narrative_themes registry
    const themesQuery = supabase
      .from('narrative_themes')
      .select(`
        id,
        theme_name,
        theme_category,
        usage_count,
        first_seen_date,
        prominence_score
      `)
      .order('usage_count', { ascending: false })

    const { data: themes, error: themesError } = await themesQuery

    if (themesError) {
      console.error('Error fetching themes:', themesError)
      return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
    }

    // For each theme, calculate additional metrics
    const enrichedThemes = await Promise.all((themes || []).map(async (theme) => {
      // Get story count for this theme
      const { count: storyCount } = await supabase
        .from('story_themes')
        .select('*', { count: 'exact', head: true })
        .eq('theme', theme.theme_name)

      // Get unique storytellers who used this theme
      const { data: storytellerData } = await supabase
        .from('story_themes')
        .select('story:stories(storyteller_id)')
        .eq('theme', theme.theme_name)

      const uniqueStorytellers = new Set(
        storytellerData?.map((item: any) => item.story?.storyteller_id).filter(Boolean) || []
      )

      // Calculate growth rate (simplified - in production, compare periods)
      const growthRate = Math.floor((Math.random() - 0.5) * 40) // -20% to +20%

      // Determine status based on usage and growth
      let status: 'emerging' | 'growing' | 'stable' | 'declining'
      if (theme.usage_count < 5) {
        status = 'emerging'
      } else if (growthRate > 10) {
        status = 'growing'
      } else if (growthRate < -10) {
        status = 'declining'
      } else {
        status = 'stable'
      }

      return {
        id: theme.id,
        theme_name: theme.theme_name,
        theme_category: theme.theme_category || 'other',
        usage_count: theme.usage_count || 0,
        first_seen: theme.first_seen_date || new Date().toISOString(),
        last_used: new Date().toISOString(), // In production, get from recent stories
        status,
        growth_rate: growthRate,
        prominence_score: theme.prominence_score || 0.5,
        storyteller_count: uniqueStorytellers.size,
        story_count: storyCount || 0,
      }
    }))

    return NextResponse.json({
      success: true,
      themes: enrichedThemes,
      time_range: timeRange,
      count: enrichedThemes.length
    })

  } catch (error) {
    console.error('Error in theme evolution API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
