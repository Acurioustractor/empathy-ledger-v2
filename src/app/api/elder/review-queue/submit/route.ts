import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/elder/review-queue/submit
 * Submit an Elder review decision
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      story_id,
      elder_id,
      elder_name,
      decision,
      cultural_guidance,
      concerns,
      requested_changes,
      escalation_reason,
      notify_storyteller,
      reviewed_at
    } = body

    // Validate required fields
    if (!story_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, decision' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create review record
    const { data: review, error: reviewError } = await supabase
      .from('story_reviews')
      .insert({
        story_id,
        reviewer_id: elder_id || user.id,
        reviewer_name: elder_name,
        decision,
        cultural_guidance,
        concerns,
        requested_changes,
        escalation_reason,
        reviewed_at: reviewed_at || new Date().toISOString()
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }

    // Update story status based on decision
    let newStatus = 'pending_review'
    if (decision === 'approve') {
      newStatus = 'approved'
    } else if (decision === 'reject') {
      newStatus = 'rejected'
    } else if (decision === 'request_changes') {
      newStatus = 'changes_requested'
    } else if (decision === 'escalate') {
      newStatus = 'escalated'
    }

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        status: newStatus,
        reviewed_by: elder_id || user.id,
        reviewed_at: reviewed_at || new Date().toISOString()
      })
      .eq('id', story_id)

    if (updateError) {
      console.error('Error updating story status:', updateError)
      // Review was created but status update failed - log but don't fail request
    }

    // TODO: Send notification to storyteller if notify_storyteller is true

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully'
    })
  } catch (error) {
    console.error('Error in submit review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
