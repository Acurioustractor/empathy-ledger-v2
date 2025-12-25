-- ACT Project Tagging & Feature Control System
-- Enables storytellers to opt-in to being featured on ACT project sites
-- while ACT admins can toggle visibility on/off
--
-- FIXED VERSION: Uses auth.users instead of storytellers table for compatibility

-- =====================================================
-- ACT PROJECTS TABLE - External ACT project registry
-- =====================================================

CREATE TABLE IF NOT EXISTS act_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project identification
  slug TEXT UNIQUE NOT NULL, -- matches ACT main website project slugs
  title TEXT NOT NULL,
  description TEXT,

  -- URLs
  website_url TEXT, -- e.g., https://act.place/projects/justicehub
  project_site_url TEXT, -- e.g., https://justicehub.org

  -- Organization mapping
  organization_name TEXT, -- e.g., "JusticeHub", "Goods.", "BG Fit"
  organization_id UUID, -- Optional: link to Empathy Ledger organization if exists

  -- Project metadata
  focus_areas TEXT[] DEFAULT '{}', -- ["Justice", "Youth", "Technology"]
  themes TEXT[] DEFAULT '{}', -- ["Community Healing", "Systems Change"]

  -- Feature settings
  is_active BOOLEAN DEFAULT TRUE,
  allows_storyteller_optin BOOLEAN DEFAULT TRUE, -- Can storytellers opt-in?
  allows_story_featuring BOOLEAN DEFAULT TRUE, -- Can stories be featured?

  -- Display settings
  display_config JSONB DEFAULT '{
    "max_storytellers": 5,
    "max_stories": 3,
    "auto_approve_storytellers": false,
    "auto_approve_stories": false
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_act_projects_slug ON act_projects(slug);
CREATE INDEX IF NOT EXISTS idx_act_projects_organization ON act_projects(organization_name);
CREATE INDEX IF NOT EXISTS idx_act_projects_active ON act_projects(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE act_projects IS 'Registry of ACT project sites that can feature Empathy Ledger stories and storytellers';

-- =====================================================
-- STORYTELLER PROJECT FEATURES - Opt-in control
-- =====================================================

CREATE TABLE IF NOT EXISTS storyteller_project_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Associations (using auth.users for compatibility)
  storyteller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  act_project_id UUID NOT NULL REFERENCES act_projects(id) ON DELETE CASCADE,

  -- Opt-in status (storyteller control)
  opted_in BOOLEAN DEFAULT FALSE, -- Did storyteller opt-in?
  opted_in_at TIMESTAMPTZ,
  opt_in_method TEXT, -- 'dashboard', 'invitation', 'admin_added'

  -- Approval status (ACT admin control)
  approved_by_act BOOLEAN DEFAULT FALSE, -- Did ACT approve?
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id), -- ACT admin who approved

  -- Computed visibility (both must be true)
  is_visible BOOLEAN GENERATED ALWAYS AS (opted_in AND approved_by_act) STORED,

  -- Feature settings
  feature_bio BOOLEAN DEFAULT TRUE, -- Show bio on project page?
  feature_stories BOOLEAN DEFAULT TRUE, -- Show stories on project page?
  featured_priority INTEGER DEFAULT 0, -- Higher = appears first (0-100)

  -- Display customization (storyteller can customize their appearance)
  custom_bio TEXT, -- Optional custom bio for this project
  custom_tagline TEXT, -- Optional custom tagline for this project

  -- Metadata
  notes TEXT, -- Internal notes (visible to ACT admins only)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one feature record per storyteller per project
  UNIQUE(storyteller_id, act_project_id)
);

