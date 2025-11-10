import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/stories
 *
 * Returns ALL stories across all organizations (platform view)
 * Super admin only
 *
 * Query params:
 * - status: filter by status (draft, review, published, etc.)
 * - page: pagination page number
 * - limit: results per page
 * - search: search term for title/content
 */
export async function GET(request: NextRequest) {
  // Verify super admin access
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    console.log(`📚 Fetching ALL stories (platform view) - page ${page}, limit ${limit}`)

    const offset = (page - 1) * limit

    // Build base query - NO organization_id filter (platform view)
    // Using * to get all available columns, then transform
    let query = supabase
      .from('stories')
      .select(`
        *,
        organization:organization_id(id, name, slug)
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: stories, error, count } = await query

    if (error) {
      console.error('❌ Error fetching platform stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${stories?.length || 0} stories (total: ${count})`)

    return NextResponse.json({
      stories: stories || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Platform stories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform stories' },
      { status: 500 }
    )
  }
}
