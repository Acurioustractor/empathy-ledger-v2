/**
 * Video Thumbnail Management API
 * POST /api/videos/[id]/thumbnail - Upload custom thumbnail
 * PUT /api/videos/[id]/thumbnail - Refresh thumbnail from source (Descript, etc.)
 * DELETE /api/videos/[id]/thumbnail - Reset to auto-generated thumbnail
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Fetch thumbnail from Descript page meta tags
async function fetchDescriptThumbnail(videoId: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://share.descript.com/view/${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EmpathyLedger/1.0)'
      }
    })

    if (!response.ok) return undefined

    const html = await response.text()

    // Look for og:image meta tag
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

    if (ogImageMatch?.[1]) {
      return ogImageMatch[1]
    }

    // Look for twitter:image as fallback
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)

    if (twitterImageMatch?.[1]) {
      return twitterImageMatch[1]
    }

    return undefined
  } catch (error) {
    console.error('Error fetching Descript thumbnail:', error)
    return undefined
  }
}

// Parse Descript URL to get video ID
function parseDescriptVideoId(url: string): string | null {
  const shareMatch = url.match(/share\.descript\.com\/view\/([a-zA-Z0-9_-]+)/)
  if (shareMatch) return shareMatch[1]

  const embedMatch = url.match(/share\.descript\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) return embedMatch[1]

  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()

    // Check content type
    const contentType = request.headers.get('content-type')

    let thumbnailUrl: string

    if (contentType?.includes('application/json')) {
      // URL-based thumbnail update
      const body = await request.json()
      thumbnailUrl = body.thumbnailUrl

      if (!thumbnailUrl) {
        return NextResponse.json(
          { error: 'Thumbnail URL is required' },
          { status: 400 }
        )
      }
    } else if (contentType?.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData()
      const file = formData.get('thumbnail') as File

      if (!file) {
        return NextResponse.json(
          { error: 'Thumbnail file is required' },
          { status: 400 }
        )
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image' },
          { status: 400 }
        )
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 5MB' },
          { status: 400 }
        )
      }

      // Upload to Supabase Storage
      const fileName = `video-thumbnails/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload thumbnail' },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      thumbnailUrl = publicUrl
    } else {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    // Update video with new thumbnail
    const { data: video, error: updateError } = await supabase
      .from('video_links')
      .update({ custom_thumbnail_url: thumbnailUrl })
      .eq('id', id)
      .select('id, title, thumbnail_url, custom_thumbnail_url')
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      throw updateError
    }

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.custom_thumbnail_url || video.thumbnail_url,
        customThumbnailUrl: video.custom_thumbnail_url,
        autoThumbnailUrl: video.thumbnail_url
      }
    })

  } catch (error) {
    console.error('Error updating thumbnail:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update thumbnail' },
      { status: 500 }
    )
  }
}

// PUT - Refresh thumbnail from source (Descript, YouTube, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()

    // Get video to check platform
    const { data: video, error: fetchError } = await supabase
      .from('video_links')
      .select('id, title, video_url, platform, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      throw fetchError
    }

    let newThumbnailUrl: string | undefined

    // Fetch thumbnail based on platform
    if (video.platform === 'descript') {
      const videoId = parseDescriptVideoId(video.video_url)
      if (videoId) {
        newThumbnailUrl = await fetchDescriptThumbnail(videoId)
      }
    } else if (video.platform === 'youtube') {
      // YouTube thumbnails can be constructed from video ID
      const videoIdMatch = video.video_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      if (videoIdMatch?.[1]) {
        newThumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`
      }
    }

    if (!newThumbnailUrl) {
      return NextResponse.json(
        { error: 'Could not fetch thumbnail from source' },
        { status: 400 }
      )
    }

    // Update video with refreshed thumbnail
    const { data: updatedVideo, error: updateError } = await supabase
      .from('video_links')
      .update({ thumbnail_url: newThumbnailUrl })
      .eq('id', id)
      .select('id, title, thumbnail_url, custom_thumbnail_url')
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      video: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        thumbnailUrl: updatedVideo.custom_thumbnail_url || updatedVideo.thumbnail_url,
        customThumbnailUrl: updatedVideo.custom_thumbnail_url,
        autoThumbnailUrl: updatedVideo.thumbnail_url
      },
      message: 'Thumbnail refreshed from source'
    })

  } catch (error) {
    console.error('Error refreshing thumbnail:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh thumbnail' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()

    // Get current video to find custom thumbnail path
    const { data: video, error: fetchError } = await supabase
      .from('video_links')
      .select('id, custom_thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      throw fetchError
    }

    // Delete from storage if it's a Supabase URL
    if (video.custom_thumbnail_url?.includes('supabase')) {
      const urlPath = new URL(video.custom_thumbnail_url).pathname
      const storagePath = urlPath.split('/storage/v1/object/public/media/')[1]
      if (storagePath) {
        await supabase.storage.from('media').remove([storagePath])
      }
    }

    // Clear custom thumbnail
    const { data: updatedVideo, error: updateError } = await supabase
      .from('video_links')
      .update({ custom_thumbnail_url: null })
      .eq('id', id)
      .select('id, title, thumbnail_url, custom_thumbnail_url')
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      video: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        thumbnailUrl: updatedVideo.thumbnail_url,
        customThumbnailUrl: null,
        autoThumbnailUrl: updatedVideo.thumbnail_url
      }
    })

  } catch (error) {
    console.error('Error resetting thumbnail:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset thumbnail' },
      { status: 500 }
    )
  }
}
