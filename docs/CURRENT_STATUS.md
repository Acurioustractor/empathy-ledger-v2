# Current Status: Cloud-First Database Workflow

**Date:** December 24, 2025
**Status:** ✅ Migration Applied | 📋 Workflow Documented | 🚀 Ready for Development

---

## ✅ Completed

### 1. Permission Tiers Migration (Phase 2)
- **Status:** Successfully applied to production
- **File:** `supabase/migrations/20251224000000_permission_tiers.sql`
- **Applied to:** 310 stories
- **Database:** All stories now have `permission_tier` field (defaulted to 'private')

**Verification:**
```bash
node scripts/verify-migration.mjs
```

**Output:**
```
✅ New columns added: permission_tier, consent_verified_at, elder_reviewed, etc.
✅ Total stories in database: 310
✅ Sample stories with permission tiers assigned
```

### 2. Trust Badge Components (Phase 2)
Created and integrated:
- [PermissionTierBadge](../src/components/story/permission-tier-badge.tsx) - Individual tier display
- [TrustBadges](../src/components/story/trust-badges.tsx) - Composite trust indicator
- [ConsentFooter](../src/components/story/consent-footer.tsx) - Consent notices for shared stories

**Integration:**
- ✅ Story cards show permission tier badges
- ✅ Token routes (`/s/[token]`) show consent footers
- ✅ Types defined in `src/types/database/permission-tiers.ts`

### 3. Documentation Created
- ✅ [CLOUD_FIRST_DATABASE_WORKFLOW.md](CLOUD_FIRST_DATABASE_WORKFLOW.md) - Comprehensive workflow guide
- ✅ [QUICK_START_CLOUD_WORKFLOW.md](QUICK_START_CLOUD_WORKFLOW.md) - Developer quick start
- ✅ [MIGRATION_RESEARCH_SUMMARY.md](MIGRATION_RESEARCH_SUMMARY.md) - Research findings
- ✅ [PHASE_2_INTEGRATION_COMPLETE.md](PHASE_2_INTEGRATION_COMPLETE.md) - Phase 2 summary

### 4. Skills Created
- ✅ `.claude/skills/supabase-connection/skill.md` - Complete Supabase connection guide
- ✅ `.claude/skills/gohighlevel-oauth/skill.md` - OAuth implementation guide

### 5. Verification Scripts
- ✅ `scripts/verify-migration.mjs` - Verify permission_tiers migration
- ✅ `scripts/verify-cloud-setup.mjs` - Verify cloud-first setup

---

## 🎯 Cloud-First Workflow Summary

### Philosophy
**No local Supabase. All development in the cloud. Simple and clean.**

### Architecture
```
GitHub → Supabase Cloud → Vercel
   │         │               │
   │         ├─ Production DB
   │         └─ Preview DBs (per PR)
   │
   └─ Auto-triggers deployments
```

### Daily Workflow
1. **Make DB changes in Dashboard SQL Editor**
2. **Pull schema:** `npx supabase db pull`
3. **Rename migration file** to be descriptive
4. **Update TypeScript code**
5. **Commit and push** to GitHub
6. **Create PR** → Auto-creates preview DB + deployment
7. **Test on preview** → Merge → Auto-deploys to production

### Two Migration Methods

**Method 1: Supabase CLI** (Best for multiple migrations)
```bash
npx supabase db push
```

**Method 2: Dashboard SQL Editor** (Best for single migration)
- Go to [SQL Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new)
- Copy-paste migration SQL
- Click "Run"

---

## 📋 Pending Setup (One-Time, ~15 minutes)

### 1. Link Supabase CLI
```bash
npx supabase link --project-ref yvnuayzslukamizrlhwb
# Password: Drillsquare99
```

### 2. Enable GitHub Integration
1. Go to [Supabase Integrations](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/integrations)
2. Connect to GitHub: `Acurioustractor/empathy-ledger-v2`
3. Enable "Database Branching"
4. Enable "Auto-run migrations on PR"

### 3. Enable Vercel Integration
1. Go to Vercel Integrations
2. Add Supabase integration
3. Connect to project `yvnuayzslukamizrlhwb`

