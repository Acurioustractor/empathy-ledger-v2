/**
 * Video Thumbnail Utilities
 *
 * Client-side video thumbnail extraction using HTML5 Canvas.
 * Works with direct video files (MP4, WebM) from Supabase Storage.
 */

export interface ThumbnailOptions {
  /** Time in seconds to capture the thumbnail (default: 1) */
  timeInSeconds?: number
  /** Maximum width of the thumbnail (default: 640) */
  maxWidth?: number
  /** Maximum height of the thumbnail (default: 360) */
  maxHeight?: number
  /** Output format (default: 'image/jpeg') */
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
  /** Quality for JPEG/WebP (0-1, default: 0.85) */
  quality?: number
}

export interface ThumbnailResult {
  dataUrl: string
  blob: Blob
  width: number
  height: number
}

/**
 * Extract a thumbnail from a video URL
 */
export async function extractVideoThumbnail(
  videoUrl: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const {
    timeInSeconds = 1,
    maxWidth = 640,
    maxHeight = 360,
    format = 'image/jpeg',
    quality = 0.85
  } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      video.src = ''
    }

    const onError = (e: Event) => {
      cleanup()
      reject(new Error(`Failed to load video: ${(e as ErrorEvent).message || 'Unknown error'}`))
    }

    const onLoadedMetadata = () => {
      // Seek to the desired time (or use duration if time exceeds video length)
      const seekTime = Math.min(timeInSeconds, video.duration - 0.1)
      video.currentTime = Math.max(0, seekTime)
    }

    const onSeeked = () => {
      try {
        // Calculate dimensions while maintaining aspect ratio
        let width = video.videoWidth
        let height = video.videoHeight

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width
          height = maxHeight
        }

        width = Math.round(width)
        height = Math.round(height)

        // Create canvas and draw frame
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cleanup()
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(video, 0, 0, width, height)

        // Convert to data URL
        const dataUrl = canvas.toDataURL(format, quality)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            cleanup()
            if (blob) {
              resolve({
                dataUrl,
                blob,
                width,
                height
              })
            } else {
              reject(new Error('Failed to create blob from canvas'))
            }
          },
          format,
          quality
        )
      } catch (err) {
        cleanup()
        reject(err)
      }
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)

    // Start loading the video
    video.src = videoUrl
    video.load()
  })
}

/**
 * Extract multiple thumbnails from a video at different timestamps
 */
export async function extractVideoThumbnails(
  videoUrl: string,
  timestamps: number[],
  options: Omit<ThumbnailOptions, 'timeInSeconds'> = {}
): Promise<ThumbnailResult[]> {
  const results: ThumbnailResult[] = []

  for (const time of timestamps) {
    try {
      const result = await extractVideoThumbnail(videoUrl, {
        ...options,
        timeInSeconds: time
      })
      results.push(result)
    } catch (err) {
      console.error(`Failed to extract thumbnail at ${time}s:`, err)
    }
  }

  return results
}

/**
 * Upload a thumbnail blob to Supabase Storage
 */
export async function uploadThumbnailToStorage(
  blob: Blob,
  videoId: string,
  supabase: any // SupabaseClient
): Promise<string> {
  const filename = `video-thumbnails/${videoId}/${Date.now()}-thumbnail.jpg`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filename, blob, {
      contentType: blob.type,
      upsert: true
    })

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filename)

  return publicUrl
}

/**
 * Check if a URL points to a direct video file (not an embed)
 */
export function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.m4v']
  const lowerUrl = url.toLowerCase()

  return (
    videoExtensions.some(ext => lowerUrl.includes(ext)) ||
    url.includes('supabase.co/storage') ||
    url.includes('/storage/v1/object')
  )
}

/**
 * Get video duration from a URL
 */
export async function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      resolve(video.duration)
      video.src = ''
    }

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
      video.src = ''
    }

    video.src = videoUrl
  })
}
