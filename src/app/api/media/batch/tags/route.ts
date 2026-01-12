/**
 * Batch Tag Operations API
 * POST /api/media/batch/tags - Add/remove tags from multiple media items
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface BatchTagRequest {
  mediaIds: string[]
  action: 'add' | 'remove' | 'set'
  tagIds: string[]
  source?: string
}

// POST - Batch add/remove tags
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body: BatchTagRequest = await request.json()

    const { mediaIds = [], action, tagIds = [], source = 'batch' } = body

    if (!mediaIds.length) {
      return NextResponse.json(
        { error: 'mediaIds array is required' },
        { status: 400 }
      )
    }

    if (!tagIds.length) {
      return NextResponse.json(
        { error: 'tagIds array is required' },
        { status: 400 }
      )
    }

    if (!['add', 'remove', 'set'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "add", "remove", or "set"' },
        { status: 400 }
      )
    }

    const results = {
      processed: 0,
      added: 0,
      removed: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Process each media item
    for (const mediaId of mediaIds) {
      try {
        if (action === 'set') {
          // First remove all existing tags
          await supabase
            .from('media_tags')
            .delete()
            .eq('media_asset_id', mediaId)

          // Then add the new tags
          for (const tagId of tagIds) {
            const { error } = await supabase
              .from('media_tags')
              .insert({
                media_asset_id: mediaId,
                tag_id: tagId,
                source
              })

            if (error && !error.message.includes('duplicate')) {
              results.errors.push(`Failed to set tag ${tagId} on ${mediaId}: ${error.message}`)
            } else if (!error) {
              results.added++
            }
          }
        } else if (action === 'add') {
          for (const tagId of tagIds) {
            // Check if already exists
            const { data: existing } = await supabase
              .from('media_tags')
              .select('id')
              .eq('media_asset_id', mediaId)
              .eq('tag_id', tagId)
              .single()

            if (existing) {
              results.skipped++
              continue
            }

            const { error } = await supabase
              .from('media_tags')
              .insert({
                media_asset_id: mediaId,
                tag_id: tagId,
                source
              })

            if (error) {
              results.errors.push(`Failed to add tag ${tagId} to ${mediaId}: ${error.message}`)
            } else {
              results.added++
            }
          }
        } else if (action === 'remove') {
          for (const tagId of tagIds) {
            const { error, count } = await supabase
              .from('media_tags')
              .delete()
              .eq('media_asset_id', mediaId)
              .eq('tag_id', tagId)

            if (error) {
              results.errors.push(`Failed to remove tag ${tagId} from ${mediaId}: ${error.message}`)
            } else {
              results.removed++
            }
          }
        }

        results.processed++
      } catch (err) {
        results.errors.push(`Error processing ${mediaId}: ${err}`)
      }
    }

    // Update usage counts for affected tags
    for (const tagId of tagIds) {
      const { count } = await supabase
        .from('media_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', tagId)

      await supabase
        .from('tags')
        .update({ usage_count: count || 0 })
        .eq('id', tagId)
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${results.processed} media items: ${results.added} tags added, ${results.removed} removed, ${results.skipped} skipped`
    })

  } catch (error) {
    console.error('Error in POST /api/media/batch/tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to batch process tags' },
      { status: 500 }
    )
  }
}
