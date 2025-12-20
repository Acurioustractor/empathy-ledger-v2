export type OrganizationTier = 'community' | 'basic' | 'standard' | 'premium' | 'enterprise'

export type EntitlementKey =
  | 'distribution.embed'
  | 'distribution.webhooks'
  | 'distribution.externalSyndication'
  | 'distribution.auditExports'
  | 'distribution.revocation'
  | 'consent.verifiedRequired'
  | 'consent.proofCapture'
  | 'consent.withdrawal'
  | 'impact.reporting'

export type Entitlements = Record<EntitlementKey, boolean>

const BASE: Entitlements = {
  'distribution.embed': true,
  'distribution.webhooks': true,
  'distribution.externalSyndication': true,
  'distribution.auditExports': true,
  'distribution.revocation': true,
  'consent.verifiedRequired': true,
  'consent.proofCapture': true,
  'consent.withdrawal': true,
  'impact.reporting': true,
}

const TIER_OVERRIDES: Record<OrganizationTier, Partial<Entitlements>> = {
  community: {
    'distribution.externalSyndication': false,
    'distribution.webhooks': false,
    'impact.reporting': false,
  },
  basic: {
    'distribution.externalSyndication': false,
  },
  standard: {},
  premium: {},
  enterprise: {},
}

export function getEntitlementsForTier(tier: OrganizationTier): Entitlements {
  return { ...BASE, ...(TIER_OVERRIDES[tier] ?? {}) }
}

export function isEntitled(entitlements: Entitlements, key: EntitlementKey): boolean {
  return Boolean(entitlements[key])
}

