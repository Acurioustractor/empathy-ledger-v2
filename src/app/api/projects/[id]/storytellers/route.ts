import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


// GET /api/projects/[id]/storytellers - Get all storytellers for a project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    console.log('🎯 API: Getting storytellers for project:', projectId)

    // Get storytellers who have transcripts in this project
    const { data: transcriptsWithStorytellers, error } = await supabase
      .from('transcripts')
      .select(`
        storyteller_id,
        created_at,
        profiles:storyteller_id(
          id,
          display_name,
          full_name,
          bio,
          profile_image_url,
          avatar_media_id,
          cultural_background,
          is_elder,
          is_featured
        )
      `)
      .eq('project_id', projectId)
      .not('storyteller_id', 'is', null)
      .order('created_at', { ascending: false })

    // Remove duplicates - same storyteller might have multiple transcripts
    const uniqueStorytellers = []
    const seenIds = new Set()

    for (const transcript of transcriptsWithStorytellers || []) {
      if (transcript.storyteller_id && !seenIds.has(transcript.storyteller_id)) {
        seenIds.add(transcript.storyteller_id)
        uniqueStorytellers.push({
          id: transcript.storyteller_id,
          profiles: transcript.profiles,
          created_at: transcript.created_at,
          role: 'storyteller' // Default role since they have transcripts
        })
      }
    }

    console.log('📊 API: Found transcripts with storytellers:', transcriptsWithStorytellers?.length || 0)
    console.log('👥 API: Unique storytellers:', uniqueStorytellers.length)

    if (error) {
      console.error('Error fetching project storytellers:', error)
      return NextResponse.json({ error: 'Failed to fetch storytellers' }, { status: 500 })
    }

    const avatarMediaIds = Array.from(new Set(uniqueStorytellers
      .map(ps => ps.profiles?.avatar_media_id)
      .filter(Boolean)))

    let avatarUrlMap: Record<string, string> = {}

    if (avatarMediaIds.length > 0) {
      const serviceSupabase = createSupabaseServiceClient()
      const { data: mediaAssets } = await serviceSupabase
        .from('media_assets')
        .select('id, cdn_url')
        .in('id', avatarMediaIds as string[])

      avatarUrlMap = Object.fromEntries((mediaAssets || []).map(asset => [asset.id, asset.cdn_url]))
    }

    return NextResponse.json({
      storytellers: uniqueStorytellers.map(ps => ({
        id: ps.profiles?.id,
        displayName: ps.profiles?.display_name || ps.profiles?.full_name,
        bio: ps.profiles?.bio,
        profileImageUrl: ps.profiles?.profile_image_url || (ps.profiles?.avatar_media_id ? avatarUrlMap[ps.profiles.avatar_media_id] || null : null),
        culturalBackground: ps.profiles?.cultural_background,
        isElder: ps.profiles?.is_elder || false,
        isFeatured: ps.profiles?.is_featured || false,
        role: ps.role,
        status: 'active',
        joinedAt: ps.created_at,
        linkId: ps.id
      }))
    })

  } catch (error) {
    console.error('Project storytellers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects/[id]/storytellers - Add storyteller to project
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const { storyteller_id, role = 'participant' } = await request.json()
    
    if (!storyteller_id) {
      return NextResponse.json({ error: 'Storyteller ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Check if project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if storyteller exists
    const { data: storyteller } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .eq('id', storyteller_id)
      .single()

    if (!storyteller) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 })
    }

    // Add the relationship
    const { data: link, error } = await supabase
      .from('project_participants')
      .insert({
        project_id: projectId,
        profile_id: storyteller_id,
        role
      })
      .select(`
        id,
        role,
        created_at,
        profiles:profile_id(
          id,
          display_name,
          full_name,
          profile_image_url,
          avatar_media_id
        )
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Storyteller already linked to this project' }, { status: 409 })
      }
      console.error('Error linking storyteller:', error)
      return NextResponse.json({ error: 'Failed to link storyteller' }, { status: 500 })
    }

    let profileImageUrl = link.profiles?.profile_image_url || null

    if (!profileImageUrl && link.profiles?.avatar_media_id) {
      const serviceSupabase = createSupabaseServiceClient()
      const { data: mediaAsset } = await serviceSupabase
        .from('media_assets')
        .select('cdn_url')
        .eq('id', link.profiles.avatar_media_id)
        .maybeSingle()

      if (mediaAsset?.cdn_url) {
        profileImageUrl = mediaAsset.cdn_url
      }
    }

    return NextResponse.json({
      message: `${storyteller.display_name || storyteller.full_name} linked to ${project.name} as ${role}`,
      link: {
        id: link.profiles?.id,
        displayName: link.profiles?.display_name || link.profiles?.full_name,
        profileImageUrl,
        role: link.role,
        status: 'active',
        joinedAt: link.created_at,
        linkId: link.id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Link storyteller error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/projects/[id]/storytellers - Update storyteller role/status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const { link_id, role, status } = await request.json()
    
    if (!link_id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const updateData: any = { updated_at: new Date().toISOString() }
    if (role) updateData.role = role
    if (status) updateData.status = status

    const { data: link, error } = await supabase
      .from('project_participants')
      .update(updateData)
      .eq('id', link_id)
      .eq('project_id', projectId) // Extra safety check
      .select(`
        id,
        role,
        profiles:profile_id(display_name, full_name)
      `)
      .single()

    if (error) {
      console.error('Error updating storyteller link:', error)
      return NextResponse.json({ error: 'Failed to update storyteller link' }, { status: 500 })
    }

    return NextResponse.json({
      message: `${link.profiles?.display_name || link.profiles?.full_name} updated successfully`,
      link
    })

  } catch (error) {
    console.error('Update storyteller link error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/storytellers?link_id=xxx - Remove storyteller from project
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('link_id')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('project_participants')
      .delete()
      .eq('id', linkId)
      .eq('project_id', projectId) // Extra safety check

    if (error) {
      console.error('Error unlinking storyteller:', error)
      return NextResponse.json({ error: 'Failed to unlink storyteller' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Storyteller unlinked successfully' })

  } catch (error) {
    console.error('Unlink storyteller error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
