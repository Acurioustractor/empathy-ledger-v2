-- ACT Project Integration - Final Clean Version
-- Works with existing storyteller_project_features table

-- =====================================================
-- ACT PROJECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS act_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  project_site_url TEXT,
  organization_name TEXT,
  organization_id UUID,
  focus_areas TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  allows_storyteller_optin BOOLEAN DEFAULT TRUE,
  allows_story_featuring BOOLEAN DEFAULT TRUE,
  display_config JSONB DEFAULT '{
    "max_storytellers": 5,
    "max_stories": 3,
    "auto_approve_storytellers": false,
    "auto_approve_stories": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_act_projects_slug ON act_projects(slug);
CREATE INDEX IF NOT EXISTS idx_act_projects_organization ON act_projects(organization_name);

-- =====================================================
-- ACT ADMINS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS act_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  can_approve_storytellers BOOLEAN DEFAULT TRUE,
  can_approve_stories BOOLEAN DEFAULT TRUE,
  can_manage_projects BOOLEAN DEFAULT TRUE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_act_admins_user_id ON act_admins(user_id);

-- =====================================================
-- STORY PROJECT FEATURES (New table)
-- =====================================================

CREATE TABLE IF NOT EXISTS story_project_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  act_project_id UUID NOT NULL REFERENCES act_projects(id) ON DELETE CASCADE,
  approved_by_act BOOLEAN DEFAULT FALSE NOT NULL,
  is_visible BOOLEAN GENERATED ALWAYS AS (approved_by_act) STORED,
  featured_quote TEXT,
  featured_image_url TEXT,
  tagged_at TIMESTAMPTZ DEFAULT NOW(),
  tagged_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES act_admins(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, act_project_id)
);

CREATE INDEX IF NOT EXISTS idx_story_features_story ON story_project_features(story_id);
CREATE INDEX IF NOT EXISTS idx_story_features_project ON story_project_features(act_project_id);
CREATE INDEX IF NOT EXISTS idx_story_features_visible ON story_project_features(is_visible) WHERE is_visible = TRUE;

-- =====================================================
-- CONVENIENCE VIEW: Featured Storytellers
-- Uses existing column names from storyteller_project_features
-- =====================================================

CREATE OR REPLACE VIEW act_featured_storytellers AS
SELECT
  spf.id,
  spf.storyteller_id,
  spf.act_project_id,
  p.slug AS project_slug,
  p.title AS project_title,
  u.email AS storyteller_email,
  u.raw_user_meta_data->>'display_name' AS display_name,
  u.raw_user_meta_data->>'profile_image_url' AS profile_image_url,
  spf.feature_bio AS featured_bio,
  spf.feature_tagline AS featured_tagline,
  spf.feature_image_url AS featured_image_url,
  spf.opted_in_at,
  spf.approved_at,
  spf.created_at,
  spf.updated_at
FROM storyteller_project_features spf
JOIN act_projects p ON p.id = spf.act_project_id
JOIN auth.users u ON u.id = spf.storyteller_id
WHERE spf.is_visible = TRUE
  AND p.is_active = TRUE;

-- =====================================================
-- SEED DATA: All 9 ACT Projects
-- =====================================================

