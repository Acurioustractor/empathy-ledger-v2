import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/search/saved/[id]
 * Update a saved search
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    const { data: savedSearch, error } = await supabase
      .from('saved_searches')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating saved search:', error)
      return NextResponse.json({ error: 'Failed to update saved search' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      saved_search: savedSearch
    })

  } catch (error) {
    console.error('Error in update saved search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/search/saved/[id]
 * Delete a saved search
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting saved search:', error)
      return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Saved search deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete saved search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
