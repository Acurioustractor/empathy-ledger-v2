/**
 * Webhook Service
 *
 * Handles sending webhook notifications to external apps when consent changes.
 * Ensures storyteller sovereignty by notifying platforms of revocations immediately.
 *
 * Features:
 * - HMAC-SHA256 signature verification
 * - Automatic retries with exponential backoff
 * - Delivery logging for audit trail
 * - Auto-disable after consecutive failures
 */

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import crypto from 'crypto'

// Event types that can trigger webhooks
export type WebhookEventType =
  | 'consent.granted'
  | 'consent.revoked'
  | 'consent.updated'
  | 'consent.expired'
  | 'story.updated'
  | 'story.deleted'
  | 'cultural.approval_required'
  | 'cultural.approved'
  | 'cultural.denied'

export interface WebhookEvent {
  type: WebhookEventType
  payload: WebhookPayload
}

export interface WebhookPayload {
  story_id: string
  app_id?: string
  storyteller_id?: string
  timestamp: string
  // Event-specific data
  consent?: {
    previous_level?: string
    new_level?: string
    reason?: string
  }
  story?: {
    title?: string
    updated_fields?: string[]
  }
  cultural?: {
    status?: string
    reviewer_notes?: string
  }
  // Action required flag
  action_required?: string
}

interface WebhookSubscription {
  id: string
  app_id: string
  webhook_url: string
  secret_key: string
  events: string[]
  is_active: boolean
  consecutive_failures: number
  app_name?: string
}

interface DeliveryResult {
  success: boolean
  statusCode?: number
  responseBody?: string
  responseTimeMs?: number
  errorMessage?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

class WebhookService {
  private readonly maxRetries = 3
  private readonly retryDelays = [1000, 5000, 30000] // 1s, 5s, 30s

  /**
   * Notify all subscribed webhooks of an event
   */
  async notify(event: WebhookEvent): Promise<void> {
    const subscriptions = await this.getSubscriptionsForEvent(event.type)

    if (subscriptions.length === 0) {
      console.log(`No webhook subscriptions for event: ${event.type}`)
      return
    }

    console.log(`Sending webhook for ${event.type} to ${subscriptions.length} subscribers`)

    // Send to all subscribers in parallel
    const results = await Promise.allSettled(
      subscriptions.map(sub => this.deliverWebhook(sub, event))
    )

    // Log results
    results.forEach((result, index) => {
      const sub = subscriptions[index]
      if (result.status === 'fulfilled') {
        console.log(`Webhook delivered to ${sub.app_name || sub.webhook_url}: ${result.value.success ? 'success' : 'failed'}`)
      } else {
        console.error(`Webhook delivery error for ${sub.app_name || sub.webhook_url}:`, result.reason)
      }
    })
  }

  /**
   * Notify specific app about an event (used for targeted notifications)
   */
  async notifyApp(appId: string, event: WebhookEvent): Promise<boolean> {
    const subscriptions = await this.getSubscriptionsForApp(appId, event.type)

    if (subscriptions.length === 0) {
      console.log(`No webhook subscription for app ${appId} and event ${event.type}`)
      return false
    }

    const results = await Promise.all(
      subscriptions.map(sub => this.deliverWebhook(sub, event))
    )

    return results.some(r => r.success)
  }

  /**
   * Get all active subscriptions for an event type
   */
  private async getSubscriptionsForEvent(eventType: WebhookEventType): Promise<WebhookSubscription[]> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('webhook_subscriptions')
      .select(`
        id,
        app_id,
        webhook_url,
        secret_key,
        events,
        is_active,
        consecutive_failures,
        external_applications:app_id (
          app_name
        )
      `)
      .eq('is_active', true)
      .contains('events', [eventType])

    if (error) {
      console.error('Error fetching webhook subscriptions:', error)
      return []
    }

    return (data || []).map((sub: AnyRecord) => ({
      ...sub,
      app_name: sub.external_applications?.app_name
    }))
  }

  /**
   * Get subscriptions for a specific app
   */
  private async getSubscriptionsForApp(appId: string, eventType: WebhookEventType): Promise<WebhookSubscription[]> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('webhook_subscriptions')
      .select(`
        id,
        app_id,
        webhook_url,
        secret_key,
        events,
        is_active,
        consecutive_failures,
        external_applications:app_id (
          app_name
        )
      `)
      .eq('app_id', appId)
      .eq('is_active', true)
      .contains('events', [eventType])

    if (error) {
      console.error('Error fetching app webhook subscriptions:', error)
      return []
    }

