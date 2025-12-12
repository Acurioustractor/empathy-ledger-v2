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
 * Body: {
 *   storyId: string
 *   storytellerName: string
 *   storytellerEmail?: string
 *   storytellerPhone?: string
 *   sendEmail?: boolean
 *   expiresInDays?: number
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { storyId, storytellerName, storytellerEmail, storytellerPhone, sendEmail, expiresInDays } = body

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

    // Verify user has permission to create invitations for this story
    const serviceClient = createSupabaseServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story, error: storyError } = await (serviceClient as any)
      .from('stories')
      .select('id, author_id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to create invitations for this story' },
        { status: 403 }
      )
    }

    // Create the invitation
    const input: CreateInvitationInput = {
      storyId,
      storytellerName,
      storytellerEmail: storytellerEmail || undefined,
      storytellerPhone: storytellerPhone || undefined,
      createdBy: user.id,
      sendEmail: sendEmail || false,
      expiresInDays: expiresInDays || 7
    }

    const invitation = await magicLinkService.createInvitation(input)

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
      message: sendEmail && storytellerEmail
        ? `Invitation sent to ${storytellerEmail}`
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