INSERT INTO act_projects (slug, title, organization_name, focus_areas, themes, description, website_url, project_site_url)
VALUES
  ('justicehub', 'JusticeHub', 'JusticeHub', ARRAY['Justice', 'Youth', 'Technology', 'Advocacy'], ARRAY['Community Healing', 'Systems Change', 'Youth Empowerment'], 'Youth justice advocacy platform connecting young people with support services and sharing their stories.', 'https://act.place/projects/justicehub', 'https://justicehub.org'),
  ('goods', 'Goods.', 'Goods.', ARRAY['Environment', 'Circular Economy', 'Asset Management'], ARRAY['Sustainability', 'Resource Tracking', 'Community Assets'], 'Asset register and circular economy platform for tracking and sharing community resources.', 'https://act.place/projects/goods', NULL),
  ('bg-fit', 'BG Fit', 'BG Fit', ARRAY['Health', 'Wellness', 'Community'], ARRAY['Physical Wellbeing', 'Social Connection', 'Active Living'], 'Community fitness and wellbeing initiative promoting active, healthy lifestyles.', 'https://act.place/projects/bg-fit', NULL),
  ('the-harvest', 'The Harvest', 'The Harvest', ARRAY['Agriculture', 'Heritage', 'Community', 'Education'], ARRAY['Cultural Preservation', 'Sustainable Farming', 'Intergenerational Learning'], 'Heritage farm and community hub preserving agricultural traditions and promoting sustainable practices.', 'https://act.place/projects/the-harvest', 'https://theharvest.org.au'),
  ('act-farm', 'ACT Farm', 'ACT Farm', ARRAY['Conservation', 'Research', 'Arts', 'Wellness'], ARRAY['Regenerative Agriculture', 'Creative Practice', 'Therapeutic Landscapes'], 'Research and residency farm focused on regenerative practices and creative conservation.', 'https://act.place/projects/act-farm', 'https://actfarm.org.au'),
  ('junes-patch', 'Junes Patch', 'ACT Farm', ARRAY['Health', 'Agriculture', 'Therapy', 'Nature'], ARRAY['Therapeutic Landscapes', 'Social Prescribing', 'Nature Connection'], 'Therapeutic garden and nature-based health program offering social prescribing and healing spaces.', 'https://act.place/projects/junes-patch', 'https://actfarm.org.au/junes-patch'),
  ('place-based-policy-lab', 'Place-Based Policy Lab', 'ACT', ARRAY['Policy', 'Research', 'Community Development', 'Systems Change'], ARRAY['Evidence-Based Practice', 'Community-Led Policy', 'Participatory Research'], 'Research initiative developing evidence-based, community-informed policies for place-based change.', 'https://act.place/projects/place-based-policy-lab', NULL),
  ('local-seasonal-supply', 'Local Seasonal Supply', 'ACT Farm', ARRAY['Agriculture', 'Food Systems', 'Local Economy'], ARRAY['Food Security', 'Regenerative Farming', 'Community Provisioning'], 'Local food network connecting regenerative farms with community buyers for seasonal produce.', 'https://act.place/projects/local-seasonal-supply', NULL),
  ('empathy-ledger', 'Empathy Ledger', 'Empathy Ledger', ARRAY['Storytelling', 'Technology', 'Community', 'Data Sovereignty'], ARRAY['Narrative Power', 'Digital Ethics', 'Community Voice'], 'AI-enhanced storytelling platform centering community voices while preserving data sovereignty.', 'https://act.place/projects/empathy-ledger', 'https://empathyledger.com')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE act_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE act_admins ENABLE ROW LEVEL SECURITY;

-- ACT Projects policies
DROP POLICY IF EXISTS "Public can view active ACT projects" ON act_projects;
CREATE POLICY "Public can view active ACT projects" ON act_projects FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "ACT admins can manage projects" ON act_projects;
CREATE POLICY "ACT admins can manage projects" ON act_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM act_admins WHERE user_id = auth.uid() AND can_manage_projects = TRUE AND revoked_at IS NULL)
);

-- Story Features policies
DROP POLICY IF EXISTS "ACT admins can manage story features" ON story_project_features;
CREATE POLICY "ACT admins can manage story features" ON story_project_features FOR ALL USING (
  EXISTS (SELECT 1 FROM act_admins WHERE user_id = auth.uid() AND can_approve_stories = TRUE AND revoked_at IS NULL)
);

DROP POLICY IF EXISTS "Public can view approved story features" ON story_project_features;
CREATE POLICY "Public can view approved story features" ON story_project_features FOR SELECT USING (is_visible = TRUE);

-- ACT Admins policies
DROP POLICY IF EXISTS "Users can view their own admin status" ON act_admins;
CREATE POLICY "Users can view their own admin status" ON act_admins FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage other admins" ON act_admins;
CREATE POLICY "Super admins can manage other admins" ON act_admins FOR ALL USING (
  EXISTS (SELECT 1 FROM act_admins WHERE user_id = auth.uid() AND role = 'super_admin' AND revoked_at IS NULL)
);

-- =====================================================
-- GRANT YOUR ADMIN PERMISSIONS
-- =====================================================

INSERT INTO act_admins (user_id, role, granted_by, granted_at)
VALUES ('d0a162d2-282e-4653-9d12-aa934c9dfa4e', 'super_admin', 'd0a162d2-282e-4653-9d12-aa934c9dfa4e', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  can_approve_storytellers = TRUE,
  can_approve_stories = TRUE,
  can_manage_projects = TRUE,
  revoked_at = NULL;
