# Database Alignment Audit

**Generated:** December 22, 2025
**Updated:** December 22, 2025 (with live Supabase export analysis)
**Purpose:** Compare Supabase SQL schema with TypeScript types and identify gaps

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Supabase Objects (total)** | 165 |
| └─ Application Tables | 153 |
| └─ Views | 7 |
| └─ Partitioned Tables | 3 |
| └─ System Tables | 2 |
| **Migration-defined Tables** | 71 |
| **TypeScript Types** | 35 |
| **Tables Missing from Migrations** | ~80 |
| **Tables Missing Types** | 118 |
| **Truly Orphaned Tables** | 4 |

### Critical Findings

1. **Schema Drift**: ~80 tables exist in Supabase but have NO migration files (created via UI or initial schema)
2. **Spelling Mismatch**: Supabase uses `organizations` (US), TypeScript uses `organisations` (UK)
3. **Missing Migrations**: 2 tables defined in migrations don't exist in Supabase (`seed_interview_templates`, `tenant_members`)
4. **Type Gap**: 118 tables lack TypeScript type definitions

---

## Schema Drift Analysis

### Tables in Supabase BUT NOT in Migrations (~80)

These tables were likely created via Supabase UI or an initial schema before migrations were set up:

**Core Tables (Critical - Need Migration Files):**
| Table | Columns | Usage |
|-------|---------|-------|
| `profiles` | 48 | Core user accounts |
| `stories` | 40+ | Core storytelling content |
| `projects` | 15+ | Story collections |
| `organizations` | 28 | Community groups |
| `galleries` | 10+ | Photo galleries |
| `events` | 20+ | Event tracking |
| `locations` | 15+ | Geographic data |
| `extracted_quotes` | 12+ | AI-extracted quotes |
| `cultural_protocols` | 15+ | Cultural guidelines |
| `cultural_tags` | 8+ | Cultural metadata |
| `development_plans` | 18+ | User development plans |

**Annual Reports System:**
- `annual_reports`
- `annual_report_stories`
- `report_feedback`
- `report_sections`
- `report_templates`

**Activities & Outcomes:**
- `activities` (52 columns!)
- `outcomes` (38 columns)
- `document_outcomes`
- `services`
- `service_impact`

**Photo System:**
- `photo_analytics`
- `photo_faces`
- `photo_galleries`
- `photo_gallery_items`
- `photo_locations`
- `photo_memories`
- `photo_organizations`
- `photo_projects`
- `photo_storytellers`
- `photo_tags`

**Legacy/Sync Tables:**
- `empathy_entries`
- `empathy_sync_log`
- `syndicated_stories`

**Scraper System:**
- `scraped_services`
- `scraper_health_metrics`
- `scraping_metadata`

**Other:**
- `ai_processing_logs`
- `analysis_jobs`
- `blog_posts`
- `content_approval_queue`
- `content_cache`
- `data_quality_metrics`
- `data_sources`
- `gallery_media`
- `gallery_media_associations`
- `impact_stories`
- `media_files`
- `opportunity_recommendations`
- `organization_duplicates`
- `organization_enrichment`
- `organization_services`
- `partners`
- `personal_insights`
- `privacy_changes`
- `processing_jobs`
- `professional_competencies`
- `profile_galleries`
- `project_media`
- `project_organizations`
- `project_storytellers`
- `project_updates`
- `quotes`
- `story_images`
- `story_media`
- `storyteller_locations`
- `storyteller_media_links`
- `storyteller_organizations`
- `storyteller_projects`
- `team_members`
- `testimonials`
- `theme_associations`
- `themes`
- `users`
- `users_public`
- `videos`

### Tables in Migrations BUT NOT in Supabase (2)

These migrations may have failed or tables were dropped:

1. `seed_interview_templates` - Migration: 20251011030000
2. `tenant_members` - Migration: Multi-org tenants

### Views in Supabase (7)

| View | Purpose |
|------|---------|
| `annual_reports_with_stats` | Report aggregates |
| `elder_review_dashboard` | Elder moderation view |
| `impact_stats` | Impact metrics |
| `organization_overview` | Org summary |
| `partner_dashboard_summary` | Partner analytics |
| `v_agent_usage_stats` | AI usage stats |
| `v_tenant_ai_usage_summary` | Tenant AI summary |

