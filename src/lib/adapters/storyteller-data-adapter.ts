// Adapter to convert API data to enhanced storyteller card format

export interface APIStorytellerData {
  id: string
  fullName: string
  displayName: string
  bio?: string
  avatarUrl?: string
  location?: string
  culturalBackground?: string
  isElder?: boolean
  isFeatured?: boolean
  stats: {
    totalTranscripts: number
    totalStories: number
    totalVideos: number
    analyzedContent: number
  }
  aiInsights?: {
    topThemes: Array<{ theme: string; count: number }>
    culturalMarkers?: string[]
    lastAnalyzed?: string
  }
  primaryProject?: string
  lastActive?: string
  // Enhanced storyteller properties
  impactFocusAreas?: string[]
  expertiseAreas?: string[]
  storytellingMethods?: string[]
  communityRoles?: string[]
  changeMakerType?: string
  geographicScope?: string
  yearsOfCommunityWork?: number
  mentorAvailability?: boolean
  speakingAvailability?: boolean
}

export interface EnhancedStorytellerData {
  id: string
  display_name: string
  bio?: string | null
  location?: string | null
  cultural_background?: string | null
  avatar_url?: string | null
  is_elder?: boolean
  is_featured?: boolean
  content_stats: {
    transcripts: number
    stories: number
    videos: number
    analyzed_content: number
  }
  ai_insights?: {
    top_themes: Array<{ theme: string; count: number }>
    cultural_markers?: string[]
    last_analyzed?: string
  }
  primary_project?: string
  last_active?: string
  // Enhanced storyteller properties
  impact_focus_areas?: string[] | null
  expertise_areas?: string[] | null
  storytelling_methods?: string[] | null
  community_roles?: string[] | null
  change_maker_type?: string | null
  geographic_scope?: string | null
  years_of_community_work?: number | null
  mentor_availability?: boolean | null
  speaking_availability?: boolean | null
}

export function adaptStorytellerData(apiData: APIStorytellerData): EnhancedStorytellerData {
  return {
    id: apiData.id,
    display_name: apiData.displayName || apiData.fullName,
    bio: apiData.bio || null,
    location: apiData.location || null,
    cultural_background: apiData.culturalBackground || null,
    avatar_url: apiData.avatarUrl || null,
    is_elder: apiData.isElder || false,
    is_featured: apiData.isFeatured || false,
    content_stats: {
      transcripts: apiData.stats.totalTranscripts,
      stories: apiData.stats.totalStories,
      videos: apiData.stats.totalVideos,
      analyzed_content: apiData.stats.analyzedContent
    },
    ai_insights: apiData.aiInsights ? {
      top_themes: apiData.aiInsights.topThemes,
      cultural_markers: apiData.aiInsights.culturalMarkers,
      last_analyzed: apiData.aiInsights.lastAnalyzed
    } : undefined,
    primary_project: apiData.primaryProject,
    last_active: apiData.lastActive,
    // Enhanced storyteller properties
    impact_focus_areas: apiData.impactFocusAreas || null,
    expertise_areas: apiData.expertiseAreas || null,
    storytelling_methods: apiData.storytellingMethods || null,
    community_roles: apiData.communityRoles || null,
    change_maker_type: apiData.changeMakerType || null,
    geographic_scope: apiData.geographicScope || null,
    years_of_community_work: apiData.yearsOfCommunityWork || null,
    mentor_availability: apiData.mentorAvailability || null,
    speaking_availability: apiData.speakingAvailability || null
  }
}

export function adaptStorytellerArray(apiDataArray: APIStorytellerData[]): EnhancedStorytellerData[] {
  return apiDataArray.map(adaptStorytellerData)
}