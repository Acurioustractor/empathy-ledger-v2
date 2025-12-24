import { createClient } from '@supabase/supabase-js'
import {
  StoryDistributionRow,
  StoryDistributionInsert,
  StoryDistributionUpdate,
  DistributionPlatform,
  DistributionMap,
  DistributionAnalytics,
  WebhookEvent,
  WebhookResult,
  AuditLogInsert
} from '@/types/database/story-ownership'

/**
 * Cultural safety validation result
 */
export interface CulturalSafetyValidation {
  allowed: boolean
  reason?: string
  requiresElderApproval?: boolean
  sensitivityLevel?: string
  culturalReviewStatus?: string
}

/**
 * User cultural permissions structure
 * Stored in profiles.cultural_permissions JSON field
 */
export interface CulturalPermissions {
  can_share_traditional?: boolean
  can_share_ceremonial?: boolean
  can_share_restricted?: boolean
  cultural_affiliations?: string[]
  elder_approved?: boolean
  permissions_granted_by?: string
  permissions_granted_at?: string
}

/**
 * DistributionService
 * Manages story distribution tracking, webhook notifications, and analytics.
 */
export class DistributionService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Validate cultural safety before allowing distribution
   * Implements OCAP enforcement at the distribution level
   */
  async validateDistributionSafety(
    storyId: string,
    userId: string
  ): Promise<CulturalSafetyValidation> {
    // Fetch story with cultural context including cultural_tags
    const { data: story, error: storyError } = await this.supabase
      .from('stories')
      .select(`
        id,
        cultural_sensitivity_level,
        cultural_review_status,
        requires_elder_review,
        elder_approval,
        has_consent,
        consent_verified,
        consent_withdrawn_at,
        cultural_context,
        cultural_tags
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return { allowed: false, reason: 'Story not found' }
    }

    // Check if consent has been withdrawn
    if (story.consent_withdrawn_at) {
      return {
        allowed: false,
        reason: 'Consent has been withdrawn for this story'
      }
    }

    // Check if consent is verified
    if (!story.has_consent || !story.consent_verified) {
      return {
        allowed: false,
        reason: 'Story requires verified consent before distribution'
      }
    }

    // CRITICAL: Block SACRED content from external distribution entirely
    if (story.cultural_sensitivity_level === 'sacred') {
      return {
        allowed: false,
        reason: 'Sacred content cannot be distributed externally',
        sensitivityLevel: 'sacred'
      }
    }

    // CRITICAL: HIGH sensitivity requires elder approval
    if (story.cultural_sensitivity_level === 'high') {
      if (!story.elder_approval) {
        return {
          allowed: false,
          reason: 'HIGH sensitivity stories require elder approval before distribution',
          requiresElderApproval: true,
          sensitivityLevel: 'high',
          culturalReviewStatus: story.cultural_review_status
        }
      }
    }

    // Check elder review requirement
    if (story.requires_elder_review) {
      if (story.cultural_review_status !== 'approved') {
        return {
          allowed: false,
          reason: 'Story requires elder approval before distribution',
          requiresElderApproval: true,
          culturalReviewStatus: story.cultural_review_status
        }
      }
    }

    // Fetch user's cultural permissions
    const { data: userProfile } = await this.supabase
      .from('profiles')
      .select('cultural_permissions')
      .eq('id', userId)
      .single()

    const permissions = (userProfile?.cultural_permissions || {}) as CulturalPermissions

    // Extract story's cultural tags and context
    const culturalTags = (story.cultural_tags || []) as string[]
    const culturalContext = (story.cultural_context || {}) as Record<string, boolean>

    // Check cultural permission requirements based on story tags and context
    const permissionCheck = this.checkCulturalPermissions(culturalTags, culturalContext, permissions)
    if (!permissionCheck.allowed) {
      return permissionCheck
    }

    return {
      allowed: true,
      sensitivityLevel: story.cultural_sensitivity_level,
      culturalReviewStatus: story.cultural_review_status
    }
  }

  /**
   * Check user's cultural permissions against story's cultural tags
   */
  private checkCulturalPermissions(
    culturalTags: string[],
    culturalContext: Record<string, boolean>,
    userPermissions: CulturalPermissions
  ): CulturalSafetyValidation {
    const normalizedTags = culturalTags.map(t => t.toLowerCase())

    // Check for traditional knowledge content
    const hasTraditionalKnowledge =
      normalizedTags.includes('traditional') ||
      normalizedTags.includes('traditional_knowledge') ||
      normalizedTags.includes('traditional-knowledge') ||
      culturalContext.is_traditional_knowledge === true ||
      culturalContext.contains_traditional_knowledge === true

    if (hasTraditionalKnowledge) {
      if (!userPermissions.can_share_traditional) {
        return {
          allowed: false,
          reason: 'This story contains traditional knowledge. You need cultural permission to share traditional content externally.',
          sensitivityLevel: 'traditional'
        }
      }
    }

    // Check for ceremonial content
    const hasCeremonialContent =
      normalizedTags.includes('ceremonial') ||
      normalizedTags.includes('ceremony') ||
      culturalContext.is_ceremonial === true ||
      culturalContext.contains_ceremonial_content === true

    if (hasCeremonialContent) {
      if (!userPermissions.can_share_ceremonial) {
        return {
          allowed: false,
          reason: 'This story contains ceremonial content. You need cultural permission to share ceremonial content externally.',
          sensitivityLevel: 'ceremonial'
        }
      }
    }

    // Check for sacred content (already blocked by sensitivity level, but double-check tags)
    const hasSacredContent =
      normalizedTags.includes('sacred') ||
      culturalContext.is_sacred === true

    if (hasSacredContent) {
      return {
        allowed: false,
        reason: 'This story is marked as sacred content and cannot be distributed externally.',
        sensitivityLevel: 'sacred'
      }
    }

    // Check for restricted content types
    const hasRestrictedContent =
      normalizedTags.includes('restricted') ||
      normalizedTags.includes('community-only') ||
      culturalContext.is_restricted === true

    if (hasRestrictedContent) {
      if (!userPermissions.can_share_restricted) {
        return {
          allowed: false,
          reason: 'This story is marked as restricted/community-only content and cannot be distributed externally.',
          sensitivityLevel: 'restricted'
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Register a new distribution for a story
   */
  async registerDistribution(
    storyId: string,
    userId: string,
    tenantId: string | null | undefined,
    data: {
      platform: DistributionPlatform
      platformPostId?: string
      distributionUrl?: string
      embedDomain?: string
      webhookUrl?: string
      webhookSecret?: string
      notes?: string
      expiresAt?: Date
    }
  ): Promise<StoryDistributionRow> {
    // CULTURAL SAFETY CHECK - Validate before allowing distribution
    const safetyCheck = await this.validateDistributionSafety(storyId, userId)
    if (!safetyCheck.allowed) {
      throw new Error(`Distribution blocked: ${safetyCheck.reason}`)
    }

    // Verify story ownership
    const { data: story, error: storyError } = await this.supabase
      .from('stories')
      .select('id, author_id, storyteller_id, has_consent, consent_verified, title, organization_id, tenant_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    if (story.author_id !== userId && story.storyteller_id !== userId) {
      throw new Error('Unauthorized: You do not own this story')
    }

    const resolvedTenantId = await this.resolveTenantContext(
      story.organization_id,
      story.tenant_id,
      tenantId
    )

    if (!resolvedTenantId) {
      throw new Error('Tenant context not found for story')
    }

    // Create distribution record
    const distributionData: StoryDistributionInsert = {
      story_id: storyId,
      tenant_id: resolvedTenantId,
      organization_id: story.organization_id || null,
      platform: data.platform,
      platform_post_id: data.platformPostId || null,
      distribution_url: data.distributionUrl || null,
      embed_domain: data.embedDomain || null,
      webhook_url: data.webhookUrl || null,
      webhook_secret: data.webhookSecret || null,
      notes: data.notes || null,
      expires_at: data.expiresAt?.toISOString() || null,
      status: 'active',
      created_by: userId,
      consent_snapshot: {
        has_consent: story.has_consent,
        consent_verified: story.consent_verified,
        recorded_at: new Date().toISOString()
      }
    }

    const { data: distribution, error } = await this.supabase
      .from('story_distributions')
      .insert(distributionData)
      .select('*')
      .single()

    if (error) {
      console.error('Failed to create distribution:', error)
      throw new Error('Failed to register distribution')
    }

    // Create audit log
    await this.logAudit({
      tenant_id: resolvedTenantId,
      organization_id: story.organization_id || null,
      entity_type: 'distribution',
      entity_id: distribution.id,
      action: 'share',
      action_category: 'distribution',
      actor_id: userId,
      actor_type: 'user',
      new_state: distributionData,
      change_summary: `Registered ${data.platform} distribution for story "${story.title}"`
    })

    return distribution
  }

  /**
   * Update a distribution record
   */
  async updateDistribution(
    distributionId: string,
    userId: string,
    tenantId: string | null | undefined,
    updates: StoryDistributionUpdate
  ): Promise<StoryDistributionRow> {
    // Verify ownership via story
    const { data: existing, error: fetchError } = await this.supabase
      .from('story_distributions')
      .select(`
        *,
        story:stories(author_id, storyteller_id)
      `)
      .eq('id', distributionId)
      .single()

    if (fetchError || !existing) {
      throw new Error('Distribution not found')
    }

    if (existing.story.author_id !== userId && existing.story.storyteller_id !== userId) {
      throw new Error('Unauthorized')
    }

    const { data: updated, error } = await this.supabase
      .from('story_distributions')
      .update(updates)
      .eq('id', distributionId)
      .select('*')
      .single()

    if (error) {
      throw new Error('Failed to update distribution')
    }

    // Audit log
    await this.logAudit({
      tenant_id: tenantId || existing.tenant_id,
      organization_id: existing.organization_id || null,
      entity_type: 'distribution',
      entity_id: distributionId,
      action: 'update',
      action_category: 'distribution',
      actor_id: userId,
      actor_type: 'user',
      previous_state: existing,
      new_state: updated,
      change_summary: 'Distribution updated'
    })

    return updated
  }

  /**
   * Get all distributions for a story
   */
  async getStoryDistributions(storyId: string): Promise<StoryDistributionRow[]> {
    const { data, error } = await this.supabase
      .from('story_distributions')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch distributions')
    }

    return data || []
  }

  /**
   * Get distribution map for a story (aggregated view)
   */
  async getDistributionMap(storyId: string): Promise<DistributionMap> {
    const distributions = await this.getStoryDistributions(storyId)

    // Aggregate by platform
    const byPlatform: DistributionMap['byPlatform'] = {} as any

    const platforms: DistributionPlatform[] = [
      'embed', 'twitter', 'facebook', 'linkedin', 'website', 'blog', 'api', 'rss', 'newsletter', 'custom'
    ]

    platforms.forEach(platform => {
      const platformDists = distributions.filter(d => d.platform === platform)
      byPlatform[platform] = {
        count: platformDists.length,
        views: platformDists.reduce((sum, d) => sum + (d.view_count || 0), 0),
        active: platformDists.filter(d => d.status === 'active').length
      }
    })

    return {
      storyId,
      totalDistributions: distributions.length,
      activeDistributions: distributions.filter(d => d.status === 'active').length,
      revokedDistributions: distributions.filter(d => d.status === 'revoked').length,
      totalViews: distributions.reduce((sum, d) => sum + (d.view_count || 0), 0),
      byPlatform,
      distributions
    }
  }

  /**
   * Get distribution analytics for a story
   */
  async getDistributionAnalytics(storyId: string): Promise<DistributionAnalytics> {
    const distributions = await this.getStoryDistributions(storyId)

    // Aggregate views by platform
    const viewsByPlatform: Record<DistributionPlatform, number> = {} as any
    distributions.forEach(d => {
      viewsByPlatform[d.platform] = (viewsByPlatform[d.platform] || 0) + (d.view_count || 0)
    })

    // Get top domains (for embeds)
    const domainViews: Record<string, number> = {}
    distributions
      .filter(d => d.platform === 'embed' && d.embed_domain)
      .forEach(d => {
        domainViews[d.embed_domain!] = (domainViews[d.embed_domain!] || 0) + (d.view_count || 0)
      })

    const topDomains = Object.entries(domainViews)
      .map(([domain, views]) => ({ domain, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return {
      storyId,
      totalViews: distributions.reduce((sum, d) => sum + (d.view_count || 0), 0),
      totalClicks: distributions.reduce((sum, d) => sum + (d.click_count || 0), 0),
      viewsByPlatform,
      viewsOverTime: [], // Would need separate analytics table for time-series
      topDomains
    }
  }

  /**
   * Revoke a single distribution
   */
  async revokeDistribution(
    distributionId: string,
    userId: string,
    tenantId: string | null | undefined,
    reason?: string
  ): Promise<void> {
    // Verify ownership
    const { data: existing, error: fetchError } = await this.supabase
      .from('story_distributions')
      .select(`
        *,
        story:stories(author_id, storyteller_id, title)
      `)
      .eq('id', distributionId)
      .single()

    if (fetchError || !existing) {
      throw new Error('Distribution not found')
    }

    if (existing.story.author_id !== userId && existing.story.storyteller_id !== userId) {
      throw new Error('Unauthorized')
    }

    const { error } = await this.supabase
      .from('story_distributions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revocation_reason: reason || 'Revoked by owner'
      })
      .eq('id', distributionId)

    if (error) {
      throw new Error('Failed to revoke distribution')
    }

    // Send webhook notification if configured
    if (existing.webhook_url) {
      await this.sendWebhookNotification(existing, 'distribution_revoked', userId)
    }

    // Audit log
    await this.logAudit({
      tenant_id: tenantId || existing.tenant_id,
      organization_id: existing.organization_id || null,
      entity_type: 'distribution',
      entity_id: distributionId,
      action: 'revoke',
      action_category: 'revocation',
      actor_id: userId,
      actor_type: 'user',
      previous_state: { status: existing.status },
      new_state: { status: 'revoked', revocation_reason: reason },
      change_summary: `Revoked ${existing.platform} distribution for "${existing.story.title}"`
    })
  }

  /**
   * Revoke all distributions for a story
   */
  async revokeAllDistributions(
    storyId: string,
    userId: string,
    tenantId: string | null | undefined,
    reason?: string
  ): Promise<number> {
    // Get all active distributions
    const { data: distributions, error: fetchError } = await this.supabase
      .from('story_distributions')
      .select('*')
      .eq('story_id', storyId)
      .eq('status', 'active')

    if (fetchError) {
      throw new Error('Failed to fetch distributions')
    }

    if (!distributions || distributions.length === 0) {
      return 0
    }

    // Revoke all
    const { error } = await this.supabase
      .from('story_distributions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revocation_reason: reason || 'All distributions revoked'
      })
      .eq('story_id', storyId)
      .eq('status', 'active')

    if (error) {
      throw new Error('Failed to revoke distributions')
    }

    // Send webhook notifications (fire and forget)
    const withWebhooks = distributions.filter(d => d.webhook_url)
    for (const dist of withWebhooks) {
      this.sendWebhookNotification(dist, 'distribution_revoked', userId)
        .catch(err => console.error('Webhook notification failed:', err))
    }

    // Audit log
    const resolvedTenantId = tenantId || distributions?.[0]?.tenant_id || null
    const resolvedOrganizationId = distributions?.[0]?.organization_id || null

    if (!resolvedTenantId) {
      throw new Error('Tenant context not found for distributions')
    }

    await this.logAudit({
      tenant_id: resolvedTenantId,
      organization_id: resolvedOrganizationId,
      entity_type: 'story',
      entity_id: storyId,
      action: 'revoke',
      action_category: 'revocation',
      actor_id: userId,
      actor_type: 'user',
      change_summary: `Revoked ${distributions.length} distributions`
    })

    return distributions.length
  }

  /**
   * Send webhook notification for distribution events
   */
  async sendWebhookNotification(
    distribution: StoryDistributionRow,
    eventType: WebhookEvent['type'],
    actorId: string
  ): Promise<WebhookResult> {
    if (!distribution.webhook_url) {
      return {
        distributionId: distribution.id,
        success: false,
        error: 'No webhook URL configured'
      }
    }

    const payload: WebhookEvent = {
      type: eventType,
      storyId: distribution.story_id,
      distributionId: distribution.id,
      timestamp: new Date().toISOString(),
      payload: {
        platform: distribution.platform,
        status: distribution.status,
        platform_post_id: distribution.platform_post_id
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Empathy-Ledger-Event': eventType,
        'X-Empathy-Ledger-Distribution': distribution.id
      }

      // Add signature if webhook secret is configured
      if (distribution.webhook_secret) {
        const crypto = await import('crypto')
        const signature = crypto
          .createHmac('sha256', distribution.webhook_secret)
          .update(JSON.stringify(payload))
          .digest('hex')
        headers['X-Empathy-Ledger-Signature'] = `sha256=${signature}`
      }

      const response = await fetch(distribution.webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      // Update webhook status
      await this.supabase
        .from('story_distributions')
        .update({
          webhook_notified_at: new Date().toISOString(),
          webhook_response: {
            status: response.status,
            ok: response.ok
          },
          webhook_retry_count: distribution.webhook_retry_count + 1
        })
        .eq('id', distribution.id)

      return {
        distributionId: distribution.id,
        success: response.ok,
        statusCode: response.status
      }
    } catch (error) {
      // Update failure status
      await this.supabase
        .from('story_distributions')
        .update({
          webhook_response: { error: error instanceof Error ? error.message : 'Unknown error' },
          webhook_retry_count: distribution.webhook_retry_count + 1
        })
        .eq('id', distribution.id)

      return {
        distributionId: distribution.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Notify all webhooks for a story
   */
  async notifyAllWebhooks(
    storyId: string,
    eventType: WebhookEvent['type'],
    actorId: string
  ): Promise<WebhookResult[]> {
    const { data: distributions } = await this.supabase
      .from('story_distributions')
      .select('*')
      .eq('story_id', storyId)
      .not('webhook_url', 'is', null)

    if (!distributions || distributions.length === 0) {
      return []
    }

    const results: WebhookResult[] = []
    for (const dist of distributions) {
      const result = await this.sendWebhookNotification(dist, eventType, actorId)
      results.push(result)
    }

    return results
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

  private async resolveTenantContext(
    organizationId: string | null,
    storyTenantId: string | null,
    fallbackTenantId?: string | null
  ): Promise<string | null> {
    if (organizationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: org } = await (this.supabase as any)
        .from('organisations')
        .select('tenant_id')
        .eq('id', organizationId)
        .single()

      if (org?.tenant_id) {
        return org.tenant_id
      }
    }

    return storyTenantId || fallbackTenantId || null
  }
}

// ==========================================================================
// FACTORY FUNCTION
// ==========================================================================

let distributionServiceInstance: DistributionService | null = null

export function getDistributionService(): DistributionService {
  if (!distributionServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    distributionServiceInstance = new DistributionService(supabaseUrl, supabaseKey)
  }

  return distributionServiceInstance
}

export default DistributionService
