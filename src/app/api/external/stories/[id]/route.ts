export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { verifyAppToken, extractBearerToken } from '@/lib/external/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

/**
 * GET /api/external/stories/[id]
 *
 * Fetch a single story by ID if the app has consent to access it.
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *
 * Response:
 * {
 *   "story": {
 *     "story_id": "...",
 *     "title": "...",
 *     "content": "...",
 *     ...
 *   }
 * }
 */
export async function GET(
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

    const supabase = createSupabaseServiceClient()

    // Check if syndication tables exist
    // Table will be created via migration - bypass type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: tableCheckError } = await (supabase as any)
      .from('story_syndication_consent')
      .select('id')
      .limit(1)

    if (tableCheckError?.code === '42P01') {
      return NextResponse.json(
        { error: 'Syndication not yet configured' },
        { status: 503 }
      )
    }

    // Fetch story with consent check
    const { data: storyData, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        excerpt,
        keywords,
        cultural_tags,
        linked_media,
        created_at,
        updated_at,
        storytellers!inner (
          id,
          display_name,
          full_name
        ),
        story_syndication_consent!inner (
          consent_granted,
          consent_expires_at,
          consent_revoked_at,
          share_full_content,
          share_summary_only,
          share_media,
          share_attribution,
          anonymous_sharing,
          cultural_restrictions,
          requires_cultural_approval,
          cultural_approval_status,
          app_id
        )
      `)
      .eq('id', storyId)
      .eq('story_syndication_consent.app_id', payload.app_id)
      .eq('story_syndication_consent.consent_granted', true)
      .is('story_syndication_consent.consent_revoked_at', null)
      .single()

    if (error || !storyData) {
      return NextResponse.json(
        { error: 'Story not found or no consent to access' },
        { status: 404 }
      )
    }

    const story = storyData as AnyRecord
    const consent = story.story_syndication_consent?.[0] || {}
    const storyteller = story.storytellers || {}

    // Check cultural approval if required
    if (consent.requires_cultural_approval && consent.cultural_approval_status !== 'approved') {
      return NextResponse.json(
        { error: 'Story pending cultural approval' },
        { status: 403 }
      )
    }

    // Check consent expiry
    if (consent.consent_expires_at && new Date(consent.consent_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Consent has expired' },
        { status: 403 }
      )
    }

    // Transform according to consent settings
    let sharedContent = ''
    if (consent.share_full_content) {
      sharedContent = story.content || ''
    } else if (consent.share_summary_only) {
      sharedContent = story.excerpt || (story.content?.slice(0, 500) + '...') || ''
    }

    let storytellerName = 'Anonymous Storyteller'
    if (consent.share_attribution && !consent.anonymous_sharing) {
      storytellerName = storyteller.display_name || storyteller.full_name || 'Anonymous Storyteller'
    }

    const sharedMedia = consent.share_media ? story.linked_media : null

    return NextResponse.json({
      story: {
        story_id: story.id,
        title: story.title || 'Untitled Story',
        content: sharedContent,
        storyteller_name: storytellerName,
        themes: story.keywords || story.cultural_tags,
        story_date: story.created_at,
        updated_at: story.updated_at,
        cultural_restrictions: consent.cultural_restrictions || null,
        media: sharedMedia
      }
    })
  } catch (error) {
    console.error('External story fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}
