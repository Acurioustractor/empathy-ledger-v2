import { NextRequest, NextResponse } from 'next/server'

import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'

import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Require super admin authentication
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = (page - 1) * limit

    console.log(`👥 Fetching storytellers for organization: ${params.orgId}`)

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, tenant_id')
      .eq('id', params.orgId)
      .single()

    if (orgError || !organization) {
      console.error('❌ Organization not found:', params.orgId, orgError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get profiles filtered by tenant_id (organization's tenant)
    const { data: profiles, error, count } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        full_name,
        bio,
        cultural_background,
        profile_image_url,
        created_at,
        tenant_roles,
        is_elder,
        is_featured
      `, { count: 'exact' })
      .eq('tenant_id', organization.tenant_id) // 🔒 CRITICAL: Tenant filter
      .contains('tenant_roles', ['storyteller']) // Only storytellers
      .range(offset, offset + limit - 1)
      .order('display_name', { ascending: true })

    if (error) {
      console.error('❌ Error fetching storytellers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch storytellers' },
        { status: 500 }
      )
    }

    // Transform profiles to match expected format
    const storytellers = (profiles || []).map(profile => ({
      id: profile.id,
      displayName: profile.display_name || profile.full_name || profile.email,
      email: profile.email,
      bio: profile.bio || '',
      culturalBackground: profile.cultural_background || '',
      isElder: profile.is_elder || false,
      isFeatured: profile.is_featured || false,
      profileImageUrl: profile.profile_image_url,
      createdAt: profile.created_at,
      tenantRoles: profile.tenant_roles || []
    }))

    console.log(`✅ Found ${storytellers.length} storytellers for ${organization.name} (total: ${count})`)

    return NextResponse.json({
      storytellers,
      organizationName: organization.name,
      organizationId: organization.id,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('❌ Unexpected error fetching organization storytellers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
