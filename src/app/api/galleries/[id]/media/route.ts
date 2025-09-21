import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import type { GalleryMediaAssociationInsert } from '@/types/database'

interface Params {
  id: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: galleryId } = await params
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check gallery access permissions
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, created_by, visibility')
      .eq('id', galleryId)
      .single()

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check access permissions
    const canView = 
      gallery.visibility === 'public' ||
      (gallery.visibility === 'community' && user) ||
      (gallery.created_by === user?.id)

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch media associations
    const { data: associations, error } = await supabase
      .from('gallery_media_associations')
      .select(`
        *,
        media_asset:media_assets(
          id,
          filename,
          original_filename,
          file_type,
          mime_type,
          public_url,
          thumbnail_url,
          optimized_url,
          title,
          description,
          alt_text,
          width,
          height,
          duration,
          cultural_sensitivity_level,
          ceremonial_content,
          traditional_knowledge,
          consent_status,
          elder_approval,
          tags,
          capture_date
        )
      `)
      .eq('gallery_id', galleryId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching gallery media:', error)
      return NextResponse.json({ error: 'Failed to fetch gallery media' }, { status: 500 })
    }

    // Filter based on consent and permissions for non-owners
    const filteredAssociations = associations?.filter(assoc => {
      if (gallery.created_by === user?.id) {
        return true // Owner can see all
      }

      const asset = assoc.media_asset
      if (!asset) return false

      // Check consent status
      if (assoc.consent_status !== 'granted' && asset.consent_status !== 'granted') {
        return false
      }

      // Check cultural sensitivity for unauthenticated users
      if (!user && asset.cultural_sensitivity_level === 'high') {
        return false
      }

      return true
    }) || []

    return NextResponse.json({ associations: filteredAssociations })
  } catch (error) {
    console.error('Error in gallery media API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: galleryId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns the gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('created_by')
      .eq('id', galleryId)
      .single()

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      media_asset_id,
      caption,
      cultural_context,
      location_in_ceremony,
      people_depicted,
      is_cover_image,
      sort_order
    } = body

    if (!media_asset_id) {
      return NextResponse.json({ error: 'Media asset ID is required' }, { status: 400 })
    }

    // Check if media asset exists and user has access to it
    const { data: mediaAsset, error: assetError } = await supabase
      .from('media_assets')
      .select('id, uploaded_by, consent_status')
      .eq('id', media_asset_id)
      .single()

    if (assetError || !mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Check if user has permission to add this media asset
    if (mediaAsset.uploaded_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only add media assets you uploaded' 
      }, { status: 403 })
    }

    // Check if association already exists
    const { data: existingAssoc } = await supabase
      .from('gallery_media_associations')
      .select('id')
      .eq('gallery_id', galleryId)
      .eq('media_asset_id', media_asset_id)
      .single()

    if (existingAssoc) {
      return NextResponse.json({ 
        error: 'This media asset is already in the gallery' 
      }, { status: 400 })
    }

    // Get next sort order if not provided
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined) {
      const { data: maxOrder } = await supabase
        .from('gallery_media_associations')
        .select('sort_order')
        .eq('gallery_id', galleryId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      finalSortOrder = (maxOrder?.sort_order || 0) + 1
    }

    // If this is set as cover image, unset any existing cover image
    if (is_cover_image) {
      await supabase
        .from('gallery_media_associations')
        .update({ is_cover_image: false })
        .eq('gallery_id', galleryId)
        .eq('is_cover_image', true)
    }

    // Create association
    const associationData: GalleryMediaAssociationInsert = {
      gallery_id: galleryId,
      media_asset_id,
      caption,
      cultural_context,
      location_in_ceremony,
      people_depicted,
      is_cover_image: is_cover_image || false,
      sort_order: finalSortOrder,
      consent_status: mediaAsset.consent_status
    }

    const { data: association, error } = await supabase
      .from('gallery_media_associations')
      .insert(associationData)
      .select(`
        *,
        media_asset:media_assets(
          id,
          filename,
          public_url,
          thumbnail_url,
          title,
          alt_text,
          width,
          height
        )
      `)
      .single()

    if (error) {
      console.error('Error creating gallery media association:', error)
      return NextResponse.json({ error: 'Failed to add media to gallery' }, { status: 500 })
    }

    // Update gallery cover image if this is marked as cover
    if (is_cover_image) {
      await supabase
        .from('galleries')
        .update({ cover_image_id: media_asset_id })
        .eq('id', galleryId)
    }

    return NextResponse.json({ association }, { status: 201 })
  } catch (error) {
    console.error('Error in gallery media creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: galleryId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('created_by')
      .eq('id', galleryId)
      .single()

    if (galleryError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { id: associationId, ...updateData } = body

    // Update the gallery media association
    const { data: updatedAssociation, error: updateError } = await supabase
      .from('gallery_media_associations')
      .update(updateData)
      .eq('id', associationId)
      .eq('gallery_id', galleryId) // Double-check gallery ownership
      .select(`
        *,
        media_asset:media_assets(
          id,
          filename,
          public_url,
          thumbnail_url,
          alt_text,
          title,
          cultural_sensitivity_level,
          width,
          height
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating media association:', updateError)
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }

    return NextResponse.json({ association: updatedAssociation })
  } catch (error) {
    console.error('Error in gallery media update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: galleryId } = await params
    const { searchParams } = new URL(request.url)
    const associationId = searchParams.get('association_id')
    const mediaAssetId = searchParams.get('media_asset_id')
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!associationId && !mediaAssetId) {
      return NextResponse.json({ 
        error: 'Either association_id or media_asset_id is required' 
      }, { status: 400 })
    }

    // Check if user owns the gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('created_by, cover_image_id')
      .eq('id', galleryId)
      .single()

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build delete query
    let deleteQuery = supabase
      .from('gallery_media_associations')
      .delete()
      .eq('gallery_id', galleryId)

    if (associationId) {
      deleteQuery = deleteQuery.eq('id', associationId)
    } else if (mediaAssetId) {
      deleteQuery = deleteQuery.eq('media_asset_id', mediaAssetId)
    }

    // Get the association before deleting to check if it was the cover image
    const { data: associationToDelete } = await supabase
      .from('gallery_media_associations')
      .select('media_asset_id, is_cover_image')
      .eq('gallery_id', galleryId)
      .eq(associationId ? 'id' : 'media_asset_id', associationId || mediaAssetId!)
      .single()

    const { error } = await deleteQuery

    if (error) {
      console.error('Error deleting gallery media association:', error)
      return NextResponse.json({ error: 'Failed to remove media from gallery' }, { status: 500 })
    }

    // If we deleted the cover image, clear it from the gallery
    if (associationToDelete?.is_cover_image || 
        gallery.cover_image_id === associationToDelete?.media_asset_id) {
      await supabase
        .from('galleries')
        .update({ cover_image_id: null })
        .eq('id', galleryId)
    }

    return NextResponse.json({ message: 'Media removed from gallery successfully' })
  } catch (error) {
    console.error('Error in gallery media deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}