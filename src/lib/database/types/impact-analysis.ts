/**
 * Database types for Impact Analysis tables
 * Generated for Empathy Ledger v2
 */

// ============================================================================
// NARRATIVE ANALYSIS TYPES
// ============================================================================

export type ArcType =
  | 'rags_to_riches'  // Steady rise
  | 'tragedy'         // Steady fall
  | 'man_in_hole'     // Fall then rise
  | 'icarus'          // Rise then fall
  | 'cinderella'      // Rise-fall-rise
  | 'oedipus'         // Fall-rise-fall
  | 'cyclical'        // Circular/seasonal
  | 'linear'          // No clear pattern

export type AnalysisMethod = 'openai_gpt4' | 'lexicon' | 'manual'

export interface TrajectoryPoint {
  time: number        // 0.0 to 1.0 (percentage through story)
  valence: number     // -1.0 to 1.0 (negative to positive)
  arousal?: number    // 0.0 to 1.0 (calm to energized)
}

export interface NarrativeSegment {
  start: number       // 0.0 to 1.0
  end: number         // 0.0 to 1.0
  label: string       // 'struggle', 'transformation', 'resolution'
  emotion: string     // 'sadness', 'hope', 'joy'
  description?: string
}

export interface StoryNarrativeArc {
  id: string
  story_id: string

  // Arc classification
  arc_type: ArcType
  arc_confidence: number  // 0.0 to 1.0

  // Trajectory data
  trajectory_data: TrajectoryPoint[]

  // Segments
  segments?: NarrativeSegment[]

  // Metrics
  emotional_range: number           // max - min valence
  volatility: number                // standard deviation
  transformation_score: number      // end - beginning
  peak_moment?: number              // time of highest valence
  valley_moment?: number            // time of lowest valence

  // Analysis metadata
  analyzed_at: string
  analysis_version: string
  analysis_method: AnalysisMethod

  // Community override
  community_validated: boolean
  validated_by?: string
  validation_notes?: string

  created_at: string
  updated_at: string
}

export interface ThemeConnectedTheme {
  theme_id: string
  co_occurrence_count: number
  correlation: number  // 0.0 to 1.0
}

export interface ThemeEvolution {
  id: string
  theme_id: string

  // Time period
  time_period: string  // 'Q1_2024', 'Winter_2024'
  period_start: string // Date
  period_end: string   // Date

  // Prevalence
  story_count: number
  prominence_avg: number
  prominence_median: number
  prominence_total: number

  // Growth
  is_emerging: boolean
  is_declining: boolean
  growth_rate: number  // Percentage

  // Connections
  connected_themes?: ThemeConnectedTheme[]

  created_at: string
}

export interface ThemeConceptEvolution {
  id: string
  theme_id: string
  time_period: string

  // Semantic data
  representative_quotes: string[]
  key_concepts: string[]
  sentiment_avg: number
  sentiment_shift: number

  // Context
  primary_storytellers?: string[]  // Profile IDs
  geographic_concentration?: string

  created_at: string
}

// ============================================================================
// VOICE & AUDIO ANALYSIS TYPES
// ============================================================================

export type SpeakingRate = 'slow' | 'moderate' | 'fast'
export type AnalysisTool = 'praat' | 'parselmouth' | 'opensmile'

export interface ProsodyContourPoint {
  time: number   // Seconds
  pitch?: number // Hz
  intensity?: number // dB
}

export interface PauseLocation {
  time: number      // Seconds
  duration: number  // Seconds
}

export interface AudioProsodicAnalysis {
  id: string
  media_id: string
  story_id?: string

  // Pitch
  pitch_mean_hz: number
  pitch_std_hz: number
  pitch_range_hz: number
  pitch_contour?: ProsodyContourPoint[]

  // Intensity
  intensity_mean_db: number
  intensity_std_db: number
  intensity_contour?: ProsodyContourPoint[]

  // Speaking rate
  duration_seconds: number
  syllable_rate: number
  speaking_rate_category: SpeakingRate

  // Pauses
  pause_count: number
  avg_pause_duration_sec: number
  pause_locations?: PauseLocation[]

  // Voice quality
  harmonics_to_noise_ratio: number
  jitter?: number
  shimmer?: number

  // Cultural markers
  tonal_variation_pattern?: string
  ceremonial_prosody: boolean
  code_switching_detected: boolean

  // Metadata
  analyzed_at: string
  analysis_tool: AnalysisTool
  analysis_version?: string

  created_at: string
}

