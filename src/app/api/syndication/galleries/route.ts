// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import crypto from 'crypto'

/**
 * GET /api/syndication/galleries
 *
 * List gallery syndication consents for a site or all sites.
 *
 * Query params:
 * - siteSlug: Filter by site slug (e.g., 'theharvest')
 * - galleryId: Filter by specific gallery
 * - status: Filter by status (pending, approved, denied, revoked)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Syndication galleries auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message
    })
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteSlug = searchParams.get('siteSlug')
    const galleryId = searchParams.get('galleryId')
    const status = searchParams.get('status')

    let query = supabase
      .from('gallery_syndication_consent')
      .select(`
        *,
        gallery:galleries(id, title, description, visibility, cover_image_id),
        site:syndication_sites(id, slug, name)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (siteSlug) {
      // First get the site ID
      const { data: site } = await supabase
        .from('syndication_sites')
        .select('id')
        .eq('slug', siteSlug)
        .single()

      if (site) {
        query = query.eq('site_id', site.id)
      }
    }

    if (galleryId) {
      query = query.eq('gallery_id', galleryId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: consents, error } = await query

    if (error) {
      console.error('Error fetching gallery syndication consents:', error)
      return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 })
    }

    return NextResponse.json({ consents }, { status: 200 })
  } catch (error) {
    console.error('Error in gallery syndication GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/syndication/galleries
 *
 * Create a new gallery syndication consent.
 *
 * Request body:
 * {
 *   galleryId: string,
 *   siteSlug: string,
 *   permissions?: {
 *     allowFullResolution?: boolean,
 *     allowDownload?: boolean,
 *     allowEmbedding?: boolean,
 *     allowHotlinking?: boolean
 *   },
 *   requiresElderApproval?: boolean,
 *   culturalNotes?: string,
 *   expiresAt?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, tenant_roles')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_roles?.some((r: string) => ['admin', 'super_admin'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden - admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      galleryId,
      siteSlug,
      permissions = {},
      requiresElderApproval = false,
      culturalNotes,
      expiresAt
    } = body

    // Validate required fields
    if (!galleryId || !siteSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: galleryId and siteSlug' },
        { status: 400 }
      )
    }

    // Use service client for admin operations (bypasses RLS)
    const serviceClient = createSupabaseServiceClient()

    // Verify gallery exists
    const { data: gallery, error: galleryError } = await serviceClient
      .from('galleries')
      .select('id, title, organization_id')
      .eq('id', galleryId)
      .single()

    console.log('Gallery lookup:', { galleryId, gallery, error: galleryError?.message, code: galleryError?.code })

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Get tenant_id from profile (the user creating this)
    const tenantId = profile.tenant_id

    // Verify site exists and is active
    const { data: site, error: siteError } = await serviceClient
      .from('syndication_sites')
      .select('id, slug, name, status, allowed_domains')
      .eq('slug', siteSlug)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Syndication site not found' }, { status: 404 })
    }

    if (site.status !== 'active') {
      return NextResponse.json({ error: 'Syndication site is not active' }, { status: 400 })
    }

    // Check if consent already exists
    const { data: existingConsent } = await serviceClient
      .from('gallery_syndication_consent')
      .select('id, status')
      .eq('gallery_id', galleryId)
      .eq('site_id', site.id)
      .single()

    if (existingConsent) {
      return NextResponse.json(
        { error: 'Consent already exists for this gallery and site', consent: existingConsent },
        { status: 409 }
      )
    }

    // Create consent record
    const consentData = {
      gallery_id: galleryId,
      site_id: site.id,
      tenant_id: tenantId,
      created_by: user.id,
      status: requiresElderApproval ? 'pending' : 'approved',
      approved_at: requiresElderApproval ? null : new Date().toISOString(),
      approved_by: requiresElderApproval ? null : user.id,
      allow_full_resolution: permissions.allowFullResolution ?? false,
      allow_download: permissions.allowDownload ?? false,
      allow_embedding: permissions.allowEmbedding ?? true,
      allow_hotlinking: permissions.allowHotlinking ?? false,
      requires_elder_approval: requiresElderApproval,
      cultural_notes: culturalNotes || null,
      expires_at: expiresAt || null
    }

    const { data: consent, error: insertError } = await serviceClient
      .from('gallery_syndication_consent')
      .insert(consentData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating gallery syndication consent:', insertError)
      return NextResponse.json(
        { error: 'Failed to create consent', details: insertError.message },
        { status: 500 }
      )
    }

    // If approved immediately, create embed token
    let embedToken = null
    if (consent.status === 'approved') {
      const tokenString = crypto.randomBytes(32).toString('base64url')
      const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex')

      const expiresAtDate = new Date()
      expiresAtDate.setDate(expiresAtDate.getDate() + 30) // 30 day default

      const serviceClient = createSupabaseServiceClient()
      const { data: tokenData, error: tokenError } = await serviceClient
        .from('gallery_embed_tokens')
        .insert({
          gallery_id: galleryId,
          site_id: site.id,
          tenant_id: tenantId,
          token: tokenString,
          token_hash: tokenHash,
          allowed_domains: site.allowed_domains || [],
          status: 'active',
          expires_at: expiresAtDate.toISOString(),
          created_by: user.id
        })
        .select()
        .single()

      if (!tokenError && tokenData) {
        embedToken = {
          token: tokenString,
          expiresAt: expiresAtDate.toISOString()
        }
      }
    }

    return NextResponse.json({
      success: true,
      consent,
      embedToken,
      message: requiresElderApproval
        ? 'Consent created, pending elder approval'
        : 'Gallery syndication enabled'
    }, { status: 201 })
  } catch (error) {
    console.error('Error in gallery syndication POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/syndication/galleries?consentId=xxx
 *
 * Revoke a gallery syndication consent.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_roles')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_roles?.some((r: string) => ['admin', 'super_admin'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden - admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const consentId = searchParams.get('consentId')

    if (!consentId) {
      return NextResponse.json({ error: 'Missing consentId parameter' }, { status: 400 })
    }

    // Get the consent to find associated tokens
    const { data: consent } = await supabase
      .from('gallery_syndication_consent')
      .select('gallery_id, site_id')
      .eq('id', consentId)
      .single()

    if (!consent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 })
    }

    // Revoke consent
    const { error: updateError } = await supabase
      .from('gallery_syndication_consent')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', consentId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to revoke consent' }, { status: 500 })
    }

    // Also revoke any associated embed tokens
    const serviceClient = createSupabaseServiceClient()
    await serviceClient
      .from('gallery_embed_tokens')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revocation_reason: 'Syndication consent revoked'
      })
      .eq('gallery_id', consent.gallery_id)
      .eq('site_id', consent.site_id)

    return NextResponse.json({ success: true, message: 'Consent revoked' }, { status: 200 })
  } catch (error) {
    console.error('Error in gallery syndication DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
