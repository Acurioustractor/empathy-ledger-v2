-- ======================================
-- KRISTY BLOOMFIELD - COMPLETE PROFILE SETUP
-- Run these in Supabase SQL Editor
-- ======================================

-- Kristy's Profile ID
-- b59a1f4c-94fd-4805-a2c5-cac0922133e0

-- ======================================
-- STEP 1: Check Current Data
-- ======================================

-- See Kristy's current profile
SELECT
  id,
  display_name,
  bio,
  cultural_background,
  languages_spoken,
  is_storyteller,
  is_elder,
  created_at
FROM profiles
WHERE id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- See her organizations
SELECT
  po.role,
  o.name as organization_name,
  po.is_active
FROM profile_organizations po
JOIN organisations o ON po.organization_id = o.id
WHERE po.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- See her current locations (should be empty)
SELECT *
FROM profile_locations
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- See her transcripts
SELECT
  id,
  title,
  status,
  word_count,
  created_at
FROM transcripts
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- See her media
SELECT
  id,
  filename,
  type,
  caption,
  created_at
FROM media
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- ======================================
-- STEP 2: Add Napa Homestead Location
-- ======================================

-- First, check if Napa Homestead location exists
SELECT id, name, city, state, country
FROM locations
WHERE name ILIKE '%napa%homestead%';

-- If it doesn't exist, create it
INSERT INTO locations (
  name,
  city,
  state,
  country,
  traditional_territory,
  coordinates
)
VALUES (
  'Napa Homestead',
  'TBD', -- Update with actual city
  'TBD', -- Update with actual state
  'Australia',
  'Caterpillar Dreaming Country',
  NULL -- Add coordinates if known: '{"lat": -XX.XXX, "lng": XXX.XXX}'::jsonb
)
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Link Napa Homestead to Kristy's profile
-- (Replace [location_id] with the ID from above query)
INSERT INTO profile_locations (
  profile_id,
  location_id,
  location_type,
  is_primary
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  id,
  'current',
  true
FROM locations
WHERE name = 'Napa Homestead';

-- Verify it was added
SELECT
  pl.id,
  pl.location_type,
  pl.is_primary,
  l.name,
  l.traditional_territory
FROM profile_locations pl
JOIN locations l ON pl.location_id = l.id
WHERE pl.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- ======================================
-- STEP 3: Create Projects for Kristy
-- ======================================

-- Project 1: Napa Homestead Walking Trail
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status,
  start_date,
  project_type
)
VALUES (
  'Napa Homestead Walking Trail',
  'Development of interpretive walking trail blending historical insights with environmental stewardship on Napa Homestead property',
  'c53077e1-98de-4216-9149-6268891ff62e', -- Oonchiumpa
  'active',
  '2024-01-01', -- Adjust to actual start date
  'Cultural Heritage'
)
RETURNING id, name;

-- Link Kristy as Project Lead
-- (Replace [project_id] with ID from above)
INSERT INTO profile_projects (
  profile_id,
  project_id,
  role,
  is_active
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  id,
  'Project Lead',
  true
FROM projects
WHERE name = 'Napa Homestead Walking Trail';

-- Project 2: Indigenous Technology Documentation
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status,
  project_type
)
VALUES (
  'Indigenous Storytelling Technology',
  'Integration of underwater drones and modern technology to capture and preserve Indigenous cultural narratives',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active',
  'Innovation & Technology'
)
RETURNING id, name;

-- Link Kristy to this project
INSERT INTO profile_projects (
  profile_id,
  project_id,
  role,
  is_active
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  id,
  'Innovation Lead',
  true
FROM projects
WHERE name = 'Indigenous Storytelling Technology';

-- Project 3: Minga Minga Rangers Collaboration
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status,
  project_type
)
VALUES (
  'Minga Minga Rangers Partnership',
  'Collaborative work with Minga Minga Rangers on cultural preservation, land management, and knowledge sharing',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active',
  'Community Partnership'
)
RETURNING id, name;

