import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { ContentQualityAnalyzer } from '@/lib/ai/content-quality-analyzer'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storytellerId, analyzeAll = false } = body

    if (!storytellerId && !analyzeAll) {
      return NextResponse.json(
        { error: 'storytellerId is required unless analyzeAll is true' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    if (analyzeAll) {
      // Analyze all storytellers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          bio,
          cultural_background,
          cultural_affiliations,
          languages_spoken,
          specialties,
          years_of_experience,
          preferred_topics,
          created_at,
          last_sign_in_at
        `)
        .limit(50) // Process in batches

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return NextResponse.json(
          { error: 'Failed to fetch profiles' },
          { status: 500 }
        )
      }

      const results = []
      for (const profile of profiles || []) {
        const analysis = await analyzeStorytellerContent(profile.id, supabase)
        results.push({
          storytellerId: profile.id,
          displayName: profile.display_name,
          analysis
        })
      }

      return NextResponse.json({
        success: true,
        results,
        summary: {
          totalAnalyzed: results.length,
          averageQuality: results.reduce((sum, r) => sum + r.analysis.overallQuality, 0) / results.length,
          needsReview: results.filter(r => r.analysis.needsHumanReview).length,
          aiGenerated: results.filter(r => r.analysis.authenticity.score < 40).length
        }
      })
    } else {
      // Analyze single storyteller
      const analysis = await analyzeStorytellerContent(storytellerId, supabase)

      return NextResponse.json({
        success: true,
        storytellerId,
        analysis
      })
    }

  } catch (error) {
    console.error('Content quality analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function analyzeStorytellerContent(storytellerId: string, supabase: any) {
  // Fetch all content for the storyteller
  const [profileResult, storiesResult, transcriptsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single(),

    supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        description,
        themes,
        cultural_themes,
        ai_generated_summary,
        ai_processed,
        created_at,
        word_count,
        view_count,
        status
      `)
      .eq('author_id', storytellerId),

    supabase
      .from('transcripts')
      .select(`
        id,
        title,
        transcript_content,
        metadata,
        cultural_context,
        created_at,
        word_count,
        status
      `)
      .eq('storyteller_id', storytellerId)
  ])

  const profile = profileResult.data
  const stories = storiesResult.data || []
  const transcripts = transcriptsResult.data || []

  // Analyze content quality
  const analyzer = new ContentQualityAnalyzer()
  const analysis = await analyzer.analyzeComplete({
    profile,
    stories,
    transcripts
  })

  // Store analysis results
  await supabase
    .from('analysis_jobs')
    .insert({
      profile_id: storytellerId,
      job_type: 'content_quality_analysis',
      status: 'completed',
      results_data: analysis,
      ai_model_used: 'content-quality-v1',
      completed_at: new Date().toISOString(),
      processing_time_seconds: 0
    })

  return analysis
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storytellerId')
    const includeHistory = searchParams.get('includeHistory') === 'true'

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'storytellerId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Get latest analysis
    const { data: latestAnalysis, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('profile_id', storytellerId)
      .eq('job_type', 'content_quality_analysis')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(includeHistory ? 10 : 1)

    if (error) {
      console.error('Error fetching analysis:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      )
    }

    if (!latestAnalysis || latestAnalysis.length === 0) {
      return NextResponse.json({
        storytellerId,
        hasAnalysis: false,
        message: 'No content quality analysis found. Run analysis first.'
      })
    }

    return NextResponse.json({
      storytellerId,
      hasAnalysis: true,
      latestAnalysis: latestAnalysis[0],
      history: includeHistory ? latestAnalysis : undefined
    })

  } catch (error) {
    console.error('Get content quality analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}