import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { TranscriptProcessingPipeline } from '@/lib/workflows/transcript-processing-pipeline'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mediaAssetId, language = 'en' } = await request.json()

    if (!mediaAssetId) {
      return NextResponse.json({ error: 'Media asset ID required' }, { status: 400 })
    }

    // Get media asset details
    const { data: mediaAsset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', mediaAssetId)
      .single()

    if (assetError || !mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Check if transcription already exists
    const { data: existingTranscript } = await supabase
      .from('transcripts')
      .select('*')
      .eq('media_asset_id', mediaAssetId)
      .single()

    if (existingTranscript && existingTranscript.status === 'completed') {
      return NextResponse.json({
        success: true,
        transcript: existingTranscript
      })
    }

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('media')
      .download(mediaAsset.file_path)

    if (downloadError) {
      console.error('Download error:', downloadError)
      return NextResponse.json({ error: 'Failed to download media file' }, { status: 500 })
    }

    // Create or update transcription record
    const transcriptId = existingTranscript?.id || crypto.randomUUID()
    
    await supabase
      .from('transcripts')
      .upsert({
        id: transcriptId,
        media_asset_id: mediaAssetId,
        status: 'processing',
        language,
        created_by: user.id
      })

    try {
      // Convert blob to File for OpenAI
      const file = new File([fileData], mediaAsset.filename, { type: mediaAsset.mime_type })

      // Transcribe with OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language,
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment']
      })

      // Process transcript segments for better formatting
      const segments = transcription.segments?.map(seg => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim()
      })) || []

      // Generate formatted transcript
      const formattedText = segments
        .map(seg => seg.text)
        .join('\n\n')

      // Calculate statistics
      const wordCount = formattedText.split(/\s+/).length
      const duration = segments[segments.length - 1]?.end || 0

      // Update transcript record with results
      const { data: updatedTranscript, error: updateError } = await supabase
        .from('transcripts')
        .update({
          status: 'completed',
          text: transcription.text,
          formatted_text: formattedText,
          segments,
          language: transcription.language || language,
          duration,
          word_count: wordCount,
          confidence: 0.95, // Whisper doesn't provide confidence scores
          metadata: {
            model: 'whisper-1',
            processed_at: new Date().toISOString(),
            segments_count: segments.length
          }
        })
        .eq('id', transcriptId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update media asset with transcript reference
      await supabase
        .from('media_assets')
        .update({
          transcript_id: transcriptId,
          metadata: {
            ...mediaAsset.metadata,
            has_transcript: true,
            transcript_language: language,
            duration
          }
        })
        .eq('id', mediaAssetId)

      // 🔥 TRIGGER INDIGENOUS IMPACT ANALYSIS PIPELINE
      try {
        const pipeline = new TranscriptProcessingPipeline(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        console.log('🎯 Starting Indigenous impact analysis for media transcript:', transcriptId)

        // Process in background (don't await to avoid API timeout)
        pipeline.processTranscript(transcriptId).then(result => {
          console.log('✨ Indigenous impact analysis completed for media transcript:', {
            transcriptId: result.transcriptId,
            insightsFound: result.insightsExtracted,
            impactTypes: result.impactTypes,
            confidenceScore: result.confidenceScore
          })
        }).catch(error => {
          console.error('❌ Indigenous impact analysis failed for media transcript:', error)
        })

      } catch (error) {
        console.error('❌ Failed to trigger impact analysis for media transcript:', error)
        // Don't fail the transcription if analysis fails
      }

      return NextResponse.json({
        success: true,
        transcript: updatedTranscript,
        impactAnalysis: {
          status: 'triggered',
          message: 'Indigenous impact analysis started in background'
        }
      })

    } catch (transcriptionError: any) {
      console.error('Transcription error:', transcriptionError)
      
      // Update transcript status to failed
      await supabase
        .from('transcripts')
        .update({
          status: 'failed',
          error_message: transcriptionError.message
        })
        .eq('id', transcriptId)

      return NextResponse.json({
        error: 'Transcription failed',
        details: transcriptionError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Transcription service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get transcript for a media asset
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const mediaAssetId = searchParams.get('mediaAssetId')
    
    if (!mediaAssetId) {
      return NextResponse.json({ error: 'Media asset ID required' }, { status: 400 })
    }

    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('media_asset_id', mediaAssetId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error fetching transcript:', error)
      return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
    }

    return NextResponse.json({ 
      transcript: transcript || null,
      exists: !!transcript 
    })

  } catch (error) {
    console.error('Transcript fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}