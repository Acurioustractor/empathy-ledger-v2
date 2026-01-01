-- ======================================
-- KRISTY BLOOMFIELD COMPLETE PROFILE SETUP
-- ======================================
-- Run this entire script in Supabase SQL Editor
-- ID: b59a1f4c-94fd-4805-a2c5-cac0922133e0
-- Organization: Oonchiumpa (c53077e1-98de-4216-9149-6268891ff62e)

-- ======================================
-- STEP 1: Check Current Profile
-- ======================================
SELECT
  id,
  display_name,
  bio,
  is_storyteller,
  is_elder,
  created_at
FROM profiles
WHERE id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- Check current locations (should be 0)
SELECT COUNT(*) as location_count
FROM profile_locations
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- Check current projects (should be 0)
SELECT COUNT(*) as project_count
FROM profile_projects
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- ======================================
-- STEP 2: Create Napa Homestead Location
-- ======================================
INSERT INTO locations (
  name,
  city,
  state,
  country,
  traditional_territory
)
VALUES (
  'Napa Homestead',
  'Flinders Ranges',
  'South Australia',
  'Australia',
  'Caterpillar Dreaming Country'
)
ON CONFLICT (name, country) DO UPDATE
  SET traditional_territory = EXCLUDED.traditional_territory,
      city = EXCLUDED.city,
      state = EXCLUDED.state
RETURNING id, name, city, state, traditional_territory;

-- ======================================
-- STEP 3: Link Napa Homestead to Kristy
-- ======================================
INSERT INTO profile_locations (
  profile_id,
  location_id,
  location_type,
  is_primary
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  l.id,
  'current',
  true
FROM locations l
WHERE l.name = 'Napa Homestead'
  AND l.country = 'Australia'
  AND NOT EXISTS (
    SELECT 1 FROM profile_locations pl
    WHERE pl.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
    AND pl.location_id = l.id
  )
RETURNING id, location_id, location_type, is_primary;

-- ======================================
-- STEP 4: Create Project 1 - Walking Trail
-- ======================================
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status,
  start_date
)
VALUES (
  'Napa Homestead Walking Trail',
  'Development of interpretive walking trail blending historical insights with environmental stewardship on Napa Homestead property. This project showcases sustainable tourism practices while honoring the cultural significance of Caterpillar Dreaming Country.',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active',
  '2024-01-01'
)
ON CONFLICT (name, organisation_id) DO UPDATE
  SET description = EXCLUDED.description,
      status = EXCLUDED.status,
      start_date = EXCLUDED.start_date
RETURNING id, name, status, start_date;

-- ======================================
-- STEP 5: Create Project 2 - Indigenous Technology
-- ======================================
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status,
  start_date
)
VALUES (
  'Indigenous Storytelling Technology',
  'Integration of underwater drones and modern technology to capture and preserve Indigenous cultural narratives. This innovative project explores how technology can serve cultural preservation while maintaining respect for traditional knowledge.',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active',
  '2024-03-01'
)
ON CONFLICT (name, organisation_id) DO UPDATE
  SET description = EXCLUDED.description,
      status = EXCLUDED.status,
      start_date = EXCLUDED.start_date
RETURNING id, name, status, start_date;

-- ======================================
-- STEP 6: Create Project 3 - Minga Minga Partnership
-- ======================================
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status,
  start_date
)
VALUES (
  'Minga Minga Rangers Partnership',
  'Collaborative work with Minga Minga Rangers on cultural preservation, land management, and knowledge sharing. This partnership strengthens community connections and supports traditional land management practices.',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active',
  '2024-02-01'
)
ON CONFLICT (name, organisation_id) DO UPDATE
  SET description = EXCLUDED.description,
      status = EXCLUDED.status,
      start_date = EXCLUDED.start_date
RETURNING id, name, status, start_date;

