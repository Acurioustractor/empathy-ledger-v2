import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/interpretation/sessions
 * Fetch all interpretation sessions for an organization or project
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    let query = supabase
      .from('interpretation_sessions')
      .select(`
        *,
        organization:organizations(id, name),
        project:projects(id, name)
      `)
      .eq('organization_id', organizationId)
      .order('session_date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching interpretation sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      count: sessions?.length || 0
    })

  } catch (error) {
    console.error('Error in interpretation sessions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/interpretation/sessions
 * Create a new interpretation session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      organization_id,
      project_id,
      session_date,
      facilitator_name,
      participant_count,
      selected_stories,
      key_interpretations,
      consensus_points,
      divergent_views,
      cultural_context,
      recommendations
    } = body

    if (!organization_id || !session_date || !facilitator_name) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, session_date, facilitator_name' },
        { status: 400 }
      )
    }

    const { data: session, error } = await supabase
      .from('interpretation_sessions')
      .insert({
        organization_id,
        project_id,
        session_date,
        facilitator_name,
        participant_count: participant_count || 0,
        selected_stories: selected_stories || [],
        key_interpretations: key_interpretations || [],
        consensus_points: consensus_points || [],
        divergent_views: divergent_views || [],
        cultural_context: cultural_context || '',
        recommendations: recommendations || []
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating interpretation session:', error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error in interpretation sessions POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
