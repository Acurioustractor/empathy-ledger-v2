export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/projects
 *
 * Returns a list of projects the current user has access to.
 * For admin users, returns all projects.
 * For regular users, returns projects they're associated with.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Return empty array for unauthenticated users
      return NextResponse.json({ projects: [] })
    }

    // Get user's profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_roles, tenant_id')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.tenant_roles?.includes('admin') ||
                    profile?.tenant_roles?.includes('super_admin')

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        status,
        organization_id,
        tenant_id,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true })

    // If not admin, filter to user's tenant
    if (!isAdmin && profile?.tenant_id) {
      query = query.eq('tenant_id', profile.tenant_id)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0
    })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
