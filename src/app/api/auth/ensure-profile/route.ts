/**
 * POST /api/auth/ensure-profile
 *
 * Creates a profile for the authenticated user if one doesn't exist.
 * Uses service role to bypass RLS.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { adminConfig } from '@/lib/config/admin-config'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from session
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      )
    }

    console.log('🔍 Ensuring profile exists for:', user.email)

    // Use service client to check/create profile (bypasses RLS)
    const serviceClient = getServiceClient()

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await serviceClient
      .from('profiles')
      .select('id, email, display_name')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile.email)
      return NextResponse.json({
        success: true,
        profile: existingProfile,
        created: false
      })
    }

    // Profile doesn't exist - create it
    const isAdmin = adminConfig.isSuperAdmin(user.email)

    const profileData = {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: isAdmin, // Admins skip onboarding
      is_storyteller: isAdmin, // Admins get storyteller access
      is_elder: false,
      profile_visibility: 'private',
      tenant_roles: isAdmin ? ['admin', 'storyteller'] : ['storyteller'],
    }

    console.log('👤 Creating profile for:', user.email)

    const { data: newProfile, error: createError } = await serviceClient
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error('❌ Profile creation failed:', createError)
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 500 }
      )
    }

    console.log('✅ Profile created successfully:', newProfile.email)

    return NextResponse.json({
      success: true,
      profile: newProfile,
      created: true
    })

  } catch (error) {
    console.error('❌ Error in ensure-profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
