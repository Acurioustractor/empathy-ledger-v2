/**
 * Tag Merge API
 * POST /api/tags/merge - Merge multiple tags into one
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST - Merge source tags into target tag
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()

    const { sourceTagIds, targetTagId } = body

    if (!sourceTagIds?.length || !targetTagId) {
      return NextResponse.json(
        { error: 'sourceTagIds (array) and targetTagId are required' },
        { status: 400 }
      )
    }

    // Validate target tag exists
    const { data: targetTag, error: targetError } = await supabase
      .from('tags')
      .select('id, name, usage_count')
      .eq('id', targetTagId)
      .single()

    if (targetError || !targetTag) {
      return NextResponse.json({ error: 'Target tag not found' }, { status: 404 })
    }

    // Validate source tags exist
    const { data: sourceTags, error: sourceError } = await supabase
      .from('tags')
      .select('id, name, usage_count')
      .in('id', sourceTagIds)

    if (sourceError) {
      return NextResponse.json({ error: sourceError.message }, { status: 500 })
    }

    if (!sourceTags?.length) {
      return NextResponse.json({ error: 'No valid source tags found' }, { status: 404 })
    }

    const results = {
      mediaTagsMoved: 0,
      tagsMerged: 0,
      tagsDeleted: 0,
      conflicts: 0
    }

    // Process each source tag
    for (const sourceTag of sourceTags) {
      if (sourceTag.id === targetTagId) continue // Skip if source is target

      // Get all media_tags for source tag
      const { data: mediaTagsToMove } = await supabase
        .from('media_tags')
        .select('media_asset_id')
        .eq('tag_id', sourceTag.id)

      if (mediaTagsToMove?.length) {
        for (const mt of mediaTagsToMove) {
          // Check if target tag already exists on this media
          const { data: existing } = await supabase
            .from('media_tags')
            .select('id')
            .eq('media_asset_id', mt.media_asset_id)
            .eq('tag_id', targetTagId)
            .single()

          if (existing) {
            // Conflict: media already has target tag, just delete source
            await supabase
              .from('media_tags')
              .delete()
              .eq('media_asset_id', mt.media_asset_id)
              .eq('tag_id', sourceTag.id)
            results.conflicts++
          } else {
            // Move tag to target
            await supabase
              .from('media_tags')
              .update({ tag_id: targetTagId })
              .eq('media_asset_id', mt.media_asset_id)
              .eq('tag_id', sourceTag.id)
            results.mediaTagsMoved++
          }
        }
      }

      // Update child tags to point to target
      await supabase
        .from('tags')
        .update({ parent_tag_id: targetTagId })
        .eq('parent_tag_id', sourceTag.id)

      // Delete the source tag
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', sourceTag.id)

      if (!deleteError) {
        results.tagsDeleted++
      }

      results.tagsMerged++
    }

    // Refresh target tag usage count
    const { count } = await supabase
      .from('media_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', targetTagId)

    await supabase
      .from('tags')
      .update({ usage_count: count || 0 })
      .eq('id', targetTagId)

    return NextResponse.json({
      success: true,
      targetTag: {
        id: targetTag.id,
        name: targetTag.name,
        newUsageCount: count || 0
      },
      results,
      message: `Merged ${results.tagsMerged} tags into "${targetTag.name}"`
    })

  } catch (error) {
    console.error('Error in POST /api/tags/merge:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to merge tags' },
      { status: 500 }
    )
  }
}
