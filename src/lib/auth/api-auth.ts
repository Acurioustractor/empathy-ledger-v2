import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { adminConfig } from '@/lib/config/admin-config'
import type { User } from '@supabase/supabase-js'

interface AuthResult {
  user: User | null
  error: string | null
}

/**
 * Get authenticated user from session cookies
 * Use this in API routes to verify the request is from an authenticated user
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.log('🔐 Auth check failed:', error.message)
      return { user: null, error: error.message }
    }

    if (!user) {
      return { user: null, error: 'Not authenticated' }
    }

    return { user, error: null }
  } catch (error) {
    console.error('🔐 Auth check exception:', error)
    return { user: null, error: 'Authentication check failed' }
  }
}

/**
 * Check if user is a super admin (by email)
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  return adminConfig.isSuperAdmin(email ?? null)
}

/**
 * Check if user has admin access (super admin or org admin)
 */
export async function checkAdminStatus(userId: string, email: string | null | undefined): Promise<boolean> {
  // Check super admin by email first
  if (isSuperAdmin(email)) {
    return true
  }

  // TODO: Check org admin roles from database
  // const supabase = await createSupabaseServerClient()
  // const { data: roles } = await supabase
  //   .from('organization_roles')
  //   .select('role')
  //   .eq('user_id', userId)
  //   .eq('role', 'admin')
  // return roles && roles.length > 0

  return false
}

/**
 * Verify user can access a specific storyteller's data
 * Returns true if:
 * - User is accessing their own data
 * - User is a super admin
 * - User is an org admin with access to the storyteller (future)
 */
export async function canAccessStoryteller(
  userId: string,
  userEmail: string | null | undefined,
  storytellerId: string
): Promise<{ allowed: boolean; reason?: string }> {
  // User can always access their own data
  if (userId === storytellerId) {
    return { allowed: true }
  }

  // Super admins can access any storyteller
  if (isSuperAdmin(userEmail)) {
    return { allowed: true }
  }

  // TODO: Check if user is org admin with access to this storyteller
  // This would check organization_roles + storyteller's organization membership

  return {
    allowed: false,
    reason: 'You can only access your own dashboard'
  }
}
