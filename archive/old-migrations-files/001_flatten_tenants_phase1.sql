-- Migration: Flatten Multi-Tenant Architecture - Phase 1
-- Add subscription/billing fields to organizations table

-- Add new columns to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Copy data from linked tenant to organization
UPDATE organizations o
SET
  subscription_tier = COALESCE(t.subscription_tier, 'free'),
  subscription_status = COALESCE(t.status, 'active'),
  domain = t.domain,
  settings = COALESCE(t.settings, '{}'::jsonb),
  onboarded_at = t.onboarded_at,
  cultural_protocols = COALESCE(o.cultural_protocols, t.cultural_protocols, '{}'::jsonb)
FROM tenants t
WHERE o.tenant_id = t.id;

-- Add index for domain lookups (useful for custom domains)
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);

-- Add index for subscription queries
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier ON organizations(subscription_tier);

-- Verify migration
DO $$
DECLARE
  orgs_without_subscription INTEGER;
BEGIN
  SELECT COUNT(*) INTO orgs_without_subscription
  FROM organizations
  WHERE subscription_tier IS NULL;

  IF orgs_without_subscription > 0 THEN
    RAISE NOTICE 'Warning: % organizations missing subscription_tier', orgs_without_subscription;
  ELSE
    RAISE NOTICE 'Phase 1 Complete: All organizations have subscription data';
  END IF;
END $$;