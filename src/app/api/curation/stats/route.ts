import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/curation/stats
 * Get story curation dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stories
    let storiesQuery = supabase
      .from('stories')
      .select('id, status, project_id, created_at')

    if (organizationId) {
      storiesQuery = storiesQuery.eq('tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      storiesQuery = storiesQuery.eq('project_id', projectId)
    }

    const { data: stories, error: storiesError } = await storiesQuery

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    // Get themes count
    let themesQuery = supabase
      .from('story_themes')
      .select('id, story_id, stories!inner(tenant_id, project_id)')

    if (organizationId) {
      themesQuery = themesQuery.eq('stories.tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      themesQuery = themesQuery.eq('stories.project_id', projectId)
    }

    const { data: themes } = await themesQuery

    // Get campaigns
    let campaignsQuery = supabase
      .from('campaigns')
      .select('id, status')

    if (organizationId) {
      campaignsQuery = campaignsQuery.eq('organization_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      campaignsQuery = campaignsQuery.eq('project_id', projectId)
    }

    const { data: campaigns } = await campaignsQuery

    // Calculate stats
    const stats = {
      total_stories: stories?.length || 0,
      unassigned: stories?.filter(s => !s.project_id).length || 0,
      assigned: stories?.filter(s => s.project_id).length || 0,
      tagged: new Set(themes?.map(t => t.story_id)).size || 0,
      untagged: (stories?.length || 0) - (new Set(themes?.map(t => t.story_id)).size || 0),
      byStatus: {
        draft: stories?.filter(s => s.status === 'draft').length || 0,
        pending_review: stories?.filter(s => s.status === 'pending_review').length || 0,
        approved: stories?.filter(s => s.status === 'approved').length || 0,
        published: stories?.filter(s => s.status === 'published').length || 0,
      },
      campaigns: {
        total: campaigns?.length || 0,
        active: campaigns?.filter(c => c.status === 'active').length || 0,
        draft: campaigns?.filter(c => c.status === 'draft').length || 0,
        completed: campaigns?.filter(c => c.status === 'completed').length || 0,
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in curation stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
