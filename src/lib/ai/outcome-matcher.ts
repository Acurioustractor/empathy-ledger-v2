/**
 * Outcome Matcher - Tags quotes with which project outcomes they support
 *
 * This is the core of the world-class analysis system:
 * 1. Takes extracted quotes
 * 2. Takes project context (outcomes, success criteria, keywords)
 * 3. Returns quotes tagged with matching outcomes
 */

export interface ProjectOutcome {
  category: string
  description?: string
  indicators?: string[]
  keywords?: string[]
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
  outcome_matches: string[]           // Which outcomes this quote supports
  evidence_for_criteria: string[]     // Which success criteria demonstrated
  match_confidence: number            // How confident the match is (0-100)
  match_reasoning: string             // Why it matches
}

export interface OutcomeMatcher {
  outcomes: ProjectOutcome[]
  successCriteria: string[]
  culturalValues?: string[]
}

/**
 * Tags a quote with which outcomes it matches
 */
export function tagQuoteWithOutcomes(
  quote: Quote,
  matcher: OutcomeMatcher
): TaggedQuote {
  const quoteText = quote.text.toLowerCase()
  const outcomeMatches: string[] = []
  const evidenceForCriteria: string[] = []
  let totalConfidence = 0
  let matchCount = 0
  const matchReasons: string[] = []

  // Match against each outcome
  matcher.outcomes.forEach(outcome => {
    const keywords = outcome.keywords || outcome.indicators || []
    const matchedKeywords = keywords.filter(kw =>
      quoteText.includes(kw.toLowerCase())
    )

    if (matchedKeywords.length > 0) {
      outcomeMatches.push(outcome.category)
      matchReasons.push(`Matches ${outcome.category}: ${matchedKeywords.join(', ')}`)

      // Calculate confidence based on keyword matches
      const confidence = Math.min(100, (matchedKeywords.length / keywords.length) * 100 + 50)
      totalConfidence += confidence
      matchCount++
    }
  })

  // Match against success criteria
  matcher.successCriteria.forEach(criteria => {
    const criteriaLower = criteria.toLowerCase()
    // Check if quote relates to this criteria (keyword matching)
    const criteriaWords = criteriaLower.split(' ').filter(w => w.length > 3)
    const matchedWords = criteriaWords.filter(word => quoteText.includes(word))

    if (matchedWords.length >= 2) {
      evidenceForCriteria.push(criteria)
      matchReasons.push(`Evidence for: ${criteria}`)
    }
  })

  const matchConfidence = matchCount > 0 ? totalConfidence / matchCount : 0

  return {
    ...quote,
    outcome_matches: outcomeMatches,
    evidence_for_criteria: evidenceForCriteria,
    match_confidence: Math.round(matchConfidence),
    match_reasoning: matchReasons.join('; ')
  }
}

/**
 * Tags all quotes with outcome matches
 */
export function tagAllQuotes(
  quotes: Quote[],
  matcher: OutcomeMatcher
): TaggedQuote[] {
  return quotes.map(quote => tagQuoteWithOutcomes(quote, matcher))
}

/**
 * Filters quotes to only those that match at least one outcome
 */
export function getOutcomeAlignedQuotes(
  quotes: TaggedQuote[]
): TaggedQuote[] {
  return quotes.filter(q => q.outcome_matches.length > 0)
}

/**
 * Gets quotes for a specific outcome
 */
export function getQuotesForOutcome(
  quotes: TaggedQuote[],
  outcomeCategory: string
): TaggedQuote[] {
  return quotes.filter(q =>
    q.outcome_matches.includes(outcomeCategory)
  ).sort((a, b) => (b.match_confidence || 0) - (a.match_confidence || 0))
}