### Partitioned Tables (3)

- `events_2024_01`
- `events_2025_08`
- `events_2025_09`

---

## Spelling Inconsistency Alert ⚠️

| Source | Spelling |
|--------|----------|
| Supabase DB | `organizations` (US) |
| TypeScript Types | `organisations` (UK) |
| Migrations | Mixed |

**Impact**: Queries may fail if code uses wrong spelling. Standardize to match Supabase.

---

## Table Status by Category

### Legend
- ✅ Has TypeScript types
- ⚠️ Used in code but NO types
- ❌ Orphaned (no code usage)

---

## 1. Identity & Access

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `profiles` | ✅ | ✅ | Heavy |
| `tenants` | ✅ | ✅ | Heavy |
| `organisations` | ✅ | ✅ | Heavy |
| `organization_members` | ✅ | ✅ | Heavy |
| `tenant_members` | ✅ | ✅ | Medium |
| `organization_roles` | ✅ | ⚠️ | Medium |
| `organization_invitations` | ✅ | ⚠️ | Light |
| `profile_organizations` | ✅ | ✅ | Medium |
| `profile_locations` | ✅ | ✅ | Light |
| `profile_projects` | ✅ | ✅ | Light |
| `user_sessions` | ✅ | ✅ | Light |
| `user_reports` | ✅ | ✅ | Light |

---

## 2. Projects & Context

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `projects` | ✅ | ✅ | Heavy |
| `project_participants` | ✅ | ✅ | Medium |
| `project_contexts` | ✅ | ⚠️ | Heavy (11 usages) |
| `organization_contexts` | ✅ | ⚠️ | Heavy (10 usages) |
| `project_profiles` | ✅ | ⚠️ | Medium |
| `project_seed_interviews` | ✅ | ⚠️ | Medium |
| `project_analyses` | ✅ | ⚠️ | Light |
| `seed_interview_templates` | ✅ | ⚠️ | Light |
| `development_plans` | ✅ | ✅ | Light |

---

## 3. Stories & Content

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `stories` | ✅ | ✅ | Heavy |
| `transcripts` | ✅ | ✅ | Heavy |
| `media_assets` | ✅ | ✅ | Heavy |
| `media_usage_tracking` | ✅ | ✅ | Medium |
| `extracted_quotes` | ✅ | ✅ | Medium |
| `transcription_jobs` | ✅ | ⚠️ | Medium |
| `media_import_sessions` | ✅ | ⚠️ | Light |
| `title_suggestions` | ✅ | ⚠️ | Light |
| `galleries` | ✅ | ✅ | Light |
| `gallery_photos` | ✅ | ✅ | Light |

---

## 4. Distribution & Consent

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `story_distributions` | ✅ | ✅ | Heavy |
| `embed_tokens` | ✅ | ✅ | Heavy |
| `story_syndication_consent` | ✅ | ⚠️ | Heavy (19 usages) |
| `external_applications` | ✅ | ⚠️ | Heavy |
| `story_access_log` | ✅ | ⚠️ | Medium |
| `webhook_subscriptions` | ✅ | ⚠️ | Heavy (11 usages) |
| `webhook_delivery_log` | ✅ | ⚠️ | Medium |
| `consent_change_log` | ✅ | ⚠️ | Medium |
| `consent_proofs` | ✅ | ⚠️ | Medium |
| `story_review_invitations` | ✅ | ⚠️ | Light |

---

## 5. Partner Portal

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `partner_projects` | ✅ | ⚠️ | Medium |
| `story_syndication_requests` | ✅ | ⚠️ | Light |
| `partner_messages` | ✅ | ⚠️ | Light |
| `partner_team_members` | ✅ | ⚠️ | Light |
| `partner_analytics_daily` | ✅ | ⚠️ | Light |
| `partner_message_templates` | ✅ | ⚠️ | Light |

---

## 6. Analytics & Storyteller Insights

