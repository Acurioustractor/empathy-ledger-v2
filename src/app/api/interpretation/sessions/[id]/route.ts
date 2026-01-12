import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/interpretation/sessions/[id]
 * Fetch a single interpretation session by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: session, error } = await supabase
      .from('interpretation_sessions')
      .select(`
        *,
        organization:organizations(id, name),
        project:projects(id, name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching interpretation session:', error)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error in interpretation session GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/interpretation/sessions/[id]
 * Update an existing interpretation session
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

    const { data: session, error } = await supabase
      .from('interpretation_sessions')
      .update({
        session_date,
        facilitator_name,
        participant_count,
        selected_stories,
        key_interpretations,
        consensus_points,
        divergent_views,
        cultural_context,
        recommendations,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating interpretation session:', error)
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error in interpretation session PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/interpretation/sessions/[id]
 * Delete an interpretation session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase
      .from('interpretation_sessions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting interpretation session:', error)
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    })

  } catch (error) {
    console.error('Error in interpretation session DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
