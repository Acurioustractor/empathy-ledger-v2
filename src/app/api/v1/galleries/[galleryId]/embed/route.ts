// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

// Helper to create response with CORS headers
function corsResponse(data: object, status: number, origin: string | null) {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', origin || '*')
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  if (status === 200) {
    headers.set('Cache-Control', 'public, max-age=300')
  }
  return NextResponse.json(data, { status, headers })
}

/**
 * GET /api/v1/galleries/[galleryId]/embed
 *
 * Public endpoint for external sites to fetch gallery data for embedding.
 * Requires valid embed token via Authorization header or query param.
 *
 * Headers:
 * - Authorization: Bearer <token>
 *
 * Or query param:
 * - ?token=<token>
 *
 * Response includes:
 * - Gallery metadata
 * - Photos (thumbnails by default, full-res if allowed)
 * - Attribution info
 * - Linked storytellers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || '*'

  try {
    const { galleryId } = await params
    const supabase = createSupabaseServiceClient()

    // Extract token from Authorization header or query param
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token')

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      return corsResponse(
        { error: 'Missing embed token - provide via Authorization header or token query param' },
        401,
        origin
      )
    }

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('gallery_embed_tokens')
      .select('*')
      .eq('token', token)
      .eq('gallery_id', galleryId)
      .single()

    if (tokenError || !tokenData) {
      return corsResponse({ error: 'Invalid or expired token' }, 401, origin)
    }

    // Check token status
    if (tokenData.status !== 'active') {
      return corsResponse({ error: `Token is ${tokenData.status}` }, 401, origin)
    }

    // Check expiration
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      // Auto-update status
      await supabase
        .from('gallery_embed_tokens')
        .update({ status: 'expired' })
        .eq('id', tokenData.id)

      return corsResponse({ error: 'Token has expired' }, 401, origin)
    }

    // Check domain restriction (allow localhost in development)
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer')
    if (tokenData.allowed_domains?.length > 0 && requestOrigin) {
      const requestDomain = new URL(requestOrigin).hostname
      const isLocalhost = requestDomain === 'localhost' || requestDomain === '127.0.0.1'
      const domainAllowed = isLocalhost || tokenData.allowed_domains.some(
        (domain: string) => requestDomain === domain || requestDomain.endsWith('.' + domain)
      )
      if (!domainAllowed) {
        return corsResponse({ error: 'Domain not authorized' }, 403, origin)
      }
    }

    // Update usage stats
    await supabase
      .from('gallery_embed_tokens')
      .update({
        usage_count: (tokenData.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
        last_used_domain: origin ? new URL(origin).hostname : null
      })
      .eq('id', tokenData.id)

    // Fetch gallery with consent info
    const { data: consent } = await supabase
      .from('gallery_syndication_consent')
      .select('allow_full_resolution, allow_download, allow_embedding')
      .eq('gallery_id', galleryId)
      .eq('site_id', tokenData.site_id)
      .eq('status', 'approved')
      .single()

    if (!consent) {
      return corsResponse({ error: 'Gallery not syndicated to this site' }, 403, origin)
    }

    // Fetch gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select(`
        id,
        title,
        description,
        visibility,
        cultural_sensitivity_level,
        cover_image_url,
        created_at
      `)
      .eq('id', galleryId)
      .single()

    if (galleryError || !gallery) {
      return corsResponse({ error: 'Gallery not found' }, 404, origin)
    }

    // Fetch photos via gallery_media_associations
    const { data: associations } = await supabase
      .from('gallery_media_associations')
      .select('media_asset_id, is_cover_image, sort_order')
      .eq('gallery_id', galleryId)
      .order('sort_order', { ascending: true })

    let photos: Array<{
      id: string
      url: string
      thumbnailUrl: string | null
      title: string | null
      description: string | null
      isCover: boolean
      sortOrder: number
    }> = []

    if (associations && associations.length > 0) {
      const mediaAssetIds = associations.map(a => a.media_asset_id)

      const { data: assets } = await supabase
        .from('media_assets')
        .select('id, cdn_url, thumbnail_url, title, description')
        .in('id', mediaAssetIds)

      if (assets) {
        const assetMap = new Map(assets.map(a => [a.id, a]))
        photos = associations.map(assoc => {
          const asset = assetMap.get(assoc.media_asset_id)
          return {
            id: asset?.id || assoc.media_asset_id,
            url: consent.allow_full_resolution ? (asset?.cdn_url || '') : (asset?.thumbnail_url || asset?.cdn_url || ''),
            thumbnailUrl: asset?.thumbnail_url || null,
            title: asset?.title || null,
            description: asset?.description || null,
            isCover: assoc.is_cover_image || false,
            sortOrder: assoc.sort_order
          }
        })
      }

      // Respect max_photos limit from token
      if (tokenData.max_photos && photos.length > tokenData.max_photos) {
        photos = photos.slice(0, tokenData.max_photos)
      }
    }

    // Fetch linked storytellers with roles
    const { data: storytellerLinks } = await supabase
      .from('gallery_storytellers')
      .select(`
        role,
        is_primary,
        storyteller:profiles!gallery_storytellers_storyteller_id_fkey(
          id,
          display_name,
          full_name,
          avatar_url
        )
      `)
      .eq('gallery_id', galleryId)

    const storytellers = (storytellerLinks || [])
      .filter(link => link.storyteller)
      .map(link => ({
        id: (link.storyteller as { id: string }).id,
        name: (link.storyteller as { display_name: string | null; full_name: string | null }).display_name ||
              (link.storyteller as { full_name: string | null }).full_name ||
              'Unknown',
        avatarUrl: (link.storyteller as { avatar_url: string | null }).avatar_url,
        role: link.role,
        isPrimary: link.is_primary
      }))

    // Build response
    const response = {
      gallery: {
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        coverImageUrl: gallery.cover_image_url,
        photoCount: photos.length,
        createdAt: gallery.created_at
      },
      photos,
      storytellers,
      permissions: {
        allowDownload: consent.allow_download,
        allowFullResolution: consent.allow_full_resolution
      },
      display: {
        layout: tokenData.layout || 'grid',
        theme: tokenData.theme || 'light',
        showAttribution: tokenData.show_attribution ?? true,
        showCaptions: tokenData.show_captions ?? true
      },
      attribution: {
        source: 'Empathy Ledger',
        sourceUrl: 'https://empathyledger.org'
      }
    }

    return corsResponse(response, 200, origin)
  } catch (error) {
    console.error('Error in gallery embed API:', error)
    const origin = request.headers.get('origin') || '*'
    return corsResponse({ error: 'Internal server error' }, 500, origin)
  }
}

/**
 * OPTIONS /api/v1/galleries/[galleryId]/embed
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
