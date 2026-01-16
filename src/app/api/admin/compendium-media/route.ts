import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const BASE_COMPENDIUM_TAG = 'compendium-2026'
const COMPENDIUM_SLUG = 'compendium-2026'
const COMPENDIUM_TITLE = 'Compendium 2026'

const uniqueList = (values: string[]) => Array.from(new Set(values.filter(Boolean)))

const normalizeTags = (tags: unknown) =>
  uniqueList(
    (Array.isArray(tags) ? tags : [])
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter(Boolean)
  )

const resolveFileUrl = (row: any) => {
  if (row?.cdn_url) return row.cdn_url
  if (row?.url) return row.url
  if (row?.storage_bucket && row?.storage_path && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${row.storage_bucket}/${row.storage_path}`
  }
  return ''
}

async function ensureCompendiumGallery(supabase: any) {
  const { data: existing, error } = await supabase
    .from('galleries')
    .select('id, title, slug')
    .eq('slug', COMPENDIUM_SLUG)
    .maybeSingle()

  if (existing?.id) return existing

  if (error) {
    console.warn('Failed to read compendium gallery:', error.message)
  }

  const { data: fallback } = await supabase
    .from('galleries')
    .select('created_by, organization_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!fallback?.created_by) {
    throw new Error('No gallery creator found to seed compendium gallery.')
  }

  const { data: created, error: insertError } = await supabase
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
    .select('id, title, slug')
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  return created
}

async function ensureCompendiumTag(supabase: any) {
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', BASE_COMPENDIUM_TAG)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data: created, error } = await supabase
    .from('tags')
    .insert({
      name: 'Compendium 2026',
      slug: BASE_COMPENDIUM_TAG,
      category: 'project',
      tenant_id: null,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('Failed to create compendium tag:', error.message)
    return null
  }

  return created.id
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient() as any
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')?.trim()
    const tag = searchParams.get('tag')?.trim()
    const project = searchParams.get('project')?.trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const gallery = await ensureCompendiumGallery(supabase)

    const { data: associations, error } = await supabase
      .from('gallery_media_associations')
      .select('id, sort_order, caption, media_asset_id')
      .eq('gallery_id', gallery.id)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching compendium media:', error)
      return NextResponse.json({ error: 'Failed to fetch compendium media' }, { status: 500 })
    }

    const mediaIds = (associations || [])
      .map((row: any) => row.media_asset_id)
      .filter(Boolean)

    let assets: any[] = []

    if (mediaIds.length > 0) {
      const { data: assetsData, error: assetsError } = await supabase
        .from('media_assets')
        .select(
          'id, title, description, caption, alt_text, cdn_url, url, storage_bucket, storage_path, file_type, mime_type, file_size, width, height, original_filename, created_at, cultural_tags, metadata'
        )
        .in('id', mediaIds)

      if (assetsError) {
        console.error('Error fetching compendium media assets:', assetsError)
        return NextResponse.json({ error: 'Failed to fetch compendium media assets' }, { status: 500 })
      }

      assets = assetsData || []
    }

    const assetMap = new Map((assets || []).map((asset: any) => [asset.id, asset]))

    const items = (associations || [])
      .map((row: any) => {
        const asset = assetMap.get(row.media_asset_id)
        if (!asset) return null
        const metadata = asset.metadata && typeof asset.metadata === 'object' ? asset.metadata : {}
        const projectSlugs = Array.isArray(metadata.project_slugs) ? metadata.project_slugs : []
        return {
          id: asset.id,
          file_url: resolveFileUrl(asset),
          title: asset.title || asset.original_filename || 'Untitled',
          description: asset.description,
          caption: asset.caption,
          alt_text: asset.alt_text,
          file_type: asset.file_type,
          mime_type: asset.mime_type,
          file_size: asset.file_size,
          width: asset.width,
          height: asset.height,
          created_at: asset.created_at,
          cultural_tags: asset.cultural_tags || [],
          project_slugs: projectSlugs,
          metadata,
          gallery_association_id: row.id,
          sort_order: row.sort_order,
        }
      })
      .filter(Boolean)

    const filteredItems = items.filter((item: any) => {
      if (!item) return false
      if (search) {
        const haystack = `${item.title || ''} ${item.description || ''} ${item.caption || ''}`.toLowerCase()
        if (!haystack.includes(search.toLowerCase())) {
          return false
        }
      }
      if (tag && !item.cultural_tags?.includes(tag)) {
        return false
      }
      if (project && !(item.project_slugs || []).includes(project)) {
        return false
      }
      return true
    })

    const includeVideos = !tag && !project
    let videoData: any[] = []

    if (includeVideos) {
      const compendiumTagId = await ensureCompendiumTag(supabase)

      if (compendiumTagId) {
        const { data: tagLinks } = await supabase
          .from('video_link_tags')
          .select('video_link_id')
          .eq('tag_id', compendiumTagId)

        const videoIds = (tagLinks || []).map((row: any) => row.video_link_id).filter(Boolean)

        if (videoIds.length > 0) {
          const { data: videos, error: videoError } = await supabase
            .from('video_links')
            .select('id, title, description, embed_url, video_url, platform, thumbnail_url, created_at')
            .in('id', videoIds)
            .order('created_at', { ascending: false })

          if (videoError) {
            console.error('Error fetching compendium videos:', videoError)
          } else {
            videoData = (videos || []).filter((video: any) => {
              if (!search) return true
              const haystack = `${video.title || ''} ${video.description || ''}`.toLowerCase()
              return haystack.includes(search.toLowerCase())
            })
          }
        }
      }
    }

    return NextResponse.json({
      gallery,
      items: filteredItems,
      videos: videoData,
      count: filteredItems.length,
      videoCount: videoData.length,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/compendium-media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient() as any
    const payload = await request.json().catch(() => ({}))

    const ids = Array.isArray(payload.ids) ? payload.ids.filter(Boolean) : []
    const tags = normalizeTags(payload.tags)

    if (ids.length === 0 || tags.length === 0) {
      return NextResponse.json({ error: 'ids and tags are required' }, { status: 400 })
    }

    const { data: existing, error } = await supabase
      .from('media_assets')
      .select('id, cultural_tags')
      .in('id', ids)

    if (error) {
      console.error('Error loading media for tagging:', error)
      return NextResponse.json({ error: 'Failed to load media items' }, { status: 500 })
    }

    const updates = (existing || []).filter((item: any) =>
      (item.cultural_tags || []).includes(BASE_COMPENDIUM_TAG)
    )

    let updated = 0
    let skipped = 0

    for (const item of updates) {
      const currentTags = normalizeTags(item.cultural_tags)
      const nextTags = uniqueList([...currentTags, ...tags, BASE_COMPENDIUM_TAG])
      const hasChanges = nextTags.length !== currentTags.length

      if (!hasChanges) {
        skipped += 1
        continue
      }

      const { error: updateError } = await supabase
        .from('media_assets')
        .update({ cultural_tags: nextTags })
        .eq('id', item.id)

      if (updateError) {
        console.error('Error updating tags:', updateError)
        continue
      }

      updated += 1
    }

    return NextResponse.json({
      updated,
      skipped,
      attempted: updates.length,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/compendium-media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
