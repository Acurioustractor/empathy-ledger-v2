import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const status = searchParams.get('status') || 'active'
    const featured = searchParams.get('featured')

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // First get the storyteller's profile_id
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('profile_id, display_name')
      .eq('id', storytellerId)
      .single()

    if (storytellerError) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    // Build query for galleries created by this storyteller
    let query = supabase
      .from('galleries')
      .select(`
        *,
        cover_image:media_assets!galleries_cover_image_id_fkey(
          id,
          public_url,
          thumbnail_url,
          alt_text,
          title
        ),
        creator:profiles!galleries_created_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('created_by', storyteller.profile_id)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: galleries, error, count } = await query

    if (error) {
      console.error('Error fetching storyteller galleries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch galleries' },
        { status: 500 }
      )
    }

    // Also get galleries that feature this storyteller (where they appear in photos)
    const { data: featuredInGalleries } = await supabase
      .from('gallery_media_associations')
      .select(`
        gallery:galleries(
          id,
          title,
          slug,
          description,
          cover_image:media_assets!galleries_cover_image_id_fkey(
            id,
            public_url,
            thumbnail_url,
            alt_text
          ),
          cultural_theme,
          status
        )
      `)
      .contains('people_depicted', [storyteller.display_name])
      .eq('gallery.status', 'active')

    return NextResponse.json({
      galleries: galleries || [],
      featured_in: featuredInGalleries || [],
      storyteller: {
        id: storytellerId,
        display_name: storyteller.display_name
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Storyteller galleries API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new gallery for this storyteller
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    const body = await request.json()

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Verify storyteller exists and get profile_id
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, profile_id, display_name')
      .eq('id', storytellerId)
      .single()

    if (storytellerError) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    // Create gallery slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // Create gallery
    const galleryData = {
      title: body.title,
      slug: `${slug}-${Date.now()}`, // Ensure uniqueness
      description: body.description || null,
      created_by: storyteller.profile_id,
      cultural_theme: body.cultural_theme || null,
      cultural_context: body.cultural_context || {},
      cultural_significance: body.cultural_significance || null,
      cultural_sensitivity_level: body.cultural_sensitivity_level || 'low',
      traditional_knowledge_content: body.traditional_knowledge_content || false,
      requires_elder_approval: body.requires_elder_approval || false,
      visibility: body.visibility || 'public',
      status: 'draft', // New galleries start as drafts
      photo_count: 0,
      view_count: 0,
      featured: false
    }

    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .insert([galleryData])
      .select(`
        *,
        creator:profiles!galleries_created_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (galleryError) {
      console.error('Error creating gallery:', galleryError)
      return NextResponse.json(
        { error: 'Failed to create gallery' },
        { status: 500 }
      )
    }

    return NextResponse.json(gallery, { status: 201 })

  } catch (error) {
    console.error('Gallery creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}