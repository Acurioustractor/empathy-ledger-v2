# Storyteller Management System - Complete Implementation

## Date: 2025-11-10

## Overview

This document summarizes the complete implementation of storyteller management improvements for the Empathy Ledger platform, including data cleanup, UI enhancements, and bulk editing tools.

---

## ✅ All Tasks Completed

### 1. **Data Cleanup for Oonchiumpa** ✅
### 2. **Transcript Edit Form Enhancement** ✅
### 3. **Story Edit Form Enhancement** ✅
### 4. **Bulk Edit Tool** ✅
### 5. **Duplicate Profile Merge** ✅

---

## Detailed Implementation

### 1. Data Cleanup for Oonchiumpa ✅

**Script**: [scripts/fix-oonchiumpa-storyteller-links.ts](scripts/fix-oonchiumpa-storyteller-links.ts)

**Results**:
```
✅ Transcripts fixed: 3/21
   - Kristy1 → Kristy Bloomfield
   - Kristy2 → Kristy Bloomfield
   - Tanya1 → Tanya Turner

✅ Stories storyteller_id fixed: 6/7
   - Patricia Ann Miller — Key Story
   - Aunty Bev and Uncle terry — Key Story
   - Tanya Turner — Key Story
   - Kristy Bloomfield — Key Story
   - Aunty Bev and Uncle terry's Story
   - The Future of Oonchiumpa

✅ Stories project_id fixed: 6/7
   - All assigned to "The Homestead" project
```

**Remaining**:
- 18 transcripts with generic titles still need manual assignment (use bulk edit tool)
- 1 story ("Young person returns to school") needs attention

---

### 2. Transcript Edit Form Enhancement ✅

**File**: [src/app/admin/transcripts/[id]/edit/page.tsx](src/app/admin/transcripts/[id]/edit/page.tsx)

**Changes**:
1. ✅ Added storyteller selector dropdown
2. ✅ Fetches storytellers from transcript's organization
3. ✅ Shows warning when no storyteller assigned
4. ✅ Saves storyteller_id on form submit

**API Updates**:
- [src/app/api/admin/storytellers/route.ts](src/app/api/admin/storytellers/route.ts:140-152) - Added `transcript_id` parameter support
- [src/app/api/transcripts/[id]/route.ts](src/app/api/transcripts/[id]/route.ts:143-146) - Added storyteller_id to PUT endpoint

**Features**:
```tsx
// Storyteller selector with warning
<Select value={formData.storyteller_id} onValueChange={...}>
  <SelectTrigger>
    <SelectValue placeholder="Select a storyteller..." />
  </SelectTrigger>
  <SelectContent>
    {availableStorytellers.map((storyteller) => (
      <SelectItem key={storyteller.id} value={storyteller.id}>
        {storyteller.full_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

{!formData.storyteller_id && (
  <p className="text-xs text-amber-600 mt-1">
    ⚠️ No storyteller assigned
  </p>
)}
```

---

### 3. Story Edit Form Enhancement ✅

**File**: [src/app/stories/[id]/edit/page.tsx](src/app/stories/[id]/edit/page.tsx)

**Changes**:
1. ✅ Added project selector dropdown
2. ✅ Added storyteller selector (already existed, now improved)
3. ✅ Fetches projects from organization
4. ✅ Shows warning when no project assigned
5. ✅ Saves both project_id and storyteller_id

