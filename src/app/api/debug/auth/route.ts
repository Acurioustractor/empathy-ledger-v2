/**
 * DEBUG ENDPOINT - Temporary
 * GET /api/debug/auth
 *
 * Tests authentication state on the server AND profile access
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isSuperAdmin } from '@/lib/auth/api-auth'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  // Get ALL cookies from the request
  const allCookies = request.cookies.getAll()
  const supabaseCookies = allCookies.filter(c =>
    c.name.includes('supabase') ||
    c.name.includes('sb-') ||
    c.name.includes('auth')
  )

  console.log('🔍 Debug auth endpoint called:', {
    totalCookies: allCookies.length,
    supabaseCookies: supabaseCookies.length,
    cookieNames: allCookies.map(c => c.name),
    requestHeaders: {
      cookie: request.headers.get('cookie')?.substring(0, 100) || 'none',
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    }
  })

  const { user, error } = await getAuthenticatedUser()

  console.log('📊 Auth result:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    error
  })

  if (error || !user) {
    return NextResponse.json({
      authenticated: false,
      error: error || 'No user found',
      debug: {
        totalCookies: allCookies.length,
        cookieNames: allCookies.map(c => c.name),
        supabaseCookieNames: supabaseCookies.map(c => c.name),
        hasCookieHeader: !!request.headers.get('cookie'),
        host: request.headers.get('host')
      }
    })
  }

  // Now test profile access with the session client
  const supabase = await createSupabaseServerClient()

  // Test 1: Can we count profiles?
  const { count: totalProfiles, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Test 2: Can we query the user's own profile?
  const { data: ownProfile, error: ownProfileError } = await supabase
    .from('profiles')
    .select('id, email, display_name, full_name')
    .eq('id', user.id)
    .single()

  // Test 3: List what profiles we CAN see
  const { data: visibleProfiles, error: listError } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .limit(5)

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    email: user.email,
    isAdmin: isSuperAdmin(user.email),
    cookieNames: allCookies.map(c => c.name),
    profileTests: {
      totalProfilesInDb: totalProfiles,
      countError: countError?.message,
      ownProfile: ownProfile ? {
        id: ownProfile.id,
        email: ownProfile.email,
        displayName: ownProfile.display_name,
        fullName: ownProfile.full_name
      } : null,
      ownProfileError: ownProfileError?.message,
      ownProfileErrorCode: ownProfileError?.code,
      visibleProfiles: visibleProfiles?.map(p => ({ id: p.id, email: p.email })),
      listError: listError?.message
    }
  })
}
