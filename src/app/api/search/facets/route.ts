import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search/facets
 * Get facet counts for search filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const query = searchParams.get('query') || ''

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    const facetGroups: any[] = []

    // 1. Content Type Facets
    const contentTypes = [
      { name: 'Stories', table: 'stories' },
      { name: 'Storytellers', table: 'storytellers' },
      { name: 'Transcripts', table: 'transcripts' },
      { name: 'Media', table: 'media' }
    ]

    const contentTypeFacets = await Promise.all(
      contentTypes.map(async (type) => {
        const { count } = await supabase
          .from(type.table)
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)

        return {
          name: type.name,
          count: count || 0,
          selected: false
        }
      })
    )

    facetGroups.push({
      id: 'contentType',
      label: 'Content Type',
      facets: contentTypeFacets.filter(f => f.count > 0)
    })

    // 2. Theme Facets (top 10 themes)
    const { data: themesData } = await supabase
      .from('narrative_themes')
      .select('theme_name, usage_count')
      .order('usage_count', { ascending: false })
      .limit(10)

    if (themesData && themesData.length > 0) {
      facetGroups.push({
        id: 'themes',
        label: 'Themes',
        facets: themesData.map(t => ({
          name: t.theme_name,
          count: t.usage_count,
          selected: false
        }))
      })
    }

    // 3. Cultural Group Facets
    const { data: culturalData } = await supabase
      .from('storytellers')
      .select('cultural_background')
      .eq('organization_id', organizationId)
      .not('cultural_background', 'is', null)

    const culturalCounts: Record<string, number> = {}
    culturalData?.forEach(s => {
      const backgrounds = typeof s.cultural_background === 'string'
        ? s.cultural_background.split(',').map(b => b.trim())
        : []
      backgrounds.forEach(bg => {
        culturalCounts[bg] = (culturalCounts[bg] || 0) + 1
      })
    })

    if (Object.keys(culturalCounts).length > 0) {
      facetGroups.push({
        id: 'culturalGroups',
        label: 'Cultural Groups',
        facets: Object.entries(culturalCounts)
          .map(([name, count]) => ({ name, count, selected: false }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      })
    }

    // 4. Language Facets
    const { data: languagesData } = await supabase
      .from('stories')
      .select('language')
      .eq('organization_id', organizationId)
      .not('language', 'is', null)

    const languageCounts: Record<string, number> = {}
    languagesData?.forEach(s => {
      if (s.language) {
        languageCounts[s.language] = (languageCounts[s.language] || 0) + 1
      }
    })

    if (Object.keys(languageCounts).length > 0) {
      facetGroups.push({
        id: 'languages',
        label: 'Languages',
        facets: Object.entries(languageCounts)
          .map(([name, count]) => ({ name, count, selected: false }))
          .sort((a, b) => b.count - a.count)
      })
    }

    // 5. Media Type Facets
    const { data: mediaData } = await supabase
      .from('media')
      .select('media_type')
      .eq('organization_id', organizationId)

    const mediaTypeCounts: Record<string, number> = {}
    mediaData?.forEach(m => {
      if (m.media_type) {
        mediaTypeCounts[m.media_type] = (mediaTypeCounts[m.media_type] || 0) + 1
      }
    })

    if (Object.keys(mediaTypeCounts).length > 0) {
      facetGroups.push({
        id: 'mediaTypes',
        label: 'Media Types',
        facets: Object.entries(mediaTypeCounts)
          .map(([name, count]) => ({ name, count, selected: false }))
          .sort((a, b) => b.count - a.count)
      })
    }

    // 6. Date Range Facets
    const now = new Date()
    const dateRanges = [
      { name: 'Today', days: 1 },
      { name: 'This Week', days: 7 },
      { name: 'This Month', days: 30 },
      { name: 'This Quarter', days: 90 },
      { name: 'This Year', days: 365 }
    ]

    const dateFacets = await Promise.all(
      dateRanges.map(async (range) => {
        const startDate = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)

        const { count } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', startDate.toISOString())

        return {
          name: range.name,
          count: count || 0,
          selected: false
        }
      })
    )

    facetGroups.push({
      id: 'dateRange',
      label: 'Date Range',
      facets: dateFacets.filter(f => f.count > 0)
    })

    return NextResponse.json({
      success: true,
      facet_groups: facetGroups
    })

  } catch (error) {
    console.error('Error fetching facets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
