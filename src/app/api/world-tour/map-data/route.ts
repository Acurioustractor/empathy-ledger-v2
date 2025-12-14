// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Fetch tour stops (confirmed locations)
    const { data: stops, error: stopsError } = await supabase
      .from('tour_stops')
      .select('*')
      .order('date_start', { ascending: true })

    if (stopsError) {
      console.error('Error fetching tour stops:', stopsError)
    }

    // Fetch tour requests (community nominations) - only ones with coordinates
    // Note: We don't show all requests publicly for privacy, just aggregate data
    const { data: requests, error: requestsError } = await supabase
      .from('tour_requests')
      .select('id, location_text, city, country, latitude, longitude, name, why_visit, status, created_at')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching tour requests:', requestsError)
    }

    // For privacy, we'll anonymize the requests a bit
    // Only show first name and truncate the why_visit
    const anonymizedRequests = (requests || []).map(req => ({
      id: req.id,
      location_text: req.location_text,
      city: req.city,
      country: req.country,
      latitude: req.latitude,
      longitude: req.longitude,
      name: req.name.split(' ')[0], // First name only
      why_visit: req.why_visit.substring(0, 150) + (req.why_visit.length > 150 ? '...' : ''),
      status: req.status
    }))

    // Fetch dream organizations
    const { data: dreamOrgs, error: dreamOrgsError } = await supabase
      .from('dream_organizations')
      .select('*')
      .order('priority', { ascending: true })

    if (dreamOrgsError) {
      console.error('Error fetching dream organizations:', dreamOrgsError)
    }

    // Calculate some stats
    const stats = {
      totalStops: stops?.length || 0,
      confirmedStops: stops?.filter(s => s.status === 'confirmed' || s.status === 'in_progress').length || 0,
      completedStops: stops?.filter(s => s.status === 'completed').length || 0,
      totalRequests: requests?.length || 0,
      totalDreamOrgs: dreamOrgs?.length || 0,
      countriesRequested: [...new Set(requests?.map(r => r.country).filter(Boolean))].length
    }

    return NextResponse.json({
      stops: stops || [],
      requests: anonymizedRequests,
      dreamOrgs: dreamOrgs || [],
      stats
    })

  } catch (error) {
    console.error('Map data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    )
  }
}
