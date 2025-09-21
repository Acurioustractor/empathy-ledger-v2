import type { 
  Story, 
  Profile, 
  Storyteller, 
  Organization,
  CulturalPermissions,
  ConsentPreferences 
} from '@/types/database'

/**
 * Cultural Safety and OCAP (Ownership, Control, Access, Possession) Principles
 * 
 * These utilities ensure that Indigenous cultural content is handled with
 * appropriate respect, consent, and cultural protocols.
 */

export enum CulturalSensitivityLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high'
}

export enum StoryAudience {
  CHILDREN = 'children',
  YOUTH = 'youth',
  ADULTS = 'adults',
  ELDERS = 'elders',
  ALL = 'all'
}

export enum StoryType {
  TRADITIONAL = 'traditional',
  PERSONAL = 'personal',
  HISTORICAL = 'historical',
  EDUCATIONAL = 'educational',
  HEALING = 'healing'
}

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  EXPIRED = 'expired'
}

export enum CulturalReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_CHANGES = 'needs_changes'
}

/**
 * Cultural Protocol Checker
 * Validates content against cultural protocols and restrictions
 */
export class CulturalProtocolChecker {
  static checkStoryPermissions(
    story: Partial<Story>,
    storyteller: Storyteller | null,
    userProfile: Profile | null
  ): {
    canView: boolean
    canShare: boolean
    canEdit: boolean
    restrictions: string[]
    requiredApprovals: string[]
  } {
    const restrictions: string[] = []
    const requiredApprovals: string[] = []
    
    // Check consent status
    const hasValidConsent = story.consent_status === ConsentStatus.GRANTED
    if (!hasValidConsent) {
      restrictions.push('Missing or invalid consent')
    }

    // Check cultural sensitivity level
    if (story.cultural_sensitivity_level === CulturalSensitivityLevel.HIGH) {
      if (!storyteller?.elder_status && !userProfile?.is_elder) {
        restrictions.push('High sensitivity content requires elder approval')
        requiredApprovals.push('elder')
      }
    }

    // Check story type restrictions
    if (story.story_type === StoryType.TRADITIONAL) {
      const culturalPermissions = storyteller?.cultural_protocols as CulturalPermissions | null
      
      if (!culturalPermissions?.can_share_traditional_stories) {
        restrictions.push('Storyteller not authorized to share traditional stories')
      }

      if (culturalPermissions?.elder_approval_required) {
        requiredApprovals.push('elder')
      }

      if (culturalPermissions?.cultural_review_required) {
        requiredApprovals.push('cultural_review')
      }
    }

    // Check audience restrictions
    const audienceRestrictions = this.checkAudienceRestrictions(story, userProfile)
    restrictions.push(...audienceRestrictions)

    // Check cultural review status
    if (story.cultural_review_status === CulturalReviewStatus.REJECTED) {
      restrictions.push('Content rejected by cultural review')
    } else if (story.cultural_review_status === CulturalReviewStatus.NEEDS_CHANGES) {
      restrictions.push('Content needs changes before approval')
    }

    const canView = restrictions.length === 0 || userProfile?.is_elder === true
    const canShare = canView && story.consent_status === ConsentStatus.GRANTED
    const canEdit = canView && (
      story.author_id === userProfile?.id || 
      userProfile?.is_elder === true
    )

    return {
      canView,
      canShare,
      canEdit,
      restrictions,
      requiredApprovals
    }
  }

