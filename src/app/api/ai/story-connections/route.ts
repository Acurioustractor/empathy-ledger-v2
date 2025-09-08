import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { 
  storyConnectionAnalysisSystem,
  analyzeStoryConnections,
  createHealingJourney,
  findThematicThreads
} from '@/lib/ai/story-connection-analysis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('story_id')
    const userId = searchParams.get('user_id')
    const analysisType = searchParams.get('analysis_type') || 'comprehensive'
    const action = searchParams.get('action') || 'analyze'
    const theme = searchParams.get('theme')
    const maxResults = parseInt(searchParams.get('max_results') || '5')
    const timeframe = searchParams.get('timeframe') as 'week' | 'month' | 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists and has permissions
    const supabase = await createSupabaseServerClient()
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

    let result

    switch (action) {
      case 'analyze':
        if (!storyId) {
          return NextResponse.json(
            { error: 'Story ID is required for connection analysis' },
            { status: 400 }
          )
        }

        // Verify user has access to the story
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .select('id, title, cultural_sensitivity_level, elder_approval, author_id')
          .eq('id', storyId)
          .single()

        if (storyError || !story) {
          return NextResponse.json(
            { error: 'Story not found' },
            { status: 404 }
          )
        }

        // Check access permissions
        const canAccess = story.cultural_sensitivity_level !== 'high' || 
                         story.elder_approval || 
                         user.is_elder ||
                         story.author_id === userId

        if (!canAccess) {
          return NextResponse.json(
            { error: 'Insufficient permissions to analyze this story' },
            { status: 403 }
          )
        }

        result = await analyzeStoryConnections(
          storyId, 
          userId, 
          analysisType as 'comprehensive' | 'thematic' | 'cultural' | 'healing_journey'
        )

        // Log connection analysis
        await supabase
          .from('ai_connection_analysis_logs')
          .insert({
            focal_story_id: storyId,
            user_id: userId,
            analysis_type: analysisType,
            connections_found: result.connections.length,
            thematic_clusters: result.thematic_clusters.length,
            narrative_threads: result.narrative_threads.length,
            cultural_patterns: result.cultural_patterns.length,
            analyzed_at: new Date().toISOString()
          })
          .catch(error => {
            console.error('Failed to log connection analysis:', error)
          })

        return NextResponse.json({
          success: true,
          connection_network: result,
          analysis_type: analysisType,
          metadata: {
            user_id: userId,
            focal_story: {
              id: storyId,
              title: story.title
            },
            analyzed_at: new Date().toISOString()
          }
        })

      case 'themes':
        if (!theme) {
          return NextResponse.json(
            { error: 'Theme is required for thematic thread analysis' },
            { status: 400 }
          )
        }

        const thematicThreads = await findThematicThreads(theme, userId)

        return NextResponse.json({
          success: true,
          thematic_threads: thematicThreads,
          theme: theme,
          metadata: {
            user_id: userId,
            threads_found: thematicThreads.threads.length,
            analyzed_at: new Date().toISOString()
          }
        })

      case 'patterns':
        const culturalFocus = searchParams.get('cultural_focus')?.split(',')
        
        const patterns = await storyConnectionAnalysisSystem.analyzeCulturalPatterns(
          userId,
          culturalFocus
        )

        return NextResponse.json({
          success: true,
          cultural_patterns: patterns,
          cultural_focus: culturalFocus || 'general',
          metadata: {
            user_id: userId,
            patterns_found: patterns.patterns.length,
            analyzed_at: new Date().toISOString()
          }
        })

      case 'analytics':
        // Only elders or users with special permissions can access analytics
        if (!user.is_elder) {
          return NextResponse.json(
            { error: 'Analytics access requires elder permissions' },
            { status: 403 }
          )
        }

        const analytics = await storyConnectionAnalysisSystem.getConnectionAnalytics(timeframe)

        return NextResponse.json({
          success: true,
          connection_analytics: analytics,
          timeframe: timeframe || 'month',
          metadata: {
            user_id: userId,
            user_is_elder: user.is_elder,
            retrieved_at: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, themes, patterns, or analytics' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Story connection analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze story connections',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      action, 
      user_id, 
      journey_type, 
      starting_story_id, 
      user_goals = [],
      cultural_context = {}
    } = body

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'Action and user_id are required' },
        { status: 400 }
      )
    }

    // Verify user
    const supabase = await createSupabaseServerClient()
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

    let result

    switch (action) {
      case 'create_journey':
        const validJourneyTypes = ['healing', 'learning', 'cultural_connection', 'personal_growth', 'community_building']
        
        if (!journey_type || !validJourneyTypes.includes(journey_type)) {
          return NextResponse.json(
            { error: `Invalid journey_type. Must be one of: ${validJourneyTypes.join(', ')}` },
            { status: 400 }
          )
        }

        // Verify starting story if provided
        if (starting_story_id) {
          const { data: startingStory } = await supabase
            .from('stories')
            .select('id, title, cultural_sensitivity_level, elder_approval')
            .eq('id', starting_story_id)
            .single()

          if (!startingStory) {
            return NextResponse.json(
              { error: 'Starting story not found' },
              { status: 404 }
            )
          }

          const canAccessStartingStory = startingStory.cultural_sensitivity_level !== 'high' || 
                                       startingStory.elder_approval || 
                                       user.is_elder

          if (!canAccessStartingStory) {
            return NextResponse.json(
              { error: 'Insufficient permissions to use this starting story' },
              { status: 403 }
            )
          }
        }

        result = await storyConnectionAnalysisSystem.createCommunityJourney(
          journey_type as 'healing' | 'learning' | 'cultural_connection' | 'personal_growth' | 'community_building',
          user_id,
          starting_story_id,
          user_goals
        )

        // Log journey creation
        await supabase
          .from('ai_connection_analysis_logs')
          .insert({
            user_id,
            analysis_type: 'community_journey',
            journey_type,
            starting_story_id,
            user_goals,
            journey_steps: result.story_path.length,
            cultural_context: user.cultural_affiliations || [],
            analyzed_at: new Date().toISOString()
          })
          .catch(error => {
            console.error('Failed to log journey creation:', error)
          })

        return NextResponse.json({
          success: true,
          community_journey: result,
          journey_metadata: {
            user_id,
            journey_type,
            starting_story_id,
            user_goals,
            cultural_context: user.cultural_affiliations,
            created_at: new Date().toISOString()
          }
        })

      case 'analyze_connections':
        const { focal_story_id, analysis_type = 'comprehensive', max_connections = 10 } = body

        if (!focal_story_id) {
          return NextResponse.json(
            { error: 'focal_story_id is required for connection analysis' },
            { status: 400 }
          )
        }

        // Verify story access
        const { data: focalStory } = await supabase
          .from('stories')
          .select('id, title, cultural_sensitivity_level, elder_approval, author_id')
          .eq('id', focal_story_id)
          .single()

        if (!focalStory) {
          return NextResponse.json(
            { error: 'Focal story not found' },
            { status: 404 }
          )
        }

        const canAccessFocal = focalStory.cultural_sensitivity_level !== 'high' || 
                              focalStory.elder_approval || 
                              user.is_elder ||
                              focalStory.author_id === user_id

        if (!canAccessFocal) {
          return NextResponse.json(
            { error: 'Insufficient permissions to analyze this story' },
            { status: 403 }
          )
        }

        result = await storyConnectionAnalysisSystem.analyzeStoryConnections({
          focal_story_id,
          user_id,
          analysis_type: analysis_type as 'comprehensive' | 'thematic' | 'cultural' | 'healing_journey',
          cultural_context: {
            user_background: cultural_context.user_background,
            cultural_affiliations: cultural_context.cultural_affiliations || user.cultural_affiliations,
            learning_goals: cultural_context.learning_goals,
            spiritual_readiness: cultural_context.spiritual_readiness
          },
          max_connections
        })

        return NextResponse.json({
          success: true,
          connection_network: result,
          analysis_metadata: {
            focal_story_id,
            user_id,
            analysis_type,
            cultural_context: cultural_context,
            connections_found: result.connections.length,
            analyzed_at: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: create_journey or analyze_connections' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Story connection creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create story connections',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Batch operations for story connections
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user_id, story_ids = [], analysis_type = 'thematic' } = body

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'Action and user_id are required' },
        { status: 400 }
      )
    }

    // Verify user has elevated permissions for batch operations
    const supabase = await createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, is_elder, community_roles')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasElevatedPermissions = user.is_elder || 
                                  (user.community_roles && user.community_roles.includes('content_manager'))

    if (!hasElevatedPermissions) {
      return NextResponse.json(
        { error: 'Batch operations require elder status or content manager role' },
        { status: 403 }
      )
    }

    let result

    switch (action) {
      case 'batch_analyze':
        if (!story_ids.length || story_ids.length > 10) {
          return NextResponse.json(
            { error: 'Provide between 1 and 10 story IDs for batch analysis' },
            { status: 400 }
          )
        }

        // Analyze connections for multiple stories
        const batchResults = await Promise.allSettled(
          story_ids.map((storyId: string) => 
            storyConnectionAnalysisSystem.analyzeStoryConnections({
              focal_story_id: storyId,
              user_id,
              analysis_type: analysis_type as 'comprehensive' | 'thematic' | 'cultural' | 'healing_journey'
            })
          )
        )

        const successful = batchResults
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value)

        const failed = batchResults
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map(result => result.reason)

        result = {
          successful_analyses: successful,
          failed_analyses: failed.length,
          total_requested: story_ids.length
        }

        // Log batch analysis
        await supabase
          .from('ai_connection_analysis_logs')
          .insert({
            user_id,
            analysis_type: 'batch_analysis',
            batch_story_ids: story_ids,
            successful_analyses: successful.length,
            failed_analyses: failed.length,
            analyzed_at: new Date().toISOString()
          })
          .catch(error => {
            console.error('Failed to log batch analysis:', error)
          })

        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: batch_analyze' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      batch_results: result,
      metadata: {
        user_id,
        user_permissions: {
          is_elder: user.is_elder,
          community_roles: user.community_roles
        },
        processed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Batch story connection error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to perform batch story connection analysis',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}