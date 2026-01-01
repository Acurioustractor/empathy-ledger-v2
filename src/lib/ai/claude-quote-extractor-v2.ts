/**
 * Claude 3.5 Sonnet Quote Extraction with Quality Filtering
 *
 * Improvements over previous system:
 * 1. Uses Claude 3.5 Sonnet (anti-fabrication, better reasoning)
 * 2. Strict quality filtering (rejects incoherent/superficial quotes)
 * 3. Project alignment verification
 * 4. Real confidence scoring based on quality metrics
 * 5. Quote existence verification
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface QuoteQualityMetrics {
  coherence: number // 0-100: Grammar, sentence structure
  completeness: number // 0-100: Complete thought?
  depth: number // 0-100: Superficial vs insightful
  relevance: number // 0-100: Matches project focus?
  overall_score: number // Average of above
  passes_threshold: boolean // >= 60 overall
}

export interface HighQualityQuote {
  text: string
  speaker: string
  context: string
  category: 'transformation' | 'wisdom' | 'challenge' | 'impact' | 'cultural_insight' | 'relationship'
  themes: string[]
  significance: string
  emotional_tone: string
  confidence_score: number // Real confidence based on quality
  quality_metrics: QuoteQualityMetrics
  word_count: number
  is_complete_thought: boolean
  verified_exists: boolean // Checked against source
}

export interface ProjectContext {
  project_name: string
  project_purpose: string
  primary_outcomes: string[]
  cultural_approaches?: string[]
  extract_quotes_that_demonstrate: string[]
  avoid_topics?: string[]
}

export interface ClaudeQuoteExtractionResult {
  powerful_quotes: HighQualityQuote[]
  rejected_quotes: Array<{
    text: string
    rejection_reason: string
    quality_score: number
  }>
  processing_metadata: {
    total_candidates: number
    passed_quality: number
    passed_verification: number
    final_count: number
    average_quality: number
    processing_time_ms: number
  }
}

/**
 * Assess quote quality using objective metrics
 */
function assessQuoteQuality(
  quote: string,
  projectFocus: string[]
): QuoteQualityMetrics {

  let coherence = 100
  let completeness = 100
  let depth = 100
  let relevance = 100

  // Coherence checks
  if (quote.includes('...')) coherence -= 20 // Truncated/edited
  if (!quote.match(/[.!?]$/)) completeness -= 30 // No ending punctuation
  if (quote.split(' ').length < 10) depth -= 20 // Very short

  // Detect rambling/incoherence
  const sentences = quote.split(/[.!?]+/).filter(s => s.trim())
  if (sentences.some(s => s.split(' ').length > 40)) {
    coherence -= 30 // Very long run-on sentence
  }

  // Check for poor grammar indicators
  const grammarIssues = [
    /\b(more lower|more better|more higher)\b/i, // Double comparatives
    /\band this\s+and\s+/i, // Repeated connectors
    /\byou know\s+you know/i, // Repeated fillers
  ]
  grammarIssues.forEach(pattern => {
    if (pattern.test(quote)) coherence -= 15
  })

  // Depth checks - detect superficial phrases
  const superficialPhrases = [
    /\bit's\s+(nice|good|great|okay)\b/i,
    /\bI\s+like\s+it\b/i,
    /\bit's\s+(better|comfortable)\s*$/i,
  ]
  superficialPhrases.forEach(pattern => {
    if (pattern.test(quote)) depth -= 30
  })

  // Check for incomplete thoughts
  if (quote.startsWith('Because ') && !quote.includes(', ')) {
    completeness -= 40 // Sentence fragment starting with "Because"
  }

  // Relevance check
  if (projectFocus && projectFocus.length > 0) {
    const focusMatch = projectFocus.some(focus =>
      quote.toLowerCase().includes(focus.toLowerCase())
    )
    if (!focusMatch) relevance -= 40
  }

  // Calculate overall score
  const overall_score = Math.round(
    (coherence + completeness + depth + relevance) / 4
  )

  return {
    coherence: Math.max(0, coherence),
    completeness: Math.max(0, completeness),
    depth: Math.max(0, depth),
    relevance: Math.max(0, relevance),
    overall_score,
    passes_threshold: overall_score >= 60
  }
}

