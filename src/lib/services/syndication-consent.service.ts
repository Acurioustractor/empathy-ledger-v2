/**
 * Syndication Consent Service
 *
 * Handles all syndication consent operations and triggers webhooks
 * to notify external platforms of changes.
 *
 * This ensures storyteller sovereignty - when they revoke consent,
 * platforms are immediately notified to remove the story.
 */

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { webhookService } from './webhook.service'

export interface SyndicationConsentSettings {
  shareFullContent: boolean
  shareSummaryOnly: boolean
  shareMedia: boolean
  shareAttribution: boolean
  anonymousSharing: boolean
  culturalRestrictions?: Record<string, unknown>
  requiresCulturalApproval?: boolean
  expiresAt?: Date | null
}

export interface SyndicationConsentGrant {
  storyId: string
  storytellerId: string
  appId: string
  settings: SyndicationConsentSettings
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

class SyndicationConsentService {
  /**
   * Grant consent for a story to be shared with an app
   */
  async grantConsent(grant: SyndicationConsentGrant): Promise<{ success: boolean; error?: string }> {
    const supabase = createSupabaseServiceClient()

    try {
      const { organizationId, tenantId } = await this.resolveStoryContext(supabase, grant.storyId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('story_syndication_consent')
        .upsert({
          story_id: grant.storyId,
          storyteller_id: grant.storytellerId,
          app_id: grant.appId,
          tenant_id: tenantId,
          organization_id: organizationId,
          consent_granted: true,
          consent_granted_at: new Date().toISOString(),
          consent_revoked_at: null,
          consent_expires_at: grant.settings.expiresAt?.toISOString() || null,
          share_full_content: grant.settings.shareFullContent,
          share_summary_only: grant.settings.shareSummaryOnly,
          share_media: grant.settings.shareMedia,
          share_attribution: grant.settings.shareAttribution,
          anonymous_sharing: grant.settings.anonymousSharing,
          cultural_restrictions: grant.settings.culturalRestrictions || {},
          requires_cultural_approval: grant.settings.requiresCulturalApproval || false
        }, {
          onConflict: 'story_id,app_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error granting syndication consent:', error)
        return { success: false, error: error.message }
      }

      // Log the change
      await this.logConsentChange(
        data.id,
        grant.storyId,
        grant.appId,
        grant.storytellerId,
        'granted',
        null,
        grant.settings
      )

      // Notify webhook
      const shareLevel = grant.settings.shareFullContent ? 'full' :
                        grant.settings.shareSummaryOnly ? 'summary' : 'title_only'
      await webhookService.notifyConsentGranted(
        grant.storyId,
        grant.appId,
        grant.storytellerId,
        shareLevel
      )

      return { success: true }
    } catch (error) {
      console.error('Error in grantConsent:', error)
      return { success: false, error: 'Failed to grant consent' }
    }
  }

  /**
   * Revoke consent - this triggers immediate webhook notification
   */
  async revokeConsent(
    storyId: string,
    appId: string,
    storytellerId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createSupabaseServiceClient()

    try {
      // Get current consent state for logging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: currentConsent } = await (supabase as any)
        .from('story_syndication_consent')
        .select('*')
        .eq('story_id', storyId)
        .eq('app_id', appId)
        .single()

      // Update consent to revoked
      const updateData: AnyRecord = {
        consent_granted: false,
        consent_revoked_at: new Date().toISOString()
      }

      if (!currentConsent?.tenant_id || !currentConsent?.organization_id) {
        const { organizationId, tenantId } = await this.resolveStoryContext(supabase, storyId)
        if (organizationId && !currentConsent?.organization_id) {
          updateData.organization_id = organizationId
        }
        if (tenantId && !currentConsent?.tenant_id) {
          updateData.tenant_id = tenantId
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('story_syndication_consent')
        .update(updateData)
        .eq('story_id', storyId)
        .eq('app_id', appId)

      if (error) {
        console.error('Error revoking consent:', error)
        return { success: false, error: error.message }
      }

      // Log the change
      await this.logConsentChange(
        currentConsent?.id,
        storyId,
        appId,
        storytellerId,
        'revoked',
        currentConsent,
        null,
        reason
      )

      // IMMEDIATELY notify webhook - this is critical for storyteller sovereignty
      await webhookService.notifyConsentRevoked(storyId, appId, storytellerId, reason)

      return { success: true }
    } catch (error) {
      console.error('Error in revokeConsent:', error)
      return { success: false, error: 'Failed to revoke consent' }
    }
  }

  /**
   * Update consent settings (e.g., change from full to summary)
   */
  async updateConsent(
    storyId: string,
    appId: string,
    storytellerId: string,
    newSettings: Partial<SyndicationConsentSettings>
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createSupabaseServiceClient()

    try {
      // Get current consent state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: currentConsent } = await (supabase as any)
        .from('story_syndication_consent')
        .select('*')
        .eq('story_id', storyId)
        .eq('app_id', appId)
        .single()

      if (!currentConsent) {
        return { success: false, error: 'Consent record not found' }
      }

      // Build update object
      const updateData: AnyRecord = {}
      if (newSettings.shareFullContent !== undefined) {
        updateData.share_full_content = newSettings.shareFullContent
      }
      if (newSettings.shareSummaryOnly !== undefined) {
        updateData.share_summary_only = newSettings.shareSummaryOnly
      }
      if (newSettings.shareMedia !== undefined) {
        updateData.share_media = newSettings.shareMedia
      }
      if (newSettings.shareAttribution !== undefined) {
        updateData.share_attribution = newSettings.shareAttribution
      }
      if (newSettings.anonymousSharing !== undefined) {
        updateData.anonymous_sharing = newSettings.anonymousSharing
      }
      if (newSettings.culturalRestrictions !== undefined) {
        updateData.cultural_restrictions = newSettings.culturalRestrictions
      }
      if (newSettings.expiresAt !== undefined) {
        updateData.consent_expires_at = newSettings.expiresAt?.toISOString() || null
      }

      const { organizationId, tenantId } = await this.resolveStoryContext(supabase, storyId)
      if (organizationId && currentConsent.organization_id !== organizationId) {
        updateData.organization_id = organizationId
      }
      if (tenantId && currentConsent.tenant_id !== tenantId) {
        updateData.tenant_id = tenantId
      }

      // Update consent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('story_syndication_consent')
        .update(updateData)
        .eq('story_id', storyId)
        .eq('app_id', appId)

      if (error) {
        console.error('Error updating consent:', error)
        return { success: false, error: error.message }
      }

      // Determine share level change for webhook
      const previousLevel = currentConsent.share_full_content ? 'full' :
                           currentConsent.share_summary_only ? 'summary' : 'title_only'
      const newLevel = (newSettings.shareFullContent ?? currentConsent.share_full_content) ? 'full' :
                      (newSettings.shareSummaryOnly ?? currentConsent.share_summary_only) ? 'summary' : 'title_only'

      // Log the change
      await this.logConsentChange(
        currentConsent.id,
        storyId,
        appId,
        storytellerId,
        'updated',
        currentConsent,
        newSettings
      )

      // Notify webhook of the update
      await webhookService.notifyConsentUpdated(
        storyId,
        appId,
        storytellerId,
        previousLevel,
        newLevel
      )

      return { success: true }
    } catch (error) {
      console.error('Error in updateConsent:', error)
      return { success: false, error: 'Failed to update consent' }
    }
  }

  /**
   * Revoke all consent for a story (used when story is deleted)
   */
  async revokeAllConsent(storyId: string, storytellerId: string): Promise<void> {
    const supabase = createSupabaseServiceClient()

    // Get all consents for this story
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consents } = await (supabase as any)
      .from('story_syndication_consent')
      .select('app_id')
      .eq('story_id', storyId)
      .eq('consent_granted', true)
      .is('consent_revoked_at', null)

    if (!consents || consents.length === 0) {
      return
    }

    // Revoke each consent and notify
    await Promise.all(
      consents.map((consent: { app_id: string }) =>
        this.revokeConsent(storyId, consent.app_id, storytellerId, 'Story deleted')
      )
    )
  }

  /**
   * Get all apps that have consent for a story
   */
  async getConsentedApps(storyId: string): Promise<Array<{
    appId: string
    appName: string
    shareLevel: string
    grantedAt: Date
  }>> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('story_syndication_consent')
      .select(`
        app_id,
        share_full_content,
        share_summary_only,
        consent_granted_at,
        external_applications:app_id (
          app_name,
          app_display_name
        )
      `)
      .eq('story_id', storyId)
      .eq('consent_granted', true)
      .is('consent_revoked_at', null)

    if (error || !data) {
      return []
    }

    return data.map((consent: AnyRecord) => ({
      appId: consent.app_id,
      appName: consent.external_applications?.app_display_name || consent.external_applications?.app_name || 'Unknown',
      shareLevel: consent.share_full_content ? 'full' :
                 consent.share_summary_only ? 'summary' : 'title_only',
      grantedAt: new Date(consent.consent_granted_at)
    }))
  }

  /**
   * Get all stories with consent for an app
   */
  async getStoriesForApp(appId: string): Promise<Array<{
    storyId: string
    storyTitle: string
    shareLevel: string
    grantedAt: Date
  }>> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('story_syndication_consent')
      .select(`
        story_id,
        share_full_content,
        share_summary_only,
        consent_granted_at,
        stories:story_id (
          title
        )
      `)
      .eq('app_id', appId)
      .eq('consent_granted', true)
      .is('consent_revoked_at', null)

    if (error || !data) {
      return []
    }

    return data.map((consent: AnyRecord) => ({
      storyId: consent.story_id,
      storyTitle: consent.stories?.title || 'Untitled',
      shareLevel: consent.share_full_content ? 'full' :
                 consent.share_summary_only ? 'summary' : 'title_only',
      grantedAt: new Date(consent.consent_granted_at)
    }))
  }

