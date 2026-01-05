import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/timeline
 * Get project timeline analytics (events by date)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const viewMode = searchParams.get('view_mode') || 'month' // 'month' | 'quarter' | 'year'
    const currentDate = searchParams.get('current_date') || new Date().toISOString()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date range based on view mode
    const date = new Date(currentDate)
    let startDate: Date
    let endDate: Date

    if (viewMode === 'month') {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    } else if (viewMode === 'quarter') {
      const quarter = Math.floor(date.getMonth() / 3)
      startDate = new Date(date.getFullYear(), quarter * 3, 1)
      endDate = new Date(date.getFullYear(), (quarter + 1) * 3, 0)
    } else {
      // year
      startDate = new Date(date.getFullYear(), 0, 1)
      endDate = new Date(date.getFullYear(), 11, 31)
    }

    // Collect events from different sources
    const events: any[] = []

    // Stories created
    let storiesQuery = supabase
      .from('stories')
      .select('id, title, created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (organizationId) {
      storiesQuery = storiesQuery.eq('tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      storiesQuery = storiesQuery.eq('project_id', projectId)
    }

    const { data: stories } = await storiesQuery
    stories?.forEach(story => {
      events.push({
        type: 'story_created',
        date: story.created_at,
        title: `New story: ${story.title}`,
        description: story.title,
        status: story.status,
        id: story.id
      })
    })

    // Reviews submitted
    let reviewsQuery = supabase
      .from('story_reviews')
      .select('id, decision, reviewed_at, stories!inner(id, title, tenant_id, project_id)')
      .gte('reviewed_at', startDate.toISOString())
      .lte('reviewed_at', endDate.toISOString())

    if (organizationId) {
      reviewsQuery = reviewsQuery.eq('stories.tenant_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      reviewsQuery = reviewsQuery.eq('stories.project_id', projectId)
    }

    const { data: reviews } = await reviewsQuery
    reviews?.forEach(review => {
      events.push({
        type: 'review_submitted',
        date: review.reviewed_at,
        title: `Story reviewed: ${review.decision}`,
        description: review.stories?.title || 'Unknown story',
        decision: review.decision,
        id: review.id
      })
    })

    // Consents granted
    let consentsQuery = supabase
      .from('consents')
      .select('id, consent_type, granted_at, content_title')
      .gte('granted_at', startDate.toISOString())
      .lte('granted_at', endDate.toISOString())

    if (organizationId) {
      consentsQuery = consentsQuery.eq('organization_id', organizationId)
    }

    const { data: consents } = await consentsQuery
    consents?.forEach(consent => {
      events.push({
        type: 'consent_granted',
        date: consent.granted_at,
        title: `Consent granted: ${consent.consent_type}`,
        description: consent.content_title || 'Consent granted',
        consent_type: consent.consent_type,
        id: consent.id
      })
    })

    // Invitations sent
    let invitationsQuery = supabase
      .from('invitations')
      .select('id, channel, sent_at, recipient_name')
      .gte('sent_at', startDate.toISOString())
      .lte('sent_at', endDate.toISOString())

    if (organizationId) {
      invitationsQuery = invitationsQuery.eq('organization_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      invitationsQuery = invitationsQuery.eq('project_id', projectId)
    }

    const { data: invitations } = await invitationsQuery
    invitations?.forEach(invitation => {
      events.push({
        type: 'invitation_sent',
        date: invitation.sent_at,
        title: `Invitation sent via ${invitation.channel}`,
        description: invitation.recipient_name || 'Invitation sent',
        channel: invitation.channel,
        id: invitation.id
      })
    })

    // Campaigns created/updated
    let campaignsQuery = supabase
      .from('campaigns')
      .select('id, name, status, start_date, end_date, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (organizationId) {
      campaignsQuery = campaignsQuery.eq('organization_id', organizationId)
    }

    if (projectId && projectId !== 'all') {
      campaignsQuery = campaignsQuery.eq('project_id', projectId)
    }

    const { data: campaigns } = await campaignsQuery
    campaigns?.forEach(campaign => {
      events.push({
        type: 'campaign_created',
        date: campaign.created_at,
        title: `Campaign created: ${campaign.name}`,
        description: campaign.name,
        status: campaign.status,
        id: campaign.id
      })
    })

    // Sort events by date
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Group events by date for visualization
    const eventsByDate: Record<string, any[]> = {}
    events.forEach(event => {
      const dateKey = new Date(event.date).toISOString().split('T')[0]
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = []
      }
      eventsByDate[dateKey].push(event)
    })

    // Calculate stats
    const stats = {
      total_events: events.length,
      by_type: {
        stories: events.filter(e => e.type === 'story_created').length,
        reviews: events.filter(e => e.type === 'review_submitted').length,
        consents: events.filter(e => e.type === 'consent_granted').length,
        invitations: events.filter(e => e.type === 'invitation_sent').length,
        campaigns: events.filter(e => e.type === 'campaign_created').length,
      },
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    }

    return NextResponse.json({
      events,
      events_by_date: eventsByDate,
      stats,
      view_mode: viewMode
    })
  } catch (error) {
    console.error('Error in analytics timeline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
