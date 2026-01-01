# Kristy Bloomfield - Complete Profile Workflow

## 🎯 Goal
Build Kristy's complete storyteller profile with all connections: locations, transcripts, photos, organization, and projects.

---

## 👤 As Super Admin - Complete Setup

### Step 1: Add Location Data (Napa Homestead)

**Current State:** No locations linked to Kristy's profile
**Goal:** Add Napa Homestead as her primary location + traditional territory

**Option A: Via UI (Easiest)**
```
1. Navigate to: http://localhost:3030/profile
2. Login as Kristy (or impersonate)
3. Click "Locations" tab
4. Click "+ Add Location"
5. Search for "Napa Homestead" or create it
6. Select type: "Current Location"
7. Set as Primary: Yes
8. Visibility: Public
9. Save
```

**Option B: Via API (As Admin)**
```typescript
// POST /api/admin/profiles/{id}/locations
{
  "profile_id": "b59a1f4c-94fd-4805-a2c5-cac0922133e0",
  "location_name": "Napa Homestead",
  "city": "TBD",
  "state": "TBD",
  "country": "Australia",
  "location_type": "current",
  "is_primary": true,
  "traditional_territory": "Caterpillar Dreaming Country"
}
```

**Option C: Direct Database (Supabase Dashboard)**
```sql
-- First, create location if it doesn't exist
INSERT INTO locations (name, city, country, traditional_territory)
VALUES ('Napa Homestead', '[City]', 'Australia', 'Caterpillar Dreaming Country')
RETURNING id;

-- Then link to Kristy's profile
INSERT INTO profile_locations (profile_id, location_id, location_type, is_primary)
VALUES (
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  '[location_id from above]',
  'current',
  true
);
```

---

### Step 2: Fetch Existing Transcripts

**Goal:** See what stories Kristy has already shared

**Via API:**
```bash
curl "http://localhost:3030/api/admin/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0/transcripts"
```

**Via Supabase Dashboard:**
```sql
SELECT
  id,
  title,
  content,
  status,
  created_at,
  duration_seconds,
  word_count
FROM transcripts
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
ORDER BY created_at DESC;
```

**What to look for:**
- Transcript title/content
- Date recorded
- Topics mentioned (walking trail, Minga Minga Rangers, etc.)
- Status (draft/completed/published)
- Length and detail level

---

### Step 3: Add New Transcripts

**Scenario:** Kristy records a new story about the walking trail project

**Option A: Upload Audio (Full Workflow)**
```
1. Navigate to: /transcripts/upload
2. Upload audio file
3. AI transcribes automatically (Whisper)
4. Review transcript
5. AI analyzes for:
   - Key themes (sustainable tourism, cultural preservation)
   - Locations mentioned (Napa Homestead)
   - People mentioned (Minga Minga Rangers)
   - Cultural elements (Caterpillar Dreaming)
6. Edit/approve
7. Convert to story
8. Link photos
9. Publish
```

**Option B: Manual Entry (Quick)**
```
1. Navigate to: /stories/create
2. Select storyteller: Kristy Bloomfield
3. Enter story content
4. Add metadata:
   - Location: Napa Homestead
   - Themes: Sustainable Tourism, Cultural Preservation
   - Organization: Oonchiumpa
5. Upload photos
6. Publish
```

**Option C: API (Automated)**
```typescript
POST /api/transcripts
{
  "profile_id": "b59a1f4c-94fd-4805-a2c5-cac0922133e0",
  "title": "Walking Trail Vision at Napa Homestead",
  "content": "[Transcript text here]",
  "audio_url": "https://...",
  "status": "completed",
  "metadata": {
    "location": "Napa Homestead",
    "themes": ["sustainable_tourism", "cultural_heritage"],
    "collaborators": ["Minga Minga Rangers"]
  }
}
```

---

### Step 4: Find & Link Photos/Media

**Goal:** Connect all photos to Kristy's stories

**Current Photos:**
- Profile photo: ✅ kristy_bloomfield.jpg

**Photos Needed:**
1. Napa Homestead landscapes
2. Walking trail development
3. Minga Minga Rangers collaboration
4. Cultural sites (Caterpillar Dreaming)
5. Technology demonstrations (underwater drones)

