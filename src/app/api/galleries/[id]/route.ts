import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client-ssr'
import type { GalleryUpdate } from '@/types/database'

interface Params {
  id: string
}

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const supabase = createSupabaseClient()
    const { id } = params
    
    // Get current user for permission checks
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch gallery with all related data
    const { data: gallery, error } = await supabase
      .from('galleries')
      .select(`
        *,
        cover_image:media_assets!galleries_cover_image_id_fkey(
          id,
          filename,
          public_url,
          thumbnail_url,
          optimized_url,
          alt_text,
          title,
          description,
          cultural_sensitivity_level,
          width,
          height
        ),
        created_by_profile:profiles!galleries_created_by_fkey(
          id,
          display_name,
          avatar_url,
          is_elder
        ),
        organization:organizations(
          id,
          name,
          slug,
          logo_url,
          cultural_focus
        ),
        media_associations:gallery_media_associations(
          id,
          sort_order,
          caption,
          cultural_context,
          location_in_ceremony,
          people_depicted,
          is_cover_image,
          consent_status,
          media_asset:media_assets(
            id,
            filename,
            public_url,
            thumbnail_url,
            optimized_url,
            alt_text,
            title,
            description,
            cultural_sensitivity_level,
            ceremonial_content,
            traditional_knowledge,
            consent_status,
            elder_approval,
            width,
            height,
            file_type,
            capture_date,
            tags
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
      }
      console.error('Error fetching gallery:', error)
      return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
    }

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check visibility permissions
    const canView = 
      gallery.visibility === 'public' ||
      (gallery.visibility === 'community' && user) ||
      (gallery.created_by === user?.id)

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Filter media based on consent and cultural sensitivity
    if (gallery.media_associations) {
      gallery.media_associations = gallery.media_associations.filter((assoc: any) => {
        if (!assoc.media_asset) return false
        
        // Check consent status
        if (assoc.consent_status !== 'granted' && assoc.media_asset.consent_status !== 'granted') {
          // Only show to gallery owner
          if (gallery.created_by !== user?.id) return false
        }

        // Check cultural sensitivity permissions
        const asset = assoc.media_asset
        if (asset.cultural_sensitivity_level === 'high') {
          // High sensitivity content - requires specific permissions
          if (!user) return false
          // Additional checks can be added here based on user's cultural permissions
        }

        return true
      })

      // Sort by sort_order
      gallery.media_associations.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }

    // Increment view count if this is a public view (not the owner)
    if (gallery.created_by !== user?.id) {
      await supabase
        .from('galleries')
        .update({ view_count: (gallery.view_count || 0) + 1 })
        .eq('id', id)
    }

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error('Error in gallery API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const supabase = createSupabaseClient()
    const { id } = params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: existingGallery, error: fetchError } = await supabase
      .from('galleries')
      .select('created_by')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (existingGallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: GalleryUpdate = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Don't allow changing the owner or ID
    delete (updateData as any).id
    delete (updateData as any).created_by

    // Update gallery
    const { data: gallery, error } = await supabase
      .from('galleries')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cover_image:media_assets!galleries_cover_image_id_fkey(
          id,
          filename,
          public_url,
          thumbnail_url,
          alt_text
        )
      `)
      .single()

    if (error) {
      console.error('Error updating gallery:', error)
      return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 })
    }

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error('Error in gallery update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const supabase = createSupabaseClient()
    const { id } = params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: existingGallery, error: fetchError } = await supabase
      .from('galleries')
      .select('created_by, photo_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (existingGallery.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if gallery has photos - prevent deletion if it does
    if (existingGallery.photo_count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete gallery with photos. Please remove all photos first.' 
      }, { status: 400 })
    }

    // Delete gallery
    const { error } = await supabase
      .from('galleries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery:', error)
      return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Gallery deleted successfully' })
  } catch (error) {
    console.error('Error in gallery deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}