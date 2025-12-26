/**
 * ACT Story Sharing API v1
 *
 * GET /api/v1/stories/[id]
 * - Fetch story with consent verification
 * - Returns story only if storyteller has granted cross-site consent
 * - Logs API access for audit trail
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// API Key validation middleware
function validateAPIKey(request: NextRequest): {
  valid: boolean
  siteId?: string
  keyHash?: string
} {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false }
  }

  const apiKey = authHeader.replace('Bearer ', '')

  // TODO: See issue #12 in empathy-ledger-v2: Implement proper API key validation
  // For now, extract site from key (format: ACT_SITE_KEY_xxx)
  const match = apiKey.match(/^ACT_([A-Z_]+)_KEY_/)
  if (!match) {
    return { valid: false }
  }

  // Map key prefix to site ID
  const siteKeyMap: Record<string, string> = {
    'MAIN': '00000000-0000-0000-0000-000000000001',
    'YOUTH': '00000000-0000-0000-0000-000000000002',
    'LAND': '00000000-0000-0000-0000-000000000003'
  }

  const siteId = siteKeyMap[match[1]]

  if (!siteId) {
    return { valid: false }
  }

  // Hash the key for logging (simple hash for demo)
  const keyHash = Buffer.from(apiKey).toString('base64').substring(0, 16)

  return {
    valid: true,
    siteId,
    keyHash
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  // Validate API key
  const auth = validateAPIKey(request)
  if (!auth.valid || !auth.siteId) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }

  const storyId = params.id

  try {
    // 1. Check if storyteller has granted consent for this site
    const { data: visibility, error: visibilityError } = await supabase
      .from('story_site_visibility')
      .select('*')
      .eq('story_id', storyId)
      .eq('site_id', auth.siteId)
      .eq('storyteller_consent', true)
      .single()

    if (visibilityError || !visibility) {
      return NextResponse.json(
        {
          error: 'Story not available',
          message: 'Storyteller has not granted consent to share this story on this site',
          code: 'CONSENT_NOT_GRANTED'
        },
        { status: 403 }
      )
    }

    // 2. Check if consent has expired
    if (visibility.consent_expires_at) {
      const expiresAt = new Date(visibility.consent_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          {
            error: 'Consent expired',
            message: 'Storyteller consent has expired for this story',
            code: 'CONSENT_EXPIRED',
            expired_at: visibility.consent_expires_at
          },
          { status: 403 }
        )
      }
    }

    // 3. Fetch story with storyteller details
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        status,
        storyteller:storyteller_id (
          id,
          display_name,
          avatar_url,
          profile_tagline
        ),
        transcripts (
          id,
          content,
          summary
        )
      `)
      .eq('id', storyId)
      .eq('status', 'published')
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // 4. Get themes
    const { data: themes } = await supabase
      .from('story_themes')
      .select('theme:narrative_themes(theme_name, theme_category)')
      .eq('story_id', storyId)

    // 5. Get project info
    const { data: projects } = await supabase
      .from('project_stories')
      .select('project:projects(id, name, project_type)')
      .eq('story_id', storyId)

    // 6. Get storyteller consent settings
    const { data: consentSettings } = await supabase
      .from('storyteller_consent_settings')
      .select('require_attribution, attribution_text, allow_downloads, allow_embedding')
      .eq('storyteller_id', story.storyteller.id)
      .single()

    // 7. Log API access
    await supabase
      .from('story_api_access_log')
      .insert({
        story_id: storyId,
        site_id: auth.siteId,
        storyteller_id: story.storyteller.id,
        request_type: 'read',
        endpoint: `/api/v1/stories/${storyId}`,
        api_key_hash: auth.keyHash,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        status_code: 200
      })

    // 8. Increment view count
    await supabase
      .from('story_site_visibility')
      .update({
        view_count: (visibility.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', visibility.id)

    // 9. Build response
    const response = {
      story: {
        id: story.id,
        title: visibility.custom_title || story.title,
        created_at: story.created_at,

        storyteller: {
          id: story.storyteller.id,
          display_name: story.storyteller.display_name,
          avatar_url: story.storyteller.avatar_url,
          profile_tagline: story.storyteller.profile_tagline
        },

        content: {
          transcript: story.transcripts?.[0]?.content || '',
          summary: visibility.custom_description || story.transcripts?.[0]?.summary || ''
        },

        metadata: {
          themes: themes?.map(t => t.theme) || [],
          tags: [...(visibility.project_tags || []), ...(visibility.custom_tags || [])],
          projects: projects?.map(p => p.project) || [],
          featured: visibility.featured,
          visibility: visibility.visibility
        },

        sharing: {
          consent_granted_at: visibility.consent_granted_at,
          consent_expires_at: visibility.consent_expires_at,
          allowed_uses: [
            'display',
            consentSettings?.allow_embedding && 'embed',
            consentSettings?.allow_downloads && 'download'
          ].filter(Boolean),
          attribution_required: consentSettings?.require_attribution ?? true,
          attribution_text: consentSettings?.attribution_text
        }
      },

      access: {
        site_id: auth.siteId,
        granted_at: visibility.consent_granted_at,
        expires_at: visibility.consent_expires_at,
        view_count: (visibility.view_count || 0) + 1
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minute cache
        'X-API-Version': '1.0',
        'X-Consent-Expires': visibility.consent_expires_at || 'never'
      }
    })

  } catch (error) {
    console.error('Story API error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Rate limiting check (simple version)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(apiKeyHash: string, limit: number = 1000): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000

  const record = requestCounts.get(apiKeyHash)

  if (!record || record.resetAt < now) {
    // New hour, reset count
    requestCounts.set(apiKeyHash, {
      count: 1,
      resetAt: now + hour
    })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}
