/**
 * Content Access API
 *
 * Provides secure access to syndicated story content for external ACT sites.
 * Validates tokens, enforces cultural protocols, tracks usage.
 *
 * ACT Philosophy Alignment:
 * - Storyteller sovereignty (content can be revoked anytime)
 * - Cultural safety (respects sacred content blocks)
 * - Transparency (all access is logged and visible to storyteller)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateEmbedToken } from '@/lib/services/embed-token-service'

interface ContentAccessLog {
  storyId: string
  siteId: string
  accessedAt: Date
  ipAddress: string | null
  userAgent: string | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params

  try {
    const supabase = await createClient()

    // Get authorization token
    const authHeader = request.headers.get('authorization')
    const tokenString = authHeader?.replace('Bearer ', '')

    if (!tokenString) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    // Validate embed token
    const origin = request.headers.get('origin') || ''
    const tokenValidation = await validateEmbedToken(tokenString, {
      checkDomain: origin,
      incrementUsage: true
    })

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error || 'Invalid token' },
        { status: 401 }
      )
    }

    const { token } = tokenValidation

    // Verify story ID matches token
    if (token?.storyId !== storyId) {
      return NextResponse.json(
        { error: 'Token does not grant access to this story' },
        { status: 403 }
      )
    }

    // Get story data
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        excerpt,
        themes,
        created_at,
        tenant_id,
        storyteller_id,
        is_public,
        cultural_permission_level,
        storyteller:profiles!stories_storyteller_id_fkey (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      console.error('Story fetch error:', storyError)
      console.log('Story ID:', storyId)
      console.log('Token validation passed:', tokenValidation.valid)
      return NextResponse.json(
        { error: 'Story not found', details: storyError?.message },
        { status: 404 }
      )
    }

    // Cultural safety check
    if (story.cultural_permission_level === 'sacred') {
      return NextResponse.json(
        {
          error: 'Sacred content cannot be syndicated',
          message: 'This story contains sacred cultural content that cannot be shared outside Empathy Ledger.'
        },
        { status: 403 }
      )
    }

    // Check if story is approved for syndication
    // TODO: Check syndication_consent table
    // For PoC, we'll allow access to all public stories

    if (!story.is_public) {
      return NextResponse.json(
        { error: 'Story not available for syndication' },
        { status: 403 }
      )
    }

    // Log access (for storyteller transparency)
    const accessLog: ContentAccessLog = {
      storyId: story.id,
      siteId: 'unknown', // Note: site_id column doesn't exist in embed_tokens schema
      accessedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null
    }

    // Store access log in syndication_engagement_events table
    const { error: logError } = await supabase
      .from('syndication_engagement_events')
      .insert({
        story_id: story.id,
        site_id: null, // Note: No site_id available in current schema
        tenant_id: story.tenant_id,
        event_type: 'view',
        event_timestamp: new Date().toISOString(),
        referrer: request.headers.get('referer'),
        user_agent: accessLog.userAgent,
        ip_address: accessLog.ipAddress
      })

    if (logError) {
      console.error('Failed to log engagement event:', logError)
    }

    // Get media assets
    const { data: mediaAssets } = await supabase
      .from('media_assets')
      .select('id, filename, storage_path, media_type, thumbnail_url')
      .eq('story_id', storyId)
      .eq('is_public', true)
      .limit(5)

    // Return story content
    return NextResponse.json({
      story: {
        id: story.id,
        title: story.title,
        content: story.content,
        excerpt: story.excerpt,
        themes: story.themes,
        createdAt: story.created_at,
        storyteller: {
          id: story.storyteller?.id,
          displayName: story.storyteller?.display_name,
          avatarUrl: story.storyteller?.avatar_url
        },
        mediaAssets: mediaAssets?.map(asset => ({
          id: asset.id,
          filename: asset.filename,
          mediaType: asset.media_type,
          thumbnailUrl: asset.thumbnail_url
        })) || []
      },
      attribution: {
        platform: 'Empathy Ledger',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/stories/${storyId}`,
        message: 'This story is shared with permission from the storyteller via Empathy Ledger.'
      },
      permissions: {
        canEmbed: true,
        canModify: false,
        mustAttribution: true,
        revocable: true
      }
    })
  } catch (error) {
    console.error('Error fetching story content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // TODO: Restrict to ACT sites
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-api-key, x-site-id'
    }
  })
}
