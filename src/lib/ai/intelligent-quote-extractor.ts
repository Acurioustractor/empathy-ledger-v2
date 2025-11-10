/**
 * Intelligent Quote Extraction using GPT-4
 *
 * This replaces simple regex matching with proper AI analysis that:
 * 1. Understands context and meaning
 * 2. Filters out speech disfluencies
 * 3. Identifies genuinely impactful statements
 * 4. Provides real confidence scores
 * 5. Extracts complete, coherent thoughts
 */

import { createLLMClient } from './llm-client'

const llm = createLLMClient()

export interface IntelligentQuote {
  text: string
  speaker: string
  context: string
  category: 'transformation' | 'wisdom' | 'challenge' | 'impact' | 'cultural_insight' | 'relationship'
  themes: string[]
  significance: string
  emotional_tone: string
  confidence_score: number // 0-100, based on actual quote quality
  word_count: number
  is_complete_thought: boolean
}

export interface QuoteExtractionResult {
  powerful_quotes: IntelligentQuote[]
  transformation_stories: string[]
  cultural_insights: string[]
  community_impact_statements: string[]
  processing_metadata: {
    total_quotes_analyzed: number
    quotes_extracted: number
    quality_threshold: number
    processing_time_ms: number
  }
}

export interface ProjectContext {
  model?: 'quick' | 'full'
  description?: string
  mission?: string
  primary_goals?: string[]
  outcome_categories?: Array<{
    category: string
    examples: string[]
    keywords: string[]
  }>
  positive_language?: string[]
  cultural_values?: string[]
}

/**
 * Extract high-quality quotes using GPT-4's understanding with project context
 */
export async function extractIntelligentQuotes(
  transcriptText: string,
  speakerName: string,
  maxQuotes: number = 5,
  projectContext?: ProjectContext
): Promise<QuoteExtractionResult> {

  const startTime = Date.now()

  // Build context-aware system prompt
  let contextGuidance = ''
  if (projectContext && projectContext.model) {
    contextGuidance = `

PROJECT CONTEXT:
This transcript is part of a project with the following goals and outcomes:

${projectContext.mission ? `Mission: ${projectContext.mission}` : ''}
${projectContext.primary_goals ? `\nKey Goals:\n${projectContext.primary_goals.map(g => `- ${g}`).join('\n')}` : ''}

${projectContext.outcome_categories && projectContext.outcome_categories.length > 0 ? `
Expected Outcomes to Look For:
${projectContext.outcome_categories.map(oc => `
- ${oc.category}: ${oc.examples.join(', ')}
  Keywords: ${oc.keywords.join(', ')}`).join('\n')}
` : ''}

${projectContext.positive_language && projectContext.positive_language.length > 0 ? `
Success Language Patterns:
${projectContext.positive_language.join(', ')}
` : ''}

${projectContext.cultural_values && projectContext.cultural_values.length > 0 ? `
Cultural Values:
${projectContext.cultural_values.join(', ')}
` : ''}

CRITICAL EXTRACTION RULES - FOLLOW STRICTLY:

1. PRIMARY FOCUS: Extract quotes that DIRECTLY relate to the project's expected outcomes listed above
   - If a quote mentions the project outcomes/keywords → MUST extract it
   - If a quote uses success language patterns → MUST extract it
   - If a quote demonstrates project impact → MUST extract it

2. SECONDARY FOCUS: Only after extracting ALL project-aligned quotes, consider general cultural insights

3. REJECT generic cultural quotes that don't relate to project outcomes
   - Generic community connection → REJECT unless related to project outcomes
   - Generic cultural identity → REJECT unless related to project outcomes
   - Generic tradition/family → REJECT unless related to project outcomes

THIS IS A PROJECT-SPECIFIC ANALYSIS. Quotes MUST demonstrate the specific project outcomes listed above.
PRIORITIZE PROJECT-ALIGNED QUOTES OVER GENERIC CULTURAL QUOTES.`
  }

  const systemPrompt = `You are an expert at analyzing oral history transcripts and extracting the most powerful, meaningful quotes.
${contextGuidance}

Your task:
1. Find quotes that are COMPLETE, COHERENT thoughts (not fragments)
2. Exclude quotes with excessive filler words (um, uh, like, you know)
3. Focus on quotes that demonstrate:
   - Personal transformation or growth
   - Cultural wisdom and knowledge
   - Community impact
   - Overcoming challenges
   - Relationship building
   - Cultural identity and connection
${projectContext ? '   - PROJECT-SPECIFIC OUTCOMES (see context above)' : ''}

Quality criteria for quotes:
- Must be a complete sentence or thought
- Minimum 10 words (unless extremely powerful)
- Clear, understandable meaning
- Demonstrates significance
- Free from excessive disfluencies
${projectContext ? '- Relates to project goals and outcomes' : ''}

Rate each quote's quality on a scale of 0-100 based on:
- Clarity (30 points)
- Impact/Significance (30 points)
- Completeness (20 points)
- Cultural/Community relevance (20 points)
${projectContext ? '- Project outcome alignment (bonus +10 points if clearly demonstrates project goals)' : ''}

Only return quotes scoring 60 or above.`

  const userPrompt = `Analyze this transcript from ${speakerName} and extract the most powerful quotes.

TRANSCRIPT:
${transcriptText.substring(0, 8000)}

Return a JSON object with:
{
  "quotes": [
    {
      "text": "the exact quote (cleaned of excessive ums/uhs but maintaining authenticity)",
      "context": "what was being discussed when this was said",
      "category": "transformation|wisdom|challenge|impact|cultural_insight|relationship",
      "themes": ["theme1", "theme2"],
      "significance": "why this quote matters and what it reveals",
      "emotional_tone": "reflective|inspiring|determined|joyful|etc",
      "confidence_score": 0-100,
      "is_complete_thought": true|false
    }
  ],
  "transformation_stories": ["brief description of transformation moments"],
  "cultural_insights": ["key cultural knowledge or insights shared"],
  "community_impact": ["statements about community impact or change"]
}

Extract up to ${maxQuotes} of the BEST quotes. Quality over quantity.`

  try {
    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 2000,
      responseFormat: 'json'
    })

    const result = JSON.parse(response)

    // Transform to our interface
    const powerfulQuotes: IntelligentQuote[] = (result.quotes || []).map((q: any) => ({
      text: q.text,
      speaker: speakerName,
      context: q.context,
      category: q.category,
      themes: q.themes || [],
      significance: q.significance,
      emotional_tone: q.emotional_tone,
      confidence_score: q.confidence_score,
      word_count: q.text.split(' ').length,
      is_complete_thought: q.is_complete_thought
    }))

    return {
      powerful_quotes: powerfulQuotes.filter(q => q.confidence_score >= 60),
      transformation_stories: result.transformation_stories || [],
      cultural_insights: result.cultural_insights || [],
      community_impact_statements: result.community_impact || [],
      processing_metadata: {
        total_quotes_analyzed: result.quotes?.length || 0,
        quotes_extracted: powerfulQuotes.filter(q => q.confidence_score >= 60).length,
        quality_threshold: 60,
        processing_time_ms: Date.now() - startTime
      }
    }

  } catch (error) {
    console.error('Quote extraction error:', error)
    throw error
  }
}

