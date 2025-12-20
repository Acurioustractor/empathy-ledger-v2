import type { Json } from '@/types/database'

export type DistributionPolicy = {
  embed?: {
    enabled?: boolean
    default_domains?: string[]
  }
  webhooks?: {
    enabled?: boolean
  }
  external_syndication?: {
    enabled?: boolean
  }
  defaults?: {
    require_verified_consent?: boolean
    block_sacred_external?: boolean
    require_elder_approval_high?: boolean
  }
}

export const DEFAULT_DISTRIBUTION_POLICY: DistributionPolicy = {
  embed: { enabled: true, default_domains: [] },
  webhooks: { enabled: true },
  external_syndication: { enabled: true },
  defaults: {
    require_verified_consent: true,
    block_sacred_external: true,
    require_elder_approval_high: true,
  },
}

export function normalizeDistributionPolicy(value: unknown): DistributionPolicy {
  if (!value || typeof value !== 'object') return DEFAULT_DISTRIBUTION_POLICY
  return { ...DEFAULT_DISTRIBUTION_POLICY, ...(value as DistributionPolicy) }
}

export function policyFromJson(value: Json | null | undefined): DistributionPolicy {
  return normalizeDistributionPolicy(value as unknown)
}

