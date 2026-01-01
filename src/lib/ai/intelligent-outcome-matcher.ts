/**
 * Intelligent Outcome Matcher - Uses LLM to semantically match quotes to outcomes
 * Replaces simple keyword matching with AI understanding
 */

import { createLLMClient } from './llm-client'

const llm = createLLMClient()

export interface ProjectOutcome {
  category: string
  description?: string
  indicators?: string[]
  keywords?: string[]
  timeframe?: string
}

export interface Quote {
  text: string
  storyteller?: string
  speaker_name?: string
  confidence_score?: number
  category?: string
  themes?: string[]
  [key: string]: any
}

export interface TaggedQuote extends Quote {
  outcome_matches: string[]
  evidence_for_criteria: string[]
  match_confidence: number
  match_reasoning: string
}

export interface OutcomeMatcher {
  outcomes: ProjectOutcome[]
  successCriteria: string[]
  culturalValues?: string[]
}

/**
 * Use LLM to determine if a quote provides evidence for an outcome
 */
export async function tagQuoteWithOutcomesAI(
  quote: Quote,
  matcher: OutcomeMatcher
): Promise<TaggedQuote> {

  // Build outcome context for AI
  const outcomesContext = matcher.outcomes.map((o, i) => ({
    id: i,
    category: o.category,
    description: o.description || '',
    indicators: o.indicators || [],
    timeframe: o.timeframe || 'unknown'
  }))

  const systemPrompt = `You are an expert at analyzing qualitative research data and matching quotes to project outcomes.

Your task is to determine if a quote provides evidence for specific project outcomes, even if the connection is indirect.

IMPORTANT MATCHING PRINCIPLES:
1. Look for SEMANTIC matches, not just keyword matches
2. Understand that people describe outcomes in human terms:
   - "feeling safe" = evidence of safety improvements
   - "kids learning culture" = evidence of cultural continuity
   - "family gathering" = evidence of community spaces working
3. Indirect evidence counts:
   - If someone talks about "healing camp", that's evidence for "cultural events" outcome
   - If someone mentions "generation wealth", that's evidence for "economic opportunities" outcome
4. Match quotes to outcomes they SUPPORT, even if they don't directly mention them

Be generous with matches - if there's a reasonable connection, include it.`

  const userPrompt = `Analyze this quote and determine which project outcomes it provides evidence for:

QUOTE:
"${quote.text}"
- Speaker: ${quote.storyteller || quote.speaker_name || 'Unknown'}
- Context: ${quote.category || 'General'}

PROJECT OUTCOMES TO MATCH AGAINST:
${JSON.stringify(outcomesContext, null, 2)}

Return JSON:
{
  "matches": [
    {
      "outcome_id": 0,
      "outcome_category": "category name",
      "match_confidence": 0-100,
      "reasoning": "why this quote supports this outcome"
    }
  ],
  "overall_assessment": "brief summary of what this quote demonstrates"
}`

  try {
    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 1000,
      responseFormat: 'json'
    })

    const result = JSON.parse(response)

    // Extract matched outcomes
    const outcomeMatches = result.matches
      .filter((m: any) => m.match_confidence >= 50)
      .map((m: any) => m.outcome_category)

    const matchReasons = result.matches
      .filter((m: any) => m.match_confidence >= 50)
      .map((m: any) => `${m.outcome_category}: ${m.reasoning}`)
      .join('; ')

    const avgConfidence = result.matches.length > 0
      ? result.matches.reduce((sum: number, m: any) => sum + m.match_confidence, 0) / result.matches.length
      : 0

    return {
      ...quote,
      outcome_matches: outcomeMatches,
      evidence_for_criteria: [], // Can add criteria matching later
      match_confidence: Math.round(avgConfidence),
      match_reasoning: matchReasons || result.overall_assessment
    }

  } catch (error) {
    console.error('AI outcome matching error:', error)
    // Fall back to no matches on error
    return {
      ...quote,
      outcome_matches: [],
      evidence_for_criteria: [],
      match_confidence: 0,
      match_reasoning: 'Error during AI matching'
    }
  }
}

/**
 * Tag all quotes with AI-based outcome matching (batched for performance)
 */
export async function tagAllQuotesWithAI(
  quotes: Quote[],
  matcher: OutcomeMatcher
): Promise<TaggedQuote[]> {
  console.log(`🤖 AI-matching ${quotes.length} quotes to ${matcher.outcomes.length} outcomes...`)

  const BATCH_SIZE = 3 // Process 3 at a time
  const results: TaggedQuote[] = []

  for (let i = 0; i < quotes.length; i += BATCH_SIZE) {
    const batch = quotes.slice(i, i + BATCH_SIZE)
    console.log(`   Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(quotes.length/BATCH_SIZE)}...`)

    const batchResults = await Promise.all(
      batch.map(quote => tagQuoteWithOutcomesAI(quote, matcher))
    )

    results.push(...batchResults)

    // Small delay between batches
    if (i + BATCH_SIZE < quotes.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const matchedCount = results.filter(r => r.outcome_matches.length > 0).length
  console.log(`✅ AI matching complete: ${matchedCount}/${quotes.length} quotes matched to outcomes`)

  return results
}
