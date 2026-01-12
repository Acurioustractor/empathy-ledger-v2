import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/discovery/save
 * Save a discovery item to user's saved list
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { item_id, user_id, item_type } = body

    if (!item_id || !user_id) {
      return NextResponse.json(
        { error: 'item_id and user_id required' },
        { status: 400 }
      )
    }

    // Save to saved_items table (would need to create this table)
    const { data: savedItem, error } = await supabase
      .from('saved_items')
      .insert({
        user_id,
        item_id,
        item_type: item_type || 'story',
        saved_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error && error.code !== '23505') {
      // Ignore duplicate key error (already saved)
      console.error('Error saving item:', error)
      return NextResponse.json({ error: 'Failed to save item' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      saved_item: savedItem
    })

  } catch (error) {
    console.error('Error in save discovery item API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/discovery/save
 * Remove a saved item
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const itemId = searchParams.get('item_id')
    const userId = searchParams.get('user_id')

    if (!itemId || !userId) {
      return NextResponse.json(
        { error: 'item_id and user_id required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)

    if (error) {
      console.error('Error removing saved item:', error)
      return NextResponse.json({ error: 'Failed to remove saved item' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from saved list'
    })

  } catch (error) {
    console.error('Error in remove saved item API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
