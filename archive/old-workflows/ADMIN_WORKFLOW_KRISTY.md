# Admin Workflow: Building Kristy Bloomfield's Complete Profile

## 🎯 Objective
Walk through the **admin UI** to add locations, create projects, and link Kristy to projects - ensuring all data syncs properly across the platform.

## ✅ What We Have Built

### 1. **Location Management** ([/admin/locations](http://localhost:3030/admin/locations))
- Add locations to storyteller profiles
- Set primary/current location
- Add traditional territory
- Search and filter profiles
- LocationPicker component with autocomplete

### 2. **Storyteller Edit Page** ([/admin/storytellers/[id]/edit](http://localhost:3030/admin/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0/edit))
- Three tabs: Profile, Transcripts, **Connections**
- **Connections Tab** shows:
  - Current connections (organizations + projects)
  - Intelligent suggestions with AI-powered matching
  - Cultural alignment indicators
  - One-click connection with role assignment

### 3. **Projects Management** ([/admin/projects](http://localhost:3030/admin/projects))
- Create new projects
- Link to organizations
- Manage project details

---

## 📋 Step-by-Step Workflow for Kristy

### **Kristy's Profile:**
- **ID:** `b59a1f4c-94fd-4805-a2c5-cac0922133e0`
- **Name:** Kristy Bloomfield
- **Organization:** Oonchiumpa (Team Member)
- **Stories:** 2 published
- **Current Gaps:** No locations, no projects linked

---

## 🚀 STEP 1: Add Locations to Kristy

### Option A: Via Location Management Page

