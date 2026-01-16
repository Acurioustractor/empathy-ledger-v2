/**
 * Projects API
 * GET /api/projects - List all projects (the ones storytellers connect to)
 */

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)

    const search = url.searchParams.get('search')
    const organizationId = url.searchParams.get('organizationId')
    const status = url.searchParams.get('status')

    let query = supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        organization_id,
        status,
        location,
        start_date,
        end_date,
        organizations:organization_id(id, name, slug, short_name)
      `)
      .order('name', { ascending: true })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      projects: (projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        organizationId: p.organization_id,
        organizationName: p.organizations?.name || null,
        organizationSlug: p.organizations?.slug || null,
        status: p.status,
        location: p.location,
        startDate: p.start_date,
        endDate: p.end_date
      }))
    })

  } catch (error) {
    console.error('Error in projects API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
