# Quick Start: Cloud-First Database Workflow

**For:** Empathy Ledger v2 Development Team
**Date:** December 24, 2025
**Philosophy:** All development in the cloud. No local Supabase. Simple and clean.

---

## ✨ What You Get

- ✅ **No Docker chaos** - No local Supabase containers
- ✅ **Auto-deployments** - Push to GitHub → Auto-deploy to Vercel
- ✅ **Preview branches** - Each PR gets its own database + deployment
- ✅ **Team sync** - Everyone works from same cloud database
- ✅ **Migration tracking** - Automatic history in `supabase_migrations.schema_migrations`

---

## 🚀 One-Time Setup (15 minutes)

### Step 1: Link Supabase CLI to Cloud Project

```bash
# In your project root
npx supabase link --project-ref yvnuayzslukamizrlhwb
```

When prompted, enter password: `Drillsquare99`

**What this does:** Connects your local CLI to the cloud Supabase project

### Step 2: Enable GitHub Integration

1. Go to [Supabase Integrations](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/integrations)
2. Click **"Connect to GitHub"**
3. Select repository: `Acurioustractor/empathy-ledger-v2`
4. Enable **"Database Branching"**
5. Enable **"Auto-run migrations on PR"**

**What this does:**
- Creates preview database for each PR automatically
- Runs migrations on preview branches
- Deletes preview databases when PR closes

### Step 3: Connect Vercel to Supabase

