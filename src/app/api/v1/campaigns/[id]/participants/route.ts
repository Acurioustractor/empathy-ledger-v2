import { NextRequest, NextResponse } from 'next/server'
import { CampaignWorkflowService } from '@/lib/services/campaign-workflow.service'

/**
 * GET /api/v1/campaigns/[id]/participants
 * Get all participants (workflows) for a campaign
 *
 * Query params:
 * - stage: Filter by workflow stage
 * - elder_review: Filter by elder review status (true|false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const searchParams = request.nextUrl.searchParams

    const stage = searchParams.get('stage') as any
    const elderReview = searchParams.get('elder_review')

    const workflows = await CampaignWorkflowService.getWorkflowsByCampaign(campaignId, {
      stage,
      elderReviewRequired: elderReview === 'true' ? true : elderReview === 'false' ? false : undefined,
    })

    return NextResponse.json({
      success: true,
      data: workflows,
      meta: {
        count: workflows.length,
        campaign_id: campaignId,
      },
    })
  } catch (error) {
    console.error('Error getting campaign participants:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get participants',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/campaigns/[id]/participants
 * Add a participant to the campaign (create workflow)
 *
 * Request body:
 * {
 *   storyteller_id: string (required)
 *   invitation_method: 'email' | 'phone' | 'in_person' | etc.
 *   notes?: string
 *   metadata?: object
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()

    if (!body.storyteller_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Storyteller ID is required',
        },
        { status: 400 }
      )
    }

    const workflow = await CampaignWorkflowService.trackInvitation({
      storytellerId: body.storyteller_id,
      campaignId,
      invitationMethod: body.invitation_method || 'email',
      notes: body.notes,
      metadata: body.metadata,
    })

    return NextResponse.json(
      {
        success: true,
        data: workflow,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding campaign participant:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add participant',
      },
      { status: 500 }
    )
  }
}
