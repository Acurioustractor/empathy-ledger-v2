import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔓 Admin PATCH request for storyteller:', storytellerId)

    const body = await request.json()
    const { location, status, avatar_url, avatar_media_id } = body

    // Handle avatar update if provided (URL or media_id)
    if (avatar_url !== undefined || avatar_media_id !== undefined) {
      let mediaIdToStore = avatar_media_id

      // If avatar_url provided, find the media record by URL
      if (avatar_url && !avatar_media_id) {
        const { data: mediaAsset } = await supabase
          .from('media_assets')
          .select('id')
          .eq('cdn_url', avatar_url)
          .single()

        mediaIdToStore = mediaAsset?.id
      }

      console.log(`🖼️ Updating avatar_media_id: "${mediaIdToStore}"`)

      const { error: avatarError } = await supabase
        .from('profiles')
        .update({
          avatar_media_id: mediaIdToStore
        })
        .eq('id', storytellerId)

      if (avatarError) {
        console.error('🖼️ Error updating avatar:', JSON.stringify(avatarError, null, 2))
        return NextResponse.json({
          error: 'Failed to update avatar',
          details: avatarError
        }, { status: 500 })
      } else {
        console.log(`🖼️ Successfully updated avatar_media_id`)
      }
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    console.log('🔓 Admin PUT request for storyteller:', storytellerId)

    const { data: storyteller, error } = await supabase
      .from('profiles')
      .update({
        display_name: body.display_name,
        bio: body.bio,
        cultural_background: body.cultural_background,
        is_featured: body.featured,
        is_elder: body.elder,
        profile_status: body.status
      })
      .eq('id', storytellerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating storyteller:', error)
      return NextResponse.json({ error: 'Failed to update storyteller' }, { status: 500 })
    }

    return NextResponse.json({ storyteller })

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

    // First get the profile
    const { data: storyteller, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single()

    if (error) {
      console.error('Error fetching storyteller:', error)
      return NextResponse.json({ error: 'Failed to fetch storyteller' }, { status: 500 })
    }

    // If there's an avatar_media_id, fetch the CDN URL separately
    let profile_image_url = null
    if (storyteller.avatar_media_id) {
      const { data: mediaAsset } = await supabase
        .from('media_assets')
        .select('cdn_url')
        .eq('id', storyteller.avatar_media_id)
        .single()

      profile_image_url = mediaAsset?.cdn_url || null
    }

    // Get project assignments for this storyteller
    const { data: projectAssignments } = await supabase
      .from('project_storytellers')
      .select(`
        project_id,
        role,
        status,
        created_at,
        projects:project_id (
          id,
          name,
          status,
          organization_id,
          organizations:organization_id (
            id,
            name
          )
        )
      `)
      .eq('storyteller_id', storytellerId)
      .order('created_at', { ascending: false })

    // Transform the data to include profile_image_url and projects
    const transformedStoryteller = {
      ...storyteller,
      profile_image_url,
      projects: projectAssignments?.map(pa => ({
        id: pa.projects.id,
        name: pa.projects.name,
        status: pa.projects.status,
        role: pa.role,
        assignmentStatus: pa.status,
        organization: pa.projects.organizations ? {
          id: pa.projects.organizations.id,
          name: pa.projects.organizations.name
        } : null,
        joinedAt: pa.created_at
      })) || []
    }

    return NextResponse.json({ storyteller: transformedStoryteller })

  } catch (error) {
    console.error('Error fetching storyteller:', error)
    return NextResponse.json({ error: 'Failed to fetch storyteller' }, { status: 500 })
  }
}
