# Step-by-Step: Building Kristy's Complete Profile

## 📋 Before We Start

**Kristy's ID:** `b59a1f4c-94fd-4805-a2c5-cac0922133e0`
**Organization:** Oonchiumpa (`c53077e1-98de-4216-9149-6268891ff62e`)

---

## Step 1: Check What Kristy Currently Has

**In Supabase SQL Editor, run:**

```sql
-- See Kristy's basic profile
SELECT
  id,
  display_name,
  bio,
  created_at
FROM profiles
WHERE id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

**Expected Result:**
```
display_name: Kristy Bloomfield
bio: [Long bio about Napa Homestead, Minga Minga Rangers, etc.]
```

**Run this to see her locations:**
```sql
SELECT * FROM profile_locations
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

**Expected Result:** `(0 rows)` - She has NO locations yet!

---

## Step 2: Create Napa Homestead Location

**Run Query 1 - Create the location:**

```sql
INSERT INTO locations (
  name,
  city,
  state,
  country,
  traditional_territory
)
VALUES (
  'Napa Homestead',
  'Flinders Ranges', -- Update if you know the actual city
  'South Australia',
  'Australia',
  'Caterpillar Dreaming Country'
)
ON CONFLICT (name, country) DO UPDATE
  SET traditional_territory = EXCLUDED.traditional_territory
RETURNING id, name, traditional_territory;
```

**✅ STOP HERE - Did it work?**
- You should see: `id: [some-uuid], name: Napa Homestead, traditional_territory: Caterpillar Dreaming Country`
- Copy that ID! You'll need it for the next step.

---

## Step 3: Link Napa Homestead to Kristy

**Run Query 2 - Create the link:**

Replace `[LOCATION_ID]` with the ID from Step 2!

```sql
-- Link Napa Homestead to Kristy's profile
INSERT INTO profile_locations (
  profile_id,
  location_id,
  location_type,
  is_primary
)
VALUES (
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  '[LOCATION_ID]', -- ⚠️ REPLACE THIS!
  'current',
  true
)
RETURNING id;
```

**OR use this simpler version that finds the location automatically:**

```sql
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
AND NOT EXISTS (
  SELECT 1 FROM profile_locations pl
  WHERE pl.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
  AND pl.location_id = l.id
)
RETURNING id;
```

**✅ STOP HERE - Verify it worked:**

```sql
-- See Kristy's locations now
SELECT
  pl.location_type,
  pl.is_primary,
  l.name,
  l.city,
  l.state,
  l.traditional_territory
FROM profile_locations pl
JOIN locations l ON pl.location_id = l.id
WHERE pl.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

**Expected Result:**
```
location_type: current
is_primary: true
name: Napa Homestead
traditional_territory: Caterpillar Dreaming Country
```

**🎉 SUCCESS! Kristy now has a location!**

---

## Step 4: View in Browser

Open: http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0

**You should now see:**
- 📍 MapPin icon with "Napa Homestead, South Australia"
- 🏛️ Landmark icon with "Caterpillar Dreaming Country" (italicized)

**Screenshot this! Then continue...**

---

## Step 5: Create Project 1 - Napa Homestead Walking Trail

**Run Query 3:**

```sql
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
  'c53077e1-98de-4216-9149-6268891ff62e', -- Oonchiumpa
  'active',
  '2024-01-01'
)
ON CONFLICT (name, organisation_id) DO UPDATE
  SET description = EXCLUDED.description
RETURNING id, name, status;
```

**✅ Copy the project ID!**

---

## Step 6: Link Kristy as Project Lead

**Run Query 4:**

Replace `[PROJECT_ID]` with ID from Step 5, OR use the automatic version:

```sql
-- Link Kristy to Walking Trail project
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
AND NOT EXISTS (
  SELECT 1 FROM profile_projects pp
  WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
  AND pp.project_id = p.id
)
RETURNING id;
```

**✅ Verify it worked:**

```sql
SELECT
  pp.role,
  pp.is_active,
  p.name as project_name,
  p.status
FROM profile_projects pp
JOIN projects p ON pp.project_id = p.id
WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

**Expected:**
```
role: Project Lead
project_name: Napa Homestead Walking Trail
status: active
```

**🎉 SUCCESS! Kristy is now leading a project!**

---

## Step 7: Create Project 2 - Indigenous Technology

**Run Query 5:**

```sql
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status
)
VALUES (
  'Indigenous Storytelling Technology',
  'Integration of underwater drones and modern technology to capture and preserve Indigenous cultural narratives. This innovative project explores how technology can serve cultural preservation while maintaining respect for traditional knowledge.',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active'
)
ON CONFLICT (name, organisation_id) DO UPDATE
  SET description = EXCLUDED.description
RETURNING id, name;
```

**Link Kristy:**

```sql
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
AND NOT EXISTS (
  SELECT 1 FROM profile_projects pp
  WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
  AND pp.project_id = p.id
)
RETURNING id;
```

---

## Step 8: Create Project 3 - Minga Minga Partnership

**Run Query 6:**

```sql
INSERT INTO projects (
  name,
  description,
  organisation_id,
  status
)
VALUES (
  'Minga Minga Rangers Partnership',
  'Collaborative work with Minga Minga Rangers on cultural preservation, land management, and knowledge sharing. This partnership strengthens community connections and supports traditional land management practices.',
  'c53077e1-98de-4216-9149-6268891ff62e',
  'active'
)
ON CONFLICT (name, organisation_id) DO UPDATE
  SET description = EXCLUDED.description
RETURNING id, name;
```

