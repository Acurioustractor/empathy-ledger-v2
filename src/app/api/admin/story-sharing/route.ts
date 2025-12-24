export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'

const ACT_FARM_APP_NAME = 'act_farm'

const resolveApp = async () => {
  const serviceClient = createSupabaseServiceClient()
  const { data: app, error } = await (serviceClient as any)
    .from('external_applications')
    .select('id, app_name, app_display_name, is_active')
    .eq('app_name', ACT_FARM_APP_NAME)
    .single()

  if (error || !app) {
    return { error: 'ACT Farm app not found in external_applications.' }
  }

  if (!app.is_active) {
    return { error: 'ACT Farm app is inactive.' }
  }

  return { app }
}

const resolveStoryOwner = async (storyId: string) => {
  const serviceClient = createSupabaseServiceClient()
  const { data: story, error } = await (serviceClient as any)
    .from('stories')
    .select('id, storyteller_id, author_id')
    .eq('id', storyId)
    .single()

  if (error || !story) {
    return { error: 'Story not found.' }
  }

  const storytellerId = story.storyteller_id || story.author_id
  if (!storytellerId) {
    return { error: 'Story is missing storyteller/author ownership.' }
  }

  return { storytellerId }
}

export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminAuth()
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get('story_id')

  if (!storyId) {
    return NextResponse.json({ error: 'story_id is required.' }, { status: 400 })
  }

  const { app, error: appError } = await resolveApp()
  if (!app) {
    return NextResponse.json({ error: appError }, { status: 404 })
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: consent, error } = await (serviceClient as any)
    .from('story_syndication_consent')
    .select(
      'consent_granted, share_full_content, share_summary_only, share_media, share_attribution, anonymous_sharing'
    )
    .eq('story_id', storyId)
    .eq('app_id', app.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sharing status.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    shared: Boolean(consent?.consent_granted),
    settings: consent || null,
  })
}

export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdminAuth()
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const body = await request.json()
  const storyId = body.story_id as string | undefined
  const share = Boolean(body.share)
  const shareMedia = body.share_media !== false

  if (!storyId) {
    return NextResponse.json({ error: 'story_id is required.' }, { status: 400 })
  }

  const { app, error: appError } = await resolveApp()
  if (!app) {
    return NextResponse.json({ error: appError }, { status: 404 })
  }

  const serviceClient = createSupabaseServiceClient()
  const timestamp = new Date().toISOString()

  if (!share) {
    const { error } = await (serviceClient as any)
      .from('story_syndication_consent')
      .update({
        consent_granted: false,
        consent_revoked_at: timestamp,
        updated_at: timestamp,
      })
      .eq('story_id', storyId)
      .eq('app_id', app.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to revoke sharing.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ shared: false })
  }

  const { storytellerId, error: storyError } = await resolveStoryOwner(storyId)
  if (!storytellerId) {
    return NextResponse.json({ error: storyError }, { status: 400 })
  }

  const { error } = await (serviceClient as any)
    .from('story_syndication_consent')
    .upsert(
      {
        story_id: storyId,
        storyteller_id: storytellerId,
        app_id: app.id,
        consent_granted: true,
        consent_granted_at: timestamp,
        consent_revoked_at: null,
        share_full_content: false,
        share_summary_only: true,
        share_media: shareMedia,
        share_attribution: true,
        anonymous_sharing: false,
        requires_cultural_approval: false,
        cultural_approval_status: null,
        updated_at: timestamp,
      },
      { onConflict: 'story_id,app_id' }
    )

  if (error) {
    return NextResponse.json(
      { error: 'Failed to enable sharing.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ shared: true })
}
