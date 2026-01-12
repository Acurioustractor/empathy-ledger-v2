// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/admin/reviews
 * Get review queue - articles pending review
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const reviewType = searchParams.get('type') // 'editor', 'elder', or null for all
    const status = searchParams.get('status') || 'pending'

    // Get articles that need review based on their status
    let articlesQuery = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        author_name,
        author_storyteller_id,
        article_type,
        status,
        requires_elder_review,
        created_at,
        updated_at,
        storytellers:author_storyteller_id(id, display_name, avatar_url)
      `)
      .order('updated_at', { ascending: true })

    // Filter by review type
    if (reviewType === 'elder') {
      articlesQuery = articlesQuery.eq('status', 'elder_review')
    } else if (reviewType === 'editor') {
      articlesQuery = articlesQuery.eq('status', 'in_review')
    } else {
      // Get all articles needing any type of review
      articlesQuery = articlesQuery.in('status', ['in_review', 'elder_review'])
    }

    const { data: articles, error } = await articlesQuery

    if (error) {
      console.error('Error fetching review queue:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get review records for these articles
    const articleIds = (articles || []).map(a => a.id)

    let reviews: any[] = []
    if (articleIds.length > 0) {
      const { data: reviewData } = await supabase
        .from('article_reviews')
        .select(`
          id,
          article_id,
          reviewer_id,
          reviewer_name,
          review_type,
          decision,
          notes,
          status,
          created_at,
          completed_at,
          storytellers:reviewer_id(id, display_name)
        `)
        .in('article_id', articleIds)
        .order('created_at', { ascending: false })

      reviews = reviewData || []
    }

    // Combine articles with their reviews
    const queue = (articles || []).map(article => {
      const articleReviews = reviews.filter(r => r.article_id === article.id)
      const pendingReview = articleReviews.find(r => r.status === 'pending')

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        authorName: article.author_name || article.storytellers?.display_name || 'Unknown',
        authorId: article.author_storyteller_id,
        authorAvatar: article.storytellers?.avatar_url,
        articleType: article.article_type,
        status: article.status,
        requiresElderReview: article.requires_elder_review,
        reviewType: article.status === 'elder_review' ? 'elder' : 'editor',
        submittedAt: article.updated_at,
        createdAt: article.created_at,
        pendingReviewId: pendingReview?.id,
        assignedReviewer: pendingReview?.storytellers?.display_name,
        assignedReviewerId: pendingReview?.reviewer_id,
        reviewHistory: articleReviews.map(r => ({
          id: r.id,
          reviewType: r.review_type,
          decision: r.decision,
          reviewerName: r.reviewer_name || r.storytellers?.display_name,
          notes: r.notes,
          completedAt: r.completed_at
        }))
      }
    })

    // Get stats
    const stats = {
      total: queue.length,
      editorReview: queue.filter(q => q.reviewType === 'editor').length,
      elderReview: queue.filter(q => q.reviewType === 'elder').length,
      unassigned: queue.filter(q => !q.assignedReviewerId).length
    }

    return NextResponse.json({
      queue,
      stats
    })

  } catch (error) {
    console.error('Error fetching review queue:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch review queue' },
      { status: 500 }
    )
  }
}
