/**
 * Organizations API
 * GET /api/organizations - List all organizations (the ones storytellers connect to)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const url = new URL(request.url)

    const search = url.searchParams.get('search')
    const withProjects = url.searchParams.get('withProjects') === 'true'

    let query = supabase
      .from('organizations')
      .select('id, name, slug, short_name, logo_url, type, location, traditional_country')
      .order('name', { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%`)
    }

    const { data: organizations, error } = await query

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Optionally fetch projects for each organization
    const projectsByOrg: Record<string, any[]> = {}
    if (withProjects) {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, organization_id, status')
        .in('organization_id', (organizations || []).map(o => o.id))
        .order('name', { ascending: true })

      if (projects) {
        for (const project of projects) {
          if (!projectsByOrg[project.organization_id]) {
            projectsByOrg[project.organization_id] = []
          }
          projectsByOrg[project.organization_id].push({
            id: project.id,
            name: project.name,
            status: project.status
          })
        }
      }
    }

    return NextResponse.json({
      organizations: (organizations || []).map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        shortName: org.short_name,
        logoUrl: org.logo_url,
        type: org.type,
        location: org.location,
        traditionalCountry: org.traditional_country,
        projects: projectsByOrg[org.id] || []
      }))
    })

  } catch (error) {
    console.error('Error in organizations API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
