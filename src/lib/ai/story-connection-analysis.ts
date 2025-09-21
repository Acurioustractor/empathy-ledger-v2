/**
 * Story Connection Analysis System for Empathy Ledger
 * 
 * Analyzes relationships between stories, themes, and narratives to help
 * community members discover meaningful connections while respecting
 * Indigenous knowledge systems and cultural protocols.
 * 
 * Features:
 * - Thematic connection mapping
 * - Narrative thread analysis
 * - Cultural pattern recognition
 * - Intergenerational story linking
 * - Community healing journey mapping
 * - Sacred knowledge protection
 */

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { culturalSafetyAI, withCulturalSafety } from './cultural-safety-middleware'
import type { Database } from '@/types/database'

// Connection analysis schemas
const StoryConnectionSchema = z.object({
  story_id: z.string(),
  connection_type: z.enum([
    'thematic_similarity',
    'cultural_continuity', 
    'healing_journey',
    'generational_wisdom',
    'seasonal_cycle',
    'geographical_connection',
    'ceremonial_sequence',
    'teaching_progression'
  ]),
  connection_strength: z.number().min(0).max(1),
  shared_themes: z.array(z.string()).max(5),
  cultural_significance: z.string(),
  connection_explanation: z.string()
})

const ConnectionNetworkSchema = z.object({
  focal_story_id: z.string(),
  direct_connections: z.array(StoryConnectionSchema).max(10),
  thematic_clusters: z.array(z.object({
    theme: z.string(),
    stories: z.array(z.string()),
    cultural_context: z.string(),
    significance: z.string()
  })).max(5),
  narrative_threads: z.array(z.object({
    thread_name: z.string(),
    story_sequence: z.array(z.string()),
    cultural_teaching: z.string(),
    appropriate_audience: z.array(z.string())
  })).max(3),
  cultural_patterns: z.array(z.object({
    pattern_type: z.string(),
    related_stories: z.array(z.string()),
    cultural_meaning: z.string(),
    traditional_context: z.string()
  })).max(4)
})

const CommunityJourneySchema = z.object({
  journey_type: z.enum(['healing', 'learning', 'cultural_connection', 'personal_growth', 'community_building']),
  story_path: z.array(z.object({
    story_id: z.string(),
    position: z.number(),
    role_in_journey: z.string(),
    preparation_needed: z.array(z.string()),
    cultural_protocols: z.array(z.string())
  })),
  journey_description: z.string(),
  cultural_guidance: z.string(),
  elder_consultation_recommended: z.boolean(),
  estimated_duration: z.string(),
  community_support_needed: z.boolean()
})

export interface ConnectionAnalysisRequest {
  focal_story_id: string
  user_id: string
  analysis_type: 'comprehensive' | 'thematic' | 'cultural' | 'healing_journey'
  cultural_context?: {
    user_background?: string
    cultural_affiliations?: string[]
    learning_goals?: string[]
    spiritual_readiness?: string
  }
  max_connections?: number
}

export interface StoryConnection {
  story_id: string
  title: string
  storyteller_name: string
  connection_type: string
  connection_strength: number
  shared_themes: string[]
  cultural_significance: string
  connection_explanation: string
  reading_time: number
  cultural_sensitivity_level: string
  elder_approved: boolean
  created_at: string
}

export interface ConnectionNetwork {
  focal_story: {
    id: string
    title: string
    themes: string[]
  }
  connections: StoryConnection[]
  thematic_clusters: Array<{
    theme: string
    stories: StoryConnection[]
    cultural_context: string
    significance: string
  }>
  narrative_threads: Array<{
    thread_name: string
    story_sequence: StoryConnection[]
    cultural_teaching: string
    appropriate_audience: string[]
  }>
  cultural_patterns: Array<{
    pattern_type: string
    related_stories: StoryConnection[]
    cultural_meaning: string
    traditional_context: string
  }>
}

