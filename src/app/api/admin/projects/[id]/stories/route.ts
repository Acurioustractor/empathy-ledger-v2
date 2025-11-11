// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Getting stories for project:', projectId)

    // Get project details first to verify access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Project not found:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all stories associated with this project
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        excerpt,
        storyteller_id,
        story_type,
        is_featured,
        cultural_sensitivity_level,
        status,
        created_at,
        updated_at,
        profiles!stories_storyteller_id_fkey (
          id,
          display_name,
          full_name,
          is_elder
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    // Transform data for frontend
    const transformedStories = (stories || []).map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      excerpt: story.excerpt,
      storytellerId: story.storyteller_id,
      author: story.profiles ? {
        id: story.profiles.id,
        name: story.profiles.display_name || story.profiles.full_name,
        isElder: story.profiles.is_elder
      } : null,
      type: story.story_type,
      isFeatured: story.is_featured,
      culturalSensitivity: story.cultural_sensitivity_level,
      status: story.status,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
      wordCount: story.content ? story.content.split(' ').length : 0
    }))

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        tenantId: project.tenant_id,
        organizationId: project.organization_id
      },
      stories: transformedStories,
      total: transformedStories.length,
      stats: {
        totalStories: transformedStories.length,
        published: transformedStories.filter(s => s.status === 'published').length,
        draft: transformedStories.filter(s => s.status === 'draft').length,
        elderApproved: transformedStories.filter(s => s.elderApproved).length,
        pendingApproval: transformedStories.filter(s => s.requiresElderApproval && !s.elderApproved).length,
        totalWords: transformedStories.reduce((sum, s) => sum + s.wordCount, 0)
      }
    })

  } catch (error) {
    console.error('Project stories API error:', error)
    return NextResponse.json({ error: 'Failed to fetch project stories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Creating story for project:', projectId)

    // Get project details and verify access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const storyData = await request.json()
    console.log('Received story data:', storyData)

    if (!storyData.title) {
      return NextResponse.json({ error: 'Story title is required' }, { status: 400 })
    }

    // Create story linked to project
    const { data: newStory, error: storyError } = await supabase
      .from('stories')
      .insert([{
        title: storyData.title,
        content: storyData.content || '',
        summary: storyData.summary || '',
        author_id: storyData.authorId || null,
        storyteller_id: storyData.storytellerId || storyData.authorId,
        project_id: projectId, // Link to project
        tenant_id: project.tenant_id,
        story_category: storyData.category || 'personal',
        story_type: storyData.type || 'written',
        privacy_level: storyData.privacy || 'organisation',
        is_public: storyData.isPublic || false,
        cultural_sensitivity_level: storyData.culturalSensitivity || 'standard',
        requires_elder_approval: storyData.requiresElderApproval || false,
        status: storyData.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        id,
        title,
        content,
        summary,
        author_id,
        storyteller_id,
        story_category,
        story_type,
        privacy_level,
        status,
        created_at
      `)
      .single()

    if (storyError) {
      console.error('Error creating story:', storyError)
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Story created successfully',
      story: {
        id: newStory.id,
        title: newStory.title,
        content: newStory.content,
        summary: newStory.summary,
        authorId: newStory.author_id,
        storytellerId: newStory.storyteller_id,
        category: newStory.story_category,
        type: newStory.story_type,
        privacy: newStory.privacy_level,
        status: newStory.status,
        createdAt: newStory.created_at
      }
    })

  } catch (error) {
    console.error('Create project story error:', error)
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    const { storyId, ...updateData } = await request.json()

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    // Verify story belongs to this project
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('id, project_id')
      .eq('id', storyId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existingStory) {
      return NextResponse.json({ error: 'Story not found in this project' }, { status: 404 })
    }

    // Update story
    const { data: updatedStory, error: updateError } = await supabase
      .from('stories')
      .update({
        title: updateData.title,
        content: updateData.content,
        summary: updateData.summary,
        story_category: updateData.category,
        story_type: updateData.type,
        privacy_level: updateData.privacy,
        is_public: updateData.isPublic,
        cultural_sensitivity_level: updateData.culturalSensitivity,
        requires_elder_approval: updateData.requiresElderApproval,
        status: updateData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating story:', updateError)
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Story updated successfully',
      story: updatedStory
    })

  } catch (error) {
    console.error('Update project story error:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    // Verify story belongs to this project
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('id, project_id')
      .eq('id', storyId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existingStory) {
      return NextResponse.json({ error: 'Story not found in this project' }, { status: 404 })
    }

    // Delete story
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)

    if (deleteError) {
      console.error('Error deleting story:', deleteError)
      return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Story deleted successfully' })

  } catch (error) {
    console.error('Delete project story error:', error)
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 })
  }
}