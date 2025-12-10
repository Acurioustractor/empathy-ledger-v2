/**
 * Empathy Ledger API Client
 *
 * Handles JWT authentication and story fetching
 * for the act.place Webflow Cloud app.
 */

import * as jose from 'jose'

// Types
export interface Story {
  id: string
  title: string
  content: string | null
  summary: string | null
  featured_image: string | null
  themes: string[]
  created_at: string
  storyteller: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
  attribution: {
    text: string
    link: string
    badge_url: string
  }
  tracking_pixel_url: string
  share_level: 'full' | 'summary' | 'title_only'
}

export interface StoriesResponse {
  stories: Story[]
  total: number
  has_more: boolean
}

// Configuration
const config = {
  appId: process.env.EMPATHY_LEDGER_APP_ID!,
  clientSecret: process.env.EMPATHY_LEDGER_CLIENT_SECRET!,
  apiUrl: process.env.EMPATHY_LEDGER_API_URL || 'https://empathyledger.com',
  platformName: process.env.PLATFORM_NAME || 'act_place',
  cacheDuration: parseInt(process.env.CACHE_DURATION || '60')
}

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Generate JWT token for API authentication
 */
async function generateToken(): Promise<string> {
  // Check cache
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token
  }

  // Generate new JWT
  const secret = new TextEncoder().encode(config.clientSecret)
  const now = Math.floor(Date.now() / 1000)

  const token = await new jose.SignJWT({
    app_id: config.appId,
    app_name: config.platformName
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setIssuer('empathy-ledger')
    .setAudience('external-apps')
    .setExpirationTime(now + 3600) // 1 hour
    .sign(secret)

  // Cache token
  cachedToken = {
    token,
    expiresAt: Date.now() + 3500000 // ~58 minutes
  }

  return token
}

/**
 * Fetch stories from Empathy Ledger API
 */
export async function fetchStories(options: {
  limit?: number
  offset?: number
  theme?: string
  search?: string
} = {}): Promise<StoriesResponse> {
  const token = await generateToken()

  const params = new URLSearchParams()
  if (options.limit) params.set('limit', options.limit.toString())
  if (options.offset) params.set('offset', options.offset.toString())
  if (options.theme) params.set('theme', options.theme)
  if (options.search) params.set('search', options.search)

  const response = await fetch(
    `${config.apiUrl}/api/external/stories?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: config.cacheDuration
      }
    }
  )

  if (!response.ok) {
    console.error('Failed to fetch stories:', response.status)
    throw new Error('Failed to fetch stories')
  }

  return response.json()
}

/**
 * Fetch a single story by ID
 */
export async function fetchStory(storyId: string): Promise<Story | null> {
  const token = await generateToken()

  const response = await fetch(
    `${config.apiUrl}/api/external/stories/${storyId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: config.cacheDuration
      }
    }
  )

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error('Failed to fetch story')
  }

  const data = await response.json()
  return data.story
}

/**
 * Get available themes/categories
 */
export async function fetchThemes(): Promise<string[]> {
  const token = await generateToken()

  const response = await fetch(
    `${config.apiUrl}/api/external/themes`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: {
        revalidate: 3600 // Cache themes for 1 hour
      }
    }
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return data.themes || []
}

/**
 * Generate tracking pixel URL for a story
 */
export function getTrackingPixelUrl(storyId: string): string {
  return `${config.apiUrl}/api/beacon?story=${storyId}&platform=${config.platformName}&event=view`
}

/**
 * Get the platform name for attribution
 */
export function getPlatformName(): string {
  return config.platformName
}