**Find Existing Photos:**
```sql
SELECT
  id,
  filename,
  url,
  type,
  caption,
  created_at
FROM media
WHERE profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
ORDER BY created_at DESC;

-- Also check unlinked media that might be Kristy's
SELECT
  id,
  filename,
  caption,
  tags
FROM media
WHERE
  tags @> '["napa_homestead"]'::jsonb OR
  tags @> '["walking_trail"]'::jsonb OR
  caption ILIKE '%Kristy%'
  OR caption ILIKE '%Napa%';
```

**Link Photos to Stories:**
```typescript
// POST /api/media/link
{
  "media_id": "[media_id]",
  "story_id": "[story_id]",
  "profile_id": "b59a1f4c-94fd-4805-a2c5-cac0922133e0",
  "caption": "Napa Homestead walking trail development",
  "order": 1
}
```

**Upload New Photos:**
```
1. Navigate to: /galleries/upload
2. Select organization: Oonchiumpa
3. Upload multiple photos
4. Add captions and tags
5. Link to Kristy's profile
6. Assign to relevant stories/galleries
```

---

### Step 5: Review Organization Link (Oonchiumpa)

**Current:** Kristy → Oonchiumpa (Team Member)

**Verify the relationship:**
```sql
SELECT
  po.id,
  po.role,
  po.joined_at,
  po.is_active,
  o.name as organization_name,
  o.logo_url
FROM profile_organizations po
JOIN organisations o ON po.organization_id = o.id
WHERE po.profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';
```

**What to check:**
- ✅ Role correct? "Team Member" vs "Storyteller" vs "Coordinator"
- ✅ Active status?
- ✅ Join date accurate?
- ✅ Organization details correct?

**Update if needed:**
```sql
UPDATE profile_organizations
SET
  role = 'Storyteller', -- More specific role
  is_active = true
WHERE
  profile_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
  AND organization_id = 'c53077e1-98de-4216-9149-6268891ff62e';
```

---

### Step 6: Create Projects for Kristy's Work

**Goal:** Organize her initiatives into structured projects

**Projects to Create:**

#### Project 1: Napa Homestead Walking Trail
```typescript
POST /api/projects
{
  "name": "Napa Homestead Walking Trail",
  "description": "Development of interpretive walking trail blending historical insights with environmental stewardship",
  "organisation_id": "c53077e1-98de-4216-9149-6268891ff62e",
  "status": "active",
  "start_date": "2024-01-01", // Adjust to actual
  "project_type": "Cultural Heritage",
  "location": "Napa Homestead",
  "coordinators": ["b59a1f4c-94fd-4805-a2c5-cac0922133e0"]
}
```

**Then link Kristy as participant:**
```sql
INSERT INTO profile_projects (profile_id, project_id, role)
VALUES (
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  '[new_project_id]',
  'Project Lead'
);
```

#### Project 2: Indigenous Technology Documentation
```typescript
POST /api/projects
{
  "name": "Indigenous Storytelling Technology",
  "description": "Integration of underwater drones and modern technology to capture and preserve Indigenous cultural narratives",
  "organisation_id": "c53077e1-98de-4216-9149-6268891ff62e",
  "status": "active",
  "project_type": "Innovation & Technology"
}
```

#### Project 3: Minga Minga Rangers Collaboration
```typescript
POST /api/projects
{
  "name": "Minga Minga Rangers Partnership",
  "description": "Collaborative work with Minga Minga Rangers on cultural preservation and land management",
  "organisation_id": "c53077e1-98de-4216-9149-6268891ff62e",
  "status": "active",
  "project_type": "Community Partnership"
}
```

---

### Step 7: Create Galleries for Kristy's Visual Content

**Gallery 1: Napa Homestead Journey**
```
1. Navigate to: /galleries/create
2. Name: "Napa Homestead Journey"
3. Description: "The walking trail development and cultural landscape"
4. Organization: Oonchiumpa
5. Visibility: Public
6. Upload photos of:
   - Trail development stages
   - Landscape views
   - Historical markers
   - Environmental features
7. Link to project: "Napa Homestead Walking Trail"
8. Tag storyteller: Kristy Bloomfield
```

**Gallery 2: Cultural Innovation**
```
Name: "Cultural Technology Integration"
Photos of:
- Underwater drone demonstrations
- Technology in use for storytelling
- Documentation process
- Innovation outcomes
```

**Gallery 3: Caterpillar Dreaming Sites**
```
Name: "Yipa-Rinya Cheddar Cultural Sites"
Photos of:
- Significant cultural locations
- Caterpillar Dreaming country
- Cultural knowledge sharing moments
```

