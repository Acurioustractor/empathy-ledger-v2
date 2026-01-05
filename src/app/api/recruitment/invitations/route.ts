import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/recruitment/invitations
 * Get all invitations with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const channel = searchParams.get('channel')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('invitations')
      .select('*')

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId)
    }

    if (channel && channel !== 'all') {
      query = query.eq('channel', channel)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: invitations, error: invitationsError } = await query
      .order('sent_at', { ascending: false })

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    // Apply search filter in memory (since we can't do OR queries easily in Supabase)
    let filtered = invitations || []
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(inv =>
        inv.recipient_name?.toLowerCase().includes(searchLower) ||
        inv.recipient_contact?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate summary stats
    const stats = {
      total: filtered.length,
      pending: filtered.filter(i => i.status === 'pending').length,
      accepted: filtered.filter(i => i.status === 'accepted').length,
      declined: filtered.filter(i => i.status === 'declined').length,
      expired: filtered.filter(i => i.status === 'expired').length,
      byChannel: {
        email: filtered.filter(i => i.channel === 'email').length,
        sms: filtered.filter(i => i.channel === 'sms').length,
        magic_link: filtered.filter(i => i.channel === 'magic_link').length,
        qr_code: filtered.filter(i => i.channel === 'qr_code').length,
      }
    }

    return NextResponse.json({
      invitations: filtered,
      stats
    })
  } catch (error) {
    console.error('Error in invitations list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
