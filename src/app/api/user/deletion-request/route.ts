import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getGDPRService } from '@/lib/services/gdpr.service'
import { getEmailService } from '@/lib/services/email.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/user/deletion-request
 *
 * Create a GDPR deletion request.
 * This initiates the process for data deletion or anonymization.
 *
 * Body:
 * - requestType: 'anonymize_story' | 'delete_account' | 'export_data'
 * - scope?: object - Scope of the deletion (e.g., { storyId: '...' } for story anonymization)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { requestType, scope } = body

    // Validate request type
    const validTypes = ['anonymize_story', 'delete_account', 'export_data']
    if (!requestType || !validTypes.includes(requestType)) {
      return NextResponse.json(
        { error: `Invalid request type. Must be one of: ${validTypes.join(', ')}`, code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Validate scope for story anonymization
    if (requestType === 'anonymize_story' && !scope?.storyId) {
      return NextResponse.json(
        { error: 'storyId is required in scope for story anonymization', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Get user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Create deletion request
    const gdprService = getGDPRService()
    const deletionRequest = await gdprService.createDeletionRequest(
      user.id,
      profile.tenant_id,
      requestType,
      scope
    )

    // Send email notification for deletion request
    const emailService = getEmailService()

    // Return response based on request type
    if (requestType === 'export_data') {
      // For data export, we can process immediately
      const exportData = await gdprService.exportUserData(user.id)

      // Send data export ready email
      try {
        await emailService.sendDataExportReady(
          { email: user.email!, name: user.user_metadata?.display_name },
          `/api/user/data-export/${deletionRequest.id}`, // Download URL
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
          profile.tenant_id
        )
      } catch (emailError) {
        console.error('Failed to send data export email:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        requestId: deletionRequest.id,
        message: 'Data export ready',
        export: exportData
      })
    }

    // Send deletion request received email
    try {
      await emailService.sendDeletionRequestReceived(
        { email: user.email!, name: user.user_metadata?.display_name },
        deletionRequest.id,
        profile.tenant_id
      )
    } catch (emailError) {
      console.error('Failed to send deletion request email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      requestId: deletionRequest.id,
      status: deletionRequest.status,
      message: requestType === 'delete_account'
        ? 'Deletion request created. Please check your email to verify and complete the request.'
        : 'Anonymization request created.',
      verificationRequired: requestType === 'delete_account',
      itemsToProcess: deletionRequest.items_total
    }, { status: 201 })

  } catch (error) {
    console.error('Create deletion request error:', error)
    return NextResponse.json(
      { error: 'Failed to create deletion request', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/deletion-request
 *
 * Get all deletion requests for the current user.
 *
 * Query params:
 * - requestId?: string - Get a specific request
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const requestId = request.nextUrl.searchParams.get('requestId')

    if (requestId) {
      // Get specific request
      const gdprService = getGDPRService()
      const status = await gdprService.getDeletionRequestStatus(requestId, user.id)

      return NextResponse.json({
        success: true,
        request: status
      })
    }

    // Get all requests for user
    const { data: requests, error } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch deletion requests')
    }

    return NextResponse.json({
      success: true,
      requests: (requests || []).map(r => ({
        id: r.id,
        requestType: r.request_type,
        status: r.status,
        scope: r.scope,
        itemsProcessed: r.items_processed,
        itemsTotal: r.items_total,
        requestedAt: r.requested_at,
        verifiedAt: r.verified_at,
        completedAt: r.completed_at,
        error: r.error_message
      }))
    })

  } catch (error) {
    console.error('Get deletion requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deletion requests', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/deletion-request
 *
 * Verify and process a deletion request.
 *
 * Body:
 * - requestId: string - The request to verify
 * - verificationToken: string - The verification token from email
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { requestId, verificationToken } = body

    if (!requestId || !verificationToken) {
      return NextResponse.json(
        { error: 'requestId and verificationToken are required', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Verify and process the request
    const gdprService = getGDPRService()
    await gdprService.verifyDeletionRequest(requestId, verificationToken)
    await gdprService.processDeletionRequest(requestId)

    // Send completion email
    try {
      const emailService = getEmailService()
      await emailService.sendDeletionRequestCompleted(
        { email: user.email!, name: user.user_metadata?.display_name },
        requestId
      )
    } catch (emailError) {
      console.error('Failed to send deletion completion email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Deletion request processed successfully'
    })

  } catch (error) {
    console.error('Process deletion request error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return NextResponse.json(
          { error: error.message, code: 'INVALID_TOKEN' },
          { status: 400 }
        )
      }
      if (error.message.includes('already')) {
        return NextResponse.json(
          { error: error.message, code: 'ALREADY_PROCESSED' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to process deletion request', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/deletion-request
 *
 * Cancel a pending deletion request.
 *
 * Query params:
 * - requestId: string - The request to cancel
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const requestId = request.nextUrl.searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId is required', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Verify request belongs to user and is pending
    const { data: deletionRequest, error: fetchError } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !deletionRequest) {
      return NextResponse.json(
        { error: 'Deletion request not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (deletionRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending requests', code: 'INVALID_STATE' },
        { status: 400 }
      )
    }

    // Cancel the request
    const { error: updateError } = await supabase
      .from('deletion_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)

    if (updateError) {
      throw new Error('Failed to cancel deletion request')
    }

    return NextResponse.json({
      success: true,
      message: 'Deletion request cancelled'
    })

  } catch (error) {
    console.error('Cancel deletion request error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel deletion request', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
