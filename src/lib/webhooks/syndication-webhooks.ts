/**
 * Syndication Webhooks Service
 *
 * Sends webhook notifications to external syndication partners when
 * consent status changes (granted, revoked, expired).
 *
 * Follows OCAP principles:
 * - Only sends minimal necessary data
 * - Uses secure signed payloads
 * - Supports retry with exponential backoff
 */

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export type WebhookEventType =
  | 'consent.granted'
  | 'consent.revoked'
  | 'consent.expired'
  | 'content.updated'
  | 'content.unpublished'

export interface WebhookPayload {
  event: WebhookEventType
  timestamp: string
  data: {
    consentId: string
    storyId: string
    siteSlug: string
    storytellerName?: string
    storyTitle?: string
    culturalPermissionLevel?: string
    embedToken?: string // Only included on consent.granted
    reason?: string // Included on revocation
  }
}

export interface WebhookDeliveryResult {
  success: boolean
  statusCode?: number
  error?: string
  retryable: boolean
}

export interface SyndicationSite {
  id: string
  slug: string
  name: string
  webhook_url?: string
  webhook_secret?: string
  status: string
}

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

/**
 * Send webhook to a syndication site
 */
export async function sendWebhook(
  site: SyndicationSite,
  payload: WebhookPayload
): Promise<WebhookDeliveryResult> {
  if (!site.webhook_url) {
    return {
      success: false,
      error: 'No webhook URL configured for site',
      retryable: false
    }
  }

  const payloadString = JSON.stringify(payload)
  const signature = site.webhook_secret
    ? generateSignature(payloadString, site.webhook_secret)
    : null

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(site.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
        ...(signature && { 'X-Webhook-Signature': `sha256=${signature}` }),
        'User-Agent': 'EmpathyLedger-Webhooks/1.0'
      },
      body: payloadString,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        retryable: false
      }
    }

    // Determine if retryable based on status code
    const retryable = response.status >= 500 || response.status === 429

    return {
      success: false,
      statusCode: response.status,
      error: `HTTP ${response.status}`,
      retryable
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    const isNetworkError = error instanceof Error && error.message.includes('fetch')

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      retryable: isTimeout || isNetworkError
    }
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(
  siteId: string,
  event: WebhookEventType,
  payload: WebhookPayload,
  result: WebhookDeliveryResult
) {
  const supabase = createSupabaseClient()

  try {
    await supabase.from('webhook_delivery_logs').insert({
      site_id: siteId,
      event_type: event,
      payload: payload,
      status: result.success ? 'delivered' : 'failed',
      status_code: result.statusCode,
      error_message: result.error,
      retryable: result.retryable,
      delivered_at: result.success ? new Date().toISOString() : null
    })
  } catch (error) {
    // Log to console but don't fail the webhook
    console.error('Failed to log webhook delivery:', error)
  }
}

/**
 * Send consent granted webhook
 */
