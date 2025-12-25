-- Multi-org tenants foundation
-- Establishes tenants + tenant members, backfills, and tenant-aware RLS.

-- ============================================
-- 1. TENANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'active',
  subscription_level TEXT,
  billing_contact_email TEXT,
  api_key_hash TEXT,
  cultural_protocols JSONB,
  data_region TEXT,
  is_default BOOLEAN DEFAULT false,
  contact_email TEXT,
  website_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS subscription_level TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS billing_contact_email TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS api_key_hash TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS cultural_protocols JSONB;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS data_region TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_default ON public.tenants(is_default) WHERE is_default = true;

-- ============================================
-- 2. ORGANIZATIONS -> TENANTS LINK
-- ============================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS tenant_id UUID;

UPDATE public.organizations
SET tenant_id = id
WHERE tenant_id IS NULL;

-- Seed tenants from existing organizations (one tenant per org as legacy default)
INSERT INTO public.tenants (
  id,
  name,
  slug,
  description,
  status,
  subscription_level,
  billing_contact_email,
  contact_email,
  website_url,
  location,
  created_at,
  updated_at,
  organization_id
)
SELECT
  o.id,
  o.name,
  o.slug,
  o.description,
  o.status,
  'legacy',
  o.contact_email,
  o.contact_email,
  o.website_url,
  o.location,
  o.created_at,
  o.updated_at,
  o.id
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenants t WHERE t.id = o.id OR t.slug = o.slug
);

-- Seed tenants for any orphan tenant_id values found in existing tables
WITH tenant_ids AS (
  SELECT DISTINCT tenant_id FROM public.profiles WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.stories WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.projects WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.transcripts WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.story_distributions WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.embed_tokens WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.audit_logs WHERE tenant_id IS NOT NULL
  UNION
  SELECT DISTINCT tenant_id FROM public.deletion_requests WHERE tenant_id IS NOT NULL
)
INSERT INTO public.tenants (id, name, status, subscription_level)
SELECT t.tenant_id, 'Legacy Tenant ' || t.tenant_id::TEXT, 'active', 'legacy'
FROM tenant_ids t
LEFT JOIN public.tenants existing ON existing.id = t.tenant_id
WHERE existing.id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.organizations
      ADD CONSTRAINT organizations_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.organizations
  ALTER COLUMN tenant_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_id_tenant_id_key
  ON public.organizations(id, tenant_id);

-- ============================================
-- 3. TENANT MEMBERSHIP
-- ============================================

CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON public.tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_profile ON public.tenant_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_active ON public.tenant_members(tenant_id, is_active);

-- Backfill tenant_members from profile_organizations
INSERT INTO public.tenant_members (tenant_id, profile_id, role, is_active, created_at, updated_at)
SELECT
  o.tenant_id,
  po.profile_id,
  CASE
    WHEN po.role IN ('owner', 'admin', 'member') THEN po.role
    ELSE 'member'
  END AS role,
  po.is_active,
  po.created_at,
  po.updated_at
FROM public.profile_organizations po
JOIN public.organizations o ON o.id = po.organization_id
ON CONFLICT (tenant_id, profile_id) DO NOTHING;

-- Ensure any profile with tenant_id is in tenant_members
INSERT INTO public.tenant_members (tenant_id, profile_id, role, is_active)
SELECT p.tenant_id, p.id, 'member', true
FROM public.profiles p
LEFT JOIN public.tenant_members tm
  ON tm.tenant_id = p.tenant_id AND tm.profile_id = p.id
WHERE p.tenant_id IS NOT NULL AND tm.id IS NULL;

-- Sync tenant_members whenever profile_organizations changes
CREATE OR REPLACE FUNCTION public.sync_tenant_members_from_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.tenant_members (tenant_id, profile_id, role, is_active, created_at, updated_at)
    SELECT o.tenant_id,
           NEW.profile_id,
           CASE
             WHEN NEW.role IN ('owner', 'admin', 'member') THEN NEW.role
             ELSE 'member'
           END,
           NEW.is_active,
           NEW.created_at,
           NEW.updated_at
    FROM public.organizations o
    WHERE o.id = NEW.organization_id
    ON CONFLICT (tenant_id, profile_id)
    DO UPDATE SET
      is_active = EXCLUDED.is_active,
      role = EXCLUDED.role,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.tenant_members tm
    SET
      is_active = NEW.is_active,
      role = CASE
        WHEN NEW.role IN ('owner', 'admin', 'member') THEN NEW.role
        ELSE tm.role
      END,
      updated_at = NOW()
    FROM public.organizations o
    WHERE o.id = NEW.organization_id
      AND tm.tenant_id = o.tenant_id
      AND tm.profile_id = NEW.profile_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tenant_members tm
    SET is_active = false, updated_at = NOW()
    FROM public.organizations o
    WHERE o.id = OLD.organization_id
      AND tm.tenant_id = o.tenant_id
      AND tm.profile_id = OLD.profile_id;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_tenant_members_from_org_insert ON public.profile_organizations;
