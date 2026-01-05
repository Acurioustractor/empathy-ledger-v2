import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/consent/restore
 * Restore a withdrawn consent
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { consent_id, reason } = body

    // Validate
    if (!consent_id) {
      return NextResponse.json(
        { error: 'Missing required field: consent_id' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current consent to check if it can be restored
    const { data: currentConsent, error: fetchError } = await supabase
      .from('consents')
      .select('*')
      .eq('id', consent_id)
      .single()

    if (fetchError || !currentConsent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 })
    }

    if (currentConsent.status !== 'withdrawn') {
      return NextResponse.json({ error: 'Only withdrawn consents can be restored' }, { status: 400 })
    }

    // Restore consent
    const { data: consent, error: updateError } = await supabase
      .from('consents')
      .update({
        status: 'active',
        withdrawn_at: null,
        withdrawal_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', consent_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error restoring consent:', updateError)
      return NextResponse.json({ error: 'Failed to restore consent' }, { status: 500 })
    }

    // Create audit trail entry
    await supabase.from('consent_audit').insert({
      consent_id,
      event_type: 'modified',
      performed_by: user.id,
      performed_at: new Date().toISOString(),
      details: `Consent restored${reason ? `: ${reason}` : ''}`
    })

    return NextResponse.json({
      success: true,
      consent,
      message: 'Consent restored successfully'
    })
  } catch (error) {
    console.error('Error in restore consent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
