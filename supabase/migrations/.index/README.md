# Database Migrations

**Current Schema Version**: 3.2.1
**Last Migration**: 20260111000003_email_notifications.sql
**Total Migrations**: 65
**Last Updated**: January 11, 2026

---

## Quick Reference

| Need | Command |
|------|---------|
| **Apply all migrations** | `npx supabase db push` |
| **Apply specific migration** | `psql $DATABASE_URL -f supabase/migrations/FILENAME.sql` |
| **Reset database** | `npx supabase db reset` |
| **Generate new migration** | `npx supabase migration new DESCRIPTION` |
| **Check current version** | See `.index/timeline.json` |

---

## Migration Timeline

Migrations organized by development phase:

### Phase 1: Foundation (Jan 1-6, 2026) - 50 migrations
**Core platform setup, multi-tenant architecture, RBAC, storyteller analytics**

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-01-01 | `20250101000000_initial_schema.sql` | Initial database schema |
| 2025-01-09 | `20250109_media_system.sql` | Media management system |
| 2025-09-13 | `20250913000000_rbac_enum_types.sql` | Role-based access control enums |
| 2025-09-13 | `20250913005713_create_organization_roles_table.sql` | Organization roles |
| 2025-09-13 | `20250913_enhance_organizations_cultural_identity.sql` | Cultural identity fields |
| 2025-09-16 | `20250916_storyteller_analytics_foundation.sql` | Analytics foundation |
| 2025-09-16 | `20250916_storyteller_dashboard_analytics.sql` | Dashboard analytics |
| 2025-09-16 | `20250916_storyteller_network_discovery.sql` | Network discovery |
| 2025-09-17 | `20250917_enhance_storyteller_profiles.sql` | Enhanced profiles |
| 2025-10-04 | `20251004_fix_missing_fields.sql` | Field fixes |
| 2025-10-05 | `20251005_force_postgrest_refresh.sql` | PostgREST cache refresh |
| 2025-10-05 | `20251005_storyteller_schema_enhancement.sql` | Schema enhancements |
| 2025-10-10 | `20251010_project_analysis_cache.sql` | Analysis caching |
| 2025-10-10 | `20251010_project_analysis_cache_v2.sql` | Cache improvements |
| 2025-10-11 | `20251011_organization_contexts.sql` | Organization contexts |
| 2025-10-11 | `20251011_project_context.sql` | Project context |
| 2025-10-11 | `20251011_project_contexts.sql` | Project contexts |
| 2025-10-11 | `20251011_seed_interview_templates.sql` | Interview templates |
| 2025-10-27 | `20251027_justicehub_integration.sql` | JusticeHub integration |
| 2026-01-01 | `20260101000001_fix_harvested_outcomes_cascade.sql` | Outcomes cascade fix |
| 2026-01-01 | `20260101000001_phase1_remove_archive_tables.sql` | Archive cleanup |
| 2026-01-01 | `20260101000002_audit_triggers.sql` | Audit logging |
| 2026-01-01 | `20260101000003_consent_revocation_cleanup.sql` | Consent cleanup |
| 2026-01-01 | `20260101000004_sync_transcript_consent.sql` | Transcript consent |
| 2026-01-02 | `20260102000001_add_critical_indexes.sql` | Performance indexes |
| 2026-01-02 | `20260102000002_knowledge_base_schema.sql` | Knowledge base (RAG) |
| 2026-01-02 | `20260102000002_remove_unused_tables_phase1.sql` | Table cleanup |
| 2026-01-02 | `20260102120000_syndication_system_schema.sql` | Syndication v1 |
| 2026-01-02 | `20260102120000_syndication_system_schema_clean.sql` | Syndication v2 |
| 2026-01-02 | `20260102120000_syndication_system_schema_fixed.sql` | Syndication v3 (final) |
| 2026-01-02 | `20260102180000_consolidate_theme_tables.sql` | Theme consolidation |
| 2026-01-02 | `20260102190000_remove_old_photo_system.sql` | Photo system cleanup |
| 2026-01-04 | `20260104000001_stories_sprint2_fields.sql` | Sprint 2 story fields |
| 2026-01-04 | `20260104000001_story_share_tracking.sql` | Share tracking |
| 2026-01-04 | `20260104000002_media_assets_sprint2_fields.sql` | Sprint 2 media fields |
| 2026-01-05 | `20260105000000_sprint3_comments_system.sql` | Comments system |
| 2026-01-05 | `20260105000000_sprint5_organization_tools.sql` | Organization tools |
| 2026-01-05 | `20260105120000_sprint4_story_versions.sql` | Version history |
| 2026-01-05 | `20260105120001_sprint4_story_collaborators.sql` | Story collaboration |
| 2026-01-05 | `20260105120002_sprint4_media_enhancements.sql` | Sprint 4 media |
| 2026-01-06 | `20260106000001_transcript_analysis_results.sql` | Analysis results |
| 2026-01-06 | `20260106000002_fix_audit_logs_constraint.sql` | Audit log fix |
| 2026-01-06 | `20260106000003_create_storytellers_table.sql` | Storytellers table |
| 2026-01-06 | `20260106000004_consolidate_storytellers.sql` | Storyteller consolidation |
| 2026-01-06 | `20260106120000_deprecate_old_analysis_tables.sql` | Analysis cleanup |

