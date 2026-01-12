// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/admin/articles/:id/ctas
 * Get all CTAs for an article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params

    const { data: articleCtas, error } = await supabase
      .from('article_ctas')
      .select(`
        id,
        position,
        display_order,
        custom_button_text,
        custom_url,
        custom_description,
        is_active,
        click_count,
        cta_templates(id, name, slug, cta_type, button_text, description, icon, style, url_template, action_type)
      `)
      .eq('article_id', id)
      .order('position')
      .order('display_order')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ctas = (articleCtas || []).map(ac => ({
      id: ac.id,
      position: ac.position,
      displayOrder: ac.display_order,
      isActive: ac.is_active,
      clickCount: ac.click_count,
      templateId: ac.cta_templates?.id,
      templateName: ac.cta_templates?.name,
      templateSlug: ac.cta_templates?.slug,
      ctaType: ac.cta_templates?.cta_type,
      buttonText: ac.custom_button_text || ac.cta_templates?.button_text,
      description: ac.custom_description || ac.cta_templates?.description,
      icon: ac.cta_templates?.icon,
      style: ac.cta_templates?.style,
      urlTemplate: ac.custom_url || ac.cta_templates?.url_template,
      actionType: ac.cta_templates?.action_type,
      customButtonText: ac.custom_button_text,
      customUrl: ac.custom_url,
      customDescription: ac.custom_description
    }))

    return NextResponse.json({ ctas })

  } catch (error) {
    console.error('Error fetching article CTAs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch CTAs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/articles/:id/ctas
 * Add a CTA to an article
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: articleId } = params
    const body = await request.json()

    const {
      ctaTemplateId,
      position = 'end',
      displayOrder = 0,
      customButtonText,
      customUrl,
      customDescription
    } = body

    if (!ctaTemplateId) {
      return NextResponse.json({ error: 'ctaTemplateId is required' }, { status: 400 })
    }

    const { data: articleCta, error } = await supabase
      .from('article_ctas')
      .insert({
        article_id: articleId,
        cta_template_id: ctaTemplateId,
        position,
        display_order: displayOrder,
        custom_button_text: customButtonText,
        custom_url: customUrl,
        custom_description: customDescription
      })
      .select(`
        id,
        position,
        display_order,
        is_active,
        cta_templates(id, name, slug, cta_type, button_text, icon, style)
      `)
      .single()

    if (error) {
      console.error('Error adding CTA:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      cta: {
        id: articleCta.id,
        position: articleCta.position,
        displayOrder: articleCta.display_order,
        templateId: articleCta.cta_templates?.id,
        templateName: articleCta.cta_templates?.name,
        ctaType: articleCta.cta_templates?.cta_type,
        buttonText: customButtonText || articleCta.cta_templates?.button_text
      }
    })

  } catch (error) {
    console.error('Error adding CTA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add CTA' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/articles/:id/ctas
 * Remove a CTA from an article (pass ctaId in body)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()
    const { ctaId } = body

    if (!ctaId) {
      return NextResponse.json({ error: 'ctaId is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('article_ctas')
      .delete()
      .eq('id', ctaId)
      .eq('article_id', params.id)

    if (error) {
      console.error('Error removing CTA:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing CTA:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove CTA' },
      { status: 500 }
    )
  }
}
