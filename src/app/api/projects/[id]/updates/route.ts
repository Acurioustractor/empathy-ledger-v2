// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: projectId } = await context.params
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch project updates
    const { data: updates, error } = await supabase
      .from('project_updates')
      .select(`
        *,
        profiles:created_by (
          display_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching updates:', error)
      return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Updates API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: projectId } = await context.params
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, is_super_admin')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get project details to verify access
    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check permissions
    const canEdit = profile?.is_super_admin || 
                   user.email === 'benjamin@act.place' ||
                   profile?.tenant_id === project.tenant_id

    if (!canEdit) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Create project update
    const { data: update, error } = await supabase
      .from('project_updates')
      .insert({
        project_id: projectId,
        content: content.trim(),
        created_by: user.id
      })
      .select(`
        *,
        profiles:created_by (
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating update:', error)
      return NextResponse.json({ error: 'Failed to create update' }, { status: 500 })
    }

    return NextResponse.json({ update }, { status: 201 })
  } catch (error) {
    console.error('Create update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}