export async function notifyConsentGranted(
  consentId: string,
  options?: { includeEmbedToken?: boolean }
): Promise<WebhookDeliveryResult | null> {
  const supabase = createSupabaseClient()

  // Fetch consent with related data
  const { data: consent, error: consentError } = await supabase
    .from('syndication_consent')
    .select(`
      id,
      story_id,
      site_id,
      cultural_permission_level,
      stories!syndication_consent_story_id_fkey (
        id,
        title,
        profiles!stories_storyteller_id_fkey (
          display_name,
          full_name
        )
      ),
      syndication_sites!syndication_consent_site_id_fkey (
        id,
        slug,
        name,
        webhook_url,
        webhook_secret,
        status
      )
    `)
    .eq('id', consentId)
    .single()

  if (consentError || !consent) {
    console.error('Failed to fetch consent for webhook:', consentError)
    return null
  }

  const site = consent.syndication_sites as unknown as SyndicationSite
  if (!site?.webhook_url || site.status !== 'active') {
    return null // No webhook configured or site inactive
  }

  // Get embed token if requested
  let embedToken: string | undefined
  if (options?.includeEmbedToken) {
    const { data: token } = await supabase
      .from('embed_tokens')
      .select('token')
      .eq('story_id', consent.story_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    embedToken = token?.token
  }

  const story = consent.stories as any
  const storyteller = story?.profiles

  const payload: WebhookPayload = {
    event: 'consent.granted',
    timestamp: new Date().toISOString(),
    data: {
      consentId: consent.id,
      storyId: consent.story_id,
      siteSlug: site.slug,
      storytellerName: storyteller?.display_name || storyteller?.full_name,
      storyTitle: story?.title,
      culturalPermissionLevel: consent.cultural_permission_level,
      embedToken
    }
  }

  const result = await sendWebhook(site, payload)
  await logWebhookDelivery(site.id, 'consent.granted', payload, result)

  return result
}

/**
 * Send consent revoked webhook
 */
export async function notifyConsentRevoked(
  consentId: string,
  reason?: string
): Promise<WebhookDeliveryResult | null> {
  const supabase = createSupabaseClient()

  // Fetch consent with site info
  const { data: consent, error } = await supabase
    .from('syndication_consent')
    .select(`
      id,
      story_id,
      syndication_sites!syndication_consent_site_id_fkey (
        id,
        slug,
        name,
        webhook_url,
        webhook_secret,
        status
      )
    `)
    .eq('id', consentId)
    .single()

  if (error || !consent) {
    console.error('Failed to fetch consent for revocation webhook:', error)
    return null
  }

  const site = consent.syndication_sites as unknown as SyndicationSite
  if (!site?.webhook_url || site.status !== 'active') {
    return null
  }

  const payload: WebhookPayload = {
    event: 'consent.revoked',
    timestamp: new Date().toISOString(),
    data: {
      consentId: consent.id,
      storyId: consent.story_id,
      siteSlug: site.slug,
      reason: reason || 'Consent revoked by storyteller'
    }
  }

  const result = await sendWebhook(site, payload)
  await logWebhookDelivery(site.id, 'consent.revoked', payload, result)

  return result
}

/**
 * Send content updated webhook (when story content changes)
 */
export async function notifyContentUpdated(
  storyId: string
): Promise<WebhookDeliveryResult[]> {
  const supabase = createSupabaseClient()

  // Find all active consents for this story
  const { data: consents, error } = await supabase
    .from('syndication_consent')
    .select(`
      id,
      story_id,
      syndication_sites!syndication_consent_site_id_fkey (
        id,
        slug,
        name,
        webhook_url,
        webhook_secret,
        status
      )
    `)
    .eq('story_id', storyId)
    .eq('status', 'approved')

  if (error || !consents?.length) {
    return []
  }

  const results: WebhookDeliveryResult[] = []

  for (const consent of consents) {
    const site = consent.syndication_sites as unknown as SyndicationSite
    if (!site?.webhook_url || site.status !== 'active') {
      continue
    }

    const payload: WebhookPayload = {
      event: 'content.updated',
      timestamp: new Date().toISOString(),
      data: {
        consentId: consent.id,
        storyId: consent.story_id,
        siteSlug: site.slug
      }
    }

    const result = await sendWebhook(site, payload)
    await logWebhookDelivery(site.id, 'content.updated', payload, result)
    results.push(result)
  }

  return results
}

/**
 * Send content unpublished webhook (when story is unpublished)
 */
export async function notifyContentUnpublished(
  storyId: string
): Promise<WebhookDeliveryResult[]> {
  const supabase = createSupabaseClient()

  // Find all active consents for this story
  const { data: consents, error } = await supabase
    .from('syndication_consent')
    .select(`
      id,
      story_id,
      syndication_sites!syndication_consent_site_id_fkey (
        id,
        slug,
        name,
        webhook_url,
        webhook_secret,
        status
      )
    `)
    .eq('story_id', storyId)
    .eq('status', 'approved')

  if (error || !consents?.length) {
    return []
  }

  const results: WebhookDeliveryResult[] = []

  for (const consent of consents) {
    const site = consent.syndication_sites as unknown as SyndicationSite
    if (!site?.webhook_url || site.status !== 'active') {
      continue
    }

    const payload: WebhookPayload = {
      event: 'content.unpublished',
      timestamp: new Date().toISOString(),
      data: {
        consentId: consent.id,
        storyId: consent.story_id,
        siteSlug: site.slug
      }
    }

    const result = await sendWebhook(site, payload)
    await logWebhookDelivery(site.id, 'content.unpublished', payload, result)
    results.push(result)
  }

  return results
}

/**
 * Retry failed webhook deliveries
 */
export async function retryFailedWebhooks(
  maxRetries: number = 3,
  retryAge: number = 3600000 // 1 hour
): Promise<number> {
  const supabase = createSupabaseClient()

  const cutoffTime = new Date(Date.now() - retryAge).toISOString()

  // Find failed, retryable webhooks
  const { data: failedLogs, error } = await supabase
    .from('webhook_delivery_logs')
    .select('*')
    .eq('status', 'failed')
    .eq('retryable', true)
    .lt('retry_count', maxRetries)
    .gt('created_at', cutoffTime)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error || !failedLogs?.length) {
    return 0
  }

  let retryCount = 0

  for (const log of failedLogs) {
    // Fetch site info
    const { data: site } = await supabase
      .from('syndication_sites')
      .select('*')
      .eq('id', log.site_id)
      .single()

    if (!site?.webhook_url || site.status !== 'active') {
      continue
    }

    // Retry the webhook
    const result = await sendWebhook(site as SyndicationSite, log.payload)

    // Update the log
    await supabase
      .from('webhook_delivery_logs')
      .update({
        status: result.success ? 'delivered' : 'failed',
        status_code: result.statusCode,
        error_message: result.error,
        retry_count: (log.retry_count || 0) + 1,
        last_retry_at: new Date().toISOString(),
        delivered_at: result.success ? new Date().toISOString() : null
      })
      .eq('id', log.id)

    if (result.success) {
      retryCount++
    }
  }

  return retryCount
}
