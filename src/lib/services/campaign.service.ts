/**
 * Campaign Service
 *
 * Manages campaign entities - coordinated storytelling initiatives across communities.
 * Handles CRUD operations, metrics tracking, and campaign lifecycle management.
 *
 * Campaign Types:
 * - tour_stop: Physical World Tour events
 * - community_outreach: Targeted community recruitment
 * - partnership: Collaborative initiatives with Dream Organizations
 * - collection_drive: Themed story collection
 * - exhibition: Public storytelling events
 * - other: Custom campaign types
 *
 * @module campaign.service
 */

import { createClientSSR } from '@/lib/supabase/client-ssr'

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type CampaignType =
  | 'tour_stop'
  | 'community_outreach'
  | 'partnership'
  | 'collection_drive'
  | 'exhibition'
  | 'other'

export interface Campaign {
  id: string
  organization_id?: string
  tenant_id: string
  name: string
  slug: string
  description?: string
  tagline?: string
  status: CampaignStatus
  campaign_type?: CampaignType
  start_date?: string
  end_date?: string
  location_text?: string
  city?: string
  state_province?: string
  country?: string
  latitude?: number
  longitude?: number
  storyteller_target?: number
  story_target?: number
  engagement_target?: number
  participant_count: number
  story_count: number
  workflow_count: number
  cover_image_url?: string
  logo_url?: string
  theme_color?: string
  partner_organization_ids?: string[]
  dream_organization_ids?: string[]
  engagement_metrics?: Record<string, any>
  requires_consent_workflow: boolean
  requires_elder_review: boolean
  consent_template_url?: string
  cultural_protocols?: string
  traditional_territory?: string
  acknowledgment_text?: string
  is_public: boolean
  is_featured: boolean
  allow_self_registration: boolean
  metadata?: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CampaignDetails extends Campaign {
  workflow_summary?: {
    total: number
    by_stage: Record<string, number>
  }
  story_themes?: string[]
  storyteller_count?: number
  completion_rate?: number
}

export interface CreateCampaignParams {
  name: string
  description?: string
  tagline?: string
  campaign_type?: CampaignType
  start_date?: string
  end_date?: string
  location_text?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  storyteller_target?: number
  story_target?: number
  requires_consent_workflow?: boolean
  requires_elder_review?: boolean
  cultural_protocols?: string
  traditional_territory?: string
  is_public?: boolean
  metadata?: Record<string, any>
}

export class CampaignService {
  /**
   * Create a new campaign
   */
  static async create(params: CreateCampaignParams): Promise<Campaign> {
    const supabase = createClientSSR()

    // Generate unique slug
    const { data: slugData, error: slugError } = await supabase.rpc(
      'generate_campaign_slug',
      { p_name: params.name }
    )

    if (slugError) {
      throw new Error(`Failed to generate slug: ${slugError.message}`)
    }

    const slug = slugData as string

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: params.name,
        slug,
        description: params.description,
        tagline: params.tagline,
        campaign_type: params.campaign_type,
        start_date: params.start_date,
        end_date: params.end_date,
        location_text: params.location_text,
        city: params.city,
        country: params.country,
        latitude: params.latitude,
        longitude: params.longitude,
        storyteller_target: params.storyteller_target,
        story_target: params.story_target,
        requires_consent_workflow: params.requires_consent_workflow ?? true,
        requires_elder_review: params.requires_elder_review ?? false,
        cultural_protocols: params.cultural_protocols,
        traditional_territory: params.traditional_territory,
        is_public: params.is_public ?? true,
        metadata: params.metadata || {},
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`)
    }

    return data
  }

  /**
   * Get campaign by ID
   */
  static async getById(campaignId: string): Promise<Campaign> {
    const supabase = createClientSSR()

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error) {
      throw new Error(`Failed to get campaign: ${error.message}`)
    }

    return data
  }

  /**
   * Get campaign by slug
   */
  static async getBySlug(slug: string): Promise<Campaign> {
    const supabase = createClientSSR()

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      throw new Error(`Failed to get campaign: ${error.message}`)
    }

    return data
  }

  /**
   * Get campaign with full details
   */
  static async getDetails(campaignId: string): Promise<CampaignDetails> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('get_campaign_details', {
      p_campaign_id: campaignId,
    })

    if (error) {
      throw new Error(`Failed to get campaign details: ${error.message}`)
    }

    return data as CampaignDetails
  }

  /**
   * List campaigns with filters
   */
  static async list(filters?: {
    status?: CampaignStatus | CampaignStatus[]
    campaign_type?: CampaignType
    is_featured?: boolean
    is_public?: boolean
    limit?: number
    offset?: number
  }): Promise<Campaign[]> {
    const supabase = createClientSSR()

    let query = supabase.from('campaigns').select('*')

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    if (filters?.campaign_type) {
      query = query.eq('campaign_type', filters.campaign_type)
    }

    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list campaigns: ${error.message}`)
    }

