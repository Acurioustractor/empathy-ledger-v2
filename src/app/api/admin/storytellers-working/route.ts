// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  console.log('🚀 Working storytellers route called')

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔓 Using admin bypass for storytellers access')

    // Get all storytellers from storytellers table first
    const { data: storytellersList, error: storytellersError } = await supabase
      .from('storytellers')
      .select(`
        id,
        email,
        display_name,
        bio,
        cultural_background,
        avatar_url,
        created_at,
        updated_at,
        is_elder,
        is_featured,
        is_active,
        location
      `)
      .order('display_name', { ascending: true })

    if (storytellersList && !storytellersError && storytellersList.length > 0) {
      console.log(`✅ Found ${storytellersList.length} storytellers from storytellers table`)

      // Get story counts
      const storytellerIds = storytellersList.map(s => s.id)
      const { data: storyCounts } = await supabase
        .from('stories')
        .select('storyteller_id')
        .in('storyteller_id', storytellerIds)

      const storyCountMap: Record<string, number> = {}
      if (storyCounts) {
        storyCounts.forEach(s => {
          storyCountMap[s.storyteller_id] = (storyCountMap[s.storyteller_id] || 0) + 1
        })
      }

      // Get transcript counts
      const { data: transcriptCounts } = await supabase
        .from('transcripts')
        .select('storyteller_id')
        .in('storyteller_id', storytellerIds)

      const transcriptCountMap: Record<string, number> = {}
      if (transcriptCounts) {
        transcriptCounts.forEach(t => {
          transcriptCountMap[t.storyteller_id] = (transcriptCountMap[t.storyteller_id] || 0) + 1
        })
      }

      // Transform to expected format
      const storytellers = storytellersList.map(storyteller => ({
        id: storyteller.id,
        displayName: storyteller.display_name || 'Unknown',
        email: storyteller.email,
        bio: storyteller.bio || '',
        culturalBackground: storyteller.cultural_background || '',
        profileImageUrl: storyteller.avatar_url,
        isElder: storyteller.is_elder || false,
        isFeatured: storyteller.is_featured || false,
        isStoryteller: true,
        status: storyteller.is_active ? 'active' : 'inactive',
        createdAt: storyteller.created_at,
        location: storyteller.location,
        storyCount: storyCountMap[storyteller.id] || 0,
        transcriptCount: transcriptCountMap[storyteller.id] || 0,
        engagementRate: 0
      }))

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
    }

    // Fall back to profiles table
    console.log('🔄 Falling back to profiles table')
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
        is_storyteller
      `)
      .eq('is_storyteller', true)
      .order('display_name', { ascending: true })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
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
    console.error('Error in storytellers API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
