import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { magicLinkService } from '@/lib/services/magic-link.service'

export const dynamic = 'force-dynamic'

/**
 * Magic Link Authentication Handler
 *
 * Handles passwordless authentication for storytellers via magic links and QR codes.
 *
 * Flow:
 * 1. Field worker creates story with storyteller info
 * 2. System generates magic link with token
 * 3. Storyteller clicks link or scans QR code
 * 4. This route validates token and creates/authenticates user
 * 5. Links story to storyteller account
 * 6. Redirects to story review page
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Processing magic link authentication...')

    const { searchParams, origin } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      console.error('❌ No token provided')
      return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent('Invalid magic link')}`
      )
    }

    // Validate the magic link token
    const validation = await magicLinkService.validateToken(token)

    if (!validation.valid || !validation.invitation) {
      console.error('❌ Invalid token:', validation.error)
      return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent(validation.error || 'Invalid or expired link')}`
      )
    }

    const invitation = validation.invitation
    console.log('✅ Valid invitation for storyteller:', invitation.storytellerName)

    const supabase = await createClient()

    // Check if user is already authenticated
    const { data: { user: existingUser } } = await supabase.auth.getUser()

    if (existingUser) {
      console.log('👤 User already authenticated:', existingUser.email)

      // Accept the invitation with existing user ID
      const acceptance = await magicLinkService.acceptInvitation(token, existingUser.id)

      if (acceptance.success && acceptance.storyId) {
        console.log('✅ Invitation accepted, redirecting to story')

        // Create notification for storyteller
        await supabase
          .from('notifications')
          .insert({
            user_id: existingUser.id,
            notification_type: 'story_ready',
            title: 'Your Story is Ready to Review',
            message: `Your story "${invitation.storytellerName}'s story" has been captured and is ready for your review.`,
            action_url: `/my-story/${acceptance.storyId}`,
            priority: 'normal',
          })

        return NextResponse.redirect(`${origin}/my-story/${acceptance.storyId}`)
      } else {
        console.error('❌ Failed to accept invitation:', acceptance.error)
        return NextResponse.redirect(
          `${origin}/auth/signin?error=${encodeURIComponent(acceptance.error || 'Failed to link story')}`
        )
      }
    }

    // User is not authenticated - need to create account or sign in
    console.log('🆕 New user - creating account via magic link')

    if (!invitation.storytellerEmail) {
      console.error('❌ No email in invitation - cannot auto-create account')
      return NextResponse.redirect(
        `${origin}/auth/signup?token=${token}&name=${encodeURIComponent(invitation.storytellerName)}`
      )
    }

    // Use Supabase magic link OTP to create/sign in user
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: invitation.storytellerEmail,
      options: {
        emailRedirectTo: `${origin}/auth/magic-callback?token=${token}`,
        data: {
          display_name: invitation.storytellerName,
          first_name: invitation.storytellerName.split(' ')[0],
          last_name: invitation.storytellerName.split(' ').slice(1).join(' '),
          is_storyteller: true,
          magic_link_token: token,
        },
      },
    })

    if (otpError) {
      console.error('❌ OTP error:', otpError.message)
      return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent('Failed to send verification email')}`
      )
    }

    console.log('📧 Magic link email sent to:', invitation.storytellerEmail)

    // Redirect to check email page
    return NextResponse.redirect(
      `${origin}/auth/verify-magic-link?email=${encodeURIComponent(invitation.storytellerEmail)}&name=${encodeURIComponent(invitation.storytellerName)}`
    )

  } catch (error) {
    console.error('💥 Magic link error:', error)
    return NextResponse.redirect(
      `${new URL(request.url).origin}/auth/signin?error=${encodeURIComponent('An error occurred')}`
    )
  }
}
