import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Processing auth callback...')

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? searchParams.get('redirect') ?? '/onboarding/welcome'

    if (code) {
      const supabase = await createClient()

      console.log('🔐 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Code exchange failed:', error.message)
        return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        console.log('✅ Auth successful for user:', data.user.email)

        // Check if profile exists and get onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (!profile && data.user.email) {
          console.log('👤 Creating profile for user...')

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.user_metadata?.display_name ||
                           data.user.user_metadata?.full_name ||
                           data.user.email?.split('@')[0] || 'User',
              first_name: data.user.user_metadata?.first_name || null,
              last_name: data.user.user_metadata?.last_name || null,
              cultural_background: data.user.user_metadata?.cultural_background || null,
              profile_image_url: data.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              onboarding_completed: false,
              is_storyteller: true,
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

        // Redirect based on onboarding status
        if (profile && profile.onboarding_completed) {
          console.log('🔄 Redirecting to dashboard (onboarding complete)')
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          console.log('🔄 Redirecting to onboarding')
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    }

    console.error('❌ No code provided in auth callback')
    return NextResponse.redirect(`${origin}/auth/signin?error=auth_error`)

  } catch (error) {
    console.error('💥 Auth callback error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/signin?error=auth_error`)
  }
}