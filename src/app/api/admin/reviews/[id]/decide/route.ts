// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



interface ReviewDecision {
  type: 'approve' | 'reject' | 'request_changes' | 'escalate_to_elder' | 'flag_content'
  reason: string
  notes: string
  changes_requested?: string[]
  elder_consultation_reason?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const decision: ReviewDecision = await request.json()
    
    // Temporarily bypass auth for testing
    console.log('⚠️ TEMPORARILY BYPASSING AUTH FOR REVIEW DECISIONS')
    const reviewerId = 'test-admin-id' // TODO: See issue #38 in empathy-ledger-v2: Get from auth context

    const supabase = createSupabaseServerClient()

    console.log('📝 Processing review decision:', { reviewId, decision: decision.type })

    // Get the story/content being reviewed
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (fetchError || !story) {
      console.error('Story not found:', fetchError)
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    let newStatus: string
    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Process decision based on type
    switch (decision.type) {
      case 'approve':
        newStatus = 'published'
        updateData = {
          ...updateData,
          status: 'published',
          cultural_review_status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          review_notes: decision.notes
        }
        console.log('✅ Approving story for publication')
        break

      case 'reject':
        newStatus = 'rejected'
        updateData = {
          ...updateData,
          status: 'rejected',
          cultural_review_status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          review_notes: decision.notes,
          rejection_reason: decision.reason
        }
        console.log('❌ Rejecting story')
        break

      case 'request_changes':
        newStatus = 'needs_revision'
        updateData = {
          ...updateData,
          status: 'needs_revision',
          cultural_review_status: 'changes_requested',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          review_notes: decision.notes,
          requested_changes: decision.changes_requested
        }
        console.log('📝 Requesting changes to story')
        break

      case 'escalate_to_elder':
        newStatus = 'elder_review'
        updateData = {
          ...updateData,
          status: 'elder_review',
          cultural_review_status: 'escalated',
          escalated_at: new Date().toISOString(),
          escalated_by: reviewerId,
          escalation_reason: decision.elder_consultation_reason,
          review_notes: decision.notes
        }
        console.log('🏛️ Escalating to elder review')
        break

      case 'flag_content':
        newStatus = 'flagged'
        updateData = {
          ...updateData,
          status: 'flagged',
          cultural_review_status: 'flagged',
          flagged_at: new Date().toISOString(),
          flagged_by: reviewerId,
          flag_reason: decision.reason,
          review_notes: decision.notes
        }
        console.log('🚩 Flagging content for attention')
        break

      default:
        return NextResponse.json(
          { error: 'Invalid review decision type' },
          { status: 400 }
        )
    }

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

    // TODO: See issue #39 in empathy-ledger-v2: Create review history record
    // TODO: See issue #40 in empathy-ledger-v2: Send email notification to author
    // TODO: See issue #41 in empathy-ledger-v2: Send notifications to relevant parties

    console.log(`✅ Review decision processed: ${story.title} → ${newStatus}`)

    // Prepare response data
    const responseData = {
      success: true,
      reviewId,
      decision: decision.type,
      newStatus,
      message: getSuccessMessage(decision.type, story.title),
      notifications: {
        authorNotified: false, // TODO: See issue #42 in empathy-ledger-v2: Implement email notifications
        elderNotified: decision.type === 'escalate_to_elder' ? false : null
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Review decision error:', error)
    return NextResponse.json(
      { error: 'Failed to process review decision' },
      { status: 500 }
    )
  }
}

function getSuccessMessage(decisionType: string, storyTitle: string): string {
  switch (decisionType) {
    case 'approve':
      return `"${storyTitle}" has been approved and published to the community.`
    case 'reject':
      return `"${storyTitle}" has been rejected. The author will be notified.`
    case 'request_changes':
      return `Changes have been requested for "${storyTitle}". The author will be notified.`
    case 'escalate_to_elder':
      return `"${storyTitle}" has been escalated to the elder review queue.`
    case 'flag_content':
      return `"${storyTitle}" has been flagged for administrative attention.`
    default:
      return `Review decision processed for "${storyTitle}".`
  }
}