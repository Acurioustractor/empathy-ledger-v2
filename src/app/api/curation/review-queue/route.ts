import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/curation/review-queue
 * Get stories pending quality review for curation
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const qualityFilter = searchParams.get('quality_filter')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        status,
        project_id,
        storyteller_id,
        created_at,
        updated_at,
        projects(id, name),
        profiles!storyteller_id(id, display_name)
      `)
      .in('status', ['draft', 'pending_review']) // Stories that need review

    if (organizationId) {
      query = query.eq('tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId)
    }

    const { data: stories, error: storiesError } = await query
      .order('created_at', { ascending: true }) // Oldest first

    if (storiesError) {
      console.error('Error fetching review queue:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 })
    }

    // Get themes for quality assessment
    const storyIds = stories?.map(s => s.id) || []
    let themesData: any[] = []

    if (storyIds.length > 0) {
      const { data: themes } = await supabase
        .from('story_themes')
        .select('story_id, theme')
        .in('story_id', storyIds)

      themesData = themes || []
    }

    // Group themes by story_id
    const themesByStory: Record<string, string[]> = {}
    themesData.forEach(t => {
      if (!themesByStory[t.story_id]) {
        themesByStory[t.story_id] = []
      }
      themesByStory[t.story_id].push(t.theme)
    })

    // Enrich stories with quality indicators
    let enrichedStories = stories?.map(story => {
      const themes = themesByStory[story.id] || []
      const hasThemes = themes.length > 0
      const hasProject = !!story.project_id

      // Simple quality assessment
      let qualityScore = 0
      if (hasThemes) qualityScore += 50
      if (hasProject) qualityScore += 30
      if (story.title && story.title.length > 10) qualityScore += 20

      return {
        ...story,
        themes,
        quality_score: qualityScore,
        quality_level: qualityScore >= 80 ? 'high' : qualityScore >= 50 ? 'medium' : 'low'
      }
    }) || []

    // Apply quality filter
    if (qualityFilter && qualityFilter !== 'all') {
      enrichedStories = enrichedStories.filter(s => s.quality_level === qualityFilter)
    }

    return NextResponse.json({
      stories: enrichedStories,
      total: enrichedStories.length
    })
  } catch (error) {
    console.error('Error in review queue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
