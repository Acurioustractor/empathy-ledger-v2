/**
 * Video Links API
 * GET /api/videos - List all video links with filtering, sorting, search
 * POST /api/videos - Create a new video link
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Helper to parse Descript URLs and generate embed URLs
function parseDescriptUrl(url: string): { embedUrl: string; videoId: string } | null {
  // Descript share URLs: https://share.descript.com/view/XXXX
  // Descript embed URLs: https://share.descript.com/embed/XXXX
  const shareMatch = url.match(/share\.descript\.com\/view\/([a-zA-Z0-9_-]+)/)
  if (shareMatch) {
    return {
      embedUrl: `https://share.descript.com/embed/${shareMatch[1]}`,
      videoId: shareMatch[1]
    }
  }

  // Already an embed URL
  const embedMatch = url.match(/share\.descript\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) {
    return {
      embedUrl: url,
      videoId: embedMatch[1]
    }
  }

  return null
}

// Fetch thumbnail from Descript page meta tags
async function fetchDescriptThumbnail(videoId: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://share.descript.com/view/${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EmpathyLedger/1.0)'
      }
    })

    if (!response.ok) return undefined

    const html = await response.text()

    // Look for og:image meta tag
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

    if (ogImageMatch?.[1]) {
      return ogImageMatch[1]
    }

    // Look for twitter:image as fallback
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)

    if (twitterImageMatch?.[1]) {
      return twitterImageMatch[1]
    }

    return undefined
  } catch (error) {
    console.error('Error fetching Descript thumbnail:', error)
    return undefined
  }
}

// Helper to parse YouTube URLs
function parseYouTubeUrl(url: string): { embedUrl: string; thumbnailUrl: string } | null {
  const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
  if (videoId) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  }
  return null
}

// Helper to parse Vimeo URLs
function parseVimeoUrl(url: string): { embedUrl: string; thumbnailUrl?: string } | null {
  const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
  if (videoId) {
    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`,
      // Vimeo thumbnails require API call, skip for now
    }
  }
  return null
}

// Detect platform from URL
function detectPlatform(url: string): string {
  if (url.includes('descript.com')) return 'descript'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  if (url.includes('loom.com')) return 'loom'
  if (url.includes('wistia.')) return 'wistia'
  return 'other'
}

// Process URL to get embed URL and thumbnail (async for Descript)
async function processVideoUrl(url: string, platform: string): Promise<{ embedUrl: string; thumbnailUrl?: string }> {
  switch (platform) {
    case 'descript': {
      const parsed = parseDescriptUrl(url)
      if (parsed) {
        const thumbnailUrl = await fetchDescriptThumbnail(parsed.videoId)
        return { embedUrl: parsed.embedUrl, thumbnailUrl }
      }
      return { embedUrl: url }
    }
    case 'youtube':
      return parseYouTubeUrl(url) || { embedUrl: url }
    case 'vimeo':
      return parseVimeoUrl(url) || { embedUrl: url }
    default:
      return { embedUrl: url }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = (page - 1) * limit

    // Filters
    const platform = searchParams.get('platform')
    const project = searchParams.get('project')
    const search = searchParams.get('q') || searchParams.get('search')
    const status = searchParams.get('status') || 'active'
    const tag = searchParams.get('tag')
    const storyteller = searchParams.get('storyteller')

    // Sorting
    const sortBy = searchParams.get('sort') || 'created_at'
    const sortOrder = searchParams.get('order') || 'desc'

    // Build query
    let query = supabase
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
        requires_elder_approval,
        status,
        created_at,
        updated_at,
        video_link_tags(
          tag_id,
          tags:tag_id(id, name, slug, category)
        ),
        video_link_storytellers(
          storyteller_id,
          relationship,
          consent_status,
          storytellers:storyteller_id(id, display_name, avatar_url)
        ),
        video_link_locations(
          latitude,
          longitude,
          mapbox_place_name,
          indigenous_territory,
          locality,
          region,
          country
        )
      `, { count: 'exact' })
      .eq('status', status)

    // Apply filters
    if (platform) {
      query = query.eq('platform', platform)
    }

    if (project) {
      query = query.eq('project_code', project)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    switch (sortBy) {
      case 'title':
        query = query.order('title', { ascending })
        break
      case 'recorded_at':
        query = query.order('recorded_at', { ascending, nullsFirst: false })
        break
      case 'updated_at':
        query = query.order('updated_at', { ascending })
        break
      default:
        query = query.order('created_at', { ascending })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: videos, error, count } = await query

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    // Post-filter by tag if specified
    let filteredVideos = videos || []
    if (tag) {
      filteredVideos = filteredVideos.filter(video =>
        video.video_link_tags?.some((vt: any) =>
          vt.tags?.slug === tag || vt.tags?.name?.toLowerCase() === tag.toLowerCase()
        )
      )
    }

    // Post-filter by storyteller if specified
    if (storyteller) {
      filteredVideos = filteredVideos.filter(video =>
        video.video_link_storytellers?.some((vs: any) =>
          vs.storyteller_id === storyteller ||
          vs.storytellers?.display_name?.toLowerCase().includes(storyteller.toLowerCase())
        )
      )
    }

    // Format response
    const formattedVideos = filteredVideos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.video_url,
      embedUrl: video.embed_url,
      platform: video.platform,
      thumbnailUrl: video.custom_thumbnail_url || video.thumbnail_url,
      customThumbnailUrl: video.custom_thumbnail_url,
      duration: video.duration,
      recordedAt: video.recorded_at,
      project: video.project_code,
      sensitivityLevel: video.cultural_sensitivity_level,
      requiresElderApproval: video.requires_elder_approval,
      status: video.status,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
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
        relationship: vs.relationship,
        consentStatus: vs.consent_status
      })).filter((s: any) => s.id),
      location: video.video_link_locations?.[0] ? {
        placeName: video.video_link_locations[0].mapbox_place_name,
        locality: video.video_link_locations[0].locality,
        region: video.video_link_locations[0].region,
        country: video.video_link_locations[0].country,
        indigenousTerritory: video.video_link_locations[0].indigenous_territory,
        latitude: video.video_link_locations[0].latitude,
        longitude: video.video_link_locations[0].longitude
      } : null
    }))

    return NextResponse.json({
      videos: formattedVideos,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    })

  } catch (error) {
    console.error('Error in videos API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()

    const {
      title,
      description,
      videoUrl,
      platform: providedPlatform,
      customThumbnailUrl,
      duration,
      recordedAt,
      projectCode,
      culturalSensitivityLevel,
      requiresElderApproval,
      tags,
      storytellers,
      location
    } = body

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Title and video URL are required' },
        { status: 400 }
      )
    }

    // Detect platform and process URL (async to fetch thumbnail from Descript)
    const platform = providedPlatform || detectPlatform(videoUrl)
    const { embedUrl, thumbnailUrl } = await processVideoUrl(videoUrl, platform)

    // Create video link
    const { data: video, error: videoError } = await supabase
      .from('video_links')
      .insert({
        title,
        description,
        video_url: videoUrl,
        embed_url: embedUrl,
        platform,
        thumbnail_url: thumbnailUrl,
        custom_thumbnail_url: customThumbnailUrl,
        duration,
        recorded_at: recordedAt,
        project_code: projectCode,
        cultural_sensitivity_level: culturalSensitivityLevel || 'public',
        requires_elder_approval: requiresElderApproval || false
      })
      .select()
      .single()

    if (videoError) {
      console.error('Error creating video:', videoError)
      return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagRecords = tags.map((tagId: string) => ({
        video_link_id: video.id,
        tag_id: tagId,
        source: 'manual'
      }))

      await supabase.from('video_link_tags').insert(tagRecords)
    }

    // Add storytellers if provided
    if (storytellers && storytellers.length > 0) {
      const storytellerRecords = storytellers.map((s: any) => ({
        video_link_id: video.id,
        storyteller_id: s.id,
        relationship: s.relationship || 'appears_in',
        consent_status: s.consentStatus || 'pending',
        source: 'manual'
      }))

      await supabase.from('video_link_storytellers').insert(storytellerRecords)
    }

    // Add location if provided
    if (location) {
      await supabase.from('video_link_locations').insert({
        video_link_id: video.id,
        ...location,
        source: 'manual'
      })
    }

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        videoUrl: video.video_url,
        embedUrl: video.embed_url,
        platform: video.platform,
        thumbnailUrl: video.custom_thumbnail_url || video.thumbnail_url,
        createdAt: video.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create video' },
      { status: 500 }
    )
  }
}
