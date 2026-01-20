// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

/**
 * The Harvest Photo Management API
 *
 * GET /api/v1/harvest/photos - Get all photos from the Harvest gallery with tags
 * PATCH /api/v1/harvest/photos - Update tags on a photo
 *
 * This endpoint is used by The Harvest admin to manage photo tags.
 */

// CORS helper
function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  }
}

// The Harvest gallery ID
const HARVEST_GALLERY_ID = '5fa1593e-7d73-477a-9a34-64d2f3ff86cc'

// Valid Harvest tags (slugs match database migration)
const HARVEST_TAGS = {
  pages: ['home', 'journey', 'stories', 'explore', 'membership', 'visit', 'whats-on', 'about', 'contact', 'venue-hire'],
  themes: ['eat', 'grow', 'make', 'gather'],
  categories: ['before', 'during', 'after', 'milestone', 'general-harvest'],
  // Special tags: hero, featured, plus numbered card slots for flexible page layouts
  special: ['hero', 'featured', 'card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6']
}

interface PhotoWithTags {
  id: string
  src: string
  thumbnail: string | null
  title: string | null
  description: string | null
  altText: string | null
  createdAt: string
  tags: {
    pages: string[]
    themes: string[]
    category: string | null
    special: string[] // hero, featured
  }
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')

