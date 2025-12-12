export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { verifyAppToken, extractBearerToken, ExternalAppPayload } from '@/lib/external/auth'

interface SyndicatedStory {
  story_id: string
  title: string
  content: string
  storyteller_name: string
  themes: string[] | null
  story_date: string
  cultural_restrictions: Record<string, unknown> | null
  media: string[] | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

/**
 * GET /api/external/stories
 *
 * Fetch stories that the authenticated app has consent to access.
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *
 * Query Parameters:
 *   - type: Filter by story type (e.g., "testimony", "case_study")
 *   - limit: Max number of stories to return (default: 20, max: 100)
 *   - offset: Pagination offset (default: 0)
 *   - since: Only stories updated after this ISO date
 *
 * Response:
 * {
 *   "stories": [...],
 *   "total": 42,
 *   "limit": 20,
 *   "offset": 0
 * }
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const storyType = searchParams.get('type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const since = searchParams.get('since')

    // Fetch syndicated stories for this app
    const stories = await fetchSyndicatedStories(payload, {
      storyType,
      limit,
      offset,
      since
    })

    return NextResponse.json({
      stories: stories.data,
      total: stories.count,
      limit,
      offset
    })
  } catch (error) {
    console.error('External stories API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}

async function fetchSyndicatedStories(
  appPayload: ExternalAppPayload,
  options: {
    storyType: string | null
    limit: number
    offset: number
    since: string | null
  }
): Promise<{ data: SyndicatedStory[]; count: number }> {
  const supabase = createSupabaseServiceClient()

  // Check if syndication tables exist by trying to query them
  // Table will be created via migration - bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: tableCheckError } = await (supabase as any)
    .from('story_syndication_consent')
    .select('id')
    .limit(1)

  // If syndication tables don't exist yet, return empty
  if (tableCheckError?.code === '42P01') { // Table doesn't exist
    console.log('Syndication tables not yet created - returning empty results')
    return { data: [], count: 0 }
  }

  // Build query for stories with consent for this app
  // Note: storyteller_id references profiles table, not storytellers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, count } = await (supabase as any)
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
      storyteller_id,
      profiles:storyteller_id (
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
    `, { count: 'exact' })
    .eq('story_syndication_consent.app_id', appPayload.app_id)
    .eq('story_syndication_consent.consent_granted', true)
    .is('story_syndication_consent.consent_revoked_at', null)
    .gte('updated_at', options.since || '1970-01-01')
    .order('created_at', { ascending: false })
    .range(options.offset, options.offset + options.limit - 1)

  if (error) {
    // If the join table doesn't exist, return empty gracefully
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.log('Syndication relationship not found:', error.message)
      return { data: [], count: 0 }
    }
    console.error('Error fetching syndicated stories:', error)
    throw error
  }

  // Transform data according to consent settings
  const transformedStories: SyndicatedStory[] = ((data || []) as AnyRecord[]).map((story) => {
    const consent = story.story_syndication_consent?.[0] || {}
    const storyteller = story.storytellers || {}

    // Determine content to share
    let sharedContent = ''
    if (consent.share_full_content) {
      sharedContent = story.content || ''
    } else if (consent.share_summary_only) {
      sharedContent = story.excerpt || (story.content?.slice(0, 500) + '...') || ''
    }

    // Determine storyteller name
    let storytellerName = 'Anonymous Storyteller'
    if (consent.share_attribution && !consent.anonymous_sharing) {
      storytellerName = storyteller.display_name || storyteller.full_name || 'Anonymous Storyteller'
    }

    // Determine media
    const sharedMedia = consent.share_media ? story.linked_media : null

    return {
      story_id: story.id,
      title: story.title || 'Untitled Story',
      content: sharedContent,
      storyteller_name: storytellerName,
      themes: story.keywords || story.cultural_tags,
      story_date: story.created_at,
      cultural_restrictions: consent.cultural_restrictions || null,
      media: sharedMedia
    }
  })

  // Filter out stories that require cultural approval but haven't been approved
  const filteredStories = transformedStories.filter((_, index) => {
    const story = (data as AnyRecord[])?.[index]
    const consent = story?.story_syndication_consent?.[0]
    if (consent?.requires_cultural_approval) {
      return consent.cultural_approval_status === 'approved'
    }
    return true
  })

  return {
    data: filteredStories,
    count: count || 0
  }
}
