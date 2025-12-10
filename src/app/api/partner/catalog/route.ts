export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/partner/catalog
 *
 * Browse stories available for syndication.
 * Returns stories that are public and available for external apps,
 * along with the partner's request status for each.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('app_id')
    const theme = searchParams.get('theme')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!appId) {
      return NextResponse.json({ error: 'Missing app_id' }, { status: 400 })
    }

    // Verify access
    const { data: access } = await supabase
      .from('partner_team_members')
      .select('id')
      .eq('app_id', appId)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build query for public stories
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        summary,
        featured_image,
        themes,
        created_at,
        location,
        storyteller:storyteller_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (theme && theme !== 'all') {
      query = query.contains('themes', [theme])
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    const { data: stories, error: storiesError } = await query

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    // Get request status for each story
    const storyIds = (stories || []).map(s => s.id)

    const { data: requests } = await supabase
      .from('story_syndication_requests')
      .select('story_id, project_id, status')
      .eq('app_id', appId)
      .in('story_id', storyIds)

    // Map request status to stories
    const requestMap = new Map(
      (requests || []).map(r => [r.story_id, { status: r.status, project_id: r.project_id }])
    )

    const storiesWithStatus = (stories || []).map(story => ({
      ...story,
      request_status: requestMap.get(story.id)?.status || 'none',
      project_id: requestMap.get(story.id)?.project_id
    }))

    return NextResponse.json({
      stories: storiesWithStatus,
      total: storiesWithStatus.length,
      has_more: storiesWithStatus.length === limit
    })

  } catch (error) {
    console.error('Catalog API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
