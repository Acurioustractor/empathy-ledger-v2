# Migration Strategy - Making It Perfect

**Goal:** Easy, safe, and productive local + production database workflow

**Problem:** Migrations reference tables that don't exist (created manually in Supabase Studio)

---

## The Perfect Migration Pattern

### 1. **File Organization** (CLEAN)

```
supabase/
├── migrations/                    # Active migrations ONLY
│   ├── 20250101000000_initial_schema.sql          # ⭐ NEW - Base tables
│   ├── 20250109_media_system.sql                   # Existing (now works!)
│   ├── 20250913000000_rbac_enum_types.sql         # Existing
│   └── ... (all other migrations in chronological order)
│
├── migrations/archive/            # Old manual scripts (KEEP, DON'T RUN)
│   ├── KRISTY_COMPLETE_SETUP.sql
│   ├── FORCE_CACHE_REFRESH.sql
│   └── ... (historical reference only)
│
└── seed.sql                       # (Future) Sample data for local dev
```

**Rules:**
- ✅ Active migrations: `YYYYMMDDHHMMSS_description.sql` format
- ✅ Archive: Manual scripts, experiments, one-off fixes
- ✅ Never mix the two!

---

## 2. **The Initial Schema Migration** (CRITICAL FIX)

**File:** `supabase/migrations/20250101000000_initial_schema.sql`

**Purpose:** Define ALL core tables before any other migration runs

**Contents:**
```sql
-- Initial Schema - Core Tables
-- Created: 2026-01-02
-- This migration establishes the base schema that was originally
-- created manually in Supabase Studio.

-- ============================================================================
-- CORE TABLES (in dependency order)
-- ============================================================================

-- 1. Tenants (multi-tenant isolation)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  ... (full definition from production)
);

-- 2. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ... (full definition from production)
);

-- 3. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  display_name TEXT,
  ... (full definition from production)
);

-- 4. Stories
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ... (full definition from production)
);

-- 5. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ... (full definition from production)
);

-- Add all other core tables...

-- ============================================================================
-- BASIC INDEXES (Performance baseline)
-- ============================================================================

CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_stories_org ON stories(organization_id);
-- ... other basic indexes

-- ============================================================================
-- RLS POLICIES (Security baseline)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- ... enable RLS on all tables

-- Basic policies (more complex ones in later migrations)
CREATE POLICY "profiles_read_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- ... other basic policies
```

**How to Create:**
1. Pull production schema: `npx supabase db dump --schema public`
2. Extract CREATE TABLE statements for core tables
3. Order by dependencies (tenants → organizations → profiles → stories → projects)
4. Add CREATE INDEX for basic indexes
5. Add ALTER TABLE ENABLE RLS + basic policies
6. Save as `20250101000000_initial_schema.sql`

---

## 3. **Migration Workflow** (THE RIGHT WAY)

### For New Features (Adding Columns, Tables, etc.)

```bash
# 1. Create migration
npx supabase migration new add_email_verified_to_profiles

# 2. Write SQL with safety checks
# See: DATABASE_BEST_PRACTICES.md

# 3. Validate locally FIRST
npm run db:start           # Start local Supabase
npm run db:migrate         # Apply to local
# Test in app at localhost:3000

# 4. Validate schema
npm run validate:schema    # Automated checks

# 5. Apply to production
npm run db:migrate:remote  # With confirmation

# 6. Commit
git add supabase/migrations/YYYYMMDD*.sql
git commit -m "feat: add email_verified to profiles"
```

### For Schema Fixes (This Session)

```bash
# 1. Create initial schema migration
# (Done manually - pull from production)

# 2. Test local setup works
npm run db:stop            # Clean slate
npm run db:start           # Should work now!
npm run db:status          # Verify all migrations applied

# 3. Sync to codebase
npm run db:types           # Regenerate TypeScript types

# 4. Commit the fix
git add supabase/migrations/20250101000000_initial_schema.sql
git commit -m "fix: add initial schema migration for local dev"
```

---

## 4. **Local vs Production Sync** (ALWAYS IN SYNC)

### The Golden Rule

**Production schema = All migrations applied in order**

```
Production Database
  = 20250101000000_initial_schema.sql
  + 20250109_media_system.sql
  + 20250913000000_rbac_enum_types.sql
  + ... all migrations in chronological order
```

### Keeping in Sync

**Weekly (5 minutes every Monday):**
```bash
npm run db:status          # Check sync status
npm run validate:schema    # Validate migrations
npm run db:pull            # Pull any manual changes (shouldn't be any!)
npm run db:types           # Update TypeScript types
```

**After ANY Manual Change in Supabase Studio:**
```bash
# DON'T DO THIS! But if you must...
npm run db:pull            # Pull the manual change
# Then create a migration for it
npx supabase migration new manual_change_YYYYMMDD
# Move the SQL from db pull into the migration
# NEVER make manual changes in production!
```

---

## 5. **Migration Best Practices** (SAFE & PRODUCTIVE)

### File Naming Convention

```
YYYYMMDDHHMMSS_description.sql

Examples:
✅ 20250101000000_initial_schema.sql
✅ 20260102000001_add_critical_indexes.sql
✅ 20260103120000_fix_harvested_outcomes.sql

❌ migration_001.sql
❌ add_indexes.sql
❌ FIX_BUG.sql
```

