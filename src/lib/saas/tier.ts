import type { OrganizationTier } from './entitlements'

export function normalizeOrganizationTier(value: unknown): OrganizationTier {
  switch (value) {
    case 'community':
    case 'basic':
    case 'standard':
    case 'premium':
    case 'enterprise':
      return value
    default:
      return 'community'
  }
}

