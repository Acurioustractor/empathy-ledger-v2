# Cloud-First Database Workflow

**Philosophy:** All development happens in the cloud. No local Supabase. Simple, clean, no chaos.

**Stack:** GitHub → Supabase (cloud) → Vercel

**Date:** December 24, 2025

---

## 🎯 Goals

1. **No Local Complexity** - No Docker, no local Supabase, no port conflicts
2. **Single Source of Truth** - Production Supabase is the primary database
3. **Safe Development** - Preview branches for testing before production
4. **Simple Workflow** - VS Code → GitHub → Auto-deploy
5. **Team Friendly** - Everyone follows same simple process

---

## 🏗️ Architecture

```
┌─────────────┐
│   VS Code   │ ← You write code here
└──────┬──────┘
       │ git push
       ▼
┌─────────────┐
│   GitHub    │ ← Code repository
└──────┬──────┘
       │ auto-triggers
       ├────────────────┬────────────────┐
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Supabase   │  │  Supabase   │  │  Supabase   │
│  Preview    │  │  Preview    │  │ Production  │
│  Branch     │  │  Branch #2  │  │   (main)    │
└──────┬──────┘  └──────┬──────┘  └─────────────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   Vercel    │  │   Vercel    │
│  Preview    │  │  Preview #2 │
└─────────────┘  └─────────────┘
```

**How it works:**
1. You push code to GitHub branch
2. GitHub triggers Supabase to create preview database
3. GitHub triggers Vercel to create preview deployment
4. Preview deployment uses preview database
5. Merge PR → auto-deploys to production

---

## ✅ RECOMMENDED WORKFLOW

### One-Time Setup (15 minutes)

#### 1. Link Supabase to GitHub

**Dashboard:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/integrations

1. Go to **Settings → Integrations**
2. Connect to GitHub repository: `Acurioustractor/empathy-ledger-v2`
3. Enable **Database Branching**

**What this does:**
- Auto-creates preview database for each PR
- Runs migrations on preview branches
- Syncs environment variables to Vercel

#### 2. Link Vercel to Supabase

**Vercel Dashboard:** https://vercel.com/your-team/empathy-ledger-v2/settings/integrations

1. Go to **Settings → Integrations**
2. Add Supabase integration
3. Connect to Supabase project: `yvnuayzslukamizrlhwb`

**What this does:**
- Auto-updates Vercel env vars for preview deployments
- Each preview deployment points to matching preview database

#### 3. Set Up Migration Tracking (One-time in Dashboard)

**Dashboard SQL Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new

```sql
-- Create schema for migration tracking
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mark current schema as baseline
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('00000000000000', 'baseline_production_schema')
ON CONFLICT (version) DO NOTHING;
```

**Done!** Setup complete.

---

### Daily Development Workflow

#### Step 1: Create Feature Branch

```bash
# In VS Code terminal
git checkout main
git pull
git checkout -b feature/add-new-field
```

#### Step 2: Make Database Changes in Dashboard

**Option A: SQL Editor (Recommended)**

1. Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
2. Write your SQL:
```sql
-- Add new column to stories table
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Add index
CREATE INDEX IF NOT EXISTS idx_stories_new_field
  ON stories(new_field);
```
3. Click "Run"
4. Verify in Table Editor

**Option B: Table Editor (For Simple Changes)**

1. Go to Table Editor
2. Click table → "Add Column"
3. Fill in details
4. Save

#### Step 3: Generate Migration File from Changes

```bash
# Pull schema changes into migration file
npx supabase db pull

# This creates: supabase/migrations/YYYYMMDDHHMMSS_remote_schema.sql
```

**Rename it to be descriptive:**
```bash
mv supabase/migrations/*_remote_schema.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_field_to_stories.sql
```

#### Step 4: Update Your Code

```typescript
// Update TypeScript types
// File: src/types/database.ts or components

interface Story {
  // ... existing fields
  new_field?: string  // Add new field
}

// Update queries
const { data } = await supabase
  .from('stories')
  .select('*, new_field')  // Include new field
```

#### Step 5: Commit and Push

```bash
git add supabase/migrations/YYYYMMDDHHMMSS_add_new_field_to_stories.sql
git add src/  # Your code changes
git commit -m "feat: add new_field to stories"
git push origin feature/add-new-field
```

#### Step 6: Create Pull Request

