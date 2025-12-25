import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { magicLinkService } from '@/lib/services/magic-link.service'

export const dynamic = 'force-dynamic'

/**
 * Magic Link Callback Handler
 *
 * After storyteller clicks the email verification link from the magic link OTP,
 * this route:
 * 1. Exchanges the code for a session
 * 2. Accepts the invitation and links the story
 * 3. Creates notification
 * 4. Redirects to story review page
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Processing magic link callback...')

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token = searchParams.get('token')

    if (!code) {
      console.error('❌ No auth code provided')
      return NextResponse.redirect(`${origin}/auth/signin?error=auth_error`)
    }

    const supabase = await createClient()

    // Exchange code for session
    console.log('🔐 Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      console.error('❌ Code exchange failed:', error?.message)
      return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent(error?.message || 'Authentication failed')}`
      )
    }

    console.log('✅ Session created for user:', data.user.email)

    // If we have a token, accept the invitation
    if (token) {
      console.log('🎟️ Accepting invitation with token:', token.substring(0, 8) + '...')

      const acceptance = await magicLinkService.acceptInvitation(token, data.user.id)

      if (acceptance.success && acceptance.storyId) {
        console.log('✅ Invitation accepted, story linked')

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: data.user.id,
            notification_type: 'story_ready',
            title: 'Your Story is Ready to Review',
            message: 'Your story has been captured and is ready for your review. You can set privacy settings and review the content.',
            action_url: `/my-story/${acceptance.storyId}`,
            priority: 'normal',
          })

        console.log('📬 Notification created')

        // Redirect to story review
        return NextResponse.redirect(`${origin}/my-story/${acceptance.storyId}`)
      } else {
        console.error('❌ Failed to accept invitation:', acceptance.error)
      }
    }

    // No token or acceptance failed - redirect to dashboard
    console.log('🏠 Redirecting to onboarding')
    return NextResponse.redirect(`${origin}/onboarding/welcome`)

  } catch (error) {
    console.error('💥 Magic link callback error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/signin?error=auth_error`)
  }
}
