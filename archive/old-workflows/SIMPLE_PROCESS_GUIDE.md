# Simple Process Guide - Building Complete Storyteller Profiles

## 🎯 The Goal: Make It EASY

For **Super Admin:** Quick setup via SQL scripts
For **Kristy:** Simple UI for managing her own content

---

## 🚀 Super Admin Process (5 Minutes)

### Step 1: Open Supabase Dashboard
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor
```

### Step 2: Copy & Run SQL Script
Open: `KRISTY_SETUP_SCRIPTS.sql`

Run sections in order:
1. ✅ Check current data (see what exists)
2. ✅ Add Napa Homestead location
3. ✅ Create 3 projects
4. ✅ Link projects to Kristy
5. ✅ Update profile fields
6. ✅ Verify everything worked

**Result:** Kristy's profile is now complete with locations, projects, and organization links!

### Step 3: View the Result
```
http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0
```

You should see:
- ✅ Location: Napa Homestead (Caterpillar Dreaming Country)
- ✅ Projects: 3 active projects listed
- ✅ Organization: Oonchiumpa (enhanced role)
- ✅ Stories: 2 published stories
- ✅ Profile complete!

---

## 👤 Kristy's Process (Self-Service)

### What Kristy Can Do Now:

**1. View Her Complete Profile**
```
Login → Navigate to /profile
See: Everything organized - locations, projects, stories, photos
```

**2. Add a New Location**
```
Profile → Locations Tab → "+ Add Location"
Search: "Brisbane" or "Caterpillar Dreaming Site #2"
Type: Traditional Territory
Visibility: Public
Save → Done! ✅
```

**3. Update Her Bio**
```
Profile → Personal Tab → Click "Edit"
Update bio text
Click "Save" → Done! ✅
```

**4. Upload a Photo**
```
Profile → Media Tab (if we add it)
Or: Navigate to project page
Click "Upload Photos"
Select files → Add captions → Submit
Admin reviews → Publishes → Done! ✅
```

**5. View Her Projects**
```
Profile → Organizations Tab
See: All 3 projects listed
Click: View project details
See: Stories and photos linked to each project
```

**6. Control Privacy**
```
Profile → Privacy Tab
Toggle: What's public vs private
Save → Done! ✅
```

### What Kristy CANNOT Do (Admin Only):
- ❌ Create new projects (admin creates structure)
- ❌ Change organization membership
- ❌ Delete transcripts
- ❌ Access other people's data

---

## 🔄 Simple Workflow for New Content

### Scenario: Kristy records a new story about the walking trail

**As Super Admin:**
```
1. CAPTURE
   - Record Kristy talking about walking trail progress
   - Take photos during site visit

2. UPLOAD TO SYSTEM
   - Upload audio → System transcribes automatically
   - Upload photos → Attach to project

3. AI PROCESSES
   - Extracts themes: "sustainable tourism, trail development"
   - Detects locations: "Napa Homestead"
   - Identifies people: "Minga Minga Rangers"
   - Links to project: "Napa Homestead Walking Trail"

4. REVIEW & APPROVE
   - Check transcript accuracy
   - Verify photo captions
   - Confirm linkages are correct
   - Click "Publish"

5. DONE! ✅
   Story appears:
   - On Kristy's profile
   - In project page
   - In Oonchiumpa organization
   - In public storyteller directory
```

**As Kristy (If Self-Service Enabled):**
```
1. LOGIN
   Navigate to: /stories/create

2. WRITE OR PASTE
   - Paste transcript of conversation
   - Or write new story directly

3. ADD DETAILS
   - Select project: "Napa Homestead Walking Trail"
   - Add location: "Napa Homestead"
   - Upload 2-3 photos

4. SET VISIBILITY
   - Public (everyone can see)
   - Or: Organization Only (just Oonchiumpa)

5. SAVE
   - Save as Draft (review later)
   - Or: Publish Now (goes live immediately)

6. DONE! ✅
```

---

## 📊 What Shows Where?

### On Kristy's Public Profile:
```
/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0

Visible to EVERYONE:
✅ Display name & photo
✅ Bio
✅ Locations (if public)
✅ Traditional territory
✅ Organization: Oonchiumpa
✅ Projects (3)
✅ Published stories (2)
✅ Story count, project count
✅ Cultural background
✅ Storytelling experience level

NOT visible:
❌ Email (unless she makes it public)
❌ Phone number
❌ Private locations
❌ Draft stories
❌ Admin notes
```

### On Oonchiumpa Organization Page:
```
/organisations/c53077e1-98de-4216-9149-6268891ff62e

