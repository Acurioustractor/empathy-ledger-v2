// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireOrganizationAdmin } from '@/lib/middleware/organization-role-middleware'



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // Organization admin check (includes authentication) - only admins can promote to storyteller
    const { context, error: authError } = await requireOrganizationAdmin(request, organizationId)
    if (authError) {
      return authError
    }

    const { profileId } = await request.json()

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Get the profile to create storyteller from
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Simply add 'storyteller' to tenant_roles
    const currentRoles = profile.tenant_roles || []

    if (currentRoles.includes('storyteller')) {
      return NextResponse.json({
        success: true,
        message: 'Profile is already a storyteller'
      })
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tenant_roles: [...currentRoles, 'storyteller']
      })
      .eq('id', profileId)

    if (updateError) {
      console.error('Error updating tenant_roles:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile roles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Member promoted to storyteller successfully!'
    })
  } catch (error) {
    console.error('Error in storyteller creation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
