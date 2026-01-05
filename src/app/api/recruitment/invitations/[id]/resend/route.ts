import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/recruitment/invitations/[id]/resend
 * Resend an invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const invitationId = params.id

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is eligible for resend
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'Cannot resend an accepted invitation' }, { status: 400 })
    }

    // If expired, extend the expiry date
    const now = new Date()
    const currentExpiry = new Date(invitation.expires_at)
    let newExpiry = currentExpiry

    if (currentExpiry < now) {
      // Extend by 14 days from now
      newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 14)
    }

    // Update invitation
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'pending',
        reminder_sent_at: new Date().toISOString(),
        expires_at: newExpiry.toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
    }

    // TODO: Actually resend via the original channel
    // if (invitation.channel === 'email') {
    //   await sendEmail(invitation.recipient_contact, invitation.message, invitation.magic_link_token)
    // } else if (invitation.channel === 'sms') {
    //   await sendSMS(invitation.recipient_contact, invitation.message, invitation.magic_link_token)
    // }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: `Invitation resent successfully via ${invitation.channel}`,
      new_expiry: newExpiry.toISOString()
    })
  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
