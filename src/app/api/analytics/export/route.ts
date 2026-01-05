import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/export
 * Export analytics data to CSV or PDF
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const format = searchParams.get('format') || 'csv' // 'csv' | 'pdf'
    const dateRange = searchParams.get('date_range') || '30days'
    const includeStories = searchParams.get('include_stories') === 'true'
    const includeStorytellers = searchParams.get('include_storytellers') === 'true'
    const includeThemes = searchParams.get('include_themes') === 'true'
    const includeReviews = searchParams.get('include_reviews') === 'true'
    const includeConsents = searchParams.get('include_consents') === 'true'
    const includeInvitations = searchParams.get('include_invitations') === 'true'
    const includeCampaigns = searchParams.get('include_campaigns') === 'true'

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing required parameter: organization_id' }, { status: 400 })
    }

    // Calculate date threshold
    let dateThreshold: Date | null = null
    if (dateRange !== 'all') {
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
      dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)
    }

    // Collect data based on selections
    const exportData: any = {
      organization_id: organizationId,
      exported_at: new Date().toISOString(),
      date_range: dateRange
    }

    // Stories
    if (includeStories) {
      let storiesQuery = supabase
        .from('stories')
        .select('id, title, status, created_at, storyteller_id')
        .eq('tenant_id', organizationId)

      if (dateThreshold) {
        storiesQuery = storiesQuery.gte('created_at', dateThreshold.toISOString())
      }

      const { data: stories } = await storiesQuery
      exportData.stories = stories || []
    }

    // Storytellers
    if (includeStorytellers) {
      let storytellersQuery = supabase
        .from('profiles')
        .select('id, display_name, email, created_at')
        .eq('tenant_id', organizationId)
        .eq('role', 'storyteller')

      if (dateThreshold) {
        storytellersQuery = storytellersQuery.gte('created_at', dateThreshold.toISOString())
      }

      const { data: storytellers } = await storytellersQuery
      exportData.storytellers = storytellers || []
    }

    // Themes
    if (includeThemes) {
      let themesQuery = supabase
        .from('story_themes')
        .select('theme, created_at, stories!inner(tenant_id)')
        .eq('stories.tenant_id', organizationId)

      if (dateThreshold) {
        themesQuery = themesQuery.gte('created_at', dateThreshold.toISOString())
      }

      const { data: themes } = await themesQuery
      exportData.themes = themes || []
    }

    // Reviews
    if (includeReviews) {
      let reviewsQuery = supabase
        .from('story_reviews')
        .select('decision, reviewed_at, stories!inner(tenant_id)')
        .eq('stories.tenant_id', organizationId)

      if (dateThreshold) {
        reviewsQuery = reviewsQuery.gte('reviewed_at', dateThreshold.toISOString())
      }

      const { data: reviews } = await reviewsQuery
      exportData.reviews = reviews || []
    }

    // Consents
    if (includeConsents) {
      let consentsQuery = supabase
        .from('consents')
        .select('consent_type, status, granted_at')
        .eq('organization_id', organizationId)

      if (dateThreshold) {
        consentsQuery = consentsQuery.gte('granted_at', dateThreshold.toISOString())
      }

      const { data: consents } = await consentsQuery
      exportData.consents = consents || []
    }

    // Invitations
    if (includeInvitations) {
      let invitationsQuery = supabase
        .from('invitations')
        .select('channel, status, sent_at')
        .eq('organization_id', organizationId)

      if (dateThreshold) {
        invitationsQuery = invitationsQuery.gte('sent_at', dateThreshold.toISOString())
      }

      const { data: invitations } = await invitationsQuery
      exportData.invitations = invitations || []
    }

    // Campaigns
    if (includeCampaigns) {
      let campaignsQuery = supabase
        .from('campaigns')
        .select('name, status, start_date, end_date, created_at')
        .eq('organization_id', organizationId)

      if (dateThreshold) {
        campaignsQuery = campaignsQuery.gte('created_at', dateThreshold.toISOString())
      }

      const { data: campaigns } = await campaignsQuery
      exportData.campaigns = campaigns || []
    }

    // Generate CSV export
    if (format === 'csv') {
      const sections: string[] = []

      // Summary
      sections.push('ANALYTICS EXPORT SUMMARY')
      sections.push(`Organization ID,${organizationId}`)
      sections.push(`Date Range,${dateRange}`)
      sections.push(`Exported At,${exportData.exported_at}`)
      sections.push('')

      // Stories section
      if (includeStories && exportData.stories.length > 0) {
        sections.push('STORIES')
        sections.push('ID,Title,Status,Created At,Storyteller ID')
        exportData.stories.forEach((s: any) => {
          sections.push(`"${s.id}","${s.title || ''}","${s.status}","${s.created_at}","${s.storyteller_id || ''}"`)
        })
        sections.push('')
      }

      // Storytellers section
      if (includeStorytellers && exportData.storytellers.length > 0) {
        sections.push('STORYTELLERS')
        sections.push('ID,Display Name,Email,Created At')
        exportData.storytellers.forEach((st: any) => {
          sections.push(`"${st.id}","${st.display_name || ''}","${st.email || ''}","${st.created_at}"`)
        })
        sections.push('')
      }

      // Themes section
      if (includeThemes && exportData.themes.length > 0) {
        sections.push('THEMES')
        sections.push('Theme,Created At')
        exportData.themes.forEach((t: any) => {
          sections.push(`"${t.theme}","${t.created_at}"`)
        })
        sections.push('')
      }

      // Reviews section
      if (includeReviews && exportData.reviews.length > 0) {
        sections.push('REVIEWS')
        sections.push('Decision,Reviewed At')
        exportData.reviews.forEach((r: any) => {
          sections.push(`"${r.decision}","${r.reviewed_at}"`)
        })
        sections.push('')
      }

      // Consents section
      if (includeConsents && exportData.consents.length > 0) {
        sections.push('CONSENTS')
        sections.push('Type,Status,Granted At')
        exportData.consents.forEach((c: any) => {
          sections.push(`"${c.consent_type}","${c.status}","${c.granted_at}"`)
        })
        sections.push('')
      }

      // Invitations section
      if (includeInvitations && exportData.invitations.length > 0) {
        sections.push('INVITATIONS')
        sections.push('Channel,Status,Sent At')
        exportData.invitations.forEach((i: any) => {
          sections.push(`"${i.channel}","${i.status}","${i.sent_at}"`)
        })
        sections.push('')
      }

      // Campaigns section
      if (includeCampaigns && exportData.campaigns.length > 0) {
        sections.push('CAMPAIGNS')
        sections.push('Name,Status,Start Date,End Date,Created At')
        exportData.campaigns.forEach((c: any) => {
          sections.push(`"${c.name}","${c.status}","${c.start_date || ''}","${c.end_date || ''}","${c.created_at}"`)
        })
        sections.push('')
      }

      const csv = sections.join('\n')

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.csv"`
        }
      })
    }

    // PDF export (TODO: Implement PDF generation)
    if (format === 'pdf') {
      // TODO: Use a library like pdfkit or jsPDF to generate PDF
      // For now, return JSON with a message
      return NextResponse.json({
        error: 'PDF export not yet implemented. Please use CSV format.',
        data: exportData
      }, { status: 501 })
    }

    return NextResponse.json({ error: 'Invalid format. Use csv or pdf' }, { status: 400 })
  } catch (error) {
    console.error('Error in analytics export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
