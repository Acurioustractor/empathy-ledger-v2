/**
 * Tag Management API - Individual tag operations
 * GET /api/tags/[id] - Get a single tag with usage
 * PUT /api/tags/[id] - Update a tag
 * DELETE /api/tags/[id] - Delete a tag
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET - Get a single tag with usage details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id } = params

    // Get tag with parent info
    const { data: tag, error } = await supabase
      .from('tags')
      .select(`
        *,
        parent:parent_tag_id(id, name, slug)
      `)
      .eq('id', id)
      .single()

    if (error || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Get child tags
    const { data: children } = await supabase
      .from('tags')
      .select('id, name, slug, category, usage_count')
      .eq('parent_tag_id', id)
      .order('usage_count', { ascending: false })

    // Get recent media using this tag (sample)
    const { data: recentMedia } = await supabase
      .from('media_tags')
      .select(`
        media_asset_id,
        created_at,
        media_assets!inner(id, title, thumbnail_url, content_type)
      `)
      .eq('tag_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        category: tag.category,
        parentTag: tag.parent,
        culturalSensitivityLevel: tag.cultural_sensitivity_level,
        requiresElderApproval: tag.requires_elder_approval,
        usageCount: tag.usage_count,
        createdAt: tag.created_at,
        updatedAt: tag.updated_at
      },
      children: children || [],
      recentMedia: (recentMedia || []).map((m: any) => ({
        id: m.media_assets.id,
        title: m.media_assets.title,
        thumbnailUrl: m.media_assets.thumbnail_url,
        contentType: m.media_assets.content_type,
        taggedAt: m.created_at
      }))
    })

  } catch (error) {
    console.error('Error in GET /api/tags/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tag' },
      { status: 500 }
    )
  }
}

// PUT - Update a tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id } = params
    const body = await request.json()

    const {
      name,
      description,
      category,
      parentTagId,
      culturalSensitivityLevel
    } = body

    // Build update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) {
      updates.name = name.trim()
      updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (parentTagId !== undefined) updates.parent_tag_id = parentTagId
    if (culturalSensitivityLevel !== undefined) {
      updates.cultural_sensitivity_level = culturalSensitivityLevel
      updates.requires_elder_approval = ['sacred', 'sensitive'].includes(culturalSensitivityLevel)
    }

    const { data: updated, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      tag: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        category: updated.category,
        culturalSensitivityLevel: updated.cultural_sensitivity_level,
        requiresElderApproval: updated.requires_elder_approval
      }
    })

  } catch (error) {
    console.error('Error in PUT /api/tags/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tag' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a tag (soft delete by moving media to replacement tag)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id } = params
    const url = new URL(request.url)

    const replacementTagId = url.searchParams.get('replacementTagId')
    const force = url.searchParams.get('force') === 'true'

    // Check tag exists and get usage count
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id, name, usage_count')
      .eq('id', id)
      .single()

    if (tagError || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // If tag is in use and no force/replacement
    if (tag.usage_count > 0 && !force && !replacementTagId) {
      return NextResponse.json({
        error: 'Tag is in use',
        usageCount: tag.usage_count,
        message: 'Provide replacementTagId to move media to another tag, or force=true to delete anyway'
      }, { status: 400 })
    }

    // If replacement tag provided, move all media tags
    if (replacementTagId) {
      // Update media_tags to point to replacement
      const { error: moveError } = await supabase
        .from('media_tags')
        .update({ tag_id: replacementTagId })
        .eq('tag_id', id)

      if (moveError) {
        return NextResponse.json({ error: `Failed to move media: ${moveError.message}` }, { status: 500 })
      }
    } else {
      // Delete all media_tags for this tag
      await supabase
        .from('media_tags')
        .delete()
        .eq('tag_id', id)
    }

    // Update child tags to have no parent
    await supabase
      .from('tags')
      .update({ parent_tag_id: null })
      .eq('parent_tag_id', id)

    // Delete the tag
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Tag "${tag.name}" deleted`,
      mediaMovedTo: replacementTagId || null,
      mediaDeleted: !replacementTagId ? tag.usage_count : 0
    })

  } catch (error) {
    console.error('Error in DELETE /api/tags/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
