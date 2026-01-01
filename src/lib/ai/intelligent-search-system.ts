/**
 * Intelligent Search System for Empathy Ledger
 * 
 * Advanced semantic search with cultural context understanding,
 * respecting Indigenous protocols and providing culturally relevant results.
 * 
 * Features:
 * - Semantic search across stories, profiles, and media
 * - Cultural context-aware ranking
 * - Traditional knowledge protection
 * - Elder-approved content prioritization
 * - Multi-modal search (text, themes, emotions)
 * - Community-focused result filtering
 */

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { culturalSafetyAI, withCulturalSafety } from './cultural-safety-middleware'
import type { Database } from '@/types/database'

// Search schemas
const SearchIntentSchema = z.object({
  primary_intent: z.enum(['story_search', 'storyteller_search', 'theme_exploration', 'cultural_learning', 'community_connection']),
  search_themes: z.array(z.string()).max(5),
  cultural_context: z.array(z.string()).max(3),
  emotional_context: z.array(z.string()).max(3),
  temporal_context: z.string().optional(),
  audience_preference: z.enum(['all', 'children', 'youth', 'adults', 'elders', 'families']).optional(),
  cultural_sensitivity_level: z.enum(['any', 'low', 'medium', 'high']).optional()
})

const SearchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['story', 'storyteller', 'gallery', 'cultural_tag']),
  title: z.string(),
  relevance_score: z.number().min(0).max(1),
  cultural_relevance: z.number().min(0).max(1),
  semantic_match: z.number().min(0).max(1),
  summary: z.string(),
  themes: z.array(z.string()),
  cultural_elements: z.array(z.string()),
  why_relevant: z.string()
})

const EnhancedSearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  search_insights: z.object({
    interpreted_query: z.string(),
    cultural_context_applied: z.array(z.string()),
    themes_explored: z.array(z.string()),
    additional_suggestions: z.array(z.string())
  }),
  total_found: z.number(),
  culturally_filtered: z.number()
})

export interface SearchQuery {
  query: string
  user_id: string
  filters?: {
    content_types?: ('story' | 'storyteller' | 'gallery' | 'media')[]
    cultural_sensitivity?: 'any' | 'low' | 'medium' | 'high'
    story_types?: string[]
    languages?: string[]
    time_period?: string
    cultural_affiliations?: string[]
    elder_approved_only?: boolean
    community_only?: boolean
  }
  search_context?: {
    current_story_id?: string
    browsing_context?: string
    emotional_state?: string
    learning_goals?: string[]
  }
  max_results?: number
}

export interface SearchResult {
  id: string
  type: 'story' | 'storyteller' | 'gallery' | 'media'
  title: string
  summary: string
  relevance_score: number
  cultural_relevance: number
  themes: string[]
  cultural_elements: string[]
  author_name?: string
  storyteller_name?: string
  reading_time?: number
  cultural_sensitivity_level: string
  elder_approved: boolean
  why_relevant: string
  thumbnail_url?: string
  created_at: string
}

export interface SearchInsights {
  interpreted_query: string
  cultural_context_applied: string[]
  themes_explored: string[]
  suggestions: string[]
  related_searches: string[]
}

export class IntelligentSearchSystem {
  private get supabase() { return createSupabaseServerClient() }
  private model = openai('gpt-4o')

  /**
   * Perform intelligent search with cultural context awareness
   */
  async search(query: SearchQuery): Promise<{
    results: SearchResult[]
    insights: SearchInsights
    total_found: number
    culturally_filtered: number
  }> {
    
    return await withCulturalSafety({
      content: query.query,
      user_id: query.user_id,
      context_type: 'search',
      operation: 'analyse'
    }, async () => {
      
      // Analyze search intent and context
      const searchIntent = await this.analyzeSearchIntent(query)
      
      // Get user's cultural context for personalization
      const userContext = await this.getUserSearchContext(query.user_id)
      
      // Perform database searches based on intent
      const candidateResults = await this.performDatabaseSearch(query, searchIntent, userContext)
      
      // Apply cultural safety filtering
      const safeResults = await this.applyCulturalSafetyFilter(candidateResults, query.user_id)
      
      // Use AI to rank and enhance results
      const enhancedResults = await this.enhanceSearchResults(
        query, 
        safeResults, 
        searchIntent, 
        userContext,
        query.max_results || 10
      )

      // Generate search insights
      const insights = await this.generateSearchInsights(query, searchIntent, enhancedResults)

      return {
        results: enhancedResults.results.map(r => this.formatSearchResult(r, safeResults)),
        insights: {
          interpreted_query: insights.search_insights.interpreted_query,
          cultural_context_applied: insights.search_insights.cultural_context_applied,
          themes_explored: insights.search_insights.themes_explored,
          suggestions: insights.search_insights.additional_suggestions,
          related_searches: await this.generateRelatedSearches(query, searchIntent)
        },
        total_found: candidateResults.length,
        culturally_filtered: candidateResults.length - safeResults.length
      }
    })
  }

