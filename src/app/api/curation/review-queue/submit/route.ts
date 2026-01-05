import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/curation/review-queue/submit
 * Submit a quality review decision for a story
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      story_id,
      decision,
      notes
    } = body

    // Validate
    if (!story_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, decision' },
        { status: 400 }
      )
    }

    if (!['approve', 'minor_edits', 'major_revision', 'decline'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be: approve, minor_edits, major_revision, or decline' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current story
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('id, title, status')
      .eq('id', story_id)
      .single()

    if (fetchError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Map decision to new status
    let newStatus = 'draft'
    if (decision === 'approve') {
      newStatus = 'approved'
    } else if (decision === 'minor_edits') {
      newStatus = 'draft' // Return to draft for minor edits
    } else if (decision === 'major_revision') {
      newStatus = 'draft' // Return to draft for major revision
    } else if (decision === 'decline') {
      newStatus = 'rejected'
    }

    // Update story status
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', story_id)

    if (updateError) {
      console.error('Error updating story status:', updateError)
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }

    // Create review record (using story_reviews table)
    const { error: reviewError } = await supabase
      .from('story_reviews')
      .insert({
        story_id,
        reviewer_id: user.id,
        decision: decision === 'approve' ? 'approve' : 'request_changes',
        requested_changes: notes?.trim() || null,
        reviewed_at: new Date().toISOString()
      })

    if (reviewError) {
      console.error('Error creating review record:', reviewError)
      // Don't fail the whole operation if review record fails
    }

    return NextResponse.json({
      success: true,
      story_id,
      decision,
      new_status: newStatus,
      message: `Story "${story.title}" ${decision === 'approve' ? 'approved' : 'updated'} successfully`
    })
  } catch (error) {
    console.error('Error in submit review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
