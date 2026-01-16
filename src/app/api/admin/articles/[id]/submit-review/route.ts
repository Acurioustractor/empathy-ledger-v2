// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * POST /api/admin/articles/:id/submit-review
 * Submit an article for review (regular or elder review)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { id } = params

    // Get current article
    const { data: current, error: fetchError } = await supabase
      .from('stories')
      .select('status, requires_elder_review, article_type')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Determine review type based on article type
    const elderReviewTypes = ['story_feature', 'impact_report']
    const requiresElderReview = current.requires_elder_review ||
      elderReviewTypes.includes(current.article_type)

    const newStatus = requiresElderReview ? 'elder_review' : 'in_review'

    // Update status
    const { data: article, error } = await supabase
      .from('stories')
      .update({
        status: newStatus,
        requires_elder_review: requiresElderReview
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error submitting for review:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Send notification to reviewers/elders

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        status: article.status,
        requiresElderReview: article.requires_elder_review
      },
      message: requiresElderReview
        ? 'Article submitted for elder review'
        : 'Article submitted for review'
    })

  } catch (error) {
    console.error('Error submitting for review:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit for review' },
      { status: 500 }
    )
  }
}