1. Go to GitHub
2. Click "Compare & pull request"
3. **GitHub Actions automatically:**
   - Creates Supabase preview branch
   - Runs your migration on preview database
   - Creates Vercel preview deployment
   - Links them together

#### Step 7: Test on Preview

1. GitHub shows Supabase check: ✅ Migration succeeded
2. Click Vercel preview link
3. Test your feature with preview database
4. Make changes if needed (push to same branch)

#### Step 8: Merge to Production

```bash
# When ready
git checkout main
git merge feature/add-new-field
git push origin main
```

**Auto-deploys:**
- Supabase runs migration on production database
- Vercel deploys to production
- Done! ✨

---

## 📁 Repository Structure

```
empathy-ledger-v2/
├── supabase/
│   ├── config.toml           # Supabase project config
│   ├── seed.sql              # Sample data for preview branches
│   └── migrations/
│       ├── 20251224120000_permission_tiers.sql
│       ├── 20251224130000_add_new_field.sql
│       └── ... (chronological order)
├── src/
│   ├── lib/supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── client-ssr.ts     # Server client
│   │   └── service-role-client.ts  # Admin client
│   └── types/
│       └── database/
│           ├── permission-tiers.ts
│           └── ... (type definitions)
├── .env.local.example        # Template for env vars
└── .env.local                # Your actual env vars (gitignored)
```

---

## 🔄 Migration File Best Practices

### Always Use Idempotent SQL

**Good ✅**
```sql
-- Can run multiple times safely
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS new_field TEXT;

CREATE INDEX IF NOT EXISTS idx_name ON table(column);

DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name FOR ALL USING (true);

CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$ BEGIN /* ... */ END; $$ LANGUAGE plpgsql;
```

**Bad ❌**
```sql
-- Will fail if run twice
CREATE TABLE my_table (...);
ALTER TABLE stories ADD COLUMN new_field TEXT;
CREATE INDEX idx_name ON table(column);
CREATE POLICY "policy_name" ON table_name FOR ALL USING (true);
```

### File Naming Convention

```
YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
20251224120000_permission_tiers.sql
20251224130000_add_email_to_profiles.sql
20251224140000_create_notifications_table.sql
```

### Migration Template

```sql
-- Migration: [Description]
-- Created: YYYY-MM-DD
-- Author: [Your Name]

-- What: [What this migration does]
-- Why: [Why it's needed]

BEGIN;

-- 1. Create/modify tables
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS new_field TEXT;

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_new_field
  ON stories(new_field);

-- 3. Update RLS policies
DROP POLICY IF EXISTS "Users can read own stories" ON stories;
CREATE POLICY "Users can read own stories"
  ON stories FOR SELECT
  USING (auth.uid() = storyteller_id);

-- 4. Create/update functions
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers
DROP TRIGGER IF EXISTS update_stories_timestamp ON stories;
CREATE TRIGGER update_stories_timestamp
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

COMMIT;
```

---

## 🌿 Supabase Branching Features

### Preview Branches (Automatic)

**Created when:** You open a PR
**Database:** Fresh copy of production **schema** (no data)
**Data:** Uses `supabase/seed.sql` if present
**Lifespan:** Deleted when PR is merged/closed
**Cost:** Free on Pro plan

