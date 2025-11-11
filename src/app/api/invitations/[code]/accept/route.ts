// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: inviteCode } = await params
    const body = await request.json()

    console.log('🎯 Accepting invitation with code:', inviteCode)

    // Find the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organisation:organisations!organization_invitations_organization_id_fkey(
          id,
          name,
          slug,
          tenant_id
        )
      `)
      .eq('invite_code', inviteCode)
      .is('used_at', null)
      .single()

    if (inviteError || !invitation) {
      console.error('❌ Invitation not found or already used:', inviteError)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Get or create user profile
    let profileId = body.profile_id

    if (!profileId && body.email) {
      // Look up profile by email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', body.email.toLowerCase())
        .single()

      if (existingProfile) {
        profileId = existingProfile.id
      } else {
        // Create new profile if needed (this would typically happen during signup)
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email: invitation.email,
            display_name: body.display_name || invitation.email.split('@')[0],
            tenant_id: invitation.organisation.tenant_id,
            tenant_roles: ['member'],
            is_storyteller: invitation.role === 'storyteller',
            onboarding_completed: false
          })
          .select('id')
          .single()

        if (profileError) {
          console.error('❌ Error creating profile:', profileError)
          return NextResponse.json(
            { success: false, error: 'Failed to create user profile' },
            { status: 500 }
          )
        }

        profileId = newProfile.id
      }
    }

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('profile_organizations')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('profile_id', profileId)
      .single()

    if (existingMembership) {
      // Mark invitation as used even if already a member
      await supabase
        .from('organization_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitation.id)

      return NextResponse.json(
        { success: false, error: 'User is already a member of this organisation' },
        { status: 409 }
      )
    }

    // Create organisation membership
    const { error: membershipError } = await supabase
      .from('profile_organizations')
      .insert({
        profile_id: profileId,
        organization_id: invitation.organization_id,
        role: invitation.role,
        joined_at: new Date().toISOString(),
        is_active: true
      })

    if (membershipError) {
      console.error('❌ Error creating membership:', membershipError)
      return NextResponse.json(
        { success: false, error: 'Failed to create organisation membership' },
        { status: 500 }
      )
    }

    // Mark invitation as used
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('❌ Error updating invitation:', updateError)
      // Don't fail the request for this, membership was created successfully
    }

    console.log('✅ Invitation accepted successfully')

    return NextResponse.json({
      success: true,
      organisation: invitation.organisation,
      role: invitation.role,
      message: `Successfully joined ${invitation.organisation.name}!`
    })

  } catch (error) {
    console.error('❌ Error accepting invitation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to accept invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: inviteCode } = await params

    console.log('🔍 Checking invitation with code:', inviteCode)

    // Find the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        used_at,
        created_at,
        organisation:organisations!organization_invitations_organization_id_fkey(
          id,
          name,
          slug,
          description,
          logo_url
        ),
        invited_by_profile:profiles!organization_invitations_invited_by_fkey(
          display_name
        )
      `)
      .eq('invite_code', inviteCode)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check invitation status
    const now = new Date()
    const status = invitation.used_at
      ? 'accepted'
      : new Date(invitation.expires_at) < now
      ? 'expired'
      : 'valid'

    return NextResponse.json({
      success: true,
      invitation: {
        ...invitation,
        status
      }
    })

  } catch (error) {
    console.error('❌ Error checking invitation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}