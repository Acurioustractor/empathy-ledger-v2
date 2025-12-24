/**
 * Consent Proxy Service
 *
 * Central service for checking story consent before any access.
 * Ensures storyteller sovereignty - revoke consent and story disappears everywhere.
 *
 * Follows CARE Principles:
 * - Authority to Control: Storytellers control all access
 * - Responsibility: Every access is logged
 * - Ethics: Cultural restrictions are enforced
 */

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

export type ShareLevel = 'full' | 'summary' | 'title_only' | 'none'
export type Attribution = 'named' | 'anonymous' | 'none'
export type RequestorType = 'api' | 'embed' | 'oembed' | 'public' | 'internal'

export interface RequestorContext {
  type: RequestorType
  appId?: string           // For API requests from registered apps
  appName?: string
  domain?: string          // For embed requests
  ip?: string
  userAgent?: string
}

export interface CulturalRestriction {
  type: string
  description: string
  requiresApproval: boolean
  approvalStatus?: 'pending' | 'approved' | 'denied'
}

export interface ConsentCheckResult {
  allowed: boolean
  reason?: string
  shareLevel: ShareLevel
  attribution: Attribution
  mediaAllowed: boolean
  culturalRestrictions: CulturalRestriction[]
  expiresAt: Date | null
  consentVersion: string    // For tracking changes
  cacheControl: string      // Always 'no-store' for revocable content
}

export interface ConsentedStory {
  id: string
  title: string
  content: string           // May be full or summary based on consent
  excerpt: string | null
  storytellerName: string   // May be anonymous
  storytellerId: string | null  // null if anonymous
  themes: string[]
  storyDate: string
  media: string[] | null    // null if media not allowed
  culturalRestrictions: CulturalRestriction[]
  consentVersion: string
  attribution: Attribution
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

class ConsentProxyService {
  /**
   * Check if access is allowed for a story
   */
  async checkConsent(
    storyId: string,
    requestor: RequestorContext
  ): Promise<ConsentCheckResult> {
    const supabase = createSupabaseServiceClient()

    // For public/embed/oembed requests, check if story is publicly visible
    if (requestor.type === 'public' || requestor.type === 'embed' || requestor.type === 'oembed') {
      return this.checkPublicConsent(storyId)
    }

    // For API requests, check app-specific consent
    if (requestor.type === 'api' && requestor.appId) {
      return this.checkAppConsent(storyId, requestor.appId)
    }

    // Internal requests (from within Empathy Ledger)
    if (requestor.type === 'internal') {
      return {
        allowed: true,
        shareLevel: 'full',
        attribution: 'named',
        mediaAllowed: true,
        culturalRestrictions: [],
        expiresAt: null,
        consentVersion: 'internal',
        cacheControl: 'no-store'
      }
    }

    // Default: not allowed
    return {
      allowed: false,
      reason: 'Invalid requestor context',
      shareLevel: 'none',
      attribution: 'none',
      mediaAllowed: false,
      culturalRestrictions: [],
      expiresAt: null,
      consentVersion: 'denied',
      cacheControl: 'no-store'
    }
  }

