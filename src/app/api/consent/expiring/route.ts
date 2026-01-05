import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/consent/expiring
 * Get consents expiring soon
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')
    const organizationId = searchParams.get('organization_id')
    const days = parseInt(searchParams.get('days') || '30')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date range
    const now = new Date()
    const expiryThreshold = new Date()
    expiryThreshold.setDate(expiryThreshold.getDate() + days)

    // Build query
    let query = supabase
      .from('consents')
      .select('*')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .gte('expires_at', now.toISOString())
      .lte('expires_at', expiryThreshold.toISOString())

    if (storytellerId) {
      query = query.eq('storyteller_id', storytellerId)
    }
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: consents, error: consentsError } = await query.order('expires_at', { ascending: true })

    if (consentsError) {
      console.error('Error fetching expiring consents:', consentsError)
      return NextResponse.json({ error: 'Failed to fetch expiring consents' }, { status: 500 })
    }

    return NextResponse.json({ consents: consents || [] })
  } catch (error) {
    console.error('Error in consent expiring:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
