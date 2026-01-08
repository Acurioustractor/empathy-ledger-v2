/**
 * Video Search API
 * GET /api/videos/search - Natural language search for videos
 *
 * Supports queries like:
 * - "Descript videos about ACT Farm"
 * - "videos with Maria"
 * - "interview videos from last month"
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ParsedVideoQuery {
  platforms: string[]
  projects: string[]
  storytellerNames: string[]
  tags: string[]
  timeRange: { start?: Date; end?: Date } | null
  textQuery: string
  sortBy: 'relevance' | 'date' | 'title'
  sortOrder: 'asc' | 'desc'
}

function parseVideoQuery(query: string): ParsedVideoQuery {
  const q = query.toLowerCase().trim()

  const parsed: ParsedVideoQuery = {
    platforms: [],
    projects: [],
    storytellerNames: [],
    tags: [],
    timeRange: null,
    textQuery: query,
    sortBy: 'relevance',
    sortOrder: 'desc'
  }

  // Platform detection
  if (/\bdescript\b/.test(q)) parsed.platforms.push('descript')
  if (/\byoutube\b/.test(q)) parsed.platforms.push('youtube')
  if (/\bvimeo\b/.test(q)) parsed.platforms.push('vimeo')
  if (/\bloom\b/.test(q)) parsed.platforms.push('loom')

  // Video type detection
  const videoTypes = [
    'interview', 'documentary', 'presentation', 'tutorial',
    'testimonial', 'promo', 'event', 'ceremony', 'story'
  ]
  for (const type of videoTypes) {
    if (q.includes(type)) {
      parsed.tags.push(type)
    }
  }

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

  // Time range detection
  const now = new Date()
  if (/\btoday\b/.test(q)) {
    parsed.timeRange = {
      start: new Date(now.setHours(0, 0, 0, 0)),
      end: new Date()
    }
  } else if (/\b(this\s*week|past\s*week|last\s*7\s*days?)\b/.test(q)) {
    parsed.timeRange = {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  } else if (/\b(this\s*month|past\s*month|last\s*30\s*days?|last\s*month)\b/.test(q)) {
    parsed.timeRange = {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  } else if (/\b(this\s*year|past\s*year|last\s*year)\b/.test(q)) {
    parsed.timeRange = {
      start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }

  // Person name extraction
  const personMatch = q.match(/\b(?:with|featuring|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
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

    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = (page - 1) * limit

    const parsed = parseVideoQuery(query)

    // Build query
    let dbQuery = supabase
      .from('video_links')
      .select(`
        id,
        title,
        description,
        video_url,
        embed_url,
        platform,
        thumbnail_url,
        custom_thumbnail_url,
        duration,
        recorded_at,
        project_code,
        cultural_sensitivity_level,
        status,
        created_at,
        video_link_tags(
          tag_id,
          tags:tag_id(id, name, slug, category)
        ),
        video_link_storytellers(
          storyteller_id,
          relationship,
          storytellers:storyteller_id(id, display_name, avatar_url)
        ),
        video_link_locations(
          mapbox_place_name,
          indigenous_territory,
          locality,
          region
        )
      `, { count: 'exact' })
      .eq('status', 'active')

    // Apply platform filter
    if (parsed.platforms.length > 0) {
      dbQuery = dbQuery.in('platform', parsed.platforms)
    }

    // Apply project filter
    if (parsed.projects.length > 0) {
      dbQuery = dbQuery.in('project_code', parsed.projects)
    }

    // Apply time range
    if (parsed.timeRange?.start) {
      dbQuery = dbQuery.gte('created_at', parsed.timeRange.start.toISOString())
    }
    if (parsed.timeRange?.end) {
      dbQuery = dbQuery.lte('created_at', parsed.timeRange.end.toISOString())
    }

    // Apply text search
    const cleanedQuery = parsed.textQuery
      .replace(/\b(videos?|descript|youtube|vimeo|from|with|in|at|of|last|this|the)\b/gi, '')
      .trim()

    if (cleanedQuery.length > 2) {
      dbQuery = dbQuery.or(`title.ilike.%${cleanedQuery}%,description.ilike.%${cleanedQuery}%`)
    }

    // Apply sorting
    if (parsed.sortBy === 'date') {
      dbQuery = dbQuery.order('created_at', { ascending: parsed.sortOrder === 'asc' })
    } else if (parsed.sortBy === 'title') {
      dbQuery = dbQuery.order('title', { ascending: parsed.sortOrder === 'asc' })
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data: results, error, count } = await dbQuery

    if (error) {
      console.error('Video search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Post-filter by storyteller names
    let filteredResults = results || []
    if (parsed.storytellerNames.length > 0) {
      filteredResults = filteredResults.filter(video => {
        const storytellers = video.video_link_storytellers || []
        return storytellers.some((vs: any) => {
          const name = vs.storytellers?.display_name?.toLowerCase() || ''
          return parsed.storytellerNames.some(n => name.includes(n.toLowerCase()))
        })
      })
    }

    // Post-filter by tags
    if (parsed.tags.length > 0) {
      filteredResults = filteredResults.filter(video => {
        const tags = (video.video_link_tags || []).map((vt: any) =>
          vt.tags?.name?.toLowerCase() || vt.tags?.slug?.toLowerCase()
        ).filter(Boolean)
        return parsed.tags.some(tag => tags.some((t: string) => t.includes(tag)))
      })
    }

    // Format results
    const formattedResults = filteredResults.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.video_url,
      embedUrl: video.embed_url,
      platform: video.platform,
      thumbnailUrl: video.custom_thumbnail_url || video.thumbnail_url,
      duration: video.duration,
      recordedAt: video.recorded_at,
      project: video.project_code,
      sensitivityLevel: video.cultural_sensitivity_level,
      createdAt: video.created_at,
      tags: (video.video_link_tags || []).map((vt: any) => ({
        id: vt.tags?.id,
        name: vt.tags?.name,
        slug: vt.tags?.slug,
        category: vt.tags?.category
      })).filter((t: any) => t.id),
      storytellers: (video.video_link_storytellers || []).map((vs: any) => ({
        id: vs.storytellers?.id,
        name: vs.storytellers?.display_name,
        imageUrl: vs.storytellers?.avatar_url,
        relationship: vs.relationship
      })).filter((s: any) => s.id),
      location: video.video_link_locations?.[0] ? {
        placeName: video.video_link_locations[0].mapbox_place_name,
        locality: video.video_link_locations[0].locality,
        region: video.video_link_locations[0].region,
        indigenousTerritory: video.video_link_locations[0].indigenous_territory
      } : null
    }))

    return NextResponse.json({
      results: formattedResults,
      query: {
        original: query,
        parsed: {
          platforms: parsed.platforms,
          projects: parsed.projects,
          storytellerNames: parsed.storytellerNames,
          tags: parsed.tags,
          timeRange: parsed.timeRange
        }
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    })

  } catch (error) {
    console.error('Error in video search:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
