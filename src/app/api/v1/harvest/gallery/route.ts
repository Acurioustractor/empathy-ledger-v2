// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

/**
 * The Harvest Gallery Integration API
 *
 * GET /api/v1/harvest/gallery
 *
 * Public API for The Harvest website to fetch gallery images from Empathy Ledger.
 * Images are filtered by Harvest-specific tags.
 *
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Number of images to return (default: 20, max: 100)
 * - tag: Filter by page tag (home, journey, stories, explore, membership, visit, whats-on)
 * - theme: Filter by theme (eat, grow, make, gather)
 * - category: Filter by category (before, during, after, milestone, general)
 *
 * Headers:
 * - X-API-Key: Optional API key for elevated access
 *
 * Response format matches ELMediaResponse interface expected by The Harvest client
 */

// Response format to match The Harvest client's ELMediaAsset interface
interface ELMediaAsset {
  id: string
  src: string
  title: string
  description: string | null
  altText: string | null
  category: 'before' | 'during' | 'after' | 'milestone' | 'general'
  date: string | null
  location: string | null
  tags: string[]      // Page tags: home, journey, stories, etc.
  themes: string[]    // Themes: eat, grow, make, gather
  special: string[]   // Special tags: hero, featured
  projectId: string | null
  sortOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface ELPagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// Valid page tags for The Harvest
const VALID_PAGE_TAGS = ['home', 'journey', 'stories', 'explore', 'membership', 'visit', 'whats-on']

// Valid themes for The Harvest
const VALID_THEMES = ['eat', 'grow', 'make', 'gather']

// Valid categories (slugs match database migration)
const VALID_CATEGORIES = ['before', 'during', 'after', 'milestone', 'general-harvest']

// Valid special tags for hero images and featured content
const VALID_SPECIAL = ['hero', 'featured']

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters (matching The Harvest client's fetchMedia signature)
    const pageNum = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const pageTag = searchParams.get('tag')       // page tag filter
    const theme = searchParams.get('theme')       // theme filter
    const category = searchParams.get('category') // category filter
    const special = searchParams.get('special')   // special tag filter (hero, featured)

    // Validate filters
    if (pageTag && !VALID_PAGE_TAGS.includes(pageTag)) {
      return NextResponse.json(
        { error: `Invalid page tag. Valid values: ${VALID_PAGE_TAGS.join(', ')}` },
        { status: 400 }
      )
    }
    if (theme && !VALID_THEMES.includes(theme)) {
      return NextResponse.json(
        { error: `Invalid theme. Valid values: ${VALID_THEMES.join(', ')}` },
        { status: 400 }
      )
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Valid values: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }
    if (special && !VALID_SPECIAL.includes(special)) {
      return NextResponse.json(
        { error: `Invalid special tag. Valid values: ${VALID_SPECIAL.join(', ')}` },
        { status: 400 }
      )
    }

    // The Harvest gallery ID
    const HARVEST_GALLERY_ID = '5fa1593e-7d73-477a-9a34-64d2f3ff86cc'

    // Get photos from The Harvest gallery
    const { data: galleryAssocs } = await supabase
      .from('gallery_media_associations')
      .select('media_asset_id')
      .eq('gallery_id', HARVEST_GALLERY_ID)

    const galleryMediaIds = galleryAssocs?.map(a => a.media_asset_id) || []

    if (galleryMediaIds.length === 0) {
      return createResponse([], 0, pageNum, limit, request)
    }

    // Build query for media assets from the gallery
    const { data: baseAssets, error: baseError } = await supabase
      .from('media_assets')
      .select(`
        id,
        cdn_url,
        thumbnail_url,
        title,
        description,
        alt_text,
        width,
        height,
        attribution_text,
        created_at,
        updated_at,
        project_id,
        uploader_id,
        profiles:uploader_id(display_name)
      `)
      .in('id', galleryMediaIds)
      .order('created_at', { ascending: false })

    if (baseError) {
      console.error('Error fetching media assets:', baseError)
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }

    if (!baseAssets || baseAssets.length === 0) {
      return createResponse([], 0, pageNum, limit, request)
    }

    const assetIds = baseAssets.map((a: { id: string }) => a.id)

    // Fetch tags for these assets
    const { data: mediaTags } = await supabase
      .from('media_tags')
      .select(`
        media_asset_id,
        tags!inner(slug, category)
      `)
      .in('media_asset_id', assetIds)

    // Build tag lookup: assetId -> { pageTags, themes, category, special }
    const tagLookup = new Map<string, { pageTags: string[], themes: string[], category: string | null, special: string[] }>()

    for (const mt of mediaTags || []) {
      const assetId = mt.media_asset_id
      const tag = mt.tags as { slug: string; category: string }

      if (!tagLookup.has(assetId)) {
        tagLookup.set(assetId, { pageTags: [], themes: [], category: null, special: [] })
      }

      const lookup = tagLookup.get(assetId)!

      // Categorize the tag based on its category or slug
      if (tag.category === 'harvest-page' || VALID_PAGE_TAGS.includes(tag.slug)) {
        if (!lookup.pageTags.includes(tag.slug)) {
          lookup.pageTags.push(tag.slug)
        }
      } else if (tag.category === 'harvest-theme' || VALID_THEMES.includes(tag.slug)) {
        if (!lookup.themes.includes(tag.slug)) {
          lookup.themes.push(tag.slug)
        }
      } else if (tag.category === 'harvest-category' || VALID_CATEGORIES.includes(tag.slug)) {
        lookup.category = tag.slug
      } else if (tag.category === 'harvest-special' || VALID_SPECIAL.includes(tag.slug)) {
        if (!lookup.special.includes(tag.slug)) {
          lookup.special.push(tag.slug)
        }
      }
    }

    // Filter assets based on query parameters
    let filteredAssets = baseAssets.filter((asset: { id: string }) => {
      const tags = tagLookup.get(asset.id) || { pageTags: [], themes: [], category: null, special: [] }

      // Must have at least one Harvest-related tag (including special)
      if (tags.pageTags.length === 0 && tags.themes.length === 0 && !tags.category && tags.special.length === 0) {
        return false
      }

      // Apply filters
      if (pageTag && !tags.pageTags.includes(pageTag)) return false
      if (theme && !tags.themes.includes(theme)) return false
      if (category && tags.category !== category) return false
      if (special && !tags.special.includes(special)) return false

      return true
    })

    const totalFiltered = filteredAssets.length

    // Apply pagination
    const offset = (pageNum - 1) * limit
    filteredAssets = filteredAssets.slice(offset, offset + limit)

    // Transform to ELMediaAsset format (matching The Harvest client interface)
    let sortOrder = 0
    const media: ELMediaAsset[] = filteredAssets.map((asset: {
      id: string
      cdn_url: string
      thumbnail_url: string | null
      title: string | null
      description: string | null
      alt_text: string | null
      width: number | null
      height: number | null
      attribution_text: string | null
      created_at: string
      updated_at: string
      project_id: string | null
      profiles: { display_name: string | null } | null
    }) => {
      const tags = tagLookup.get(asset.id) || { pageTags: [], themes: [], category: null, special: [] }
      sortOrder++

      return {
        id: asset.id,
        src: asset.cdn_url || asset.thumbnail_url || '',
        title: asset.title || '',
        description: asset.description,
        altText: asset.alt_text,
        category: (tags.category || 'general') as ELMediaAsset['category'],
        date: asset.created_at ? asset.created_at.substring(0, 7) : null, // YYYY-MM format
        location: null, // Not tracking location in current schema
        tags: tags.pageTags,
        themes: tags.themes,
        special: tags.special, // hero, featured
        projectId: asset.project_id,
        sortOrder,
        isPublished: true,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at || asset.created_at
      }
    })

    return createResponse(media, totalFiltered, pageNum, limit, request)
  } catch (error) {
    console.error('Error in Harvest gallery API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function createResponse(
  media: ELMediaAsset[],
  total: number,
  page: number,
  limit: number,
  request: NextRequest
) {
  const origin = request.headers.get('origin') || '*'

  const pagination: ELPagination = {
    page,
    limit,
    total,
    hasMore: page * limit < total
  }

  const response = {
    media,
    pagination
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
      'Cache-Control': 'public, max-age=300' // 5 min cache
    }
  })
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
