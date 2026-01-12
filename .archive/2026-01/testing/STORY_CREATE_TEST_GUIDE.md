# Story Create Page - Testing Guide

## Quick Start - Test the Page

### Navigate to the page:
```
http://localhost:3030/stories/create
```

---

## Test Scenarios

### ✅ Test 1: Basic Story Creation
**Goal:** Verify basic fields work

1. Fill in:
   - **Title:** "My First Story"
   - **Story Type:** "Personal Journey"
   - **Target Audience:** "All Ages"
   - **Content:** Write at least 50 characters
   - **Sharing Level:** "Standard Story"

2. Click **"Save as Draft"**

3. **Expected Result:**
   - Alert: "Story saved as draft!"
   - Story appears in database
   - No errors in browser console

4. **Check Database:**
   ```sql
   SELECT id, title, story_type, audience, status
   FROM stories
   ORDER BY created_at DESC LIMIT 1;
   ```

---

### ✅ Test 2: Full Story with Metadata
**Goal:** Verify all fields persist

1. Fill in ALL fields:
   - Title, Content (required)
   - Story Type: "Cultural Heritage"
   - Audience: "Elders"
   - Location: "British Columbia"
   - Tags: "traditions, storytelling, cultural"
   - Sharing Level: "High Sensitivity"
   - Cultural Context: "This story represents..."
   - Check "Cultural Review" + "Elder Approval"

2. Click **"Submit for Review"**

3. **Expected Result:**
   - Redirects to story page
   - URL shows story ID

4. **Check Database:**
   ```sql
   SELECT
     id,
     title,
     story_type,
     audience,
     location,
     tags,
     cultural_sensitivity_level,
     cultural_context,
     requires_elder_review,
     status
   FROM stories
   WHERE id = '<story-id>';
   ```

   **Verify all fields match your input**

---

### ✅ Test 3: Error Handling
**Goal:** Verify error messages display

#### Test 3a: Validation Errors
1. Leave "Title" empty
2. Click "Save as Draft"
3. **Expected:** Red error text under Title field

#### Test 3b: Network Error Simulation
1. Open DevTools → Network tab
2. Disable network (or use throttling)
3. Fill form, submit
4. **Expected:** Error alert at top with message like:
   ```
   Failed to save story (NetworkError)
   ```

#### Test 3c: API Error Response
1. Open DevTools → Console
2. Look for any API errors
3. **Expected:** Detailed error messages shown, not silent failures

---

### ✅ Test 4: Auto-Enabled Reviews
**Goal:** Verify logic that auto-enables approval checkboxes

#### Test 4a: Cultural Story
1. Set Story Type: "Cultural Heritage"
2. **Expected:** "Cultural Review" checkbox auto-checks
3. Set Sharing Level: "Restricted Access"
4. **Expected:** Both "Cultural Review" AND "Elder Approval" auto-check

#### Test 4b: Restricted Content Warning
1. Set Sharing Level: "Restricted Access"
2. Leave "Elder Approval" unchecked
3. **Expected:** Amber warning appears: "Restricted stories typically require elder approval..."

---

### ✅ Test 5: Media Upload (Post-Creation)
**Goal:** Verify media can be added after story creation

1. Create a story (use Test 1)
2. Note the story ID from redirect URL
3. Navigate to `/stories/[id]` page
4. Look for media upload section
5. Upload image/video
6. **Expected:**
   - File appears in upload list
   - Progress bar shows
   - File marked complete with ✓

---

## Field Mapping Verification

### Form → Database Mapping
Test that these fields map correctly:

| Form Field | Database Field | Type | Test Value |
|-----------|----------------|------|-----------|
| Title | title | text | "Test Story" |
| Content | content | text | (50+ chars) |
| Story Type | story_type | enum | "personal" |
| Audience | audience | enum | "all" |
| Location | location | text | "Vancouver" |
| Tags | tags | array | ["family", "memories"] |
| Sharing Level | cultural_sensitivity_level | enum | "standard" |
| Cultural Context | cultural_context | text | Optional |
| Featured | is_featured | boolean | false/true |
| Elder Approval | requires_elder_review | boolean | false/true |

---

## Error Scenarios to Test

### ❌ Common Failures
| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| Empty title | Validation error shown | ✅ Fixed |
| Short content | Validation error shown | ✅ Fixed |
| Network error | Error alert displayed | ✅ Fixed |
| API error | Detailed error shown | ✅ Fixed |
| Missing auth | Redirect to signin | ✅ Fixed |

---

## Browser DevTools Checklist

### Console
- [ ] No errors logged
- [ ] No "undefined" warnings
- [ ] API response logged if needed

### Network Tab
```
POST /api/stories
- Status: 201 Created
- Response includes: id, title, story_type, audience, etc.
```

### Database Query (after each test)
```sql
-- Check latest story
SELECT * FROM stories ORDER BY created_at DESC LIMIT 1;

-- Verify all fields populated
SELECT
  COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as has_title,
  COUNT(CASE WHEN content IS NOT NULL THEN 1 END) as has_content,
  COUNT(CASE WHEN audience IS NOT NULL THEN 1 END) as has_audience,
  COUNT(CASE WHEN location IS NOT NULL THEN 1 END) as has_location,
  COUNT(CASE WHEN tags IS NOT NULL THEN 1 END) as has_tags
FROM stories
WHERE created_at > NOW() - INTERVAL '5 minutes';
```

---

## Quick Test Script

Run this to test multiple scenarios:

```bash
# 1. Start dev server
npm run dev

# 2. Create first story
# - Title: "Test Story 1"
# - Type: Personal
# - Content: "This is a test story about my personal journey..."
# - Save as Draft

# 3. Create second story
# - Title: "Sacred Knowledge"
# - Type: Cultural Heritage
# - Content: "This story represents important cultural..."
# - Sharing: High Sensitivity
# - Submit for Review

# 4. Check database
psql $DATABASE_URL -c "\
SELECT
  id,
  title,
  story_type,
  audience,
  cultural_sensitivity_level,
  requires_elder_review,
  status,
  created_at
FROM stories
ORDER BY created_at DESC
LIMIT 5;"
```

---

## Regression Tests

### Before Fixes (SHOULD FAIL):
- [ ] Audience field gets saved ❌
- [ ] Tags persist in database ❌
- [ ] Location field appears ❌
- [ ] Error messages show ❌
- [ ] Featured checkbox works ❌

### After Fixes (SHOULD PASS):
- [ ] Audience field gets saved ✅
- [ ] Tags persist in database ✅
- [ ] Location field appears ✅
- [ ] Error messages show ✅
- [ ] Featured checkbox works ✅

---

## Known Issues to Note

### Issue: Media Upload Timing
**Current Behavior:** Media must be uploaded AFTER story creation
**Reason:** Story ID needed to link media
**Workaround:** Create story first, then add media
**Future:** Implement two-step wizard

### Issue: Auto-Enabled Checkboxes
**Current Behavior:** Checkboxes enable automatically based on story type
**Why:** To enforce cultural safety protocols
**User Experience:** Clear and expected behavior

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ All form fields save to database
✅ Error messages display correctly
✅ Redirects work after submission
✅ Cultural safety features trigger automatically

---

**Last Updated:** 2026-01-09
**Test Status:** Ready for QA

