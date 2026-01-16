// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

interface RouteParams {
  params: {
    id: string
  }
}

interface MediaMetadata {
  title: string
  caption: string
  alt_text: string
  cultural_tags: string[]
  culturally_sensitive: boolean
  requires_attribution: boolean
  attribution_text?: string
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const metadata: MediaMetadata = await request.json()
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate alt text for images
    const { data: existingAsset } = await supabase
      .from('media_assets')
      .select('uploaded_by, media_type')
      .eq('id', id)
      .single()

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existingAsset.uploaded_by !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Require alt text for images (accessibility)
    if (existingAsset.media_type === 'image' && (!metadata.alt_text || !metadata.alt_text.trim())) {
      return NextResponse.json(
        { error: 'Alt text is required for images (accessibility requirement)' },
        { status: 400 }
      )
    }

    // Update metadata
    const { data: asset, error } = await supabase
      .from('media_assets')
      .update({
        title: metadata.title,
        caption: metadata.caption,
        alt_text: metadata.alt_text,
        cultural_tags: metadata.cultural_tags,
        culturally_sensitive: metadata.culturally_sensitive,
        requires_attribution: metadata.requires_attribution,
        attribution_text: metadata.attribution_text,
        updated_at: new Date().toISOString()
      })
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
      console.error('Error updating media metadata:', error)
      return NextResponse.json(
        { error: 'Failed to update metadata', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Metadata updated successfully',
      asset
    })

  } catch (error) {
    console.error('Media metadata update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const { data: asset, error } = await supabase
      .from('media_assets')
      .select(`
        id,
        title,
        caption,
        alt_text,
        cultural_tags,
        culturally_sensitive,
        requires_attribution,
        attribution_text,
        media_type,
        url
      `)
      .eq('id', id)
      .single()

    if (error || !asset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      metadata: {
        title: asset.title || '',
        caption: asset.caption || '',
        alt_text: asset.alt_text || '',
        cultural_tags: asset.cultural_tags || [],
        culturally_sensitive: asset.culturally_sensitive || false,
        requires_attribution: asset.requires_attribution || false,
        attribution_text: asset.attribution_text || ''
      },
      mediaType: asset.media_type,
      mediaUrl: asset.url
    })

  } catch (error) {
    console.error('Media metadata fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
