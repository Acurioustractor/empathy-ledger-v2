/**
 * Video Processing Service
 *
 * Handles video transcoding, thumbnail generation, and delivery optimization.
 * Supports multiple backends: Mux, AWS MediaConvert, or direct upload.
 *
 * For full transcoding features, configure one of:
 * - MUX_TOKEN_ID and MUX_TOKEN_SECRET for Mux
 * - AWS credentials for MediaConvert
 */

export type VideoProcessingBackend = 'mux' | 'aws' | 'direct'
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted'

export interface VideoAsset {
  id: string
  externalId?: string // Mux asset ID, MediaConvert job ID, etc.
  status: VideoStatus
  originalUrl: string
  playbackUrl?: string
  thumbnailUrl?: string
  duration?: number
  width?: number
  height?: number
  aspectRatio?: string
  createdAt: string
  processedAt?: string
  error?: string
}

export interface VideoUploadResult {
  assetId: string
  uploadUrl?: string // For direct uploads
  playbackUrl?: string
  thumbnailUrl?: string
}

export interface VideoProcessingOptions {
  generateThumbnails?: boolean
  thumbnailTime?: number // seconds
  maxResolution?: '720p' | '1080p' | '4k'
  watermark?: {
    url: string
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
}

// Get configured backend
function getBackend(): VideoProcessingBackend {
  if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
    return 'mux'
  }
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_MEDIACONVERT_ENDPOINT) {
    return 'aws'
  }
  return 'direct'
}

/**
 * Create a video upload URL or process a video
 */
export async function createVideoUpload(
  options: VideoProcessingOptions = {}
): Promise<VideoUploadResult> {
  const backend = getBackend()

  switch (backend) {
    case 'mux':
      return createMuxUpload(options)
    case 'aws':
      return createAWSUpload(options)
    default:
      // Direct upload - no transcoding, just return upload URL
      return {
        assetId: `direct-${Date.now()}`,
        uploadUrl: undefined // Use standard Supabase upload
      }
  }
}

/**
 * Get video asset status and URLs
 */
export async function getVideoAsset(assetId: string): Promise<VideoAsset | null> {
  const backend = getBackend()

  switch (backend) {
    case 'mux':
      return getMuxAsset(assetId)
    case 'aws':
      return getAWSAsset(assetId)
    default:
      // Direct upload - asset info from database
      return null
  }
}

/**
 * Delete a video asset
 */
export async function deleteVideoAsset(assetId: string): Promise<boolean> {
  const backend = getBackend()

  switch (backend) {
    case 'mux':
      return deleteMuxAsset(assetId)
    case 'aws':
      return deleteAWSAsset(assetId)
    default:
      return true // Direct assets are deleted via Supabase
  }
}

// =============================================================================
// Mux Integration
// =============================================================================
// Note: Mux SDK is optional. Install with `npm install @mux/mux-node` to enable.
// Without it, the system falls back to direct upload mode.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let muxClient: any = null
let muxLoadAttempted = false
let muxLoadError: Error | null = null

async function getMuxClient() {
  // Only attempt to load once
  if (muxLoadAttempted) {
    if (muxLoadError) throw muxLoadError
    return muxClient
  }

  muxLoadAttempted = true

  try {
    // Use dynamic module name to prevent Next.js from static analysis
    // This allows the build to succeed even if @mux/mux-node isn't installed
    const moduleName = '@mux/mux-node'
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Mux = require(moduleName).default || require(moduleName)
    muxClient = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!
    })
    return muxClient
  } catch (err) {
    muxLoadError = new Error(
      'Mux SDK not installed. Run `npm install @mux/mux-node` to enable video transcoding, ' +
      'or remove MUX_TOKEN_ID/MUX_TOKEN_SECRET env vars to use direct upload mode.'
    )
    throw muxLoadError
  }
}

async function createMuxUpload(options: VideoProcessingOptions): Promise<VideoUploadResult> {
  try {
    const mux = await getMuxClient()

    // Create a direct upload
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: options.maxResolution === '4k' ? 'plus' : 'basic',
        ...(options.generateThumbnails !== false && {
          master_access: 'temporary' // Allow thumbnail generation
        })
      }
    })

    return {
      assetId: upload.id,
      uploadUrl: upload.url
    }
  } catch (error) {
    console.error('Mux upload creation failed:', error)
    // Fall back to direct upload if Mux fails
    if (error instanceof Error && error.message.includes('Mux SDK not installed')) {
      console.warn('Falling back to direct upload mode')
      return {
        assetId: `direct-${Date.now()}`,
        uploadUrl: undefined
      }
    }
    throw new Error('Failed to create video upload')
  }
}

