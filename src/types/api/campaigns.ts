/**
 * API Types for Campaign Management
 *
 * Type definitions for campaign and workflow API endpoints
 * @module types/api/campaigns
 */

import { Campaign, CampaignDetails } from '@/lib/services/campaign.service'
import { CampaignWorkflow, WorkflowSummary, PendingConsentItem } from '@/lib/services/campaign-workflow.service'

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: Record<string, any>
}

export interface ApiListResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    count: number
    limit: number
    offset: number
  }
}

// ============================================================================
// Campaign API Types
// ============================================================================

export interface CampaignListParams {
  status?: string | string[]  // 'draft', 'active', 'paused', 'completed', 'archived'
  type?: string               // 'tour_stop', 'community_outreach', etc.
  featured?: boolean
  public?: boolean
  limit?: number              // max 100
  offset?: number
}

export interface CreateCampaignRequest {
  name: string
  description?: string
  tagline?: string
  campaign_type?: 'tour_stop' | 'community_outreach' | 'partnership' | 'collection_drive' | 'exhibition' | 'other'
  start_date?: string         // ISO date string
  end_date?: string           // ISO date string
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

export interface UpdateCampaignRequest {
  name?: string
  description?: string
  tagline?: string
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  campaign_type?: string
  start_date?: string
  end_date?: string
  location_text?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  storyteller_target?: number
  story_target?: number
  cover_image_url?: string
  logo_url?: string
  theme_color?: string
  requires_consent_workflow?: boolean
  requires_elder_review?: boolean
  cultural_protocols?: string
  traditional_territory?: string
  is_public?: boolean
  is_featured?: boolean
  metadata?: Record<string, any>
}

export interface CampaignProgressResponse {
  storyteller_progress: number | null
  story_progress: number | null
  workflow_progress: number | null
  days_elapsed: number | null
  days_remaining: number | null
  completion_percentage: number
}

export interface CampaignStatisticsResponse {
  total_workflows: number
  total_stories: number
  total_participants: number
  published_stories: number
  pending_review: number
  conversion_rate: number
  avg_days_to_publish: number | null
}

export interface CampaignAnalyticsResponse {
  progress: CampaignProgressResponse
  statistics: CampaignStatisticsResponse
  campaign_id: string
  generated_at: string
}

// ============================================================================
// Workflow API Types
// ============================================================================

export interface AddParticipantRequest {
  storyteller_id: string
  invitation_method?: 'email' | 'phone' | 'in_person' | 'social_media' | 'postal_mail' | 'other'
  notes?: string
  metadata?: Record<string, any>
}

export interface UpdateWorkflowRequest {
  stage?: 'invited' | 'interested' | 'consented' | 'recorded' | 'reviewed' | 'published' | 'withdrawn'
  notes?: string
  metadata?: Record<string, any>
  follow_up_date?: string
  follow_up_notes?: string
}

export interface BulkAdvanceWorkflowRequest {
  workflow_ids: string[]
  stage: 'invited' | 'interested' | 'consented' | 'recorded' | 'reviewed' | 'published' | 'withdrawn'
  notes?: string
}

export interface WorkflowQueueParams {
  campaign_id?: string
  limit?: number  // max 100
}

export interface ParticipantListParams {
  stage?: string
  elder_review?: boolean
}

// ============================================================================
// Type Guards
// ============================================================================

export function isCampaignResponse(response: any): response is ApiResponse<Campaign> {
  return response && typeof response === 'object' && 'success' in response && 'data' in response
}

export function isCampaignListResponse(response: any): response is ApiListResponse<Campaign> {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response &&
    Array.isArray(response.data)
  )
}

export function isWorkflowResponse(response: any): response is ApiResponse<CampaignWorkflow> {
  return response && typeof response === 'object' && 'success' in response && 'data' in response
}

// ============================================================================
// API Client Helpers
// ============================================================================

/**
 * Campaign API Client
 * Type-safe wrappers for campaign API endpoints
 */
export class CampaignApiClient {
  private baseUrl = '/api/v1/campaigns'

  async list(params?: CampaignListParams): Promise<ApiListResponse<Campaign>> {
    const queryParams = new URLSearchParams()
    if (params?.status) {
      queryParams.set('status', Array.isArray(params.status) ? params.status.join(',') : params.status)
    }
    if (params?.type) queryParams.set('type', params.type)
    if (params?.featured !== undefined) queryParams.set('featured', String(params.featured))
    if (params?.public !== undefined) queryParams.set('public', String(params.public))
    if (params?.limit) queryParams.set('limit', String(params.limit))
    if (params?.offset) queryParams.set('offset', String(params.offset))

    const url = `${this.baseUrl}?${queryParams.toString()}`
    const response = await fetch(url)
    return response.json()
  }

  async create(data: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async get(id: string, detailed = false): Promise<ApiResponse<Campaign | CampaignDetails>> {
    const url = detailed ? `${this.baseUrl}/${id}?detailed=true` : `${this.baseUrl}/${id}`
    const response = await fetch(url)
    return response.json()
  }

  async update(id: string, data: UpdateCampaignRequest): Promise<ApiResponse<Campaign>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async delete(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  }

  async getAnalytics(id: string): Promise<ApiResponse<CampaignAnalyticsResponse>> {
    const response = await fetch(`${this.baseUrl}/${id}/analytics`)
    return response.json()
  }

  async getParticipants(id: string, params?: ParticipantListParams): Promise<ApiListResponse<CampaignWorkflow>> {
    const queryParams = new URLSearchParams()
    if (params?.stage) queryParams.set('stage', params.stage)
    if (params?.elder_review !== undefined) queryParams.set('elder_review', String(params.elder_review))

    const url = `${this.baseUrl}/${id}/participants?${queryParams.toString()}`
    const response = await fetch(url)
    return response.json()
  }

  async addParticipant(id: string, data: AddParticipantRequest): Promise<ApiResponse<CampaignWorkflow>> {
    const response = await fetch(`${this.baseUrl}/${id}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }
}

/**
 * Workflow API Client
 * Type-safe wrappers for workflow API endpoints
 */
export class WorkflowApiClient {
  private baseUrl = '/api/v1/workflow'

  async getQueue(params?: WorkflowQueueParams): Promise<ApiListResponse<PendingConsentItem>> {
    const queryParams = new URLSearchParams()
    if (params?.campaign_id) queryParams.set('campaign_id', params.campaign_id)
    if (params?.limit) queryParams.set('limit', String(params.limit))

    const url = `${this.baseUrl}?${queryParams.toString()}`
    const response = await fetch(url)
    return response.json()
  }

  async get(id: string): Promise<ApiResponse<CampaignWorkflow>> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    return response.json()
  }

  async update(id: string, data: UpdateWorkflowRequest): Promise<ApiResponse<CampaignWorkflow>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async bulkAdvance(data: BulkAdvanceWorkflowRequest): Promise<ApiListResponse<CampaignWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }
}

// Export singleton instances
export const campaignApi = new CampaignApiClient()
export const workflowApi = new WorkflowApiClient()