export interface CommunityJourney {
  journey_type: string
  title: string
  description: string
  story_path: Array<{
    story: StoryConnection
    position: number
    role_in_journey: string
    preparation_needed: string[]
    cultural_protocols: string[]
  }>
  cultural_guidance: string
  elder_consultation_recommended: boolean
  estimated_duration: string
  community_support_needed: boolean
}

export class StoryConnectionAnalysisSystem {
  private supabase = createSupabaseServerClient()
  private model = openai('gpt-4o') // Using most capable model for nuanced cultural analysis

  /**
   * Analyze connections between stories and create a connection network
   */
  async analyzeStoryConnections(request: ConnectionAnalysisRequest): Promise<ConnectionNetwork> {
    
    return await withCulturalSafety({
      content: `Analyze connections for story ${request.focal_story_id}`,
      user_id: request.user_id,
      context_type: 'story',
      operation: 'analyse'
    }, async () => {
      
      // Get the focal story
      const focalStory = await this.getFocalStory(request.focal_story_id)
      if (!focalStory) {
        throw new Error('Focal story not found')
      }

      // Get candidate stories for connection analysis
      const candidateStories = await this.getCandidateStories(request, focalStory)
      
      // Filter by cultural safety and user access
      const accessibleStories = await this.filterStoriesByAccess(candidateStories, request.user_id)
      
      // Perform AI-based connection analysis
      const connectionAnalysis = await this.performConnectionAnalysis(
        focalStory,
        accessibleStories,
        request
      )

      // Enrich with database metadata
      const enrichedNetwork = await this.enrichConnectionNetwork(connectionAnalysis, focalStory)

      return enrichedNetwork
    })
  }

  /**
   * Create a guided community journey based on stories
   */
  async createCommunityJourney(
    journeyType: 'healing' | 'learning' | 'cultural_connection' | 'personal_growth' | 'community_building',
    userId: string,
    startingStoryId?: string,
    userGoals?: string[]
  ): Promise<CommunityJourney> {
    
    return await withCulturalSafety({
      content: `Create ${journeyType} journey starting from ${startingStoryId || 'community stories'}`,
      user_id: userId,
      context_type: 'story',
      operation: 'recommend'
    }, async () => {
      
      const userContext = await this.getUserCulturalContext(userId)
      
      // Get appropriate stories for this journey type
      const journeyStories = await this.getJourneyStories(journeyType, userId, userContext)
      
      // Create the journey path with AI guidance
      const journeyAnalysis = await this.createJourneyPath(
        journeyType,
        journeyStories,
        userContext,
        startingStoryId,
        userGoals
      )

      // Enrich with story metadata
      const enrichedJourney = await this.enrichCommunityJourney(journeyAnalysis)

      return enrichedJourney
    })
  }

  /**
   * Find stories that form thematic threads or teachings
   */
  async findNarrativeThreads(
    themeOrTeaching: string,
    userId: string,
    maxStories: number = 5
  ): Promise<{
    threads: Array<{
      name: string
      stories: StoryConnection[]
      teaching: string
      cultural_context: string
    }>
  }> {
    
    return await withCulturalSafety({
      content: `Find narrative threads for theme: ${themeOrTeaching}`,
      user_id: userId,
      context_type: 'story',
      operation: 'analyse'
    }, async () => {
      
      // Search for stories related to the theme
      const relatedStories = await this.findStoriesByTheme(themeOrTeaching, userId)
      
      // Analyze narrative threads with AI
      const threadAnalysis = await this.analyzeNarrativeThreads(
        themeOrTeaching,
        relatedStories,
        maxStories
      )

      // Convert to final format
      const threads = await Promise.all(
        threadAnalysis.narrative_threads.map(async (thread) => ({
          name: thread.thread_name,
          stories: await this.enrichStoryConnections(
            thread.story_sequence.map(id => ({ story_id: id }))
          ),
          teaching: thread.cultural_teaching,
          cultural_context: thread.appropriate_audience.join(', ')
        }))
      )

      return { threads }
    })
  }

