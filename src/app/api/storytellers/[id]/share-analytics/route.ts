// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: storytellerId } = await params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch from the analytics view
    const { data: analytics, error: viewError } = await supabase
      .from('storyteller_share_analytics')
      .select('*')
      .eq('storyteller_id', storytellerId)
      .single()

    if (viewError) {
      console.error('Error fetching share analytics view:', viewError)
      // Return empty analytics if view doesn't exist or has no data
      return NextResponse.json({
        storytellerId,
        totalStoryShares: 0,
        sharesLast30Days: 0,
        sharesLast7Days: 0,
        platformBreakdown: {
          facebook: 0,
          twitter: 0,
          whatsapp: 0,
          email: 0,
          linkedin: 0
        },
        methodBreakdown: {
          link: 0,
          social: 0,
          email: 0,
          embed: 0
        },
        topSharedStories: [],
        lastShareDate: null
      })
    }

    // Fetch recent share events for detailed timeline
    const periodDays = parseInt(period)
    const { data: recentShares, error: eventsError } = await supabase
      .from('story_share_events')
      .select(`
        id,
        story_id,
        share_method,
        share_platform,
        shared_at,
        stories!inner(
          title,
          status,
          cultural_sensitivity_level
        )
      `)
      .eq('storyteller_id', storytellerId)
      .gte('shared_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
      .order('shared_at', { ascending: false })
      .limit(50)

    if (eventsError) {
      console.error('Error fetching recent share events:', eventsError)
    }

    // Calculate share velocity (shares per day)
    const sharesInPeriod = analytics.shares_last_30_days || 0
    const shareVelocity = periodDays > 0 ? (sharesInPeriod / periodDays).toFixed(2) : '0.00'

    // Build response
    const response = {
      storytellerId,
      storytellerName: analytics.storyteller_name,
      summary: {
        totalStoryShares: analytics.total_story_shares || 0,
        sharesLast30Days: analytics.shares_last_30_days || 0,
        sharesLast7Days: analytics.shares_last_7_days || 0,
        shareVelocity: parseFloat(shareVelocity),
        lastShareDate: analytics.last_share_date
      },
      platformBreakdown: {
        facebook: analytics.facebook_shares || 0,
        twitter: analytics.twitter_shares || 0,
        whatsapp: analytics.whatsapp_shares || 0,
        email: analytics.email_shares || 0,
        linkedin: analytics.linkedin_shares || 0
      },
      methodBreakdown: {
        link: analytics.link_shares || 0,
        social: analytics.social_shares || 0,
        email: analytics.email_method_shares || 0,
        embed: analytics.embed_shares || 0
      },
      topSharedStories: analytics.top_shared_stories || [],
      recentActivity: recentShares || [],
      period: {
        days: periodDays,
        start: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Share analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share analytics' },
      { status: 500 }
    )
  }
}
