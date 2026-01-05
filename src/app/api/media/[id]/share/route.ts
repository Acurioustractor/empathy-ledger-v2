// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: mediaId } = await params
    const body = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch the media asset to check permissions
    const { data: media, error: fetchError } = await supabase
      .from('media_assets')
      .select(`
        id,
        file_name,
        file_type,
        media_type,
        storyteller_id,
        story_id,
        cultural_sensitivity,
        usage_rights,
        consent_status,
        is_public,
        stories!inner(
          title,
          status,
          cultural_sensitivity_level,
          has_explicit_consent
        )
      `)
      .eq('id', mediaId)
      .single()

    if (fetchError || !media) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      )
    }

    // 2. CULTURAL SAFETY CHECK: Verify media can be shared
    const canShare = {
      hasConsent: media.consent_status === 'granted' || media.consent_status === 'verified',
      isPublic: media.is_public === true,
      hasUsageRights: media.usage_rights !== 'restricted',
      isNotHighSensitivity: media.cultural_sensitivity !== 'high',
      storyHasConsent: media.stories?.has_explicit_consent === true
    }

    if (!canShare.hasConsent) {
      return NextResponse.json(
        {
          error: 'Media does not have consent for sharing',
          code: 'NO_CONSENT'
        },
        { status: 403 }
      )
    }

    if (!canShare.isPublic) {
      return NextResponse.json(
        {
          error: 'Media is not marked as public',
          code: 'NOT_PUBLIC'
        },
        { status: 403 }
      )
    }

    if (!canShare.hasUsageRights) {
      return NextResponse.json(
        {
          error: 'Media usage rights are restricted',
          code: 'RESTRICTED_USAGE'
        },
        { status: 403 }
      )
    }

    // 3. WARNING: If high cultural sensitivity, require additional confirmation
    if (media.cultural_sensitivity === 'high') {
      const { confirmed } = body
      if (!confirmed) {
        return NextResponse.json(
          {
            warning: 'This media has high cultural sensitivity. Please confirm you have permission from the storyteller and appropriate cultural advisors.',
            requiresConfirmation: true,
            culturalSensitivity: 'high',
            code: 'HIGH_SENSITIVITY_WARNING'
          },
          { status: 200 }
        )
      }
    }

    // 4. Track the media share event
    const shareData = {
      media_id: mediaId,
      storyteller_id: media.storyteller_id,
      story_id: media.story_id,
      media_type: media.media_type,
      share_method: body.method || 'link', // link, download, embed, social
      share_platform: body.platform || null,
      shared_by_user_id: body.userId || null,
      shared_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      download_count: body.method === 'download' ? 1 : 0,
      metadata: body.metadata || {}
    }

    // Insert media share event
    const { error: insertError } = await supabase
      .from('media_share_events')
      .insert([shareData])

    if (insertError) {
      console.error('Error tracking media share event:', insertError)
      // Don't fail the share if tracking fails
    }

    // 5. Increment usage count on media asset
    const { error: updateError } = await supabase
      .rpc('increment_media_usage_count', {
        media_id: mediaId
      })

    if (updateError) {
      console.error('Error updating media usage count:', updateError)
      // Don't fail if update fails
    }

    // 6. Generate shareable link/embed code
    const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.id}`
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'}/media/${mediaId}`

    let embedCode = null
    if (body.method === 'embed') {
      if (media.media_type === 'image') {
        embedCode = `<img src="${mediaUrl}" alt="${media.file_name}" />`
      } else if (media.media_type === 'video') {
        embedCode = `<video src="${mediaUrl}" controls></video>`
      }
    }

    return NextResponse.json({
      success: true,
      mediaId,
      mediaType: media.media_type,
      fileName: media.file_name,
      shareUrl,
      mediaUrl: body.method === 'download' ? mediaUrl : null,
      embedCode,
      culturalSensitivity: media.cultural_sensitivity,
      usageRights: media.usage_rights,
      message: 'Media shared successfully'
    })

  } catch (error) {
    console.error('Share media error:', error)
    return NextResponse.json(
      { error: 'Failed to process media share request' },
      { status: 500 }
    )
  }
}
