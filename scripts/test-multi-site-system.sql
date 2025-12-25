-- ACT Multi-Site Ecosystem - Testing Script
-- Run this to create test data for multi-site story sharing

-- ============================================================================
-- 1. CREATE TEST STORYTELLERS
-- ============================================================================

-- Insert test profiles (storytellers)
INSERT INTO profiles (id, email, display_name, profile_type, role, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'elder.sarah@example.com', 'Elder Sarah', 'storyteller', 'user', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'jordan.youth@example.com', 'Jordan (Youth Activist)', 'storyteller', 'user', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'alex.defender@example.com', 'Alex (Land Defender)', 'storyteller', 'user', 'active')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  profile_type = EXCLUDED.profile_type;

-- Set consent preferences for storytellers
INSERT INTO storyteller_consent_settings (storyteller_id, allow_cross_site_sharing, allow_api_access, allow_embedding, require_attribution) VALUES
  ('11111111-1111-1111-1111-111111111111', true, true, true, true),  -- Elder Sarah: Shares everywhere
  ('22222222-2222-2222-2222-222222222222', true, true, false, true), -- Jordan: API but no embedding
  ('33333333-3333-3333-3333-333333333333', true, false, false, true) -- Alex: Cross-site only, no API
ON CONFLICT (storyteller_id) DO UPDATE SET
  allow_cross_site_sharing = EXCLUDED.allow_cross_site_sharing,
  allow_api_access = EXCLUDED.allow_api_access;

-- ============================================================================
-- 2. CREATE TEST PROJECTS
-- ============================================================================

