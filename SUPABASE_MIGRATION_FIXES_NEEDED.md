# Supabase Migration Fixes Needed

**Date**: January 11, 2026
**Status**: In Progress - Fixing Migration Errors
**Goal**: Get local Supabase stack running with clean migrations

---

## ✅ Progress So Far

1. ✅ Docker fixed and running
2. ✅ Supabase CLI working
3. ✅ Images downloaded
4. 🔧 Fixing migration errors sequentially

---

## 🐛 Errors Found & Fixed

### Error 1: Invalid enum value `'member'` ✅ FIXED
**File**: `20250913005713_create_organization_roles_table.sql`
**Issue**: Used `'member'` but enum has `'community_member'`
**Fix**: Changed default to `'community_member'` and updated role hierarchy function

### Error 2: Non-existent `status` column ✅ FIXED
**File**: `20250913_enhance_organizations_cultural_identity.sql`
**Issue**: Tried to UPDATE from non-existent `status` column
**Fix**: Wrapped UPDATE in conditional check for column existence

### Error 3: Non-existent `tenant_roles` column ⏳ IN PROGRESS
**File**: `20250916_storyteller_analytics_foundation.sql`
**Issue**: RLS policies reference `p.tenant_roles` which doesn't exist
**Locations**: Lines 333, 343, 358, 370, 383

**Required fix**: Replace `tenant_roles` checks with `organization_roles` table queries

---

## 📊 Migration Issues Pattern

**Root cause**: Schema evolution where:
1. Old migrations reference columns/tables that don't exist yet
2. Enum values changed but migrations weren't updated
3. RLS policies reference old schema structure

**Why this happened**:
- Migrations were written at different times
- Schema evolved but old migrations weren't updated
- No local testing before committing migrations

---

## 🔧 Fix Strategy

### Option A: Fix All Migrations (Cleanest)
Fix each migration file to work from clean state.

**Pros:**
- Clean migration history
- Works for new deployments
- Best practice

**Cons:**
- Time-consuming (could be 10+ more fixes)
- Each fix requires test run

### Option B: Create Baseline Migration (Fastest)
Capture current production state as single migration.

**Steps:**
```bash
# 1. Get production schema
npx supabase db pull

# 2. This creates a single migration with current prod state

# 3. Delete old conflicting migrations or move to archive

# 4. Start fresh from production baseline
```

**Pros:**
- Works immediately
- No more fixing old migrations
- Production is source of truth

**Cons:**
- Loses migration history
- Can't trace schema evolution

### Option C: Use Production Directly (Workaround)
Skip local stack, work against production.

**Update `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production anon key>
SUPABASE_SERVICE_ROLE_KEY=<production service role key>
```

**Pros:**
- Works RIGHT NOW
- No migration fixes needed
- Real production data

**Cons:**
- No local testing
- Uses production compute

---

## 💡 Recommended Approach

**Short-term (TODAY):**
Use **Option C** (Production Direct) to unblock development NOW.

**Medium-term (THIS WEEK):**
Use **Option B** (Baseline Migration) to get clean local stack.

**Long-term:**
Once local works, fix remaining migrations one-by-one as needed.

---

## 🚀 Immediate Next Steps

**To work NOW (Option C):**

1. Get production credentials:
   - Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/api
   - Copy: URL, anon key, service_role key

2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   ```

3. Start developing:
   ```bash
   npm run dev
   # Works with production Supabase
   ```

**To fix local stack (Option B):**

1. Pull production schema:
   ```bash
   npx supabase db pull
   ```

2. Archive old migrations:
   ```bash
   mkdir -p supabase/migrations/.archive-old
   mv supabase/migrations/202[45]*.sql supabase/migrations/.archive-old/
   ```

3. Start Supabase:
   ```bash
   npx supabase start
   # Should work with fresh baseline
   ```

---

## 📝 What I'm Currently Doing

Fixing migrations one-by-one (Option A) to understand all issues.

**Completed so far:**
- ✅ Fixed `organization_role` enum mismatch
- ✅ Fixed `status` column conditional update
- 🔧 Working on: `tenant_roles` → `organization_roles` conversion

**Remaining (estimated):**
- Fix 5 more RLS policies with `tenant_roles`
- Possibly more enum/column issues in later migrations
- Unknown issues in remaining 50+ migrations

---

## 🎯 Decision Point

**Do you want to:**

**A) Keep fixing migrations** (I'll continue, could take another 30-60 min)
  - Pro: Clean history, best practice
  - Con: Time-consuming, more errors likely

**B) Use production baseline** (5 minutes to set up)
  - Pro: Fast, clean, works immediately
  - Con: Loses historical migration sequence

**C) Just use production** (1 minute to set up)
  - Pro: Works RIGHT NOW
  - Con: No local development

**My recommendation**: **Option C for today, Option B when you have 30 minutes to set up properly.**

---

**Status**: Awaiting your decision on which approach to take.
