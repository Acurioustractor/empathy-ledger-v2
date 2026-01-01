# Session Summary: Storyteller Management Improvements

## Date: 2025-11-10

## Problems Addressed

### 1. Quick Add Form UX Issue
**Problem**: Form successfully created storyteller but provided no feedback
**Solution**:
- Added success screen with checkmark and created resource IDs
- Auto-redirect to storyteller profile after 0.5s on "Save and Done"
- Toast notification for "Save and Add Another"

### 2. Oonchiumpa Data Integrity Issues
**Problems Found**:
- ALL 21 transcripts had `storyteller_id = NULL`
- ALL 7 stories had `storyteller_id = NULL` (only `author_id` populated)
- ALL 7 stories had `project_id = NULL` (orphaned)
- 2 duplicate "Aunty Bev and Uncle terry" profiles

**Solutions Implemented**:
- Created and ran data cleanup script (`scripts/fix-oonchiumpa-storyteller-links.ts`)
- ✅ Fixed 3 transcripts (Kristy1, Kristy2, Tanya1) by inferring from titles
- ✅ Fixed 6 stories: copied author_id to storyteller_id
- ✅ Fixed 6 stories: assigned to "The Homestead" project
- ⚠️ 18 transcripts still need manual assignment (generic titles)
- ⚠️ 1 story still needs attention ("Young person returns to school")
- ⚠️ Duplicate profiles identified but need manual merge

### 3. Missing UI for Storyteller Assignment
**Problem**: No way to assign storytellers when creating/editing transcripts
**Solution**: Added storyteller selector to transcript edit page

## Implementation Details

### Files Created
1. **`scripts/fix-oonchiumpa-storyteller-links.ts`**
   - Automated data cleanup script
   - Infers storytellers from transcript titles
   - Copies author_id to storyteller_id for stories
   - Assigns stories to appropriate projects
   - Identifies duplicate profiles

2. **`OONCHIUMPA_STORYTELLER_ANALYSIS.md`**
   - Detailed analysis of data integrity issues
   - Current state documentation
   - Lists what's working vs broken

3. **`STORYTELLER_MANAGEMENT_REVIEW.md`**
   - Comprehensive review with implementation roadmap
   - Success criteria definitions
   - Prioritized fix recommendations

### Files Modified

#### 1. `src/app/admin/quick-add/page.tsx`
**Changes**:
- Added success screen with resource IDs
- Auto-redirect to storyteller profile on "Save and Done"
- Toast notification for "Save and Add Another"
- Different behavior for each save option

**Code Changes**:
```typescript
// Success handling
if (saveAndAddAnother) {
  // Show brief toast and reset form
  showToast('✅ Story added! Add another...')
  resetForm()
} else {
  // Show success screen and redirect
  setSuccess(true)
  setCreatedStory(result)
  setTimeout(() => {
    router.push(`/storytellers/${result.storyteller_id}`)
  }, 500)
}
```

#### 2. `src/app/admin/transcripts/[id]/edit/page.tsx`
**Changes**:
- Added `storyteller_id` to form state
- Added `availableStorytellers` state and loading state
- Created `fetchStorytellers()` function to load options
- Replaced read-only storyteller display with editable Select dropdown
- Added warning when no storyteller assigned

**Code Changes**:
```typescript
// New state
const [formData, setFormData] = useState({
  // ... existing fields
  storyteller_id: ''
})

const [availableStorytellers, setAvailableStorytellers] = useState<Array<{ id: string; full_name: string }>>([])

// Storyteller selector UI
<Select
  value={formData.storyteller_id}
  onValueChange={(value) => handleInputChange('storyteller_id', value)}
>
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
```

#### 3. `src/app/api/admin/storytellers/route.ts`
**Changes**:
- Added support for `transcript_id` query parameter
- Automatically fetches transcript's organization and filters storytellers

**Code Changes**:
```typescript
const transcriptId = searchParams.get('transcript_id') || ''

// If transcript_id is provided, fetch the transcript's organization
if (transcriptId && !organizationId) {
  const { data: transcript } = await supabase
    .from('transcripts')
    .select('organization_id')
    .eq('id', transcriptId)
    .single()

  if (transcript?.organization_id) {
    organizationId = transcript.organization_id
  }
}
```

#### 4. `src/app/api/transcripts/[id]/route.ts`
**Changes**:
- Modified PUT endpoint to accept and save `storyteller_id`
- Allows both setting and clearing storyteller assignment

**Code Changes**:
```typescript
const updateData: any = {
  // ... existing fields
}

// Include storyteller_id if provided (can be set or cleared)
if ('storyteller_id' in body) {
  updateData.storyteller_id = body.storyteller_id || null
}

const { data, error } = await supabase
  .from('transcripts')
  .update(updateData)
  .eq('id', transcriptId)
  .select()
  .single()
```

## Results

### Data Cleanup Results
```
📊 FINAL SUMMARY
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

⚠️ Transcripts skipped: 18 (generic titles, need manual assignment)
⚠️ Stories skipped: 2
⚠️ 2 duplicate profiles need manual review
```

