import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/outcomes/harvested/[id]
 * Fetch a single harvested outcome by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: outcome, error } = await supabase
      .from('harvested_outcomes')
      .select(`
        *,
        organization:organizations(id, name),
        project:projects(id, name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching harvested outcome:', error)
      return NextResponse.json({ error: 'Outcome not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      outcome
    })

  } catch (error) {
    console.error('Error in harvested outcome GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/outcomes/harvested/[id]
 * Update an existing harvested outcome
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    const {
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

    const { data: outcome, error } = await supabase
      .from('harvested_outcomes')
      .update({
        title,
        description,
        outcome_type,
        linked_stories,
        people_affected,
        geographic_scope,
        time_lag_months,
        evidence_urls,
        evidence_description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating harvested outcome:', error)
      return NextResponse.json({ error: 'Failed to update outcome' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      outcome
    })

  } catch (error) {
    console.error('Error in harvested outcome PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/outcomes/harvested/[id]
 * Delete a harvested outcome
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase
      .from('harvested_outcomes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting harvested outcome:', error)
      return NextResponse.json({ error: 'Failed to delete outcome' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Outcome deleted successfully'
    })

  } catch (error) {
    console.error('Error in harvested outcome DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
