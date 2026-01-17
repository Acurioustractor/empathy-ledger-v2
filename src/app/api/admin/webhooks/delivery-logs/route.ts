import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth/api-auth'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/admin/webhooks/logs
 *
 * Fetches webhook delivery logs for admin dashboard.
 * Requires admin authentication.
 */
export async function GET(request: NextRequest) {
  // Authenticate
  const { user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseClient()

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '100')
  const status = searchParams.get('status') // pending, delivered, failed
  const siteId = searchParams.get('siteId')

  // Build query
  let query = supabase
    .from('webhook_delivery_logs')
    .select(`
      id,
      site_id,
      event_type,
      payload,
      status,
      status_code,
      error_message,
      retryable,
      retry_count,
      delivered_at,
      created_at,
      syndication_sites (
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  if (siteId) {
    query = query.eq('site_id', siteId)
  }

  const { data: logs, error: logsError } = await query

  if (logsError) {
    console.error('Error fetching webhook logs:', logsError)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }

  // Get stats
  const { data: statsData } = await supabase
    .from('webhook_delivery_logs')
    .select('status')

  const stats = {
    total: statsData?.length || 0,
    delivered: statsData?.filter(l => l.status === 'delivered').length || 0,
    failed: statsData?.filter(l => l.status === 'failed').length || 0,
    pending: statsData?.filter(l => l.status === 'pending').length || 0
  }

  // Transform logs to include site info
  const transformedLogs = (logs || []).map(log => ({
    ...log,
    site: log.syndication_sites ? {
      name: (log.syndication_sites as any).name,
      slug: (log.syndication_sites as any).slug
    } : null,
    syndication_sites: undefined
  }))

  return NextResponse.json({
    logs: transformedLogs,
    stats,
    total: logs?.length || 0
  })
}
