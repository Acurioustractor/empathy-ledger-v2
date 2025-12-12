export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

interface ExternalApp {
  id: string
  app_name: string
  app_display_name: string
  app_description: string | null
  allowed_story_types: string[] | null
  is_active: boolean
}

interface StorySharingConsent {
  id: string
  story_id: string
  storyteller_id: string
  app_id: string
  consent_granted: boolean
  consent_granted_at: string | null
  consent_revoked_at: string | null
  consent_expires_at: string | null
  share_full_content: boolean
  share_summary_only: boolean
  share_media: boolean
  share_attribution: boolean
  anonymous_sharing: boolean
  cultural_restrictions: Record<string, unknown>
  requires_cultural_approval: boolean
  cultural_approval_status: string | null
}

/**
 * GET - Fetch storyteller's sharing settings and available apps
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const serviceClient = createSupabaseServiceClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all active external applications
    const { data: apps, error: appsError } = await (serviceClient as AnyClient)
      .from('external_applications')
      .select('id, app_name, app_display_name, app_description, allowed_story_types, is_active')
      .eq('is_active', true)
      .order('app_display_name')

    if (appsError) {
      console.error('Error fetching apps:', appsError)
    }

    // Get storyteller's stories
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, status, created_at')
      .or(`storyteller_id.eq.${user.id},author_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
    }

    // Get existing consent records for this storyteller
    const { data: consents, error: consentsError } = await (serviceClient as AnyClient)
      .from('story_syndication_consent')
      .select('*')
      .eq('storyteller_id', user.id)

    if (consentsError) {
      console.error('Error fetching consents:', consentsError)
    }

    // Get access logs for storyteller's stories
    const storyIds = stories?.map((s: { id: string }) => s.id) || []
    let accessLogs: Array<{
      id: string
      story_id: string
      app_id: string
      access_type: string
      accessed_at: string
    }> = []

    if (storyIds.length > 0) {
      const { data: logs } = await (serviceClient as AnyClient)
        .from('story_access_log')
        .select('id, story_id, app_id, access_type, accessed_at')
        .in('story_id', storyIds)
        .order('accessed_at', { ascending: false })
        .limit(50)

      accessLogs = logs || []
    }

    return NextResponse.json({
      success: true,
      data: {
        apps: apps || [],
        stories: stories || [],
        consents: consents || [],
        accessLogs
      }
    })

  } catch (error) {
    console.error('Sharing settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sharing settings' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create or update sharing consent
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const serviceClient = createSupabaseServiceClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      story_id,
      app_id,
      consent_granted,
      share_full_content = false,
      share_summary_only = true,
      share_media = false,
      share_attribution = true,
      anonymous_sharing = false,
      consent_expires_at = null,
      cultural_restrictions = {},
      requires_cultural_approval = false
    } = body

    if (!story_id || !app_id) {
      return NextResponse.json(
        { success: false, error: 'story_id and app_id are required' },
        { status: 400 }
      )
    }

    // Verify the story belongs to this user
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, storyteller_id, author_id')
      .eq('id', story_id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.storyteller_id !== user.id && story.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage this story' },
        { status: 403 }
      )
    }

    // Upsert consent record
    const consentData = {
      story_id,
      storyteller_id: user.id,
      app_id,
      consent_granted,
      consent_granted_at: consent_granted ? new Date().toISOString() : null,
      consent_revoked_at: !consent_granted ? new Date().toISOString() : null,
      consent_expires_at,
      share_full_content,
      share_summary_only,
      share_media,
      share_attribution,
      anonymous_sharing,
      cultural_restrictions,
      requires_cultural_approval,
      updated_at: new Date().toISOString()
    }

    const { data: consent, error: consentError } = await (serviceClient as AnyClient)
      .from('story_syndication_consent')
      .upsert(consentData, {
        onConflict: 'story_id,app_id'
      })
      .select()
      .single()

    if (consentError) {
      console.error('Error upserting consent:', consentError)
      return NextResponse.json(
        { success: false, error: 'Failed to update consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: consent
    })

  } catch (error) {
    console.error('Update consent error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update consent' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Revoke all consent for a story or app
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const serviceClient = createSupabaseServiceClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('story_id')
    const appId = searchParams.get('app_id')

    if (!storyId && !appId) {
      return NextResponse.json(
        { success: false, error: 'story_id or app_id is required' },
        { status: 400 }
      )
    }

    // Build the delete query
    let query = (serviceClient as AnyClient)
      .from('story_syndication_consent')
      .update({
        consent_granted: false,
        consent_revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('storyteller_id', user.id)

    if (storyId) {
      query = query.eq('story_id', storyId)
    }
    if (appId) {
      query = query.eq('app_id', appId)
    }

    const { error: updateError } = await query

    if (updateError) {
      console.error('Error revoking consent:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to revoke consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Consent revoked successfully'
    })

  } catch (error) {
    console.error('Revoke consent error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke consent' },
      { status: 500 }
    )
  }
}
