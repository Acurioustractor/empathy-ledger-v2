import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { 
  storyRecommendationsEngine, 
  getPersonalizedRecommendations, 
  getSimilarStories, 
  getSeasonalRecommendations 
} from '@/lib/ai/story-recommendations-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'personalized'
    const storyId = searchParams.get('story_id')
    const season = searchParams.get('season')
    const maxResults = parseInt(searchParams.get('max_results') || '5')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists and get their context
    const supabase = createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, display_name, cultural_affiliations, is_elder')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let recommendations = []
    let context = {}

    switch (type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(userId, maxResults)
        context = {
          type: 'personalized',
          description: 'Stories recommended based on your interests and cultural background',
          user_context: {
            cultural_affiliations: user.cultural_affiliations,
            is_elder: user.is_elder
          }
        }
        break

      case 'similar':
        if (!storyId) {
          return NextResponse.json(
            { error: 'Story ID is required for similar recommendations' },
            { status: 400 }
          )
        }
        recommendations = await getSimilarStories(storyId, userId, maxResults)
        context = {
          type: 'similar',
          description: `Stories similar to the one you're reading`,
          reference_story_id: storyId
        }
        break

      case 'seasonal':
        recommendations = await getSeasonalRecommendations(userId, season, maxResults)
        context = {
          type: 'seasonal',
          description: `Stories relevant to ${season || 'the current season'}`,
          season: season || 'current'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type. Use: personalized, similar, or seasonal' },
          { status: 400 }
        )
    }

    // Log the recommendation request for analytics
    await supabase
      .from('ai_recommendation_logs')
      .insert({
        user_id: userId,
        recommendation_type: type,
        story_id: storyId,
        season: season,
        results_count: recommendations.length,
        cultural_context: user.cultural_affiliations || [],
        requested_at: new Date().toISOString()
      })
      .catch(error => {
        console.error('Failed to log recommendation request:', error)
        // Don't fail the request if logging fails
      })

    return NextResponse.json({
      success: true,
      recommendations,
      context,
      metadata: {
        user_id: userId,
        total_results: recommendations.length,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI recommendations error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, context, preferences, max_results = 5 } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const supabase = createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, display_name, cultural_affiliations, is_elder')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate recommendations with custom context and preferences
    const recommendations = await storyRecommendationsEngine.generateRecommendations(
      {
        user_id,
        session_context: context?.session_context,
        time_context: context?.time_context,
        emotional_state: context?.emotional_state,
        community_events: context?.community_events
      },
      {
        cultural_background: preferences?.cultural_background || user.cultural_background,
        cultural_affiliations: preferences?.cultural_affiliations || user.cultural_affiliations,
        interests: preferences?.interests,
        preferred_themes: preferences?.preferred_themes,
        story_types: preferences?.story_types,
        cultural_sensitivity_comfort: preferences?.cultural_sensitivity_comfort,
        elder_content_preference: preferences?.elder_content_preference
      },
      max_results
    )

    // Log the custom recommendation request
    await supabase
      .from('ai_recommendation_logs')
      .insert({
        user_id,
        recommendation_type: 'custom',
        custom_context: context,
        custom_preferences: preferences,
        results_count: recommendations.length,
        cultural_context: user.cultural_affiliations || [],
        requested_at: new Date().toISOString()
      })
      .catch(error => {
        console.error('Failed to log custom recommendation request:', error)
      })

    return NextResponse.json({
      success: true,
      recommendations,
      context: {
        type: 'custom',
        description: 'Stories recommended based on your custom preferences and context',
        custom_context: context,
        custom_preferences: preferences
      },
      metadata: {
        user_id,
        total_results: recommendations.length,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI custom recommendations error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate custom recommendations',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}