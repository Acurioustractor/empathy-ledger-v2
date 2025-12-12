export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { magicLinkService, CreateInvitationInput } from '@/lib/services/magic-link.service'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

/**
 * Invitation Management API
 *
 * POST /api/invitations - Create a new invitation
 * GET  /api/invitations - List invitations for a story
 */

/**
 * POST /api/invitations
 *
 * Create a new invitation for a storyteller
 *
 * Supports multiple auth modes:
 * 1. Full auth - logged in user
 * 2. Guest session - field worker with organization PIN
 *
 * Body: {
 *   storyId: string
 *   storytellerName: string
 *   storytellerEmail?: string
 *   storytellerPhone?: string
 *   sendEmail?: boolean
 *   expiresInDays?: number
 *   guestSessionId?: string  // For guest mode
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyId, storytellerName, storytellerEmail, storytellerPhone, sendEmail, expiresInDays, guestSessionId } = body

    // Validate required fields
    if (!storyId) {
      return NextResponse.json(
        { error: 'Missing storyId' },
        { status: 400 }
      )
    }

    if (!storytellerName) {
      return NextResponse.json(
        { error: 'Missing storytellerName' },
        { status: 400 }
      )
    }

    let userId: string | null = null
    let authMode: 'full' | 'guest' = 'full'

    // Check authentication mode
    if (guestSessionId) {
      // Guest session mode - validate the session
      const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
      const validateRes = await fetch(
        `${origin}/api/auth/guest-session?session=${guestSessionId}`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (validateRes.ok) {
        const sessionData = await validateRes.json()
        if (sessionData.valid) {
          authMode = 'guest'
        }
      }

      if (authMode !== 'guest') {
        return NextResponse.json(
          { error: 'Invalid or expired guest session' },
          { status: 401 }
        )
      }
    } else {
      // Full auth mode - check user session
      const supabase = createSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Verify story exists and user has permission
    const serviceClient = createSupabaseServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story, error: storyError } = await (serviceClient as any)
      .from('stories')
      .select('id, author_id, title, summary')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      console.error('Story lookup error:', storyError)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Permission check: user owns story OR story was created via quick capture (summary starts with [Quick capture:])
    const isOwner = userId && story.author_id === userId
    const isQuickCapture = story.summary?.startsWith('[Quick capture:')

    if (authMode === 'full' && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to create invitations for this story' },
        { status: 403 }
      )
    }

    // For guest mode, allow if the story was captured without an author (guest mode)
    if (authMode === 'guest' && story.author_id && !isQuickCapture) {
      return NextResponse.json(
        { error: 'Cannot create invitation for this story in guest mode' },
        { status: 403 }
      )
    }

    // Use magicLinkService to create a real invitation in the database
    // For guest mode without a user, use the story author or a system user
    const createdBy = userId || story.author_id

    if (!createdBy) {
      // Fallback: Generate a simple invitation without database storage
      // This happens when a story has no author (edge case)
      const token = crypto.randomUUID()
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
      const magicLinkUrl = `${baseUrl}/stories/${storyId}?token=${token}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7))

      return NextResponse.json({
        invitation: {
          id: crypto.randomUUID(),
          storyId,
          storytellerName,
          magicLinkUrl,
          qrCodeData: magicLinkUrl,
          expiresAt: expiresAt.toISOString(),
          sentVia: 'qr'
        },
        message: 'Invitation created - show QR code or share link'
      }, { status: 201 })
    }

    // Create invitation using the magic link service
    const invitation = await magicLinkService.createInvitation({
      storyId,
      storytellerName,
      storytellerEmail: storytellerEmail || undefined,
      storytellerPhone: storytellerPhone || undefined,
      createdBy,
      sendEmail: sendEmail || false,
      expiresInDays: expiresInDays || 7
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        storyId: invitation.storyId,
        storytellerName: invitation.storytellerName,
        magicLinkUrl: invitation.magicLinkUrl,
        qrCodeData: invitation.qrCodeData,
        expiresAt: invitation.expiresAt.toISOString(),
        sentVia: invitation.sentVia
      },
      message: sendEmail
        ? 'Invitation created and email sent'
        : 'Invitation created - show QR code or share link'
    }, { status: 201 })
  } catch (error) {
    console.error('Create invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invitations?storyId=xxx
 *
 * List invitations for a story (only for story author)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const storyId = request.nextUrl.searchParams.get('storyId')

    if (!storyId) {
      return NextResponse.json(
        { error: 'Missing storyId parameter' },
        { status: 400 }
      )
    }

    // Verify user has permission
    const serviceClient = createSupabaseServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story } = await (serviceClient as any)
      .from('stories')
      .select('id, author_id')
      .eq('id', storyId)
      .single()

    if (!story || story.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      )
    }

    // Get invitations for this story
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invitations, error } = await (serviceClient as any)
      .from('story_review_invitations')
      .select('id, storyteller_name, storyteller_email, sent_via, sent_at, accepted_at, expires_at, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      invitations: (invitations || []).map((inv: Record<string, unknown>) => ({
        id: inv.id,
        storytellerName: inv.storyteller_name,
        storytellerEmail: inv.storyteller_email,
        sentVia: inv.sent_via,
        sentAt: inv.sent_at,
        acceptedAt: inv.accepted_at,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
        status: inv.accepted_at
          ? 'accepted'
          : new Date(inv.expires_at as string) < new Date()
            ? 'expired'
            : 'pending'
      }))
    })
  } catch (error) {
    console.error('List invitations error:', error)
    return NextResponse.json(
      { error: 'Failed to list invitations' },
      { status: 500 }
    )
  }
}
