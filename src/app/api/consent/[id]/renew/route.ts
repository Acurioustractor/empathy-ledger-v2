import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/consent/[id]/renew
 * Renew a consent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { renewal_period, acknowledgement } = body
    const consentId = params.id

    // Validate
    if (!renewal_period || !acknowledgement) {
      return NextResponse.json(
        { error: 'Missing required fields: renewal_period, acknowledgement' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate new expiry date
    let expiresAt: string | null = null
    if (renewal_period !== 'indefinite') {
      const years = parseInt(renewal_period.replace('years', '').replace('year', ''))
      const newExpiry = new Date()
      newExpiry.setFullYear(newExpiry.getFullYear() + years)
      expiresAt = newExpiry.toISOString()
    }

    // Update consent
    const { data: consent, error: updateError } = await supabase
      .from('consents')
      .update({
        expires_at: expiresAt,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', consentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error renewing consent:', updateError)
      return NextResponse.json({ error: 'Failed to renew consent' }, { status: 500 })
    }

    // Create audit trail entry
    await supabase.from('consent_audit').insert({
      consent_id: consentId,
      event_type: 'renewed',
      performed_by: user.id,
      performed_at: new Date().toISOString(),
      details: `Renewed for ${renewal_period}`
    })

    return NextResponse.json({
      success: true,
      consent,
      message: 'Consent renewed successfully'
    })
  } catch (error) {
    console.error('Error in renew consent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