**Features**:
```tsx
// Dual selectors for storyteller and project
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Storyteller selector */}
  <Select value={formData.storyteller_id} onValueChange={...}>
    {/* ... */}
  </Select>

  {/* Project selector - NEW */}
  <Select value={formData.project_id} onValueChange={...}>
    <SelectTrigger>
      <SelectValue placeholder="Select a project..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">None</SelectItem>
      {projects.map(project => (
        <SelectItem key={project.id} value={project.id}>
          {project.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Warnings**:
- Shows ⚠️ if no storyteller assigned
- Shows ⚠️ if no project assigned ("story is orphaned")

---

### 4. Bulk Edit Tool ✅

**File**: [src/app/admin/bulk-edit/page.tsx](src/app/admin/bulk-edit/page.tsx)

**API**: [src/app/api/admin/transcripts/bulk-assign/route.ts](src/app/api/admin/transcripts/bulk-assign/route.ts)

**Features**:
1. ✅ Organization selector
2. ✅ Lists all orphaned transcripts (storyteller_id = NULL)
3. ✅ Bulk selection with checkboxes
4. ✅ "Infer from Titles" button - automatically matches storytellers based on transcript titles
5. ✅ Individual storyteller assignment dropdowns
6. ✅ Bulk save functionality
7. ✅ Progress feedback

**How It Works**:
```typescript
// Infer storyteller from title using fuzzy matching
const inferStorytellerFromTitle = (transcript: Transcript): string | null => {
  const title = transcript.title.toLowerCase()

  for (const storyteller of storytellers) {
    const firstName = storyteller.full_name.split(' ')[0].toLowerCase()

    // Match "Kristy1", "Kristy2" → Kristy Bloomfield
    if (title.includes(firstName) && title.match(new RegExp(`\\b${firstName}\\d*\\b`))) {
      return storyteller.id
    }
  }

  return null
}
```

**Access**:
- Navigate to: `/admin/bulk-edit`
- Select organization
- View orphaned transcripts
- Assign storytellers individually or use "Infer from Titles"
- Click "Save Assignments"

---

### 5. Duplicate Profile Merge ✅

**Script**: [scripts/merge-aunty-bev-duplicates.ts](scripts/merge-aunty-bev-duplicates.ts)

**Results**:
```
✅ Kept Profile: Aunty Bev and Uncle terry Aunty Bev and Uncle terry
   ID: 2a263da7-836f-42f8-ad3f-9bdf09832f0e

🔀 Migrated Relationships: 5
   - 5 extracted quotes

🗑️  Removed: Aunty Bev and Uncle terry
   ID: f8e99ed8-723a-48bc-a346-40f4f7a4032e

✨ Merge complete!
```

**What Was Migrated**:
1. ✅ 5 extracted quotes → moved to primary profile
2. ✅ All project_storytellers links → consolidated
3. ✅ All profile_organizations links → cleaned up
4. ✅ Duplicate profile → deleted

**Now**:
- Only 1 "Aunty Bev and Uncle terry" profile exists
- All quotes and relationships preserved
- No data loss

---

## API Enhancements

### 1. Admin Storytellers API
**File**: [src/app/api/admin/storytellers/route.ts](src/app/api/admin/storytellers/route.ts)

**New Feature**: `transcript_id` parameter
```typescript
// Fetch storytellers for a transcript's organization
GET /api/admin/storytellers?transcript_id={id}

// Automatically resolves:
// 1. transcript_id → organization_id
// 2. organization_id → tenant_id
// 3. tenant_id → storytellers
```

### 2. Transcripts PUT API
**File**: [src/app/api/transcripts/[id]/route.ts](src/app/api/transcripts/[id]/route.ts)

**New Feature**: `storyteller_id` support
```typescript
// Now accepts storyteller_id in request body
PUT /api/transcripts/{id}
{
  "storyteller_id": "uuid-here",  // NEW
  "title": "...",
  "transcript_content": "..."
}
```

### 3. Admin Transcripts API
**File**: [src/app/api/admin/transcripts/route.ts](src/app/api/admin/transcripts/route.ts)

**New Features**: Organization filtering & orphaned transcripts
```typescript
// Filter by organization
GET /api/admin/transcripts?organization_id={id}

// Get orphaned transcripts (storyteller_id = NULL)
GET /api/admin/transcripts?storyteller_id=null&organization_id={id}
```

### 4. Bulk Assign API (NEW)
**File**: [src/app/api/admin/transcripts/bulk-assign/route.ts](src/app/api/admin/transcripts/bulk-assign/route.ts)

**Endpoint**:
```typescript
POST /api/admin/transcripts/bulk-assign
{
  "updates": [
    { "transcript_id": "uuid1", "storyteller_id": "uuid-a" },
    { "transcript_id": "uuid2", "storyteller_id": "uuid-b" }
  ]
}

// Response:
{
  "success": true,
  "updated": 2,
  "total": 2,
  "message": "Successfully assigned 2 storytellers"
}
```

---

## Database Impact

### Before
```
Oonchiumpa Organization:
├── Transcripts: 21 total
│   ├── WITH storyteller_id: 0 (0%)
│   └── WITHOUT storyteller_id: 21 (100%)  ❌
├── Stories: 7 total
│   ├── WITH storyteller_id: 0 (0%)
│   └── WITHOUT storyteller_id: 7 (100%)  ❌
│   ├── WITH project_id: 0 (0%)
│   └── WITHOUT project_id: 7 (100%)  ❌
└── Storyteller Profiles: 9 total
    └── Duplicates: 2 "Aunty Bev"  ❌
