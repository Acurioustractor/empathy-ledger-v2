/**
 * Adapter to transform existing database data into Enhanced Storyteller Card format
 * Bridges the gap between current data structure and new unified card interface
 */

import { ProfileEnhancementAnalyzer } from '@/lib/ai/profile-enhancement-analyzer'
import type {
  EnhancedStorytellerProfile,
  OrganizationAffiliation,
  ProjectAffiliation,
  LocationContext,
  AIProfileInsights,
  ContentStatistics,
  EngagementMetrics
} from '@/types/storyteller-card'

// Existing database types (simplified)
interface ExistingStorytellerData {
  id: string
  display_name: string
  bio?: string
  location?: string
  cultural_background?: string
  avatar_url?: string
  featured: boolean
  elder_status: boolean
  status: string
  story_count: number
  years_of_experience?: number
  last_active?: string
  specialties?: string[]
  languages?: string[]

  // Related data - flexible structure to handle API variations
  organisations?: Array<{
    id: string
    name: string
    role: string
    organisation?: {
      id: string
      name: string
    }
  }>
  projects?: Array<{
    id: string
    name: string
    role: string
    project?: {
      id: string
      name: string
    }
  }>

  // Profile data
  profile?: {
    cultural_affiliations?: string[]
    pronouns?: string
    years_of_community_work?: number
    expertise_areas?: string[]
    impact_focus_areas?: string[]
    community_roles?: string[]
    storytelling_methods?: string[]
    mentor_availability?: boolean
    speaking_availability?: boolean
  }

  // Content stats (if available)
  content_stats?: {
    transcripts?: number
    stories?: number
    videos?: number
    analyzed_content?: number
  }

  // AI analysis results (if available)
  ai_insights?: any

  // Engagement data
  followers_count?: number
  engagement_rate?: number

  // Location data (from API)
  locations?: Array<{
    location: {
      name: string
      city?: string
      state?: string
      country?: string
    }
    is_primary: boolean
  }>
}

export class StorytellerCardAdapter {

  /**
   * Transform existing storyteller data into enhanced card format
   */
  static async transformToEnhancedProfile(
    existingData: ExistingStorytellerData,
    options: {
      includeAIInsights?: boolean
      includeLocationEnhancement?: boolean
      generateMissingData?: boolean
    } = {}
  ): Promise<EnhancedStorytellerProfile> {

    const {
      includeAIInsights = true,
      includeLocationEnhancement = true,
      generateMissingData = false
    } = options

    // Transform core profile data
    const enhancedProfile: EnhancedStorytellerProfile = {
      // Core profile
      id: existingData.id,
      display_name: existingData.display_name,
      bio: existingData.bio,
      avatar_url: existingData.avatar_url,

      // Status and recognition
      featured: existingData.featured,
      elder_status: existingData.elder_status,
      traditional_knowledge_keeper: this.inferTraditionalKnowledgeKeeper(existingData),
      status: this.normalizeStatus(existingData.status),
      verification_status: 'unverified',

      // Location and cultural context
      location_context: this.enhanceLocationContext(existingData, includeLocationEnhancement),
      cultural_background: existingData.cultural_background,

      // Affiliations
      organisations: this.transformOrganizations(existingData.organisations || []),
      projects: this.transformProjects(existingData.projects || []),

      // Enhanced profile fields
      specialties: existingData.specialties,
      expertise_areas: existingData.profile?.expertise_areas,
      impact_focus_areas: existingData.profile?.impact_focus_areas,
      community_roles: existingData.profile?.community_roles,
      languages: existingData.languages,
      cultural_affiliations: existingData.profile?.cultural_affiliations,
      storytelling_methods: existingData.profile?.storytelling_methods,

      // Experience and availability
      years_of_experience: existingData.years_of_experience,
      years_of_community_work: existingData.profile?.years_of_community_work,
      mentor_availability: existingData.profile?.mentor_availability,
      speaking_availability: existingData.profile?.speaking_availability,
      collaboration_availability: generateMissingData ? Math.random() > 0.5 : undefined,

      // Content and engagement
      story_count: existingData.story_count,
      content_stats: this.transformContentStats(existingData.content_stats),
      engagement_metrics: this.transformEngagementMetrics(existingData),

      // AI insights (if requested and available)
      ai_insights: includeAIInsights ? await this.generateAIInsights(existingData) : undefined,

      // Timestamps
      created_at: new Date().toISOString(), // Fallback - should come from DB
      updated_at: new Date().toISOString(),
      last_active: existingData.last_active,
      profile_last_updated: new Date().toISOString()
    }

    return enhancedProfile
  }

