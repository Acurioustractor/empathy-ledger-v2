import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/distribution
 *
 * Receive callbacks from external platforms about distribution status changes.
 * This endpoint is called by external systems to update distribution status.
 *
 * Headers:
 * - X-Distribution-ID: string - The distribution ID
 * - X-Webhook-Signature: string - HMAC signature for verification
 *
 * Body:
 * - event: string - Event type (e.g., 'removed', 'flagged', 'view', 'click')
 * - platform: string - Platform identifier
 * - platformPostId: string - External post ID
 * - timestamp: string - ISO date of the event
 * - metadata?: object - Additional event data
 */
export async function POST(request: NextRequest) {
  try {
    const distributionId = request.headers.get('x-distribution-id')
    const signature = request.headers.get('x-webhook-signature')

    if (!distributionId) {
      return NextResponse.json(
        { error: 'Distribution ID required', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // Parse body
    const body = await request.json()
    const { event, platform, platformPostId, timestamp, metadata } = body

    if (!event) {
      return NextResponse.json(
        { error: 'Event type required', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // Initialize Supabase with service role for webhook processing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch the distribution to verify and get webhook secret
    const { data: distribution, error: fetchError } = await supabase
      .from('story_distributions')
      .select('id, webhook_secret, status, view_count, click_count')
      .eq('id', distributionId)
      .single()

    if (fetchError || !distribution) {
      return NextResponse.json(
        { error: 'Distribution not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Verify signature if webhook secret is configured
    if (distribution.webhook_secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', distribution.webhook_secret)
        .update(JSON.stringify(body))
        .digest('hex')

      if (!signature.includes(expectedSignature)) {
        return NextResponse.json(
          { error: 'Invalid signature', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }
    }

    // Process different event types
    switch (event) {
      case 'removed':
      case 'deleted':
      case 'takedown':
        // External platform removed the content
        await supabase
          .from('story_distributions')
          .update({
            status: 'removed_externally',
            revoked_at: new Date().toISOString(),
            revocation_reason: `Removed by ${platform || 'external platform'}`,
            webhook_response: { event, timestamp, metadata }
          })
          .eq('id', distributionId)
        break

      case 'flagged':
      case 'reported':
        // Content was flagged on external platform
        await supabase
          .from('story_distributions')
          .update({
            status: 'flagged',
            notes: `Flagged on ${platform}: ${metadata?.reason || 'Unknown reason'}`,
            webhook_response: { event, timestamp, metadata }
          })
          .eq('id', distributionId)
        break

      case 'view':
        // Track view from external platform
        await supabase
          .from('story_distributions')
          .update({
            view_count: (distribution.view_count || 0) + 1,
            last_viewed_at: new Date().toISOString()
          })
          .eq('id', distributionId)
        break

      case 'click':
        // Track click from external platform
        await supabase
          .from('story_distributions')
          .update({
            click_count: (distribution.click_count || 0) + 1
          })
          .eq('id', distributionId)
        break

      case 'expired':
        // Distribution expired on external platform
        await supabase
          .from('story_distributions')
          .update({
            status: 'expired',
            webhook_response: { event, timestamp, metadata }
          })
          .eq('id', distributionId)
        break

      default:
        // Log unknown event type but don't fail
        console.warn(`Unknown webhook event type: ${event}`)
        await supabase
          .from('story_distributions')
          .update({
            webhook_response: { event, timestamp, metadata, unknown: true }
          })
          .eq('id', distributionId)
    }

    // Create audit log entry
    await supabase.from('audit_logs').insert({
      tenant_id: distribution.tenant_id || '00000000-0000-0000-0000-000000000000',
      entity_type: 'distribution',
      entity_id: distributionId,
      action: `webhook_${event}`,
      action_category: 'webhook',
      actor_type: 'system',
      new_state: { event, platform, platformPostId, metadata },
      change_summary: `Webhook event: ${event} from ${platform || 'external platform'}`
    })

    return NextResponse.json({
      success: true,
      message: `Event ${event} processed`,
      distributionId
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/distribution
 *
 * Health check endpoint for webhook configuration verification.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Empathy Ledger Distribution Webhooks',
    version: '1.0',
    supportedEvents: ['removed', 'deleted', 'takedown', 'flagged', 'reported', 'view', 'click', 'expired']
  })
}
