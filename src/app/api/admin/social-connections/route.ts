// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/social-connections
 *
 * Returns all social connections for an organization
 *
 * Query params:
 * - organization_id: filter by organization (required for non-super-admins)
 */
export async function GET(request: NextRequest) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')

    // Build query
    let query = supabase
      .from('social_connections')
      .select(`
        *,
        platform:platform_id(id, slug, name, icon_url, max_content_length),
        organization:organization_id(id, name, slug),
        connected_by_profile:connected_by(id, display_name)
      `)
      .order('created_at', { ascending: false })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: connections, error } = await query

    if (error) {
      console.error('Error fetching social connections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch social connections' },
        { status: 500 }
      )
    }

    // Don't expose tokens in response
    const safeConnections = (connections || []).map(conn => ({
      ...conn,
      access_token: conn.access_token ? '***' : null,
      refresh_token: conn.refresh_token ? '***' : null
    }))

    return NextResponse.json({ connections: safeConnections })
  } catch (error) {
    console.error('Social connections error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social connections' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/social-connections
 *
 * Create a new social connection (after OAuth callback)
 */
export async function POST(request: NextRequest) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const body = await request.json()
    const {
      organization_id,
      platform_slug,
      access_token,
      refresh_token,
      token_expires_at,
      platform_user_id,
      platform_username,
      platform_profile_url
    } = body

    // Validate required fields
    if (!organization_id || !platform_slug || !access_token) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, platform_slug, access_token' },
        { status: 400 }
      )
    }

    // Get platform ID
    const { data: platform } = await supabase
      .from('social_platforms')
      .select('id')
      .eq('slug', platform_slug)
      .single()

    if (!platform) {
      return NextResponse.json(
        { error: `Platform "${platform_slug}" not found` },
        { status: 400 }
      )
    }

    // Get current user for connected_by
    const { userId } = authResult

    // Upsert connection (update if exists for this org+platform)
    const { data: connection, error } = await supabase
      .from('social_connections')
      .upsert({
        organization_id,
        platform_id: platform.id,
        access_token,
        refresh_token,
        token_expires_at,
        platform_user_id,
        platform_username,
        platform_profile_url,
        status: 'active',
        connected_by: userId,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,platform_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating social connection:', error)
      return NextResponse.json(
        { error: 'Failed to create social connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      connection: {
        ...connection,
        access_token: '***',
        refresh_token: connection.refresh_token ? '***' : null
      }
    })
  } catch (error) {
    console.error('Create social connection error:', error)
    return NextResponse.json(
      { error: 'Failed to create social connection' },
      { status: 500 }
    )
  }
}
