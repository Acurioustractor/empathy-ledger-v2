import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin projects')

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const organizationId = searchParams.get('organization_id')

    // Query projects with organization details
    let query = supabase
      .from('projects')
      .select(`
        *,
        organizations!projects_organization_id_fkey (
          id,
          name,
          type
        ),
        tenants!projects_tenant_id_fkey (
          id,
          name,
          status
        )
      `)
      .order('name')

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Get story counts and participant counts for each project
    const { data: storyData } = await supabase
      .from('stories')
      .select('project_id, author_id')
      .not('project_id', 'is', null)

    // Transform data for frontend
    const transformedProjects = (projects || []).map(project => {
      // Get stories and unique participants for this project
      const projectStories = storyData?.filter(s => s.project_id === project.id) || []
      const uniqueParticipants = new Set(projectStories.map(s => s.author_id))
      
      // Calculate engagement rate based on stories per participant
      const engagementRate = uniqueParticipants.size > 0 ? 
        Math.min(100, Math.round((projectStories.length / uniqueParticipants.size) * 20)) : 0
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        type: project.type || 'general',
        startDate: project.start_date,
        endDate: project.end_date,
        createdAt: project.created_at,
        organizationId: project.organization_id,
        tenantId: project.tenant_id,
        organization: project.organizations ? {
          id: project.organizations.id,
          name: project.organizations.name,
          type: project.organizations.type
        } : null,
        tenant: project.tenants ? {
          id: project.tenants.id,
          name: project.tenants.name,
          status: project.tenants.status
        } : null,
        storyCount: projectStories.length,
        participantCount: uniqueParticipants.size,
        engagementRate
      }
    })

    return NextResponse.json({
      projects: transformedProjects,
      total: transformedProjects.length
    })

  } catch (error) {
    console.error('Admin projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin projects create')

    const projectData = await request.json()

    // Create project in database
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([{
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'active',
        type: projectData.type || 'general',
        start_date: projectData.startDate || null,
        end_date: projectData.endDate || null,
        organization_id: projectData.organizationId || null,
        tenant_id: projectData.tenantId || null
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
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin projects update')

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Update project in database
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({
        name: updateData.name,
        description: updateData.description,
        status: updateData.status,
        type: updateData.type,
        start_date: updateData.startDate,
        end_date: updateData.endDate,
        organization_id: updateData.organizationId,
        tenant_id: updateData.tenantId
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ 
      project: updatedProject, 
      message: 'Project updated successfully' 
    })

  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin projects delete')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Project deleted successfully' })

  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}