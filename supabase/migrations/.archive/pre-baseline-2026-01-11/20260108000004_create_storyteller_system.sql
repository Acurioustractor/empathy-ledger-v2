-- Create complete storyteller system tables
-- This migration creates all the tables needed for the storyteller management system

-- 1. Create storytellers table
CREATE TABLE IF NOT EXISTS public.storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  email text,
  bio text,
  cultural_background text,
  language_skills text[],
  location text,
  avatar_url text,
  profile_image_url text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_elder boolean DEFAULT false,
  profile_visibility text DEFAULT 'public',
  consent_to_share boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for storytellers
CREATE INDEX IF NOT EXISTS idx_storytellers_profile_id ON storytellers(profile_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_is_active ON storytellers(is_active);
CREATE INDEX IF NOT EXISTS idx_storytellers_is_featured ON storytellers(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_storytellers_is_elder ON storytellers(is_elder) WHERE is_elder = true;
CREATE INDEX IF NOT EXISTS idx_storytellers_email ON storytellers(email);
CREATE INDEX IF NOT EXISTS idx_storytellers_display_name ON storytellers(display_name);

-- 2. Create projects table (if not exists)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 3. Create project_storytellers junction table
CREATE TABLE IF NOT EXISTS public.project_storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storyteller_id uuid NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  role text DEFAULT 'contributor',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, storyteller_id)
);

CREATE INDEX IF NOT EXISTS idx_project_storytellers_project_id ON project_storytellers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_storytellers_storyteller_id ON project_storytellers(storyteller_id);

-- 4. Create storyteller_organizations junction table
CREATE TABLE IF NOT EXISTS public.storyteller_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id uuid NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text DEFAULT 'storyteller',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(storyteller_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_storyteller_organizations_storyteller_id ON storyteller_organizations(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_organizations_organization_id ON storyteller_organizations(organization_id);

-- 5. Populate storytellers from existing profiles that have stories
INSERT INTO public.storytellers (
  id,
  profile_id,
  display_name,
  email,
  bio,
  cultural_background,
  avatar_url,
  is_active,
  created_at,
  updated_at
)
SELECT DISTINCT
  COALESCE(s.storyteller_id, p.id) as id,
  p.id as profile_id,
  COALESCE(p.display_name, p.full_name, 'Anonymous') as display_name,
  p.email,
  p.bio,
  COALESCE(p.cultural_affiliations[1], '') as cultural_background,
  COALESCE(p.profile_image_url, p.avatar_url) as avatar_url,
  COALESCE(p.is_storyteller, true) as is_active,
  COALESCE(s.created_at, p.created_at, now()) as created_at,
  COALESCE(s.updated_at, p.updated_at, now()) as updated_at
FROM profiles p
LEFT JOIN stories s ON s.storyteller_id = p.id
WHERE p.is_storyteller = true OR s.id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Enable RLS
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_organizations ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for storytellers
DROP POLICY IF EXISTS "Public storytellers are viewable by everyone" ON storytellers;
CREATE POLICY "Public storytellers are viewable by everyone"
  ON storytellers FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their own storyteller profile" ON storytellers;
CREATE POLICY "Users can view their own storyteller profile"
  ON storytellers FOR SELECT
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Service role has full access to storytellers" ON storytellers;
CREATE POLICY "Service role has full access to storytellers"
  ON storytellers FOR ALL
  USING (true);

-- 8. RLS Policies for projects
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role has full access to projects" ON projects;
CREATE POLICY "Service role has full access to projects"
  ON projects FOR ALL
  USING (true);

-- 9. RLS Policies for project_storytellers
DROP POLICY IF EXISTS "Project storytellers are viewable by everyone" ON project_storytellers;
CREATE POLICY "Project storytellers are viewable by everyone"
  ON project_storytellers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role has full access to project_storytellers" ON project_storytellers;
CREATE POLICY "Service role has full access to project_storytellers"
  ON project_storytellers FOR ALL
  USING (true);

-- 10. RLS Policies for storyteller_organizations
DROP POLICY IF EXISTS "Storyteller organizations are viewable by everyone" ON storyteller_organizations;
CREATE POLICY "Storyteller organizations are viewable by everyone"
  ON storyteller_organizations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role has full access to storyteller_organizations" ON storyteller_organizations;
CREATE POLICY "Service role has full access to storyteller_organizations"
  ON storyteller_organizations FOR ALL
  USING (true);

-- 11. Add trigger for updated_at on storytellers
CREATE OR REPLACE FUNCTION update_storytellers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS storytellers_updated_at ON storytellers;
CREATE TRIGGER storytellers_updated_at
  BEFORE UPDATE ON storytellers
  FOR EACH ROW
  EXECUTE FUNCTION update_storytellers_updated_at();

-- 12. Add comments
COMMENT ON TABLE storytellers IS 'Storytellers - individuals who share stories on the platform';
COMMENT ON TABLE projects IS 'Projects - collections of stories and storytellers for a specific initiative';
COMMENT ON TABLE project_storytellers IS 'Junction table linking storytellers to projects';
COMMENT ON TABLE storyteller_organizations IS 'Junction table linking storytellers to organizations';
