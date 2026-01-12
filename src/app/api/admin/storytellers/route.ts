// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'
import type { Database } from '@/types/database'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper function to calculate summary stats from storytellers table
async function calculateSummaryStats(supabase: SupabaseClient<Database>) {
  try {
    // Get total storytellers count
    const { count: totalStorytellers } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })

    // Get active storytellers count
    const { count: activeCount } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get featured count - try storytellers table first, fall back to profiles
    let featuredCount = 0
    const { count: featuredInStorytellers, error: featuredError } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)

    if (!featuredError && featuredInStorytellers !== null) {
      featuredCount = featuredInStorytellers
    } else {
      // Fall back to profiles table
      const { count: featuredInProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)
        .eq('is_storyteller', true)
      featuredCount = featuredInProfiles || 0
    }

    // Get elders count - try storytellers table first, fall back to profiles
    let eldersCount = 0
    const { count: eldersInStorytellers, error: eldersError } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_elder', true)

    if (!eldersError && eldersInStorytellers !== null) {
      eldersCount = eldersInStorytellers
    } else {
      // Fall back to profiles table
      const { count: eldersInProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_elder', true)
        .eq('is_storyteller', true)
      eldersCount = eldersInProfiles || 0
    }

    // Get total stories count
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })

    return {
      total: totalStorytellers || 0,
      active: activeCount || 0,
      featured: featuredCount,
      elders: eldersCount,
      totalStories: totalStories || 0,
      totalViews: 0,
      averageEngagement: 0
    }
  } catch (error) {
    console.error('Error calculating summary stats:', error)
    return {
      total: 0,
      active: 0,
      featured: 0,
      elders: 0,
      totalStories: 0,
      totalViews: 0,
      averageEngagement: 0
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const organisation = searchParams.get('organisation') || ''
    const location = searchParams.get('location') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Build query for storytellers table
    let query = supabase
      .from('storytellers')
      .select('*', { count: 'exact' })

    // Apply search filter (note: cultural_background is a text array, so we use a different approach)
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Apply status filter (using is_active)
    if (status !== 'all') {
      if (status === 'active' || status === 'public') {
        query = query.eq('is_active', true)
      } else if (status === 'inactive' || status === 'suspended') {
        query = query.eq('is_active', false)
      }
    }

    // Apply featured filter (column may not exist in all deployments)
    // Skip for now as column may not exist - will filter post-query if needed

    // Apply elder filter (column may not exist in all deployments)
    // Skip for now as column may not exist - will filter post-query if needed

    // Apply location filter
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Apply sorting
    const sortField = sortBy === 'name' ? 'display_name' :
                     sortBy === 'recent' ? 'updated_at' :
                     sortBy === 'stories' ? 'display_name' : 'display_name'
    const ascending = sortOrder === 'asc'

    query = query
      .order(sortField, { ascending, nullsFirst: false })
      .range(offset, offset + limit - 1)

    const { data: storytellers, error, count } = await query

    if (error) {
      console.error('Error fetching storytellers:', error)
      return NextResponse.json({ error: 'Failed to fetch storytellers' }, { status: 500 })
    }

    // Get story counts for each storyteller
    const storytellerIds = (storytellers || []).map(s => s.id)
    const profileIds = (storytellers || []).map(s => s.profile_id).filter(Boolean)
    const storyCounts: Record<string, { total: number; published: number; draft: number }> = {}
    const transcriptCounts: Record<string, number> = {}
    const organizationRelationshipsMap: Record<string, Array<{ organization_id: string; organization_name: string; role: string }>> = {}
    const profileDataMap: Record<string, { is_featured: boolean; is_elder: boolean; email?: string }> = {}
    const locationMap: Record<string, string> = {}
    const projectRelationshipsMap: Record<string, Array<{ project_id: string; project_name: string; role: string }>> = {}

    if (storytellerIds.length > 0) {
      // Batch fetch story counts
      const { data: storiesData } = await supabase
        .from('stories')
        .select('storyteller_id, status')
        .in('storyteller_id', storytellerIds)

      if (storiesData) {
        storiesData.forEach(story => {
          const storytellerId = story.storyteller_id
          if (!storytellerId) return

          if (!storyCounts[storytellerId]) {
            storyCounts[storytellerId] = { total: 0, published: 0, draft: 0 }
          }
          storyCounts[storytellerId].total++
          if (story.status === 'published') {
            storyCounts[storytellerId].published++
          } else if (story.status === 'draft') {
            storyCounts[storytellerId].draft++
          }
        })
      }

      // Batch fetch transcript counts
      const { data: transcriptsData } = await supabase
        .from('transcripts')
        .select('storyteller_id')
        .in('storyteller_id', storytellerIds)

      if (transcriptsData) {
        transcriptsData.forEach(t => {
          if (!t.storyteller_id) return
          transcriptCounts[t.storyteller_id] = (transcriptCounts[t.storyteller_id] || 0) + 1
        })
      }

      // Fetch organization relationships if needed
      const { data: orgRelations } = await supabase
        .from('storyteller_organizations')
        .select('storyteller_id, organization_id, role, organization:organizations(id, name)')
        .in('storyteller_id', storytellerIds)

      if (orgRelations) {
        orgRelations.forEach(rel => {
          if (!rel.storyteller_id || !rel.organization?.id) return
          if (!organizationRelationshipsMap[rel.storyteller_id]) {
            organizationRelationshipsMap[rel.storyteller_id] = []
          }
          organizationRelationshipsMap[rel.storyteller_id].push({
            organization_id: rel.organization_id || rel.organization.id,
            organization_name: rel.organization.name || 'Unknown',
            role: rel.role || 'storyteller'
          })
        })
      }

      // Fetch project relationships
      const { data: projectRelations } = await supabase
        .from('project_storytellers')
        .select('storyteller_id, project_id, role, projects:project_id(id, name)')
        .in('storyteller_id', storytellerIds)

      if (projectRelations) {
        projectRelations.forEach(rel => {
          if (!rel.storyteller_id) return
          if (!projectRelationshipsMap[rel.storyteller_id]) {
            projectRelationshipsMap[rel.storyteller_id] = []
          }
          projectRelationshipsMap[rel.storyteller_id].push({
            project_id: rel.project_id,
            project_name: rel.projects?.name || 'Unknown',
            role: rel.role || 'contributor'
          })
        })
      }

      // Fetch featured/elder status from profiles table if storytellers have profile_id
      if (profileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, is_featured, is_elder, email')
          .in('id', profileIds)

        if (profilesData) {
          profilesData.forEach(profile => {
            profileDataMap[profile.id] = {
              is_featured: profile.is_featured || false,
              is_elder: profile.is_elder || false,
              email: profile.email || null
            }
          })
        }

        // Fetch locations from profile_locations junction table
        const { data: locationsData } = await supabase
          .from('profile_locations')
          .select('profile_id, location:locations(name)')
          .in('profile_id', profileIds)
          .eq('is_primary', true)

        if (locationsData) {
          locationsData.forEach(loc => {
            if (loc.profile_id && loc.location?.name) {
              locationMap[loc.profile_id] = loc.location.name
            }
          })
        }
      }
    }

    // Transform to frontend format
    const frontendStorytellers = (storytellers || []).map(storyteller => {
      const storyData = storyCounts[storyteller.id] || { total: 0, published: 0, draft: 0 }
      const transcripts = transcriptCounts[storyteller.id] || 0
      const orgRelationships = organizationRelationshipsMap[storyteller.id] || []
      const profileData = storyteller.profile_id ? profileDataMap[storyteller.profile_id] : null
      const profileLocation = storyteller.profile_id ? locationMap[storyteller.profile_id] : null
      // Get first org name for backward compatibility
      const primaryOrgName = orgRelationships.length > 0 ? orgRelationships[0].organization_name : null

      return {
        id: storyteller.id,
        display_name: storyteller.display_name || 'Unnamed',
        full_name: storyteller.display_name || 'Unnamed',
        email: storyteller.email || profileData?.email || null,
        profile_visibility: storyteller.is_active ? 'public' : 'inactive',
        featured: storyteller.is_featured || profileData?.is_featured || false,
        elder: storyteller.is_elder || profileData?.is_elder || false,
        justicehub_featured: storyteller.is_justicehub_featured || false,
        story_count: storyData.total,
        published_stories: storyData.published,
        draft_stories: storyData.draft,
        last_active: storyteller.updated_at,
        location: storyteller.location || profileLocation || null,
        organisation: primaryOrgName,
        created_at: storyteller.created_at,
        bio: storyteller.bio || null,
        cultural_background: storyteller.cultural_background || null,
        profile_image_url: storyteller.avatar_url || storyteller.profile_image_url || null,
        projects: (projectRelationshipsMap[storyteller.id] || []).map(pr => ({
          id: pr.project_id,
          name: pr.project_name,
          role: pr.role
        })),
        engagement_rate: 0,
        total_views: 0,
        transcript_count: transcripts,
        active_transcripts: transcripts,
        organisations: orgRelationships,
        project_relationships: projectRelationshipsMap[storyteller.id] || []
      }
    })

    // Apply organization filter post-query if needed
    let filteredStorytellers = frontendStorytellers
    if (organisation && organisation !== 'all') {
      if (organisation === 'Independent' || organisation === 'Independent Storytellers') {
        filteredStorytellers = filteredStorytellers.filter(s => !s.organisation)
      } else {
        filteredStorytellers = filteredStorytellers.filter(s =>
          s.organisation?.toLowerCase().includes(organisation.toLowerCase())
        )
      }
    }

    const totalCount = count || 0

    return NextResponse.json({
      storytellers: filteredStorytellers,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      summary: await calculateSummaryStats(supabase)
    })

  } catch (error) {
    console.error('Admin storytellers error:', error)
    return NextResponse.json({ error: 'Failed to fetch storytellers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
    const requestData = await request.json()

    const {
      display_name,
      email,
      bio,
      is_elder,
      cultural_background,
      location
    } = requestData

    if (!display_name) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    // Generate email if not provided
    const finalEmail = email || `${display_name.toLowerCase().replace(/\s+/g, '.')}@storyteller.local`

    // Check if email already exists
    const { data: existingStoryteller } = await supabase
      .from('storytellers')
      .select('id')
      .eq('email', finalEmail)
      .single()

    if (existingStoryteller) {
      return NextResponse.json({ error: 'A storyteller with this email already exists' }, { status: 400 })
    }

    // Create new storyteller
    const { data: newStoryteller, error } = await supabase
      .from('storytellers')
      .insert({
        display_name,
        email: finalEmail,
        bio: bio || null,
        is_elder: is_elder || false,
        cultural_background: cultural_background || null,
        location: location || null,
        is_active: true,
        is_featured: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating storyteller:', error)
      return NextResponse.json({ error: `Failed to create storyteller: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      storyteller: newStoryteller,
      message: 'Storyteller created successfully'
    })

  } catch (error) {
    console.error('Create storyteller error:', error)
    return NextResponse.json({ error: 'Failed to create storyteller' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    const { data: updatedStoryteller, error } = await supabase
      .from('storytellers')
      .update({
        display_name: updateData.displayName || updateData.display_name,
        bio: updateData.bio,
        cultural_background: updateData.culturalBackground || updateData.cultural_background,
        location: updateData.location,
        is_elder: updateData.is_elder,
        is_featured: updateData.is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating storyteller:', error)
      return NextResponse.json({ error: 'Failed to update storyteller' }, { status: 500 })
    }

    return NextResponse.json({
      storyteller: updatedStoryteller,
      message: 'Storyteller updated successfully'
    })

  } catch (error) {
    console.error('Update storyteller error:', error)
    return NextResponse.json({ error: 'Failed to update storyteller' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('storytellers')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deactivating storyteller:', error)
      return NextResponse.json({ error: 'Failed to deactivate storyteller' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Storyteller deactivated successfully' })

  } catch (error) {
    console.error('Delete storyteller error:', error)
    return NextResponse.json({ error: 'Failed to deactivate storyteller' }, { status: 500 })
  }
}
