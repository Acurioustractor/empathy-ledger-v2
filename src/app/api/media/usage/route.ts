import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usedInType = searchParams.get('used_in_type')
    const usedInId = searchParams.get('used_in_id')
    const mediaAssetId = searchParams.get('media_asset_id')
    
    const supabase = createSupabaseServerClient()
    
    let query = supabase
      .from('media_usage_tracking')
      .select(`
        *,
        media_asset:media_assets(
          id,
          filename,
          title,
          file_type,
          public_url,
          thumbnail_url,
          duration,
          cultural_sensitivity_level,
          created_at,
          uploaded_by
        )
      `)
      .is('removed_at', null)
      .order('display_order', { ascending: true })

    // Filter by usage location
    if (usedInType && usedInId) {
      query = query.eq('used_in_type', usedInType).eq('used_in_id', usedInId)
    }

    // Filter by specific media asset
    if (mediaAssetId) {
      query = query.eq('media_asset_id', mediaAssetId)
    }

    const { data: usages, error } = await query

    if (error) {
      console.error('Error fetching media usage:', error)
      return NextResponse.json({ error: 'Failed to fetch media usage' }, { status: 500 })
    }

    return NextResponse.json({ usages: usages || [] })
  } catch (error) {
    console.error('Error in media usage API:', error)
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
      media_asset_id,
      used_in_type,
      used_in_id,
      usage_context,
      usage_role,
      display_order
    } = body

    if (!media_asset_id || !used_in_type || !used_in_id) {
      return NextResponse.json({ 
        error: 'media_asset_id, used_in_type, and used_in_id are required' 
      }, { status: 400 })
    }

    // Verify user has permission to link media to this content
    let hasPermission = false
    
    switch (used_in_type) {
      case 'story':
        const { data: story } = await supabase
          .from('stories')
          .select('author_id')
          .eq('id', used_in_id)
          .single()
        hasPermission = story?.author_id === user.id
        break
      
      case 'gallery':
        const { data: gallery } = await supabase
          .from('galleries')
          .select('created_by')
          .eq('id', used_in_id)
          .single()
        hasPermission = gallery?.created_by === user.id
        break
        
      case 'profile':
        hasPermission = used_in_id === user.id
        break
        
      default:
        hasPermission = true // For other types, allow for now
    }

    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'You do not have permission to link media to this content' 
      }, { status: 403 })
    }

    // Create usage tracking record
    const { data: usage, error: insertError } = await supabase
      .from('media_usage_tracking')
      .insert({
        media_asset_id,
        used_in_type,
        used_in_id,
        usage_context: usage_context || null,
        usage_role: usage_role || 'supporting',
        display_order: display_order || 0,
        added_by: user.id,
        added_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating media usage:', insertError)
      return NextResponse.json({ 
        error: 'Failed to link media. It may already be linked to this content.' 
      }, { status: 400 })
    }

    return NextResponse.json({ usage }, { status: 201 })
  } catch (error) {
    console.error('Error in media usage creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      media_asset_id,
      used_in_type,
      used_in_id
    } = body

    if (!media_asset_id || !used_in_type || !used_in_id) {
      return NextResponse.json({ 
        error: 'media_asset_id, used_in_type, and used_in_id are required' 
      }, { status: 400 })
    }

    // Soft delete the usage record
    const { error: deleteError } = await supabase
      .from('media_usage_tracking')
      .update({ 
        removed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('media_asset_id', media_asset_id)
      .eq('used_in_type', used_in_type)
      .eq('used_in_id', used_in_id)
      .is('removed_at', null)

    if (deleteError) {
      console.error('Error removing media usage:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to unlink media' 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Media unlinked successfully' })
  } catch (error) {
    console.error('Error in media usage deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}