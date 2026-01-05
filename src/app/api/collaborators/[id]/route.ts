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

    const { data: collaborator, error: fetchError } = await supabase
      .from('story_collaborators')
      .select(`
        *,
        collaborator:storytellers!collaborator_id (
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !collaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ collaborator })
  } catch (error) {
    console.error('Error in GET /api/collaborators/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Get collaboration and verify ownership of story
    const { data: collaboration } = await supabase
      .from('story_collaborators')
      .select('story_id')
      .eq('id', id)
      .single()

    if (!collaboration) {
      return NextResponse.json(
        { error: 'Collaboration not found' },
        { status: 404 }
      )
    }

    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('id', collaboration.story_id)
      .single()

    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (story?.storyteller_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied - only owner can update permissions' },
        { status: 403 }
      )
    }

    // Update collaboration
    const { data: updated, error: updateError } = await supabase
      .from('story_collaborators')
      .update({
        role: body.role,
        can_edit: body.can_edit,
        can_publish: body.can_publish,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating collaboration:', updateError)
      return NextResponse.json(
        { error: 'Failed to update permissions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ collaboration: updated })
  } catch (error) {
    console.error('Error in PATCH /api/collaborators/[id]:', error)
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
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get collaboration and verify ownership
    const { data: collaboration } = await supabase
      .from('story_collaborators')
      .select('story_id')
      .eq('id', id)
      .single()

    if (!collaboration) {
      return NextResponse.json(
        { error: 'Collaboration not found' },
        { status: 404 }
      )
    }

    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('id', collaboration.story_id)
      .single()

    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (story?.storyteller_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied - only owner can remove collaborators' },
        { status: 403 }
      )
    }

    // Delete collaboration
    const { error: deleteError } = await supabase
      .from('story_collaborators')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting collaboration:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove collaborator' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/collaborators/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
