import { createClient } from '@supabase/supabase-js'
import { getAuditService } from './audit.service'

/**
 * Consent method types for GDPR compliance
 */
export type ConsentMethod = 'written' | 'verbal' | 'digital' | 'recorded' | 'witnessed'

/**
 * Consent proof record for stories
 */
export interface ConsentProof {
  consent_id: string
  story_id: string
  storyteller_id: string
  consent_granted_at: string
  consent_method: ConsentMethod
  consent_proof_url?: string | null
  consent_version: string
  consent_details: {
    purpose: string
    scope: string[]
    duration?: string
    restrictions?: string[]
  }
  witness_id?: string | null
  witness_name?: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_by?: string | null
  verified_at?: string | null
  notes?: string | null
}

/**
 * Consent withdrawal record
 */
export interface ConsentWithdrawal {
  withdrawal_id: string
  story_id: string
  withdrawn_at: string
  withdrawn_by: string
  reason: string
  scope: 'full' | 'partial'
  partial_restrictions?: string[]
  effective_immediately: boolean
  acknowledgement_required: boolean
}

/**
 * Consent record input for granting consent
 */
export interface ConsentGrantInput {
  story_id: string
  storyteller_id: string
  method: ConsentMethod
  proof_url?: string
  purpose: string
  scope: string[]
  duration?: string
  restrictions?: string[]
  witness_id?: string
  witness_name?: string
  notes?: string
}

/**
 * ConsentService
 * Manages GDPR-compliant consent proof system for stories.
 * Tracks consent grants, withdrawals, and verification.
 */