  /**
   * Analyze cultural patterns across the story collection
   */
  async analyzeCulturalPatterns(
    userId: string,
    culturalFocus?: string[]
  ): Promise<{
    patterns: Array<{
      pattern_type: string
      stories: StoryConnection[]
      cultural_meaning: string
      traditional_context: string
      contemporary_relevance: string
    }>
  }> {
    
    const userContext = await this.getUserCulturalContext(userId)
    
    // Get stories that show cultural patterns
    const culturalStories = await this.getCulturallySignificantStories(userId, culturalFocus)
    
    // Analyze patterns with cultural sensitivity
    const patternAnalysis = await this.identifyCulturalPatterns(
      culturalStories,
      userContext,
      culturalFocus
    )

    // Convert to enriched format
    const patterns = await Promise.all(
      patternAnalysis.cultural_patterns.map(async (pattern) => ({
        pattern_type: pattern.pattern_type,
        stories: await this.enrichStoryConnections(
          pattern.related_stories.map(id => ({ story_id: id }))
        ),
        cultural_meaning: pattern.cultural_meaning,
        traditional_context: pattern.traditional_context,
        contemporary_relevance: await this.analyzeContemporaryRelevance(pattern)
      }))
    )

    return { patterns }
  }

  /**
   * Get connection analytics for dashboard insights
   */
  async getConnectionAnalytics(timeframe: 'week' | 'month' | 'all' = 'month') {
    const startDate = timeframe === 'week' 
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : timeframe === 'month'
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0)

    // Get connection analysis data
    const { data: analyses } = await this.supabase
      .from('story_connection_analyses')
      .select('*')
      .gte('created_at', startDate.toISOString())

    // Get popular themes and connections
    const { data: stories } = await this.supabase
      .from('stories')
      .select('tags, cultural_context, views_count')
      .eq('status', 'published')
      .gte('created_at', startDate.toISOString())

    const popularThemes = this.extractPopularThemes(stories || [])
    const connectionTypes = this.analyzeConnectionTypes(analyses || [])
    
