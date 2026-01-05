# 🎙️ Transcript Upload Guide - The Easiest Way

## Current Situation Analysis

### What We Have:
- ✅ Stories table with `story_transcript` field (text column)
- ✅ Admin transcript pages UI (`/admin/transcripts`)
- ✅ Media assets table (for audio files)
- ❌ No dedicated transcripts table (uses story_transcript field)
- ❌ No direct upload UI for transcripts

### The Simplest Approach: **Use Stories Table**

Since your schema stores transcripts in the `stories.story_transcript` column, we'll use that!

---

## 📋 Option 1: Quick Manual Upload (Fastest - Start Here!)

### For Adding a Few Transcripts

**Step 1: Prepare Your Transcript Data**
```
File: kristy_napa_homestead.txt
────────────────────────────────────────
Title: Developing the Napa Homestead Walking Trail
Storyteller: Kristy Bloomfield
Date Recorded: 2025-01-15

[Transcript content here...]

The vision for the Napa Homestead walking trail began with
a deep connection to the land and its stories. Working
alongside the Minga Minga Rangers, we've been mapping
historical sites...
```

**Step 2: Insert via SQL (Direct Database)**
```sql
-- 1. Find Kristy's profile ID
SELECT id, display_name FROM profiles
WHERE display_name ILIKE '%kristy%';

-- Result: b59a1f4c-94fd-4805-a2c5-cac0922133e0

-- 2. Insert story with transcript
INSERT INTO stories (
  title,
  story_transcript,
  story_copy,
  author_id,
  status,
  created_at
) VALUES (
  'Developing the Napa Homestead Walking Trail',
  'The vision for the Napa Homestead walking trail began with a deep connection to the land and its stories. Working alongside the Minga Minga Rangers, we''ve been mapping historical sites and cultural significance points along the route...',
  NULL, -- story_copy is empty until we create polished version
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  'draft', -- Start as draft
  NOW()
);
```

**Step 3: Verify**
```sql
SELECT id, title, status, author_id, created_at
FROM stories
WHERE author_id = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'
ORDER BY created_at DESC;
```

**Time: 5 minutes per transcript** ⚡

---

## 📋 Option 2: Admin UI Upload (Better UX)

### Create Simple Upload Form

**Location:** `/admin/transcripts/upload`

**What the UI Needs:**

```typescript
interface TranscriptUploadForm {
  // Basic Info
  title: string                    // "Napa Homestead Interview"
  storyteller_id: string           // Select from dropdown

  // Transcript Content
  transcript_text: string          // Full text (paste or upload .txt)

  // Optional Metadata
  recording_date?: Date            // When was this recorded?
  location?: string                // "Napa Homestead"
  language?: string                // Default: "English"

  // Processing
  auto_analyze?: boolean           // Run AI analysis now?
  status: 'draft' | 'pending_review' | 'completed'
}
```

**Upload Flow:**
```
Admin Dashboard
  ↓
Click [+ Upload Transcript]
  ↓
Fill Form:
  - Title: "Napa Homestead Walking Trail"
  - Storyteller: [Select: Kristy Bloomfield]
  - Paste transcript text OR upload .txt file
  - Recording date: Jan 15, 2025
  - Location: Napa Homestead
  ↓
Click [Save as Draft] or [Save & Analyze]
  ↓
Story created with transcript
  ↓
Ready for AI processing
```

---

## 📋 Option 3: Bulk Upload (For Multiple Transcripts)

### Upload Multiple Transcripts at Once

**Format: CSV or JSON**

**CSV Example:**
```csv
title,storyteller_email,transcript_text,recording_date,location
"Napa Homestead Trail","kristy@example.com","The vision for...",2025-01-15,"Napa Homestead"
"Cultural Technology","kristy@example.com","Working with underwater drones...",2025-01-20,"Traditional Territory"
"Minga Rangers Partnership","kristy@example.com","Our collaboration began...",2025-01-25,"Community Center"
```

**Upload Script:**
```bash
# Run from project root
node scripts/upload-transcripts-bulk.js path/to/transcripts.csv
```

**Processing:**
1. Reads CSV
2. Finds storyteller by email
3. Creates story records with transcripts
4. Optionally triggers AI analysis
5. Reports success/errors

---

## 🎨 UX/UI Improvements Needed Before Testing

### 1. **Admin Transcript Upload Page** (Priority: HIGH)

**Current State:** ❌ No dedicated upload page
**Needed:** ✅ `/admin/transcripts/upload` page

