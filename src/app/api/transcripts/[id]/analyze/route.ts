// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { inngest } from '@/lib/inngest/client'



/**
 * POST /api/transcripts/[id]/analyze
 * Trigger AI analysis for a transcript
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params

    console.log(`📝 Triggering analysis for transcript: ${transcriptId}`)

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if transcript exists
    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('id, title, ai_processing_status')
      .eq('id', transcriptId)
      .single()

    if (error || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // Check if already processing
    if (transcript.ai_processing_status === 'processing') {
      return NextResponse.json(
        { error: 'Transcript is already being processed', status: 'processing' },
        { status: 409 }
      )
    }

    // Update status to queued
    await supabase
      .from('transcripts')
      .update({
        ai_processing_status: 'queued',
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)

    // Send to Inngest queue
    await inngest.send({
      name: 'transcript/process',
      data: {
        transcriptId
      }
    })

    console.log(`✅ Transcript queued for analysis: ${transcriptId}`)

    return NextResponse.json({
      success: true,
      transcriptId,
      status: 'queued',
      message: 'Transcript analysis has been queued. This will take 2-5 minutes.',
      estimatedTime: '2-5 minutes'
    })

  } catch (error) {
    console.error('Error triggering analysis:', error)
    return NextResponse.json(
      { error: 'Failed to trigger analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/transcripts/[id]/analyze
 * Check analysis status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('id, title, ai_processing_status, themes, key_quotes, ai_summary, metadata')
      .eq('id', transcriptId)
      .single()

    if (error || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    const status = transcript.ai_processing_status || 'not_started'
    const isComplete = status === 'completed'

    return NextResponse.json({
      transcriptId,
      status,
      complete: isComplete,
      data: isComplete ? {
        themes: transcript.themes,
        quotes: transcript.key_quotes,
        summary: transcript.ai_summary,
        metadata: transcript.metadata?.ai_analysis
      } : null
    })

  } catch (error) {
    console.error('Error checking analysis status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
