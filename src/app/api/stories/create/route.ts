import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, story_type, project_id } = body

    // Get user's storyteller profile
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Storyteller profile not found' },
        { status: 404 }
      )
    }

    // Create story draft
    const { data: story, error: createError } = await supabase
      .from('stories')
      .insert({
        tenant_id: profile.tenant_id,
        storyteller_id: profile.id,
        project_id: project_id || null,
        title: title || 'Untitled Story',
        content: content || '',
        story_type: story_type || 'personal_experience',
        status: 'draft',
        is_public: false,
        allow_comments: true,
        requires_moderation: false,
        cultural_sensitivity_level: 'public'
      })
      .select('*')
      .single()

    if (createError) {
      console.error('Error creating story:', createError)
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      )
    }

    // Create initial version
    await supabase.from('story_versions').insert({
      story_id: story.id,
      version_number: 1,
      title: story.title,
      content: story.content,
      metadata: {
        story_type: story.story_type,
        cultural_sensitivity_level: story.cultural_sensitivity_level
      },
      created_by: user.id
    })

    return NextResponse.json({ story }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/stories/create:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
