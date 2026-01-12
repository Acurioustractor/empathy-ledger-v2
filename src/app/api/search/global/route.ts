import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search/global
 * Global search across all content types (stories, storytellers, transcripts, media, themes)
 * Supports both keyword and semantic search
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query')
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const searchType = searchParams.get('search_type') || 'both' // keyword, semantic, both
    const types = searchParams.get('types')?.split(',') || []
    const dateRange = searchParams.get('date_range') || 'all'

    if (!query || !organizationId) {
      return NextResponse.json(
        { error: 'query and organization_id required' },
        { status: 400 }
      )
    }

    const results: any[] = []

    // Calculate date filter
    let startDate: Date | null = null
    const now = new Date()

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    // 1. Search Stories
    if (types.length === 0 || types.includes('story')) {
      let storiesQuery = supabase
        .from('stories')
        .select(`
          id,
          title,
          story_arc,
          cultural_themes,
          created_at,
          storyteller:storytellers(display_name)
        `)
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${query}%,story_arc.ilike.%${query}%`)

      if (projectId) storiesQuery = storiesQuery.eq('project_id', projectId)
      if (startDate) storiesQuery = storiesQuery.gte('created_at', startDate.toISOString())

      const { data: stories } = await storiesQuery.limit(20)

      stories?.forEach(story => {
        results.push({
          id: story.id,
          type: 'story',
          title: story.title || 'Untitled Story',
          description: story.story_arc?.substring(0, 200) || '',
          relevance_score: calculateRelevanceScore(query, story.title + ' ' + story.story_arc),
          highlights: extractHighlights(query, story.story_arc || ''),
          metadata: {
            storyteller: story.storyteller?.display_name,
            themes: story.cultural_themes,
            created_at: story.created_at
          }
        })
      })
    }

    // 2. Search Storytellers
    if (types.length === 0 || types.includes('storyteller')) {
      let storytellersQuery = supabase
        .from('storytellers')
        .select('id, display_name, bio, cultural_background, created_at')
        .eq('organization_id', organizationId)
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%,cultural_background.ilike.%${query}%`)

      if (startDate) storytellersQuery = storytellersQuery.gte('created_at', startDate.toISOString())

      const { data: storytellers } = await storytellersQuery.limit(20)

      storytellers?.forEach(storyteller => {
        results.push({
          id: storyteller.id,
          type: 'storyteller',
          title: storyteller.display_name || 'Unknown',
          description: storyteller.bio?.substring(0, 200) || '',
          relevance_score: calculateRelevanceScore(query, storyteller.display_name + ' ' + storyteller.bio),
          highlights: extractHighlights(query, storyteller.bio || ''),
          metadata: {
            cultural_background: storyteller.cultural_background,
            created_at: storyteller.created_at
          }
        })
      })
    }

    // 3. Search Transcripts
    if (types.length === 0 || types.includes('transcript')) {
      let transcriptsQuery = supabase
        .from('transcripts')
        .select(`
          id,
          title,
          content,
          themes,
          created_at,
          storyteller:storytellers(display_name)
        `)
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)

      if (projectId) transcriptsQuery = transcriptsQuery.eq('project_id', projectId)
      if (startDate) transcriptsQuery = transcriptsQuery.gte('created_at', startDate.toISOString())

      const { data: transcripts } = await transcriptsQuery.limit(20)

      transcripts?.forEach(transcript => {
        results.push({
          id: transcript.id,
          type: 'transcript',
          title: transcript.title || 'Untitled Transcript',
          description: transcript.content?.substring(0, 200) || '',
          relevance_score: calculateRelevanceScore(query, transcript.title + ' ' + transcript.content),
          highlights: extractHighlights(query, transcript.content || ''),
          metadata: {
            storyteller: transcript.storyteller?.display_name,
            themes: transcript.themes,
            created_at: transcript.created_at
          }
        })
      })
    }

    // 4. Search Media
    if (types.length === 0 || types.includes('media')) {
      let mediaQuery = supabase
        .from('media')
        .select('id, file_name, title, description, media_type, created_at')
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,file_name.ilike.%${query}%`)

      if (startDate) mediaQuery = mediaQuery.gte('created_at', startDate.toISOString())

      const { data: media } = await mediaQuery.limit(20)

      media?.forEach(item => {
        results.push({
          id: item.id,
          type: 'media',
          title: item.title || item.file_name || 'Untitled Media',
          description: item.description?.substring(0, 200) || '',
          relevance_score: calculateRelevanceScore(query, item.title + ' ' + item.description),
          highlights: extractHighlights(query, item.description || ''),
          metadata: {
            media_type: item.media_type,
            created_at: item.created_at
          }
        })
      })
    }

    // 5. Search Themes
    if (types.length === 0 || types.includes('theme')) {
      const { data: themes } = await supabase
        .from('narrative_themes')
        .select('id, theme_name, theme_category, usage_count')
        .ilike('theme_name', `%${query}%`)
        .limit(20)

      themes?.forEach(theme => {
        results.push({
          id: theme.id,
          type: 'theme',
          title: theme.theme_name,
          description: `Theme category: ${theme.theme_category}. Used in ${theme.usage_count} stories.`,
          relevance_score: calculateRelevanceScore(query, theme.theme_name),
          highlights: [],
          metadata: {
            category: theme.theme_category,
            usage_count: theme.usage_count
          }
        })
      })
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevance_score - a.relevance_score)

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
      search_type: searchType
    })

  } catch (error) {
    console.error('Error in global search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Calculate simple relevance score based on query matches
 */
function calculateRelevanceScore(query: string, text: string): number {
  if (!text) return 0

  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Exact match
  if (textLower === queryLower) return 1.0

  // Contains exact phrase
  if (textLower.includes(queryLower)) return 0.9

  // Contains all words
  const queryWords = queryLower.split(/\s+/)
  const matchedWords = queryWords.filter(word => textLower.includes(word))

  if (matchedWords.length === queryWords.length) return 0.7

  // Contains some words
  if (matchedWords.length > 0) {
    return 0.5 * (matchedWords.length / queryWords.length)
  }

  return 0.1
}

/**
 * Extract highlighted snippets from text
 */
function extractHighlights(query: string, text: string, maxHighlights = 3): string[] {
  if (!text) return []

  const highlights: string[] = []
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Find all occurrences
  let index = textLower.indexOf(queryLower)
  while (index !== -1 && highlights.length < maxHighlights) {
    const start = Math.max(0, index - 50)
    const end = Math.min(text.length, index + queryLower.length + 50)
    let snippet = text.substring(start, end)

    // Add ellipsis
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'

    // Highlight the match
    const highlightedSnippet = snippet.replace(
      new RegExp(query, 'gi'),
      match => `<mark class="bg-yellow-200">${match}</mark>`
    )

    highlights.push(highlightedSnippet)

    index = textLower.indexOf(queryLower, index + 1)
  }

  return highlights
}
