// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for admin stats
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get total storytellers count
    const { count: totalStorytellers } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })

    // Get storytellers with published stories (active)
    const { count: activeStorytellers } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get recently updated storytellers (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentActivity } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString())

    // Get featured storytellers count
    const { count: featuredStorytellers } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)

    return NextResponse.json({
      total: totalStorytellers || 0,
      active: activeStorytellers || 0,
      featured: featuredStorytellers || 0,
      recentActivity: recentActivity || 0
    })

  } catch (error) {
    console.error('Admin users stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch users stats' }, { status: 500 })
  }
}