```

### After
```
Oonchiumpa Organization:
├── Transcripts: 21 total
│   ├── WITH storyteller_id: 3 (14%)  ✅ (18 can be assigned via bulk edit)
│   └── WITHOUT storyteller_id: 18 (86%)
├── Stories: 7 total
│   ├── WITH storyteller_id: 6 (86%)  ✅
│   └── WITHOUT storyteller_id: 1 (14%)
│   ├── WITH project_id: 6 (86%)  ✅
│   └── WITHOUT project_id: 1 (14%)
└── Storyteller Profiles: 8 total  ✅ (duplicate merged)
    └── Duplicates: 0  ✅
```

---

## User Workflows

### Workflow 1: Edit Existing Transcript
1. Navigate to `/admin/transcripts/{id}/edit`
2. See storyteller dropdown with organization's storytellers
3. Select storyteller from dropdown
4. Click "Save Changes"
5. ✅ storyteller_id saved

### Workflow 2: Edit Existing Story
1. Navigate to `/stories/{id}/edit`
2. See both storyteller and project dropdowns
3. Select storyteller and project
4. Click "Save Changes"
5. ✅ Both storyteller_id and project_id saved

### Workflow 3: Bulk Assign Storytellers
1. Navigate to `/admin/bulk-edit`
2. Select organization from dropdown
3. View list of orphaned transcripts
4. Click "Infer from Titles" to auto-match (matches ~14% of transcripts)
5. Manually assign remaining transcripts using dropdowns
6. Click "Save X Assignments"
7. ✅ All selected transcripts updated

### Workflow 4: Quick Add (Already Working)
1. Navigate to `/admin/quick-add`
2. Fill in storyteller name, transcript, story
3. Select organization and project
4. Click "Save and Done"
5. ✅ Redirect to storyteller profile
6. ✅ All IDs properly assigned (storyteller_id, project_id, author_id)

---

## Files Created

### Scripts
1. [scripts/fix-oonchiumpa-storyteller-links.ts](scripts/fix-oonchiumpa-storyteller-links.ts) - Data cleanup automation
2. [scripts/merge-aunty-bev-duplicates.ts](scripts/merge-aunty-bev-duplicates.ts) - Duplicate profile merger
3. [scripts/review-oonchiumpa-structure.ts](scripts/review-oonchiumpa-structure.ts) - Analysis tool
4. [scripts/debug-oonchiumpa-storyteller-links.ts](scripts/debug-oonchiumpa-storyteller-links.ts) - Debug tool

### UI Components
1. [src/app/admin/bulk-edit/page.tsx](src/app/admin/bulk-edit/page.tsx) - Bulk edit tool (NEW)

### API Endpoints
1. [src/app/api/admin/transcripts/bulk-assign/route.ts](src/app/api/admin/transcripts/bulk-assign/route.ts) - Bulk assignment API (NEW)

### Documentation
1. [OONCHIUMPA_STORYTELLER_ANALYSIS.md](OONCHIUMPA_STORYTELLER_ANALYSIS.md) - Detailed analysis
2. [STORYTELLER_MANAGEMENT_REVIEW.md](STORYTELLER_MANAGEMENT_REVIEW.md) - Complete review
3. [SESSION_SUMMARY_STORYTELLER_MANAGEMENT.md](SESSION_SUMMARY_STORYTELLER_MANAGEMENT.md) - Session 1 summary
4. [STORYTELLER_MANAGEMENT_COMPLETE.md](STORYTELLER_MANAGEMENT_COMPLETE.md) - This document

---

## Files Modified

### Enhanced Forms
1. [src/app/admin/transcripts/[id]/edit/page.tsx](src/app/admin/transcripts/[id]/edit/page.tsx)
   - Added storyteller selector
   - Added storyteller fetching
   - Added warning for NULL storyteller

2. [src/app/stories/[id]/edit/page.tsx](src/app/stories/[id]/edit/page.tsx)
   - Added project selector
   - Added project fetching
   - Added warnings for orphaned stories

3. [src/app/admin/quick-add/page.tsx](src/app/admin/quick-add/page.tsx)
   - Enhanced success feedback
   - Added auto-redirect to storyteller profile

### Enhanced APIs
1. [src/app/api/admin/storytellers/route.ts](src/app/api/admin/storytellers/route.ts)
   - Added `transcript_id` parameter support

2. [src/app/api/transcripts/[id]/route.ts](src/app/api/transcripts/[id]/route.ts)
   - Added `storyteller_id` to PUT endpoint

3. [src/app/api/admin/transcripts/route.ts](src/app/api/admin/transcripts/route.ts)
   - Added `organization_id` filtering
   - Added support for `storyteller_id=null` (orphaned transcripts)

---

## Testing Guide

### Test 1: Transcript Edit
```bash
# Navigate to any Oonchiumpa transcript edit page
# Example: http://localhost:3030/admin/transcripts/{id}/edit

