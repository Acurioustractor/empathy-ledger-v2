/**
 * Cultural Safety AI Middleware for Empathy Ledger
 * 
 * Implements OCAP (Ownership, Control, Access, Possession) principles
 * and Indigenous data sovereignty protocols for all AI operations.
 * 
 * This middleware ensures:
 * - Elder approval for sensitive cultural content
 * - Sacred content detection and protection
 * - Cultural protocol compliance
 * - Transparent AI decision making
 * - Community oversight capabilities
 */

import { openai } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import type { Database } from '@/types/database'

export interface CulturalContext {
  sensitivity_level: 'low' | 'medium' | 'high'
  sacred_content: boolean
  ceremonial_content: boolean
  traditional_knowledge: boolean
  requires_elder_approval: boolean
  cultural_affiliations?: string[]
  protocols?: string[]
}

export interface CulturalSafetyResult {
  approved: boolean
  safety_level: 'safe' | 'review_required' | 'blocked'
  detected_concerns: string[]
  elder_review_required: boolean
  recommendations: string[]
  cultural_context: CulturalContext
}

export interface AIRequest {
  content: string
  user_id: string
  context_type: 'story' | 'profile' | 'media' | 'search'
  cultural_metadata?: CulturalContext
  operation: 'analyse' | 'generate' | 'enhance' | 'recommend'
}

export class CulturalSafetyAI {
  private supabase = createSupabaseServerClient()
  private model = openai('gpt-4o-mini') // Using more cost-effective model for safety checks

  /**
   * Analyze content for cultural safety before AI processing
   */
  async analyzeCulturalSafety(request: AIRequest): Promise<CulturalSafetyResult> {
    try {
      // Get user's cultural context
      const userContext = await this.getUserCulturalContext(request.user_id)
      
      // Perform AI-based cultural safety analysis
      const aiAnalysis = await this.performAIAnalysis(request, userContext)
      
      // Check against community protocols
      const protocolCheck = await this.checkCommunityProtocols(request, userContext)
      
      // Determine if elder review is required
      const elderReviewRequired = await this.requiresElderReview(aiAnalysis, protocolCheck)
      
      // Combine results
      const result: CulturalSafetyResult = {
        approved: !elderReviewRequired && aiAnalysis.safety_level === 'safe',
        safety_level: elderReviewRequired ? 'review_required' : aiAnalysis.safety_level,
        detected_concerns: [...aiAnalysis.concerns, ...protocolCheck.violations],
        elder_review_required: elderReviewRequired,
        recommendations: [...aiAnalysis.recommendations, ...protocolCheck.recommendations],
        cultural_context: {
          ...request.cultural_metadata,
          sensitivity_level: aiAnalysis.sensitivity_level,
          sacred_content: aiAnalysis.sacred_content,
          ceremonial_content: aiAnalysis.ceremonial_content,
          traditional_knowledge: aiAnalysis.traditional_knowledge,
          requires_elder_approval: elderReviewRequired,
          cultural_affiliations: userContext.cultural_affiliations,
          protocols: protocolCheck.applicable_protocols
        }
      }

      // Log the safety check for audit trail
      await this.logSafetyCheck(request, result)

      return result
    } catch (error) {
      console.error('Cultural safety analysis failed:', error)
      
      // Fail safe: require review on error
      return {
        approved: false,
        safety_level: 'review_required',
        detected_concerns: ['Analysis error - requires manual review'],
        elder_review_required: true,
        recommendations: ['Manual cultural safety review required due to system error'],
        cultural_context: {
          sensitivity_level: 'high',
          sacred_content: true,
          ceremonial_content: true,
          traditional_knowledge: true,
          requires_elder_approval: true
        }
      }
    }
  }

