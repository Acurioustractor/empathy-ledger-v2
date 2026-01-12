import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const BUCKET = 'media'
const PREFIX = 'photos/compendium-2026'
const BASE_TAGS = ['compendium-2026', 'source:admin-upload', 'consent:internal']
const GALLERY_SLUG = 'compendium-2026'
const GALLERY_TITLE = 'Compendium 2026'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64)

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient() as any
    const formData = await request.formData()
    const files = formData.getAll('files').filter(Boolean) as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const results: Array<{ name: string; status: 'uploaded' | 'skipped' | 'failed'; message?: string }> = []

    const { data: defaults, error: defaultsError } = await supabase
      .from('media_assets')
      .select('tenant_id, uploader_id, organization_id')
      .limit(1)
      .maybeSingle()

    if (defaultsError || !defaults) {
      return NextResponse.json({ error: 'Missing media defaults for upload' }, { status: 500 })
    }

    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id')
      .eq('slug', GALLERY_SLUG)
      .maybeSingle()

    let galleryId = gallery?.id

    if (!galleryId) {
      const { data: created, error: createError } = await supabase
        .from('galleries')
        .insert({
          title: GALLERY_TITLE,
          slug: GALLERY_SLUG,
          description: 'Compendium 2026 media library',
          created_by: defaults.uploader_id,
          organization_id: defaults.organization_id || null,
          visibility: 'organization',
          status: 'active',
        })
        .select('id')
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create compendium gallery' }, { status: 500 })
      }

      galleryId = created.id
    }

    const { data: existingLinks } = await supabase
      .from('gallery_media_associations')
      .select('media_asset_id, sort_order')
      .eq('gallery_id', galleryId)

    const existingAssetIds = new Set((existingLinks || []).map((row: any) => row.media_asset_id))
    let nextSortOrder = 1
    ;(existingLinks || []).forEach((row: any) => {
      if (row.sort_order && row.sort_order >= nextSortOrder) {
        nextSortOrder = row.sort_order + 1
      }
    })

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        results.push({ name: file.name, status: 'skipped', message: 'Only images are supported.' })
        continue
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const slug = slugify(baseName) || 'compendium-image'
      const unique = randomUUID().slice(0, 8)
      const storagePath = `${PREFIX}/${slug}-${unique}${extension ? `.${extension}` : ''}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        results.push({ name: file.name, status: 'failed', message: uploadError.message })
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

      const { data: inserted, error: insertError } = await supabase
        .from('media_assets')
        .insert({
          tenant_id: defaults.tenant_id,
          uploader_id: defaults.uploader_id,
          organization_id: defaults.organization_id || null,
          original_filename: file.name,
          filename: file.name,
          file_type: 'image',
          media_type: 'image',
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
          storage_bucket: BUCKET,
          storage_path: storagePath,
          cdn_url: publicUrl,
          title: baseName || file.name,
          description: 'Uploaded via Compendium Media admin.',
          alt_text: baseName || file.name,
          caption: baseName || file.name,
          cultural_tags: BASE_TAGS,
          privacy_level: 'private',
          cultural_sensitivity_level: 'standard',
          processing_status: 'pending',
          metadata: {
            source: 'compendium-admin-upload',
            source_id: `upload-${unique}`,
            compendium: true,
          },
        })
        .select('id')
        .single()

      if (insertError) {
        results.push({ name: file.name, status: 'failed', message: insertError.message })
        continue
      }

      if (!existingAssetIds.has(inserted.id)) {
        const { error: linkError } = await supabase
          .from('gallery_media_associations')
          .insert({
            gallery_id: galleryId,
            media_asset_id: inserted.id,
            sort_order: nextSortOrder,
            caption: baseName || file.name,
          })

        if (linkError) {
          results.push({ name: file.name, status: 'failed', message: linkError.message })
          continue
        }

        nextSortOrder += 1
        existingAssetIds.add(inserted.id)
      }

      results.push({ name: file.name, status: 'uploaded' })
    }

    return NextResponse.json({
      results,
      uploaded: results.filter((item) => item.status === 'uploaded').length,
      skipped: results.filter((item) => item.status === 'skipped').length,
      failed: results.filter((item) => item.status === 'failed').length,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/compendium-media/upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
