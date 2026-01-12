import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search/saved
 * Get all saved searches for a user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const userId = searchParams.get('user_id')

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'organization_id and user_id required' },
        { status: 400 }
      )
    }

    const { data: savedSearches, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved searches:', error)
      return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      saved_searches: savedSearches || [],
      count: savedSearches?.length || 0
    })

  } catch (error) {
    console.error('Error in saved searches API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/search/saved
 * Create a new saved search
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      organization_id,
      user_id,
      name,
      query,
      filters,
      alert_enabled,
      alert_frequency
    } = body

    if (!organization_id || !user_id || !name || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: savedSearch, error } = await supabase
      .from('saved_searches')
      .insert({
        organization_id,
        user_id,
        name,
        query,
        filters: filters || {},
        alert_enabled: alert_enabled || false,
        alert_frequency: alert_frequency || 'never',
        last_run: new Date().toISOString(),
        result_count: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating saved search:', error)
      return NextResponse.json({ error: 'Failed to create saved search' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      saved_search: savedSearch
    })

  } catch (error) {
    console.error('Error in create saved search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
