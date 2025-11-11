import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = createSupabaseServerClient()

    // Get all projects for this organisation
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, status')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) {
      console.error('Error fetching organisation projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json(projects || [])
  } catch (error) {
    console.error('Error in organisation projects route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = createSupabaseServerClient()

    // Get organization to validate and get tenant_id
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const projectData = await request.json()
    console.log('Creating project for organization:', organizationId, projectData)

    if (!projectData.name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    // Create project with organization context
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([{
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'active',
        location: projectData.location || null,
        start_date: projectData.startDate || null,
        end_date: projectData.endDate || null,
        budget: projectData.budget || null,
        organization_id: organizationId,
        tenant_id: organization.tenant_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({
      project: newProject,
      message: 'Project created successfully'
    })

  } catch (error) {
    console.error('Create organization project error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}