  private static checkAudienceRestrictions(
    story: Partial<Story>,
    userProfile: Profile | null
  ): string[] {
    const restrictions: string[] = []
    
    if (!story.audience || story.audience === StoryAudience.ALL) {
      return restrictions
    }

    // For age-specific content, we'd need user age information
    // This is a simplified check based on user profile
    const userAge = userProfile?.date_of_birth 
      ? this.calculateAge(new Date(userProfile.date_of_birth))
      : null

    switch (story.audience) {
      case StoryAudience.CHILDREN:
        if (userAge && userAge > 12) {
          restrictions.push('Content restricted to children')
        }
        break
      case StoryAudience.YOUTH:
        if (userAge && (userAge < 13 || userAge > 17)) {
          restrictions.push('Content restricted to youth (13-17)')
        }
        break
      case StoryAudience.ADULTS:
        if (userAge && userAge < 18) {
          restrictions.push('Content restricted to adults')
        }
        break
      case StoryAudience.ELDERS:
        if (!userProfile?.is_elder) {
          restrictions.push('Content restricted to elders')
        }
        break
    }

    return restrictions
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Check if user can perform specific cultural actions
   */
  static checkCulturalPermission(
    action: 'share_traditional' | 'share_ceremonial' | 'represent_community' | 'access_restricted',
    userProfile: Profile | null,
    organisation?: Organization | null
  ): {
    allowed: boolean
    reason?: string
    requiredRole?: string
  } {
    if (!userProfile) {
      return { 
        allowed: false, 
        reason: 'User authentication required',
        requiredRole: 'authenticated_user'
      }
    }

    const culturalPermissions = userProfile.cultural_permissions as CulturalPermissions | null

    switch (action) {
      case 'share_traditional':
        if (!culturalPermissions?.can_share_traditional_stories) {
          return {
            allowed: false,
            reason: 'Not authorized to share traditional stories',
            requiredRole: 'traditional_knowledge_keeper'
          }
        }
        break

      case 'share_ceremonial':
        if (!culturalPermissions?.can_share_ceremonial_content) {
          return {
            allowed: false,
            reason: 'Not authorized to share ceremonial content',
            requiredRole: 'ceremonial_keeper'
          }
        }
        break

      case 'represent_community':
        if (!culturalPermissions?.can_represent_community) {
          return {
            allowed: false,
            reason: 'Not authorized to represent community',
            requiredRole: 'community_representative'
          }
        }
        break

      case 'access_restricted':
        if (!userProfile.is_elder && !userProfile.traditional_knowledge_keeper) {
          return {
            allowed: false,
            reason: 'Restricted content requires elder or knowledge keeper status',
            requiredRole: 'elder_or_keeper'
          }
        }
        break
    }

    return { allowed: true }
  }
}

/**
 * Consent Management Utilities
 */
export class ConsentManager {
  static hasValidConsent(
    consentType: keyof ConsentPreferences,
    userConsent: ConsentPreferences | null
  ): boolean {
    if (!userConsent) return false
    
    return userConsent[consentType] === true
  }

  static checkRequiredConsents(
    requiredConsents: Array<keyof ConsentPreferences>,
    userConsent: ConsentPreferences | null
  ): {
    valid: boolean
    missing: Array<keyof ConsentPreferences>
  } {
    if (!userConsent) {
      return {
        valid: false,
        missing: requiredConsents
      }
    }

    const missing = requiredConsents.filter(
      consent => !userConsent[consent]
    )

    return {
      valid: missing.length === 0,
      missing
    }
  }

  static getConsentExpiryDate(
    consentDate: Date,
    retentionPreference: ConsentPreferences['data_retention_preference']
  ): Date | null {
    switch (retentionPreference) {
      case 'indefinite':
        return null // No expiry
      case 'limited':
        // 2 years from consent date
        const expiryDate = new Date(consentDate)
        expiryDate.setFullYear(expiryDate.getFullYear() + 2)
        return expiryDate
      case 'request_deletion':
        // 1 year from consent date
        const deleteDate = new Date(consentDate)
        deleteDate.setFullYear(deleteDate.getFullYear() + 1)
        return deleteDate
      default:
        return null
    }
  }

  static isConsentExpired(
    consentDate: Date,
    retentionPreference: ConsentPreferences['data_retention_preference']
  ): boolean {
    const expiryDate = this.getConsentExpiryDate(consentDate, retentionPreference)
    if (!expiryDate) return false
    
    return new Date() > expiryDate
  }
}

/**
 * Multi-tenant Organization Utilities
 */
export class OrganizationManager {
  static checkOrganizationAccess(
    organisation: Organization,
    userProfile: Profile | null
  ): {
    canView: boolean
    canEdit: boolean
    canManage: boolean
    membership?: 'member' | 'admin' | 'owner' | null
  } {
    if (!userProfile) {
      return {
        canView: organisation.status === 'active',
        canEdit: false,
        canManage: false,
        membership: null
      }
    }

    // This would need to be expanded with actual membership checking
    // For now, basic implementation
    const canView = organisation.status === 'active' || userProfile.is_elder
    const canEdit = userProfile.is_elder // Simplified - would check membership
    const canManage = userProfile.is_elder // Simplified - would check admin rights

    return {
      canView,
      canEdit,
      canManage,
      membership: null // Would be determined by membership table
    }
  }

