// Project Context API - CRUD operations
// Manages project-specific context: purpose, outcomes, success criteria

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/projects/[id]/context
 * Retrieve project context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Development mode bypass - skip all auth checks
    const isDevelopment = process.env.NODE_ENV === 'development'
    const devBypass = isDevelopment && process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL

    let membership: any = null

    if (!devBypass) {
      // Production: require authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get project to check organization membership
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('organization_id')
        .eq('id', projectId)
        .single()

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      // Verify user is member of organization
      const { data: userMembership, error: memberError } = await supabase
        .from('profile_organizations')
        .select('role')
        .eq('profile_id', user.id)
        .eq('organization_id', project.organization_id)
        .eq('is_active', true)
        .single()

      if (memberError || !userMembership) {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
      }

      membership = userMembership
    } else {
      // Development: bypass auth, assume admin role
      console.log('🔓 DEV MODE: Bypassing auth checks for project context API')
      membership = { role: 'admin' }
    }

    // Get project (needed regardless of auth mode)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get project context
    const { data: context, error: contextError } = await supabase
      .from('project_contexts')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (contextError) {
      // If not found, return null (not an error - many projects won't have context yet)
      if (contextError.code === 'PGRST116') {
        return NextResponse.json({
          exists: false,
          context: null
        })
      }

      console.error('Error fetching project context:', contextError)
      return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 })
    }

    // Also fetch organization context if project inherits from it
    let organizationContext = null
    if (context.inherits_from_org) {
      const { data: orgContext } = await supabase
        .from('organization_contexts')
        .select('mission, vision, values, cultural_frameworks, impact_philosophy')
        .eq('organization_id', project.organization_id)
        .single()

      organizationContext = orgContext
    }

    return NextResponse.json({
      exists: true,
      context,
      organizationContext,
      canEdit: ['admin', 'project_manager'].includes(membership.role)
    })

  } catch (error) {
    console.error('Error in GET /api/projects/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/projects/[id]/context
 * Create new project context
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project to check organization membership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user is admin or project manager
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', project.organization_id)
      .eq('is_active', true)
      .single()

    if (memberError || !membership || !['admin', 'project_manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Must be admin or project manager' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      purpose,
      context,
      target_population,
      expected_outcomes,
      success_criteria,
      timeframe,
      program_model,
      cultural_approaches,
      key_activities,
      seed_interview_text,
      existing_documents,
      context_type,
      ai_extracted,
      extraction_quality_score,
      ai_model_used,
      inherits_from_org,
      custom_fields
    } = body

    // Validate required fields
    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 })
    }

    // Create context
    const { data: projectContext, error: createError } = await supabase
      .from('project_contexts')
      .insert({
        project_id: projectId,
        organization_id: project.organization_id,
        purpose,
        context,
        target_population,
        expected_outcomes,
        success_criteria,
        timeframe,
        program_model,
        cultural_approaches,
        key_activities,
        seed_interview_text,
        existing_documents,
        context_type: context_type || 'manual',
        ai_extracted: ai_extracted || false,
        extraction_quality_score,
        ai_model_used,
        inherits_from_org: inherits_from_org !== undefined ? inherits_from_org : true,
        custom_fields,
        created_by: user.id,
        last_updated_by: user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating project context:', createError)
      return NextResponse.json({
        error: 'Failed to create context',
        details: createError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      context: projectContext
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/projects/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/projects/[id]/context
 * Update existing project context
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project to check organization membership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user is admin or project manager
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', project.organization_id)
      .eq('is_active', true)
      .single()

    if (memberError || !membership || !['admin', 'project_manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Must be admin or project manager' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    // Build update object (only include provided fields)
    const updates: any = {
      last_updated_by: user.id
    }

    // Add all optional fields if provided
    const fields = [
      'purpose', 'context', 'target_population', 'expected_outcomes',
      'success_criteria', 'timeframe', 'program_model', 'cultural_approaches',
      'key_activities', 'seed_interview_text', 'existing_documents',
      'context_type', 'ai_extracted', 'extraction_quality_score',
      'ai_model_used', 'inherits_from_org', 'custom_fields'
    ]

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    // Update context
    const { data: projectContext, error: updateError } = await supabase
      .from('project_contexts')
      .update(updates)
      .eq('project_id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project context:', updateError)
      return NextResponse.json({
        error: 'Failed to update context',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      context: projectContext
    })

  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/projects/[id]/context
 * Delete project context
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project to check organization membership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user is admin
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', project.organization_id)
      .eq('is_active', true)
      .single()

    if (memberError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Must be admin to delete context' }, { status: 403 })
    }

    // Delete context
    const { error: deleteError } = await supabase
      .from('project_contexts')
      .delete()
      .eq('project_id', projectId)

    if (deleteError) {
      console.error('Error deleting project context:', deleteError)
      return NextResponse.json({
        error: 'Failed to delete context',
        details: deleteError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Context deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
