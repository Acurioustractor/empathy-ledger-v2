export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/partner/projects
 * List all projects for the partner
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('app_id')

    if (!appId) {
      return NextResponse.json({ error: 'Missing app_id' }, { status: 400 })
    }

    // Verify access
    const { data: access } = await supabase
      .from('partner_team_members')
      .select('id')
      .eq('app_id', appId)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get projects
    const { data: projects, error } = await supabase
      .from('partner_projects')
      .select(`
        id,
        name,
        slug,
        description,
        themes,
        story_types,
        show_storyteller_names,
        show_storyteller_photos,
        allow_full_content,
        embed_config,
        is_active,
        stories_count,
        created_at,
        updated_at
      `)
      .eq('app_id', appId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects: projects || [] })

  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/partner/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { app_id, name, description, themes, story_types, ...config } = body

    if (!app_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify access with permission to manage projects
    const { data: access } = await supabase
      .from('partner_team_members')
      .select('id, role, permissions')
      .eq('app_id', app_id)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const canManage = access.role === 'owner' || access.role === 'admin' ||
      (access.permissions as any)?.can_manage_projects

    if (!canManage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create project
    const { data: project, error } = await supabase
      .from('partner_projects')
      .insert({
        app_id,
        name,
        slug,
        description,
        themes: themes || [],
        story_types: story_types || [],
        ...config
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Project with this name already exists' }, { status: 409 })
      }
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
