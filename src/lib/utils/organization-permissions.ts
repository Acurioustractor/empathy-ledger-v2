import { createClient } from '@supabase/supabase-js'
import { adminConfig } from '@/lib/config/admin-config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface OrganizationPermissions {
  canView: boolean
  canEdit: boolean
  canManageMembers: boolean
  canInviteMembers: boolean
  canManageProjects: boolean
  canManageContent: boolean
  role: string | null
}

export async function checkOrganizationPermissions(
  organizationId: string,
  userId: string
): Promise<OrganizationPermissions> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Check for development super admin bypass first
    if (adminConfig.isDevelopmentSuperAdmin()) {
      console.log('🔧 DEVELOPMENT MODE: Granting super admin permissions')
      return {
        canView: true,
        canEdit: true,
        canManageMembers: true,
        canInviteMembers: true,
        canManageProjects: true,
        canManageContent: true,
        role: 'development_super_admin'
      }
    }

    // ALWAYS check for super admin access first
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_roles, email')
      .eq('id', userId)
      .single()

    // Super admin check using centralized admin config
    const isSuperAdmin =
      profile?.tenant_roles?.includes('super_admin') ||
      profile?.tenant_roles?.includes('admin') ||
      adminConfig.isSuperAdmin(profile?.email)

    if (isSuperAdmin) {
      return {
        canView: true,
        canEdit: true,
        canManageMembers: true,
        canInviteMembers: true,
        canManageProjects: true,
        canManageContent: true,
        role: 'super_admin'
      }
    }

    // Get user's membership in this organisation
    const { data: membership } = await supabase
      .from('profile_organizations')
      .select('role, is_active')
      .eq('organization_id', organizationId)
      .eq('profile_id', userId)
      .single()

    if (!membership || !membership.is_active) {
      return {
        canView: false,
        canEdit: false,
        canManageMembers: false,
        canInviteMembers: false,
        canManageProjects: false,
        canManageContent: false,
        role: null
      }
    }

    const role = membership.role
    const isAdmin = role === 'admin' || role === 'owner'
    const isMember = role === 'member'

    return {
      canView: true,
      canEdit: isAdmin,
      canManageMembers: isAdmin,
      canInviteMembers: isAdmin,
      canManageProjects: isAdmin || isMember,
      canManageContent: isAdmin || isMember,
      role
    }

  } catch (error) {
    console.error('Error checking organisation permissions:', error)
    return {
      canView: false,
      canEdit: false,
      canManageMembers: false,
      canInviteMembers: false,
      canManageProjects: false,
      canManageContent: false,
      role: null
    }
  }
}

export async function requireOrganizationAdmin(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const permissions = await checkOrganizationPermissions(organizationId, userId)
  return permissions.canEdit
}

export async function requireOrganizationMember(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const permissions = await checkOrganizationPermissions(organizationId, userId)
  return permissions.canView
}

export function getOrganizationSlugByUrl(url: string): string | null {
  // Extract organisation slug from URL patterns like /org/[slug] or /organisations/[id]
  const orgMatch = url.match(/\/org\/([^\/]+)/)
  return orgMatch ? orgMatch[1] : null
}

export function getOrganizationIdByUrl(url: string): string | null {
  // Extract organisation ID from URL patterns like /organisations/[id]
  const orgMatch = url.match(/\/organisations\/([^\/]+)/)
  return orgMatch ? orgMatch[1] : null
}