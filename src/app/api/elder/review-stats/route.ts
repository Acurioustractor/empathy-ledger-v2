import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/elder/review-stats
 * Get Elder review dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const elderId = searchParams.get('elder_id')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Verify user has Elder role

    // Get review statistics
    const { data: reviews, error: reviewsError } = await supabase
      .from('story_reviews')
      .select('decision, created_at')
      .eq('reviewer_id', elderId || user.id)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json({ error: 'Failed to fetch review stats' }, { status: 500 })
    }

    // Calculate stats
    const stats = {
      pending: reviews?.filter(r => r.decision === 'pending').length || 0,
      approved: reviews?.filter(r => r.decision === 'approve').length || 0,
      rejected: reviews?.filter(r => r.decision === 'reject').length || 0,
      requestedChanges: reviews?.filter(r => r.decision === 'request_changes').length || 0,
      escalated: reviews?.filter(r => r.decision === 'escalate').length || 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in review-stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
