import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/elder/review-queue/escalate
 * Escalate a story to Elder Council
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      story_id,
      elder_id,
      elder_name,
      escalation_reason,
      concerns,
      cultural_guidance
    } = body

    // Validate required fields
    if (!story_id || !escalation_reason) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, escalation_reason' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create escalation record
    const { data: escalation, error: escalationError } = await supabase
      .from('story_reviews')
      .insert({
        story_id,
        reviewer_id: elder_id || user.id,
        reviewer_name: elder_name,
        decision: 'escalate',
        escalation_reason,
        concerns,
        cultural_guidance,
        reviewed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (escalationError) {
      console.error('Error creating escalation:', escalationError)
      return NextResponse.json({ error: 'Failed to escalate story' }, { status: 500 })
    }

    // Update story status
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        status: 'escalated',
        requires_council_review: true,
        reviewed_by: elder_id || user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', story_id)

    if (updateError) {
      console.error('Error updating story status:', updateError)
    }

    // TODO: Notify Elder Council members

    return NextResponse.json({
      success: true,
      escalation,
      message: 'Story escalated to Elder Council'
    })
  } catch (error) {
    console.error('Error in escalate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
