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
 * POST /api/admin/webhooks/retry
 *
 * Retries all failed webhooks that are still retryable.
 * Requires admin authentication.
 *
 * Body: { webhookId?: string } - Optional specific webhook to retry
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
  const { webhookId } = body

  // Import retry function
  const { retryFailedWebhooks } = await import('@/lib/webhooks/syndication-webhooks')

  if (webhookId) {
    // Retry specific webhook
    const { data: webhook, error: fetchError } = await supabase
      .from('webhook_delivery_logs')
      .select('*')
      .eq('id', webhookId)
      .single()

    if (fetchError || !webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    if (webhook.status === 'delivered') {
      return NextResponse.json({ error: 'Webhook already delivered' }, { status: 400 })
    }

    if (!webhook.retryable) {
      return NextResponse.json({ error: 'Webhook is not retryable' }, { status: 400 })
    }

    // Get site info for retry
    const { data: site } = await supabase
      .from('syndication_sites')
      .select('webhook_url, webhook_secret')
      .eq('id', webhook.site_id)
      .single()

    if (!site?.webhook_url) {
      return NextResponse.json({ error: 'Site has no webhook URL configured' }, { status: 400 })
    }

    // Retry the webhook
    const { sendWebhook } = await import('@/lib/webhooks/syndication-webhooks')
    const result = await sendWebhook({
      siteId: webhook.site_id,
      webhookUrl: site.webhook_url,
      webhookSecret: site.webhook_secret,
      eventType: webhook.event_type,
      payload: webhook.payload
    })

    return NextResponse.json({
      success: result.success,
      retriedCount: 1,
      webhookId,
      result
    })
  } else {
    // Retry all failed webhooks
    const result = await retryFailedWebhooks()

    return NextResponse.json({
      success: true,
      retriedCount: result.retriedCount,
      successCount: result.successCount,
      failedCount: result.failedCount
    })
  }
}
