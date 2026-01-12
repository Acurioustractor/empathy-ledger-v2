// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const excludeOrganization = searchParams.get('excludeOrg')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    console.log('🔍 Searching users with query:', query)

    // Search for users by name or email
    const searchQuery = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        display_name,
        email,
        bio,
        profile_image_url,
        tenant_roles,
        tenant_id
      `)
      .or(`full_name.ilike.%${query}%,display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('full_name', { ascending: true })
      .limit(20)

    const { data: users, error } = await searchQuery

    if (error) {
      console.error('❌ Error searching users:', error)
      throw error
    }

    // Filter out users who are already storytellers in the specified organisation if excludeOrganization is provided
    let filteredUsers = users || []

    if (excludeOrganization) {
      // Get organisation details to find its tenant_id
      const { data: org } = await supabase
        .from('tenants')
        .select('tenant_id')
        .eq('id', excludeOrganization)
        .single()

      if (org?.tenant_id) {
        // Filter out users who already have storyteller role in this organisation's tenant
        filteredUsers = filteredUsers.filter(user => {
          const userRoles = user.tenant_roles || []
          return !(userRoles.includes('storyteller') && user.tenant_id === org.tenant_id)
        })
      }
    }

    // Format the results
    const formattedUsers = filteredUsers.map(user => ({
      id: user.id,
      name: user.display_name || user.full_name || 'Unnamed User',
      fullName: user.full_name,
      displayName: user.display_name,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.profile_image_url,
      isStoryteller: (user.tenant_roles || []).includes('storyteller')
    }))

    console.log(`✅ Found ${formattedUsers.length} users matching "${query}"`)

    return NextResponse.json({
      success: true,
      users: formattedUsers
    })

  } catch (error) {
    console.error('❌ Error in user search API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}