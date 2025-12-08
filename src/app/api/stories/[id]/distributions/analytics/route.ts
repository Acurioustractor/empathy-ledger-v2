import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getDistributionService } from '@/lib/services/distribution.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stories/[id]/distributions/analytics
 *
 * Get distribution analytics for a story.
 * Requires authentication and story ownership.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Verify story ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, storyteller_id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (story.author_id !== user.id && story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    // Get analytics
    const distributionService = getDistributionService()
    const analytics = await distributionService.getDistributionAnalytics(storyId)

    return NextResponse.json({
      success: true,
      storyId,
      storyTitle: story.title,
      analytics: {
        totalViews: analytics.totalViews,
        totalClicks: analytics.totalClicks,
        viewsByPlatform: analytics.viewsByPlatform,
        topDomains: analytics.topDomains,
        viewsOverTime: analytics.viewsOverTime
      }
    })

  } catch (error) {
    console.error('Get distribution analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
