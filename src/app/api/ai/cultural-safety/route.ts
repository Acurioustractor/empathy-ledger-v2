import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { 


  culturalSafetyModerationSystem,
  moderateStory,
  getElderReviewQueue,
  submitElderReview
} from '@/lib/ai/cultural-safety-moderation'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_id, content_type, content, title, author_id, cultural_context, submission_context = 'new_submission' } = body

    if (!content_id || !content_type || !content || !author_id) {
      return NextResponse.json(
        { error: 'content_id, content_type, content, and author_id are required' },
        { status: 400 }
      )
    }

    // Verify the author exists
    const supabase = createSupabaseServerClient()
    const { data: author, error: authorError } = await supabase
      .from('profiles')
      .select('id, display_name, is_elder')
      .eq('id', author_id)
      .single()

    if (authorError || !author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    // Validate content type
    const validContentTypes = ['story', 'profile', 'media', 'comment', 'gallery']
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: `Invalid content type. Must be one of: ${validContentTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Perform cultural safety moderation
    const moderationResult = await culturalSafetyModerationSystem.moderateContent({
      content_id,
      content_type: content_type as 'story' | 'profile' | 'media' | 'comment' | 'gallery',
      content,
      title,
      author_id,
      cultural_context,
      submission_context: submission_context as 'new_submission' | 'edit' | 'republication' | 'appeal'
    })

    // Log moderation request
    await supabase
      .from('ai_moderation_logs')
      .insert({
        content_id,
        content_type,
        author_id,
        moderation_status: moderationResult.status,
        cultural_issues_detected: moderationResult.moderation_details.detected_issues?.length || 0,
        elder_review_required: moderationResult.status === 'elder_review_required',
        moderated_at: moderationResult.moderated_at
      })
      .catch(error => {
        console.error('Failed to log moderation request:', error)
      })

    // Prepare response based on moderation result
    const response = {
      success: true,
      moderation_result: {
        request_id: moderationResult.request_id,
        content_id: moderationResult.content_id,
        status: moderationResult.status,
        confidence_level: moderationResult.moderation_details.confidence_level,
        detected_issues: moderationResult.moderation_details.detected_issues,
        cultural_elements: moderationResult.moderation_details.cultural_elements,
        elder_review_required: moderationResult.status === 'elder_review_required',
        elder_review_priority: moderationResult.moderation_details.elder_review_priority,
        community_oversight_needed: moderationResult.moderation_details.community_oversight_needed,
        recommended_actions: moderationResult.moderation_details.recommended_actions
      },
      appeals_available: moderationResult.appeals_available,
      review_deadline: moderationResult.review_deadline,
      metadata: {
        author_id,
        author_is_elder: author.is_elder,
        submission_context,
        moderated_at: moderationResult.moderated_at
      }
    }

    // Set appropriate status code based on moderation result
    let statusCode = 200
    if (moderationResult.status === 'elder_review_required') {
      statusCode = 202 // Accepted but requires further action
    } else if (moderationResult.status === 'blocked') {
      statusCode = 451 // Unavailable for legal reasons (content policy)
    }

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('AI cultural safety moderation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to perform cultural safety moderation',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Get elder review queue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const elderId = searchParams.get('elder_id')
    const action = searchParams.get('action') || 'queue'
    const timeframe = searchParams.get('timeframe') || 'week'

    if (!elderId) {
      return NextResponse.json(
        { error: 'Elder ID is required' },
        { status: 400 }
      )
    }

    // Verify elder permissions
    const supabase = createSupabaseServerClient()
    const { data: elder, error: elderError } = await supabase
      .from('profiles')
      .select('id, display_name, is_elder')
      .eq('id', elderId)
      .single()

    if (elderError || !elder || !elder.is_elder) {
      return NextResponse.json(
        { error: 'Elder not found or insufficient permissions' },
        { status: 403 }
      )
    }

    if (action === 'queue') {
      // Get elder review queue
      const reviewQueue = await getElderReviewQueue(elderId)

      return NextResponse.json({
        success: true,
        elder_id: elderId,
        review_queue: reviewQueue,
        queue_summary: {
          total_items: reviewQueue.length,
          pending: reviewQueue.filter(item => item.status === 'pending').length,
          in_review: reviewQueue.filter(item => item.status === 'in_review').length,
          high_priority: reviewQueue.filter(item => item.priority === 'high' || item.priority === 'urgent').length,
          community_input_required: reviewQueue.filter(item => item.community_input_required).length
        },
        metadata: {
          retrieved_at: new Date().toISOString()
        }
      })

    } else if (action === 'stats') {
      // Get moderation statistics
      const stats = await culturalSafetyModerationSystem.getModerationStats(
        timeframe as 'day' | 'week' | 'month'
      )

      return NextResponse.json({
        success: true,
        elder_id: elderId,
        moderation_stats: stats,
        timeframe,
        metadata: {
          retrieved_at: new Date().toISOString()
        }
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: queue or stats' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Elder review queue error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve elder review information',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Submit elder review decision
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { review_id, elder_id, decision, notes, conditions = [] } = body

    if (!review_id || !elder_id || !decision || !notes) {
      return NextResponse.json(
        { error: 'review_id, elder_id, decision, and notes are required' },
        { status: 400 }
      )
    }

    // Validate decision
    const validDecisions = ['approved', 'rejected', 'needs_consultation']
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: `Invalid decision. Must be one of: ${validDecisions.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify elder permissions
    const supabase = createSupabaseServerClient()
    const { data: elder, error: elderError } = await supabase
      .from('profiles')
      .select('id, display_name, is_elder')
      .eq('id', elder_id)
      .single()

    if (elderError || !elder || !elder.is_elder) {
      return NextResponse.json(
        { error: 'Elder not found or insufficient permissions' },
        { status: 403 }
      )
    }

    // Verify the review item exists and is assigned to this elder
    const { data: reviewItem, error: reviewError } = await supabase
      .from('elder_review_queue')
      .select('*')
      .eq('id', review_id)
      .single()

    if (reviewError || !reviewItem) {
      return NextResponse.json(
        { error: 'Review item not found' },
        { status: 404 }
      )
    }

    if (reviewItem.assigned_elder_id && reviewItem.assigned_elder_id !== elder_id) {
      return NextResponse.json(
        { error: 'This review is assigned to a different elder' },
        { status: 403 }
      )
    }

    // Submit the elder review decision
    const success = await submitElderReview(review_id, elder_id, decision as 'approved' | 'rejected' | 'needs_consultation', notes, conditions)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to submit elder review decision' },
        { status: 500 }
      )
    }

    // Log the elder decision
    await supabase
      .from('ai_moderation_logs')
      .insert({
        content_id: reviewItem.content_id,
        content_type: reviewItem.content_type,
        elder_id: elder_id,
        elder_decision: decision,
        elder_notes: notes,
        elder_conditions: conditions,
        reviewed_at: new Date().toISOString()
      })
      .catch(error => {
        console.error('Failed to log elder decision:', error)
      })

    return NextResponse.json({
      success: true,
      review_decision: {
        review_id,
        elder_id,
        decision,
        notes,
        conditions,
        content_id: reviewItem.content_id,
        content_type: reviewItem.content_type
      },
      metadata: {
        elder_name: elder.display_name,
        reviewed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Elder review decision error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit elder review decision',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Appeal moderation decision
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { request_id, user_id, appeal_reason, additional_context } = body

    if (!request_id || !user_id || !appeal_reason) {
      return NextResponse.json(
        { error: 'request_id, user_id, and appeal_reason are required' },
        { status: 400 }
      )
    }

    // Verify user and get moderation result
    const supabase = createSupabaseServerClient()
    const { data: user } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', user_id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { data: moderationResult } = await supabase
      .from('moderation_results')
      .select('*')
      .eq('id', request_id)
      .single()

    if (!moderationResult) {
      return NextResponse.json(
        { error: 'Moderation result not found' },
        { status: 404 }
      )
    }

    if (!moderationResult.appeals_available) {
      return NextResponse.json(
        { error: 'This moderation decision cannot be appealed' },
        { status: 400 }
      )
    }

    // Create appeal record
    const { error: appealError } = await supabase
      .from('moderation_appeals')
      .insert({
        moderation_request_id: request_id,
        user_id,
        appeal_reason,
        additional_context,
        appeal_status: 'pending',
        submitted_at: new Date().toISOString()
      })

    if (appealError) {
      console.error('Failed to create appeal:', appealError)
      return NextResponse.json(
        { error: 'Failed to submit appeal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appeal_submitted: {
        request_id,
        user_id,
        appeal_reason,
        status: 'pending'
      },
      metadata: {
        user_name: user.display_name,
        submitted_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Moderation appeal error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit moderation appeal',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}