import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organisation = searchParams.get('organisation') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('🔓 Bypassing auth check for admin member management')

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('profile_organizations')
      .select(`
        profile_id,
        organization_id,
        role,
        is_active,
        joined_at,
        profiles (
          id,
          display_name,
          full_name,
          email,
          cultural_background,
          created_at,
          profile_image_url,
          avatar_url
        ),
        organisation:organisations (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    // Filter by organisation if specified
    if (organisation !== 'all') {
      console.log('🔍 Admin API - Looking for organisation:', organisation)

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', organisation)
        .single()

      console.log('🔍 Admin API - Organization lookup result:', {
        orgData: orgData?.id,
        error: orgError?.message
      })

      if (orgData) {
        query = query.eq('organization_id', orgData.id)
        console.log('🔍 Admin API - Filtering by organization_id:', orgData.id)
      } else {
        console.log('⚠️ Admin API - Organization not found, showing all members')
      }
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: memberRelations, error } = await query

    console.log('🔍 Admin API - Query result:', {
      memberCount: memberRelations?.length || 0,
      error: error?.message,
      organisation
    })

    if (error) {
      console.error('Error fetching member relations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    // Transform the data
    let members = memberRelations?.map(relation => ({
      id: relation.profiles?.id,
      display_name: relation.profiles?.display_name,
      full_name: relation.profiles?.full_name,
      email: relation.profiles?.email,
      cultural_background: relation.profiles?.cultural_background,
      created_at: relation.profiles?.created_at,
      profile_image_url: relation.profiles?.profile_image_url,
      avatar_url: relation.profiles?.avatar_url,
      organization_role: relation.role,
      organization_id: relation.organization_id,
      organization_name: relation.organisation?.name,
      organization_slug: relation.organisation?.slug,
      joined_at: relation.joined_at
    })) || []

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      members = members.filter(member => {
        const name = member.display_name || member.full_name || ''
        const email = member.email || ''
        const role = member.organization_role || ''
        const background = member.cultural_background || ''
        const orgName = member.organization_name || ''

        return name.toLowerCase().includes(searchLower) ||
               email.toLowerCase().includes(searchLower) ||
               role.toLowerCase().includes(searchLower) ||
               background.toLowerCase().includes(searchLower) ||
               orgName.toLowerCase().includes(searchLower)
      })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profile_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (organisation !== 'all') {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', organisation)
        .single()

      if (orgData) {
        countQuery = countQuery.eq('organization_id', orgData.id)
      }
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      success: true
    })

  } catch (error) {
    console.error('Error in admin member management:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const organizationId = searchParams.get('organizationId')

    if (!memberId || !organizationId) {
      return NextResponse.json(
        { error: 'Member ID and Organization ID are required' },
        { status: 400 }
      )
    }

    console.log('🔓 Super admin removing member:', { memberId, organizationId })

    const supabase = createSupabaseServerClient()

    // Get member and organisation names for response
    const [memberResult, orgResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', memberId)
        .single(),
      supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single()
    ])

    const memberName = memberResult.data?.display_name || memberResult.data?.full_name || 'Member'
    const orgName = orgResult.data?.name || 'Organization'

    // Remove member from organisation (deactivate relationship)
    const { error: removeError } = await supabase
      .from('profile_organizations')
      .update({ is_active: false })
      .eq('organization_id', organizationId)
      .eq('profile_id', memberId)

    if (removeError) {
      console.error('Error removing member:', removeError)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    // Also remove from any projects in this organisation
    const { data: orgProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', organizationId)

    if (orgProjects && orgProjects.length > 0) {
      const projectIds = orgProjects.map(p => p.id)

      await supabase
        .from('profile_projects')
        .delete()
        .eq('profile_id', memberId)
        .in('project_id', projectIds)
    }

    return NextResponse.json({
      success: true,
      message: `${memberName} has been removed from ${orgName}`
    })

  } catch (error) {
    console.error('Error in super admin member removal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, organizationId, role = 'member' } = body

    if (!memberId || !organizationId) {
      return NextResponse.json(
        { error: 'Member ID and Organization ID are required' },
        { status: 400 }
      )
    }

    console.log('🔓 Super admin adding member to organisation:', { memberId, organizationId, role })

    const supabase = createSupabaseServerClient()

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('profile_organizations')
      .select('*')
      .eq('profile_id', memberId)
      .eq('organization_id', organizationId)
      .single()

    if (existing) {
      // Reactivate if it was deactivated
      const { error: updateError } = await supabase
        .from('profile_organizations')
        .update({
          is_active: true,
          role: role,
          joined_at: new Date().toISOString()
        })
        .eq('profile_id', memberId)
        .eq('organization_id', organizationId)

      if (updateError) {
        console.error('Error reactivating member:', updateError)
        return NextResponse.json(
          { error: 'Failed to add member' },
          { status: 500 }
        )
      }
    } else {
      // Create new relationship
      const { error: insertError } = await supabase
        .from('profile_organizations')
        .insert({
          profile_id: memberId,
          organization_id: organizationId,
          role: role,
          is_active: true,
          joined_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error adding member:', insertError)
        return NextResponse.json(
          { error: 'Failed to add member' },
          { status: 500 }
        )
      }
    }

    // Update profile tenant_id to match organisation
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    // Get member name for response
    const { data: member } = await supabase
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', memberId)
      .single()

    const memberName = member?.display_name || member?.full_name || 'Member'

    return NextResponse.json({
      success: true,
      message: `${memberName} has been added to ${orgData?.name || 'the organisation'}`
    })

  } catch (error) {
    console.error('Error in super admin member addition:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}