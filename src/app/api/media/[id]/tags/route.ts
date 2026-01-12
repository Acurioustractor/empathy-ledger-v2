/**
 * Media Tags API
 * GET /api/media/[id]/tags - Get all tags for a media item
 * POST /api/media/[id]/tags - Add tags to a media item
 * DELETE /api/media/[id]/tags - Remove tags from a media item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface MediaTag {
  id: string
  tagId: string
  tagName: string
  tagSlug: string
  category: string
  source: string
  confidence: number | null
  verified: boolean
  elderApproved: boolean
  culturalSensitivityLevel: string
  addedAt: string
}

interface AITagSuggestion {
  name: string
  confidence: number
  category: string
  source: string
}

// GET - Get all tags for a media item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params

    // Get existing tags with full tag details
    const { data: mediaTags, error: tagsError } = await supabase
      .from('media_tags')
      .select(`
        id,
        source,
        confidence,
        verified,
        elder_approved,
        created_at,
        tags!inner (
          id,
          name,
          slug,
          category,
          cultural_sensitivity_level,
          requires_elder_approval
        )
      `)
      .eq('media_asset_id', mediaId)
      .order('created_at', { ascending: false })

    if (tagsError) {
      console.error('Error fetching media tags:', tagsError)
      return NextResponse.json({ error: tagsError.message }, { status: 500 })
    }

    // Get AI suggestions from the media_assets table
    const { data: mediaAsset, error: assetError } = await supabase
      .from('media_assets')
      .select('ai_tag_suggestions')
      .eq('id', mediaId)
      .single()

    if (assetError && assetError.code !== 'PGRST116') {
      console.error('Error fetching media asset:', assetError)
    }

    // Transform tags to response format
    const tags: MediaTag[] = (mediaTags || []).map((mt: any) => ({
      id: mt.id,
      tagId: mt.tags.id,
      tagName: mt.tags.name,
      tagSlug: mt.tags.slug,
      category: mt.tags.category,
      source: mt.source,
      confidence: mt.confidence,
      verified: mt.verified,
      elderApproved: mt.elder_approved,
      culturalSensitivityLevel: mt.tags.cultural_sensitivity_level,
      requiresElderApproval: mt.tags.requires_elder_approval,
      addedAt: mt.created_at
    }))

    // Transform AI suggestions
    const aiSuggestions: AITagSuggestion[] = (mediaAsset?.ai_tag_suggestions || [])

    return NextResponse.json({
      tags,
      aiSuggestions,
      summary: {
        total: tags.length,
        verified: tags.filter(t => t.verified).length,
        pendingElderApproval: tags.filter(t => !t.elderApproved && t.culturalSensitivityLevel !== 'public').length,
        aiSuggestionsCount: aiSuggestions.length
      }
    })

  } catch (error) {
    console.error('Error in GET /api/media/[id]/tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST - Add tags to a media item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params
    const body = await request.json()

    const {
      tagIds = [],           // Existing tag IDs to add
      newTags = [],          // New tags to create and add: { name, category, description? }
      source = 'manual',     // 'manual', 'ai_verified', 'batch'
      userId                 // Optional: user who is adding tags
    } = body

    // Validate media exists
    const { data: media, error: mediaError } = await supabase
      .from('media_assets')
      .select('id')
      .eq('id', mediaId)
      .single()

    if (mediaError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const results: { added: string[], created: string[], failed: string[] } = {
      added: [],
      created: [],
      failed: []
    }

    // Create new tags first
    for (const newTag of newTags) {
      if (!newTag.name?.trim()) continue

      const slug = newTag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      const { data: createdTag, error: createError } = await supabase
        .from('tags')
        .upsert({
          name: newTag.name.trim(),
          slug,
          category: newTag.category || 'general',
          description: newTag.description,
          cultural_sensitivity_level: newTag.culturalSensitivityLevel || 'public'
        }, { onConflict: 'slug,tenant_id' })
        .select('id')
        .single()

      if (createError) {
        // Try to find existing tag
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .single()

        if (existingTag) {
          tagIds.push(existingTag.id)
        } else {
          results.failed.push(newTag.name)
        }
      } else if (createdTag) {
        tagIds.push(createdTag.id)
        results.created.push(newTag.name)
      }
    }

    // Add tags to media
    for (const tagId of tagIds) {
      const { error: linkError } = await supabase
        .from('media_tags')
        .upsert({
          media_asset_id: mediaId,
          tag_id: tagId,
          source,
          added_by: userId,
          verified: source === 'ai_verified',
          confidence: source === 'ai_verified' ? 0.9 : null
        }, { onConflict: 'media_asset_id,tag_id' })

      if (linkError) {
        results.failed.push(tagId)
      } else {
        results.added.push(tagId)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Added ${results.added.length} tags, created ${results.created.length} new tags`
    })

  } catch (error) {
    console.error('Error in POST /api/media/[id]/tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add tags' },
      { status: 500 }
    )
  }
}

// DELETE - Remove tags from a media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params
    const body = await request.json()

    const { tagIds = [] } = body

    if (!tagIds.length) {
      return NextResponse.json({ error: 'No tag IDs provided' }, { status: 400 })
    }

    const { error, count } = await supabase
      .from('media_tags')
      .delete()
      .eq('media_asset_id', mediaId)
      .in('tag_id', tagIds)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      removed: count || tagIds.length,
      message: `Removed ${count || tagIds.length} tags`
    })

  } catch (error) {
    console.error('Error in DELETE /api/media/[id]/tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove tags' },
      { status: 500 }
    )
  }
}
