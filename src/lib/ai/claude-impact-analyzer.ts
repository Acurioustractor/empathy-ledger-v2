import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
})

export interface ClaudeImpactAssessment {
  dimension: 'relationship_strengthening' | 'cultural_continuity' | 'community_empowerment' | 'system_transformation'
  score: number // 0-100, based on actual story content depth
  evidence: {
    quotes: string[]
    context: string
    depth: 'mention' | 'description' | 'demonstration' | 'transformation'
  }
  reasoning: string
  confidence: number
}

export interface ClaudeImpactAnalysisResult {
  assessments: ClaudeImpactAssessment[]
  overall_summary: string
  key_strengths: string[]
}

export async function assessImpactWithClaude(
  transcript: string,
  storytellerName: string
): Promise<ClaudeImpactAnalysisResult> {
  const systemPrompt = `You are an expert in assessing Indigenous community impact with deep cultural sensitivity and respect for Indigenous ways of knowing.

Your task is to analyze oral histories and stories to understand their impact across four dimensions of community wellbeing.

IMPACT DIMENSIONS TO ASSESS:

1. RELATIONSHIP STRENGTHENING (0-100)
   - 0-30: Brief mention of relationships/connections
   - 31-60: Describes relationship-building activities or processes
   - 61-80: Shows specific relationship outcomes and trust-building
   - 81-100: Demonstrates transformative relationship impacts with clear evidence

2. CULTURAL CONTINUITY (0-100)
   - 0-30: Mention of culture, language, or traditions
   - 31-60: Description of cultural practices or knowledge transmission
   - 61-80: Demonstrates active cultural preservation or revival
   - 81-100: Shows transformative cultural continuity with intergenerational impact

3. COMMUNITY EMPOWERMENT (0-100)
   - 0-30: Brief mention of community agency or voice
   - 31-60: Describes community participation or decision-making
   - 61-80: Shows community-led initiatives and self-determination
   - 81-100: Demonstrates transformative community power and sovereignty

4. SYSTEM TRANSFORMATION (0-100)
   - 0-30: Mention of systemic issues or challenges
   - 31-60: Description of advocacy or systemic change efforts
   - 61-80: Shows specific institutional or policy shifts
   - 81-100: Demonstrates structural transformation with lasting impact

DEPTH INDICATORS:
- mention: Topic is referenced but not explored (0-30)
- description: Activities or processes are described (31-60)
- demonstration: Specific outcomes and evidence are shown (61-80)
- transformation: Profound, lasting change is demonstrated (81-100)

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting, no code blocks.`

  const userPrompt = `Analyze this transcript from ${storytellerName} for Indigenous community impact across all four dimensions.

TRANSCRIPT:
${transcript}

Assess each dimension honestly. If there's minimal evidence, score it low (0-30). If there's transformative evidence, score it high (81-100).

Return a JSON object with this exact structure:
{
  "assessments": [
    {
      "dimension": "relationship_strengthening",
      "score": 75,
      "evidence": {
        "quotes": ["quote 1 showing this dimension", "quote 2"],
        "context": "brief explanation of how this appears in the story",
        "depth": "demonstration"
      },
      "reasoning": "transparent explanation of why this score was given",
      "confidence": 85
    },
    {
      "dimension": "cultural_continuity",
      "score": 65,
      "evidence": {
        "quotes": ["quote 1", "quote 2"],
        "context": "context",
        "depth": "demonstration"
      },
      "reasoning": "explanation",
      "confidence": 80
    },
    {
      "dimension": "community_empowerment",
      "score": 80,
      "evidence": {
        "quotes": ["quote 1", "quote 2"],
        "context": "context",
        "depth": "demonstration"
      },
      "reasoning": "explanation",
      "confidence": 90
    },
    {
      "dimension": "system_transformation",
      "score": 50,
      "evidence": {
        "quotes": ["quote 1", "quote 2"],
        "context": "context",
        "depth": "description"
      },
      "reasoning": "explanation",
      "confidence": 75
    }
  ],
  "overall_summary": "2-3 sentence summary of the storyteller's impact narrative",
  "key_strengths": ["strength 1", "strength 2", "strength 3"]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    // Extract the text content from Claude's response
    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    const result = JSON.parse(textContent.text)

    return {
      assessments: result.assessments || [],
      overall_summary: result.overall_summary || '',
      key_strengths: result.key_strengths || []
    }
  } catch (error) {
    console.error('❌ Claude impact analysis error:', error)
    throw error
  }
}

export function aggregateClaudeImpact(results: ClaudeImpactAnalysisResult[]): any {
  if (results.length === 0) {
    return {
      average_scores: {},
      strongest_dimensions: [],
      collective_strengths: []
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

  return {
    average_scores,
    strongest_dimensions,
    collective_strengths,
    depth_distribution: depthCounts
  }
}
