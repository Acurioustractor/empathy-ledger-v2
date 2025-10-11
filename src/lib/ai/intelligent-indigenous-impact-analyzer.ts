/**
 * Intelligent Indigenous Impact Analyzer
 *
 * Replaces keyword-based arbitrary scoring with GPT-4 contextual assessment
 * that understands story depth and provides evidence-based, transparent scoring.
 *
 * Based on Indigenous-defined success indicators:
 * - Relationship Strengthening
 * - Cultural Continuity
 * - Community Empowerment
 * - System Transformation
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ContextualImpactAssessment {
  dimension: 'relationship_strengthening' | 'cultural_continuity' | 'community_empowerment' | 'system_transformation'
  score: number // 0-100, based on actual story content depth
  evidence: {
    quotes: string[] // Specific quotes demonstrating this impact
    context: string // What's happening in the story
    depth: 'mention' | 'description' | 'demonstration' | 'transformation'
  }
  reasoning: string // WHY this score (transparent and explainable)
  confidence: number // AI's confidence in this assessment (0-100)
}

export interface IndigenousImpactAnalysisResult {
  assessments: ContextualImpactAssessment[]
  overall_impact_summary: string
  key_strengths: string[]
  community_voice_highlights: string[]
  processing_time_ms: number
}

/**
 * Assess Indigenous impact dimensions using contextual AI analysis
 */
