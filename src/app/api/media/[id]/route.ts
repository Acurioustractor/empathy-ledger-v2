import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import type { MediaAssetUpdate } from '@/types/database'

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
    
    // Get current user for permission checks
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch media asset with all related data
    const { data: asset, error } = await supabase
      .from('media_assets')
      .select(`
        *,
        uploaded_by_profile:profiles!media_assets_uploaded_by_fkey(
          id,
          display_name,
          avatar_url,
          is_elder
        ),
        organisation:organizations(
          id,
          name,
          slug,
          logo_url
        ),
        galleries:gallery_media_associations(
          gallery:galleries(
            id,
            title,
            slug,
            cultural_theme
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
      }
      console.error('Error fetching media asset:', error)
      return NextResponse.json({ error: 'Failed to fetch media asset' }, { status: 500 })
    }

    if (!asset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Check visibility permissions
    const canView = 
      asset.visibility === 'public' ||
      (asset.visibility === 'community' && user) ||
      (asset.uploaded_by === user?.id)

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check consent status for non-owners
    if (asset.uploaded_by !== user?.id) {
      if (asset.consent_status !== 'granted') {
        return NextResponse.json({ error: 'Content not available for viewing' }, { status: 403 })
      }

      // Check cultural sensitivity permissions
      if (asset.cultural_sensitivity_level === 'high') {
        // High sensitivity content - could add additional checks here
        // For now, allow if user is authenticated
        if (!user) {
          return NextResponse.json({ error: 'Authentication required for sensitive content' }, { status: 401 })
        }
      }
    }

    // Get cultural tags if any exist
    const { data: culturalTags } = await supabase
      .from('media_cultural_tags')
      .select(`
        cultural_tag:cultural_tags(
          id,
          name,
          description,
          traditional_name,
          cultural_sensitivity_level
        )
      `)
      .eq('media_asset_id', id)

    // Flatten galleries array
    const galleries = asset.galleries?.map((g: any) => g.gallery).filter(Boolean) || []

    // Increment access count if this is a view from someone other than the owner
    if (asset.uploaded_by !== user?.id) {
      await supabase
        .from('media_assets')
        .update({ 
          access_count: (asset.access_count || 0) + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', id)
    }

    return NextResponse.json({ 
      asset: {
        ...asset,
        galleries,
        cultural_tags: culturalTags?.map((t: any) => t.cultural_tag) || []
      }
    })
  } catch (error) {
    console.error('Error in media asset API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this media asset
    const { data: existingAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('uploaded_by')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    if (existingAsset.uploaded_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: MediaAssetUpdate = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Don't allow changing certain fields
    delete (updateData as any).id
    delete (updateData as any).uploaded_by
    delete (updateData as any).filename
    delete (updateData as any).storage_bucket
    delete (updateData as any).storage_path
    delete (updateData as any).public_url
    delete (updateData as any).file_size
    delete (updateData as any).mime_type

    // Update media asset
    const { data: asset, error } = await supabase
      .from('media_assets')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        uploaded_by_profile:profiles!media_assets_uploaded_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error updating media asset:', error)
      return NextResponse.json({ error: 'Failed to update media asset' }, { status: 500 })
    }

    return NextResponse.json({ asset })
  } catch (error) {
    console.error('Error in media asset update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this media asset
    const { data: existingAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('uploaded_by, storage_bucket, storage_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    if (existingAsset.uploaded_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if media asset is used in any galleries
    const { data: galleryAssociations, error: assocError } = await supabase
      .from('gallery_media_associations')
      .select('id')
      .eq('media_asset_id', id)
      .limit(1)

    if (assocError) {
      console.error('Error checking gallery associations:', assocError)
      return NextResponse.json({ error: 'Failed to check gallery associations' }, { status: 500 })
    }

    if (galleryAssociations && galleryAssociations.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete media asset that is used in galleries. Please remove from galleries first.' 
      }, { status: 400 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(existingAsset.storage_bucket)
      .remove([existingAsset.storage_path])

    if (storageError) {
      console.warn('Failed to delete file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete media asset record
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting media asset:', error)
      return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Media asset deleted successfully' })
  } catch (error) {
    console.error('Error in media asset deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}