**Environment variables (auto-set in Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL=https://[preview-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[preview-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[preview-service-key]
```

### Creating Seed Data for Previews

**File:** `supabase/seed.sql`

```sql
-- Sample data for preview branches
-- This runs automatically on each preview branch

INSERT INTO profiles (id, display_name, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'Demo User', 'demo@example.com');

INSERT INTO stories (id, storyteller_id, title, content, status)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Test Story', 'Sample content...', 'published');
```

**Why this is useful:**
- Preview branches have no production data (for security)
- Seed data lets you test features
- Fresh data on every preview
- Can create specific test scenarios

---

## 🚀 VS Code Workflow

### Recommended Extensions

1. **Supabase** (by Supabase)
   - Syntax highlighting for `.sql` files
   - Snippets for common queries

2. **PostgreSQL** (by Chris Kolkman)
   - SQL formatting
   - IntelliSense for SQL

### Connecting to Database in VS Code

**Don't!** Instead:

1. **Use Supabase Dashboard** for queries/exploration
2. **Use migration files** for schema changes
3. **Use your Next.js app** for testing

**Why:** Keeps workflow simple, no connection strings to manage

### Writing Migrations in VS Code

1. Create file: `supabase/migrations/$(date +%Y%m%d%H%M%S)_my_change.sql`
2. Write SQL with IntelliSense
3. Commit and push
4. Test on preview branch

---

## 🔍 Testing Strategy

### Level 1: Dashboard Quick Test

After making changes in Dashboard SQL Editor:
1. Go to Table Editor
2. Verify columns exist
3. Try inserting test data
4. Check RLS policies work

### Level 2: Preview Branch Test

1. Open PR
2. Wait for Supabase check ✅
3. Click Vercel preview link
4. Test full application flow
5. Check browser console for errors

### Level 3: Production Smoke Test

After merge:
1. Check production Vercel deployment
2. Test critical user flows
3. Monitor Supabase logs for errors

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Migration failed on preview branch"

**Cause:** SQL syntax error or non-idempotent migration

**Solution:**
1. Check GitHub Actions logs for error message
2. Fix SQL in migration file
3. Push fix to same branch
4. Preview branch auto-updates

### Issue 2: "Preview deployment shows old schema"

**Cause:** Env vars not updated in Vercel

**Solution:**
1. Check Vercel deployment logs
2. Verify Supabase integration is connected
3. Manually trigger redeploy in Vercel

### Issue 3: "Can't query new column in production"

**Cause:** Migration not applied to production yet

**Solution:**
1. Check Supabase project logs
2. Verify migration exists in `supabase_migrations.schema_migrations`
3. If missing, run migration in Dashboard SQL Editor

### Issue 4: "Permission denied on table"

**Cause:** Table created via Dashboard owned by `supabase_admin`, migration runs as `postgres`

**Solution:**
Use `ALTER TABLE ... OWNER TO postgres;` in migration:
```sql
CREATE TABLE IF NOT EXISTS my_table (...);
ALTER TABLE my_table OWNER TO postgres;
```

---

## 📊 Migration Tracking

### Check What's Applied

**Dashboard SQL Editor:**
```sql
SELECT
  version,
  name,
  applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC
LIMIT 20;
```

### Manually Mark Migration as Applied

```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20251224120000', 'permission_tiers')
ON CONFLICT (version) DO NOTHING;
```

### Remove Failed Migration Entry

```sql
DELETE FROM supabase_migrations.schema_migrations
WHERE version = '20251224120000';
```

---

## 🎯 Team Collaboration

### Pull Request Checklist

Before creating PR:
- [ ] Migration file is idempotent
- [ ] Migration file has clear comments
- [ ] Code changes match schema changes
- [ ] Tested locally (if possible) or via Dashboard

After PR created:
- [ ] Supabase check passed ✅
- [ ] Vercel preview deployed ✅
- [ ] Tested on preview deployment
- [ ] Reviewed by teammate

### Code Review Focus

Reviewers should check:
- ✅ Migration SQL is safe (no DROP without IF EXISTS)
- ✅ RLS policies protect data properly
- ✅ Indexes on foreign keys
- ✅ Code matches new schema

---

## 💡 Best Practices Summary

### DO ✅

- Make schema changes in Dashboard SQL Editor first
- Use `npx supabase db pull` to generate migration files
- Write idempotent SQL (IF NOT EXISTS, DROP IF EXISTS)
- Test on preview branches before merging
- Keep migrations small and focused
- Add comments explaining why
- Use seed.sql for preview test data

### DON'T ❌

- Don't run `npx supabase start` (no local dev needed)
- Don't apply migrations manually to production
- Don't edit old migration files (create new ones)
- Don't merge PRs with failing Supabase checks
- Don't hardcode IDs or secrets in migrations
- Don't create migrations without testing

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
- **SQL Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor
- **Migrations:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/database/migrations
- **GitHub Repo:** https://github.com/Acurioustractor/empathy-ledger-v2
- **Vercel:** https://vercel.com/[your-team]/empathy-ledger-v2

---

## 📚 References

- [Supabase Branching](https://supabase.com/docs/guides/deployment/branching)
- [GitHub Integration](https://supabase.com/docs/guides/deployment/branching/github-integration)
- [Managing Environments](https://supabase.com/docs/guides/deployment/managing-environments)
- [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Vercel Integration](https://supabase.com/docs/guides/deployment/branching/integrations)
- [Supabase for Vercel](https://vercel.com/marketplace/supabase)

---

**Last Updated:** December 24, 2025
**Recommended Approach:** Cloud-first, no local Supabase
**Workflow:** Dashboard → CLI pull → Git → Auto-deploy
