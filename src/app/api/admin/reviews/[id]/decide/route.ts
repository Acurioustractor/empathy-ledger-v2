export const dynamic = 'force-dynamic'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import {
  notifyStoryApproved,
  notifyStoryPublished,
  notifyChangesRequested,
  notifyStoryRejected,
  notifyElderEscalation,
  logEmailNotification,
  type EmailTemplateType
} from '@/lib/services/email-notification.service'

type ReviewDecisionType = 'approve' | 'reject' | 'request_changes' | 'escalate_to_elder' | 'flag_content'

interface ReviewDecision {
  type: ReviewDecisionType
  reason: string
  notes: string
  changes_requested?: string[]
  elder_consultation_reason?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id: reviewId } = await params
    const decision: ReviewDecision = await request.json()

    // Use the authenticated admin's ID from auth context
    const reviewerId = authResult.user?.id || 'system'

    const supabase = await createSupabaseServerClient()

    console.log('📝 Processing review decision:', { reviewId, decision: decision.type })

    // Get the story/content being reviewed with author details
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select(`
        *,
        author:author_id (
          id,
          email,
          display_name
        )
      `)
      .eq('id', reviewId)
      .single()

    if (fetchError || !story) {
      console.error('Story not found:', fetchError)
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const baseUpdateData = {
      updated_at: new Date().toISOString(),
      review_notes: decision.notes
    }

    const decisionConfig: Record<
      ReviewDecisionType,
      { status: string; culturalStatus: string; extraData: any }
    > = {
      approve: {
        status: 'published',
        culturalStatus: 'approved',
        extraData: { reviewed_at: now, reviewed_by: reviewerId }
      },
      reject: {
        status: 'rejected',
        culturalStatus: 'rejected',
        extraData: { reviewed_at: now, reviewed_by: reviewerId, rejection_reason: decision.reason }
      },
      request_changes: {
        status: 'needs_revision',
        culturalStatus: 'changes_requested',
        extraData: {
          reviewed_at: now,
          reviewed_by: reviewerId,
          requested_changes: decision.changes_requested
        }
      },
      escalate_to_elder: {
        status: 'elder_review',
        culturalStatus: 'escalated',
        extraData: {
          escalated_at: now,
          escalated_by: reviewerId,
          escalation_reason: decision.elder_consultation_reason
        }
      },
      flag_content: {
        status: 'flagged',
        culturalStatus: 'flagged',
        extraData: { flagged_at: now, flagged_by: reviewerId, flag_reason: decision.reason }
      }
    }

    const config = decisionConfig[decision.type]
    if (!config) {
      return NextResponse.json({ error: 'Invalid review decision type' }, { status: 400 })
    }

    const newStatus = config.status
    const updateData = {
      ...baseUpdateData,
      status: config.status,
      cultural_review_status: config.culturalStatus,
      ...config.extraData
    }

    console.log(`Processing review: ${decision.type} for story: ${story.title}`)

    // Update the story with the review decision
    const { error: updateError } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', reviewId)

    if (updateError) {
      console.error('Failed to update story:', updateError)
      return NextResponse.json(
        { error: 'Failed to update content status' },
        { status: 500 }
      )
    }

    // Create review history record
    await supabase.from('story_status_history').insert({
      story_id: reviewId,
      status: newStatus,
      changed_by: reviewerId,
      notes: decision.notes,
      created_at: new Date().toISOString()
    })

    let emailSent = false
    let elderNotified = false

    if (story.author) {
      const notificationData = {
        storyId: story.id,
        storyTitle: story.title,
        storySlug: story.slug,
        authorName: story.author.display_name || 'Author',
        authorEmail: story.author.email,
        reviewerName: 'Review Team',
        requestedChanges: decision.changes_requested?.map((desc) => ({
          category: 'other',
          description: desc,
          required: true
        })),
        rejectionReason: decision.reason,
        escalationReason: decision.elder_consultation_reason
      }

      try {
        let emailResult
        let emailType: EmailTemplateType

        if (decision.type === 'approve') {
          emailResult = await notifyStoryApproved(notificationData)
          await notifyStoryPublished(notificationData)
          emailType = 'story_published'
        } else if (decision.type === 'reject') {
          emailResult = await notifyStoryRejected(notificationData)
          emailType = 'story_rejected'
        } else if (decision.type === 'request_changes') {
          emailResult = await notifyChangesRequested(notificationData)
          emailType = 'changes_requested'
        } else if (decision.type === 'escalate_to_elder') {
          emailResult = await notifyElderEscalation(notificationData)
          elderNotified = emailResult?.success || false
          emailType = 'elder_escalation'
        } else {
          emailResult = null
          emailType = 'story_submitted'
        }

        if (emailResult) {
          emailSent = emailResult.success
          await logEmailNotification({
            userId: story.author.id,
            email: story.author.email,
            type: emailType,
            subject: `Story ${decision.type}: ${story.title}`,
            status: emailResult.success ? 'sent' : 'failed',
            messageId: emailResult.messageId,
            error: emailResult.error
          })
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError)
      }
    }

    console.log(`Review decision processed: ${story.title} → ${newStatus}`)

    return NextResponse.json({
      success: true,
      reviewId,
      decision: decision.type,
      newStatus,
      message: getSuccessMessage(decision.type, story.title),
      notifications: { authorNotified: emailSent, elderNotified }
    })
  } catch (error) {
    console.error('Review decision error:', error)
    return NextResponse.json({ error: 'Failed to process review decision' }, { status: 500 })
  }
}

const SUCCESS_MESSAGES: Record<ReviewDecisionType, (title: string) => string> = {
  approve: (title) => `"${title}" has been approved and published to the community.`,
  reject: (title) => `"${title}" has been rejected. The author will be notified.`,
  request_changes: (title) => `Changes have been requested for "${title}". The author will be notified.`,
  escalate_to_elder: (title) => `"${title}" has been escalated to the elder review queue.`,
  flag_content: (title) => `"${title}" has been flagged for administrative attention.`
}

function getSuccessMessage(decisionType: ReviewDecisionType, storyTitle: string): string {
  const messageFn = SUCCESS_MESSAGES[decisionType]
  return messageFn ? messageFn(storyTitle) : `Review decision processed for "${storyTitle}".`
}