### Phase 2: Storyteller System (Jan 7-8, 2026) - 7 migrations
**Unified storyteller architecture, foreign key fixes, profile enhancements**

| Date | Migration | Description |
|------|-----------|-------------|
| 2026-01-07 | `20260107000001_fix_stories_storyteller_fk.sql` | Stories FK fix |
| 2026-01-07 | `20260107000002_fix_transcripts_storyteller_fk.sql` | Transcripts FK fix |
| 2026-01-08 | `20260108000001_phase3_theme_system_buildout.sql` | Theme system |
| 2026-01-08 | `20260108000002_add_storyteller_columns.sql` | Storyteller columns |
| 2026-01-08 | `20260108000003_fix_project_storytellers_fk.sql` | Projects FK fix |
| 2026-01-08 | `20260108000004_create_storyteller_system.sql` | Storyteller system |
| 2026-01-08 | `20260108000005_add_storyteller_boolean_columns.sql` | Boolean columns |
| 2026-01-08 | `20260108_video_links.sql` | Video links |

### Phase 3: Theme System (Jan 9, 2026) - 2 migrations
**Content hub, enhanced media tagging**

| Date | Migration | Description |
|------|-----------|-------------|
| 2026-01-09 | `20260109000001_content_hub_schema.sql` | Content hub |
| 2026-01-09 | `20260109000002_enhanced_media_tagging.sql` | Media tagging |

### Phase 4: Content & Email (Jan 10-11, 2026) - 10 migrations
**Article/story unification, super-admin role, email notifications**

| Date | Migration | Description |
|------|-----------|-------------|
| 2026-01-10 | `20260110000001_webflow_blog_migration.sql` | Webflow import |
| 2026-01-10 | `20260110000100_merge_articles_into_stories.sql` | ⭐ Articles → Stories |
| 2026-01-10 | `20260110000101_add_import_tracking_to_stories.sql` | Import tracking |
| 2026-01-10 | `20260110000102_deprecate_articles_table.sql` | Deprecate articles |
| 2026-01-10 | `20260110000103_super_admin_role.sql` | Super-admin v1 |
| 2026-01-10 | `20260110000103_super_admin_role_fixed.sql` | Super-admin v2 |
| 2026-01-10 | `20260110000104_grant_super_admin_to_benjamin.sql` | Grant super-admin |
| 2026-01-11 | `20260111000001_fix_stories_schema.sql` | Stories schema fix |
| 2026-01-11 | `20260111000002_stories_editorial_columns.sql` | Editorial columns |
| 2026-01-11 | `20260111000003_email_notifications.sql` | Email notifications |