    return data
  }

  /**
   * Get active campaigns
   */
  static async getActive(limit = 10): Promise<Campaign[]> {
    const supabase = createClientSSR()

    const { data, error } = await supabase.rpc('get_active_campaigns', {
      p_tenant_id: null,
      p_limit: limit,
    })

    if (error) {
      throw new Error(`Failed to get active campaigns: ${error.message}`)
    }

    return data
  }

  /**
   * Update campaign
   */
  static async update(
    campaignId: string,
    updates: Partial<Campaign>
  ): Promise<Campaign> {
    const supabase = createClientSSR()

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`)
    }

    return data
  }

  /**
   * Update campaign status
   */
  static async updateStatus(
    campaignId: string,
    status: CampaignStatus
  ): Promise<void> {
    await this.update(campaignId, { status })
  }

  /**
   * Archive campaign
   */
  static async archive(campaignId: string): Promise<void> {
    await this.updateStatus(campaignId, 'archived')
  }

  /**
   * Delete campaign (admin only)
   */
  static async delete(campaignId: string): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`)
    }
  }

  /**
   * Update engagement metrics
   */
  static async updateEngagementMetrics(
    campaignId: string,
    metrics: Record<string, any>
  ): Promise<void> {
    const supabase = createClientSSR()

    // Merge with existing metrics
    const campaign = await this.getById(campaignId)
    const updatedMetrics = {
      ...(campaign.engagement_metrics || {}),
      ...metrics,
    }

    const { error } = await supabase
      .from('campaigns')
      .update({ engagement_metrics: updatedMetrics })
      .eq('id', campaignId)

    if (error) {
      throw new Error(`Failed to update metrics: ${error.message}`)
    }
  }

  /**
   * Get campaign progress
   */
  static async getProgress(campaignId: string): Promise<{
    storyteller_progress: number | null
    story_progress: number | null
    workflow_progress: number | null
    days_elapsed: number | null
    days_remaining: number | null
    completion_percentage: number
  }> {
    const campaign = await this.getById(campaignId)

    const storytellerProgress =
      campaign.storyteller_target && campaign.storyteller_target > 0
        ? Math.round((campaign.participant_count / campaign.storyteller_target) * 100)
        : null

    const storyProgress =
      campaign.story_target && campaign.story_target > 0
        ? Math.round((campaign.story_count / campaign.story_target) * 100)
        : null

    const workflowProgress =
      campaign.storyteller_target && campaign.storyteller_target > 0
        ? Math.round((campaign.workflow_count / campaign.storyteller_target) * 100)
        : null

    let daysElapsed: number | null = null
    let daysRemaining: number | null = null

    if (campaign.start_date) {
      const start = new Date(campaign.start_date)
      const now = new Date()
      daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      if (campaign.end_date) {
        const end = new Date(campaign.end_date)
        daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    // Overall completion: average of storyteller and story progress (if targets set)
    const progressScores = [storytellerProgress, storyProgress].filter(p => p !== null)
    const completionPercentage =
      progressScores.length > 0
        ? Math.round(progressScores.reduce((sum, p) => sum + p!, 0) / progressScores.length)
        : 0

    return {
      storyteller_progress: storytellerProgress,
      story_progress: storyProgress,
      workflow_progress: workflowProgress,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      completion_percentage: completionPercentage,
    }
  }

  /**
   * Link tour stop to campaign
   */
  static async linkTourStop(campaignId: string, tourStopId: string): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('tour_stops')
      .update({ campaign_id: campaignId })
      .eq('id', tourStopId)

    if (error) {
      throw new Error(`Failed to link tour stop: ${error.message}`)
    }
  }

  /**
   * Link story to campaign
   */
  static async linkStory(campaignId: string, storyId: string): Promise<void> {
    const supabase = createClientSSR()

    const { error } = await supabase
      .from('stories')
      .update({ campaign_id: campaignId })
      .eq('id', storyId)

    if (error) {
      throw new Error(`Failed to link story: ${error.message}`)
    }
  }

  /**
   * Get campaign statistics
   */
  static async getStatistics(campaignId: string): Promise<{
    total_workflows: number
    total_stories: number
    total_participants: number
    published_stories: number
    pending_review: number
    conversion_rate: number
    avg_days_to_publish: number | null
  }> {
    const supabase = createClientSSR()

    // Get workflow stats
    const { data: workflows } = await supabase
      .from('campaign_consent_workflows')
      .select('stage, created_at, published_at')
      .eq('campaign_id', campaignId)

    const totalWorkflows = workflows?.length || 0
    const publishedStories = workflows?.filter(w => w.stage === 'published').length || 0
    const pendingReview =
      workflows?.filter(w => ['recorded', 'reviewed'].includes(w.stage)).length || 0

    const conversionRate =
      totalWorkflows > 0 ? Math.round((publishedStories / totalWorkflows) * 100) : 0

    // Calculate average days to publish
    const publishedWorkflows = workflows?.filter(w => w.published_at) || []
    let avgDaysToPublish: number | null = null

    if (publishedWorkflows.length > 0) {
      const totalDays = publishedWorkflows.reduce((sum, w) => {
        const created = new Date(w.created_at)
        const published = new Date(w.published_at!)
        const days = Math.floor((published.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
      avgDaysToPublish = Math.round(totalDays / publishedWorkflows.length)
    }

    const campaign = await this.getById(campaignId)

    return {
      total_workflows: totalWorkflows,
      total_stories: campaign.story_count,
      total_participants: campaign.participant_count,
      published_stories: publishedStories,
      pending_review: pendingReview,
      conversion_rate: conversionRate,
      avg_days_to_publish: avgDaysToPublish,
    }
  }
}
