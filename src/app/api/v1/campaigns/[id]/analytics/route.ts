import { NextRequest, NextResponse } from 'next/server'
import { CampaignService } from '@/lib/services/campaign.service'

/**
 * GET /api/v1/campaigns/[id]/analytics
 * Get comprehensive analytics for a campaign
 *
 * Returns:
 * - Progress metrics (storyteller/story progress, completion %)
 * - Statistics (total workflows, conversion rate, avg days to publish)
 * - Timeline data (days elapsed, days remaining)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Fetch all analytics data in parallel
    const [progress, statistics] = await Promise.all([
      CampaignService.getProgress(campaignId),
      CampaignService.getStatistics(campaignId),
    ])

    return NextResponse.json({
      success: true,
      data: {
        progress,
        statistics,
        campaign_id: campaignId,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error getting campaign analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      },
      { status: 500 }
    )
  }
}
