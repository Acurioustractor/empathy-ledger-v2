export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { engagementTrackingService } from '@/lib/services/engagement-tracking.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/storytellers/[id]/impact
 *
 * Get engagement and impact data for a storyteller
 * Used to populate their impact dashboard
 *
 * Query params:
 *   - days: Number of days to look back (default: 30)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: storytellerId } = await params
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')

    // Verify authentication
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user has access to view this storyteller's impact
    // (must be the storyteller themselves or have admin access)
    const isOwner = user.id === storytellerId

    if (!isOwner) {
      // Check if admin or organization member with access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_roles')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.tenant_roles?.includes('admin') ||
                      profile?.tenant_roles?.includes('super_admin')

      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Get impact data
    const impact = await engagementTrackingService.getStorytellerImpact(storytellerId, days)

    // Get syndication info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consents } = await (supabase as any)
      .from('story_syndication_consent')
      .select(`
        app_id,
        share_full_content,
        share_summary_only,
        consent_granted_at,
        external_applications:app_id (
          app_name,
          app_display_name
        )
      `)
      .eq('storyteller_id', storytellerId)
      .eq('consent_granted', true)
      .is('consent_revoked_at', null)

    const activePlatforms = (consents || []).map((c: Record<string, unknown>) => ({
      appId: c.app_id,
      appName: (c.external_applications as Record<string, string>)?.app_display_name ||
               (c.external_applications as Record<string, string>)?.app_name || 'Unknown',
      shareLevel: c.share_full_content ? 'full' :
                  c.share_summary_only ? 'summary' : 'title_only',
      grantedAt: c.consent_granted_at
    }))

    return NextResponse.json({
      impact,
      activePlatforms,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Impact API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch impact data' },
      { status: 500 }
    )
  }
}
