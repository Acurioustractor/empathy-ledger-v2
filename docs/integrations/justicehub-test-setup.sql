-- JusticeHub Integration Test Setup
-- Run this in Supabase SQL Editor to set up test data

-- 1. Register JusticeHub as an external application
-- API Key for testing: jh_test_key_2024_empathy_ledger
INSERT INTO external_applications (
  app_name,
  app_display_name,
  app_description,
  api_key_hash,
  allowed_story_types,
  is_active
) VALUES (
  'justicehub',
  'JusticeHub',
  'First Nations justice advocacy and case management platform',
  'jh_test_key_2024_empathy_ledger',  -- In production, use a secure hash
  ARRAY['testimony', 'case_study', 'advocacy', 'personal', 'historical'],
  true
)
ON CONFLICT (app_name) DO UPDATE SET
  api_key_hash = EXCLUDED.api_key_hash,
  allowed_story_types = EXCLUDED.allowed_story_types,
  is_active = true,
  updated_at = now();

-- 2. Verify the registration
SELECT id, app_name, app_display_name, allowed_story_types, is_active
FROM external_applications
WHERE app_name = 'justicehub';

-- 3. (Optional) Create test consent for an existing story
-- Replace 'YOUR_STORY_ID' and 'YOUR_STORYTELLER_ID' with actual values
-- First, find available stories and storytellers:
-- SELECT id, title FROM stories LIMIT 5;
-- SELECT id, display_name FROM profiles WHERE is_storyteller = true LIMIT 5;

/*
-- Example consent creation (uncomment and modify as needed):
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
)
SELECT
  'YOUR_STORY_ID'::uuid,
  'YOUR_STORYTELLER_ID'::uuid,
  ea.id,
  true,
  now(),
  true,   -- Share full content
  false,  -- Not summary only
  true,   -- Include media
  true,   -- Show attribution
  false   -- Not anonymous
FROM external_applications ea
WHERE ea.app_name = 'justicehub'
ON CONFLICT (story_id, app_id) DO UPDATE SET
  consent_granted = true,
  consent_granted_at = now(),
  share_full_content = true;
*/
