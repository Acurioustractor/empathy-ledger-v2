// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

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
    
    const supabase = await createSupabaseServerClient()
    
    // Get current user to check permissions
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('galleries')
      .select(`
        *
      `)
      .order('created_at', { ascending: false })

    // Apply visibility filters based on user authentication
    const isDevelopmentMode = process.env.NODE_ENV === 'development'

    if (!user && !isDevelopmentMode) {
      query = query.eq('privacy_level', 'public')
    } else if (isDevelopmentMode) {
      // In development mode, show all galleries regardless of privacy level
      console.log('🔧 Development mode: Showing all galleries')
    } else {
      // Authenticated users can see public and organization galleries
      query = query.in('privacy_level', ['public', 'organization'])
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

    // Add photo count and first photo thumbnail to each gallery
    const galleriesWithCounts = await Promise.all(
      (galleries || []).map(async (gallery) => {
        const { count: photoCount } = await supabase
          .from('gallery_media_associations')
          .select('*', { count: 'exact', head: true })
          .eq('gallery_id', gallery.id)

        // If no cover image is set, get the first photo as thumbnail
        const coverImage = gallery.cover_image
        let coverImageData = null

        if (!coverImage && photoCount && photoCount > 0) {
          console.log(`🖼️ Looking for first photo for gallery: ${gallery.title} (${gallery.id}) with ${photoCount} photos`)

          // Get first association
          const { data: firstAssociation, error: associationError } = await supabase
            .from('gallery_media_associations')
            .select('id, media_asset_id')
            .eq('gallery_id', gallery.id)
            .order('sort_order', { ascending: true })
            .limit(1)
            .single()

          if (associationError) {
            console.log(`❌ Error fetching first association for ${gallery.title}:`, associationError)
          } else if (firstAssociation) {
            // Get the media asset separately
            const { data: mediaAsset, error: mediaError } = await supabase
              .from('media_assets')
              .select('id, cdn_url, thumbnail_url, storage_path, title, description, cultural_sensitivity_level')
              .eq('id', firstAssociation.media_asset_id)
              .single()

            if (mediaError) {
              console.log(`❌ Error fetching media asset for ${gallery.title}:`, mediaError)
            } else if (mediaAsset) {
              console.log(`✅ Found first photo for ${gallery.title}:`, mediaAsset.id)
              const assetData = mediaAsset as any

              // Create cover image data for frontend
              coverImageData = {
                id: assetData.id,
                public_url: assetData.cdn_url || assetData.thumbnail_url || (assetData.storage_path ? `https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/${assetData.storage_path}` : null),
                thumbnail_url: assetData.thumbnail_url || assetData.cdn_url,
                alt_text: assetData.description || assetData.title,
                cultural_sensitivity_level: assetData.cultural_sensitivity_level || 'standard'
              }
            }
          }
        }

        return {
          ...gallery,
          photo_count: photoCount || 0,
          cover_image: coverImageData || gallery.cover_image
        }
      })
    )

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('galleries')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Returning ${galleriesWithCounts.length} galleries to frontend`)

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
    const supabase = await createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      cultural_sensitivity_level,
      privacy_level,
      organization_id
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({
        error: 'Title is required'
      }, { status: 400 })
    }

    // Check if slug is unique
    const { data: existingGallery } = await supabase
      .from('galleries')
      .select('id')
      .eq('title', title)
      .single()

    if (existingGallery) {
      return NextResponse.json({ 
        error: 'A gallery with this slug already exists' 
      }, { status: 400 })
    }

    // Prepare gallery data
    const galleryData: any = {
      title,
      description: description || '',
      created_by: user.id,
      cultural_sensitivity_level: cultural_sensitivity_level || 'standard',
      privacy_level: privacy_level || 'private',
      organization_id,
      photo_count: 0,
      view_count: 0
    }

    // Create gallery
    const { data: gallery, error } = await supabase
      .from('galleries')
      .insert(galleryData)
      .select('*')
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