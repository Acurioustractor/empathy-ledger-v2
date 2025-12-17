// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getThemeColor, type TrendingTheme } from '@/app/world-tour/components/types/map-types'

// Stopwords filter to remove garbage themes from word-frequency output
const THEME_STOPWORDS = new Set([
  'people', 'think', 'about', 'there', 'that', 'thats', "that's", 'speaker',
  'really', 'going', 'thing', 'things', 'something', 'anything', 'nothing',
  'everything', 'someone', 'anyone', 'everyone', 'somewhere', 'anywhere',
  'because', 'actually', 'basically', 'literally', 'obviously', 'definitely',
  'probably', 'maybe', 'might', 'could', 'would', 'should', 'always', 'never',
  'sometimes', 'often', 'usually', 'just', 'only', 'even', 'also', 'still',
  'already', 'much', 'many', 'more', 'most', 'some', 'other', 'another',
  'such', 'what', 'which', 'where', 'when', 'while', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'over', 'again',
  'further', 'then', 'once', 'here', 'there', 'both', 'each', 'every', 'all',
  'any', 'few', 'same', 'different', 'own', 'being', 'having', 'doing',
  'know', 'known', 'like', 'likes', 'want', 'wants', 'need', 'needs',
  'feel', 'feels', 'felt', 'make', 'makes', 'made', 'take', 'takes', 'took',
  'come', 'comes', 'came', 'give', 'gives', 'gave', 'find', 'finds', 'found',
  'tell', 'tells', 'told', 'say', 'says', 'said', 'get', 'gets', 'got',
  'see', 'sees', 'saw', 'look', 'looks', 'looked', 'went', 'goes', 'going',
  'into', 'onto', 'upon', 'from', 'with', 'without', 'within', 'throughout',
  'very', 'quite', 'rather', 'pretty', 'almost', 'enough', 'well', 'back',
  'time', 'times', 'year', 'years', 'day', 'days', 'way', 'ways', 'place',
  'kind', 'sort', 'type', 'part', 'parts', 'first', 'last', 'next', 'new',
  'old', 'good', 'great', 'little', 'big', 'small', 'long', 'high', 'right',
  'left', 'real', 'true', 'sure', 'okay', 'yeah', 'yes', 'yep', 'hmm', 'uh',
  'um', 'oh', 'ah', 'interview', 'transcript', 'recording', 'audio', 'video'
])

function isValidTheme(theme: string): boolean {
  if (!theme || typeof theme !== 'string') return false
  const normalized = theme.toLowerCase().trim()
  if (THEME_STOPWORDS.has(normalized)) return false
  if (normalized.length < 3) return false
  if (/^\d+$/.test(normalized)) return false
  if (/[{}\[\]<>|\\]/.test(normalized)) return false
  if (!normalized.includes(' ') && normalized.length < 4) return false
  return true
}

function filterGarbageThemes(themes: string[]): string[] {
  if (!Array.isArray(themes)) return []
  return themes.filter(isValidTheme)
}

interface ThemeTrendingResponse {
  trending: TrendingTheme[]
  emerging: TrendingTheme[]
  crossRegional: {
    theme: string
    regions: string[]
    connectionCount: number
    color: string
  }[]
  totalThemes: number
  totalStories: number
  lastUpdated: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Use admin client to bypass RLS for accurate theme counts
    const adminClient = createAdminClient()

    // Calculate date ranges based on timeRange
    const now = new Date()
    let daysBack = 30
    switch (timeRange) {
      case '7d': daysBack = 7; break
      case '30d': daysBack = 30; break
      case '90d': daysBack = 90; break
    }

    const currentPeriodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(now.getTime() - daysBack * 2 * 24 * 60 * 60 * 1000)
    const previousPeriodEnd = currentPeriodStart

    // Fetch ALL transcripts - this is the SOURCE OF TRUTH for themes
    // Transcripts have AI-extracted themes, stories may not
    const { data: transcripts, error: transcriptError } = await adminClient
      .from('transcripts')
      .select(`
        id,
        themes,
        storyteller_id,
        created_at,
        updated_at,
        profiles:storyteller_id (
          location
        )
      `)
      .not('themes', 'is', null)

    if (transcriptError) {
      console.error('Error fetching transcripts for themes:', transcriptError)
    }

