// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const supabase = createServiceRoleClient()

    console.log('🔍 Admin GET request for storyteller:', storytellerId)

    // First try storytellers table (new data model)
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('*')
      .eq('id', storytellerId)
      .single()

    console.log('📊 Storytellers query result:', { found: !!storyteller, error: storytellerError?.message })

    if (storyteller && !storytellerError) {
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

      // Get organization relationships
      const { data: orgRelationships } = await supabase
        .from('storyteller_organizations')
        .select(`
          organization_id,
          role,
          organization:organizations(id, name)
        `)
        .eq('storyteller_id', storytellerId)

      // Get story count
      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('storyteller_id', storytellerId)

      // Transform to expected format
      const transformedStoryteller = {
        id: storyteller.id,
        display_name: storyteller.display_name,
        email: storyteller.email,
        bio: storyteller.bio,
        cultural_background: storyteller.cultural_background,
        location: storyteller.location,
        profile_image_url: storyteller.avatar_url || storyteller.profile_image_url,
        avatar_url: storyteller.avatar_url,
        is_active: storyteller.is_active,
        is_featured: storyteller.is_featured || false,
        is_elder: storyteller.is_elder || false,
        justicehub_enabled: storyteller.justicehub_enabled || false,
        justicehub_featured: storyteller.justicehub_featured || false,
        profile_visibility: storyteller.is_active ? 'public' : 'inactive',
        created_at: storyteller.created_at,
        updated_at: storyteller.updated_at,
        story_count: storyCount || 0,
        organisations: (orgRelationships || []).map(rel => ({
          organization_id: rel.organization_id,
          organization_name: rel.organization?.name || 'Unknown',
          role: rel.role || 'storyteller'
        })),
        projects: (projectAssignments || []).map(pa => ({
          id: pa.projects?.id,
          name: pa.projects?.name,
          status: pa.projects?.status,
          role: pa.role,
          assignmentStatus: pa.status,
          organization: pa.projects?.organizations ? {
            id: pa.projects.organizations.id,
            name: pa.projects.organizations.name
          } : null,
          joinedAt: pa.created_at
        }))
      }

      return NextResponse.json({ storyteller: transformedStoryteller })
    }

    // Fall back to profiles table for backwards compatibility
    console.log('🔄 Falling back to profiles table for storyteller:', storytellerId)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching storyteller:', profileError)
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 })
    }

    // Get avatar URL if there's a media_id
    let profile_image_url = null
    if (profile.avatar_media_id) {
      const { data: mediaAsset } = await supabase
        .from('media_assets')
        .select('cdn_url')
        .eq('id', profile.avatar_media_id)
        .single()
      profile_image_url = mediaAsset?.cdn_url || null
    }

    // Get project assignments
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

    const transformedProfile = {
      ...profile,
      profile_image_url,
      projects: (projectAssignments || []).map(pa => ({
        id: pa.projects?.id,
        name: pa.projects?.name,
        status: pa.projects?.status,
        role: pa.role,
        assignmentStatus: pa.status,
        organization: pa.projects?.organizations ? {
          id: pa.projects.organizations.id,
          name: pa.projects.organizations.name
        } : null,
        joinedAt: pa.created_at
      }))
    }

    return NextResponse.json({ storyteller: transformedProfile })

  } catch (error) {
    console.error('Error fetching storyteller:', error)
    return NextResponse.json({ error: 'Failed to fetch storyteller' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const supabase = createServiceRoleClient()

    console.log('🔓 Admin PATCH request for storyteller:', storytellerId)

    const body = await request.json()
    const {
      location,
      status,
      avatar_url,
      avatar_media_id,
      display_name,
      bio,
      cultural_background,
      email,
      is_featured,
      featured,
      is_elder,
      elder,
      is_justicehub_featured,
      justicehub_featured,
      profile_visibility
    } = body

    // Check if this ID exists in storytellers table
    const { data: existingStoryteller } = await supabase
      .from('storytellers')
      .select('id')
      .eq('id', storytellerId)
      .single()

    if (existingStoryteller) {
      // Update storytellers table with fields that exist in the schema
      const storytellerUpdateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      }

      // Basic fields that exist in storytellers table
      if (display_name !== undefined) {
        storytellerUpdateData.display_name = display_name
      }

      if (bio !== undefined) {
        storytellerUpdateData.bio = bio
      }

      if (cultural_background !== undefined) {
        storytellerUpdateData.cultural_background = cultural_background
      }

      // Status - only is_active exists in storytellers table
      if (status !== undefined || profile_visibility !== undefined) {
        const statusValue = status || profile_visibility
        storytellerUpdateData.is_active = statusValue === 'active' || statusValue === 'public'
      }

      if (avatar_url !== undefined) {
        storytellerUpdateData.avatar_url = avatar_url
      }

      // Boolean flags - update directly in storytellers table
      if (is_featured !== undefined || featured !== undefined) {
        storytellerUpdateData.is_featured = is_featured ?? featured
      }

      if (is_elder !== undefined || elder !== undefined) {
        storytellerUpdateData.is_elder = is_elder ?? elder
      }

      if (is_justicehub_featured !== undefined || justicehub_featured !== undefined) {
        storytellerUpdateData.is_justicehub_featured = is_justicehub_featured ?? justicehub_featured
      }

      console.log('📝 Updating storyteller with data:', storytellerUpdateData)

      const { data: updatedStoryteller, error: updateError } = await supabase
        .from('storytellers')
        .update(storytellerUpdateData)
        .eq('id', storytellerId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating storyteller:', updateError)
        return NextResponse.json({
          error: 'Failed to update storyteller',
          details: updateError
        }, { status: 500 })
      }

      // Update related profile data (location, featured, elder, email)
      // These fields are stored in the profiles table
      const profileId = updatedStoryteller.profile_id || storytellerId
      const profileUpdateData: Record<string, any> = {}

      if (location !== undefined) {
        // Handle location via profile_locations junction table
        await supabase
          .from('profile_locations')
          .delete()
          .eq('profile_id', profileId)

        if (location) {
          const { data: existingLocation } = await supabase
            .from('locations')
            .select('id')
            .eq('name', location)
            .single()

          let locationId = existingLocation?.id

          if (!existingLocation) {
            const { data: newLocation } = await supabase
              .from('locations')
              .insert({ name: location })
              .select('id')
              .single()
            locationId = newLocation?.id
          }

          if (locationId) {
            await supabase
              .from('profile_locations')
              .insert({
                profile_id: profileId,
                location_id: locationId,
                is_primary: true
              })
          }
        }
      }

      if (email !== undefined) {
        profileUpdateData.email = email
      }

      if (is_featured !== undefined || featured !== undefined) {
        profileUpdateData.is_featured = is_featured ?? featured
      }

      if (is_elder !== undefined || elder !== undefined) {
        profileUpdateData.is_elder = is_elder ?? elder
      }

      if (status !== undefined || profile_visibility !== undefined) {
        profileUpdateData.profile_visibility = status || profile_visibility
      }

      // Update profiles table if we have profile-specific fields
      if (Object.keys(profileUpdateData).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', profileId)

        if (profileError) {
          console.warn('Warning: Could not update profile fields:', profileError)
          // Don't fail the request - storyteller was updated successfully
        }
      }

      return NextResponse.json({
        message: 'Storyteller updated successfully',
        storyteller: updatedStoryteller,
        location,
        status
      })
    }

    // Fall back to profiles table
    console.log('🔄 Falling back to profiles table for PATCH')

    // Handle avatar update if provided
    if (avatar_url !== undefined || avatar_media_id !== undefined) {
      let mediaIdToStore = avatar_media_id

      if (avatar_url && !avatar_media_id) {
        const { data: mediaAsset } = await supabase
          .from('media_assets')
          .select('id')
          .eq('cdn_url', avatar_url)
          .single()
        mediaIdToStore = mediaAsset?.id
      }

      const { error: avatarError } = await supabase
        .from('profiles')
        .update({ avatar_media_id: mediaIdToStore })
        .eq('id', storytellerId)

      if (avatarError) {
        console.error('Error updating avatar:', avatarError)
        return NextResponse.json({
          error: 'Failed to update avatar',
          details: avatarError
        }, { status: 500 })
      }
    }

    // Handle location update via profile_locations
    await supabase
      .from('profile_locations')
      .delete()
      .eq('profile_id', storytellerId)

    if (location) {
      const { data: existingLocation } = await supabase
        .from('locations')
        .select('id')
        .eq('name', location)
        .single()

      let locationId = existingLocation?.id

      if (!existingLocation) {
        const { data: newLocation } = await supabase
          .from('locations')
          .insert({ name: location })
          .select('id')
          .single()
        locationId = newLocation?.id
      }

      if (locationId) {
        await supabase
          .from('profile_locations')
          .insert({
            profile_id: storytellerId,
            location_id: locationId,
            is_primary: true
          })
      }
    }

    // Handle status update
    if (status) {
      await supabase
        .from('profiles')
        .update({ profile_visibility: status })
        .eq('id', storytellerId)
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
    const supabase = createServiceRoleClient()

    const body = await request.json()
    console.log('🔓 Admin PUT request for storyteller:', storytellerId)

    // Check if this ID exists in storytellers table
    const { data: existingStoryteller } = await supabase
      .from('storytellers')
      .select('id')
      .eq('id', storytellerId)
      .single()

    if (existingStoryteller) {
      // Update storytellers table
      const { data: storyteller, error } = await supabase
        .from('storytellers')
        .update({
          display_name: body.display_name,
          bio: body.bio,
          cultural_background: body.cultural_background,
          is_featured: body.featured ?? body.is_featured,
          is_elder: body.elder ?? body.is_elder,
          is_active: body.status === 'active' || body.status === 'public' || body.is_active,
          location: body.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', storytellerId)
        .select()
        .single()

      if (error) {
        console.error('Error updating storyteller:', error)
        return NextResponse.json({ error: 'Failed to update storyteller' }, { status: 500 })
      }

      return NextResponse.json({ storyteller })
    }

    // Fall back to profiles table
    console.log('🔄 Falling back to profiles table for PUT')
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
