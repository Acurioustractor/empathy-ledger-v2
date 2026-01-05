import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/syndication/consent/[consentId]/revoke
 *
 * Revokes an existing syndication consent.
 *
 * Philosophy: OCAP principles - storyteller maintains full control and can revoke at any time.
 * When consent is revoked, associated embed tokens are immediately invalidated.
 *
 * Body: { reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ consentId: string }> }
) {
  try {
    const { consentId } = await params
    const supabase = createSupabaseServerClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // 2. Parse optional reason from body
    const body = await request.json().catch(() => ({}))
    const { reason } = body

    // 3. Get consent record
    const { data: consent, error: consentError } = await supabase
      .from('syndication_consent')
      .select('*')
      .eq('id', consentId)
      .single()

    if (consentError || !consent) {
      return NextResponse.json(
        { error: 'Consent not found' },
        { status: 404 }
      )
    }

    // 4. Verify user owns this consent
    if (consent.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only revoke your own consent' },
        { status: 403 }
      )
    }

    // 5. Check if already revoked
    if (consent.status === 'revoked') {
      return NextResponse.json(
        { error: 'Consent already revoked', consent },
        { status: 400 }
      )
    }

    // 6. Update consent status to revoked
    const { data: revokedConsent, error: updateError } = await supabase
      .from('syndication_consent')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString()
      })
      .eq('id', consentId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error revoking consent:', updateError)
      return NextResponse.json(
        { error: 'Failed to revoke consent', details: updateError.message },
        { status: 500 }
      )
    }

    // 7. Revoke all associated embed tokens for this story
    const { revokeAllTokensForStory } = await import('@/lib/services/embed-token-service')

    const { success: tokenRevoked, revokedCount } = await revokeAllTokensForStory(
      consent.story_id,
      reason || 'Consent revoked by storyteller'
    )

    if (!tokenRevoked) {
      console.error('Error revoking tokens for story:', consent.story_id)
      // Continue anyway - consent is revoked even if token update fails
    } else {
      console.log(`Revoked ${revokedCount} embed token(s) for story ${consent.story_id}`)
    }

    // 8. Log the revocation (optional - for audit trail)
    const { error: logError } = await supabase
      .from('embed_token_access_log')
      .insert({
        story_id: consent.story_id,
        site_id: consent.site_id,
        status: 'revoked',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: {
          consent_id: consentId,
          revoked_by: user.id,
          reason: reason || 'Consent revoked by storyteller'
        }
      })

    if (logError) {
      console.error('Error logging revocation:', logError)
      // Not critical - continue anyway
    }

    // 9. TODO: Send webhook notification to syndication site
    // if (consent.site.webhook_url) {
    //   await sendRevocationWebhook(consent.site.webhook_url, {
    //     consentId,
    //     storyId: consent.story_id,
    //     action: 'revoked'
    //   })
    // }

    return NextResponse.json({
      success: true,
      consent: revokedConsent,
      message: 'Consent revoked successfully. External sites will no longer be able to access this story.'
    }, { status: 200 })

  } catch (error) {
    console.error('Error in revoke consent API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
