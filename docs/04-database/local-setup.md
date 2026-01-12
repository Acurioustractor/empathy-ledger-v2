# Local Supabase Setup - Known Issue & Resolution

**Date:** 2026-01-02
**Status:** ⚠️ BLOCKED - Migration dependency issue

---

## Problem

Cannot start local Supabase due to migration dependency ordering issue.

**Error:**
```
ERROR: relation "public.stories" does not exist (SQLSTATE 42P01)
At migration: 20250109_media_system.sql
```

## Root Cause

The first migration file (`20250109_media_system.sql`) was created assuming the `stories`, `organizations`, and `projects` tables already existed in production. It tries to create foreign key constraints to these tables:

```sql
-- Line 23:
story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
```

But when running migrations on an empty local database, these tables don't exist yet.

## Why This Happened

The migration files in `/supabase/migrations/` are **incremental changes** to an existing production database, not a complete schema from scratch. Production database was likely created through Supabase Studio UI or earlier migrations that aren't in the repository.

## Solutions (Choose One)

### Option A: Create Initial Schema Migration (RECOMMENDED)

Create a new migration `20250101000000_initial_schema.sql` that defines ALL base tables (stories, organizations, projects, profiles, etc.) before the media_system migration.

**Steps:**
1. Pull production schema: `npx supabase db dump --data-only=false > schema.sql`
2. Extract table creation statements for core tables
3. Create new migration with all CREATE TABLE statements
4. Reorder migrations so initial schema runs first

### Option B: Modify media_system.sql (TEMPORARY FIX)

Make foreign keys optional in first migration:

```sql
-- Instead of:
story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,

-- Use:
story_id UUID, -- Will add FK constraint in later migration
```

Then add the constraints in a follow-up migration after stories table exists.

### Option C: Use Production Database Only (CURRENT APPROACH)

Skip local development and work directly with production database:
- ✅ Faster (no Docker overhead)
- ✅ Real data for testing
- ✅ No migration sync issues
- ❌ Can't test destructive changes safely
- ❌ Requires internet connection

**We're currently using Option C** - works fine for now!

## Next Steps (When Time Permits)

1. **Immediate**: Continue with production database, track this as technical debt
2. **This Month**: Implement Option A (create initial schema migration)
3. **Long Term**: Set up automated schema snapshots in git

## Impact Assessment

**Critical?** No - Production database works perfectly

**Blocks:** Local development, offline work, safe migration testing

**Priority:** Medium - Would be nice to have, but not blocking current work

## Workaround (Current)

Use production database for all development:
```bash
npm run db:status          # Check production
npm run db:sql             # Query production
npm run db:migrate:remote  # Apply to production (with care!)
```

**Always validate first:**
```bash
npm run validate:schema    # Catch errors before applying
```

## Related Documentation

- [DATABASE_BEST_PRACTICES.md](DATABASE_BEST_PRACTICES.md) - Testing migrations locally
- [HOW_TO_CONTINUE_IMPROVING.md](HOW_TO_CONTINUE_IMPROVING.md) - Q: Do we need local Supabase? A: YES (but it needs this fix first)

---

**Author:** Claude (Sonnet 4.5)
**Resolution:** TBD - Tracked for future sprint
