// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getConsentService, ConsentMethod } from '@/lib/services/consent.service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/stories/[id]/consent
 * Get consent status and history for a story
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Authenticate user
    const authSupabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const consentService = getConsentService()

    // Get consent status
    const status = await consentService.checkConsentForDistribution(id)

    // Get consent history
    const history = await consentService.getConsentHistory(id)

    return NextResponse.json({
      story_id: id,
      status,
      history
    })

  } catch (error) {
    console.error('Consent fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consent information' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stories/[id]/consent
 * Grant consent for a story
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Authenticate user
    const authSupabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Verify user is storyteller or author
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('storyteller_id, author_id, tenant_id, title')
      .eq('id', id)
      .single()

    if (fetchError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (story.storyteller_id !== user.id && story.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the storyteller or author can grant consent', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.method || !body.purpose || !body.scope) {
      return NextResponse.json(
        { error: 'Missing required fields: method, purpose, scope' },
        { status: 400 }
      )
    }

    // Validate consent method
    const validMethods: ConsentMethod[] = ['written', 'verbal', 'digital', 'recorded', 'witnessed']
    if (!validMethods.includes(body.method)) {
      return NextResponse.json(
        { error: `Invalid consent method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      )
    }

    const consentService = getConsentService()

    const consentProof = await consentService.grantConsent(
      {
        story_id: id,
        storyteller_id: story.storyteller_id || user.id,
        method: body.method,
        proof_url: body.proof_url,
        purpose: body.purpose,
        scope: body.scope,
        duration: body.duration,
        restrictions: body.restrictions,
        witness_id: body.witness_id,
        witness_name: body.witness_name,
        notes: body.notes
      },
      user.id,
      story.tenant_id
    )

    return NextResponse.json({
      success: true,
      message: 'Consent granted successfully',
      consent: consentProof
    }, { status: 201 })

  } catch (error) {
    console.error('Consent grant error:', error)
    return NextResponse.json(
      { error: 'Failed to grant consent' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stories/[id]/consent
 * Withdraw consent for a story
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Authenticate user
    const authSupabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Get story tenant_id
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('tenant_id')
      .eq('id', id)
      .single()

    if (fetchError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.reason) {
      return NextResponse.json(
        { error: 'Missing required field: reason' },
        { status: 400 }
      )
    }

    const consentService = getConsentService()

    const withdrawal = await consentService.withdrawConsent(
      id,
      user.id,
      story.tenant_id,
      body.reason,
      body.scope || 'full',
      body.partial_restrictions
    )

    return NextResponse.json({
      success: true,
      message: 'Consent withdrawn successfully',
      withdrawal
    })

  } catch (error) {
    console.error('Consent withdrawal error:', error)
    const message = error instanceof Error ? error.message : 'Failed to withdraw consent'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/stories/[id]/consent
 * Verify consent (admin/elder only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Authenticate user
    const authSupabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Check if user has verification permissions (admin or elder)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_roles, tenant_id')
      .eq('id', user.id)
      .single()

    const roles = profile?.tenant_roles || []
    const canVerify = roles.includes('admin') || roles.includes('super_admin') || roles.includes('elder') || roles.includes('cultural_reviewer')

    if (!canVerify) {
      return NextResponse.json(
        { error: 'Verification requires admin or elder role', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (typeof body.approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required field: approved (boolean)' },
        { status: 400 }
      )
    }

    const consentService = getConsentService()

    await consentService.verifyConsent(
      id,
      user.id,
      profile?.tenant_id,
      body.approved,
      body.notes
    )

    return NextResponse.json({
      success: true,
      message: body.approved ? 'Consent verified successfully' : 'Consent verification rejected'
    })

  } catch (error) {
    console.error('Consent verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify consent' },
      { status: 500 }
    )
  }
}
