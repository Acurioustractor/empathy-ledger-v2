// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'



export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth()
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const supabase = createSupabaseServerClient()

    // Get pending stories (stories that need review)
    const { count: pendingReviews } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get flagged content (stories reported by users)
    const { count: flaggedContent } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'flagged')

    // For now, elder approvals will be 0 since we don't have that system yet
    const elderApprovals = 0

    return NextResponse.json({
      pending: pendingReviews || 0,
      flagged: flaggedContent || 0,
      elderApprovals: elderApprovals
    })

  } catch (error) {
    console.error('Admin reviews stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews stats' }, { status: 500 })
  }
}