-- Link Kristy to this project
INSERT INTO profile_projects (
  profile_id,
  project_id,
  role,
  is_active
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  id,
  'Coordinator',
  true
FROM projects
WHERE name = 'Minga Minga Rangers Partnership';

-- ======================================
-- STEP 4: Verify Everything
-- ======================================

-- See Kristy's complete profile with all relationships
SELECT
  p.display_name,
  p.bio,
  -- Locations
  (
    SELECT json_agg(
      json_build_object(
        'location', l.name,
        'type', pl.location_type,
        'territory', l.traditional_territory
      )
    )
    FROM profile_locations pl
    JOIN locations l ON pl.location_id = l.id
    WHERE pl.profile_id = p.id
  ) as locations,
  -- Projects
  (
    SELECT json_agg(
      json_build_object(
        'project', pr.name,
        'role', pp.role,
        'status', pr.status
      )
    )
    FROM profile_projects pp
    JOIN projects pr ON pp.project_id = pr.id
    WHERE pp.profile_id = p.id
  ) as projects,
  -- Organization
  (
    SELECT json_agg(
      json_build_object(
        'organization', o.name,
        'role', po.role
      )
    )
    FROM profile_organizations po
    JOIN organisations o ON po.organization_id = o.id
    WHERE po.profile_id = p.id
  ) as organizations
FROM profiles p
WHERE p.id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- ======================================
-- STEP 5: Update Profile for Better Display
-- ======================================

-- Add cultural background if missing
UPDATE profiles
SET
  cultural_background = 'Sustainable Tourism & Cultural Heritage Advocate',
  languages_spoken = ARRAY['English'], -- Add more if known
  is_storyteller = true,
  storytelling_experience = 'experienced',
  updated_at = NOW()
WHERE id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- Update organization role to be more specific
UPDATE profile_organizations
SET
  role = 'Storyteller & Cultural Heritage Coordinator',
  updated_at = NOW()
WHERE
  profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
  AND organization_id = 'c53077e1-98de-4216-9149-6268891ff62e';

-- ======================================
-- STEP 6: Summary Query - See Everything
-- ======================================

SELECT
  '🎯 Profile Complete!' as status,
  COUNT(DISTINCT pl.id) as locations_added,
  COUNT(DISTINCT pp.id) as projects_linked,
  COUNT(DISTINCT po.id) as organizations,
  COUNT(DISTINCT t.id) as transcripts,
  COUNT(DISTINCT m.id) as media_files
FROM profiles p
LEFT JOIN profile_locations pl ON pl.profile_id = p.id
LEFT JOIN profile_projects pp ON pp.profile_id = p.id
LEFT JOIN profile_organizations po ON po.profile_id = p.id
LEFT JOIN transcripts t ON t.profile_id = p.id
LEFT JOIN media m ON m.profile_id = p.id
WHERE p.id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
GROUP BY p.id;

-- ======================================
-- BONUS: Check for Unlinked Media
-- ======================================

-- Find media that might belong to Kristy but isn't linked
SELECT
  id,
  filename,
  caption,
  tags,
  created_at
FROM media
WHERE
  profile_id IS NULL
  AND (
    caption ILIKE '%kristy%' OR
    caption ILIKE '%bloomfield%' OR
    caption ILIKE '%napa%' OR
    caption ILIKE '%homestead%' OR
    tags @> '["walking_trail"]'::jsonb
  )
ORDER BY created_at DESC;

-- If you find media, link it to Kristy:
-- UPDATE media
-- SET profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
-- WHERE id IN ('[media_id_1]', '[media_id_2]', ...);

-- ======================================
-- DONE! 🎉
-- ======================================

-- Now navigate to:
-- http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0
--
-- You should see:
-- ✅ Napa Homestead location
-- ✅ 3 projects she's leading
-- ✅ Oonchiumpa organization
-- ✅ Enhanced role description
-- ✅ All her stories and transcripts
-- ✅ Linked photos