| Table | SQL | TypeScript | Usage | Notes |
|-------|-----|------------|-------|-------|
| `storyteller_analytics` | ✅ | ⚠️ | Medium | Used in analytics |
| `narrative_themes` | ✅ | ⚠️ | Heavy | 7+ usages |
| `storyteller_themes` | ✅ | ⚠️ | Medium | |
| `storyteller_quotes` | ✅ | ⚠️ | Medium | |
| `storyteller_connections` | ✅ | ⚠️ | Light | Partially implemented |
| `storyteller_demographics` | ✅ | ⚠️ | Light | |
| `storyteller_recommendations` | ✅ | ❌ | None | **ORPHANED** |
| `cross_narrative_insights` | ✅ | ❌ | None | **ORPHANED** |
| `analytics_processing_jobs` | ✅ | ❌ | None | **ORPHANED** |
| `storyteller_dashboard_config` | ✅ | ⚠️ | Light | RLS only |
| `storyteller_milestones` | ✅ | ⚠️ | Light | |
| `storyteller_engagement` | ✅ | ⚠️ | Light | |
| `platform_analytics` | ✅ | ⚠️ | Light | |
| `storyteller_impact_metrics` | ✅ | ⚠️ | Light | |
| `cross_sector_insights` | ✅ | ⚠️ | Light | |
| `geographic_impact_patterns` | ✅ | ❌ | None | **ORPHANED** |
| `theme_evolution_tracking` | ✅ | ⚠️ | Light | |

---

## 7. Engagement Tracking

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `story_engagement_events` | ✅ | ⚠️ | Heavy (7 usages) |
| `story_engagement_daily` | ✅ | ⚠️ | Medium |

---

## 8. AI & Safety

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `ai_usage_events` | ✅ | ⚠️ | Heavy |
| `tenant_ai_policies` | ✅ | ⚠️ | Medium |
| `ai_agent_registry` | ✅ | ⚠️ | Light |
| `ai_usage_daily` | ✅ | ⚠️ | Light |
| `elder_review_queue` | ✅ | ⚠️ | Heavy (6 usages) |
| `moderation_results` | ✅ | ⚠️ | Medium |
| `moderation_appeals` | ✅ | ⚠️ | Medium |
| `ai_moderation_logs` | ✅ | ⚠️ | Medium |
| `ai_safety_logs` | ✅ | ⚠️ | Medium |

---

## 9. Admin & System

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `audit_logs` | ✅ | ✅ | Heavy |
| `deletion_requests` | ✅ | ✅ | Medium |
| `activity_log` | ✅ | ⚠️ | Light |
| `notifications` | ✅ | ⚠️ | Heavy (12 usages) |
| `admin_messages` | ✅ | ⚠️ | Medium |
| `message_recipients` | ✅ | ⚠️ | Light |
| `ai_analysis_jobs` | ✅ | ⚠️ | Light |
| `platform_stats_cache` | ✅ | ⚠️ | Light |

---

## 10. World Tour & Community

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `tour_requests` | ✅ | ⚠️ | Medium |
| `tour_stops` | ✅ | ⚠️ | Light |
| `dream_organizations` | ✅ | ⚠️ | Light |
| `locations` | ✅ | ✅ | Medium |
| `events` | ✅ | ✅ | Light |

---

## 11. Cultural & Indigenous Impact

| Table | SQL | TypeScript | Usage |
|-------|-----|------------|-------|
| `cultural_protocols` | ✅ | ✅ | Medium |
| `cultural_tags` | ✅ | ✅ | Light |
| `community_impact_insights` | ✅ | ✅ | Medium |
| `community_impact_metrics` | ✅ | ✅ | Light |
| `live_community_narratives` | ✅ | ✅ | Light |

---

## Truly Orphaned Tables (Safe to Remove)

These tables exist in SQL but have **zero code usage**:

1. **`storyteller_recommendations`**
   - Migration: 20250916020000_storyteller_network_discovery.sql
   - Purpose: AI-generated recommendations for storytellers
   - Recommendation: Keep for future implementation or remove

2. **`cross_narrative_insights`**
   - Migration: 20250916020000_storyteller_network_discovery.sql
   - Purpose: Cross-storyteller narrative analysis
   - Recommendation: Keep for future or remove

3. **`analytics_processing_jobs`**
   - Migration: 20250916030000_storyteller_analytics_foundation.sql
   - Purpose: Background analytics job tracking
   - Recommendation: Keep for future or remove

4. **`geographic_impact_patterns`**
   - Migration: 20250917_enhance_storyteller_profiles.sql
   - Purpose: Geographic pattern analysis
   - Recommendation: Keep for future or remove

---

## Priority Type Additions