CREATE INDEX IF NOT EXISTS idx_storyteller_features_storyteller ON storyteller_project_features(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_features_project ON storyteller_project_features(act_project_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_features_visible ON storyteller_project_features(act_project_id, is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_storyteller_features_priority ON storyteller_project_features(act_project_id, featured_priority DESC) WHERE is_visible = TRUE;

COMMENT ON TABLE storyteller_project_features IS 'Bidirectional control: storytellers opt-in, ACT admins approve';

-- =====================================================
-- STORY PROJECT TAGS - Story-level project associations
-- =====================================================

CREATE TABLE IF NOT EXISTS story_project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Associations
  story_id UUID NOT NULL, -- References stories(id) - will add FK once stories table confirmed
  act_project_id UUID NOT NULL REFERENCES act_projects(id) ON DELETE CASCADE,

  -- Tagging metadata
  tagged_by UUID REFERENCES auth.users(id), -- Who tagged the story?
  tagged_at TIMESTAMPTZ DEFAULT NOW(),
  tag_source TEXT DEFAULT 'manual' CHECK (tag_source IN ('manual', 'ai_suggested', 'admin_added', 'bulk_import')),

  -- Visibility control (storyteller control)
  storyteller_approved BOOLEAN DEFAULT TRUE, -- Storyteller allows featuring?
  storyteller_approved_at TIMESTAMPTZ,

  -- ACT admin toggle (ACT control)
  act_approved BOOLEAN DEFAULT FALSE, -- ACT admin approved featuring?
  act_approved_at TIMESTAMPTZ,
  act_approved_by UUID REFERENCES auth.users(id), -- ACT admin who approved

  -- Computed visibility (both must be true)
  is_featured BOOLEAN GENERATED ALWAYS AS (storyteller_approved AND act_approved) STORED,

  -- Display settings
  featured_priority INTEGER DEFAULT 0, -- Display order (0-100)
  featured_as_hero BOOLEAN DEFAULT FALSE, -- Show as hero/highlight?

  -- AI matching data (if tagged via AI)
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  ai_reasoning TEXT, -- Why AI suggested this match
  suggested_themes TEXT[], -- Themes AI identified

  -- Metadata
  notes TEXT, -- Internal notes

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one tag per story per project
  UNIQUE(story_id, act_project_id)
);

CREATE INDEX IF NOT EXISTS idx_story_tags_story ON story_project_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_project ON story_project_tags(act_project_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_featured ON story_project_tags(act_project_id, is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_story_tags_priority ON story_project_tags(act_project_id, featured_priority DESC) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_story_tags_ai_score ON story_project_tags(relevance_score DESC) WHERE relevance_score IS NOT NULL;

COMMENT ON TABLE story_project_tags IS 'Flexible story-to-project associations with bidirectional approval';

-- Add FK to stories table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stories') THEN
    ALTER TABLE story_project_tags
    ADD CONSTRAINT story_project_tags_story_id_fkey
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- ACT ADMIN PERMISSIONS - Who can manage ACT features
-- =====================================================

CREATE TABLE IF NOT EXISTS act_admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User (using auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permission level
  permission_level TEXT DEFAULT 'viewer' CHECK (
    permission_level IN ('viewer', 'editor', 'admin', 'super_admin')
  ),

  -- Specific permissions
  can_approve_storytellers BOOLEAN DEFAULT FALSE,
  can_approve_stories BOOLEAN DEFAULT FALSE,
  can_manage_projects BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT FALSE,
  can_manage_admins BOOLEAN DEFAULT FALSE,

  -- Scope (optional project restriction)
  project_ids UUID[], -- NULL = all projects, array = specific projects only

  -- Metadata
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_act_admins_user ON act_admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_act_admins_level ON act_admin_permissions(permission_level);
CREATE INDEX IF NOT EXISTS idx_act_admins_active ON act_admin_permissions(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE act_admin_permissions IS 'ACT staff who can approve storytellers and stories for featuring';

-- =====================================================
-- FEATURE REQUESTS - Storytellers request to be featured
-- =====================================================

CREATE TABLE IF NOT EXISTS act_feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request details
  storyteller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  act_project_id UUID NOT NULL REFERENCES act_projects(id) ON DELETE CASCADE,

  -- Request type
  request_type TEXT DEFAULT 'storyteller' CHECK (
    request_type IN ('storyteller', 'story', 'storyteller_and_stories')
  ),

  -- Storyteller's pitch
  why_feature_me TEXT, -- Why should this project feature me/my story?
  relevant_experience TEXT,
  alignment_notes TEXT, -- How my work aligns with this project

  -- Status workflow
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'under_review', 'approved', 'declined', 'withdrawn')
  ),

  -- Review tracking
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT, -- ACT admin review notes
  decline_reason TEXT,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_requests_storyteller ON act_feature_requests(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_project ON act_feature_requests(act_project_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON act_feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_pending ON act_feature_requests(act_project_id, status) WHERE status = 'pending';

COMMENT ON TABLE act_feature_requests IS 'Storytellers can request to be featured on ACT projects';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Update updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is ACT admin
CREATE OR REPLACE FUNCTION is_act_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM act_admin_permissions
    WHERE user_id = user_uuid
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve storyteller for project
CREATE OR REPLACE FUNCTION approve_storyteller_feature(
  feature_id UUID,
  admin_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if admin has permission
  IF NOT EXISTS (
    SELECT 1 FROM act_admin_permissions
    WHERE user_id = admin_uuid
    AND is_active = TRUE
    AND can_approve_storytellers = TRUE
  ) THEN
    RAISE EXCEPTION 'User does not have permission to approve storytellers';
  END IF;

  -- Approve the feature
  UPDATE storyteller_project_features
  SET
    approved_by_act = TRUE,
    approved_at = NOW(),
    approved_by = admin_uuid,
    updated_at = NOW()
  WHERE id = feature_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve story for project
CREATE OR REPLACE FUNCTION approve_story_feature(
  tag_id UUID,
  admin_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if admin has permission
  IF NOT EXISTS (
    SELECT 1 FROM act_admin_permissions
    WHERE user_id = admin_uuid
    AND is_active = TRUE
    AND can_approve_stories = TRUE
  ) THEN
    RAISE EXCEPTION 'User does not have permission to approve stories';
  END IF;

  -- Approve the tag
  UPDATE story_project_tags
  SET
    act_approved = TRUE,
    act_approved_at = NOW(),
    act_approved_by = admin_uuid,
    updated_at = NOW()
  WHERE id = tag_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_act_projects_updated_at
  BEFORE UPDATE ON act_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storyteller_features_updated_at
  BEFORE UPDATE ON storyteller_project_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_tags_updated_at
  BEFORE UPDATE ON story_project_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_act_admins_updated_at
  BEFORE UPDATE ON act_admin_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON act_feature_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE act_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE act_admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE act_feature_requests ENABLE ROW LEVEL SECURITY;

-- ACT Projects - Public read, admin write
CREATE POLICY "Anyone can view active ACT projects" ON act_projects
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "ACT admins can manage projects" ON act_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND can_manage_projects = TRUE
    )
  );

-- Storyteller Project Features
CREATE POLICY "Storytellers can view their own features" ON storyteller_project_features
  FOR SELECT USING (storyteller_id = auth.uid());

CREATE POLICY "Anyone can view approved features" ON storyteller_project_features
  FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Storytellers can opt-in to projects" ON storyteller_project_features
  FOR INSERT WITH CHECK (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can update their own feature settings" ON storyteller_project_features
  FOR UPDATE USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

CREATE POLICY "ACT admins can approve storyteller features" ON storyteller_project_features
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND can_approve_storytellers = TRUE
      AND (project_ids IS NULL OR act_project_id = ANY(project_ids))
    )
  );

-- Story Project Tags
CREATE POLICY "Storytellers can view tags for their stories" ON story_project_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE id = story_id AND storyteller_id = auth.uid())
  );

CREATE POLICY "Anyone can view featured stories" ON story_project_tags
  FOR SELECT USING (is_featured = TRUE);

CREATE POLICY "Storytellers can tag their own stories" ON story_project_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stories WHERE id = story_id AND storyteller_id = auth.uid())
  );

CREATE POLICY "Storytellers can update tags for their stories" ON story_project_tags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stories WHERE id = story_id AND storyteller_id = auth.uid())
  );

