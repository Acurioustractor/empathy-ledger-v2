// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import type { GalleryUpdate } from '@/types/database'



interface Params {
  id: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params

    console.log('🔍 Fetching standalone gallery:', id)

    // Get current user for permission checks
    const { data: { user } } = await supabase.auth.getUser()

    // Check if this is development mode (bypass authentication)
    const isDevelopmentBypass = process.env.NODE_ENV === 'development'

    // Try to get the gallery from the main galleries table first
    let { data: gallery, error: galleriesError } = await supabase
      .from('galleries')
      .select('*')
      .eq('id', id)
      .single()

    if (galleriesError && galleriesError.code === 'PGRST116') {
      console.log('📋 Gallery not found in main galleries table, checking photo_galleries...')

      // If not found in galleries, check photo_galleries table
      const { data: photoGallery, error: photoGalleriesError } = await supabase
        .from('photo_galleries')
        .select('*')
        .eq('id', id)
        .single()

      if (photoGalleriesError || !photoGallery) {
        return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
      }

      // Convert photo_galleries format to galleries format
      gallery = {
        id: photoGallery.id,
        title: photoGallery.title,
        description: photoGallery.description || '',
        created_by: photoGallery.created_by,
        created_at: photoGallery.created_at,
        updated_at: photoGallery.updated_at,
        privacy_level: photoGallery.privacy_level,
        cultural_sensitivity_level: 'standard',
        photo_count: 0, // Will be calculated from associations
        view_count: photoGallery.view_count || 0
      }
    }

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    console.log('Found gallery:', gallery.title)

    // Check permissions with development bypass
    const canView = isDevelopmentBypass ||
                   gallery.privacy_level === 'public' ||
                   gallery.created_by === user?.id

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get media associations for this gallery (same logic as organization galleries)
    console.log(`📸 Fetching photos for gallery: ${gallery.title}`)

    const { data: mediaAssociations, error: associationsError } = await supabase
      .from('gallery_media_associations')
      .select('*')
      .eq('gallery_id', gallery.id)
      .order('sort_order', { ascending: true })

    const galleryWithPhotos = { ...gallery, media_associations: [] }

    if (mediaAssociations && mediaAssociations.length > 0) {
      const mediaIds = mediaAssociations.map(assoc => assoc.media_asset_id)

      const { data: mediaAssets, error: mediaError } = await supabase
        .from('media_assets')
        .select(`
          id,
          filename,
          file_type,
          title,
          description,
          storage_path,
          thumbnail_url,
          file_size,
          mime_type,
          created_at,
          uploaded_by
        `)
        .in('id', mediaIds)

      if (!mediaError && mediaAssets) {
        // Create the photo objects with the same structure as organization galleries
        const photos = mediaAssociations.map(association => {
          const mediaAsset = mediaAssets.find(asset => asset.id === association.media_asset_id)

          if (!mediaAsset) return null

          return {
            id: mediaAsset.id,
            filename: mediaAsset.filename,
            originalFilename: mediaAsset.filename,
            type: 'image',
            url: mediaAsset.thumbnail_url ||
                 (mediaAsset.storage_path
                   ? `https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/${mediaAsset.storage_path}`
                   : `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(mediaAsset.title || mediaAsset.filename || 'Photo')}`),
            title: mediaAsset.title || mediaAsset.filename,
            description: mediaAsset.description || '',
            size: mediaAsset.file_size,
            mimeType: mediaAsset.mime_type,
            createdAt: mediaAsset.created_at,
            addedAt: association.created_at,
            uploader: {
              id: mediaAsset.uploaded_by,
              name: 'Unknown User',
              avatarUrl: null
            },
            tags: [`gallery-${gallery.id}`, 'gallery'],
            galleryItemId: association.id,
            media_asset: {
              id: mediaAsset.id,
              public_url: mediaAsset.thumbnail_url ||
                         (mediaAsset.storage_path
                           ? `https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/${mediaAsset.storage_path}`
                           : null),
              thumbnail_url: mediaAsset.thumbnail_url,
              alt_text: mediaAsset.description,
              title: mediaAsset.title,
              cultural_sensitivity_level: 'standard'
            }
          }
        }).filter(Boolean)

        galleryWithPhotos.media_associations = photos
        galleryWithPhotos.photo_count = photos.length
      }
    }

    console.log(`✅ Found ${galleryWithPhotos.media_associations?.length || 0} photos for ${gallery.title}`)

    // Increment view count if this is a public view (not the owner)
    if (gallery.created_by !== user?.id) {
      await supabase
        .from('galleries')
        .update({ view_count: (gallery.view_count || 0) + 1 })
        .eq('id', id)
    }

    return NextResponse.json({ gallery: galleryWithPhotos })
  } catch (error) {
    console.error('Error in gallery API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('created_by')
      .eq('id', id)
      .single()

    if (galleryError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: GalleryUpdate = body

    // Update the gallery
    const { data: updatedGallery, error: updateError } = await supabase
      .from('galleries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating gallery:', updateError)
      return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 })
    }

    return NextResponse.json({ gallery: updatedGallery })
  } catch (error) {
    console.error('Error in gallery update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('created_by')
      .eq('id', id)
      .single()

    if (galleryError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete all media associations first
    await supabase
      .from('gallery_media_associations')
      .delete()
      .eq('gallery_id', id)

    // Delete the gallery
    const { error: deleteError } = await supabase
      .from('galleries')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting gallery:', deleteError)
      return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Gallery deleted successfully' })
  } catch (error) {
    console.error('Error in gallery deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
