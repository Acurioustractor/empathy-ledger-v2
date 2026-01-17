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
 * POST /api/admin/webhooks/test
 *
 * Sends a test webhook to a syndication site.
 * Requires admin authentication.
 *
 * Body: { siteId: string }
 */
export async function POST(request: NextRequest) {
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

  const body = await request.json().catch(() => ({}))
  const { siteId } = body

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
  }

  // Get site info
  const { data: site, error: siteError } = await supabase
    .from('syndication_sites')
    .select('id, name, slug, webhook_url, webhook_secret')
    .eq('id', siteId)
    .single()

  if (siteError || !site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  if (!site.webhook_url) {
    return NextResponse.json({ error: 'Site has no webhook URL configured' }, { status: 400 })
  }

  // Send test webhook
  const { sendWebhook } = await import('@/lib/webhooks/syndication-webhooks')

  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    site: {
      id: site.id,
      name: site.name,
      slug: site.slug
    },
    message: 'This is a test webhook from Empathy Ledger'
  }

  const result = await sendWebhook({
    siteId: site.id,
    webhookUrl: site.webhook_url,
    webhookSecret: site.webhook_secret,
    eventType: 'test.ping',
    payload: testPayload
  })

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Test webhook sent successfully',
      statusCode: result.statusCode,
      site: {
        id: site.id,
        name: site.name,
        slug: site.slug
      }
    })
  } else {
    return NextResponse.json({
      success: false,
      error: result.error || 'Failed to send test webhook',
      statusCode: result.statusCode,
      site: {
        id: site.id,
        name: site.name,
        slug: site.slug
      }
    }, { status: 500 })
  }
}
