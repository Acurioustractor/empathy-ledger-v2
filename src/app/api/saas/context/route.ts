import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getCurrentOrganizationContext, getUserOrganizations } from '@/lib/multi-tenant/context'
import { getEntitlementsForTier } from '@/lib/saas/entitlements'
import { normalizeOrganizationTier } from '@/lib/saas/tier'
import { policyFromJson } from '@/lib/saas/org-policy'

export const dynamic = 'force-dynamic'

/**
 * GET /api/saas/context
 *
 * Returns the authenticated user's current org context plus org-level SaaS settings:
 * - current organization
 * - organizations user can access
 * - tier + entitlements (billing unit is organisation)
 * - distribution policy (org-level defaults)
 *
 * Optional:
 * - Query: orgId=<uuid> (request a specific organization context)
 * - Header: x-organization-id: <uuid> (alternate way to request org)
 */
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient() as any

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const requestedOrgId =
    request.nextUrl.searchParams.get('orgId') || request.headers.get('x-organization-id') || undefined

  const [orgAccess, currentContext] = await Promise.all([
    getUserOrganizations(user.id),
    getCurrentOrganizationContext(user.id, requestedOrgId),
  ])

  if (!currentContext) {
    return NextResponse.json(
      {
        organization: null,
        organizations: orgAccess.organizations ?? [],
        isSuperAdmin: Boolean(orgAccess.isSuperAdmin),
      },
      { status: 200 }
    )
  }

  // Fetch org SaaS settings. Using select('*') so it stays safe even if the migration
  // adding tier/distribution_policy hasn't been applied yet.
  const { data: orgRow } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', currentContext.organizationId)
    .single()

  const tier = normalizeOrganizationTier(orgRow?.tier)
  const entitlements = getEntitlementsForTier(tier)
  const distributionPolicy = policyFromJson(orgRow?.distribution_policy)

  return NextResponse.json({
    organization: {
      id: currentContext.organizationId,
      slug: currentContext.organizationSlug,
      name: currentContext.organizationName,
      role: currentContext.userRole,
      isSuperAdmin: currentContext.isSuperAdmin,
    },
    organizations: orgAccess.organizations ?? [],
    tier,
    entitlements,
    distributionPolicy,
  })
}

