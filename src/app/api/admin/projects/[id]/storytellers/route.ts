// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id: projectId } = await params

    console.log('Getting storytellers for project:', projectId)

    // Get project details first
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Project not found:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all storytellers from storytellers table first
    const { data: storytellersList, error: storytellersError } = await supabase
      .from('storytellers')
      .select(`
        id,
        display_name,
        bio,
        avatar_url,
        cultural_background,
        is_active,
        is_elder,
        is_featured,
        location,
        email
      `)
      .eq('is_active', true)

    let allStorytellers = storytellersList || []

    // If no storytellers in storytellers table, fall back to profiles
    if (allStorytellers.length === 0) {
      console.log('🔄 No storytellers found, falling back to profiles table')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          full_name,
          bio,
          profile_image_url,
          cultural_background,
          is_storyteller,
          is_elder
        `)
        .eq('is_storyteller', true)

      if (!profilesError && profiles) {
        allStorytellers = profiles.map(p => ({
          id: p.id,
          display_name: p.display_name || p.full_name,
          bio: p.bio,
          avatar_url: p.profile_image_url,
          cultural_background: p.cultural_background,
          is_active: true,
          is_elder: p.is_elder,
          is_featured: false,
          location: null,
          email: null
        }))
      }
    }

    // Get project_storytellers assignments
    const { data: projectStorytellers, error: psError } = await supabase
      .from('project_storytellers')
      .select('storyteller_id, role, status, created_at')
      .eq('project_id', projectId)

    if (psError) {
      console.error('Error fetching project_storytellers:', psError)
    }

    // Create a map of participants for quick lookup
    const participantMap = new Map(
      (projectStorytellers || []).map(p => [p.storyteller_id, p])
    )

    // Get story counts for each storyteller
    const storytellerIds = allStorytellers.map(s => s.id)
    const { data: storyCounts } = await supabase
      .from('stories')
      .select('storyteller_id')
      .in('storyteller_id', storytellerIds)

    const storyCountMap: Record<string, number> = {}
    if (storyCounts) {
      storyCounts.forEach(s => {
        storyCountMap[s.storyteller_id] = (storyCountMap[s.storyteller_id] || 0) + 1
      })
    }

    // Transform data for frontend
    const storytellers = allStorytellers.map(storyteller => {
      const participant = participantMap.get(storyteller.id)

      return {
        id: storyteller.id,
        display_name: storyteller.display_name || 'Unknown',
        name: storyteller.display_name || 'Unknown',
        bio: storyteller.bio || '',
        avatar: storyteller.avatar_url,
        avatar_url: storyteller.avatar_url,
        culturalBackground: storyteller.cultural_background,
        isElder: storyteller.is_elder || false,
        elder_status: storyteller.is_elder || false,
        featured: storyteller.is_featured || false,
        status: storyteller.is_active ? 'active' : 'inactive',
        storyCount: storyCountMap[storyteller.id] || 0,
        story_count: storyCountMap[storyteller.id] || 0,
        isAssigned: Boolean(participant),
        role: participant?.role || (storyteller.is_elder ? 'Elder' : 'Storyteller'),
        joinedAt: participant?.created_at,
        last_active: participant?.created_at,
        location: storyteller.location,
        email: storyteller.email
      }
    })

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        tenantId: project.tenant_id,
        organizationId: project.organization_id
      },
      storytellers,
      total: storytellers.length
    })

  } catch (error) {
    console.error('Project storytellers API error:', error)
    return NextResponse.json({ error: 'Failed to fetch project storytellers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id: projectId } = await params
    const body = await request.json()

    console.log('Adding storyteller to project:', { projectId, storytellerId: body.storytellerId })

    if (!body.storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    // Get the project to verify it exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify the storyteller exists - try storytellers table first
    let storytellerName = null
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, display_name')
      .eq('id', body.storytellerId)
      .single()

    if (storyteller && !storytellerError) {
      storytellerName = storyteller.display_name
    } else {
      // Fall back to profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', body.storytellerId)
        .single()

      if (profileError) {
        return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 })
      }
      storytellerName = profile.display_name
    }

    // Create the project storyteller record
    const { data: participant, error: insertError } = await supabase
      .from('project_storytellers')
      .insert({
        project_id: projectId,
        storyteller_id: body.storytellerId,
        role: 'participant',
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({
          error: 'Storyteller is already assigned to this project'
        }, { status: 409 })
      }

      console.error('Error creating participant record:', insertError)
      return NextResponse.json({
        error: 'Failed to assign storyteller to project'
      }, { status: 500 })
    }

    // Link all transcripts from this storyteller to this project
    const { data: allTranscripts } = await supabase
      .from('transcripts')
      .select('id, project_id')
      .eq('storyteller_id', body.storytellerId)

    let linkedCount = 0
    let updatedCount = 0

    if (allTranscripts && allTranscripts.length > 0) {
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({ project_id: projectId })
        .eq('storyteller_id', body.storytellerId)

      if (!updateError) {
        linkedCount = allTranscripts.length
        updatedCount = allTranscripts.filter(t => t.project_id !== projectId).length
        console.log(`Linked ${linkedCount} transcripts to project ${projectId}`)
      }
    }

    return NextResponse.json({
      message: 'Storyteller added to project successfully',
      project: {
        id: project.id,
        name: project.name
      },
      storyteller: {
        id: body.storytellerId,
        name: storytellerName
      },
      participant,
      linkedTranscripts: linkedCount,
      updatedTranscripts: updatedCount
    })

  } catch (error) {
    console.error('Add storyteller to project error:', error)
    return NextResponse.json({ error: 'Failed to add storyteller to project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storytellerId')

    console.log('Removing storyteller from project:', { projectId, storytellerId })

    if (!storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('project_storytellers')
      .delete()
      .eq('project_id', projectId)
      .eq('storyteller_id', storytellerId)

    if (deleteError) {
      console.error('Error removing participant record:', deleteError)
      return NextResponse.json({
        error: 'Failed to remove storyteller from project'
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Storyteller removed from project successfully'
    })

  } catch (error) {
    console.error('Remove storyteller from project error:', error)
    return NextResponse.json({ error: 'Failed to remove storyteller from project' }, { status: 500 })
  }
}