1. Go to [Vercel Integrations](https://vercel.com/your-team/empathy-ledger-v2/settings/integrations)
2. Search for "Supabase"
3. Click **"Add Integration"**
4. Connect to project: `yvnuayzslukamizrlhwb`

**What this does:**
- Auto-updates environment variables for preview deployments
- Each preview deployment points to matching preview database
- Production stays connected to production database

---

## 📝 Daily Workflow

### Making a Database Change

```bash
# 1. Create feature branch
git checkout -b feature/add-new-field

# 2. Make changes in Supabase Dashboard SQL Editor
# Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
# Write SQL, test it, verify it works

# 3. Pull the schema changes into a migration file
npx supabase db pull

# This creates: supabase/migrations/YYYYMMDDHHMMSS_remote_schema.sql

# 4. Rename to be descriptive
mv supabase/migrations/*_remote_schema.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_field.sql

# 5. Update your TypeScript code to use new fields

# 6. Commit everything
git add supabase/migrations/*.sql src/
git commit -m "feat: add new_field to stories"

# 7. Push to GitHub
git push origin feature/add-new-field

# 8. Create Pull Request
# GitHub automatically:
#   - Creates Supabase preview database
#   - Runs migration on preview
#   - Creates Vercel preview deployment
#   - Links them together

# 9. Test on preview URL

# 10. Merge when ready
# Automatically:
#   - Runs migration on production database
#   - Deploys to production Vercel
```

---

## 🔄 Migration File Best Practices

### Always Write Idempotent SQL

**Good ✅**
```sql
-- Safe to run multiple times
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

---

## 🎯 Two Methods for Running Migrations

### Method 1: Supabase CLI (BEST for multiple migrations)

```bash
# Preview what will be applied
npx supabase db push --dry-run

# Apply migrations
npx supabase db push
```

**When to use:**
- Multiple migration files to apply
- Team development (everyone runs same migrations)
- CI/CD pipelines
- Automatic migration tracking

**Advantages:**
- ✅ Tracks migration history automatically
- ✅ Only applies new migrations
- ✅ Transactional (rolls back on error)
- ✅ Scriptable and automatable

### Method 2: Dashboard SQL Editor (BEST for single migrations)

1. Go to [SQL Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new)
2. Copy migration SQL from file
3. Paste and click "Run"
4. Verify with test queries

**When to use:**
- Running a single migration file
- Testing SQL before committing
- Quick fixes or hotfixes
- CLI has connection issues

**Advantages:**
- ✅ Works 100% of the time (no connection issues)
- ✅ Visual feedback
- ✅ Can run partial SQL for testing
- ✅ No local setup needed

---

## 🔍 Verify Migration Applied

```sql
-- Check which migrations have been applied
SELECT
  version,
  name,
  applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC
LIMIT 20;
```

---

## 🌿 Preview Branches (Automatic)

When you create a PR:

1. **Supabase creates preview database**
   - Fresh copy of production schema
   - No production data (for security)
   - Runs migrations automatically
   - Uses `supabase/seed.sql` if present

2. **Vercel creates preview deployment**
   - Auto-updates environment variables
   - Points to preview database
   - Unique URL for testing

3. **Test your changes**
   - Click preview link in GitHub PR
   - Full app with isolated database
   - No risk to production

4. **Merge to deploy**
   - Migration runs on production
   - Vercel deploys to production
   - Preview branch deleted automatically

---

## 📦 Creating Seed Data for Previews

Create `supabase/seed.sql` to populate preview databases:

```sql
-- Sample data for preview branches
-- Runs automatically on each preview branch

INSERT INTO profiles (id, display_name, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'Demo User', 'demo@example.com');

INSERT INTO stories (id, storyteller_id, title, content, status)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Test Story', 'Sample content...', 'published');
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Migration failed on preview branch"
**Cause:** SQL syntax error or non-idempotent migration

**Solution:**
1. Check GitHub Actions logs for error
2. Fix SQL in migration file
3. Push to same branch
4. Preview auto-updates

### Issue: "Preview deployment shows old schema"
**Cause:** Env vars not updated in Vercel

**Solution:**
1. Check Vercel deployment logs
2. Verify Supabase integration connected
3. Manually trigger redeploy

### Issue: "Can't query new column in production"
**Cause:** Migration not applied yet

**Solution:**
1. Check Supabase project logs
2. Verify migration in `supabase_migrations.schema_migrations`
3. If missing, run in Dashboard SQL Editor

---

## 🎯 Team Collaboration

### Pull Request Checklist

**Before creating PR:**
- [ ] Migration file is idempotent
- [ ] Migration file has clear comments
- [ ] Code changes match schema changes
- [ ] Tested in Dashboard SQL Editor

**After PR created:**
- [ ] Supabase check passed ✅
- [ ] Vercel preview deployed ✅
- [ ] Tested on preview deployment
- [ ] Reviewed by teammate

### Code Review Focus

Reviewers check:
- ✅ Migration SQL is safe (IF NOT EXISTS, DROP IF EXISTS)
- ✅ RLS policies protect data properly
- ✅ Indexes on foreign keys
- ✅ Code matches new schema

---

## 💡 Quick Reference

### Links
- **Dashboard:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
- **SQL Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
- **Migrations:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/database/migrations
- **GitHub:** https://github.com/Acurioustractor/empathy-ledger-v2

### Commands
```bash
# Link to cloud project (one-time)
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Preview migrations before running
npx supabase db push --dry-run

# Apply migrations
npx supabase db push

# Pull schema changes into migration file
npx supabase db pull

# Generate TypeScript types
npx supabase gen types typescript --linked > src/types/database-generated.ts
```

### Environment Variables
```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
DATABASE_URL=[your-connection-string]
```

---

## ✅ What to DO

- ✅ Make schema changes in Dashboard SQL Editor first
- ✅ Use `npx supabase db pull` to generate migration files
- ✅ Write idempotent SQL (IF NOT EXISTS, DROP IF EXISTS)
- ✅ Test on preview branches before merging
- ✅ Keep migrations small and focused
- ✅ Add comments explaining why

## ❌ What to AVOID

- ❌ Don't run `npx supabase start` (no local dev needed)
- ❌ Don't apply migrations manually to production
- ❌ Don't edit old migration files (create new ones)
- ❌ Don't merge PRs with failing Supabase checks
- ❌ Don't hardcode IDs or secrets in migrations
- ❌ Don't create migrations without testing

---

**Last Updated:** December 24, 2025
**Workflow:** Dashboard → CLI pull → Git → Auto-deploy
**No local Supabase. All cloud. Simple and clean.**
