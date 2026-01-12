# Production Schema Analysis - Ground Truth
**Date**: January 11, 2026
**Source**: Production database dump (yvnuayzslukamizrlhwb.supabase.co)
**Purpose**: Document EXACTLY what exists in production

---

## 📊 Production Statistics

| Metric | Count |
|--------|-------|
| **Tables** | 207 |
| **RLS Policies** | 364 |
| **Functions** | 296 |
| **Enum Types** | 11+ |
| **Schema Dump Size** | 892 KB |

---

## 🎯 Key Findings

### ✅ What's Working in Production

1. **Complete indigenous-first RBAC system**
   - organization_role enum with elder authority hierarchy
   - cultural_permission_level for sensitivity
   - organization_roles table with full audit trail

2. **Comprehensive cultural protocols**
   - cultural_protocols table
   - cultural_tags table
   - elder_review_queue system
   - consent and privacy management

3. **Full media system**
   - media_assets, galleries, video_links
   - Media tagging and organization
   - Usage tracking

4. **Analytics infrastructure**
   - storyteller_analytics
   - organization_analytics
   - platform_analytics
   - partner_analytics_daily

5. **AI/Processing pipeline**
   - ai_agent_registry
   - ai_analysis_jobs
   - processing_jobs
   - Transcript analysis system

### ❌ What's Broken in Migration History

1. **Migration files can't recreate production**
   - Error at migration #6: `20250916_storyteller_analytics_foundation.sql`
   - References non-existent `p.tenant_roles` column
   - Multiple migrations have similar issues

2. **Schema drift detected**
   - Backup files (.bak) in migrations directory
   - Some tables created manually in production
   - RLS policies don't match migration files

3. **Naming inconsistencies**
   - Old migrations reference 'member', 'super_admin', etc.
   - Production uses indigenous-first naming: 'community_member', 'elder', etc.

---

## 📋 Production Enum Types

```sql
CREATE TYPE "public"."billing_status" AS ENUM (...)
CREATE TYPE "public"."collaboration_type" AS ENUM (...)
CREATE TYPE "public"."content_type" AS ENUM (...)
CREATE TYPE "public"."cultural_permission_level" AS ENUM (
    'sacred',
    'restricted',
    'community_only',
    'educational',
    'public'
)
CREATE TYPE "public"."organization_role" AS ENUM (
    'elder',
    'cultural_keeper',
    'knowledge_holder',
    'admin',
    'project_leader',
    'storyteller',
    'community_member',
    'guest',
    'cultural_liaison',
    'archivist'
)
CREATE TYPE "public"."organization_status" AS ENUM (...)
CREATE TYPE "public"."organization_tier" AS ENUM (...)
CREATE TYPE "public"."permission_tier" AS ENUM (...)
CREATE TYPE "public"."sharing_policy" AS ENUM (...)
CREATE TYPE "public"."tag_category" AS ENUM (...)
CREATE TYPE "public"."tag_source" AS ENUM (...)
```

---

## 🏗️ Core Table Categories

### User & Organization Management (18 tables)
- organizations
- profiles
- organization_roles
- organization_members
- organization_invitations
- user_privacy_settings
- And more...

### Storytelling Core (25 tables)
- storytellers
- projects
- stories
- transcripts
- story_storytellers
- project_storytellers
- And more...

### Media Management (15 tables)
- media_assets
- galleries
- video_links
- media_items
- media_tags
- And more...

### Cultural Protocols (12 tables)
- cultural_protocols
- cultural_tags
- cultural_speech_patterns
- elder_review_queue
- consent tracking
- And more...

### Analytics & Metrics (20 tables)
- storyteller_analytics
- organization_analytics
- platform_analytics
- engagement_events
- partner_analytics
- And more...

### AI & Processing (15 tables)
- ai_agent_registry
- ai_analysis_jobs
- ai_moderation_logs
- processing_jobs
- embedding tables
- And more...

### Syndication & Publishing (18 tables)
- syndication_consent
- syndication_sites
- syndication_webhooks
- content_hub tables
- Publishing workflow
- And more...

### System & Infrastructure (84+ tables)
- All the above categories plus specialized tables

---

## 🔍 Critical Insights

### 1. Multi-Tenant Architecture is EVERYWHERE
Almost every table has `tenant_id` and `organization_id` columns with proper FK constraints and RLS policies.

### 2. Indigenous-First Design Pattern
- Role hierarchy: elder > cultural_keeper > knowledge_holder > admin
- Cultural permission levels guide content access
- Elder approval workflows for sensitive content

### 3. Comprehensive Audit Trails
- created_at, updated_at timestamps
- created_by, updated_by user tracking
- Full consent and approval history
- Deletion requests tracked (not immediate deletes)

### 4. Advanced Analytics System
- Event-based tracking (story views, media shares, etc.)
- Daily aggregations for partner analytics
- AI-powered theme analysis and extraction
- Storyteller network analysis

### 5. Content Hub Integration
- Dual-layer syndication (core + content hub)
- Webhook-based revocation (5-minute compliance)
- Cross-platform publishing
- Usage tracking per syndication site

---

## ⚠️ The Problem

**Migration files ≠ Production reality**

### Why?
1. Some migrations applied manually
2. Schema evolved directly in Studio
3. Old migrations reference removed columns
4. Backup files polluting migrations directory
5. No baseline - just 65+ incremental migrations

### Impact?
- **Can't start fresh local DB** - Migrations fail
- **Can't onboard new developers** - Setup doesn't work
- **Can't trust migration history** - Unknown state
- **Fear of changes** - Might break production
- **Slow development** - Always fighting drift

---

## ✅ The Solution: BASELINE MIGRATION

### Phase 2 Plan:
1. **Archive all current migrations** → `.archive/pre-baseline-2026-01-11/`
2. **Create single baseline** → From `production_schema_20260111.sql`
3. **Test baseline locally** → Should create identical schema
4. **Update migration index** → Mark baseline as source of truth

### Benefits:
- ✅ Local DB = Production DB (guaranteed)
- ✅ Clean slate for future migrations
- ✅ Fast onboarding (single migration)
- ✅ No more drift anxiety
- ✅ Bulletproof workflow

---

## 📈 Next Steps

1. **Complete Phase 1** - Document production schema ✅ DONE
2. **Execute Phase 2** - Create baseline migration (NEXT)
3. **Execute Phase 3** - Test local setup
4. **Execute Phase 4** - Add safeguards
5. **Execute Phase 5** - Document workflow

---

**Status**: Phase 1 COMPLETE ✅
**Production Schema**: Fully documented in `production_schema_20260111.sql`
**Ready for**: Phase 2 - Baseline Migration Creation

---

**The truth is in the dump. Production is the source of truth. Let's make our migrations reflect that reality.**
