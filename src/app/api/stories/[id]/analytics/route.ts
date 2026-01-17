import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth/api-auth'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/stories/[id]/analytics
 *
 * Returns analytics data for a specific story.
 * Requires authentication - only story owner or admin can access.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storyId } = await params

  // Authenticate
  const { user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseClient()

  // Get story info to verify access
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, title, status, published_at, storyteller_id')
    .eq('id', storyId)
    .single()

  if (storyError || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  // Check authorization (owner or admin)
  const isOwner = story.storyteller_id === user.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get time range from query params
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '30d'

  // Calculate date range
  let startDate: Date
  const now = new Date()

  switch (range) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'all':
    default:
      startDate = new Date(0) // Beginning of time
  }

  // Fetch analytics data from story_analytics table (if exists)
  // For now, aggregate from available sources

  // Get view counts from story_views if table exists
  let viewData = {
    totalViews: 0,
    uniqueViewers: 0,
    avgReadTime: 0,
    completionRate: 0
  }

  try {
    const { data: views } = await supabase
      .from('story_views')
      .select('viewer_id, read_time, completion_percentage, created_at')
      .eq('story_id', storyId)
      .gte('created_at', startDate.toISOString())

    if (views && views.length > 0) {
      viewData.totalViews = views.length
      viewData.uniqueViewers = new Set(views.map(v => v.viewer_id).filter(Boolean)).size
      viewData.avgReadTime = Math.round(
        views.reduce((sum, v) => sum + (v.read_time || 0), 0) / views.length
      )
      viewData.completionRate =
        views.reduce((sum, v) => sum + (v.completion_percentage || 0), 0) / views.length
    }
  } catch {
    // story_views table may not exist yet
  }

  // Get social engagement
  let socialData = {
    likes: 0,
    shares: 0,
    comments: 0,
    bookmarks: 0
  }

  try {
    // Count likes
    const { count: likesCount } = await supabase
      .from('story_likes')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)
      .gte('created_at', startDate.toISOString())

    socialData.likes = likesCount || 0

    // Count comments
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)
      .gte('created_at', startDate.toISOString())

    socialData.comments = commentsCount || 0
  } catch {
    // Tables may not exist yet
  }

  // Get syndication data
  let syndicationData = {
    syndicatedTo: 0,
    embedViews: 0,
    externalClickThroughs: 0
  }

  try {
    // Count syndication consents
    const { count: syndicationCount } = await supabase
      .from('syndication_consent')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)
      .eq('status', 'approved')

    syndicationData.syndicatedTo = syndicationCount || 0

    // Count embed token usage
    const { data: tokens } = await supabase
      .from('embed_tokens')
      .select('usage_count')
      .eq('story_id', storyId)

    if (tokens) {
      syndicationData.embedViews = tokens.reduce((sum, t) => sum + (t.usage_count || 0), 0)
    }
  } catch {
    // Tables may not exist yet
  }

  // Calculate trends (compare to previous period)
  const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
  let viewsTrend = 0
  let engagementTrend = 0

  try {
    const { data: previousViews } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousViewCount = previousViews?.length || 0
    if (previousViewCount > 0) {
      viewsTrend = ((viewData.totalViews - previousViewCount) / previousViewCount) * 100
    }
  } catch {
    // Ignore errors for trend calculation
  }

  // Build response
  const analytics = {
    storyId,
    title: story.title,
    status: story.status,
    publishedAt: story.published_at,

    // View metrics
    totalViews: viewData.totalViews,
    uniqueViewers: viewData.uniqueViewers,
    avgReadTime: viewData.avgReadTime,
    completionRate: viewData.completionRate,

    // Social metrics
    likes: socialData.likes,
    shares: socialData.shares,
    comments: socialData.comments,
    bookmarks: socialData.bookmarks,

    // Syndication metrics
    syndicatedTo: syndicationData.syndicatedTo,
    embedViews: syndicationData.embedViews,
    externalClickThroughs: syndicationData.externalClickThroughs,

    // Trends
    viewsTrend,
    engagementTrend,

    // View sources (placeholder - would need tracking implementation)
    viewSources: {
      direct: Math.round(viewData.totalViews * 0.4),
      search: Math.round(viewData.totalViews * 0.25),
      social: Math.round(viewData.totalViews * 0.2),
      syndicated: syndicationData.embedViews,
      other: Math.round(viewData.totalViews * 0.15)
    },

    // Top referrers (placeholder)
    topReferrers: [],

    // Reader locations (placeholder - would need geo tracking)
    readerLocations: [],

    // Daily views (placeholder - would need time series data)
    dailyViews: []
  }

  return NextResponse.json({ analytics })
}
