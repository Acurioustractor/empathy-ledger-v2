// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔓 Using admin bypass for organisation detail')
    
    // Get specific organisation with details
    const { data: organisation, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        type,
        location,
        description,
        website_url,
        contact_email,
        cultural_significance,
        created_at
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching organisation:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organisation' },
        { status: 500 }
      )
    }

    if (!organisation) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get organisation stats
    // Get member count via profile_organizations junction table
    const { count: memberCount } = await supabase
      .from('profile_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organisation.id)

    // TODO: Get story count associated with this organisation
    // For now, set to 0 since we need proper organisation-story relationships
    const storyCount = 0

    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organisation.id)

    const organizationWithStats = {
      ...organisation,
      stats: {
        members: memberCount || 0,
        stories: storyCount || 0,
        projects: projectCount || 0
      }
    }

    return NextResponse.json({
      success: true,
      organisation: organizationWithStats
    })

  } catch (error) {
    console.error('Error in admin organisation endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔓 Using admin bypass for organisation delete')

    // Get the organisation to find its tenant_id
    const { data: org } = await serviceSupabase
      .from('organizations')
      .select('tenant_id, name')
      .eq('id', id)
      .single()

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Delete the organisation
    const { error: orgError } = await serviceSupabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (orgError) {
      console.error('Error deleting organisation:', orgError)
      return NextResponse.json(
        { error: 'Failed to delete organisation' },
        { status: 500 }
      )
    }

    // Check if this tenant is used by any other organisations
    const { count: otherOrgsCount } = await serviceSupabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', org.tenant_id)

    // If no other organisations use this tenant, delete it too
    if (otherOrgsCount === 0) {
      await serviceSupabase
        .from('organizations')
        .delete()
        .eq('id', org.tenant_id)
    }

    return NextResponse.json({
      success: true,
      message: `Organization "${org.name}" deleted successfully`
    })

  } catch (error) {
    console.error('Error in organisation deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔓 Using admin bypass for organisation update')

    // If we're fixing the tenant (giving organisation its own clean tenant)
    if (body.action === 'fix_tenant') {
      // Create a new unique tenant for this organisation
      const baseSlug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-')
      const slug = `${baseSlug}-${Date.now()}` // Add timestamp to ensure uniqueness
      const { data: newTenant, error: tenantError } = await serviceSupabase
        .from('organizations')
        .insert({
          name: body.name,
          slug: slug,
          status: 'active'
        })
        .select()
        .single()

      if (tenantError) {
        console.error('Error creating new tenant:', tenantError)
        return NextResponse.json(
          { error: 'Failed to create new tenant' },
          { status: 500 }
        )
      }

      // Update the organisation to use the new tenant
      const { error: updateError } = await serviceSupabase
        .from('organizations')
        .update({ tenant_id: newTenant.id })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating organisation tenant:', updateError)
        return NextResponse.json(
          { error: 'Failed to update organisation tenant' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Organization "${body.name}" now has its own clean tenant`,
        new_tenant_id: newTenant.id
      })
    }

    // Regular organisation update
    const { data: organisation, error } = await serviceSupabase
      .from('organizations')
      .update({
        name: body.name,
        type: body.type,
        location: body.location,
        description: body.description,
        website_url: body.website_url,
        contact_email: body.contact_email,
        cultural_significance: body.cultural_significance
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating organisation:', error)
      return NextResponse.json(
        { error: 'Failed to update organisation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      organisation
    })

  } catch (error) {
    console.error('Error in organisation update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}