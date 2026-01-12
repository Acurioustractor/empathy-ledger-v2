// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/lib/inngest/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/storytellers/[id]/trigger-analysis
 * Triggers AI analysis for all unprocessed transcripts belonging to a storyteller
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    console.log(`📊 Triggering analysis for storyteller: ${storytellerId}`)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all transcripts for this storyteller that need processing
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('id, title, ai_processing_status, transcript_content')
      .eq('storyteller_id', storytellerId)
      .not('transcript_content', 'is', null)
      .in('ai_processing_status', ['not_started', 'failed', null])

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError)
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      )
    }

    if (!transcripts || transcripts.length === 0) {
      // Check if there are any transcripts at all
      const { count } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true })
        .eq('storyteller_id', storytellerId)

      if (count === 0) {
        return NextResponse.json({
          success: true,
          message: 'No transcripts found for this storyteller',
          queued: 0,
          alreadyProcessed: 0
        })
      }

      return NextResponse.json({
        success: true,
        message: 'All transcripts have already been processed',
        queued: 0,
        alreadyProcessed: count
      })
    }

    // Filter transcripts that have content long enough to analyze (min 50 chars)
    const validTranscripts = transcripts.filter(t =>
      t.transcript_content && t.transcript_content.length >= 50
    )

    if (validTranscripts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No transcripts with sufficient content to analyze',
        queued: 0,
        skipped: transcripts.length
      })
    }

    // Queue each transcript for analysis
    const queuedIds: string[] = []
    const errors: Array<{ id: string; error: string }> = []

    for (const transcript of validTranscripts) {
      try {
        // Update status to queued
        await supabase
          .from('transcripts')
          .update({
            ai_processing_status: 'queued',
            updated_at: new Date().toISOString()
          })
          .eq('id', transcript.id)

        // Send to Inngest queue
        await inngest.send({
          name: 'transcript/process',
          data: {
            transcriptId: transcript.id
          }
        })

        queuedIds.push(transcript.id)
        console.log(`✅ Queued transcript: ${transcript.id} - ${transcript.title}`)
      } catch (err) {
        console.error(`Failed to queue transcript ${transcript.id}:`, err)
        errors.push({
          id: transcript.id,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    console.log(`📋 Analysis triggered for ${queuedIds.length} transcripts`)

    return NextResponse.json({
      success: true,
      message: `Analysis queued for ${queuedIds.length} transcript(s)`,
      queued: queuedIds.length,
      queuedIds,
      errors: errors.length > 0 ? errors : undefined,
      estimatedTime: `${queuedIds.length * 2}-${queuedIds.length * 5} minutes`
    })

  } catch (error) {
    console.error('Error triggering storyteller analysis:', error)
    return NextResponse.json(
      { error: 'Failed to trigger analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/storytellers/[id]/trigger-analysis
 * Check analysis status for all storyteller's transcripts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get analysis status counts for all transcripts
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select('id, title, ai_processing_status')
      .eq('storyteller_id', storytellerId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      )
    }

    const statusCounts = {
      not_started: 0,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }

    for (const t of transcripts || []) {
      const status = t.ai_processing_status || 'not_started'
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++
      }
    }

    const total = transcripts?.length || 0
    const allComplete = statusCounts.completed === total && total > 0
    const anyProcessing = statusCounts.queued > 0 || statusCounts.processing > 0

    return NextResponse.json({
      storytellerId,
      totalTranscripts: total,
      statusCounts,
      allComplete,
      anyProcessing,
      transcripts: transcripts?.map(t => ({
        id: t.id,
        title: t.title,
        status: t.ai_processing_status || 'not_started'
      }))
    })

  } catch (error) {
    console.error('Error checking analysis status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
