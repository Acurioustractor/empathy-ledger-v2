/**
 * Story Recommendations Engine for Empathy Ledger
 * 
 * Uses AI SDK v5 to generate personalized story recommendations
 * while respecting cultural protocols and user preferences.
 * 
 * Features:
 * - Cultural background matching
 * - Theme similarity analysis
 * - Elder-approved content prioritization
 * - Seasonal and ceremonial relevance
 * - Community connection strengthening
 */

import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { culturalSafetyAI, withCulturalSafety } from './cultural-safety-middleware'
import type { Database } from '@/types/database'

// Recommendation schemas for type safety
const RecommendationSchema = z.object({
  story_id: z.string(),
  relevance_score: z.number().min(0).max(1),
  reasoning: z.string(),
  cultural_connection: z.string(),
  themes: z.array(z.string()),
  emotional_resonance: z.enum(['high', 'medium', 'low']),
  cultural_sensitivity_match: z.boolean()
})

const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
  cultural_context: z.string(),
  diversity_explanation: z.string(),
  total_analyzed: z.number()
})

export interface UserPreferences {
  cultural_background?: string
  cultural_affiliations?: string[]
  interests?: string[]
  preferred_themes?: string[]
  story_types?: string[]
  cultural_sensitivity_comfort?: 'low' | 'medium' | 'high'
  language_preferences?: string[]
  age_appropriate?: boolean
  elder_content_preference?: boolean
}

export interface RecommendationContext {
  user_id: string
  current_story_id?: string
  session_context?: string
  time_context?: 'morning' | 'afternoon' | 'evening' | 'seasonal'
  emotional_state?: string
  community_events?: string[]
}

export interface StoryRecommendation {
  story_id: string
  title: string
  storyteller_name: string
  relevance_score: number
  reasoning: string
  cultural_connection: string
  themes: string[]
  emotional_resonance: 'high' | 'medium' | 'low'
  cultural_sensitivity_match: boolean
  elder_approved: boolean
  reading_time_minutes: number
}

export class StoryRecommendationsEngine {
  private supabase = createSupabaseServerClient()
  private model = openai('gpt-4o') // Using more capable model for nuanced cultural understanding

  /**
   * Generate personalized story recommendations for a user
   */
  async generateRecommendations(
    context: RecommendationContext,
    preferences: UserPreferences,
    maxRecommendations: number = 5
  ): Promise<StoryRecommendation[]> {
    
    // Use cultural safety middleware
    return await withCulturalSafety({
      content: `Generate recommendations for user interests: ${preferences.interests?.join(', ')}`,
      user_id: context.user_id,
      context_type: 'story',
      operation: 'recommend'
    }, async () => {
      
      // Get eligible stories based on cultural safety and user preferences
      const eligibleStories = await this.getEligibleStories(context, preferences)
      
      if (eligibleStories.length === 0) {
        return []
      }

      // Get user's cultural context for personalization
      const userContext = await this.getUserCulturalContext(context.user_id)
      
      // Analyze stories with AI for relevance and cultural fit
      const aiRecommendations = await this.analyzeStoriesForRecommendations(
        eligibleStories,
        preferences,
        userContext,
        context,
        maxRecommendations
      )

      // Enhance with database metadata and return
      return await this.enrichRecommendationsWithMetadata(aiRecommendations.recommendations)
    })
  }

  /**
   * Get recommendations based on similar stories (for "More like this")
   */
  async getSimilarStories(
    storyId: string,
    userId: string,
    maxRecommendations: number = 3
  ): Promise<StoryRecommendation[]> {
    
    return await withCulturalSafety({
      content: `Find stories similar to story ${storyId}`,
      user_id: userId,
      context_type: 'story',
      operation: 'recommend'
    }, async () => {
      
      // Get the reference story
      const { data: referenceStory } = await this.supabase
        .from('stories')
        .select(`
          *,
          storyteller:storytellers(display_name, cultural_background),
          author:profiles!stories_author_id_fkey(cultural_affiliations)
        `)
        .eq('id', storyId)
        .single()

      if (!referenceStory) {
        return []
      }

      // Get user preferences
      const userPreferences = await this.getUserPreferences(userId)
      
      // Find similar stories
      const eligibleStories = await this.getEligibleStories(
        { user_id: userId },
        userPreferences
      )

      // Filter out the reference story
      const candidateStories = eligibleStories.filter(story => story.id !== storyId)

      if (candidateStories.length === 0) {
        return []
      }

      // Use AI to find the most similar stories
      const userContext = await this.getUserCulturalContext(userId)
      const similarityAnalysis = await this.analyzeSimilarStories(
        referenceStory,
        candidateStories,
        userContext,
        maxRecommendations
      )

      return await this.enrichRecommendationsWithMetadata(similarityAnalysis.recommendations)
    })
  }