  /**
   * Get search suggestions as user types
   */
  async getSearchSuggestions(
    partialQuery: string,
    userId: string,
    maxSuggestions: number = 5
  ): Promise<string[]> {
    
    if (partialQuery.length < 2) {
      return []
    }

    try {
      const userContext = await this.getUserSearchContext(userId)
      
      const prompt = `Generate search suggestions for an Indigenous storytelling platform based on this partial query.

PARTIAL QUERY: "${partialQuery}"

USER CONTEXT:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Interests: ${userContext.interests?.join(', ') || 'General'}
- Is Elder: ${userContext.is_elder ? 'Yes' : 'No'}

AVAILABLE CONTENT THEMES:
- Traditional stories and teachings
- Community histories and memories  
- Cultural practices and ceremonies
- Healing and wellness narratives
- Land-based stories and connections
- Intergenerational wisdom sharing
- Contemporary Indigenous experiences
- Seasonal and ceremonial content

SUGGESTIONS SHOULD:
1. Complete or expand the user's intended search
2. Respect cultural sensitivity and protocols
3. Connect to relevant Indigenous themes and experiences  
4. Consider the user's cultural background and interests
5. Offer both specific and broader search directions

Generate ${maxSuggestions} culturally appropriate search suggestions that build on "${partialQuery}".
Return only the suggestions, one per line, without numbering or quotes.`

      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.4,
        maxTokens: 200
      })