---

## 🚀 Next Development Steps

### Phase 2 Remaining Items

**1. Permission Tier Selector Component**
- Build UI for storytellers to change permission tier
- Validate tier changes (archive requires explicit consent)
- Show tier explanations with "What you can/can't" guidance
- Integration: Story edit forms, storyteller dashboard

**2. Share Link Permission Validation**
- Update `/api/stories/[id]/share` endpoint
- Call `can_create_share_link(story_id, purpose)` database function
- Block share link creation if permission tier doesn't allow purpose
- Return clear error messages to user

**3. Ethical Guidelines Page**
- Create `/ethics` route
- Explain permission tiers
- Show best practices for external partners
- OCAP (Ownership, Control, Access, Possession) principles

**4. Storyteller Consent Dashboard**
- View all stories and their permission tiers
- Bulk permission tier updates
- See where stories are distributed
- Revoke access tokens
- Export consent history

### Testing Checklist

- [ ] Story cards show permission tier badges
- [ ] Token routes show consent footers
- [ ] Permission tier selector works
- [ ] Share link validation blocks unauthorized shares
- [ ] Consent renewal notices appear for old consents
- [ ] Elder review badge displays correctly

---

## 🔗 Quick Reference

### Links
- **Dashboard:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
- **SQL Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
- **GitHub:** https://github.com/Acurioustractor/empathy-ledger-v2
- **Vercel:** [Your Vercel dashboard]

### Commands
```bash
# Link to cloud (one-time)
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Pull schema changes
npx supabase db pull

# Apply migrations
npx supabase db push

# Verify setup
node scripts/verify-cloud-setup.mjs

# Verify permission_tiers migration
node scripts/verify-migration.mjs

# Generate types
npx supabase gen types typescript --linked > src/types/database-generated.ts
```

### File Locations
```
docs/
├── CLOUD_FIRST_DATABASE_WORKFLOW.md      # Comprehensive workflow
├── QUICK_START_CLOUD_WORKFLOW.md         # Quick start guide
├── MIGRATION_RESEARCH_SUMMARY.md         # Research findings
└── PHASE_2_INTEGRATION_COMPLETE.md       # Phase 2 summary

src/components/story/
├── permission-tier-badge.tsx              # Individual tier badge
├── trust-badges.tsx                       # Composite trust indicators
└── consent-footer.tsx                     # Consent notice

src/types/database/
└── permission-tiers.ts                    # Permission tier types

supabase/migrations/
└── 20251224000000_permission_tiers.sql    # Applied migration

scripts/
├── verify-migration.mjs                   # Verify migration
└── verify-cloud-setup.mjs                 # Verify setup
```

---

## 📊 Database Status

**Stories Table:**
- Total stories: 310
- All have `permission_tier` column
- Default tier: 'private'
- Published stories: 'private' (can be changed by storyteller)

**Permission Tiers:**
- 🔴 **private** - Only storyteller can see
- 🟡 **trusted_circle** - Only people with access codes
- 🟢 **community** - OK for community spaces/events
- 🔵 **public** - OK for public sharing (social media, websites)
- ⚪ **archive** - Permanent public record (cannot withdraw)

**Trust Indicators:**
- 👑 Elder reviewed
- ✅ Public sharing approved
- 🕐 Recently verified (< 1 year)
- ⚠️ Needs renewal (> 1 year)

---

## 💡 Development Philosophy

### Always
- ✅ Write idempotent migrations (IF NOT EXISTS)
- ✅ Test in Dashboard SQL Editor first
- ✅ Keep migrations small and focused
- ✅ Use preview branches to test changes
- ✅ Add comments explaining why

### Never
- ❌ Run `npx supabase start` (no local Supabase)
- ❌ Edit old migration files (create new ones)
- ❌ Merge PRs with failing checks
- ❌ Hardcode secrets in migrations
- ❌ Apply migrations manually to production

---

**Last Updated:** December 24, 2025
**Migration Status:** ✅ Applied
**Workflow:** Cloud-first, GitHub-triggered, auto-deployed
**Team:** Ready to develop