Expected:
✅ Storyteller dropdown appears
✅ Dropdown shows 8 Oonchiumpa storytellers
✅ Warning shows if no storyteller selected
✅ Selecting storyteller and saving updates database
```

### Test 2: Story Edit
```bash
# Navigate to any story edit page
# Example: http://localhost:3030/stories/{id}/edit

Expected:
✅ Storyteller dropdown appears
✅ Project dropdown appears
✅ Warnings show if either is NULL
✅ Selecting both and saving updates database
```

### Test 3: Bulk Edit Tool
```bash
# Navigate to bulk edit page
http://localhost:3030/admin/bulk-edit

Expected:
✅ Organization selector appears
✅ Selecting Oonchiumpa shows ~18 orphaned transcripts
✅ "Infer from Titles" matches ~2-3 transcripts
✅ Manual assignment dropdowns work
✅ Bulk save updates all selected transcripts
```

### Test 4: Data Verification
```bash
# Run verification script
npx tsx scripts/review-oonchiumpa-structure.ts

Expected:
✅ 3 transcripts now have storyteller_id
✅ 6 stories have storyteller_id
✅ 6 stories have project_id
✅ Only 1 "Aunty Bev" profile exists
✅ No duplicate profiles
```

---

## Success Metrics

### Data Quality Improvements
- ✅ 14% of transcripts now properly linked (3/21)
- ✅ 86% of stories now have storytellers (6/7)
- ✅ 86% of stories now linked to projects (6/7)
- ✅ 100% of duplicate profiles merged (2→1)

### UI/UX Improvements
- ✅ Transcript edit: storyteller selector added
- ✅ Story edit: project selector added
- ✅ Bulk edit tool: created for mass assignments
- ✅ Warnings: show when critical IDs are missing

### Developer Experience
- ✅ 4 new scripts for data management
- ✅ 1 new bulk edit page
- ✅ 1 new API endpoint
- ✅ 4 enhanced API endpoints
- ✅ Comprehensive documentation

---

## Remaining Work (Optional)

### Low Priority
1. **Name Cleanup**: Fix "Aunty Bev and Uncle terry Aunty Bev and Uncle terry" (duplicate name in profile)
2. **Story Fix**: Manually assign storyteller to "Young person returns to school" story
3. **Manual Assignment**: Use bulk edit tool to assign remaining 18 transcripts

### Nice to Have
1. **Auto-sync**: Add database trigger to sync story.author_id and story.storyteller_id
2. **Validation**: Add UI warnings when creating transcripts/stories without IDs
3. **Monitoring**: Add data quality dashboard to track orphaned records

---

## Architecture Notes

### Key Design Decisions

1. **Stories have both author_id and storyteller_id**
   - `author_id`: Who created the story record
   - `storyteller_id`: Who the story is about
   - Usually the same, but can differ

2. **Organization-based filtering**
   - Storyteller/project dropdowns filter by organization
   - Uses tenant_id for multi-tenant isolation

3. **Graceful degradation**
   - Forms work even with NULL IDs (with warnings)
   - Can assign IDs after creation via edit pages

4. **Bulk operations**
   - Smart inference from titles where possible
   - Manual assignment for ambiguous cases
   - Idempotent scripts (safe to re-run)

---

## Next Steps

### Immediate (if needed)
1. Use bulk edit tool to assign remaining 18 Oonchiumpa transcripts
2. Fix story "Young person returns to school after cultural healing"
3. Clean up "Aunty Bev and Uncle terry Aunty Bev and Uncle terry" name

### Future Enhancements
1. Add same pattern to other organizations
2. Create data quality monitoring dashboard
3. Add database triggers for auto-sync
4. Implement validation rules to prevent future orphans

---

## Conclusion

All requested features have been successfully implemented:

✅ **Story edit forms** now have project and storyteller selectors
✅ **Transcript edit forms** now have storyteller selectors
✅ **Bulk edit tool** created for mass storyteller assignments
✅ **Duplicate profiles** merged successfully
✅ **Data cleanup** automated and partially completed

The platform now has robust tools for managing storyteller relationships, with clear warnings for orphaned content and bulk editing capabilities for data cleanup.

---

**End of Implementation Summary**
