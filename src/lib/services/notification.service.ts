/**
 * Notification Service
 *
 * Provides a foundation for sending notifications across the platform.
 * Currently supports in-app notifications with extensibility for email and push.
 */

import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Notification types for the platform
export type NotificationType =
  | 'moderation_result'
  | 'elder_review_assigned'
  | 'elder_decision'
  | 'appeal_submitted'
  | 'appeal_resolved'
  | 'story_shared'
  | 'story_comment'
  | 'consent_request'
  | 'consent_granted'
  | 'consent_revoked'
  | 'organization_invite'
  | 'project_update'
  | 'system_announcement'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationPayload {
  type: NotificationType
  recipient_id: string
  title: string
  message: string
  priority?: NotificationPriority
  action_url?: string
  action_label?: string
  metadata?: Record<string, unknown>
  expires_at?: string // ISO date string
}

export interface NotificationRecord {
  id: string
  recipient_id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  action_url: string | null
  action_label: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  expires_at: string | null
  created_at: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

class NotificationService {
  /**
   * Send a notification to a user
   */
  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const supabase = createSupabaseServiceClient()

      // Insert notification into database
      const { data, error } = await (supabase as AnyClient)
        .from('notifications')
        .insert({
          recipient_id: payload.recipient_id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          priority: payload.priority || 'normal',
          action_url: payload.action_url,
          action_label: payload.action_label,
          metadata: payload.metadata || {},
          expires_at: payload.expires_at,
          is_read: false
        })
        .select('id')
        .single()

      if (error) {
        // If table doesn't exist, log but don't fail
        if (error.code === '42P01') {
          console.log('Notifications table not yet created, skipping notification')
          return { success: true }
        }
        throw error
      }

      // Future: Add email/push notification logic here based on user preferences
      // await this.sendEmailNotification(payload)
      // await this.sendPushNotification(payload)

