import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response early so we can modify cookies on it
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update both the request (for this middleware chain) and the response (for the browser)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Don't use getSession() here - it doesn't validate the JWT
  // Use getUser() which actually validates the token with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Debug logging for auth issues
  const isProtectedPath = request.nextUrl.pathname.includes('profile') ||
                          request.nextUrl.pathname.includes('admin') ||
                          request.nextUrl.pathname.includes('dashboard') ||
                          request.nextUrl.pathname.includes('storytellers')

  // Always log for protected paths to debug auth issues
  const authCookies = request.cookies.getAll().filter(c => c.name.includes('supabase') || c.name.includes('auth'))

  if (isProtectedPath) {
    console.log('🔐 Middleware auth check:', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userEmail: user?.email,
      error: error?.message,
      authCookieCount: authCookies.length,
      authCookieNames: authCookies.map(c => c.name),
      // Log first 50 chars of each cookie value for debugging
      authCookiePreview: authCookies.map(c => ({ name: c.name, valueLength: c.value.length, preview: c.value.substring(0, 50) }))
    })
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to signin with return URL
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect authenticated routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/stories/create',
    '/syndication',
    '/storytellers',
  ]

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/signin', '/signup', '/auth/signin', '/auth/signup']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname === route
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
