// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireOrganizationAdmin } from '@/lib/middleware/organization-role-middleware'



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; storytellerId: string }> }
) {
  try {
    const { id: organizationId, storytellerId } = await params

    // Organization admin check (includes authentication) - only admins can remove storytellers
    const { context, error: authError } = await requireOrganizationAdmin(request, organizationId)
    if (authError) {
      return authError
    }

    console.log('🗑️ Removing storyteller:', storytellerId, 'from organisation:', organizationId)

    const supabase = await createSupabaseServerClient()

    // Get organisation details
    const { data: organisation, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      console.error('❌ Organization not found:', orgError?.message)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get storyteller details for response
    const { data: storyteller, error: storytellerError } = await supabase
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', storytellerId)
      .single()

    if (storytellerError || !storyteller) {
      console.error('❌ Storyteller not found:', storytellerError?.message)
      return NextResponse.json(
        { success: false, error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    const storytellerName = storyteller.display_name || storyteller.full_name || 'Storyteller'

    // Remove storyteller role from tenant_roles array
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('tenant_roles')
      .eq('id', storytellerId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching current profile:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch storyteller profile' },
        { status: 500 }
      )
    }

    // Remove 'storyteller' from tenant_roles array
    const currentRoles = currentProfile?.tenant_roles || []
    const updatedRoles = currentRoles.filter((role: string) => role !== 'storyteller')

    // Update the profile to remove storyteller role
    // Note: We keep the tenant_id even if they have no roles to avoid constraint violations
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tenant_roles: updatedRoles
      })
      .eq('id', storytellerId)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to remove storyteller role' },
        { status: 500 }
      )
    }

    // Also remove from any profile_organizations relationships for this org
    const { error: orgRelationError } = await supabase
      .from('profile_organizations')
      .update({ is_active: false })
      .eq('profile_id', storytellerId)
      .eq('organization_id', organizationId)

    if (orgRelationError) {
      console.log('⚠️ Warning: Could not update profile_organizations (may not exist):', orgRelationError)
      // This is not critical as storytellers might not have formal org relationships
    }

    console.log('✅ Successfully removed storyteller role from:', storytellerName)

    return NextResponse.json({
      success: true,
      message: `${storytellerName} has been removed from ${organisation.name}`
    })

  } catch (error) {
    console.error('❌ Error removing storyteller:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove storyteller',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}