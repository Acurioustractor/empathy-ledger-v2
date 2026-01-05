import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/consent/all
 * Get all consents with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')
    const organizationId = searchParams.get('organization_id')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

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
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (type && type !== 'all') {
      query = query.eq('consent_type', type)
    }

    const { data: consents, error: consentsError } = await query.order('granted_at', { ascending: false })

    if (consentsError) {
      console.error('Error fetching consents:', consentsError)
      return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 })
    }

    // Apply search filter
    let filteredConsents = consents || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredConsents = filteredConsents.filter(c =>
        c.content_title?.toLowerCase().includes(searchLower) ||
        c.purpose?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ consents: filteredConsents })
  } catch (error) {
    console.error('Error in consent all:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
