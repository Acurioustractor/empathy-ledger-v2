# Oonchiumpa Storyteller & Project Management Analysis

## Issues Found

### 1. **Transcripts Have No Storyteller Links**
- **ALL 21 transcripts** in Oonchiumpa have `storyteller_id = NULL`
- Transcripts exist and are linked to "The Homestead" project
- But they don't identify WHO the storyteller is

### 2. **Stories Use `author_id` Instead of `storyteller_id`**
- Stories have `author_id` populated correctly
- But `storyteller_id` is NULL on all stories
- Schema has BOTH fields but only one is being used

### 3. **Stories Not Linked to Projects**
- **ALL 7 stories** have `project_id = NULL`
- Stories are orphaned - not associated with any project
- Example: "Patricia Ann Miller — Key Story" exists but not in any project

### 4. **Project-Storyteller Links Exist But Aren't Used**
- 4 storytellers are linked to "The Homestead" project via `project_storytellers` table
  - Kristy Bloomfield
  - Patricia Ann Miller
  - Tanya Turner
  - Aunty Bev and Uncle terry
- But their transcripts and stories don't reflect this linkage

## Current State

### Oonchiumpa Organization
- **ID**: c53077e1-98de-4216-9149-6268891ff62e
- **Tenant ID**: 8891e1a9-92ae-423f-928b-cec602660011
- **Projects**: 2
  - The Homestead (21 transcripts, 4 linked storytellers)
  - Law Student Workshops (0 transcripts, 1 linked storyteller)

### Storytellers (9 total)
1. Suzie Ma - Linked to "Law Student Workshops"
2. Kristy Bloomfield - Linked to "The Homestead"
3. Chelsea Kenneally - No project links
4. Aunty Bev and Uncle terry (duplicate entries!)
5. Adelaide Hayes - No project links
6. Patricia Ann Miller - Linked to "The Homestead"
7. Aidan Harris - No project links
8. Tanya Turner - Linked to "The Homestead"

### Transcripts (21 total)
- All assigned to "The Homestead" project
- **NONE** have storyteller_id assigned
- Examples:
  - "Stage 1 Developmenatl Evaluation - ASR Project"
  - "Oonchiumpa x NIAA progress report_June25"
  - "Kristy1", "Kristy2" (suggest Kristy Bloomfield)
  - "Tanya1" (suggests Tanya Turner)

### Stories (7 total)
- **NONE** assigned to any project
- Have `author_id` but NOT `storyteller_id`
- Examples:
  - "Patricia Ann Miller — Key Story" (author_id matches Patricia)
  - "Kristy Bloomfield — Key Story" (author_id matches Kristy)
  - "Tanya Turner — Key Story" (author_id matches Tanya)

## What's Working

✅ **project_storytellers table** - Links are correct
✅ **profile_organizations table** - Org membership works
✅ **Storyteller profiles** - All 9 profiles exist with correct tenant_id

## What's Broken

❌ **transcript.storyteller_id** - All NULL (should be populated)
❌ **story.storyteller_id** - All NULL (should match author_id)
❌ **story.project_id** - All NULL (stories are orphaned)
❌ **Duplicate storytellers** - "Aunty Bev and Uncle terry" exists twice

## Required UI Features

### 1. **Assign Storyteller to Transcript**
When viewing/editing a transcript:
- Dropdown to select storyteller from project's linked storytellers
- Or search all storytellers in organization
- Update `transcripts.storyteller_id`

### 2. **Assign Story to Project**
When viewing/editing a story:
- Dropdown to select project
- Update `stories.project_id`

### 3. **Sync storyteller_id and author_id**
- When setting story.author_id, also set story.storyteller_id
- Or provide separate fields if they can be different people

### 4. **Manage Project Storytellers**
In project management UI:
- View list of storytellers linked to project
- Add storytellers to project (create project_storytellers link)
- Remove storytellers from project
- See count of transcripts/stories per storyteller

### 5. **Bulk Operations**
For Oonchiumpa's situation:
- Bulk assign storyteller to multiple transcripts
- Infer storyteller from transcript title (e.g., "Kristy1" → Kristy Bloomfield)
- Bulk assign stories to project

## Recommended Fixes

### Immediate Actions:
1. **Fix duplicate "Aunty Bev and Uncle terry"** - Merge or remove one
2. **Infer storytellers from transcript titles**:
   - "Kristy1", "Kristy2" → Kristy Bloomfield
   - "Tanya1" → Tanya Turner
3. **Copy story.author_id to story.storyteller_id** for all stories
4. **Assign all stories to "The Homestead" project** (since they're all from that project's storytellers)

### UI Development Priorities:
1. **Project Storytellers Tab** - Manage who's in each project
2. **Transcript Editor** - Add storyteller selector
3. **Story Editor** - Add project and storyteller selectors
4. **Bulk Edit Tool** - For cleaning up existing data

## Data Quality Issues

1. **Naming inconsistencies**:
   - "Aunty Bev and Uncle terry Aunty Bev and Uncle terry" (duplicate name)
   - "Oochiumpa" vs "Oonchiumpa" in transcript titles

2. **Missing emails**:
   - 5 out of 9 storytellers have no email (NULL)
   - Only placeholder emails exist for 4 storytellers

3. **Placeholder vs Real Data**:
   - Platform development transcripts mixed with real content
   - "PUBLIC_WEBSITE_DESIGN", "PROJECT_ARCHITECTURE", "CODEBASE_AUDIT"
