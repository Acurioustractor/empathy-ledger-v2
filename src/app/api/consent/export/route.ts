import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/consent/export
 * Export consent data to CSV
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')
    const organizationId = searchParams.get('organization_id')
    const dateRange = searchParams.get('date_range') || 'all'

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase.from('consents').select('*')

    if (storytellerId) {
      query = query.eq('storyteller_id', storytellerId)
    }
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const daysAgo = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)
      query = query.gte('granted_at', startDate.toISOString())
    }

    const { data: consents, error: consentsError } = await query.order('granted_at', { ascending: false })

    if (consentsError) {
      console.error('Error fetching consents for export:', consentsError)
      return NextResponse.json({ error: 'Failed to export consents' }, { status: 500 })
    }

    // Generate CSV
    const headers = ['ID', 'Type', 'Content Title', 'Purpose', 'Status', 'Granted At', 'Expires At', 'Withdrawn At', 'Withdrawal Reason']
    const rows = consents?.map(c => [
      c.id,
      c.consent_type,
      c.content_title || '',
      c.purpose || '',
      c.status,
      c.granted_at,
      c.expires_at || '',
      c.withdrawn_at || '',
      c.withdrawal_reason || ''
    ]) || []

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="consents-export-${Date.now()}.csv"`
      }
    })
  } catch (error) {
    console.error('Error in consent export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
