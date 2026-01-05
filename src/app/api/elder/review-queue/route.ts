import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/elder/review-queue
 * Get stories pending Elder review
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const priorityFilter = searchParams.get('priority')
    const sensitivityFilter = searchParams.get('sensitivity')

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
        storyteller_id,
        storyteller_name,
        created_at,
        status,
        priority,
        cultural_sensitivity,
        requires_elder_review,
        profiles!inner(display_name)
      `)
      .eq('requires_elder_review', true)
      .eq('status', 'pending_review')

    if (organizationId) {
      query = query.eq('tenant_id', organizationId)
    }

    if (priorityFilter && priorityFilter !== 'all') {
      query = query.eq('priority', priorityFilter)
    }

    if (sensitivityFilter && sensitivityFilter !== 'all') {
      query = query.eq('cultural_sensitivity', sensitivityFilter)
    }

    const { data: stories, error: storiesError } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (storiesError) {
      console.error('Error fetching review queue:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 })
    }

    // Format response
    const formattedStories = stories?.map(story => ({
      id: story.id,
      title: story.title,
      storyteller_name: story.profiles?.display_name || story.storyteller_name || 'Unknown',
      submitted_at: story.created_at,
      priority: story.priority || 'medium',
      cultural_sensitivity: story.cultural_sensitivity || 'standard',
      status: story.status
    })) || []

    return NextResponse.json({ stories: formattedStories })
  } catch (error) {
    console.error('Error in review-queue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