  /**
   * Get culturally relevant seasonal recommendations
   */
  async getSeasonalRecommendations(
    userId: string,
    season: string,
    maxRecommendations: number = 4
  ): Promise<StoryRecommendation[]> {
    
    return await withCulturalSafety({
      content: `Get ${season} seasonal story recommendations`,
      user_id: userId,
      context_type: 'story',
      operation: 'recommend'
    }, async () => {
      
      const userPreferences = await this.getUserPreferences(userId)
      const userContext = await this.getUserCulturalContext(userId)

      // Get stories with seasonal context
      const { data: seasonalStories } = await this.supabase
        .from('stories')
        .select(`
          *,
          storyteller:storytellers(display_name, cultural_background, elder_status),
          author:profiles!stories_author_id_fkey(cultural_affiliations)
        `)
        .eq('status', 'published')
        .or(`tags.cs.{${season}},cultural_context->>season.eq.${season}`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!seasonalStories || seasonalStories.length === 0) {
        return []
      }

      // Filter by cultural safety and user access
      const eligibleStories = await this.filterStoriesByCulturalSafety(seasonalStories, userId)

      if (eligibleStories.length === 0) {
        return []
      }

      // Use AI to select the most relevant seasonal stories
      const seasonalAnalysis = await this.analyzeSeasonalRelevance(
        eligibleStories,
        season,
        userContext,
        userPreferences,
        maxRecommendations
      )

      return await this.enrichRecommendationsWithMetadata(seasonalAnalysis.recommendations)
    })
  }

