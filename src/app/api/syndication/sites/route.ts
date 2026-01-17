import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/syndication/sites
 *
 * Returns list of registered syndication sites.
 * Public endpoint - no auth required (sites are public info).
 */
export async function GET() {
  const supabase = createSupabaseClient()

  const { data: sites, error } = await supabase
    .from('syndication_sites')
    .select('id, slug, name, description, base_url, status, allowed_domains, created_at')
    .order('name')

  if (error) {
    console.error('Error fetching syndication sites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch syndication sites' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    sites: sites || [],
    total: sites?.length || 0
  })
}
