import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Guest Session API
 *
 * Creates temporary guest sessions for field workers to record stories
 * without requiring full authentication.
 *
 * POST: Create a guest session with organization PIN
 * GET: Validate an existing guest session
 */

interface GuestSession {
  id: string
  organization_id: string
  organization_name: string
  created_at: string
  expires_at: string
  device_fingerprint?: string
}

// In-memory session store (in production, use Redis or database)
const guestSessions = new Map<string, GuestSession>()

// Organization PINs (in production, store in database)
const organizationPins: Record<string, { orgId: string, orgName: string }> = {
  // These would come from the database in production
  '1234': { orgId: 'demo-org-1', orgName: 'Demo Organization' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin, deviceFingerprint } = body

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      )
    }

    // Look up organization by PIN from database
    const supabase = createClient()

    const { data: orgAccess, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, guest_pin')
      .eq('guest_pin', pin)
      .eq('guest_access_enabled', true)
      .single()

    if (orgError || !orgAccess) {
      return NextResponse.json(
        { error: 'Invalid PIN or guest access not enabled' },
        { status: 401 }
      )
    }

    // Create guest session
    const sessionId = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000) // 8 hour session

    const session: GuestSession = {
      id: sessionId,
      organization_id: orgAccess.id,
      organization_name: orgAccess.name,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      device_fingerprint: deviceFingerprint
    }

    // Store session
    guestSessions.set(sessionId, session)

    // Log the guest session creation
    await supabase
      .from('audit_logs')
      .insert({
        action: 'guest_session_created',
        resource_type: 'guest_session',
        resource_id: sessionId,
        metadata: {
          organization_id: orgAccess.id,
          expires_at: expiresAt.toISOString()
        }
      })
      .catch(() => {}) // Don't fail if audit logging fails

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        organization_id: orgAccess.id,
        organization_name: orgAccess.name,
        expires_at: expiresAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Guest session error:', error)
    return NextResponse.json(
      { error: 'Failed to create guest session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const session = guestSessions.get(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      guestSessions.delete(sessionId)
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      session: {
        id: session.id,
        organization_id: session.organization_id,
        organization_name: session.organization_name,
        expires_at: session.expires_at
      }
    })
  } catch (error) {
    console.error('Guest session validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    guestSessions.delete(sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Guest session deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
