import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for longer audio files

interface TranscribeParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/transcripts/[id]/transcribe
 *
 * Triggers transcription of an audio file associated with a transcript record.
 * This is called automatically after audio upload, or can be triggered manually.
 *
 * For production, integrate with:
 * - OpenAI Whisper API
 * - Deepgram
 * - AssemblyAI
 * - AWS Transcribe
 */
export async function POST(request: NextRequest, { params }: TranscribeParams) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()

    // Verify authorization (internal service call or admin)
    const authHeader = request.headers.get('authorization')
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Allow service role key for internal calls
    const isServiceCall = authHeader === `Bearer ${serviceKey}`

    if (!isServiceCall) {
      // Check user auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Get transcript record
    const { data: transcript, error: fetchError } = await supabase
      .from('transcripts')
      .select('id, audio_url, status, story_id')
      .eq('id', id)
      .single()

    if (fetchError || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    if (!transcript.audio_url) {
      return NextResponse.json(
        { error: 'No audio file associated with this transcript' },
        { status: 400 }
      )
    }

    // Update status to processing
    await supabase
      .from('transcripts')
      .update({ status: 'processing' })
      .eq('id', id)

    // Get audio URL from request body if provided (override)
    const body = await request.json().catch(() => ({}))
    const audioUrl = body.audioUrl || transcript.audio_url

    try {
      // Call transcription service
      const transcriptionResult = await transcribeAudio(audioUrl)

      // Update transcript with results
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({
          content: transcriptionResult.text,
          status: 'completed',
          // Store segments if available (for timestamped playback)
          metadata: {
            segments: transcriptionResult.segments,
            language: transcriptionResult.language,
            duration: transcriptionResult.duration,
            transcribed_at: new Date().toISOString()
          }
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        transcriptId: id,
        text: transcriptionResult.text,
        segments: transcriptionResult.segments?.length || 0,
        language: transcriptionResult.language
      })

    } catch (transcriptionError) {
      console.error('Transcription failed:', transcriptionError)

      // Update status to failed
      await supabase
        .from('transcripts')
        .update({
          status: 'failed',
          metadata: {
            error: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error',
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', id)

      return NextResponse.json(
        { error: 'Transcription failed', details: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Transcribe endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface TranscriptionResult {
  text: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
  language?: string
  duration?: number
}

/**
 * Transcribe audio using the configured provider.
 *
 * Currently uses OpenAI Whisper API.
 * To switch providers, update this function.
 */
async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  const openaiKey = process.env.OPENAI_API_KEY

  if (!openaiKey) {
    // Development fallback - return placeholder
    console.warn('OPENAI_API_KEY not set, using placeholder transcription')
    return {
      text: '[Transcription pending - configure OPENAI_API_KEY for automatic transcription]',
      language: 'en',
      duration: 0
    }
  }

  // Download audio file
  const audioResponse = await fetch(audioUrl)
  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio: ${audioResponse.statusText}`)
  }

  const audioBlob = await audioResponse.blob()

  // Create form data for Whisper API
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'segment')

  // Call OpenAI Whisper API
  const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`
    },
    body: formData
  })

  if (!whisperResponse.ok) {
    const errorText = await whisperResponse.text()
    throw new Error(`Whisper API error: ${errorText}`)
  }

  const result = await whisperResponse.json()

  return {
    text: result.text,
    segments: result.segments?.map((seg: { start: number; end: number; text: string }) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text
    })),
    language: result.language,
    duration: result.duration
  }
}
