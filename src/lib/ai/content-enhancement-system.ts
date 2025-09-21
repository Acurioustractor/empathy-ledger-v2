/**
 * Content Enhancement System for Empathy Ledger
 * 
 * Uses AI SDK v5 to analyse and enhance story content while
 * maintaining strict cultural safety protocols and Indigenous
 * data sovereignty principles.
 * 
 * Features:
 * - Story analysis and metadata extraction
 * - Theme identification with cultural context
 * - Emotional resonance analysis
 * - Cultural significance detection
 * - Content summarization
 * - SEO and accessibility improvements
 */

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { culturalSafetyAI, withCulturalSafety } from './cultural-safety-middleware'
import type { Database } from '@/types/database'

// Content analysis schemas
const ThemeAnalysisSchema = z.object({
  primary_themes: z.array(z.string()).max(5),
  cultural_themes: z.array(z.string()).max(3),
  emotional_themes: z.array(z.string()).max(3),
  universal_themes: z.array(z.string()).max(3),
  seasonal_relevance: z.array(z.string()).max(2),
  life_stage_relevance: z.array(z.string()).max(2)
})

const ContentMetadataSchema = z.object({
  summary: z.string().max(500),
  key_messages: z.array(z.string()).max(5),
  emotional_tone: z.enum(['joyful', 'reflective', 'solemn', 'inspiring', 'healing', 'celebratory', 'educational']),
  cultural_significance: z.enum(['low', 'medium', 'high', 'sacred']),
  audience_suitability: z.object({
    children: z.boolean(),
    youth: z.boolean(),
    adults: z.boolean(),
    elders: z.boolean(),
    families: z.boolean()
  }),
  content_warnings: z.array(z.string()).max(3),
  accessibility_features: z.array(z.string()),
  reading_level: z.enum(['elementary', 'middle', 'high_school', 'adult']),
  estimated_impact: z.string().max(200)
})

const CulturalAnalysisSchema = z.object({
  cultural_elements: z.array(z.object({
    element: z.string(),
    significance: z.string(),
    sensitivity_level: z.enum(['low', 'medium', 'high', 'sacred'])
  })).max(10),
  traditional_knowledge_present: z.boolean(),
  ceremonial_content: z.boolean(),
  sacred_elements: z.boolean(),
  community_specific: z.boolean(),
  requires_elder_review: z.boolean(),
  cultural_protocols_needed: z.array(z.string()).max(5),
  appropriate_sharing_contexts: z.array(z.string()).max(5)
})

const SEOEnhancementSchema = z.object({
  suggested_title_variations: z.array(z.string()).max(3),
  meta_description: z.string().max(160),
  keywords: z.array(z.string()).max(10),
  alt_text_suggestions: z.array(z.string()).max(5),
  social_media_snippets: z.object({
    twitter: z.string().max(280),
    facebook: z.string().max(400),
    linkedin: z.string().max(300)
  }),
  accessibility_improvements: z.array(z.string()).max(5)
})

export interface ContentEnhancementRequest {
  story_id: string
  user_id: string
  content: string
  title: string
  existing_metadata?: any
  enhancement_types: ('themes' | 'metadata' | 'cultural' | 'seo' | 'accessibility')[]
  cultural_context?: {
    storyteller_background?: string
    cultural_affiliations?: string[]
    ceremony_type?: string
    seasonal_context?: string
  }
}

export interface EnhancementResult {
  story_id: string
  themes?: z.infer<typeof ThemeAnalysisSchema>
  metadata?: z.infer<typeof ContentMetadataSchema>
  cultural_analysis?: z.infer<typeof CulturalAnalysisSchema>
  seo_enhancement?: z.infer<typeof SEOEnhancementSchema>
  processing_notes: string[]
  cultural_safety_approved: boolean
  requires_elder_review: boolean
  enhancement_timestamp: string
}

export class ContentEnhancementSystem {
  private supabase = createSupabaseServerClient()
  private model = openai('gpt-4o') // Using most capable model for nuanced cultural understanding

