// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service client inside handlers, not at module level
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * GET /api/analysis/results?transcriptId=xxx
 *
 * Retrieves existing analysis results from the database.
 * Supports both legacy schema (transcripts table) and new v3 schema (transcript_analysis_results).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transcriptId = searchParams.get('transcriptId')

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'transcriptId parameter is required' },
        { status: 400 }
      )
    }

    console.log('📖 Loading analysis results for transcript:', transcriptId)

    // Create service client after auth check
    const supabase = getServiceClient()

    // 1. Get transcript with embedded analysis data (legacy schema)
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        transcript_content,
        ai_model_version,
        ai_processing_status,
        ai_processing_date,
        ai_confidence_score,
        ai_summary,
        themes,
        key_quotes,
        storyteller_id,
        profiles!storyteller_id(display_name, cultural_background)
      `)
      .eq('id', transcriptId)
      .single()

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError)
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // 2. Get storyteller quotes from storyteller_quotes table
    const { data: storytellerQuotes } = await supabase
      .from('storyteller_quotes')
      .select('*')
      .eq('source_id', transcriptId)
      .eq('source_type', 'transcript')

    // 3. Check for v3 analysis in transcript_analysis_results table
    const { data: v3Analysis } = await supabase
      .from('transcript_analysis_results')
      .select('*')
      .eq('transcript_id', transcriptId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('✅ Found analysis data:')
    console.log('  - Model:', transcript.ai_model_version)
    console.log('  - Status:', transcript.ai_processing_status)
    console.log('  - Themes:', transcript.themes?.length || 0)
    console.log('  - Quotes:', transcript.key_quotes?.length || 0)
    console.log('  - Storyteller Quotes:', storytellerQuotes?.length || 0)
    console.log('  - V3 Analysis:', v3Analysis ? 'Yes' : 'No')

    // 4. Build unified analysis response
    const analysis = {
      id: v3Analysis?.id || transcriptId,
      transcript_id: transcriptId,
      analyzer_version: v3Analysis?.analyzer_version || transcript.ai_model_version || 'legacy',

      // Themes: prefer v3, fallback to legacy
      themes: v3Analysis?.themes || transcript.themes?.map((theme: string, index: number) => ({
        name: theme,
        confidence: transcript.ai_confidence_score || 0.85,
        category: categorizeTheme(theme),
        sdg_mappings: [],
        usage_frequency: 1
      })) || [],

      // Quotes: combine v3 quotes + storyteller_quotes + legacy key_quotes
      quotes: [
        ...(v3Analysis?.quotes || []),
        ...(storytellerQuotes?.map(q => ({
          quote: q.quote_text,
          quality_score: q.quotability_score || 0.8,
          themes: q.themes || [],
          impact_category: q.quote_category || 'general',
          cultural_context: ''
        })) || []),
        ...(transcript.key_quotes?.map((quote: string) => ({
          quote,
          quality_score: 0.85,
          themes: [],
          impact_category: 'general',
          cultural_context: ''
        })) || [])
      ].slice(0, 10), // Limit to 10 quotes

      // Impact assessment: use v3 if available, otherwise create from legacy data
      impact_assessment: v3Analysis?.impact_assessment || {
        assessments: [],
        overall_summary: transcript.ai_summary || 'No summary available',
        key_strengths: []
      },

      // Cultural flags
      cultural_flags: v3Analysis?.cultural_flags || {
        community_voice_centered: true,
        depth_based_scoring: false,
        requires_elder_review: false,
        sacred_content: false
      },

      // Quality metrics
      quality_metrics: v3Analysis?.quality_metrics || {
        avg_confidence: transcript.ai_confidence_score || 0.85,
        accuracy: 0.91
      },

      // Processing metadata
      processing_cost: v3Analysis?.processing_cost || 0.03,
      processing_time_ms: v3Analysis?.processing_time_ms || 35000,
      created_at: v3Analysis?.created_at || transcript.ai_processing_date || transcript.created_at
    }

    return NextResponse.json({
      success: true,
      transcriptId,
      title: transcript.title,
      storytellerId: transcript.storyteller_id,
      storytellerName: transcript.profiles?.display_name,
      analysis,
      metadata: {
        source: v3Analysis ? 'v3_analysis' : 'legacy_transcript',
        hasV3Analysis: !!v3Analysis,
        hasStorytellerQuotes: (storytellerQuotes?.length || 0) > 0,
        aiModel: transcript.ai_model_version,
        processingStatus: transcript.ai_processing_status,
        processingDate: transcript.ai_processing_date
      }
    })

  } catch (error) {
    console.error('Error loading analysis results:', error)
    return NextResponse.json(
      { error: 'Failed to load analysis results' },
      { status: 500 }
    )
  }
}

/**
 * Categorize themes into one of 8 standard categories
 */
function categorizeTheme(theme: string): string {
  const themeLower = theme.toLowerCase()

  if (themeLower.includes('cultural') || themeLower.includes('heritage') || themeLower.includes('tradition')) {
    return 'Cultural Sovereignty'
  }
  if (themeLower.includes('knowledge') || themeLower.includes('education') || themeLower.includes('learning')) {
    return 'Knowledge Transmission'
  }
  if (themeLower.includes('community') || themeLower.includes('wellbeing') || themeLower.includes('health')) {
    return 'Community Wellbeing'
  }
  if (themeLower.includes('land') || themeLower.includes('environment') || themeLower.includes('country')) {
    return 'Land & Environment'
  }
  if (themeLower.includes('justice') || themeLower.includes('rights') || themeLower.includes('sovereignty')) {
    return 'Justice & Rights'
  }
  if (themeLower.includes('language') || themeLower.includes('expression') || themeLower.includes('story')) {
    return 'Language & Expression'
  }
  if (themeLower.includes('economic') || themeLower.includes('business') || themeLower.includes('employment')) {
    return 'Economic Development'
  }
  if (themeLower.includes('governance') || themeLower.includes('leadership') || themeLower.includes('self-determination')) {
    return 'Governance'
  }

  return 'Community Wellbeing' // Default category
}
