// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { assessIndigenousImpact, aggregateIndigenousImpact } from '@/lib/ai/intelligent-indigenous-impact-analyzer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// UPGRADED AI ENDPOINT - Uses intelligent depth-based impact analysis
// Replaced pattern-based analyzer with v3 intelligent analyzer (depth scoring)

export async function POST(request: NextRequest) {
  try {
    const { transcriptId } = await request.json()

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'Transcript ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Analyzing Indigenous community impact for transcript:', transcriptId)

    // 1. Get the transcript content
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', transcriptId)
      .single()

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError)
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    const content = transcript.transcript_content || transcript.content || transcript.text
    if (!content) {
      return NextResponse.json(
        { error: 'No transcript content found' },
        { status: 400 }
      )
    }

    console.log('📖 Analyzing transcript:', transcript.title)
    console.log('📊 Content length:', content.length, 'characters')

    // 2. Run intelligent Indigenous impact analysis (depth-based scoring)
    const storytellerName = transcript.storyteller_name || 'Community Member'
    const analysis = await assessIndigenousImpact(content, storytellerName)

    console.log('✨ Analysis complete in', analysis.processing_time_ms, 'ms')
    console.log('📈 Assessments:', analysis.assessments.length)

    // 3. Store analysis in transcript_analysis_results
    const avgConfidence = analysis.assessments.length > 0
      ? analysis.assessments.reduce((sum, a) => sum + a.confidence, 0) / analysis.assessments.length
      : 0

    const { error: insertError } = await supabase
      .from('transcript_analysis_results')
      .upsert({
        transcript_id: transcriptId,
        analyzer_version: 'v3-intelligent-impact',
        themes: [], // No theme extraction in this endpoint
        quotes: analysis.community_voice_highlights?.map(q => ({ quote: q })) || [],
        impact_assessment: {
          assessments: analysis.assessments,
          overall_summary: analysis.overall_impact_summary,
          key_strengths: analysis.key_strengths
        },
        cultural_flags: {
          community_voice_centered: true,
          depth_based_scoring: true
        },
        quality_metrics: {
          avg_confidence: avgConfidence
        },
        processing_time_ms: analysis.processing_time_ms
      })

    if (insertError) {
      console.warn('Failed to store analysis results:', insertError)
    }

    console.log('🎯 Impact analysis complete!')

    return NextResponse.json({
      transcriptId,
      title: transcript.title,
      storytellerId: transcript.storyteller_id,
      analysis,
      analysisMetadata: {
        contentLength: content.length,
        analysisTimestamp: new Date().toISOString(),
        aiModel: 'intelligent-indigenous-impact-analyzer-v3',
        culturalSafety: 'depth-based-community-voice-centered',
        storedInDatabase: !insertError
      }
    })

  } catch (error) {
    console.error('Error in Indigenous impact analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyse Indigenous community impact' },
      { status: 500 }
    )
  }
}

// GET endpoint to analyse a specific transcript
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const transcriptId = url.searchParams.get('transcriptId')

  if (!transcriptId) {
    return NextResponse.json(
      { error: 'transcriptId parameter is required' },
      { status: 400 }
    )
  }

  // Convert GET to POST format for consistency
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ transcriptId }),
    headers: { 'Content-Type': 'application/json' }
  }))
}