---

## Major Schema Changes

### Core Tables Created
- `profiles` - User profiles with multi-tenant support
- `organizations` - Organization/tenant management
- `storytellers` - Unified storyteller system (Phase 2)
- `stories` - Unified content (articles merged in Phase 4)
- `transcripts` - Interview transcripts
- `media_assets` - Media library with metadata
- `projects` - Project management
- `themes` - Cultural themes

### Key Features Added
- **Multi-tenant architecture** (tenant_id on all tables)
- **RBAC** (Role-Based Access Control with organization_roles)
- **Cultural protocols** (OCAP compliance, consent management)
- **Analytics** (storyteller_analytics, project_analysis_cache)
- **Syndication** (dual-layer: Core + Content Hub)
- **Knowledge base** (RAG system with vector embeddings)
- **Email notifications** (preferences, templates, webhooks)
- **Super-admin role** (cross-organization access)

### Tables Deprecated/Removed
- `articles` → Merged into `stories` (Phase 4)
- Old analysis tables → Consolidated (Phase 1)
- Old photo system → Removed (Phase 1)
- Archive tables → Cleanup (Phase 1)

---

## Rollback Procedures

### Safe Rollback (Last Migration Only)

```bash
# 1. Identify last migration
cat supabase/migrations/.index/timeline.json | jq '.last_migration'
# Output: "20260111000003_email_notifications.sql"

# 2. Check if migration has DOWN section
grep -A 20 "-- Down Migration" supabase/migrations/20260111000003_email_notifications.sql

# 3. If DOWN exists, create reverse migration
npx supabase migration new revert_email_notifications

# 4. Copy DOWN section to new migration file

# 5. Apply rollback
npx supabase db push
```

### Full Database Reset (⚠️ DESTRUCTIVE)

```bash
# WARNING: This deletes ALL data!
npx supabase db reset

# Reapplies all migrations from scratch
# Use for development only, never in production
```

### Targeted Rollback (Advanced)

```bash
# If you need to roll back to specific migration:

# 1. Backup production data
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Create reverse migration for each migration to undo
# (Work backwards from latest to target)

# 3. Apply reverse migrations
npx supabase db push

# 4. Verify schema state
psql $DATABASE_URL -c "\dt"
```

**Rule**: Never manually edit applied migrations. Always create new migrations to fix issues.

---

## Creating New Migrations

### Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Examples:
- `20260111120000_add_user_preferences.sql`
- `20260112000001_fix_profile_constraints.sql`
- `20260112180000_enhance_media_metadata.sql`

### Step-by-Step Guide

**1. Generate Migration File**
```bash
npx supabase migration new DESCRIPTION

# Example
npx supabase migration new add_story_reactions
# Creates: supabase/migrations/20260111120000_add_story_reactions.sql
```

**2. Write Migration SQL**

```sql
-- Migration: Add story reactions system
-- Created: 2026-01-11
-- Phase: Content & Email

-- Up Migration
CREATE TABLE IF NOT EXISTS public.story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'insightful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id, reaction_type)
);

CREATE INDEX idx_story_reactions_story ON public.story_reactions(story_id);
CREATE INDEX idx_story_reactions_user ON public.story_reactions(user_id);

-- RLS Policies
ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions"
  ON public.story_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON public.story_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Down Migration (optional but recommended)
-- DROP TABLE IF EXISTS public.story_reactions CASCADE;
```

**3. Test Migration Locally**
```bash
# Apply migration
npx supabase db push

# Verify table created
psql $DATABASE_URL -c "\d story_reactions"

# Test RLS
psql $DATABASE_URL -c "SELECT * FROM story_reactions;"
```

**4. Update Timeline**
```bash
# Regenerate timeline.json
bash /tmp/generate-migration-timeline.sh > supabase/migrations/.index/timeline.json

# Verify new migration added
cat supabase/migrations/.index/timeline.json | jq '.migrations[-1]'
```

