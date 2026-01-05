import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/curation/assign
 * Assign stories to a project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { organization_id, project_id, story_ids } = body

    if (!project_id || !story_ids || story_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id, story_ids' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update all stories to assign them to the project
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        project_id,
        updated_at: new Date().toISOString()
      })
      .in('id', story_ids)

    if (updateError) {
      console.error('Error assigning stories:', updateError)
      return NextResponse.json({ error: 'Failed to assign stories' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: story_ids.length,
      project_name: project.name,
      message: `${story_ids.length} ${story_ids.length === 1 ? 'story' : 'stories'} assigned to ${project.name}`
    })
  } catch (error) {
    console.error('Error in assign stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