-- Create test organization
INSERT INTO organizations (id, name, organization_type, status) VALUES
  ('org-act-test', 'A Curious Tractor (Test)', 'non_profit', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create test projects
INSERT INTO projects (id, name, organization_id, project_type, status, description) VALUES
  (
    'proj-youth-2024',
    'Youth Voices 2024',
    'org-act-test',
    'community_storytelling',
    'active',
    'Youth climate action and activism stories'
  ),
  (
    'proj-land-rights',
    'Land Rights Archive',
    'org-act-test',
    'cultural_preservation',
    'active',
    'Stories of land defenders and territorial sovereignty'
  ),
  (
    'proj-elders-wisdom',
    'Elders Wisdom Series',
    'org-act-test',
    'knowledge_transfer',
    'active',
    'Traditional knowledge and teachings from elders'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================================================
-- 3. CREATE TEST STORIES
-- ============================================================================

-- Story 1: Youth climate action (Jordan)
INSERT INTO stories (id, title, storyteller_id, status, created_at) VALUES
  (
    'story-climate-journey',
    'My Climate Action Journey',
    '22222222-2222-2222-2222-222222222222',
    'published',
    now() - interval '30 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status;

-- Add transcript for climate story
INSERT INTO transcripts (id, story_id, content, summary) VALUES
  (
    'transcript-climate',
    'story-climate-journey',
    'I started my journey in climate activism when I was 15. Watching the forests burn year after year, I knew I had to do something. Our generation is inheriting a planet in crisis, but we''re also inheriting the strength and wisdom of those who came before us. This is my story of finding my voice and my community in the fight for our future.',
    'A young activist shares their journey into climate action and community organizing.'
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content;

-- Link to youth project
INSERT INTO project_stories (project_id, story_id, role, added_at) VALUES
  ('proj-youth-2024', 'story-climate-journey', 'primary', now())
ON CONFLICT (project_id, story_id) DO NOTHING;

-- Story 2: Land rights (Alex)
INSERT INTO stories (id, title, storyteller_id, status, created_at) VALUES
  (
    'story-land-remembers',
    'The Land Remembers',
    '33333333-3333-3333-3333-333333333333',
    'published',
    now() - interval '60 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title;

INSERT INTO transcripts (id, story_id, content, summary) VALUES
  (
    'transcript-land',
    'story-land-remembers',
    'Our people have walked these trails for thousands of years. The land remembers every step, every ceremony, every story told under the stars. When they tried to take it from us, the land itself resisted. This is not just about property or borders – this is about our relationship with the earth that sustains us. We are the land, and the land is us.',
    'A powerful testimony about Indigenous land rights and territorial sovereignty.'
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content;

INSERT INTO project_stories (project_id, story_id, role, added_at) VALUES
  ('proj-land-rights', 'story-land-remembers', 'primary', now())
ON CONFLICT (project_id, story_id) DO NOTHING;

-- Story 3: Elder wisdom (Sarah)
INSERT INTO stories (id, title, storyteller_id, status, created_at) VALUES
  (
    'story-winter-teaching',
    'The Winter Teaching',
    '11111111-1111-1111-1111-111111111111',
    'published',
    now() - interval '90 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title;

INSERT INTO transcripts (id, story_id, content, summary) VALUES
  (
    'transcript-winter',
    'story-winter-teaching',
    'In winter, when the snow blankets the earth, that''s when the deepest teachings come. My grandmother taught me to listen – not just with my ears, but with my whole being. The land speaks in whispers and roars, in the crack of ice and the silence of falling snow. These are the teachings our young people need now, more than ever. The old ways and the new ways must walk together.',
    'Elder Sarah shares traditional winter teachings and their relevance for today''s youth.'
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content;

-- Link elder story to multiple projects
INSERT INTO project_stories (project_id, story_id, role, added_at) VALUES
  ('proj-elders-wisdom', 'story-winter-teaching', 'primary', now()),
  ('proj-youth-2024', 'story-winter-teaching', 'related', now())  -- Also relevant to youth
ON CONFLICT (project_id, story_id) DO NOTHING;

-- ============================================================================
-- 4. GRANT CROSS-SITE CONSENT
-- ============================================================================

-- Story 1 (Youth climate): Show on Youth site only
SELECT grant_story_consent(
  'story-climate-journey'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,  -- youth-stories site
  '22222222-2222-2222-2222-222222222222'::uuid,  -- Jordan granted it
  'public'::visibility_level,
  365,  -- 1 year
  true,  -- featured
  ARRAY['youth', 'climate', 'activism']
);

-- Story 2 (Land rights): Show on Land site AND main site
SELECT grant_story_consent(
  'story-land-remembers'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,  -- land-rights site
  '33333333-3333-3333-3333-333333333333'::uuid,  -- Alex granted it
  'public'::visibility_level,
  365,
  true,  -- featured on land site
  ARRAY['land', 'territory', 'sovereignty', 'rights']
);

SELECT grant_story_consent(
  'story-land-remembers'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,  -- act-main site
  '33333333-3333-3333-3333-333333333333'::uuid,
  'public'::visibility_level,
  365,
  false,  -- not featured on main
  ARRAY['land', 'featured']
);

-- Story 3 (Elder wisdom): Show on ALL sites
SELECT grant_story_consent(
  'story-winter-teaching'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,  -- act-main
  '11111111-1111-1111-1111-111111111111'::uuid,  -- Elder Sarah
  'public'::visibility_level,
  NULL,  -- No expiration
  true,  -- featured on main
  ARRAY['wisdom', 'elders', 'intergenerational', 'featured']
);

SELECT grant_story_consent(
  'story-winter-teaching'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,  -- youth-stories
  '11111111-1111-1111-1111-111111111111'::uuid,
  'public'::visibility_level,
  NULL,
  false,
  ARRAY['wisdom', 'intergenerational', 'learning']
);

SELECT grant_story_consent(
  'story-winter-teaching'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,  -- land-rights
  '11111111-1111-1111-1111-111111111111'::uuid,
  'public'::visibility_level,
  NULL,
  false,
  ARRAY['wisdom', 'land', 'traditional-knowledge']
);

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- View all sites
SELECT
  site_key,
  site_name,
  site_url,
  status
FROM sites
ORDER BY site_key;

-- View stories for Youth site
SELECT
  s.id,
  s.title,
  p.display_name as storyteller,
  ssv.project_tags,
  ssv.featured,
  ssv.visibility,
  ssv.consent_expires_at
FROM stories s
JOIN profiles p ON p.id = s.storyteller_id
JOIN story_site_visibility ssv ON ssv.story_id = s.id
WHERE ssv.site_id = '00000000-0000-0000-0000-000000000002'  -- youth-stories
  AND ssv.storyteller_consent = true
  AND (ssv.consent_expires_at IS NULL OR ssv.consent_expires_at > now())
ORDER BY ssv.featured DESC, s.created_at DESC;

-- Expected: "My Climate Action Journey" (Jordan, featured) + "The Winter Teaching" (Elder Sarah)

-- View stories for Land site
SELECT
  s.id,
  s.title,
  p.display_name as storyteller,
  ssv.project_tags,
  ssv.featured
FROM stories s
JOIN profiles p ON p.id = s.storyteller_id
JOIN story_site_visibility ssv ON ssv.story_id = s.id
WHERE ssv.site_id = '00000000-0000-0000-0000-000000000003'  -- land-rights
  AND ssv.storyteller_consent = true
ORDER BY ssv.featured DESC;

-- Expected: "The Land Remembers" (Alex, featured) + "The Winter Teaching" (Elder Sarah)

-- View stories for Main site (homepage featured)
SELECT
  s.id,
  s.title,
  p.display_name as storyteller,
  ssv.project_tags
FROM stories s
JOIN profiles p ON p.id = s.storyteller_id
JOIN story_site_visibility ssv ON ssv.story_id = s.id
WHERE ssv.site_id = '00000000-0000-0000-0000-000000000001'  -- act-main
  AND ssv.show_on_homepage = true
  AND ssv.storyteller_consent = true;

-- Expected: Nothing yet (need to set show_on_homepage)

-- Update to show Elder Sarah's story on main homepage
UPDATE story_site_visibility
SET show_on_homepage = true
WHERE story_id = 'story-winter-teaching'
  AND site_id = '00000000-0000-0000-0000-000000000001';

-- View consent status across all sites for Elder Sarah's story
SELECT
  s.site_name,
  ssv.storyteller_consent,
  ssv.consent_granted_at,
  ssv.featured,
  ssv.view_count,
  ssv.project_tags
FROM story_site_visibility ssv
JOIN sites s ON s.id = ssv.site_id
WHERE ssv.story_id = 'story-winter-teaching'
ORDER BY s.site_name;

-- Check storyteller consent settings
SELECT
  p.display_name,
  scs.allow_cross_site_sharing,
  scs.allow_api_access,
  scs.allow_embedding,
  scs.require_attribution
FROM storyteller_consent_settings scs
JOIN profiles p ON p.id = scs.storyteller_id
ORDER BY p.display_name;

-- ============================================================================
-- 6. TEST CONSENT REVOCATION
-- ============================================================================

-- Test: Revoke Jordan's story from Youth site
-- (Uncomment to test)
-- SELECT revoke_story_consent(
--   'story-climate-journey'::uuid,
--   '00000000-0000-0000-0000-000000000002'::uuid,
--   'Testing revocation flow'
-- );

-- Verify revocation worked
-- SELECT
--   s.title,
--   site.site_name,
--   ssv.storyteller_consent,
--   ssv.consent_revoked_at,
--   ssv.revocation_reason
-- FROM story_site_visibility ssv
-- JOIN stories s ON s.id = ssv.story_id
-- JOIN sites site ON site.id = ssv.site_id
-- WHERE ssv.story_id = 'story-climate-journey';

-- ============================================================================
-- 7. ANALYTICS QUERIES
-- ============================================================================

-- Total stories per site
SELECT
  s.site_name,
  COUNT(ssv.id) as total_stories,
  COUNT(CASE WHEN ssv.featured = true THEN 1 END) as featured_stories,
  SUM(ssv.view_count) as total_views
FROM sites s
LEFT JOIN story_site_visibility ssv
  ON ssv.site_id = s.id
  AND ssv.storyteller_consent = true
  AND (ssv.consent_expires_at IS NULL OR ssv.consent_expires_at > now())
GROUP BY s.id, s.site_name
ORDER BY s.site_name;

-- Stories by project and site visibility
SELECT
  proj.name as project_name,
  COUNT(DISTINCT ps.story_id) as total_stories,
  COUNT(DISTINCT ssv.site_id) as visible_on_sites,
  array_agg(DISTINCT sites.site_name) as sites
FROM projects proj
JOIN project_stories ps ON ps.project_id = proj.id
LEFT JOIN story_site_visibility ssv ON ssv.story_id = ps.story_id AND ssv.storyteller_consent = true
LEFT JOIN sites ON sites.id = ssv.site_id
GROUP BY proj.id, proj.name
ORDER BY proj.name;

-- Storyteller reach (how many sites their stories appear on)
SELECT
  p.display_name,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT ssv.site_id) as sites_reached,
  SUM(ssv.view_count) as total_views
FROM profiles p
JOIN stories s ON s.storyteller_id = p.id
LEFT JOIN story_site_visibility ssv
  ON ssv.story_id = s.id
  AND ssv.storyteller_consent = true
WHERE p.profile_type = 'storyteller'
GROUP BY p.id, p.display_name
ORDER BY sites_reached DESC;

-- ============================================================================
-- TESTING COMPLETE
-- ============================================================================

\echo '✓ Test data created successfully!'
\echo ''
\echo 'Test Storytellers:'
\echo '  - Elder Sarah (wisdom teacher, shares everywhere)'
\echo '  - Jordan (youth activist, shares on youth site)'
\echo '  - Alex (land defender, shares on land + main sites)'
\echo ''
\echo 'Test Stories:'
\echo '  - "My Climate Action Journey" → Youth site (featured)'
\echo '  - "The Land Remembers" → Land site (featured) + Main site'
\echo '  - "The Winter Teaching" → All sites (featured on main)'
\echo ''
\echo 'Next steps:'
\echo '  1. Test API: curl -H "Authorization: Bearer ACT_YOUTH_KEY_xxx" http://localhost:3000/api/v1/stories/story-climate-journey'
\echo '  2. Test consent revocation via API'
\echo '  3. View storyteller consent dashboard'
