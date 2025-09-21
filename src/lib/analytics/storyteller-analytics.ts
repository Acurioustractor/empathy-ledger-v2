/**
 * Storyteller Analytics Integration
 * Connects AI analysis with storyteller-centred analytics database
 */

import { supabase } from '@/lib/supabase/client'

export interface StorytellerAnalytics {
  storytellerId: string
  totalStories: number
  totalTranscripts: number
  impactScore: number
  primaryThemes: string[]
  connectionCount: number
  engagementScore: number
}

export interface ThemeAnalysis {
  themeId: string
  themeName: string
  prominenceScore: number
  frequencyCount: number
  keyQuotes: string[]
}

export interface PowerfulQuote {
  id: string
  text: string
  impactScore: number
  themes: string[]
  citationCount: number
  sourceTitle: string
}

export interface NetworkConnection {
  connectionId: string
  connectedStorytellerNf: string
  connectionType: string
  strength: number
  sharedThemes: string[]
  reason: string
}

/**
 * Extract and store themes from AI analysis
 */
export async function extractAndStoreThemes(
  transcriptId: string,
  aiThemes: string[],
  storytellerId: string,
  tenantId: string
) {
  try {
    // First, ensure themes exist in narrative_themes table
    const themeInserts = aiThemes.map(themeName => ({
      tenant_id: tenantId,
      theme_name: themeName,
      theme_category: inferThemeCategory(themeName),
      ai_confidence_score: 0.85,
      usage_count: 1
    }))

    // Insert themes (ignore conflicts)
    const { data: themes, error: themeError } = await supabase
      .from('narrative_themes')
      .upsert(themeInserts, {
        onConflict: 'tenant_id,theme_name',
        ignoreDuplicates: true
      })
      .select()

    if (themeError) {
      console.error('Error inserting themes:', themeError)
      return
    }

    // Now connect storyteller to themes
    if (themes && themes.length > 0) {
      const storytellerThemes = themes.map(theme => ({
        storyteller_id: storytellerId,
        theme_id: theme.id,
        tenant_id: tenantId,
        prominence_score: calculateProminenceScore(themeName, aiThemes),
        frequency_count: 1,
        source_transcripts: [transcriptId]
      }))

      const { error: connectionError } = await supabase
        .from('storyteller_themes')
        .upsert(storytellerThemes, {
          onConflict: 'storyteller_id,theme_id'
        })

      if (connectionError) {
        console.error('Error connecting storyteller to themes:', connectionError)
      }
    }

    return themes
  } catch (error) {
    console.error('Error in extractAndStoreThemes:', error)
  }
}

/**
 * Extract and store powerful quotes from AI analysis
 */
export async function extractAndStorePowerfulQuotes(
  transcriptId: string,
  keyMoments: any[],
  storytellerId: string,
  tenantId: string,
  transcriptTitle: string
) {
  try {
    const quotes = keyMoments.map(moment => ({
      storyteller_id: storytellerId,
      tenant_id: tenantId,
      quote_text: moment.text,
      source_type: 'transcript' as const,
      source_id: transcriptId,
      source_title: transcriptTitle,
      emotional_impact_score: calculateEmotionalImpact(moment.emotion),
      wisdom_score: calculateWisdomScore(moment.significance),
      quotability_score: calculateQuotabilityScore(moment.text),
      themes: extractQuoteThemes(moment.text),
      quote_category: inferQuoteCategory(moment.significance)
    }))

    const { data: storedQuotes, error } = await supabase
      .from('storyteller_quotes')
      .insert(quotes)
      .select()

    if (error) {
      console.error('Error storing quotes:', error)
      return
    }

    return storedQuotes
  } catch (error) {
    console.error('Error in extractAndStorePowerfulQuotes:', error)
  }
}

/**
 * Update storyteller analytics after new content
 */
export async function updateStorytellerAnalytics(
  storytellerId: string,
  incrementStories = 0,
  incrementTranscripts = 0,
  newThemes: string[] = []
) {
  try {
    // Get current analytics
    const { data: currentAnalytics } = await supabase
      .from('storyteller_analytics')
      .select('*')
      .eq('storyteller_id', storytellerId)
      .single()

    const updateData = {
      total_stories: (currentAnalytics?.total_stories || 0) + incrementStories,
      total_transcripts: (currentAnalytics?.total_transcripts || 0) + incrementTranscripts,
      primary_themes: [...new Set([
        ...(currentAnalytics?.primary_themes || []),
        ...newThemes
      ])].slice(0, 10), // Keep top 10 themes
      last_calculated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('storyteller_analytics')
      .upsert({
        storyteller_id: storytellerId,
        ...updateData
      })
      .select()

    if (error) {
      console.error('Error updating storyteller analytics:', error)
      return
    }

    return data
  } catch (error) {
    console.error('Error in updateStorytellerAnalytics:', error)
  }
}

/**
 * Get storyteller dashboard data
 */
export async function getStorytellerDashboard(storytellerId: string): Promise<StorytellerAnalytics | null> {
  try {
    const { data, error } = await supabase
      .from('storyteller_analytics')
      .select(`
        *,
        storyteller_themes!inner(
          narrative_themes(theme_name, theme_category)
        )
      `)
      .eq('storyteller_id', storytellerId)
      .single()

    if (error) {
      console.error('Error fetching storyteller dashboard:', error)
      return null
    }

    return {
      storytellerId,
      totalStories: data.total_stories || 0,
      totalTranscripts: data.total_transcripts || 0,
      impactScore: data.inspiration_impact_score || 0,
      primaryThemes: data.primary_themes || [],
      connectionCount: data.connection_count || 0,
      engagementScore: data.total_engagement_score || 0
    }
  } catch (error) {
    console.error('Error in getStorytellerDashboard:', error)
    return null
  }
}

/**
 * Get storyteller's top themes with analysis
 */
export async function getStorytellerThemes(storytellerId: string): Promise<ThemeAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('storyteller_themes')
      .select(`
        theme_id,
        prominence_score,
        frequency_count,
        key_quotes,
        narrative_themes(theme_name, theme_category)
      `)
      .eq('storyteller_id', storytellerId)
      .order('prominence_score', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching storyteller themes:', error)
      return []
    }

    return data.map(theme => ({
      themeId: theme.theme_id,
      themeName: theme.narrative_themes.theme_name,
      prominenceScore: theme.prominence_score || 0,
      frequencyCount: theme.frequency_count || 0,
      keyQuotes: theme.key_quotes || []
    }))
  } catch (error) {
    console.error('Error in getStorytellerThemes:', error)
    return []
  }
}

