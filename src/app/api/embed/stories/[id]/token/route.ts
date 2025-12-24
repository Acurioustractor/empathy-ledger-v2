import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getEmbedService } from '@/lib/services/embed.service'
import { EmbedOptions } from '@/types/database/story-ownership'

export const dynamic = 'force-dynamic'

/**
 * POST /api/embed/stories/[id]/token
 *
 * Generate a new embed token for a story.
 * Requires authentication and story ownership.
 *
 * Body:
 * - domains: string[] - Allowed domains (empty = all domains)
 * - expiresIn: number - Expiration in days (optional)
 * - allowAnalytics: boolean - Track views (default: true)
 * - showAttribution: boolean - Show attribution (default: true)
 * - customStyles: object - Custom styling options (optional)
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
      domains = [],
      expiresIn,
      allowAnalytics = true,
      showAttribution = true,
      customStyles = null
    } = body

    // Validate domains array
    if (!Array.isArray(domains)) {
      return NextResponse.json(
        { error: 'domains must be an array', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Build embed options
    const options: EmbedOptions = {
      domains: domains.map((d: string) => d.trim().toLowerCase()).filter(Boolean),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : undefined,
      allowAnalytics,
      showAttribution,
      customStyles
    }

    // Generate embed token
    const embedService = getEmbedService()
    const embedToken = await embedService.generateEmbedToken(
      storyId,
      user.id,
      null,
      options
    )

    return NextResponse.json({
      success: true,
      token: embedToken.token,
      tokenId: embedToken.tokenId,
      embedCode: embedToken.embedCode,
      expiresAt: embedToken.expiresAt,
      allowedDomains: embedToken.allowedDomains,
      embedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/embed/stories/${storyId}?token=${embedToken.token}`
    })

  } catch (error) {
    console.error('Token generation error:', error)

    if (error instanceof Error) {
      // Return user-friendly errors
      if (error.message.includes('not own')) {
        return NextResponse.json(
          { error: error.message, code: 'UNAUTHORIZED' },
          { status: 403 }
        )
      }
      if (error.message.includes('disabled') || error.message.includes('consent')) {
        return NextResponse.json(
          { error: error.message, code: 'EMBED_NOT_ALLOWED' },
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
      { error: 'Failed to generate embed token', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/embed/stories/[id]/token
 *
 * List all active embed tokens for a story.
 * Requires authentication and story ownership.
 */
export async function GET(
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

    // Verify ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, storyteller_id')
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

    // Get embed tokens
    const embedService = getEmbedService()
    const tokens = await embedService.listActiveEmbeds(storyId)

    return NextResponse.json({
      success: true,
      tokens: tokens.map(t => ({
        id: t.id,
        allowedDomains: t.allowed_domains,
        status: t.status,
        expiresAt: t.expires_at,
        usageCount: t.usage_count,
        lastUsedAt: t.last_used_at,
        lastUsedDomain: t.last_used_domain,
        createdAt: t.created_at
      })),
      totalCount: tokens.length
    })

  } catch (error) {
    console.error('List tokens error:', error)
    return NextResponse.json(
      { error: 'Failed to list embed tokens', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/embed/stories/[id]/token
 *
 * Revoke an embed token.
 * Query params: tokenId - The token ID to revoke
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const tokenId = request.nextUrl.searchParams.get('tokenId')

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId is required', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = createSupabaseServerClient()
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
      .select('id, author_id, storyteller_id')
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

    // Revoke the token
    const reason = request.nextUrl.searchParams.get('reason') || 'Revoked by owner'
    const embedService = getEmbedService()
    await embedService.revokeEmbedToken(tokenId, user.id, null, reason)

    return NextResponse.json({
      success: true,
      message: 'Token revoked successfully'
    })

  } catch (error) {
    console.error('Revoke token error:', error)
    return NextResponse.json(
      { error: 'Failed to revoke token', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
