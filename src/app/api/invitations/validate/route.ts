export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { magicLinkService } from '@/lib/services/magic-link.service'

/**
 * GET /api/invitations/validate?token=xxx
 *
 * Validates a magic link token and returns invitation details
 * Used by the /auth/magic page to check if token is valid
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Missing token parameter' },
        { status: 400 }
      )
    }

    const result = await magicLinkService.validateToken(token)

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 200 } // Return 200 so client can show appropriate UI
      )
    }

    // Return invitation details (excluding sensitive data)
    return NextResponse.json({
      valid: true,
      invitation: {
        id: result.invitation!.id,
        storyId: result.invitation!.storyId,
        storytellerName: result.invitation!.storytellerName,
        storytellerEmail: result.invitation!.storytellerEmail,
        expiresAt: result.invitation!.expiresAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
