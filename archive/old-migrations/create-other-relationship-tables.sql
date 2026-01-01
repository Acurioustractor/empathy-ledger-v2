-- Create profile_organizations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(profile_id, organization_id)
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  tenant_id UUID
);

-- Create profile_projects table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'participant',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, project_id)
);

-- Create profile_galleries table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'contributor',
  UNIQUE(profile_id, gallery_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_organizations_profile_id ON profile_organizations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_organizations_organization_id ON profile_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_profile_projects_profile_id ON profile_projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_projects_project_id ON profile_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_profile_galleries_profile_id ON profile_galleries(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_galleries_gallery_id ON profile_galleries(gallery_id);

-- Add is_featured column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_featured ON profiles(is_featured);