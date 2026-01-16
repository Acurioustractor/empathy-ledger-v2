// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/admin/media/verify-tags
 *
 * Verify or reject AI-generated tags for a media asset.
 * This allows staff to review auto-generated tags and either:
 * - Verify them as accurate (moved to verified_tags)
 * - Reject them (removed from auto_tags)
 * - Add new tags (added to verified_tags)
 *
 * Request body:
 * - mediaId: string - The media asset ID
 * - action: 'verify' | 'reject' | 'add' | 'remove'
 * - tags: string[] - Tags to process
 *
 * Returns:
 * - Updated tag lists
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { mediaId, action, tags } = body as {
      mediaId: string
      action: 'verify' | 'reject' | 'add' | 'remove'
      tags: string[]
    }

    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId is required' },
        { status: 400 }
      )
    }

    if (!action || !['verify', 'reject', 'add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: verify, reject, add, remove' },
        { status: 400 }
      )
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'tags array is required' },
        { status: 400 }
      )
    }

    // Get current analysis record
    const { data: analysis, error: fetchError } = await supabase
      .from('media_ai_analysis')
      .select('id, auto_tags, verified_tags')
      .eq('media_asset_id', mediaId)
      .single()

    if (fetchError || !analysis) {
      // If no analysis record exists, create one
      if (action === 'add') {
        const { data: newAnalysis, error: createError } = await supabase
          .from('media_ai_analysis')
          .insert({
            media_asset_id: mediaId,
            auto_tags: [],
            verified_tags: tags,
            processing_status: 'manual'
          })
          .select('id, auto_tags, verified_tags')
          .single()

        if (createError) {
          console.error('Error creating analysis record:', createError)
          return NextResponse.json(
            { error: 'Failed to create analysis record' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          mediaId,
          autoTags: [],
          verifiedTags: tags,
          message: 'Tags added successfully'
        })
      }

      return NextResponse.json(
        { error: 'No analysis record found for this media. Run AI analysis first.' },
        { status: 404 }
      )
    }

    const autoTags: string[] = analysis.auto_tags || []
    const verifiedTags: string[] = analysis.verified_tags || []

    let updatedAutoTags = [...autoTags]
    let updatedVerifiedTags = [...verifiedTags]

    switch (action) {
      case 'verify':
        // Move tags from auto to verified
        for (const tag of tags) {
          // Remove from auto_tags if present
          updatedAutoTags = updatedAutoTags.filter(t => t !== tag)
          // Add to verified_tags if not already there
          if (!updatedVerifiedTags.includes(tag)) {
            updatedVerifiedTags.push(tag)
          }
        }
        break

      case 'reject':
        // Remove tags from auto_tags
        updatedAutoTags = updatedAutoTags.filter(t => !tags.includes(t))
        break

      case 'add':
        // Add new tags to verified_tags
        for (const tag of tags) {
          if (!updatedVerifiedTags.includes(tag)) {
            updatedVerifiedTags.push(tag)
          }
        }
        break

      case 'remove':
        // Remove tags from both auto and verified
        updatedAutoTags = updatedAutoTags.filter(t => !tags.includes(t))
        updatedVerifiedTags = updatedVerifiedTags.filter(t => !tags.includes(t))
        break
    }

    // Update the analysis record
    const { error: updateError } = await supabase
      .from('media_ai_analysis')
      .update({
        auto_tags: updatedAutoTags,
        verified_tags: updatedVerifiedTags,
        last_verified_at: new Date().toISOString()
      })
      .eq('media_asset_id', mediaId)

    if (updateError) {
      console.error('Error updating tags:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tags' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mediaId,
      action,
      processedTags: tags,
      autoTags: updatedAutoTags,
      verifiedTags: updatedVerifiedTags,
      message: `Tags ${action}d successfully`
    })

  } catch (error) {
    console.error('Error processing tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process tags' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/media/verify-tags
 *
 * Get tags for a media asset
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId query parameter is required' },
        { status: 400 }
      )
    }

    const { data: analysis, error } = await supabase
      .from('media_ai_analysis')
      .select('auto_tags, verified_tags, last_verified_at')
      .eq('media_asset_id', mediaId)
      .single()

    if (error || !analysis) {
      return NextResponse.json({
        mediaId,
        autoTags: [],
        verifiedTags: [],
        lastVerifiedAt: null
      })
    }

    return NextResponse.json({
      mediaId,
      autoTags: analysis.auto_tags || [],
      verifiedTags: analysis.verified_tags || [],
      allTags: [...new Set([
        ...(analysis.auto_tags || []),
        ...(analysis.verified_tags || [])
      ])],
      lastVerifiedAt: analysis.last_verified_at
    })

  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/media/verify-tags
 *
 * Batch verify/reject tags (for processing multiple media at once)
 *
 * Request body:
 * - items: Array<{ mediaId: string, action: string, tags: string[] }>
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { items } = body as {
      items: Array<{
        mediaId: string
        action: 'verify' | 'reject' | 'add' | 'remove'
        tags: string[]
      }>
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 }
      )
    }

    const results: Array<{
      mediaId: string
      success: boolean
      error?: string
    }> = []

    for (const item of items) {
      try {
        // Get current analysis
        const { data: analysis } = await supabase
          .from('media_ai_analysis')
          .select('auto_tags, verified_tags')
          .eq('media_asset_id', item.mediaId)
          .single()

        if (!analysis) {
          results.push({
            mediaId: item.mediaId,
            success: false,
            error: 'No analysis record found'
          })
          continue
        }

        const autoTags: string[] = analysis.auto_tags || []
        const verifiedTags: string[] = analysis.verified_tags || []

        let updatedAutoTags = [...autoTags]
        let updatedVerifiedTags = [...verifiedTags]

        switch (item.action) {
          case 'verify':
            for (const tag of item.tags) {
              updatedAutoTags = updatedAutoTags.filter(t => t !== tag)
              if (!updatedVerifiedTags.includes(tag)) {
                updatedVerifiedTags.push(tag)
              }
            }
            break
          case 'reject':
            updatedAutoTags = updatedAutoTags.filter(t => !item.tags.includes(t))
            break
          case 'add':
            for (const tag of item.tags) {
              if (!updatedVerifiedTags.includes(tag)) {
                updatedVerifiedTags.push(tag)
              }
            }
            break
          case 'remove':
            updatedAutoTags = updatedAutoTags.filter(t => !item.tags.includes(t))
            updatedVerifiedTags = updatedVerifiedTags.filter(t => !item.tags.includes(t))
            break
        }

        const { error: updateError } = await supabase
          .from('media_ai_analysis')
          .update({
            auto_tags: updatedAutoTags,
            verified_tags: updatedVerifiedTags,
            last_verified_at: new Date().toISOString()
          })
          .eq('media_asset_id', item.mediaId)

        results.push({
          mediaId: item.mediaId,
          success: !updateError,
          error: updateError?.message
        })
      } catch (itemError) {
        results.push({
          mediaId: item.mediaId,
          success: false,
          error: itemError instanceof Error ? itemError.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: failCount === 0,
      processed: results.length,
      successCount,
      failCount,
      results
    })

  } catch (error) {
    console.error('Error batch processing tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to batch process tags' },
      { status: 500 }
    )
  }
}
