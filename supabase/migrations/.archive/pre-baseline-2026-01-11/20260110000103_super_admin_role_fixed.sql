-- Super Admin Role Implementation (Fixed for current schema)
-- Enables cross-organization content management with full audit trail

-- 1. Add super_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_super_admin ON public.profiles(is_super_admin) WHERE is_super_admin = TRUE;

COMMENT ON COLUMN profiles.is_super_admin IS 'User has super-admin privileges across all organizations';

-- 2. Create super_admin_permissions table for granular control
CREATE TABLE IF NOT EXISTS public.super_admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'manage_all_organizations',    -- Full org management
    'cross_org_publishing',         -- Publish to any org
    'content_moderation',           -- Pull down/edit/refuse content
    'super_admin_dashboard',        -- Access unified dashboard
    'manage_syndication',           -- Control all syndication
    'social_media_publishing',      -- Post to social platforms
    'analytics_access'              -- View all analytics
  )),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, permission_type)
);

CREATE INDEX idx_super_admin_permissions_profile ON public.super_admin_permissions(profile_id);
CREATE INDEX idx_super_admin_permissions_active ON public.super_admin_permissions(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE public.super_admin_permissions IS 'Granular super-admin permissions with expiration support';

-- 3. Create audit trail for super-admin actions
CREATE TABLE IF NOT EXISTS public.super_admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,  -- 'publish', 'edit', 'delete', 'pull_down', 'refuse', 'create', 'update'
  target_type TEXT NOT NULL,  -- 'story', 'organization', 'storyteller', 'syndication', 'media'
  target_id UUID,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action_metadata JSONB DEFAULT '{}'::jsonb,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

CREATE INDEX idx_super_admin_audit_log_profile ON public.super_admin_audit_log(admin_profile_id, performed_at DESC);
CREATE INDEX idx_super_admin_audit_log_target ON public.super_admin_audit_log(target_type, target_id);
CREATE INDEX idx_super_admin_audit_log_org ON public.super_admin_audit_log(organization_id);
CREATE INDEX idx_super_admin_audit_log_performed ON public.super_admin_audit_log(performed_at DESC);

COMMENT ON TABLE public.super_admin_audit_log IS 'Complete audit trail of all super-admin actions';

-- 4. Create helper function to check super-admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = profile_id
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_super_admin IS 'Check if a profile has super-admin privileges';

-- 5. Create helper function to log super-admin actions
CREATE OR REPLACE FUNCTION public.log_super_admin_action(
  p_profile_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.super_admin_audit_log (
    admin_profile_id,
    action_type,
    target_type,
    target_id,
    organization_id,
    action_metadata
  ) VALUES (
    p_profile_id,
    p_action_type,
    p_target_type,
    p_target_id,
    p_organization_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.log_super_admin_action IS 'Log a super-admin action to audit trail';
