-- Permission Tiers for Story Sharing Control
-- Enables graduated sharing levels from private to public archive

-- Create permission tier enum
CREATE TYPE permission_tier AS ENUM (
  'private',        -- Only storyteller can see
  'trusted_circle', -- Only people with access codes
  'community',      -- OK for community spaces/events
  'public',         -- OK for public sharing (social media, websites)
  'archive'         -- Permanent public record (cannot withdraw)
);

-- Add permission tier to stories
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS permission_tier permission_tier DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS consent_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archive_consent_given BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS elder_reviewed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS elder_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS elder_reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for permission tier queries
CREATE INDEX IF NOT EXISTS idx_stories_permission_tier ON stories(permission_tier);
CREATE INDEX IF NOT EXISTS idx_stories_elder_reviewed ON stories(elder_reviewed) WHERE elder_reviewed = true;

-- Add comment for documentation
COMMENT ON COLUMN stories.permission_tier IS 'Controls who can access and share this story';
COMMENT ON COLUMN stories.consent_verified_at IS 'Last time storyteller confirmed consent for current permission level';
COMMENT ON COLUMN stories.archive_consent_given IS 'Explicit consent given for permanent archival (cannot be withdrawn)';
COMMENT ON COLUMN stories.elder_reviewed IS 'Story has been reviewed and approved by community Elders';
COMMENT ON COLUMN stories.elder_reviewed_at IS 'Timestamp of Elder review approval';

-- Function to validate archive tier requires explicit consent
CREATE OR REPLACE FUNCTION validate_archive_consent()
RETURNS TRIGGER AS $$
BEGIN
  -- If changing to archive tier, must have explicit consent
  IF NEW.permission_tier = 'archive' AND NEW.archive_consent_given = false THEN
    RAISE EXCEPTION 'Archive tier requires explicit consent (archive_consent_given = true)';
  END IF;

  -- If archive tier, cannot be withdrawn
  IF OLD.permission_tier = 'archive' AND NEW.status = 'withdrawn' THEN
    RAISE EXCEPTION 'Stories in archive tier cannot be withdrawn - they are permanent public record';
  END IF;

  -- Update consent verification timestamp when tier changes
  IF OLD.permission_tier IS DISTINCT FROM NEW.permission_tier THEN
    NEW.consent_verified_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_archive_consent ON stories;

CREATE TRIGGER trigger_validate_archive_consent
  BEFORE UPDATE OF permission_tier, status ON stories
  FOR EACH ROW
  EXECUTE FUNCTION validate_archive_consent();

-- Function to check if user can create share link based on permission tier
CREATE OR REPLACE FUNCTION can_create_share_link(
  p_story_id UUID,
  p_purpose TEXT
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  tier permission_tier
) AS $$
DECLARE
  v_story RECORD;
BEGIN
  -- Get story permission tier
  SELECT permission_tier, status INTO v_story
  FROM stories
  WHERE id = p_story_id;

  -- Story not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Story not found'::TEXT, NULL::permission_tier;
    RETURN;
  END IF;

  -- Story withdrawn
  IF v_story.status = 'withdrawn' THEN
    RETURN QUERY SELECT false, 'Story has been withdrawn'::TEXT, v_story.permission_tier;
    RETURN;
  END IF;

  -- Check permission tier
  CASE v_story.permission_tier
    WHEN 'private' THEN
      -- No sharing allowed
      RETURN QUERY SELECT false, 'Story is private - sharing not allowed'::TEXT, v_story.permission_tier;

    WHEN 'trusted_circle' THEN
      -- Only direct share or email
      IF p_purpose NOT IN ('direct-share', 'email') THEN
        RETURN QUERY SELECT false, 'Trusted circle tier only allows direct sharing or email'::TEXT, v_story.permission_tier;
      ELSE
        RETURN QUERY SELECT true, 'Allowed for trusted circle'::TEXT, v_story.permission_tier;
      END IF;

    WHEN 'community' THEN
      -- No social media or embed
      IF p_purpose IN ('social-media', 'embed') THEN
        RETURN QUERY SELECT false, 'Community tier does not allow social media or embed sharing'::TEXT, v_story.permission_tier;
      ELSE
        RETURN QUERY SELECT true, 'Allowed for community sharing'::TEXT, v_story.permission_tier;
      END IF;

    WHEN 'public' THEN
      -- All sharing allowed
      RETURN QUERY SELECT true, 'Allowed for public sharing'::TEXT, v_story.permission_tier;

    WHEN 'archive' THEN
      -- All sharing allowed (permanent)
      RETURN QUERY SELECT true, 'Allowed for archive (permanent)'::TEXT, v_story.permission_tier;

    ELSE
      RETURN QUERY SELECT false, 'Unknown permission tier'::TEXT, v_story.permission_tier;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION can_create_share_link(UUID, TEXT) TO authenticated;

-- Helper view: Stories with trust indicators
CREATE OR REPLACE VIEW stories_with_trust_indicators AS
SELECT
  s.*,
  CASE
    WHEN s.permission_tier = 'private' THEN 'Private'
    WHEN s.permission_tier = 'trusted_circle' THEN 'Trusted Circle'
    WHEN s.permission_tier = 'community' THEN 'Community'
    WHEN s.permission_tier = 'public' THEN 'Public'
    WHEN s.permission_tier = 'archive' THEN 'Archive'
  END as permission_tier_label,
  CASE
    WHEN s.permission_tier = 'private' THEN '🔴'
    WHEN s.permission_tier = 'trusted_circle' THEN '🟡'
    WHEN s.permission_tier = 'community' THEN '🟢'
    WHEN s.permission_tier = 'public' THEN '🔵'
    WHEN s.permission_tier = 'archive' THEN '⚪'
  END as permission_tier_emoji,
  s.elder_reviewed as has_elder_review,
  CASE WHEN s.elder_reviewed THEN '👑' ELSE '' END as elder_badge,
  CASE
    WHEN s.consent_verified_at > NOW() - INTERVAL '30 days' THEN true
    ELSE false
  END as consent_recently_verified,
  s.status = 'published' AND s.permission_tier IN ('public', 'archive') as is_publicly_shareable
FROM stories s;

-- Grant access to view
GRANT SELECT ON stories_with_trust_indicators TO authenticated, anon;

-- Migration data: Set default permission tier based on current status
UPDATE stories
SET permission_tier = CASE
  WHEN status = 'published' THEN 'public'::permission_tier
  WHEN status = 'draft' THEN 'private'::permission_tier
  WHEN status = 'withdrawn' THEN 'private'::permission_tier
  ELSE 'private'::permission_tier
END,
consent_verified_at = updated_at
WHERE permission_tier IS NULL;

-- Comments for guidance
COMMENT ON TYPE permission_tier IS 'Graduated sharing levels: private (storyteller only) → trusted_circle (limited sharing) → community (community events) → public (social media OK) → archive (permanent record)';
COMMENT ON FUNCTION can_create_share_link IS 'Validates if a share link can be created based on story permission tier and intended purpose';
COMMENT ON VIEW stories_with_trust_indicators IS 'Stories with computed trust badge indicators for UI display';
