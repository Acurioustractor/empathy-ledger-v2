-- Sprint 4: Story Collaborators Table
-- Manages collaboration on stories

CREATE TABLE IF NOT EXISTS story_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES storytellers(id),
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'co-author')),
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_publish BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  invitation_message TEXT,
  
  -- A collaborator can only be added once per story
  UNIQUE(story_id, collaborator_id)
);

-- Indexes for performance
CREATE INDEX idx_story_collaborators_story_id ON story_collaborators(story_id);
CREATE INDEX idx_story_collaborators_collaborator_id ON story_collaborators(collaborator_id);
CREATE INDEX idx_story_collaborators_status ON story_collaborators(status);
CREATE INDEX idx_story_collaborators_invited_at ON story_collaborators(invited_at DESC);

-- Enable RLS
ALTER TABLE story_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies: Story owner and collaborators can view
CREATE POLICY "Story owners and collaborators can view collaborations"
  ON story_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_collaborators.story_id
      AND (
        stories.storyteller_id = auth.uid()
        OR story_collaborators.collaborator_id IN (
          SELECT id FROM storytellers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Only story owner can invite collaborators
CREATE POLICY "Story owners can invite collaborators"
  ON story_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_collaborators.story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

-- Story owner can update collaborator permissions
CREATE POLICY "Story owners can update collaborator permissions"
  ON story_collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_collaborators.story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

-- Story owner can remove collaborators, or collaborators can remove themselves
CREATE POLICY "Story owners can remove collaborators"
  ON story_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_collaborators.story_id
      AND (
        stories.storyteller_id = auth.uid()
        OR story_collaborators.collaborator_id IN (
          SELECT id FROM storytellers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_story_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER story_collaborators_updated_at
  BEFORE UPDATE ON story_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_story_collaborators_updated_at();

-- Comments
COMMENT ON TABLE story_collaborators IS 'Collaboration permissions for stories';
COMMENT ON COLUMN story_collaborators.role IS 'Viewer, Editor, or Co-Author role';
COMMENT ON COLUMN story_collaborators.can_edit IS 'Permission to edit story content';
COMMENT ON COLUMN story_collaborators.can_publish IS 'Permission to publish/unpublish story';
COMMENT ON COLUMN story_collaborators.status IS 'Invitation status: pending, accepted, or declined';
COMMENT ON COLUMN story_collaborators.invitation_message IS 'Personal message included with invitation';
