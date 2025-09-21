/**
 * TypeScript interfaces for Enhanced Storyteller Card System
 * Includes organisation/project tagging, location context, and AI-driven features
 */

export interface OrganizationAffiliation {
  id: string
  name: string
  role: string
  status?: 'active' | 'completed' | 'paused'
  type?: 'nonprofit' | 'community' | 'government' | 'tribal'
  start_date?: string
  end_date?: string
  description?: string
}

export interface ProjectAffiliation {
  id: string
  name: string
  role: string
  status?: 'active' | 'completed' | 'planning'
  type?: 'cultural' | 'educational' | 'community' | 'research'
  start_date?: string
  end_date?: string
  description?: string
  impact_area?: string
}

export interface LocationContext {
  modern_location?: string
  traditional_territory?: string
  geographic_scope?: 'local' | 'regional' | 'national' | 'international'
  cultural_geography?: string[]
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface AIProfileInsights {
  profile_completeness: number
  confidence_score: number
  last_analyzed: string

  // Content analysis
  top_themes: Array<{
    theme: string
    count: number
    confidence: number
    evidence_sources: string[]
  }>

  // Cultural markers
  cultural_markers?: string[]
  language_indicators?: string[]
  traditional_knowledge_areas?: string[]

  // Suggested profile enhancements
  suggested_tags: Array<{
    category: 'specialties' | 'expertise_areas' | 'impact_focus_areas' | 'community_roles' | 'cultural_affiliations' | 'languages'
    value: string
    confidence: number
    evidence_count: number
    evidence_snippets: string[]
    reasoning: string
  }>

  // Profile gaps
  missing_fields: string[]
  recommended_additions: Array<{
    field: string
    priority: 'high' | 'medium' | 'low'
    reasoning: string
  }>
}

export interface ContentStatistics {
  transcripts: number
  stories: number
  videos: number
  audio_recordings: number
  analyzed_content: number
  total_content_hours?: number
  average_engagement_score?: number
}

export interface EngagementMetrics {
  followers_count: number
  following_count: number
  engagement_rate: number
  story_views: number
  story_shares: number
  comment_count: number
  reaction_count: number
  last_interaction: string
}

export interface EnhancedStorytellerProfile {
  // Core profile
  id: string
  display_name: string
  bio?: string
  avatar_url?: string

  // Status and recognition
  featured: boolean
  elder_status: boolean
  traditional_knowledge_keeper?: boolean
  status: 'active' | 'inactive' | 'pending' | 'archived'
  verification_status?: 'verified' | 'pending' | 'unverified'

  // Location and cultural context
  location_context: LocationContext
  cultural_background?: string

  // Affiliations
  organisations: OrganizationAffiliation[]
  projects: ProjectAffiliation[]

  // Enhanced profile fields
  specialties?: string[]
  expertise_areas?: string[]
  impact_focus_areas?: string[]
  community_roles?: string[]
  languages?: string[]
  cultural_affiliations?: string[]
  storytelling_methods?: string[]

  // Experience and availability
  years_of_experience?: number
  years_of_community_work?: number
  mentor_availability?: boolean
  speaking_availability?: boolean
  collaboration_availability?: boolean

  // Content and engagement
  story_count: number
  content_stats: ContentStatistics
  engagement_metrics?: EngagementMetrics

  // AI insights
  ai_insights?: AIProfileInsights

  // Timestamps
  created_at: string
  updated_at: string
  last_active?: string
  profile_last_updated?: string
}

export interface AISuggestionAction {
  type: 'apply' | 'reject' | 'modify'
  suggestion: AIProfileInsights['suggested_tags'][0]
  modified_value?: string
  notes?: string
}

export interface StorytellerCardCallbacks {
  onApplyAISuggestion?: (action: AISuggestionAction) => Promise<void>
  onRejectAISuggestion?: (suggestion: AIProfileInsights['suggested_tags'][0]) => Promise<void>
  onUpdateProfile?: (updates: Partial<EnhancedStorytellerProfile>) => Promise<void>
  onViewFullProfile?: (storytellerId: string) => void
  onFollow?: (storytellerId: string) => Promise<void>
  onMessage?: (storytellerId: string) => void
  onShare?: (storytellerId: string) => void
}

export interface StorytellerCardVariantConfig {
  variant: 'default' | 'featured' | 'compact' | 'detailed' | 'admin'
  showAIInsights: boolean
  showOrganizations: boolean
  showProjects: boolean
  showContentStats: boolean
  showEngagementMetrics: boolean
  showExpandedView: boolean
  maxOrganizations?: number
  maxProjects?: number
  maxThemes?: number
  enableAISuggestionActions: boolean
}

export interface StorytellerCardDisplayOptions {
  showActions: boolean
  showStatusBadges: boolean
  showLocationContext: boolean
  showCulturalMarkers: boolean
  showLastActive: boolean
  enableHoverEffects: boolean
  enableExpandCollapse: boolean
  compactMode: boolean
}

// Utility types for filtering and sorting
export type StorytellerCardFilter = {
  status?: EnhancedStorytellerProfile['status'][]
  elder_status?: boolean
  featured?: boolean
  has_ai_insights?: boolean
  profile_completeness_min?: number
  organization_types?: OrganizationAffiliation['type'][]
  project_types?: ProjectAffiliation['type'][]
  geographic_scope?: LocationContext['geographic_scope'][]
  cultural_backgrounds?: string[]
  languages?: string[]
  specialties?: string[]
  years_experience_min?: number
  story_count_min?: number
  last_active_within_days?: number
}

export type StorytellerCardSortOption =
  | 'display_name'
  | 'story_count'
  | 'years_of_experience'
  | 'last_active'
  | 'profile_completeness'
  | 'engagement_rate'
  | 'created_at'

export interface StorytellerCardCollectionProps {
  storytellers: EnhancedStorytellerProfile[]
  variant?: StorytellerCardVariantConfig['variant']
  displayOptions?: Partial<StorytellerCardDisplayOptions>
  callbacks?: StorytellerCardCallbacks
  filter?: StorytellerCardFilter
  sortBy?: StorytellerCardSortOption
  sortDirection?: 'asc' | 'desc'
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  loading?: boolean
  error?: string
  className?: string
}

// Hook interfaces for data management
export interface UseStorytellerCardsReturn {
  storytellers: EnhancedStorytellerProfile[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  applyFilter: (filter: StorytellerCardFilter) => void
  applySorting: (sortBy: StorytellerCardSortOption, direction: 'asc' | 'desc') => void
  updateStorytellerProfile: (id: string, updates: Partial<EnhancedStorytellerProfile>) => Promise<void>
  handleAISuggestion: (storytellerId: string, action: AISuggestionAction) => Promise<void>
}

export interface UseAIInsightsReturn {
  insights: AIProfileInsights | null
  loading: boolean
  error: string | null
  refreshInsights: () => Promise<void>
  applyAISuggestion: (action: AISuggestionAction) => Promise<void>
  rejectAISuggestion: (suggestion: AIProfileInsights['suggested_tags'][0]) => Promise<void>
  markInsightsAsReviewed: () => Promise<void>
}