/**
 * Verify quote actually exists in source transcript (fuzzy match)
 */
function verifyQuoteExists(quote: string, transcriptText: string): boolean {
  // Normalize both strings
  const normalizeText = (text: string) =>
    text.toLowerCase()
      .replace(/[""'']/g, '"')
      .replace(/\s+/g, ' ')
      .trim()

  const normalizedQuote = normalizeText(quote)
  const normalizedTranscript = normalizeText(transcriptText)

  // Check for exact substring match
  if (normalizedTranscript.includes(normalizedQuote)) {
    return true
  }

  // Check if at least 70% of significant words match
  const quoteWords = normalizedQuote
    .split(' ')
    .filter(w => w.length > 3) // Filter short words

  if (quoteWords.length === 0) return false

  const matchingWords = quoteWords.filter(word =>
    normalizedTranscript.includes(word)
  )

  const matchRatio = matchingWords.length / quoteWords.length
  return matchRatio >= 0.7
}

/**
 * Extract high-quality quotes using Claude 3.5 Sonnet
 */
export async function extractClaudeQuotesV2(
  transcriptText: string,
  speakerName: string,
  projectContext: ProjectContext,
  maxQuotes: number = 5
): Promise<ClaudeQuoteExtractionResult> {

  const startTime = Date.now()

  const systemPrompt = `You are an expert at analyzing Indigenous community storytelling transcripts and extracting powerful, meaningful quotes.

PROJECT: ${projectContext.project_name}
PURPOSE: ${projectContext.project_purpose}

PRIMARY OUTCOMES THIS PROJECT TRACKS:
${projectContext.primary_outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

${projectContext.cultural_approaches ? `
CULTURAL APPROACHES:
${projectContext.cultural_approaches.join('\n- ')}
` : ''}

EXTRACT QUOTES THAT DEMONSTRATE:
${projectContext.extract_quotes_that_demonstrate.map(e => `- ${e}`).join('\n')}

${projectContext.avoid_topics ? `
DO NOT INCLUDE QUOTES ABOUT:
${projectContext.avoid_topics.map(a => `- ${a}`).join('\n')}
` : ''}

CRITICAL QUALITY RULES:

1. ONLY extract quotes that:
   - Are complete, coherent sentences
   - Have clear meaning and proper grammar
   - Demonstrate depth and insight (not superficial)
   - Directly relate to THIS project's purpose
   - Are minimum 15 words (unless profoundly impactful)
   - Actually exist word-for-word in the transcript

2. REJECT quotes that:
   - Are incoherent or rambling
   - Have poor grammar that obscures meaning
   - Are superficial ("it's nice", "I like it")
   - Start with "Because" without completing the thought
   - Are fragments or incomplete sentences
   - Mention unrelated projects or topics
   - Are primarily filler words

3. CONFIDENCE SCORING (be honest):
   - 90-100%: Profound, clear, directly demonstrates project outcome
   - 75-89%: Strong, relevant, good evidence of impact
   - 60-74%: Decent quality, somewhat relevant
   - Below 60%: DO NOT INCLUDE

4. IF NO HIGH-QUALITY QUOTES EXIST:
   - Return empty array
   - DO NOT lower standards to fill quota
   - Better to have 0 quotes than 1 low-quality quote

Your job is to find the BEST quotes, not the most quotes.`

  const userPrompt = `Extract the highest quality quotes from this transcript that demonstrate ${projectContext.project_purpose}.

SPEAKER: ${speakerName}

TRANSCRIPT:
${transcriptText}

Return JSON with this exact structure:
{
  "quotes": [
    {
      "text": "exact quote from transcript (minimal cleaning, maintain authenticity)",
      "context": "2-3 sentences explaining what was being discussed",
      "category": "transformation|wisdom|challenge|impact|cultural_insight|relationship",
      "themes": ["specific theme 1", "specific theme 2"],
      "significance": "why this quote matters and what it demonstrates about the project",
      "emotional_tone": "one word: reflective|inspiring|determined|joyful|frustrated|caring|etc",
      "confidence_score": 0-100
    }
  ]
}

IMPORTANT:
- Only include quotes scoring 60+ in confidence
- Maximum ${maxQuotes} quotes (fewer if not enough quality quotes exist)
- Each quote must actually exist in the transcript above
- Focus on project-specific outcomes, not generic community talk`

  try {
    // Call Claude 3.5 Sonnet
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more factual responses
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse Claude's response
    const result = JSON.parse(content.text)
    const candidateQuotes = result.quotes || []

    console.log(`📊 Claude extracted ${candidateQuotes.length} candidate quotes`)

    // Process each quote through quality filter and verification
    const processedQuotes: HighQualityQuote[] = []
    const rejectedQuotes: Array<{ text: string; rejection_reason: string; quality_score: number }> = []

    for (const quote of candidateQuotes) {
      // Step 1: Assess quality
      const qualityMetrics = assessQuoteQuality(
        quote.text,
        projectContext.extract_quotes_that_demonstrate
      )

      // Step 2: Verify existence
      const exists = verifyQuoteExists(quote.text, transcriptText)

      // Step 3: Recalculate confidence based on quality
      let finalConfidence = quote.confidence_score

      if (!qualityMetrics.passes_threshold) {
        rejectedQuotes.push({
          text: quote.text.substring(0, 100),
          rejection_reason: `Quality too low: ${qualityMetrics.overall_score}/100`,
          quality_score: qualityMetrics.overall_score
        })
        console.warn(`⚠️  Rejected low quality: "${quote.text.substring(0, 50)}..." (${qualityMetrics.overall_score}/100)`)
        continue
      }

      if (!exists) {
        rejectedQuotes.push({
          text: quote.text.substring(0, 100),
          rejection_reason: 'Quote not found in transcript (possible fabrication)',
          quality_score: qualityMetrics.overall_score
        })
        console.warn(`🚨 Rejected fabricated: "${quote.text.substring(0, 50)}..."`)
        continue
      }

      // Adjust confidence based on quality
      if (qualityMetrics.overall_score < 70) {
        finalConfidence = Math.min(finalConfidence, 70)
      } else if (qualityMetrics.overall_score > 85) {
        finalConfidence = Math.min(95, finalConfidence + 5)
      }

      processedQuotes.push({
        text: quote.text,
        speaker: speakerName,
        context: quote.context,
        category: quote.category,
        themes: quote.themes || [],
        significance: quote.significance,
        emotional_tone: quote.emotional_tone || 'reflective',
        confidence_score: Math.round(finalConfidence),
        quality_metrics: qualityMetrics,
        word_count: quote.text.split(' ').length,
        is_complete_thought: qualityMetrics.completeness >= 70,
        verified_exists: true
      })
    }

    // Sort by confidence (highest first)
    processedQuotes.sort((a, b) => b.confidence_score - a.confidence_score)

    // Limit to maxQuotes
    const finalQuotes = processedQuotes.slice(0, maxQuotes)

    const processingTime = Date.now() - startTime

    console.log(`✅ Extracted ${finalQuotes.length} high-quality quotes (rejected ${rejectedQuotes.length})`)

    return {
      powerful_quotes: finalQuotes,
      rejected_quotes: rejectedQuotes,
      processing_metadata: {
        total_candidates: candidateQuotes.length,
        passed_quality: processedQuotes.length,
        passed_verification: processedQuotes.length,
        final_count: finalQuotes.length,
        average_quality: finalQuotes.length > 0
          ? Math.round(finalQuotes.reduce((sum, q) => sum + q.quality_metrics.overall_score, 0) / finalQuotes.length)
          : 0,
        processing_time_ms: processingTime
      }
    }

  } catch (error: any) {
    console.error('Error extracting quotes with Claude:', error)
    throw error
  }
}
