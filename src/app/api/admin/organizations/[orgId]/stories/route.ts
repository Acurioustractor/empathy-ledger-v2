import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'
import { getOrganizationStories } from '@/lib/multi-tenant/queries'

/**
 * GET /api/admin/organizations/[orgId]/stories
 *
 * Returns stories for specific organization
 * Super admin only
 *
 * Query params:
 * - status: filter by status (draft, review, published, etc.)
 * - page: pagination page number
 * - limit: results per page
 * - search: search term for title/content
 *
 * BEST PRACTICE:
 * - Uses getOrganizationStories() helper (automatically filters by organization_id)
 * - Super admin can access ANY organization's stories
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Verify super admin access
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    console.log(`📚 Fetching stories for organization: ${params.orgId}`)

    // Get organization info
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('id', params.orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const offset = (page - 1) * limit

    // Build query using organization helper
    // Using * to get all available columns
    let query = supabase
      .from('stories')
      .select(`*`, { count: 'exact' })
      .eq('organization_id', params.orgId) // 🔒 CRITICAL: Organization filter

    // Apply additional filters
    if (statusParam) {
      const statuses = statusParam.split(',')
      query = query.in('status', statuses)
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
      console.error(`❌ Error fetching stories for ${org.name}:`, error)
      return NextResponse.json(
        { error: 'Failed to fetch organization stories' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${stories?.length || 0} stories for ${org.name} (total: ${count})`)

    return NextResponse.json({
      organizationId: org.id,
      organizationName: org.name,
      organizationSlug: org.slug,
      stories: stories || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Organization stories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization stories' },
      { status: 500 }
    )
  }
}
