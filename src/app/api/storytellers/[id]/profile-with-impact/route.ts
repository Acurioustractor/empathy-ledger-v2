import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


// ENHANCED STORYTELLER PROFILE API WITH INDIGENOUS IMPACT DATA
// Fetches all Supabase profile fields + new impact measurement data

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const storytellerId = params.id

    console.log('🔍 Fetching enhanced profile with impact data for:', storytellerId)

    // Fetch complete profile with all fields including new impact measurements
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        profile_image_url,
        cultural_background,
        tenant_roles,
        is_storyteller,
        is_elder,
        is_featured,
        video_introduction_url,
        featured_video_url,

        -- New impact measurement fields
        total_impact_insights,
        primary_impact_type,
        impact_confidence_score,
        cultural_protocol_score,
        community_leadership_score,
        knowledge_transmission_score,
        healing_integration_score,
        relationship_building_score,
        system_navigation_score,
        last_impact_analysis,
        impact_badges,
        storyteller_ranking,

        created_at,
        updated_at
      `)
      .eq('id', storytellerId)
      .single()

    if (error) {
      console.error('❌ Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile.is_storyteller) {
      return NextResponse.json(
        { error: 'Profile is not a storyteller' },
        { status: 400 }
      )
    }

    console.log('✅ Profile fetched successfully:', {
      name: profile.display_name,
      totalInsights: profile.total_impact_insights,
      primaryImpactType: profile.primary_impact_type,
      ranking: profile.storyteller_ranking
    })

    // Get additional impact statistics
    const additionalStats = await getStorytellerImpactStats(supabase, storytellerId)

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        ...additionalStats
      }
    })

  } catch (error) {
    console.error('❌ Error in enhanced profile API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enhanced profile' },
      { status: 500 }
    )
  }
}

// Helper function to get additional impact statistics
async function getStorytellerImpactStats(supabase: any, storytellerId: string) {
  try {
    // Check if community_impact_insights table exists and get recent insights
    const { data: recentInsights, error: insightsError } = await supabase
      .from('community_impact_insights')
      .select('impact_type, confidence_score, created_at')
      .eq('storyteller_id', storytellerId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .limit(10)

    if (insightsError && !insightsError.message.includes('does not exist')) {
      console.error('Error fetching recent insights:', insightsError)
    }

    // Get story/transcript count
    const { count: storyCount, error: storyError } = await supabase
      .from('stories')
      .select('id', { count: 'exact' })
      .eq('author_id', storytellerId)

    if (storyError && !storyError.message.includes('does not exist')) {
      console.error('Error counting stories:', storyError)
    }

    const { count: transcriptCount, error: transcriptError } = await supabase
      .from('transcripts')
      .select('id', { count: 'exact' })
      .eq('storyteller_id', storytellerId)

    if (transcriptError && !transcriptError.message.includes('does not exist')) {
      console.error('Error counting transcripts:', transcriptError)
    }

    return {
      recentInsightsCount: recentInsights?.length || 0,
      totalStoriesCount: storyCount || 0,
      totalTranscriptsCount: transcriptCount || 0,
      hasRecentActivity: (recentInsights?.length || 0) > 0
    }

  } catch (error) {
    console.error('Error fetching additional stats:', error)
    return {
      recentInsightsCount: 0,
      totalStoriesCount: 0,
      totalTranscriptsCount: 0,
      hasRecentActivity: false
    }
  }
}