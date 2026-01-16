// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'



/**
 * GET /api/admin/stats/platform
 *
 * Returns platform-wide aggregated stats across all organizations
 * Super admin only
 *
 * BEST PRACTICE:
 * - Super admin uses service role client (bypasses RLS)
 * - Returns aggregated data across all organizations
 * - Used for platform overview dashboard
 */
export async function GET(request: NextRequest) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    console.log('📊 Fetching platform-wide stats (super admin)')

    // Get all organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .order('name')

    if (orgsError) throw orgsError

    // Aggregate stats across all organizations
    const [
      storiesResult,
      transcriptsResult,
      blogPostsResult,
      membersResult,
      projectsResult
    ] = await Promise.all([
      supabase
        .from('stories')
        .select('id, status', { count: 'exact' }),

      supabase
        .from('transcripts')
        .select('id', { count: 'exact' }),

      supabase
        .from('blog_posts')
        .select('id', { count: 'exact' }),

      supabase
        .from('profile_organizations')
        .select('profile_id', { count: 'exact' })
        .eq('is_active', true),

      supabase
        .from('projects')
        .select('id', { count: 'exact' })
    ])

    // Calculate stories by status
    const storiesByStatus = {
      total: storiesResult.count || 0,
      draft: 0,
      pending: 0,
      review: 0,
      published: 0,
      archived: 0
    }

    storiesResult.data?.forEach(story => {
      const status = story.status || 'draft'
      if (status in storiesByStatus) {
        storiesByStatus[status as keyof typeof storiesByStatus]++
      }
    })

    const platformStats = {
      platform: {
        totalOrganizations: orgs?.length || 0,
        stories: storiesByStatus,
        transcripts: { total: transcriptsResult.count || 0 },
        blogPosts: { total: blogPostsResult.count || 0 },
        members: { total: membersResult.count || 0 },
        projects: { total: projectsResult.count || 0 }
      },
      organizations: orgs || []
    }

    console.log(`✅ Platform stats: ${orgs?.length || 0} orgs, ${storiesByStatus.total} stories`)

    return NextResponse.json(platformStats)

  } catch (error) {
    console.error('Platform stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    )
  }
}
