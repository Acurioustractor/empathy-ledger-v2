// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'



export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth()
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const supabase = createSupabaseServerClient()

    // Get total stories count
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })

    // Get published stories count
    const { count: publishedStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get draft stories count
    const { count: draftStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    return NextResponse.json({
      total: totalStories || 0,
      published: publishedStories || 0,
      draft: draftStories || 0
    })

  } catch (error) {
    console.error('Admin stories stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories stats' }, { status: 500 })
  }
}