/**
 * Embed Token Service
 *
 * Handles generation, validation, and revocation of secure access tokens
 * for external sites to access syndicated content.
 *
 * Philosophy:
 * - Time-limited (default 30 days)
 * - Domain-restricted (CORS)
 * - Revocable (storyteller control)
 * - Usage-tracked (transparency)
 */

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import crypto from 'crypto'

export interface EmbedToken {
  id: string
  token: string
  tokenType: 'bearer' | 'jwt'
  storyId: string
  tenantId: string
  allowedDomains: string[]
  expiresAt: Date | null
  status: 'active' | 'revoked' | 'expired'
  usageCount: number
  lastUsedAt: Date | null
}

export interface CreateTokenParams {
  storyId: string
  tenantId: string
  allowedDomains?: string[]
  expiresInDays?: number
}

export interface ValidateTokenResult {
  valid: boolean
  token?: EmbedToken
  error?: string
}

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Create a new embed token
 */
export async function createEmbedToken(
  params: CreateTokenParams
): Promise<{ token: EmbedToken | null; error: string | null }> {
  try {
    const supabase = createSupabaseServerClient()

    // Verify story exists and is public
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, is_public, status')
      .eq('id', params.storyId)
      .single()

    if (storyError || !story) {
      return {
        token: null,
        error: 'Story not found'
      }
    }

    if (!story.is_public || story.status !== 'published') {
      return {
        token: null,
        error: 'Story must be public and published'
      }
    }

    // Generate token
    const tokenString = generateSecureToken()
    const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays || 30))

    // Create token record
    const { data: tokenData, error: tokenError } = await supabase
      .from('embed_tokens')
      .insert({
        token: tokenString,
        token_hash: tokenHash,
        story_id: params.storyId,
        tenant_id: params.tenantId,
        allowed_domains: params.allowedDomains || [],
        status: 'active',
        expires_at: expiresAt.toISOString(),
        show_attribution: true,
        allow_analytics: true
      })
      .select()
      .single()

    if (tokenError) {
      console.error('Error creating embed token:', tokenError)
      return {
        token: null,
        error: 'Failed to create token'
      }
    }

    return {
      token: {
        id: tokenData.id,
        token: tokenData.token,
        tokenType: 'bearer' as 'bearer' | 'jwt',
        storyId: tokenData.story_id,
        tenantId: tokenData.tenant_id,
        allowedDomains: tokenData.allowed_domains || [],
        expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at) : null,
        status: tokenData.status as 'active' | 'revoked' | 'expired',
        usageCount: tokenData.usage_count || 0,
        lastUsedAt: tokenData.last_used_at ? new Date(tokenData.last_used_at) : null
      },
      error: null
    }
  } catch (error) {
    console.error('Error in createEmbedToken:', error)
    return {
      token: null,
      error: 'Internal server error'
    }
  }
}

/**
 * Validate an embed token
 */
