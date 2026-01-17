/**
 * DEBUG ENDPOINT - Temporary
 * GET /api/debug/auth
 *
 * Tests authentication state on the server
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isSuperAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  console.log('🔍 Debug auth endpoint called')

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
      cookies: request.cookies.getAll().map(c => c.name) // List cookie names (not values for security)
    })
  }

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    email: user.email,
    isAdmin: isSuperAdmin(user.email),
    cookies: request.cookies.getAll().map(c => c.name)
  })
}
