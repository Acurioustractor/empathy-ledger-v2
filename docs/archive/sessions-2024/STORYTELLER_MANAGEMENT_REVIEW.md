# Storyteller & Project Management - Review & Recommendations

## Executive Summary

**Current State**: The platform has the UI infrastructure for managing storytellers in projects, but Oonchiumpa's data reveals critical gaps:
- ✅ **UI exists** for adding/removing storytellers to/from projects
- ❌ **All transcripts** (21/21) have NULL `storyteller_id`
- ❌ **All stories** (7/7) have NULL `storyteller_id` and `project_id`
- ❌ **Data integrity issues**: Orphaned records, missing links, duplicate profiles

## What Works ✅

### 1. **Project Storyteller Management UI**
Location: `/organisations/[id]/projects/[projectId]/manage`

**Component**: `ProjectRelationshipManager`

**Features**:
- View all storytellers in a project
- Add storytellers to project via dropdown
- Remove storytellers from project
- Shows storyteller roles (participant, lead, etc.)
- Lists transcripts linked to project

### 2. **Database Tables Structure**
- `project_storytellers` - Links storytellers to projects ✅
- `profile_organizations` - Links profiles to organizations ✅
- `transcripts` - Has `storyteller_id` and `project_id` fields ✅
- `stories` - Has `storyteller_id`, `author_id`, and `project_id` fields ✅

### 3. **APIs**
- `POST /api/projects/[id]/storytellers` - Add storyteller to project ✅
- `DELETE /api/projects/[id]/storytellers` - Remove storyteller from project ✅
- `GET /api/projects/[id]/storytellers` - List project storytellers ✅
- `GET /api/projects/[id]/transcripts` - List project transcripts ✅

## What's Broken ❌

### 1. **Transcripts Have No Storyteller**
**Problem**: All 21 Oonchiumpa transcripts have `storyteller_id = NULL`

**Impact**:
- Can't see WHO told the story
- Can't filter transcripts by storyteller
- Can't generate storyteller-specific reports
- Analytics broken

**Example**:
```
Transcript: "Kristy1"
storyteller_id: NULL  ❌
Should be: Kristy Bloomfield's ID
```

### 2. **Stories Not Linked Correctly**
**Problem**: Stories use `author_id` but NOT `storyteller_id`

**Impact**:
- Confusion between author vs storyteller
- Stories not appearing in storyteller profiles
- Broken queries that look for `storyteller_id`

**Example**:
```
Story: "Patricia Ann Miller — Key Story"
storyteller_id: NULL  ❌
author_id: [Patricia's ID]  ✅
Should have BOTH fields populated
```

### 3. **Stories Not Linked to Projects**
**Problem**: All 7 Oonchiumpa stories have `project_id = NULL`

**Impact**:
- Stories are "orphaned"
- Can't view stories when viewing a project
- Project analytics miss story data
- Can't generate project reports

### 4. **Missing UI for Assigning Storytellers**

**No UI to**:
- Assign storyteller when creating/editing transcript
- Assign storyteller when creating/editing story
- Assign project when creating/editing story
- Bulk-assign storytellers to existing transcripts
- Edit transcript storyteller after creation

## Required Fixes

### Priority 1: Data Cleanup (Oonchiumpa)

1. **Infer Storytellers from Transcript Titles**
   ```typescript
   "Kristy1" → storyteller_id = Kristy Bloomfield
   "Kristy2" → storyteller_id = Kristy Bloomfield
   "Tanya1" → storyteller_id = Tanya Turner
   ```

2. **Copy author_id to storyteller_id for Stories**
   ```sql
   UPDATE stories
   SET storyteller_id = author_id
   WHERE organization_id = 'oonchiumpa_id' AND storyteller_id IS NULL;
   ```

3. **Assign Stories to Project**
   ```sql
   UPDATE stories
   SET project_id = 'The Homestead project ID'
   WHERE organization_id = 'oonchiumpa_id' AND project_id IS NULL;
   ```

4. **Remove Duplicate Profile**
   - Merge "Aunty Bev and Uncle terry" duplicates

### Priority 2: UI Enhancements

#### A. **Transcript Editor - Add Storyteller Selector**

**Location**: When editing a transcript

