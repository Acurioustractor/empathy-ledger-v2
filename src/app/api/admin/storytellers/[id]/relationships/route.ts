// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrganizationRelationship {
  organization_id: string
  organization_name: string
  role: 'storyteller' | 'member'
}

interface ProjectRelationship {
  project_id: string
  project_name: string
  role: string
}

interface UpdateRelationshipsRequest {
  type: 'organisation' | 'project'
  relationships: OrganizationRelationship[] | ProjectRelationship[]
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id: storytellerId } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔓 Admin relationships update for storyteller:', storytellerId)

    const body: UpdateRelationshipsRequest = await request.json()
    const { type, relationships } = body

    if (type === 'organisation') {
      const orgRelationships = relationships as OrganizationRelationship[]

      // First, remove all existing organisation relationships for this storyteller
      // Try storyteller_organizations first (new table)
      const { error: deleteStorytellerOrgsError } = await supabase
        .from('storyteller_organizations')
        .delete()
        .eq('storyteller_id', storytellerId)

      if (deleteStorytellerOrgsError) {
        // Fall back to profile_organizations
        console.log('🔄 Falling back to profile_organizations for delete')
        await supabase
          .from('profile_organizations')
          .delete()
          .eq('profile_id', storytellerId)
      }

      // Insert new relationships
      if (orgRelationships.length > 0) {
        // Try storyteller_organizations first
        const storytellerOrgData = orgRelationships.map(rel => ({
          storyteller_id: storytellerId,
          organization_id: rel.organization_id,
          role: rel.role
        }))

        const { error: insertError } = await supabase
          .from('storyteller_organizations')
          .insert(storytellerOrgData)

        if (insertError) {
          // Fall back to profile_organizations
          console.log('🔄 Falling back to profile_organizations for insert')
          const profileOrgData = orgRelationships.map(rel => ({
            profile_id: storytellerId,
            organization_id: rel.organization_id,
            role: rel.role,
            is_active: true
          }))

          const { error: profileInsertError } = await supabase
            .from('profile_organizations')
            .insert(profileOrgData)

          if (profileInsertError) {
            console.error('Error inserting organisation relationships:', profileInsertError)
            return NextResponse.json({ error: 'Failed to update organisation relationships' }, { status: 500 })
          }
        }
      }

      return NextResponse.json({
        message: 'Organization relationships updated successfully',
        relationships: orgRelationships
      })

    } else if (type === 'project') {
      const projectRelationships = relationships as ProjectRelationship[]

      // Check if the storyteller_id is from storytellers table (has profile_id) or profiles table directly
      // The project_storytellers FK points to profiles.id, so we need to use the correct ID
      let idForProjectStorytellers = storytellerId

      // Check if this is a storytellers table ID by looking up the record
      const { data: storytellerRecord } = await supabase
        .from('storytellers')
        .select('id, profile_id')
        .eq('id', storytellerId)
        .single()

      if (storytellerRecord) {
        // If storyteller has a profile_id, use that for the FK
        // If not, the FK constraint will need to be updated to reference storytellers.id
        if (storytellerRecord.profile_id) {
          idForProjectStorytellers = storytellerRecord.profile_id
          console.log('📝 Using profile_id for project_storytellers:', idForProjectStorytellers)
        } else {
          // No profile_id - try using storyteller ID directly
          // This may fail if FK constraint points to profiles
          console.log('⚠️ No profile_id found, using storyteller_id directly:', storytellerId)
        }
      }

      // Remove all existing project relationships for this storyteller
      // Delete using both possible IDs to ensure cleanup
      await supabase
        .from('project_storytellers')
        .delete()
        .eq('storyteller_id', storytellerId)

      if (idForProjectStorytellers !== storytellerId) {
        await supabase
          .from('project_storytellers')
          .delete()
          .eq('storyteller_id', idForProjectStorytellers)
      }

      // Insert new relationships
      if (projectRelationships.length > 0) {
        // Try with the storyteller_id first (in case FK was updated to reference storytellers)
        const insertData = projectRelationships.map(rel => ({
          storyteller_id: storytellerId,
          project_id: rel.project_id,
          role: rel.role,
          status: 'active'
        }))

        const { error: insertError } = await supabase
          .from('project_storytellers')
          .insert(insertData)

        if (insertError) {
          console.error('Error inserting project relationships with storyteller_id:', insertError)

          // If FK error, try with profile_id instead
          if (insertError.code === '23503' && idForProjectStorytellers !== storytellerId) {
            console.log('🔄 Retrying with profile_id:', idForProjectStorytellers)
            const profileInsertData = projectRelationships.map(rel => ({
              storyteller_id: idForProjectStorytellers,
              project_id: rel.project_id,
              role: rel.role,
              status: 'active'
            }))

            const { error: profileInsertError } = await supabase
              .from('project_storytellers')
              .insert(profileInsertData)

            if (profileInsertError) {
              console.error('Error inserting project relationships with profile_id:', profileInsertError)
              return NextResponse.json({
                error: 'Failed to update project relationships. The storyteller may not have a linked profile.',
                details: profileInsertError.message
              }, { status: 500 })
            }
          } else {
            return NextResponse.json({ error: 'Failed to update project relationships' }, { status: 500 })
          }
        }
      }

      return NextResponse.json({
        message: 'Project relationships updated successfully',
        relationships: projectRelationships
      })
    }

    return NextResponse.json({ error: 'Invalid relationship type' }, { status: 400 })

  } catch (error) {
    console.error('Error updating storyteller relationships:', error)
    return NextResponse.json({ error: 'Failed to update relationships' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id: storytellerId } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔍 Fetching relationships for storyteller:', storytellerId)

    // Try storyteller_organizations first (new table)
    let orgRelationships: any[] = []
    const { data: storytellerOrgs, error: storytellerOrgsError } = await supabase
      .from('storyteller_organizations')
      .select(`
        organization_id,
        role,
        organization:organizations(id, name)
      `)
      .eq('storyteller_id', storytellerId)

    if (storytellerOrgs && !storytellerOrgsError) {
      orgRelationships = storytellerOrgs
    } else {
      // Fall back to profile_organizations
      console.log('🔄 Falling back to profile_organizations for GET')
      const { data: profileOrgs } = await supabase
        .from('profile_organizations')
        .select(`
          organization_id,
          role,
          is_active,
          organisation:organizations(id, name)
        `)
        .eq('profile_id', storytellerId)
        .eq('is_active', true)

      orgRelationships = profileOrgs || []
    }

    // Get project relationships
    const { data: projectRelationships, error: projectError } = await supabase
      .from('project_storytellers')
      .select(`
        project_id,
        role,
        status,
        projects!inner(id, name)
      `)
      .eq('storyteller_id', storytellerId)

    if (projectError) {
      console.error('Error fetching project relationships:', projectError)
    }

    // Transform the data
    const organisations = (orgRelationships || []).map(rel => ({
      organization_id: rel.organization_id,
      organization_name: rel.organization?.name || rel.organisation?.name || 'Unknown',
      role: rel.role
    }))

    const projects = (projectRelationships || []).map(rel => ({
      project_id: rel.project_id,
      project_name: rel.projects?.name || 'Unknown',
      role: rel.role,
      status: rel.status
    }))

    return NextResponse.json({
      organisations,
      projects
    })

  } catch (error) {
    console.error('Error fetching storyteller relationships:', error)
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 })
  }
}
