# Database Strategy for Empathy Ledger v2

**Purpose:** Establish a reliable, consistent approach to database migrations and local development

**Date:** December 24, 2025

---

## 🎯 Goals

1. **Single Source of Truth** - Migration files in `supabase/migrations/` represent the complete schema
2. **Local Development** - Easy to spin up local database matching production
3. **Safe Deployments** - Preview changes before applying, rollback capability
4. **Team Collaboration** - Everyone uses same migration workflow

---

## 📁 Current State Assessment

### Migration Files Status

**Location:** `supabase/migrations/`

**Total:** 35+ migration files

**Categories:**

1. **Applied to Production (via Dashboard):**
   - `20251214_world_tour_tables.sql`
   - `20251220090000_saas_org_tier_and_distribution_policy.sql`
   - `20251220093000_multi_org_tenants.sql`
   - `20251223000000_story_access_tokens.sql`
   - `20251223120000_storyteller_media_library.sql`
   - `20251223140000_add_story_engagement_counts.sql`
   - `20251224000000_permission_tiers.sql` ✅ Just applied

2. **Older Migrations (Unknown Status):**
   - 20+ files from 2025-01 through 2025-12
   - Some may be applied, some may not
   - Need audit to determine status

### Issues

❌ **No Migration Tracking** - `supabase_migrations.schema_migrations` table doesn't track what's applied
❌ **Inconsistent Method** - Mix of Dashboard, CLI, manual psql attempts
❌ **Not Idempotent** - Old migrations missing `IF NOT EXISTS`, `DROP IF EXISTS`
❌ **No Local Dev Setup** - No way to spin up local DB with full schema

---

## ✅ RECOMMENDED STRATEGY

### Phase 1: Audit & Baseline (DO THIS FIRST)

**Goal:** Create accurate snapshot of production schema

#### Step 1: Export Current Production Schema

```bash
# Generate SQL dump of current production schema
npx supabase db dump --db-url "$DATABASE_URL" > supabase/migrations/00000000000000_baseline_schema.sql

# This captures EVERYTHING currently in production:
# - All tables, columns, types
# - All indexes, constraints
# - All functions, triggers
# - All RLS policies
```

#### Step 2: Archive Old Migrations

```bash
# Move all existing migrations to archive
mkdir -p supabase/migrations/archive
mv supabase/migrations/2025*.sql supabase/migrations/archive/

# Keep only the baseline
ls supabase/migrations/
# Should show: 00000000000000_baseline_schema.sql
```

#### Step 3: Initialize Migration Tracking

```sql
-- Run in Supabase Dashboard SQL Editor:

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT PRIMARY KEY,
  statements TEXT[],
  name TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mark baseline as applied
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('00000000000000', 'baseline_schema')
ON CONFLICT (version) DO NOTHING;
```

**Why This Works:**
- Fresh start with known-good baseline
- CLI will now track all future migrations
- No conflicts from old migrations
- Production schema preserved exactly as-is

---

### Phase 2: Local Development Setup

#### Option A: Supabase Local (Recommended for Team)

**Prerequisites:**
- Docker Desktop installed
- Supabase CLI: `npm install -g supabase`

**Setup:**

```bash
# 1. Initialize local Supabase (if not already done)
npx supabase init

# 2. Start local Supabase (PostgreSQL, PostgREST, Auth, Storage, etc.)
npx supabase start

# This spins up:
# - PostgreSQL on localhost:54322
# - PostgREST API on localhost:54321
# - Studio UI on localhost:54323
# - Inbucket (email testing) on localhost:54324

# 3. Apply baseline schema
npx supabase db reset

# 4. Link to production (for pulling schema/data)
npx supabase link --project-ref yvnuayzslukamizrlhwb

# 5. Pull production schema (if needed)
npx supabase db pull
```

**Workflow:**

```bash
# Day-to-day development:
npx supabase start              # Start local DB
npm run dev                     # Start Next.js (points to local Supabase)
npx supabase db reset           # Reset DB + apply migrations
npx supabase stop               # Stop local DB when done
```