CREATE POLICY "ACT admins can approve story tags" ON story_project_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND can_approve_stories = TRUE
      AND (project_ids IS NULL OR act_project_id = ANY(project_ids))
    )
  );

CREATE POLICY "ACT admins can create story tags" ON story_project_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND can_approve_stories = TRUE
    )
  );

-- Feature Requests
CREATE POLICY "Storytellers can view their own requests" ON act_feature_requests
  FOR SELECT USING (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can create requests" ON act_feature_requests
  FOR INSERT WITH CHECK (storyteller_id = auth.uid());

CREATE POLICY "ACT admins can view all requests" ON act_feature_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
    )
  );

CREATE POLICY "ACT admins can update requests" ON act_feature_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Admin Permissions
CREATE POLICY "Admins can view their own permissions" ON act_admin_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all permissions" ON act_admin_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM act_admin_permissions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND can_manage_admins = TRUE
    )
  );

-- =====================================================
-- SEED DATA - Import ACT projects
-- =====================================================

INSERT INTO act_projects (slug, title, organization_name, focus_areas, themes, display_config) VALUES
('justicehub', 'JusticeHub', 'JusticeHub',
  ARRAY['Justice', 'Youth', 'Technology'],
  ARRAY['Systems Change', 'Community Support'],
  '{"max_storytellers": 5, "max_stories": 3, "auto_approve_storytellers": false}'::jsonb),