export async function validateEmbedToken(
  tokenString: string,
  options?: {
    checkDomain?: string
    checkIpAddress?: string
    incrementUsage?: boolean
  }
): Promise<ValidateTokenResult> {
  try {
    const supabase = createSupabaseServerClient()

    // Fetch token
    const { data: tokenData, error: tokenError } = await supabase
      .from('embed_tokens')
      .select('*')
      .eq('token', tokenString)
      .single()

    if (tokenError || !tokenData) {
      return {
        valid: false,
        error: 'Token not found'
      }
    }

    // Check if revoked or expired
    if (tokenData.status === 'revoked') {
      return {
        valid: false,
        error: 'Token has been revoked'
      }
    }

    if (tokenData.status === 'expired') {
      return {
        valid: false,
        error: 'Token has expired'
      }
    }

    // Check expiration date
    if (tokenData.expires_at) {
      const expiresAt = new Date(tokenData.expires_at)
      if (expiresAt < new Date()) {
        // Auto-update status to expired
        await supabase
          .from('embed_tokens')
          .update({ status: 'expired' })
          .eq('id', tokenData.id)

        return {
          valid: false,
          error: 'Token has expired'
        }
      }
    }

    // Check domain (if specified)
    if (options?.checkDomain && tokenData.allowed_domains && tokenData.allowed_domains.length > 0) {
      const domainMatch = tokenData.allowed_domains.some((domain: string) =>
        options.checkDomain?.includes(domain)
      )
      if (!domainMatch) {
        return {
          valid: false,
          error: 'Domain not allowed'
        }
      }
    }

    // Increment usage counter
    if (options?.incrementUsage) {
      await supabase
        .from('embed_tokens')
        .update({
          usage_count: (tokenData.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
          last_used_domain: options.checkDomain || null,
          last_used_ip: options.checkIpAddress || null
        })
        .eq('id', tokenData.id)
    }

    return {
      valid: true,
      token: {
        id: tokenData.id,
        token: tokenData.token,
        tokenType: 'bearer' as 'bearer' | 'jwt',
        storyId: tokenData.story_id,
        tenantId: tokenData.tenant_id,
        allowedDomains: tokenData.allowed_domains || [],
        expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at) : null,
        status: tokenData.status as 'active' | 'revoked' | 'expired',
        usageCount: (tokenData.usage_count || 0) + (options?.incrementUsage ? 1 : 0),
        lastUsedAt: tokenData.last_used_at ? new Date(tokenData.last_used_at) : null
      }
    }
  } catch (error) {
    console.error('Error in validateEmbedToken:', error)
    return {
      valid: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Revoke a single embed token
 */
export async function revokeEmbedToken(
  tokenId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('embed_tokens')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revocation_reason: reason || 'Revoked by storyteller'
      })
      .eq('id', tokenId)

    if (error) {
      console.error('Error revoking token:', error)
      return {
        success: false,
        error: 'Failed to revoke token'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in revokeEmbedToken:', error)
    return {
      success: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Revoke all tokens for a specific story
 */
export async function revokeAllTokensForStory(
  storyId: string,
  reason?: string
): Promise<{ success: boolean; revokedCount: number; error?: string }> {
  try {
    const supabase = createSupabaseServerClient()

    // Get all active tokens for this story
    const { data: tokens, error: fetchError } = await supabase
      .from('embed_tokens')
      .select('id')
      .eq('story_id', storyId)
      .eq('status', 'active')

    if (fetchError) {
      return {
        success: false,
        revokedCount: 0,
        error: 'Failed to fetch tokens'
      }
    }

    if (!tokens || tokens.length === 0) {
      return {
        success: true,
        revokedCount: 0
      }
    }

    // Revoke all tokens
    const { error: revokeError } = await supabase
      .from('embed_tokens')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revocation_reason: reason || 'Story removed from syndication'
      })
      .eq('story_id', storyId)
      .eq('status', 'active')

    if (revokeError) {
      console.error('Error revoking tokens:', revokeError)
      return {
        success: false,
        revokedCount: 0,
        error: 'Failed to revoke tokens'
      }
    }

    return {
      success: true,
      revokedCount: tokens.length
    }
  } catch (error) {
    console.error('Error in revokeAllTokensForStory:', error)
    return {
      success: false,
      revokedCount: 0,
      error: 'Internal server error'
    }
  }
}

/**
 * Revoke all tokens for a specific story
 * Note: Since embed_tokens table doesn't have site_id, this revokes all tokens for the story
 */
export async function revokeTokensForStorySite(
  storyId: string,
  siteId: string,
  reason?: string
): Promise<{ success: boolean; revokedCount: number; error?: string }> {
  // For now, revoke all tokens for the story since we don't track site_id in embed_tokens
  // In the future, if site tracking is needed, add a site_id column or use distribution_id
  return revokeAllTokensForStory(storyId, reason || 'Story removed from site')
}

/**
 * Get token statistics for a story
 */
export async function getTokenStatsForStory(storyId: string): Promise<{
  totalTokens: number
  activeTokens: number
  revokedTokens: number
  expiredTokens: number
  totalRequests: number
}> {
  try {
    const supabase = createSupabaseServerClient()

    const { data: tokens, error } = await supabase
      .from('embed_tokens')
      .select('status, expires_at, usage_count')
      .eq('story_id', storyId)

    if (error || !tokens) {
      return {
        totalTokens: 0,
        activeTokens: 0,
        revokedTokens: 0,
        expiredTokens: 0,
        totalRequests: 0
      }
    }

    const now = new Date()
    const stats = tokens.reduce(
      (acc, token) => {
        acc.totalTokens++
        acc.totalRequests += token.usage_count || 0

        if (token.status === 'revoked') {
          acc.revokedTokens++
        } else if (token.status === 'expired') {
          acc.expiredTokens++
        } else if (token.expires_at && new Date(token.expires_at) < now) {
          acc.expiredTokens++
        } else {
          acc.activeTokens++
        }

        return acc
      },
      {
        totalTokens: 0,
        activeTokens: 0,
        revokedTokens: 0,
        expiredTokens: 0,
        totalRequests: 0
      }
    )

    return stats
  } catch (error) {
    console.error('Error in getTokenStatsForStory:', error)
    return {
      totalTokens: 0,
      activeTokens: 0,
      revokedTokens: 0,
      expiredTokens: 0,
      totalRequests: 0
    }
  }
}
