import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createSupabaseServerClient()

    // Fetch organizations from database
    const { data: organisations, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organisations:', error)
      return Response.json({ 
        organisations: [], 
        total: 0, 
        error: error.message,
        success: false 
      }, { status: 500 })
    }

    // Enhance organisations with computed properties and real database counts
    const enhancedOrganizations = await Promise.all(organisations?.map(async (org) => {
      // Compute status based on activity and data completeness
      let status = 'active'
      if (!org.website_url && !org.contact_email) status = 'inactive'
      if (org.description?.includes('Real organisation from profile')) status = 'pending'

      // Compute verification status
      let verification_status = 'verified'
      if (status === 'pending') verification_status = 'pending'
      if (!org.website_url && !org.location) verification_status = 'unverified'

      // Compute activity metrics
      const daysSinceUpdate = Math.floor((Date.now() - new Date(org.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const isRecentlyActive = daysSinceUpdate < 30

      // Get real story count from database
      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      // Get real member count from database
      const { count: memberCount } = await supabase
        .from('profile_organizations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .eq('is_active', true)

      return {
        ...org,
        status,
        verification_status,
        verified_at: verification_status === 'verified' ? org.created_at : null,
        is_recently_active: isRecentlyActive,
        days_since_update: daysSinceUpdate,
        story_count: storyCount || 0,
        member_count: memberCount || 0
      }
    }) || [])

    return Response.json({
      organisations: enhancedOrganizations,
      total: enhancedOrganizations.length,
      success: true
    })

  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      organisations: [], 
      total: 0, 
      error: 'Failed to fetch organisations',
      success: false 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')

    if (!organizationId) {
      return Response.json({
        error: 'Organization ID is required',
        success: false
      }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createSupabaseServerClient()

    // Clean up related data first to avoid foreign key constraint violations

    // Remove member associations
    await supabase
      .from('profile_organizations')
      .delete()
      .eq('organization_id', organizationId)

    // Remove projects
    await supabase
      .from('projects')
      .delete()
      .eq('organization_id', organizationId)

    // Remove stories
    await supabase
      .from('stories')
      .delete()
      .eq('organization_id', organizationId)

    // Remove media assets
    await supabase
      .from('media_assets')
      .delete()
      .eq('organization_id', organizationId)

    // Remove galleries
    await supabase
      .from('galleries')
      .delete()
      .eq('organization_id', organizationId)

    // Finally, remove the organization
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organizationId)

    if (error) {
      console.error('Error deleting organisation:', error)
      return Response.json({
        error: error.message,
        success: false
      }, { status: 500 })
    }

    return Response.json({
      message: 'Organization deleted successfully',
      success: true
    })

  } catch (error) {
    console.error('API Error:', error)
    return Response.json({
      error: 'Failed to delete organisation',
      success: false
    }, { status: 500 })
  }
}