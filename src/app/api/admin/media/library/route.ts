import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/media/library
 * Get all media assets for admin (no auth required for now - would add admin check in production)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type') || searchParams.get('file_type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Build query - get all media assets
    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by type if provided
    if (type && type !== 'all') {
      query = query.eq('file_type', type)
    }

    // Search by caption or alt_text
    if (search) {
      query = query.or(
        `caption.ilike.%${search}%,alt_text.ilike.%${search}%,title.ilike.%${search}%,original_filename.ilike.%${search}%`
      )
    }

    const { data: media, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching media:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      )
    }

    // Transform to match MediaAsset interface expected by components
    const transformedMedia = (media || []).map(m => {
      const storageUrl = m.storage_bucket && m.storage_path && process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${m.storage_bucket}/${m.storage_path}`
        : null
      return {
      id: m.id,
      url: m.cdn_url || m.url || storageUrl || m.storage_path,
      type: m.file_type || m.media_type || 'image',
      caption: m.caption || m.title || m.original_filename,
      title: m.title || m.original_filename,
      alt_text: m.alt_text,
      cultural_tags: m.cultural_tags || [],
      file_size: m.file_size,
      width: m.width,
      height: m.height,
      created_at: m.created_at
    }})

    return NextResponse.json({
      media: transformedMedia,
      count: transformedMedia.length
    })
  } catch (error) {
    console.error('Error in GET /api/admin/media/library:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
