import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const type = formData.get('type') as 'project' | 'organization'

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('🎤 Transcribing interview audio:', {
      type,
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type
    })

    // Convert File to Buffer for OpenAI Whisper API
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a File-like object that OpenAI expects
    const file = new File([buffer], audioFile.name, { type: audioFile.type })

    // Transcribe with Whisper
    console.log('🦻 Calling OpenAI Whisper API...')
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Can be made dynamic based on org settings
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    })

    console.log('✅ Transcription complete:', {
      textLength: transcription.text.length,
      duration: transcription.duration
    })

    return NextResponse.json({
      transcript: transcription.text,
      duration: transcription.duration,
      segments: transcription.segments,
      language: transcription.language
    })
  } catch (error) {
    console.error('❌ Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
