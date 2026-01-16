// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * GET /api/admin/articles
 * List all articles with filtering and stats
 */
export async function GET(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query - now querying stories table with article_type filter
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        slug,
        excerpt,
        author_name,
        author_storyteller_id,
        article_type,
        primary_project,
        status,
        cultural_permission_level,
        created_at,
        updated_at,
        tags,
        featured_image_url
      `, { count: 'exact' })
      .not('article_type', 'is', null)  // Only get article-type stories
      .order('updated_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (type && type !== 'all') {
      query = query.eq('article_type', type)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: articles, error, count } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get stats - query stories with article_type
    const { data: statsData } = await supabase
      .from('stories')
      .select('status')
      .not('article_type', 'is', null)

    const stats = {
      total: statsData?.length || 0,
      draft: statsData?.filter(a => a.status === 'draft').length || 0,
      inReview: statsData?.filter(a => a.status === 'in_review').length || 0,
      elderReview: statsData?.filter(a => a.status === 'elder_review').length || 0,
      published: statsData?.filter(a => a.status === 'published').length || 0,
      archived: statsData?.filter(a => a.status === 'archived').length || 0
    }

    return NextResponse.json({
      articles: articles?.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        authorName: a.author_name,
        authorStorytellerId: a.author_storyteller_id,
        articleType: a.article_type,
        primaryProject: a.primary_project,
        status: a.status,
        visibility: a.cultural_permission_level,  // Map cultural_permission_level → visibility
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        tags: a.tags || [],
        featuredImageUrl: a.featured_image_url
      })) || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Error in articles API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/articles
 * Create a new article
 */
export async function POST(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    const {
      title,
      subtitle,
      content,
      excerpt,
      authorType,
      authorStorytellerId,
      authorName,
      authorBio,
      articleType,
      primaryProject,
      relatedProjects,
      tags,
      themes,
      visibility,
      requiresElderReview,
      syndicationEnabled,
      syndicationDestinations,
      featuredImageId,
      metaTitle,
      metaDescription
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check for slug uniqueness in stories
    const { data: existing } = await supabase
      .from('stories')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Insert into stories table
    const { data: article, error } = await supabase
      .from('stories')
      .insert({
        title,
        slug,
        content,  // stories has content column now
        story_copy: content,  // Also set story_copy for compatibility
        excerpt: excerpt || (content ? content.substring(0, 200) + '...' : null),
        author_storyteller_id: authorStorytellerId,
        author_name: authorName,
        article_type: articleType || 'community_news',
        primary_project: primaryProject,
        related_projects: relatedProjects || [],
        tags: tags || [],
        themes: themes || [],
        status: 'draft',
        cultural_permission_level: visibility || 'restricted',  // Map visibility → cultural_permission_level
        syndication_enabled: syndicationEnabled ?? true,
        syndication_destinations: syndicationDestinations || [],
        featured_image_id: featuredImageId,
        meta_title: metaTitle,
        meta_description: metaDescription
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status
      }
    })

  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create article' },
      { status: 500 }
    )
  }
}
