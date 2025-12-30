# Next Steps - Cloud-First Workflow Setup

**Status:** Ready to implement
**Time Required:** ~15 minutes one-time setup
**Then:** Simple cloud-first development forever

---

## 📋 One-Time Setup Checklist

### 1. Link Supabase CLI (~2 minutes)

```bash
npx supabase link --project-ref yvnuayzslukamizrlhwb
```

When prompted for password, enter: `Drillsquare99`

**Verify it worked:**
```bash
npx supabase status --linked
# Should show: yvnuayzslukamizrlhwb
```

---

### 2. Enable GitHub Integration (~5 minutes)

**Open:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/integrations

**Steps:**
1. Click **"Connect to GitHub"** button
2. Authorize Supabase to access your GitHub
3. Select repository: **Acurioustractor/empathy-ledger-v2**
4. Enable **"Database Branching"** toggle
5. Enable **"Auto-run migrations on PR"** toggle
6. Save settings

**What you get:**
- Each PR automatically creates a preview database
- Migrations run automatically on preview branches
- Preview databases deleted when PR closes
- No manual setup needed

---

### 3. Enable Vercel Integration (~5 minutes)

**Open Vercel:** Your project's Integrations page

**Steps:**
1. Search for **"Supabase"** integration
2. Click **"Add Integration"**
3. Select Supabase project: **yvnuayzslukamizrlhwb**
4. Authorize connection
5. Verify environment variables are synced

**What you get:**
- Preview deployments automatically point to preview databases
- Environment variables auto-updated
- Production stays on production database
- Zero manual configuration

---

### 4. Verify Setup (~3 minutes)

```bash
# Run verification script
node scripts/verify-cloud-setup.mjs
```

**Expected output:**
```
✅ All environment variables present
✅ CLI linked to cloud project
✅ Database connection successful
✅ Migration tracking exists
✅ permission_tier column exists
```

**If you see warnings:**
- CLI link: Run step 1 again
- Database connection: Check `.env.local` credentials
- Migration tracking: Follow script instructions

---

### 5. Test the Workflow (~10 minutes)

**Create a test branch:**
```bash
git checkout -b test/cloud-workflow
```

**Make a small database change in Dashboard:**
1. Go to [SQL Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new)
2. Run this test SQL:
```sql
-- Add a test comment column
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS test_comment TEXT DEFAULT 'cloud workflow test';
```

**Pull the schema change:**
```bash
npx supabase db pull
```

**Rename the migration file:**
```bash
mv supabase/migrations/*_remote_schema.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_test_cloud_workflow.sql
```

**Commit and push:**
```bash
git add supabase/migrations/*.sql
git commit -m "test: verify cloud workflow"
git push origin test/cloud-workflow
```

**Create PR on GitHub:**
1. Go to GitHub and create PR
2. Watch GitHub Actions run
3. See Supabase check ✅
4. See Vercel preview deployment ✅
5. Click preview link to test

**Clean up:**
```bash
# Delete test column via Dashboard SQL Editor
ALTER TABLE stories DROP COLUMN IF EXISTS test_comment;

# Delete branch
git checkout main
git branch -D test/cloud-workflow
git push origin --delete test/cloud-workflow
```

---

## ✅ Setup Complete!

Once all 5 steps are done, you have:

- ✅ CLI linked to cloud project
- ✅ GitHub auto-creates preview databases for PRs
- ✅ Vercel auto-deploys preview environments
- ✅ Verified everything works end-to-end

---

## 🚀 Daily Workflow (After Setup)

### Making a Database Change

```bash
# 1. Create feature branch
git checkout -b feature/add-new-field

# 2. Make change in Dashboard SQL Editor
# https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new

# 3. Pull schema into migration file
npx supabase db pull

# 4. Rename migration file
mv supabase/migrations/*_remote_schema.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_field.sql

# 5. Update TypeScript code to use new field

# 6. Commit and push
git add .
git commit -m "feat: add new field to stories"
git push origin feature/add-new-field

# 7. Create PR on GitHub
# → GitHub automatically creates preview DB
# → Vercel automatically creates preview deployment
# → Test on preview URL
# → Merge when ready
# → Auto-deploys to production
```

**That's it.** No local Supabase. No Docker. No chaos.

---

## 📖 Documentation

**Start here:**
- [CURRENT_STATUS.md](docs/CURRENT_STATUS.md) - What's done, what's next
- [QUICK_START_CLOUD_WORKFLOW.md](docs/QUICK_START_CLOUD_WORKFLOW.md) - Quick reference

**Deep dives:**
- [CLOUD_FIRST_DATABASE_WORKFLOW.md](docs/CLOUD_FIRST_DATABASE_WORKFLOW.md) - Comprehensive guide
- [MIGRATION_RESEARCH_SUMMARY.md](docs/MIGRATION_RESEARCH_SUMMARY.md) - Why we chose this approach

**Index:**
- [docs/README.md](docs/README.md) - All documentation organized

---

## 🎯 After Setup: Next Features

Once setup is complete, ready to build:

### Phase 2 Remaining Items

**1. Permission Tier Selector Component**
- Let storytellers change permission tier
- Show "What you can/can't" explanations
- Validate archive tier requires explicit consent

**2. Share Link Permission Validation**
- Update `/api/stories/[id]/share` endpoint
- Use `can_create_share_link()` database function
- Block unauthorized share attempts

**3. Ethical Guidelines Page**
- Create `/ethics` route
- Explain permission tiers
- Show OCAP principles
- Partner best practices

**4. Storyteller Consent Dashboard**
- View all stories and permission tiers
- Bulk permission updates
- See distributions
- Revoke access tokens
- Export consent history

See [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md) for details.

---

## 💡 Quick Commands

```bash
# Verify setup
node scripts/verify-cloud-setup.mjs

# Verify migration applied
node scripts/verify-migration.mjs

# Pull database schema changes
npx supabase db pull

# Apply migrations (if not using GitHub auto)
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --linked > src/types/database-generated.ts
```

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb)
- [SQL Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new)
- [Table Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor)
- [GitHub Repository](https://github.com/Acurioustractor/empathy-ledger-v2)

---

**Ready to start?** Follow the checklist above, then you're good to go! 🚀
