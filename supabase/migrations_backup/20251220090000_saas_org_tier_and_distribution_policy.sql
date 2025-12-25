-- SaaS foundation: org tier + distribution policy
-- Billing unit: organisation (public.organizations)

-- Create org tier enum (optional, safe)
DO $$ BEGIN
  CREATE TYPE organization_tier AS ENUM ('community', 'basic', 'standard', 'premium', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create billing status enum (optional, safe)
DO $$ BEGIN
  CREATE TYPE billing_status AS ENUM ('active', 'trialing', 'past_due', 'paused', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add SaaS fields to organizations (safe, additive)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS tier organization_tier DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS billing_status billing_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS billing_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS distribution_policy JSONB NOT NULL DEFAULT '{
    "embed": { "enabled": true, "default_domains": [] },
    "webhooks": { "enabled": true },
    "external_syndication": { "enabled": true },
    "defaults": {
      "require_verified_consent": true,
      "block_sacred_external": true,
      "require_elder_approval_high": true
    }
  }'::jsonb;

CREATE INDEX IF NOT EXISTS idx_organizations_tier ON public.organizations(tier);
CREATE INDEX IF NOT EXISTS idx_organizations_billing_status ON public.organizations(billing_status);
CREATE INDEX IF NOT EXISTS idx_organizations_distribution_policy ON public.organizations USING GIN(distribution_policy);

