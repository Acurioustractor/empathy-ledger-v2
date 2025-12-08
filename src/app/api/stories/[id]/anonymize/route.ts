import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getGDPRService } from '@/lib/services/gdpr.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stories/[id]/anonymize
 *
 * GDPR Article 17 - Right to Erasure (Anonymization)
 * Anonymizes a story by removing PII while optionally preserving the narrative.
 *
 * Body:
 * - preserveContent?: boolean - Keep the story content (default: false)
 * - preserveAttribution?: boolean - Keep author attribution (default: false)
 * - anonymizeMedia?: boolean - Also anonymize related media (default: true)
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
    const {
      preserveContent = false,
      preserveAttribution = false,
      anonymizeMedia = true
    } = body

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

    // Execute anonymization
    const gdprService = getGDPRService()
    const result = await gdprService.anonymizeStory(
      storyId,
      user.id,
      profile.tenant_id,
      {
        preserveContent,
        preserveAttribution,
        anonymizeMedia
      }
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Anonymization failed',
          code: 'ANONYMIZATION_FAILED',
          details: result.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Story anonymized successfully',
      result: {
        entityId: result.entityId,
        entityType: result.entityType,
        fieldsAnonymized: result.fieldsAnonymized,
        itemsAffected: result.itemsAffected
      }
    })

  } catch (error) {
    console.error('Anonymization error:', error)

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
      { error: 'Failed to anonymize story', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stories/[id]/anonymize
 *
 * Get anonymization status for a story.
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

    // Get story anonymization status
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        author_id,
        storyteller_id,
        anonymization_status,
        anonymized_at,
        anonymized_fields
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
      anonymization: {
        storyId: story.id,
        storyTitle: story.title,
        status: story.anonymization_status || 'none',
        anonymizedAt: story.anonymized_at,
        fieldsAnonymized: story.anonymized_fields?.fields || [],
        canAnonymize: !story.anonymization_status
      }
    })

  } catch (error) {
    console.error('Get anonymization status error:', error)
    return NextResponse.json(
      { error: 'Failed to get anonymization status', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