export type EmotionType = 'joy' | 'sadness' | 'neutral' | 'anger' | 'fear' | 'surprise'
export type EmotionModel = 'paralinguistic' | 'openai_whisper' | 'custom'

export interface EmotionTimelinePoint {
  time: number         // Seconds
  emotion: EmotionType
  confidence: number   // 0.0 to 1.0
  valence: number      // -1.0 to 1.0
  arousal: number      // 0.0 to 1.0
}

export interface AudioEmotionAnalysis {
  id: string
  media_id: string
  story_id?: string

  // Primary emotion
  primary_emotion: EmotionType
  confidence: number

  // All emotions
  emotion_joy: number
  emotion_sadness: number
  emotion_anger: number
  emotion_fear: number
  emotion_surprise: number
  emotion_neutral: number

  // Timeline
  emotion_timeline?: EmotionTimelinePoint[]

  // 2D emotion model
  arousal_level: number  // -1 to 1
  valence: number        // -1 to 1

  // Metadata
  analyzed_at: string
  analysis_model: EmotionModel

  created_at: string
}

export interface CodeSwitchingPoint {
  time: number
  from: string
  to: string
  context?: string
}

export interface CulturalSpeechPatterns {
  id: string
  story_id: string
  language_code?: string

  // Code-switching
  code_switching_detected: boolean
  primary_language?: string
  secondary_languages?: string[]
  switching_points?: CodeSwitchingPoint[]

  // Traditional formulae
  storytelling_formulae?: string[]
  ceremonial_markers: boolean
  traditional_opening?: string
  traditional_closing?: string

  // Oral poetry
  repetition_patterns?: any
  rhythmic_structure?: string
  call_and_response: boolean

  // Validation
  validated_by?: string
  validation_date?: string
  cultural_notes?: string

  created_at: string
}

// ============================================================================
// SOCIAL IMPACT MEASUREMENT (SROI) TYPES
// ============================================================================

export interface FundingSource {
  source: string
  amount: number
  funder?: string
}

export interface InKindContribution {
  type: string
  description: string
  value: number
}

export interface SROIInput {
  id: string
  project_id: string

  // Financial
  total_investment: number
  funding_sources?: FundingSource[]

  // Resources
  staff_hours?: number
  staff_cost_per_hour?: number
  volunteer_hours?: number
  volunteer_value_per_hour: number

  // In-kind
  in_kind_contributions?: InKindContribution[]

  // Period
  period_start: string // Date
  period_end: string   // Date

  // Metadata
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export type OutcomeType =
  | 'cultural_preservation'
  | 'community_healing'
  | 'youth_engagement'
  | 'policy_influence'
  | 'knowledge_transfer'
  | 'intergenerational_connection'
  | 'language_revitalization'

export type OutcomeCategory = 'individual' | 'community' | 'systemic'

export type StakeholderGroup =
  | 'storytellers'
  | 'youth'
  | 'elders'
  | 'community'
  | 'researchers'
  | 'policymakers'
  | 'families'

export type EvidenceQuality = 'low' | 'medium' | 'high'

export interface EvidenceSource {
  type: 'survey' | 'interview' | 'observation' | 'document' | 'testimony'
  description: string
  confidence?: 'low' | 'medium' | 'high'
  date?: string
}

export interface SROIOutcome {
  id: string
  project_id: string
  input_id?: string

  // Description
  outcome_type: OutcomeType
  outcome_description: string
  outcome_category?: OutcomeCategory

  // Beneficiaries
  stakeholder_group: StakeholderGroup
  beneficiary_count: number

  // Quantification
  quantity: number
  unit_of_measurement?: string

  // Financial proxy
  financial_proxy: number
  financial_proxy_source?: string
  financial_proxy_rationale?: string

  // Discounting
  deadweight: number     // 0.0 to 1.0
  attribution: number    // 0.0 to 1.0
  drop_off: number       // 0.0 to 1.0
  displacement: number   // 0.0 to 1.0

  // Duration
  duration_years: number

  // Evidence
  evidence_sources?: EvidenceSource[]
  evidence_quality?: EvidenceQuality

  // Calculated values
  gross_value?: number
  net_value?: number
  total_value?: number

  // Metadata
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export type SROIStatus = 'draft' | 'reviewed' | 'approved' | 'published'

export interface Assumption {
  assumption: string
  rationale?: string
}

export interface StakeholderValidation {
  stakeholder: string
  validated: boolean
  date: string
  notes?: string
}

export interface SROICalculation {
  id: string
  project_id: string
  calculation_date: string

  input_id?: string

  // Calculation
  total_investment: number
  total_social_value: number
  net_social_value?: number
  sroi_ratio: number

