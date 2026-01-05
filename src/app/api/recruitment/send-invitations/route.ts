import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/recruitment/send-invitations
 * Send invitations via email, SMS, magic link, or QR code
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      organization_id,
      project_id,
      channel,
      recipients,
      message,
      expiry_days,
      require_consent
    } = body

    // Validate required fields
    if (!organization_id || !channel || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, channel, recipients' },
        { status: 400 }
      )
    }

    if (!['email', 'sms', 'magic_link', 'qr_code'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be: email, sms, magic_link, or qr_code' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiry_days || 14)) // Default 14 days

    // Create invitation records
    const invitationPromises = recipients.map(async (recipient: any) => {
      // Generate unique token for magic links
      const magicLinkToken = channel === 'magic_link'
        ? `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : null

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id,
          project_id: project_id || null,
          channel,
          recipient_name: recipient.name || null,
          recipient_contact: recipient.value || recipient.email || recipient.phone,
          status: 'pending',
          message: message || null,
          sent_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          magic_link_token: magicLinkToken,
          require_consent: require_consent !== undefined ? require_consent : true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        throw error
      }

      // TODO: Actually send email/SMS via service (Resend, SendGrid, Twilio)
      // For now, we just create the invitation record
      // Integration would happen here:
      // if (channel === 'email') {
      //   await sendEmail(recipient.value, message, magicLinkToken)
      // } else if (channel === 'sms') {
      //   await sendSMS(recipient.value, message, magicLinkToken)
      // }

      return data
    })

    const invitations = await Promise.all(invitationPromises)

    return NextResponse.json({
      success: true,
      sent: invitations.length,
      invitations,
      message: `${invitations.length} invitation(s) created successfully`
    })
  } catch (error) {
    console.error('Error sending invitations:', error)
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 })
  }
}
