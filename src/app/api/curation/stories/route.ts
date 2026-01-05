import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/curation/stories
 * Get stories for curation with filtering and theme data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const assignmentFilter = searchParams.get('assignment_filter') // 'all', 'assigned', 'unassigned'
    const themeFilter = searchParams.get('theme_filter') // 'all', 'tagged', 'untagged'
    const search = searchParams.get('search')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query for stories
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
        tenant_id,
        projects(id, name),
        profiles!storyteller_id(id, display_name)
      `)

    if (organizationId) {
      query = query.eq('tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId)
    }

    // Apply assignment filter
    if (assignmentFilter === 'assigned') {
      query = query.not('project_id', 'is', null)
    } else if (assignmentFilter === 'unassigned') {
      query = query.is('project_id', null)
    }

    const { data: stories, error: storiesError } = await query
      .order('created_at', { ascending: false })

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    // Get themes for all stories
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

    // Combine stories with their themes
    let enrichedStories = stories?.map(story => ({
      ...story,
      themes: themesByStory[story.id] || [],
      theme_count: (themesByStory[story.id] || []).length
    })) || []

    // Apply theme filter
    if (themeFilter === 'tagged') {
      enrichedStories = enrichedStories.filter(s => s.theme_count > 0)
    } else if (themeFilter === 'untagged') {
      enrichedStories = enrichedStories.filter(s => s.theme_count === 0)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      enrichedStories = enrichedStories.filter(s =>
        s.title?.toLowerCase().includes(searchLower) ||
        s.profiles?.display_name?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      stories: enrichedStories,
      total: enrichedStories.length
    })
  } catch (error) {
    console.error('Error in curation stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
