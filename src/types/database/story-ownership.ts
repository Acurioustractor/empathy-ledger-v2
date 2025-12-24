import { Json } from './base'

/**
 * Story Ownership, Distribution & Revocation System Types
 * Implements: Distribution tracking, embed tokens, audit logs, GDPR compliance
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type DistributionPlatform =
  | 'embed'
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'website'
  | 'blog'
  | 'api'
  | 'rss'
  | 'newsletter'
  | 'custom'

export type DistributionStatus =
  | 'active'
  | 'revoked'
  | 'expired'
  | 'pending'
  | 'failed'

export type EmbedTokenStatus = 'active' | 'revoked' | 'expired'

export type AuditEntityType =
  | 'story'
  | 'distribution'
  | 'embed_token'
  | 'consent'
  | 'media'
  | 'profile'
  | 'deletion_request'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'share'
  | 'revoke'
  | 'view'
  | 'download'
  | 'embed'
  | 'consent_grant'
  | 'consent_withdraw'
  | 'consent_update'
  | 'anonymize'
  | 'export'
  | 'transfer_ownership'
  | 'token_generate'
  | 'token_revoke'
  | 'token_use'
  | 'webhook_send'
  | 'webhook_fail'
  | 'elder_review_request'
  | 'elder_review_complete'

export type AuditActionCategory =
  | 'ownership'
  | 'distribution'
  | 'consent'
  | 'access'
  | 'revocation'
  | 'gdpr'
  | 'cultural'

export type AuditActorType =
  | 'user'
  | 'system'
  | 'webhook'
  | 'api'
  | 'cron'
  | 'admin'

export type DeletionRequestType =
  | 'anonymize_story'
  | 'anonymize_profile'
  | 'delete_account'
  | 'export_data'
  | 'delete_specific'

export type DeletionRequestStatus =
  | 'pending'
  | 'verified'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type AnonymizationStatus = 'none' | 'pending' | 'partial' | 'full'

export type OwnershipStatus = 'owned' | 'transferred' | 'shared' | 'disputed'

// =============================================================================
// STORY DISTRIBUTIONS TABLE
// =============================================================================

export interface StoryDistributionRow {
  id: string
  story_id: string
  tenant_id: string
  organization_id: string | null

  // Distribution details
  platform: DistributionPlatform
  platform_post_id: string | null
  distribution_url: string | null
  embed_domain: string | null

  // Status tracking
  status: DistributionStatus
  revoked_at: string | null
  revoked_by: string | null
  revocation_reason: string | null

  // Analytics
  view_count: number
  last_viewed_at: string | null
  click_count: number

  // Consent tracking
  consent_version: string | null
  consent_snapshot: Json | null

  // Webhook integration
  webhook_url: string | null
  webhook_secret: string | null
  webhook_notified_at: string | null
  webhook_response: Json | null
  webhook_retry_count: number

  // Metadata
  created_at: string
  updated_at: string
  created_by: string | null
  metadata: Json

  // Notes and expiration
  notes: string | null
  expires_at: string | null
}

export interface StoryDistributionInsert {
  id?: string
  story_id: string
  tenant_id: string
  organization_id?: string | null

  platform: DistributionPlatform
  platform_post_id?: string | null
  distribution_url?: string | null
  embed_domain?: string | null

  status?: DistributionStatus
  revoked_at?: string | null
  revoked_by?: string | null
  revocation_reason?: string | null

  view_count?: number
  last_viewed_at?: string | null
  click_count?: number

  consent_version?: string | null
  consent_snapshot?: Json | null

  webhook_url?: string | null
  webhook_secret?: string | null
  webhook_notified_at?: string | null
  webhook_response?: Json | null
  webhook_retry_count?: number

  created_at?: string
  updated_at?: string
  created_by?: string | null
  metadata?: Json

  notes?: string | null
  expires_at?: string | null
}

export interface StoryDistributionUpdate {
  organization_id?: string | null
  platform?: DistributionPlatform
  platform_post_id?: string | null
  distribution_url?: string | null
  embed_domain?: string | null

  status?: DistributionStatus
  revoked_at?: string | null
  revoked_by?: string | null
  revocation_reason?: string | null

  view_count?: number
  last_viewed_at?: string | null
  click_count?: number

  webhook_url?: string | null
  webhook_secret?: string | null
  webhook_notified_at?: string | null
  webhook_response?: Json | null
  webhook_retry_count?: number

  updated_at?: string
  metadata?: Json

  notes?: string | null
  expires_at?: string | null
}

// =============================================================================
// EMBED TOKENS TABLE
// =============================================================================

export interface EmbedTokenRow {
  id: string
  story_id: string
  tenant_id: string
  organization_id: string | null

  // Token details
  token: string
  token_hash: string

  // Access control
  allowed_domains: string[] | null
  status: EmbedTokenStatus
  expires_at: string | null

  // Usage tracking
  usage_count: number
  last_used_at: string | null
  last_used_domain: string | null
  last_used_ip: string | null

  // Revocation
  revoked_at: string | null
  revoked_by: string | null
  revocation_reason: string | null

  // Settings
  allow_analytics: boolean
  show_attribution: boolean
  custom_styles: Json | null

  // Timestamps
  created_at: string
  updated_at: string
  created_by: string | null

  // Link to distribution
  distribution_id: string | null
}

export interface EmbedTokenInsert {
  id?: string
  story_id: string
  tenant_id: string
  organization_id?: string | null

  token: string
  token_hash: string

  allowed_domains?: string[] | null
  status?: EmbedTokenStatus
  expires_at?: string | null

  usage_count?: number
  last_used_at?: string | null
  last_used_domain?: string | null
  last_used_ip?: string | null

  revoked_at?: string | null
  revoked_by?: string | null
  revocation_reason?: string | null

  allow_analytics?: boolean
  show_attribution?: boolean
  custom_styles?: Json | null

  created_at?: string
  updated_at?: string
  created_by?: string | null

  distribution_id?: string | null
}

export interface EmbedTokenUpdate {
  organization_id?: string | null
  allowed_domains?: string[] | null
  status?: EmbedTokenStatus
  expires_at?: string | null

  usage_count?: number
  last_used_at?: string | null
  last_used_domain?: string | null
  last_used_ip?: string | null

  revoked_at?: string | null
  revoked_by?: string | null
  revocation_reason?: string | null

  allow_analytics?: boolean
  show_attribution?: boolean
  custom_styles?: Json | null

  updated_at?: string
}

// =============================================================================
// AUDIT LOGS TABLE
// =============================================================================

export interface AuditLogRow {
  id: string
  tenant_id: string
  organization_id: string | null

  // What was affected
  entity_type: AuditEntityType
  entity_id: string

  // What happened
  action: AuditAction
  action_category: AuditActionCategory | null

  // Who did it
  actor_id: string | null
  actor_type: AuditActorType | null
  actor_ip: string | null
  actor_user_agent: string | null

  // Change details
  previous_state: Json | null
  new_state: Json | null
  change_summary: string | null
  change_diff: Json | null

  // Context
  related_entity_type: string | null
  related_entity_id: string | null
  request_id: string | null
  session_id: string | null

  // Metadata
  metadata: Json
  created_at: string
}

export interface AuditLogInsert {
  id?: string
  tenant_id: string
  organization_id?: string | null

  entity_type: AuditEntityType
  entity_id: string

  action: AuditAction
  action_category?: AuditActionCategory | null

  actor_id?: string | null
  actor_type?: AuditActorType | null
  actor_ip?: string | null
  actor_user_agent?: string | null

  previous_state?: Json | null
  new_state?: Json | null
  change_summary?: string | null
  change_diff?: Json | null

  related_entity_type?: string | null
  related_entity_id?: string | null
  request_id?: string | null
  session_id?: string | null

  metadata?: Json
  created_at?: string
}

// =============================================================================
// DELETION REQUESTS TABLE (GDPR)
// =============================================================================

export interface DeletionRequestRow {
  id: string
  user_id: string
  tenant_id: string
  organization_id: string | null

  // Request details
  request_type: DeletionRequestType
  scope: Json | null
  reason: string | null

  // Status tracking
  status: DeletionRequestStatus
  requested_at: string
  verified_at: string | null
  processing_started_at: string | null
  completed_at: string | null

  // Processing details
  items_total: number
  items_processed: number
  items_failed: number
  processing_log: Json
  error_message: string | null

  // Verification
  verification_token: string | null
  verification_expires_at: string | null
  verification_attempts: number

  // Completion
  completion_report: Json | null
  data_export_url: string | null
  data_export_expires_at: string | null

  // Audit
  processed_by: string | null
  admin_notes: string | null

  // Timestamps
  updated_at: string
}

export interface DeletionRequestInsert {
  id?: string
  user_id: string
  tenant_id: string
  organization_id?: string | null

  request_type: DeletionRequestType
  scope?: Json | null
  reason?: string | null

  status?: DeletionRequestStatus
  requested_at?: string
  verified_at?: string | null
  processing_started_at?: string | null
  completed_at?: string | null

  items_total?: number
  items_processed?: number
  items_failed?: number
  processing_log?: Json
  error_message?: string | null

  verification_token?: string | null
  verification_expires_at?: string | null
  verification_attempts?: number

  completion_report?: Json | null
  data_export_url?: string | null
  data_export_expires_at?: string | null

  processed_by?: string | null
  admin_notes?: string | null

  updated_at?: string
}

export interface DeletionRequestUpdate {
  organization_id?: string | null
  scope?: Json | null
  reason?: string | null

  status?: DeletionRequestStatus
  verified_at?: string | null
  processing_started_at?: string | null
  completed_at?: string | null

  items_total?: number
  items_processed?: number
  items_failed?: number
  processing_log?: Json
  error_message?: string | null

  verification_token?: string | null
  verification_expires_at?: string | null
  verification_attempts?: number

  completion_report?: Json | null
  data_export_url?: string | null
  data_export_expires_at?: string | null

  processed_by?: string | null
  admin_notes?: string | null

  updated_at?: string
}

// =============================================================================
// STORY TABLE EXTENSIONS (for content-media.ts)
// =============================================================================

export interface StoryOwnershipFields {
  // Soft delete / archive
  is_archived: boolean
  archived_at: string | null
  archived_by: string | null
  archive_reason: string | null

  // Distribution control
  embeds_enabled: boolean
  sharing_enabled: boolean
  allowed_embed_domains: string[] | null

  // Consent withdrawal
  consent_withdrawn_at: string | null
  consent_withdrawal_reason: string | null

  // GDPR anonymization
  anonymization_status: AnonymizationStatus | null
  anonymization_requested_at: string | null
  anonymized_at: string | null
  anonymized_fields: Json | null
  original_author_display: string | null

  // Provenance tracking
  ownership_status: OwnershipStatus
  original_author_id: string | null
  ownership_transferred_at: string | null
  provenance_chain: Json
}

// =============================================================================
// DATABASE TABLES INTERFACE
// =============================================================================

export interface StoryOwnershipTables {
  story_distributions: {
    Row: StoryDistributionRow
    Insert: StoryDistributionInsert
    Update: StoryDistributionUpdate
    Relationships: [
      {
        foreignKeyName: 'story_distributions_story_id_fkey'
        columns: ['story_id']
        isOneToOne: false
        referencedRelation: 'stories'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'story_distributions_created_by_fkey'
        columns: ['created_by']
        isOneToOne: false
        referencedRelation: 'users'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'story_distributions_revoked_by_fkey'
        columns: ['revoked_by']
        isOneToOne: false
        referencedRelation: 'users'
        referencedColumns: ['id']
      }
    ]
  }

  embed_tokens: {
    Row: EmbedTokenRow
    Insert: EmbedTokenInsert
    Update: EmbedTokenUpdate
    Relationships: [
      {
        foreignKeyName: 'embed_tokens_story_id_fkey'
        columns: ['story_id']
        isOneToOne: false
        referencedRelation: 'stories'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'embed_tokens_distribution_id_fkey'
        columns: ['distribution_id']
        isOneToOne: false
        referencedRelation: 'story_distributions'
        referencedColumns: ['id']
      }
    ]
  }

  audit_logs: {
    Row: AuditLogRow
    Insert: AuditLogInsert
    Update: never // Audit logs should not be updated
    Relationships: [
      {
        foreignKeyName: 'audit_logs_actor_id_fkey'
        columns: ['actor_id']
        isOneToOne: false
        referencedRelation: 'users'
        referencedColumns: ['id']
      }
    ]
  }

  deletion_requests: {
    Row: DeletionRequestRow
    Insert: DeletionRequestInsert
    Update: DeletionRequestUpdate
    Relationships: [
      {
        foreignKeyName: 'deletion_requests_user_id_fkey'
        columns: ['user_id']
        isOneToOne: false
        referencedRelation: 'users'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'deletion_requests_processed_by_fkey'
        columns: ['processed_by']
        isOneToOne: false
        referencedRelation: 'users'
        referencedColumns: ['id']
      }
    ]
  }
}

// =============================================================================
// SERVICE TYPES
// =============================================================================

export interface RevocationOptions {
  scope: 'all' | 'embeds' | 'distributions' | 'specific'
  reason: string
  distributionIds?: string[]
  notifyWebhooks?: boolean
  archiveStory?: boolean
}

export interface RevocationResult {
  success: boolean
  distributionsRevoked: number
  tokensRevoked: number
  webhooksNotified: number
  webhooksFailed: number
  errors: string[]
}

export interface CascadeResult {
  storyArchived: boolean
  distributionsRevoked: number
  tokensRevoked: number
  mediaRevoked: number
  auditLogsCreated: number
}

export interface AnonymizeOptions {
  scope: 'story' | 'all_user_data'
  preserveForAnalysis?: boolean
  notifyUser?: boolean
}

export interface AnonymizeResult {
  success: boolean
  itemsAnonymized: number
  errors: string[]
  completionReport: Json
}

export interface DataExport {
  stories: Json[]
  media: Json[]
  comments: Json[]
  reactions: Json[]
  consent_records: Json[]
  audit_logs: Json[]
  profile: Json
  export_date: string
  format: 'json' | 'csv'
}

export interface EmbedOptions {
  domains: string[]
  expiresAt?: Date
  allowAnalytics?: boolean
  showAttribution?: boolean
  customStyles?: Json
}

export interface EmbedToken {
  token: string
  tokenId: string
  embedCode: string
  expiresAt: string | null
  allowedDomains: string[]
}

export interface EmbeddableStory {
  id: string
  title: string
  content: string
  excerpt: string | null
  author: {
    displayName: string
    profileImage: string | null
  } | null
  storyteller: {
    displayName: string
    profileImage: string | null
  } | null
  createdAt: string
  culturalContext: Json | null
  attribution: string
}

export interface DistributionMap {
  storyId: string
  totalDistributions: number
  activeDistributions: number
  revokedDistributions: number
  totalViews: number
  byPlatform: Record<DistributionPlatform, {
    count: number
    views: number
    active: number
  }>
  distributions: StoryDistributionRow[]
}

export interface DistributionAnalytics {
  storyId: string
  totalViews: number
  totalClicks: number
  viewsByPlatform: Record<DistributionPlatform, number>
  viewsOverTime: Array<{ date: string; views: number }>
  topDomains: Array<{ domain: string; views: number }>
}

export interface ViewMetadata {
  domain: string
  ip?: string
  userAgent?: string
  referrer?: string
}

export interface WebhookEvent {
  type: 'distribution_revoked' | 'story_archived' | 'consent_withdrawn' | 'story_updated'
  storyId: string
  distributionId?: string
  timestamp: string
  payload: Json
}

export interface WebhookResult {
  distributionId: string
  success: boolean
  statusCode?: number
  response?: Json
  error?: string
}

// =============================================================================
// AUDIT LOG ENTRY HELPERS
// =============================================================================

export interface AuditEntry {
  tenantId: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  actionCategory?: AuditActionCategory
  actorId?: string
  actorType?: AuditActorType
  previousState?: Json
  newState?: Json
  changeSummary?: string
  metadata?: Json
}

export interface StoryAuditHistory {
  storyId: string
  createdAt: string
  createdBy: string | null
  events: Array<{
    id: string
    action: AuditAction
    category: AuditActionCategory | null
    actor: string | null
    summary: string | null
    timestamp: string
  }>
  distributionHistory: Array<{
    platform: DistributionPlatform
    status: DistributionStatus
    createdAt: string
    revokedAt: string | null
    views: number
  }>
}

export interface GDPRAuditLog {
  requestId: string
  requestType: DeletionRequestType
  status: DeletionRequestStatus
  requestedAt: string
  completedAt: string | null
  itemsProcessed: number
}