---

## 🔄 Simple Process Flow

### For Adding New Content (Simplified)

```
┌─────────────────────────────────────┐
│  1. CAPTURE                         │
│  - Record conversation with Kristy  │
│  - Take photos of location/work     │
│  - Gather any documents/artifacts   │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  2. UPLOAD                          │
│  - Upload audio → /transcripts      │
│  - Upload photos → /galleries       │
│  - AI transcribes audio             │
│  - AI analyzes content              │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  3. REVIEW & EDIT                   │
│  - Check transcript accuracy        │
│  - Add photo captions               │
│  - Verify AI-detected themes        │
│  - Confirm locations/people         │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  4. ORGANIZE                        │
│  - Link photos to story             │
│  - Assign to project                │
│  - Add to gallery                   │
│  - Tag themes/locations             │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  5. PUBLISH                         │
│  - Review with Kristy (if needed)   │
│  - Set visibility (public/private)  │
│  - Publish to site                  │
│  - Notify organization              │
└─────────────────────────────────────┘
```

---

## 👤 As Kristy - Her Experience

### What Kristy Can Do Herself:

**1. View Her Profile**
```
- Navigate to: /storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0
- Or: /profile (when logged in)
- See: All her stories, photos, projects, stats
```

**2. Edit Her Profile**
```
- Navigate to: /profile
- Click "Edit" button
- Update:
  ✅ Bio
  ✅ Photo
  ✅ Cultural background
  ✅ Languages
  ✅ Contact preferences
- Click "Save"
```

**3. Add Locations**
```
- Navigate to: /profile → Locations tab
- Click "+ Add Location"
- Search: "Napa Homestead"
- Select type: Current/Traditional/Significant
- Set visibility: Public/Private
- Save
```

**4. View Her Organizations**
```
- Navigate to: /profile → Organizations tab
- See: Oonchiumpa (Team Member)
- Click to view organization page
- See other team members
- READ ONLY - Can't change membership
```

**5. View Her Projects**
```
- Navigate to: /profile → Organizations tab
- See projects she's part of
- Click to view project details
- See photos, stories linked to project
- READ ONLY - Coordinators manage projects
```

**6. Create New Stories** (If Enabled)
```
- Navigate to: /stories/create
- Write or paste story content
- Add photos
- Set visibility
- Save as draft or publish
```

**7. Upload Photos** (If Enabled)
```
- Navigate to: /galleries/upload
- Select organization: Oonchiumpa
- Upload multiple files
- Add captions/tags
- Submit for review
```

**8. Control Privacy**
```
- Navigate to: /profile → Privacy tab
- Set what's public/private:
  ✅ Email visibility
  ✅ Phone visibility
  ✅ Location visibility
  ✅ Show in directory
  ✅ Allow messages
- Save preferences
```

### What Kristy CANNOT Do:
- ❌ Change organization membership (admin controls)
- ❌ Create/delete projects (coordinators only)
- ❌ Delete other people's content
- ❌ Access admin functions
- ❌ Manage organization settings

### What Kristy Needs Admin Help With:
- 🔧 Adding transcripts from recordings
- 🔧 Creating project pages
- 🔧 Organizing galleries
- 🔧 Linking content across projects
- 🔧 AI analysis of transcripts

---

## 🎯 Next: Let's Walk Through It

### As Super Admin First:
1. **Add Napa Homestead location** to Kristy's profile
2. **Fetch her existing transcripts** - see what's there
3. **Find her photos** - what media exists
4. **Create a project** - "Napa Homestead Walking Trail"
5. **Create a gallery** - Link photos to the project
6. **Review the result** - See complete profile

### Then As Kristy:
1. **Log in as Kristy** (or view her perspective)
2. **See her complete profile** - All connections visible
3. **Edit something simple** - Update bio or add a location
4. **View her content** - See stories, photos, projects organized
5. **Understand permissions** - What she can change vs what admin manages

---

## 🛠️ Tools We'll Use

1. **Supabase Dashboard** - Direct database queries
2. **Browser UI** - http://localhost:3030
3. **API Endpoints** - Programmatic access
4. **Profile Management** - /profile pages

**Let's start! Which step should we do first?**

Options:
A. Add Napa Homestead location (via Supabase Dashboard - fastest)
B. Fetch existing transcripts (see what content exists)
C. Find all photos linked to Kristy
D. All of the above in sequence

Your choice! 🚀