      return { success: true, id: data?.id }
    } catch (err) {
      console.error('Failed to send notification:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }

  /**
   * Send notifications to multiple recipients
   */
  async sendBulkNotifications(
    payloads: NotificationPayload[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    // Process in batches of 50
    const batchSize = 50
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize)

      const results = await Promise.allSettled(
        batch.map(payload => this.sendNotification(payload))
      )

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          sent++
        } else {
          failed++
        }
      })
    }

    return { success: failed === 0, sent, failed }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = createSupabaseServerClient()

      const { count, error } = await (supabase as AnyClient)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      if (error) {
        if (error.code === '42P01') return 0 // Table doesn't exist
        throw error
      }

      return count || 0
    } catch (err) {
      console.error('Failed to get unread count:', err)
      return 0
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean
      limit?: number
      offset?: number
      types?: NotificationType[]
    } = {}
  ): Promise<NotificationRecord[]> {
    try {
      const supabase = createSupabaseServerClient()
      const { unreadOnly = false, limit = 20, offset = 0, types } = options

      let query = (supabase as AnyClient)
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (types && types.length > 0) {
        query = query.in('type', types)
      }

      const { data, error } = await query

      if (error) {
        if (error.code === '42P01') return [] // Table doesn't exist
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Failed to get notifications:', err)
      return []
    }
  }

  /**
   * Mark notification(s) as read
   */
  async markAsRead(
    userId: string,
    notificationIds: string[] | 'all'
  ): Promise<{ success: boolean }> {
    try {
      const supabase = createSupabaseServerClient()

      let query = (supabase as AnyClient)
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', userId)

      if (notificationIds !== 'all') {
        query = query.in('id', notificationIds)
      }

      const { error } = await query

      if (error) {
        if (error.code === '42P01') return { success: true } // Table doesn't exist
        throw error
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
      return { success: false }
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async cleanupExpiredNotifications(): Promise<{ deleted: number }> {
    try {
      const supabase = createSupabaseServiceClient()

      // Delete notifications that:
      // 1. Have expired
      // 2. Are read and older than 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await (supabase as AnyClient)
        .from('notifications')
        .delete()
        .or(`expires_at.lt.${new Date().toISOString()},and(is_read.eq.true,created_at.lt.${thirtyDaysAgo.toISOString()})`)
        .select('id')

      if (error) {
        if (error.code === '42P01') return { deleted: 0 }
        throw error
      }

      return { deleted: data?.length || 0 }
    } catch (err) {
      console.error('Failed to cleanup notifications:', err)
      return { deleted: 0 }
    }
  }

  // ===========================================
  // Specialized notification helpers
  // ===========================================

  /**
   * Notify about moderation result
   */
  async notifyModerationResult(
    authorId: string,
    contentId: string,
    contentTitle: string,
    status: 'approved' | 'flagged' | 'blocked' | 'elder_review_required'
  ) {
    const statusMessages = {
      approved: 'Your content has been approved and is now visible.',
      flagged: 'Your content has been flagged for review. Please check for any issues.',
      blocked: 'Your content could not be published due to cultural safety concerns.',
      elder_review_required: 'Your content requires review by a community elder before publication.'
    }

    return this.sendNotification({
      type: 'moderation_result',
      recipient_id: authorId,
      title: `Content Moderation: ${contentTitle}`,
      message: statusMessages[status],
      priority: status === 'blocked' ? 'high' : 'normal',
      action_url: `/stories/${contentId}`,
      action_label: 'View Content',
      metadata: { content_id: contentId, status }
    })
  }

  /**
   * Notify elder about new review assignment
   */
  async notifyElderReviewAssigned(
    elderId: string,
    contentId: string,
    contentTitle: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    dueDate: string
  ) {
    const priorityMessages = {
      low: 'A new content review has been assigned to you.',
      medium: 'A content review requires your attention.',
      high: 'A high-priority content review needs your attention soon.',
      urgent: 'An urgent content review requires your immediate attention.'
    }

    return this.sendNotification({
      type: 'elder_review_assigned',
      recipient_id: elderId,
      title: 'New Cultural Review Assigned',
      message: priorityMessages[priority],
      priority: priority === 'urgent' ? 'urgent' : priority === 'high' ? 'high' : 'normal',
      action_url: '/profile?tab=elder-reviews',
      action_label: 'Review Now',
      metadata: { content_id: contentId, content_title: contentTitle, due_date: dueDate }
    })
  }

  /**
   * Notify author about elder decision
   */
  async notifyElderDecision(
    authorId: string,
    contentId: string,
    contentTitle: string,
    decision: 'approved' | 'rejected' | 'needs_consultation',
    notes?: string
  ) {
    const decisionMessages = {
      approved: 'Your content has been approved by a community elder.',
      rejected: 'Your content was not approved. Please review the elder\'s feedback.',
      needs_consultation: 'Your content requires further community consultation before a decision can be made.'
    }

    return this.sendNotification({
      type: 'elder_decision',
      recipient_id: authorId,
      title: `Elder Review: ${contentTitle}`,
      message: decisionMessages[decision],
      priority: decision === 'rejected' ? 'high' : 'normal',
      action_url: `/stories/${contentId}`,
      action_label: 'View Details',
      metadata: { content_id: contentId, decision, notes }
    })
  }

  /**
   * Notify about consent request
   */
  async notifyConsentRequest(
    storytellerId: string,
    storyId: string,
    storyTitle: string,
    appName: string
  ) {
    return this.sendNotification({
      type: 'consent_request',
      recipient_id: storytellerId,
      title: 'Story Sharing Request',
      message: `${appName} would like to share your story "${storyTitle}". Review and approve this request.`,
      priority: 'normal',
      action_url: '/profile?tab=sharing',
      action_label: 'Review Request',
      metadata: { story_id: storyId, app_name: appName }
    })
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export helper functions
export const sendNotification = notificationService.sendNotification.bind(notificationService)
export const getNotifications = notificationService.getNotifications.bind(notificationService)
export const markNotificationsAsRead = notificationService.markAsRead.bind(notificationService)
export const getUnreadNotificationCount = notificationService.getUnreadCount.bind(notificationService)