export class ConsentService {
  private supabase: ReturnType<typeof createClient>
  private auditService: ReturnType<typeof getAuditService>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.auditService = getAuditService()
  }

  /**
   * Grant consent for a story with full proof documentation
   */
  async grantConsent(
    input: ConsentGrantInput,
    actorId: string,
    tenantId: string
  ): Promise<ConsentProof> {
    const consentId = crypto.randomUUID()
    const now = new Date().toISOString()

    // Create consent proof record
    const consentProof: ConsentProof = {
      consent_id: consentId,
      story_id: input.story_id,
      storyteller_id: input.storyteller_id,
      consent_granted_at: now,
      consent_method: input.method,
      consent_proof_url: input.proof_url || null,
      consent_version: '1.0',
      consent_details: {
        purpose: input.purpose,
        scope: input.scope,
        duration: input.duration,
        restrictions: input.restrictions
      },
      witness_id: input.witness_id || null,
      witness_name: input.witness_name || null,
      verification_status: input.method === 'digital' ? 'verified' : 'pending',
      verified_by: input.method === 'digital' ? actorId : null,
      verified_at: input.method === 'digital' ? now : null,
      notes: input.notes || null
    }

    // Update story with consent status
    const { error: updateError } = await this.supabase
      .from('stories')
      .update({
        has_consent: true,
        consent_verified: consentProof.verification_status === 'verified',
        has_explicit_consent: true,
        updated_at: now
      })
      .eq('id', input.story_id)

    if (updateError) {
      console.error('Failed to update story consent status:', updateError)
      throw new Error('Failed to grant consent')
    }

    // Store consent proof in consent_records table or as JSON
    // Using audit log for now as dedicated consent_records may not exist
    await this.auditService.log({
      tenant_id: tenantId,
      entity_type: 'story',
      entity_id: input.story_id,
      action: 'consent_grant',
      action_category: 'consent',
      actor_id: actorId,
      actor_type: 'user',
      new_state: consentProof,
      change_summary: `Consent granted via ${input.method} method for story`
    })

    return consentProof
  }

  /**
   * Withdraw consent for a story
   */
  async withdrawConsent(
    storyId: string,
    userId: string,
    tenantId: string,
    reason: string,
    scope: 'full' | 'partial' = 'full',
    partialRestrictions?: string[]
  ): Promise<ConsentWithdrawal> {
    const withdrawalId = crypto.randomUUID()
    const now = new Date().toISOString()

    // Verify user has permission to withdraw consent (must be storyteller)
    const { data: story, error: fetchError } = await this.supabase
      .from('stories')
      .select('storyteller_id, author_id, title')
      .eq('id', storyId)
      .single()

    if (fetchError || !story) {
      throw new Error('Story not found')
    }

    if (story.storyteller_id !== userId && story.author_id !== userId) {
      throw new Error('Only the storyteller or author can withdraw consent')
    }

    const withdrawal: ConsentWithdrawal = {
      withdrawal_id: withdrawalId,
      story_id: storyId,
      withdrawn_at: now,
      withdrawn_by: userId,
      reason,
      scope,
      partial_restrictions: partialRestrictions,
      effective_immediately: true,
      acknowledgement_required: true
    }

    // Update story consent status
    const updateData: Record<string, any> = {
      updated_at: now
    }

    if (scope === 'full') {
      updateData.has_consent = false
      updateData.consent_verified = false
      updateData.has_explicit_consent = false
      updateData.status = 'consent_withdrawn'
    }

    const { error: updateError } = await this.supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)

    if (updateError) {
      console.error('Failed to update story consent status:', updateError)
      throw new Error('Failed to withdraw consent')
    }

    // Create audit log
    await this.auditService.log({
      tenant_id: tenantId,
      entity_type: 'story',
      entity_id: storyId,
      action: 'consent_withdraw',
      action_category: 'gdpr',
      actor_id: userId,
      actor_type: 'user',
      new_state: withdrawal,
      change_summary: `Consent withdrawn (${scope}) for story "${story.title}": ${reason}`
    })

    return withdrawal
  }

  /**
   * Verify consent proof (for admin/elder review)
   */
  async verifyConsent(
    storyId: string,
    verifierId: string,
    tenantId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    const now = new Date().toISOString()

    const { error: updateError } = await this.supabase
      .from('stories')
      .update({
        consent_verified: approved,
        updated_at: now
      })
      .eq('id', storyId)

    if (updateError) {
      console.error('Failed to verify consent:', updateError)
      throw new Error('Failed to verify consent')
    }

    await this.auditService.log({
      tenant_id: tenantId,
      entity_type: 'story',
      entity_id: storyId,
      action: 'consent_update',
      action_category: 'consent',
      actor_id: verifierId,
      actor_type: 'user',
      new_state: {
        consent_verified: approved,
        verified_at: now,
        verification_notes: notes
      },
      change_summary: `Consent ${approved ? 'verified' : 'rejected'} by reviewer${notes ? `: ${notes}` : ''}`
    })
  }

  /**
   * Get consent history for a story
   */
  async getConsentHistory(storyId: string): Promise<any[]> {
    // Get consent-related audit logs
    const logs = await this.auditService.getStoryHistory(storyId, {
      categories: ['consent', 'gdpr']
    })

    return logs
  }

  /**
   * Check if story has valid consent for distribution
   */
  async checkConsentForDistribution(storyId: string): Promise<{
    hasConsent: boolean
    isVerified: boolean
    canDistribute: boolean
    reason?: string
  }> {
    const { data: story, error } = await this.supabase
      .from('stories')
      .select('has_consent, consent_verified, has_explicit_consent, status')
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return {
        hasConsent: false,
        isVerified: false,
        canDistribute: false,
        reason: 'Story not found'
      }
    }

    if (story.status === 'consent_withdrawn') {
      return {
        hasConsent: false,
        isVerified: false,
        canDistribute: false,
        reason: 'Consent has been withdrawn'
      }
    }

    if (!story.has_consent) {
      return {
        hasConsent: false,
        isVerified: false,
        canDistribute: false,
        reason: 'No consent recorded'
      }
    }

    if (!story.consent_verified) {
      return {
        hasConsent: true,
        isVerified: false,
        canDistribute: false,
        reason: 'Consent pending verification'
      }
    }

    return {
      hasConsent: true,
      isVerified: true,
      canDistribute: true
    }
  }

  /**
   * Export consent records for GDPR data request
   */
  async exportConsentRecords(userId: string, tenantId: string): Promise<{
    user_id: string
    export_date: string
    stories_with_consent: any[]
    consent_history: any[]
  }> {
    // Get all stories where user is storyteller
    const { data: stories } = await this.supabase
      .from('stories')
      .select('id, title, has_consent, consent_verified, created_at, status')
      .or(`storyteller_id.eq.${userId},author_id.eq.${userId}`)

    // Get consent history for all stories
    const consentHistory: any[] = []
    for (const story of stories || []) {
      const history = await this.getConsentHistory(story.id)
      consentHistory.push({
        story_id: story.id,
        story_title: story.title,
        history
      })
    }

    return {
      user_id: userId,
      export_date: new Date().toISOString(),
      stories_with_consent: stories || [],
      consent_history: consentHistory
    }
  }
}

// ==========================================================================
// FACTORY FUNCTION
// ==========================================================================

let consentServiceInstance: ConsentService | null = null

export function getConsentService(): ConsentService {
  if (!consentServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    consentServiceInstance = new ConsentService(supabaseUrl, supabaseKey)
  }

  return consentServiceInstance
}

export default ConsentService