    return (data || []).map((sub: AnyRecord) => ({
      ...sub,
      app_name: sub.external_applications?.app_name
    }))
  }

  /**
   * Deliver a webhook with retries
   */
  private async deliverWebhook(
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<DeliveryResult> {
    const payload = this.buildPayload(event)
    const signature = this.signPayload(payload, subscription.secret_key)

    let lastResult: DeliveryResult = { success: false }

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        // Wait before retry
        await this.sleep(this.retryDelays[attempt - 1] || 30000)
      }

      lastResult = await this.sendWebhook(subscription.webhook_url, payload, signature, attempt + 1)

      // Log the delivery attempt
      await this.logDelivery(subscription.id, event, lastResult, attempt + 1)

      if (lastResult.success) {
        // Reset failure count on success
        await this.updateSubscriptionStatus(subscription.id, true)
        return lastResult
      }

      // Don't retry on 4xx errors (client errors)
      if (lastResult.statusCode && lastResult.statusCode >= 400 && lastResult.statusCode < 500) {
        break
      }
    }

    // Update failure count
    await this.updateSubscriptionStatus(subscription.id, false)
    return lastResult
  }

  /**
   * Build the webhook payload
   */
  private buildPayload(event: WebhookEvent): string {
    return JSON.stringify({
      event: event.type,
      timestamp: new Date().toISOString(),
      data: event.payload
    })
  }

  /**
   * Sign the payload with HMAC-SHA256
   */
  private signPayload(payload: string, secretKey: string): string {
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(payload)
    return `sha256=${hmac.digest('hex')}`
  }

  /**
   * Send the actual HTTP request
   */
  private async sendWebhook(
    url: string,
    payload: string,
    signature: string,
    attempt: number
  ): Promise<DeliveryResult> {
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empathy-Signature': signature,
          'X-Empathy-Delivery-Attempt': String(attempt),
          'User-Agent': 'Empathy-Ledger-Webhook/1.0'
        },
        body: payload,
        signal: controller.signal
      })

      clearTimeout(timeout)

      const responseBody = await response.text().catch(() => '')
      const responseTimeMs = Date.now() - startTime

      return {
        success: response.ok,
        statusCode: response.status,
        responseBody: responseBody.slice(0, 1000), // Limit stored response
        responseTimeMs
      }
    } catch (error) {
      return {
        success: false,
        responseTimeMs: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Log a delivery attempt
   */
  private async logDelivery(
    subscriptionId: string,
    event: WebhookEvent,
    result: DeliveryResult,
    attempt: number
  ): Promise<void> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('webhook_delivery_log')
      .insert({
        subscription_id: subscriptionId,
        event_type: event.type,
        event_payload: event.payload,
        attempt_number: attempt,
        response_status: result.statusCode,
        response_body: result.responseBody,
        response_time_ms: result.responseTimeMs,
        success: result.success,
        error_message: result.errorMessage,
        // Schedule retry if failed
        next_retry_at: !result.success && attempt < this.maxRetries
          ? new Date(Date.now() + (this.retryDelays[attempt] || 60000))
          : null
      })
  }

  /**
   * Update subscription status after delivery attempt
   */
  private async updateSubscriptionStatus(subscriptionId: string, success: boolean): Promise<void> {
    const supabase = createSupabaseServiceClient()

    if (success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('webhook_subscriptions')
        .update({
          last_triggered_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          consecutive_failures: 0
        })
        .eq('id', subscriptionId)
    } else {
      // Increment failure count
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .rpc('increment_webhook_failures', { subscription_id: subscriptionId })
        .catch(async () => {
          // Fallback if RPC doesn't exist
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any)
            .from('webhook_subscriptions')
            .select('consecutive_failures, failure_count')
            .eq('id', subscriptionId)
            .single()

          if (data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('webhook_subscriptions')
              .update({
                last_triggered_at: new Date().toISOString(),
                last_failure_at: new Date().toISOString(),
                failure_count: (data.failure_count || 0) + 1,
                consecutive_failures: (data.consecutive_failures || 0) + 1
              })
              .eq('id', subscriptionId)
          }
        })
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ==========================================
  // Convenience methods for specific events
  // ==========================================

  /**
   * Notify when consent is revoked
   */
  async notifyConsentRevoked(
    storyId: string,
    appId: string,
    storytellerId: string,
    reason?: string
  ): Promise<void> {
    await this.notify({
      type: 'consent.revoked',
      payload: {
        story_id: storyId,
        app_id: appId,
        storyteller_id: storytellerId,
        timestamp: new Date().toISOString(),
        consent: { reason },
        action_required: 'Remove story from your platform immediately'
      }
    })
  }

  /**
   * Notify when consent is granted
   */
  async notifyConsentGranted(
    storyId: string,
    appId: string,
    storytellerId: string,
    shareLevel: string
  ): Promise<void> {
    await this.notify({
      type: 'consent.granted',
      payload: {
        story_id: storyId,
        app_id: appId,
        storyteller_id: storytellerId,
        timestamp: new Date().toISOString(),
        consent: { new_level: shareLevel }
      }
    })
  }

  /**
   * Notify when consent is updated (e.g., changed from full to summary)
   */
  async notifyConsentUpdated(
    storyId: string,
    appId: string,
    storytellerId: string,
    previousLevel: string,
    newLevel: string
  ): Promise<void> {
    await this.notify({
      type: 'consent.updated',
      payload: {
        story_id: storyId,
        app_id: appId,
        storyteller_id: storytellerId,
        timestamp: new Date().toISOString(),
        consent: {
          previous_level: previousLevel,
          new_level: newLevel
        },
        action_required: newLevel === 'none' ? 'Remove story from your platform' : 'Update story display to match new consent level'
      }
    })
  }

  /**
   * Notify when a story is updated
   */
  async notifyStoryUpdated(
    storyId: string,
    updatedFields: string[]
  ): Promise<void> {
    await this.notify({
      type: 'story.updated',
      payload: {
        story_id: storyId,
        timestamp: new Date().toISOString(),
        story: { updated_fields: updatedFields },
        action_required: 'Refresh story content from API'
      }
    })
  }

  /**
   * Notify when a story is deleted
   */
  async notifyStoryDeleted(storyId: string): Promise<void> {
    await this.notify({
      type: 'story.deleted',
      payload: {
        story_id: storyId,
        timestamp: new Date().toISOString(),
        action_required: 'Remove story from your platform immediately'
      }
    })
  }
}

// Export singleton instance
export const webhookService = new WebhookService()
export default webhookService
