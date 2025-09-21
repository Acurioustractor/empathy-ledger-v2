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
    const supabase = createSupabaseServerClient()
    const { id } = await params
    
    // Get current user for permission checks
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch gallery with basic data first (avoiding foreign key issues)
    const { data: gallery, error } = await supabase
      .from('photo_galleries')
      .select('*')
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

    // Check user permissions
    let canView = false
    let isSuperAdmin = false
    let isOrganizationMember = false
    let hasProjectAccess = false

    if (user) {
      // Check if user is super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

      isSuperAdmin = profile?.is_super_admin || false

      // Check if user is a member of the gallery's organisation (if gallery belongs to one)
      let isOrganizationMember = false
      if (gallery.organization_id) {
        const { data: membership } = await supabase
          .from('profile_organizations')
          .select('id')
          .eq('profile_id', user.id)
          .eq('organization_id', gallery.organization_id)
          .eq('is_active', true)
          .single()

        isOrganizationMember = !!membership
      }

      // Check if user has access to the project this gallery belongs to (if any)
      let hasProjectAccess = false
      if (gallery.project_id) {
        // Check if user is organisation member of the project's organisation
        const { data: project } = await supabase
          .from('projects')
          .select('organization_id')
          .eq('id', gallery.project_id)
          .single()

        if (project?.organization_id) {
          const { data: projectOrgMembership } = await supabase
            .from('profile_organizations')
            .select('id')
            .eq('profile_id', user.id)
            .eq('organization_id', project.organization_id)
            .eq('is_active', true)
            .single()

          hasProjectAccess = !!projectOrgMembership
        }
      }

      // Determine view permissions
      canView =
        gallery.privacy_level === 'public' ||
        isSuperAdmin ||
        (gallery.created_by === user.id) ||
        (gallery.privacy_level === 'organisation' && isOrganizationMember) ||
        hasProjectAccess
    } else {
      // No user - only public galleries
      canView = gallery.privacy_level === 'public'
    }

    console.log('🔐 Gallery access check:', {
      galleryId: id,
      privacyLevel: gallery.privacy_level,
      hasUser: !!user,
      isSuperAdmin,
      isOrganizationMember,
      hasProjectAccess,
      canView
    })

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Basic gallery data is returned (media associations will be handled separately when needed)

    // Increment view count if this is a public view (not the owner)
    if (gallery.created_by !== user?.id) {
      await supabase
        .from('photo_galleries')
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
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: existingGallery, error: fetchError } = await supabase
      .from('photo_galleries')
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
      .from('photo_galleries')
      .update(updateData)
      .eq('id', id)
      .select('*')
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
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user owns this gallery
    const { data: existingGallery, error: fetchError } = await supabase
      .from('photo_galleries')
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
      .from('photo_galleries')
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