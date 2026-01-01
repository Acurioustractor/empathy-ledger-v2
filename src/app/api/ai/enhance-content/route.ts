import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { 


  contentEnhancementSystem,
  enhanceStoryThemes,
  generateStoryMetadata
} from '@/lib/ai/content-enhancement-system'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      story_id, 
      user_id, 
      enhancement_types = ['themes', 'metadata'], 
      cultural_context 
    } = body

    if (!story_id || !user_id) {
      return NextResponse.json(
        { error: 'Story ID and User ID are required' },
        { status: 400 }
      )
    }

    // Verify user has permission to enhance content
    const supabase = createSupabaseServerClient()
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles!stories_author_id_fkey(id, display_name),
        storyteller:storytellers(display_name, cultural_background)
      `)
      .eq('id', story_id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to enhance this content
    const { data: user } = await supabase
      .from('profiles')
      .select('id, is_elder, cultural_permissions')
      .eq('id', user_id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow enhancement if user is the author, storyteller, or has cultural permissions
    const isAuthor = story.author.id === user_id
    const isStoryteller = story.storyteller_id === user_id
    const hasEnhancementPermission = user.cultural_permissions?.allow_ai_enhancement !== false

    if (!isAuthor && !isStoryteller && !user.is_elder && !hasEnhancementPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to enhance this content' },
        { status: 403 }
      )
    }

    // Validate enhancement types
    const validEnhancementTypes = ['themes', 'metadata', 'cultural', 'seo', 'accessibility']
    const invalidTypes = enhancement_types.filter((type: string) => !validEnhancementTypes.includes(type))
    
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid enhancement types: ${invalidTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if content has already been enhanced recently
    const { data: recentEnhancement } = await supabase
      .from('content_enhancement_results')
      .select('enhanced_at')
      .eq('story_id', story_id)
      .gte('enhanced_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .single()

    if (recentEnhancement && !user.is_elder) {
      return NextResponse.json(
        { 
          error: 'Content was enhanced recently. Please wait 24 hours before enhancing again.',
          last_enhanced: recentEnhancement.enhanced_at
        },
        { status: 429 }
      )
    }

    // Perform content enhancement
    const enhancementResult = await contentEnhancementSystem.enhanceContent({
      story_id,
      user_id,
      content: story.content,
      title: story.title,
      existing_metadata: story.cultural_context,
      enhancement_types,
      cultural_context: {
        storyteller_background: story.storyteller?.cultural_background,
        cultural_affiliations: cultural_context?.cultural_affiliations || [],
        ceremony_type: cultural_context?.ceremony_type,
        seasonal_context: cultural_context?.seasonal_context
      }
    })

    // If enhancement was blocked due to cultural safety, return appropriate response
    if (!enhancementResult.cultural_safety_approved) {
      return NextResponse.json({
        success: false,
        message: 'Content enhancement requires cultural review',
        requires_elder_review: enhancementResult.requires_elder_review,
        processing_notes: enhancementResult.processing_notes,
        enhancement_id: enhancementResult.story_id
      }, { status: 202 }) // Accepted but requires further action
    }

    // Log the enhancement request
    await supabase
      .from('ai_enhancement_logs')
      .insert({
        story_id,
        user_id,
        enhancement_types,
        cultural_context,
        results_generated: Object.keys(enhancementResult).filter(key => 
          ['themes', 'metadata', 'cultural_analysis', 'seo_enhancement'].includes(key) && 
          enhancementResult[key as keyof typeof enhancementResult]
        ).length,
        cultural_safety_approved: enhancementResult.cultural_safety_approved,
        elder_review_required: enhancementResult.requires_elder_review,
        enhanced_at: enhancementResult.enhancement_timestamp
      })
      .catch(error => {
        console.error('Failed to log enhancement request:', error)
      })

    return NextResponse.json({
      success: true,
      enhancement_result: {
        story_id: enhancementResult.story_id,
        themes: enhancementResult.themes,
        metadata: enhancementResult.metadata,
        cultural_analysis: enhancementResult.cultural_analysis,
        seo_enhancement: enhancementResult.seo_enhancement,
        cultural_safety_approved: enhancementResult.cultural_safety_approved,
        requires_elder_review: enhancementResult.requires_elder_review,
        processing_notes: enhancementResult.processing_notes,
        enhanced_at: enhancementResult.enhancement_timestamp
      },
      metadata: {
        enhancement_types: enhancement_types,
        user_permissions: {
          is_author: isAuthor,
          is_storyteller: isStoryteller,
          is_elder: user.is_elder
        },
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI content enhancement error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to enhance content',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('story_id')
    const userId = searchParams.get('user_id')
    const enhancementType = searchParams.get('type') // 'themes' or 'metadata'

    if (!storyId || !userId) {
      return NextResponse.json(
        { error: 'Story ID and User ID are required' },
        { status: 400 }
      )
    }

    // Verify user has access to this story
    const supabase = createSupabaseServerClient()
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, author_id, cultural_sensitivity_level, elder_approval')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check user permissions for accessing enhancement results
    const { data: user } = await supabase
      .from('profiles')
      .select('id, is_elder, cultural_affiliations')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user can access this story's enhancements
    const isAuthor = story.author_id === userId
    const canAccessHighSensitivity = story.cultural_sensitivity_level !== 'high' || 
                                   story.elder_approval || 
                                   user.is_elder

    if (!isAuthor && !canAccessHighSensitivity) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access this content enhancement' },
        { status: 403 }
      )
    }

    // Get enhancement results based on type
    let result
    if (enhancementType === 'themes') {
      result = await enhanceStoryThemes(storyId, userId)
      if (!result) {
        return NextResponse.json(
          { error: 'No theme enhancement found for this story' },
          { status: 404 }
        )
      }
    } else if (enhancementType === 'metadata') {
      result = await generateStoryMetadata(storyId, userId)
      if (!result) {
        return NextResponse.json(
          { error: 'No metadata enhancement found for this story' },
          { status: 404 }
        )
      }
    } else {
      // Get full enhancement results
      result = await contentEnhancementSystem.getEnhancementResults(storyId)
      if (!result) {
        return NextResponse.json(
          { error: 'No enhancement results found for this story' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      story_id: storyId,
      enhancement_type: enhancementType || 'full',
      results: result,
      metadata: {
        user_id: userId,
        user_permissions: {
          is_author: isAuthor,
          is_elder: user.is_elder,
          can_access_high_sensitivity: canAccessHighSensitivity
        },
        retrieved_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI content enhancement retrieval error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve enhancement results',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Batch enhancement endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { story_ids, user_id, enhancement_types = ['themes', 'metadata'] } = body

    if (!story_ids || !Array.isArray(story_ids) || !user_id) {
      return NextResponse.json(
        { error: 'Story IDs array and User ID are required' },
        { status: 400 }
      )
    }

    if (story_ids.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 stories can be enhanced in a batch' },
        { status: 400 }
      )
    }

    // Verify user has permission for batch enhancement
    const supabase = createSupabaseServerClient()
    const { data: user } = await supabase
      .from('profiles')
      .select('id, is_elder, cultural_permissions')
      .eq('id', user_id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only elders or users with special permissions can do batch enhancement
    if (!user.is_elder && !user.cultural_permissions?.allow_batch_enhancement) {
      return NextResponse.json(
        { error: 'Batch enhancement requires elder status or special permissions' },
        { status: 403 }
      )
    }

    // Perform batch enhancement
    const results = await contentEnhancementSystem.batchEnhanceStories(
      story_ids,
      user_id,
      enhancement_types
    )

    // Log batch enhancement
    await supabase
      .from('ai_enhancement_logs')
      .insert({
        user_id,
        enhancement_types,
        batch_request: true,
        story_ids: story_ids,
        results_generated: results.length,
        enhanced_at: new Date().toISOString()
      })
      .catch(error => {
        console.error('Failed to log batch enhancement request:', error)
      })

    const successful = results.filter(r => r.cultural_safety_approved)
    const requiresReview = results.filter(r => r.requires_elder_review)
    const failed = results.filter(r => !r.cultural_safety_approved && !r.requires_elder_review)

    return NextResponse.json({
      success: true,
      batch_results: {
        total_requested: story_ids.length,
        successful_enhancements: successful.length,
        requires_elder_review: requiresReview.length,
        failed_enhancements: failed.length,
        results: results
      },
      metadata: {
        user_id,
        enhancement_types,
        batch_processed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI batch enhancement error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to perform batch enhancement',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}