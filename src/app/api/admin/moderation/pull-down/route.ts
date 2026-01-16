// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * POST /api/admin/moderation/pull-down
 * Pull down a story from all syndication sites
 * Super-admin only
 */
export async function POST(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { storyId } = body

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check super-admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: 'Super-admin access required' }, { status: 403 })
    }

    // 1. Archive the story
    const { error: archiveError } = await supabase
      .from('stories')
      .update({
        status: 'archived',
        cultural_permission_level: 'private'
      })
      .eq('id', storyId)

    if (archiveError) {
      console.error('Error archiving story:', archiveError)
      return NextResponse.json({ error: archiveError.message }, { status: 500 })
    }

    // 2. Revoke all syndication consents
    const { error: revokeError } = await supabase
      .from('syndication_consent')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString()
      })
      .eq('story_id', storyId)

    if (revokeError) {
      console.error('Error revoking syndication:', revokeError)
      // Continue anyway - this is not critical
    }

    // 3. Log the pull-down action
    const { error: logError } = await supabase
      .from('super_admin_audit_log')
      .insert({
        admin_profile_id: user.id,
        action_type: 'pull_down',
        target_type: 'story',
        target_id: storyId,
        action_metadata: {
          reason: 'Content moderation - pulled down by super-admin',
          timestamp: new Date().toISOString()
        },
        success: true
      })

    if (logError) {
      console.error('Error logging action:', logError)
      // Don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: 'Story pulled down successfully',
      storyId,
      actions: {
        archived: true,
        syndicationRevoked: !revokeError,
        logged: !logError
      }
    })

  } catch (error) {
    console.error('Error in pull-down:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to pull down story' },
      { status: 500 }
    )
  }
}
