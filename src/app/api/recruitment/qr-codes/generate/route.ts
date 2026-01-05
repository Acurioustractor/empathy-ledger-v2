import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/recruitment/qr-codes/generate
 * Generate a QR code for event-based recruitment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      organization_id,
      project_id,
      event_name,
      event_date,
      event_location,
      size,
      expiry_days,
      require_consent
    } = body

    // Validate
    if (!organization_id || !event_name) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, event_name' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate unique token
    const token = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calculate expiry
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiry_days || 30)) // Default 30 days for QR codes

    // Generate the URL that the QR code will point to
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'
    const qrUrl = `${baseUrl}/recruitment/qr/${token}`

    // Generate QR code using a simple data URL approach
    // In production, you'd use a library like 'qrcode' npm package
    // For now, we'll create a placeholder that can be replaced with actual QR generation
    const qrSize = size || 256

    // TODO: Replace with actual QR code generation using 'qrcode' library
    // import QRCode from 'qrcode'
    // const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { width: qrSize })

    // For now, create a placeholder SVG QR code
    const qrCodeDataUrl = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${qrSize}" height="${qrSize}">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16" fill="black">
          QR Code Placeholder
        </text>
        <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-size="12" fill="gray">
          ${event_name}
        </text>
      </svg>
    `)}`

    // Create invitation record
    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert({
        organization_id,
        project_id: project_id || null,
        channel: 'qr_code',
        recipient_name: event_name,
        recipient_contact: event_location || null,
        status: 'pending',
        message: JSON.stringify({
          event_name,
          event_date: event_date || null,
          event_location: event_location || null
        }),
        sent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        magic_link_token: token,
        qr_code_data: qrCodeDataUrl,
        qr_code_scans: 0,
        require_consent: require_consent !== undefined ? require_consent : true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating QR code:', insertError)
      return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invitation_id: invitation.id,
      qr_code_data: qrCodeDataUrl,
      qr_url: qrUrl,
      token,
      event_name,
      event_date: event_date || null,
      event_location: event_location || null,
      expires_at: expiresAt.toISOString(),
      message: 'QR code generated successfully'
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
