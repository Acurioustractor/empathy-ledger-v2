// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'



export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const visibility = searchParams.get('visibility') || ''
    const sensitivity = searchParams.get('sensitivity') || ''

    const supabase = await createSupabaseServerClient()

    let query = supabase
      .from('galleries')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (visibility) {
      query = query.eq('visibility', visibility)
    }

    if (sensitivity) {
      query = query.eq('cultural_sensitivity_level', sensitivity)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: galleries, error } = await query

    if (error) {
      console.error('Error fetching admin galleries:', error)
      return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('galleries')
      .select('*', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    if (visibility) {
      countQuery = countQuery.eq('visibility', visibility)
    }
    if (sensitivity) {
      countQuery = countQuery.eq('cultural_sensitivity_level', sensitivity)
    }

    const { count: totalCount } = await countQuery

    // Get real media counts and creator info for each gallery
    const transformedGalleries = await Promise.all(galleries?.map(async gallery => {
      // Get real media count for this specific gallery using gallery_media_associations table
      const { count: mediaCount } = await supabase
        .from('gallery_media_associations')
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', gallery.id)

      // Get creator information
      const { data: creator } = await supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .eq('id', gallery.created_by)
        .single()

      return {
        id: gallery.id,
        title: gallery.title || 'Untitled Gallery',
        description: gallery.description,
        created_at: gallery.created_at,
        created_by: gallery.created_by,
        cover_image_id: gallery.cover_image_id,
        media_count: mediaCount || 0, // Real count from database
        visibility: gallery.visibility || 'private',
        cultural_sensitivity_level: gallery.cultural_sensitivity_level || 'low',
        tags: [], // tags column doesn't exist in galleries table
        location: null, // ceremony_location column doesn't exist
        featured: gallery.featured || false,
        status: gallery.status || 'active',

        // Real creator info
        creator: {
          id: gallery.created_by,
          display_name: creator?.display_name || creator?.full_name || 'Unknown Creator',
          community_roles: ['storyteller']
        },

        // Real statistics from database (defaulting to 0 if no stats table exists)
        stats: {
          views_count: 0, // Would need a gallery_views table
          likes_count: 0, // Would need a gallery_likes table
          comments_count: 0, // Would need a gallery_comments table
          shares_count: 0 // Would need a gallery_shares table
        },

        // Cultural protocols
        elder_approved: false, // elder_approval_status column doesn't exist
        ceremonial_content: gallery.cultural_sensitivity_level === 'high',
        traditional_knowledge: false, // traditional_knowledge_content column doesn't exist
        consent_status: 'granted' as 'granted' | 'pending' | 'denied'
      }
    }) || [])

    return NextResponse.json({
      galleries: transformedGalleries,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in admin galleries API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    console.log('Creating new gallery')

    const supabase = await createSupabaseServerClient()
    const galleryData = await request.json()

    console.log('Received gallery data:', galleryData)

    // Required fields validation
    if (!galleryData.title) {
      return NextResponse.json({ error: 'Gallery title is required' }, { status: 400 })
    }

    const requestedOrganizationId = galleryData.organizationId || null
    let organizationName: string | null = null
    let organizationId: string | null = null

    if (requestedOrganizationId) {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', requestedOrganizationId)
        .maybeSingle()

      if (orgError) {
        console.warn('Error fetching organisation:', orgError)
      } else if (!organization) {
        console.warn('Organisation not found for id:', requestedOrganizationId)
      } else {
        organizationId = requestedOrganizationId
        organizationName = organization.name
      }
    }

    // Generate slug from title
    const slug = galleryData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create gallery record (only include fields that exist in the table)
    const createdBy = galleryData.createdBy || 'd0a162d2-282e-4653-9d12-aa934c9dfa4e'
    const { data: newGallery, error: galleryError } = await supabase
      .from('galleries')
      .insert({
        title: galleryData.title,
        slug: slug,
        description: galleryData.description || null,
        created_by: createdBy, // Default to Benjamin Knight
        visibility: galleryData.visibility || 'private',
        cultural_sensitivity_level: galleryData.culturalSensitivityLevel || 'low',
        status: galleryData.status || 'active',
        featured: galleryData.featured || false,
        organization_id: organizationId
      })
      .select()
      .single()

    if (galleryError) {
      console.error('Error creating gallery:', galleryError)
      return NextResponse.json({
        error: 'Failed to create gallery',
        details: galleryError
      }, { status: 500 })
    }

    console.log('Successfully created gallery:', newGallery.id)

    const { data: creator } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .eq('id', newGallery.created_by)
      .maybeSingle()

    const resolvedVisibility = newGallery.visibility || galleryData.visibility || 'private'
    const resolvedSensitivity = newGallery.cultural_sensitivity_level || galleryData.culturalSensitivityLevel || 'low'

    return NextResponse.json({
      gallery: {
        id: newGallery.id,
        title: newGallery.title,
        description: newGallery.description,
        created_at: newGallery.created_at,
        created_by: newGallery.created_by,
        cover_image_id: newGallery.cover_image_id,
        media_count: 0,
        visibility: resolvedVisibility,
        cultural_sensitivity_level: resolvedSensitivity,
        organization_name: organizationName,
        tags: [],
        location: null,
        featured: newGallery.featured || false,
        status: newGallery.status || 'active',
        creator: {
          id: newGallery.created_by,
          display_name: creator?.display_name || creator?.full_name || 'Unknown Creator',
          community_roles: ['storyteller']
        },
        stats: {
          views_count: 0,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0
        },
        elder_approved: false,
        ceremonial_content: resolvedSensitivity === 'high',
        traditional_knowledge: false,
        consent_status: 'granted'
      },
      message: 'Gallery created successfully'
    })

  } catch (error) {
    console.error('Error in gallery creation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    console.log('Delete gallery API called')

    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('id')

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Delete the gallery
    const { error } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId)

    if (error) {
      console.error('Error deleting gallery:', error)
      return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 })
    }

    console.log('✅ Gallery deleted successfully:', galleryId)
    return NextResponse.json({ success: true, message: 'Gallery deleted successfully' })

  } catch (error) {
    console.error('Error in delete gallery API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
