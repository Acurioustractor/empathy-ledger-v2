import { NextRequest, NextResponse } from 'next/server'
import { CampaignService } from '@/lib/services/campaign.service'

/**
 * GET /api/v1/campaigns
 * List campaigns with optional filtering
 *
 * Query params:
 * - status: Filter by status (draft|active|paused|completed|archived)
 * - type: Filter by campaign type
 * - featured: Filter featured campaigns (true|false)
 * - public: Filter public campaigns (true|false)
 * - limit: Number of results (default: 50, max: 100)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const publicParam = searchParams.get('public')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const campaigns = await CampaignService.list({
      status: status ? (status.split(',') as any) : undefined,
      campaign_type: type as any,
      is_featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      is_public: publicParam === 'true' ? true : publicParam === 'false' ? false : undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: campaigns,
      meta: {
        count: campaigns.length,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Error listing campaigns:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list campaigns',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/campaigns
 * Create a new campaign
 *
 * Request body:
 * {
 *   name: string (required)
 *   description?: string
 *   tagline?: string
 *   campaign_type?: 'tour_stop' | 'community_outreach' | 'partnership' | etc.
 *   start_date?: string (ISO date)
 *   end_date?: string (ISO date)
 *   location_text?: string
 *   city?: string
 *   country?: string
 *   latitude?: number
 *   longitude?: number
 *   storyteller_target?: number
 *   story_target?: number
 *   requires_consent_workflow?: boolean
 *   requires_elder_review?: boolean
 *   cultural_protocols?: string
 *   traditional_territory?: string
 *   is_public?: boolean
 *   metadata?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign name is required',
        },
        { status: 400 }
      )
    }

    // Validate dates if provided
    if (body.start_date && body.end_date) {
      const start = new Date(body.start_date)
      const end = new Date(body.end_date)
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

    // Validate targets if provided
    if (body.storyteller_target && body.storyteller_target <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Storyteller target must be greater than 0',
        },
        { status: 400 }
      )
    }

    const campaign = await CampaignService.create({
      name: body.name.trim(),
      description: body.description,
      tagline: body.tagline,
      campaign_type: body.campaign_type,
      start_date: body.start_date,
      end_date: body.end_date,
      location_text: body.location_text,
      city: body.city,
      country: body.country,
      latitude: body.latitude,
      longitude: body.longitude,
      storyteller_target: body.storyteller_target,
      story_target: body.story_target,
      requires_consent_workflow: body.requires_consent_workflow,
      requires_elder_review: body.requires_elder_review,
      cultural_protocols: body.cultural_protocols,
      traditional_territory: body.traditional_territory,
      is_public: body.is_public,
      metadata: body.metadata,
    })

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      },
      { status: 500 }
    )
  }
}
