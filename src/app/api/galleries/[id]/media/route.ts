// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



interface Params {
  id: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id: galleryId } = await params

    // Parse request body
    const body = await request.json()
    const { mediaAssetId, caption, cultural_context, location_in_ceremony, people_depicted } = body

    if (!mediaAssetId) {
      return NextResponse.json({ error: 'Media asset ID is required' }, { status: 400 })
    }

    console.log(`📸 Adding media asset ${mediaAssetId} to gallery: ${galleryId}`)

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check if this is development mode (bypass authentication)
    const isDevelopmentBypass = process.env.NODE_ENV === 'development'

    if (!isDevelopmentBypass && (authError || !user)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery (unless development bypass)
    if (!isDevelopmentBypass) {
      const { data: gallery, error: galleryError } = await supabase
        .from('galleries')
        .select('created_by')
        .eq('id', galleryId)
        .single()

      if (galleryError) {
        console.error('Gallery not found:', galleryError)
        return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
      }

      if (gallery.created_by !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Verify the media asset exists
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select('id')
      .eq('id', mediaAssetId)
      .single()

    if (mediaError || !mediaAsset) {
      console.error('Media asset not found:', mediaError)
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Check if association already exists
    const { data: existingAssociation, error: checkError } = await supabase
      .from('gallery_media_associations')
      .select('id')
      .eq('gallery_id', galleryId)
      .eq('media_asset_id', mediaAssetId)
      .single()

    if (existingAssociation) {
      return NextResponse.json({ error: 'Media already exists in this gallery' }, { status: 409 })
    }

    // Get the next sort order
    const { data: maxSortOrder } = await supabase
      .from('gallery_media_associations')
      .select('sort_order')
      .eq('gallery_id', galleryId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextSortOrder = maxSortOrder ? maxSortOrder.sort_order + 1 : 1

    // Create the association
    const { data: association, error: associationError } = await supabase
      .from('gallery_media_associations')
      .insert({
        gallery_id: galleryId,
        media_asset_id: mediaAssetId,
        sort_order: nextSortOrder,
        caption: caption || '',
        cultural_context: cultural_context || ''
      })
      .select()
      .single()

    if (associationError) {
      console.error('Error creating association:', associationError)
      return NextResponse.json({ error: 'Failed to add media to gallery' }, { status: 500 })
    }

    console.log(`✅ Successfully added media to gallery: ${association.id}`)
    return NextResponse.json({ association }, { status: 201 })

  } catch (error) {
    console.error('Error in gallery media addition:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id: galleryId } = await params

    // Get association_id from query params
    const url = new URL(request.url)
    const associationId = url.searchParams.get('association_id')

    if (!associationId) {
      return NextResponse.json({ error: 'Association ID is required' }, { status: 400 })
    }

    console.log(`🗑️ Deleting media association: ${associationId} from gallery: ${galleryId}`)

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check if this is development mode (bypass authentication)
    const isDevelopmentBypass = process.env.NODE_ENV === 'development'

    if (!isDevelopmentBypass && (authError || !user)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the association exists and belongs to this gallery
    const { data: association, error: associationError } = await supabase
      .from('gallery_media_associations')
      .select('*')
      .eq('id', associationId)
      .eq('gallery_id', galleryId)
      .single()

    if (associationError || !association) {
      console.error('Association not found:', associationError)
      return NextResponse.json({ error: 'Media association not found' }, { status: 404 })
    }

    // Check if user owns this gallery (unless development bypass)
    if (!isDevelopmentBypass) {
      const { data: gallery, error: galleryError } = await supabase
        .from('galleries')
        .select('created_by')
        .eq('id', galleryId)
        .single()

      if (galleryError) {
        console.error('Gallery not found:', galleryError)
        return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
      }

      if (gallery.created_by !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Delete the association
    const { error: deleteError } = await supabase
      .from('gallery_media_associations')
      .delete()
      .eq('id', associationId)

    if (deleteError) {
      console.error('Error deleting association:', deleteError)
      return NextResponse.json({ error: 'Failed to delete media from gallery' }, { status: 500 })
    }

    console.log(`✅ Successfully deleted media association: ${associationId}`)
    return NextResponse.json({ message: 'Media removed from gallery successfully' })

  } catch (error) {
    console.error('Error in gallery media deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