/**
 * Get storyteller's most powerful quotes
 */
export async function getStorytellerQuotes(
  storytellerId: string,
  limit = 10
): Promise<PowerfulQuote[]> {
  try {
    const { data, error } = await supabase
      .from('storyteller_quotes')
      .select('*')
      .eq('storyteller_id', storytellerId)
      .eq('is_public', true)
      .order('quotability_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching storyteller quotes:', error)
      return []
    }

    return data.map(quote => ({
      id: quote.id,
      text: quote.quote_text,
      impactScore: quote.emotional_impact_score || 0,
      themes: quote.themes || [],
      citationCount: quote.citation_count || 0,
      sourceTitle: quote.source_title || ''
    }))
  } catch (error) {
    console.error('Error in getStorytellerQuotes:', error)
    return []
  }
}

/**
 * Helper functions
 */

function inferThemeCategory(themeName: string): string {
  const themeMap = {
    'health': ['health', 'healing', 'medical', 'wellness'],
    'community': ['community', 'leadership', 'social', 'collective'],
    'cultural': ['cultural', 'tradition', 'heritage', 'ceremony'],
    'professional': ['professional', 'career', 'work', 'business'],
    'personal': ['personal', 'growth', 'journey', 'individual'],
    'family': ['family', 'parents', 'children', 'generations']
  }

  const lowerTheme = themeName.toLowerCase()

  for (const [category, keywords] of Object.entries(themeMap)) {
    if (keywords.some(keyword => lowerTheme.includes(keyword))) {
      return category
    }
  }

  return 'personal' // default
}

function calculateProminenceScore(themeName: string, allThemes: string[]): number {
  // Simple prominence based on position and frequency
  const index = allThemes.indexOf(themeName)
  const frequency = allThemes.filter(t => t === themeName).length

  // Higher score for earlier themes and higher frequency
  return Math.min(1.0, (1.0 - (index * 0.1)) + (frequency * 0.2))
}

function calculateEmotionalImpact(emotion: string): number {
  const impactMap = {
    'inspiring': 0.9,
    'powerful': 0.85,
    'moving': 0.8,
    'touching': 0.75,
    'hopeful': 0.7,
    'reflective': 0.6
  }

  return impactMap[emotion?.toLowerCase()] || 0.5
}

function calculateWisdomScore(significance: string): number {
  const wisdomKeywords = ['wisdom', 'learn', 'teach', 'guidance', 'experience', 'knowledge']
  const lowerSig = significance?.toLowerCase() || ''

  const matchCount = wisdomKeywords.filter(keyword =>
    lowerSig.includes(keyword)
  ).length

  return Math.min(1.0, 0.5 + (matchCount * 0.15))
}

function calculateQuotabilityScore(text: string): number {
  // Factors that make text more quotable
  let score = 0.5 // base score

  // Length (optimal range)
  const length = text.length
  if (length >= 50 && length <= 200) score += 0.2

  // Contains actionable language
  if (/\b(we|you|must|should|can|will)\b/i.test(text)) score += 0.15

  // Contains emotional words
  if (/\b(love|hope|dream|believe|inspire|change)\b/i.test(text)) score += 0.15

  return Math.min(1.0, score)
}

function extractQuoteThemes(text: string): string[] {
  const themeKeywords = {
    'Health & Healing': ['health', 'healing', 'medical', 'care', 'treatment'],
    'Community Leadership': ['community', 'leader', 'together', 'collective'],
    'Cultural Heritage': ['culture', 'tradition', 'heritage', 'ancestors'],
    'Youth Empowerment': ['youth', 'young', 'children', 'education', 'future'],
    'Family Legacy': ['family', 'mother', 'father', 'children', 'generations']
  }

  const lowerText = text.toLowerCase()
  const matchedThemes: string[] = []

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      matchedThemes.push(theme)
    }
  }

  return matchedThemes
}

function inferQuoteCategory(significance: string): string {
  const lowerSig = significance?.toLowerCase() || ''

  if (lowerSig.includes('wisdom') || lowerSig.includes('teaching')) return 'wisdom'
  if (lowerSig.includes('inspir') || lowerSig.includes('motiv')) return 'inspiration'
  if (lowerSig.includes('cultural') || lowerSig.includes('tradition')) return 'cultural'
  if (lowerSig.includes('impact') || lowerSig.includes('change')) return 'impact'

  return 'personal'
}