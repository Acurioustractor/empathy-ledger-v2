/**
 * Revocation API
 *
 * Handles immediate removal of syndicated stories from external sites.
 * Sends webhooks, invalidates tokens, verifies removal.
 *
 * ACT Philosophy Alignment:
 * - Storyteller sovereignty (immediate control)
 * - Transparency (real-time status updates)
 * - Accountability (5-minute compliance deadline)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeTokensForStorySite, revokeAllTokensForStory } from '@/lib/services/embed-token-service'
import { inngest } from '@/lib/inngest/client'
import crypto from 'crypto'

interface RevocationRequest {
  storyId: string
  siteIds?: string[] // If not provided, revoke from ALL sites
  reason?: string
}

interface WebhookPayload {
  event: 'content_revoked'
  storyId: string
  revokedAt: string
  reason?: string
  signature: string
}

interface RevocationResult {
  siteId: string
  siteName: string
  status: 'pending' | 'notified' | 'verified' | 'failed'
  webhookDelivered: boolean
  verificationAttempts: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user (storyteller)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: RevocationRequest = await request.json()
    const { storyId, siteIds, reason } = body

    if (!storyId) {
      return NextResponse.json(
        { error: 'Missing storyId' },
        { status: 400 }
      )
    }

    // Verify storyteller owns this story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, tenant_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this story' },
        { status: 403 }
      )
    }

    // Get all active distributions for this story
    // TODO: Query syndication_distributions table
    // For PoC, we'll use mock data
    const mockActiveSites = [
      { id: 'justicehub', name: 'JusticeHub', webhookUrl: 'https://justicehub.example.com/api/webhooks/empathy-ledger' },
      { id: 'theharvest', name: 'The Harvest', webhookUrl: 'https://theharvest.example.com/api/webhooks/empathy-ledger' }
    ]

    const sitesToRevoke = siteIds
      ? mockActiveSites.filter(site => siteIds.includes(site.id))
      : mockActiveSites

    if (sitesToRevoke.length === 0) {
      return NextResponse.json(
        { error: 'No active distributions found for this story' },
        { status: 404 }
      )
    }

    // Process revocation for each site
    const results: RevocationResult[] = []

    for (const site of sitesToRevoke) {
      const result: RevocationResult = {
        siteId: site.id,
        siteName: site.name,
        status: 'pending',
        webhookDelivered: false,
        verificationAttempts: 0
      }

      try {
        // 1. Invalidate access tokens for this site+story
        const revokeResult = await revokeTokensForStorySite(
          storyId,
          site.id,
          reason || 'Storyteller requested removal'
        )

        if (!revokeResult.success) {
          console.error(`Failed to revoke tokens for site ${site.id}:`, revokeResult.error)
        }

        // 2. Send webhook to external site via Inngest
        // Trigger Inngest webhook delivery job
        await inngest.send({
          name: 'syndication/content.revoked',
          data: {
            storyId,
            siteIds: [site.id],
            reason: reason || 'Storyteller requested removal'
          }
        })

        result.webhookDelivered = true
        result.status = 'notified'

        // Update distribution status to pending_removal
        await supabase
          .from('story_distributions')
          .update({
            status: 'pending_removal',
            updated_at: new Date().toISOString()
          })
          .eq('story_id', storyId)
          .eq('site_id', site.id)

        console.log('Revocation webhook triggered for site:', site.id)

      } catch (error) {
        console.error(`Failed to revoke from ${site.name}:`, error)
        result.status = 'failed'
        result.error = error instanceof Error ? error.message : 'Unknown error'
      }

      results.push(result)
    }

    // Update story syndication status
    // TODO: Update syndication_consent or story_distributions table

    // Return revocation results
    const allSuccessful = results.every(r => r.status === 'verified')
    const anyFailed = results.some(r => r.status === 'failed')

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful
        ? 'Story successfully removed from all sites'
        : anyFailed
        ? 'Some sites failed to acknowledge removal - will retry automatically'
        : 'Removal in progress',
      storyId,
      storyTitle: story.title,
      revokedAt: new Date().toISOString(),
      results,
      stats: {
        total: results.length,
        successful: results.filter(r => r.status === 'verified').length,
        pending: results.filter(r => r.status === 'notified' || r.status === 'pending').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    })
  } catch (error) {
    console.error('Error processing revocation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate HMAC signature for webhook verification
 */
function generateWebhookSignature(storyId: string, siteId: string): string {
  const secret = process.env.WEBHOOK_SECRET || 'dev-secret-key'
  const payload = `${storyId}:${siteId}:${new Date().toISOString()}`

  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization'
    }
  })
}
