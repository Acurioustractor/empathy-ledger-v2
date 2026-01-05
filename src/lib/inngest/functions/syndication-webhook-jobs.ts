/**
 * Syndication Webhook Jobs
 *
 * Background jobs for delivering webhooks to external sites.
 * Handles revocation notifications, consent approvals, and content updates.
 *
 * Philosophy:
 * - Immediate delivery (< 30 seconds target)
 * - Retry logic with exponential backoff
 * - HMAC signature verification
 * - Compliance tracking (5-minute deadline for revocations)
 */

import { inngest } from '../client'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface WebhookPayload {
  event: 'content_revoked' | 'content_updated' | 'consent_approved' | 'consent_denied'
  storyId: string
  siteId: string
  timestamp: string
  data?: Record<string, any>
}

/**
 * Generate HMAC signature for webhook verification
 */
function generateWebhookSignature(payload: WebhookPayload, secret: string): string {
  const payloadString = JSON.stringify(payload)
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex')
}

/**
 * Deliver a webhook to an external site
 */
async function deliverWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  signature: string
): Promise<{
  success: boolean
  httpStatus?: number
  responseBody?: string
  error?: string
}> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Empathy-Ledger-Signature': signature,
        'X-Empathy-Ledger-Event': payload.event,
        'User-Agent': 'Empathy-Ledger-Webhook/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    const responseBody = await response.text()

    return {
      success: response.ok,
      httpStatus: response.status,
      responseBody: responseBody.substring(0, 1000) // Limit response size
    }
  } catch (error) {
    console.error('Webhook delivery error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Inngest Job: Process Content Revocation
 *
 * Sends webhooks to all sites where a story is distributed.
 * Ensures 5-minute compliance deadline is met.
 */
export const processContentRevocation = inngest.createFunction(
  {
    id: 'syndication/process-content-revocation',
    name: 'Process Content Revocation',
    retries: 3
  },
  { event: 'syndication/content.revoked' },
  async ({ event, step }) => {
    const { storyId, siteIds, reason } = event.data

    const supabase = await createClient()

    // Step 1: Get all affected distributions
    const distributions = await step.run('fetch-distributions', async () => {
      const query = supabase
        .from('story_distributions')
        .select(`
          id,
          site_id,
          story_id,
          syndication_sites (
            id,
            name,
            webhook_url
          )
        `)
        .eq('story_id', storyId)
        .eq('status', 'active')

      if (siteIds && siteIds.length > 0) {
        query.in('site_id', siteIds)
      }

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch distributions: ${error.message}`)
      return data || []
    })

    if (distributions.length === 0) {
      return { message: 'No active distributions found', storyId }
    }

    // Step 2: Send webhooks to each site
    const webhookResults = await Promise.all(
      distributions.map(async (dist) => {
        const site = dist.syndication_sites as any

        return await step.run(`send-webhook-${dist.site_id}`, async () => {
          // Create webhook payload
          const payload: WebhookPayload = {
            event: 'content_revoked',
            storyId: dist.story_id,
            siteId: dist.site_id,
            timestamp: new Date().toISOString(),
            data: { reason }
          }

          // Generate signature
          const signature = generateWebhookSignature(
            payload,
            process.env.WEBHOOK_SECRET || 'dev-secret-key'
          )

          // Log webhook event
          const { data: webhookEvent, error: webhookError } = await supabase
            .from('syndication_webhook_events')
            .insert({
              site_id: dist.site_id,
              story_id: dist.story_id,
              tenant_id: (site as any).tenant_id,
              event_type: 'content_revoked',
              webhook_url: site.webhook_url,
              payload,
              signature,
              status: 'pending'
            })
            .select()
            .single()

          if (webhookError) {
            console.error('Failed to log webhook event:', webhookError)
          }

          // Deliver webhook
          const result = await deliverWebhook(site.webhook_url, payload, signature)

          // Update webhook event status
          if (webhookEvent) {
            await supabase
              .from('syndication_webhook_events')
              .update({
                status: result.success ? 'delivered' : 'failed',
                http_status_code: result.httpStatus,
                response_body: result.responseBody,
                error_message: result.error,
                sent_at: new Date().toISOString(),
                delivered_at: result.success ? new Date().toISOString() : null,
                failed_at: result.success ? null : new Date().toISOString()
              })
              .eq('id', webhookEvent.id)
          }

          // Update distribution status
          await supabase
            .from('story_distributions')
            .update({
              status: result.success ? 'pending_removal' : 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', dist.id)

          return {
            siteId: dist.site_id,
            siteName: site.name,
            success: result.success,
            httpStatus: result.httpStatus,
            error: result.error
          }
        })
      })
    )

    // Step 3: Schedule verification checks (after 1 minute)
    await step.sendEvent('schedule-verification', {
      name: 'syndication/verify-removal',
      data: {
        storyId,
        siteIds: distributions.map(d => d.site_id),
        revocationTimestamp: new Date().toISOString()
      }
    })

    return {
      storyId,
      webhooksDelivered: webhookResults.filter(r => r.success).length,
      webhooksFailed: webhookResults.filter(r => !r.success).length,
      results: webhookResults
    }
  }
)

/**
 * Inngest Job: Verify Content Removal
 *
 * Checks that external sites have actually removed the content.
 * Runs 1 minute after revocation webhook is sent.
 */
export const verifyContentRemoval = inngest.createFunction(
  {
    id: 'syndication/verify-content-removal',
    name: 'Verify Content Removal'
  },
  { event: 'syndication/verify-removal' },
  async ({ event, step }) => {
    const { storyId, siteIds, revocationTimestamp } = event.data

    const supabase = await createClient()

    // Wait 1 minute to give sites time to process
    await step.sleep('wait-for-removal', '1m')

    // Verify removal for each site
    const verificationResults = await Promise.all(
      siteIds.map(async (siteId: string) => {
        return await step.run(`verify-${siteId}`, async () => {
          // Get site details
          const { data: site } = await supabase
            .from('syndication_sites')
            .select('name, api_base_url')
            .eq('id', siteId)
            .single()

          if (!site || !site.api_base_url) {
            return {
              siteId,
              siteName: site?.name,
              verified: false,
              error: 'No API URL configured for verification'
            }
          }

          try {
            // Attempt to fetch the story from the external site
            const verifyUrl = `${site.api_base_url}/stories/${storyId}`
            const response = await fetch(verifyUrl, {
              method: 'HEAD',
              signal: AbortSignal.timeout(5000)
            })

            // 404 = successfully removed, anything else = not removed
            const verified = response.status === 404

            // Update distribution status
            await supabase
              .from('story_distributions')
              .update({
                status: verified ? 'removed' : 'failed',
                removed_at: verified ? new Date().toISOString() : null,
                last_verified_at: new Date().toISOString(),
                verification_status: verified ? 'verified' : 'failed'
              })
              .eq('story_id', storyId)
              .eq('site_id', siteId)

            return {
              siteId,
              siteName: site.name,
              verified,
              httpStatus: response.status
            }
          } catch (error) {
            console.error(`Verification error for site ${siteId}:`, error)
            return {
              siteId,
              siteName: site.name,
              verified: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      })
    )

    // Check if 5-minute deadline was met
    const now = new Date()
    const revocationTime = new Date(revocationTimestamp)
    const elapsedMinutes = (now.getTime() - revocationTime.getTime()) / 1000 / 60

    const allVerified = verificationResults.every(r => r.verified)
    const withinDeadline = elapsedMinutes < 5

    // If any site failed to remove within deadline, trigger alert
    if (!allVerified && elapsedMinutes >= 5) {
      await step.sendEvent('alert-compliance-failure', {
        name: 'syndication/compliance-failure',
        data: {
          storyId,
          failedSites: verificationResults.filter(r => !r.verified),
          elapsedMinutes
        }
      })
    }

    return {
      storyId,
      verified: allVerified,
      withinDeadline,
      elapsedMinutes,
      results: verificationResults
    }
  }
)

/**
 * Inngest Job: Retry Failed Webhooks
 *
 * Automatically retries failed webhook deliveries with exponential backoff.
 */
export const retryFailedWebhooks = inngest.createFunction(
  {
    id: 'syndication/retry-failed-webhooks',
    name: 'Retry Failed Webhooks'
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const supabase = await createClient()

    // Get failed webhooks that need retry
    const { data: failedWebhooks, error } = await supabase
      .from('syndication_webhook_events')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', 'max_retries')
      .lte('next_retry_at', new Date().toISOString())
      .limit(50)

    if (error || !failedWebhooks || failedWebhooks.length === 0) {
      return { message: 'No webhooks to retry' }
    }

    const retryResults = await Promise.all(
      failedWebhooks.map(async (webhook) => {
        return await step.run(`retry-${webhook.id}`, async () => {
          // Deliver webhook
          const result = await deliverWebhook(
            webhook.webhook_url,
            webhook.payload as WebhookPayload,
            webhook.signature
          )

          // Calculate next retry time with exponential backoff
          const nextRetryDelay = Math.min(
            Math.pow(2, webhook.retry_count + 1) * 60000, // 2^n minutes in ms
            3600000 // Max 1 hour
          )
          const nextRetryAt = new Date(Date.now() + nextRetryDelay)

          // Update webhook event
          await supabase
            .from('syndication_webhook_events')
            .update({
              status: result.success ? 'delivered' : 'failed',
              http_status_code: result.httpStatus,
              response_body: result.responseBody,
              error_message: result.error,
              retry_count: webhook.retry_count + 1,
              next_retry_at: result.success ? null : nextRetryAt.toISOString(),
              sent_at: new Date().toISOString(),
              delivered_at: result.success ? new Date().toISOString() : webhook.delivered_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', webhook.id)

          return {
            webhookId: webhook.id,
            success: result.success,
            retryCount: webhook.retry_count + 1
          }
        })
      })
    )

    return {
      retriedCount: retryResults.length,
      successfulRetries: retryResults.filter(r => r.success).length,
      failedRetries: retryResults.filter(r => !r.success).length
    }
  }
)

/**
 * Export all syndication webhook jobs
 */
export const syndicationWebhookJobs = [
  processContentRevocation,
  verifyContentRemoval,
  retryFailedWebhooks
]
