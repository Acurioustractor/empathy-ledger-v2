import { createClient } from '@supabase/supabase-js'
import {
  AuditLogRow,
  AuditLogInsert,
  AuditAction,
  AuditActionCategory
} from '@/types/database/story-ownership'

/**
 * AuditService
 * Provides transparency trail for all story ownership actions.
 * Enables storytellers to see full history of their content.
 */
export class AuditService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Log an audit entry
   */
  async log(entry: AuditLogInsert): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert(entry)
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw - audit logging should not break main functionality
    }
  }

  /**
   * Get full audit history for a story
   */
  async getStoryHistory(
    storyId: string,
    options: {
      limit?: number
      offset?: number
      actions?: AuditAction[]
      categories?: AuditActionCategory[]
    } = {}
  ): Promise<AuditLogRow[]> {
    const { limit = 100, offset = 0, actions, categories } = options

    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_id', storyId)
      .eq('entity_type', 'story')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (actions && actions.length > 0) {
      query = query.in('action', actions)
    }

    if (categories && categories.length > 0) {
      query = query.in('action_category', categories)
    }

    const { data, error } = await query

    if (error) {
      throw new Error('Failed to fetch story history')
    }

    return data || []
  }

  /**
   * Get audit history for a specific entity
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    options: {
      limit?: number
      offset?: number
    } = {}
  ): Promise<AuditLogRow[]> {
    const { limit = 100, offset = 0 } = options

    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error('Failed to fetch entity history')
    }

    return data || []
  }

  /**
   * Get all actions by a specific user
   */
  async getUserActivityLog(
    userId: string,
    options: {
      limit?: number
      offset?: number
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<AuditLogRow[]> {
    const { limit = 100, offset = 0, startDate, endDate } = options

    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      throw new Error('Failed to fetch user activity log')
    }

    return data || []
  }

  /**
   * Get GDPR-specific activity log for a user
   */
  async getGDPRActivityLog(userId: string): Promise<AuditLogRow[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_id', userId)
      .eq('action_category', 'gdpr')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch GDPR activity log')
    }

    return data || []
  }

  /**
   * Export audit report for a story
   */
  async exportAuditReport(storyId: string): Promise<{
    storyId: string
    generatedAt: string
    totalActions: number
    actions: Array<{
      timestamp: string
      action: string
      category: string
      actor: string
      summary: string
    }>
    statistics: {
      byCategory: Record<string, number>
      byAction: Record<string, number>
    }
  }> {
    // Get all audit logs for the story
    const logs = await this.getStoryHistory(storyId, { limit: 1000 })

    // Calculate statistics
    const byCategory: Record<string, number> = {}
    const byAction: Record<string, number> = {}

    logs.forEach(log => {
      byCategory[log.action_category || 'unknown'] = (byCategory[log.action_category || 'unknown'] || 0) + 1
      byAction[log.action] = (byAction[log.action] || 0) + 1
    })

    return {
      storyId,
      generatedAt: new Date().toISOString(),
      totalActions: logs.length,
      actions: logs.map(log => ({
        timestamp: log.created_at,
        action: log.action,
        category: log.action_category || 'unknown',
        actor: log.actor_id || 'system',
        summary: log.change_summary || ''
      })),
      statistics: {
        byCategory,
        byAction
      }
    }
  }

  /**
   * Get distribution-related audit logs for a story
   */
  async getDistributionAuditLogs(storyId: string): Promise<AuditLogRow[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_id', storyId)
      .in('action_category', ['distribution', 'revocation'])
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch distribution audit logs')
    }

    return data || []
  }

  /**
   * Get consent-related audit logs for a story
   */
  async getConsentAuditLogs(storyId: string): Promise<AuditLogRow[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_id', storyId)
      .eq('action_category', 'consent')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch consent audit logs')
    }

    return data || []
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    tenantId: string,
    query: {
      searchTerm?: string
      entityType?: string
      action?: string
      actorId?: string
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    }
  ): Promise<{ logs: AuditLogRow[]; total: number }> {
    const { searchTerm, entityType, action, actorId, startDate, endDate, limit = 50, offset = 0 } = query

    let dbQuery = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (entityType) {
      dbQuery = dbQuery.eq('entity_type', entityType)
    }

    if (action) {
      dbQuery = dbQuery.eq('action', action)
    }

    if (actorId) {
      dbQuery = dbQuery.eq('actor_id', actorId)
    }

    if (startDate) {
      dbQuery = dbQuery.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      dbQuery = dbQuery.lte('created_at', endDate.toISOString())
    }

    if (searchTerm) {
      dbQuery = dbQuery.ilike('change_summary', `%${searchTerm}%`)
    }

    const { data, error, count } = await dbQuery

    if (error) {
      throw new Error('Failed to search audit logs')
    }

    return {
      logs: data || [],
      total: count || 0
    }
  }
}

// ==========================================================================
// FACTORY FUNCTION
// ==========================================================================

let auditServiceInstance: AuditService | null = null

export function getAuditService(): AuditService {
  if (!auditServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    auditServiceInstance = new AuditService(supabaseUrl, supabaseKey)
  }

  return auditServiceInstance
}

export default AuditService
