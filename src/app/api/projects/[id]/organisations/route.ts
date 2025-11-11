import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


// GET /api/projects/[id]/organisations - Get all organisations for a project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    console.log('🏢 API: Getting organisations for project:', projectId)

    // Get the project and its owner organisation
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        organization_id,
        created_at,
        organizations:organization_id(
          id,
          name,
          type,
          location,
          website_url,
          contact_email
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all linked organizations from project_organizations table
    const { data: linkedOrgs, error: linkedError } = await supabase
      .from('project_organizations')
      .select(`
        id,
        role,
        created_at,
        organizations(
          id,
          name,
          type,
          location,
          website_url,
          contact_email
        )
      `)
      .eq('project_id', projectId)

    if (linkedError) {
      console.error('Error fetching linked organizations:', linkedError)
    }

    console.log('🏢 API: Project owner organisation:', project.organizations)
    console.log('🏢 API: Linked organisations:', linkedOrgs)

    const organisations = []

    // Add project owner organization
    if (project.organizations) {
      organisations.push({
        id: project.organizations.id,
        name: project.organizations.name,
        type: project.organizations.type,
        location: project.organizations.location,
        website_url: project.organizations.website_url,
        contact_email: project.organizations.contact_email,
        role: 'owner',
        joined_at: project.created_at,
        link_id: project.organization_id
      })
    }

    // Add linked organizations
    if (linkedOrgs) {
      linkedOrgs.forEach(link => {
        if (link.organizations) {
          organisations.push({
            id: link.organizations.id,
            name: link.organizations.name,
            type: link.organizations.type,
            location: link.organizations.location,
            website_url: link.organizations.website_url,
            contact_email: link.organizations.contact_email,
            role: link.role,
            joined_at: link.created_at,
            link_id: link.id
          })
        }
      })
    }

    return NextResponse.json({
      organisations
    })

  } catch (error) {
    console.error('Project organisations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects/[id]/organisations - Add organisation to project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projectId } = params
    const { organization_id, role = 'partner' } = await request.json()
    
    if (!organization_id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Check if project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if organisation exists
    const { data: organisation } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', organization_id)
      .single()

    if (!organisation) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Add the relationship
    const { data: link, error } = await supabase
      .from('project_organizations')
      .insert({
        project_id: projectId,
        organization_id,
        role
      })
      .select(`
        id,
        role,
        created_at,
        organization:organizations(
          id,
          name,
          type,
          location
        )
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Organization already linked to this project' }, { status: 409 })
      }
      console.error('Error linking organisation:', error)
      return NextResponse.json({ error: 'Failed to link organisation' }, { status: 500 })
    }

    return NextResponse.json({
      message: `${organisation.name} linked to ${project.name} as ${role}`,
      link: {
        id: link.organization?.id,
        name: link.organization?.name,
        type: link.organization?.type,
        location: link.organization?.location,
        role: link.role,
        joined_at: link.created_at,
        link_id: link.id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Link organisation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/organisations?link_id=xxx - Remove organisation from project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projectId } = params
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('link_id')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('project_organizations')
      .delete()
      .eq('id', linkId)
      .eq('project_id', projectId) // Extra safety check

    if (error) {
      console.error('Error unlinking organisation:', error)
      return NextResponse.json({ error: 'Failed to unlink organisation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Organization unlinked successfully' })

  } catch (error) {
    console.error('Unlink organisation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}