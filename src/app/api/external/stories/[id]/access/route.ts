export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAppToken, extractBearerToken, logStoryAccess } from '@/lib/external/auth'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

interface AccessLogBody {
  access_type: 'view' | 'embed' | 'export'
  context?: Record<string, unknown>
}

/**
 * POST /api/external/stories/[id]/access
 *
 * Log that an external app accessed a story. Used for audit trail.
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *
 * Path Parameters:
 *   - id: Story ID
 *
 * Request Body:
 * {
 *   "access_type": "view" | "embed" | "export",
 *   "context": { ... optional additional context ... }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "logged_at": "2024-01-15T10:30:00Z"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const payload = await verifyAppToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: AccessLogBody = await request.json()

    if (!body.access_type || !['view', 'embed', 'export'].includes(body.access_type)) {
      return NextResponse.json(
        { error: 'Invalid access_type. Must be one of: view, embed, export' },
        { status: 400 }
      )
    }

    // Verify the app has consent to access this story
    const hasConsent = await verifyStoryConsent(storyId, payload.app_id)
    if (!hasConsent) {
      return NextResponse.json(
        { error: 'No consent to access this story' },
        { status: 403 }
      )
    }

    // Extract request metadata
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log the access
    await logStoryAccess(storyId, payload.app_id, body.access_type, {
      ip,
      userAgent,
      additionalContext: body.context
    })

    return NextResponse.json({
      success: true,
      logged_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Story access logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log access' },
      { status: 500 }
    )
  }
}

/**
 * Verify that an app has consent to access a specific story
 */
async function verifyStoryConsent(storyId: string, appId: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient()

  // Table will be created via migration - bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('story_syndication_consent')
    .select('id')
    .eq('story_id', storyId)
    .eq('app_id', appId)
    .eq('consent_granted', true)
    .is('consent_revoked_at', null)
    .single()

  if (error || !data) {
    return false
  }

  return true
}
