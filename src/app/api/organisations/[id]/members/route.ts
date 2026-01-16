// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireOrganizationMember, requireOrganizationAdmin } from '@/lib/middleware/organization-role-middleware'



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // Organization admin check (includes authentication) - only admins can add members
    const { context, error: authError } = await requireOrganizationAdmin(request, organizationId)
    if (authError) {
      return authError
    }

    const supabase = await createSupabaseServerClient()

    const body = await request.json()

    // Get organisation to find tenant_id
    const { data: organisation } = await supabase
      .from('organizations')
      .select('tenant_id, name')
      .eq('id', organizationId)
      .single()

    if (!organisation) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Use service role client to bypass RLS for member creation
    const { createClient } = await import('@supabase/supabase-js')
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate a UUID for the profile
    const { randomUUID } = await import('crypto')
    const profileId = randomUUID()

    // Create the profile/member with only fields that exist
    const { data: member, error } = await serviceSupabase
      .from('profiles')
      .insert({
        id: profileId,
        display_name: body.display_name,
        full_name: body.full_name,
        email: body.email,
        current_role: body.current_role || 'Community Member',
        cultural_background: body.cultural_background,
        tenant_id: organisation.tenant_id,
        tenant_roles: body.tenant_roles || ['member']
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating member:', error)
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      member,
      message: `Member "${body.display_name || body.full_name}" added to ${organisation.name}`
    })

  } catch (error) {
    console.error('Error in member creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // Organization membership check (includes authentication)
    const { context, error: authError } = await requireOrganizationMember(request, organizationId)
    if (authError) {
      return authError
    }

    const supabase = await createSupabaseServerClient()

    // Get organisation to find tenant_id
    const { data: organisation } = await supabase
      .from('organizations')
      .select('tenant_id')
      .eq('id', organizationId)
      .single()

    if (!organisation) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get all members for this organisation through profile_organizations
    const { data: memberRelations, error } = await supabase
      .from('profile_organizations')
      .select(`
        profile_id,
        role,
        is_active,
        joined_at,
        profiles (
          id,
          display_name,
          full_name,
          email,
          current_role,
          cultural_background,
          tenant_roles,
          created_at,
          profile_image_url,
          avatar_url
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    // Transform the data to return just the profiles with their organisation role
    const members = memberRelations?.map(relation => ({
      ...relation.profiles,
      organization_role: relation.role,
      joined_at: relation.joined_at
    })) || []

    return NextResponse.json({
      success: true,
      members
    })

  } catch (error) {
    console.error('Error in members fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // Organization admin check (includes authentication) - only admins can remove members
    const { context, error: authError } = await requireOrganizationAdmin(request, organizationId)
    if (authError) {
      return authError
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Remove member from organisation (deactivate relationship)
    const { error: removeError } = await supabase
      .from('profile_organizations')
      .update({ is_active: false })
      .eq('organization_id', organizationId)
      .eq('profile_id', memberId)

    if (removeError) {
      console.error('Error removing member:', removeError)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    // Get member name for response
    const { data: member } = await supabase
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', memberId)
      .single()

    const memberName = member?.display_name || member?.full_name || 'Member'

    return NextResponse.json({
      success: true,
      message: `${memberName} has been removed from the organisation`
    })

  } catch (error) {
    console.error('Error in member removal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}