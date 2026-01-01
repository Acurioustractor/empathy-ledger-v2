// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'

import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

import { getOrganizationDashboardStats } from '@/lib/multi-tenant/queries'



/**
 * GET /api/admin/organizations/[orgId]/stats
 *
 * Returns stats for specific organization
 * Super admin only
 *
 * BEST PRACTICE:
 * - Super admin uses service role client (bypasses RLS)
 * - Can access ANY organization's stats
 * - Uses helper function that filters by organization_id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Verify super admin access
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    console.log(`📊 Fetching stats for organization: ${params.orgId} (super admin)`)

    // Get organization info
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('id', params.orgId)
      .single()

    if (orgError) throw orgError

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get stats using helper function (automatically filters by organization_id)
    const stats = await getOrganizationDashboardStats(supabase, params.orgId)

    console.log(`✅ Stats for ${org.name}: ${stats.stories.total} stories, ${stats.transcripts.total} transcripts`)

    return NextResponse.json({
      organizationId: org.id,
      organizationName: org.name,
      organizationSlug: org.slug,
      ...stats
    })

  } catch (error) {
    console.error('Organization stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization stats' },
      { status: 500 }
    )
  }
}