async function getMuxAsset(assetId: string): Promise<VideoAsset | null> {
  try {
    const mux = await getMuxClient()

    // First try to get the upload to find the asset
    const upload = await mux.video.uploads.retrieve(assetId)

    if (!upload.asset_id) {
      return {
        id: assetId,
        status: upload.status === 'waiting' ? 'uploading' : 'processing',
        originalUrl: '',
        createdAt: new Date().toISOString()
      }
    }

    // Get the actual asset
    const asset = await mux.video.assets.retrieve(upload.asset_id)

    const playbackId = asset.playback_ids?.[0]?.id

    return {
      id: assetId,
      externalId: asset.id,
      status: asset.status === 'ready' ? 'ready' :
              asset.status === 'errored' ? 'failed' : 'processing',
      originalUrl: '',
      playbackUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : undefined,
      thumbnailUrl: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : undefined,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      createdAt: asset.created_at,
      error: asset.errors?.messages?.join(', ')
    }
  } catch (error) {
    console.error('Failed to get Mux asset:', error)
    return null
  }
}

async function deleteMuxAsset(assetId: string): Promise<boolean> {
  try {
    const mux = await getMuxClient()
    const upload = await mux.video.uploads.retrieve(assetId)

    if (upload.asset_id) {
      await mux.video.assets.delete(upload.asset_id)
    }

    return true
  } catch (error) {
    console.error('Failed to delete Mux asset:', error)
    return false
  }
}

// =============================================================================
// AWS MediaConvert Integration (Placeholder)
// =============================================================================

async function createAWSUpload(options: VideoProcessingOptions): Promise<VideoUploadResult> {
  // AWS MediaConvert requires:
  // 1. Upload to S3
  // 2. Create MediaConvert job
  // 3. Poll for completion
  // 4. Return CloudFront URLs

  throw new Error('AWS MediaConvert integration not yet implemented. Configure Mux for transcoding.')
}

async function getAWSAsset(assetId: string): Promise<VideoAsset | null> {
  throw new Error('AWS MediaConvert integration not yet implemented')
}

async function deleteAWSAsset(assetId: string): Promise<boolean> {
  throw new Error('AWS MediaConvert integration not yet implemented')
}

// =============================================================================
// Video Format Utilities
// =============================================================================

export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
]

export const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024 // 2GB

export function isValidVideoFormat(mimeType: string): boolean {
  return SUPPORTED_VIDEO_FORMATS.includes(mimeType.toLowerCase())
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// =============================================================================
// Playback URL Generation
// =============================================================================

export interface PlaybackOptions {
  quality?: 'auto' | 'low' | 'medium' | 'high'
  format?: 'hls' | 'dash' | 'mp4'
  startTime?: number
}

export function getPlaybackUrl(
  asset: VideoAsset,
  options: PlaybackOptions = {}
): string {
  if (!asset.playbackUrl) {
    return asset.originalUrl
  }

  // Mux playback URLs
  if (asset.playbackUrl.includes('stream.mux.com')) {
    const { format = 'hls', quality = 'auto' } = options
    const playbackId = asset.playbackUrl.split('/').pop()?.replace('.m3u8', '')

    if (format === 'mp4') {
      // Low-latency MP4
      const resolution = quality === 'low' ? 'low' :
                        quality === 'medium' ? 'medium' : 'high'
      return `https://stream.mux.com/${playbackId}/${resolution}.mp4`
    }

    return asset.playbackUrl
  }

  return asset.playbackUrl
}

export function getThumbnailUrl(
  asset: VideoAsset,
  options: { width?: number; height?: number; time?: number } = {}
): string {
  if (!asset.thumbnailUrl) {
    return ''
  }

  // Mux thumbnail URLs
  if (asset.thumbnailUrl.includes('image.mux.com')) {
    const { width = 640, height, time } = options
    const playbackId = asset.thumbnailUrl.split('/').pop()?.replace('/thumbnail.jpg', '')

    let url = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}`
    if (height) url += `&height=${height}`
    if (time) url += `&time=${time}`

    return url
  }

  return asset.thumbnailUrl
}
