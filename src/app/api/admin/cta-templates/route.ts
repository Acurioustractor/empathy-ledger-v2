// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/admin/cta-templates
 * List all available CTA templates
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const articleType = searchParams.get('articleType')

  const query = supabase
      .from('cta_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    const { data: templates, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by article type if provided
    let filteredTemplates = templates || []
    if (articleType) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.available_for_article_types === null ||
        t.available_for_article_types.includes(articleType)
      )
    }

    return NextResponse.json({
      templates: filteredTemplates.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        ctaType: t.cta_type,
        buttonText: t.button_text,
        description: t.description,
        icon: t.icon,
        style: t.style,
        urlTemplate: t.url_template,
        actionType: t.action_type,
        availableForArticleTypes: t.available_for_article_types
      }))
    })

  } catch (error) {
    console.error('Error fetching CTA templates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