**Add**:
```tsx
<Select value={storytellerId} onValueChange={setStorytellerId}>
  <SelectTrigger>
    <SelectValue placeholder="Select storyteller..." />
  </SelectTrigger>
  <SelectContent>
    {projectStorytellers.map(st => (
      <SelectItem value={st.id}>{st.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Requirement**: Must save `storyteller_id` when creating/updating transcript

#### B. **Story Editor - Add Project & Storyteller Selectors**

**Location**: When editing a story

**Add**:
1. Project selector dropdown
2. Storyteller selector dropdown (filtered by project)
3. Auto-sync: When `author_id` is set, also set `storyteller_id` to same value (unless different)

#### C. **Quick Add Form - Already Has This** ✅

The Quick Add form we just fixed DOES populate `storyteller_id` correctly!
- Creates profile
- Sets transcript.storyteller_id
- Sets story.storyteller_id AND story.author_id

#### D. **Bulk Edit Tool**

**New page**: `/admin/organizations/[id]/data-cleanup`

**Features**:
- List all transcripts with NULL storyteller_id
- Dropdown to assign storyteller
- "Infer from title" button (uses AI/regex)
- Bulk select and assign
- Same for stories

### Priority 3: Data Validation

**Add Database Triggers/Constraints**:
1. When `author_id` is set on a story, auto-populate `storyteller_id` if NULL
2. Warn when creating transcript without storyteller_id
3. Suggest project_id when creating story based on storyteller's projects

**Add UI Validation**:
1. Show warning if saving transcript without storyteller
2. Show warning if saving story without project
3. Suggest storyteller based on project selection

## Recommended Workflow

### Current Workflow (Broken):
1. User adds transcript to project ✅
2. Transcript appears in project BUT shows "Unknown" storyteller ❌
3. User adds story separately
4. Story is orphaned, not linked to project ❌

### Fixed Workflow:
1. User goes to Project → Manage → Storytellers ✅
2. Add storytellers to project ✅
3. When creating transcript, SELECT storyteller from project's storytellers ✅ NEW
4. When creating story, SELECT:
   - Storyteller (defaults to author) ✅ NEW
   - Project (defaults to current project) ✅ NEW
5. Everything linked correctly ✅

## Implementation Steps

### Step 1: Fix Oonchiumpa Data (Script)
```bash
npx tsx scripts/fix-oonchiumpa-storyteller-links.ts
```

### Step 2: Add Storyteller Selector to Transcript Form
- File: `src/app/admin/transcripts/[id]/edit/page.tsx` (or similar)
- Add dropdown to select storyteller
- Save to `transcripts.storyteller_id`

### Step 3: Add Project & Storyteller Selectors to Story Form
- File: `src/app/admin/stories/[id]/edit/page.tsx` (or similar)
- Add project dropdown
- Add storyteller dropdown (filtered by project)
- Auto-sync author_id and storyteller_id

### Step 4: Create Bulk Edit Tool
- New page: `/admin/organizations/[id]/bulk-edit`
- List all orphaned transcripts/stories
- Bulk assign storytellers/projects

### Step 5: Add Validation
- Warn when creating transcript without storyteller
- Warn when creating story without project
- Suggest values based on context

## Files to Create/Modify

### New Files Needed:
1. `scripts/fix-oonchiumpa-storyteller-links.ts` - Data cleanup script
2. `src/app/admin/organizations/[id]/bulk-edit/page.tsx` - Bulk edit UI
3. `src/components/admin/TranscriptStorytellerSelector.tsx` - Reusable selector

### Files to Modify:
1. `src/app/admin/quick-add/page.tsx` - ✅ Already done!
2. Transcript edit forms - Add storyteller selector
3. Story edit forms - Add project & storyteller selectors
4. `src/components/organization/ProjectRelationshipManager.tsx` - Add "assign storyteller" to transcripts list

## Success Criteria

After fixes:
- ✅ Every transcript has a storyteller_id (not NULL)
- ✅ Every story has both storyteller_id AND project_id
- ✅ Viewing a project shows all its stories and transcripts
- ✅ Viewing a storyteller shows all their transcripts and stories
- ✅ Project analytics include all related content
- ✅ No "Unknown" storytellers in listings

## Next Actions

**Immediate**:
1. Review this document with user
2. Get approval for data cleanup approach
3. Create data cleanup script for Oonchiumpa
4. Run script (with backup!)

**Short Term**:
1. Add storyteller selector to transcript forms
2. Add project/storyteller selectors to story forms
3. Create bulk edit tool

**Long Term**:
1. Add validation to prevent future orphaned records
2. Create migration scripts for other organizations
3. Add data quality monitoring dashboard
