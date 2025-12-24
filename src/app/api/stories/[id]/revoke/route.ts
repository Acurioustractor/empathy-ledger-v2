import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getRevocationService } from '@/lib/services/revocation.service'
import { RevocationOptions } from '@/types/database/story-ownership'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stories/[id]/revoke
 *
 * One-click revocation with cascade effect.
 * Revokes embeds, distributions, and optionally archives the story.
 *
 * Body:
 * - scope: 'all' | 'embeds' | 'distributions' - What to revoke
 * - reason?: string - Reason for revocation
 * - archiveStory?: boolean - Archive the story (default: true for 'all' scope)
 * - disableSharing?: boolean - Disable future sharing (default: true)
 * - notifyWebhooks?: boolean - Send webhook notifications (default: true)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
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
      scope = 'all',
      reason,
      archiveStory,
      disableSharing,
      notifyWebhooks
    } = body

    // Validate scope
    const validScopes = ['all', 'embeds', 'distributions']
    if (!validScopes.includes(scope)) {
      return NextResponse.json(
        { error: `Invalid scope. Must be one of: ${validScopes.join(', ')}`, code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Build revocation options
    const options: RevocationOptions = {
      scope,
      reason,
      archiveStory,
      disableSharing,
      notifyWebhooks
    }

    // Execute revocation
    const revocationService = getRevocationService()
    const result = await revocationService.initiateRevocation(
      storyId,
      user.id,
      null,
      options
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Revocation failed',
          code: 'REVOCATION_FAILED',
          details: result.errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      result: {
        storyId: result.storyId,
        embedsRevoked: result.embedsRevoked,
        distributionsRevoked: result.distributionsRevoked,
        webhooksSent: result.webhooksSent,
        webhooksFailed: result.webhooksFailed,
        storyArchived: result.storyArchived,
        completedAt: result.completedAt,
        durationMs: result.durationMs
      },
      warnings: result.errors.length > 0 ? result.errors : undefined
    })

  } catch (error) {
    console.error('Revocation error:', error)

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
      { error: 'Failed to process revocation', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stories/[id]/revoke
 *
 * Get revocation preview - shows what will be affected.
 *
 * Query params:
 * - scope: 'all' | 'embeds' | 'distributions' - What to preview
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const scope = (request.nextUrl.searchParams.get('scope') || 'all') as 'all' | 'embeds' | 'distributions'

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get preview
    const revocationService = getRevocationService()
    const preview = await revocationService.getRevocationPreview(storyId, user.id, scope)

    return NextResponse.json({
      success: true,
      preview
    })

  } catch (error) {
    console.error('Revocation preview error:', error)

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
      { error: 'Failed to get revocation preview', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
