/**
 * Utility functions for extracting different bio types from combined bio fields
 */

/**
 * Extract short bio from bio field that contains [SHORT_BIO] markers
 */
export function extractShortBio(bio: string | null | undefined): string | null {
  if (!bio) return null

  const shortBioMatch = bio.match(/\[SHORT_BIO\](.*?)\[\/SHORT_BIO\]/s)
  return shortBioMatch ? shortBioMatch[1].trim() : null
}

/**
 * Extract main bio (excluding short bio markers)
 */
export function extractMainBio(bio: string | null | undefined): string | null {
  if (!bio) return null

  // Remove the short bio marker and content
  const mainBio = bio.replace(/\n*\[SHORT_BIO\].*?\[\/SHORT_BIO\]/s, '').trim()
  return mainBio || null
}

/**
 * Get display bio for cards (short bio if available, otherwise truncated main bio)
 */
export function getCardDisplayBio(bio: string | null | undefined, maxLength: number = 120): string {
  const shortBio = extractShortBio(bio)
  if (shortBio) return shortBio

  const mainBio = extractMainBio(bio)
  if (!mainBio) return ''

  if (mainBio.length <= maxLength) return mainBio

  // Truncate at word boundary
  const truncated = mainBio.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

/**
 * Get full bio for profile pages (main bio without short bio markers)
 */
export function getProfileDisplayBio(bio: string | null | undefined): string {
  return extractMainBio(bio) || ''
}