('empathy-ledger', 'Empathy Ledger', 'Empathy Ledger',
  ARRAY['Technology', 'Storytelling', 'Sovereignty'],
  ARRAY['Indigenous Data Sovereignty', 'Community Voice'],
  '{"max_storytellers": 5, "max_stories": 3, "auto_approve_storytellers": false}'::jsonb),

('goods-on-country', 'Goods on Country', 'Goods.',
  ARRAY['Innovation', 'Design', 'Indigenous'],
  ARRAY['Product Design', 'Cultural Design'],
  '{"max_storytellers": 5, "max_stories": 3, "auto_approve_storytellers": false}'::jsonb),

('fishers-oysters', 'Fishers Oysters', 'Fishers Oysters',
  ARRAY['Environment', 'Community', 'Food'],
  ARRAY['Environmental Restoration', 'Community Enterprise'],
  '{"max_storytellers": 3, "max_stories": 2, "auto_approve_storytellers": false}'::jsonb),

('bg-fit-mount-isa', 'BG Fit Mount Isa', 'BG Fit',
  ARRAY['Health', 'Community', 'Youth'],
  ARRAY['Community Health', 'Youth Empowerment'],
  '{"max_storytellers": 3, "max_stories": 2, "auto_approve_storytellers": false}'::jsonb),

('quandamooka-justice-healing', 'Quandamooka Justice and Healing Strategy', 'MMEIC',
  ARRAY['Justice', 'Healing', 'Indigenous'],
  ARRAY['Community Justice', 'Healing Practices'],
  '{"max_storytellers": 5, "max_stories": 3, "auto_approve_storytellers": false}'::jsonb),

('picc-centre-precinct', 'PICC Centre Precinct', 'PICC',
  ARRAY['Community', 'Culture', 'Indigenous'],
  ARRAY['Cultural Center', 'Community Hub'],
  '{"max_storytellers": 4, "max_stories": 3, "auto_approve_storytellers": false}'::jsonb),

('tomnet', 'TOMNET', 'TOMNET',
  ARRAY['Community', 'Support', 'Indigenous'],
  ARRAY['Community Network', 'Elder Support'],
  '{"max_storytellers": 3, "max_stories": 2, "auto_approve_storytellers": false}'::jsonb),

('mounty-yarns', 'Mounty Yarns', 'Mounty Yarns',
  ARRAY['Community', 'Storytelling', 'Connection'],
  ARRAY['Community Stories', 'Local Knowledge'],
  '{"max_storytellers": 4, "max_stories": 3, "auto_approve_storytellers": false}'::jsonb)

ON CONFLICT (slug) DO NOTHING;
