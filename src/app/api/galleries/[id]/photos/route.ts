import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


interface Params {
  id: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = await params

    // Get gallery photos through the photo_gallery_items junction table
    const { data: galleryItems, error } = await supabase
      .from('photo_gallery_items')
      .select(`
        *,
        media_assets (
          id,
          filename,
          title,
          description,
          cdn_url,
          url,
          thumbnail_url,
          file_size,
          mime_type,
          width,
          height,
          created_at
        )
      `)
      .eq('gallery_id', id)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching gallery photos:', error)
      return NextResponse.json({ error: 'Failed to fetch gallery photos' }, { status: 500 })
    }

    // Transform the data to return just the photos with their gallery metadata
    const photos = galleryItems?.map(item => ({
      ...item.media_assets,
      gallery_metadata: {
        display_order: item.display_order,
        is_featured: item.is_featured,
        caption: item.caption,
        added_at: item.added_at
      }
    })) || []

    return NextResponse.json({
      photos,
      total: photos.length
    })
  } catch (error) {
    console.error('Error in gallery photos API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}