### UI Improvements
- ✅ Transcript edit page now has storyteller selector dropdown
- ✅ Storytellers filtered by organization
- ✅ Warning shown when no storyteller assigned
- ✅ Link to storyteller profile when assigned

## Remaining Work

### Priority 1: Story Form Enhancements
**Task**: Add project and storyteller selectors to story creation/edit forms
**Files to modify**:
- `src/app/admin/stories/[id]/edit/page.tsx` (or similar)
- Story creation forms

**What to add**:
1. Project selector dropdown
2. Storyteller selector dropdown (filtered by selected project)
3. Auto-sync between author_id and storyteller_id

### Priority 2: Bulk Edit Tool
**Task**: Create UI for bulk-assigning storytellers to transcripts
**Files to create**:
- `src/app/admin/organizations/[id]/bulk-edit/page.tsx`
- Bulk edit API endpoints

**Features needed**:
- List all transcripts with NULL storyteller_id
- Dropdown to select storyteller
- "Infer from title" button (AI/regex)
- Bulk select and assign multiple at once
- Same for orphaned stories

### Priority 3: Data Quality Improvements
**Tasks**:
1. Manually assign storytellers to remaining 18 Oonchiumpa transcripts
2. Merge duplicate "Aunty Bev and Uncle terry" profiles
3. Fix "Young person returns to school after cultural healing" story
4. Add validation to prevent future NULL storyteller_id/project_id

### Priority 4: System-Wide Enhancements
**Tasks**:
1. Add database triggers to auto-sync author_id and storyteller_id
2. Add validation warnings when creating records without required links
3. Create data quality monitoring dashboard
4. Document proper workflow for content creation

## Testing Notes

### How to Test Transcript Storyteller Assignment
1. Navigate to `/admin/transcripts/[id]/edit` for any Oonchiumpa transcript
2. Should see "Storyteller" section with dropdown
3. Dropdown should show Oonchiumpa storytellers:
   - Kristy Bloomfield
   - Tanya Turner
   - Patricia Ann Miller
   - Aunty Bev and Uncle terry (2 duplicates)
   - And 5 others
4. Select a storyteller
5. Click "Save Changes"
6. Verify storyteller_id is saved in database

### Test Script
```bash
# Run cleanup script
npx tsx scripts/fix-oonchiumpa-storyteller-links.ts

# Check results
npx tsx scripts/review-oonchiumpa-structure.ts

# Verify transcript can be edited
# Navigate to: http://localhost:3000/admin/transcripts/[transcript_id]/edit
```

## Success Criteria

After all work is complete:
- ✅ Every transcript has a storyteller_id (not NULL)
- ✅ Every story has both storyteller_id AND project_id
- ✅ Viewing a project shows all its stories and transcripts
- ✅ Viewing a storyteller shows all their transcripts and stories
- ✅ Project analytics include all related content
- ✅ No "Unknown" storytellers in listings
- ✅ No duplicate storyteller profiles
- ✅ Validation prevents future orphaned records

## Architecture Notes

### Database Relationships
```
profiles (storytellers)
  ↓
  ├─→ profile_organizations (junction table)
  │     ↓
  │     └─→ organizations
  │
  ├─→ project_storytellers (junction table)
  │     ↓
  │     └─→ projects
  │
  ├─→ transcripts.storyteller_id (FK)
  │     ↓
  │     └─→ transcripts.project_id → projects
  │
  └─→ stories.storyteller_id (FK)
  └─→ stories.author_id (FK - same as storyteller usually)
        ↓
        └─→ stories.project_id → projects
```

### Key Design Decisions

1. **Stories have both author_id and storyteller_id**
   - `author_id`: Who wrote/created the story record
   - `storyteller_id`: Who the story is about/from
   - Usually the same person, but can differ (e.g., someone writing on behalf of another)

2. **Organization-based filtering**
   - Storyteller selectors filter by organization to reduce clutter
   - Uses tenant_id for multi-tenant isolation

3. **Graceful degradation**
   - Forms work even if storyteller is NULL (with warning)
   - Can assign storytellers after the fact via edit page

4. **Data cleanup approach**
   - Automated inference where possible (transcript titles)
   - Manual assignment for ambiguous cases
   - Scripts can be re-run safely (idempotent)

## Next Session Recommendations

1. **Start with**: Add project and storyteller selectors to story edit forms
2. **Then**: Create bulk edit tool for remaining orphaned transcripts
3. **Finally**: Add validation to prevent future issues

## Related Documents

- [OONCHIUMPA_STORYTELLER_ANALYSIS.md](./OONCHIUMPA_STORYTELLER_ANALYSIS.md) - Detailed findings
- [STORYTELLER_MANAGEMENT_REVIEW.md](./STORYTELLER_MANAGEMENT_REVIEW.md) - Complete review and roadmap
- [scripts/fix-oonchiumpa-storyteller-links.ts](./scripts/fix-oonchiumpa-storyteller-links.ts) - Data cleanup script
- [scripts/review-oonchiumpa-structure.ts](./scripts/review-oonchiumpa-structure.ts) - Analysis script
