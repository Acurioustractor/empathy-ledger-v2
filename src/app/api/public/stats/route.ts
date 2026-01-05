import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/public/stats
 * Get platform statistics for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Fetch all stats in parallel
    const [
      { count: totalStories },
      { count: activeStorytellers },
      { data: culturalBackgrounds },
      { data: countries }
    ] = await Promise.all([
      // Total published stories
      supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('is_public', true),

      // Active storytellers (with at least 1 published story)
      supabase
        .from('storytellers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      // Unique cultural backgrounds
      supabase
        .from('storytellers')
        .select('cultural_background')
        .eq('is_active', true)
        .not('cultural_background', 'is', null),

      // Unique countries (from storyteller locations)
      supabase
        .from('storytellers')
        .select('location')
        .eq('is_active', true)
        .not('location', 'is', null)
    ])

    // Count unique cultural communities
    const uniqueCulturalBackgrounds = new Set(
      (culturalBackgrounds || [])
        .map(s => s.cultural_background)
        .filter(Boolean)
    )

    // Estimate countries reached (simplified - extract from location strings)
    const uniqueCountries = new Set(
      (countries || [])
        .map(s => {
          const location = s.location || ''
          // Simple heuristic: last part after comma is often country
          const parts = location.split(',')
          return parts[parts.length - 1]?.trim()
        })
        .filter(Boolean)
    )

    const stats = {
      totalStories: totalStories || 0,
      activeStorytellers: activeStorytellers || 0,
      culturalCommunities: uniqueCulturalBackgrounds.size || 0,
      countriesReached: Math.max(uniqueCountries.size, 1) // At least 1 if we have any storytellers
    }

    return NextResponse.json(
      {
        stats,
        message: 'Platform statistics retrieved successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
