-- Super Admin Role Implementation
-- Enables cross-organization content management with full audit trail

-- 1. Add super_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_super_admin ON public.profiles(is_super_admin) WHERE is_super_admin = TRUE;

COMMENT ON COLUMN profiles.is_super_admin IS 'User has super-admin privileges across all organizations';

-- 2. Create super_admin_permissions table for granular control
CREATE TABLE IF NOT EXISTS public.super_admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_type)
);

CREATE INDEX idx_super_admin_permissions_user ON public.super_admin_permissions(user_id);
CREATE INDEX idx_super_admin_permissions_active ON public.super_admin_permissions(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE public.super_admin_permissions IS 'Granular super-admin permissions with expiration support';

-- 3. Create RLS policies for super-admins

-- Stories: Super admins can manage all stories
CREATE POLICY "super_admins_full_access_stories"
  ON public.stories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );

-- Organizations: Super admins can manage all organizations
CREATE POLICY "super_admins_full_access_organizations"
  ON public.organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );

-- Storytellers: Super admins can view all storytellers
CREATE POLICY "super_admins_full_access_storytellers"
  ON public.storytellers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );

-- Media Assets: Super admins can manage all media
CREATE POLICY "super_admins_full_access_media"
  ON public.media_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );

-- 4. Create audit trail for super-admin actions
CREATE TABLE IF NOT EXISTS public.super_admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

CREATE INDEX idx_super_admin_audit_log_admin ON public.super_admin_audit_log(admin_user_id, performed_at DESC);
CREATE INDEX idx_super_admin_audit_log_profile ON public.super_admin_audit_log(admin_profile_id, performed_at DESC);
CREATE INDEX idx_super_admin_audit_log_target ON public.super_admin_audit_log(target_type, target_id);
CREATE INDEX idx_super_admin_audit_log_org ON public.super_admin_audit_log(organization_id);
CREATE INDEX idx_super_admin_audit_log_performed ON public.super_admin_audit_log(performed_at DESC);

COMMENT ON TABLE public.super_admin_audit_log IS 'Complete audit trail of all super-admin actions';

-- 5. Create helper function to check super-admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_super_admin IS 'Check if a user has super-admin privileges';

-- 6. Create helper function to log super-admin actions
CREATE OR REPLACE FUNCTION public.log_super_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_profile_id UUID;
BEGIN
  -- Get profile ID for current user
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE id = auth.uid();

  INSERT INTO public.super_admin_audit_log (
    admin_user_id,
    admin_profile_id,
    action_type,
    target_type,
    target_id,
    organization_id,
    action_metadata
  ) VALUES (
    auth.uid(),
    v_profile_id,
    p_action_type,
    p_target_type,
    p_target_id,
    p_organization_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_super_admin_action IS 'Log a super-admin action to audit trail';

-- 7. Grant permissions on new tables/functions
GRANT SELECT, INSERT ON public.super_admin_permissions TO authenticated;
GRANT SELECT ON public.super_admin_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_super_admin_action TO authenticated;

-- 8. Enable RLS on new tables
ALTER TABLE public.super_admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS: Only super-admins can view permissions
CREATE POLICY "super_admins_view_permissions"
  ON public.super_admin_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );

-- RLS: Only super-admins can view audit log
CREATE POLICY "super_admins_view_audit_log"
  ON public.super_admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );

-- RLS: Only super-admins can insert audit log entries (via function)
CREATE POLICY "super_admins_insert_audit_log"
  ON public.super_admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = TRUE
    )
  );
