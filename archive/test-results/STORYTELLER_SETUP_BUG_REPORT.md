# Storyteller Setup - Complete Bug Report & Analysis

**Date:** October 5, 2025
**Focus:** Full walkthrough of storyteller creation workflow with bug identification

---

## Overview

There are **TWO DIFFERENT** storyteller creation workflows in the codebase that don't align:

1. **StorytellerCreationWizard** - Full multi-step wizard (NOT CONNECTED to any UI)
2. **AddStorytellerDialog** - Simpler 2-tab dialog (CURRENTLY USED)

---

## CRITICAL ISSUES

### 🔴 Issue #1: Database Schema Mismatch (CRITICAL)

**Location:** Multiple files expecting legacy schema
**Impact:** Complete workflow failure

#### Current Database Schema (Actual):
```sql
profiles (
  id uuid PRIMARY KEY,
  created_at timestamp,
  display_name text,
  bio text,
  avatar_media_id uuid,
  cover_media_id uuid,
  community_roles jsonb DEFAULT '[]',
  portfolio_media_ids uuid[] DEFAULT '{}',
  created_by uuid
)
```

#### Code Expectations (From multiple files):
```typescript
// AddNewStorytellerForm expects:
fullName, email, phoneNumber, displayName, bio

// StorytellerCreationWizard expects:
firstName, lastName, displayName, bio, email, phone

// create/route.ts expects (from old schema):
full_name, email, phone_number, tenant_id, tenant_roles,
is_storyteller, profile_status, onboarding_completed
```

**Files affected:**
- `src/app/api/organisations/[id]/storytellers/create/route.ts` (ENTIRELY BROKEN)
- `src/components/organization/AddNewStorytellerForm.tsx`
- `src/components/storyteller/StorytellerCreationWizard/`

