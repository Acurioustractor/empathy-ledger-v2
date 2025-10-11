import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
})

export interface ClaudeQuote {
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

export interface ClaudeQuoteExtractionResult {
  powerful_quotes: ClaudeQuote[]
  transformation_stories: string[]
  cultural_insights: string[]
  community_impact: string[]
  total_extracted: number
  average_quality: number
}

export async function extractQuotesWithClaude(
  transcriptText: string,
  speakerName: string,
  maxQuotes: number = 5
): Promise<ClaudeQuoteExtractionResult> {
  const systemPrompt = `You are an expert at analyzing oral history and Indigenous storytelling transcripts with deep cultural sensitivity and respect.

Your task is to identify the most powerful, meaningful quotes that honor the storyteller's voice and experience.

CRITICAL QUALITY STANDARDS:
- Extract COMPLETE THOUGHTS ONLY (full sentences or coherent ideas)
- Filter out speech disfluencies ("um", "uh", "like", "you know") while maintaining authenticity
- Minimum 10 words per quote (unless extremely powerful)
- Avoid fragments like "knowledge." or "hard."
- No repetitive stutters or false starts
- Preserve cultural language and specific terms exactly as spoken

CATEGORIES:
- transformation: Personal or community transformation stories
- wisdom: Traditional knowledge, life lessons, guidance
- challenge: Obstacles, struggles, systemic issues
- impact: Community outcomes, tangible change
- cultural_insight: Cultural practices, identity, heritage
- relationship: Connection, trust, collaboration

QUALITY SCORING (0-100):
Rate each quote based on:
- Clarity (30 points): Easy to understand, coherent
- Impact/Significance (30 points): Meaningful, powerful, memorable
- Completeness (20 points): Full thought, proper context
- Cultural/Community relevance (20 points): Connection to culture, community, or shared experience

Only return quotes scoring 60 or above.

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting, no code blocks.`

  const userPrompt = `Analyze this transcript from ${speakerName} and extract the most powerful quotes.

TRANSCRIPT:
${transcriptText}

Return a JSON object with this exact structure:
{
  "powerful_quotes": [
    {
      "text": "the exact quote text",
      "speaker": "${speakerName}",
      "context": "what was being discussed",
      "category": "transformation|wisdom|challenge|impact|cultural_insight|relationship",
      "themes": ["theme1", "theme2"],
      "significance": "why this quote matters",
      "emotional_tone": "reflective|hopeful|determined|etc",
      "confidence_score": 85,
      "word_count": 15,
      "is_complete_thought": true
    }
  ],
  "transformation_stories": ["brief description of transformation moments"],
  "cultural_insights": ["key cultural knowledge or insights shared"],
  "community_impact": ["statements about community impact or change"]
}

Extract up to ${maxQuotes} of the BEST quotes. Quality over quantity.`

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

    // Validate and filter quotes
    const powerfulQuotes = (result.powerful_quotes || []).filter((q: ClaudeQuote) =>
      q.confidence_score >= 60 &&
      q.is_complete_thought &&
      q.word_count >= 10
    )

    const avgQuality = powerfulQuotes.length > 0
      ? powerfulQuotes.reduce((sum: number, q: ClaudeQuote) => sum + q.confidence_score, 0) / powerfulQuotes.length
      : 0

    return {
      powerful_quotes: powerfulQuotes,
      transformation_stories: result.transformation_stories || [],
      cultural_insights: result.cultural_insights || [],
      community_impact: result.community_impact || [],
      total_extracted: powerfulQuotes.length,
      average_quality: Math.round(avgQuality * 10) / 10
    }
  } catch (error) {
    console.error('❌ Claude quote extraction error:', error)
    throw error
  }
}
