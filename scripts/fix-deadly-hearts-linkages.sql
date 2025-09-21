-- Fix Deadly Hearts Project Linkages
-- This script creates proper junction tables and links everything correctly

-- 1. Create project-organization junction table (many-to-many)
CREATE TABLE IF NOT EXISTS project_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'partner', -- 'lead', 'partner', 'supporter'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, organization_id)
);

-- 2. Create project-storyteller junction table (many-to-many)
CREATE TABLE IF NOT EXISTS project_storytellers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant', -- 'lead', 'participant', 'contributor'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, storyteller_id)
);

-- 3. Add project_id to photo_galleries table if it doesn't exist
ALTER TABLE photo_galleries 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- 4. Get the IDs we need
-- Deadly Hearts Project ID: 29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7
-- Snow Foundation ID: 4a1c31e8-89b7-476d-a74b-0c8b37efc850
-- A Curious Tractor ID: db0de7bd-eb10-446b-99e9-0f3b7c199b8a

-- 5. Link Deadly Hearts Project to BOTH organizations
INSERT INTO project_organizations (project_id, organization_id, role) VALUES
('29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 'lead'),     -- Snow Foundation as lead
('29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7', 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a', 'partner')    -- A Curious Tractor as partner
ON CONFLICT (project_id, organization_id) DO NOTHING;

-- 6. Link ALL Snow Foundation storytellers to Deadly Hearts Project
INSERT INTO project_storytellers (project_id, storyteller_id, role)
SELECT 
    '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7' as project_id,
    p.id as storyteller_id,
    'participant' as role
FROM profiles p
JOIN organizations o ON p.tenant_id = o.tenant_id
WHERE o.id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'  -- Snow Foundation
AND p.user_type = 'storyteller'
ON CONFLICT (project_id, storyteller_id) DO NOTHING;

-- 7. Link Deadly Hearts gallery to Deadly Hearts project
UPDATE photo_galleries 
SET project_id = '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7'
WHERE gallery_name = 'Deadly Hearts Trek 2025'
AND organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_organizations_project_id ON project_organizations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_organizations_organization_id ON project_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_storytellers_project_id ON project_storytellers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_storytellers_storyteller_id ON project_storytellers(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_photo_galleries_project_id ON photo_galleries(project_id);

-- 9. Verify the connections
SELECT 'Project-Organization Links' as type, COUNT(*) as count FROM project_organizations;
SELECT 'Project-Storyteller Links' as type, COUNT(*) as count FROM project_storytellers;
SELECT 'Gallery-Project Links' as type, COUNT(*) as count FROM photo_galleries WHERE project_id IS NOT NULL;