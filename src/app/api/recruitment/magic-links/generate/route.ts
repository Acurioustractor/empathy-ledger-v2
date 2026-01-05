import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/recruitment/magic-links/generate
 * Generate a magic link for passwordless authentication
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      organization_id,
      project_id,
      channel,
      recipient_name,
      recipient_contact,
      expiry_days,
      require_consent
    } = body

    // Validate
    if (!organization_id || !channel) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, channel' },
        { status: 400 }
      )
    }

    if (!['standalone', 'email', 'sms'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be: standalone, email, or sms' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate cryptographically secure token
    const token = `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`

    // Calculate expiry
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiry_days || 7)) // Default 7 days for magic links

    // Create invitation record
    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert({
        organization_id,
        project_id: project_id || null,
        channel: 'magic_link',
        recipient_name: recipient_name || null,
        recipient_contact: recipient_contact || null,
        status: 'pending',
        sent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        magic_link_token: token,
        require_consent: require_consent !== undefined ? require_consent : true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating magic link:', insertError)
      return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 })
    }

    // Generate the actual URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'
    const magicLinkUrl = `${baseUrl}/auth/magic-link?token=${token}`

    return NextResponse.json({
      success: true,
      invitation_id: invitation.id,
      magic_link: magicLinkUrl,
      token,
      expires_at: expiresAt.toISOString(),
      message: 'Magic link generated successfully'
    })
  } catch (error) {
    console.error('Error in generate magic link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
