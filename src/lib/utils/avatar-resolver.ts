/**
 * Avatar Resolution Utility
 *
 * Centralizes logic for resolving storyteller/profile avatar URLs across the application.
 * Handles multiple data sources: profile_image_url, avatar_url, and avatar_media_id.
 */

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * Profile data structure with all possible avatar fields
 */
export interface ProfileWithAvatar {
  id: string
  avatar_url?: string | null
  profile_image_url?: string | null
  avatar_media_id?: string | null
}

/**
 * Resolved avatar data
 */
export interface ResolvedAvatar {
  avatar_url: string | null
  source: 'profile_image_url' | 'avatar_url' | 'avatar_media_id' | 'none'
}

/**
 * SQL SELECT fragment for querying all avatar-related fields
 * Use this in Supabase .select() calls to ensure all avatar fields are fetched
 */
export const AVATAR_FIELDS_SELECT = 'avatar_url, profile_image_url, avatar_media_id'

/**
 * Resolves avatar URL from profile data with fallback chain
 *
 * Resolution priority:
 * 1. profile_image_url (direct URL)
 * 2. avatar_url (direct URL)
 * 3. avatar_media_id (requires media_assets lookup)
 * 4. null (no avatar available)
 *
 * @param profile - Profile object with possible avatar fields
 * @param avatarMediaMap - Optional map of media_asset_id -> cdn_url for batch resolution
 * @returns Resolved avatar URL and source field
 */
export function resolveAvatarUrl(
  profile: ProfileWithAvatar,
  avatarMediaMap?: Record<string, string>
): ResolvedAvatar {
  // Priority 1: profile_image_url
  if (profile.profile_image_url) {
    return {
      avatar_url: profile.profile_image_url,
      source: 'profile_image_url'
    }
  }

  // Priority 2: avatar_url
  if (profile.avatar_url) {
    return {
      avatar_url: profile.avatar_url,
      source: 'avatar_url'
    }
  }

  // Priority 3: avatar_media_id (needs lookup)
  if (profile.avatar_media_id && avatarMediaMap) {
    const cdnUrl = avatarMediaMap[profile.avatar_media_id]
    if (cdnUrl) {
      return {
        avatar_url: cdnUrl,
        source: 'avatar_media_id'
      }
    }
  }

  // No avatar available
  return {
    avatar_url: null,
    source: 'none'
  }
}

/**
 * Batch resolves avatar media assets for multiple profiles
 *
 * This is more efficient than resolving each avatar individually.
 * Use when you have multiple profiles to process.
 *
 * @param profiles - Array of profiles with avatar_media_id fields
 * @param supabase - Supabase client instance
 * @returns Map of media_asset_id -> cdn_url
 */
export async function batchResolveAvatarMedia(
  profiles: ProfileWithAvatar[],
  supabase?: ReturnType<typeof createSupabaseServerClient>
): Promise<Record<string, string>> {
  const avatarMediaMap: Record<string, string> = {}

  // Extract unique media IDs that need resolution
  const mediaIds = Array.from(new Set(
    profiles
      .filter(p => !p.profile_image_url && !p.avatar_url && p.avatar_media_id)
      .map(p => p.avatar_media_id)
      .filter(Boolean) as string[]
  ))

  if (mediaIds.length === 0) {
    return avatarMediaMap
  }

  // Use provided client or create new one
  const client = supabase || createSupabaseServerClient()

  // Batch fetch media assets
  const { data: mediaAssets, error } = await client
    .from('media_assets')
    .select('id, cdn_url')
    .in('id', mediaIds)

  if (error) {
    console.error('[AvatarResolver] Failed to resolve avatar media assets:', error)
    return avatarMediaMap
  }

  // Build lookup map
  mediaAssets?.forEach(media => {
    if (media.cdn_url) {
      avatarMediaMap[media.id] = media.cdn_url
    }
  })

  return avatarMediaMap
}

/**
 * Processes an array of profiles and resolves all avatars in batch
 *
 * @param profiles - Array of profiles to process
 * @param supabase - Optional Supabase client instance
 * @returns Array of profiles with resolved avatar_url field
 */
export async function resolveProfileAvatars<T extends ProfileWithAvatar>(
  profiles: T[],
  supabase?: ReturnType<typeof createSupabaseServerClient>
): Promise<(T & { avatar_url: string | null })[]> {
  // Batch resolve media assets
  const avatarMediaMap = await batchResolveAvatarMedia(profiles, supabase)

  // Apply resolution to each profile
  return profiles.map(profile => {
    const resolved = resolveAvatarUrl(profile, avatarMediaMap)
    return {
      ...profile,
      avatar_url: resolved.avatar_url
    }
  })
}

/**
 * Single profile avatar resolution with database lookup
 *
 * Use sparingly - prefer batch resolution for multiple profiles
 *
 * @param profile - Profile object
 * @param supabase - Optional Supabase client instance
 * @returns Resolved avatar URL
 */
export async function resolveSingleAvatar(
  profile: ProfileWithAvatar,
  supabase?: ReturnType<typeof createSupabaseServerClient>
): Promise<string | null> {
  const resolved = await resolveProfileAvatars([profile], supabase)
  return resolved[0]?.avatar_url || null
}

/**
 * Helper to get initials from display name for avatar fallback
 *
 * @param name - Display name or full name
 * @returns Uppercase initials (max 2 characters)
 */
export function getAvatarInitials(name: string): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
