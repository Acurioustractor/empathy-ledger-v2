// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    console.log('📧 Fetching invitations for organisation:', organizationId)

    // Get all invitations for this organisation
    const { data: invitations, error } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        invited_by_profile:profiles!organization_invitations_invited_by_fkey(
          display_name,
          email
        ),
        organisation:organisations!organization_invitations_organization_id_fkey(
          name,
          slug
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching invitations:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    // Add status to each invitation
    const now = new Date()
    const processedInvitations = invitations?.map(invitation => ({
      ...invitation,
      status: invitation.used_at
        ? 'accepted'
        : new Date(invitation.expires_at) < now
        ? 'expired'
        : 'pending'
    })) || []

    console.log(`✅ Found ${processedInvitations.length} invitations`)

    return NextResponse.json({
      success: true,
      invitations: processedInvitations
    })

  } catch (error) {
    console.error('❌ Error in invitation GET:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invitations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const body = await request.json()

    console.log('📧 Creating invitation for organisation:', organizationId)

    // Validate required fields
    if (!body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Check if organisation exists
    const { data: organisation, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('profile_organizations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('profile_id', body.email) // This would need to be profile ID, we'll handle email lookup
      .single()

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from('organization_invitations')
      .select('id, expires_at, used_at')
      .eq('organization_id', organizationId)
      .eq('email', body.email.toLowerCase())
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: 'An active invitation already exists for this email' },
        { status: 409 }
      )
    }

    // Create the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email: body.email.toLowerCase(),
        role: body.role,
        invited_by: body.invited_by || null, // Should be current user's profile ID
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select(`
        *,
        organisation:organisations!organization_invitations_organization_id_fkey(
          name,
          slug
        )
      `)
      .single()

    if (inviteError) {
      console.error('❌ Error creating invitation:', inviteError)
      return NextResponse.json(
        { success: false, error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    console.log('✅ Invitation created successfully:', invitation.id)

    // TODO: See issue #23 in empathy-ledger-v2: Send invitation email here
    // await sendInvitationEmail(invitation)

    return NextResponse.json({
      success: true,
      invitation,
      message: 'Invitation created successfully'
    })

  } catch (error) {
    console.error('❌ Error in invitation POST:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}