  /**
   * Enhance story content with AI analysis while respecting cultural protocols
   */
  async enhanceContent(request: ContentEnhancementRequest): Promise<EnhancementResult> {
    
    return await withCulturalSafety({
      content: request.content,
      user_id: request.user_id,
      context_type: 'story',
      operation: 'enhance'
    }, async () => {
      
      const result: EnhancementResult = {
        story_id: request.story_id,
        processing_notes: [],
        cultural_safety_approved: true,
        requires_elder_review: false,
        enhancement_timestamp: new Date().toISOString()
      }

      // Check cultural safety first
      const safetyCheck = await culturalSafetyAI.analyzeCulturalSafety({
        content: request.content,
        user_id: request.user_id,
        context_type: 'story',
        operation: 'enhance'
      })

      if (!safetyCheck.approved) {
        result.cultural_safety_approved = false
        result.requires_elder_review = safetyCheck.elder_review_required
        result.processing_notes.push('Content requires cultural review before enhancement')
        return result
      }

      // Perform requested enhancements
      try {
        if (request.enhancement_types.includes('themes')) {
          result.themes = await this.analyzeThemes(request)
          result.processing_notes.push('Theme analysis completed')
        }

        if (request.enhancement_types.includes('metadata')) {
          result.metadata = await this.generateMetadata(request)
          result.processing_notes.push('Metadata generation completed')
        }

        if (request.enhancement_types.includes('cultural')) {
          result.cultural_analysis = await this.analyzeCulturalContent(request)
          result.processing_notes.push('Cultural analysis completed')
          
          // Update elder review requirement based on cultural analysis
          if (result.cultural_analysis.requires_elder_review) {
            result.requires_elder_review = true
          }
        }

        if (request.enhancement_types.includes('seo')) {
          result.seo_enhancement = await this.generateSEOEnhancement(request)
          result.processing_notes.push('SEO enhancement completed')
        }

        // Store enhancement results
        await this.storeEnhancementResults(result)

      } catch (error) {
        console.error('Content enhancement error:', error)
        result.processing_notes.push(`Enhancement error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      return result
    })
  }

  /**
   * Batch enhance multiple stories for efficiency
   */
  async batchEnhanceStories(
    storyIds: string[],
    userId: string,
    enhancementTypes: ('themes' | 'metadata' | 'cultural' | 'seo' | 'accessibility')[]
  ): Promise<EnhancementResult[]> {
    
    const results: EnhancementResult[] = []
    
    // Process in small batches to respect API limits
    const batchSize = 5
    for (let i = 0; i < storyIds.length; i += batchSize) {
      const batch = storyIds.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (storyId) => {
        const { data: story } = await this.supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single()

        if (!story) {
          return null
        }

        return this.enhanceContent({
          story_id: storyId,
          user_id: userId,
          content: story.content,
          title: story.title,
          enhancement_types: enhancementTypes
        })
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value)
        }
      })

      // Small delay between batches
      if (i + batchSize < storyIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  private async analyzeThemes(request: ContentEnhancementRequest) {
    const culturalContext = request.cultural_context || {}
    
    const prompt = `Analyze the themes in this Indigenous storytelling platform content with cultural sensitivity.

STORY TITLE: ${request.title}

CULTURAL CONTEXT:
- Storyteller Background: ${culturalContext.storyteller_background || 'Not specified'}
- Cultural Affiliations: ${culturalContext.cultural_affiliations?.join(', ') || 'None'}
- Ceremony Type: ${culturalContext.ceremony_type || 'None'}
- Seasonal Context: ${culturalContext.seasonal_context || 'Any'}

STORY CONTENT:
${request.content}

ANALYSIS REQUIREMENTS:
1. Identify primary themes that drive the narrative
2. Recognize cultural themes specific to Indigenous experiences and worldviews
3. Identify emotional themes that resonate with community healing and connection
4. Find universal themes that bridge cultures while respecting Indigenous perspectives
5. Note seasonal relevance for traditional calendar and ceremony cycles
6. Consider life stage relevance (childhood, coming of age, parenthood, elderhood)

CULTURAL SENSITIVITY GUIDELINES:
- Respect Indigenous knowledge systems and worldviews
- Avoid Western-centric categorizations
- Honor traditional storytelling purposes (teaching, healing, ceremony, entertainment)
- Consider community vs. individual themes appropriately
- Recognize land-based and relationship-centred themes

Extract themes that would help community members find stories relevant to their experiences and cultural needs.`

    const result = await generateObject({
      model: this.model,
      schema: ThemeAnalysisSchema,
      prompt,
      temperature: 0.3
    })

    return result.object
  }

  private async generateMetadata(request: ContentEnhancementRequest) {
    const prompt = `Generate comprehensive metadata for this story from an Indigenous storytelling platform.

TITLE: ${request.title}
CONTENT: ${request.content.substring(0, 3000)}${request.content.length > 3000 ? '...' : ''}

METADATA REQUIREMENTS:
1. Create a respectful, engaging summary that honours the storyteller's voice
2. Identify key messages and teachings within the story
3. Determine appropriate emotional tone using culturally sensitive categories
4. Assess cultural significance level with respect for sacred content
5. Evaluate audience suitability considering Indigenous community values
6. Note any content that might need warnings (trauma, loss, etc.)
7. Suggest accessibility features for diverse community needs
8. Estimate reading level appropriately
9. Describe potential positive impact on readers/community

CULTURAL CONSIDERATIONS:
- Honor storytelling traditions and purposes
- Respect privacy and consent protocols
- Consider intergenerational sharing appropriateness
- Recognize healing and educational value
- Account for ceremonial vs. everyday content
- Consider community building aspects

Generate metadata that helps community members understand the story's value and appropriateness for their needs.`

    const result = await generateObject({
      model: this.model,
      schema: ContentMetadataSchema,
      prompt,
      temperature: 0.4
    })

    return result.object
  }

  private async analyzeCulturalContent(request: ContentEnhancementRequest) {
    const culturalContext = request.cultural_context || {}
    
    const prompt = `Perform deep cultural analysis of this story content with respect for Indigenous protocols and OCAP principles.

TITLE: ${request.title}
STORYTELLER BACKGROUND: ${culturalContext.storyteller_background || 'Not specified'}
CULTURAL AFFILIATIONS: ${culturalContext.cultural_affiliations?.join(', ') || 'None'}

CONTENT:
${request.content}

ANALYSIS FOCUS:
1. Identify specific cultural elements (practices, beliefs, ceremonies, traditions)
2. Assess cultural significance and sensitivity of each element
3. Determine if traditional knowledge is present that belongs to specific communities
4. Identify ceremonial content that might require special protocols
5. Detect sacred elements that need elder oversight
6. Assess if content is community-specific vs. broadly shareable
7. Recommend cultural protocols for appropriate sharing
8. Suggest appropriate contexts for sharing this content

CULTURAL SAFETY PRIORITIES:
- OCAP principles (Ownership, Control, Access, Possession)
- Indigenous data sovereignty
- Respect for sacred and ceremonial content
- Community consent and protocols
- Intergenerational appropriateness
- Protection of traditional knowledge
- Elder review requirements

Provide analysis that ensures respectful, protocol-appropriate handling of this cultural content.`

    const result = await generateObject({
      model: this.model,
      schema: CulturalAnalysisSchema,
      prompt,
      temperature: 0.2 // Lower temperature for cultural analysis consistency
    })

    return result.object
  }

  private async generateSEOEnhancement(request: ContentEnhancementRequest) {
    const prompt = `Generate culturally appropriate SEO enhancements for this Indigenous storytelling platform content.

TITLE: ${request.title}
CONTENT PREVIEW: ${request.content.substring(0, 1000)}

SEO REQUIREMENTS:
1. Suggest title variations that are search-friendly while maintaining cultural respect
2. Create meta descriptions that honour the storyteller and story purpose
3. Identify keywords that help appropriate audiences find this content
4. Suggest alt text that provides meaningful descriptions for accessibility
5. Create social media snippets that respectfully represent the content
6. Recommend accessibility improvements for diverse community needs

CULTURAL GUIDELINES:
- Use respectful, inclusive language
- Avoid exploitative or sensational phrasing
- Include Indigenous terminology when appropriate
- Consider how content should be discovered by intended audiences
- Respect privacy and consent in public descriptions
- Honor storytelling traditions in promotional text

Generate SEO enhancements that increase appropriate discoverability while maintaining cultural respect and storyteller agency.`

    const result = await generateObject({
      model: this.model,
      schema: SEOEnhancementSchema,
      prompt,
      temperature: 0.5
    })

    return result.object
  }

  private async storeEnhancementResults(result: EnhancementResult) {
    try {
      // Store in enhancement results table
      await this.supabase
        .from('content_enhancement_results')
        .upsert({
          story_id: result.story_id,
          themes_analysis: result.themes,
          metadata_analysis: result.metadata,
          cultural_analysis: result.cultural_analysis,
          seo_enhancement: result.seo_enhancement,
          processing_notes: result.processing_notes,
          cultural_safety_approved: result.cultural_safety_approved,
          requires_elder_review: result.requires_elder_review,
          enhanced_at: result.enhancement_timestamp
        })

      // Update the story with enhanced metadata if appropriate
      if (result.cultural_safety_approved && result.themes && result.metadata) {
        const updateData: any = {}
        
        // Update tags with enhanced themes
        if (result.themes.primary_themes) {
          updateData.tags = result.themes.primary_themes
        }
        
        // Update cultural context
        if (result.cultural_analysis) {
          updateData.cultural_context = {
            ...updateData.cultural_context,
            cultural_significance: result.metadata.cultural_significance,
            emotional_tone: result.metadata.emotional_tone,
            cultural_elements: result.cultural_analysis.cultural_elements
          }
        }

        // Update elder review requirement
        if (result.requires_elder_review) {
          updateData.cultural_review_status = 'needs_review'
        }

        await this.supabase
          .from('stories')
          .update(updateData)
          .eq('id', result.story_id)
      }

    } catch (error) {
      console.error('Failed to store enhancement results:', error)
    }
  }

  /**
   * Get enhancement results for a story
   */
  async getEnhancementResults(storyId: string): Promise<EnhancementResult | null> {
    const { data, error } = await this.supabase
      .from('content_enhancement_results')
      .select('*')
      .eq('story_id', storyId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      story_id: data.story_id,
      themes: data.themes_analysis,
      metadata: data.metadata_analysis,
      cultural_analysis: data.cultural_analysis,
      seo_enhancement: data.seo_enhancement,
      processing_notes: data.processing_notes,
      cultural_safety_approved: data.cultural_safety_approved,
      requires_elder_review: data.requires_elder_review,
      enhancement_timestamp: data.enhanced_at
    }
  }

  /**
   * Generate story summary for quick previews
   */
  async generateStorySummary(
    content: string,
    maxLength: number = 200,
    culturalContext?: any
  ): Promise<string> {
    const prompt = `Create a respectful, engaging summary of this Indigenous story content.

CULTURAL CONTEXT: ${culturalContext ? JSON.stringify(culturalContext) : 'General community story'}
MAX LENGTH: ${maxLength} characters

CONTENT:
${content.substring(0, 2000)}

SUMMARY GUIDELINES:
- Honor the storyteller's voice and purpose
- Capture the main message or teaching
- Use respectful, inclusive language
- Maintain cultural sensitivity
- Create interest while respecting sacred elements
- Focus on community value and relevance

Generate a summary that helps community members understand the story's value.`

    const result = await generateText({
      model: this.model,
      prompt,
      temperature: 0.4,
      maxTokens: Math.max(50, Math.floor(maxLength / 3)) // Rough token estimate
    })

    // Ensure we don't exceed the character limit
    const summary = result.text.trim()
    return summary.length <= maxLength ? summary : summary.substring(0, maxLength - 3) + '...'
  }

  /**
   * Extract key quotes from story content
   */
  async extractKeyQuotes(content: string, maxQuotes: number = 3): Promise<string[]> {
    const prompt = `Extract the most meaningful and quotable passages from this story content.

CONTENT:
${content}

REQUIREMENTS:
- Select ${maxQuotes} powerful, standalone quotes
- Choose passages that capture key messages or beautiful expressions
- Ensure quotes are respectful and appropriate for sharing
- Focus on wisdom, inspiration, or emotional resonance
- Respect cultural sensitivity and storyteller intent

Return only the quotes, one per line, without quotation marks.`

    const result = await generateText({
      model: this.model,
      prompt,
      temperature: 0.3,
      maxTokens: 300
    })

    return result.text.trim().split('\n').filter(quote => quote.trim().length > 0).slice(0, maxQuotes)
  }
}

// Export singleton instance
export const contentEnhancementSystem = new ContentEnhancementSystem()

// Helper functions for common enhancement operations
export async function enhanceStoryThemes(
  storyId: string,
  userId: string
): Promise<z.infer<typeof ThemeAnalysisSchema> | null> {
  const { data: story } = await contentEnhancementSystem['supabase']
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single()

  if (!story) return null

  const result = await contentEnhancementSystem.enhanceContent({
    story_id: storyId,
    user_id: userId,
    content: story.content,
    title: story.title,
    enhancement_types: ['themes']
  })

  return result.themes || null
}

export async function generateStoryMetadata(
  storyId: string,
  userId: string
): Promise<z.infer<typeof ContentMetadataSchema> | null> {
  const { data: story } = await contentEnhancementSystem['supabase']
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single()

  if (!story) return null

  const result = await contentEnhancementSystem.enhanceContent({
    story_id: storyId,
    user_id: userId,
    content: story.content,
    title: story.title,
    enhancement_types: ['metadata']
  })

  return result.metadata || null
}