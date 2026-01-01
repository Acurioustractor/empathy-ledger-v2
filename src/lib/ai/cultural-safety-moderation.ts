/**
 * Cultural Safety Moderation System for Empathy Ledger
 * 
 * Advanced AI-powered moderation system that detects sensitive content,
 * manages elder review workflows, and ensures all content respects
 * Indigenous cultural protocols and OCAP principles.
 * 
 * Features:
 * - Sacred content detection
 * - Elder review queue management
 * - Cultural protocol enforcement
 * - Community oversight workflows
 * - Automated flagging and routing
 * - Transparent decision making
 */

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { culturalSafetyAI } from './cultural-safety-middleware'
import type { Database } from '@/types/database'

// Moderation schemas
const ModerationResultSchema = z.object({
  status: z.enum(['approved', 'flagged', 'blocked', 'elder_review_required']),
  confidence_level: z.number().min(0).max(1),
  detected_issues: z.array(z.object({
    type: z.enum(['sacred_content', 'ceremonial_protocol', 'traditional_knowledge', 'cultural_appropriation', 'sensitive_topic', 'consent_issue']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    recommendation: z.string()
  })),
  cultural_elements: z.array(z.object({
    element: z.string(),
    cultural_group: z.string().optional(),
    sensitivity_level: z.enum(['public', 'community', 'restricted', 'sacred']),
    requires_consultation: z.boolean()
  })),
  recommended_actions: z.array(z.string()),
  elder_review_priority: z.enum(['low', 'medium', 'high', 'urgent']),
  community_oversight_needed: z.boolean()
})

const ElderReviewAssignmentSchema = z.object({
  recommended_elders: z.array(z.object({
    elder_id: z.string(),
    cultural_expertise: z.array(z.string()),
    availability_score: z.number().min(0).max(1),
    reasoning: z.string()
  })),
  urgency_level: z.enum(['routine', 'important', 'urgent', 'critical']),
  estimated_review_time: z.string(),
  cultural_protocols_needed: z.array(z.string())
})

export interface ModerationRequest {
  content_id: string
  content_type: 'story' | 'profile' | 'media' | 'comment' | 'gallery'
  content: string
  title?: string
  author_id: string
  cultural_context?: {
    storyteller_background?: string
    cultural_affiliations?: string[]
    ceremony_type?: string
    traditional_territory?: string
  }
  submission_context: 'new_submission' | 'edit' | 'republication' | 'appeal'
}

export interface ModerationResult {
  request_id: string
  content_id: string
  status: 'approved' | 'flagged' | 'blocked' | 'elder_review_required'
  moderation_details: z.infer<typeof ModerationResultSchema>
  elder_assignment?: z.infer<typeof ElderReviewAssignmentSchema>
  review_deadline?: string
  appeals_available: boolean
  moderated_at: string
  moderated_by: 'ai_system' | string // elder ID if manually reviewed
}

export interface ElderReviewItem {
  id: string
  content_id: string
  content_type: string
  title: string
  content_preview: string
  cultural_issues: any[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_elder_id?: string
  assigned_at?: string
  due_date: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_consultation'
  community_input_required: boolean
}

export class CulturalSafetyModerationSystem {
  private get supabase() { return createSupabaseServerClient() }
  private model = openai('gpt-4o') // Using most capable model for nuanced moderation

  /**
   * Moderate content for cultural safety and protocol compliance
   */
  async moderateContent(request: ModerationRequest): Promise<ModerationResult> {
    try {
      // Perform AI-based cultural safety analysis
      const moderationAnalysis = await this.performModerationAnalysis(request)
      
      // Determine if elder review is required
      const requiresElderReview = this.determineElderReviewRequirement(moderationAnalysis)
      
      let elderAssignment: z.infer<typeof ElderReviewAssignmentSchema> | undefined
      let reviewDeadline: string | undefined

      if (requiresElderReview) {
        elderAssignment = await this.assignElderReviewer(request, moderationAnalysis)
        reviewDeadline = this.calculateReviewDeadline(elderAssignment.urgency_level)
      }

      const result: ModerationResult = {
        request_id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content_id: request.content_id,
        status: requiresElderReview ? 'elder_review_required' : moderationAnalysis.status,
        moderation_details: moderationAnalysis,
        elder_assignment: elderAssignment,
        review_deadline: reviewDeadline,
        appeals_available: moderationAnalysis.status !== 'approved',
        moderated_at: new Date().toISOString(),
        moderated_by: 'ai_system'
      }

      // Store moderation result
      await this.storeModerationResult(result)

      // Create elder review item if needed
      if (requiresElderReview) {
        await this.createElderReviewItem(request, result)
      }

      // Send notifications if required
      await this.sendModerationNotifications(result)

      return result

    } catch (error) {
      console.error('Moderation system error:', error)
      
      // Fail-safe: require elder review on error
      return {
        request_id: `mod_error_${Date.now()}`,
        content_id: request.content_id,
        status: 'elder_review_required',
        moderation_details: {
          status: 'elder_review_required',
          confidence_level: 0,
          detected_issues: [{
            type: 'consent_issue',
            severity: 'critical',
            description: 'Moderation system error - requires manual review',
            recommendation: 'Full elder review recommended due to system error'
          }],
          cultural_elements: [],
          recommended_actions: ['Immediate elder consultation required'],
          elder_review_priority: 'urgent',
          community_oversight_needed: true
        },
        appeals_available: true,
        moderated_at: new Date().toISOString(),
        moderated_by: 'ai_system'
      }
    }
  }

  /**
   * Get elder review queue for a specific elder
   */
  async getElderReviewQueue(elderId: string): Promise<ElderReviewItem[]> {
    const { data: reviewItems, error } = await this.supabase
      .from('elder_review_queue')
      .select(`
        *,
        content:stories(title, content, storyteller:storytellers(display_name))
      `)
      .or(`assigned_elder_id.eq.${elderId},assigned_elder_id.is.null`)
      .in('status', ['pending', 'in_review'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching elder review queue:', error)
      return []
    }

    return reviewItems?.map(item => ({
      id: item.id,
      content_id: item.content_id,
      content_type: item.content_type,
      title: item.content?.title || 'Untitled',
      content_preview: item.content?.content?.substring(0, 300) || '',
      cultural_issues: item.cultural_issues || [],
      priority: item.priority,
      assigned_elder_id: item.assigned_elder_id,
      assigned_at: item.assigned_at,
      due_date: item.due_date,
      status: item.status,
      community_input_required: item.community_input_required || false
    })) || []
  }

  /**
   * Submit elder review decision
   */
  async submitElderReviewDecision(
    reviewId: string,
    elderId: string,
    decision: 'approved' | 'rejected' | 'needs_consultation',
    notes: string,
    conditions?: string[]
  ): Promise<boolean> {
    try {
      // Update the review item
      const { error: updateError } = await this.supabase
        .from('elder_review_queue')
        .update({
          status: decision,
          reviewed_by: elderId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
          review_conditions: conditions || []
        })
        .eq('id', reviewId)

      if (updateError) {
        console.error('Error updating elder review:', updateError)
        return false
      }

      // Get the review item to update the original content
      const { data: reviewItem } = await this.supabase
        .from('elder_review_queue')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (reviewItem) {
        // Update the original content status
        await this.updateContentAfterElderReview(
          reviewItem.content_id,
          reviewItem.content_type,
          decision,
          elderId,
          notes
        )

        // Send notifications
        await this.sendElderDecisionNotifications(reviewItem, decision, elderId)
      }

      return true

    } catch (error) {
      console.error('Error submitting elder review decision:', error)
      return false
    }
  }

  /**
   * Get moderation statistics for dashboard
   */
  async getModerationStats(timeframe: 'day' | 'week' | 'month' = 'week') {
    const startDate = new Date()
    if (timeframe === 'day') {
      startDate.setDate(startDate.getDate() - 1)
    } else if (timeframe === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    const { data: stats, error } = await this.supabase
      .from('moderation_results')
      .select('status, created_at')
      .gte('created_at', startDate.toISOString())

    if (error || !stats) {
      return {
        total_reviewed: 0,
        approved: 0,
        flagged: 0,
        blocked: 0,
        elder_review_required: 0,
        pending_elder_review: 0
      }
    }

    const approved = stats.filter(s => s.status === 'approved').length
    const flagged = stats.filter(s => s.status === 'flagged').length
    const blocked = stats.filter(s => s.status === 'blocked').length
    const elderRequired = stats.filter(s => s.status === 'elder_review_required').length

    // Get pending elder reviews
    const { data: pendingReviews } = await this.supabase
      .from('elder_review_queue')
      .select('id')
      .in('status', ['pending', 'in_review'])

    return {
      total_reviewed: stats.length,
      approved,
      flagged,
      blocked,
      elder_review_required: elderRequired,
      pending_elder_review: pendingReviews?.length || 0
    }
  }

  private async performModerationAnalysis(request: ModerationRequest) {
    const culturalContext = request.cultural_context || {}
    
    const prompt = `Perform comprehensive cultural safety moderation of this content for an Indigenous storytelling platform.

CONTENT TYPE: ${request.content_type}
SUBMISSION CONTEXT: ${request.submission_context}
AUTHOR CULTURAL BACKGROUND: ${culturalContext.storyteller_background || 'Not specified'}
CULTURAL AFFILIATIONS: ${culturalContext.cultural_affiliations?.join(', ') || 'None'}
TRADITIONAL TERRITORY: ${culturalContext.traditional_territory || 'Not specified'}
CEREMONY TYPE: ${culturalContext.ceremony_type || 'None'}

TITLE: ${request.title || 'Untitled'}

CONTENT:
${request.content.substring(0, 4000)}${request.content.length > 4000 ? '...' : ''}

MODERATION CRITERIA:
1. Sacred Content Detection - Identify content that requires special protocols
2. Ceremonial Protocol Compliance - Check for appropriate handling of ceremonies
3. Traditional Knowledge Protection - Ensure community ownership is respected  
4. Cultural Appropriation Prevention - Flag inappropriate cultural representation
5. Sensitive Topics - Handle trauma, loss, and difficult subjects appropriately
6. Consent and Privacy - Ensure all sharing respects individual and community consent

INDIGENOUS PROTOCOLS TO CONSIDER:
- OCAP principles (Ownership, Control, Access, Possession)
- Elder approval requirements for sacred content
- Community consultation for traditional knowledge
- Seasonal and ceremonial appropriateness
- Intergenerational sharing protocols
- Cultural sensitivity levels and access restrictions

ASSESSMENT REQUIREMENTS:
- Identify specific cultural elements and their sensitivity levels
- Determine if elder review is required and at what priority level
- Recommend appropriate actions for any issues found
- Consider community oversight needs
- Provide clear reasoning for all determinations

Provide comprehensive analysis that ensures respectful, protocol-appropriate content sharing.`

    const result = await generateObject({
      model: this.model,
      schema: ModerationResultSchema,
      prompt,
      temperature: 0.1 // Very low temperature for consistent moderation decisions
    })

    return result.object
  }

  private determineElderReviewRequirement(analysis: z.infer<typeof ModerationResultSchema>): boolean {
    // Elder review required if:
    // 1. AI explicitly recommends it
    // 2. Sacred content is detected
    // 3. Critical issues are found
    // 4. High-sensitivity cultural elements are present
    
    if (analysis.status === 'elder_review_required') {
      return true
    }

    const hasCriticalIssues = analysis.detected_issues.some(issue => issue.severity === 'critical')
    const hasSacredContent = analysis.cultural_elements.some(element => element.sensitivity_level === 'sacred')
    const requiresConsultation = analysis.cultural_elements.some(element => element.requires_consultation)

    return hasCriticalIssues || hasSacredContent || requiresConsultation || analysis.community_oversight_needed
  }

  private async assignElderReviewer(
    request: ModerationRequest,
    analysis: z.infer<typeof ModerationResultSchema>
  ) {
    // Get available elders with relevant cultural expertise
    const culturalAffiliations = request.cultural_context?.cultural_affiliations || []
    
    const { data: availableElders } = await this.supabase
      .from('profiles')
      .select('id, display_name, cultural_affiliations, cultural_background, community_roles')
      .eq('is_elder', true)
      .eq('profile_visibility', 'public')

    if (!availableElders || availableElders.length === 0) {
      // Fallback - get any elder
      const { data: anyElders } = await this.supabase
        .from('profiles')
        .select('id, display_name, cultural_affiliations, cultural_background')
        .eq('is_elder', true)
        .limit(3)

      if (!anyElders) {
        throw new Error('No elders available for review')
      }
    }

    const prompt = `Recommend the most appropriate elders for reviewing this cultural content.

CONTENT CONTEXT:
- Cultural Affiliations: ${culturalAffiliations.join(', ')}
- Cultural Issues Detected: ${analysis.detected_issues.map(i => i.description).join('; ')}
- Cultural Elements: ${analysis.cultural_elements.map(e => `${e.element} (${e.sensitivity_level})`).join('; ')}
- Review Priority: ${analysis.elder_review_priority}

AVAILABLE ELDERS:
${(availableElders || []).map(elder => 
  `ID: ${elder.id}
   Name: ${elder.display_name}
   Cultural Background: ${elder.cultural_background || 'Not specified'}
   Cultural Affiliations: ${elder.cultural_affiliations?.join(', ') || 'None'}
   Community Roles: ${elder.community_roles?.join(', ') || 'None'}
   ---`
).join('\n')}

ASSIGNMENT CRITERIA:
1. Cultural expertise alignment with content
2. Cultural affiliation matches when relevant
3. Experience with similar review types
4. Current availability and workload
5. Community respect and authority

Select the most appropriate elders for this review, considering cultural protocols and expertise needs.`

    const result = await generateObject({
      model: this.model,
      schema: ElderReviewAssignmentSchema,
      prompt,
      temperature: 0.2
    })

    return result.object
  }

  private calculateReviewDeadline(urgency: string): string {
    const now = new Date()
    
    switch (urgency) {
      case 'critical':
        now.setHours(now.getHours() + 24) // 1 day
        break
      case 'urgent':
        now.setDate(now.getDate() + 3) // 3 days
        break
      case 'important':
        now.setDate(now.getDate() + 7) // 1 week
        break
      default: // routine
        now.setDate(now.getDate() + 14) // 2 weeks
        break
    }

    return now.toISOString()
  }

  private async storeModerationResult(result: ModerationResult) {
    await this.supabase
      .from('moderation_results')
      .insert({
        id: result.request_id,
        content_id: result.content_id,
        status: result.status,
        moderation_details: result.moderation_details,
        elder_assignment: result.elder_assignment,
        review_deadline: result.review_deadline,
        appeals_available: result.appeals_available,
        moderated_by: result.moderated_by
      })
  }

  private async createElderReviewItem(request: ModerationRequest, result: ModerationResult) {
    const priority = result.elder_assignment?.urgency_level === 'critical' ? 'urgent' :
                     result.elder_assignment?.urgency_level === 'urgent' ? 'high' :
                     result.elder_assignment?.urgency_level === 'important' ? 'medium' : 'low'

    await this.supabase
      .from('elder_review_queue')
      .insert({
        content_id: request.content_id,
        content_type: request.content_type,
        cultural_issues: result.moderation_details.detected_issues,
        priority,
        assigned_elder_id: result.elder_assignment?.recommended_elders[0]?.elder_id,
        due_date: result.review_deadline,
        status: 'pending',
        community_input_required: result.moderation_details.community_oversight_needed
      })
  }

  private async sendModerationNotifications(result: ModerationResult) {
    // Implementation for sending notifications to authors, elders, etc.
    // This would integrate with your notification system
    console.log(`Moderation notification: ${result.content_id} - ${result.status}`)
  }

  private async sendElderDecisionNotifications(
    reviewItem: any,
    decision: string,
    elderId: string
  ) {
    // Implementation for notifying authors about elder decisions
    console.log(`Elder decision notification: ${reviewItem.content_id} - ${decision} by ${elderId}`)
  }

  private async updateContentAfterElderReview(
    contentId: string,
    contentType: string,
    decision: string,
    elderId: string,
    notes: string
  ) {
    const tableName = this.getTableNameForContentType(contentType)
    
    const updateData: any = {
      cultural_review_status: decision === 'approved' ? 'approved' : 'rejected',
      elder_approved_by: decision === 'approved' ? elderId : null,
      elder_approval: decision === 'approved',
      elder_approval_date: new Date().toISOString(),
      cultural_review_notes: notes
    }

    await this.supabase
      .from(tableName)
      .update(updateData)
      .eq('id', contentId)
  }

  private getTableNameForContentType(contentType: string): string {
    switch (contentType) {
      case 'story': return 'stories'
      case 'media': return 'media_assets'
      case 'gallery': return 'galleries'
      case 'profile': return 'profiles'
      default: return 'stories'
    }
  }
}

// Export singleton instance
export const culturalSafetyModerationSystem = new CulturalSafetyModerationSystem()

// Helper functions for common moderation operations
export async function moderateStory(storyId: string, authorId: string): Promise<ModerationResult> {
  const { data: story } = await culturalSafetyModerationSystem['supabase']
    .from('stories')
    .select(`
      *,
      storyteller:storytellers(cultural_background, profile:profiles(cultural_affiliations))
    `)
    .eq('id', storyId)
    .single()

  if (!story) {
    throw new Error('Story not found')
  }

  return culturalSafetyModerationSystem.moderateContent({
    content_id: storyId,
    content_type: 'story',
    content: story.content,
    title: story.title,
    author_id: authorId,
    cultural_context: {
      storyteller_background: story.storyteller?.cultural_background,
      cultural_affiliations: story.storyteller?.profile?.cultural_affiliations
    },
    submission_context: 'new_submission'
  })
}

export async function getElderReviewQueue(elderId: string): Promise<ElderReviewItem[]> {
  return culturalSafetyModerationSystem.getElderReviewQueue(elderId)
}

export async function submitElderReview(
  reviewId: string,
  elderId: string,
  decision: 'approved' | 'rejected' | 'needs_consultation',
  notes: string,
  conditions?: string[]
): Promise<boolean> {
  return culturalSafetyModerationSystem.submitElderReviewDecision(
    reviewId,
    elderId,
    decision,
    notes,
    conditions
  )
}