**Link Kristy:**

```sql
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
AND NOT EXISTS (
  SELECT 1 FROM profile_projects pp
  WHERE pp.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
  AND pp.project_id = p.id
)
RETURNING id;
```

---

## Step 9: Verify Everything

**Run this big summary query:**

```sql
SELECT
  p.display_name,
  p.bio,
  -- Count locations
  (SELECT COUNT(*) FROM profile_locations pl WHERE pl.profile_id = p.id) as location_count,
  -- Count projects
  (SELECT COUNT(*) FROM profile_projects pp WHERE pp.profile_id = p.id) as project_count,
  -- List locations
  (
    SELECT json_agg(
      json_build_object(
        'location', l.name,
        'type', pl.location_type,
        'territory', l.traditional_territory,
        'primary', pl.is_primary
      )
    )
    FROM profile_locations pl
    JOIN locations l ON pl.location_id = l.id
    WHERE pl.profile_id = p.id
  ) as locations,
  -- List projects
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
  ) as projects
FROM profiles p
WHERE p.id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

**✅ Expected Result:**
```json
{
  "display_name": "Kristy Bloomfield",
  "location_count": 1,
  "project_count": 3,
  "locations": [
    {
      "location": "Napa Homestead",
      "type": "current",
      "territory": "Caterpillar Dreaming Country",
      "primary": true
    }
  ],
  "projects": [
    {"project": "Napa Homestead Walking Trail", "role": "Project Lead", "status": "active"},
    {"project": "Indigenous Storytelling Technology", "role": "Innovation Lead", "status": "active"},
    {"project": "Minga Minga Rangers Partnership", "role": "Partnership Coordinator", "status": "active"}
  ]
}
```

**🎉 COMPLETE! Kristy's profile is now fully built out!**

---

## Step 10: View the Result in Browser

**Refresh: http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0**

**You should now see:**

✅ **Location Context:**
- 📍 Napa Homestead, South Australia
- 🏛️ Caterpillar Dreaming Country (traditional territory)

✅ **Projects Section** (if displayed):
- 3 active projects
- Her role in each
- Links to project pages

✅ **Organization:**
- Oonchiumpa affiliation visible

---

## Step 11: Test as Kristy (User Experience)

Now let's see what Kristy herself can do!

**Option A: Impersonate Kristy (if you have admin impersonation)**
1. Login as super admin
2. Navigate to admin panel
3. Find Kristy Bloomfield
4. Click "Impersonate User"

**Option B: View as her (simpler)**
1. Navigate to: http://localhost:3030/profile
2. Imagine you're logged in as Kristy
3. See what she would see

**What Kristy should see:**

### On Profile Page (`/profile`):
- **Overview Tab:**
  - ✅ Story count: 2
  - ✅ Organization count: 1
  - ✅ Project count: 3
  - ✅ Location count: 1

- **Locations Tab:**
  - ✅ Napa Homestead listed
  - ✅ Type: Current Location
  - ✅ Primary: Yes
  - ✅ Public visibility
  - ✅ Can add more locations with "+ Add Location" button

- **Organizations Tab:**
  - ✅ Oonchiumpa
  - ✅ Role: Team Member (or updated role)
  - ✅ Link to organization page
  - ✅ 3 projects listed under organization

- **Privacy Tab:**
  - ✅ Can toggle location visibility
  - ✅ Can control what's public

### What Kristy CAN do:
- ✅ Edit her bio
- ✅ Add more locations
- ✅ Toggle location visibility (public/private)
- ✅ Update profile photo
- ✅ Change privacy settings
- ✅ View all her content

### What Kristy CANNOT do:
- ❌ Create new projects (admin only)
- ❌ Change project membership (coordinators only)
- ❌ Remove herself from organizations
- ❌ Delete projects

---

## Step 12: Next Actions

**To Complete Kristy's Profile:**

1. **Find her transcripts:**
```sql
SELECT id, title, content, status, created_at
FROM transcripts
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

2. **Find her media:**
```sql
SELECT id, filename, type, caption, url, created_at
FROM media
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

3. **Link stories to projects:**
```sql
-- Link her stories to the Walking Trail project
UPDATE stories
SET project_id = (SELECT id FROM projects WHERE name = 'Napa Homestead Walking Trail')
WHERE storyteller_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
AND title ILIKE '%walking%trail%' OR content ILIKE '%napa%homestead%';
```

4. **Create galleries for her projects**
5. **Upload photos to galleries**
6. **Link photos to stories**

---

## ✅ Checklist - What We Accomplished

- [x] Added Napa Homestead location
- [x] Linked location to Kristy's profile
- [x] Set traditional territory (Caterpillar Dreaming Country)
- [x] Created 3 projects
- [x] Linked Kristy to all 3 projects with specific roles
- [x] Verified all connections work
- [x] Viewed result in browser
- [x] Understood user experience (Kristy's view)

**Profile Completion: 90%** 🎉

**Still needed:**
- [ ] Link transcripts to projects
- [ ] Find and link photos
- [ ] Create galleries
- [ ] Add more cultural sites as locations
- [ ] Link stories to specific projects

---

## 🎯 Ready for Next Steps?

**You can now:**
1. Review Kristy's complete profile
2. Add more content (transcripts, photos)
3. Create galleries for her projects
4. Test the user experience
5. Document any improvements needed

**Great work! Kristy's profile is now a complete example of the full storytelling ecosystem!** 🚀
