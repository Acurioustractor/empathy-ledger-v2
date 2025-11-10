/**
 * Outcomes Aggregator - Aggregates quotes by outcome category
 *
 * Takes tagged quotes and creates the outcomes evidence view:
 * - How many quotes support each outcome?
 * - What's the confidence level?
 * - Which storytellers contributed evidence?
 */

import type { TaggedQuote, ProjectOutcome } from './outcome-matcher'

export interface OutcomeEvidence {
  category: string
  description?: string
  evidence_count: number
  quotes: TaggedQuote[]
  storytellers: string[]
  confidence: number              // 0-100 based on evidence strength
  status: 'Evidence Found' | 'Partial Evidence' | 'Not Yet Evident'
  sample_quotes: string[]         // Top 3 quotes as preview
}

export interface AggregatedOutcomes {
  outcomes: OutcomeEvidence[]
  total_outcomes: number
  outcomes_with_evidence: number
  overall_confidence: number
}

/**
 * Aggregates quotes by outcome category
 */
export function aggregateOutcomes(
  quotes: TaggedQuote[],
  projectOutcomes: ProjectOutcome[]
): AggregatedOutcomes {
  const outcomes: OutcomeEvidence[] = projectOutcomes.map(outcome => {
    // Find all quotes that match this outcome
    const matchingQuotes = quotes.filter(q =>
      q.outcome_matches?.includes(outcome.category)
    )

    // Get unique storytellers
    const storytellers = Array.from(new Set(
      matchingQuotes.map(q => q.storyteller || q.speaker_name || 'Unknown')
    ))

    // Calculate confidence based on:
    // 1. Number of quotes (more = higher confidence)
    // 2. Number of storytellers (diverse voices = higher confidence)
    // 3. Individual quote confidence scores
    let confidence = 0
    if (matchingQuotes.length > 0) {
      const quoteStrength = Math.min(50, matchingQuotes.length * 10)
      const diversityBonus = Math.min(30, storytellers.length * 10)
      const avgQuoteConfidence = matchingQuotes.reduce((sum, q) =>
        sum + (q.match_confidence || 50), 0
      ) / matchingQuotes.length
      const confidenceFromQuotes = (avgQuoteConfidence / 100) * 20

      confidence = quoteStrength + diversityBonus + confidenceFromQuotes
    }

    // Determine status
    let status: 'Evidence Found' | 'Partial Evidence' | 'Not Yet Evident'
    if (confidence >= 60) {
      status = 'Evidence Found'
    } else if (confidence > 0) {
      status = 'Partial Evidence'
    } else {
      status = 'Not Yet Evident'
    }

    // Get top 3 quotes as samples
    const sortedQuotes = [...matchingQuotes].sort((a, b) =>
      (b.match_confidence || 0) - (a.match_confidence || 0)
    )
    const sampleQuotes = sortedQuotes.slice(0, 3).map(q => q.text)

    return {
      category: outcome.category,
      description: outcome.description,
      evidence_count: matchingQuotes.length,
      quotes: matchingQuotes,
      storytellers,
      confidence: Math.round(confidence),
      status,
      sample_quotes: sampleQuotes
    }
  })

  // Calculate overall stats
  const outcomesWithEvidence = outcomes.filter(o => o.evidence_count > 0).length
  const overallConfidence = outcomes.reduce((sum, o) => sum + o.confidence, 0) / outcomes.length

  return {
    outcomes,
    total_outcomes: outcomes.length,
    outcomes_with_evidence: outcomesWithEvidence,
    overall_confidence: Math.round(overallConfidence)
  }
}

/**
 * Get summary statistics
 */
export function getOutcomesSummary(aggregated: AggregatedOutcomes) {
  return {
    total: aggregated.total_outcomes,
    with_evidence: aggregated.outcomes_with_evidence,
    without_evidence: aggregated.total_outcomes - aggregated.outcomes_with_evidence,
    percentage_complete: Math.round(
      (aggregated.outcomes_with_evidence / aggregated.total_outcomes) * 100
    ),
    overall_confidence: aggregated.overall_confidence
  }
}

/**
 * Get outcomes sorted by confidence (highest first)
 */
export function getOutcomesByConfidence(aggregated: AggregatedOutcomes): OutcomeEvidence[] {
  return [...aggregated.outcomes].sort((a, b) => b.confidence - a.confidence)
}

/**
 * Get only outcomes with evidence
 */
export function getOutcomesWithEvidence(aggregated: AggregatedOutcomes): OutcomeEvidence[] {
  return aggregated.outcomes.filter(o => o.evidence_count > 0)
}
