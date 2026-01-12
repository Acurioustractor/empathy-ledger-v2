import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search/popular
 * Get popular search queries for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    // Query search_logs table (if it exists)
    const { data: popularSearches, error } = await supabase
      .from('search_logs')
      .select('query')
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })
      .limit(100)

    if (error && error.code !== 'PGRST116') {
      // Ignore table not found error
      console.error('Error fetching popular searches:', error)
    }

    // Count occurrences
    const searchCounts: Record<string, number> = {}
    popularSearches?.forEach(item => {
      const query = item.query?.toLowerCase().trim()
      if (query) {
        searchCounts[query] = (searchCounts[query] || 0) + 1
      }
    })

    // Sort by count and get top results
    const sorted = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query)

    return NextResponse.json({
      success: true,
      searches: sorted
    })

  } catch (error) {
    console.error('Error in popular searches API:', error)
    return NextResponse.json({
      success: true,
      searches: [] // Return empty array instead of error
    })
  }
}
