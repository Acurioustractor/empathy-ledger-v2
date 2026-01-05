import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/consent/[id]/withdraw
 * Withdraw a consent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { reason, understanding } = body
    const consentId = params.id

    // Validate
    if (!understanding) {
      return NextResponse.json(
        { error: 'Understanding checkbox must be checked' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update consent
    const { data: consent, error: updateError } = await supabase
      .from('consents')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
        withdrawal_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', consentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error withdrawing consent:', updateError)
      return NextResponse.json({ error: 'Failed to withdraw consent' }, { status: 500 })
    }

    // Create audit trail entry
    await supabase.from('consent_audit').insert({
      consent_id: consentId,
      event_type: 'withdrawn',
      performed_by: user.id,
      performed_at: new Date().toISOString(),
      details: reason || 'No reason provided'
    })

    // TODO: Handle content restriction based on consent type
    // - If story consent: restrict story access
    // - If photo consent: remove photos from display
    // - If AI consent: stop AI processing
    // - If sharing consent: stop external sharing

    return NextResponse.json({
      success: true,
      consent,
      message: 'Consent withdrawn successfully'
    })
  } catch (error) {
    console.error('Error in withdraw consent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
