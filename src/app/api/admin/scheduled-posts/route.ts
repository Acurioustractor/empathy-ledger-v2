// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/scheduled-posts
 *
 * Returns scheduled posts for an organization
 *
 * Query params:
 * - organization_id: filter by organization
 * - story_id: filter by story
 * - status: filter by status
 * - limit: number of results (default 50)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const storyId = searchParams.get('story_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('scheduled_posts')
      .select(`
        *,
        story:story_id(id, title, slug, excerpt),
        connection:connection_id(id, platform_username, platform:platform_id(slug, name, icon_url)),
        organization:organization_id(id, name, slug),
        created_by_profile:created_by(id, display_name),
        elder_approved_by_profile:elder_approved_by(id, display_name)
      `)
      .order('scheduled_for', { ascending: true })
      .limit(limit)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (storyId) {
      query = query.eq('story_id', storyId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching scheduled posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Scheduled posts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/scheduled-posts
 *
 * Create a new scheduled post
 */
export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const body = await request.json()
    const {
      story_id,
      organization_id,
      connection_id,
      content,
      excerpt,
      hashtags,
      media_urls,
      link_url,
      scheduled_for,
      timezone = 'Australia/Sydney',
      requires_elder_approval = false
    } = body

    // Validate required fields
    if (!story_id || !organization_id || !connection_id || !content || !scheduled_for) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, organization_id, connection_id, content, scheduled_for' },
        { status: 400 }
      )
    }

    // Get connection to verify it exists and get platform_id
    const { data: connection } = await supabase
      .from('social_connections')
      .select('id, platform_id, organization_id, status')
      .eq('id', connection_id)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Social connection not found' },
        { status: 400 }
      )
    }

    if (connection.organization_id !== organization_id) {
      return NextResponse.json(
        { error: 'Connection does not belong to this organization' },
        { status: 403 }
      )
    }

    if (connection.status !== 'active') {
      return NextResponse.json(
        { error: `Social connection is ${connection.status}. Please reconnect.` },
        { status: 400 }
      )
    }

    const { userId } = authResult

    // Create scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        story_id,
        organization_id,
        connection_id,
        platform_id: connection.platform_id,
        content,
        excerpt,
        hashtags: hashtags || [],
        media_urls: media_urls || [],
        link_url,
        scheduled_for,
        timezone,
        status: requires_elder_approval ? 'draft' : 'scheduled',
        requires_elder_approval,
        created_by: userId
      })
      .select(`
        *,
        story:story_id(id, title, slug),
        connection:connection_id(platform_username, platform:platform_id(slug, name))
      `)
      .single()

    if (error) {
      console.error('Error creating scheduled post:', error)
      return NextResponse.json(
        { error: 'Failed to create scheduled post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Create scheduled post error:', error)
    return NextResponse.json(
      { error: 'Failed to create scheduled post' },
      { status: 500 }
    )
  }
}