**5. Commit to Git**
```bash
git add supabase/migrations/20260111120000_add_story_reactions.sql
git add supabase/migrations/.index/timeline.json
git commit -m "feat(db): add story reactions system"
```

### Migration Best Practices

✅ **DO:**
- Use `IF NOT EXISTS` for idempotency
- Add indexes for foreign keys
- Include RLS policies
- Write DOWN migration for reversibility
- Test on local database first
- Add comments explaining purpose
- Use transactions for multi-step changes

❌ **DON'T:**
- Edit already-applied migrations
- Add breaking changes without migration path
- Forget to handle existing data
- Skip RLS policies on new tables
- Use hardcoded UUIDs (use gen_random_uuid())
- Deploy without testing locally

---

## Search Patterns

### Find Migrations by Table

```bash
# Stories table
grep -l "stories" supabase/migrations/*.sql

# Storytellers table
grep -l "storytellers" supabase/migrations/*.sql

# Media assets
grep -l "media_assets" supabase/migrations/*.sql
```

### Find Migrations by Feature

```bash
# Syndication system
grep -l "syndication" supabase/migrations/*.sql

# Email notifications
grep -l "email" supabase/migrations/*.sql

# Analytics
grep -l "analytics" supabase/migrations/*.sql
```

### Find Migrations by Date Range

```bash
# January 2026
ls supabase/migrations/202601*.sql

# Specific day
ls supabase/migrations/20260111*.sql

# Recent (last 10)
ls -lt supabase/migrations/*.sql | head -10
```

### Find Migrations by Phase

```bash
# Using timeline.json
cat supabase/migrations/.index/timeline.json | jq '.migrations[] | select(.phase == "Phase 4: Content & Email")'
```

---

## Pre-Deployment Checklist

Before deploying migrations to production:

- [ ] Migration tested on local database
- [ ] No syntax errors (`psql -f migration.sql`)
- [ ] RLS policies added for new tables
- [ ] Indexes created for foreign keys
- [ ] Existing data handled (backfill if needed)
- [ ] DOWN migration written (for rollback)
- [ ] Timeline.json updated
- [ ] Git committed with descriptive message
- [ ] Team reviewed (if breaking change)
- [ ] Backup of production database taken

---

## Migration Index

Full chronological list available in [.index/timeline.json](.index/timeline.json)

**Quick Stats:**
- **65 total migrations**
- **Schema version**: 3.2.1
- **Latest**: 20260111000003_email_notifications.sql
- **Development period**: Jan 2025 - Jan 2026

---

## Troubleshooting

### "Migration already applied"

```bash
# Check migration history
psql $DATABASE_URL -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;"

# If duplicate, migration was already run - no action needed
```

### "Constraint violation"

```bash
# Check if tables/columns already exist
psql $DATABASE_URL -c "\d table_name"

# Use IF NOT EXISTS to make migration idempotent
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TEXT;
```

### "RLS policy conflict"

```bash
# Drop old policy first
DROP POLICY IF EXISTS "old_policy_name" ON table_name;

# Then create new one
CREATE POLICY "new_policy_name" ON table_name ...
```

### "PostgREST cache out of sync"

```bash
# Force cache refresh
NOTIFY pgrst, 'reload schema';

# Or use migration:
SELECT pg_notify('pgrst', 'reload schema');
```

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs/guides/database/migrations
- **Database Schema**: [docs/04-database/](../../docs/04-database/)
- **Development Workflow**: [.claude/DEVELOPMENT_WORKFLOW.md](../../.claude/DEVELOPMENT_WORKFLOW.md)
- **Continuous Claude**: Use `/migration-create` skill for guided creation

---

**Last Updated**: January 11, 2026
**Maintained By**: Development Team
**Questions**: Check docs/04-database/ or ask in #engineering
