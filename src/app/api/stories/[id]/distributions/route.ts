import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getDistributionService } from '@/lib/services/distribution.service'
import { DistributionPlatform } from '@/types/database/story-ownership'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stories/[id]/distributions
 *
 * List all distributions for a story.
 * Requires authentication and story ownership.
 *
 * Query params:
 * - includeRevoked: boolean - Include revoked distributions (default: false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const includeRevoked = request.nextUrl.searchParams.get('includeRevoked') === 'true'

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Verify story ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, storyteller_id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (story.author_id !== user.id && story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    // Get distributions
    const distributionService = getDistributionService()
    const distributionMap = await distributionService.getDistributionMap(storyId)

    // Filter out revoked if not requested
    const distributions = includeRevoked
      ? distributionMap.distributions
      : distributionMap.distributions.filter(d => d.status === 'active')

    return NextResponse.json({
      success: true,
      storyId,
      storyTitle: story.title,
      summary: {
        total: distributionMap.totalDistributions,
        active: distributionMap.activeDistributions,
        revoked: distributionMap.revokedDistributions,
        totalViews: distributionMap.totalViews
      },
      byPlatform: distributionMap.byPlatform,
      distributions: distributions.map(d => ({
        id: d.id,
        platform: d.platform,
        platformPostId: d.platform_post_id,
        distributionUrl: d.distribution_url,
        embedDomain: d.embed_domain,
        status: d.status,
        viewCount: d.view_count,
        clickCount: d.click_count,
        lastViewedAt: d.last_viewed_at,
        revokedAt: d.revoked_at,
        revocationReason: d.revocation_reason,
        expiresAt: d.expires_at,
        createdAt: d.created_at,
        notes: d.notes
      }))
    })

  } catch (error) {
    console.error('Get distributions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch distributions', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stories/[id]/distributions
 *
 * Register a new distribution for a story.
 * Requires authentication and story ownership.
 *
 * Body:
 * - platform: DistributionPlatform - Required
 * - platformPostId?: string - External platform's post ID (for API takedowns)
 * - distributionUrl?: string - URL where the story is shared
 * - embedDomain?: string - Domain for embeds
 * - webhookUrl?: string - URL for revocation notifications
 * - webhookSecret?: string - Secret for webhook signature verification
 * - notes?: string - Internal notes
 * - expiresAt?: string - ISO date when distribution expires
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

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
    const {
      platform,
      platformPostId,
      distributionUrl,
      embedDomain,
      webhookUrl,
      webhookSecret,
      notes,
      expiresAt
    } = body

    // Validate platform
    const validPlatforms: DistributionPlatform[] = [
      'embed', 'twitter', 'facebook', 'linkedin', 'website', 'blog', 'api', 'rss', 'newsletter', 'custom'
    ]
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`, code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Get user's tenant_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Register distribution
    const distributionService = getDistributionService()
    const distribution = await distributionService.registerDistribution(
      storyId,
      user.id,
      profile.tenant_id,
      {
        platform,
        platformPostId,
        distributionUrl,
        embedDomain,
        webhookUrl,
        webhookSecret,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      }
    )

    return NextResponse.json({
      success: true,
      distribution: {
        id: distribution.id,
        platform: distribution.platform,
        platformPostId: distribution.platform_post_id,
        distributionUrl: distribution.distribution_url,
        status: distribution.status,
        createdAt: distribution.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Register distribution error:', error)

    if (error instanceof Error) {
      if (error.message.includes('not own') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: error.message, code: 'UNAUTHORIZED' },
          { status: 403 }
        )
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message, code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to register distribution', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stories/[id]/distributions
 *
 * Revoke a distribution or all distributions for a story.
 * Requires authentication and story ownership.
 *
 * Query params:
 * - distributionId: string - Specific distribution to revoke (optional)
 * - all: boolean - Revoke all distributions (default: false)
 * - reason: string - Revocation reason (optional)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const distributionId = request.nextUrl.searchParams.get('distributionId')
    const revokeAll = request.nextUrl.searchParams.get('all') === 'true'
    const reason = request.nextUrl.searchParams.get('reason') || 'Revoked by owner'

    if (!distributionId && !revokeAll) {
      return NextResponse.json(
        { error: 'Either distributionId or all=true is required', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    const distributionService = getDistributionService()

    if (revokeAll) {
      // Revoke all distributions for the story
      const count = await distributionService.revokeAllDistributions(
        storyId,
        user.id,
        profile?.tenant_id,
        reason
      )

      return NextResponse.json({
        success: true,
        message: `Revoked ${count} distributions`,
        revokedCount: count
      })
    } else {
      // Revoke specific distribution
      await distributionService.revokeDistribution(
        distributionId!,
        user.id,
        profile?.tenant_id,
        reason
      )

      return NextResponse.json({
        success: true,
        message: 'Distribution revoked successfully'
      })
    }

  } catch (error) {
    console.error('Revoke distribution error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: error.message, code: 'UNAUTHORIZED' },
          { status: 403 }
        )
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message, code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to revoke distribution', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