  /**
   * Check consent for public/embed access
   */
  private async checkPublicConsent(storyId: string): Promise<ConsentCheckResult> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story, error } = await (supabase as any)
      .from('stories')
      .select(`
        id,
        status,
        visibility,
        cultural_sensitivity_level,
        profiles:storyteller_id (
          id,
          display_name,
          sharing_preferences
        )
      `)
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return {
        allowed: false,
        reason: 'Story not found',
        shareLevel: 'none',
        attribution: 'none',
        mediaAllowed: false,
        culturalRestrictions: [],
        expiresAt: null,
        consentVersion: 'not_found',
        cacheControl: 'no-store'
      }
    }

    // Check if story is published and public
    const isPublic = story.visibility === 'public' && story.status === 'published'

    if (!isPublic) {
      return {
        allowed: false,
        reason: 'Story is not public',
        shareLevel: 'none',
        attribution: 'none',
        mediaAllowed: false,
        culturalRestrictions: [],
        expiresAt: null,
        consentVersion: 'private',
        cacheControl: 'no-store'
      }
    }

    // Check storyteller's sharing preferences
    const sharingPrefs = story.profiles?.sharing_preferences || {}
    const allowEmbeds = sharingPrefs.allow_embeds !== false // Default to true

    if (!allowEmbeds) {
      return {
        allowed: false,
        reason: 'Storyteller has disabled embedding',
        shareLevel: 'none',
        attribution: 'none',
        mediaAllowed: false,
        culturalRestrictions: [],
        expiresAt: null,
        consentVersion: 'embeds_disabled',
        cacheControl: 'no-store'
      }
    }

    // Build cultural restrictions
    const culturalRestrictions: CulturalRestriction[] = []
    if (story.cultural_sensitivity_level === 'high' || story.cultural_sensitivity_level === 'sacred') {
      culturalRestrictions.push({
        type: 'sensitivity',
        description: `This story has ${story.cultural_sensitivity_level} cultural sensitivity`,
        requiresApproval: story.cultural_sensitivity_level === 'sacred'
      })
    }

    return {
      allowed: true,
      shareLevel: sharingPrefs.default_share_level || 'full',
      attribution: sharingPrefs.anonymous_by_default ? 'anonymous' : 'named',
      mediaAllowed: sharingPrefs.share_media !== false,
      culturalRestrictions,
      expiresAt: null,
      consentVersion: `public_${Date.now()}`,
      cacheControl: 'no-store, no-cache, must-revalidate'
    }
  }

  /**
   * Check consent for a specific app
   */
  private async checkAppConsent(storyId: string, appId: string): Promise<ConsentCheckResult> {
    const supabase = createSupabaseServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consent, error } = await (supabase as any)
      .from('story_syndication_consent')
      .select(`
        *,
        stories:story_id (
          id,
          title,
          cultural_sensitivity_level
        ),
        external_applications:app_id (
          id,
          app_name,
          is_active
        )
      `)
      .eq('story_id', storyId)
      .eq('app_id', appId)
      .single()

    if (error || !consent) {
      return {
        allowed: false,
        reason: 'No consent granted for this app',
        shareLevel: 'none',
        attribution: 'none',
        mediaAllowed: false,
        culturalRestrictions: [],
        expiresAt: null,
        consentVersion: 'no_consent',
        cacheControl: 'no-store'
      }
    }

    // Check if consent is valid
    const isGranted = consent.consent_granted === true
    const isRevoked = consent.consent_revoked_at !== null
    const isExpired = consent.consent_expires_at && new Date(consent.consent_expires_at) < new Date()
    const appActive = consent.external_applications?.is_active === true

    if (!isGranted || isRevoked || isExpired || !appActive) {
      return {
        allowed: false,
        reason: isRevoked ? 'Consent was revoked' : isExpired ? 'Consent has expired' : 'Consent not granted',
        shareLevel: 'none',
        attribution: 'none',
        mediaAllowed: false,
        culturalRestrictions: [],
        expiresAt: null,
        consentVersion: 'invalid',
        cacheControl: 'no-store'
      }
    }

    // Check cultural approval if required
    if (consent.requires_cultural_approval && consent.cultural_approval_status !== 'approved') {
      return {
        allowed: false,
        reason: 'Awaiting cultural approval',
        shareLevel: 'none',
        attribution: 'none',
        mediaAllowed: false,
        culturalRestrictions: [{
          type: 'cultural_approval',
          description: 'This story requires cultural approval before sharing',
          requiresApproval: true,
          approvalStatus: consent.cultural_approval_status || 'pending'
        }],
        expiresAt: null,
        consentVersion: 'pending_cultural',
        cacheControl: 'no-store'
      }
    }

    // Determine share level
    let shareLevel: ShareLevel = 'none'
    if (consent.share_full_content) {
      shareLevel = 'full'
    } else if (consent.share_summary_only) {
      shareLevel = 'summary'
    } else {
      shareLevel = 'title_only'
    }

    // Determine attribution
    let attribution: Attribution = 'none'
    if (consent.share_attribution && !consent.anonymous_sharing) {
      attribution = 'named'
    } else if (consent.anonymous_sharing) {
      attribution = 'anonymous'
    }

    // Build cultural restrictions
    const culturalRestrictions: CulturalRestriction[] = []
    if (consent.cultural_restrictions) {
      Object.entries(consent.cultural_restrictions).forEach(([key, value]) => {
        culturalRestrictions.push({
          type: key,
          description: String(value),
          requiresApproval: false
        })
      })
    }

    return {
      allowed: true,
      shareLevel,
      attribution,
      mediaAllowed: consent.share_media === true,
      culturalRestrictions,
      expiresAt: consent.consent_expires_at ? new Date(consent.consent_expires_at) : null,
      consentVersion: `app_${consent.id}_${consent.updated_at}`,
      cacheControl: 'no-store, no-cache, must-revalidate'
    }
  }

  /**
   * Get a story with consent applied
   */
  async getStoryWithConsent(
    storyId: string,
    requestor: RequestorContext
  ): Promise<ConsentedStory | null> {
    // First check consent
    const consent = await this.checkConsent(storyId, requestor)

    if (!consent.allowed) {
      return null
    }

    const supabase = createSupabaseServiceClient()

    // Fetch the story
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story, error } = await (supabase as any)
      .from('stories')
      .select(`
        id,
        title,
        content,
        excerpt,
        keywords,
        cultural_tags,
        linked_media,
        created_at,
        storyteller_id,
        profiles:storyteller_id (
          id,
          display_name,
          full_name
        )
      `)
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return null
    }

    // Apply consent filters
    let content = ''
    switch (consent.shareLevel) {
      case 'full':
        content = story.content || ''
        break
      case 'summary':
        content = story.excerpt || (story.content?.slice(0, 500) + '...') || ''
        break
      case 'title_only':
        content = ''
        break
    }

    // Determine storyteller name
    let storytellerName = 'Anonymous Storyteller'
    let storytellerId: string | null = null
    if (consent.attribution === 'named') {
      storytellerName = story.profiles?.display_name || story.profiles?.full_name || 'Anonymous Storyteller'
      storytellerId = story.storyteller_id
    }

    // Log this access
    await this.logAccess(storyId, requestor, 'view')

    return {
      id: story.id,
      title: story.title || 'Untitled Story',
      content,
      excerpt: consent.shareLevel !== 'title_only' ? story.excerpt : null,
      storytellerName,
      storytellerId,
      themes: story.keywords || story.cultural_tags || [],
      storyDate: story.created_at,
      media: consent.mediaAllowed ? story.linked_media : null,
      culturalRestrictions: consent.culturalRestrictions,
      consentVersion: consent.consentVersion,
      attribution: consent.attribution
    }
  }

  /**
   * Log story access for audit trail
   */
  async logAccess(
    storyId: string,
    requestor: RequestorContext,
    accessType: 'view' | 'embed' | 'export' | 'api'
  ): Promise<void> {
    const supabase = createSupabaseServiceClient()

    try {
      const { organizationId, tenantId } = await this.resolveStoryContext(supabase, storyId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('story_access_log')
        .insert({
          story_id: storyId,
          tenant_id: tenantId,
          organization_id: organizationId,
          app_id: requestor.appId || null,
          access_type: accessType,
          accessor_ip: requestor.ip || null,
          accessor_user_agent: requestor.userAgent || null,
          access_context: {
            requestor_type: requestor.type,
            domain: requestor.domain || null,
            app_name: requestor.appName || null,
            timestamp: new Date().toISOString()
          }
        })
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Failed to log story access:', error)
    }
  }

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

  /**
   * Get response headers for consent-controlled content
   */
  getConsentHeaders(consent: ConsentCheckResult): Record<string, string> {
    return {
      'Cache-Control': consent.cacheControl,
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Empathy-Consent-Version': consent.consentVersion,
      'X-Empathy-Story-Status': consent.allowed ? 'active' : 'restricted',
      'X-Empathy-Share-Level': consent.shareLevel,
      'X-Empathy-Attribution': consent.attribution
    }
  }
}

// Export singleton instance
export const consentProxy = new ConsentProxyService()
export default consentProxy
