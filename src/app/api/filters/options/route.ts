import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/filters/options
 * Get available filter options for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    // Fetch unique cultural groups
    const { data: culturalGroupsData } = await supabase
      .from('storytellers')
      .select('cultural_background')
      .eq('organization_id', organizationId)
      .not('cultural_background', 'is', null)

    const culturalGroups = Array.from(
      new Set(
        culturalGroupsData
          ?.map(s => s.cultural_background)
          .filter(Boolean)
          .flatMap(bg => (typeof bg === 'string' ? bg.split(',').map(s => s.trim()) : []))
      )
    ).sort()

    // Fetch unique languages
    const { data: languagesData } = await supabase
      .from('stories')
      .select('language')
      .eq('organization_id', organizationId)
      .not('language', 'is', null)

    const languages = Array.from(
      new Set(languagesData?.map(s => s.language).filter(Boolean))
    ).sort()

    // Fetch themes from narrative_themes
    const { data: themesData } = await supabase
      .from('narrative_themes')
      .select('theme_name')
      .order('usage_count', { ascending: false })
      .limit(50)

    const themes = themesData?.map(t => t.theme_name) || []

    // Fetch unique protocols
    const { data: protocolsData } = await supabase
      .from('storytellers')
      .select('cultural_protocols')
      .eq('organization_id', organizationId)
      .not('cultural_protocols', 'is', null)

    const protocols = Array.from(
      new Set(
        protocolsData
          ?.map(s => s.cultural_protocols)
          .filter(Boolean)
          .flat()
      )
    ).sort()

    return NextResponse.json({
      success: true,
      options: {
        culturalGroups,
        languages,
        themes,
        protocols
      }
    })

  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
