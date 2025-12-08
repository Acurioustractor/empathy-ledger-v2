import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vault/stories
 *
 * Get all stories for the current user with distribution stats.
 * This is the main endpoint for the Story Vault dashboard.
 *
 * Query params:
 * - includeArchived: boolean - Include archived stories
 * - sortBy: string - Sort field (updatedAt, createdAt, views, distributions)
 * - sortOrder: string - Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Parse query params
    const includeArchived = request.nextUrl.searchParams.get('includeArchived') === 'true'
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'updated_at'
    const sortOrder = request.nextUrl.searchParams.get('sortOrder') || 'desc'

    // Map sort field names
    const sortFieldMap: Record<string, string> = {
      updatedAt: 'updated_at',
      createdAt: 'created_at',
      views: 'view_count',
      distributions: 'distribution_count'
    }
    const sortField = sortFieldMap[sortBy] || 'updated_at'

    // Build query for stories
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        excerpt,
        description,
        status,
        privacy_level,
        has_consent,
        consent_verified,
        is_archived,
        embeds_enabled,
        sharing_enabled,
        cultural_context,
        created_at,
        updated_at,
        view_count
      `)
      .or(`author_id.eq.${user.id},storyteller_id.eq.${user.id}`)

    // Filter archived
    if (!includeArchived) {
      query = query.or('is_archived.is.null,is_archived.eq.false')
    }

    // Sort
    query = query.order(sortField === 'view_count' ? 'view_count' : sortField, {
      ascending: sortOrder === 'asc',
      nullsFirst: false
    })

    const { data: stories, error: storiesError } = await query

    if (storiesError) {
      console.error('Failed to fetch stories:', storiesError)
      return NextResponse.json(
        { error: 'Failed to fetch stories', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }

    // Get distribution stats for all stories
    const storyIds = stories?.map(s => s.id) || []

    let embedStats: Record<string, number> = {}
    let distributionStats: Record<string, { count: number; views: number }> = {}

    if (storyIds.length > 0) {
      // Get embed counts
      const { data: embedCounts } = await supabase
        .from('embed_tokens')
        .select('story_id')
        .in('story_id', storyIds)
        .eq('status', 'active')

      if (embedCounts) {
        embedCounts.forEach(e => {
          embedStats[e.story_id] = (embedStats[e.story_id] || 0) + 1
        })
      }

      // Get distribution counts and views
      const { data: distributions } = await supabase
        .from('story_distributions')
        .select('story_id, view_count')
        .in('story_id', storyIds)
        .eq('status', 'active')

      if (distributions) {
        distributions.forEach(d => {
          if (!distributionStats[d.story_id]) {
            distributionStats[d.story_id] = { count: 0, views: 0 }
          }
          distributionStats[d.story_id].count++
          distributionStats[d.story_id].views += d.view_count || 0
        })
      }
    }

    // Check for elder approval status (if cultural_context has elder requirements)
    // This is a simplified check - actual implementation would depend on your cultural safety workflow

    // Build response
    const vaultStories = stories?.map(story => ({
      id: story.id,
      title: story.title || 'Untitled Story',
      excerpt: story.excerpt || story.description,
      status: story.status,
      privacyLevel: story.privacy_level || 'private',
      hasConsent: story.has_consent || false,
      consentVerified: story.consent_verified || false,
      isArchived: story.is_archived || false,
      embedsEnabled: story.embeds_enabled ?? true,
      sharingEnabled: story.sharing_enabled ?? true,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
      // Distribution stats
      activeEmbeds: embedStats[story.id] || 0,
      activeDistributions: distributionStats[story.id]?.count || 0,
      totalViews: (story.view_count || 0) + (distributionStats[story.id]?.views || 0),
      // Cultural info
      culturalContext: story.cultural_context,
      elderApprovalStatus: story.cultural_context?.elder_approval_status
    })) || []

    // Calculate summary
    const summary = {
      totalStories: vaultStories.length,
      activeStories: vaultStories.filter(s => !s.isArchived).length,
      archivedStories: vaultStories.filter(s => s.isArchived).length,
      totalEmbeds: Object.values(embedStats).reduce((a, b) => a + b, 0),
      totalDistributions: Object.values(distributionStats).reduce((a, b) => a + b.count, 0),
      totalViews: vaultStories.reduce((sum, s) => sum + s.totalViews, 0),
      storiesWithConsent: vaultStories.filter(s => s.consentVerified).length,
      storiesWithoutConsent: vaultStories.filter(s => !s.consentVerified).length
    }

    return NextResponse.json({
      success: true,
      stories: vaultStories,
      summary
    })

  } catch (error) {
    console.error('Vault stories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vault data', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