**Pros:**
- Complete local Supabase environment
- Auth, Storage, Realtime all work locally
- No internet needed for development
- Perfect replica of production

**Cons:**
- Requires Docker (large download)
- Uses system resources
- Learning curve for team

---

#### Option B: Direct PostgreSQL (Simpler, Less Features)

**Prerequisites:**
- PostgreSQL 15+ installed locally

**Setup:**

```bash
# 1. Create local database
createdb empathy_ledger_dev

# 2. Apply baseline schema
psql empathy_ledger_dev < supabase/migrations/00000000000000_baseline_schema.sql

# 3. Update .env.local for local development
DATABASE_URL=postgresql://localhost:5432/empathy_ledger_dev
```

**Pros:**
- Simpler, lighter weight
- Familiar PostgreSQL tools
- No Docker needed

**Cons:**
- Only database, no Auth/Storage/Realtime
- Need to mock Supabase client features
- Less like production environment

---

### Phase 3: Migration Workflow (Going Forward)

**For ALL new database changes:**

#### 1. Create Migration File

```bash
# Generate timestamped migration file
npx supabase migration new add_feature_name

# Creates: supabase/migrations/20251224123456_add_feature_name.sql
```

#### 2. Write Idempotent SQL

**ALWAYS use these patterns:**

```sql
-- Enums
CREATE TYPE IF NOT EXISTS my_enum AS ENUM ('value1', 'value2');

-- Tables
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns
);

-- Columns (use DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'new_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN new_column TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- Policies (must drop first)
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name FOR ALL USING (true);

-- Triggers (must drop first)
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name BEFORE INSERT ON table_name
  FOR EACH ROW EXECUTE FUNCTION my_function();

-- Functions
CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;
```

#### 3. Test Locally

```bash
# Apply migration to local database
npx supabase db reset

# Verify it worked
npx supabase db diff

# Test with your app
npm run dev
```

#### 4. Preview Production Changes

```bash
# See what will be applied
npx supabase db push --dry-run

# Output shows:
# Would push these migrations:
#  • 20251224123456_add_feature_name.sql
```

#### 5. Apply to Production

```bash
# Push migration
npx supabase db push

# Type 'Y' to confirm

# Migration tracking happens automatically:
# - Adds row to supabase_migrations.schema_migrations
# - Won't re-run on next push
```

#### 6. Generate Updated Types

```bash
# Pull latest schema and generate TypeScript types
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts

# Commit to git
git add src/types/database-generated.ts
git commit -m "chore: update database types"
```

---

## 🔧 Tools & Commands Reference

### Supabase CLI

```bash
# Project Management
npx supabase link --project-ref <PROJECT_REF>    # Link to remote project
npx supabase status                               # Show linked project info

# Local Development
npx supabase start                                # Start local Supabase
npx supabase stop                                 # Stop local Supabase
npx supabase db reset                             # Reset local DB + apply migrations

# Migrations
npx supabase migration new <NAME>                 # Create migration file
npx supabase db push                              # Push migrations to remote
npx supabase db push --dry-run                    # Preview without applying
npx supabase db pull                              # Pull schema from remote

# Schema
npx supabase db dump                              # Export schema as SQL
npx supabase db diff                              # Show schema differences
npx supabase gen types typescript                 # Generate TypeScript types

# Debugging
npx supabase db remote --help                     # Remote DB commands
```

### Direct Database Access (When Needed)

```bash
# Production (read-only queries)
PGPASSWORD="Drillsquare99" psql \
  -h aws-0-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "SELECT COUNT(*) FROM stories;"

# Local
psql empathy_ledger_dev -c "SELECT COUNT(*) FROM stories;"
```

### Supabase Dashboard

**SQL Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new

**Use for:**
- Quick queries
- Emergency hotfixes
- Viewing query results visually
- Testing SQL before creating migration

**Don't use for:**
- Regular migrations (use CLI instead)
- Schema changes in development (breaks migration tracking)

---

## 📋 Migration Checklist

Before creating a migration:

