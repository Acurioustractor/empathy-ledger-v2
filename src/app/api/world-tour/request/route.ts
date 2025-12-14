// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

interface TourRequestBody {
  name: string
  email: string
  phone?: string
  location_text: string
  why_visit: string
  storytellers_description?: string
  organization_name?: string
  organization_role?: string
  how_can_help?: string[]
}

// Simple geocoding using Nominatim (OpenStreetMap) - no API key needed
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; city?: string; country?: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'EmpathyLedger/1.0 (https://empathyledger.com)'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data && data.length > 0) {
      const result = data[0]

      // Parse display_name to extract city/country
      const parts = result.display_name?.split(', ') || []
      const country = parts[parts.length - 1]
      const city = parts[0]

      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        city,
        country
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Send to Go High Level webhook if configured
async function sendToGoHighLevel(data: TourRequestBody & { latitude?: number; longitude?: number }) {
  const webhookUrl = process.env.GHL_WORLD_TOUR_WEBHOOK_URL

  if (!webhookUrl) {
    console.log('GHL_WORLD_TOUR_WEBHOOK_URL not configured, skipping webhook')
    return null
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Standard contact fields
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email,
        phone: data.phone || '',

        // Custom fields for tour request
        customField: {
          tour_location: data.location_text,
          tour_why_visit: data.why_visit,
          tour_storytellers: data.storytellers_description || '',
          tour_organization: data.organization_name || '',
          tour_role: data.organization_role || '',
          tour_help_offered: data.how_can_help?.join(', ') || '',
          tour_latitude: data.latitude?.toString() || '',
          tour_longitude: data.longitude?.toString() || ''
        },

        // Tags for segmentation
        tags: ['world-tour-request', 'community-nomination'],

        // Source tracking
        source: 'World Tour Page'
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Sent to Go High Level:', result.contactId || 'success')
      return result.contactId || null
    } else {
      console.error('❌ GHL webhook failed:', response.status, await response.text())
      return null
    }
  } catch (error) {
    console.error('❌ Error sending to GHL:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TourRequestBody = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.location_text || !body.why_visit) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, location_text, and why_visit are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log('📝 Processing tour request from:', body.name, 'for', body.location_text)

    // Geocode the location
    const geo = await geocodeLocation(body.location_text)
    console.log('🌍 Geocoding result:', geo)

    // Create Supabase client with service role
    const supabase = createServiceRoleClient()

    // Insert the tour request
    const { data: tourRequest, error: insertError } = await supabase
      .from('tour_requests')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        location_text: body.location_text,
        city: geo?.city || null,
        country: geo?.country || null,
        latitude: geo?.lat || null,
        longitude: geo?.lon || null,
        why_visit: body.why_visit,
        storytellers_description: body.storytellers_description || null,
        organization_name: body.organization_name || null,
        organization_role: body.organization_role || null,
        how_can_help: body.how_can_help || [],
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save tour request. Please try again.' },
        { status: 500 }
      )
    }

    console.log('✅ Tour request saved:', tourRequest.id)

    // Send to Go High Level (non-blocking)
    const ghlContactId = await sendToGoHighLevel({
      ...body,
      latitude: geo?.lat,
      longitude: geo?.lon
    })

    // Update with GHL contact ID if we got one
    if (ghlContactId && tourRequest) {
      await supabase
        .from('tour_requests')
        .update({ ghl_contact_id: ghlContactId })
        .eq('id', tourRequest.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Tour request submitted successfully',
      request_id: tourRequest.id,
      location_geocoded: !!geo
    })

  } catch (error) {
    console.error('❌ Tour request error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
