import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

// External app JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.EXTERNAL_APP_JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'fallback-secret-change-in-production'
)
const JWT_ISSUER = 'empathy-ledger'
const JWT_AUDIENCE = 'external-apps'
const TOKEN_EXPIRY = '1h' // 1 hour

export interface ExternalAppPayload extends JWTPayload {
  app_id: string
  app_name: string
  allowed_story_types: string[]
}

export interface ExternalApp {
  id: string
  app_name: string
  app_display_name: string
  app_description: string | null
  allowed_story_types: string[]
  is_active: boolean
}

/**
 * Validate an API key and return the associated app
 */
export async function validateApiKey(apiKey: string): Promise<ExternalApp | null> {
  const supabase = createSupabaseServiceClient()

  // Query external_applications table
  // API key is stored as a hash, we compare using bcrypt-style comparison
  // Table will be created via migration - bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: apps, error } = await (supabase as any)
    .from('external_applications')
    .select('id, app_name, app_display_name, app_description, allowed_story_types, is_active, api_key_hash')
    .eq('is_active', true)

  if (error || !apps) {
    console.error('Error fetching external apps:', error)
    return null
  }

  // Find app with matching API key
  // For simplicity, we're doing a direct comparison - in production, use bcrypt
  for (const app of apps) {
    // Simple comparison for now - in production, use crypto.timingSafeEqual with hashed values
    if (app.api_key_hash === apiKey) {
      return {
        id: app.id,
        app_name: app.app_name,
        app_display_name: app.app_display_name,
        app_description: app.app_description,
        allowed_story_types: app.allowed_story_types || [],
        is_active: app.is_active
      }
    }
  }

  return null
}

/**
 * Generate a JWT token for an authenticated external app
 */
export async function generateAppToken(app: ExternalApp): Promise<string> {
  const token = await new SignJWT({
    app_id: app.id,
    app_name: app.app_name,
    allowed_story_types: app.allowed_story_types
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode an external app JWT token
 */
export async function verifyAppToken(token: string): Promise<ExternalAppPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    })

    return payload as ExternalAppPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * Log story access for audit trail
 */
export async function logStoryAccess(
  storyId: string,
  appId: string,
  accessType: 'view' | 'embed' | 'export',
  context?: {
    ip?: string
    userAgent?: string
    additionalContext?: Record<string, unknown>
  }
): Promise<void> {
  const supabase = createSupabaseServiceClient()
  let organizationId: string | null = null
  let tenantId: string | null = null

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story } = await (supabase as any)
      .from('stories')
      .select('organization_id, tenant_id')
      .eq('id', storyId)
      .single()

    organizationId = story?.organization_id ?? null
    tenantId = story?.tenant_id ?? null

    if (organizationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: org } = await (supabase as any)
        .from('organisations')
        .select('tenant_id')
        .eq('id', organizationId)
        .single()

      if (org?.tenant_id) {
        tenantId = org.tenant_id
      }
    }
  } catch (error) {
    console.error('Failed to resolve story tenant context:', error)
  }

  // Table will be created via migration - bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('story_access_log')
    .insert({
      story_id: storyId,
      tenant_id: tenantId,
      organization_id: organizationId,
      app_id: appId,
      access_type: accessType,
      accessor_ip: context?.ip || null,
      accessor_user_agent: context?.userAgent || null,
      access_context: context?.additionalContext || null
    })

  if (error) {
    console.error('Failed to log story access:', error)
    // Don't throw - logging failure shouldn't break the main operation
  }
}
