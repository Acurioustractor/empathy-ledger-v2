/**
 * Story Access Tokens
 *
 * Ephemeral, revocable access tokens for controlled story sharing.
 * This enables storytellers to share their stories while maintaining full control.
 *
 * Key Features:
 * - Time-limited (auto-expire)
 * - Revocable (instant withdrawal)
 * - View counting (track usage)
 * - Max views limit (one-time links)
 * - Auto-revocation on story withdrawal
 */

export interface StoryAccessToken {
  id: string
  story_id: string
  token: string

  // Access control
  expires_at: string
  revoked: boolean
  max_views: number | null
  view_count: number

  // Tracking
  created_by: string | null
  created_at: string
  last_accessed_at: string | null

  // Metadata
  purpose: 'social-media' | 'email' | 'embed' | 'direct-share' | 'partner'
  shared_to: string[] | null // ['twitter', 'facebook', 'email', etc.]
  watermark_text: string | null

  // Tenant isolation
  tenant_id: string
}

/**
 * Story Access Token Insert
 * Fields required when creating a new access token
 */
export interface StoryAccessTokenInsert {
  story_id: string
  token: string
  expires_at: string
  max_views?: number | null
  purpose?: 'social-media' | 'email' | 'embed' | 'direct-share' | 'partner'
  shared_to?: string[] | null
  watermark_text?: string | null
  created_by?: string | null
  tenant_id: string
}

/**
 * Story Access Token Update
 * Fields that can be updated
 */
export interface StoryAccessTokenUpdate {
  revoked?: boolean
  view_count?: number
  last_accessed_at?: string
}

/**
 * Token Validation Result
 * Returned by validate_and_increment_token() function
 */
export interface TokenValidationResult {
  is_valid: boolean
  story_id: string | null
  reason: string
}

/**
 * Share Link Response
 * API response when creating a share link
 */
export interface ShareLinkResponse {
  token: string
  shareUrl: string
  expiresAt: string
  maxViews: number | null
  purpose: string
  storyTitle: string
}

/**
 * Share Link List Item
 * Used in UI for displaying share links
 */
export interface ShareLinkListItem {
  id: string
  shareUrl: string
  purpose: string
  sharedTo: string[]
  viewCount: number
  maxViews: number | null
  expiresAt: string
  revoked: boolean
  createdAt: string
  lastAccessedAt: string | null
  isActive: boolean
}

/**
 * Create Share Link Request
 * Body for POST /api/stories/:id/share-link
 */
export interface CreateShareLinkRequest {
  expiresIn?: number // seconds, default: 7 days
  maxViews?: number | null
  purpose?: 'social-media' | 'email' | 'embed' | 'direct-share' | 'partner'
  sharedTo?: string[]
  watermarkText?: string | null
}

/**
 * Constants
 */
export const SHARE_LINK_PURPOSES = [
  'social-media',
  'email',
  'embed',
  'direct-share',
  'partner',
] as const

export const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

export const EXPIRY_OPTIONS = [
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
  { label: '3 days', value: 259200 },
  { label: '7 days (recommended)', value: 604800 },
  { label: '30 days', value: 2592000 },
] as const

/**
 * Helper Functions
 */

/**
 * Check if a token is currently active
 */
export function isTokenActive(token: StoryAccessToken): boolean {
  if (token.revoked) return false
  if (new Date(token.expires_at) < new Date()) return false
  if (token.max_views && token.view_count >= token.max_views) return false
  return true
}

/**
 * Get expiry status for UI display
 */
export function getExpiryStatus(expiresAt: string): {
  status: 'active' | 'expiring-soon' | 'expired'
  color: string
  message: string
} {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilExpiry < 0) {
    return {
      status: 'expired',
      color: 'text-destructive',
      message: 'Expired',
    }
  }

  if (hoursUntilExpiry < 24) {
    return {
      status: 'expiring-soon',
      color: 'text-amber-500',
      message: 'Expires soon',
    }
  }

  return {
    status: 'active',
    color: 'text-green-500',
    message: 'Active',
  }
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  return 'Less than 1 minute'
}

/**
 * Build shareable URL from token
 */
export function buildShareUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/s/${token}`
}