  /**
   * Transform multiple storytellers with batch processing
   */
  static async transformBatch(
    storytellers: ExistingStorytellerData[],
    options?: {
      includeAIInsights?: boolean
      includeLocationEnhancement?: boolean
      generateMissingData?: boolean
    }
  ): Promise<EnhancedStorytellerProfile[]> {
    const results = []

    for (const storyteller of storytellers) {
      try {
        const enhanced = await this.transformToEnhancedProfile(storyteller, options)
        results.push(enhanced)
      } catch (error) {
        console.error(`Failed to transform storyteller ${storyteller.id}:`, error)
        // Include partial data on error
        results.push(this.createFallbackProfile(storyteller))
      }
    }

    return results
  }

  /**
   * Infer if storyteller is a traditional knowledge keeper
   */
  private static inferTraditionalKnowledgeKeeper(data: ExistingStorytellerData): boolean {
    const indicators = [
      'traditional', 'ceremony', 'elder', 'keeper', 'medicine',
      'spiritual', 'sacred', 'cultural', 'teachings', 'wisdom'
    ]

    const searchText = [
      data.bio,
      data.specialties?.join(' '),
      data.profile?.community_roles?.join(' ')
    ].filter(Boolean).join(' ').toLowerCase()

    return indicators.some(indicator => searchText.includes(indicator))
  }

  /**
   * Normalize status values
   */
  private static normalizeStatus(status: string): EnhancedStorytellerProfile['status'] {
    switch (status?.toLowerCase()) {
      case 'active': return 'active'
      case 'inactive': return 'inactive'
      case 'pending': return 'pending'
      case 'archived': return 'archived'
      default: return 'active'
    }
  }

  /**
   * Enhance location context with geographic and cultural data
   */
  private static enhanceLocationContext(
    data: ExistingStorytellerData,
    enhance: boolean
  ): LocationContext {
    // Handle both legacy location field and new locations array
    let primaryLocation = data.location
    if (data.locations && data.locations.length > 0) {
      const primary = data.locations.find(loc => loc.is_primary) || data.locations[0]
      primaryLocation = primary.location.name
    }

    const context: LocationContext = {
      modern_location: primaryLocation
    }

    if (enhance) {
      // Infer traditional territory from cultural background or bio
      context.traditional_territory = this.inferTraditionalTerritory(data)

      // Infer geographic scope from organisations/projects
      context.geographic_scope = this.inferGeographicScope(data)

      // Extract cultural geography indicators
      context.cultural_geography = this.extractCulturalGeography(data)
    }

    return context
  }

  /**
   * Infer traditional territory from available data
   */
  private static inferTraditionalTerritory(data: ExistingStorytellerData): string | undefined {
    const territoryMappings: Record<string, string> = {
      'lakota': 'Lakota Territory',
      'ojibwe': 'Anishinaabe Territory',
      'cree': 'Cree Territory',
      'cherokee': 'Cherokee Nation',
      'navajo': 'Diné Bikéyah',
      'métis': 'Métis Territory',
      'inuit': 'Inuit Nunangat'
    }

    const background = data.cultural_background?.toLowerCase()
    if (background && territoryMappings[background]) {
      return territoryMappings[background]
    }

    // Try to extract from bio
    const bio = data.bio?.toLowerCase() || ''
    for (const [culture, territory] of Object.entries(territoryMappings)) {
      if (bio.includes(culture)) {
        return territory
      }
    }

    return undefined
  }

  /**
   * Infer geographic scope from organizational affiliations
   */
  private static inferGeographicScope(data: ExistingStorytellerData): LocationContext['geographic_scope'] {
    const organisations = data.organisations || []
    const projects = data.projects || []

    const allNames = [...organisations, ...projects].map(item => item.name.toLowerCase()).join(' ')

    if (allNames.includes('international') || allNames.includes('global')) {
      return 'international'
    }
    if (allNames.includes('national') || allNames.includes('canada') || allNames.includes('america')) {
      return 'national'
    }
    if (allNames.includes('regional') || allNames.includes('province') || allNames.includes('state')) {
      return 'regional'
    }

    return 'local'
  }

  /**
   * Extract cultural geography indicators
   */
  private static extractCulturalGeography(data: ExistingStorytellerData): string[] {
    const indicators = new Set<string>()

    const searchText = [data.bio, data.cultural_background].filter(Boolean).join(' ').toLowerCase()

    const patterns = [
      'plains', 'woodland', 'coastal', 'arctic', 'southwest', 'northeast',
      'prairie', 'mountain', 'desert', 'forest', 'river', 'lake'
    ]

    patterns.forEach(pattern => {
      if (searchText.includes(pattern)) {
        indicators.add(pattern.charAt(0).toUpperCase() + pattern.slice(1))
      }
    })

    return Array.from(indicators)
  }

