import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PREFERENCES = {
  notify_story_approved: true,
  notify_story_published: true,
  notify_story_rejected: true,
  notify_changes_requested: true,
  notify_review_assigned: true,
  notify_new_submissions: true,
  notify_elder_escalation: true,
  notify_community_mention: true,
  notify_story_comments: false,
  weekly_digest: false,
  monthly_summary: false,
  unsubscribed: false
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        preferences: { user_id: user.id, ...DEFAULT_PREFERENCES }
      })
    }

    if (error) {
      throw error
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Failed to fetch email preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

const ALLOWED_FIELDS = [
  'notify_story_approved',
  'notify_story_published',
  'notify_story_rejected',
  'notify_changes_requested',
  'notify_review_assigned',
  'notify_new_submissions',
  'notify_elder_escalation',
  'notify_community_mention',
  'notify_story_comments',
  'weekly_digest',
  'monthly_summary',
  'unsubscribed'
] as const

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const updates: any = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    }

    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (updates.unsubscribed === true) {
      updates.unsubscribed_at = new Date().toISOString()
    } else if (updates.unsubscribed === false) {
      updates.unsubscribed_at = null
    }

    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .upsert(updates, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Failed to update email preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
