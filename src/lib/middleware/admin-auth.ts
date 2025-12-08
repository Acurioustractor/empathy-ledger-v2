import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ApiErrors } from '@/lib/utils/api-responses'

export interface AuthenticatedUser {
  id: string
  email: string
  tenant_roles: string[]
  tenant_id: string | null
  is_admin: boolean
  is_super_admin: boolean
}

export interface AdminAuthResult {
  user: AuthenticatedUser
  error?: undefined
  status?: undefined
}

export interface AdminAuthError {
  user?: undefined
  error: string
  status: number
}

export async function requireAdminAuth(): Promise<AdminAuthResult | AdminAuthError> {
  console.log('🔐 Admin auth middleware called')

  try {
    const supabase = createSupabaseServerClient()
    console.log('📱 Supabase client created')

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Auth user check:', user ? user.email : 'No user', authError ? authError.message : 'No error')

    if (authError || !user) {
      return { error: 'Authentication required', status: 401 }
    }

    // Get user profile with tenant roles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, tenant_roles, tenant_id')
      .eq('id', user.id)
      .single()

    console.log('👤 Profile data:', profile)

    if (profileError || !profile) {
      console.log('❌ Profile error:', profileError)
      return { error: 'User profile not found', status: 404 }
    }

    // Check if user has admin privileges via tenant_roles
    const roles = profile.tenant_roles || []
    const is_admin = roles.includes('admin') || roles.includes('super_admin')
    const is_super_admin = roles.includes('super_admin')

    console.log('👤 User roles check:', { roles, is_admin, is_super_admin })

    if (!is_admin && !is_super_admin) {
      console.log('❌ User lacks admin privileges')
      return { error: 'Admin privileges required', status: 403 }
    }

    console.log('✅ Admin authentication successful')

    return {
      user: {
        id: profile.id,
        email: profile.email,
        tenant_roles: roles,
        is_admin: is_admin,
        is_super_admin: is_super_admin,
        tenant_id: profile.tenant_id
      }
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    return { error: 'Authentication error', status: 500 }
  }
}

export async function requireSuperAdminAuth(): Promise<AdminAuthResult | AdminAuthError> {
  const authResult = await requireAdminAuth()

  if (authResult.error) {
    return authResult
  }

  if (!authResult.user.is_super_admin) {
    return { error: 'Super admin privileges required', status: 403 }
  }

  return authResult
}