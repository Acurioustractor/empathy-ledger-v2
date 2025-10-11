// Organization Context API - CRUD operations
// Manages organization-level context: mission, vision, values, impact methodology

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/organizations/[id]/context
 * Retrieve organization context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member of organization (RLS will handle this, but explicit check is clearer)
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Get organization context
    const { data: context, error: contextError } = await supabase
      .from('organization_contexts')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (contextError) {
      // If not found, return null (not an error - many orgs won't have context yet)
      if (contextError.code === 'PGRST116') {
        return NextResponse.json({
          exists: false,
          context: null
        })
      }

      console.error('Error fetching organization context:', contextError)
      return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 })
    }

    return NextResponse.json({
      exists: true,
      context,
      canEdit: ['admin', 'project_manager'].includes(membership.role)
    })

  } catch (error) {
    console.error('Error in GET /api/organizations/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/organizations/[id]/context
 * Create new organization context
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (memberError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Must be organization admin' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      mission,
      vision,
      values,
      approach_description,
      cultural_frameworks,
      key_principles,
      impact_philosophy,
      impact_domains,
      measurement_approach,
      website,
      theory_of_change_url,
      impact_report_urls,
      seed_interview_responses,
      imported_document_text,
      context_type,
      extraction_quality_score,
      ai_model_used
    } = body

    // Validate required fields
    if (!mission) {
      return NextResponse.json({ error: 'Mission is required' }, { status: 400 })
    }

    // Create context
    const { data: context, error: createError } = await supabase
      .from('organization_contexts')
      .insert({
        organization_id: organizationId,
        mission,
        vision,
        values,
        approach_description,
        cultural_frameworks,
        key_principles,
        impact_philosophy,
        impact_domains,
        measurement_approach,
        website,
        theory_of_change_url,
        impact_report_urls,
        seed_interview_responses,
        imported_document_text,
        context_type: context_type || 'manual',
        extraction_quality_score,
        ai_model_used,
        created_by: user.id,
        last_updated_by: user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating organization context:', createError)
      return NextResponse.json({
        error: 'Failed to create context',
        details: createError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      context
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/organizations/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/organizations/[id]/context
 * Update existing organization context
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (memberError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Must be organization admin' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    // Build update object (only include provided fields)
    const updates: any = {
      last_updated_by: user.id
    }

    // Add all optional fields if provided
    const fields = [
      'mission', 'vision', 'values', 'approach_description',
      'cultural_frameworks', 'key_principles', 'impact_philosophy',
      'impact_domains', 'measurement_approach', 'website',
      'theory_of_change_url', 'impact_report_urls',
      'seed_interview_responses', 'imported_document_text',
      'context_type', 'extraction_quality_score', 'ai_model_used'
    ]

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    // Update context
    const { data: context, error: updateError } = await supabase
      .from('organization_contexts')
      .update(updates)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating organization context:', updateError)
      return NextResponse.json({
        error: 'Failed to update context',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      context
    })

  } catch (error) {
    console.error('Error in PATCH /api/organizations/[id]/context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
