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
    // Query organizations (tenants) from database
    const { count: totalOrganizations } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { count: activeOrganizations } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total projects count
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Get active projects
    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total galleries
    const { count: totalGalleries } = await supabase
      .from('galleries')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      total: totalOrganizations || 0,
      active: activeOrganizations || 0,
      projects: totalProjects || 0,
      activeProjects: activeProjects || 0,
      galleries: totalGalleries || 0
    })

  } catch (error) {
    console.error('Admin organisations stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch organisations stats' }, { status: 500 })
  }
}