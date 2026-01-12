# Supabase Quick Start - Get Running in 5 Minutes

**Status**: Ready to run
**Goal**: Get your bulletproof local development environment running

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Docker (30 seconds)

```bash
# macOS: Open Docker Desktop
open -a Docker

# Wait for Docker to start (~30 seconds)
# You'll see Docker icon in menu bar when ready
```

### Step 2: Start Supabase Local Stack (2 minutes)

```bash
cd /Users/benknight/Code/empathy-ledger-v2
npx supabase start
```

**Expected output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        anon key: eyJhb...
service_role key: eyJhb...
```

**First time?** This downloads Docker images (~5 minutes). After that, starts in ~30 seconds.

### Step 3: Update .env.local (1 minute)

Copy the keys from Step 2 output into `.env.local`:

```bash
# DEVELOPMENT (Local Supabase)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<copy anon key from output>
SUPABASE_SERVICE_ROLE_KEY=<copy service_role key from output>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Step 4: Reset Database with All Migrations (1 minute)

```bash
npx supabase db reset
```

**This will:**
- Drop local database
- Apply all 65 migrations from `supabase/migrations/`
- Show you any errors

**Expected output:**
```
Applying migration 20250101000000_initial_schema.sql...
Applying migration 20250109_media_system.sql...
...
Applying migration 20260111000003_email_notifications.sql...
Finished supabase db reset on branch main.
```

### Step 5: Verify Everything Works (1 minute)

**Open local Supabase Studio:**
```bash
open http://127.0.0.1:54323
```

**Check your tables:**
- Table Editor → Should see all your tables (stories, storytellers, etc.)
- SQL Editor → Run a test query: `SELECT COUNT(*) FROM stories;`

**Start your app:**
```bash
npm run dev
```

**Test a query** - Your app should now work with local database!

---

## ✅ You're Done!

**Your local Supabase is now running and in perfect sync with your migrations.**

### What You Have Now

- ✅ Local Postgres database (port 54322)
- ✅ Local API endpoint (port 54321)
- ✅ Local Studio (port 54323)
- ✅ All 65 migrations applied
- ✅ Zero schema drift

### Daily Workflow

**Start working:**
```bash
npx supabase start        # Start local services
npm run dev               # Start your app
```

**Make schema changes:**
```bash
npx supabase migration new add_feature    # Create migration
# Edit the .sql file
npx supabase db reset                     # Test locally
git commit                                # Commit to version control
npx supabase db push                      # Deploy to production
```

**Stop working:**
```bash
npx supabase stop         # Optional - or leave running
```

---

## 📚 Full Documentation

**For complete details, see:**
- **[SUPABASE_WORKFLOW_BULLETPROOF.md](SUPABASE_WORKFLOW_BULLETPROOF.md)** - Complete workflow guide
  - All scenarios (schema changes, drift fixes, rollbacks)
  - Safeguards and best practices
  - Troubleshooting guide
  - Reference commands

---

## 🆘 Quick Troubleshooting

### Docker not running
```bash
open -a Docker
# Wait 30 seconds
```

### Port already in use
```bash
npx supabase stop
lsof -i :54321  # Find what's using port
```

### Migration fails
```bash
# Check the SQL
cat supabase/migrations/<filename>.sql

# Test in Studio SQL editor first
open http://127.0.0.1:54323

# Fix and try again
npx supabase db reset
```

### Types out of date
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

---

## 🎯 Key Principles

1. **Migrations are law** - Never edit in Studio
2. **Local first** - Test everything locally
3. **Git is truth** - Migrations in version control
4. **One-way flow** - Migrations → Databases

**Follow these and you'll NEVER have Supabase issues again.** 🛡️

---

**Ready? Run Step 1: `open -a Docker`**
