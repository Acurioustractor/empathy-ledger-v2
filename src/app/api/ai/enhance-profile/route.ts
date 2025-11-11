import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { ProfileEnhancementEngine } from '@/lib/ai/profile-enhancement-engine'

import { ContentQualityAnalyzer } from '@/lib/ai/content-quality-analyzer'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storytellerId,
      enhancementType = 'comprehensive', // 'comprehensive' | 'voice_only' | 'gaps_only' | 'content_only'
      preserveVoice = true,
      autoApply = false,
      focusAreas = []
    } = body

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'storytellerId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Fetch storyteller data
    const [profileResult, storiesResult, transcriptsResult, quotesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', storytellerId)
        .single(),

      supabase
        .from('stories')
        .select(`
          id, title, content, description, themes, cultural_themes,
          ai_generated_summary, ai_processed, created_at, status
        `)
        .eq('author_id', storytellerId),

      supabase
        .from('transcripts')
        .select(`
          id, title, transcript_content, metadata, cultural_context,
          created_at, word_count, status
        `)
        .eq('storyteller_id', storytellerId),

      supabase
        .from('extracted_quotes')
        .select(`
          id, quote_text, context, themes, sentiment, impact_score,
          source_type, created_at
        `)
        .eq('author_id', storytellerId)
        .order('impact_score', { ascending: false })
        .limit(20)
    ])

    if (profileResult.error) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    const profile = profileResult.data
    const stories = storiesResult.data || []
    const transcripts = transcriptsResult.data || []
    const quotes = quotesResult.data || []

    // Analyze current content quality to inform enhancement
    const qualityAnalyzer = new ContentQualityAnalyzer()
    const qualityAnalysis = await qualityAnalyzer.analyzeComplete({
      profile,
      stories,
      transcripts
    })

    // Generate enhancement recommendations
    const enhancementEngine = new ProfileEnhancementEngine()
    const enhancements = await enhancementEngine.generateEnhancements({
      profile,
      stories,
      transcripts,
      quotes,
      qualityAnalysis,
      enhancementType,
      preserveVoice,
      focusAreas
    })

    // Apply enhancements if requested
    if (autoApply) {
      const applicationResults = await enhancementEngine.applyEnhancements(
        storytellerId,
        enhancements,
        supabase
      )

      // Log the enhancement job
      await supabase
        .from('analysis_jobs')
        .insert({
          profile_id: storytellerId,
          job_type: 'profile_enhancement',
          status: 'completed',
          results_data: {
            enhancementType,
            appliedEnhancements: applicationResults,
            preserveVoice,
            focusAreas
          },
          ai_model_used: 'profile-enhancement-v1',
          completed_at: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        storytellerId,
        enhancements,
        applied: true,
        applicationResults,
        qualityImprovement: {
          before: qualityAnalysis.overallQuality,
          estimatedAfter: enhancements.estimatedQualityImprovement
        }
      })
    }

    // Return enhancement recommendations without applying
    return NextResponse.json({
      success: true,
      storytellerId,
      enhancements,
      applied: false,
      currentQuality: qualityAnalysis.overallQuality,
      estimatedImprovement: enhancements.estimatedQualityImprovement
    })

  } catch (error) {
    console.error('Profile enhancement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    // Get enhancement history
    const { data: enhancementHistory, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('profile_id', storytellerId)
      .eq('job_type', 'profile_enhancement')
      .order('completed_at', { ascending: false })
      .limit(includeHistory ? 10 : 1)

    if (error) {
      console.error('Error fetching enhancement history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch enhancement history' },
        { status: 500 }
      )
    }

    // Get current content quality for context
    const qualityResult = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('profile_id', storytellerId)
      .eq('job_type', 'content_quality_analysis')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)

    return NextResponse.json({
      storytellerId,
      hasEnhancements: enhancementHistory && enhancementHistory.length > 0,
      latestEnhancement: enhancementHistory?.[0] || null,
      enhancementHistory: includeHistory ? enhancementHistory : undefined,
      currentQuality: qualityResult.data?.[0]?.results_data?.overallQuality || null
    })

  } catch (error) {
    console.error('Get profile enhancement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { storytellerId, enhancementId, action } = body

    if (!storytellerId || !enhancementId || !action) {
      return NextResponse.json(
        { error: 'storytellerId, enhancementId, and action are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    if (action === 'apply') {
      // Get the enhancement recommendations
      const { data: enhancementJob, error: jobError } = await supabase
        .from('analysis_jobs')
        .select('*')
        .eq('id', enhancementId)
        .eq('profile_id', storytellerId)
        .eq('job_type', 'profile_enhancement')
        .single()

      if (jobError || !enhancementJob) {
        return NextResponse.json(
          { error: 'Enhancement job not found' },
          { status: 404 }
        )
      }

      const enhancements = enhancementJob.results_data
      const enhancementEngine = new ProfileEnhancementEngine()

      const applicationResults = await enhancementEngine.applyEnhancements(
        storytellerId,
        enhancements,
        supabase
      )

      // Update the job to mark as applied
      await supabase
        .from('analysis_jobs')
        .update({
          results_data: {
            ...enhancements,
            applied: true,
            appliedAt: new Date().toISOString(),
            applicationResults
          }
        })
        .eq('id', enhancementId)

      return NextResponse.json({
        success: true,
        storytellerId,
        enhancementId,
        action: 'applied',
        applicationResults
      })

    } else if (action === 'reject') {
      // Mark enhancement as rejected
      await supabase
        .from('analysis_jobs')
        .update({
          results_data: {
            ...enhancementJob.results_data,
            rejected: true,
            rejectedAt: new Date().toISOString()
          }
        })
        .eq('id', enhancementId)

      return NextResponse.json({
        success: true,
        storytellerId,
        enhancementId,
        action: 'rejected'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "apply" or "reject"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Profile enhancement action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}