CREATE TRIGGER sync_tenant_members_from_org_insert
  AFTER INSERT ON public.profile_organizations
  FOR EACH ROW EXECUTE FUNCTION public.sync_tenant_members_from_org();

DROP TRIGGER IF EXISTS sync_tenant_members_from_org_update ON public.profile_organizations;
CREATE TRIGGER sync_tenant_members_from_org_update
  AFTER UPDATE ON public.profile_organizations
  FOR EACH ROW EXECUTE FUNCTION public.sync_tenant_members_from_org();

DROP TRIGGER IF EXISTS sync_tenant_members_from_org_delete ON public.profile_organizations;
CREATE TRIGGER sync_tenant_members_from_org_delete
  AFTER DELETE ON public.profile_organizations
  FOR EACH ROW EXECUTE FUNCTION public.sync_tenant_members_from_org();

-- Update updated_at on tenant tables
DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_members_updated_at ON public.tenant_members;
CREATE TRIGGER update_tenant_members_updated_at
  BEFORE UPDATE ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. STORY DISTRIBUTION + CONSENT TABLES
-- ============================================

ALTER TABLE public.story_distributions
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.embed_tokens
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.deletion_requests
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.story_syndication_consent
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.story_access_log
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Backfill tenant/org for stories based on organizations
UPDATE public.stories s
SET tenant_id = o.tenant_id
FROM public.organizations o
WHERE s.organization_id = o.id AND (s.tenant_id IS NULL OR s.tenant_id <> o.tenant_id);

-- Backfill story_distributions
UPDATE public.story_distributions d
SET
  organization_id = s.organization_id,
  tenant_id = COALESCE(o.tenant_id, s.tenant_id, d.tenant_id)
FROM public.stories s
LEFT JOIN public.organizations o ON o.id = s.organization_id
WHERE d.story_id = s.id;

-- Backfill embed_tokens
UPDATE public.embed_tokens e
SET
  organization_id = COALESCE(s.organization_id, d.organization_id),
  tenant_id = COALESCE(o.tenant_id, s.tenant_id, d.tenant_id, e.tenant_id)
FROM public.stories s
LEFT JOIN public.story_distributions d ON d.id = e.distribution_id
LEFT JOIN public.organizations o ON o.id = COALESCE(s.organization_id, d.organization_id)
WHERE e.story_id = s.id;

-- Backfill audit_logs where we can infer organization_id
UPDATE public.audit_logs a
SET organization_id = s.organization_id
FROM public.stories s
WHERE a.organization_id IS NULL
  AND a.entity_type = 'story'
  AND a.entity_id = s.id;

UPDATE public.audit_logs a
SET organization_id = d.organization_id
FROM public.story_distributions d
WHERE a.organization_id IS NULL
  AND a.entity_type = 'distribution'
  AND a.entity_id = d.id;

UPDATE public.audit_logs a
SET organization_id = e.organization_id
FROM public.embed_tokens e
WHERE a.organization_id IS NULL
  AND a.entity_type = 'embed_token'
  AND a.entity_id = e.id;

-- Backfill story_syndication_consent + story_access_log
UPDATE public.story_syndication_consent ssc
SET
  organization_id = s.organization_id,
  tenant_id = COALESCE(o.tenant_id, s.tenant_id)
FROM public.stories s
LEFT JOIN public.organizations o ON o.id = s.organization_id
WHERE ssc.story_id = s.id;

UPDATE public.story_access_log sal
SET
  organization_id = s.organization_id,
  tenant_id = COALESCE(o.tenant_id, s.tenant_id)
FROM public.stories s
LEFT JOIN public.organizations o ON o.id = s.organization_id
WHERE sal.story_id = s.id;

