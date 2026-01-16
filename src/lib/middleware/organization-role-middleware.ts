import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Organization role hierarchy (ordered from highest to lowest authority)
export const ORGANIZATION_ROLES = {
  elder: 'elder',
  cultural_keeper: 'cultural_keeper', 
  knowledge_holder: 'knowledge_holder',
  admin: 'admin',
  project_leader: 'project_leader',
  storyteller: 'storyteller',
  community_member: 'community_member',
  cultural_liaison: 'cultural_liaison',
  archivist: 'archivist',
  guest: 'guest'
} as const

export type OrganizationRole = keyof typeof ORGANIZATION_ROLES

// Role hierarchy levels (higher number = more authority)
const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  elder: 100,
  cultural_keeper: 90,
  knowledge_holder: 80,
  admin: 70,
  project_leader: 60,
  storyteller: 50,
  community_member: 40,
  cultural_liaison: 30,
  archivist: 20,
  guest: 10
}

export interface OrganizationRoleContext {
  userId: string
  organizationId: string
  userRole: OrganizationRole | null
  hasRole: (requiredRole: OrganizationRole) => boolean
  isAdmin: boolean
  isElder: boolean
  isCulturalKeeper: boolean
  canManageUsers: boolean
  canManageContent: boolean
  canManageProjects: boolean
  tenantId: string | null
}

/**
 * Middleware to check organisation roles and permissions
 * Use this in API routes that need organisation-based access control
 */
export async function withOrganizationRole(
  request: NextRequest,
  organizationId: string,
  requiredRole?: OrganizationRole
): Promise<{ context: OrganizationRoleContext | null; error: NextResponse | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        context: null,
        error: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    // Get organisation and validate it exists
    const { data: organisation, error: orgError } = await supabase
      .from('tenants')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      return {
        context: null,
        error: NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        )
      }
    }

    // Get user's role in this organisation using SQL execution (bypasses PostgREST cache)
    const { data: roleResult, error: roleError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT get_user_organization_role('${organizationId}', '${user.id}') as user_role;`
      })

    if (roleError) {
      console.error('Error getting user organisation role:', roleError)
      return {
        context: null,
        error: NextResponse.json(
          { error: 'Failed to check user permissions' },
          { status: 500 }
        )
      }
    }

    const userRole = roleResult?.[0]?.user_role as OrganizationRole | null

    // Check if user has access to this organisation (either through role or tenant)
    if (!userRole) {
      // Check if user is in the same tenant (fallback access)
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!userProfile || userProfile.tenant_id !== organisation.tenant_id) {
        return {
          context: null,
          error: NextResponse.json(
            { error: 'Access denied: not a member of this organisation' },
            { status: 403 }
          )
        }
      }
    }

    // Check required role if specified
    if (requiredRole && userRole) {
      const hasRequiredRole = checkRoleHierarchy(userRole, requiredRole)
      if (!hasRequiredRole) {
        return {
          context: null,
          error: NextResponse.json(
            { error: `Access denied: ${requiredRole} role or higher required` },
            { status: 403 }
          )
        }
      }
    }

    // Create role context
    const context: OrganizationRoleContext = {
      userId: user.id,
      organizationId,
      userRole,
      tenantId: organisation.tenant_id,
      hasRole: (role: OrganizationRole) => {
        if (!userRole) return false
        return checkRoleHierarchy(userRole, role)
      },
      isAdmin: userRole === 'admin' || userRole === 'elder' || userRole === 'cultural_keeper',
      isElder: userRole === 'elder',
      isCulturalKeeper: userRole === 'cultural_keeper' || userRole === 'elder',
      canManageUsers: ['elder', 'cultural_keeper', 'admin', 'project_leader'].includes(userRole || ''),
      canManageContent: ['elder', 'cultural_keeper', 'admin', 'project_leader', 'storyteller'].includes(userRole || ''),
      canManageProjects: ['elder', 'cultural_keeper', 'admin', 'project_leader'].includes(userRole || '')
    }

    return { context, error: null }

  } catch (error) {
    console.error('Organization role middleware error:', error)
    return {
      context: null,
      error: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Check if user role meets or exceeds required role in hierarchy
 */
export function checkRoleHierarchy(userRole: OrganizationRole, requiredRole: OrganizationRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

/**
 * Get all roles that are equal or lower than the given role
 */
export function getRolesAtOrBelow(role: OrganizationRole): OrganizationRole[] {
  const roleLevel = ROLE_HIERARCHY[role]
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= roleLevel)
    .map(([roleName, _]) => roleName as OrganizationRole)
}

/**
 * Helper function for API routes to quickly check admin access
 */
export async function requireOrganizationAdmin(
  request: NextRequest,
  organizationId: string
): Promise<{ context: OrganizationRoleContext | null; error: NextResponse | null }> {
  return withOrganizationRole(request, organizationId, 'admin')
}

/**
 * Helper function for API routes to check any organisation membership
 */
export async function requireOrganizationMember(
  request: NextRequest,
  organizationId: string
): Promise<{ context: OrganizationRoleContext | null; error: NextResponse | null }> {
  return withOrganizationRole(request, organizationId, 'guest')
}

/**
 * Cultural governance helper: check if action requires elder approval
 */
export function requiresElderApproval(action: string, contentType?: string): boolean {
  // Define actions that require elder approval based on cultural protocols
  const elderApprovalActions = [
    'delete_story',
    'delete_transcript', 
    'modify_cultural_content',
    'share_traditional_knowledge',
    'assign_cultural_keeper_role',
    'assign_elder_role',
    'remove_elder_role',
    'access_sacred_content'
  ]
  
  return elderApprovalActions.includes(action) || 
         (contentType === 'traditional_knowledge' && action.includes('modify'))
}

/**
 * Get organisation context without role requirements (for public endpoints)
 */
export async function getOrganizationContext(
  organizationId: string
): Promise<{ organisation: any; error: NextResponse | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: organisation, error } = await supabase
      .from('tenants')
      .select('id, name, tenant_id, cultural_identity, governance_structure')
      .eq('id', organizationId)
      .single()

    if (error || !organisation) {
      return {
        organisation: null,
        error: NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        )
      }
    }

    return { organisation, error: null }

  } catch (error) {
    console.error('Get organisation context error:', error)
    return {
      organisation: null,
      error: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}