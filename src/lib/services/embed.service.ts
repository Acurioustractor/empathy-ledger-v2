import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import {
  EmbedTokenRow,
  EmbedTokenInsert,
  EmbedOptions,
  EmbedToken,
  EmbeddableStory,
  ViewMetadata,
  StoryDistributionInsert,
  AuditLogInsert
} from '@/types/database/story-ownership'

/**
 * Cultural safety validation result for embed operations
 */
export interface EmbedCulturalSafetyResult {
  allowed: boolean
  reason?: string
  sensitivityLevel?: string
  requiresElderApproval?: boolean
}

/**
 * EmbedService
 * Handles embed token generation, validation, and story retrieval for external embedding.
 * Implements consent checks, domain restrictions, cultural safety validation, and analytics tracking.
 */
export class EmbedService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Generate a secure embed token for a story
   */
  async generateEmbedToken(
    storyId: string,
    userId: string,
    tenantId: string | null | undefined,
    options: EmbedOptions
  ): Promise<EmbedToken> {
    // 1. Verify the user owns the story and check cultural safety
    const { data: story, error: storyError } = await this.supabase
      .from('stories')
      .select(`
        id, author_id, storyteller_id, has_consent, consent_verified, embeds_enabled, title, organization_id, tenant_id,
        cultural_sensitivity_level, elder_approval, cultural_review_status, requires_elder_review
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    if (story.author_id !== userId && story.storyteller_id !== userId) {
      throw new Error('Unauthorized: You do not own this story')
    }

    if (!story.embeds_enabled) {
      throw new Error('Embeds are disabled for this story')
    }

    if (!story.has_consent || !story.consent_verified) {
      throw new Error('Story consent not verified - embeds require verified consent')
    }

    // 2. CRITICAL: Cultural safety validation for embedding
    const culturalSafetyResult = this.validateCulturalSafetyForEmbed(story)
    if (!culturalSafetyResult.allowed) {
      throw new Error(culturalSafetyResult.reason || 'Cultural safety validation failed')
    }

    const resolvedTenantId = await this.resolveTenantContext(
      story.organization_id,
      story.tenant_id,
      tenantId
    )

    if (!resolvedTenantId) {
      throw new Error('Tenant context not found for story')
    }

    // 3. Generate secure token
    const token = this.generateSecureToken()
    const tokenHash = this.hashToken(token)

    // 4. Create distribution record first
    const distributionData: StoryDistributionInsert = {
      story_id: storyId,
      tenant_id: resolvedTenantId,
      organization_id: story.organization_id || null,
      platform: 'embed',
      status: 'active',
      created_by: userId,
      consent_snapshot: {
        has_consent: story.has_consent,
        consent_verified: story.consent_verified,
        generated_at: new Date().toISOString()
      }
    }

    const { data: distribution, error: distError } = await this.supabase
      .from('story_distributions')
      .insert(distributionData)
      .select('id')
      .single()

    if (distError) {
      console.error('Failed to create distribution record:', distError)
      throw new Error('Failed to create distribution record')
    }

    // 5. Store the token
    const tokenData: EmbedTokenInsert = {
      story_id: storyId,
      tenant_id: resolvedTenantId,
      organization_id: story.organization_id || null,
      token: token, // Store the actual token (could encrypt in production)
      token_hash: tokenHash,
      allowed_domains: options.domains.length > 0 ? options.domains : null,
      expires_at: options.expiresAt?.toISOString() || null,
      allow_analytics: options.allowAnalytics ?? true,
      show_attribution: options.showAttribution ?? true,
      custom_styles: options.customStyles || null,
      created_by: userId,
      distribution_id: distribution.id
    }

    const { data: savedToken, error: tokenError } = await this.supabase
      .from('embed_tokens')
      .insert(tokenData)
      .select('id, expires_at, allowed_domains')
      .single()

    if (tokenError) {
      console.error('Failed to save embed token:', tokenError)
      throw new Error('Failed to generate embed token')
    }

    // 6. Create audit log
    await this.logAudit({
      tenant_id: resolvedTenantId,
      organization_id: story.organization_id || null,
      entity_type: 'embed_token',
      entity_id: savedToken.id,
      action: 'token_generate',
      action_category: 'distribution',
      actor_id: userId,
      actor_type: 'user',
      new_state: {
        story_id: storyId,
        domains: options.domains,
        expires_at: options.expiresAt?.toISOString()
      },
      change_summary: `Generated embed token for story "${story.title}"`
    })

    // 7. Generate embed code snippet
    const embedCode = this.generateEmbedCode(storyId, token)

    return {
      token,
      tokenId: savedToken.id,
      embedCode,
      expiresAt: savedToken.expires_at,
      allowedDomains: savedToken.allowed_domains || []
    }
  }

  /**
   * Validate an embed token and return the story if valid
   */
  async validateEmbedAccess(
    tokenOrHash: string,
    domain: string
  ): Promise<{ valid: boolean; storyId?: string; tokenId?: string; error?: string }> {
    // Try to find by token hash first, then by raw token
    const tokenHash = this.hashToken(tokenOrHash)

    const { data: token, error } = await this.supabase
      .from('embed_tokens')
      .select('*')
      .or(`token_hash.eq.${tokenHash},token.eq.${tokenOrHash}`)
      .single()

    if (error || !token) {
      return { valid: false, error: 'Token not found' }
    }

    // Check token status
    if (token.status !== 'active') {
      return { valid: false, storyId: token.story_id, tokenId: token.id, error: `Token is ${token.status}` }
    }

    // Check expiration
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return { valid: false, storyId: token.story_id, tokenId: token.id, error: 'Token has expired' }
    }

    // Check domain restrictions
    if (token.allowed_domains && token.allowed_domains.length > 0) {
      const normalizedDomain = this.normalizeDomain(domain)
      const isAllowed = token.allowed_domains.some(
        (d: string) => this.normalizeDomain(d) === normalizedDomain || normalizedDomain.endsWith('.' + this.normalizeDomain(d))
      )
      if (!isAllowed) {
        return { valid: false, storyId: token.story_id, tokenId: token.id, error: 'Domain not allowed' }
      }
    }

    return { valid: true, storyId: token.story_id, tokenId: token.id }
  }

  /**
   * Get an embeddable story by ID (after validation)
   * Includes cultural safety validation as defense-in-depth
   */
  async getEmbeddableStory(storyId: string): Promise<EmbeddableStory | null> {
    // Fetch story with author/storyteller info and cultural safety fields
    const { data: story, error } = await this.supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        excerpt,
        description,
        created_at,
        cultural_context,
        has_consent,
        consent_verified,
        embeds_enabled,
        is_archived,
        status,
        cultural_sensitivity_level,
        elder_approval,
        cultural_review_status,
        requires_elder_review,
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          profile_image_url
        ),
        storyteller:profiles!stories_storyteller_id_fkey(
          id,
          display_name,
          profile_image_url
        )
      `)
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return null
    }

    // Verify consent and embed eligibility
    if (!story.has_consent || !story.consent_verified) {
      return null
    }

    if (!story.embeds_enabled) {
      return null
    }

    if (story.is_archived || story.status === 'archived') {
      return null
    }

    // CRITICAL: Re-validate cultural safety (defense in depth)
    // This blocks content even if token was created before restrictions
    const culturalSafetyResult = this.validateCulturalSafetyForEmbed(story)
    if (!culturalSafetyResult.allowed) {
      console.warn(`Cultural safety block on embed retrieval for story ${storyId}: ${culturalSafetyResult.reason}`)
      return null
    }

    // Sanitize and return embeddable data
    return {
      id: story.id,
      title: story.title || 'Untitled Story',
      content: this.sanitizeContent(story.content || ''),
      excerpt: story.excerpt || story.description || null,
      author: story.author ? {
        displayName: story.author.display_name || 'Anonymous',
        profileImage: story.author.profile_image_url
      } : null,
      storyteller: story.storyteller ? {
        displayName: story.storyteller.display_name || 'Anonymous',
        profileImage: story.storyteller.profile_image_url
      } : null,
      createdAt: story.created_at,
      culturalContext: story.cultural_context,
      attribution: this.generateAttribution(story)
    }
  }

  /**
   * Track an embed view
   */
  async trackEmbedView(
    tokenId: string,
    distributionId: string | null,
    metadata: ViewMetadata
  ): Promise<void> {
    // Update token usage
    await this.supabase
      .from('embed_tokens')
      .update({
        usage_count: this.supabase.rpc('increment_usage', { row_id: tokenId }),
        last_used_at: new Date().toISOString(),
        last_used_domain: metadata.domain,
        last_used_ip: metadata.ip
      })
      .eq('id', tokenId)

    // Update distribution view count if we have one
    if (distributionId) {
      await this.supabase.rpc('increment_distribution_view', {
        distribution_id: distributionId
      })
    }
  }

  /**
   * Revoke an embed token
   */
  async revokeEmbedToken(
    tokenId: string,
    userId: string,
    tenantId: string | null | undefined,
    reason?: string
  ): Promise<void> {
    const { data: token, error: fetchError } = await this.supabase
      .from('embed_tokens')
      .select('story_id, tenant_id, organization_id')
      .eq('id', tokenId)
      .single()

    if (fetchError || !token) {
      throw new Error('Token not found')
    }

    const { error } = await this.supabase
      .from('embed_tokens')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revocation_reason: reason || 'Revoked by owner'
      })
      .eq('id', tokenId)

    if (error) {
      throw new Error('Failed to revoke token')
    }

    // Create audit log
    const resolvedTenantId = tenantId || token.tenant_id

    if (!resolvedTenantId) {
      throw new Error('Tenant context not found for embed token')
    }

    await this.logAudit({
      tenant_id: resolvedTenantId,
      organization_id: token.organization_id || null,
      entity_type: 'embed_token',
      entity_id: tokenId,
      action: 'token_revoke',
      action_category: 'revocation',
      actor_id: userId,
      actor_type: 'user',
      change_summary: reason || 'Token revoked by owner'
    })
  }

  /**
   * List active embeds for a story
   */
  async listActiveEmbeds(storyId: string): Promise<EmbedTokenRow[]> {
    const { data, error } = await this.supabase
      .from('embed_tokens')
      .select('*')
      .eq('story_id', storyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch embed tokens')
    }

    return data || []
  }

  /**
   * Revoke all embed tokens for a story
   */
  async revokeAllStoryEmbeds(
    storyId: string,
    userId: string,
    tenantId: string | null | undefined,
    reason?: string
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from('embed_tokens')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revocation_reason: reason || 'All embeds revoked'
      })
      .eq('story_id', storyId)
      .eq('status', 'active')
      .select('id')

    if (error) {
      throw new Error('Failed to revoke embed tokens')
    }

    const count = data?.length || 0

    if (count > 0) {
      const { data: tokenContext } = await this.supabase
        .from('embed_tokens')
        .select('tenant_id, organization_id')
        .eq('story_id', storyId)
        .limit(1)
        .single()

      const resolvedTenantId = tenantId || tokenContext?.tenant_id

      if (!resolvedTenantId) {
        throw new Error('Tenant context not found for embed revocation')
      }

      await this.logAudit({
        tenant_id: resolvedTenantId,
        organization_id: tokenContext?.organization_id || null,
        entity_type: 'story',
        entity_id: storyId,
        action: 'revoke',
        action_category: 'revocation',
        actor_id: userId,
        actor_type: 'user',
        change_summary: `Revoked ${count} embed tokens`
      })
    }

    return count
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * CRITICAL: Validate cultural safety before allowing external embedding
   * Implements OCAP (Ownership, Control, Access, Possession) principles
   */
  private validateCulturalSafetyForEmbed(story: {
    cultural_sensitivity_level?: string | null
    elder_approval?: boolean | null
    cultural_review_status?: string | null
    requires_elder_review?: boolean | null
  }): EmbedCulturalSafetyResult {
    const sensitivityLevel = story.cultural_sensitivity_level?.toLowerCase() || 'standard'

    // CRITICAL: Sacred content CANNOT be embedded externally under any circumstances
    if (sensitivityLevel === 'sacred') {
      return {
        allowed: false,
        reason: 'Sacred content cannot be embedded externally. This content is protected under OCAP principles and must remain within the community.',
        sensitivityLevel: 'sacred'
      }
    }

    // CRITICAL: HIGH sensitivity requires elder approval for external embedding
    if (sensitivityLevel === 'high') {
      if (!story.elder_approval) {
        return {
          allowed: false,
          reason: 'HIGH sensitivity stories require elder approval before external embedding. Please request elder review through the cultural safety workflow.',
          sensitivityLevel: 'high',
          requiresElderApproval: true
        }
      }
    }

    // MEDIUM sensitivity: Check if elder review is required but not completed
    if (sensitivityLevel === 'medium' && story.requires_elder_review) {
      if (story.cultural_review_status !== 'approved') {
        return {
          allowed: false,
          reason: 'This story requires elder review before external embedding. Current status: ' + (story.cultural_review_status || 'pending'),
          sensitivityLevel: 'medium',
          requiresElderApproval: true
        }
      }
    }

    // Standard sensitivity or approved content - allow embedding
    return {
      allowed: true,
      sensitivityLevel
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

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private normalizeDomain(domain: string): string {
    return domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
  }

  private sanitizeContent(content: string): string {
    // Basic XSS prevention - strip script tags and event handlers
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
  }

  private generateAttribution(story: any): string {
    const parts = []
    if (story.storyteller?.display_name) {
      parts.push(`Story by ${story.storyteller.display_name}`)
    }
    parts.push('Shared via Empathy Ledger')
    return parts.join(' | ')
  }

  private generateEmbedCode(storyId: string, token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
    return `<!-- Empathy Ledger Story Embed -->
<div id="empathy-ledger-embed-${storyId}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${baseUrl}/api/embed/stories/${storyId}/widget.js?token=${token}';
  script.async = true;
  document.getElementById('empathy-ledger-embed-${storyId}').appendChild(script);
})();
</script>
<!-- End Empathy Ledger Embed -->`
  }

  private async logAudit(entry: AuditLogInsert): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert(entry)
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw - audit logging should not break main functionality
    }
  }
}

// ==========================================================================
// FACTORY FUNCTION
// ==========================================================================

let embedServiceInstance: EmbedService | null = null

export function getEmbedService(): EmbedService {
  if (!embedServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    embedServiceInstance = new EmbedService(supabaseUrl, supabaseKey)
  }

  return embedServiceInstance
}

export default EmbedService
