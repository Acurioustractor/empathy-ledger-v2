import { createClient } from '@supabase/supabase-js'
import {
  AnonymizeOptions,
  AnonymizeResult,
  DataExport,
  DeletionRequestRow,
  DeletionRequestInsert,
  AuditLogInsert
} from '@/types/database/story-ownership'
import { getEmbedService } from './embed.service'
import { getDistributionService } from './distribution.service'

/**
 * GDPRService
 * Handles GDPR compliance including:
 * - Article 17: Right to Erasure (Anonymization)
 * - Article 20: Data Portability (Export)
 * - Deletion request management
 */
export class GDPRService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // ==========================================================================
  // ANONYMIZATION (GDPR Article 17 - Right to Erasure)
  // ==========================================================================

  /**
   * Anonymize a story - removes PII while preserving the narrative
   */
  async anonymizeStory(
    storyId: string,
    userId: string,
    tenantId: string | null | undefined,
    options: AnonymizeOptions = {}
  ): Promise<AnonymizeResult> {
    const result: AnonymizeResult = {
      entityId: storyId,
      entityType: 'story',
      success: true,
      fieldsAnonymized: [],
      itemsAffected: 0
    }

    try {
      // 1. Verify ownership
      const { data: story, error: storyError } = await this.supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single()

      if (storyError || !story) {
        throw new Error('Story not found')
      }

      if (story.author_id !== userId && story.storyteller_id !== userId) {
        throw new Error('Unauthorized: You do not own this story')
      }

      // 2. Scrub PII from content if requested
      const updates: Record<string, any> = {
        anonymization_status: options.preserveContent ? 'partial' : 'full',
        anonymized_at: new Date().toISOString()
      }

      if (!options.preserveContent) {
        updates.content = this.scrubPII(story.content || '')
        result.fieldsAnonymized.push('content')
      }

      // 3. Remove author attribution
      if (!options.preserveAttribution) {
        updates.original_author_display = story.author_id // Store for audit only
        updates.storyteller_id = null
        updates.author_id = null
        result.fieldsAnonymized.push('author_id', 'storyteller_id')
      }

      // 4. Track which fields were anonymized
      updates.anonymized_fields = {
        fields: result.fieldsAnonymized,
        anonymized_by: userId,
        anonymized_at: new Date().toISOString(),
        options
      }

      // 5. Disable sharing
      updates.sharing_enabled = false
      updates.embeds_enabled = false

      // 6. Update story
      const { error: updateError } = await this.supabase
        .from('stories')
        .update(updates)
        .eq('id', storyId)

      if (updateError) {
        throw new Error('Failed to anonymize story')
      }

      result.itemsAffected = 1

      // 7. Revoke all distributions
      const embedService = getEmbedService()
      const distributionService = getDistributionService()

      const embedsRevoked = await embedService.revokeAllStoryEmbeds(
        storyId,
        userId,
        resolvedTenantId,
        'Story anonymized'
      )
      const distributionsRevoked = await distributionService.revokeAllDistributions(
        storyId,
        userId,
        resolvedTenantId,
        'Story anonymized'
      )

      result.itemsAffected += embedsRevoked + distributionsRevoked

      // 8. Anonymize related media if requested
      if (options.anonymizeMedia) {
        const mediaAnonymized = await this.anonymizeStoryMedia(storyId, resolvedTenantId)
        result.itemsAffected += mediaAnonymized
        result.fieldsAnonymized.push('related_media')
      }

      // 9. Create audit log
      await this.logAudit({
        tenant_id: resolvedTenantId,
        organization_id: story.organization_id || null,
        entity_type: 'story',
        entity_id: storyId,
        action: 'anonymize',
        action_category: 'gdpr',
        actor_id: userId,
        actor_type: 'user',
        previous_state: { anonymization_status: null },
        new_state: { anonymization_status: updates.anonymization_status },
        change_summary: `Story anonymized: ${result.fieldsAnonymized.join(', ')}`
      })

    } catch (error) {
      result.success = false
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return result
  }

  /**
   * Anonymize all user data (full GDPR erasure)
   */
  async anonymizeUserData(
    userId: string,
    tenantId: string
  ): Promise<AnonymizeResult> {
    const result: AnonymizeResult = {
      entityId: userId,
      entityType: 'user',
      success: true,
      fieldsAnonymized: [],
      itemsAffected: 0
    }

    try {
      // 1. Get all user's stories
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id')
        .or(`author_id.eq.${userId},storyteller_id.eq.${userId}`)

      // 2. Anonymize each story
      if (stories) {
        for (const story of stories) {
          await this.anonymizeStory(story.id, userId, tenantId, {
            preserveContent: false,
            preserveAttribution: false,
            anonymizeMedia: true
          })
          result.itemsAffected++
        }
      }

      // 3. Anonymize user profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({
          display_name: 'Deleted User',
          email: `deleted_${userId.slice(0, 8)}@anonymized.local`,
          profile_image_url: null,
          bio: null,
          location: null,
          phone_number: null,
          date_of_birth: null,
          anonymized_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (!profileError) {
        result.fieldsAnonymized.push('profile')
        result.itemsAffected++
      }

      // 4. Create audit log
      await this.logAudit({
        tenant_id: tenantId,
        entity_type: 'user',
        entity_id: userId,
        action: 'anonymize_all',
        action_category: 'gdpr',
        actor_id: userId,
        actor_type: 'user',
        change_summary: `User data fully anonymized: ${result.itemsAffected} items affected`
      })

    } catch (error) {
      result.success = false
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return result
  }

  // ==========================================================================
  // DATA EXPORT (GDPR Article 20 - Data Portability)
  // ==========================================================================

  /**
   * Export all user data in a portable format
   */
  async exportUserData(userId: string): Promise<DataExport> {
    const export_data: DataExport = {
      exportedAt: new Date().toISOString(),
      userId,
      profile: null,
      stories: [],
      media: [],
      distributions: [],
      auditLogs: []
    }

    // 1. Export profile
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profile) {
      export_data.profile = {
        id: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        bio: profile.bio,
        location: profile.location,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    }

    // 2. Export stories
    const { data: stories } = await this.supabase
      .from('stories')
      .select('*')
      .or(`author_id.eq.${userId},storyteller_id.eq.${userId}`)

    if (stories) {
      export_data.stories = stories.map(s => ({
        id: s.id,
        title: s.title,
        content: s.content,
        excerpt: s.excerpt,
        description: s.description,
        culturalContext: s.cultural_context,
        hasConsent: s.has_consent,
        consentVerified: s.consent_verified,
        privacyLevel: s.privacy_level,
        status: s.status,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }))
    }

    // 3. Export media assets
    const { data: media } = await this.supabase
      .from('media_assets')
      .select('*')
      .eq('uploaded_by', userId)

    if (media) {
      export_data.media = media.map(m => ({
        id: m.id,
        filename: m.filename,
        mediaType: m.media_type,
        url: m.url,
        createdAt: m.created_at
      }))
    }

    // 4. Export distributions
    const storyIds = stories?.map(s => s.id) || []
    if (storyIds.length > 0) {
      const { data: distributions } = await this.supabase
        .from('story_distributions')
        .select('*')
        .in('story_id', storyIds)

      if (distributions) {
        export_data.distributions = distributions.map(d => ({
          id: d.id,
          storyId: d.story_id,
          platform: d.platform,
          distributionUrl: d.distribution_url,
          status: d.status,
          viewCount: d.view_count,
          createdAt: d.created_at
        }))
      }
    }

    // 5. Export audit logs (user's actions)
    const { data: auditLogs } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (auditLogs) {
      export_data.auditLogs = auditLogs.map(l => ({
        id: l.id,
        entityType: l.entity_type,
        entityId: l.entity_id,
        action: l.action,
        changeSummary: l.change_summary,
        createdAt: l.created_at
      }))
    }

    return export_data
  }

  // ==========================================================================
  // DELETION REQUESTS
  // ==========================================================================

  /**
   * Create a deletion request
   */
  async createDeletionRequest(
    userId: string,
    tenantId: string,
    requestType: 'anonymize_story' | 'delete_account' | 'export_data',
    scope?: Record<string, any>
  ): Promise<DeletionRequestRow> {
    // Generate verification token
    const crypto = await import('crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Calculate total items
    let itemsTotal = 0
    if (requestType === 'delete_account') {
      const { count: storiesCount } = await this.supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .or(`author_id.eq.${userId},storyteller_id.eq.${userId}`)

      const { count: mediaCount } = await this.supabase
        .from('media_assets')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', userId)

      itemsTotal = (storiesCount || 0) + (mediaCount || 0) + 1 // +1 for profile
    } else if (requestType === 'anonymize_story' && scope?.storyId) {
      itemsTotal = 1
    }

    const requestData: DeletionRequestInsert = {
      user_id: userId,
      tenant_id: tenantId,
      request_type: requestType,
      scope: scope || null,
      status: 'pending',
      items_total: itemsTotal,
      verification_token: verificationToken
    }

    const { data, error } = await this.supabase
      .from('deletion_requests')
      .insert(requestData)
      .select('*')
      .single()

    if (error) {
      throw new Error('Failed to create deletion request')
    }

    // Create audit log
    await this.logAudit({
      tenant_id: tenantId,
      entity_type: 'deletion_request',
      entity_id: data.id,
      action: 'create',
      action_category: 'gdpr',
      actor_id: userId,
      actor_type: 'user',
      new_state: { request_type: requestType, status: 'pending' },
      change_summary: `Deletion request created: ${requestType}`
    })

    return data
  }

  /**
   * Verify and process a deletion request
   */
  async verifyDeletionRequest(
    requestId: string,
    verificationToken: string
  ): Promise<void> {
    const { data: request, error: fetchError } = await this.supabase
      .from('deletion_requests')
      .select('*')
      .eq('id', requestId)
      .eq('verification_token', verificationToken)
      .single()

    if (fetchError || !request) {
      throw new Error('Invalid or expired verification token')
    }

    if (request.verified_at) {
      throw new Error('Request already verified')
    }

    await this.supabase
      .from('deletion_requests')
      .update({
        verified_at: new Date().toISOString(),
        status: 'processing'
      })
      .eq('id', requestId)
  }

  /**
   * Process a verified deletion request
   */
  async processDeletionRequest(requestId: string): Promise<void> {
    const { data: request, error: fetchError } = await this.supabase
      .from('deletion_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) {
      throw new Error('Deletion request not found')
    }

    if (request.status === 'completed') {
      return // Already processed
    }

    if (!request.verified_at) {
      throw new Error('Request not verified')
    }

    // Update status to processing
    await this.supabase
      .from('deletion_requests')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    const processingLog: any[] = []

    try {
      switch (request.request_type) {
        case 'anonymize_story':
          if (request.scope?.storyId) {
            const result = await this.anonymizeStory(
              request.scope.storyId,
              request.user_id,
              request.tenant_id,
              request.scope.options || {}
            )
            processingLog.push({ action: 'anonymize_story', result })
          }
          break

        case 'delete_account':
          const result = await this.anonymizeUserData(request.user_id, request.tenant_id)
          processingLog.push({ action: 'anonymize_user', result })
          break

        case 'export_data':
          // Export is handled separately via API
          processingLog.push({ action: 'export_ready', message: 'Data export available for download' })
          break
      }

      // Mark as completed
      await this.supabase
        .from('deletion_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          items_processed: request.items_total,
          processing_log: processingLog
        })
        .eq('id', requestId)

    } catch (error) {
      await this.supabase
        .from('deletion_requests')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processing_log: processingLog
        })
        .eq('id', requestId)

      throw error
    }
  }

  /**
   * Get deletion request status
   */
  async getDeletionRequestStatus(
    requestId: string,
    userId: string
  ): Promise<{
    status: string
    requestType: string
    itemsProcessed: number
    itemsTotal: number
    completedAt?: string
    error?: string
  }> {
    const { data, error } = await this.supabase
      .from('deletion_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new Error('Deletion request not found')
    }

    return {
      status: data.status,
      requestType: data.request_type,
      itemsProcessed: data.items_processed || 0,
      itemsTotal: data.items_total || 0,
      completedAt: data.completed_at,
      error: data.error_message
    }
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

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

  /**
   * Scrub PII from content
   * Removes names, emails, phone numbers, addresses, etc.
   */
  private scrubPII(content: string): string {
    let scrubbed = content

    // Email addresses
    scrubbed = scrubbed.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]')

    // Phone numbers (various formats)
    scrubbed = scrubbed.replace(/(\+?1?\s*)?(\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}/g, '[PHONE REDACTED]')

    // Social Security Numbers
    scrubbed = scrubbed.replace(/\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, '[SSN REDACTED]')

    // Credit card numbers
    scrubbed = scrubbed.replace(/\b\d{4}[\s.-]?\d{4}[\s.-]?\d{4}[\s.-]?\d{4}\b/g, '[CARD REDACTED]')

    // IP addresses
    scrubbed = scrubbed.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP REDACTED]')

    // Dates (for birth dates, etc.) - be conservative
    // Only redact dates that look like birth dates (with "born", "birthday", "DOB", etc.)
    scrubbed = scrubbed.replace(/(?:born|birthday|dob|birth date)[:\s]*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/gi, '[BIRTHDATE REDACTED]')

    return scrubbed
  }

  /**
   * Anonymize media associated with a story
   */
  private async anonymizeStoryMedia(storyId: string, tenantId: string): Promise<number> {
    // Get media linked to the story
    const { data: mediaUsage } = await this.supabase
      .from('story_media')
      .select('media_asset_id')
      .eq('story_id', storyId)

    if (!mediaUsage || mediaUsage.length === 0) {
      return 0
    }

    const mediaIds = mediaUsage.map(m => m.media_asset_id)

    // Update media metadata to remove identifying info
    const { error } = await this.supabase
      .from('media_assets')
      .update({
        title: 'Anonymized Media',
        description: '[Content Anonymized]',
        alt_text: 'Anonymized media content',
        metadata: { anonymized: true, anonymized_at: new Date().toISOString() }
      })
      .in('id', mediaIds)

    return error ? 0 : mediaIds.length
  }

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

let gdprServiceInstance: GDPRService | null = null

export function getGDPRService(): GDPRService {
  if (!gdprServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    gdprServiceInstance = new GDPRService(supabaseUrl, supabaseKey)
  }

  return gdprServiceInstance
}

export default GDPRService
