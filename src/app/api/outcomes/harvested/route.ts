import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/outcomes/harvested
 * Fetch all harvested outcomes for an organization or project
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const outcomeType = searchParams.get('outcome_type')

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    let query = supabase
      .from('harvested_outcomes')
      .select(`
        *,
        organization:organizations(id, name),
        project:projects(id, name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (outcomeType) {
      query = query.eq('outcome_type', outcomeType)
    }

    const { data: outcomes, error } = await query

    if (error) {
      console.error('Error fetching harvested outcomes:', error)
      return NextResponse.json({ error: 'Failed to fetch outcomes' }, { status: 500 })
    }

    // Calculate stats
    const stats = {
      total_outcomes: outcomes?.length || 0,
      people_affected: outcomes?.reduce((sum, o) => sum + (o.people_affected || 0), 0) || 0,
      policy_influences: outcomes?.filter(o => o.outcome_type === 'policy_influence').length || 0,
      community_impacts: outcomes?.filter(o => o.outcome_type === 'community_impact').length || 0
    }

    return NextResponse.json({
      success: true,
      outcomes: outcomes || [],
      stats
    })

  } catch (error) {
    console.error('Error in harvested outcomes API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/outcomes/harvested
 * Create a new harvested outcome
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      organization_id,
      project_id,
      title,
      description,
      outcome_type,
      linked_stories,
      people_affected,
      geographic_scope,
      time_lag_months,
      evidence_urls,
      evidence_description
    } = body

    if (!organization_id || !title || !outcome_type) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, title, outcome_type' },
        { status: 400 }
      )
    }

    const { data: outcome, error } = await supabase
      .from('harvested_outcomes')
      .insert({
        organization_id,
        project_id,
        title,
        description: description || '',
        outcome_type,
        linked_stories: linked_stories || [],
        people_affected: people_affected || 0,
        geographic_scope: geographic_scope || '',
        time_lag_months: time_lag_months || 0,
        evidence_urls: evidence_urls || [],
        evidence_description: evidence_description || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating harvested outcome:', error)
      return NextResponse.json({ error: 'Failed to create outcome' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      outcome
    })

  } catch (error) {
    console.error('Error in harvested outcomes POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
