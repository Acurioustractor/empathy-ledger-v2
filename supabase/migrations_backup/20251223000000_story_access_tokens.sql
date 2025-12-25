-- Story Access Tokens: Ephemeral, revocable links for controlled story sharing
-- This enables storytellers to share stories while maintaining full control

CREATE TABLE IF NOT EXISTS story_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,

  -- Access control
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  max_views INTEGER,
  view_count INTEGER NOT NULL DEFAULT 0,

  -- Tracking
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  -- Metadata
  purpose TEXT CHECK (purpose IN ('social-media', 'email', 'embed', 'direct-share', 'partner')),
  shared_to TEXT[], -- Track where this was shared: ['twitter', 'facebook', 'email']
  watermark_text TEXT,

  -- Tenant isolation
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_access_tokens_story_id ON story_access_tokens(story_id);
CREATE INDEX IF NOT EXISTS idx_story_access_tokens_token ON story_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_story_access_tokens_tenant_id ON story_access_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_story_access_tokens_expires_at ON story_access_tokens(expires_at);

-- Composite index for active token lookups
-- Note: Can't use NOW() in WHERE clause (not immutable), so we index revoked status
CREATE INDEX IF NOT EXISTS idx_story_access_tokens_active
  ON story_access_tokens(token, revoked, expires_at)
  WHERE revoked = false;

-- RLS Policies
ALTER TABLE story_access_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Storytellers can view their own story tokens" ON story_access_tokens;
  DROP POLICY IF EXISTS "Storytellers can create tokens for their own stories" ON story_access_tokens;
  DROP POLICY IF EXISTS "Storytellers can revoke their own story tokens" ON story_access_tokens;
  DROP POLICY IF EXISTS "Service role can manage all tokens" ON story_access_tokens;
END $$;

-- Storytellers can view their own story tokens
CREATE POLICY "Storytellers can view their own story tokens"
  ON story_access_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_access_tokens.story_id
        AND stories.storyteller_id = auth.uid()
    )
  );

-- Storytellers can create tokens for their own stories
CREATE POLICY "Storytellers can create tokens for their own stories"
  ON story_access_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_access_tokens.story_id
        AND stories.storyteller_id = auth.uid()
    )
  );

-- Storytellers can revoke their own story tokens
CREATE POLICY "Storytellers can revoke their own story tokens"
  ON story_access_tokens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_access_tokens.story_id
        AND stories.storyteller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_access_tokens.story_id
        AND stories.storyteller_id = auth.uid()
    )
  );

-- Service role can manage all tokens (for cleanup jobs)
CREATE POLICY "Service role can manage all tokens"
  ON story_access_tokens
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Function to auto-revoke tokens when story is withdrawn
CREATE OR REPLACE FUNCTION revoke_tokens_on_story_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  -- If story status changed to 'withdrawn', revoke all tokens
  IF NEW.status = 'withdrawn' AND OLD.status != 'withdrawn' THEN
    UPDATE story_access_tokens
    SET revoked = true
    WHERE story_id = NEW.id
      AND revoked = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_revoke_tokens_on_withdrawal
  AFTER UPDATE OF status ON stories
  FOR EACH ROW
  EXECUTE FUNCTION revoke_tokens_on_story_withdrawal();

-- Function to check token validity and increment view count
CREATE OR REPLACE FUNCTION validate_and_increment_token(
  p_token TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  story_id UUID,
  reason TEXT
) AS $$
DECLARE
  v_token story_access_tokens%ROWTYPE;
  v_story stories%ROWTYPE;
BEGIN
  -- Get token
  SELECT * INTO v_token
  FROM story_access_tokens
  WHERE token = p_token;

  -- Token not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Token not found';
    RETURN;
  END IF;

  -- Token revoked
  IF v_token.revoked THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Token has been revoked';
    RETURN;
  END IF;

  -- Token expired
  IF v_token.expires_at < NOW() THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Token has expired';
    RETURN;
  END IF;

  -- Max views reached
  IF v_token.max_views IS NOT NULL AND v_token.view_count >= v_token.max_views THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Maximum views reached';
    RETURN;
  END IF;

  -- Check story status
  SELECT * INTO v_story
  FROM stories
  WHERE id = v_token.story_id;

  IF v_story.status = 'withdrawn' THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Story has been withdrawn';
    RETURN;
  END IF;

  -- Valid - increment view count
  UPDATE story_access_tokens
  SET
    view_count = view_count + 1,
    last_accessed_at = NOW()
  WHERE id = v_token.id;

  RETURN QUERY SELECT true, v_token.story_id, 'Valid'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired tokens (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM story_access_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_and_increment_token(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens() TO service_role;

-- Comments for documentation
COMMENT ON TABLE story_access_tokens IS 'Ephemeral, revocable access tokens for story sharing. Enables storytellers to control their shared content.';
COMMENT ON COLUMN story_access_tokens.token IS 'Unique URL-safe token (e.g., nanoid). Used in shareable URLs: /s/{token}';
COMMENT ON COLUMN story_access_tokens.purpose IS 'Why this token was created: social-media, email, embed, direct-share, partner';
COMMENT ON COLUMN story_access_tokens.shared_to IS 'Array tracking where this link was shared: [twitter, facebook, email, etc.]';
COMMENT ON COLUMN story_access_tokens.watermark_text IS 'Optional watermark to apply to images when accessed via this token';
COMMENT ON FUNCTION validate_and_increment_token IS 'Validates token and increments view count. Returns validity status, story_id, and reason.';
COMMENT ON FUNCTION revoke_tokens_on_story_withdrawal IS 'Auto-revokes all story tokens when story status changes to withdrawn';
