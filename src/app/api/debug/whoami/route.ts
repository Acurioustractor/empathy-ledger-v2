import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/debug/whoami
 *
 * Debug endpoint to check current auth session
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      error: error?.message || null
    })
  } catch (err: any) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: err.message
    }, { status: 500 })
  }
}
