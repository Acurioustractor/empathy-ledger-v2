import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/consent/stats
 * Get consent dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')
    const organizationId = searchParams.get('organization_id')

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

    const { data: consents, error: consentsError } = await query

    if (consentsError) {
      console.error('Error fetching consents:', consentsError)
      return NextResponse.json({ error: 'Failed to fetch consent stats' }, { status: 500 })
    }

    // Calculate expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringCount = consents?.filter(c =>
      c.status === 'active' &&
      c.expires_at &&
      new Date(c.expires_at) <= thirtyDaysFromNow &&
      new Date(c.expires_at) > new Date()
    ).length || 0

    // Calculate stats
    const stats = {
      total: consents?.length || 0,
      active: consents?.filter(c => c.status === 'active').length || 0,
      withdrawn: consents?.filter(c => c.status === 'withdrawn').length || 0,
      expired: consents?.filter(c => c.status === 'expired').length || 0,
      expiringThisMonth: expiringCount,
      byType: {
        story: consents?.filter(c => c.consent_type === 'story').length || 0,
        photo: consents?.filter(c => c.consent_type === 'photo').length || 0,
        ai: consents?.filter(c => c.consent_type === 'ai').length || 0,
        sharing: consents?.filter(c => c.consent_type === 'sharing').length || 0,
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in consent stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