-- Foreign keys and indexes for new tenant/org columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_distributions_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.story_distributions
      ADD CONSTRAINT story_distributions_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_distributions_org_tenant_fkey'
  ) THEN
    ALTER TABLE public.story_distributions
      ADD CONSTRAINT story_distributions_org_tenant_fkey
      FOREIGN KEY (organization_id, tenant_id)
      REFERENCES public.organizations(id, tenant_id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'embed_tokens_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.embed_tokens
      ADD CONSTRAINT embed_tokens_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'embed_tokens_org_tenant_fkey'
  ) THEN
    ALTER TABLE public.embed_tokens
      ADD CONSTRAINT embed_tokens_org_tenant_fkey
      FOREIGN KEY (organization_id, tenant_id)
      REFERENCES public.organizations(id, tenant_id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_org_tenant_fkey'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_org_tenant_fkey
      FOREIGN KEY (organization_id, tenant_id)
      REFERENCES public.organizations(id, tenant_id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deletion_requests_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.deletion_requests
      ADD CONSTRAINT deletion_requests_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deletion_requests_org_tenant_fkey'
  ) THEN
    ALTER TABLE public.deletion_requests
      ADD CONSTRAINT deletion_requests_org_tenant_fkey
      FOREIGN KEY (organization_id, tenant_id)
      REFERENCES public.organizations(id, tenant_id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_syndication_consent_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.story_syndication_consent
      ADD CONSTRAINT story_syndication_consent_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_syndication_consent_org_tenant_fkey'
  ) THEN
    ALTER TABLE public.story_syndication_consent
      ADD CONSTRAINT story_syndication_consent_org_tenant_fkey
      FOREIGN KEY (organization_id, tenant_id)
      REFERENCES public.organizations(id, tenant_id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_access_log_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.story_access_log
      ADD CONSTRAINT story_access_log_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_access_log_org_tenant_fkey'
  ) THEN
    ALTER TABLE public.story_access_log
      ADD CONSTRAINT story_access_log_org_tenant_fkey
      FOREIGN KEY (organization_id, tenant_id)
      REFERENCES public.organizations(id, tenant_id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_story_distributions_org_id ON public.story_distributions(organization_id);
CREATE INDEX IF NOT EXISTS idx_embed_tokens_org_id ON public.embed_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_org_id ON public.deletion_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_story_syndication_consent_org_id ON public.story_syndication_consent(organization_id);
CREATE INDEX IF NOT EXISTS idx_story_access_log_org_id ON public.story_access_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_story_syndication_consent_tenant_id ON public.story_syndication_consent(tenant_id);
CREATE INDEX IF NOT EXISTS idx_story_access_log_tenant_id ON public.story_access_log(tenant_id);

-- ============================================
-- 5. HELPERS FOR TENANT/ORG ACCESS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND COALESCE(super_admin, false) = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_organization_member(p_org_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_organizations
    WHERE organization_id = p_org_id
      AND profile_id = p_user_id
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(p_org_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_organizations
    WHERE organization_id = p_org_id
      AND profile_id = p_user_id
      AND is_active = true
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(p_user_id UUID DEFAULT auth.uid())
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT tm.tenant_id
  FROM public.tenant_members tm
  WHERE tm.profile_id = p_user_id AND tm.is_active = true
  UNION
  SELECT o.tenant_id
  FROM public.profile_organizations po
  JOIN public.organizations o ON o.id = po.organization_id
  WHERE po.profile_id = p_user_id AND po.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.get_user_tenant_ids(p_user_id) t WHERE t = p_tenant_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(
  p_tenant_id UUID,
  p_role TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = p_tenant_id
      AND tm.profile_id = p_user_id
      AND tm.is_active = true
      AND tm.role = p_role
  )
  OR (
    p_role = 'admin' AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = p_tenant_id
        AND tm.profile_id = p_user_id
        AND tm.is_active = true
        AND tm.role = 'owner'
    )
  );
$$;

-- ============================================
-- 6. RLS POLICIES (TENANTS + STORY OWNERSHIP)
-- ============================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant members can view tenant" ON public.tenants;
CREATE POLICY "Tenant members can view tenant"
  ON public.tenants
  FOR SELECT
  USING (public.is_tenant_member(id) OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant admins can manage tenant" ON public.tenants;
CREATE POLICY "Tenant admins can manage tenant"
  ON public.tenants
  FOR UPDATE
  USING (public.has_tenant_role(id, 'admin') OR public.has_tenant_role(id, 'owner') OR public.is_super_admin())
  WITH CHECK (public.has_tenant_role(id, 'admin') OR public.has_tenant_role(id, 'owner') OR public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can create tenants" ON public.tenants;
CREATE POLICY "Super admins can create tenants"
  ON public.tenants
  FOR INSERT
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete tenants" ON public.tenants;
CREATE POLICY "Super admins can delete tenants"
  ON public.tenants
  FOR DELETE
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Tenant members can view membership" ON public.tenant_members;
CREATE POLICY "Tenant members can view membership"
  ON public.tenant_members
  FOR SELECT
  USING (public.is_tenant_member(tenant_id) OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant admins can manage membership" ON public.tenant_members;
CREATE POLICY "Tenant admins can manage membership"
  ON public.tenant_members
  FOR ALL
  USING (public.has_tenant_role(tenant_id, 'admin') OR public.has_tenant_role(tenant_id, 'owner') OR public.is_super_admin())
  WITH CHECK (public.has_tenant_role(tenant_id, 'admin') OR public.has_tenant_role(tenant_id, 'owner') OR public.is_super_admin());

-- Story distributions policies
DROP POLICY IF EXISTS "Users can view distributions for their own stories" ON public.story_distributions;
DROP POLICY IF EXISTS "Users can manage distributions for their own stories" ON public.story_distributions;
DROP POLICY IF EXISTS "Admins can manage all distributions" ON public.story_distributions;

CREATE POLICY "Story owners can view distributions"
  ON public.story_distributions FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view distributions"
  ON public.story_distributions FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND public.is_organization_member(organization_id)
  );

CREATE POLICY "Tenant admins can manage distributions"
  ON public.story_distributions FOR ALL
  USING (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  );

CREATE POLICY "Story owners can manage distributions"
  ON public.story_distributions FOR ALL
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  )
  WITH CHECK (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

-- Embed tokens policies
DROP POLICY IF EXISTS "Users can view tokens for their own stories" ON public.embed_tokens;
DROP POLICY IF EXISTS "Users can manage tokens for their own stories" ON public.embed_tokens;

CREATE POLICY "Story owners can view embed tokens"
  ON public.embed_tokens FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view embed tokens"
  ON public.embed_tokens FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND public.is_organization_member(organization_id)
  );

CREATE POLICY "Tenant admins can manage embed tokens"
  ON public.embed_tokens FOR ALL
  USING (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  );

CREATE POLICY "Story owners can manage embed tokens"
  ON public.embed_tokens FOR ALL
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  )
  WITH CHECK (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view audit logs for their own entities" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Users can view audit logs for their own entities"
  ON public.audit_logs FOR SELECT
  USING (
    actor_id = auth.uid()
    OR entity_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND public.is_organization_member(organization_id)
  );

CREATE POLICY "Tenant admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  );

CREATE POLICY "Users can insert audit logs for themselves"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND public.is_tenant_member(tenant_id)
  );

-- Deletion requests policies
DROP POLICY IF EXISTS "Users can view their own deletion requests" ON public.deletion_requests;
DROP POLICY IF EXISTS "Users can create their own deletion requests" ON public.deletion_requests;
DROP POLICY IF EXISTS "Admins can manage all deletion requests" ON public.deletion_requests;

CREATE POLICY "Users can view their own deletion requests"
  ON public.deletion_requests FOR SELECT
  USING (user_id = auth.uid() AND public.is_tenant_member(tenant_id));

CREATE POLICY "Users can create their own deletion requests"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can manage deletion requests"
  ON public.deletion_requests FOR ALL
  USING (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  );

-- Story syndication consent policies
DROP POLICY IF EXISTS "Storytellers can view their consent records" ON public.story_syndication_consent;
DROP POLICY IF EXISTS "Storytellers can insert consent for their stories" ON public.story_syndication_consent;
DROP POLICY IF EXISTS "Storytellers can update their consent" ON public.story_syndication_consent;
DROP POLICY IF EXISTS "Storytellers can delete their consent" ON public.story_syndication_consent;
DROP POLICY IF EXISTS "Service role full access to consent" ON public.story_syndication_consent;

CREATE POLICY "Storytellers can view their consent records"
  ON public.story_syndication_consent
  FOR SELECT
  TO authenticated
  USING (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can insert consent for their stories"
  ON public.story_syndication_consent
  FOR INSERT
  TO authenticated
  WITH CHECK (
    storyteller_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Storytellers can update their consent"
  ON public.story_syndication_consent
  FOR UPDATE
  TO authenticated
  USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can delete their consent"
  ON public.story_syndication_consent
  FOR DELETE
  TO authenticated
  USING (storyteller_id = auth.uid());

CREATE POLICY "Tenant admins can view consent"
  ON public.story_syndication_consent
  FOR SELECT
  USING (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  );

CREATE POLICY "Service role full access to consent"
  ON public.story_syndication_consent
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Story access log policies
DROP POLICY IF EXISTS "Storytellers can view access logs for their stories" ON public.story_access_log;
DROP POLICY IF EXISTS "Service role can insert access logs" ON public.story_access_log;
DROP POLICY IF EXISTS "Service role can read access logs" ON public.story_access_log;

CREATE POLICY "Storytellers can view access logs for their stories"
  ON public.story_access_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can view access logs"
  ON public.story_access_log
  FOR SELECT
  USING (
    public.has_tenant_role(tenant_id, 'admin')
    OR public.has_tenant_role(tenant_id, 'owner')
    OR public.is_super_admin()
  );

CREATE POLICY "Service role can insert access logs"
  ON public.story_access_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read access logs"
  ON public.story_access_log
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- 7. GRANTS
-- ============================================

GRANT ALL ON public.tenants TO service_role;
GRANT ALL ON public.tenant_members TO service_role;
