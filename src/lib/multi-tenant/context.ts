/**
 * Multi-Tenant Context Management
 *
 * BEST PRACTICES:
 * 1. Always filter by organization_id in queries
 * 2. Use helper functions to ensure organization context
 * 3. Validate user has access to organization
 * 4. Super admin can access all organizations
 */

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export interface OrganizationContext {
  organizationId: string
  organizationSlug?: string
  organizationName?: string
  userRole?: string
  isSuperAdmin: boolean
}

/**
 * Get user's current organization context
 * Returns null if user not authenticated or no organization access
 */
export async function getCurrentOrganizationContext(
  userId: string,
  requestedOrgId?: string
): Promise<OrganizationContext | null> {
  const supabase = createSupabaseServerClient()

  // Check if user is super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, tenant_roles')
    .eq('id', userId)
    .single()

  const isSuperAdmin =
    profile?.tenant_roles?.includes('super_admin') ||
    profile?.tenant_roles?.includes('admin') ||
    profile?.email === 'benjamin@act.place'

  // If super admin and specific org requested, return that org
  if (isSuperAdmin && requestedOrgId) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id, slug, name')
      .eq('id', requestedOrgId)
      .single()

    if (org) {
      return {
        organizationId: org.id,
        organizationSlug: org.slug,
        organizationName: org.name,
        userRole: 'super_admin',
        isSuperAdmin: true
      }
    }
  }

  // Get user's organizations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      is_active,
      organizations:organization_id (
        id,
        slug,
        name
      )
    `)
    .eq('profile_id', userId)
    .eq('is_active', true)

  if (!memberships || memberships.length === 0) {
    return null
  }

  // If specific org requested, check if user has access
  if (requestedOrgId) {
    const membership = memberships.find(m => m.organization_id === requestedOrgId)
    if (!membership) {
      return null // User doesn't have access to this org
    }

    const org = membership.organizations as any
    return {
      organizationId: org.id,
      organizationSlug: org.slug,
      organizationName: org.name,
      userRole: membership.role || 'member',
      isSuperAdmin: false
    }
  }

  // Return first organization (default)
  const firstMembership = memberships[0]
  const org = firstMembership.organizations as any

  return {
    organizationId: org.id,
    organizationSlug: org.slug,
    organizationName: org.name,
    userRole: firstMembership.role || 'member',
    isSuperAdmin: false
  }
}

/**
 * Get all organizations user has access to
 */
export async function getUserOrganizations(userId: string) {
  const supabase = createSupabaseServerClient()

  // Check if super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, tenant_roles')
    .eq('id', userId)
    .single()

  const isSuperAdmin =
    profile?.tenant_roles?.includes('super_admin') ||
    profile?.tenant_roles?.includes('admin') ||
    profile?.email === 'benjamin@act.place'

  // Super admin gets all organizations
  if (isSuperAdmin) {
    const { data: allOrgs } = await supabase
      .from('organizations')
      .select('id, slug, name, created_at')
      .order('name')

    return {
      organizations: allOrgs || [],
      isSuperAdmin: true
    }
  }

  // Regular users get their organizations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      is_active,
      organizations:organization_id (
        id,
        slug,
        name,
        created_at
      )
    `)
    .eq('profile_id', userId)
    .eq('is_active', true)
    .order('organizations(name)')

  const organizations = memberships?.map(m => ({
    ...(m.organizations as any),
    userRole: m.role
  })) || []

  return {
    organizations,
    isSuperAdmin: false
  }
}

/**
 * Validate user has access to organization
 * Throws error if no access
 */
export async function requireOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<OrganizationContext> {
  const context = await getCurrentOrganizationContext(userId, organizationId)

  if (!context) {
    throw new Error('Access denied: Not a member of this organization')
  }

  return context
}

/**
 * Check if user is admin of organization
 */
export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const context = await getCurrentOrganizationContext(userId, organizationId)

  if (!context) return false
  if (context.isSuperAdmin) return true

  return context.userRole === 'admin' || context.userRole === 'owner'
}
