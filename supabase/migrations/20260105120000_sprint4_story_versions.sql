-- Sprint 4: Story Versions Table
-- Tracks version history for stories

CREATE TABLE IF NOT EXISTS story_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES storytellers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  restored_from UUID REFERENCES story_versions(id),
  change_summary TEXT,
  
  -- Ensure version numbers are unique per story
  UNIQUE(story_id, version_number)
);

-- Indexes for performance
CREATE INDEX idx_story_versions_story_id ON story_versions(story_id);
CREATE INDEX idx_story_versions_created_at ON story_versions(created_at DESC);
CREATE INDEX idx_story_versions_created_by ON story_versions(created_by);
CREATE INDEX idx_story_versions_version_number ON story_versions(story_id, version_number DESC);

-- Enable RLS
ALTER TABLE story_versions ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone with story access can view versions
CREATE POLICY "Users can view versions of stories they have access to"
  ON story_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_versions.story_id
      AND (
        stories.storyteller_id = auth.uid()
        OR stories.is_public = true
        OR EXISTS (
          SELECT 1 FROM story_collaborators
          WHERE story_collaborators.story_id = stories.id
          AND story_collaborators.collaborator_id IN (
            SELECT id FROM storytellers WHERE user_id = auth.uid()
          )
          AND story_collaborators.status = 'accepted'
        )
      )
    )
  );

-- Only authenticated users with edit permission can create versions
CREATE POLICY "Users can create versions for stories they can edit"
  ON story_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_versions.story_id
      AND (
        stories.storyteller_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM story_collaborators
          WHERE story_collaborators.story_id = stories.id
          AND story_collaborators.collaborator_id IN (
            SELECT id FROM storytellers WHERE user_id = auth.uid()
          )
          AND story_collaborators.can_edit = true
          AND story_collaborators.status = 'accepted'
        )
      )
    )
  );

-- Comments
COMMENT ON TABLE story_versions IS 'Version history for stories';
COMMENT ON COLUMN story_versions.version_number IS 'Sequential version number starting from 1';
COMMENT ON COLUMN story_versions.metadata IS 'Additional version metadata (story_type, cultural_sensitivity_level, etc.)';
COMMENT ON COLUMN story_versions.restored_from IS 'If this version is a restoration, reference to the source version';
COMMENT ON COLUMN story_versions.change_summary IS 'Optional description of changes in this version';
