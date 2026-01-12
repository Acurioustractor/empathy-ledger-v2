// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = (page - 1) * limit

    console.log(`👥 Fetching storytellers for organization: ${orgId}`)

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, tenant_id')
      .eq('id', orgId)
      .single()

    if (orgError || !organization) {
      console.error('Organization not found:', orgId, orgError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // First try: Get storytellers via storyteller_organizations junction table
    const { data: storytellerOrgs, error: soError } = await supabase
      .from('storyteller_organizations')
      .select(`
        storyteller_id,
        role,
        storyteller:storytellers(
          id,
          display_name,
          email,
          bio,
          cultural_background,
          avatar_url,
          is_active,
          is_elder,
          is_featured,
          location,
          created_at
        )
      `)
      .eq('organization_id', orgId)

    let storytellers: any[] = []
    let totalCount = 0

    if (storytellerOrgs && !soError && storytellerOrgs.length > 0) {
      // Use storyteller_organizations data
      storytellers = storytellerOrgs
        .filter(so => so.storyteller) // Filter out null storytellers
        .map(so => ({
          id: so.storyteller.id,
          displayName: so.storyteller.display_name || so.storyteller.email,
          email: so.storyteller.email,
          bio: so.storyteller.bio || '',
          culturalBackground: so.storyteller.cultural_background || '',
          isElder: so.storyteller.is_elder || false,
          isFeatured: so.storyteller.is_featured || false,
          profileImageUrl: so.storyteller.avatar_url,
          createdAt: so.storyteller.created_at,
          role: so.role || 'storyteller',
          location: so.storyteller.location
        }))
      totalCount = storytellers.length
      console.log(`✅ Found ${storytellers.length} storytellers via storyteller_organizations`)
    } else {
      // Fallback: Try profiles table with tenant_id
      console.log('🔄 Falling back to profiles table')
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
        .eq('tenant_id', organization.tenant_id)
        .eq('is_storyteller', true)
        .range(offset, offset + limit - 1)
        .order('display_name', { ascending: true })

      if (error) {
        console.error('Error fetching storytellers from profiles:', error)
        return NextResponse.json(
          { error: 'Failed to fetch storytellers' },
          { status: 500 }
        )
      }

      storytellers = (profiles || []).map(profile => ({
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
      totalCount = count || 0
    }

    console.log(`✅ Found ${storytellers.length} storytellers for ${organization.name} (total: ${totalCount})`)

    return NextResponse.json({
      storytellers,
      organizationName: organization.name,
      organizationId: organization.id,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error fetching organization storytellers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
