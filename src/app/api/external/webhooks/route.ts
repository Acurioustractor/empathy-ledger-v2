export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { verifyAppToken, extractBearerToken } from '@/lib/external/auth'
import crypto from 'crypto'

/**
 * Webhook Management API for External Apps
 *
 * Allows external apps to register webhooks to receive notifications
 * when consent changes (granted, revoked, updated) or stories change.
 *
 * Endpoints:
 *   GET  /api/external/webhooks - List registered webhooks
 *   POST /api/external/webhooks - Register a new webhook
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 */

// Available webhook event types
const VALID_EVENTS = [
  'consent.granted',
  'consent.revoked',
  'consent.updated',
  'consent.expired',
  'story.updated',
  'story.deleted',
  'cultural.approval_required',
  'cultural.approved',
  'cultural.denied'
]

/**
 * GET /api/external/webhooks
 *
 * List all registered webhooks for the authenticated app
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const payload = await verifyAppToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Get webhooks for this app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: webhooks, error } = await (supabase as any)
      .from('webhook_subscriptions')
      .select(`
        id,
        webhook_url,
        events,
        is_active,
        description,
        last_triggered_at,
        last_success_at,
        last_failure_at,
        failure_count,
        consecutive_failures,
        created_at
      `)
      .eq('app_id', payload.app_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching webhooks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch webhooks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      webhooks: webhooks || [],
      available_events: VALID_EVENTS
    })
  } catch (error) {
    console.error('Webhook list error:', error)
    return NextResponse.json(
      { error: 'Failed to list webhooks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/external/webhooks
 *
 * Register a new webhook endpoint
 *
 * Body:
 * {
 *   "url": "https://example.com/webhook",
 *   "events": ["consent.revoked", "story.updated"],
 *   "description": "Optional description"
 * }
 *
 * Response:
 * {
 *   "webhook": { ... },
 *   "secret": "webhook_secret_for_hmac_verification"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const payload = await verifyAppToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { url, events, description } = body

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid webhook URL' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      const urlObj = new URL(url)
      if (urlObj.protocol !== 'https:' && !url.includes('localhost')) {
        return NextResponse.json(
          { error: 'Webhook URL must use HTTPS (except for localhost)' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL format' },
        { status: 400 }
      )
    }

    // Validate events
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Must specify at least one event to subscribe to', available_events: VALID_EVENTS },
        { status: 400 }
      )
    }

    const invalidEvents = events.filter(e => !VALID_EVENTS.includes(e))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}`, available_events: VALID_EVENTS },
        { status: 400 }
      )
    }

    // Generate a secure secret key for HMAC verification
    const secretKey = `whsec_${crypto.randomBytes(32).toString('hex')}`

    const supabase = createSupabaseServiceClient()

    // Create the webhook subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: webhook, error } = await (supabase as any)
      .from('webhook_subscriptions')
      .insert({
        app_id: payload.app_id,
        webhook_url: url,
        secret_key: secretKey,
        events,
        description: description || null,
        is_active: true
      })
      .select(`
        id,
        webhook_url,
        events,
        is_active,
        description,
        created_at
      `)
      .single()

    if (error) {
      // Check for duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Webhook URL already registered for this app' },
          { status: 409 }
        )
      }

      console.error('Error creating webhook:', error)
      return NextResponse.json(
        { error: 'Failed to create webhook' },
        { status: 500 }
      )
    }

    // Return webhook with secret (secret is only shown once!)
    return NextResponse.json({
      webhook,
      secret: secretKey,
      message: 'Webhook created successfully. Store the secret securely - it will not be shown again.',
      verification_header: 'X-Empathy-Signature',
      signature_format: 'sha256=<hmac_hex_digest>'
    }, { status: 201 })
  } catch (error) {
    console.error('Webhook create error:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}
