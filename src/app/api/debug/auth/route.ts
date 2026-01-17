/**
 * DEBUG ENDPOINT - Temporary
 * GET /api/debug/auth
 *
 * Tests authentication state on the server
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isSuperAdmin } from '@/lib/auth/api-auth'

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

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    email: user.email,
    isAdmin: isSuperAdmin(user.email),
    cookieNames: allCookies.map(c => c.name)
  })
}
