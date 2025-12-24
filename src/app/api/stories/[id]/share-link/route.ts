import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { nanoid } from 'nanoid'

/**
 * Generate Ephemeral Share Link for Story
 *
 * POST /api/stories/:id/share-link
 *
 * Creates a time-limited, revocable access token for story sharing.
 * This enables storytellers to share their stories while maintaining control.
 *
 * Body:
 * {
 *   expiresIn: number (seconds, default: 7 days),
 *   maxViews: number (optional),
 *   purpose: 'social-media' | 'email' | 'embed' | 'direct-share' | 'partner',
 *   sharedTo: string[] (optional, e.g., ['twitter', 'facebook']),
 *   watermarkText: string (optional)
 * }
 *
 * Returns:
 * {
 *   token: string,
 *   shareUrl: string,
 *   expiresAt: string,
 *   maxViews: number | null
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      expiresIn = 7 * 24 * 60 * 60, // Default: 7 days in seconds
      maxViews,
      purpose = 'direct-share',
      sharedTo,
      watermarkText,
    } = body

    // Validate story exists and user is the storyteller
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, storyteller_id, tenant_id, status, title')
      .eq('id', params.id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check authorization: only storyteller can create share links
    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the storyteller can create share links' },
        { status: 403 }
      )
    }

    // Cannot create share links for withdrawn stories
    if (story.status === 'withdrawn') {
      return NextResponse.json(
        { error: 'Cannot create share links for withdrawn stories' },
        { status: 400 }
      )
    }

    // Generate unique token (URL-safe, 21 characters)
    const token = nanoid(21)

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Create access token
    const { data: accessToken, error: createError } = await supabase
      .from('story_access_tokens')
      .insert({
        story_id: story.id,
        token,
        expires_at: expiresAt.toISOString(),
        max_views: maxViews || null,
        purpose,
        shared_to: sharedTo || [],
        watermark_text: watermarkText || null,
        created_by: user.id,
        tenant_id: story.tenant_id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating access token:', createError)
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      )
    }

    // Build shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/s/${token}`

    return NextResponse.json({
      token,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      maxViews: maxViews || null,
      purpose,
      storyTitle: story.title,
    })
  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * List Share Links for Story
 *
 * GET /api/stories/:id/share-link
 *
 * Returns all active share links for this story.
 * Only accessible by the storyteller.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Validate story exists and user is the storyteller
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, storyteller_id')
      .eq('id', params.id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the storyteller can view share links' },
        { status: 403 }
      )
    }

    // Get all access tokens for this story
    const { data: tokens, error: tokensError } = await supabase
      .from('story_access_tokens')
      .select('*')
      .eq('story_id', params.id)
      .order('created_at', { ascending: false })

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError)
      return NextResponse.json(
        { error: 'Failed to fetch share links' },
        { status: 500 }
      )
    }

    // Build share URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareLinks = tokens.map((token) => ({
      id: token.id,
      shareUrl: `${baseUrl}/s/${token.token}`,
      purpose: token.purpose,
      sharedTo: token.shared_to,
      viewCount: token.view_count,
      maxViews: token.max_views,
      expiresAt: token.expires_at,
      revoked: token.revoked,
      createdAt: token.created_at,
      lastAccessedAt: token.last_accessed_at,
      isActive: !token.revoked && new Date(token.expires_at) > new Date(),
    }))

    return NextResponse.json({ shareLinks })
  } catch (error) {
    console.error('Error fetching share links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Revoke Share Link
 *
 * DELETE /api/stories/:id/share-link?token=xxx
 *
 * Revokes a specific share link, making it immediately inaccessible.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get token from query params
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('token')

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      )
    }

    // Validate story exists and user is the storyteller
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, storyteller_id')
      .eq('id', params.id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the storyteller can revoke share links' },
        { status: 403 }
      )
    }

    // Revoke the token
    const { error: revokeError } = await supabase
      .from('story_access_tokens')
      .update({ revoked: true })
      .eq('id', tokenId)
      .eq('story_id', params.id)

    if (revokeError) {
      console.error('Error revoking token:', revokeError)
      return NextResponse.json(
        { error: 'Failed to revoke share link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully',
    })
  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
