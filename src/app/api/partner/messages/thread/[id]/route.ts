export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/partner/messages/thread/[id]
 *
 * Get all messages in a thread
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's app membership
    const { data: membership } = await supabase
      .from('partner_team_members')
      .select('app_id')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No partner access' }, { status: 403 })
    }

    // Get messages in thread
    const { data: messages, error } = await supabase
      .from('partner_messages')
      .select(`
        id,
        thread_id,
        sender_type,
        content,
        created_at,
        is_read
      `)
      .eq('thread_id', threadId)
      .eq('app_id', membership.app_id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching thread:', error)
      return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 })
    }

    // Mark storyteller messages as read
    const unreadIds = (messages || [])
      .filter(m => m.sender_type === 'storyteller' && !m.is_read)
      .map(m => m.id)

    if (unreadIds.length > 0) {
      await supabase
        .from('partner_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds)
    }

    return NextResponse.json({
      messages: messages || [],
      thread_id: threadId
    })

  } catch (error) {
    console.error('Thread API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
