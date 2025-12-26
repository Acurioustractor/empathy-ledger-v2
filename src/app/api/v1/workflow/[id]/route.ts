import { NextRequest, NextResponse } from 'next/server'
import { CampaignWorkflowService } from '@/lib/services/campaign-workflow.service'

/**
 * GET /api/v1/workflow/[id]
 * Get workflow by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id

    const workflow = await CampaignWorkflowService.getWorkflow(workflowId)

    return NextResponse.json({
      success: true,
      data: workflow,
    })
  } catch (error) {
    console.error('Error getting workflow:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workflow',
      },
      { status: 404 }
    )
  }
}

/**
 * PATCH /api/v1/workflow/[id]
 * Update workflow or advance stage
 *
 * Request body:
 * {
 *   stage?: 'invited' | 'interested' | 'consented' | etc.
 *   notes?: string
 *   metadata?: object
 *   follow_up_date?: string
 *   follow_up_notes?: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id
    const body = await request.json()

    // If stage is provided, use advance stage method
    if (body.stage) {
      const workflow = await CampaignWorkflowService.advanceStage({
        workflowId,
        newStage: body.stage,
        notes: body.notes,
      })

      return NextResponse.json({
        success: true,
        data: workflow,
      })
    }

    // Otherwise update metadata or follow-up
    if (body.metadata) {
      await CampaignWorkflowService.updateMetadata({
        workflowId,
        metadata: body.metadata,
      })
    }

    if (body.follow_up_date) {
      await CampaignWorkflowService.setFollowUp({
        workflowId,
        followUpDate: body.follow_up_date,
        notes: body.follow_up_notes,
      })
    }

    const workflow = await CampaignWorkflowService.getWorkflow(workflowId)

    return NextResponse.json({
      success: true,
      data: workflow,
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workflow',
      },
      { status: 500 }
    )
  }
}