/**
 * Extract themes using GPT-4 (better than regex)
 */
export async function extractIntelligentThemes(
  transcriptText: string
): Promise<{
  primary_themes: Array<{ theme: string; confidence: number; evidence: string[] }>
  cultural_themes: Array<{ theme: string; significance: string }>
  emotional_journey: string[]
}> {

  const systemPrompt = `You analyze oral history transcripts to identify meaningful themes.

Focus on:
- What matters most to this person
- Cultural and community connections
- Personal growth and transformation
- Challenges and resilience
- Values and beliefs

Provide evidence for each theme (specific examples from the text).
Rate confidence 0-100 based on how strongly the theme appears.`

  const userPrompt = `Identify the key themes in this transcript:

${transcriptText.substring(0, 4000)}

Return JSON:
{
  "primary_themes": [
    {
      "theme": "clear theme name",
      "confidence": 0-100,
      "evidence": ["quote showing this theme", "another example"]
    }
  ],
  "cultural_themes": [
    {
      "theme": "cultural theme",
      "significance": "what this reveals about cultural connection/identity"
    }
  ],
  "emotional_journey": ["description of emotional progression through the story"]
}`

  try {
    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 2000,
      responseFormat: 'json'
    })

    return JSON.parse(response)
  } catch (error) {
    console.error('Theme extraction error:', error)
    throw error
  }
}

/**
 * Generate better summary using GPT-4
 */
export async function generateIntelligentSummary(
  transcriptText: string,
  speakerName: string
): Promise<{
  summary: string
  key_insights: string[]
  story_arc: string
  impact_statement: string
}> {

  const prompt = `Create a compelling summary of this interview with ${speakerName}.

Focus on:
- The core story being told
- Key insights and wisdom shared
- Personal journey or transformation
- Community or cultural connection
- Impact or significance

Keep it engaging and human. Avoid generic summaries.

TRANSCRIPT:
${transcriptText.substring(0, 4000)}

Return JSON:
{
  "summary": "2-3 compelling sentences capturing the essence",
  "key_insights": ["insight 1", "insight 2", ...],
  "story_arc": "the narrative journey (beginning, middle, end)",
  "impact_statement": "one sentence on why this story matters"
}`

  try {
    const response = await llm.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 1500,
      responseFormat: 'json'
    })

    return JSON.parse(response)
  } catch (error) {
    console.error('Summary generation error:', error)
    throw error
  }
}
