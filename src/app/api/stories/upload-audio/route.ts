import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const storyId = formData.get('story_id') as string | null
    const durationStr = formData.get('duration') as string | null

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    if (!allowedTypes.some(type => audioFile.type.startsWith(type.split('/')[0]))) {
      return NextResponse.json(
        { error: 'Invalid audio file type' },
        { status: 400 }
      )
    }

    // Max file size: 100MB
    const maxSize = 100 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = audioFile.name.split('.').pop() || 'webm'
    const filename = `recordings/${user.id}/${timestamp}.${extension}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Normalize content type - Supabase doesn't accept codec suffixes like "audio/webm;codecs=opus"
    // Strip everything after semicolon to get base mime type
    const contentType = audioFile.type.split(';')[0] || 'audio/webm'

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, buffer, {
        contentType,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filename)

    const audioUrl = urlData.publicUrl

    // Parse duration
    const duration = durationStr ? parseInt(durationStr, 10) : null

    // If story_id provided, create a transcript record linked to the story
    let transcriptId: string | null = null
    if (storyId) {
      // Verify user has access to this story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('id, author_id, organization_id')
        .eq('id', storyId)
        .single()

      if (storyError || !story) {
        console.error('Story not found:', storyError)
        // Still return success - audio uploaded, just not linked
      } else {
        // Create transcript record for transcription processing
        const { data: transcript, error: transcriptError } = await supabase
          .from('transcripts')
          .insert({
            story_id: storyId,
            audio_url: audioUrl,
            duration_seconds: duration,
            status: 'pending', // Will be processed by transcription service
            created_by: user.id,
            organization_id: story.organization_id
          })
          .select('id')
          .single()

        if (transcriptError) {
          console.error('Failed to create transcript record:', transcriptError)
        } else {
          transcriptId = transcript.id

          // Trigger async transcription (fire and forget)
          triggerTranscription(transcriptId, audioUrl).catch(err => {
            console.error('Failed to trigger transcription:', err)
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: audioUrl,
      filename,
      duration,
      transcriptId,
      message: transcriptId
        ? 'Audio uploaded. Transcription in progress...'
        : 'Audio uploaded successfully'
    })

  } catch (error) {
    console.error('Upload audio error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Trigger async transcription processing
 * This calls the transcription API endpoint which will process in the background
 */
async function triggerTranscription(transcriptId: string, audioUrl: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Fire and forget - don't await
  fetch(`${baseUrl}/api/transcripts/${transcriptId}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Use service key for internal API calls
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ audioUrl })
  }).catch(err => {
    console.error('Transcription trigger failed:', err)
  })
}
