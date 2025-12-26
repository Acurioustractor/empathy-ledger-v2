/**
 * Campaign Workflow Service
 *
 * Manages storyteller journey through campaign consent and story capture stages.
 * Provides methods for tracking, advancing, and analyzing workflow progress.
 *
 * Workflow Stages:
 * 1. invited - Storyteller has been invited to participate
 * 2. interested - Storyteller expressed interest
 * 3. consented - Consent forms signed and verified
 * 4. recorded - Story has been recorded
 * 5. reviewed - Story content reviewed
 * 6. published - Story published on platform
 * 7. withdrawn - Consent withdrawn (terminal state)
 *
 * @module campaign-workflow.service
 */

import { createClientSSR } from '@/lib/supabase/client-ssr'

export type WorkflowStage =
  | 'invited'
  | 'interested'
  | 'consented'
  | 'recorded'
  | 'reviewed'
  | 'published'
  | 'withdrawn'

export type InvitationMethod =
  | 'email'
  | 'phone'
  | 'in_person'
  | 'social_media'
  | 'postal_mail'
  | 'other'

export type RecordingMethod =
  | 'audio'
  | 'video'
  | 'written'
  | 'interview'
  | 'self_recorded'

export interface CampaignWorkflow {
  id: string
  tenant_id: string
  campaign_id?: string
  storyteller_id: string
  story_id?: string
  stage: WorkflowStage
  stage_changed_at: string
  previous_stage?: string
  invitation_sent_at?: string
  invitation_method?: InvitationMethod
  first_response_at?: string
  consent_granted_at?: string
  consent_form_url?: string
  consent_verified_by?: string
  story_recorded_at?: string
  recording_location?: string
  recording_method?: RecordingMethod
  reviewed_at?: string
  reviewed_by?: string
  elder_review_required: boolean
  elder_reviewed_at?: string
  elder_reviewed_by?: string
  published_at?: string
  withdrawn_at?: string
  withdrawal_reason?: string
  withdrawal_handled_by?: string
  notes?: string
  metadata?: Record<string, any>
  follow_up_required: boolean
  follow_up_date?: string
  follow_up_notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface WorkflowSummary {
  total: number
  invited: number
  interested: number
  consented: number
  recorded: number
  reviewed: number
  published: number
  withdrawn: number
  conversion_rate: number
  pending_elder_review: number
  follow_ups_needed: number
}

export interface PendingConsentItem {
  workflow_id: string
  storyteller_id: string
  storyteller_name: string
  storyteller_email?: string
  story_id?: string
  story_title?: string
  stage: WorkflowStage
  consent_granted_at?: string
  story_recorded_at?: string
  elder_review_required: boolean
  days_in_stage: number
  priority_score: number
}

export class CampaignWorkflowService {
  /**
   * Track a new storyteller invitation
   */
  static async trackInvitation(params: {
    storytellerId: string
    campaignId?: string
    invitationMethod: InvitationMethod
    notes?: string
    metadata?: Record<string, any>
  }): Promise<CampaignWorkflow> {
    const supabase = createClientSSR()

    const { data, error } = await supabase
      .from('campaign_consent_workflows')
      .insert({
        storyteller_id: params.storytellerId,
        campaign_id: params.campaignId,
        stage: 'invited',
        invitation_sent_at: new Date().toISOString(),
        invitation_method: params.invitationMethod,
        notes: params.notes,
        metadata: params.metadata || {},
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to track invitation: ${error.message}`)
    }

    return data
  }

  /**
   * Record consent for a storyteller
   */
  static async recordConsent(params: {
    workflowId: string
    consentFormUrl?: string
    notes?: string
  }): Promise<CampaignWorkflow> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('advance_workflow_stage', {
      p_workflow_id: params.workflowId,
      p_new_stage: 'consented',
      p_notes: params.notes,
    })

    if (error) {
      throw new Error(`Failed to record consent: ${error.message}`)
    }

    // Update consent form URL if provided
    if (params.consentFormUrl) {
      const { error: updateError } = await supabase
        .from('campaign_consent_workflows')
        .update({
          consent_form_url: params.consentFormUrl,
          consent_verified_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', params.workflowId)

      if (updateError) {
        console.error('Failed to update consent form URL:', updateError)
      }
    }

    return data
  }

  /**
   * Advance workflow to next stage
   */
  static async advanceStage(params: {
    workflowId: string
    newStage: WorkflowStage
    notes?: string
  }): Promise<CampaignWorkflow> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('advance_workflow_stage', {
      p_workflow_id: params.workflowId,
      p_new_stage: params.newStage,
      p_notes: params.notes,
    })

    if (error) {
      throw new Error(`Failed to advance workflow: ${error.message}`)
    }

    return data
  }

  /**
   * Bulk advance multiple workflows to same stage
   */
  static async bulkAdvance(params: {
    workflowIds: string[]
    newStage: WorkflowStage
    notes?: string
  }): Promise<CampaignWorkflow[]> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('bulk_advance_workflows', {
      p_workflow_ids: params.workflowIds,
      p_new_stage: params.newStage,
      p_notes: params.notes,
    })

    if (error) {
      throw new Error(`Failed to bulk advance workflows: ${error.message}`)
    }

    return data
  }

  /**
   * Get workflow summary statistics
   */
  static async getWorkflowSummary(
    campaignId?: string
  ): Promise<WorkflowSummary> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('get_campaign_workflow_summary', {
      p_campaign_id: campaignId || null,
    })

    if (error) {
      throw new Error(`Failed to get workflow summary: ${error.message}`)
    }

    return data as WorkflowSummary
  }

  /**
   * Get pending consent queue (prioritized)
   */
  static async getPendingQueue(params?: {
    campaignId?: string
    limit?: number
  }): Promise<PendingConsentItem[]> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('get_pending_consent_queue', {
      p_campaign_id: params?.campaignId || null,
      p_limit: params?.limit || 50,
    })

    if (error) {
      throw new Error(`Failed to get pending queue: ${error.message}`)
    }

    return data as PendingConsentItem[]
  }

  /**
   * Get workflows for a campaign
   */
  static async getWorkflowsByCampaign(
    campaignId: string,
    filters?: {
      stage?: WorkflowStage
      elderReviewRequired?: boolean
    }
  ): Promise<CampaignWorkflow[]> {
    const supabase = createClientSSR()

    let query = supabase
      .from('campaign_consent_workflows')
      .select('*')
      .eq('campaign_id', campaignId)

    if (filters?.stage) {
      query = query.eq('stage', filters.stage)
    }

    if (filters?.elderReviewRequired !== undefined) {
      query = query.eq('elder_review_required', filters.elderReviewRequired)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get workflows: ${error.message}`)
    }

    return data
  }