  // Sensitivity
  conservative_ratio?: number
  optimistic_ratio?: number
  discount_rate: number

  // Report
  methodology_notes?: string
  assumptions?: Assumption[]
  limitations?: string
  stakeholder_validation?: StakeholderValidation[]

  // Status
  status: SROIStatus
  approved_by?: string
  approved_at?: string

  created_by?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// RIPPLE EFFECT TYPES
// ============================================================================

export type RippleEffectType =
  | 'healing'
  | 'awareness'
  | 'policy'
  | 'action'
  | 'connection'
  | 'learning'
  | 'inspiration'

export type RippleLevel = 1 | 2 | 3 | 4 | 5

export type RippleLabel =
  | 'storyteller'
  | 'family'
  | 'community'
  | 'other_communities'
  | 'policy_systems'

export type GeographicReach = 'local' | 'regional' | 'national' | 'international'

export type EvidenceType =
  | 'interview'
  | 'survey'
  | 'observation'
  | 'document'
  | 'testimony'
  | 'anecdotal'

export type EvidenceQualityType = 'anecdotal' | 'documented' | 'verified'

export interface RippleEffect {
  id: string
  story_id?: string
  project_id?: string

  // Description
  effect_description: string
  effect_type?: RippleEffectType

  // Ripple level
  ripple_level: RippleLevel
  ripple_label?: RippleLabel

  // Reach
  people_affected?: number
  communities_affected?: number
  geographic_reach?: GeographicReach

  // Timing
  occurred_at?: string
  time_lag_days?: number

  // Evidence
  evidence_type?: EvidenceType
  evidence_source?: string
  evidence_quality?: EvidenceQualityType

  // Chain
  triggered_by?: string

  // Reporting
  reported_by?: string
  reported_at: string

  // Validation
  validated: boolean
  validated_by?: string
  validation_notes?: string

  created_at: string
}

// ============================================================================
// OUTCOME HARVESTING TYPES
// ============================================================================

export type WhoChanged =
  | 'individual'
  | 'family'
  | 'community'
  | 'organization'
  | 'policy'

export type ContributionAssessment =
  | 'direct'
  | 'indirect'
  | 'enabling'
  | 'catalyzing'

export type ChangeSignificance =
  | 'minor'
  | 'moderate'
  | 'significant'
  | 'transformative'

export interface HarvestedOutcome {
  id: string
  project_id: string
  story_id?: string

  // Outcome
  change_description: string
  who_changed: WhoChanged
  when_occurred?: string // Date

  // Behavior change
  behavior_before?: string
  behavior_after?: string
  change_significance?: ChangeSignificance

  // Evidence
  evidence_description: string
  evidence_sources?: any[]

  // Contribution
  contribution_description?: string
  contribution_assessment?: ContributionAssessment
  contribution_percentage?: number

  // Verification
  verified: boolean
  verified_by?: string
  verification_date?: string
  verification_notes?: string

  // Significance
  significance_level?: ChangeSignificance
  significance_rationale?: string
  significance_votes: number

  // Reporting
  reported_by?: string
  reported_at: string

  created_at: string
}

// ============================================================================
// PARTICIPATORY EVALUATION TYPES
// ============================================================================

export type SessionType =
  | 'storytelling_circle'
  | 'focus_group'
  | 'community_meeting'
  | 'workshop'

export interface SharedNarrative {
  speaker: string
  story: string
  theme?: string
  anonymous?: boolean
}

export interface CommunityInterpretationSession {
  id: string
  project_id: string

  // Session details
  session_date: string // Date
  location?: string
  session_type?: SessionType
  facilitator_id?: string

  // Participants
  participant_ids?: string[]
  participant_count: number
  participant_demographics?: Record<string, number>

  // Data reviewed
  stories_reviewed?: string[]
  themes_discussed?: string[]
  data_reviewed?: string

  // Interpretation
  key_findings: string[]
  community_insights?: string[]
  recommended_actions?: string[]

  // Stories
  shared_narratives?: SharedNarrative[]

  // Documentation
  recording_url?: string
  notes?: string
  documentation_type?: 'full_transcript' | 'summary' | 'notes_only'

  // Consent
  recording_permitted: boolean
  public_sharing_permitted: boolean

  created_by?: string
  created_at: string
}

export interface Metaphor {
  metaphor: string
  interpretation: string
  speaker?: string
}

export interface StorytellingCircleEvaluation {
  id: string
  project_id?: string
  session_id?: string

  // Protocol
  opening_protocol?: string
  closing_protocol?: string
  cultural_protocols_observed?: string[]

