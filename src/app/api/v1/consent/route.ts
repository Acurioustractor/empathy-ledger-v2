/**
 * ACT Consent Management API v1
 *
 * POST /api/v1/consent/grant - Grant consent for story to appear on site
 * POST /api/v1/consent/revoke - Revoke consent
 * GET /api/v1/consent/status - Check consent status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * POST /api/v1/consent/grant
 *
 * Grant storyteller consent for a story to appear on a specific site
 */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const {
      story_id,
      site_id,
      visibility = 'public',
      duration_days = 365,
      featured = false,
      project_tags = []
    } = body

    // Validate required fields
    if (!story_id || !site_id) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, site_id' },
        { status: 400 }
      )
    }

    // Verify user owns the story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, storyteller_id, title')
      .eq('id', story_id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only grant consent for your own stories' },
        { status: 403 }
      )
    }

    // Verify site exists
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, site_name, site_url')
      .eq('id', site_id)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    // Grant consent using database function
    const { data: visibilityId, error: consentError } = await supabase
      .rpc('grant_story_consent', {
        p_story_id: story_id,
        p_site_id: site_id,
        p_granted_by: user.id,
        p_visibility: visibility,
        p_duration_days: duration_days,
        p_featured: featured,
        p_project_tags: project_tags
      })

    if (consentError) {
      console.error('Consent grant error:', consentError)
      return NextResponse.json(
        { error: 'Failed to grant consent' },
        { status: 500 }
      )
    }

    // Send webhook notification to site
    // TODO: See issue #13 in empathy-ledger-v2: Implement webhook system
    // await sendWebhook(site.webhook_url, {
    //   event: 'story.consent.granted',
    //   story_id,
    //   site_id
    // })

    return NextResponse.json({
      success: true,
      message: `Consent granted for "${story.title}" to appear on ${site.site_name}`,
      data: {
        story_id,
        site_id,
        site_name: site.site_name,
        site_url: site.site_url,
        visibility_id: visibilityId,
        expires_at: duration_days
          ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null
      }
    })

  } catch (error) {
    console.error('Consent API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/consent/revoke
 *
 * Revoke storyteller consent - story will be removed from site
 */
export async function DELETE(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { story_id, site_id, reason } = body

    if (!story_id || !site_id) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, site_id' },
        { status: 400 }
      )
    }

    // Verify user owns the story
    const { data: story } = await supabase
      .from('stories')
      .select('id, storyteller_id, title')
      .eq('id', story_id)
      .single()

    if (!story || story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only revoke consent for your own stories' },
        { status: 403 }
      )
    }

    // Get site info before revoking
    const { data: site } = await supabase
      .from('sites')
      .select('site_name, site_url, webhook_url')
      .eq('id', site_id)
      .single()

    // Revoke consent using database function
    const { data: revoked, error: revokeError } = await supabase
      .rpc('revoke_story_consent', {
        p_story_id: story_id,
        p_site_id: site_id,
        p_reason: reason || 'Storyteller request'
      })

    if (revokeError) {
      console.error('Consent revoke error:', revokeError)
      return NextResponse.json(
        { error: 'Failed to revoke consent' },
        { status: 500 }
      )
    }

    if (!revoked) {
      return NextResponse.json(
        { error: 'No active consent found to revoke' },
        { status: 404 }
      )
    }

    // Send webhook notification to site
    // TODO: See issue #14 in empathy-ledger-v2: Implement webhook system
    // if (site?.webhook_url) {
    //   await sendWebhook(site.webhook_url, {
    //     event: 'story.consent.revoked',
    //     story_id,
    //     site_id,
    //     timestamp: new Date().toISOString(),
    //     action_required: 'remove_story',
    //     grace_period_hours: 24
    //   })
    // }

    return NextResponse.json({
      success: true,
      message: `Consent revoked. Story will be removed from ${site?.site_name || 'site'}`,
      data: {
        story_id,
        site_id,
        revoked_at: new Date().toISOString(),
        reason: reason || 'Storyteller request'
      }
    })

  } catch (error) {
    console.error('Consent revoke error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/consent/status
 *
 * Check consent status for a story across all sites
 */
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get('story_id')

  if (!storyId) {
    return NextResponse.json(
      { error: 'Missing required parameter: story_id' },
      { status: 400 }
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  try {
    // Get all visibility records for this story
    let query = supabase
      .from('story_site_visibility')
      .select(`
        id,
        story_id,
        storyteller_consent,
        consent_granted_at,
        consent_expires_at,
        consent_revoked_at,
        visibility,
        featured,
        view_count,
        site:sites (
          id,
          site_key,
          site_name,
          site_url
        )
      `)
      .eq('story_id', storyId)

    // If user is authenticated, verify they own the story
    if (user) {
      const { data: story } = await supabase
        .from('stories')
        .select('storyteller_id')
        .eq('id', storyId)
        .single()

      if (story && story.storyteller_id !== user.id) {
        return NextResponse.json(
          { error: 'You can only view consent status for your own stories' },
          { status: 403 }
        )
      }
    }

    const { data: visibility, error } = await query

    if (error) {
      console.error('Consent status error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch consent status' },
        { status: 500 }
      )
    }

    // Format response
    const sites = (visibility || []).map(v => ({
      site_id: v.site.id,
      site_key: v.site.site_key,
      site_name: v.site.site_name,
      site_url: v.site.site_url,
      consent: {
        granted: v.storyteller_consent,
        granted_at: v.consent_granted_at,
        expires_at: v.consent_expires_at,
        revoked_at: v.consent_revoked_at,
        active: v.storyteller_consent &&
          (!v.consent_expires_at || new Date(v.consent_expires_at) > new Date()) &&
          !v.consent_revoked_at
      },
      visibility: v.visibility,
      featured: v.featured,
      stats: {
        views: v.view_count || 0
      }
    }))

    return NextResponse.json({
      story_id: storyId,
      total_sites: sites.length,
      active_sites: sites.filter(s => s.consent.active).length,
      sites
    })

  } catch (error) {
    console.error('Consent status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
