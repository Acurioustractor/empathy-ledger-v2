export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getDashboardAnalytics } from '@/lib/services/organization-dashboard.service'

interface OrganizationData {
  id: string
  name: string
  tenant_id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = createSupabaseServerClient()

    // Get organization to verify it exists and get tenant_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: orgError } = await (supabase as any)
      .from('organizations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    const organization = data as OrganizationData | null

    if (orgError || !organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get enhanced dashboard analytics
    const analytics = await getDashboardAnalytics(organizationId, organization.tenant_id)

    return NextResponse.json({
      success: true,
      data: analytics,
      organization: {
        id: organization.id,
        name: organization.name
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    )
  }
}
