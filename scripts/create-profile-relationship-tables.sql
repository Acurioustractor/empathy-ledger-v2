-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  UNIQUE(name, city, state, country)
);

-- Create profile_locations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  location_type VARCHAR(50), -- 'home', 'work', 'origin', etc.
  UNIQUE(profile_id, location_id)
);

-- Create profile_organizations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(100), -- 'member', 'admin', 'storyteller', etc.
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
  role VARCHAR(100), -- 'participant', 'lead', 'contributor', etc.
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, project_id)
);

-- Create profile_galleries table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  role VARCHAR(100), -- 'owner', 'contributor', 'featured', etc.
  UNIQUE(profile_id, gallery_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_locations_profile_id ON profile_locations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_locations_location_id ON profile_locations(location_id);
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

-- Insert some sample locations
INSERT INTO locations (name, city, state, country) VALUES
  ('Sydney', 'Sydney', 'NSW', 'Australia'),
  ('Melbourne', 'Melbourne', 'VIC', 'Australia'),
  ('Brisbane', 'Brisbane', 'QLD', 'Australia'),
  ('Perth', 'Perth', 'WA', 'Australia'),
  ('Adelaide', 'Adelaide', 'SA', 'Australia'),
  ('Darwin', 'Darwin', 'NT', 'Australia'),
  ('Hobart', 'Hobart', 'TAS', 'Australia'),
  ('Canberra', 'Canberra', 'ACT', 'Australia')
ON CONFLICT (name, city, state, country) DO NOTHING;