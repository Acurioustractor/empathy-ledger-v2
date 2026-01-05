/**
 * ACT Farmhand API Client
 *
 * TypeScript client for Empathy Ledger to integrate with Farmhand multi-agent system.
 *
 * Usage:
 *   const farmhand = new FarmhandClient()
 *   const sroi = await farmhand.calculateSROI({ ... })
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SROIRequest {
  project: string
  investment: number
  outcomes: {
    stories_preserved?: number
    healing_achieved?: number
    policy_influenced?: number
    community_connection?: number
    [key: string]: number | undefined
  }
}

export interface SROIResponse {
  total_value: number
  sroi_ratio: number
  breakdown: Array<{
    outcome: string
    count: number
    unit_value: number
    total_value: number
  }>
  interpretation: string
}

export interface ALMASignalRequest {
  project: string
  signal_family?: string
}

export interface GrantRequest {
  project: string
  keywords: string[]
}

export interface NarrativeArcRequest {
  transcript_text: string
  metadata?: {
    storyteller_name?: string
    cultural_background?: string
    [key: string]: any
  }
}

export interface NarrativeArcResponse {
  arc_pattern: 'linear_journey' | 'circular_return' | 'braided_stories' | 'witnessing' | 'teaching_story'
  key_moments: Array<{
    moment: string
    timestamp: string
    significance: string
  }>
  emotional_trajectory: string
  cultural_markers: string[]
  strengths: string[]
  analysis_notes: string
}

export interface ThematicEvolutionRequest {
  transcripts: Array<{
    id: string
    themes: string[]
    created_at: string
    ai_summary?: string
  }>
}

export interface ImpactEvidenceRequest {
  transcript_text: string
  themes: string[]
}

export interface ImpactEvidenceResponse {
  transformation_quotes: QuoteEvidence[]
  systems_impact_quotes: QuoteEvidence[]
  cultural_preservation_quotes: QuoteEvidence[]
  community_connection_quotes: QuoteEvidence[]
  resilience_quotes: QuoteEvidence[]
}

export interface QuoteEvidence {
  quote: string
  context: string
  value_signal: 'high' | 'medium' | 'low'
}

export interface CulturalProtocolCheck {
  flags: Array<{
    protocol: string
    markers_detected: string[]
    action: string
    severity: 'critical' | 'high' | 'medium' | 'low'
  }>
  overall_severity: 'critical' | 'high' | 'medium' | 'low'
  requires_elder_review: boolean
  recommended_action: string
}

export interface StoryDraftRequest {
  draft_text: string
  context?: {
    storyteller?: string
    purpose?: string
    [key: string]: any
  }
}

export interface StoryRefinementResponse {
  strengths: string[]
  suggestions: Array<{
    area: 'clarity' | 'tone' | 'cultural'
    suggestion: string
    example?: string
  }>
  tone_alignment: {
    voice_centered: boolean
    strength_based: boolean
    relational: boolean
    culturally_grounded: boolean
    data_sovereign: boolean
  }
  cultural_sensitivity: {
    elder_review_needed: boolean
    trigger_warning_needed: boolean
    consent_considerations: string
  }
  overall_assessment: string
}

export interface ToneCheckResponse {
  alignment_score: 'excellent' | 'good' | 'fair' | 'needs_work'
  flags: Array<{
    category: string
    patterns_found: string[]
    severity: 'high' | 'medium' | 'low'
    suggestion: string
  }>
  flag_count: number
  high_severity_count: number
  medium_severity_count: number
  passed: boolean
}

// ============================================================================
// CLIENT
// ============================================================================

export class FarmhandClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.FARMHAND_API_URL || 'http://localhost:8000'
    this.apiKey = process.env.FARMHAND_API_KEY || ''

    if (!this.apiKey) {
      console.warn('FARMHAND_API_KEY not set - API calls will fail')
    }
  }

  private async request<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(`Farmhand API error: ${error.detail || response.statusText}`)
    }

    return response.json()
  }

  // ==========================================================================
  // IMPACT AGENT
  // ==========================================================================

  /**
   * Calculate Social Return on Investment (SROI)
   */
  async calculateSROI(request: SROIRequest): Promise<SROIResponse> {
    return this.request<SROIResponse>('/impact/calculate-sroi', request)
  }

  // ==========================================================================
  // ALMA AGENT
  // ==========================================================================

  /**
   * Track ALMA signals for ethical intelligence
   */
  async trackALMASignals(request: ALMASignalRequest): Promise<any> {
    return this.request('/alma/track-signals', request)
  }

  /**
   * Check if action violates ethical boundaries
   */
  async checkEthics(action: string, context: any): Promise<any> {
    return this.request('/alma/check-ethics', { action, context })
  }

  // ==========================================================================
  // GRANT AGENT
  // ==========================================================================

  /**
   * Find relevant grant opportunities
   */
  async findGrants(request: GrantRequest): Promise<any> {
    return this.request('/grants/find-opportunities', request)
  }

  // ==========================================================================
  // STORY ANALYSIS AGENT
  // ==========================================================================

  /**
   * Analyze narrative arc and story structure
   */
  async analyzeNarrativeArc(request: NarrativeArcRequest): Promise<NarrativeArcResponse> {
    return this.request<NarrativeArcResponse>('/story/analyze-narrative', request)
  }

  /**
   * Analyze thematic evolution over time
   */
  async analyzeThematicEvolution(request: ThematicEvolutionRequest): Promise<any> {
    return this.request('/story/analyze-evolution', request)
  }

  /**
   * Extract impact evidence for funder reports
   */
  async extractImpactEvidence(request: ImpactEvidenceRequest): Promise<ImpactEvidenceResponse> {
    return this.request<ImpactEvidenceResponse>('/story/extract-evidence', request)
  }

  /**
   * Check cultural protocol concerns
   */
  async checkCulturalProtocols(transcript_text: string): Promise<CulturalProtocolCheck> {
    return this.request<CulturalProtocolCheck>('/story/check-protocols', { transcript_text })
  }

  // ==========================================================================
  // STORY WRITING AGENT
  // ==========================================================================

  /**
   * Get editorial suggestions for story draft
   */
  async refineStoryDraft(request: StoryDraftRequest): Promise<StoryRefinementResponse> {
    return this.request<StoryRefinementResponse>('/story/refine-draft', request)
  }

  /**
   * Generate title suggestions
   */
  async suggestTitles(story_text: string, count: number = 5): Promise<Array<{ title: string, style: string, rationale: string }>> {
    const response = await this.request<{ titles: any[] }>('/story/suggest-titles', { story_text, count })
    return response.titles
  }

  /**
   * Check tone alignment with Empathy Ledger values
   */
  async checkToneAlignment(text: string): Promise<ToneCheckResponse> {
    return this.request<ToneCheckResponse>('/story/check-tone', { text })
  }

  /**
   * Generate discussion questions for storytelling circles
   */
  async generateDiscussionQuestions(
    story_text: string,
    audience: 'community' | 'funder' | 'research' | 'education' = 'community'
  ): Promise<string[]> {
    const response = await this.request<{ questions: string[] }>('/story/discussion-questions', {
      story_text,
      audience
    })
    return response.questions
  }

  /**
   * Generate compelling story summary
   */
  async generateSummary(story_text: string, length: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
    const response = await this.request<{ summary: string }>('/story/generate-summary', {
      story_text,
      length
    })
    return response.summary
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string, service: string, version: string }> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) {
      throw new Error('Farmhand API health check failed')
    }
    return response.json()
  }
}

// Singleton instance for easy imports
export const farmhand = new FarmhandClient()