  try {
    const supabase = createSupabaseServiceClient()

    // Get all photos from the Harvest gallery
    const { data: associations, error: assocError } = await supabase
      .from('gallery_media_associations')
      .select('media_asset_id, sort_order')
      .eq('gallery_id', HARVEST_GALLERY_ID)
      .order('sort_order', { ascending: true })

    if (assocError) {
      return NextResponse.json(
        { error: 'Failed to fetch gallery photos' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    if (!associations || associations.length === 0) {
      return NextResponse.json(
        { photos: [], availableTags: HARVEST_TAGS },
        { status: 200, headers: corsHeaders(origin) }
      )
    }

    const mediaIds = associations.map(a => a.media_asset_id)

    // Get photo details
    const { data: assets, error: assetsError } = await supabase
      .from('media_assets')
      .select('id, cdn_url, thumbnail_url, title, description, alt_text, created_at')
      .in('id', mediaIds)

    if (assetsError) {
      return NextResponse.json(
        { error: 'Failed to fetch photo details' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    // Get tags for these photos
    const { data: mediaTags, error: tagsError } = await supabase
      .from('media_tags')
      .select(`
        media_asset_id,
        tags!inner(slug, category)
      `)
      .in('media_asset_id', mediaIds)

    if (tagsError) {
      console.error('Error fetching media_tags:', tagsError)
    }

    // Build tag lookup
    const tagLookup = new Map<string, { pages: string[], themes: string[], category: string | null, special: string[] }>()

    for (const mt of mediaTags || []) {
      const assetId = mt.media_asset_id
      const tag = mt.tags as { slug: string; category: string }

      if (!tagLookup.has(assetId)) {
        tagLookup.set(assetId, { pages: [], themes: [], category: null, special: [] })
      }

      const lookup = tagLookup.get(assetId)!

      if (tag.category === 'harvest-page' || HARVEST_TAGS.pages.includes(tag.slug)) {
        if (!lookup.pages.includes(tag.slug)) lookup.pages.push(tag.slug)
      } else if (tag.category === 'harvest-theme' || HARVEST_TAGS.themes.includes(tag.slug)) {
        if (!lookup.themes.includes(tag.slug)) lookup.themes.push(tag.slug)
      } else if (tag.category === 'harvest-category' || HARVEST_TAGS.categories.includes(tag.slug)) {
        lookup.category = tag.slug
      } else if (tag.category === 'harvest-special' || HARVEST_TAGS.special.includes(tag.slug)) {
        if (!lookup.special.includes(tag.slug)) lookup.special.push(tag.slug)
      }
    }

    // Build response with sort order preserved
    const assetMap = new Map(assets?.map(a => [a.id, a]) || [])
    const photos: PhotoWithTags[] = associations.map(assoc => {
      const asset = assetMap.get(assoc.media_asset_id)
      const tags = tagLookup.get(assoc.media_asset_id) || { pages: [], themes: [], category: null, special: [] }

      return {
        id: assoc.media_asset_id,
        src: asset?.cdn_url || '',
        thumbnail: asset?.thumbnail_url || null,
        title: asset?.title || null,
        description: asset?.description || null,
        altText: asset?.alt_text || null,
        createdAt: asset?.created_at || '',
        tags
      }
    })

    return NextResponse.json(
      { photos, availableTags: HARVEST_TAGS, galleryId: HARVEST_GALLERY_ID },
      { status: 200, headers: corsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error in Harvest photos API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get('origin')

  try {
    const supabase = createSupabaseServiceClient()
    const body = await request.json()

    const { photoId, tags } = body

    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId is required' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    if (!tags || typeof tags !== 'object') {
      return NextResponse.json(
        { error: 'tags object is required with pages, themes, and category' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const { pages = [], themes = [], category = null, special = [] } = tags

    // Validate tags
    for (const page of pages) {
      if (!HARVEST_TAGS.pages.includes(page)) {
        return NextResponse.json(
          { error: `Invalid page tag: ${page}` },
          { status: 400, headers: corsHeaders(origin) }
        )
      }
    }
    for (const theme of themes) {
      if (!HARVEST_TAGS.themes.includes(theme)) {
        return NextResponse.json(
          { error: `Invalid theme tag: ${theme}` },
          { status: 400, headers: corsHeaders(origin) }
        )
      }
    }
    if (category && !HARVEST_TAGS.categories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category: ${category}` },
        { status: 400, headers: corsHeaders(origin) }
      )
    }
    for (const sp of special) {
      if (!HARVEST_TAGS.special.includes(sp)) {
        return NextResponse.json(
          { error: `Invalid special tag: ${sp}` },
          { status: 400, headers: corsHeaders(origin) }
        )
      }
    }

    // Get tag IDs for the requested tags
    const allSlugs = [...pages, ...themes, ...(category ? [category] : []), ...special]

    // Helper to get or create a tag
    const getOrCreateTag = async (slug: string, tagCategory: string, name: string): Promise<{ id: string | null }> => {
      // Try to find existing tag with matching slug AND category
      const { data: existing } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .eq('category', tagCategory)
        .maybeSingle()

      if (existing?.id) {
        return { id: existing.id }
      }

      // Create new tag
      const { data: created, error: createError } = await supabase
        .from('tags')
        .insert({
          slug,
          name,
          category: tagCategory,
          description: `Harvest tag for ${name}`,
          cultural_sensitivity_level: 'public'
        })
        .select('id')
        .single()

      if (createError) {
        console.error(`Failed to create tag ${slug}:`, createError)
        return { id: null }
      }
      return { id: created?.id || null }
    }

    if (allSlugs.length === 0) {
      // Remove all Harvest tags from this photo
      const { data: harvestTagIds } = await supabase
        .from('tags')
        .select('id')
        .in('category', ['harvest-page', 'harvest-theme', 'harvest-category'])

      if (harvestTagIds && harvestTagIds.length > 0) {
        await supabase
          .from('media_tags')
          .delete()
          .eq('media_asset_id', photoId)
          .in('tag_id', harvestTagIds.map(t => t.id))
      }

      return NextResponse.json(
        { success: true, message: 'All Harvest tags removed' },
        { status: 200, headers: corsHeaders(origin) }
      )
    }

    // Get or create all needed tags
    const tagIds: string[] = []

    for (const page of pages) {
      const result = await getOrCreateTag(page, 'harvest-page', `${page.charAt(0).toUpperCase() + page.slice(1)} Page`)
      if (result.id) tagIds.push(result.id)
    }

    for (const theme of themes) {
      const result = await getOrCreateTag(theme, 'harvest-theme', theme.charAt(0).toUpperCase() + theme.slice(1))
      if (result.id) tagIds.push(result.id)
    }

    if (category) {
      const result = await getOrCreateTag(category, 'harvest-category', category.charAt(0).toUpperCase() + category.slice(1))
      if (result.id) tagIds.push(result.id)
    }

    for (const sp of special) {
      const result = await getOrCreateTag(sp, 'harvest-special', sp.charAt(0).toUpperCase() + sp.slice(1))
      if (result.id) tagIds.push(result.id)
    }

    if (tagIds.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create or find tags', requestedTags: { pages, themes, category, special } },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    // Remove existing Harvest tags from this photo
    const { data: harvestTagIds } = await supabase
      .from('tags')
      .select('id')
      .in('category', ['harvest-page', 'harvest-theme', 'harvest-category', 'harvest-special'])

    if (harvestTagIds) {
      await supabase
        .from('media_tags')
        .delete()
        .eq('media_asset_id', photoId)
        .in('tag_id', harvestTagIds.map(t => t.id))
    }

    // Add new tags
    const tagInserts = tagIds.map(tagId => ({
      media_asset_id: photoId,
      tag_id: tagId,
      source: 'manual',
      verified: true
    }))

    const { error: insertError } = await supabase
      .from('media_tags')
      .insert(tagInserts)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to update tags', details: insertError.message },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    return NextResponse.json(
      { success: true, message: `Updated tags for photo ${photoId}` },
      { status: 200, headers: corsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error updating photo tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Max-Age': '86400'
    }
  })
}
