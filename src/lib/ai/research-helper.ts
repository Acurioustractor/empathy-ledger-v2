/**
 * Research Helper
 * Provides research capabilities using Tavily AI (free tier)
 * Useful for fact-checking, background research, and contextual information
 */

import { tavily } from '@tavily/core'

export interface ResearchResult {
  query: string
  results: Array<{
    title: string
    url: string
    content: string
    score: number
  }>
  answer?: string
  images?: string[]
  relatedQuestions?: string[]
}

/**
 * Research a topic using Tavily AI
 * Free tier: 1000 requests/month
 */
export async function researchTopic(
  query: string,
  options: {
    searchDepth?: 'basic' | 'advanced'
    maxResults?: number
    includeAnswer?: boolean
    includeImages?: boolean
    includeRawContent?: boolean
  } = {}
): Promise<ResearchResult> {

  if (!process.env.TAVILY_API_KEY) {
    console.warn('⚠️  TAVILY_API_KEY not configured, skipping research')
    return {
      query,
      results: [],
      answer: 'Research not available - API key not configured'
    }
  }

  try {
    const client = tavily({
      apiKey: process.env.TAVILY_API_KEY
    })

    const response = await client.search(query, {
      searchDepth: options.searchDepth || 'basic',
      maxResults: options.maxResults || 5,
      includeAnswer: options.includeAnswer !== false,
      includeImages: options.includeImages || false,
      includeRawContent: options.includeRawContent || false
    })

    return {
      query,
      results: response.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score
      })),
      answer: response.answer,
      images: response.images || [],
      relatedQuestions: response.related_questions || []
    }

  } catch (error) {
    console.error('❌ Research failed:', error)
    return {
      query,
      results: [],
      answer: 'Research failed - please try again'
    }
  }
}

/**
 * Research cultural context for storytelling
 */
export async function researchCulturalContext(
  topic: string,
  culturalBackground?: string
): Promise<string> {

  const query = culturalBackground
    ? `${topic} in the context of ${culturalBackground} culture and community`
    : `${topic} cultural context and background`

  const result = await researchTopic(query, {
    searchDepth: 'advanced',
    maxResults: 3,
    includeAnswer: true
  })

  if (result.answer) {
    return result.answer
  }

  // Fallback to first result content
  if (result.results.length > 0) {
    return result.results[0].content
  }

  return 'No cultural context information available'
}

/**
 * Research a person or organization
 */
export async function researchEntity(
  name: string,
  type: 'person' | 'organization',
  context?: string
): Promise<ResearchResult> {

  const query = context
    ? `${name} ${type} ${context}`
    : `${name} ${type} background and impact`

  return await researchTopic(query, {
    searchDepth: 'advanced',
    maxResults: 5,
    includeAnswer: true,
    includeImages: true
  })
}

/**
 * Fact-check a statement or claim
 */
export async function factCheck(
  statement: string
): Promise<{
  statement: string
  verification: string
  sources: Array<{ title: string; url: string; content: string }>
  confidence: 'high' | 'medium' | 'low' | 'unknown'
}> {

  const query = `fact check: ${statement}`

  const result = await researchTopic(query, {
    searchDepth: 'advanced',
    maxResults: 3,
    includeAnswer: true
  })

  // Determine confidence based on number of consistent sources
  let confidence: 'high' | 'medium' | 'low' | 'unknown' = 'unknown'
  if (result.results.length >= 3) confidence = 'high'
  else if (result.results.length >= 2) confidence = 'medium'
  else if (result.results.length >= 1) confidence = 'low'

  return {
    statement,
    verification: result.answer || 'Unable to verify',
    sources: result.results.map(r => ({
      title: r.title,
      url: r.url,
      content: r.content
    })),
    confidence
  }
}