**Design:**
```
┌────────────────────────────────────────────────────┐
│ Upload New Transcript                              │
├────────────────────────────────────────────────────┤
│                                                    │
│ Basic Information                                  │
│ ─────────────────────────────────────────────────│
│ Title: [_________________________________]         │
│ Storyteller: [Select: Kristy Bloomfield ▼]        │
│ Recording Date: [📅 Jan 15, 2025]                 │
│ Location: [Napa Homestead_______________]         │
│ Language: [English ▼]                             │
│                                                    │
│ Transcript Content                                 │
│ ─────────────────────────────────────────────────│
│ ┌──────────────────────────────────────────────┐ │
│ │ Paste transcript here or upload .txt file    │ │
│ │                                              │ │
│ │ [Or drag & drop .txt/.docx file here]       │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ Processing Options                                 │
│ ─────────────────────────────────────────────────│
│ ☑️ Run AI analysis after upload                   │
│ ☐ Extract themes and quotes                       │
│ ☐ Create draft story automatically                │
│                                                    │
│ [Cancel] [Save as Draft] [Save & Analyze]         │
└────────────────────────────────────────────────────┘
```

### 2. **Transcript List View Improvements** (Priority: MEDIUM)

**Current:** List exists but needs better filtering
**Needed:** Quick actions, better status indicators

**Improvements:**
```
Admin > Transcripts
────────────────────────────────────────────────────
[+ Upload Transcript] [Import Bulk]    [Search___] 🔍

Filters: [All Status ▼] [All Storytellers ▼] [Date Range]

┌─────────────────────────────────────────────────┐
│ ⚡ Napa Homestead Walking Trail                 │
│ By: Kristy Bloomfield                           │
│ 📅 Jan 15, 2025 | 📍 Napa Homestead             │
│ Status: [Draft] ⏳ Pending Analysis              │
│ [View] [Analyze] [Create Story]                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ✅ Cultural Technology Innovation               │
│ By: Kristy Bloomfield                           │
│ 📅 Jan 20, 2025 | 📍 Traditional Territory      │
│ Status: [Completed] ✨ Analysis Complete         │
│ [View] [Edit] [View Story]                      │
└─────────────────────────────────────────────────┘
```

### 3. **Transcript Detail Page** (Priority: HIGH)

**Path:** `/admin/transcripts/[id]`

**Layout:**
```
┌────────────────────────────────────────────────────┐
│ 📝 Napa Homestead Walking Trail                   │
│ By Kristy Bloomfield | Jan 15, 2025               │
├────────────────────────────────────────────────────┤
│                                                    │
│ [Overview] [Transcript] [AI Analysis] [Story]     │
│                                                    │
│ ─── Overview Tab ────────────────────────────────│
│                                                    │
│ Status: Draft                                      │
│ Word Count: 1,847 words                           │
│ Duration: ~12 minutes                             │
│ Location: Napa Homestead                          │
│ Language: English                                  │
│                                                    │
│ Quick Actions:                                     │
│ [🤖 Run AI Analysis]                              │
│ [📝 Create Story]                                 │
│ [✏️ Edit Transcript]                              │
│ [🗑️ Delete]                                       │
│                                                    │
│ ─── Transcript Tab ──────────────────────────────│
│                                                    │
│ [Full transcript text displayed here]             │
│ [Editable if needed]                              │
│                                                    │
│ ─── AI Analysis Tab ─────────────────────────────│
│                                                    │
│ Themes Detected:                                   │
│ • Sustainable Tourism                             │
│ • Cultural Heritage                               │
│ • Community Partnership                           │
│ • Land Connection                                 │
│                                                    │
│ Key Quotes:                                        │
│ "The land tells us its stories..."                │
│ "Working with Rangers opened my eyes..."          │
│                                                    │
│ Locations Mentioned:                              │
│ • Napa Homestead                                  │
│ • Traditional Territory                           │
│                                                    │
│ People Referenced:                                │
│ • Minga Minga Rangers                             │
│                                                    │
│ ─── Story Tab ───────────────────────────────────│
│                                                    │
│ Draft Story: [View] [Edit] [Publish]              │
│ or                                                │
│ [+ Create New Story from This Transcript]         │
└────────────────────────────────────────────────────┘
```

### 4. **Storyteller Profile - Transcript Tab** (Priority: LOW)

