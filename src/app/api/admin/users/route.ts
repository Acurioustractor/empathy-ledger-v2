// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'



export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = await createSupabaseServerClient()

    // Get all users with their profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        full_name,
        bio,
        cultural_background,
        profile_image_url,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Transform the data to match the expected format
    const users = profiles?.map(profile => ({
      id: profile.id,
      email: profile.email,
      firstName: profile.full_name?.split(' ')[0] || '',
      lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
      displayName: profile.display_name || profile.full_name,
      avatar: profile.profile_image_url,
      culturalBackground: profile.cultural_background || '',
      joinedAt: profile.created_at,
      lastActive: profile.updated_at,
      status: 'active',
      roles: [
        'user',
        ...(profile.email === 'benjamin@act.place' ? ['admin', 'super_admin'] : [])
      ],
      stats: {
        storiesShared: 0, // Would need to query stories table
        storiesRead: 0,   // Would need to query reading history
        communityEngagement: 0 // Would need to calculate from various interactions
      },
      verificationStatus: {
        email: true, // Assume verified if they can log in
        identity: false,
        cultural: false
      },
      flags: {
        count: 0,
        reasons: []
      }
    })) || []

    return NextResponse.json({
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}