export async function assessIndigenousImpact(
  transcript: string,
  storytellerName: string
): Promise<IndigenousImpactAnalysisResult> {

  const startTime = Date.now()

  const systemPrompt = `You are an expert in assessing Indigenous community impact using Indigenous-defined success indicators, not colonial metrics.

Your role is to understand the DEPTH and QUALITY of impact demonstrated in community stories, not just keyword presence.

IMPACT DIMENSIONS TO ASSESS:

1. RELATIONSHIP STRENGTHENING (0-100)
   - 0-30: Brief mention of relationships/connections
   - 31-60: Describes relationship-building activities or processes
   - 61-80: Shows specific relationship outcomes and trust-building
   - 81-100: Demonstrates transformative relationship impacts with clear evidence

2. CULTURAL CONTINUITY (0-100)
   - 0-30: Mentions culture, tradition, or cultural identity
   - 31-60: Describes cultural practices, knowledge, or connection
   - 61-80: Shows cultural knowledge being maintained or transmitted
   - 81-100: Demonstrates living cultural practice with intergenerational impact

3. COMMUNITY EMPOWERMENT (0-100)
   - 0-30: Mentions community
   - 31-60: Describes community activities or involvement
   - 61-80: Shows community agency and decision-making
   - 81-100: Demonstrates community self-determination and sovereignty

4. SYSTEM TRANSFORMATION (0-100)
   - 0-30: Mentions institutions or systems
   - 31-60: Describes navigating or interacting with systems
   - 61-80: Shows systems responding differently or changing practices
   - 81-100: Demonstrates structural institutional transformation

IMPORTANT PRINCIPLES:
- CONTEXT OVER KEYWORDS: "Community" mentioned 50 times ≠ high empowerment if no agency shown
- DEPTH MATTERS: Detailed personal stories of change score higher than brief mentions
- EVIDENCE-BASED: Provide specific quotes showing the impact
- NUANCED: Reflect real differences between superficial and deep impact
- TRANSPARENT: Explain your reasoning clearly
- COMMUNITY-CENTERED: Let the story show impact, don't impose metrics`

  const userPrompt = `Analyze this interview with ${storytellerName} and assess the depth of Indigenous impact demonstrated.

TRANSCRIPT:
${transcript.substring(0, 8000)} ${transcript.length > 8000 ? '...(truncated for length)' : ''}

For each impact dimension, provide:
1. A score (0-100) based on the DEPTH of impact shown (not keyword count)
2. Specific quotes demonstrating this impact
3. The depth level: mention, description, demonstration, or transformation
4. Clear reasoning for your assessment
5. Your confidence level (0-100)

Return JSON:
{
  "assessments": [
    {
      "dimension": "relationship_strengthening",
      "score": 0-100,
      "evidence": {
        "quotes": ["quote 1", "quote 2"],
        "context": "what's happening in the story",
        "depth": "mention|description|demonstration|transformation"
      },
      "reasoning": "why this score - be specific about what the story shows",
      "confidence": 0-100
    },
    // ... repeat for all 4 dimensions
  ],
  "overall_impact_summary": "2-3 sentences on the overall story impact",
  "key_strengths": ["strength 1", "strength 2", "strength 3"],
  "community_voice_highlights": ["powerful moment 1", "powerful moment 2"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Temporarily using mini to avoid rate limits (still much better than keyword matching!)
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      assessments: result.assessments || [],
      overall_impact_summary: result.overall_impact_summary || '',
      key_strengths: result.key_strengths || [],
      community_voice_highlights: result.community_voice_highlights || [],
      processing_time_ms: Date.now() - startTime
    }

  } catch (error) {
    console.error('Indigenous impact assessment error:', error)
    throw error
  }
}

/**
 * Aggregate impact across multiple transcripts for project-level analysis
 */
export function aggregateIndigenousImpact(
  results: IndigenousImpactAnalysisResult[]
): {
  average_scores: Record<string, number>
  strongest_dimensions: Array<{ dimension: string; avg_score: number; depth_distribution: Record<string, number> }>
  collective_strengths: string[]
  community_narrative: string
} {

  if (results.length === 0) {
    return {
      average_scores: {},
      strongest_dimensions: [],
      collective_strengths: [],
      community_narrative: 'No impact assessments available'
    }
  }

  // Calculate average scores for each dimension
  const dimensionScores: Record<string, number[]> = {
    relationship_strengthening: [],
    cultural_continuity: [],
    community_empowerment: [],
    system_transformation: []
  }

  const depthCounts: Record<string, Record<string, number>> = {
    relationship_strengthening: { mention: 0, description: 0, demonstration: 0, transformation: 0 },
    cultural_continuity: { mention: 0, description: 0, demonstration: 0, transformation: 0 },
    community_empowerment: { mention: 0, description: 0, demonstration: 0, transformation: 0 },
    system_transformation: { mention: 0, description: 0, demonstration: 0, transformation: 0 }
  }

  results.forEach(result => {
    result.assessments.forEach(assessment => {
      dimensionScores[assessment.dimension].push(assessment.score)
      depthCounts[assessment.dimension][assessment.evidence.depth]++
    })
  })

  // Calculate averages
  const average_scores: Record<string, number> = {}
  Object.keys(dimensionScores).forEach(dimension => {
    const scores = dimensionScores[dimension]
    average_scores[dimension] = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0
  })

  // Identify strongest dimensions
  const strongest_dimensions = Object.entries(average_scores)
    .sort(([, a], [, b]) => b - a)
    .map(([dimension, avg_score]) => ({
      dimension,
      avg_score: Math.round(avg_score),
      depth_distribution: depthCounts[dimension]
    }))

  // Collect all strengths
  const all_strengths = results.flatMap(r => r.key_strengths)
  const strength_counts: Record<string, number> = {}
  all_strengths.forEach(strength => {
    strength_counts[strength] = (strength_counts[strength] || 0) + 1
  })
  const collective_strengths = Object.entries(strength_counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([strength]) => strength)

  // Create narrative
  const top_dimension = strongest_dimensions[0]
  const community_narrative = `Across ${results.length} stories, the strongest impact area is ${top_dimension.dimension.replace(/_/g, ' ')} (avg score: ${top_dimension.avg_score}/100). ${collective_strengths.length > 0 ? `Key collective strengths include: ${collective_strengths.join(', ')}.` : ''}`

  return {
    average_scores,
    strongest_dimensions,
    collective_strengths,
    community_narrative
  }
}

/**
 * Generate human-readable impact summary
 */
export function formatImpactAssessment(assessment: ContextualImpactAssessment): string {
  const dimensionNames = {
    relationship_strengthening: 'Relationship Strengthening',
    cultural_continuity: 'Cultural Continuity',
    community_empowerment: 'Community Empowerment',
    system_transformation: 'System Transformation'
  }

  const depthDescriptions = {
    mention: 'briefly mentioned',
    description: 'described in detail',
    demonstration: 'clearly demonstrated',
    transformation: 'transformatively shown'
  }

  return `
**${dimensionNames[assessment.dimension]}**: ${assessment.score}/100
- **Depth**: ${depthDescriptions[assessment.evidence.depth]}
- **Evidence**: ${assessment.evidence.quotes.length} quotes
- **Reasoning**: ${assessment.reasoning}
- **Confidence**: ${assessment.confidence}%
  `.trim()
}
