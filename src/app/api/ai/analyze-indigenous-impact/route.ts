import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { indigenousImpactAnalyzer } from '@/lib/ai/indigenous-impact-analyzer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// REVOLUTIONARY AI ENDPOINT - ANALYZES REAL INDIGENOUS COMMUNITY STORIES
// Tests our AI system on actual stories from Aunty Vicky, Aunty May, Joe Kwon, etc.

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

    // 2. Run Indigenous impact analysis
    const insights = indigenousImpactAnalyzer.analyzeIndigenousImpact(content)

    console.log('✨ Found', insights.length, 'Indigenous impact insights')

    if (insights.length === 0) {
      return NextResponse.json({
        transcriptId,
        title: transcript.title,
        insights: [],
        summary: {
          totalInsights: 0,
          message: 'No specific Indigenous impact patterns detected in this transcript'
        }
      })
    }

    // 3. Set transcript ID on insights
    insights.forEach(insight => {
      insight.transcript_id = transcriptId
    })

    // 4. Generate community impact summary
    const summary = indigenousImpactAnalyzer.aggregateCommunityImpact(insights)

    // 5. Store insights in database (if we want to persist them)
    // Note: Would need to create the tables first
    // const { error: insertError } = await supabase
    //   .from('community_impact_insights')
    //   .insert(insights.map(insight => ({
    //     transcript_id: transcriptId,
    //     storyteller_id: transcript.storyteller_id,
    //     tenant_id: transcript.tenant_id,
    //     impact_type: insight.impactType,
    //     quote_text: insight.evidence.quote,
    //     context_text: insight.evidence.context,
    //     confidence_score: insight.evidence.confidence,
    //     // ... map other fields
    //   })))

    console.log('🎯 Analysis complete!')
    console.log('📈 Impact types found:', Object.keys(summary.impactTypes))
    console.log('🗣️  Featured community voices:', summary.featuredCommunityVoices.length)

    return NextResponse.json({
      transcriptId,
      title: transcript.title,
      storytellerId: transcript.storyteller_id,
      insights,
      summary,
      analysisMetadata: {
        contentLength: content.length,
        analysisTimestamp: new Date().toISOString(),
        aiModel: 'indigenous-impact-analyzer-v1',
        culturalSafety: 'community-voice-centred'
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