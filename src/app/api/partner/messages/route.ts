export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/partner/messages
 *
 * Get conversation threads for a partner
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('app_id')

    if (!appId) {
      return NextResponse.json({ error: 'Missing app_id' }, { status: 400 })
    }

    // Verify access
    const { data: access } = await supabase
      .from('partner_team_members')
      .select('id')
      .eq('app_id', appId)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get distinct threads with latest message
    const { data: messages, error } = await supabase
      .from('partner_messages')
      .select(`
        id,
        thread_id,
        content,
        created_at,
        is_read,
        sender_type,
        storyteller:storyteller_id (
          id,
          display_name,
          avatar_url
        ),
        story:story_id (
          id,
          title
        )
      `)
      .eq('app_id', appId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Group by thread and get latest message per thread
    const threadMap = new Map<string, any>()

    for (const msg of messages || []) {
      if (!threadMap.has(msg.thread_id)) {
        threadMap.set(msg.thread_id, {
          id: msg.thread_id,
          storyteller: msg.storyteller,
          story: msg.story,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: 0
        })
      }

      // Count unread messages from storyteller
      if (!msg.is_read && msg.sender_type === 'storyteller') {
        const thread = threadMap.get(msg.thread_id)
        thread.unread_count++
      }
    }

    const threads = Array.from(threadMap.values())
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

    return NextResponse.json({ threads })

  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/partner/messages
 *
 * Send a message to a storyteller
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { thread_id, storyteller_id, content, story_id, project_id, subject } = body

    if (!storyteller_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's app membership
    const { data: membership } = await supabase
      .from('partner_team_members')
      .select('app_id, permissions')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No partner access' }, { status: 403 })
    }

    const canMessage = (membership.permissions as any)?.can_send_messages !== false

    if (!canMessage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Verify storyteller exists
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('id')
      .eq('id', storyteller_id)
      .single()

    if (!storyteller) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 })
    }

    // Use existing thread_id or create new one
    const finalThreadId = thread_id || crypto.randomUUID()

    // Create message
    const { data: message, error: createError } = await supabase
      .from('partner_messages')
      .insert({
        thread_id: finalThreadId,
        app_id: membership.app_id,
        storyteller_id,
        sender_type: 'partner',
        sender_user_id: user.id,
        subject,
        content,
        story_id,
        project_id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating message:', createError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // TODO: Send notification to storyteller

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
