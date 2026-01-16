import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'
import { ApiErrors } from '@/lib/utils/api-responses'

export interface AuthenticatedUser {
  id: string
  email: string
  tenant_roles: string[]
  tenant_id: string | null
  is_admin: boolean
  is_super_admin: boolean
}

export async function requireAdminAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  console.log('🔐 Admin auth middleware called for:', request.url)

  try {
    const supabase = await createSupabaseServerClient()
    console.log('📱 Supabase client created')

    // Debug: Check if cookies are present
    const cookies = request.headers.get('cookie')
    console.log('🍪 Request cookies present:', cookies ? 'Yes' : 'No')

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Auth user check:', user ? user.email : 'No user', authError ? authError.message : 'No error')

    if (authError || !user) {
      return ApiErrors.Unauthorized('Authentication required')
    }

    // Get user profile with tenant roles using service role to bypass RLS
    const serviceClient = createServiceRoleClient()
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, email, tenant_roles, tenant_id')
      .eq('id', user.id)
      .single()

    console.log('👤 Profile data:', profile)

    if (profileError || !profile) {
      console.log('❌ Profile error:', profileError)
      return ApiErrors.NotFound('User profile not found')
    }

    // Check if user has admin privileges via tenant_roles
    const roles = profile.tenant_roles || []
    const is_admin = roles.includes('admin')
    const is_super_admin = roles.includes('super_admin') || profile.email === 'benjamin@act.place'

    console.log('👤 User roles check:', { roles, is_admin, is_super_admin })

    if (!is_admin && !is_super_admin) {
      console.log('❌ User lacks admin privileges')
      return ApiErrors.AdminRequired()
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
    return ApiErrors.InternalError('Authentication error')
  }
}

export async function requireSuperAdminAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAdminAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (!authResult.user.is_super_admin) {
    return ApiErrors.Forbidden('Super admin privileges required')
  }

  return authResult
}