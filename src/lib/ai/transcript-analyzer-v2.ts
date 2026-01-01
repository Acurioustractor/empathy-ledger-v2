/**
 * Hybrid Transcript Analyzer - Combines pattern matching + LLM
 *
 * Approach:
 * 1. Fast pattern matching for known Indigenous indicators
 * 2. Deep LLM analysis for nuanced themes, quotes, and summaries
 * 3. Merge both for comprehensive insights
 */

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { indigenousImpactAnalyzer } from './indigenous-impact-analyzer'

// Schema for LLM output
const TranscriptAnalysisSchema = z.object({
  // Themes
  themes: z.array(z.string()).max(8).describe('Key themes found in the transcript'),
  cultural_themes: z.array(z.string()).max(5).describe('Specifically cultural or Indigenous themes'),

  // Quotes
  key_quotes: z.array(z.object({
    text: z.string().describe('The exact quote text'),
    theme: z.string().describe('Primary theme of this quote'),
    context: z.string().describe('Brief context around the quote'),
    impact_score: z.number().min(0).max(5).describe('Impact/significance score 0-5'),
    speaker_insight: z.string().describe('What this reveals about the speaker')
  })).max(5).describe('Most impactful quotes from the transcript'),

  // Summary
  summary: z.string().max(500).describe('Concise summary of the transcript content'),

  // Metadata
  emotional_tone: z.enum(['joyful', 'reflective', 'solemn', 'inspiring', 'healing', 'celebratory', 'educational']),
  cultural_sensitivity_level: z.enum(['low', 'medium', 'high', 'sacred']),
  requires_elder_review: z.boolean().describe('Should this be reviewed by elders before publication?'),

  // Additional insights
  key_insights: z.array(z.string()).max(5).describe('Important takeaways or insights'),
  related_topics: z.array(z.string()).max(5).describe('Related topics for cross-referencing')
})

export type TranscriptAnalysisResult = z.infer<typeof TranscriptAnalysisSchema> & {
  pattern_insights: any[]
  processing_time_ms: number
}

export class HybridTranscriptAnalyzer {

  /**
   * Analyze transcript using hybrid approach
   */
  async analyzeTranscript(
    transcript: string,
    metadata?: {
      title?: string
      storyteller_name?: string
      cultural_context?: string
    }
  ): Promise<TranscriptAnalysisResult> {
    const startTime = Date.now()

    console.log('🔍 Starting hybrid transcript analysis...')

    // Phase 1: Fast pattern matching (existing system)
    console.log('📊 Phase 1: Pattern matching...')
    const patternInsights = indigenousImpactAnalyzer.analyzeIndigenousImpact(transcript)
    console.log(`✅ Found ${patternInsights.length} pattern-based insights`)

    // Phase 2: Deep LLM analysis
    console.log('🤖 Phase 2: AI analysis...')
    const aiAnalysis = await this.runLLMAnalysis(transcript, patternInsights, metadata)
    console.log('✅ AI analysis complete')

    // Phase 3: Merge results
    const processingTime = Date.now() - startTime
    console.log(`⚡ Analysis complete in ${processingTime}ms`)

    return {
      ...aiAnalysis,
      pattern_insights: patternInsights,
      processing_time_ms: processingTime
    }
  }

  /**
   * Run LLM analysis with cultural safety
   */
  private async runLLMAnalysis(
    transcript: string,
    patternInsights: any[],
    metadata?: any
  ) {
    // Extract themes from pattern analysis
    const knownImpactTypes = [...new Set(patternInsights.map(i => i.impactType))]

    // Build culturally-aware prompt
    const systemPrompt = `You are analyzing an Indigenous community story for the Empathy Ledger platform.

CORE PRINCIPLES:
- Respect for Indigenous data sovereignty
- Community-led decision making
- Cultural protocol adherence
- Intergenerational knowledge transmission
- Healing and sovereignty focus

PATTERN ANALYSIS DETECTED THESE IMPACT AREAS:
${knownImpactTypes.join(', ')}

YOUR TASK:
1. Extract additional themes not captured by patterns
2. Identify 3-5 most impactful quotes with cultural context
3. Generate a respectful, accurate summary
4. Assess cultural sensitivity level
5. Flag if elder review is needed

GUIDELINES:
- Honor the storyteller's voice and perspective
- Recognize cultural protocols and traditional knowledge
- Identify sovereignty markers (community control, cultural respect)
- Note healing and transformation themes
- Respect intergenerational wisdom

${metadata?.cultural_context ? `CULTURAL CONTEXT: ${metadata.cultural_context}` : ''}`

    try {
      const result = await generateObject({
        model: openai('gpt-4o-mini'), // Fast and cost-effective
        system: systemPrompt,
        prompt: `Analyze this transcript:

${metadata?.title ? `Title: ${metadata.title}` : ''}
${metadata?.storyteller_name ? `Storyteller: ${metadata.storyteller_name}` : ''}

Transcript:
${transcript}

Extract themes, key quotes, and generate a summary that honors the storyteller's voice and cultural context.`,
        schema: TranscriptAnalysisSchema,
        temperature: 0.3, // Lower for more consistent results
      })

      return result.object

    } catch (error: any) {
      console.error('❌ LLM analysis failed:', error)

      // Try to extract data from the error response
      if (error.text && typeof error.text === 'string') {
        try {
          console.log('🔍 Attempting to parse error response text...')
          const parsed = JSON.parse(error.text)

          // Check if it's wrapped in the properties format
          if (parsed.properties) {
            console.log('✅ Found data in properties wrapper, extracting...')
            const extracted = parsed.properties
            return {
              themes: extracted.themes || [],
              cultural_themes: extracted.cultural_themes || [],
              key_quotes: extracted.key_quotes || [],
              summary: extracted.summary || '',
              emotional_tone: extracted.emotional_tone || 'reflective',
              cultural_sensitivity_level: extracted.cultural_sensitivity_level || 'medium',
              requires_elder_review: extracted.requires_elder_review || false,
              key_insights: extracted.key_insights || [],
              related_topics: extracted.related_topics || []
            }
          }
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError)
        }
      }

      // Fallback to basic analysis if AI fails
      return this.generateFallbackAnalysis(transcript, patternInsights)
    }
  }

  /**
   * Fallback analysis if LLM fails
   */
  private generateFallbackAnalysis(transcript: string, patternInsights: any[]) {
    const words = transcript.split(/\s+/).length
    const firstSentences = transcript.split(/[.!?]+/).slice(0, 3).join('. ') + '.'

    return {
      themes: [...new Set(patternInsights.map(i => i.impactType))],
      cultural_themes: patternInsights
        .filter(i => i.impactType === 'cultural_protocol' || i.impactType === 'knowledge_transmission')
        .map(i => i.impactType)
        .slice(0, 5),
      key_quotes: patternInsights
        .slice(0, 5)
        .map(i => ({
          text: i.evidence.quote,
          theme: i.impactType,
          context: i.evidence.context || '',
          impact_score: i.evidence.confidence * 5,
          speaker_insight: `Demonstrates ${i.impactType.replace('_', ' ')}`
        })),
      summary: `This transcript (${words} words) discusses ${firstSentences}`,
      emotional_tone: 'reflective' as const,
      cultural_sensitivity_level: 'medium' as const,
      requires_elder_review: false,
      key_insights: patternInsights.slice(0, 5).map(i => `${i.impactType}: ${i.evidence.quote.substring(0, 100)}...`),
      related_topics: [...new Set(patternInsights.map(i => i.impactType))]
    }
  }
}

// Export singleton instance
export const hybridTranscriptAnalyzer = new HybridTranscriptAnalyzer()
