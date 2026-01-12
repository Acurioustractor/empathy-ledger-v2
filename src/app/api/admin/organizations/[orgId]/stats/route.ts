// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getOrganizationDashboardStats } from '@/lib/multi-tenant/queries'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/admin/organizations/[orgId]/stats
 *
 * Returns stats for specific organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔓 Using admin bypass for organization stats')

  try {
    console.log(`📊 Fetching stats for organization: ${orgId} (super admin)`)

    // Get organization info
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('id', orgId)
      .single()

    if (orgError) throw orgError

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get stats using helper function (automatically filters by organization_id)
    const stats = await getOrganizationDashboardStats(supabase, orgId)

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