  private async getEligibleStories(context: RecommendationContext, preferences: UserPreferences) {
    let query = this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(
          display_name, 
          cultural_background, 
          elder_status,
          profile:profiles(cultural_affiliations)
        ),
        author:profiles!stories_author_id_fkey(
          cultural_affiliations,
          cultural_background
        )
      `)
      .eq('status', 'published')
      .neq('author_id', context.user_id) // Don't recommend user's own stories

    // Apply cultural sensitivity filtering
    if (preferences.cultural_sensitivity_comfort) {
      const allowedLevels = preferences.cultural_sensitivity_comfort === 'high' 
        ? ['low', 'medium', 'high']
        : preferences.cultural_sensitivity_comfort === 'medium'
        ? ['low', 'medium'] 
        : ['low']
      
      query = query.in('cultural_sensitivity_level', allowedLevels)
    }

    // Apply story type filtering
    if (preferences.story_types && preferences.story_types.length > 0) {
      query = query.in('story_type', preferences.story_types)
    }

    // Apply language filtering
    if (preferences.language_preferences && preferences.language_preferences.length > 0) {
      query = query.in('language', preferences.language_preferences)
    }

    // Get recent, well-rated stories
    query = query
      .order('created_at', { ascending: false })
      .limit(50) // Get a good pool to analyse

    const { data: stories, error } = await query

    if (error) {
      console.error('Error fetching eligible stories:', error)
      return []
    }

    return stories || []
  }

  private async filterStoriesByCulturalSafety(stories: any[], userId: string) {
    const filtered = []
    
    for (const story of stories) {
      // Check if user has access based on cultural protocols
      const hasAccess = await this.checkStoryAccess(story, userId)
      if (hasAccess) {
        filtered.push(story)
      }
    }

    return filtered
  }

  private async checkStoryAccess(story: any, userId: string): Promise<boolean> {
    // Check cultural sensitivity and elder approval requirements
    if (story.cultural_sensitivity_level === 'high' && !story.elder_approval) {
      return false
    }

    // Check if user's cultural background aligns with story requirements
    const { data: userProfile } = await this.supabase
      .from('profiles')
      .select('cultural_affiliations, cultural_background, is_elder')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return story.cultural_sensitivity_level === 'low'
    }

    // Elder stories might require elder status or specific cultural affiliation
    if (story.requires_elder_approval && !userProfile.is_elder) {
      // Check if user has appropriate cultural affiliation
      const storyAffiliations = story.storyteller?.profile?.cultural_affiliations || []
      const userAffiliations = userProfile.cultural_affiliations || []
      
      const hasMatchingAffiliation = storyAffiliations.some((affiliation: string) => 
        userAffiliations.includes(affiliation)
      )
      
      if (!hasMatchingAffiliation) {
        return false
      }
    }

    return true
  }

  private async analyzeStoriesForRecommendations(
    stories: any[],
    preferences: UserPreferences,
    userContext: any,
    context: RecommendationContext,
    maxRecommendations: number
  ) {
    const prompt = this.buildRecommendationPrompt(stories, preferences, userContext, context)

    const result = await generateObject({
      model: this.model,
      schema: RecommendationsResponseSchema,
      prompt,
      temperature: 0.3 // Balanced creativity with consistency
    })

    return result.object
  }

  private buildRecommendationPrompt(
    stories: any[],
    preferences: UserPreferences,
    userContext: any,
    context: RecommendationContext
  ): string {
    const storySummaries = stories.map(story => ({
      id: story.id,
      title: story.title,
      content_preview: story.content.substring(0, 500),
      themes: story.tags,
      cultural_background: story.storyteller?.cultural_background,
      storyteller_elder_status: story.storyteller?.elder_status,
      cultural_sensitivity: story.cultural_sensitivity_level,
      story_type: story.story_type,
      reading_time: story.reading_time_minutes
    })).slice(0, 20) // Limit for token efficiency

    return `As a culturally sensitive AI assistant for an Indigenous storytelling platform, analyse these stories and recommend the best matches for this user.

USER PROFILE:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Is Elder: ${userContext.is_elder ? 'Yes' : 'No'}
- Interests: ${preferences.interests?.join(', ') || 'General'}
- Preferred Themes: ${preferences.preferred_themes?.join(', ') || 'Any'}
- Cultural Sensitivity Comfort: ${preferences.cultural_sensitivity_comfort || 'medium'}
- Elder Content Preference: ${preferences.elder_content_preference ? 'Yes' : 'No'}

CONTEXT:
- Current Session: ${context.session_context || 'General browsing'}
- Time: ${context.time_context || 'anytime'}
- Community Events: ${context.community_events?.join(', ') || 'None'}

AVAILABLE STORIES:
${storySummaries.map(story => 
  `ID: ${story.id}
   Title: ${story.title}
   Preview: ${story.content_preview}
   Themes: ${story.themes?.join(', ') || 'None'}
   Cultural Background: ${story.cultural_background || 'Not specified'}
   Elder Storyteller: ${story.storyteller_elder_status ? 'Yes' : 'No'}
   Cultural Sensitivity: ${story.cultural_sensitivity}
   Type: ${story.story_type}
   Reading Time: ${story.reading_time} minutes
   ---`
).join('\n')}

REQUIREMENTS:
1. Select stories that resonate with user's cultural background and interests
2. Prioritize cultural sensitivity matches and elder-approved content when user prefers it
3. Ensure diverse themes and perspectives in recommendations
4. Respect cultural protocols - never recommend sacred content inappropriately
5. Consider reading time and session context
6. Provide clear cultural connection explanations

Recommend the top ${Math.min(stories.length, 5)} stories with detailed reasoning for each selection.`
  }

  private async analyzeSimilarStories(
    referenceStory: any,
    candidateStories: any[],
    userContext: any,
    maxRecommendations: number
  ) {
    const prompt = `Find stories most similar to this reference story, considering cultural appropriateness and thematic resonance.

REFERENCE STORY:
Title: ${referenceStory.title}
Content Preview: ${referenceStory.content.substring(0, 800)}
Themes: ${referenceStory.tags?.join(', ') || 'None'}
Cultural Context: ${referenceStory.storyteller?.cultural_background || 'Not specified'}
Story Type: ${referenceStory.story_type}
Cultural Sensitivity: ${referenceStory.cultural_sensitivity_level}

USER CONTEXT:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Is Elder: ${userContext.is_elder ? 'Yes' : 'No'}

CANDIDATE STORIES:
${candidateStories.slice(0, 15).map(story => 
  `ID: ${story.id}
   Title: ${story.title}
   Preview: ${story.content.substring(0, 400)}
   Themes: ${story.tags?.join(', ') || 'None'}
   Cultural Background: ${story.storyteller?.cultural_background || 'Not specified'}
   Type: ${story.story_type}
   ---`
).join('\n')}

Select the ${maxRecommendations} most similar stories based on:
1. Thematic similarity
2. Cultural resonance and appropriateness
3. Storytelling style and approach
4. Emotional tone and message
5. Cultural sensitivity level compatibility

Provide relevance scores and detailed reasoning for similarity.`

    const result = await generateObject({
      model: this.model,
      schema: RecommendationsResponseSchema,
      prompt,
      temperature: 0.2
    })

    return result.object
  }

  private async analyzeSeasonalRelevance(
    stories: any[],
    season: string,
    userContext: any,
    preferences: UserPreferences,
    maxRecommendations: number
  ) {
    const seasonalPrompt = `Analyze these stories for ${season} seasonal relevance and cultural appropriateness.

SEASON: ${season}
CULTURAL CONTEXT: Consider Indigenous seasonal practices, ceremonies, and traditional knowledge appropriate for this time.

USER PROFILE:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Interests: ${preferences.interests?.join(', ') || 'General'}

STORIES TO ANALYZE:
${stories.map(story => 
  `ID: ${story.id}
   Title: ${story.title}
   Preview: ${story.content.substring(0, 400)}
   Themes: ${story.tags?.join(', ') || 'None'}
   Cultural Context: ${JSON.stringify(story.cultural_context)}
   ---`
).join('\n')}

Select the ${maxRecommendations} most seasonally relevant stories considering:
1. Direct seasonal themes and content
2. Cultural ceremonies and practices appropriate for ${season}
3. Traditional knowledge and teachings relevant to this time
4. Emotional and spiritual resonance with the season
5. Community activities and gatherings typical of ${season}

Ensure all recommendations respect cultural protocols and seasonal appropriateness.`

    const result = await generateObject({
      model: this.model,
      schema: RecommendationsResponseSchema,
      prompt: seasonalPrompt,
      temperature: 0.3
    })

    return result.object
  }

  private async enrichRecommendationsWithMetadata(
    recommendations: any[]
  ): Promise<StoryRecommendation[]> {
    const enriched: StoryRecommendation[] = []

    for (const rec of recommendations) {
      const { data: story } = await this.supabase
        .from('stories')
        .select(`
          *,
          storyteller:storytellers(display_name)
        `)
        .eq('id', rec.story_id)
        .single()

      if (story) {
        enriched.push({
          story_id: rec.story_id,
          title: story.title,
          storyteller_name: story.storyteller?.display_name || 'Anonymous',
          relevance_score: rec.relevance_score,
          reasoning: rec.reasoning,
          cultural_connection: rec.cultural_connection,
          themes: rec.themes,
          emotional_resonance: rec.emotional_resonance,
          cultural_sensitivity_match: rec.cultural_sensitivity_match,
          elder_approved: story.elder_approval || false,
          reading_time_minutes: story.reading_time_minutes || 5
        })
      }
    }

    return enriched
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select(`
        cultural_background,
        cultural_affiliations,
        interests,
        cultural_permissions
      `)
      .eq('id', userId)
      .single()

    if (!profile) {
      return {}
    }

    const permissions = profile.cultural_permissions as any
    
    return {
      cultural_background: profile.cultural_background,
      cultural_affiliations: profile.cultural_affiliations,
      interests: profile.interests,
      cultural_sensitivity_comfort: permissions?.cultural_sensitivity_comfort || 'medium',
      elder_content_preference: permissions?.elder_content_preference || false
    }
  }

  private async getUserCulturalContext(userId: string) {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return profile || {}
  }
}

// Export singleton instance
export const storyRecommendationsEngine = new StoryRecommendationsEngine()

// Helper functions for different recommendation types
export async function getPersonalizedRecommendations(
  userId: string,
  maxRecommendations: number = 5
): Promise<StoryRecommendation[]> {
  const preferences = await storyRecommendationsEngine['getUserPreferences'](userId)
  
  return storyRecommendationsEngine.generateRecommendations(
    { user_id: userId, time_context: 'anytime' },
    preferences,
    maxRecommendations
  )
}

export async function getSimilarStories(
  storyId: string,
  userId: string,
  maxRecommendations: number = 3
): Promise<StoryRecommendation[]> {
  return storyRecommendationsEngine.getSimilarStories(storyId, userId, maxRecommendations)
}

export async function getSeasonalRecommendations(
  userId: string,
  season?: string,
  maxRecommendations: number = 4
): Promise<StoryRecommendation[]> {
  const currentSeason = season || getCurrentSeason()
  return storyRecommendationsEngine.getSeasonalRecommendations(userId, currentSeason, maxRecommendations)
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'  
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}