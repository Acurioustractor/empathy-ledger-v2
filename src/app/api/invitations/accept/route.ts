export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { magicLinkService } from '@/lib/services/magic-link.service'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/invitations/accept
 *
 * Accept an invitation and link the story to the authenticated user
 *
 * Body: { token: string, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Accept the invitation
    const result = await magicLinkService.acceptInvitation(token, user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      storyId: result.storyId,
      message: 'Invitation accepted successfully'
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
