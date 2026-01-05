import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300 // 5 minutes for large file uploads

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const storyId = formData.get('storyId') as string | null
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get user's storyteller profile
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Storyteller profile not found' },
        { status: 404 }
      )
    }

    // Determine media type
    let mediaType: 'image' | 'audio' | 'video' | 'document' = 'document'
    if (file.type.startsWith('image/')) mediaType = 'image'
    else if (file.type.startsWith('audio/')) mediaType = 'audio'
    else if (file.type.startsWith('video/')) mediaType = 'video'

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${profile.tenant_id}/${profile.id}/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    // Create media asset record
    const { data: mediaAsset, error: dbError } = await supabase
      .from('media_assets')
      .insert({
        tenant_id: profile.tenant_id,
        uploader_id: profile.id,
        url: publicUrl,
        storage_path: filePath,
        type: mediaType,
        title: title || file.name,
        file_size: file.size,
        mime_type: file.type,
        upload_status: 'ready'
      })
      .select('*')
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('media').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to create media record' },
        { status: 500 }
      )
    }

    // Link to story if provided
    if (storyId) {
      await supabase.from('story_media').insert({
        story_id: storyId,
        media_asset_id: mediaAsset.id,
        display_order: 0
      })
    }

    // Check if transcription is needed
    const needsTranscription = mediaType === 'audio' || mediaType === 'video'

    return NextResponse.json({
      media: {
        ...mediaAsset,
        needsTranscription
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/media/upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