      return result.text
        .trim()
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, maxSuggestions)

    } catch (error) {
      console.error('Error generating search suggestions:', error)
      return []
    }
  }

  /**
   * Search for similar content to a given story/item
   */
  async findSimilarContent(
    contentId: string,
    contentType: 'story' | 'storyteller' | 'gallery',
    userId: string,
    maxResults: number = 5
  ): Promise<SearchResult[]> {
    
    // Get the reference content
    const referenceContent = await this.getReferenceContent(contentId, contentType)
    if (!referenceContent) {
      return []
    }

    // Create a similarity search query
    const similarityQuery: SearchQuery = {
      query: `Similar to "${referenceContent.title}": ${referenceContent.themes?.join(' ')} ${referenceContent.summary || ''}`,
      user_id: userId,
      filters: {
        content_types: [contentType],
        cultural_sensitivity: 'any'
      },
      max_results: maxResults + 5 // Get extra to account for filtering
    }

    const searchResults = await this.search(similarityQuery)
    
    // Remove the reference content itself from results
    return searchResults.results
      .filter(result => result.id !== contentId)
      .slice(0, maxResults)
  }

  /**
   * Get trending search terms and popular content
   */
  async getTrendingSearches(
    userId: string,
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<{
    trending_queries: string[]
    popular_themes: string[]
    featured_content: SearchResult[]
  }> {
    
    const startDate = new Date()
    if (timeframe === 'day') {
      startDate.setDate(startDate.getDate() - 1)
    } else if (timeframe === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    // Get trending searches (would need search analytics table)
    const { data: searchLogs } = await this.supabase
      .from('search_analytics')
      .select('query, themes')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    // Get popular content based on views and engagement
    const { data: popularStories } = await this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name),
        author:profiles!stories_author_id_fkey(display_name)
      `)
      .eq('status', 'published')
      .eq('elder_approval', true)
      .order('views_count', { ascending: false })
      .order('likes_count', { ascending: false })
      .limit(10)

    // Apply cultural safety filtering
    const userContext = await this.getUserSearchContext(userId)
    const safePopularStories = await this.applyCulturalSafetyFilter(popularStories || [], userId)

    const trendingQueries = this.extractTrendingQueries(searchLogs || [])
    const popularThemes = this.extractPopularThemes(searchLogs || [])
    const featuredContent = safePopularStories.slice(0, 5).map(story => this.convertStoryToSearchResult(story))

    return {
      trending_queries: trendingQueries,
      popular_themes: popularThemes,
      featured_content: featuredContent
    }
  }

  private async analyzeSearchIntent(query: SearchQuery) {
    const prompt = `Analyze the search intent for this query on an Indigenous storytelling platform.

SEARCH QUERY: "${query.query}"

CONTEXT:
- Search Context: ${query.search_context?.browsing_context || 'General'}
- Learning Goals: ${query.search_context?.learning_goals?.join(', ') || 'None specified'}
- Emotional State: ${query.search_context?.emotional_state || 'Neutral'}

AVAILABLE FILTERS:
- Content Types: ${query.filters?.content_types?.join(', ') || 'All'}
- Cultural Sensitivity: ${query.filters?.cultural_sensitivity || 'Any'}
- Elder Approved Only: ${query.filters?.elder_approved_only ? 'Yes' : 'No'}

ANALYSIS REQUIREMENTS:
1. Determine the primary search intent (story search, storyteller search, theme exploration, etc.)
2. Extract key themes and cultural context from the query
3. Identify emotional context or needs
4. Consider appropriate audience and sensitivity level
5. Recognize temporal context (seasonal, ceremonial, historical)

Analyze this search query in the context of Indigenous storytelling, cultural learning, and community connection needs.`

    const result = await generateObject({
      model: this.model,
      schema: SearchIntentSchema,
      prompt,
      temperature: 0.3
    })

    return result.object
  }

  private async performDatabaseSearch(
    query: SearchQuery,
    intent: z.infer<typeof SearchIntentSchema>,
    userContext: any
  ) {
    const results: any[] = []

    // Search stories if requested or if general search
    if (!query.filters?.content_types || query.filters.content_types.includes('story')) {
      const stories = await this.searchStories(query, intent, userContext)
      results.push(...stories.map(s => ({ ...s, type: 'story' })))
    }

    // Search storytellers
    if (!query.filters?.content_types || query.filters.content_types.includes('storyteller')) {
      const storytellers = await this.searchStorytellers(query, intent)
      results.push(...storytellers.map(s => ({ ...s, type: 'storyteller' })))
    }

    // Search galleries
    if (!query.filters?.content_types || query.filters.content_types.includes('gallery')) {
      const galleries = await this.searchGalleries(query, intent)
      results.push(...galleries.map(g => ({ ...g, type: 'gallery' })))
    }

    return results
  }

  private async searchStories(query: SearchQuery, intent: z.infer<typeof SearchIntentSchema>, userContext: any) {
    let dbQuery = this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(display_name, cultural_background),
        author:profiles!stories_author_id_fkey(display_name)
      `)
      .eq('status', 'published')

    // Apply filters
    if (query.filters?.elder_approved_only) {
      dbQuery = dbQuery.eq('elder_approval', true)
    }

    if (query.filters?.cultural_sensitivity && query.filters.cultural_sensitivity !== 'any') {
      const allowedLevels = query.filters.cultural_sensitivity === 'high' 
        ? ['low', 'medium', 'high']
        : query.filters.cultural_sensitivity === 'medium'
        ? ['low', 'medium'] 
        : ['low']
      
      dbQuery = dbQuery.in('cultural_sensitivity_level', allowedLevels)
    }

    if (query.filters?.story_types && query.filters.story_types.length > 0) {
      dbQuery = dbQuery.in('story_type', query.filters.story_types)
    }

    if (query.filters?.languages && query.filters.languages.length > 0) {
      dbQuery = dbQuery.in('language', query.filters.languages)
    }

    // Text search across multiple fields
    if (query.query.trim()) {
      dbQuery = dbQuery.or(`title.ilike.%${query.query}%,content.ilike.%${query.query}%`)
    }

    // Theme-based search
    if (intent.search_themes.length > 0) {
      const themeFilter = intent.search_themes.map(theme => `tags.cs.{${theme}}`).join(',')
      dbQuery = dbQuery.or(themeFilter)
    }

    dbQuery = dbQuery.order('created_at', { ascending: false }).limit(50)

    const { data: stories, error } = await dbQuery

    if (error) {
      console.error('Error searching stories:', error)
      return []
    }

    return stories || []
  }

  private async searchStorytellers(query: SearchQuery, intent: z.infer<typeof SearchIntentSchema>) {
    let dbQuery = this.supabase
      .from('storytellers')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('status', 'active')

    if (query.query.trim()) {
      dbQuery = dbQuery.or(`display_name.ilike.%${query.query}%,bio.ilike.%${query.query}%,cultural_background.ilike.%${query.query}%`)
    }

    if (intent.cultural_context.length > 0) {
      const culturalFilter = intent.cultural_context.map(ctx => `cultural_background.ilike.%${ctx}%`).join(',')
      dbQuery = dbQuery.or(culturalFilter)
    }

    const { data: storytellers, error } = await dbQuery.limit(20)

    if (error) {
      console.error('Error searching storytellers:', error)
      return []
    }

    return storytellers || []
  }

  private async searchGalleries(query: SearchQuery, intent: z.infer<typeof SearchIntentSchema>) {
    let dbQuery = this.supabase
      .from('galleries')
      .select(`
        *,
        created_by:profiles(display_name)
      `)
      .eq('status', 'active')
      .eq('visibility', 'public')

    if (query.query.trim()) {
      dbQuery = dbQuery.or(`title.ilike.%${query.query}%,description.ilike.%${query.query}%`)
    }

    const { data: galleries, error } = await dbQuery.limit(15)

    if (error) {
      console.error('Error searching galleries:', error)
      return []
    }

    return galleries || []
  }

  private async applyCulturalSafetyFilter(results: any[], userId: string) {
    const filteredResults = []
    
    for (const result of results) {
      // Check cultural access permissions
      const hasAccess = await this.checkContentAccess(result, userId)
      if (hasAccess) {
        filteredResults.push(result)
      }
    }

    return filteredResults
  }

  private async checkContentAccess(content: any, userId: string): Promise<boolean> {
    // Similar logic to recommendation engine's access checking
    if (content.cultural_sensitivity_level === 'high' && !content.elder_approval) {
      return false
    }

    const { data: userProfile } = await this.supabase
      .from('profiles')
      .select('cultural_affiliations, is_elder')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return content.cultural_sensitivity_level === 'low'
    }

    // Check cultural affiliation requirements
    if (content.requires_cultural_affiliation) {
      const contentAffiliations = content.cultural_affiliations || []
      const userAffiliations = userProfile.cultural_affiliations || []
      
      const hasMatchingAffiliation = contentAffiliations.some((affiliation: string) => 
        userAffiliations.includes(affiliation)
      )
      
      if (!hasMatchingAffiliation && !userProfile.is_elder) {
        return false
      }
    }

    return true
  }

  private async enhanceSearchResults(
    query: SearchQuery,
    results: any[],
    intent: z.infer<typeof SearchIntentSchema>,
    userContext: any,
    maxResults: number
  ) {
    const prompt = `Analyze and rank these search results for cultural relevance and user needs.

SEARCH QUERY: "${query.query}"
SEARCH INTENT: ${intent.primary_intent}
THEMES: ${intent.search_themes.join(', ')}
CULTURAL CONTEXT: ${intent.cultural_context.join(', ')}

USER PROFILE:
- Cultural Background: ${userContext.cultural_background || 'Not specified'}
- Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
- Is Elder: ${userContext.is_elder ? 'Yes' : 'No'}
- Interests: ${userContext.interests?.join(', ') || 'General'}

SEARCH RESULTS TO RANK:
${results.slice(0, 20).map((result, index) => 
  `${index + 1}. ID: ${result.id}
     Type: ${result.type}
     Title: ${result.title}
     Content Preview: ${result.content?.substring(0, 200) || result.bio?.substring(0, 200) || result.description?.substring(0, 200) || ''}
     Themes/Tags: ${result.tags?.join(', ') || result.cultural_background || 'None'}
     Cultural Sensitivity: ${result.cultural_sensitivity_level || 'medium'}
     Elder Approved: ${result.elder_approval ? 'Yes' : 'No'}
     ---`
).join('\n')}

RANKING CRITERIA:
1. Semantic relevance to search query
2. Cultural relevance to user's background and interests
3. Quality and community value of content
4. Appropriateness for user's cultural context
5. Educational or healing value

Select and rank the top ${maxResults} most relevant results. For each result, provide:
- Relevance scores (semantic and cultural)
- Brief summary highlighting why it matches the search
- Key themes and cultural elements
- Explanation of why it's relevant to this user

Focus on results that will be most valuable for this user's search intent and cultural context.`

    const result = await generateObject({
      model: this.model,
      schema: EnhancedSearchResponseSchema,
      prompt,
      temperature: 0.4
    })

    return result.object
  }

  private async generateSearchInsights(
    query: SearchQuery,
    intent: z.infer<typeof SearchIntentSchema>,
    results: z.infer<typeof EnhancedSearchResponseSchema>
  ): Promise<z.infer<typeof EnhancedSearchResponseSchema>> {
    return results
  }

  private async generateRelatedSearches(
    query: SearchQuery,
    intent: z.infer<typeof SearchIntentSchema>
  ): Promise<string[]> {
    const prompt = `Generate related search suggestions based on this query and intent.

ORIGINAL QUERY: "${query.query}"
SEARCH INTENT: ${intent.primary_intent}
THEMES FOUND: ${intent.search_themes.join(', ')}
CULTURAL CONTEXT: ${intent.cultural_context.join(', ')}

Generate 5 related searches that would help the user explore related content on an Indigenous storytelling platform.
Focus on:
1. Related cultural themes and experiences
2. Similar story types or teachings
3. Connected community topics
4. Seasonal or ceremonial variations
5. Broader or narrower search directions

Return only the search queries, one per line.`

    const result = await generateText({
      model: this.model,
      prompt,
      temperature: 0.5,
      maxTokens: 150
    })

    return result.text
      .trim()
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5)
  }

  private formatSearchResult(aiResult: z.infer<typeof SearchResultSchema>, dbResults: any[]): SearchResult {
    const dbResult = dbResults.find(r => r.id === aiResult.id)
    
    return {
      id: aiResult.id,
      type: aiResult.type,
      title: aiResult.title,
      summary: aiResult.summary,
      relevance_score: aiResult.relevance_score,
      cultural_relevance: aiResult.cultural_relevance,
      themes: aiResult.themes,
      cultural_elements: aiResult.cultural_elements,
      author_name: dbResult?.author?.display_name,
      storyteller_name: dbResult?.storyteller?.display_name,
      reading_time: dbResult?.reading_time_minutes,
      cultural_sensitivity_level: dbResult?.cultural_sensitivity_level || 'medium',
      elder_approved: dbResult?.elder_approval || false,
      why_relevant: aiResult.why_relevant,
      thumbnail_url: dbResult?.thumbnail_url,
      created_at: dbResult?.created_at || new Date().toISOString()
    }
  }

  private async getUserSearchContext(userId: string) {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return profile || {}
  }

  private async getReferenceContent(contentId: string, contentType: string) {
    const tableName = contentType === 'story' ? 'stories' : 
                     contentType === 'storyteller' ? 'storytellers' : 'galleries'
    
    const { data } = await this.supabase
      .from(tableName)
      .select('*')
      .eq('id', contentId)
      .single()

    return data
  }

  private extractTrendingQueries(searchLogs: any[]): string[] {
    // Extract and count query frequencies
    const queryCounts = new Map<string, number>()
    
    searchLogs.forEach(log => {
      if (log.query && log.query.trim()) {
        const normalized = log.query.toLowerCase().trim()
        queryCounts.set(normalized, (queryCounts.get(normalized) || 0) + 1)
      }
    })

    return Array.from(queryCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query)
  }

  private extractPopularThemes(searchLogs: any[]): string[] {
    const themeCounts = new Map<string, number>()
    
    searchLogs.forEach(log => {
      if (log.themes && Array.isArray(log.themes)) {
        log.themes.forEach((theme: string) => {
          themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1)
        })
      }
    })

    return Array.from(themeCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme)
  }

  private convertStoryToSearchResult(story: any): SearchResult {
    return {
      id: story.id,
      type: 'story',
      title: story.title,
      summary: story.content.substring(0, 200) + '...',
      relevance_score: 1.0,
      cultural_relevance: 1.0,
      themes: story.tags || [],
      cultural_elements: [],
      storyteller_name: story.storyteller?.display_name,
      reading_time: story.reading_time_minutes,
      cultural_sensitivity_level: story.cultural_sensitivity_level,
      elder_approved: story.elder_approval,
      why_relevant: 'Popular community content',
      created_at: story.created_at
    }
  }
}

// Export singleton instance
export const intelligentSearchSystem = new IntelligentSearchSystem()

// Helper functions for common search operations
export async function searchContent(
  query: string,
  userId: string,
  options?: {
    contentTypes?: ('story' | 'storyteller' | 'gallery' | 'media')[]
    maxResults?: number
    elderApprovedOnly?: boolean
  }
): Promise<SearchResult[]> {
  const searchQuery: SearchQuery = {
    query,
    user_id: userId,
    filters: {
      content_types: options?.contentTypes,
      elder_approved_only: options?.elderApprovedOnly
    },
    max_results: options?.maxResults || 10
  }

  const result = await intelligentSearchSystem.search(searchQuery)
  return result.results
}

export async function getSearchSuggestions(
  partialQuery: string,
  userId: string
): Promise<string[]> {
  return intelligentSearchSystem.getSearchSuggestions(partialQuery, userId)
}

export async function findSimilarStories(
  storyId: string,
  userId: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  return intelligentSearchSystem.findSimilarContent(storyId, 'story', userId, maxResults)
}