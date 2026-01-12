# Bulletproof Supabase Workflow - Never Have Issues Again

**Date**: January 11, 2026
**Status**: Production-Ready Workflow
**Goal**: Eliminate schema drift, SQL ingestion issues, and "everything feels fucked" moments

---

## 🎯 The Core Problem You Were Having

**What was broken:**
- Mixed direct Studio edits with migrations → Schema drift
- Ingesting raw SQL dumps → Bypassed version control
- Local vs production out of sync → API key issues, RLS errors
- No single source of truth → Constant confusion

**Why it happened:**
- Supabase Studio makes it too easy to edit directly
- No enforcement of migration-first workflow
- Missing local development environment
- Unclear which database is "real"

**The fix:**
- **Migrations are the ONLY way to change schema** (period)
- Local development stack mirrors production exactly
- Clear workflow for every scenario
- Safeguards to prevent drift

---

## ✅ Your Current Setup (Audit Results)

**Good news - You're already 80% there!**

✅ Supabase CLI initialized (supabase/config.toml exists)
✅ 65+ migrations in version control
✅ Project linked: `yvnuayzslukamizrlhwb`
✅ Migrations indexed (timeline.json)

**What needs fixing:**
❌ Local stack not running (Docker issue)
❌ No clear workflow documentation
❌ Missing safeguards against direct edits
❌ No environment switching strategy

---