  // Prompts
  prompts_used?: string[]

  // Themes
  emergent_themes?: string[]
  significant_moments?: string[]

  // Cultural expressions
  metaphors?: Metaphor[]
  cultural_references?: string[]

  // Reflections
  process_reflections?: string
  what_worked_well?: string
  what_to_improve?: string

  created_at: string
}

export interface CommunityStoryResponse {
  id: string
  story_id: string
  respondent_id?: string

  // Response
  what_stood_out?: string
  personal_connection?: string
  inspired_action?: string

  // Impact
  changed_perspective: boolean
  perspective_change_description?: string

  // Sharing
  anonymous: boolean
  public_sharing_permitted: boolean

  // Metadata
  response_date: string
  created_at: string
}

// ============================================================================
// STORYTELLER NETWORK TYPES
// ============================================================================

export type ConnectionType =
  | 'thematic'
  | 'geographic'
  | 'familial'
  | 'temporal'
  | 'linguistic'

export type RelationshipType =
  | 'family'
  | 'mentor'
  | 'community_member'
  | 'colleague'

export interface StorytellerConnection {
  id: string

  // Storytellers
  storyteller_1_id: string
  storyteller_2_id: string

  // Connection
  connection_type: ConnectionType
  connection_strength: number // 0.0 to 1.0

  // Thematic
  shared_themes?: string[]
  theme_overlap_score?: number

  // Geographic
  shared_territory?: string
  distance_km?: number

  // Relationship
  relationship_type?: RelationshipType
  relationship_description?: string

  // Temporal
  time_period_overlap?: string
  temporal_proximity_days?: number

  // Linguistic
  shared_languages?: string[]

  // Metadata
  auto_detected: boolean
  detected_at: string
  created_at: string
}

// ============================================================================
// THEORY OF CHANGE TYPES
// ============================================================================

export type TOCStatus = 'draft' | 'active' | 'archived'

export interface TOCInput {
  type: 'funding' | 'staff' | 'volunteer' | 'equipment' | 'partnership'
  description: string
  amount?: number
  fte?: number
  source?: string
}

export interface TOCActivity {
  activity: string
  frequency?: string
  responsible?: string
}

export interface TOCOutput {
  output: string
  target?: number
  actual?: number
  unit?: string
}

export interface TOCOutcome {
  outcome: string
  indicator?: string
  target?: string
  measurement?: string
  achieved?: boolean
}

export interface TOCAssumption {
  assumption: string
  mitigation?: string
}

export interface TOCExternalFactor {
  factor: string
  impact: 'low' | 'medium' | 'high'
  likelihood: 'low' | 'medium' | 'high'
}

export interface TOCIndicator {
  stage: 'inputs' | 'activities' | 'outputs' | 'short_term' | 'medium_term' | 'long_term'
  indicator: string
  measurement: string
  frequency?: string
}

export interface TheoryOfChange {
  id: string
  project_id: string

  // Description
  name?: string
  description?: string

  // Stages
  inputs: TOCInput[]
  activities: TOCActivity[]
  outputs: TOCOutput[]
  short_term_outcomes: TOCOutcome[]
  medium_term_outcomes: TOCOutcome[]
  long_term_impact: TOCOutcome[]

  // Assumptions
  assumptions?: TOCAssumption[]
  external_factors?: TOCExternalFactor[]

  // Indicators
  indicators?: TOCIndicator[]

  // Layout
  layout_data?: any

  // Status
  status: TOCStatus
  version: number

  created_by?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface NetworkNode {
  id: string
  label: string
  type: 'storyteller' | 'theme' | 'story'
  size?: number
  color?: string
  [key: string]: any
}

export interface NetworkEdge {
  source: string
  target: string
  weight?: number
  type?: string
  [key: string]: any
}

export interface Network {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface StoryAnalytics {
  story_id: string
  narrative_arc?: StoryNarrativeArc
  emotion_analysis?: AudioEmotionAnalysis
  prosody_analysis?: AudioProsodicAnalysis
  ripple_effects?: RippleEffect[]
  community_responses?: CommunityStoryResponse[]
}

export interface ProjectImpactSummary {
  project_id: string
  story_count: number
  storyteller_count: number
  total_views: number

  // SROI
  sroi_ratio?: number
  total_social_value?: number

  // Themes
  top_themes: Array<{ theme_id: string; name: string; count: number }>
  emerging_themes: string[]

  // Network
  storyteller_connections: number
  network_density: number

  // Ripple effects
  ripple_effect_count: number
  people_reached: number
}
