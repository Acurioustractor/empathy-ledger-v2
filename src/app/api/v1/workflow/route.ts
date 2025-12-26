import { NextRequest, NextResponse } from 'next/server'
import { CampaignWorkflowService } from '@/lib/services/campaign-workflow.service'

/**
 * GET /api/v1/workflow
 * Get pending workflow queue (prioritized)
 *
 * Query params:
 * - campaign_id: Filter by campaign
 * - limit: Number of results (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const queue = await CampaignWorkflowService.getPendingQueue({
      campaignId: campaignId || undefined,
      limit,
    })

    return NextResponse.json({
      success: true,
      data: queue,
      meta: {
        count: queue.length,
        limit,
      },
    })
  } catch (error) {
    console.error('Error getting workflow queue:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workflow queue',
      },
      { status: 500 }
    )
  }
}