## 🏗️ The Bulletproof Setup

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SINGLE SOURCE OF TRUTH                    │
│              supabase/migrations/*.sql (Git)                 │
└─────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼─────────┐       ┌──────▼──────────┐
        │  LOCAL STACK    │       │  PRODUCTION     │
        │  (Docker)       │       │  (Supabase)     │
        │  - Postgres     │       │  - Hosted DB    │
        │  - Auth         │       │  - Auth         │
        │  - Storage      │       │  - Storage      │
        │  - Studio       │       │  - Studio       │
        └─────────────────┘       └─────────────────┘
             │                           │
             │                           │
        ┌────▼────┐                 ┌───▼────┐
        │  Your   │                 │  Your  │
        │  Dev    │                 │  Live  │
        │  Code   │                 │  App   │
        └─────────┘                 └────────┘
```

**Key principle**: Migrations flow ONE WAY → from Git to databases. Never the reverse.

---

## 📋 Step-by-Step Setup

### Step 1: Fix Docker and Start Local Stack

**Check Docker status:**
```bash
docker info
```

**If not running:**
```bash
# macOS: Open Docker Desktop
open -a Docker

# Wait 30 seconds for Docker to start
sleep 30
```

**Start Supabase local services:**
```bash
npx supabase start
```

**Expected output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhb...
service_role key: eyJhb...
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

**Save these values** - you'll use them in .env.local

**Troubleshooting:**
```bash
# If port conflicts
lsof -i :54321  # Check what's using port
# Change ports in supabase/config.toml if needed

# If Docker socket issues
docker ps  # Should show running containers

# Reset everything
npx supabase stop
npx supabase db reset
```

---

### Step 2: Configure Environment Variables

**Create/Update `.env.local`:**
```bash
# ============================================
# DEVELOPMENT (Local Supabase)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>

# Database URL for migrations/scripts
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# ============================================
# PRODUCTION (Supabase Hosted)
# Used in production deployment only
# ============================================
# NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your production anon key>
# SUPABASE_SERVICE_ROLE_KEY=<your production service key>
```

**Create `.env.production.local` for production testing:**
```bash
# Production environment (only use when testing prod locally)
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your production anon key>
SUPABASE_SERVICE_ROLE_KEY=<your production service key>
DATABASE_URL=<your production database URL>
```

**Add to `.gitignore`:**
```
.env*.local
!.env.production.example
```

---

### Step 3: Verify Local Stack is in Sync

**Check migration status:**
```bash
npx supabase db reset
```

This will:
1. Drop local database
2. Reapply ALL migrations from `supabase/migrations/`
3. Run seed data if configured
4. Show you any migration errors

**Expected output:**
```
Applying migration 20250101000000_initial_schema.sql...
Applying migration 20250109_media_system.sql...
...
Applying migration 20260111000003_email_notifications.sql...
Finished supabase db reset on branch main.
```

**If errors occur:**
- Fix the migration SQL
- Run `npx supabase db reset` again
- Never proceed until local works perfectly

---

### Step 4: Link to Production (Already Done)

**Verify link:**
```bash
cat .supabase/config.toml
# Should show: project_id = "yvnuayzslukamizrlhwb"
```

**Test connection:**
```bash
npx supabase db remote commit
```

This shows any pending migrations not yet in production.

---

## 🔄 The Bulletproof Workflow

### Scenario 1: Making Schema Changes (NEW TABLES, COLUMNS, ETC.)

**NEVER EDIT IN STUDIO. EVER.**

**Correct workflow:**

1. **Create migration file:**
   ```bash
   npx supabase migration new add_user_preferences
   # Creates: supabase/migrations/20260111130000_add_user_preferences.sql
   ```

2. **Write your SQL:**
   ```sql
   -- supabase/migrations/20260111130000_add_user_preferences.sql

   CREATE TABLE IF NOT EXISTS public.user_preferences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     theme TEXT DEFAULT 'light',
     notifications_enabled BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);

   -- RLS
   ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own preferences"
     ON public.user_preferences FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can update own preferences"
     ON public.user_preferences FOR UPDATE
     TO authenticated
     USING (auth.uid() = user_id);
   ```

3. **Test locally:**
   ```bash
   # Apply to local DB
   npx supabase db reset

   # Or just apply new migration
   npx supabase migration up
   ```

4. **Verify in local Studio:**
   ```bash
   # Open http://127.0.0.1:54323
   # Check table exists, RLS works, indexes created
   ```

5. **Test in your app:**
   ```bash
   npm run dev
   # Test CRUD operations with local DB
   ```

6. **Generate TypeScript types:**
   ```bash
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```

7. **Commit to Git:**
   ```bash
   git add supabase/migrations/20260111130000_add_user_preferences.sql
   git add src/types/supabase.ts
   git commit -m "feat(db): add user preferences table"
   ```

8. **Deploy to production:**
   ```bash
   # Option A: Push directly (careful!)
   npx supabase db push

   # Option B: Use Supabase dashboard migrations tab
   # Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/database/migrations
   # It will detect new migrations from Git and let you apply them

   # Option C: CI/CD (recommended for production)
   # GitHub Actions workflow (see below)
   ```

---

### Scenario 2: Fixing Production Schema Drift

**If production already has changes you didn't make via migrations:**

1. **Capture production state:**
   ```bash
   npx supabase db diff --linked > supabase/migrations/20260111_fix_drift.sql
   ```

   This compares local (clean from migrations) vs remote (drifted) and generates SQL to sync.

2. **Review the diff:**
   ```bash
   cat supabase/migrations/20260111_fix_drift.sql
   # Make sure it's what you expect
   ```

3. **Apply locally to test:**
   ```bash
   npx supabase db reset
   # This will now include the drift-fixing migration
   ```

4. **Commit as "schema sync" migration:**
   ```bash
   git add supabase/migrations/20260111_fix_drift.sql
   git commit -m "fix(db): sync production schema drift"
   ```

5. **From now on, NEVER edit production directly**

---

### Scenario 3: Rolling Back a Migration

**If a migration breaks production:**

1. **Create reverse migration:**
   ```bash
   npx supabase migration new revert_user_preferences
   ```

2. **Write DOWN migration:**
   ```sql
   -- supabase/migrations/20260111140000_revert_user_preferences.sql

   DROP TABLE IF EXISTS public.user_preferences CASCADE;
   ```

3. **Test locally:**
   ```bash
   npx supabase db reset
   ```

4. **Deploy:**
   ```bash
   npx supabase db push
   ```

**NEVER use `DROP DATABASE` or manual deletions in Studio.**

---

### Scenario 4: Ingesting Large SQL Dumps (e.g., from old system)

**NEVER paste into Studio or run directly on production.**

**Correct workflow:**

1. **Break into logical migrations:**
   ```bash
   # Instead of one 5000-line dump:
   npx supabase migration new import_legacy_users
   npx supabase migration new import_legacy_posts
   npx supabase migration new import_legacy_media
   ```

2. **Make migrations idempotent:**
   ```sql
   -- Use IF NOT EXISTS
   CREATE TABLE IF NOT EXISTS ...

   -- Use ON CONFLICT for inserts
   INSERT INTO users (id, email)
   VALUES (...)
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Test on local first:**
   ```bash
   npx supabase db reset
   # If fails, fix migration, try again
   ```

4. **Only after local works, push to production**

---

### Scenario 5: Working with Team Members

**Problem**: Someone edits production directly

**Solution**: Enforce migration-only policy

1. **Detect changes:**
   ```bash
   npx supabase db diff --linked
   ```

2. **If changes found:**
   ```bash
   # Capture as migration
   npx supabase db diff --linked > supabase/migrations/20260111_teammate_changes.sql

   # Review, commit
   git add supabase/migrations/20260111_teammate_changes.sql
   git commit -m "fix(db): capture teammate's manual changes"
   ```

3. **Educate team**: Point them to this document

---

## 🛡️ Safeguards to Prevent Drift

### 1. Pre-Commit Hook

**Create `.husky/pre-commit` (if using Husky):**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for schema drift
npx supabase db diff --linked > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "⚠️  WARNING: Local schema differs from production!"
  echo "Run: npx supabase db diff --linked"
  echo "Then create a migration if needed."
fi
```

### 2. GitHub Actions Workflow

**Create `.github/workflows/supabase-migrations.yml`:**
```yaml
name: Deploy Supabase Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Supabase project
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          supabase link --project-ref yvnuayzslukamizrlhwb

      - name: Push migrations
        run: supabase db push
```

**Set secrets in GitHub:**
- `SUPABASE_ACCESS_TOKEN` - From Supabase dashboard settings
- `SUPABASE_DB_PASSWORD` - Your database password

Now migrations auto-deploy when merged to main!

### 3. Production Studio Restrictions

**In Supabase dashboard:**
1. Go to Settings → Database
2. Enable "Read-only mode" for Studio
3. Only service role can make changes
4. Force all changes through migrations

---

## 📊 Environment Strategy

### Three Environments

| Environment | Database | When to Use |
|-------------|----------|-------------|
| **Local (Docker)** | `postgresql://postgres:postgres@localhost:54322/postgres` | All development |
| **Staging (Optional)** | Separate Supabase project | Pre-production testing |
| **Production** | `https://yvnuayzslukamizrlhwb.supabase.co` | Live app |

### Switching Environments

**Development (default):**
```bash
# .env.local is automatically used by Next.js
npm run dev
# Uses http://127.0.0.1:54321
```

**Test against production locally:**
```bash
# Temporarily use production
cp .env.production.local .env.local
npm run dev
# Uses https://yvnuayzslukamizrlhwb.supabase.co

# When done, restore local
git checkout .env.local
```

**Production deployment:**
```bash
# Vercel automatically uses production env vars
# Set in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<production key>
```

---

## 🎯 Daily Workflow Checklist

### Starting Work

- [ ] `docker info` - Docker running?
- [ ] `npx supabase start` - Local services up?
- [ ] `npx supabase status` - All green?
- [ ] Open Studio: http://127.0.0.1:54323

### Making Schema Changes

- [ ] `npx supabase migration new <name>` - Create migration
- [ ] Write SQL in migration file
- [ ] `npx supabase db reset` - Test locally
- [ ] Verify in local Studio
- [ ] `npx supabase gen types typescript --local` - Update types
- [ ] Test in app with `npm run dev`
- [ ] Commit migration to Git
- [ ] Push to production via `npx supabase db push` or CI/CD

### Ending Work

- [ ] `npx supabase stop` - Stop services (or leave running)
- [ ] Commit any pending changes
- [ ] Push to Git

---

## 🔧 Troubleshooting Common Issues

### "Migration failed to apply"

**Cause**: SQL syntax error or dependency issue

**Fix**:
```bash
# Check migration SQL
cat supabase/migrations/<filename>.sql

# Test in local Studio SQL editor first
# http://127.0.0.1:54323

# Fix migration, then:
npx supabase db reset
```

### "Local and remote out of sync"

**Cause**: Someone edited production directly

**Fix**:
```bash
# Capture diff
npx supabase db diff --linked > supabase/migrations/20260111_sync.sql

# Review and commit
git add supabase/migrations/20260111_sync.sql
git commit -m "fix(db): sync production changes"
```

### "RLS policies not working"

**Cause**: Forgot to enable RLS or test with wrong user

**Fix**:
```sql
-- In your migration, always include:
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Test in Studio with different roles:
-- Switch between anon/authenticated in Studio UI
```

### "Types out of date"

**Cause**: Schema changed but types not regenerated

**Fix**:
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

### "Port already in use"

**Cause**: Previous instance still running

**Fix**:
```bash
npx supabase stop
# Or find and kill process:
lsof -i :54321
kill -9 <PID>
```

---

## 📚 Reference Commands

### Essential Commands

```bash
# Start/stop local stack
npx supabase start
npx supabase stop
npx supabase status

# Migrations
npx supabase migration new <name>       # Create new migration
npx supabase db reset                   # Reapply all migrations
npx supabase migration up               # Apply pending migrations
npx supabase db diff                    # Show local vs remote diff
npx supabase db diff --linked           # Compare local vs production
npx supabase db push                    # Push migrations to production

# Types
npx supabase gen types typescript --local > src/types/supabase.ts

# Remote
npx supabase link --project-ref <ref>  # Link to project
npx supabase db remote commit           # Show pending migrations

# Debugging
npx supabase db reset --debug           # Verbose output
docker ps                               # Check containers
docker logs supabase_db_empathy-ledger-v2  # View DB logs
```

---

## ✅ Success Criteria

After following this workflow, you should NEVER have:

- ❌ Schema drift between local and production
- ❌ "Unknown migration" errors
- ❌ API key mismatches
- ❌ RLS policies that work locally but not in production
- ❌ Fear of pushing migrations
- ❌ "Everything feels fucked" moments

Instead, you'll have:

- ✅ Migrations as single source of truth
- ✅ Local development that mirrors production exactly
- ✅ Confidence in deployments
- ✅ Rollback capability
- ✅ Team can collaborate without conflicts
- ✅ Clear, documented workflow

---

## 🎉 You're Now Bulletproof!

**Key principles to remember:**

1. **Migrations are law** - Never bypass them
2. **Local first** - Test everything locally before production
3. **Git is truth** - Migrations in version control
4. **One-way flow** - Migrations → Databases (never reverse)
5. **Automate** - Use CI/CD to prevent human error

**Next time you need to change the schema:**

1. Create migration file
2. Write SQL
3. Test locally
4. Commit to Git
5. Deploy via push or CI/CD

**That's it. Simple. Bulletproof. No more issues.**

---

**Date**: January 11, 2026
**Status**: Production-Ready
**Your Supabase workflow is now unbreakable** 🛡️
