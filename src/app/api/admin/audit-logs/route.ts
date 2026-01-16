// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/audit-logs
 *
 * Returns audit logs for super admins
 *
 * Query params:
 * - action_type: filter by action type
 * - target_type: filter by target type
 * - limit: number of results (default 100)
 * - offset: pagination offset
 */
export async function GET(request: NextRequest) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  try {
    const { searchParams } = new URL(request.url)
    const actionType = searchParams.get('action_type')
    const targetType = searchParams.get('target_type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Try super_admin_audit_log first, fall back to audit_logs
    let query = supabase
      .from('super_admin_audit_log')
      .select(`
        *,
        profiles:admin_profile_id(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (actionType) {
      query = query.eq('action_type', actionType)
    }

    if (targetType) {
      query = query.eq('target_type', targetType)
    }

    const { data: logs, error } = await query

    if (error) {
      // Fall back to general audit_logs table
      console.log('Falling back to audit_logs table')

      let fallbackQuery = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data: fallbackLogs, error: fallbackError } = await fallbackQuery

      if (fallbackError) {
        console.error('Error fetching audit logs:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to fetch audit logs' },
          { status: 500 }
        )
      }

      // Transform fallback logs to match expected format
      const transformedLogs = (fallbackLogs || []).map(log => ({
        id: log.id,
        admin_profile_id: log.user_id,
        action_type: log.action,
        target_type: log.entity_type,
        target_id: log.entity_id,
        action_metadata: log.metadata || {},
        success: true,
        created_at: log.created_at,
        profiles: null
      }))

      return NextResponse.json({ logs: transformedLogs })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
