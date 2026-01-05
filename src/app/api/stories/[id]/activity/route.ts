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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get activity from multiple sources and combine

    // 1. Version history
    const { data: versionActivity } = await supabase
      .from('story_versions')
      .select(`
        id,
        version_number,
        created_at,
        change_summary,
        created_by:storytellers!created_by (id, full_name, avatar_url)
      `)
      .eq('story_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 2. Collaboration changes
    const { data: collaborationActivity } = await supabase
      .from('story_collaborators')
      .select(`
        id,
        invited_at,
        accepted_at,
        status,
        role,
        collaborator:storytellers!collaborator_id (id, full_name, avatar_url),
        invited_by:storytellers!invited_by (id, full_name, avatar_url)
      `)
      .eq('story_id', id)
      .order('invited_at', { ascending: false })
      .limit(limit)

    // Transform into unified activity format
    const activities: any[] = []

    // Add version activities
    if (versionActivity) {
      versionActivity.forEach(v => {
        activities.push({
          id: `version-${v.id}`,
          type: 'version',
          user: v.created_by,
          description: v.change_summary || `Created Version ${v.version_number}`,
          metadata: { version_number: v.version_number },
          created_at: v.created_at
        })
      })
    }

    // Add collaboration activities
    if (collaborationActivity) {
      collaborationActivity.forEach(c => {
        // Invitation activity
        activities.push({
          id: `collab-invite-${c.id}`,
          type: 'collaborator_added',
          user: c.invited_by,
          description: `Invited ${c.collaborator.full_name} as ${c.role}`,
          metadata: { role: c.role },
          created_at: c.invited_at
        })

        // Acceptance activity
        if (c.accepted_at) {
          activities.push({
            id: `collab-accept-${c.id}`,
            type: 'collaborator_accepted',
            user: c.collaborator,
            description: `Accepted invitation to collaborate`,
            created_at: c.accepted_at
          })
        }
      })
    }

    // Sort by created_at descending
    activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Limit results
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({ activities: limitedActivities })
  } catch (error) {
    console.error('Error in GET /api/stories/[id]/activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
