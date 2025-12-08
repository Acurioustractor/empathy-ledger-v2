import { createClient } from '@supabase/supabase-js'
import {
  RevocationOptions,
  RevocationResult,
  CascadeResult,
  AuditLogInsert
} from '@/types/database/story-ownership'
import { getEmbedService } from './embed.service'
import { getDistributionService } from './distribution.service'

/**
 * RevocationService
 * Handles one-click revocation with cascade, consent withdrawal, and archive workflows.
 * Implements the "pull back" functionality for story ownership control.
 */
export class RevocationService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Initiate a full revocation with cascade effect
   * This is the primary "one-click pull back" functionality
   */
  async initiateRevocation(
    storyId: string,
    userId: string,
    tenantId: string,
    options: RevocationOptions
  ): Promise<RevocationResult> {
    const startTime = Date.now()
    const result: RevocationResult = {
      storyId,
      success: true,
      embedsRevoked: 0,
      distributionsRevoked: 0,
      webhooksSent: 0,
      webhooksFailed: 0,
      errors: []
    }

    try {
      // 1. Verify story ownership
      const { data: story, error: storyError } = await this.supabase
        .from('stories')
        .select('id, author_id, storyteller_id, title, status')
        .eq('id', storyId)
        .single()

      if (storyError || !story) {
        throw new Error('Story not found')
      }

      if (story.author_id !== userId && story.storyteller_id !== userId) {
        throw new Error('Unauthorized: You do not own this story')
      }

      // 2. Revoke embeds if requested
      if (options.scope === 'all' || options.scope === 'embeds') {
        try {
          const embedService = getEmbedService()
          result.embedsRevoked = await embedService.revokeAllStoryEmbeds(
            storyId,
            userId,
            tenantId,
            options.reason || 'Revoked by owner'
          )
        } catch (err) {
          result.errors.push(`Embed revocation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      // 3. Revoke distributions if requested
      if (options.scope === 'all' || options.scope === 'distributions') {
        try {
          const distributionService = getDistributionService()
          result.distributionsRevoked = await distributionService.revokeAllDistributions(
            storyId,
            userId,
            tenantId,
            options.reason || 'Revoked by owner'
          )

          // Send webhook notifications
          if (options.notifyWebhooks !== false) {
            const webhookResults = await distributionService.notifyAllWebhooks(
              storyId,
              'distribution_revoked',
              userId
            )
            result.webhooksSent = webhookResults.filter(r => r.success).length
            result.webhooksFailed = webhookResults.filter(r => !r.success).length
          }
        } catch (err) {
          result.errors.push(`Distribution revocation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      // 4. Archive story if full revocation
      if (options.scope === 'all' && options.archiveStory !== false) {
        try {
          await this.archiveStory(storyId, userId, tenantId, options.reason)
          result.storyArchived = true
        } catch (err) {
          result.errors.push(`Story archive failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      // 5. Update story sharing status
      if (options.disableSharing !== false) {
        await this.supabase
          .from('stories')
          .update({
            sharing_enabled: false,
            embeds_enabled: false
          })
          .eq('id', storyId)
      }

      // 6. Create comprehensive audit log
      await this.logAudit({
        tenant_id: tenantId,
        entity_type: 'story',
        entity_id: storyId,
        action: 'revoke',
        action_category: 'revocation',
        actor_id: userId,
        actor_type: 'user',
        new_state: {
          scope: options.scope,
          embedsRevoked: result.embedsRevoked,
          distributionsRevoked: result.distributionsRevoked,
          webhooksSent: result.webhooksSent,
          archived: result.storyArchived
        },
        change_summary: `Revocation initiated: ${result.embedsRevoked} embeds, ${result.distributionsRevoked} distributions revoked`
      })

      result.completedAt = new Date().toISOString()
      result.durationMs = Date.now() - startTime

    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return result
  }

  /**
   * Archive a story (soft delete)
   */
  async archiveStory(
    storyId: string,
    userId: string,
    tenantId: string,
    reason?: string
  ): Promise<void> {
    // Verify ownership
    const { data: story, error: storyError } = await this.supabase
      .from('stories')
      .select('id, author_id, storyteller_id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    if (story.author_id !== userId && story.storyteller_id !== userId) {
      throw new Error('Unauthorized')
    }

    const { error } = await this.supabase
      .from('stories')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        archive_reason: reason || 'Archived by owner',
        status: 'archived'
      })
      .eq('id', storyId)

    if (error) {
      throw new Error('Failed to archive story')
    }

    await this.logAudit({
      tenant_id: tenantId,
      entity_type: 'story',
      entity_id: storyId,
      action: 'archive',
      action_category: 'lifecycle',
      actor_id: userId,
      actor_type: 'user',
      new_state: { is_archived: true, archive_reason: reason },
      change_summary: `Story "${story.title}" archived`
    })
  }

  /**
   * Restore a story from archive
   */
  async restoreStory(
    storyId: string,
    userId: string,
    tenantId: string
  ): Promise<void> {
    // Verify ownership
    const { data: story, error: storyError } = await this.supabase
      .from('stories')
      .select('id, author_id, storyteller_id, title, is_archived')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    if (story.author_id !== userId && story.storyteller_id !== userId) {
      throw new Error('Unauthorized')
    }

    if (!story.is_archived) {
      throw new Error('Story is not archived')
    }

    const { error } = await this.supabase
      .from('stories')
      .update({
        is_archived: false,
        archived_at: null,
        archive_reason: null,
        status: 'draft' // Restore to draft status
      })
      .eq('id', storyId)

    if (error) {
      throw new Error('Failed to restore story')
    }

    await this.logAudit({
      tenant_id: tenantId,
      entity_type: 'story',
      entity_id: storyId,
      action: 'restore',
      action_category: 'lifecycle',
      actor_id: userId,
      actor_type: 'user',
      previous_state: { is_archived: true },
      new_state: { is_archived: false },
      change_summary: `Story "${story.title}" restored from archive`
    })
  }

  /**
   * Cascade consent withdrawal - revokes all distributions and disables sharing
   */
  async cascadeConsentWithdrawal(
    storyId: string,
    userId: string,
    tenantId: string
  ): Promise<CascadeResult> {
    const result: CascadeResult = {
      storyId,
      success: true,
      itemsAffected: 0,
      actions: []
    }

    try {
      // 1. Verify ownership
      const { data: story, error: storyError } = await this.supabase
        .from('stories')
        .select('id, author_id, storyteller_id, title')
        .eq('id', storyId)
        .single()

      if (storyError || !story) {
        throw new Error('Story not found')
      }

      if (story.author_id !== userId && story.storyteller_id !== userId) {
        throw new Error('Unauthorized')
      }

      // 2. Update story consent status
      await this.supabase
        .from('stories')
        .update({
          has_consent: false,
          consent_verified: false,
          consent_withdrawn_at: new Date().toISOString(),
          sharing_enabled: false,
          embeds_enabled: false
        })
        .eq('id', storyId)

      result.actions.push('Consent status updated')

      // 3. Revoke all embeds
      const embedService = getEmbedService()
      const embedsRevoked = await embedService.revokeAllStoryEmbeds(
        storyId,
        userId,
        tenantId,
        'Consent withdrawn'
      )
      result.itemsAffected += embedsRevoked
      result.actions.push(`${embedsRevoked} embed tokens revoked`)

      // 4. Revoke all distributions
      const distributionService = getDistributionService()
      const distributionsRevoked = await distributionService.revokeAllDistributions(
        storyId,
        userId,
        tenantId,
        'Consent withdrawn'
      )
      result.itemsAffected += distributionsRevoked
      result.actions.push(`${distributionsRevoked} distributions revoked`)

      // 5. Send webhook notifications
      const webhookResults = await distributionService.notifyAllWebhooks(
        storyId,
        'consent_withdrawn',
        userId
      )
      const webhooksSent = webhookResults.filter(r => r.success).length
      result.actions.push(`${webhooksSent} webhooks notified`)

      // 6. Create audit log
      await this.logAudit({
        tenant_id: tenantId,
        entity_type: 'story',
        entity_id: storyId,
        action: 'consent_withdraw',
        action_category: 'consent',
        actor_id: userId,
        actor_type: 'user',
        new_state: {
          has_consent: false,
          embedsRevoked,
          distributionsRevoked
        },
        change_summary: `Consent withdrawn for "${story.title}" - ${result.itemsAffected} items affected`
      })

    } catch (error) {
      result.success = false
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return result
  }

  /**
   * Get revocation preview - show what will be affected
   */
  async getRevocationPreview(
    storyId: string,
    userId: string,
    scope: RevocationOptions['scope']
  ): Promise<{
    storyTitle: string
    activeEmbeds: number
    activeDistributions: number
    totalViews: number
    webhooksConfigured: number
    estimatedActions: string[]
  }> {
    // Verify ownership
    const { data: story, error: storyError } = await this.supabase
      .from('stories')
      .select('id, author_id, storyteller_id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    if (story.author_id !== userId && story.storyteller_id !== userId) {
      throw new Error('Unauthorized')
    }

    // Get embed count
    const { count: embedCount } = await this.supabase
      .from('embed_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)
      .eq('status', 'active')

    // Get distribution info
    const { data: distributions } = await this.supabase
      .from('story_distributions')
      .select('view_count, webhook_url')
      .eq('story_id', storyId)
      .eq('status', 'active')

    const activeDistributions = distributions?.length || 0
    const totalViews = distributions?.reduce((sum, d) => sum + (d.view_count || 0), 0) || 0
    const webhooksConfigured = distributions?.filter(d => d.webhook_url).length || 0

    const estimatedActions: string[] = []

    if (scope === 'all' || scope === 'embeds') {
      estimatedActions.push(`Revoke ${embedCount || 0} embed tokens`)
    }
    if (scope === 'all' || scope === 'distributions') {
      estimatedActions.push(`Revoke ${activeDistributions} distributions`)
      if (webhooksConfigured > 0) {
        estimatedActions.push(`Send ${webhooksConfigured} webhook notifications`)
      }
    }
    if (scope === 'all') {
      estimatedActions.push('Archive story')
      estimatedActions.push('Disable future sharing')
    }

    return {
      storyTitle: story.title || 'Untitled',
      activeEmbeds: embedCount || 0,
      activeDistributions,
      totalViews,
      webhooksConfigured,
      estimatedActions
    }
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private async logAudit(entry: AuditLogInsert): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert(entry)
    } catch (error) {
      console.error('Failed to create audit log:', error)
    }
  }
}

// ==========================================================================
// FACTORY FUNCTION
// ==========================================================================

let revocationServiceInstance: RevocationService | null = null

export function getRevocationService(): RevocationService {
  if (!revocationServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    revocationServiceInstance = new RevocationService(supabaseUrl, supabaseKey)
  }

  return revocationServiceInstance
}

export default RevocationService