### Migration Template

```sql
-- Migration: [Brief Description]
-- Date: YYYY-MM-DD
-- Risk: LOW | MEDIUM | HIGH
-- Reversible: YES | NO

-- ============================================================================
-- DESCRIPTION
-- ============================================================================
-- What this migration does and why

-- ============================================================================
-- SAFETY CHECKS
-- ============================================================================

DO $$
BEGIN
  -- Verify prerequisites
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'required_table') THEN
    RAISE EXCEPTION 'Required table does not exist';
  END IF;
END $$;

-- ============================================================================
-- CHANGES
-- ============================================================================

-- Your actual changes here
-- Use IF NOT EXISTS for idempotency

-- ============================================================================
-- ROLLBACK (Document how to undo)
-- ============================================================================

-- To rollback:
-- DROP INDEX IF EXISTS idx_name;
-- ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

### Validation Checklist

Before applying ANY migration:

- [ ] File named correctly (YYYYMMDDHHMMSS_description.sql)
- [ ] Tested locally (npm run db:migrate)
- [ ] Schema validator passed (npm run validate:schema)
- [ ] Rollback procedure documented
- [ ] No references to deleted_at, excerpt, bio, profiles.role
- [ ] No CONCURRENTLY keyword
- [ ] Foreign keys have CASCADE or SET NULL
- [ ] RLS policies use profile_organizations for roles

---

## 6. **Archive Folder Policy** (CLEAN CODEBASE)

### What Goes in Archive

✅ **Archive:** (Historical reference, NEVER RUN)
- Manual SQL scripts run in Supabase Studio
- One-off data fixes
- Experimental migrations that failed
- Scripts from before migration system existed

❌ **Never Archive:** (These belong in active migrations/)
- Migrations that are part of schema history
- Migrations that production depends on
- Migrations needed for local setup

### Archive File Naming

```
archive/
├── YYYYMMDD_description_MANUAL.sql        # Manual scripts
├── EXPERIMENT_description.sql              # Failed experiments
└── person_name_SCRIPT.sql                  # Named scripts
```

**Never use YYYYMMDDHHMMSS format in archive** - that format means "active migration"

---

## 7. **The Perfect Local Setup** (ZERO FRICTION)

### First Time Setup

```bash
# 1. Install Docker Desktop
open https://www.docker.com/products/docker-desktop

# 2. Clone repo
git clone ...
cd empathy-ledger-v2

# 3. Install dependencies
npm install

# 4. Start local Supabase
npm run db:start
# This now works! Initial schema migration runs first

# 5. Check status
npm run db:status
# Should show: ✓ All migrations applied

# 6. Start dev server
npm run dev
# App works at localhost:3000
```

**Total time:** ~5 minutes (most of it Docker downloading)

### Daily Workflow

```bash
# Morning
npm run db:start           # Start local DB
npm run dev                # Start app

# During development
npx supabase migration new my_feature
# Edit migration file
npm run validate:schema    # Check for errors
npm run db:migrate         # Test locally

# End of day
npm run db:stop            # Stop local DB
```

---

## 8. **Troubleshooting Guide** (WHEN THINGS GO WRONG)

### "Migration failed: table doesn't exist"

**Cause:** Migration references table created in later migration

**Fix:**
```bash
# Check migration order
ls -1 supabase/migrations/

# If 20250109 references table created in 20250913:
# Either move 20250913 earlier, or add table to initial_schema.sql
```

### "Local and remote out of sync"

**Cause:** Manual change in production

**Fix:**
```bash
npm run db:pull            # Pull production schema
# Review changes
npx supabase migration new sync_YYYYMMDD
# Move changes into migration
npm run db:migrate:remote  # Apply to ensure sync
```

### "Can't start local Supabase"

**Cause:** Usually Docker issue or migration dependency

**Fix:**
```bash
npm run db:stop            # Full stop
docker system prune -f     # Clean Docker
npm run db:start           # Fresh start

# If still fails:
npm run validate:schema    # Check for migration errors
```

---

## 9. **Next Steps** (TO PERFECTION)

### Immediate (Today)
- [ ] Create `20250101000000_initial_schema.sql` from production dump
- [ ] Test local Supabase starts successfully
- [ ] Verify all 39 migrations apply cleanly
- [ ] Document the working setup

### Short Term (This Week)
- [ ] Add seed data for local development (`supabase/seed.sql`)
- [ ] Create GitHub Action for weekly schema validation
- [ ] Set up pre-commit hook to run `npm run validate:schema`

### Long Term (This Month)
- [ ] Automated migration testing in CI/CD
- [ ] Migration rollback procedures documented
- [ ] Database versioning strategy
- [ ] Blue/green deployment for migrations

---

## 10. **Success Metrics**

When this is perfect, you'll have:

✅ **Zero confusion** - One command to start local dev
✅ **Zero errors** - Migrations apply cleanly every time
✅ **Zero drift** - Local always matches production
✅ **Zero fear** - Safe to test destructive changes locally
✅ **Zero time lost** - 5 min setup, not hours of debugging

**From:** "Migration .sql patterns cause fucking chaos"
**To:** "World-class migration system, predictable and safe"

---

**Next Action:** Create the initial schema migration and test!
