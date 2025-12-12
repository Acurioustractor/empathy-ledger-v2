export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/embed/catalog
 *
 * Returns stories that an app has consent to display.
 * Used by the embeddable catalog widget.
 *
 * Query params:
 *   - app: App ID (required)
 *   - limit: Max stories to return (default: 12)
 *   - offset: Pagination offset (default: 0)
 *   - theme: Filter by theme
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('app')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    const themeFilter = searchParams.get('theme')

    if (!appId) {
      return NextResponse.json(
        { error: 'Missing app parameter' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Verify app exists and is active
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: app } = await (supabase as any)
      .from('external_applications')
      .select('id, app_name, is_active')
      .eq('id', appId)
      .single()

    if (!app || !app.is_active) {
      return NextResponse.json(
        { error: 'Invalid or inactive app' },
        { status: 403 }
      )
    }

    // Get stories with consent for this app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('story_syndication_consent')
      .select(`
        story_id,
        share_full_content,
        share_summary_only,
        stories:story_id (
          id,
          title,
          summary,
          featured_image,
          themes,
          created_at,
          storyteller:storyteller_id (
            id,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('app_id', appId)
      .eq('consent_granted', true)
      .is('consent_revoked_at', null)
      .not('stories', 'is', null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consents, error } = await query
      .range(offset, offset + limit - 1)
      .order('consent_granted_at', { ascending: false })

    if (error) {
      console.error('Error fetching catalog stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    // Transform data based on consent level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stories = (consents || [])
      .filter((c: any) => c.stories)
      .map((consent: any) => {
        const story = consent.stories
        const shareLevel = consent.share_full_content ? 'full' :
                          consent.share_summary_only ? 'summary' : 'title_only'

        return {
          id: story.id,
          title: story.title,
          summary: shareLevel !== 'title_only' ? story.summary : null,
          featured_image: shareLevel === 'full' ? story.featured_image : null,
          themes: story.themes || [],
          created_at: story.created_at,
          storyteller: story.storyteller ? {
            display_name: story.storyteller.display_name,
            avatar_url: shareLevel === 'full' ? story.storyteller.avatar_url : null
          } : null,
          share_level: shareLevel
        }
      })

    // Filter by theme if specified
    const filteredStories = themeFilter
      ? stories.filter((s: any) => s.themes?.includes(themeFilter))
      : stories

    return NextResponse.json({
      stories: filteredStories,
      total: filteredStories.length,
      app: {
        id: app.id,
        name: app.app_name
      }
    }, {
      headers: {
        // Allow CORS for embed usage
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        // Short cache since consent can change
        'Cache-Control': 'public, max-age=60, s-maxage=60'
      }
    })
  } catch (error) {
    console.error('Catalog API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    )
  }
}
