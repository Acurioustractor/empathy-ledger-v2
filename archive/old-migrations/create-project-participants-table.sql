-- Create project_participants table to manage storyteller-project associations
CREATE TABLE IF NOT EXISTS project_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'participant',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique project-storyteller combinations
    UNIQUE(project_id, storyteller_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_participants_project_id ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_storyteller_id ON project_participants(storyteller_id);

-- Add RLS policies
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view project participants if they have access to the project
CREATE POLICY "Users can view project participants" ON project_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = project_participants.project_id 
            AND p.tenant_id = auth.jwt() ->> 'tenant_id'
        )
    );

-- Policy: Users can manage project participants if they are admins of the tenant
CREATE POLICY "Admins can manage project participants" ON project_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects p 
            JOIN profiles prof ON prof.tenant_id = p.tenant_id
            WHERE p.id = project_participants.project_id 
            AND prof.id = auth.uid()
            AND (prof.tenant_roles ? 'admin' OR prof.is_admin = true)
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_participants_updated_at
    BEFORE UPDATE ON project_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_project_participants_updated_at();