import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Getting storytellers for project:', projectId)

    // Get project details first to get the tenant_id
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Project not found:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all storytellers (profiles) in the same tenant as this project
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
        is_elder,
        tenant_id
      `)
      .eq('tenant_id', project.tenant_id)
      .eq('is_storyteller', true)

    if (profilesError) {
      console.error('Error fetching storytellers:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch storytellers' }, { status: 500 })
    }

    // Try project_storytellers table first, fall back to project_participants
    let participants = null
    let participantsError = null

    const { data: projectStorytellers, error: projectStorytellersError } = await supabase
      .from('project_storytellers')
      .select('storyteller_id, role, created_at')
      .eq('project_id', projectId)

    if (!projectStorytellersError && projectStorytellers) {
      participants = projectStorytellers.map(ps => ({
        storyteller_id: ps.storyteller_id,
        role: ps.role,
        joined_at: ps.created_at
      }))
    } else {
      // Fall back to project_participants if project_storytellers doesn't work
      const result = await supabase
        .from('project_participants')
        .select('storyteller_id, role, joined_at')
        .eq('project_id', projectId)

      participants = result.data
      participantsError = result.error
    }

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      // Continue without participants data
    }

    // Get stories that belong to this project's storytellers to see who has content
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, author_id, title, tenant_id')
      .eq('tenant_id', project.tenant_id)

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
    }

    // Create a map of participants for quick lookup
    const participantMap = new Map(
      (participants || []).map(p => [p.storyteller_id, p])
    )

    // Transform data for frontend
    const storytellers = (profiles || []).map(profile => {
      const profileStories = stories?.filter(s => s.author_id === profile.id) || []
      const participant = participantMap.get(profile.id)
      
      return {
        id: profile.id,
        display_name: profile.display_name || profile.full_name || 'Unknown',
        name: profile.display_name || profile.full_name || 'Unknown', // Keep for backward compatibility
        bio: profile.bio || '',
        avatar: profile.profile_image_url,
        avatar_url: profile.profile_image_url, // Add for card compatibility
        culturalBackground: profile.cultural_background,
        isElder: profile.is_elder || false,
        elder_status: profile.is_elder || false, // Add for card compatibility
        featured: false, // Default to false
        status: 'active', // Default status
        storyCount: profileStories.length,
        story_count: profileStories.length, // Add for card compatibility
        isAssigned: Boolean(participant),
        role: participant?.role || (profile.is_elder ? 'Elder' : 'Storyteller'),
        joinedAt: participant?.joined_at,
        last_active: participant?.joined_at
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
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    const body = await request.json()
    
    console.log('Adding storyteller to project:', { projectId, storytellerId: body.storytellerId })

    // For now, we'll use a simple approach: update the profile to indicate they're part of this project
    // In the future, we could create a proper junction table
    
    if (!body.storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    // Get the project to verify it exists and get tenant info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify the storyteller exists and is in the same tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, tenant_id')
      .eq('id', body.storytellerId)
      .eq('tenant_id', project.tenant_id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Storyteller not found or not in same organisation' }, { status: 404 })
    }

    // Create the project participant record
    const { data: participant, error: insertError } = await supabase
      .from('project_participants')
      .insert({
        project_id: projectId,
        storyteller_id: body.storytellerId,
        role: 'participant'
      })
      .select()
      .single()

    if (insertError) {
      // Handle duplicate key error (storyteller already assigned)
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
    
    return NextResponse.json({
      message: 'Storyteller added to project successfully',
      project: {
        id: project.id,
        name: project.name
      },
      storyteller: {
        id: profile.id,
        name: profile.display_name
      },
      participant
    })

  } catch (error) {
    console.error('Add storyteller to project error:', error)
    return NextResponse.json({ error: 'Failed to add storyteller to project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storytellerId')
    
    console.log('Removing storyteller from project:', { projectId, storytellerId })

    if (!storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    // Remove the participant record
    const { error: deleteError } = await supabase
      .from('project_participants')
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