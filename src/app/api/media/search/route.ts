/**
 * Smart Media Search API
 * GET /api/media/search - Natural language search with AI query parsing
 *
 * Supports queries like:
 * - "photos of Maria in Sydney"
 * - "videos from ACT Farm last month"
 * - "ceremony content with elder approval"
 * - "untagged photos needing review"
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ParsedQuery {
  // Content type filters
  mediaTypes: ('image' | 'video' | 'audio')[]

  // People/storyteller filters
  storytellerNames: string[]
  storytellerIds: string[]

  // Location filters
  locationTerms: string[]

  // Tag/theme filters
  tags: string[]
  themes: string[]
  projects: string[]

  // Time filters
  timeRange: {
    start?: Date
    end?: Date
    relative?: 'today' | 'week' | 'month' | 'year'
  } | null

  // Cultural sensitivity
  sensitivityLevels: string[]
  requiresElderApproval?: boolean

  // Status filters
  statusFilters: {
    untagged?: boolean
    needsReview?: boolean
    pendingConsent?: boolean
  }

  // Text search
  textQuery: string

  // Sort
  sortBy: 'relevance' | 'date' | 'title'
  sortOrder: 'asc' | 'desc'
}

// Parse natural language query into structured filters
function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const q = query.toLowerCase().trim()

  const parsed: ParsedQuery = {
    mediaTypes: [],
    storytellerNames: [],
    storytellerIds: [],
    locationTerms: [],
    tags: [],
    themes: [],
    projects: [],
    timeRange: null,
    sensitivityLevels: [],
    statusFilters: {},
    textQuery: query,
    sortBy: 'relevance',
    sortOrder: 'desc'
  }

  // Media type detection
  if (/\b(photo|image|picture)s?\b/.test(q)) parsed.mediaTypes.push('image')
  if (/\b(video|film|clip)s?\b/.test(q)) parsed.mediaTypes.push('video')
  if (/\b(audio|sound|recording)s?\b/.test(q)) parsed.mediaTypes.push('audio')

  // Project detection
  const projectMap: Record<string, string> = {
    'empathy ledger': 'empathy-ledger',
    'justicehub': 'justicehub',
    'justice hub': 'justicehub',
    'act farm': 'act-farm',
    'farm': 'act-farm',
    'harvest': 'harvest',
    'the harvest': 'harvest',
    'goods': 'goods',
    'goods on country': 'goods',
    'placemat': 'placemat',
    'act placemat': 'placemat',
    'studio': 'studio',
    'act studio': 'studio'
  }

  for (const [term, code] of Object.entries(projectMap)) {
    if (q.includes(term)) {
      parsed.projects.push(code)
    }
  }

  // Theme detection
  const themeKeywords = [
    'storytelling', 'community', 'cultural', 'land', 'country',
    'healing', 'justice', 'food', 'farming', 'youth', 'elders',
    'ceremony', 'sacred', 'traditional'
  ]

  for (const theme of themeKeywords) {
    if (q.includes(theme)) {
      parsed.themes.push(theme)
    }
  }

  // Cultural sensitivity
  if (/\b(sacred|ceremony|ceremonial)\b/.test(q)) {
    parsed.sensitivityLevels.push('sacred')
  }
  if (/\b(sensitive|cultural)\b/.test(q)) {
    parsed.sensitivityLevels.push('sensitive')
  }
  if (/\belder\s*(approval|review|approved)\b/.test(q)) {
    parsed.requiresElderApproval = true
  }

  // Status filters
  if (/\b(untagged|no\s*tags?|missing\s*tags?)\b/.test(q)) {
    parsed.statusFilters.untagged = true
  }
  if (/\b(needs?\s*review|pending\s*review|review\s*needed)\b/.test(q)) {
    parsed.statusFilters.needsReview = true
  }
  if (/\b(pending\s*consent|awaiting\s*consent|consent\s*pending)\b/.test(q)) {
    parsed.statusFilters.pendingConsent = true
  }

  // Time range detection
  const now = new Date()
  if (/\btoday\b/.test(q)) {
    parsed.timeRange = {
      relative: 'today',
      start: new Date(now.setHours(0, 0, 0, 0)),
      end: new Date()
    }
  } else if (/\b(this\s*week|past\s*week|last\s*7\s*days?)\b/.test(q)) {
    parsed.timeRange = {
      relative: 'week',
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  } else if (/\b(this\s*month|past\s*month|last\s*30\s*days?|last\s*month)\b/.test(q)) {
    parsed.timeRange = {
      relative: 'month',
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  } else if (/\b(this\s*year|past\s*year|last\s*year|last\s*12\s*months?)\b/.test(q)) {
    parsed.timeRange = {
      relative: 'year',
      start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }

  // Location extraction - look for "in/at/near [location]"
  const locationMatch = q.match(/\b(?:in|at|near|from)\s+([a-z\s]+?)(?:\s+(?:from|during|last|this|with|and|$))/i)
  if (locationMatch) {
    const location = locationMatch[1].trim()
    // Filter out time-related words that might be captured
    if (!['today', 'yesterday', 'week', 'month', 'year'].includes(location)) {
      parsed.locationTerms.push(location)
    }
  }

  // Person name extraction - look for "of [name]" or "with [name]" patterns
  const personMatch = q.match(/\b(?:of|with|featuring|showing)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
  if (personMatch) {
    parsed.storytellerNames.push(personMatch[1])
  }

  // Sort detection
  if (/\b(newest|recent|latest)\b/.test(q)) {
    parsed.sortBy = 'date'
    parsed.sortOrder = 'desc'
  } else if (/\b(oldest|earliest)\b/.test(q)) {
    parsed.sortBy = 'date'
    parsed.sortOrder = 'asc'
  }

  return parsed
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = (page - 1) * limit

    // Also accept direct filter params for programmatic use
    const directFilters = {
      mediaType: searchParams.get('type'),
      project: searchParams.get('project'),
      tag: searchParams.get('tag'),
      storyteller: searchParams.get('storyteller'),
      location: searchParams.get('location'),
      sensitivity: searchParams.get('sensitivity'),
      dateFrom: searchParams.get('from'),
      dateTo: searchParams.get('to')
    }

    // Parse the natural language query
    const parsed = query ? parseNaturalLanguageQuery(query) : {
      mediaTypes: directFilters.mediaType ? [directFilters.mediaType as 'image' | 'video'] : [],
      storytellerNames: [],
      storytellerIds: directFilters.storyteller ? [directFilters.storyteller] : [],
      locationTerms: directFilters.location ? [directFilters.location] : [],
      tags: directFilters.tag ? [directFilters.tag] : [],
      themes: [],
      projects: directFilters.project ? [directFilters.project] : [],
      timeRange: directFilters.dateFrom || directFilters.dateTo ? {
        start: directFilters.dateFrom ? new Date(directFilters.dateFrom) : undefined,
        end: directFilters.dateTo ? new Date(directFilters.dateTo) : undefined
      } : null,
      sensitivityLevels: directFilters.sensitivity ? [directFilters.sensitivity] : [],
      statusFilters: {},
      textQuery: query,
      sortBy: 'relevance' as const,
      sortOrder: 'desc' as const
    }

    // Build the query
    let dbQuery = supabase
      .from('media_assets')
      .select(`
        id,
        title,
        description,
        file_type,
        cdn_url,
        thumbnail_url,
        created_at,
        cultural_sensitivity_level,
        project_code,
        original_filename,
        media_locations!left(
          latitude,
          longitude,
          mapbox_place_name,
          indigenous_territory,
          locality,
          region,
          country
        ),
        media_tags!left(
          tag_id,
          tags:tag_id(id, name, slug, category)
        ),
        media_storytellers!left(
          storyteller_id,
          relationship,
          consent_status,
          storytellers:storyteller_id(id, display_name, profile_image_url)
        )
      `, { count: 'exact' })
      .eq('processing_status', 'completed')

    // Apply media type filter
    if (parsed.mediaTypes.length > 0) {
      dbQuery = dbQuery.in('file_type', parsed.mediaTypes)
    }

    // Apply project filter
    if (parsed.projects.length > 0) {
      dbQuery = dbQuery.in('project_code', parsed.projects)
    }

    // Apply sensitivity filter
    if (parsed.sensitivityLevels.length > 0) {
      dbQuery = dbQuery.in('cultural_sensitivity_level', parsed.sensitivityLevels)
    }

    // Apply time range filter
    if (parsed.timeRange?.start) {
      dbQuery = dbQuery.gte('created_at', parsed.timeRange.start.toISOString())
    }
    if (parsed.timeRange?.end) {
      dbQuery = dbQuery.lte('created_at', parsed.timeRange.end.toISOString())
    }

    // Apply text search on title/description/filename
    if (parsed.textQuery && !parsed.statusFilters.untagged) {
      // Only do text search if there's actual text to search
      const cleanedQuery = parsed.textQuery
        .replace(/\b(photos?|images?|videos?|from|in|at|of|with|near|last|this|the)\b/gi, '')
        .trim()

      if (cleanedQuery.length > 2) {
        dbQuery = dbQuery.or(`title.ilike.%${cleanedQuery}%,description.ilike.%${cleanedQuery}%,original_filename.ilike.%${cleanedQuery}%`)
      }
    }

    // Apply sorting
    if (parsed.sortBy === 'date') {
      dbQuery = dbQuery.order('created_at', { ascending: parsed.sortOrder === 'asc' })
    } else if (parsed.sortBy === 'title') {
      dbQuery = dbQuery.order('title', { ascending: parsed.sortOrder === 'asc' })
    } else {
      // Default: most recent first for relevance
      dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data: results, error, count } = await dbQuery

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Post-process for additional filters that can't be done in the main query
    let filteredResults = results || []

    // Filter by storyteller names
    if (parsed.storytellerNames.length > 0) {
      filteredResults = filteredResults.filter(item => {
        const storytellers = item.media_storytellers || []
        return storytellers.some((ms: any) => {
          const name = ms.storytellers?.display_name?.toLowerCase() || ''
          return parsed.storytellerNames.some(n => name.includes(n.toLowerCase()))
        })
      })
    }

    // Filter by location terms
    if (parsed.locationTerms.length > 0) {
      filteredResults = filteredResults.filter(item => {
        const loc = item.media_locations?.[0]
        if (!loc) return false
        const locationStr = [
          loc.mapbox_place_name,
          loc.locality,
          loc.region,
          loc.country,
          loc.indigenous_territory
        ].filter(Boolean).join(' ').toLowerCase()
        return parsed.locationTerms.some(term => locationStr.includes(term.toLowerCase()))
      })
    }

    // Filter by tags
    if (parsed.tags.length > 0 || parsed.themes.length > 0) {
      const searchTags = [...parsed.tags, ...parsed.themes]
      filteredResults = filteredResults.filter(item => {
        const itemTags = (item.media_tags || []).map((mt: any) =>
          mt.tags?.name?.toLowerCase() || mt.tags?.slug?.toLowerCase()
        ).filter(Boolean)
        return searchTags.some(tag => itemTags.includes(tag.toLowerCase()))
      })
    }

    // Filter untagged
    if (parsed.statusFilters.untagged) {
      filteredResults = filteredResults.filter(item =>
        !item.media_tags || item.media_tags.length === 0
      )
    }

    // Filter pending consent
    if (parsed.statusFilters.pendingConsent) {
      filteredResults = filteredResults.filter(item => {
        const storytellers = item.media_storytellers || []
        return storytellers.some((ms: any) => ms.consent_status === 'pending')
      })
    }

    // Format results
    const formattedResults = filteredResults.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      fileType: item.file_type,
      thumbnailUrl: item.thumbnail_url || item.cdn_url,
      cdnUrl: item.cdn_url,
      createdAt: item.created_at,
      sensitivityLevel: item.cultural_sensitivity_level,
      project: item.project_code,
      location: item.media_locations?.[0] ? {
        placeName: item.media_locations[0].mapbox_place_name,
        locality: item.media_locations[0].locality,
        region: item.media_locations[0].region,
        country: item.media_locations[0].country,
        indigenousTerritory: item.media_locations[0].indigenous_territory,
        latitude: item.media_locations[0].latitude,
        longitude: item.media_locations[0].longitude
      } : null,
      tags: (item.media_tags || []).map((mt: any) => ({
        id: mt.tags?.id,
        name: mt.tags?.name,
        slug: mt.tags?.slug,
        category: mt.tags?.category
      })).filter((t: any) => t.id),
      storytellers: (item.media_storytellers || []).map((ms: any) => ({
        id: ms.storytellers?.id,
        name: ms.storytellers?.display_name,
        imageUrl: ms.storytellers?.profile_image_url,
        relationship: ms.relationship,
        consentStatus: ms.consent_status
      })).filter((s: any) => s.id)
    }))

    return NextResponse.json({
      results: formattedResults,
      query: {
        original: query,
        parsed: {
          mediaTypes: parsed.mediaTypes,
          projects: parsed.projects,
          themes: parsed.themes,
          locationTerms: parsed.locationTerms,
          storytellerNames: parsed.storytellerNames,
          timeRange: parsed.timeRange,
          sensitivityLevels: parsed.sensitivityLevels,
          statusFilters: parsed.statusFilters
        }
      },
      pagination: {
        page,
        limit,
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / limit),
        hasMore: filteredResults.length === limit
      }
    })

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
