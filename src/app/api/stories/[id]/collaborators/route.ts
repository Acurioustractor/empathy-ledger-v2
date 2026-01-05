import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get collaborators with full details
    const { data: collaborators, error: fetchError } = await supabase
      .from('story_collaborators')
      .select(`
        *,
        collaborator:storytellers!collaborator_id (
          id,
          full_name,
          avatar_url,
          email
        ),
        invited_by:storytellers!invited_by (
          full_name
        )
      `)
      .eq('story_id', id)
      .order('invited_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching collaborators:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch collaborators' },
        { status: 500 }
      )
    }

    return NextResponse.json({ collaborators })
  } catch (error) {
    console.error('Error in GET /api/stories/[id]/collaborators:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role, can_edit, can_publish, message } = body

    // Verify story ownership
    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('id', id)
      .single()

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (story.storyteller_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied - only owner can invite' },
        { status: 403 }
      )
    }

    // Find collaborator by email
    const { data: collaborator } = await supabase
      .from('storytellers')
      .select('id, user_id')
      .eq('email', email)
      .single()

    if (!collaborator) {
      return NextResponse.json(
        { error: 'User not found with that email' },
        { status: 404 }
      )
    }

    // Check if already a collaborator
    const { data: existing } = await supabase
      .from('story_collaborators')
      .select('id')
      .eq('story_id', id)
      .eq('collaborator_id', collaborator.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a collaborator' },
        { status: 400 }
      )
    }

    // Create collaboration
    const { data: collaboration, error: createError } = await supabase
      .from('story_collaborators')
      .insert({
        story_id: id,
        collaborator_id: collaborator.id,
        invited_by: profile.id,
        role,
        can_edit,
        can_publish,
        status: 'pending',
        invitation_message: message || null
      })
      .select('*')
      .single()

    if (createError) {
      console.error('Error creating collaboration:', createError)
      return NextResponse.json(
        { error: 'Failed to invite collaborator' },
        { status: 500 }
      )
    }

    // TODO: Send email invitation
    // await sendCollaborationInvite(collaborator.user_id, story.id, message)

    return NextResponse.json({ collaboration }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/stories/[id]/collaborators:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
