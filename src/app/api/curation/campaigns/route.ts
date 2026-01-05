import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/curation/campaigns
 * Get all campaigns for an organization/project
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('campaigns')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        status,
        target_story_count,
        created_at,
        updated_at,
        projects(id, name)
      `)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: campaigns, error: campaignsError } = await query
      .order('created_at', { ascending: false })

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      total: campaigns?.length || 0
    })
  } catch (error) {
    console.error('Error in get campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/curation/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      organization_id,
      project_id,
      name,
      description,
      start_date,
      end_date,
      target_story_count
    } = body

    // Validate
    if (!organization_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, name' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create campaign
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        organization_id,
        project_id: project_id || null,
        name: name.trim(),
        description: description?.trim() || null,
        start_date: start_date || null,
        end_date: end_date || null,
        status: 'draft',
        target_story_count: target_story_count || null,
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating campaign:', insertError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: `Campaign "${name}" created successfully`
    })
  } catch (error) {
    console.error('Error in create campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/curation/campaigns
 * Update a campaign
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      campaign_id,
      name,
      description,
      start_date,
      end_date,
      status,
      target_story_count
    } = body

    if (!campaign_id) {
      return NextResponse.json({ error: 'Missing required field: campaign_id' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (status !== undefined) updates.status = status
    if (target_story_count !== undefined) updates.target_story_count = target_story_count

    // Update campaign
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaign_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating campaign:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully'
    })
  } catch (error) {
    console.error('Error in update campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