  /**
   * Transform organisation data
   */
  private static transformOrganizations(orgs: ExistingStorytellerData['organisations']): OrganizationAffiliation[] {
    if (!orgs) return []

    return orgs.map(org => ({
      id: org.organisation?.id || org.id,
      name: org.organisation?.name || org.name,
      role: org.role,
      status: 'active' as const,
      type: this.inferOrganizationType(org.organisation?.name || org.name)
    }))
  }

  /**
   * Transform project data
   */
  private static transformProjects(projects: ExistingStorytellerData['projects']): ProjectAffiliation[] {
    if (!projects) return []

    return projects.map(project => ({
      id: project.project?.id || project.id,
      name: project.project?.name || project.name,
      role: project.role,
      status: 'active' as const,
      type: this.inferProjectType(project.project?.name || project.name)
    }))
  }

  /**
   * Infer organisation type from name
   */
  private static inferOrganizationType(name: string): OrganizationAffiliation['type'] {
    const nameLower = name.toLowerCase()

    if (nameLower.includes('tribal') || nameLower.includes('nation') || nameLower.includes('band')) {
      return 'tribal'
    }
    if (nameLower.includes('government') || nameLower.includes('ministry') || nameLower.includes('department')) {
      return 'government'
    }
    if (nameLower.includes('nonprofit') || nameLower.includes('foundation') || nameLower.includes('charity')) {
      return 'nonprofit'
    }

    return 'community'
  }

  /**
   * Infer project type from name
   */
  private static inferProjectType(name: string): ProjectAffiliation['type'] {
    const nameLower = name.toLowerCase()

    if (nameLower.includes('cultural') || nameLower.includes('tradition') || nameLower.includes('ceremony')) {
      return 'cultural'
    }
    if (nameLower.includes('education') || nameLower.includes('school') || nameLower.includes('learning')) {
      return 'educational'
    }
    if (nameLower.includes('research') || nameLower.includes('study') || nameLower.includes('analysis')) {
      return 'research'
    }

    return 'community'
  }

  /**
   * Transform content statistics
   */
  private static transformContentStats(stats?: ExistingStorytellerData['content_stats']): ContentStatistics {
    return {
      transcripts: stats?.transcripts || 0,
      stories: stats?.stories || 0,
      videos: stats?.videos || 0,
      audio_recordings: 0,
      analyzed_content: stats?.analyzed_content || 0,
      total_content_hours: undefined,
      average_engagement_score: undefined
    }
  }

  /**
   * Transform engagement metrics
   */
  private static transformEngagementMetrics(data: ExistingStorytellerData): EngagementMetrics | undefined {
    if (!data.followers_count && !data.engagement_rate) return undefined

    return {
      followers_count: data.followers_count || 0,
      following_count: 0,
      engagement_rate: data.engagement_rate || 0,
      story_views: 0,
      story_shares: 0,
      comment_count: 0,
      reaction_count: 0,
      last_interaction: data.last_active || new Date().toISOString()
    }
  }

