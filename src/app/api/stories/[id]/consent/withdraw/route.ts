import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getRevocationService } from '@/lib/services/revocation.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stories/[id]/consent/withdraw
 *
 * Withdraw consent for a story. This triggers automatic revocation of all
 * embeds and distributions, and disables future sharing.
 *
 * This is a GDPR-aligned action that cascades through the entire distribution chain.
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

    // Execute consent withdrawal with cascade
    const revocationService = getRevocationService()
    const result = await revocationService.cascadeConsentWithdrawal(
      storyId,
      user.id,
      profile.tenant_id
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Consent withdrawal failed',
          code: 'WITHDRAWAL_FAILED',
          details: result.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Consent withdrawn successfully',
      result: {
        storyId: result.storyId,
        itemsAffected: result.itemsAffected,
        actions: result.actions
      }
    })

  } catch (error) {
    console.error('Consent withdrawal error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('not own')) {
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
      { error: 'Failed to withdraw consent', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stories/[id]/consent/withdraw
 *
 * Get current consent status for a story.
 */
export async function GET(
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

    // Get story consent status
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        author_id,
        storyteller_id,
        has_consent,
        consent_verified,
        consent_withdrawn_at,
        sharing_enabled,
        embeds_enabled
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check ownership
    if (story.author_id !== user.id && story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      consent: {
        storyId: story.id,
        storyTitle: story.title,
        hasConsent: story.has_consent,
        consentVerified: story.consent_verified,
        consentWithdrawnAt: story.consent_withdrawn_at,
        sharingEnabled: story.sharing_enabled,
        embedsEnabled: story.embeds_enabled,
        canWithdraw: story.has_consent && !story.consent_withdrawn_at
      }
    })

  } catch (error) {
    console.error('Get consent status error:', error)
    return NextResponse.json(
      { error: 'Failed to get consent status', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