  /**
   * Create culturally safe AI prompt with appropriate context
   */
  async createCulturallySafePrompt(
    basePrompt: string, 
    culturalContext: CulturalContext,
    operation: string
  ): Promise<string> {
    const safetyInstructions = `
CULTURAL SAFETY INSTRUCTIONS:
- Respect Indigenous protocols and cultural sensitivity (level: ${culturalContext.sensitivity_level})
- ${culturalContext.sacred_content ? 'SACRED CONTENT DETECTED - Handle with extreme care' : ''}
- ${culturalContext.ceremonial_content ? 'CEREMONIAL CONTENT - Respect traditional protocols' : ''}
- ${culturalContext.traditional_knowledge ? 'TRADITIONAL KNOWLEDGE - Community ownership applies' : ''}
- Cultural affiliations: ${culturalContext.cultural_affiliations?.join(', ') || 'None specified'}
- Always defer to community elders and cultural authorities
- Avoid assumptions about cultural practices
- Use respectful, inclusive language
- Acknowledge cultural ownership and sovereignty
- If unsure about cultural appropriateness, recommend elder consultation

OPERATION: ${operation}
SAFETY LEVEL: ${culturalContext.sensitivity_level}
${culturalContext.protocols?.length ? `PROTOCOLS TO FOLLOW: ${culturalContext.protocols.join(', ')}` : ''}

ORIGINAL REQUEST:
${basePrompt}

Please proceed with cultural sensitivity and respect for Indigenous protocols.`

    return safetyInstructions
  }

  /**
   * Execute AI operation with cultural safety monitoring
   */
  async executeSafeAIOperation(
    prompt: string,
    safetyResult: CulturalSafetyResult,
    options: {
      streaming?: boolean
      maxTokens?: number
      temperature?: number
    } = {}
  ) {
    if (!safetyResult.approved) {
      throw new Error(`AI operation blocked: ${safetyResult.detected_concerns.join(', ')}`)
    }

    const safePrompt = await this.createCulturallySafePrompt(
      prompt,
      safetyResult.cultural_context,
      'AI Enhancement'
    )

    const modelConfig = {
      model: this.model,
      prompt: safePrompt,
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.3, // Lower temperature for more consistent cultural safety
    }

    if (options.streaming) {
      return streamText(modelConfig)
    } else {
      return generateText(modelConfig)
    }
  }

  private async getUserCulturalContext(userId: string) {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('cultural_affiliations, cultural_background, cultural_protocols, is_elder, traditional_knowledge_keeper')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return {
        cultural_affiliations: [],
        cultural_background: null,
        cultural_protocols: [],
        is_elder: false,
        traditional_knowledge_keeper: false
      }
    }

