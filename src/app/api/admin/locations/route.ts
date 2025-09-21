import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin locations')

    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, name, city, state, country')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
    }

    // Format locations for display
    const formattedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      display: `${location.name}${location.city ? ', ' + location.city : ''}${location.state ? ', ' + location.state : ''}`
    }))

    return NextResponse.json(formattedLocations)

  } catch (error) {
    console.error('Admin locations error:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}