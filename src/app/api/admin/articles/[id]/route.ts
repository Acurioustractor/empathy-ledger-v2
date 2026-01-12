// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/admin/articles/:id
 * Get a single article by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params

    const { data: article, error} = await supabase
      .from('stories')
      .select(`
        *,
        storytellers:storytellers!stories_author_storyteller_id_fkey(id, display_name, avatar_url, bio)
      `)
      .eq('id', id)
      .not('article_type', 'is', null)  // Ensure it's an article-type story
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Get CTAs for this article
    const { data: articleCtas } = await supabase
      .from('article_ctas')
      .select(`
        id,
        position,
        display_order,
        custom_button_text,
        custom_url,
        custom_description,
        is_active,
        cta_templates(id, name, slug, cta_type, button_text, description, icon, style, url_template, action_type)
      `)
      .eq('article_id', id)
      .eq('is_active', true)
      .order('position')
      .order('display_order')

    const ctas = (articleCtas || []).map(ac => ({
      id: ac.id,
      position: ac.position,
      displayOrder: ac.display_order,
      templateId: ac.cta_templates?.id,
      templateSlug: ac.cta_templates?.slug,
      ctaType: ac.cta_templates?.cta_type,
      buttonText: ac.custom_button_text || ac.cta_templates?.button_text,
      description: ac.custom_description || ac.cta_templates?.description,
      icon: ac.cta_templates?.icon,
      style: ac.cta_templates?.style,
      urlTemplate: ac.custom_url || ac.cta_templates?.url_template,
      actionType: ac.cta_templates?.action_type
    }))

    return NextResponse.json({
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content || article.story_copy,  // Use content or fallback to story_copy
        excerpt: article.excerpt,
        authorStorytellerId: article.author_storyteller_id,
        authorName: article.author_name,
        articleType: article.article_type,
        primaryProject: article.primary_project,
        relatedProjects: article.related_projects || [],
        tags: article.tags || [],
        themes: article.themes || [],
        status: article.status,
        visibility: article.cultural_permission_level,  // Map from cultural_permission_level
        syndicationEnabled: article.syndication_enabled,
        syndicationDestinations: article.syndication_destinations || [],
        featuredImageId: article.featured_image_id,
        featuredImageUrl: article.featured_image_url,
        metaTitle: article.meta_title,
        metaDescription: article.meta_description,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        ctas
      }
    })

  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/articles/:id
 * Update an article
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    const body = await request.json()

    const updateData: Record<string, any> = {}

    // Map fields from camelCase to snake_case (stories table fields)
    const fieldMapping: Record<string, string> = {
      title: 'title',
      content: 'content',
      excerpt: 'excerpt',
      authorStorytellerId: 'author_storyteller_id',
      authorName: 'author_name',
      articleType: 'article_type',
      primaryProject: 'primary_project',
      relatedProjects: 'related_projects',
      tags: 'tags',
      themes: 'themes',
      status: 'status',
      visibility: 'cultural_permission_level',  // Map visibility → cultural_permission_level
      syndicationEnabled: 'syndication_enabled',
      syndicationDestinations: 'syndication_destinations',
      featuredImageId: 'featured_image_id',
      metaTitle: 'meta_title',
      metaDescription: 'meta_description'
    }

    for (const [camel, snake] of Object.entries(fieldMapping)) {
      if (body[camel] !== undefined) {
        updateData[snake] = body[camel]
      }
    }

    // Also update story_copy if content is provided
    if (body.content !== undefined) {
      updateData.story_copy = body.content
    }

    // Auto-generate excerpt if content changed and no excerpt provided
    if (body.content && !body.excerpt) {
      updateData.excerpt = body.content.substring(0, 200) + '...'
    }

    const { data: article, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
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
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update article' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/articles/:id
 * Delete an article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete article' },
      { status: 500 }
    )
  }
}
