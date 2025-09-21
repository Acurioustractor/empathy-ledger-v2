import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import type { Gallery, GalleryInsert } from '@/types/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const culturalTheme = searchParams.get('cultural_theme')
    const culturalSensitivity = searchParams.get('cultural_sensitivity')
    const visibility = searchParams.get('visibility')
    const organizationId = searchParams.get('organization_id')
    const featured = searchParams.get('featured') === 'true'
    
    const supabase = createSupabaseServerClient()
    
    // Get current user to check permissions
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('photo_galleries')
      .select(`
        *,
        cover_image:media_assets!photo_galleries_cover_image_id_fkey(
          id,
          public_url,
          thumbnail_url,
          alt_text,
          cultural_sensitivity_level
        ),
        created_by_profile:profiles!photo_galleries_created_by_fkey(
          display_name,
          avatar_url
        ),
        organisation:organisations(
          name,
          slug,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })

    // Apply visibility filters based on user authentication
    if (!user) {
      query = query.eq('privacy_level', 'public')
    } else {
      // Authenticated users can see public and community galleries
      query = query.in('privacy_level', ['public', 'organisation'])
    }

    // Apply filters
    if (culturalTheme) {
      query = query.eq('cultural_theme', culturalTheme)
    }

    if (culturalSensitivity) {
      query = query.eq('cultural_sensitivity_level', culturalSensitivity)
    }

    if (visibility && user) {
      query = query.eq('privacy_level', visibility)
    }
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    if (featured) {
      query = query.eq('featured', true)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: galleries, error, count } = await query

    if (error) {
      console.error('Error fetching galleries:', error)
      return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
    }

    // Add photo count to each gallery
    const galleriesWithCounts = await Promise.all(
      (galleries || []).map(async (gallery) => {
        const { count: photoCount } = await supabase
          .from('gallery_media_associations')
          .select('*', { count: 'exact', head: true })
          .eq('gallery_id', gallery.id)

        return {
          ...gallery,
          photo_count: photoCount || 0
        }
      })
    )

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('photo_galleries')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      galleries: galleriesWithCounts,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in galleries API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      slug,
      description, 
      cultural_theme,
      cultural_context,
      cultural_sensitivity_level,
      ceremony_type,
      ceremony_date,
      ceremony_location,
      seasonal_context,
      traditional_knowledge_content,
      requires_elder_approval,
      visibility,
      access_restrictions,
      organization_id,
      cover_image_id
    } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json({ 
        error: 'Title and slug are required' 
      }, { status: 400 })
    }

    // Check if slug is unique
    const { data: existingGallery } = await supabase
      .from('photo_galleries')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingGallery) {
      return NextResponse.json({ 
        error: 'A gallery with this slug already exists' 
      }, { status: 400 })
    }

    // Prepare gallery data
    const galleryData: GalleryInsert = {
      title,
      slug,
      description,
      created_by: user.id,
      cultural_theme,
      cultural_context: cultural_context || {},
      cultural_sensitivity_level: cultural_sensitivity_level || 'medium',
      ceremony_type,
      ceremony_date,
      ceremony_location,
      seasonal_context,
      traditional_knowledge_content: traditional_knowledge_content || false,
      requires_elder_approval: requires_elder_approval || false,
      privacy_level: visibility || 'private',
      access_restrictions: access_restrictions || {},
      organization_id,
      cover_image_id,
      status: 'active'
    }

    // Set elder approval status based on requirements
    if (requires_elder_approval) {
      galleryData.elder_approval_status = 'pending'
    } else {
      galleryData.elder_approval_status = 'not_required'
    }

    // Create gallery
    const { data: gallery, error } = await supabase
      .from('photo_galleries')
      .insert(galleryData)
      .select(`
        *,
        cover_image:media_assets!photo_galleries_cover_image_id_fkey(
          id,
          filename,
          public_url,
          thumbnail_url,
          alt_text
        ),
        created_by_profile:profiles!photo_galleries_created_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating gallery:', error)
      return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
    }

    return NextResponse.json({ gallery }, { status: 201 })
  } catch (error) {
    console.error('Error in gallery creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}