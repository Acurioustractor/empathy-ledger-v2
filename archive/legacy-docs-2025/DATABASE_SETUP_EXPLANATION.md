# Database Setup & Management - Explained

## Current Setup (What You Have)

### ☁️ **You're Using Supabase CLOUD (Not Local)**

**Evidence:**
```bash
DATABASE_URL=postgresql://postgres.yvnuayzslukamizrlhwb:...@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
```

This is a **hosted Supabase instance in AWS Sydney region** (ap-southeast-2).

**NOT a local database!**

---

## What I've Been Doing (The Problem)

### ❌ Wrong Approach (What I Did)

I was using `psql $DATABASE_URL` which connects **directly to PostgreSQL**, bypassing Supabase's PostgREST layer:

```bash
# This connects directly to PostgreSQL
psql $DATABASE_URL -c "ALTER TABLE profiles ADD COLUMN email TEXT;"

# PostgreSQL says: ✅ "ALTER TABLE"
# But Supabase PostgREST cache says: ❌ "Column doesn't exist"
```

**Why This Caused Issues:**

1. **Direct PostgreSQL changes** → PostgreSQL schema updates ✅
2. **PostgREST doesn't know** → API cache not refreshed ❌
3. **API calls fail** → Can't see new columns ❌

---

## Correct Approach (Best Practice)

### ✅ Use Supabase CLI for All Schema Changes

**Step 1: Initialize Supabase Project (Link to Cloud)**
```bash
# Link to your cloud project
supabase link --project-ref yvnuayzslukamizrlhwb
```

**Step 2: Apply Migrations via CLI**
```bash
# This pushes migration AND refreshes PostgREST cache
supabase db push
```

**Step 3: Verify**
```bash
# Check migration status
supabase migration list

# Test API
curl https://yvnuayzslukamizrlhwb.supabase.co/rest/v1/profiles?select=email
```

---

## Two Ways to Manage Supabase

### Option A: Cloud-First (Your Current Setup) ✅ RECOMMENDED

**Structure:**
```
Your App → Supabase Cloud → PostgreSQL (hosted)
          ↓
      PostgREST API
```

**How to Manage:**
```bash
# 1. Create migration file
supabase migration new add_storyteller_fields

# 2. Edit the SQL file
# supabase/migrations/20251005XXXXXX_add_storyteller_fields.sql

# 3. Push to cloud
supabase db push

# This does:
# - Applies SQL to database ✅
# - Refreshes PostgREST schema cache ✅
# - Updates API instantly ✅
```

**Pros:**
- ✅ Production database
- ✅ Automatic backups
- ✅ Built-in Auth
- ✅ PostgREST cache managed
- ✅ Real-time subscriptions
- ✅ CDN for storage

**Cons:**
- ⚠️ Requires internet
- ⚠️ Slower than local
- ⚠️ Costs money (but free tier generous)

---

### Option B: Local-First Development (Alternative)

**Structure:**
```
Your App → Supabase Local → PostgreSQL (Docker)
          ↓
      PostgREST API (local)
```

**Setup:**
```bash
# Initialize local Supabase
supabase init

# Start local instance (requires Docker)
supabase start

# This creates:
# - Local PostgreSQL (port 54322)
# - Local PostgREST API (port 54321)
# - Local Auth, Storage, etc.
```

**Use in development:**
```bash
# .env.local for LOCAL
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Work locally
supabase db push

# When ready, push to cloud
supabase db push --linked
```

**Pros:**
- ✅ Works offline
- ✅ Faster development
- ✅ Free
- ✅ Can reset anytime

**Cons:**
- ⚠️ Requires Docker
- ⚠️ Not production data
- ⚠️ Need to sync with cloud

---

## What Went Wrong (Technical Explanation)

### The PostgREST Schema Cache Problem

**PostgreSQL** (the database engine) and **PostgREST** (the API layer) have separate schema caches:

```
┌─────────────────────────────────────────────┐
│ Your API Call                                │
│ fetch('/api/organisations/123/storytellers') │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Supabase Client (JavaScript)                 │
│ Uses PostgREST                               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ PostgREST API Layer                          │
│ ❌ Schema Cache: organizations table has     │
│    columns: [id, name, created_at]          │
│    (Missing: tenant_id)                     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ PostgreSQL Database                          │
│ ✅ Actual Schema: organizations table has    │
│    columns: [id, name, created_at, tenant_id]│
└─────────────────────────────────────────────┘
```

**When I used `psql $DATABASE_URL`:**
- Changed PostgreSQL directly ✅
- PostgREST cache NOT updated ❌
- API still uses old schema ❌

**When using `supabase db push`:**
- Changes PostgreSQL ✅
- Refreshes PostgREST cache ✅
- API uses new schema immediately ✅

---

## Best Practices Going Forward