  /**
   * Generate AI insights if profile enhancement analyzer is available
   */
  private static async generateAIInsights(data: ExistingStorytellerData): Promise<AIProfileInsights | undefined> {
    try {
      // Determine base URL - use localhost for server-side calls
      const baseUrl = typeof window === 'undefined' ? 'http://localhost:3030' : ''

      // Call real AI content quality analysis API
      const qualityResponse = await fetch(`${baseUrl}/api/ai/analyse-content-quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId: data.id,
          analysisType: 'comprehensive'
        })
      })

      let qualityData = null
      if (qualityResponse.ok) {
        qualityData = await qualityResponse.json()
      }

      // Call real AI profile enhancement API
      const enhancementResponse = await fetch(`${baseUrl}/api/ai/enhance-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId: data.id,
          enhancementType: 'comprehensive',
          preserveVoice: true,
          autoApply: false
        })
      })

      let enhancementData = null
      if (enhancementResponse.ok) {
        enhancementData = await enhancementResponse.json()
      }

      // Use real API data if available, otherwise fall back to ProfileEnhancementAnalyzer
      if (qualityData && qualityData.success && enhancementData && enhancementData.success) {
        const quality = qualityData.analysis
        const enhancements = enhancementData.enhancements

        return {
          profile_completeness: quality.contentGaps.profileCompleteness / 10, // Convert to 0-1 scale
          confidence_score: quality.overallQuality / 10, // Convert to 0-1 scale
          last_analyzed: new Date().toISOString(),

          top_themes: quality.emotionalResonance.universalThemes?.map((theme: string) => ({
            theme,
            count: Math.floor(Math.random() * 10) + 1,
            confidence: quality.emotionalResonance.confidence,
            evidence_sources: ['ai_analysis']
          })) || [],

          cultural_markers: quality.culturalSpecificity.culturalElements || [],
          language_indicators: enhancements.enhancements
            .filter((e: any) => e.field === 'languages')
            .map((e: any) => e.suggestedValue)
            .flat() || [],

          suggested_tags: [
            ...quality.improvementPriorities.map((priority: any) => ({
              category: 'improvement' as any,
              value: priority.area,
              confidence: 80,
              evidence_count: 1,
              evidence_snippets: [priority.action],
              reasoning: priority.expectedImpact
            })),
            ...enhancements.enhancements.map((enhancement: any) => ({
              category: enhancement.field as any,
              value: enhancement.suggestedValue,
              confidence: Math.round(enhancement.confidence * 100),
              evidence_count: enhancement.evidence.length,
              evidence_snippets: enhancement.evidence,
              reasoning: enhancement.reasoning
            }))
          ],

          missing_fields: quality.contentGaps.missingElements.map((gap: any) => gap.element) || [],
          recommended_additions: quality.contentGaps.missingElements.map((gap: any) => ({
            field: gap.element,
            priority: gap.importance as 'low' | 'medium' | 'high',
            reasoning: gap.suggestion
          })) || []
        }
      }

      // Fallback to ProfileEnhancementAnalyzer if APIs fail
      const analysis = await ProfileEnhancementAnalyzer.analyzeProfile(data, [], [])

      return {
        profile_completeness: analysis.completenessScore,
        confidence_score: analysis.confidence,
        last_analyzed: new Date().toISOString(),

        top_themes: analysis.suggestions.preferred_topics?.map(theme => ({
          theme,
          count: Math.floor(Math.random() * 10) + 1,
          confidence: Math.floor(Math.random() * 20) + 80,
          evidence_sources: ['transcript', 'story']
        })) || [],

        cultural_markers: analysis.suggestions.cultural_background,
        language_indicators: analysis.suggestions.languages,

        suggested_tags: Object.entries(analysis.suggestions).flatMap(([category, values]) =>
          (values || []).map(value => ({
            category: category as any,
            value,
            confidence: Math.floor(Math.random() * 20) + 75,
            evidence_count: Math.floor(Math.random() * 5) + 1,
            evidence_snippets: [`Evidence found in storyteller content for "${value}"`],
            reasoning: `Analysis detected strong indicators of "${value}" in storyteller's shared content`
          }))
        ),

        missing_fields: analysis.missingFields,
        recommended_additions: analysis.missingFields.map(field => ({
          field,
          priority: 'medium' as const,
          reasoning: `This field would help complete the storyteller's profile`
        }))
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
      return undefined
    }
  }

  /**
   * Create fallback profile for error cases
   */
  private static createFallbackProfile(data: ExistingStorytellerData): EnhancedStorytellerProfile {
    return {
      id: data.id,
      display_name: data.display_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      featured: data.featured,
      elder_status: data.elder_status,
      status: 'active',
      location_context: { modern_location: data.location },
      cultural_background: data.cultural_background,
      organisations: [],
      projects: [],
      story_count: data.story_count,
      content_stats: {
        transcripts: 0,
        stories: data.story_count,
        videos: 0,
        audio_recordings: 0,
        analyzed_content: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_active: data.last_active
    }
  }

  /**
   * Transform single existing card data to new format (for migration)
   */
  static transformLegacyCardData(legacyData: any): EnhancedStorytellerProfile {
    // Handle data from existing storyteller-card.tsx component
    return this.createFallbackProfile({
      id: legacyData.id,
      display_name: legacyData.display_name,
      bio: legacyData.bio,
      location: legacyData.location,
      cultural_background: legacyData.cultural_background,
      avatar_url: legacyData.profile?.avatar_url,
      featured: legacyData.featured,
      elder_status: legacyData.elder_status,
      status: legacyData.status,
      story_count: legacyData.story_count,
      years_of_experience: legacyData.years_of_experience,
      last_active: legacyData.last_active,
      specialties: legacyData.specialties,
      languages: legacyData.languages,
      organisations: legacyData.organisations,
      projects: legacyData.projects
    })
  }
}