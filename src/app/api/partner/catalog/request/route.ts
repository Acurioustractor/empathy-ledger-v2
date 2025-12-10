export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/partner/catalog/request
 *
 * Request a story for a project. Storyteller will be notified
 * and can approve/decline from their dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { story_id, project_id, message } = body

    if (!story_id || !project_id) {
      return NextResponse.json({ error: 'Missing story_id or project_id' }, { status: 400 })
    }

    // Get project and verify access
    const { data: project, error: projectError } = await supabase
      .from('partner_projects')
      .select('id, app_id, name')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user has access to this app
    const { data: access } = await supabase
      .from('partner_team_members')
      .select('id, permissions')
      .eq('app_id', project.app_id)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const canRequest = (access.permissions as any)?.can_request_stories !== false

    if (!canRequest) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check if request already exists
    const { data: existing } = await supabase
      .from('story_syndication_requests')
      .select('id, status')
      .eq('story_id', story_id)
      .eq('project_id', project_id)
      .single()

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'Request already pending' }, { status: 409 })
      }
      if (existing.status === 'approved') {
        return NextResponse.json({ error: 'Story already approved' }, { status: 409 })
      }
      // If declined or revoked, allow re-request by updating
      const { data: updated, error: updateError } = await supabase
        .from('story_syndication_requests')
        .update({
          status: 'pending',
          requested_by: user.id,
          request_message: message,
          requested_at: new Date().toISOString(),
          responded_at: null,
          decline_reason: null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating request:', updateError)
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
      }

      // TODO: Send notification to storyteller

      return NextResponse.json({ request: updated })
    }

    // Create new request
    const { data: newRequest, error: createError } = await supabase
      .from('story_syndication_requests')
      .insert({
        story_id,
        project_id,
        app_id: project.app_id,
        requested_by: user.id,
        request_message: message,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating request:', createError)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }

    // Get story details for notification
    const { data: story } = await supabase
      .from('stories')
      .select(`
        title,
        storyteller:storyteller_id (
          id,
          user_id,
          display_name
        )
      `)
      .eq('id', story_id)
      .single()

    // TODO: Send notification to storyteller
    // This would integrate with your notification system
    // e.g., email, in-app notification, etc.

    // Optionally create a message if one was provided
    if (message && story?.storyteller) {
      await supabase
        .from('partner_messages')
        .insert({
          app_id: project.app_id,
          storyteller_id: story.storyteller.id,
          sender_type: 'partner',
          sender_user_id: user.id,
          subject: `Request to feature "${story.title}"`,
          content: message,
          story_id,
          project_id,
          request_id: newRequest.id
        })
    }

    return NextResponse.json({ request: newRequest }, { status: 201 })

  } catch (error) {
    console.error('Request story error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