    // Also fetch stories for supplementary theme data
    const { data: stories, error: storiesError } = await adminClient
      .from('stories')
      .select(`
        id,
        themes,
        cultural_tags,
        created_at,
        profiles:storyteller_id (
          location
        )
      `)
      .eq('status', 'published')

    if (storiesError) {
      console.error('Error fetching stories for themes:', storiesError)
    }

    // Calculate theme frequencies from TRANSCRIPTS (primary source)
    const currentThemeData = new Map<string, {
      count: number
      regions: Set<string>
      firstSeen: Date
    }>()

    // Process transcripts - the real source of themes
    for (const transcript of (transcripts || [])) {
      const rawThemes = transcript.themes || []
      const themes = filterGarbageThemes(rawThemes)

      // Get region from storyteller's location
      let regionName = 'Unknown'
      try {
        const profile = transcript.profiles as any
        if (profile?.location) {
          const loc = typeof profile.location === 'string' ? JSON.parse(profile.location) : profile.location
          regionName = loc?.country || loc?.city || loc?.name || 'Unknown'
        }
      } catch {}

      for (const theme of themes) {
        const normalized = theme.toLowerCase()
        const themeDate = new Date(transcript.updated_at || transcript.created_at)
        const existing = currentThemeData.get(normalized) || {
          count: 0,
          regions: new Set<string>(),
          firstSeen: themeDate
        }
        existing.count++
        existing.regions.add(regionName)
        if (themeDate < existing.firstSeen) {
          existing.firstSeen = themeDate
        }
        currentThemeData.set(normalized, existing)
      }
    }

    // Add any additional themes from stories (secondary source)
    for (const story of (stories || [])) {
      const rawThemes = [
        ...(story.themes || []),
        ...(story.cultural_tags || [])
      ]
      const themes = filterGarbageThemes(rawThemes)

      let regionName = 'Unknown'
      try {
        const profile = story.profiles as any
        if (profile?.location) {
          const loc = typeof profile.location === 'string' ? JSON.parse(profile.location) : profile.location
          regionName = loc?.country || loc?.city || loc?.name || 'Unknown'
        }
      } catch {}

      for (const theme of themes) {
        const normalized = theme.toLowerCase()
        // Only add if not already from transcripts (avoid double counting)
        if (!currentThemeData.has(normalized)) {
          currentThemeData.set(normalized, {
            count: 1,
            regions: new Set([regionName]),
            firstSeen: new Date(story.created_at)
          })
        }
      }
    }

    // For previous period calculation, we don't have historical data
    // So we'll use a simpler approach - no velocity calculation for now
    const previousThemeData = new Map<string, number>()

    // Build trending themes with velocity calculation
    const trending: TrendingTheme[] = []
    const emerging: TrendingTheme[] = []

    // Check if theme is new (appeared in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    for (const [name, data] of currentThemeData.entries()) {
      const previousCount = previousThemeData.get(name) || 0
      const velocity = previousCount > 0
        ? (data.count - previousCount) / previousCount
        : data.count > 0 ? 1 : 0

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (velocity > 0.1) trend = 'up'
      else if (velocity < -0.1) trend = 'down'

      const isNew = data.firstSeen >= sevenDaysAgo && previousCount === 0

      const themeEntry: TrendingTheme = {
        name,
        count: data.count,
        trend,
        velocity: Math.round(velocity * 100) / 100,
        regions: Array.from(data.regions),
        isNew,
        color: getThemeColor(name)
      }

      if (isNew) {
        emerging.push(themeEntry)
      }
      trending.push(themeEntry)
    }

    // Sort by count (descending)
    trending.sort((a, b) => b.count - a.count)
    emerging.sort((a, b) => b.count - a.count)

    // Calculate cross-regional themes (themes appearing in 3+ regions)
    const crossRegional = trending
      .filter(t => t.regions.length >= 3)
      .map(t => ({
        theme: t.name,
        regions: t.regions,
        connectionCount: t.count,
        color: t.color
      }))
      .slice(0, 10)

    const response: ThemeTrendingResponse = {
      trending: trending.slice(0, 20),
      emerging: emerging.slice(0, 10),
      crossRegional,
      totalThemes: currentThemeData.size,
      totalStories: (stories || []).length,
      lastUpdated: now.toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Trending themes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending themes' },
      { status: 500 }
    )
  }
}