  /**
   * Log consent change for audit trail
   */
  private async resolveStoryContext(
    supabase: ReturnType<typeof createSupabaseServiceClient>,
    storyId: string
  ): Promise<{ organizationId: string | null; tenantId: string | null }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story } = await (supabase as any)
      .from('stories')
      .select('organization_id, tenant_id')
      .eq('id', storyId)
      .single()

    const organizationId = story?.organization_id ?? null
    let tenantId = story?.tenant_id ?? null

    if (organizationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: org } = await (supabase as any)
        .from('organisations')
        .select('tenant_id')
        .eq('id', organizationId)
        .single()

      if (org?.tenant_id) {
        tenantId = org.tenant_id
      }
    }

    return { organizationId, tenantId }
  }

  private async logConsentChange(
    consentId: string | null,
    storyId: string,
    appId: string,
    storytellerId: string,
    changeType: 'granted' | 'revoked' | 'updated' | 'expired',
    previousState: AnyRecord | null,
    newState: AnyRecord | null,
    reason?: string
  ): Promise<void> {
    const supabase = createSupabaseServiceClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('consent_change_log')
        .insert({
          consent_id: consentId || '00000000-0000-0000-0000-000000000000',
          story_id: storyId,
          app_id: appId,
          storyteller_id: storytellerId,
          change_type: changeType,
          previous_state: previousState,
          new_state: newState,
          change_reason: reason,
          webhooks_triggered: true
        })
    } catch (error) {
      console.error('Error logging consent change:', error)
      // Don't fail the main operation if logging fails
    }
  }
}

// Export singleton instance
export const syndicationConsentService = new SyndicationConsentService()
export default syndicationConsentService
