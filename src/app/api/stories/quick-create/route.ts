export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/stories/quick-create
 *
 * Quick story creation for field capture workflow.
 * Creates a draft story with minimal required info.
 *
 * Supports multiple authentication modes:
 * 1. Full auth - logged in user with session
 * 2. Guest session - field worker with organization PIN
 * 3. Self-recording - storyteller with magic link token
 *
 * FormData fields:
 *   - title: string (required)
 *   - storyteller_name: string (required)
 *   - status: string (default: 'draft')
 *   - is_public: string (default: 'false')
 *   - notes: string (optional)
 *   - project_id: string (optional)
 *   - organization_id: string (optional)
 *   - featured_image: File (optional)
 *   - guest_session_id: string (optional - for guest mode)
 *   - self_record_token: string (optional - for self-recording mode)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const serviceClient = createSupabaseServiceClient()

    // Parse form data
    const formData = await request.formData()
    const guestSessionId = formData.get('guest_session_id') as string | null
    const selfRecordToken = formData.get('self_record_token') as string | null

    let userId: string | null = null
    let authMode: 'full' | 'guest' | 'self' = 'full'
    let guestOrgId: string | null = null

    // Check authentication mode
    if (guestSessionId) {
      // Guest session mode - validate the session
      // In-memory validation (matches the guest-session API)
      // For production, this should check a database table
      const validateRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/guest-session?session=${guestSessionId}`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (validateRes.ok) {
        const sessionData = await validateRes.json()
        if (sessionData.valid) {
          authMode = 'guest'
          guestOrgId = sessionData.session.organization_id
        }
      }

      if (authMode !== 'guest') {
        return NextResponse.json(
          { error: 'Invalid or expired guest session' },
          { status: 401 }
        )
      }
    } else if (selfRecordToken) {
      // Self-recording mode - validate the token
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: invitation, error: invError } = await (serviceClient as any)
        .from('story_invitations')
        .select('*')
        .eq('token', selfRecordToken)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single()

      if (invError || !invitation) {
        return NextResponse.json(
          { error: 'Invalid or expired recording link' },
          { status: 401 }
        )
      }

      authMode = 'self'
      guestOrgId = invitation.organization_id
    } else {
      // Full auth mode - check user session
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Not authenticated', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Extract remaining form data (already parsed above)
    const title = formData.get('title') as string
    const storytellerName = formData.get('storyteller_name') as string
    const status = (formData.get('status') as string) || 'draft'
    const isPublic = formData.get('is_public') === 'true'
    const notes = formData.get('notes') as string | null
    const projectId = formData.get('project_id') as string | null
    const organizationId = formData.get('organization_id') as string | null
    const featuredImage = formData.get('featured_image') as File | null

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!storytellerName?.trim()) {
      return NextResponse.json(
        { error: 'Storyteller name is required' },
        { status: 400 }
      )
    }

    // Get tenant context based on auth mode
    let tenantId: string | null = null

    if (authMode === 'guest' || authMode === 'self') {
      // Use organization from guest/self-record session
      tenantId = guestOrgId || organizationId
    } else if (userId) {
      // Full auth - get user's profile for tenant context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (serviceClient as any)
        .from('profiles')
        .select('id, tenant_id, organization_id')
        .eq('id', userId)
        .single()

      tenantId = profile?.tenant_id || organizationId || profile?.organization_id
    }

    // Handle featured image upload if provided
    let featuredImageUrl: string | null = null
    if (featuredImage && featuredImage.size > 0) {
      try {
        const fileExt = featuredImage.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `stories/${fileName}`

        // Convert File to ArrayBuffer
        const arrayBuffer = await featuredImage.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await serviceClient.storage
          .from('media')
          .upload(filePath, buffer, {
            contentType: featuredImage.type,
            upsert: false
          })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          // Continue without image - don't fail the whole request
        } else if (uploadData) {
          // Get public URL
          const { data: { publicUrl } } = serviceClient.storage
            .from('media')
            .getPublicUrl(filePath)
          featuredImageUrl = publicUrl
        }
      } catch (uploadErr) {
        console.error('Image upload error:', uploadErr)
        // Continue without image
      }
    }

    // Create the story
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story, error: storyError } = await (serviceClient as any)
      .from('stories')
      .insert({
        title,
        status,
        is_public: isPublic,
        summary: notes || null,
        featured_image: featuredImageUrl,
        author_id: userId, // Will be null for guest/self modes
        project_id: projectId || null,
        tenant_id: tenantId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Metadata about the quick capture
        capture_metadata: {
          quick_capture: true,
          captured_by: userId,
          auth_mode: authMode,
          storyteller_name: storytellerName,
          captured_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (storyError) {
      console.error('Story creation error:', storyError)
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      )
    }

    // Optionally create a storyteller profile (or link to existing one by name)
    let storytellerProfile = null
    // Check for existing profile with similar name in this tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingProfile } = await (serviceClient as any)
      .from('profiles')
      .select('id, display_name')
      .eq('display_name', storytellerName)
      .eq('tenant_id', tenantId)
      .limit(1)
      .maybeSingle()

    if (existingProfile) {
      storytellerProfile = existingProfile

      // Link story to this storyteller
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (serviceClient as any)
        .from('stories')
        .update({ storyteller_id: existingProfile.id })
        .eq('id', story.id)
    }

    return NextResponse.json({
      story: {
        id: story.id,
        title: story.title,
        status: story.status,
        featured_image: story.featured_image
      },
      storyteller: storytellerProfile ? {
        id: storytellerProfile.id,
        name: storytellerProfile.display_name
      } : null,
      message: 'Story created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Quick create error:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}