Shows:
✅ Kristy listed as "Storyteller & Cultural Heritage Coordinator"
✅ Her profile photo
✅ Link to her full profile
✅ Her stories within organization context
✅ Projects she's leading
```

### On Project Pages:
```
/projects/[project-id]

Example: "Napa Homestead Walking Trail"

Shows:
✅ Project description
✅ Kristy as "Project Lead"
✅ All stories tagged to this project
✅ All photos in project gallery
✅ Timeline of progress
✅ Other team members
```

---

## 🎨 Making It Simple - Key Principles

### 1. **Single Source of Truth**
- Kristy's data lives in `profiles` table
- Everything links back to her profile ID
- Update once → reflects everywhere

### 2. **Automatic Connections**
- Add story to project → Auto-links to Kristy
- Upload photo to gallery → Links to profile
- AI detects themes → Auto-tags appropriately

### 3. **Clear Visibility Controls**
- Public vs Private toggles
- Organization-only option
- Field-level privacy (email, phone, etc.)

### 4. **Minimal Admin Work**
- Set up structure once (projects, organizations)
- Storytellers manage their own content
- AI handles connections and tagging

### 5. **User-Friendly UI**
- Clear tabs (Locations, Projects, Stories, etc.)
- Visual indicators (public/private badges)
- Simple forms with helpful hints
- Real-time preview of changes

---

## 🚀 Next Steps

### For You (Right Now):
1. **Run the SQL script** in Supabase Dashboard
2. **View Kristy's profile** - see the complete setup
3. **Test as Kristy** - login and try editing something
4. **Document any pain points** - what's confusing?

### To Make It Even Simpler:
1. **Add "Quick Add" buttons**
   - "Add Story" → Pre-fills profile ID
   - "Add Photo to Project" → Links automatically

2. **Create Templates**
   - "New Walking Trail Update" story template
   - "Site Visit Photo Set" upload template

3. **Smart Suggestions**
   - "This photo looks like Napa Homestead - link to walking trail project?"
   - "Story mentions Minga Minga Rangers - tag them?"

4. **Bulk Operations**
   - Upload 20 photos → AI sorts into projects
   - Import transcript → AI creates story + links media

---

## 📋 Cheat Sheet

### As Super Admin - Quick Commands:

**Check someone's profile:**
```sql
SELECT * FROM profiles WHERE display_name ILIKE '%[name]%';
```

**Add location:**
```sql
-- Create location if needed
INSERT INTO locations (name, country, traditional_territory)
VALUES ('[name]', 'Australia', '[territory]') RETURNING id;

-- Link to profile
INSERT INTO profile_locations (profile_id, location_id, location_type, is_primary)
VALUES ('[profile_id]', '[location_id]', 'current', true);
```

**Create project:**
```sql
INSERT INTO projects (name, description, organisation_id, status)
VALUES ('[name]', '[desc]', '[org_id]', 'active') RETURNING id;

-- Link person
INSERT INTO profile_projects (profile_id, project_id, role)
VALUES ('[profile_id]', '[project_id]', 'Lead');
```

**Find unlinked media:**
```sql
SELECT * FROM media
WHERE profile_id IS NULL
AND (caption ILIKE '%[keyword]%' OR tags @> '["[tag]"]'::jsonb);
```

---

## 🎯 Success Metrics

**Profile is "Complete" when:**
- ✅ Bio filled out
- ✅ Photo uploaded
- ✅ At least 1 location added
- ✅ Organization membership active
- ✅ At least 1 project linked
- ✅ At least 1 story published
- ✅ Privacy settings configured

**Kristy's Profile Status:**
- ✅ Bio: Complete
- ✅ Photo: Yes
- ✅ Locations: Added (Napa Homestead)
- ✅ Organization: Oonchiumpa
- ✅ Projects: 3 linked
- ✅ Stories: 2 published
- ✅ Privacy: Default (needs review)

**Overall: 95% Complete!** 🎉

Missing:
- Traditional knowledge keeper badge (if applicable)
- Additional locations (cultural sites)
- More photos linked to projects

---

## 💡 Pro Tips

1. **Start with structure** (locations, projects) before adding content
2. **Use AI suggestions** - it's usually right about connections
3. **Batch operations** - Add 10 stories at once vs one at a time
4. **Review regularly** - Check for orphaned media, unlinked content
5. **Let storytellers self-manage** - They know their content best

---

**Ready to run the setup? Open Supabase Dashboard and let's build Kristy's complete profile!** 🚀