-- ======================================
-- STEP 7: Link Kristy to Walking Trail Project
-- ======================================
INSERT INTO profile_projects (
  profile_id,
  project_id,
  role,
  is_active
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  p.id,
  'Project Lead',
  true
FROM projects p
WHERE p.name = 'Napa Homestead Walking Trail'
  AND p.organisation_id = 'c53077e1-98de-4216-9149-6268891ff62e'
  AND NOT EXISTS (
    SELECT 1 FROM profile_projects pp
    WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
    AND pp.project_id = p.id
  )
RETURNING id, project_id, role;

-- ======================================
-- STEP 8: Link Kristy to Technology Project
-- ======================================
INSERT INTO profile_projects (
  profile_id,
  project_id,
  role,
  is_active
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  p.id,
  'Innovation Lead',
  true
FROM projects p
WHERE p.name = 'Indigenous Storytelling Technology'
  AND p.organisation_id = 'c53077e1-98de-4216-9149-6268891ff62e'
  AND NOT EXISTS (
    SELECT 1 FROM profile_projects pp
    WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
    AND pp.project_id = p.id
  )
RETURNING id, project_id, role;

-- ======================================
-- STEP 9: Link Kristy to Minga Minga Project
-- ======================================
INSERT INTO profile_projects (
  profile_id,
  project_id,
  role,
  is_active
)
SELECT
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  p.id,
  'Partnership Coordinator',
  true
FROM projects p
WHERE p.name = 'Minga Minga Rangers Partnership'
  AND p.organisation_id = 'c53077e1-98de-4216-9149-6268891ff62e'
  AND NOT EXISTS (
    SELECT 1 FROM profile_projects pp
    WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
    AND pp.project_id = p.id
  )
RETURNING id, project_id, role;

-- ======================================
-- STEP 10: VERIFICATION - Complete Profile Summary
-- ======================================
SELECT
  p.id,
  p.display_name,
  p.bio,
  p.is_storyteller,
  p.is_elder,

  -- Count locations
  (SELECT COUNT(*) FROM profile_locations pl WHERE pl.profile_id = p.id) as location_count,

  -- Count projects
  (SELECT COUNT(*) FROM profile_projects pp WHERE pp.profile_id = p.id) as project_count,

  -- Count organizations
  (SELECT COUNT(*) FROM profile_organizations po WHERE po.profile_id = p.id) as org_count,

  -- List locations with details
  (
    SELECT json_agg(
      json_build_object(
        'location', l.name,
        'city', l.city,
        'state', l.state,
        'type', pl.location_type,
        'territory', l.traditional_territory,
        'primary', pl.is_primary
      )
    )
    FROM profile_locations pl
    JOIN locations l ON pl.location_id = l.id
    WHERE pl.profile_id = p.id
  ) as locations,

  -- List projects with details
  (
    SELECT json_agg(
      json_build_object(
        'project', pr.name,
        'role', pp.role,
        'status', pr.status,
        'start_date', pr.start_date,
        'active', pp.is_active
      )
    )
    FROM profile_projects pp
    JOIN projects pr ON pp.project_id = pr.id
    WHERE pp.profile_id = p.id
  ) as projects,

  -- List organizations
  (
    SELECT json_agg(
      json_build_object(
        'organization', o.name,
        'role', po.role,
        'active', po.is_active
      )
    )
    FROM profile_organizations po
    JOIN organisations o ON po.organization_id = o.id
    WHERE po.profile_id = p.id
  ) as organizations

FROM profiles p
WHERE p.id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

-- ======================================
-- STEP 11: View Locations Details
-- ======================================
SELECT
  pl.location_type,
  pl.is_primary,
  l.name,
  l.city,
  l.state,
  l.country,
  l.traditional_territory,
  pl.created_at
FROM profile_locations pl
JOIN locations l ON pl.location_id = l.id
WHERE pl.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
ORDER BY pl.is_primary DESC, pl.created_at DESC;

-- ======================================
-- STEP 12: View Projects Details
-- ======================================
SELECT
  pp.role,
  pp.is_active,
  p.name as project_name,
  p.description,
  p.status,
  p.start_date,
  o.name as organization_name
FROM profile_projects pp
JOIN projects p ON pp.project_id = p.id
JOIN organisations o ON p.organisation_id = o.id
WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
ORDER BY p.start_date;

-- ======================================
-- EXPECTED RESULTS SUMMARY
-- ======================================
-- ✅ Kristy should now have:
--    - 1 location: Napa Homestead (current, primary, Caterpillar Dreaming Country)
--    - 3 active projects with specific roles:
--      1. Napa Homestead Walking Trail (Project Lead)
--      2. Indigenous Storytelling Technology (Innovation Lead)
--      3. Minga Minga Rangers Partnership (Partnership Coordinator)
--    - 1 organization: Oonchiumpa (Team Member)
--    - 2 published stories (existing)
--
-- ✅ Browser Test:
--    Visit: http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0
--    You should see:
--    - 📍 Napa Homestead, South Australia
--    - 🏛️ Caterpillar Dreaming Country (traditional territory)
--    - Projects section (if implemented in UI)
--
-- ======================================
-- NEXT STEPS AFTER SETUP
-- ======================================
-- 1. View Kristy's transcripts:
--    SELECT id, title, content, status, created_at
--    FROM transcripts
--    WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
--
-- 2. Find her media:
--    SELECT id, filename, type, caption, url, created_at
--    FROM media
--    WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
--
-- 3. Link stories to projects (run after choosing which story goes with which project)
--
-- 4. Create galleries for projects
--
-- 5. Test as Kristy to see user experience