**Add to storyteller edit page:**
```
/admin/storytellers/[id]/edit

[Profile] [Stories] [Transcripts] [Media] [Settings]

─── Transcripts Tab ──────────────────────────────
Kristy Bloomfield's Transcripts (3 total)

┌──────────────────────────────────────────────┐
│ ✅ Napa Homestead Walking Trail              │
│ Jan 15, 2025 | 1,847 words                   │
│ Status: Completed → Story Published          │
│ [View Transcript] [View Story]               │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ⏳ Cultural Technology Innovation            │
│ Jan 20, 2025 | 2,103 words                   │
│ Status: Pending Analysis                     │
│ [View] [Analyze]                             │
└──────────────────────────────────────────────┘

[+ Upload New Transcript for Kristy]
```

### 5. **Batch Processing Dashboard** (Priority: LOW - Future)

**For processing multiple transcripts:**
```
Batch Processing Queue
──────────────────────────────────────────────
3 transcripts in queue

┌──────────────────────────────────────────────┐
│ Processing: Napa Homestead Trail             │
│ Step: AI Theme Extraction (2/4)              │
│ Progress: [████████░░░░] 60%                 │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Queued: Cultural Technology                  │
│ Position: #2                                 │
└──────────────────────────────────────────────┘

[Process All] [Pause Queue]
```

---

## 🚀 Recommended Workflow (Start Simple)

### Phase 1: Manual Upload (Do This First!)
1. Use SQL to insert 2-3 sample transcripts for Kristy
2. Test admin pages with real data
3. Verify story creation works
4. Check public display

### Phase 2: Build Upload Form
1. Create `/admin/transcripts/upload` page
2. Simple form with paste textarea
3. Storyteller dropdown
4. Save creates story record

### Phase 3: Add AI Processing
1. Hook up AI analysis button
2. Extract themes, quotes, locations
3. Show results in admin view
4. Generate draft story

### Phase 4: Polish UX
1. Drag & drop file upload
2. Bulk import CSV
3. Better status indicators
4. Progress tracking

---

## 📝 SQL Templates for Quick Testing

### Insert Test Transcript for Kristy
```sql
-- Story with transcript (no AI processing yet)
INSERT INTO stories (
  title,
  story_transcript,
  author_id,
  status,
  created_at
) VALUES (
  'Napa Homestead Walking Trail Development',
  'The vision for the Napa Homestead walking trail began with a deep connection to the land and its stories. Working alongside the Minga Minga Rangers, we''ve been mapping historical sites and cultural significance points along the route.

What makes this trail special is how it blends environmental stewardship with cultural heritage. Every step along the path tells a story - from the traditional plant species we''re protecting to the historical markers that explain the land''s significance.

Our partnership with the Rangers has been transformative. They bring generations of knowledge about these lands, and we''re documenting it all in ways that honor their traditions while making it accessible to visitors.

The walking trail isn''t just about tourism - though sustainable tourism is important. It''s about creating a space where people can connect with the land, understand its history, and appreciate the ongoing relationship between the community and this place.

We''re also exploring innovative ways to capture and share these stories. Using technology like underwater drones for the waterways, we can document aspects of the land that have never been accessible before. It''s about bringing together traditional knowledge and modern tools in a respectful way.',
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  'draft',
  '2025-01-15 10:30:00'
) RETURNING id, title, status;
```

### Insert Multiple Transcripts
```sql
-- Batch insert for testing
INSERT INTO stories (title, story_transcript, author_id, status, created_at)
VALUES
  (
    'Yipa-Rinya Cheddar and Caterpillar Dreaming',
    'Working with the Yipa-Rinya Cheddar has opened my eyes to the deeper meanings behind the Caterpillar Dreaming. It''s not just a story - it''s a living connection to the land and its cycles...',
    'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
    'draft',
    '2025-01-20 14:00:00'
  ),
  (
    'Collaboration with Minga Minga Rangers',
    'Our partnership with the Minga Minga Rangers began simply - they needed help documenting their knowledge, and we had the tools and enthusiasm. But it became so much more than that...',
    'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
    'draft',
    '2025-01-25 09:15:00'
  );
```

### Query to Check Inserted Transcripts
```sql
SELECT
  s.id,
  s.title,
  s.status,
  p.display_name as author,
  LENGTH(s.story_transcript) as transcript_length,
  s.created_at
FROM stories s
JOIN profiles p ON s.author_id = p.id
WHERE p.display_name ILIKE '%kristy%'
ORDER BY s.created_at DESC;
```

---

## 🎯 Key UX Decisions Before Testing

### 1. **Transcript vs Story - Clear Distinction**

**Problem:** Current schema uses `stories` table for both

**Solution Options:**
- **A)** Keep it simple: Story with transcript = "raw story"
- **B)** Add status field to distinguish: `draft_from_transcript` vs `published`
- **C)** Create view: admin sees "transcripts", public sees "stories"

