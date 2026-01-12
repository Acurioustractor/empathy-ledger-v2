// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/social-platforms
 *
 * Returns all available social platforms
 * Public endpoint - just shows what platforms are available
 */
export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient()

  try {
    const { data: platforms, error } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching social platforms:', error)
      return NextResponse.json(
        { error: 'Failed to fetch social platforms' },
        { status: 500 }
      )
    }

    return NextResponse.json({ platforms })
  } catch (error) {
    console.error('Social platforms error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social platforms' },
      { status: 500 }
    )
  }
}
