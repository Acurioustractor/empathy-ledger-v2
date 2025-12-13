// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

import { createClient } from '@/lib/supabase/server'

import { v4 as uuidv4 } from 'uuid'



const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
const ALLOWED_TRANSCRIPT_TYPES = ['text/plain', 'text/srt', 'text/vtt', 'application/x-subrip']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain']

/**
 * Compute SHA-256 hash of file for deduplication
 */
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hash = createHash('sha256')
  hash.update(Buffer.from(buffer))
  return hash.digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 })
    }

    const supabase = createClient()
    
    // Set the auth token for this request
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const storyId = formData.get('storyId') as string
    const mediaType = formData.get('mediaType') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const transcriptFile = formData.get('transcriptFile') as File | null
    const skipDuplicateCheck = formData.get('skipDuplicateCheck') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 500MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_DOCUMENT_TYPES]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Determine media type from MIME type
    let detectedMediaType = 'file'
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) detectedMediaType = 'image'
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) detectedMediaType = 'video'
    if (ALLOWED_AUDIO_TYPES.includes(file.type)) detectedMediaType = 'audio'
    if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) detectedMediaType = 'document'

    // Compute file hash for deduplication
    const fileHash = await computeFileHash(file)

    // Check for existing file with same hash (deduplication)
    if (!skipDuplicateCheck) {
      const { data: existingMedia } = await supabase
        .from('media_assets')
        .select('id, url, filename, story_id, title')
        .eq('file_hash', fileHash)
        .limit(1)
        .single()

      if (existingMedia) {
        // File already exists - check if it's for the same story
        if (existingMedia.story_id === storyId) {
          return NextResponse.json({
            success: true,
            duplicate: true,
            message: 'This file is already attached to this story',
            media: {
              id: existingMedia.id,
              url: existingMedia.url,
              filename: existingMedia.filename,
              title: existingMedia.title,
              isExisting: true
            }
          })
        }

        // Different story - offer to link existing or upload new
        return NextResponse.json({
          success: false,
          duplicate: true,
          existingMedia: {
            id: existingMedia.id,
            url: existingMedia.url,
            filename: existingMedia.filename,
            title: existingMedia.title,
            storyId: existingMedia.story_id
          },
          message: 'This file already exists. You can link the existing file or upload a new copy.',
          canLink: true,
          canUploadNew: true
        }, { status: 409 })
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${user.id}/${detectedMediaType}s/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    // Handle transcript file upload if provided
    let transcriptFilePath: string | null = null
    let transcriptFormat: string | null = null
    if (transcriptFile && (detectedMediaType === 'video' || detectedMediaType === 'audio')) {
      const transcriptExt = transcriptFile.name.split('.').pop()?.toLowerCase()
      transcriptFormat = transcriptExt || 'txt'
      const transcriptFileName = `${uuidv4()}.${transcriptExt}`
      transcriptFilePath = `${user.id}/transcripts/${transcriptFileName}`

      const { error: transcriptUploadError } = await supabase.storage
        .from('media')
        .upload(transcriptFilePath, transcriptFile, {
          contentType: 'text/plain',
          upsert: false
        })

      if (transcriptUploadError) {
        console.error('Transcript upload error:', transcriptUploadError)
        // Continue without transcript - not a fatal error
        transcriptFilePath = null
      }
    }

    // Create media asset record in database
    const { data: mediaAsset, error: dbError } = await supabase
      .from('media_assets')
      .insert({
        id: uuidv4(),
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        media_type: detectedMediaType,
        url: publicUrl,
        title: title || file.name,
        description: description || null,
        uploaded_by: user.id,
        story_id: storyId || null,
        file_hash: fileHash,
        checksum: fileHash.substring(0, 16), // Short checksum for quick lookups
        transcript_file_path: transcriptFilePath,
        transcript_format: transcriptFormat,
        source_type: 'upload',
        metadata: {
          original_name: file.name,
          uploaded_at: new Date().toISOString(),
          storage_path: filePath,
          has_transcript_file: !!transcriptFilePath
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('media').remove([filePath])
      if (transcriptFilePath) {
        await supabase.storage.from('media').remove([transcriptFilePath])
      }
      return NextResponse.json({ error: 'Failed to save media metadata' }, { status: 500 })
    }

    // If it's audio or video and no transcript file provided, queue for transcription
    const needsTranscription = (detectedMediaType === 'audio' || detectedMediaType === 'video') && !transcriptFilePath
    if (needsTranscription) {
      // Queue transcription job
      await supabase
        .from('transcription_jobs')
        .insert({
          id: uuidv4(),
          media_asset_id: mediaAsset.id,
          status: 'pending',
          created_by: user.id
        })
    }

    // If transcript file was provided, parse and store the transcript
    if (transcriptFilePath && transcriptFile) {
      const transcriptText = await transcriptFile.text()

      // Create transcript record linked to story
      await supabase
        .from('transcripts')
        .insert({
          story_id: storyId || null,
          media_asset_id: mediaAsset.id,
          storyteller_id: user.id,
          title: `Transcript: ${title || file.name}`,
          content: transcriptText,
          transcript_text: transcriptText,
          status: 'completed',
          created_by: user.id,
          source_type: 'uploaded',
          metadata: {
            format: transcriptFormat,
            file_path: transcriptFilePath,
            uploaded_at: new Date().toISOString()
          }
        })
    }

    return NextResponse.json({
      success: true,
      media: {
        id: mediaAsset.id,
        url: publicUrl,
        type: detectedMediaType,
        filename: file.name,
        size: file.size,
        title: mediaAsset.title,
        fileHash: fileHash,
        hasTranscriptFile: !!transcriptFilePath,
        needsTranscription
      }
    })

  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get media assets for a story or user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const storyId = searchParams.get('storyId')
    const userId = searchParams.get('userId')
    const mediaType = searchParams.get('type')
    
    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (storyId) {
      query = query.eq('story_id', storyId)
    }
    
    if (userId) {
      query = query.eq('uploaded_by', userId)
    }
    
    if (mediaType) {
      query = query.eq('media_type', mediaType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching media:', error)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    return NextResponse.json({ media: data || [] })

  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}