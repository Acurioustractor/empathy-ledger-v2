import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/consent/audit-trail
 * Get consent audit trail
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')
    const organizationId = searchParams.get('organization_id')
    const consentId = searchParams.get('consent_id')
    const eventType = searchParams.get('event_type')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build audit query
    let auditQuery = supabase
      .from('consent_audit')
      .select(`
        *,
        consents!inner(
          content_title,
          consent_type,
          storyteller_id,
          organization_id
        ),
        profiles(display_name)
      `)

    if (consentId) {
      auditQuery = auditQuery.eq('consent_id', consentId)
    }

    if (eventType && eventType !== 'all') {
      auditQuery = auditQuery.eq('event_type', eventType)
    }

    // Apply filters via consent relationship
    if (storytellerId) {
      auditQuery = auditQuery.eq('consents.storyteller_id', storytellerId)
    }
    if (organizationId) {
      auditQuery = auditQuery.eq('consents.organization_id', organizationId)
    }

    const { data: auditEvents, error: auditError } = await auditQuery
      .order('performed_at', { ascending: false })

    if (auditError) {
      console.error('Error fetching audit trail:', auditError)
      return NextResponse.json({ error: 'Failed to fetch audit trail' }, { status: 500 })
    }

    // Format events
    const formattedEvents = auditEvents?.map(event => ({
      id: event.id,
      consent_id: event.consent_id,
      event_type: event.event_type,
      content_title: event.consents?.content_title,
      consent_type: event.consents?.consent_type,
      performed_by: event.profiles?.display_name || 'Unknown',
      performed_at: event.performed_at,
      details: event.details,
      ip_address: event.ip_address
    })) || []

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('Error in audit trail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
