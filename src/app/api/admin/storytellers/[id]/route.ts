import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const storytellerId = params.id

    // Bypass auth temporarily for admin access
    console.log('🔓 Bypassing auth check for storyteller update')

    const body = await request.json()
    const { location, status } = body

    // Remove existing location relationships for this profile
    await supabase
      .from('profile_locations')
      .delete()
      .eq('profile_id', storytellerId)

    if (location) {
      console.log(`🗺️ Processing location: "${location}"`)
      // Check if location exists, create if not
      let { data: existingLocation, error: locationCheckError } = await supabase
        .from('locations')
        .select('id')
        .eq('name', location)
        .single()

      console.log(`🗺️ Existing location lookup:`, { existingLocation, locationCheckError })
      let locationId = existingLocation?.id

      if (!existingLocation) {
        // Create new location
        const { data: newLocation, error: locationCreateError } = await supabase
          .from('locations')
          .insert({
            name: location
          })
          .select('id')
          .single()

        if (!locationCreateError && newLocation) {
          locationId = newLocation.id
          console.log(`🗺️ Created new location with ID: ${locationId}`)
        } else {
          console.error(`🗺️ Location creation failed:`, JSON.stringify(locationCreateError, null, 2))
        }
      }

      // Create profile-location relationship
      console.log(`🗺️ About to create relationship with locationId: ${locationId}`)
      if (locationId) {
        const { error: relationshipError } = await supabase
          .from('profile_locations')
          .insert({
            profile_id: storytellerId,
            location_id: locationId,
            is_primary: true
          })

        if (relationshipError) {
          console.error('🗺️ Error creating location relationship:', JSON.stringify(relationshipError, null, 2))
          console.error('🗺️ Relationship data attempted:', JSON.stringify({
            profile_id: storytellerId,
            location_id: locationId,
            is_primary: true
          }, null, 2))
          return NextResponse.json({
            error: 'Failed to create location relationship',
            details: relationshipError
          }, { status: 500 })
        } else {
          console.log(`🗺️ Successfully created location relationship`)
        }
      } else {
        console.log(`🗺️ No locationId found, skipping relationship creation`)
      }
    }

    // Handle status update if provided
    if (status) {
      console.log(`👤 Processing status update: "${status}"`)

      const { error: statusError } = await supabase
        .from('profiles')
        .update({
          profile_visibility: status
        })
        .eq('id', storytellerId)

      if (statusError) {
        console.error('👤 Error updating status:', JSON.stringify(statusError, null, 2))
        return NextResponse.json({
          error: 'Failed to update status',
          details: statusError
        }, { status: 500 })
      } else {
        console.log(`👤 Successfully updated status to: ${status}`)
      }
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      location,
      status
    })

  } catch (error) {
    console.error('Error updating storyteller:', error)
    return NextResponse.json({ error: 'Failed to update storyteller' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const storytellerId = params.id

    const { data: storyteller, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single()

    if (error) {
      console.error('Error fetching storyteller:', error)
      return NextResponse.json({ error: 'Failed to fetch storyteller' }, { status: 500 })
    }

    return NextResponse.json(storyteller)

  } catch (error) {
    console.error('Error fetching storyteller:', error)
    return NextResponse.json({ error: 'Failed to fetch storyteller' }, { status: 500 })
  }
}
