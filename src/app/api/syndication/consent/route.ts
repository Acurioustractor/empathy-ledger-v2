import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/syndication/consent
 *
 * Creates a new syndication consent for a storyteller to share their story on an external site.
 *
 * Philosophy: OCAP principles - storyteller must explicitly grant consent per story, per site
 *
 * Request Body:
 * {
 *   storyId: string,              // UUID of the story
 *   siteSlug: string,             // Slug of the syndication site (e.g., 'justicehub')
 *   permissions?: {               // Optional permission overrides
 *     allowFullContent?: boolean,
 *     allowExcerptOnly?: boolean,
 *     allowMediaAssets?: boolean,
 *     allowComments?: boolean,
 *     allowAnalytics?: boolean
 *   },
 *   expiresAt?: string,          // Optional ISO date for consent expiration
 *   requestReason?: string,       // Why sharing to this site
 *   culturalPermissionLevel?: 'public' | 'community' | 'restricted' | 'sacred',
 *   requiresElderApproval?: boolean
 * }
 */
export async function POST(request: NextRequest) {
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

    // 2. Parse request body
    const body = await request.json()
    const {
      storyId,
      siteSlug,
      permissions = {},
      expiresAt,
      requestReason,
      culturalPermissionLevel = 'public',
      requiresElderApproval = false
    } = body

    // 3. Validate required fields
    if (!storyId || !siteSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: storyId and siteSlug' },
        { status: 400 }
      )
    }

    // 4. Verify story exists and belongs to user
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, storyteller_id, project_id, tenant_id, projects(organization_id)')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // 5. Verify user is the storyteller
    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only grant consent for your own stories' },
        { status: 403 }
      )
    }

    // 6. Get organization_id from project
    const organizationId = (story.projects as any)?.organization_id
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Story must belong to a project with an organization' },
        { status: 400 }
      )
    }

    // 7. Verify syndication site exists and is active
    const { data: site, error: siteError } = await supabase
      .from('syndication_sites')
      .select('id, slug, name, status')
      .eq('slug', siteSlug)
      .eq('status', 'active')
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: `Syndication site '${siteSlug}' not found or not active` },
        { status: 404 }
      )
    }

    // 8. Check if consent already exists
    const { data: existingConsent } = await supabase
      .from('syndication_consent')
      .select('id, status')
      .eq('story_id', storyId)
      .eq('site_id', site.id)
      .single()

    if (existingConsent) {
      return NextResponse.json(
        {
          error: 'Consent already exists for this story and site',
          consent: existingConsent
        },
        { status: 409 }
      )
    }

    // 9. Create consent record
    const consentData = {
      story_id: storyId,
      site_id: site.id,
      storyteller_id: user.id,
      tenant_id: story.tenant_id,
      organization_id: organizationId,
      status: requiresElderApproval ? 'pending' : 'approved',
      approved_at: requiresElderApproval ? null : new Date().toISOString(),
      expires_at: expiresAt || null,

      // Permissions
      allow_full_content: permissions.allowFullContent ?? true,
      allow_excerpt_only: permissions.allowExcerptOnly ?? false,
      allow_media_assets: permissions.allowMediaAssets ?? true,
      allow_comments: permissions.allowComments ?? false,
      allow_analytics: permissions.allowAnalytics ?? true,

      // Cultural safety
      requires_elder_approval: requiresElderApproval,
      cultural_permission_level: culturalPermissionLevel,

      // Request context
      request_reason: requestReason || null,
      requested_by: user.id,
      requested_at: new Date().toISOString()
    }

    const { data: consent, error: insertError } = await supabase
      .from('syndication_consent')
      .insert(consentData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating consent:', insertError)
      return NextResponse.json(
        { error: 'Failed to create consent', details: insertError.message },
        { status: 500 }
      )
    }

    // 10. If approved immediately, create embed token
    let embedToken = null
    if (consent.status === 'approved') {
      const { createEmbedToken } = await import('@/lib/services/embed-token-service')

      const { token, error: tokenError } = await createEmbedToken({
        storyId: storyId,
        tenantId: story.tenant_id,
        allowedDomains: site.allowed_domains || [],
        expiresInDays: 30
      })

      if (tokenError) {
        console.error('Error creating embed token:', tokenError)
      } else {
        embedToken = token
      }
    }

    // 11. Return success response
    return NextResponse.json({
      success: true,
      consent,
      embedToken,
      message: requiresElderApproval
        ? 'Consent created, pending elder approval'
        : 'Consent granted and embed token created'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in consent API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/syndication/consent?storyId=xxx&siteSlug=xxx
 *
 * Get consent status for a specific story-site pair
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    const siteSlug = searchParams.get('siteSlug')

    if (!storyId || !siteSlug) {
      return NextResponse.json(
        { error: 'Missing required parameters: storyId and siteSlug' },
        { status: 400 }
      )
    }

    // 3. Get site ID from slug
    const { data: site, error: siteError } = await supabase
      .from('syndication_sites')
      .select('id')
      .eq('slug', siteSlug)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    // 4. Get consent
    const { data: consent, error: consentError } = await supabase
      .from('syndication_consent')
      .select(`
        *,
        site:syndication_sites!syndication_consent_site_id_fkey(slug, name),
        story:stories!syndication_consent_story_id_fkey(id, title)
      `)
      .eq('story_id', storyId)
      .eq('site_id', site.id)
      .eq('storyteller_id', user.id)
      .single()

    if (consentError || !consent) {
      return NextResponse.json(
        { exists: false, consent: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      exists: true,
      consent
    }, { status: 200 })

  } catch (error) {
    console.error('Error in consent GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