  static validateCulturalFocus(
    culturalFocus: string[],
    userAffiliations: string[] | null
  ): boolean {
    if (!userAffiliations || userAffiliations.length === 0) {
      return false
    }

    // Check if user has at least one matching cultural affiliation
    return culturalFocus.some(focus => 
      userAffiliations.includes(focus)
    )
  }

  static getOrganizationSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

/**
 * Cultural Content Filtering
 */
export class CulturalContentFilter {
  static filterStoriesForUser(
    stories: Story[],
    userProfile: Profile | null,
    storytellers: Record<string, Storyteller> = {}
  ): Story[] {
    return stories.filter(story => {
      const storyteller = story.storyteller_id 
        ? storytellers[story.storyteller_id] 
        : null
      
      const permissions = CulturalProtocolChecker.checkStoryPermissions(
        story,
        storyteller,
        userProfile
      )
      
      return permissions.canView
    })
  }

  static applyCulturalTags(content: string): {
    tags: string[]
    sensitivityLevel: CulturalSensitivityLevel
    suggestedAudience: StoryAudience[]
  } {
    const tags: string[] = []
    let sensitivityLevel = CulturalSensitivityLevel.LOW
    const suggestedAudience: StoryAudience[] = [StoryAudience.ALL]

    // Cultural content detection (simplified)
    const traditionalKeywords = [
      'ceremony', 'sacred', 'traditional', 'ancestral', 'ritual',
      'elder', 'creation story', 'dreamtime', 'spirit'
    ]

    const sensitiveKeywords = [
      'sacred site', 'ceremony', 'burial', 'restricted', 'men only', 'women only'
    ]

    const contentLower = content.toLowerCase()

    // Check for traditional content
    if (traditionalKeywords.some(keyword => contentLower.includes(keyword))) {
      tags.push('traditional')
      sensitivityLevel = CulturalSensitivityLevel.MEDIUM
    }

    // Check for sensitive content
    if (sensitiveKeywords.some(keyword => contentLower.includes(keyword))) {
      tags.push('culturally-sensitive')
      sensitivityLevel = CulturalSensitivityLevel.HIGH
      suggestedAudience.splice(0, 1, StoryAudience.ELDERS)
    }

    return {
      tags,
      sensitivityLevel,
      suggestedAudience
    }
  }
}

/**
 * Privacy and Anonymization Utilities
 */
export class PrivacyManager {
  static anonymizeProfile(
    profile: Profile,
    anonymizationLevel: ConsentPreferences['anonymization_preference']
  ): Partial<Profile> {
    const anonymized: Partial<Profile> = { ...profile }

    switch (anonymizationLevel) {
      case 'anonymous':
        anonymized.first_name = null
        anonymized.last_name = null
        anonymized.display_name = 'Anonymous'
        anonymized.email = '[redacted]'
        anonymized.phone = null
        anonymized.address = null
        break
      case 'first_name_only':
        anonymized.last_name = null
        anonymized.display_name = profile.first_name || 'Anonymous'
        anonymized.email = '[redacted]'
        anonymized.phone = null
        break
      case 'full_name':
        // Keep full name, redact other identifying info
        anonymized.email = '[redacted]'
        anonymized.phone = null
        break
    }

    return anonymized
  }

  static shouldShowField(
    fieldName: keyof Profile,
    profile: Profile,
    viewerProfile: Profile | null,
    context: 'public' | 'community' | 'private'
  ): boolean {
    const privacySettings = profile.privacy_settings as any
    if (!privacySettings) return false

    // Check general visibility
    const profileVisibility = privacySettings.profile_visibility || 'private'
    
    if (profileVisibility === 'private' && profile.id !== viewerProfile?.id) {
      return false
    }

    if (profileVisibility === 'community' && context === 'public') {
      return false
    }

    // Check specific field visibility
    const fieldVisibility = privacySettings[`${fieldName}_visibility`]
    if (fieldVisibility) {
      if (fieldVisibility === 'private' && profile.id !== viewerProfile?.id) {
        return false
      }
      if (fieldVisibility === 'community' && context === 'public') {
        return false
      }
    }

    return true
  }
}

export {
  CulturalProtocolChecker,
  ConsentManager,
  OrganizationManager,
  CulturalContentFilter,
  PrivacyManager
}