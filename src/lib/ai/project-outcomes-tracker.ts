/**
 * Project Outcomes Tracker
 *
 * Replaces generic "Impact Framework" with project-specific outcomes
 * extracted from seed interview responses.
 *
 * FIRST PRINCIPLES:
 * - Show what THIS project defined as success
 * - Track evidence FROM transcripts against THOSE outcomes
 * - Make it relevant to the actual work being done
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ProjectOutcome {
  category: string // e.g., "Sleep Quality", "Manufacturing Capacity"
  description: string // What success looks like for this outcome
  evidence_found: string[] // Quotes/mentions from transcripts
  storytellers_mentioning: string[] // Who talked about this
  strength: 'not_mentioned' | 'mentioned' | 'described' | 'demonstrated' // Depth of evidence
  score: number // 0-100 based on evidence strength
}

export interface ProjectOutcomesAnalysis {
  project_name: string
  outcomes: ProjectOutcome[]
  overall_progress_summary: string
  key_wins: string[]
  gaps_or_opportunities: string[]
}

/**
 * Extract project-specific outcomes from context description
 */
export function extractOutcomesFromContext(contextDescription: string): string[] {
  // Parse the context to find "Success means:" or "Key outcomes:" sections
  const successSection = contextDescription.match(/Success means:(.*?)(?:\n\n|Key outcomes:|$)/s)
  const outcomesSection = contextDescription.match(/Key outcomes we track:(.*?)(?:\n\n|$)/s)

  const outcomes: string[] = []

  if (successSection) {
    const lines = successSection[1].split('\n').filter(line => line.trim().startsWith('-'))
    outcomes.push(...lines.map(line => line.replace(/^-\s*/, '').trim()))
  }

  if (outcomesSection) {
    const lines = outcomesSection[1].split('\n').filter(line => line.trim().startsWith('-'))
    outcomes.push(...lines.map(line => line.replace(/^-\s*/, '').trim()))
  }

  return outcomes.filter(o => o.length > 0)
}

/**
 * Analyze transcripts to find evidence of project-specific outcomes
 */
export async function analyzeProjectOutcomes(
  projectName: string,
  projectContext: string,
  transcriptsWithStorytellers: Array<{ text: string; storyteller: string }>
): Promise<ProjectOutcomesAnalysis> {

  // Extract expected outcomes from context
  const expectedOutcomes = extractOutcomesFromContext(projectContext)

  if (expectedOutcomes.length === 0) {
    // Fallback: no outcomes defined in context
    return {
      project_name: projectName,
      outcomes: [],
      overall_progress_summary: 'No project outcomes defined yet. Add outcomes in project context setup.',
      key_wins: [],
      gaps_or_opportunities: []
    }
  }

  const systemPrompt = `You are analyzing community interviews to find evidence of project-specific outcomes.

PROJECT: ${projectName}

EXPECTED OUTCOMES (from project's own definition of success):
${expectedOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Your task:
- For EACH expected outcome, search ALL transcripts for evidence
- Find specific quotes that demonstrate this outcome
- Note which storytellers mentioned it
- Assess the DEPTH of evidence: just mentioned vs fully demonstrated
- Score 0-100 based on evidence strength and depth

SCORING GUIDE:
- 0-25: Not mentioned or very vague reference
- 26-50: Mentioned briefly, limited detail
- 51-75: Described with some detail and examples
- 76-100: Demonstrated with clear evidence, specific stories, tangible examples

Be evidence-based: Only high scores if there's real substance, not just keywords.`

  const userPrompt = `Analyze these ${transcriptsWithStorytellers.length} interviews and find evidence for each expected outcome.

TRANSCRIPTS:
${transcriptsWithStorytellers.map((t, i) => `
=== INTERVIEW ${i + 1}: ${t.storyteller} ===
${t.text.substring(0, 3000)}${t.text.length > 3000 ? '...(truncated)' : ''}
`).join('\n')}

Return JSON:
{
  "outcomes": [
    {
      "category": "Brief outcome name (3-5 words)",
      "description": "What success looks like for this outcome",
      "evidence_found": ["quote 1", "quote 2"],
      "storytellers_mentioning": ["Name 1", "Name 2"],
      "strength": "not_mentioned|mentioned|described|demonstrated",
      "score": 0-100
    }
  ],
  "overall_progress_summary": "2-3 sentences about overall progress",
  "key_wins": ["Win 1", "Win 2", "Win 3"],
  "gaps_or_opportunities": ["Gap 1", "Gap 2"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      project_name: projectName,
      outcomes: result.outcomes || [],
      overall_progress_summary: result.overall_progress_summary || '',
      key_wins: result.key_wins || [],
      gaps_or_opportunities: result.gaps_or_opportunities || []
    }

  } catch (error: any) {
    console.error('Error analyzing project outcomes:', error)
    throw error
  }
}
