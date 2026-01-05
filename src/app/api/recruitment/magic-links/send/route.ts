import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/recruitment/magic-links/send
 * Send a magic link via email or SMS
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      invitation_id,
      channel,
      recipient_contact,
      message
    } = body

    // Validate
    if (!invitation_id || !channel || !recipient_contact) {
      return NextResponse.json(
        { error: 'Missing required fields: invitation_id, channel, recipient_contact' },
        { status: 400 }
      )
    }

    if (!['email', 'sms'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be: email or sms' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitation_id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (!invitation.magic_link_token) {
      return NextResponse.json({ error: 'This invitation does not have a magic link' }, { status: 400 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This magic link has expired' }, { status: 400 })
    }

    // Generate the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'
    const magicLinkUrl = `${baseUrl}/auth/magic-link?token=${invitation.magic_link_token}`

    // TODO: Actually send via email/SMS service
    // if (channel === 'email') {
    //   await sendEmail({
    //     to: recipient_contact,
    //     subject: 'Your Magic Link to Share Your Story',
    //     html: `
    //       <p>${message || 'Click the link below to get started (no password needed):'}</p>
    //       <a href="${magicLinkUrl}">${magicLinkUrl}</a>
    //     `
    //   })
    // } else if (channel === 'sms') {
    //   await sendSMS({
    //     to: recipient_contact,
    //     body: `${message || 'Click to share your story:'} ${magicLinkUrl}`
    //   })
    // }

    // Update invitation record
    await supabase
      .from('invitations')
      .update({
        recipient_contact,
        last_viewed_at: new Date().toISOString() // Track when we last sent it
      })
      .eq('id', invitation_id)

    return NextResponse.json({
      success: true,
      message: `Magic link sent via ${channel}`,
      sent_to: recipient_contact,
      channel
    })
  } catch (error) {
    console.error('Error sending magic link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
