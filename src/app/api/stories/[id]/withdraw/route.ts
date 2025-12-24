import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * Withdraw Story
 *
 * POST /api/stories/:id/withdraw
 *
 * Changes story status to 'withdrawn' which:
 * 1. Triggers auto-revocation of all share tokens (via database trigger)
 * 2. Makes story inaccessible via all share links
 * 3. Sends notifications (future: email to storyteller and organizations)
 *
 * Only the storyteller can withdraw their own story.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get story and verify ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, status')
      .eq('id', params.id)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Verify user is the storyteller
    if (story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the storyteller can withdraw this story' },
        { status: 403 }
      )
    }

    // Check if already withdrawn
    if (story.status === 'withdrawn') {
      return NextResponse.json(
        { error: 'Story is already withdrawn' },
        { status: 400 }
      )
    }

    // Update story status to withdrawn
    // This triggers the database trigger that revokes all tokens
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error withdrawing story:', updateError)
      return NextResponse.json(
        { error: 'Failed to withdraw story' },
        { status: 500 }
      )
    }

    // Get count of revoked tokens for response
    const { count: revokedCount } = await supabase
      .from('story_access_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', params.id)
      .eq('revoked', true)

    // TODO: Send email notifications
    // - Email to storyteller confirming withdrawal
    // - Email to organizations using this story (if any)

    return NextResponse.json({
      success: true,
      message: 'Story withdrawn successfully',
      revokedTokens: revokedCount || 0,
      storyId: params.id,
      storyTitle: story.title,
    })
  } catch (error) {
    console.error('Error withdrawing story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Re-publish Story
 *
 * PUT /api/stories/:id/withdraw
 *
 * Changes story status back to 'published' to make it available again.
 * Note: Previously revoked tokens remain revoked - new tokens must be created.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, status')
      .eq('id', params.id)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.storyteller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (story.status !== 'withdrawn') {
      return NextResponse.json(
        { error: 'Story is not withdrawn' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error re-publishing story:', updateError)
      return NextResponse.json(
        { error: 'Failed to re-publish story' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Story re-published successfully',
      note: 'Previous share links remain revoked. Create new links to share this story.',
    })
  } catch (error) {
    console.error('Error re-publishing story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
