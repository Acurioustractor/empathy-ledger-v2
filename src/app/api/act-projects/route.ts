/**
 * ACT Projects API
 * GET /api/act-projects - List all active ACT projects
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

    const includeInactive = url.searchParams.get('includeInactive') === 'true'
    const search = url.searchParams.get('search')

    let query = supabase
      .from('act_projects')
      .select('id, slug, title, description, organization_name, focus_areas, themes, is_active')
      .order('title', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching ACT projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      projects: (data || []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        organizationName: p.organization_name,
        focusAreas: p.focus_areas || [],
        themes: p.themes || [],
        isActive: p.is_active
      }))
    })

  } catch (error) {
    console.error('Error in ACT projects API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
