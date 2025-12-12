import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { smsService } from '@/lib/services/sms.service'

export const dynamic = 'force-dynamic'

interface SendSMSRequest {
  invitationId: string
  phoneNumber?: string // Override phone number
}

/**
 * POST /api/invitations/send-sms
 *
 * Send the magic link for an invitation via SMS.
 * If the invitation already has a phone number, uses that.
 * Can override with phoneNumber in request body.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SendSMSRequest = await request.json()
    const { invitationId, phoneNumber: overridePhone } = body

    if (!invitationId) {
      return NextResponse.json(
        { error: 'invitationId is required' },
        { status: 400 }
      )
    }

    // Fetch invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('story_review_invitations')
      .select(`
        id,
        token,
        storyteller_name,
        storyteller_phone,
        expires_at,
        story_id,
        stories:story_id (
          title,
          organization_id,
          organisations:organization_id (
            name
          )
        )
      `)
      .eq('id', invitationId)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Get phone number
    const phoneNumber = overridePhone || invitation.storyteller_phone
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'No phone number available. Provide phoneNumber in request.' },
        { status: 400 }
      )
    }

    // Build magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
    const magicLinkUrl = `${baseUrl}/auth/magic?token=${invitation.token}`

    // Get organization name if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const story = invitation.stories as any
    const organizationName = story?.organisations?.name

    // Send SMS
    const result = await smsService.sendMagicLink({
      to: phoneNumber,
      storytellerName: invitation.storyteller_name,
      magicLinkUrl,
      organizationName
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      )
    }

    // Update invitation record with sent info
    await supabase
      .from('story_review_invitations')
      .update({
        sent_via: 'sms',
        sent_at: new Date().toISOString(),
        storyteller_phone: phoneNumber // Update if override was used
      })
      .eq('id', invitationId)

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') // Mask middle digits
    })

  } catch (error) {
    console.error('Send SMS error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
