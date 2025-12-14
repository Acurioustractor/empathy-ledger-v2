-- Story Review Invitations Table
-- Enables magic link and QR code authentication for storytellers
-- Created: 2025-12-10

-- Create story_review_invitations table
CREATE TABLE IF NOT EXISTS story_review_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Story and storyteller references
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Contact info (for sending invitations)
  storyteller_email TEXT,
  storyteller_phone TEXT,
  storyteller_name TEXT NOT NULL,

  -- Authentication token
  token TEXT NOT NULL UNIQUE,

  -- Expiration and status
  expires_at TIMESTAMPTZ NOT NULL,
  sent_via TEXT NOT NULL DEFAULT 'none' CHECK (sent_via IN ('email', 'sms', 'qr', 'none')),
  sent_at TIMESTAMPTZ,

  -- Acceptance tracking
  accepted_at TIMESTAMPTZ,

  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON story_review_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_story_id ON story_review_invitations(story_id);
CREATE INDEX IF NOT EXISTS idx_invitations_storyteller_id ON story_review_invitations(storyteller_id) WHERE storyteller_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON story_review_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON story_review_invitations(storyteller_email) WHERE storyteller_email IS NOT NULL;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_invitation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitation_updated_at ON story_review_invitations;
CREATE TRIGGER invitation_updated_at
  BEFORE UPDATE ON story_review_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitation_updated_at();

-- Row Level Security
ALTER TABLE story_review_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations they created
DROP POLICY IF EXISTS "Users can view invitations they created" ON story_review_invitations;
CREATE POLICY "Users can view invitations they created"
  ON story_review_invitations
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can view invitations for stories they own
DROP POLICY IF EXISTS "Story owners can view invitations" ON story_review_invitations;
CREATE POLICY "Story owners can view invitations"
  ON story_review_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_review_invitations.story_id
      AND (stories.author_id = auth.uid() OR stories.storyteller_id = auth.uid())
    )
  );

-- Policy: Users can create invitations for stories they own
DROP POLICY IF EXISTS "Story owners can create invitations" ON story_review_invitations;
CREATE POLICY "Story owners can create invitations"
  ON story_review_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_review_invitations.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Policy: Service role bypass for API operations
DROP POLICY IF EXISTS "Service role full access" ON story_review_invitations;
CREATE POLICY "Service role full access"
  ON story_review_invitations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE story_review_invitations IS 'Tracks magic link invitations for storytellers to review/access their stories';
COMMENT ON COLUMN story_review_invitations.token IS 'Secure random token for magic link authentication';
COMMENT ON COLUMN story_review_invitations.sent_via IS 'How the invitation was delivered: email, sms, qr, or none';
COMMENT ON COLUMN story_review_invitations.accepted_at IS 'When the storyteller accepted the invitation and logged in';
