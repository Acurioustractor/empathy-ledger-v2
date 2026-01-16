// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔓 Using admin bypass for organizations list')

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
