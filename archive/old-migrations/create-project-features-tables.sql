-- Create galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  photographer TEXT,
  order_index INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_galleries_project_id ON galleries(project_id);
CREATE INDEX IF NOT EXISTS idx_galleries_organization_id ON galleries(organization_id);
CREATE INDEX IF NOT EXISTS idx_galleries_tenant_id ON galleries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for galleries
CREATE POLICY "Users can view galleries in their tenant" ON galleries
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
  );

CREATE POLICY "Users can create galleries in their tenant" ON galleries
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
  );

CREATE POLICY "Users can update galleries in their tenant" ON galleries
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
  );

CREATE POLICY "Users can delete galleries in their tenant" ON galleries
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
  );

-- RLS Policies for gallery_photos
CREATE POLICY "Users can view gallery photos in their tenant" ON gallery_photos
  FOR SELECT USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE 
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
    )
  );

CREATE POLICY "Users can create gallery photos in their tenant" ON gallery_photos
  FOR INSERT WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries WHERE 
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
    )
  );

CREATE POLICY "Users can update gallery photos in their tenant" ON gallery_photos
  FOR UPDATE USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE 
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
    )
  );

CREATE POLICY "Users can delete gallery photos in their tenant" ON gallery_photos
  FOR DELETE USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE 
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
    )
  );

-- RLS Policies for project_updates
CREATE POLICY "Users can view project updates in their tenant" ON project_updates
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE 
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
    )
  );

CREATE POLICY "Users can create project updates in their tenant" ON project_updates
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE 
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
    )
  );

CREATE POLICY "Users can update their own project updates" ON project_updates
  FOR UPDATE USING (
    created_by = auth.uid() OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
  );

CREATE POLICY "Users can delete their own project updates" ON project_updates
  FOR DELETE USING (
    created_by = auth.uid() OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_super_admin = true)
  );

-- Insert some sample data for testing
INSERT INTO galleries (title, description, project_id, tenant_id, created_by) VALUES
('Community Gathering Photos', 'Photos from our community storytelling session', 
 (SELECT id FROM projects LIMIT 1), 
 (SELECT tenant_id FROM projects LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'benjamin@act.place' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO project_updates (project_id, content, created_by) VALUES
((SELECT id FROM projects LIMIT 1), 'Project kickoff meeting completed. Identified 5 key storytellers to interview.', 
 (SELECT id FROM profiles WHERE email = 'benjamin@act.place' LIMIT 1)),
((SELECT id FROM projects LIMIT 1), 'First round of interviews scheduled for next week. Community response has been very positive.', 
 (SELECT id FROM profiles WHERE email = 'benjamin@act.place' LIMIT 1))
ON CONFLICT DO NOTHING;