**Recommendation:** **Option C** - Use views for clarity
```sql
-- Admin sees "transcripts" (stories with status = 'draft' or 'pending_review')
CREATE VIEW admin_transcripts AS
SELECT * FROM stories WHERE status IN ('draft', 'pending_review');

-- Public sees "stories" (stories with status = 'published')
CREATE VIEW public_stories AS
SELECT * FROM stories WHERE status = 'published';
```

### 2. **Upload Method Priority**

**Options:**
1. ✅ **Paste text** (simplest, start here)
2. ✅ **Upload .txt file** (easy to add)
3. ⏳ **Upload audio + transcribe** (complex, phase 2)
4. ⏳ **Bulk CSV import** (for many transcripts)

**Start with:** Paste text + .txt upload

### 3. **AI Processing Trigger**

**When should AI analysis run?**

**Options:**
- A) Automatically on upload
- B) Manual "Analyze" button
- C) Batch processing queue

**Recommendation:** **B + C**
- Save transcript without AI (fast)
- Admin clicks [Analyze] when ready
- Optionally: checkbox "Auto-analyze on upload"

### 4. **Story Generation Flow**

**From transcript → published story:**

**Flow:**
```
Transcript Uploaded
  ↓
[View in Admin]
  ↓
Click [Analyze] → AI extracts themes/quotes
  ↓
Click [Create Story] → Draft story generated
  ↓
Admin edits story_copy field
  ↓
Click [Publish] → Status = 'published'
  ↓
Story appears on public site
```

**Key Fields:**
- `story_transcript` = Raw transcript text
- `story_copy` = Polished story for public
- `status` = draft/pending_review/published

---

## ✅ Pre-Testing Checklist

Before you add transcripts, check:

- [ ] Kristy's profile exists in database
- [ ] Can query stories by author_id
- [ ] Admin transcript pages accessible
- [ ] Story detail page shows transcript field
- [ ] Can distinguish transcript vs polished story
- [ ] Status workflow is clear (draft → review → published)
- [ ] Public pages don't show drafts
- [ ] Admin can edit both transcript and story_copy

---

## 🎬 Quick Start Steps (Do This Now!)

### Step 1: Verify Schema (2 min)
```sql
-- Check stories table has transcript field
\d stories

-- Check if Kristy exists
SELECT id, display_name FROM profiles
WHERE display_name ILIKE '%kristy%';
```

### Step 2: Add Sample Transcript (5 min)
```sql
-- Use SQL template above to insert one transcript
-- This tests the basic flow
```

### Step 3: View in Admin (2 min)
```bash
# Start dev server
npm run dev

# Navigate to:
# http://localhost:3000/admin/transcripts
```

### Step 4: Test Story Creation (10 min)
- Can you see the transcript?
- Can you edit it?
- Can you create a story from it?
- Does it show on Kristy's profile?

### Step 5: Test Public Display (5 min)
- Does draft stay hidden from public?
- When you publish, does it appear?
- Is transcript hidden from public view?

**Total Time: ~30 minutes** to verify full workflow!

---

## 🚨 Common Issues & Solutions

### Issue 1: "Profile doesn't exist"
```sql
-- Create Kristy's profile first
INSERT INTO profiles (id, display_name, bio)
VALUES (
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  'Kristy Bloomfield',
  'Visionary leader in sustainable tourism...'
);
```

### Issue 2: "Can't see transcript in admin"
- Check status isn't 'published'
- Verify admin_transcripts API endpoint
- Check table permissions

### Issue 3: "Transcript showing on public site"
- Verify status = 'draft'
- Check public API filters by status
- Review RLS policies

### Issue 4: "Can't upload file"
- Start with paste text first
- Add file upload as phase 2
- Check file size limits

---

## 📊 Success Metrics

After uploading transcripts, you should have:

✅ 3+ transcripts in database for Kristy
✅ Visible in admin transcript list
✅ Can view/edit transcript text
✅ Can run AI analysis
✅ Can create story from transcript
✅ Draft stories don't show publicly
✅ Published stories appear on profile
✅ Clear workflow: transcript → draft → published

---

## 🎯 Summary: Best Approach

**For Starting NOW:**
1. ✅ Use SQL to insert 2-3 sample transcripts
2. ✅ Test with existing admin pages
3. ✅ Verify workflow works end-to-end
4. ⏳ Build upload form (next phase)
5. ⏳ Add AI processing (after upload works)

**Fastest path to testing: SQL insert → 30 minute verification → iterate!** 🚀
