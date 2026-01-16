// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * GET /api/admin/reviews/:id
 * Get a specific review with article details
 */
export async function GET(
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

    // First try to get by review ID
    const reviewResult = await supabase
      .from('article_reviews')
      .select(`
        *,
        articles(
          id,
          title,
          slug,
          content,
          excerpt,
          author_name,
          article_type,
          status,
          requires_elder_review,
          storytellers:author_storyteller_id(id, display_name, avatar_url, bio)
        ),
        reviewer:reviewer_id(id, display_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    let review = reviewResult.data
    const error = reviewResult.error

    // If not found by review ID, try by article ID
    if (!review) {
      const { data: articleReview } = await supabase
        .from('article_reviews')
        .select(`
          *,
          articles(
            id,
            title,
            slug,
            content,
            excerpt,
            author_name,
            article_type,
            status,
            requires_elder_review,
            storytellers:author_storyteller_id(id, display_name, avatar_url, bio)
          ),
          reviewer:reviewer_id(id, display_name, avatar_url)
        `)
        .eq('article_id', id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      review = articleReview
    }

    if (error && !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({
      review: {
        id: review.id,
        articleId: review.article_id,
        reviewType: review.review_type,
        status: review.status,
        decision: review.decision,
        notes: review.notes,
        requestedChanges: review.requested_changes,
        checklistCompleted: review.checklist_completed,
        brandAlignmentScore: review.brand_alignment_score,
        createdAt: review.created_at,
        completedAt: review.completed_at,
        reviewer: review.reviewer ? {
          id: review.reviewer.id,
          name: review.reviewer.display_name,
          avatar: review.reviewer.avatar_url
        } : null,
        article: review.articles ? {
          id: review.articles.id,
          title: review.articles.title,
          slug: review.articles.slug,
          content: review.articles.content,
          excerpt: review.articles.excerpt,
          authorName: review.articles.author_name || review.articles.storytellers?.display_name,
          articleType: review.articles.article_type,
          status: review.articles.status,
          requiresElderReview: review.articles.requires_elder_review
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/reviews/:id
 * Update review - assign reviewer, update checklist, submit decision
 */
export async function PATCH(
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
    const body = await request.json()

    const {
      reviewerId,
      reviewerName,
      checklistCompleted,
      brandAlignmentScore,
      notes
    } = body

    const updateData: Record<string, any> = {}

    if (reviewerId !== undefined) {
      updateData.reviewer_id = reviewerId
      updateData.status = 'in_progress'
      updateData.started_at = new Date().toISOString()
    }

    if (reviewerName !== undefined) {
      updateData.reviewer_name = reviewerName
    }

    if (checklistCompleted !== undefined) {
      updateData.checklist_completed = checklistCompleted
    }

    if (brandAlignmentScore !== undefined) {
      updateData.brand_alignment_score = brandAlignmentScore
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { data: review, error } = await supabase
      .from('article_reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating review:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        status: review.status,
        reviewerId: review.reviewer_id
      }
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update review' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/reviews/:id
 * Submit review decision (approve, reject, request_changes)
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
    const body = await request.json()

    const {
      decision,  // 'approve', 'reject', 'request_changes'
      notes,
      requestedChanges,
      checklistCompleted,
      brandAlignmentScore,
      reviewerId,
      reviewerName
    } = body

    if (!decision || !['approve', 'reject', 'request_changes'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be approve, reject, or request_changes' },
        { status: 400 }
      )
    }

    // Get the review to find the article
    const { data: existingReview } = await supabase
      .from('article_reviews')
      .select('article_id, review_type')
      .eq('id', id)
      .single()

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Update the review
    const { data: review, error: reviewError } = await supabase
      .from('article_reviews')
      .update({
        decision,
        notes,
        requested_changes: requestedChanges,
        checklist_completed: checklistCompleted,
        brand_alignment_score: brandAlignmentScore,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (reviewError) {
      console.error('Error completing review:', reviewError)
      return NextResponse.json({ error: reviewError.message }, { status: 500 })
    }

    // Update article status based on decision
    let newArticleStatus: string
    switch (decision) {
      case 'approve':
        // If this was elder review, article is approved
        // If this was editor review and article requires elder, move to elder_review
        const { data: article } = await supabase
          .from('articles')
          .select('requires_elder_review, status')
          .eq('id', existingReview.article_id)
          .single()

        if (existingReview.review_type === 'elder' || !article?.requires_elder_review) {
          newArticleStatus = 'approved'
        } else {
          newArticleStatus = 'elder_review'
          // Create elder review record
          await supabase
            .from('article_reviews')
            .insert({
              article_id: existingReview.article_id,
              review_type: 'elder',
              status: 'pending'
            })
        }
        break

      case 'reject':
        newArticleStatus = 'draft'  // Send back to draft
        break

      case 'request_changes':
        newArticleStatus = 'draft'  // Send back for revisions
        break

      default:
        newArticleStatus = 'draft'
    }

    // Update article
    const { error: articleError } = await supabase
      .from('articles')
      .update({
        status: newArticleStatus,
        last_reviewed_at: new Date().toISOString(),
        last_reviewed_by: reviewerId,
        review_checklist_completed: checklistCompleted,
        brand_alignment_score: brandAlignmentScore
      })
      .eq('id', existingReview.article_id)

    if (articleError) {
      console.error('Error updating article:', articleError)
      // Don't fail - review was saved
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        decision: review.decision,
        status: review.status
      },
      article: {
        id: existingReview.article_id,
        newStatus: newArticleStatus
      },
      message: decision === 'approve'
        ? (newArticleStatus === 'approved' ? 'Article approved and ready to publish' : 'Article moved to elder review')
        : decision === 'reject'
          ? 'Article rejected and returned to draft'
          : 'Changes requested - article returned to author'
    })

  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit review' },
      { status: 500 }
    )
  }
}
