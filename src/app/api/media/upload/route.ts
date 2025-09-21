import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']

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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 500MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Determine media type from MIME type
    let detectedMediaType = 'file'
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) detectedMediaType = 'image'
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) detectedMediaType = 'video'
    if (ALLOWED_AUDIO_TYPES.includes(file.type)) detectedMediaType = 'audio'

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
        metadata: {
          original_name: file.name,
          uploaded_at: new Date().toISOString(),
          storage_path: filePath
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('media').remove([filePath])
      return NextResponse.json({ error: 'Failed to save media metadata' }, { status: 500 })
    }

    // If it's audio or video, queue for transcription
    if (detectedMediaType === 'audio' || detectedMediaType === 'video') {
      // Queue transcription job (we'll implement this next)
      await supabase
        .from('transcription_jobs')
        .insert({
          id: uuidv4(),
          media_asset_id: mediaAsset.id,
          status: 'pending',
          created_by: user.id
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
        needsTranscription: detectedMediaType === 'audio' || detectedMediaType === 'video'
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