### HIGH Priority (heavily used, no types)

These tables are used frequently but lack TypeScript types:

1. **`story_syndication_consent`** (19 usages)
2. **`notifications`** (12 usages)
3. **`webhook_subscriptions`** (11 usages)
4. **`project_contexts`** (11 usages)
5. **`organization_contexts`** (10 usages)
6. **`narrative_themes`** (7+ usages)
7. **`story_engagement_events`** (7 usages)
8. **`elder_review_queue`** (6 usages)
9. **`external_applications`** (frequent partner portal use)
10. **`ai_usage_events`** (AI cost tracking)

### MEDIUM Priority

These are used but less frequently:

- `consent_change_log`
- `webhook_delivery_log`
- `story_access_log`
- `moderation_results`
- `ai_moderation_logs`
- `storyteller_analytics`
- `storyteller_quotes`
- `tour_requests`
- `partner_projects`

### LOW Priority

Infrequently used or experimental:

- `storyteller_milestones`
- `storyteller_demographics`
- `partner_message_templates`
- `ai_agent_registry`
- `platform_stats_cache`

---

## Recommendations

### 1. CRITICAL: Create Migration Files for Core Tables

The following tables exist in Supabase but have no migration files. This means:
- Schema can't be recreated from migrations
- No version control for schema changes
- Risk of drift between environments

**Priority 1 - Core Tables:**
```bash
# Generate migration from existing schema
npx supabase db diff --schema public > supabase/migrations/YYYYMMDD_core_tables.sql
```

Tables to capture: `profiles`, `stories`, `projects`, `organizations`, `galleries`, `events`, `locations`, `extracted_quotes`, `cultural_protocols`, `cultural_tags`

### 2. Fix Spelling Inconsistency

Standardize on `organizations` (US spelling to match Supabase):

```bash
# Find all UK spelling usages
grep -r "organisations" src/ --include="*.ts" --include="*.tsx"
```

Update TypeScript types and code to use `organizations`.

### 3. Generate Types from Live Schema

```bash
# Generate types from actual Supabase schema
npx supabase gen types typescript --local > src/types/database/generated.ts
```

This will create types for all 153 tables and ensure they match the real schema.

### 4. Investigate Failed Migrations

Two tables in migrations don't exist in Supabase:
- `seed_interview_templates`
- `tenant_members`

Check if migrations were applied: `SELECT * FROM supabase_migrations.schema_migrations`

### 5. Clean Up Orphaned Tables

The 4 truly orphaned tables (no code usage):
- `storyteller_recommendations`
- `cross_narrative_insights`
- `analytics_processing_jobs`
- `geographic_impact_patterns`

Decision: Keep for future or create DROP migration.

### 6. Evaluate Legacy Tables

Consider archiving or removing unused systems:
- **Scraper system**: `scraped_services`, `scraper_health_metrics`, `scraping_metadata`
- **Legacy sync**: `empathy_entries`, `empathy_sync_log`
- **Photo system**: 10 `photo_*` tables - are they used?

---

## Quick Reference: Files Needing Updates

| Domain | Type File | Tables to Add |
|--------|-----------|---------------|
| Core | `user-profile.ts` | Align with Supabase `profiles` (48 columns) |
| Core | `organization-tenant.ts` | Align with `organizations` (28 columns) |
| Content | `content-media.ts` | Add `activities`, `outcomes` |
| Distribution | `story-ownership.ts` | story_syndication_consent, webhook_subscriptions |
| Analytics | (new file) | narrative_themes, storyteller_analytics, story_engagement_events |
| AI/Safety | (new file) | ai_usage_events, elder_review_queue, ai_moderation_logs |
| Reports | (new file) | annual_reports, report_sections, report_templates |

---

## Next Steps

1. **Immediate**: Run `npx supabase gen types typescript` to generate accurate types
2. **This Week**: Create migration files for core tables from live schema
3. **This Week**: Standardize `organizations` spelling across codebase
4. **This Month**: Add types for high-priority tables (19 usages+)
5. **Backlog**: Evaluate and clean up legacy/orphaned tables

---

*This audit was generated by comparing:*
*1. Live Supabase export (165 objects)*
*2. SQL migrations (71 tables)*
*3. TypeScript type definitions (35 types)*
*4. Code usage patterns*
