import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuditService } from '@/lib/services/audit.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stories/[id]/audit
 *
 * Get audit history for a story.
 * Requires authentication and story ownership.
 *
 * Query params:
 * - limit: number - Max logs to return (default: 100)
 * - offset: number - Offset for pagination
 * - category: string - Filter by action category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Verify story ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, storyteller_id, title')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (story.author_id !== user.id && story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    // Parse query params
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')
    const category = request.nextUrl.searchParams.get('category')

    // Get audit logs
    const auditService = getAuditService()
    const logs = await auditService.getStoryHistory(storyId, {
      limit,
      offset,
      categories: category ? [category as any] : undefined
    })

    return NextResponse.json({
      success: true,
      storyId,
      storyTitle: story.title,
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        actionCategory: log.action_category,
        entityType: log.entity_type,
        entityId: log.entity_id,
        actorId: log.actor_id,
        actorType: log.actor_type,
        changeSummary: log.change_summary,
        previousState: log.previous_state,
        newState: log.new_state,
        createdAt: log.created_at
      })),
      totalCount: logs.length,
      hasMore: logs.length === limit
    })

  } catch (error) {
    console.error('Get audit history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit history', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stories/[id]/audit/export
 *
 * Export full audit report for a story.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Verify story ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, storyteller_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (story.author_id !== user.id && story.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    // Generate audit report
    const auditService = getAuditService()
    const report = await auditService.exportAuditReport(storyId)

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Export audit report error:', error)
    return NextResponse.json(
      { error: 'Failed to export audit report', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