**Missing tables in database:**
- `profile_organizations` (referenced in code but doesn't exist)
- `organization_invitations` (referenced in code but doesn't exist)
- `transcripts` table fields: storyteller_id, organization_id

---

### 🔴 Issue #2: Profile Photo Upload Response Mismatch

**Status:** ✅ FIXED (but needs testing)

**Location:** `src/app/api/media/route.ts:189`

**Problem:** Frontend expected `result.mediaId`, backend only returned `{ asset }`

**Fix Applied:**
```typescript
return NextResponse.json({
  asset,
  mediaId: asset.id,  // Added for compatibility
  success: true
}, { status: 201 })
```

---

### 🟡 Issue #3: StorytellerCreationWizard NOT Integrated

**Location:** `src/components/storyteller/StorytellerCreationWizard/`

**Problem:** Complete 7-step wizard exists but is NOT used anywhere in the app.

**Evidence:**
```bash
# No imports found:
grep -r "StorytellerCreationWizard" src/app --include="*.tsx"
# Returns: 0 results
```

**The wizard flow:**
1. Mode Selection (new vs existing)
2. Basic Info (firstName, lastName, displayName, bio, email, phone)
3. Photo Upload (avatar + cover)
4. Location Selection
5. Transcript Upload
6. Project/Gallery Tagging
7. Review & Submit

**Current Used Flow:**
- `AddStorytellerDialog` with 2 tabs: "Existing User" or "New Storyteller"
- Only captures: fullName, email, phoneNumber, displayName, bio

---

### 🟡 Issue #4: ReviewStep API Calls to Non-Existent Endpoints

**Location:** `src/components/storyteller/StorytellerCreationWizard/steps/ReviewStep.tsx`

**Problem:** Makes API calls that don't exist or don't match current schema

```typescript
// Line 32: Does NOT exist
POST /api/profiles/create ✓ EXISTS but expects different schema

// Line 55: Does NOT exist
POST /api/locations ❌ NOT FOUND

// Line 76: Exists but wrong schema
POST /api/transcripts ✓ EXISTS

// Line 99: Wrong endpoint structure
POST /api/organisations/${organizationId}/storytellers
Expected body: { profile_id }
Actual endpoint expects: { userId } or creates new profile
```

---

### 🟡 Issue #5: Duplicate Phone Number Check

**Status:** ✅ FIXED

**Location:** `src/app/api/organisations/[id]/storytellers/create/route.ts:103-110`

**Fix:** Now checks both email AND phone for existing profiles

---

### 🟡 Issue #6: Tenant Overwriting (Multi-tenancy Bug)

**Status:** ✅ FIXED

**Location:** `src/app/api/organisations/[id]/storytellers/create/route.ts:128-149`

**Problem:** When adding existing user to new org, their `tenant_id` was being overwritten

**Fix:** Removed tenant_id update, now uses `profile_organizations` table (if it exists)

**NEW PROBLEM:** `profile_organizations` table DOES NOT EXIST in database!

---

### 🟡 Issue #7: Phone Number Format Validation

**Status:** ✅ FIXED

**Location:** `src/app/api/organisations/[id]/storytellers/create/route.ts:54-72`

**Fix:** Added validation for phone format and minimum 8 digits

---

### 🟡 Issue #8: profile_organizations Insert Failures Silently Ignored

**Status:** ✅ FIXED (but table doesn't exist!)

**Location:** `src/app/api/organisations/[id]/storytellers/create/route.ts:228-236`

**Fix:** Now fails the entire request and rolls back profile creation

**BLOCKER:** This will now ALWAYS fail because `profile_organizations` table doesn't exist!

---

## WORKFLOW COMPARISON

### Current Production Workflow (AddStorytellerDialog)

```
1. User opens "Add Storyteller" dialog
2. Choose tab: "Existing User" OR "New Storyteller"

IF Existing User:
  → Search for user by name/email
  → Click "Add"
  → POST /api/organisations/${orgId}/storytellers
    Body: { userId }
  → Adds user via profile_organizations table ❌ WILL FAIL (table missing)

IF New Storyteller:
  → Fill form: fullName, email*, phoneNumber*, displayName, bio
  → Click "Create & Invite"
  → POST /api/organisations/${orgId}/storytellers/create
    Body: { fullName, email, phoneNumber, displayName, bio }
  → Creates profile in profiles table ❌ SCHEMA MISMATCH
  → Links via profile_organizations ❌ TABLE MISSING
  → Creates invitation in organization_invitations ❌ TABLE MISSING
```

### Unused Wizard Workflow (StorytellerCreationWizard)

```
1. Select mode: New Profile or Existing Profile
2. Enter basic info (firstName, lastName, displayName, bio, email, phone)
3. Upload photos (avatar + cover) → /api/media
4. Select locations → /api/locations ❌ ENDPOINT MISSING
5. Upload transcript → /api/transcripts
6. Tag to projects/galleries
7. Review & Submit → Multiple API calls that don't match current schema
```

---

## DATABASE ISSUES

### Tables that DON'T EXIST but code expects:
1. **profile_organizations** - Critical for multi-tenant user support
2. **organization_invitations** - For user invitations
3. **organization_members** - Alternative membership tracking (mentioned in comments)

### Schema Mismatches:
- **profiles** table missing: full_name, first_name, last_name, email, phone_number, tenant_id, tenant_roles, is_storyteller, is_elder, profile_status, onboarding_completed, profile_image_url, video_introduction_url, featured_video_url, impact_focus_areas, expertise_areas, storytelling_methods, change_maker_type, geographic_scope, years_of_community_work, mentor_availability, speaking_availability

---

## IMMEDIATE BLOCKERS

### Cannot Create New Storyteller Because:
1. ✅ Schema expects `full_name` but table has `display_name` only
2. ✅ Code tries to set `email`, `phone_number` - fields don't exist
3. ✅ Code tries to set `tenant_id`, `tenant_roles` - fields don't exist
4. ✅ Code tries to insert into `profile_organizations` - table doesn't exist
5. ✅ Code tries to create `organization_invitations` - table doesn't exist

### Cannot Add Existing Storyteller Because:
1. ✅ Code tries to insert into `profile_organizations` - table doesn't exist
2. ✅ Search uses `email` field - doesn't exist in profiles table

---

## RECOMMENDED FIXES

### Option A: Update Code to Match Current Schema (FASTEST)

**Pros:**
- Works with existing database
- No migrations needed
- Can ship immediately

**Cons:**
- Limited functionality
- No email/phone tracking
- No proper multi-tenancy

**Changes needed:**
1. Remove all references to fields that don't exist (email, phone, full_name, etc.)
2. Use profile_media_associations or galleries for org<->profile linking
3. Store first/last name in display_name or community_roles JSONB
4. Accept limited functionality

### Option B: Update Database Schema (RECOMMENDED)

**Pros:**
- Full feature support
- Proper multi-tenancy
- Email invitations work
- Phone number tracking

**Cons:**
- Requires database migration
- Need to test thoroughly
- Possible data migration for existing profiles

**Changes needed:**
1. Add missing columns to profiles table
2. Create profile_organizations table
3. Create organization_invitations table
4. Update RPC function create_profile_with_media
5. Run migration on production

### Option C: Hybrid Approach

**Immediate (Today):**
- Fix AddStorytellerDialog to work with current schema
- Use profile_media_associations for linking (existing table)
- Store extra data in community_roles JSONB

**Next Sprint:**
- Plan and execute proper schema migration
- Enable full StorytellerCreationWizard
- Add all missing features

---

## TEST CASES TO RUN

### Test 1: Create New Storyteller (Simple)
```bash
POST /api/organisations/{org-id}/storytellers/create
{
  "fullName": "Test User",
  "email": "test@example.com",
  "displayName": "Test",
  "bio": "Test bio"
}
```
**Expected:** ❌ FAILS - field mismatches
**Actual:** Will fail at profile insertion

### Test 2: Add Existing Storyteller
```bash
POST /api/organisations/{org-id}/storytellers
{
  "userId": "uuid-here"
}
```
**Expected:** ❌ FAILS - profile_organizations table missing
**Actual:** Will fail at relationship creation

### Test 3: Upload Profile Photo
```bash
POST /api/media
FormData: { file: image.jpg, type: 'profile' }
```
**Expected:** ✅ SHOULD WORK (after fix)
**Actual:** Should return { mediaId, asset, success }

---

## NEXT STEPS

1. **Decide on approach** (A, B, or C above)
2. **If Option A (Quick Fix):**
   - Rewrite AddNewStorytellerForm to only use display_name + bio
   - Use profile_media_associations for org linking
   - Remove email/phone features temporarily
3. **If Option B (Full Fix):**
   - Create migration files in `supabase/migrations/`
   - Add all missing columns and tables
   - Update all API routes to use new schema
4. **If Option C (Hybrid):**
   - Start with Option A immediately
   - Schedule Option B for next sprint

---

## FILES REQUIRING IMMEDIATE ATTENTION

### Critical (Broken):
1. `src/app/api/organisations/[id]/storytellers/create/route.ts` - Complete rewrite needed
2. `src/app/api/organisations/[id]/storytellers/route.ts` - POST method broken
3. `src/components/organization/AddNewStorytellerForm.tsx` - Schema mismatch

### Important (Unused but would be broken):
1. `src/components/storyteller/StorytellerCreationWizard/**` - All files
2. `src/components/storyteller/StorytellerCreationWizard/steps/ReviewStep.tsx` - API calls wrong

### Fixed (Needs Testing):
1. `src/app/api/media/route.ts` - Response format fixed

---

## CURRENT STATUS SUMMARY

| Component | Status | Issue |
|-----------|--------|-------|
| AddStorytellerDialog UI | ✅ OK | UI works |
| AddNewStorytellerForm | ⚠️ Partial | Sends data but... |
| Create Storyteller API | ❌ BROKEN | Schema mismatch |
| Add Existing User API | ❌ BROKEN | Table missing |
| Photo Upload | ✅ FIXED | Needs testing |
| StorytellerCreationWizard | ❌ NOT USED | Not integrated |
| Database Schema | ❌ MISMATCH | Major differences |

