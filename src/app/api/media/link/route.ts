export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/media/link
 *
 * Links an existing media asset to a story (without uploading a new file)
 * This is useful for deduplication - reusing the same media across stories
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mediaId, storyId } = await request.json()

    if (!mediaId || !storyId) {
      return NextResponse.json({ error: 'mediaId and storyId are required' }, { status: 400 })
    }

    // Verify the media asset exists
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select('id, filename, url, media_type')
      .eq('id', mediaId)
      .single()

    if (mediaError || !mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Verify the story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Check if already linked via media_usage_tracking
    const { data: existingUsage } = await supabase
      .from('media_usage_tracking')
      .select('id')
      .eq('media_asset_id', mediaId)
      .eq('used_in_id', storyId)
      .eq('used_in_type', 'story')
      .is('removed_at', null)
      .single()

    if (existingUsage) {
      return NextResponse.json({
        success: true,
        message: 'Media already linked to this story',
        alreadyLinked: true
      })
    }

    // Create usage tracking record
    const { error: usageError } = await supabase
      .from('media_usage_tracking')
      .insert({
        media_asset_id: mediaId,
        used_in_type: 'story',
        used_in_id: storyId,
        usage_role: 'attachment',
        added_by: user.id
      })

    if (usageError) {
      console.error('Error creating usage tracking:', usageError)
      return NextResponse.json({ error: 'Failed to link media' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Media linked to story successfully',
      media: {
        id: mediaAsset.id,
        filename: mediaAsset.filename,
        url: mediaAsset.url,
        type: mediaAsset.media_type
      }
    })

  } catch (error) {
    console.error('Link media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/media/link
 *
 * Removes the link between a media asset and a story
 * (Soft delete via removed_at timestamp)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')
    const storyId = searchParams.get('storyId')

    if (!mediaId || !storyId) {
      return NextResponse.json({ error: 'mediaId and storyId are required' }, { status: 400 })
    }

    // Soft delete the usage tracking record
    const { error } = await supabase
      .from('media_usage_tracking')
      .update({ removed_at: new Date().toISOString() })
      .eq('media_asset_id', mediaId)
      .eq('used_in_id', storyId)
      .eq('used_in_type', 'story')

    if (error) {
      console.error('Error unlinking media:', error)
      return NextResponse.json({ error: 'Failed to unlink media' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Media unlinked from story'
    })

  } catch (error) {
    console.error('Unlink media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