- [ ] Tested locally with `npx supabase db reset`
- [ ] SQL is idempotent (safe to run multiple times)
- [ ] Used proper patterns (IF NOT EXISTS, DROP IF EXISTS, CREATE OR REPLACE)
- [ ] Added comments explaining what/why
- [ ] No hardcoded IDs or sensitive data
- [ ] Follows team naming conventions

Before pushing to production:

- [ ] Ran `npx supabase db push --dry-run`
- [ ] Reviewed changes with team (if major)
- [ ] Have rollback plan (if needed)
- [ ] Scheduled during low-traffic window (if major)
- [ ] Generated updated TypeScript types after push

---

## 🚨 Emergency Procedures

### Migration Failed Mid-Way

```bash
# 1. Check what's in migration table
npx supabase db remote console
# Then run:
# SELECT * FROM supabase_migrations.schema_migrations ORDER BY applied_at DESC;

# 2. If migration partially applied, manually remove entry
# DELETE FROM supabase_migrations.schema_migrations WHERE version = 'YYYYMMDDHHMMSS';

# 3. Fix migration file to be more idempotent
# 4. Re-run: npx supabase db push
```

### Need to Rollback

```sql
-- Create rollback migration (not automatic in Supabase)
-- Example: reverse of 20251224000000_permission_tiers.sql

-- Drop added columns
ALTER TABLE stories DROP COLUMN IF EXISTS permission_tier;
ALTER TABLE stories DROP COLUMN IF EXISTS consent_verified_at;
-- etc.

-- Drop added functions
DROP FUNCTION IF EXISTS can_create_share_link;

-- Drop added types
DROP TYPE IF EXISTS permission_tier;
```

### Production Schema Drift

```bash
# If production schema differs from migrations:

# 1. Generate diff
npx supabase db diff -f my_schema_drift

# This creates migration file with differences
# Review, test locally, then push
```

---

## 👥 Team Collaboration

### Git Workflow

```bash
# Before starting work
git pull origin main
npx supabase db reset              # Get latest migrations

# After creating migration
git add supabase/migrations/YYYYMMDDHHMMSS_*.sql
git add src/types/database-generated.ts
git commit -m "feat: add permission tiers to stories"
git push

# Team members pull and reset
git pull
npx supabase db reset              # Applies new migrations locally
```

### Communication

- **Announce major schema changes** in team chat before pushing
- **Document breaking changes** in migration file comments
- **Update README** if setup process changes

---

## 🎯 Success Metrics

You'll know the strategy is working when:

- ✅ Every team member can run `npx supabase db reset` and get working local database
- ✅ `npx supabase db push` never fails with "already exists" errors
- ✅ Production and local schemas match exactly
- ✅ No manual SQL execution needed (except emergencies)
- ✅ Migration history is clean and linear

---

## 📚 Resources

- **Supabase CLI Docs:** https://supabase.com/docs/reference/cli
- **Database Migrations Guide:** https://supabase.com/docs/guides/deployment/database-migrations
- **Local Development:** https://supabase.com/docs/guides/local-development
- **Project Dashboard:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb

---

## 🚀 Next Actions (In Order)

1. **Baseline Export** (15 min)
   ```bash
   npx supabase db dump --db-url "$DATABASE_URL" > supabase/migrations/00000000000000_baseline_schema.sql
   ```

2. **Archive Old Migrations** (5 min)
   ```bash
   mkdir -p supabase/migrations/archive
   mv supabase/migrations/2025*.sql supabase/migrations/archive/
   ```

3. **Initialize Tracking** (5 min)
   - Run SQL in Dashboard to create `supabase_migrations.schema_migrations`
   - Mark baseline as applied

4. **Test Local Setup** (10 min)
   ```bash
   npx supabase start
   npx supabase db reset
   # Verify baseline applied correctly
   ```

5. **Document for Team** (10 min)
   - Add to README
   - Create CONTRIBUTING.md with migration workflow
   - Share in team chat

**Total Time:** ~45 minutes to clean foundation

---

**This strategy gives you:**
- ✅ Clean migration history going forward
- ✅ Reliable local development
- ✅ Team collaboration without conflicts
- ✅ Production safety with dry-run previews
- ✅ Automatic migration tracking
