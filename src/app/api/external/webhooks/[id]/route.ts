export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { verifyAppToken, extractBearerToken } from '@/lib/external/auth'

/**
 * Webhook Management API - Individual Webhook Operations
 *
 * Endpoints:
 *   GET    /api/external/webhooks/[id] - Get webhook details
 *   PATCH  /api/external/webhooks/[id] - Update webhook
 *   DELETE /api/external/webhooks/[id] - Delete webhook
 */

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/external/webhooks/[id]
 *
 * Get details for a specific webhook including delivery stats
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    // Get webhook (verify it belongs to this app)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: webhook, error } = await (supabase as any)
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
        max_consecutive_failures,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('app_id', payload.app_id)
      .single()

    if (error || !webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Get recent delivery logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: deliveries } = await (supabase as any)
      .from('webhook_delivery_log')
      .select(`
        id,
        event_type,
        attempt_number,
        delivered_at,
        response_status,
        response_time_ms,
        success,
        error_message
      `)
      .eq('subscription_id', id)
      .order('delivered_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      webhook,
      recent_deliveries: deliveries || []
    })
  } catch (error) {
    console.error('Webhook get error:', error)
    return NextResponse.json(
      { error: 'Failed to get webhook' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/external/webhooks/[id]
 *
 * Update webhook settings
 *
 * Body:
 * {
 *   "events": ["consent.revoked"],  // Update subscribed events
 *   "is_active": true,               // Enable/disable
 *   "description": "New description"
 * }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    // Verify webhook belongs to this app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', id)
      .eq('app_id', payload.app_id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Parse update body
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}

    if (body.events !== undefined) {
      if (!Array.isArray(body.events) || body.events.length === 0) {
        return NextResponse.json(
          { error: 'Events must be a non-empty array' },
          { status: 400 }
        )
      }
      updateData.events = body.events
    }

    if (body.is_active !== undefined) {
      updateData.is_active = Boolean(body.is_active)
      // Reset failure count when re-enabling
      if (body.is_active) {
        updateData.consecutive_failures = 0
      }
    }

    if (body.description !== undefined) {
      updateData.description = body.description
    }

    // Update webhook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: webhook, error } = await (supabase as any)
      .from('webhook_subscriptions')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        webhook_url,
        events,
        is_active,
        description,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Error updating webhook:', error)
      return NextResponse.json(
        { error: 'Failed to update webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Webhook update error:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/external/webhooks/[id]
 *
 * Delete a webhook subscription
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    // Delete webhook (CASCADE will delete delivery logs)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('webhook_subscriptions')
      .delete()
      .eq('id', id)
      .eq('app_id', payload.app_id)

    if (error) {
      console.error('Error deleting webhook:', error)
      return NextResponse.json(
        { error: 'Failed to delete webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Webhook deleted' })
  } catch (error) {
    console.error('Webhook delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}