  /**
   * Get workflow by ID
   */
  static async getWorkflow(workflowId: string): Promise<CampaignWorkflow> {
    const supabase = createClientSSR()

    const { data, error } = await supabase
      .from('campaign_consent_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (error) {
      throw new Error(`Failed to get workflow: ${error.message}`)
    }

    return data
  }

  /**
   * Get workflow for a storyteller in a campaign
   */
  static async getWorkflowByStoryteller(params: {
    storytellerId: string
    campaignId?: string
  }): Promise<CampaignWorkflow | null> {
    const supabase = createClientSSR()

    let query = supabase
      .from('campaign_consent_workflows')
      .select('*')
      .eq('storyteller_id', params.storytellerId)

    if (params.campaignId) {
      query = query.eq('campaign_id', params.campaignId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to get storyteller workflow: ${error.message}`)
    }

    return data
  }

  /**
   * Update workflow metadata
   */
  static async updateMetadata(params: {
    workflowId: string
    metadata: Record<string, any>
  }): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('campaign_consent_workflows')
      .update({ metadata: params.metadata })
      .eq('id', params.workflowId)

    if (error) {
      throw new Error(`Failed to update metadata: ${error.message}`)
    }
  }

  /**
   * Mark workflow for follow-up
   */
  static async setFollowUp(params: {
    workflowId: string
    followUpDate: string
    notes?: string
  }): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('campaign_consent_workflows')
      .update({
        follow_up_required: true,
        follow_up_date: params.followUpDate,
        follow_up_notes: params.notes,
      })
      .eq('id', params.workflowId)

    if (error) {
      throw new Error(`Failed to set follow-up: ${error.message}`)
    }
  }

  /**
   * Clear follow-up requirement
   */
  static async clearFollowUp(workflowId: string): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('campaign_consent_workflows')
      .update({
        follow_up_required: false,
        follow_up_date: null,
        follow_up_notes: null,
      })
      .eq('id', workflowId)

    if (error) {
      throw new Error(`Failed to clear follow-up: ${error.message}`)
    }
  }

  /**
   * Link story to workflow
   */
  static async linkStory(params: {
    workflowId: string
    storyId: string
    recordingLocation?: string
    recordingMethod?: RecordingMethod
  }): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('campaign_consent_workflows')
      .update({
        story_id: params.storyId,
        recording_location: params.recordingLocation,
        recording_method: params.recordingMethod,
      })
      .eq('id', params.workflowId)

    if (error) {
      throw new Error(`Failed to link story: ${error.message}`)
    }
  }

  /**
   * Record Elder review
   */
  static async recordElderReview(params: {
    workflowId: string
    approved: boolean
    notes?: string
  }): Promise<void> {
    const supabase = createClientSSR()

    const user = await supabase.auth.getUser()

    const { error } = await supabase
      .from('campaign_consent_workflows')
      .update({
        elder_reviewed_at: new Date().toISOString(),
        elder_reviewed_by: user.data.user?.id,
        notes: params.notes
          ? `Elder Review: ${params.approved ? 'Approved' : 'Requires Changes'}\n${params.notes}`
          : undefined,
      })
      .eq('id', params.workflowId)

    if (error) {
      throw new Error(`Failed to record Elder review: ${error.message}`)
    }

    // If approved, advance to reviewed stage
    if (params.approved) {
      await this.advanceStage({
        workflowId: params.workflowId,
        newStage: 'reviewed',
        notes: 'Elder review approved',
      })
    }
  }

  /**
   * Withdraw consent
   */
  static async withdrawConsent(params: {
    workflowId: string
    reason: string
  }): Promise<void> {
    const supabase = createClientSSR()

    const user = await supabase.auth.getUser()

    const { error } = await supabase
      .from('campaign_consent_workflows')
      .update({
        stage: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
        withdrawal_reason: params.reason,
        withdrawal_handled_by: user.data.user?.id,
      })
      .eq('id', params.workflowId)

    if (error) {
      throw new Error(`Failed to withdraw consent: ${error.message}`)
    }
  }

  /**
   * Get conversion funnel metrics
   */
  static async getConversionFunnel(campaignId?: string): Promise<{
    invited: number
    interested: number
    consented: number
    recorded: number
    reviewed: number
    published: number
    conversion_rates: {
      invited_to_interested: number
      interested_to_consented: number
      consented_to_recorded: number
      recorded_to_published: number
      overall: number
    }
  }> {
    const summary = await this.getWorkflowSummary(campaignId)

    return {
      invited: summary.invited,
      interested: summary.interested,
      consented: summary.consented,
      recorded: summary.recorded,
      reviewed: summary.reviewed,
      published: summary.published,
      conversion_rates: {
        invited_to_interested:
          summary.invited > 0
            ? Math.round((summary.interested / summary.invited) * 100)
            : 0,
        interested_to_consented:
          summary.interested > 0
            ? Math.round((summary.consented / summary.interested) * 100)
            : 0,
        consented_to_recorded:
          summary.consented > 0
            ? Math.round((summary.recorded / summary.consented) * 100)
            : 0,
        recorded_to_published:
          summary.recorded > 0
            ? Math.round((summary.published / summary.recorded) * 100)
            : 0,
        overall: summary.conversion_rate,
      },
    }
  }
}
