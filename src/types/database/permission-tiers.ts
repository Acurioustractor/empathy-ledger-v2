/**
 * Permission Tiers
 *
 * Graduated sharing levels that give storytellers control over
 * who can access and share their stories.
 */

export type PermissionTier =
  | 'private'
  | 'trusted_circle'
  | 'community'
  | 'public'
  | 'archive'

export interface PermissionTierConfig {
  value: PermissionTier
  label: string
  emoji: string
  color: string
  description: string
  allowedPurposes: Array<'direct-share' | 'email' | 'embed' | 'social-media' | 'partner'>
  canWithdraw: boolean
  requiresExplicitConsent: boolean
}

export const PERMISSION_TIERS: Record<PermissionTier, PermissionTierConfig> = {
  private: {
    value: 'private',
    label: 'Private',
    emoji: '🔴',
    color: 'red',
    description: 'Only you can see this story. No sharing allowed.',
    allowedPurposes: [],
    canWithdraw: true,
    requiresExplicitConsent: false,
  },
  trusted_circle: {
    value: 'trusted_circle',
    label: 'Trusted Circle',
    emoji: '🟡',
    color: 'yellow',
    description: 'Share with specific people via direct links or email. Not for social media or public websites.',
    allowedPurposes: ['direct-share', 'email'],
    canWithdraw: true,
    requiresExplicitConsent: false,
  },
  community: {
    value: 'community',
    label: 'Community',
    emoji: '🟢',
    color: 'green',
    description: 'OK for community spaces and events. Not for social media or embeds.',
    allowedPurposes: ['direct-share', 'email', 'partner'],
    canWithdraw: true,
    requiresExplicitConsent: false,
  },
  public: {
    value: 'public',
    label: 'Public',
    emoji: '🔵',
    color: 'blue',
    description: 'OK for public sharing including social media, websites, and embeds. Can be withdrawn at any time.',
    allowedPurposes: ['direct-share', 'email', 'social-media', 'embed', 'partner'],
    canWithdraw: true,
    requiresExplicitConsent: false,
  },
  archive: {
    value: 'archive',
    label: 'Archive',
    emoji: '⚪',
    color: 'gray',
    description: 'Permanent public record. Cannot be withdrawn. Requires explicit consent.',
    allowedPurposes: ['direct-share', 'email', 'social-media', 'embed', 'partner'],
    canWithdraw: false,
    requiresExplicitConsent: true,
  },
}

export interface StoryWithPermissions {
  id: string
  title: string
  permission_tier: PermissionTier
  consent_verified_at: string | null
  archive_consent_given: boolean
  elder_reviewed: boolean
  elder_reviewed_at: string | null
  status: string
}

export interface PermissionCheckResult {
  allowed: boolean
  reason: string
  tier: PermissionTier
}

/**
 * Get permission tier configuration
 */
export function getPermissionTierConfig(tier: PermissionTier): PermissionTierConfig {
  return PERMISSION_TIERS[tier]
}

/**
 * Check if a purpose is allowed for a given tier
 */
export function isPurposeAllowed(
  tier: PermissionTier,
  purpose: 'direct-share' | 'email' | 'embed' | 'social-media' | 'partner'
): boolean {
  const config = PERMISSION_TIERS[tier]
  return config.allowedPurposes.includes(purpose)
}

/**
 * Get CSS class for permission tier badge
 */
export function getPermissionTierClassName(tier: PermissionTier): string {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium'

  switch (tier) {
    case 'private':
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700`
    case 'trusted_circle':
      return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700`
    case 'community':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700`
    case 'public':
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700`
    case 'archive':
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700`
    default:
      return baseClasses
  }
}

/**
 * Check if consent needs renewal (>30 days since last verification)
 */
export function needsConsentRenewal(consentVerifiedAt: string | null): boolean {
  if (!consentVerifiedAt) return true

  const verifiedDate = new Date(consentVerifiedAt)
  const now = new Date()
  const daysSinceVerification = (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)

  return daysSinceVerification > 30
}

/**
 * Get user-friendly explanation for each tier
 */
export function getTierExplanation(tier: PermissionTier): {
  title: string
  whatYouCan: string[]
  whatYouCant: string[]
  warning?: string
} {
  switch (tier) {
    case 'private':
      return {
        title: 'Private - Only You',
        whatYouCan: ['View your own story', 'Edit or delete it anytime'],
        whatYouCant: ['Share it with anyone', 'Create share links'],
      }

    case 'trusted_circle':
      return {
        title: 'Trusted Circle - Limited Sharing',
        whatYouCan: [
          'Share via direct links (expire after set time)',
          'Email to specific people',
          'Control exactly who sees it',
        ],
        whatYouCant: [
          'Post on social media',
          'Embed on websites',
          'Make it publicly searchable',
        ],
      }

    case 'community':
      return {
        title: 'Community - Events & Spaces',
        whatYouCan: [
          'Share at community events',
          'Use in community newsletters',
          'Share with partner organizations',
        ],
        whatYouCant: [
          'Post on public social media',
          'Embed on public websites',
        ],
      }

    case 'public':
      return {
        title: 'Public - Full Sharing',
        whatYouCan: [
          'Share on social media',
          'Embed on websites',
          'Post in public spaces',
          'Withdraw at any time',
        ],
        whatYouCant: [],
        warning: 'Once shared publicly, people may screenshot or save your story',
      }

    case 'archive':
      return {
        title: 'Archive - Permanent Record',
        whatYouCan: [
          'Contribute to historical record',
          'Help future generations',
          'Full public access',
        ],
        whatYouCant: ['Withdraw this story', 'Change permission level'],
        warning: 'This is a permanent decision. You cannot withdraw an archived story.',
      }
  }
}

/**
 * Get recommended tier based on story content
 */
export function getRecommendedTier(story: {
  hasSacredKnowledge?: boolean
  hasDeceasedNames?: boolean
  hasSensitiveContent?: boolean
  isForCommunityOnly?: boolean
}): PermissionTier {
  if (story.hasSacredKnowledge) return 'community'
  if (story.hasDeceasedNames) return 'community'
  if (story.hasSensitiveContent) return 'trusted_circle'
  if (story.isForCommunityOnly) return 'community'

  return 'public'
}
