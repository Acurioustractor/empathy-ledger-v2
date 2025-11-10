import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/organizations
 *
 * Returns all organizations for super admin
 * Used by OrganizationSelector component
 *
 * BEST PRACTICE:
 * - Super admin uses service role client (bypasses RLS)
 * - Returns ALL organizations for platform management
 */
export async function GET(request: NextRequest) {
  // Verify super admin access
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    console.log('📋 Fetching all organizations (super admin)')

    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id, name, slug, created_at')
      .order('name')

    if (error) throw error

    console.log(`✅ Found ${organizations?.length || 0} organizations`)

    return NextResponse.json({
      organizations: organizations || []
    })

  } catch (error) {
    console.error('Organizations list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}