### ✅ DO: Use Supabase CLI

```bash
# Create migration
supabase migration new descriptive_name

# Edit the SQL file
# supabase/migrations/20251005123456_descriptive_name.sql

# Test locally (if using local Supabase)
supabase db reset

# Push to cloud
supabase db push

# Or push to specific project
supabase db push --db-url $DATABASE_URL
```

### ❌ DON'T: Use psql/Direct SQL (for schema changes)

```bash
# ❌ This bypasses PostgREST
psql $DATABASE_URL -c "ALTER TABLE profiles ADD COLUMN email TEXT;"

# ❌ This causes cache issues
# ❌ API won't see the changes
# ❌ Will confuse future developers
```

### ✅ DO: Use psql for Queries Only

```bash
# ✅ OK for reading data
psql $DATABASE_URL -c "SELECT * FROM profiles LIMIT 5;"

# ✅ OK for debugging
psql $DATABASE_URL -c "\d profiles"

# ✅ OK for one-time data fixes
psql $DATABASE_URL -c "UPDATE profiles SET email = lower(email);"
```

---

## Migration Workflow (Correct Way)

### Step-by-Step Process

**1. Create Migration File**
```bash
cd /Users/benknight/Code/empathy-ledger-v2

# Create new migration
supabase migration new storyteller_enhancement

# This creates:
# supabase/migrations/20251005XXXXXX_storyteller_enhancement.sql
```

**2. Write SQL in Migration File**
```sql
-- supabase/migrations/20251005XXXXXX_storyteller_enhancement.sql

-- Add tenant_id to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create new tables
CREATE TABLE IF NOT EXISTS profile_organizations (...);

-- Add indexes
CREATE INDEX idx_profiles_email ON profiles(email);
```

**3. Test Migration (Optional - if using local)**
```bash
# Reset local database and apply all migrations
supabase db reset

# Check it worked
supabase db diff
```

**4. Push to Cloud**
```bash
# Apply to your cloud database
supabase db push

# This:
# 1. Connects to your cloud project ✅
# 2. Applies the SQL ✅
# 3. Refreshes PostgREST cache ✅
# 4. Makes API instantly aware of changes ✅
```

**5. Verify**
```bash
# Check migration applied
supabase migration list

# Test API directly
curl https://yvnuayzslukamizrlhwb.supabase.co/rest/v1/profiles?select=email \
  -H "apikey: YOUR_ANON_KEY"
```

---

## Current Situation & Fix

### What's Happened

1. I created migration SQL file ✅
2. I applied it via `psql` ❌ (wrong method)
3. PostgreSQL has the schema ✅
4. PostgREST doesn't know ❌

### How to Fix NOW

**Option 1: Use Supabase CLI (BEST)**
```bash
# Link project (if not already)
supabase link --project-ref yvnuayzslukamizrlhwb

# Push the migration file we already have
supabase db push

# This will:
# - See the migration file is newer than cloud
# - Apply it properly
# - Refresh PostgREST cache
# - Everything works!
```

**Option 2: Via Supabase Dashboard**
```bash
# 1. Go to: https://app.supabase.com/project/yvnuayzslukamizrlhwb
# 2. Click: Database → Migrations
# 3. Click: New Migration
# 4. Paste SQL from: supabase/migrations/20251005_storyteller_schema_enhancement.sql
# 5. Click: Run
# 6. PostgREST cache refreshes automatically
```

**Option 3: Manual Schema Refresh (Quick but not recommended)**
```bash
# Via Supabase Dashboard:
# 1. Go to Database → Schemas
# 2. Click refresh icon
# 3. Wait 30 seconds
# 4. PostgREST cache rebuilds
```

---

## Environment Setup Recommendations

### Current .env.local (Cloud)
```bash
# Your current cloud setup
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.yvnuayzslukamizrlhwb:...@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
```

### If You Want Local Development Too
```bash
# .env.local.cloud (production)
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
# ... cloud credentials

# .env.local.dev (local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # local key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Switch between them:
# cp .env.local.cloud .env.local  # for cloud
# cp .env.local.dev .env.local    # for local
```

---

## Summary

### Your Setup
- ✅ Supabase Cloud (hosted in AWS Sydney)
- ✅ Production database
- ⚠️ No local Supabase instance
- ⚠️ I was using wrong method (direct psql)

### Correct Method
1. **Create migrations:** `supabase migration new <name>`
2. **Write SQL:** Edit migration file
3. **Apply:** `supabase db push`
4. **Never:** Use direct `psql` for schema changes

### Why This Matters
- Supabase has multiple layers (PostgreSQL + PostgREST + Auth + Storage)
- Schema changes must go through proper channels
- Direct database access bypasses cache refresh
- CLI handles everything correctly

### Next Step
Run `supabase db push` to properly apply the migration and refresh the cache!
