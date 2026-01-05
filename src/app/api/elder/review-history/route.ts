import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/elder/review-history
 * Get Elder's review history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const elderId = searchParams.get('elder_id')
    const decisionFilter = searchParams.get('decision')
    const searchTerm = searchParams.get('search')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('story_reviews')
      .select(`
        id,
        story_id,
        decision,
        cultural_guidance,
        concerns,
        requested_changes,
        escalation_reason,
        reviewed_at,
        stories!inner(
          title,
          storyteller_name,
          cultural_sensitivity
        )
      `)
      .eq('reviewer_id', elderId || user.id)

    if (decisionFilter && decisionFilter !== 'all') {
      query = query.eq('decision', decisionFilter)
    }

    const { data: reviews, error: reviewsError } = await query
      .order('reviewed_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching review history:', reviewsError)
      return NextResponse.json({ error: 'Failed to fetch review history' }, { status: 500 })
    }

    // Format and filter results
    let formattedReviews = reviews?.map(review => ({
      id: review.id,
      story_id: review.story_id,
      story_title: review.stories?.title || 'Untitled',
      storyteller_name: review.stories?.storyteller_name || 'Unknown',
      cultural_sensitivity: review.stories?.cultural_sensitivity,
      decision: review.decision,
      cultural_guidance: review.cultural_guidance,
      concerns: review.concerns,
      requested_changes: review.requested_changes,
      escalation_reason: review.escalation_reason,
      reviewed_at: review.reviewed_at
    })) || []

    // Apply search filter if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      formattedReviews = formattedReviews.filter(review =>
        review.story_title.toLowerCase().includes(searchLower) ||
        review.storyteller_name.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ reviews: formattedReviews })
  } catch (error) {
    console.error('Error in review-history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
