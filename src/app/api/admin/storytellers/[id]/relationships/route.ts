import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const storytellerId = params.id

    // Bypass auth temporarily for admin access
    console.log('🔓 Bypassing auth check for storyteller relationships update')

    const body: UpdateRelationshipsRequest = await request.json()
    const { type, relationships } = body

    if (type === 'organisation') {
      // Handle organisation relationships
      const orgRelationships = relationships as OrganizationRelationship[]

      // First, remove all existing organisation relationships for this storyteller
      await supabase
        .from('profile_organizations')
        .delete()
        .eq('profile_id', storytellerId)

      // Then, insert the new relationships
      if (orgRelationships.length > 0) {
        const insertData = orgRelationships.map(rel => ({
          profile_id: storytellerId,
          organization_id: rel.organization_id,
          role: rel.role,
          is_active: true
        }))

        const { error: insertError } = await supabase
          .from('profile_organizations')
          .insert(insertData)

        if (insertError) {
          console.error('Error inserting organisation relationships:', insertError)
          return NextResponse.json({ error: 'Failed to update organisation relationships' }, { status: 500 })
        }
      }

      // Update tenant_id based on organisation relationships
      // Get the tenant_id for the primary organisation (first one, or admin role if available)
      let newTenantId = null

      if (orgRelationships.length > 0) {
        // Find an admin role first, otherwise use the first organisation
        const primaryOrg = orgRelationships.find(rel => rel.role === 'admin') || orgRelationships[0]

        // Get the tenant_id for this organisation
        const { data: orgData } = await supabase
          .from('organisations')
          .select('tenant_id')
          .eq('id', primaryOrg.organization_id)
          .single()

        if (orgData) {
          newTenantId = orgData.tenant_id
        }
      }

      // Update profile tenant_id to match their primary organisation
      await supabase
        .from('profiles')
        .update({ tenant_id: newTenantId })
        .eq('id', storytellerId)

      return NextResponse.json({
        message: 'Organization relationships updated successfully',
        relationships: orgRelationships
      })

    } else if (type === 'project') {
      // Handle project relationships
      const projectRelationships = relationships as ProjectRelationship[]

      // First, remove all existing project relationships for this storyteller
      await supabase
        .from('profile_projects')
        .delete()
        .eq('profile_id', storytellerId)

      // Then, insert the new relationships
      if (projectRelationships.length > 0) {
        const insertData = projectRelationships.map(rel => ({
          profile_id: storytellerId,
          project_id: rel.project_id,
          role: rel.role
        }))

        const { error: insertError } = await supabase
          .from('profile_projects')
          .insert(insertData)

        if (insertError) {
          console.error('Error inserting project relationships:', insertError)
          return NextResponse.json({ error: 'Failed to update project relationships' }, { status: 500 })
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const storytellerId = params.id

    // Get current organisation relationships
    const { data: orgRelationships, error: orgError } = await supabase
      .from('profile_organizations')
      .select(`
        organization_id,
        role,
        is_active,
        organisation:organisations(
          id,
          name
        )
      `)
      .eq('profile_id', storytellerId)
      .eq('is_active', true)

    if (orgError) {
      console.error('Error fetching organisation relationships:', orgError)
    }

    // Get current project relationships
    const { data: projectRelationships, error: projectError } = await supabase
      .from('profile_projects')
      .select(`
        project_id,
        role,
        project:projects(
          id,
          name
        )
      `)
      .eq('profile_id', storytellerId)

    if (projectError) {
      console.error('Error fetching project relationships:', projectError)
    }

    // Transform the data
    const organisations = (orgRelationships || []).map(rel => ({
      organization_id: rel.organization_id,
      organization_name: rel.organisation?.name || 'Unknown',
      role: rel.role
    }))

    const projects = (projectRelationships || []).map(rel => ({
      project_id: rel.project_id,
      project_name: rel.project?.name || 'Unknown',
      role: rel.role
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