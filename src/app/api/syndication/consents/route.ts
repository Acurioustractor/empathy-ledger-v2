import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/syndication/consents
 *
 * Get all syndication consents for the current storyteller.
 *
 * Query params:
 * - status: Filter by status (approved, pending, revoked, expired)
 * - siteSlug: Filter by site slug
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // 2. Parse query params
    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get('status')
    const siteSlugFilter = searchParams.get('siteSlug')

    // 3. Build query
    let query = supabase
      .from('syndication_consent')
      .select(`
        id,
        story_id,
        site_id,
        status,
        cultural_permission_level,
        created_at,
        revoked_at,
        story:stories(
          title
        ),
        site:syndication_sites(
          name,
          slug,
          logo_url,
          allowed_domains
        ),
        embed_tokens(
          usage_count,
          last_used_at
        )
      `)
      .eq('storyteller_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (siteSlugFilter) {
      // Join filter - need to do this client-side
      // For now, we'll fetch all and filter after
    }

    const { data: consents, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching consents:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch consents', details: fetchError.message },
        { status: 500 }
      )
    }

    // Client-side filter for site slug if needed
    let filteredConsents = consents || []
    if (siteSlugFilter) {
      filteredConsents = filteredConsents.filter(
        (c: any) => c.site?.slug === siteSlugFilter
      )
    }

    return NextResponse.json({
      consents: filteredConsents,
      count: filteredConsents.length
    }, { status: 200 })

  } catch (error) {
    console.error('Error in consents GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
