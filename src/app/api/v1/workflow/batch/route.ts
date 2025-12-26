import { NextRequest, NextResponse } from 'next/server'
import { CampaignWorkflowService } from '@/lib/services/campaign-workflow.service'

/**
 * POST /api/v1/workflow/batch
 * Bulk advance multiple workflows to the same stage
 *
 * Request body:
 * {
 *   workflow_ids: string[] (required)
 *   stage: WorkflowStage (required)
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.workflow_ids || !Array.isArray(body.workflow_ids) || body.workflow_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'workflow_ids array is required',
        },
        { status: 400 }
      )
    }

    if (!body.stage) {
      return NextResponse.json(
        {
          success: false,
          error: 'stage is required',
        },
        { status: 400 }
      )
    }

    const validStages = ['invited', 'interested', 'consented', 'recorded', 'reviewed', 'published', 'withdrawn']
    if (!validStages.includes(body.stage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid stage. Must be one of: ${validStages.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const workflows = await CampaignWorkflowService.bulkAdvance({
      workflowIds: body.workflow_ids,
      newStage: body.stage,
      notes: body.notes,
    })

    return NextResponse.json({
      success: true,
      data: workflows,
      meta: {
        updated_count: workflows.length,
      },
    })
  } catch (error) {
    console.error('Error bulk updating workflows:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk update workflows',
      },
      { status: 500 }
    )
  }
}
