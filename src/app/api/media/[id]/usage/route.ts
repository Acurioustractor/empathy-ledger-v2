// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



interface Params {
  id: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id: mediaId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has access to this media asset
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select('id, uploaded_by, title, filename')
      .eq('id', mediaId)
      .single()

    if (mediaError) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Check permissions - user must own the media or be admin
    const isOwner = mediaAsset.uploaded_by === user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('community_roles')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.community_roles?.includes('admin') || false

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get usage tracking data
    const { data: usageData, error: usageError } = await supabase
      .from('media_usage_tracking')
      .select(`
        *,
        stories:used_in_id(title, status, author_id),
        galleries:used_in_id(title, status, created_by, visibility),
        profiles:used_in_id(display_name, avatar_url)
      `)
      .eq('media_asset_id', mediaId)
      .is('removed_at', null)
      .order('created_at', { ascending: false })

    if (usageError) {
      console.error('Error fetching usage data:', usageError)
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    // Get usage summary using the database function
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('get_media_usage_summary', { asset_id: mediaId })

    if (summaryError) {
      console.error('Error fetching usage summary:', summaryError)
    }

    // Enrich usage data with content details
    const enrichedUsage = await Promise.all(
      (usageData || []).map(async (usage) => {
        let contentDetails = null

        try {
          switch (usage.used_in_type) {
            case 'story':
              const { data: story } = await supabase
                .from('stories')
                .select('id, title, status, author_id, storyteller_id')
                .eq('id', usage.used_in_id)
                .single()
              contentDetails = story
              break

            case 'gallery':
              const { data: gallery } = await supabase
                .from('galleries')
                .select('id, title, status, created_by, visibility, photo_count')
                .eq('id', usage.used_in_id)
                .single()
              contentDetails = gallery
              break

            case 'profile':
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url, is_storyteller')
                .eq('id', usage.used_in_id)
                .single()
              contentDetails = profileData
              break

            case 'project':
              // Add project details if you have projects table
              contentDetails = { id: usage.used_in_id, title: 'Project' }
              break

            default:
              contentDetails = { id: usage.used_in_id }
          }
        } catch (error) {
          console.error(`Error fetching ${usage.used_in_type} details:`, error)
          contentDetails = { id: usage.used_in_id, error: 'Failed to load details' }
        }

        return {
          ...usage,
          content_details: contentDetails
        }
      })
    )

    // Calculate total statistics
    const totalUsage = enrichedUsage.length
    const totalViews = enrichedUsage.reduce((sum, usage) => sum + (usage.view_count || 0), 0)
    const usageByType = enrichedUsage.reduce((acc, usage) => {
      acc[usage.used_in_type] = (acc[usage.used_in_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const responseData = {
      media_asset: {
        id: mediaAsset.id,
        title: mediaAsset.title,
        filename: mediaAsset.filename
      },
      usage: enrichedUsage,
      summary: {
        total_usage: totalUsage,
        total_views: totalViews,
        usage_by_type: usageByType,
        last_used: enrichedUsage[0]?.created_at || null
      },
      database_summary: summaryData || []
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error in media usage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id: mediaId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      used_in_type, 
      used_in_id, 
      usage_context, 
      usage_role = 'supporting',
      display_order = 0 
    } = body

    if (!used_in_type || !used_in_id) {
      return NextResponse.json({ 
        error: 'used_in_type and used_in_id are required' 
      }, { status: 400 })
    }

    // Validate used_in_type
    const validTypes = ['story', 'gallery', 'profile', 'project', 'transcript']
    if (!validTypes.includes(used_in_type)) {
      return NextResponse.json({ 
        error: 'Invalid used_in_type. Must be one of: ' + validTypes.join(', ') 
      }, { status: 400 })
    }

    // Check if user has permission to add this media to the specified content
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
        // For other types, check if user owns the media asset
        const { data: mediaAsset } = await supabase
          .from('media_assets')
          .select('uploaded_by')
          .eq('id', mediaId)
          .single()
        hasPermission = mediaAsset?.uploaded_by === user.id
    }

    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'You do not have permission to add this media to the specified content' 
      }, { status: 403 })
    }

    // Create or update usage tracking
    const { data: usageTrack, error } = await supabase
      .from('media_usage_tracking')
      .upsert({
        media_asset_id: mediaId,
        used_in_type,
        used_in_id,
        usage_context,
        usage_role,
        display_order,
        added_by: user.id,
        removed_at: null // Ensure it's not soft-deleted
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating usage tracking:', error)
      return NextResponse.json({ error: 'Failed to track media usage' }, { status: 500 })
    }

    return NextResponse.json({ usage: usageTrack }, { status: 201 })
  } catch (error) {
    console.error('Error in media usage creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Track a view of media in specific usage context
export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id: mediaId } = await params
    
    let body = {}
    try {
      body = await request.json()
    } catch (error) {
      // Empty body or invalid JSON - handle gracefully
      return NextResponse.json({ 
        error: 'Request body is required with used_in_type and used_in_id' 
      }, { status: 400 })
    }

    const { used_in_type, used_in_id } = body

    if (!used_in_type || !used_in_id) {
      return NextResponse.json({ 
        error: 'used_in_type and used_in_id are required to track view' 
      }, { status: 400 })
    }

    // Call the database function to increment view count
    const { error } = await supabase
      .rpc('increment_media_usage_view', {
        asset_id: mediaId,
        usage_type: used_in_type,
        content_id: used_in_id
      })

    if (error) {
      console.error('Error tracking media view:', error)
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
    }

    return NextResponse.json({ message: 'View tracked successfully' })
  } catch (error) {
    console.error('Error in media view tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}