1. **Open:** [http://localhost:3030/admin/locations](http://localhost:3030/admin/locations)

2. **Search for Kristy:**
   - Type "Kristy" or "bloomfield" in search box
   - Click on Kristy Bloomfield in the profile list

3. **Add Primary Location:**
   - In "Primary Location (Current)" field
   - Type "Napa Homestead" or "Flinders Ranges"
   - Select from dropdown or create new
   - City: Flinders Ranges
   - State: South Australia
   - Country: Australia

4. **Add Traditional Territory:**
   - In "Traditional Territory (Optional)" field
   - Type "Caterpillar Dreaming Country"
   - Create new if not found

5. **Click "Save Locations"**

6. **Verify:**
   - Kristy should now show location badge
   - Check removed from "missing locations" filter

### Option B: Via Profile Edit (Not Yet Implemented)
Currently, locations can only be added via [/admin/locations](http://localhost:3030/admin/locations).

**✅ Expected Result:**
- Kristy's profile shows "Napa Homestead, South Australia"
- Traditional territory: "Caterpillar Dreaming Country"
- Data syncs to public profile page

---

## 🚀 STEP 2: Create Projects

### Visit: [http://localhost:3030/admin/projects](http://localhost:3030/admin/projects)

Let me check what the projects page looks like...

**We'll create 3 projects:**

### Project 1: Napa Homestead Walking Trail
- **Name:** Napa Homestead Walking Trail
- **Description:** Development of interpretive walking trail blending historical insights with environmental stewardship on Napa Homestead property. This project showcases sustainable tourism practices while honoring the cultural significance of Caterpillar Dreaming Country.
- **Organization:** Oonchiumpa
- **Status:** Active
- **Start Date:** 2024-01-01

### Project 2: Indigenous Storytelling Technology
- **Name:** Indigenous Storytelling Technology
- **Description:** Integration of underwater drones and modern technology to capture and preserve Indigenous cultural narratives. This innovative project explores how technology can serve cultural preservation while maintaining respect for traditional knowledge.
- **Organization:** Oonchiumpa
- **Status:** Active
- **Start Date:** 2024-03-01

### Project 3: Minga Minga Rangers Partnership
- **Name:** Minga Minga Rangers Partnership
- **Description:** Collaborative work with Minga Minga Rangers on cultural preservation, land management, and knowledge sharing. This partnership strengthens community connections and supports traditional land management practices.
- **Organization:** Oonchiumpa
- **Status:** Active
- **Start Date:** 2024-02-01

---

## 🚀 STEP 3: Link Kristy to Projects

### Via Connections Tab (Recommended)

1. **Open Kristy's Edit Page:**
   [http://localhost:3030/admin/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0/edit](http://localhost:3030/admin/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0/edit)

2. **Click "Connections" Tab**

3. **View Intelligent Suggestions:**
   - The system should show the 3 projects we just created
   - Each suggestion shows:
     - Match score (percentage)
     - Match reasons (cultural alignment, geographic proximity)
     - Suggested role

4. **Connect to Each Project:**
   - Click "Connect" button on each suggestion
   - System assigns suggested role automatically
   - Roles we want:
     - **Walking Trail:** Project Lead
     - **Technology:** Innovation Lead
     - **Minga Minga:** Partnership Coordinator

5. **Verify Current Connections:**
   - All 3 projects should appear in "Current Connections" section
   - Each shows role, status, and connection date

---

## 🔍 STEP 4: Verify Data Syncs

### Check Multiple Views:

1. **Kristy's Public Profile:**
   [http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0](http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0)

   **Should Show:**
   - ✅ Napa Homestead, South Australia
   - ✅ Caterpillar Dreaming Country (traditional territory)
   - ✅ Project listings (if implemented)
   - ✅ Organization: Oonchiumpa

2. **Organization Page:**
   [http://localhost:3030/organisations/c53077e1-98de-4216-9149-6268891ff62e](http://localhost:3030/organisations/c53077e1-98de-4216-9149-6268891ff62e)

   **Should Show:**
   - ✅ Kristy as Team Member
   - ✅ All 3 projects
   - ✅ Project cards with Kristy listed

3. **Individual Project Pages:**
   - Navigate to each project
   - Kristy should appear as team member with correct role

4. **Admin Dashboard:**
   [http://localhost:3030/admin/storytellers](http://localhost:3030/admin/storytellers)

   **Should Show:**
   - ✅ Kristy with updated location
   - ✅ Project count: 3
   - ✅ Story count: 2

---

## 🎨 UI/UX Features to Test

### Location Management
- ✅ Autocomplete works smoothly
- ✅ Can create new locations on the fly
- ✅ Search/filter profiles
- ✅ Success message after saving
- ✅ Profile list updates immediately

### Connection Manager
- ✅ Intelligent suggestions appear automatically
- ✅ Match scores are meaningful
- ✅ Cultural alignment badges show correctly
- ✅ One-click connection works
- ✅ Loading states during connection
- ✅ Current connections update in real-time
- ✅ Beautiful, intuitive design

### Data Synchronization
- ✅ Changes reflect immediately
- ✅ No need to refresh pages
- ✅ Consistent data across all views
- ✅ Proper error handling

---

## 📊 Expected Final State

### Kristy's Complete Profile:

```json
{
  "id": "b59a1f4c-94fd-4805-a2c5-cac0922133e0",
  "display_name": "Kristy Bloomfield",
  "locations": [
    {
      "name": "Napa Homestead",
      "city": "Flinders Ranges",
      "state": "South Australia",
      "country": "Australia",
      "traditional_territory": "Caterpillar Dreaming Country",
      "type": "current",
      "is_primary": true
    }
  ],
  "organizations": [
    {
      "name": "Oonchiumpa",
      "role": "Team Member"
    }
  ],
  "projects": [
    {
      "name": "Napa Homestead Walking Trail",
      "role": "Project Lead",
      "status": "active"
    },
    {
      "name": "Indigenous Storytelling Technology",
      "role": "Innovation Lead",
      "status": "active"
    },
    {
      "name": "Minga Minga Rangers Partnership",
      "role": "Partnership Coordinator",
      "status": "active"
    }
  ],
  "stories": 2
}
```

---

## 🛠️ Potential Issues to Check

### 1. LocationPicker Component
- **File:** `src/components/ui/location-picker.tsx`
- **Dependency:** Requires `command` component
- **Status:** May need fixing if not working

### 2. API Endpoints
Check these are working:
- `GET /api/admin/storytellers` - ✅ Exists
- `POST /api/profiles/[id]/locations` - ✅ Exists
- `GET /api/admin/connections/suggest` - ✅ Exists
- `POST /api/admin/connections` - ✅ Exists
- `GET /api/admin/projects` - Need to verify

### 3. Connection Manager Intelligence
The system should automatically suggest projects based on:
- Organization membership (Kristy is in Oonchiumpa)
- Cultural alignment
- Geographic proximity
- Skills/interests

---

## 🎯 Next Steps After Linking

Once Kristy has locations and projects:

1. **Link Stories to Projects:**
   - Find her 2 existing stories
   - Associate with relevant projects
   - Add project context to stories

2. **Add Media:**
   - Upload photos related to each project
   - Link photos to stories
   - Create galleries

3. **Test User Experience:**
   - Log in as Kristy
   - View her profile from her perspective
   - Test what she can edit vs what's admin-controlled

---

## 📝 Quick Start Commands

```bash
# Start dev server
npm run dev

# Open key pages:
open http://localhost:3030/admin/locations
open http://localhost:3030/admin/projects
open http://localhost:3030/admin/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0/edit
open http://localhost:3030/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0
```

---

## ✨ What Makes This World-Class

1. **Intelligent Suggestions:**
   - AI-powered connection recommendations
   - Cultural sensitivity built-in
   - Geographic awareness
   - Match scoring

2. **Seamless Data Sync:**
   - Real-time updates
   - No manual refreshing needed
   - Consistent across all views

3. **Beautiful UX:**
   - Intuitive workflows
   - Clear visual feedback
   - One-click actions
   - Loading states
   - Success/error messaging

4. **Cultural Respect:**
   - Traditional territory support
   - Cultural authority recognition
   - Elder wisdom indicators
   - Community-first design

---

## 🚦 Let's Start!

**Ready to test the workflow?**

Start here: [http://localhost:3030/admin/locations](http://localhost:3030/admin/locations)

1. Add Kristy's location
2. Create 3 projects
3. Link Kristy to projects via Connections tab
4. Verify everything syncs!

Then we'll test from Kristy's perspective to see what she can control vs what's admin-only.
