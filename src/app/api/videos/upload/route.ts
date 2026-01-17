/**
 * Video Upload API
 *
 * POST /api/videos/upload - Create upload URL for video processing
 * GET /api/videos/upload?uploadId=xxx - Check upload status
 *
 * Supports multiple backends:
 * - Mux (if MUX_TOKEN_ID configured)
 * - Direct Supabase upload (fallback)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth/api-auth'
import {
  createVideoUpload,
  getVideoAsset,
  VideoProcessingOptions
} from '@/lib/media/video-processing'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST - Create video upload
export async function POST(request: NextRequest) {
  // Authenticate user
  const { user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  let body: {
    filename?: string
    contentType?: string
    options?: VideoProcessingOptions
    storyId?: string
    transcriptId?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { filename, contentType, options = {}, storyId, transcriptId } = body

  // Validate content type
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  if (contentType && !validTypes.includes(contentType)) {
    return NextResponse.json(
      { error: `Invalid content type. Supported: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    // Create upload via configured backend (Mux, AWS, or direct)
    const uploadResult = await createVideoUpload(options)

    const supabase = createSupabaseClient()

    // Create video record in database
    const { data: videoRecord, error: dbError } = await supabase
      .from('video_links')
      .insert({
        uploader_id: user.id,
        title: filename || 'Untitled Video',
        status: 'uploading',
        processing_backend: process.env.MUX_TOKEN_ID ? 'mux' : 'direct',
        external_asset_id: uploadResult.assetId,
        story_id: storyId || null,
        transcript_id: transcriptId || null,
        metadata: {
          originalFilename: filename,
          contentType,
          uploadOptions: options
        }
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Failed to create video record:', dbError)
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      videoId: videoRecord.id,
      uploadId: uploadResult.assetId,
      uploadUrl: uploadResult.uploadUrl,
      // If no uploadUrl (direct backend), client should use standard upload endpoint
      useDirectUpload: !uploadResult.uploadUrl,
      directUploadPath: !uploadResult.uploadUrl
        ? `/api/media/upload?type=video&videoId=${videoRecord.id}`
        : undefined
    })

  } catch (error) {
    console.error('Video upload creation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create video upload' },
      { status: 500 }
    )
  }
}

// GET - Check upload/processing status
export async function GET(request: NextRequest) {
  const uploadId = request.nextUrl.searchParams.get('uploadId')
  const videoId = request.nextUrl.searchParams.get('videoId')

  if (!uploadId && !videoId) {
    return NextResponse.json(
      { error: 'uploadId or videoId required' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseClient()

  // Get video record
  let query = supabase.from('video_links').select('*')

  if (videoId) {
    query = query.eq('id', videoId)
  } else if (uploadId) {
    query = query.eq('external_asset_id', uploadId)
  }

  const { data: video, error: dbError } = await query.single()

  if (dbError || !video) {
    return NextResponse.json(
      { error: 'Video not found' },
      { status: 404 }
    )
  }

  // If using Mux, get latest status from Mux
  if (video.processing_backend === 'mux' && video.external_asset_id) {
    try {
      const asset = await getVideoAsset(video.external_asset_id)

      if (asset) {
        // Update local record if status changed
        if (asset.status !== video.status || asset.playbackUrl !== video.video_url) {
          await supabase
            .from('video_links')
            .update({
              status: asset.status,
              video_url: asset.playbackUrl || video.video_url,
              thumbnail_url: asset.thumbnailUrl || video.thumbnail_url,
              duration: asset.duration || video.duration,
              processing_error: asset.error
            })
            .eq('id', video.id)
        }

        return NextResponse.json({
          videoId: video.id,
          status: asset.status,
          playbackUrl: asset.playbackUrl,
          thumbnailUrl: asset.thumbnailUrl,
          duration: asset.duration,
          error: asset.error
        })
      }
    } catch (error) {
      console.error('Failed to get Mux asset status:', error)
    }
  }

  // Return local status
  return NextResponse.json({
    videoId: video.id,
    status: video.status,
    playbackUrl: video.video_url,
    thumbnailUrl: video.thumbnail_url || video.custom_thumbnail_url,
    duration: video.duration,
    error: video.processing_error
  })
}
