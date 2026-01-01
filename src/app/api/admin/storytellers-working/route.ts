// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



export async function GET(request: NextRequest) {
  console.log('🚀 Working storytellers route called')

  try {
    const supabase = createSupabaseServerClient()

    console.log('🔓 Using admin bypass for storytellers access')

    // Get all storytellers from profiles
    const { data: profiles, error: profilesError } = await supabase
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
        updated_at,
        is_elder,
        is_featured,
        tenant_id,
        is_storyteller
      `)
      .order('display_name', { ascending: true })

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch storytellers' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${profiles?.length || 0} profiles`)

    // Transform to expected format
    const storytellers = profiles?.map(profile => ({
      id: profile.id,
      displayName: profile.display_name || profile.full_name || 'Unknown',
      email: profile.email,
      bio: profile.bio || '',
      culturalBackground: profile.cultural_background || '',
      profileImageUrl: profile.profile_image_url,
      isElder: profile.is_elder || false,
      isFeatured: profile.is_featured || false,
      isStoryteller: profile.is_storyteller || false,
      status: 'active',
      createdAt: profile.created_at,
      storyCount: 0,
      transcriptCount: 0,
      engagementRate: 0
    })) || []

    return NextResponse.json({
      success: true,
      data: storytellers,
      pagination: {
        page: 1,
        limit: storytellers.length,
        total: storytellers.length,
        totalPages: 1
      }
    })

  } catch (error) {
    console.error('❌ Error in storytellers API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}