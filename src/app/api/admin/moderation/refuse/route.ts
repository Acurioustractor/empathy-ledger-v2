// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/admin/moderation/refuse
 * Refuse publication to specific destinations
 * Super-admin only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { storyId, destinations, reason } = body

    if (!storyId || !destinations || !Array.isArray(destinations)) {
      return NextResponse.json({ error: 'Story ID and destinations are required' }, { status: 400 })
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

    // Get current story
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('syndication_destinations')
      .eq('id', storyId)
      .single()

    if (fetchError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Remove refused destinations
    const currentDestinations = story.syndication_destinations || []
    const updatedDestinations = currentDestinations.filter(
      dest => !destinations.includes(dest)
    )

    // Update story
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        syndication_destinations: updatedDestinations
      })
      .eq('id', storyId)

    if (updateError) {
      console.error('Error updating story:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the refusal action
    const { error: logError } = await supabase
      .from('super_admin_audit_log')
      .insert({
        admin_profile_id: user.id,
        action_type: 'refuse',
        target_type: 'story',
        target_id: storyId,
        action_metadata: {
          destinations_refused: destinations,
          reason: reason || 'Refused by super-admin',
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
      message: 'Publication refused successfully',
      storyId,
      refusedDestinations: destinations,
      remainingDestinations: updatedDestinations
    })

  } catch (error) {
    console.error('Error in refuse publication:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refuse publication' },
      { status: 500 }
    )
  }
}
