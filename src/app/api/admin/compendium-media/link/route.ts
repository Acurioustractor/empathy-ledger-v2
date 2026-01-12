import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const COMPENDIUM_SLUG = 'compendium-2026'
const COMPENDIUM_TITLE = 'Compendium 2026'

async function ensureCompendiumGallery(supabase: any) {
  const { data: existing } = await supabase
    .from('galleries')
    .select('id, created_by, organization_id')
    .eq('slug', COMPENDIUM_SLUG)
    .maybeSingle()

  if (existing?.id) return existing

  const { data: fallback } = await supabase
    .from('galleries')
    .select('created_by, organization_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!fallback?.created_by) {
    throw new Error('No gallery creator found to seed compendium gallery.')
  }

  const { data: created, error } = await supabase
    .from('galleries')
    .insert({
      title: COMPENDIUM_TITLE,
      slug: COMPENDIUM_SLUG,
      description: 'Compendium 2026 media library',
      created_by: fallback.created_by,
      organization_id: fallback.organization_id || null,
      visibility: 'organization',
      status: 'active',
    })
    .select('id, created_by, organization_id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return created
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient() as any
    const payload = await request.json().catch(() => ({}))

    const mediaIds = Array.isArray(payload.mediaIds)
      ? payload.mediaIds.filter(Boolean)
      : []

    if (mediaIds.length === 0) {
      return NextResponse.json({ error: 'mediaIds are required' }, { status: 400 })
    }

    const gallery = await ensureCompendiumGallery(supabase)

    const { data: existingLinks } = await supabase
      .from('gallery_media_associations')
      .select('media_asset_id, sort_order')
      .eq('gallery_id', gallery.id)

    const existingIds = new Set((existingLinks || []).map((row: any) => row.media_asset_id))
    let nextSortOrder = 1
    ;(existingLinks || []).forEach((row: any) => {
      if (row.sort_order && row.sort_order >= nextSortOrder) {
        nextSortOrder = row.sort_order + 1
      }
    })

    const { data: assets, error: assetsError } = await supabase
      .from('media_assets')
      .select('id, title, original_filename')
      .in('id', mediaIds)

    if (assetsError) {
      return NextResponse.json({ error: 'Failed to load media assets' }, { status: 500 })
    }

    const inserts = (assets || [])
      .filter((asset: any) => !existingIds.has(asset.id))
      .map((asset: any) => ({
        gallery_id: gallery.id,
        media_asset_id: asset.id,
        sort_order: nextSortOrder++,
        caption: asset.title || asset.original_filename || '',
      }))

    if (inserts.length > 0) {
      const { error: insertError } = await supabase
        .from('gallery_media_associations')
        .insert(inserts)

      if (insertError) {
        return NextResponse.json({ error: 'Failed to link media assets' }, { status: 500 })
      }
    }

    const skipped = mediaIds.length - inserts.length

    return NextResponse.json({
      galleryId: gallery.id,
      added: inserts.length,
      skipped,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/compendium-media/link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
