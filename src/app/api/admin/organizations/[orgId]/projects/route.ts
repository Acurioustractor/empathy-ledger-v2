// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'

import { createServiceRoleClient } from '@/lib/supabase/service-role-client'



export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Require super admin authentication
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log(`📁 Fetching projects for organization: ${params.orgId}`)

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('id', params.orgId)
      .single()

    if (orgError || !organization) {
      console.error('❌ Organization not found:', params.orgId, orgError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Query projects with organization filter
    let query = supabase
      .from('projects')
      .select(`
        *,
        organizations (
          id,
          name,
          type
        )
      `, { count: 'exact' })
      .eq('organization_id', params.orgId) // 🔒 CRITICAL: Organization filter
      .order('name')

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: projects, error, count } = await query

    if (error) {
      console.error('❌ Error fetching organization projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    // Get story counts and participant counts for each project
    const { data: storyData } = await supabase
      .from('stories')
      .select('project_id, author_id')
      .not('project_id', 'is', null)
      .eq('organization_id', params.orgId) // Filter stories by organization too

    // Get storytellers linked via project_storytellers junction table
    const { data: projectStorytellers } = await supabase
      .from('project_storytellers')
      .select('project_id, storyteller_id')

    // Get participants from project_participants table
    const { data: projectParticipants } = await supabase
      .from('project_participants')
      .select('project_id, storyteller_id')

    // Transform data for frontend
    const transformedProjects = (projects || []).map(project => {
      // Get stories and unique participants for this project
      const projectStories = storyData?.filter(s => s.project_id === project.id) || []
      const uniqueParticipantsFromStories = new Set(projectStories.map(s => s.author_id))

      // Get storytellers from junction table
      const linkedStorytellers = projectStorytellers?.filter(ps => ps.project_id === project.id) || []
      const uniqueStorytellersFromJunction = new Set(linkedStorytellers.map(ps => ps.storyteller_id))

      // Get participants from project_participants table
      const projectParticipantsForProject = projectParticipants?.filter(pp => pp.project_id === project.id) || []
      const uniqueParticipants = new Set(projectParticipantsForProject.map(pp => pp.storyteller_id))

      // Combine ALL sources for total unique storytellers
      const allUniqueStorytellers = new Set([
        ...uniqueParticipantsFromStories,
        ...uniqueStorytellersFromJunction,
        ...uniqueParticipants
      ])
      const storytellerCount = allUniqueStorytellers.size

      // Calculate engagement rate
      const engagementRate = storytellerCount > 0 ?
        Math.min(100, Math.round((projectStories.length / storytellerCount) * 20)) : 0

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status || 'active',
        startDate: project.start_date,
        endDate: project.end_date,
        organization: project.organizations,
        organizationId: project.organization_id,
        storyCount: projectStories.length,
        participantCount: storytellerCount,
        engagementRate,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    })

    console.log(`✅ Found ${transformedProjects.length} projects for ${organization.name} (total: ${count})`)

    return NextResponse.json({
      projects: transformedProjects,
      organizationName: organization.name,
      organizationId: organization.id,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('❌ Unexpected error fetching organization projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
