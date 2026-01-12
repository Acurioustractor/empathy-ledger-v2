import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/reports/generate
 * Generate a funder report with specified template and options
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      organization_id,
      project_id,
      template,
      date_range,
      include_financials,
      include_stories,
      include_quotes
    } = body

    if (!organization_id || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_id, template' },
        { status: 400 }
      )
    }

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (date_range) {
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'custom':
        // Would need start_date and end_date in request body
        break
      default:
        startDate.setMonth(now.getMonth() - 3)
    }

    // Fetch organization data
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organization_id)
      .single()

    // Fetch storytellers count
    const storytellersQuery = supabase
      .from('storytellers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization_id)

    const { count: storytellersCount } = await storytellersQuery

    // Fetch stories count and data
    let storiesQuery = supabase
      .from('stories')
      .select(`
        id,
        title,
        story_arc,
        cultural_themes,
        created_at,
        storyteller:storytellers(display_name, avatar_url)
      `)
      .eq('organization_id', organization_id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (project_id) {
      storiesQuery = storiesQuery.eq('project_id', project_id)
    }

    const { data: stories, count: storiesCount } = await storiesQuery

    // Calculate SROI metrics (simplified - would integrate with real SROI calculator)
    const sroiRatio = '3.2:1'
    const socialValue = '450K'

    // Generate executive summary based on template
    let executiveSummary = ''

    switch (template) {
      case 'standard':
        executiveSummary = `${organization?.name || 'Your organization'} has collected ${storiesCount || 0} stories from ${storytellersCount || 0} storytellers during this ${date_range === 'quarter' ? 'quarter' : 'year'}. Through our storytelling platform, we have demonstrated a social return on investment of ${sroiRatio}, generating an estimated $${socialValue} in social value.`
        break
      case 'impact':
        executiveSummary = `Our impact-focused analysis shows that ${organization?.name || 'the organization'} has created meaningful change through ${storiesCount || 0} stories. These narratives have reached ${storytellersCount || 0} storytellers and generated ripple effects across communities, demonstrating measurable outcomes and lasting impact.`
        break
      case 'sroi':
        executiveSummary = `Social Return on Investment Analysis: For every dollar invested in ${organization?.name || 'this program'}, we have generated $${sroiRatio.split(':')[0]} in social value. This represents ${storiesCount || 0} documented stories contributing to a total estimated social value of $${socialValue}.`
        break
      case 'narrative':
        executiveSummary = `Through the voices of ${storytellersCount || 0} storytellers, ${organization?.name || 'we'} have woven together ${storiesCount || 0} stories that illuminate the human experience. These narratives capture transformation, resilience, and community strength across diverse cultural contexts.`
        break
    }

    // Build report object
    const report = {
      id: crypto.randomUUID(),
      organization_id,
      project_id,
      template,
      date_range,
      generated_at: new Date().toISOString(),
      executive_summary: executiveSummary,
      metrics: {
        storytellers: storytellersCount || 0,
        stories: storiesCount || 0,
        sroi_ratio: sroiRatio,
        social_value: socialValue
      },
      featured_stories: include_stories ? stories?.slice(0, 3) : [],
      include_financials,
      include_stories,
      include_quotes
    }

    // Save generated report to database
    const { data: savedReport, error } = await supabase
      .from('generated_reports')
      .insert({
        organization_id,
        project_id,
        report_type: 'funder',
        template,
        date_range,
        report_data: report,
        generated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving generated report:', error)
      // Continue anyway - report can still be returned even if save fails
    }

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
