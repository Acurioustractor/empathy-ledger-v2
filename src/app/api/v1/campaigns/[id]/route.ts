import { NextRequest, NextResponse } from 'next/server'
import { CampaignService } from '@/lib/services/campaign.service'

/**
 * GET /api/v1/campaigns/[id]
 * Get campaign by ID with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Check if requesting detailed view
    const searchParams = request.nextUrl.searchParams
    const detailed = searchParams.get('detailed') === 'true'

    const campaign = detailed
      ? await CampaignService.getDetails(campaignId)
      : await CampaignService.getById(campaignId)

    return NextResponse.json({
      success: true,
      data: campaign,
    })
  } catch (error) {
    console.error('Error getting campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get campaign',
      },
      { status: 404 }
    )
  }
}

/**
 * PATCH /api/v1/campaigns/[id]
 * Update campaign
 *
 * Request body: Partial campaign fields to update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const updates = await request.json()

    // Remove immutable fields
    delete updates.id
    delete updates.slug
    delete updates.tenant_id
    delete updates.created_by
    delete updates.created_at

    // Validate dates if provided
    if (updates.start_date && updates.end_date) {
      const start = new Date(updates.start_date)
      const end = new Date(updates.end_date)
      if (end < start) {
        return NextResponse.json(
          {
            success: false,
            error: 'End date must be after start date',
          },
          { status: 400 }
        )
      }
    }

    const campaign = await CampaignService.update(campaignId, updates)

    return NextResponse.json({
      success: true,
      data: campaign,
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update campaign',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/campaigns/[id]
 * Delete campaign (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    await CampaignService.delete(campaignId)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete campaign',
      },
      { status: 500 }
    )
  }
}