    return {
      total_analyses: analyses?.length || 0,
      popular_themes: popularThemes,
      connection_types: connectionTypes,
      community_journeys_created: analyses?.filter(a => a.analysis_type === 'healing_journey').length || 0
    }
  }

  private async getFocalStory(storyId: string) {
    const { data: story } = await this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name, cultural_background),
        author:profiles!stories_author_id_fkey(display_name)
      `)
      .eq('id', storyId)
      .single()

    return story
  }

  private async getCandidateStories(request: ConnectionAnalysisRequest, focalStory: any) {
    const { data: stories } = await this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name, cultural_background),
        author:profiles!stories_author_id_fkey(display_name)
      `)
      .eq('status', 'published')
      .neq('id', request.focal_story_id) // Exclude the focal story itself
      .order('created_at', { ascending: false })
      .limit(50) // Get a good pool for analysis

    return stories || []
  }

  private async filterStoriesByAccess(stories: any[], userId: string) {
    const filteredStories = []
    
    for (const story of stories) {
      const hasAccess = await this.checkStoryAccess(story, userId)
      if (hasAccess) {
        filteredStories.push(story)
      }
    }

    return filteredStories
  }

  private async checkStoryAccess(story: any, userId: string): Promise<boolean> {
    // Similar to the recommendation engine's access logic
    if (story.cultural_sensitivity_level === 'high' && !story.elder_approval) {
      return false
    }

    const { data: userProfile } = await this.supabase
      .from('profiles')
      .select('cultural_affiliations, is_elder')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return story.cultural_sensitivity_level === 'low'
    }

    return true
  }

  private async performConnectionAnalysis(
    focalStory: any,
    candidateStories: any[],
    request: ConnectionAnalysisRequest
  ) {
    const userContext = request.cultural_context || {}
    
    const prompt = `Analyze deep connections between stories in this Indigenous storytelling platform.

FOCAL STORY:
Title: ${focalStory.title}
Content: ${focalStory.content.substring(0, 1500)}
Themes: ${focalStory.tags?.join(', ') || 'None'}
Cultural Context: ${JSON.stringify(focalStory.cultural_context || {})}
Storyteller Background: ${focalStory.storyteller?.cultural_background || 'Not specified'}

USER CONTEXT:
- Cultural Background: ${userContext.user_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Learning Goals: ${userContext.learning_goals?.join(', ') || 'General exploration'}
- Spiritual Readiness: ${userContext.spiritual_readiness || 'Open'}

CANDIDATE STORIES FOR CONNECTION ANALYSIS:
${candidateStories.slice(0, 15).map((story, index) => 
  `${index + 1}. ID: ${story.id}
     Title: ${story.title}
     Preview: ${story.content.substring(0, 400)}
     Themes: ${story.tags?.join(', ') || 'None'}
     Cultural Background: ${story.storyteller?.cultural_background || 'Not specified'}
     Cultural Sensitivity: ${story.cultural_sensitivity_level}
     ---`
).join('\n')}

CONNECTION ANALYSIS REQUIREMENTS:
1. Identify direct thematic and cultural connections to the focal story
2. Group stories into meaningful thematic clusters that support learning and healing
3. Discover narrative threads that create teaching progressions or healing journeys  
4. Recognize cultural patterns that honour Indigenous knowledge systems
5. Consider appropriate sequencing for different audiences (children, youth, adults, elders)
6. Respect sacred knowledge and ceremonial content protocols

CULTURAL CONSIDERATIONS:
- Honor Indigenous storytelling traditions and purposes
- Recognize seasonal, ceremonial, and life-stage appropriateness
- Consider community healing and teaching needs
- Respect intergenerational knowledge transmission
- Account for cultural protocol requirements
- Support community connection and cultural continuity

Create connections that serve community learning, healing, and cultural strengthening while respecting all protocols.`

    const result = await generateObject({
      model: this.model,
      schema: ConnectionNetworkSchema,
      prompt,
      temperature: 0.3
    })

    return result.object
  }

  private async createJourneyPath(
    journeyType: string,
    journeyStories: any[],
    userContext: any,
    startingStoryId?: string,
    userGoals?: string[]
  ) {
    const prompt = `Create a guided community ${journeyType} journey using these Indigenous stories.

JOURNEY TYPE: ${journeyType}
USER GOALS: ${userGoals?.join(', ') || 'General growth and connection'}
STARTING STORY: ${startingStoryId ? `Specific story ${startingStoryId}` : 'Open to any appropriate beginning'}

USER CONTEXT:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Is Elder: ${userContext.is_elder ? 'Yes' : 'No'}

AVAILABLE STORIES:
${journeyStories.map((story, index) => 
  `${index + 1}. ID: ${story.id}
     Title: ${story.title}
     Content Preview: ${story.content.substring(0, 300)}
     Themes: ${story.tags?.join(', ') || 'None'}
     Cultural Sensitivity: ${story.cultural_sensitivity_level}
     Elder Approved: ${story.elder_approval ? 'Yes' : 'No'}
     ---`
).join('\n')}

JOURNEY DESIGN PRINCIPLES:
1. Create a meaningful progression that supports the journey type
2. Consider emotional and spiritual readiness at each stage
3. Honor cultural protocols and appropriate access levels
4. Include preparation and integration support
5. Respect individual and community healing processes
6. Consider seasonal or ceremonial timing when relevant

For ${journeyType} journey:
${this.getJourneyTypeGuidance(journeyType)}

Create a thoughtful journey path that serves the user's needs while honouring Indigenous wisdom traditions.`

    const result = await generateObject({
      model: this.model,
      schema: CommunityJourneySchema,
      prompt,
      temperature: 0.4
    })

    return result.object
  }

  private getJourneyTypeGuidance(journeyType: string): string {
    switch (journeyType) {
      case 'healing':
        return '- Focus on stories that support emotional and spiritual healing\n- Progress from recognition through understanding to integration\n- Include community support and elder wisdom\n- Consider trauma-informed approaches'
      case 'learning':
        return '- Build knowledge progressively from foundational to advanced\n- Include diverse perspectives and teaching styles\n- Connect traditional and contemporary knowledge\n- Support different learning preferences'
      case 'cultural_connection':
        return '- Strengthen ties to cultural identity and community\n- Include stories from different generations\n- Honor traditional practices and contemporary adaptations\n- Build pride and belonging'
      case 'personal_growth':
        return '- Support individual development and self-discovery\n- Include stories of challenge, growth, and wisdom\n- Encourage reflection and integration\n- Balance individual and community perspectives'
      case 'community_building':
        return '- Foster connections between community members\n- Include stories of cooperation and mutual support\n- Encourage shared experiences and dialogue\n- Strengthen community bonds and shared values'
      default:
        return '- Create a meaningful and appropriate progression\n- Honor cultural values and community needs\n- Support positive outcomes for participants'
    }
  }

  private async enrichConnectionNetwork(analysis: z.infer<typeof ConnectionNetworkSchema>, focalStory: any): Promise<ConnectionNetwork> {
    // Enrich connections with full story data
    const connections = await this.enrichStoryConnections(analysis.direct_connections)
    
    // Enrich thematic clusters
    const thematic_clusters = await Promise.all(
      analysis.thematic_clusters.map(async (cluster) => ({
        theme: cluster.theme,
        stories: await this.enrichStoryConnections(cluster.stories.map(id => ({ story_id: id }))),
        cultural_context: cluster.cultural_context,
        significance: cluster.significance
      }))
    )

    // Enrich narrative threads
    const narrative_threads = await Promise.all(
      analysis.narrative_threads.map(async (thread) => ({
        thread_name: thread.thread_name,
        story_sequence: await this.enrichStoryConnections(thread.story_sequence.map(id => ({ story_id: id }))),
        cultural_teaching: thread.cultural_teaching,
        appropriate_audience: thread.appropriate_audience
      }))
    )

    // Enrich cultural patterns
    const cultural_patterns = await Promise.all(
      analysis.cultural_patterns.map(async (pattern) => ({
        pattern_type: pattern.pattern_type,
        related_stories: await this.enrichStoryConnections(pattern.related_stories.map(id => ({ story_id: id }))),
        cultural_meaning: pattern.cultural_meaning,
        traditional_context: pattern.traditional_context
      }))
    )

    return {
      focal_story: {
        id: focalStory.id,
        title: focalStory.title,
        themes: focalStory.tags || []
      },
      connections,
      thematic_clusters,
      narrative_threads,
      cultural_patterns
    }
  }

  private async enrichStoryConnections(connections: Array<{ story_id: string, [key: string]: any }>): Promise<StoryConnection[]> {
    const enriched: StoryConnection[] = []

    for (const conn of connections) {
      const { data: story } = await this.supabase
        .from('stories')
        .select(`
          *,
          storyteller:storytellers(display_name)
        `)
        .eq('id', conn.story_id)
        .single()

      if (story) {
        enriched.push({
          story_id: conn.story_id,
          title: story.title,
          storyteller_name: story.storyteller?.display_name || 'Anonymous',
          connection_type: conn.connection_type || 'thematic_similarity',
          connection_strength: conn.connection_strength || 0.5,
          shared_themes: conn.shared_themes || [],
          cultural_significance: conn.cultural_significance || '',
          connection_explanation: conn.connection_explanation || '',
          reading_time: story.reading_time_minutes || 5,
          cultural_sensitivity_level: story.cultural_sensitivity_level || 'medium',
          elder_approved: story.elder_approval || false,
          created_at: story.created_at
        })
      }
    }

    return enriched
  }

  private async enrichCommunityJourney(analysis: z.infer<typeof CommunityJourneySchema>): Promise<CommunityJourney> {
    const story_path = await Promise.all(
      analysis.story_path.map(async (step) => {
        const { data: story } = await this.supabase
          .from('stories')
          .select(`
            *,
            storyteller:storytellers(display_name)
          `)
          .eq('id', step.story_id)
          .single()

        if (!story) {
          throw new Error(`Story ${step.story_id} not found`)
        }

        return {
          story: {
            story_id: story.id,
            title: story.title,
            storyteller_name: story.storyteller?.display_name || 'Anonymous',
            connection_type: 'journey_step',
            connection_strength: 1.0,
            shared_themes: story.tags || [],
            cultural_significance: step.role_in_journey,
            connection_explanation: `Step ${step.position} in ${analysis.journey_type} journey`,
            reading_time: story.reading_time_minutes || 5,
            cultural_sensitivity_level: story.cultural_sensitivity_level || 'medium',
            elder_approved: story.elder_approval || false,
            created_at: story.created_at
          },
          position: step.position,
          role_in_journey: step.role_in_journey,
          preparation_needed: step.preparation_needed,
          cultural_protocols: step.cultural_protocols
        }
      })
    )

    return {
      journey_type: analysis.journey_type,
      title: `${analysis.journey_type.charAt(0).toUpperCase() + analysis.journey_type.slice(1)} Journey`,
      description: analysis.journey_description,
      story_path,
      cultural_guidance: analysis.cultural_guidance,
      elder_consultation_recommended: analysis.elder_consultation_recommended,
      estimated_duration: analysis.estimated_duration,
      community_support_needed: analysis.community_support_needed
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

  private async getJourneyStories(journeyType: string, userId: string, userContext: any) {
    let query = this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name, cultural_background)
      `)
      .eq('status', 'published')
      .eq('elder_approval', true) // Journey stories should be elder-approved

    // Filter based on journey type and user context
    if (journeyType === 'healing') {
      query = query.contains('tags', ['healing', 'recovery', 'strength', 'resilience'])
    } else if (journeyType === 'learning') {
      query = query.contains('tags', ['teaching', 'education', 'wisdom', 'knowledge'])
    } else if (journeyType === 'cultural_connection') {
      query = query.contains('tags', ['culture', 'identity', 'tradition', 'heritage'])
    }

    query = query.order('created_at', { ascending: false }).limit(30)

    const { data: stories } = await query
    return stories || []
  }

  private async findStoriesByTheme(theme: string, userId: string) {
    const { data: stories } = await this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name, cultural_background)
      `)
      .eq('status', 'published')
      .or(`tags.cs.{${theme}},content.ilike.%${theme}%,title.ilike.%${theme}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    return stories || []
  }

  private async analyzeNarrativeThreads(theme: string, stories: any[], maxStories: number) {
    const prompt = `Identify narrative threads and teaching progressions in these stories about ${theme}.

THEME: ${theme}

STORIES:
${stories.map((story, index) => 
  `${index + 1}. ID: ${story.id}
     Title: ${story.title}
     Content: ${story.content.substring(0, 500)}
     Themes: ${story.tags?.join(', ') || 'None'}
     ---`
).join('\n')}

Find narrative threads that:
1. Create meaningful teaching progressions
2. Build understanding from basic to advanced concepts
3. Honor Indigenous knowledge transmission traditions
4. Provide different perspectives on the theme
5. Support community learning and growth

Select up to ${maxStories} stories per thread that work together as a cohesive learning journey.`

    const result = await generateObject({
      model: this.model,
      schema: z.object({
        narrative_threads: z.array(z.object({
          thread_name: z.string(),
          story_sequence: z.array(z.string()),
          cultural_teaching: z.string(),
          appropriate_audience: z.array(z.string())
        }))
      }),
      prompt,
      temperature: 0.3
    })

    return result.object
  }

  private async getCulturallySignificantStories(userId: string, culturalFocus?: string[]) {
    let query = this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name, cultural_background)
      `)
      .eq('status', 'published')
      .in('cultural_sensitivity_level', ['medium', 'high'])

    if (culturalFocus && culturalFocus.length > 0) {
      const focusFilter = culturalFocus.map(focus => `tags.cs.{${focus}}`).join(',')
      query = query.or(focusFilter)
    }

    query = query.order('created_at', { ascending: false }).limit(25)

    const { data: stories } = await query
    return stories || []
  }

  private async identifyCulturalPatterns(stories: any[], userContext: any, culturalFocus?: string[]) {
    const prompt = `Identify significant cultural patterns across these Indigenous stories.

USER CONTEXT:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}

CULTURAL FOCUS: ${culturalFocus?.join(', ') || 'General patterns'}

STORIES:
${stories.map((story, index) => 
  `${index + 1}. ID: ${story.id}
     Title: ${story.title}
     Cultural Context: ${JSON.stringify(story.cultural_context || {})}
     Themes: ${story.tags?.join(', ') || 'None'}
     Storyteller Background: ${story.storyteller?.cultural_background || 'Not specified'}
     ---`
).join('\n')}

Identify patterns that:
1. Reflect Indigenous worldviews and values
2. Show cultural continuity and adaptation
3. Demonstrate traditional knowledge systems
4. Reveal community healing and resilience patterns
5. Connect traditional and contemporary experiences

Focus on patterns that strengthen cultural identity and community connection.`

    const result = await generateObject({
      model: this.model,
      schema: z.object({
        cultural_patterns: z.array(z.object({
          pattern_type: z.string(),
          related_stories: z.array(z.string()),
          cultural_meaning: z.string(),
          traditional_context: z.string()
        }))
      }),
      prompt,
      temperature: 0.3
    })

    return result.object
  }

  private async analyzeContemporaryRelevance(pattern: any): Promise<string> {
    const prompt = `Analyze the contemporary relevance of this cultural pattern.

PATTERN: ${pattern.pattern_type}
CULTURAL MEANING: ${pattern.cultural_meaning}
TRADITIONAL CONTEXT: ${pattern.traditional_context}

How does this traditional pattern apply to and support contemporary Indigenous communities and experiences? Focus on:
1. Modern applications of traditional wisdom
2. Relevance to current community challenges and opportunities
3. Ways it strengthens cultural identity in contemporary contexts
4. Its value for younger generations
5. Connections to current social and cultural movements

Provide a brief analysis of contemporary relevance (max 200 words).`

    const result = await generateText({
      model: this.model,
      prompt,
      temperature: 0.4,
      maxTokens: 250
    })

    return result.text.trim()
  }

  private extractPopularThemes(stories: any[]): string[] {
    const themeCounts = new Map<string, number>()
    
    stories.forEach(story => {
      if (story.tags && Array.isArray(story.tags)) {
        story.tags.forEach((tag: string) => {
          themeCounts.set(tag, (themeCounts.get(tag) || 0) + (story.views_count || 1))
        })
      }
    })

    return Array.from(themeCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([theme]) => theme)
  }

  private analyzeConnectionTypes(analyses: any[]): Array<{ type: string, count: number }> {
    const typeCounts = new Map<string, number>()
    
    analyses.forEach(analysis => {
      if (analysis.analysis_type) {
        typeCounts.set(analysis.analysis_type, (typeCounts.get(analysis.analysis_type) || 0) + 1)
      }
    })

    return Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count }))
  }
}

// Export singleton instance
export const storyConnectionAnalysisSystem = new StoryConnectionAnalysisSystem()

// Helper functions for common connection operations
export async function analyzeStoryConnections(
  storyId: string,
  userId: string,
  analysisType: 'comprehensive' | 'thematic' | 'cultural' | 'healing_journey' = 'comprehensive'
): Promise<ConnectionNetwork> {
  return storyConnectionAnalysisSystem.analyzeStoryConnections({
    focal_story_id: storyId,
    user_id: userId,
    analysis_type: analysisType
  })
}

export async function createHealingJourney(
  userId: string,
  startingStoryId?: string,
  goals?: string[]
): Promise<CommunityJourney> {
  return storyConnectionAnalysisSystem.createCommunityJourney(
    'healing',
    userId,
    startingStoryId,
    goals
  )
}

export async function findThematicThreads(
  theme: string,
  userId: string
): Promise<{
  threads: Array<{
    name: string
    stories: StoryConnection[]
    teaching: string
    cultural_context: string
  }>
}> {
  return storyConnectionAnalysisSystem.findNarrativeThreads(theme, userId)
}