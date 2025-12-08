import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getRevocationService } from '@/lib/services/revocation.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stories/[id]/archive
 *
 * Archive a story (soft delete).
 * Archived stories are hidden but can be restored.
 *
 * Body:
 * - reason?: string - Reason for archiving
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { reason } = body

    // Get user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Archive the story
    const revocationService = getRevocationService()
    await revocationService.archiveStory(
      storyId,
      user.id,
      profile.tenant_id,
      reason
    )

    return NextResponse.json({
      success: true,
      message: 'Story archived successfully'
    })

  } catch (error) {
    console.error('Archive story error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('not own')) {
        return NextResponse.json(
          { error: error.message, code: 'UNAUTHORIZED' },
          { status: 403 }
        )
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message, code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to archive story', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/stories/[id]/archive
 *
 * Restore a story from archive.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Restore the story
    const revocationService = getRevocationService()
    await revocationService.restoreStory(
      storyId,
      user.id,
      profile.tenant_id
    )

    return NextResponse.json({
      success: true,
      message: 'Story restored successfully'
    })

  } catch (error) {
    console.error('Restore story error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: error.message, code: 'UNAUTHORIZED' },
          { status: 403 }
        )
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message, code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
      if (error.message.includes('not archived')) {
        return NextResponse.json(
          { error: error.message, code: 'INVALID_STATE' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to restore story', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stories/[id]/archive
 *
 * Get archive status for a story.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get story archive status
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        author_id,
        storyteller_id,
        is_archived,
        archived_at,
        archive_reason,
        status
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check ownership
    if (story.author_id !== user.id && story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      archive: {
        storyId: story.id,
        storyTitle: story.title,
        isArchived: story.is_archived || false,
        archivedAt: story.archived_at,
        archiveReason: story.archive_reason,
        status: story.status
      }
    })

  } catch (error) {
    console.error('Get archive status error:', error)
    return NextResponse.json(
      { error: 'Failed to get archive status', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
