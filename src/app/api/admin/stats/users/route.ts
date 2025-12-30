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

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get recently active users (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString())

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentActivity } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', sevenDaysAgo.toISOString())

    return NextResponse.json({
      total: totalUsers || 0,
      active: activeUsers || 0,
      recentActivity: recentActivity || 0
    })

  } catch (error) {
    console.error('Admin users stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch users stats' }, { status: 500 })
  }
}