-- Setup Test Consent for JusticeHub Integration
-- Run this in Supabase SQL Editor after justicehub-test-setup.sql

-- First, check what we have to work with
DO $$
DECLARE
  v_story_id uuid;
  v_storyteller_id uuid;
  v_app_id uuid;
  v_story_title text;
BEGIN
  -- Get a story that has a storyteller
  SELECT s.id, s.title, s.storyteller_id
  INTO v_story_id, v_story_title, v_storyteller_id
  FROM stories s
  WHERE s.storyteller_id IS NOT NULL
  AND s.status = 'published'
  LIMIT 1;

  IF v_story_id IS NULL THEN
    -- Try any story
    SELECT s.id, s.title, s.storyteller_id
    INTO v_story_id, v_story_title, v_storyteller_id
    FROM stories s
    WHERE s.storyteller_id IS NOT NULL
    LIMIT 1;
  END IF;

  IF v_story_id IS NULL THEN
    RAISE NOTICE 'No stories found with storyteller_id. Creating test data...';
    RETURN;
  END IF;

  -- Get JusticeHub app_id
  SELECT id INTO v_app_id
  FROM external_applications
  WHERE app_name = 'justicehub';

  IF v_app_id IS NULL THEN
    RAISE NOTICE 'JusticeHub not registered. Run justicehub-test-setup.sql first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating consent for story: % (ID: %)', v_story_title, v_story_id;
  RAISE NOTICE 'Storyteller ID: %', v_storyteller_id;
  RAISE NOTICE 'App ID: %', v_app_id;

  -- Create syndication consent
  INSERT INTO story_syndication_consent (
    story_id,
    storyteller_id,
    app_id,
    consent_granted,
    consent_granted_at,
    share_full_content,
    share_summary_only,
    share_media,
    share_attribution,
    anonymous_sharing
  ) VALUES (
    v_story_id,
    v_storyteller_id,
    v_app_id,
    true,
    now(),
    true,
    false,
    true,
    true,
    false
  )
  ON CONFLICT (story_id, app_id) DO UPDATE SET
    consent_granted = true,
    consent_granted_at = now(),
    share_full_content = true,
    consent_revoked_at = NULL;

  RAISE NOTICE 'Consent created successfully!';
END $$;

-- Verify consent was created
SELECT
  s.id as story_id,
  s.title,
  p.display_name as storyteller,
  ea.app_name,
  ssc.consent_granted,
  ssc.share_full_content
FROM story_syndication_consent ssc
JOIN stories s ON s.id = ssc.story_id
JOIN profiles p ON p.id = ssc.storyteller_id
JOIN external_applications ea ON ea.id = ssc.app_id
WHERE ea.app_name = 'justicehub';
