import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Force dynamic rendering for this route since it uses request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Processing OAuth callback...')

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('redirect') || '/dashboard'

    if (code) {
      // Create a response object to attach cookies to
      const response = NextResponse.redirect(`${origin}${next}`)

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      console.log('🔐 Exchanging OAuth code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ OAuth code exchange failed:', error.message)
        return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
      }
      
      if (data.user) {
        console.log('✅ OAuth successful for user:', data.user.email)
        
        // Check if profile exists, create if missing
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
          
        if (!profile && data.user.email) {
          console.log('👤 Creating profile for OAuth user...')
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
              full_name: data.user.user_metadata?.full_name || null,
              profile_image_url: data.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              onboarding_completed: false,
              is_storyteller: false,
              is_elder: false,
              profile_visibility: 'private',
            })
            
          if (profileError) {
            console.error('❌ Profile creation failed:', profileError)
            // Continue anyway - profile creation failure shouldn't block login
          } else {
            console.log('✅ Profile created successfully')
          }
        }
        
        console.log('🔄 Redirecting to:', next, '(with auth cookies)')
        // Return the response with the cookies set
        return response
      }
    }

    console.error('❌ No code provided in OAuth callback')
    return NextResponse.redirect(`${origin}/auth/signin?error=oauth_error`)
    
  } catch (error) {
    console.error('💥 OAuth callback error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/signin?error=oauth_error`)
  }
}