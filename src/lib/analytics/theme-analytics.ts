/**
 * Theme Analytics Service
 *
 * Provides functions for querying and analyzing narrative themes using:
 * - Vector similarity search for semantic matching
 * - Usage statistics and trends
 * - Category-based analytics
 */

import { createClient } from '@/lib/supabase/server'

export interface Theme {
  id: string
  theme_name: string
  theme_category: string | null
  usage_count: number
  storyteller_count: number
  ai_confidence_score: number | null
  sentiment_score: number | null
}

export interface ThemeWithSimilarity extends Theme {
  similarity: number
}

export interface ThemeCategoryStats {
  theme_category: string
  theme_count: number
  total_usage: number
  avg_confidence: number
  avg_sentiment: number
  top_themes: string[]
}

/**
 * Get top themes ranked by usage count
 */
export async function getTopThemes(limit = 10): Promise<Theme[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('theme_analytics_top')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching top themes:', error)
    throw error
  }

  return data || []
}

/**
 * Get theme statistics grouped by category
 */
export async function getThemesByCategory(): Promise<ThemeCategoryStats[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('theme_analytics_by_category')
    .select('*')

  if (error) {
    console.error('Error fetching themes by category:', error)
    throw error
  }

  return data || []
}

/**
 * Find themes similar to a query theme using vector similarity
 */
export async function findSimilarThemes(
  themeName: string,
  matchThreshold = 0.7,
  limit = 5
): Promise<ThemeWithSimilarity[]> {
  const supabase = createClient()

  // First, get the embedding for the query theme
  const { data: queryTheme, error: queryError } = await supabase
    .from('narrative_themes')
    .select('embedding')
    .eq('theme_name', themeName)
    .single()

  if (queryError || !queryTheme?.embedding) {
    console.error('Error fetching query theme embedding:', queryError)
    throw new Error(`Theme "${themeName}" not found or has no embedding`)
  }

  // Use the match_themes function for vector similarity search
  const { data, error } = await supabase
    .rpc('match_themes', {
      query_embedding: queryTheme.embedding,
      match_threshold: matchThreshold,
      match_count: limit
    })

  if (error) {
    console.error('Error finding similar themes:', error)
    throw error
  }

  return data || []
}

/**
 * Search themes by keyword (case-insensitive partial match)
 */
export async function searchThemes(
  query: string,
  limit = 20
): Promise<Theme[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('narrative_themes')
    .select('*')
    .ilike('theme_name', `%${query}%`)
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching themes:', error)
    throw error
  }

  return data || []
}

/**
 * Get theme by ID with full details
 */
export async function getThemeById(themeId: string): Promise<Theme | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('narrative_themes')
    .select('*')
    .eq('id', themeId)
    .single()

  if (error) {
    console.error('Error fetching theme:', error)
    return null
  }

  return data
}

/**
 * Get stories associated with a specific theme
 */
export async function getStoriesForTheme(
  themeName: string,
  limit = 10
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('story_themes')
    .select(`
      story_id,
      stories (
        id,
        title,
        ai_summary,
        created_at,
        storyteller:storytellers (
          display_name,
          avatar_url
        )
      )
    `)
    .eq('theme', themeName)
    .limit(limit)

  if (error) {
    console.error('Error fetching stories for theme:', error)
    throw error
  }

  return data || []
}

/**
 * Get overall theme system statistics
 */
export async function getThemeSystemStats() {
  const supabase = createClient()

  const [
    { count: totalThemes },
    { count: themesWithEmbeddings },
    { count: totalAssociations },
    { count: storiesWithThemes }
  ] = await Promise.all([
    supabase.from('narrative_themes').select('*', { count: 'exact', head: true }),
    supabase.from('narrative_themes').select('*', { count: 'exact', head: true }).not('embedding', 'is', null),
    supabase.from('story_themes').select('*', { count: 'exact', head: true }),
    supabase.from('story_themes').select('story_id', { count: 'exact', head: true })
  ])

  return {
    totalThemes: totalThemes || 0,
    themesWithEmbeddings: themesWithEmbeddings || 0,
    embeddingCoverage: totalThemes ? (themesWithEmbeddings || 0) / totalThemes : 0,
    totalAssociations: totalAssociations || 0,
    storiesWithThemes: storiesWithThemes || 0
  }
}