    return profile
  }

  private async performAIAnalysis(request: AIRequest, userContext: any) {
    const analysisPrompt = `
Analyze the following content for Indigenous cultural safety and sensitivity.
Consider OCAP principles (Ownership, Control, Access, Possession).

Content Type: ${request.context_type}
Operation: ${request.operation}
User Cultural Background: ${userContext.cultural_background || 'Not specified'}
User Cultural Affiliations: ${userContext.cultural_affiliations?.join(', ') || 'None'}
User is Elder: ${userContext.is_elder ? 'Yes' : 'No'}
User is Traditional Knowledge Keeper: ${userContext.traditional_knowledge_keeper ? 'Yes' : 'No'}

Content to analyse:
"${request.content.substring(0, 2000)}${request.content.length > 2000 ? '...' : ''}"

Provide analysis in this exact JSON format:
{
  "safety_level": "safe" | "review_required" | "blocked",
  "sensitivity_level": "low" | "medium" | "high",
  "sacred_content": boolean,
  "ceremonial_content": boolean,
  "traditional_knowledge": boolean,
  "concerns": ["list of specific concerns"],
  "recommendations": ["list of specific recommendations"]
}

Focus on:
- Sacred or ceremonial references that might require elder approval
- Traditional knowledge that belongs to specific communities
- Cultural representations that could be inappropriate
- Content that might violate Indigenous protocols
- Sensitive cultural practices or beliefs`

    const result = await generateText({
      model: this.model,
      prompt: analysisPrompt,
      temperature: 0.1, // Very low temperature for consistent safety analysis
      maxTokens: 1000
    })

    try {
      const analysis = JSON.parse(result.text)
      return analysis
    } catch (parseError) {
      console.error('Failed to parse AI safety analysis:', parseError)
      // Return conservative default
      return {
        safety_level: 'review_required',
        sensitivity_level: 'high',
        sacred_content: true,
        ceremonial_content: true,
        traditional_knowledge: true,
        concerns: ['Failed to parse safety analysis - requires manual review'],
        recommendations: ['Manual cultural safety review required']
      }
    }
  }

  private async checkCommunityProtocols(request: AIRequest, userContext: any) {
    // Check against stored community protocols in the database
    const { data: protocols } = await this.supabase
      .from('cultural_tags')
      .select('*')
      .eq('cultural_sensitivity_level', 'high')
      .eq('requires_elder_approval', true)

    const violations: string[] = []
    const recommendations: string[] = []
    const applicable_protocols: string[] = []

    // Check if content might relate to high-sensitivity cultural tags
    const contentLower = request.content.toLowerCase()
    
    protocols?.forEach(protocol => {
      if (contentLower.includes(protocol.name.toLowerCase()) || 
          protocol.appropriate_contexts?.some(context => contentLower.includes(context.toLowerCase()))) {
        applicable_protocols.push(protocol.name)
        
        if (protocol.requires_elder_approval && !userContext.is_elder) {
          violations.push(`Content may reference ${protocol.name} which requires elder approval`)
          recommendations.push(`Consult with community elders regarding ${protocol.name}`)
        }
      }
    })

    return {
      violations,
      recommendations,
      applicable_protocols
    }
  }

  private async requiresElderReview(aiAnalysis: any, protocolCheck: any): Promise<boolean> {
    return aiAnalysis.sacred_content || 
           aiAnalysis.traditional_knowledge || 
           aiAnalysis.safety_level === 'blocked' ||
           protocolCheck.violations.length > 0
  }

  private async logSafetyCheck(request: AIRequest, result: CulturalSafetyResult) {
    try {
      // Log to audit table for transparency and oversight
      await this.supabase
        .from('ai_safety_logs')
        .insert({
          user_id: request.user_id,
          operation: request.operation,
          context_type: request.context_type,
          content_preview: request.content.substring(0, 500),
          safety_result: result,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to log safety check:', error)
      // Don't throw - logging failure shouldn't block the operation
    }
  }

  /**
   * Check if user has permission to perform specific AI operations
   */
  async checkUserPermissions(userId: string, operation: string): Promise<boolean> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('cultural_permissions')
      .eq('id', userId)
      .single()

    if (!profile?.cultural_permissions) {
      return true // Default allow for basic operations
    }

    const permissions = profile.cultural_permissions as any
    
    // Check specific operation permissions
    switch (operation) {
      case 'enhance':
        return permissions.allow_ai_enhancement !== false
      case 'generate':
        return permissions.allow_ai_generation !== false
      case 'analyse':
        return permissions.allow_ai_analysis !== false
      default:
        return true
    }
  }

  /**
   * Get elder approval status for specific content
   */
  async getElderApprovalStatus(contentId: string, contentType: string) {
    const tableName = contentType === 'story' ? 'stories' : 
                     contentType === 'media' ? 'media_assets' : 'galleries'
    
    const { data, error } = await this.supabase
      .from(tableName)
      .select('elder_approval, elder_approved_by, cultural_review_status')
      .eq('id', contentId)
      .single()

    if (error || !data) {
      return { approved: false, reviewer: null, status: 'unknown' }
    }

    return {
      approved: data.elder_approval === true,
      reviewer: data.elder_approved_by,
      status: data.cultural_review_status
    }
  }
}

// Export singleton instance
export const culturalSafetyAI = new CulturalSafetyAI()

// Export helper function for middleware
export async function withCulturalSafety<T>(
  request: AIRequest,
  operation: () => Promise<T>
): Promise<T> {
  // Check user permissions
  const hasPermission = await culturalSafetyAI.checkUserPermissions(request.user_id, request.operation)
  if (!hasPermission) {
    throw new Error('User does not have permission for this AI operation')
  }

  // Perform cultural safety analysis
  const safetyResult = await culturalSafetyAI.analyzeCulturalSafety(request)
  
  if (!safetyResult.approved) {
    throw new Error(`AI operation requires ${safetyResult.elder_review_required ? 'elder' : 'cultural'} review: ${safetyResult.detected_concerns.join(', ')}`)
  }

  // Execute the operation with monitoring
  return await operation()
}