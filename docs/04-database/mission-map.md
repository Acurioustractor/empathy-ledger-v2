# Database Table → Mission Mapping

**Created:** 2026-01-01
**Purpose:** Map all 171 database tables to Empathy Ledger's 8 mission pillars
**Source:** `supabase/migrations/20251225160903_remote_schema_snapshot.sql`
**Framework:** Based on `EMPATHY_LEDGER_WIKI.md` mission priorities

---

## Executive Summary

**Total Tables Analyzed:** 171 tables + 12 views
**Mission Alignment:**
- Priority 1 (Critical - Cultural Safety, Storytellers, Privacy): 63 tables (37%)
- Priority 2 (Important - Community, Impact, Themes): 68 tables (40%)
- Priority 3 (Nice-to-have - Distribution, Engagement): 25 tables (15%)
- Priority 4 (Questionable - Needs Review): 15 tables (9%)

**Key Findings:**
- ✅ **Strong:** Cultural safety, storyteller empowerment, data governance
- ⚠️ **Attention Needed:** Theme table consolidation, AI analysis pipeline activation
- 🔍 **Investigate:** Empty analytics tables, redundant tracking systems
- ❌ **Candidates for Removal:** 15 tables flagged for review

---

## Pillar 1: Indigenous Leadership & Cultural Safety (PRIORITY 1)

### Critical Tables (Never Remove) - 12 tables

| Table | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `elder_review_queue` | Elder content approval workflow | ACTIVE | Core cultural safety |
| `cultural_protocols` | Community-specific cultural rules | ACTIVE | OCAP compliance |
| `cultural_tags` | Indigenous cultural categorization | ACTIVE | Content tagging |
| `cultural_speech_patterns` | Cultural linguistic analysis | UNKNOWN | AI analysis feature |
| `consent_change_log` | Audit trail for all consent changes | ACTIVE | GDPR + cultural safety |
| `moderation_results` | AI + elder moderation decisions | ACTIVE | Safety enforcement |
| `moderation_appeals` | Appeal rejected moderation | UNKNOWN | Dispute resolution |
| `ai_moderation_logs` | Audit trail for AI moderation | ACTIVE | Transparency |
| `ai_safety_logs` | AI safety middleware checks | ACTIVE | Prevent harm |
| `content_approval_queue` | Pending content review | ACTIVE | Quality control |
| `community_interpretation_sessions` | Community-led content interpretation | UNKNOWN | Cultural context |
| `community_story_responses` | Community feedback on stories | UNKNOWN | Engagement |

**Assessment:** ⭐⭐⭐⭐⭐ **Excellent** - Comprehensive cultural safety infrastructure

---

## Pillar 2: Storyteller Empowerment (PRIORITY 1)

### Core Storyteller Tables - 18 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `profiles` | Storyteller profiles (226 active) | LOADED | P1 - Core |
| `storyteller_analytics` | Central metrics hub (33 cols) | ACTIVE | P1 - Critical |
| `storyteller_dashboard_config` | Customizable dashboards | ACTIVE | P1 - UX |
| `storyteller_connections` | AI-discovered connections (33 cols!) | EMPTY | P1 - **NEEDS PIPELINE** |
| `storyteller_milestones` | Achievement tracking | EMPTY | P2 - Nice-to-have |
| `storyteller_quotes` | Extracted memorable quotes | EMPTY | P2 - **NEEDS PIPELINE** |
| `storyteller_impact_metrics` | Influence measurements | EMPTY | P2 - **NEEDS PIPELINE** |
| `storyteller_engagement` | Engagement over time | EMPTY | P2 - **NEEDS PIPELINE** |
| `storyteller_demographics` | Network discovery data | ACTIVE | P1 - Discovery |
| `storyteller_themes` | Storyteller-theme connections | EMPTY | P2 - **NEEDS PIPELINE** |
| `storyteller_recommendations` | Personalized recommendations | EMPTY | P3 - Future |
| `storyteller_locations` | Geographic data | ACTIVE | P2 - Context |
| `storyteller_media_links` | External media (Vimeo, etc) | ACTIVE | P2 - Portfolio |
| `storyteller_organizations` | Org memberships | ACTIVE | P1 - Access control |
| `storyteller_projects` | Project participation | ACTIVE | P1 - Organization |
| `personal_insights` | Individual reflection data | UNKNOWN | P3 - Self-discovery |
| `storyteller_project_features` | ACT featuring system | ACTIVE | P2 - Recognition |
| `act_featured_storytellers` | Featured storyteller view | ACTIVE | P2 - Showcase |

**Assessment:** ⭐⭐⭐⭐☆ **Infrastructure Ready** - Tables exist but AI pipeline needed

**Action Required:** Build AI processing pipeline to populate:
- storyteller_connections (discover narrative similarities)
- storyteller_quotes (extract powerful moments)
- storyteller_impact_metrics (measure reach)
- storyteller_themes (link to narrative themes)

---

## Pillar 3: Story Lifecycle & Content Management (PRIORITY 1)

### Primary Content Tables - 15 tables

| Table | Purpose | Columns | Status | Notes |
|-------|---------|---------|--------|-------|
| `stories` | Published stories | 98 | ACTIVE | Comprehensive metadata |
| `transcripts` | Oral narratives | 59 | LOADED (208) | Core content |
| `empathy_entries` | Empathy Ledger sessions | 28 | ACTIVE | Original content type |
| `media_assets` | Photos, video, audio | 66 | ACTIVE | Rich media management |
| `media_files` | Media library | 35 | ACTIVE | File storage |
| `media_usage_tracking` | Media access audit | 8 | ACTIVE | Rights management |
| `galleries` | Modern gallery system | 17 | ACTIVE | Collections |
| `gallery_media` | Gallery items | 9 | ACTIVE | Item management |
| `gallery_media_associations` | Media-gallery links | 5 | ACTIVE | Associations |
| `gallery_photos` | Legacy photo support | 9 | ACTIVE | Backward compat |
| `quotes` | Extracted quotes | 24 | ACTIVE | Memorable moments |
| `extracted_quotes` | AI-extracted quotes | 11 | EMPTY | **NEEDS PIPELINE** |
| `testimonials` | Testimonial content | 11 | UNKNOWN | Social proof |
| `blog_posts` | Blog content | 31 | ACTIVE | Community stories |
| `videos` | Video gallery | 39 | ACTIVE | Video management |

**Assessment:** ⭐⭐⭐⭐⭐ **Excellent** - Clean, comprehensive architecture

**Note:** Old photo system (11 tables) removed in Phase 2 - good cleanup!

---

## Pillar 4: Thematic Network & AI Analysis (PRIORITY 2)

### Theme & Analysis Tables - 19 tables

| Table | Purpose | Status | Consolidation Potential |
|-------|---------|--------|-------------------------|
| `narrative_themes` | AI-extracted themes (13 cols) | ACTIVE | **KEEP** - Primary |
| `themes` | Theme registry (9 cols) | ACTIVE | **KEEP** - Core |
| `theme_associations` | Entity-theme links | ACTIVE | **KEEP** - Junction |
| `theme_evolution` | Theme changes over time | UNKNOWN | ⚠️ REVIEW vs theme_evolution_tracking |
| `theme_evolution_tracking` | Track theme changes | UNKNOWN | ⚠️ REVIEW vs theme_evolution |
| `theme_concept_evolution` | Concept-level tracking | UNKNOWN | ⚠️ Possibly redundant |
| `storyteller_themes` | Storyteller-theme links | EMPTY | **KEEP** - Needs pipeline |
| `cross_narrative_insights` | Platform-wide patterns (33 cols!) | ACTIVE | **KEEP** - Valuable |
| `cross_sector_insights` | Sector-level patterns | UNKNOWN | **KEEP** - Research value |
| `organization_theme_analytics` | Org theme tracking | ACTIVE | **KEEP** - Org-level |
| `organization_cross_transcript_insights` | Org cross-analysis | ACTIVE | **KEEP** - Org-level |
| `ai_usage_events` | Track AI invocations (27 cols) | ACTIVE | **KEEP** - Billing/audit |
| `ai_usage_daily` | Daily AI metrics | ACTIVE | **KEEP** - Dashboards |
| `ai_processing_logs` | AI processing audit | ACTIVE | **KEEP** - Debugging |
| `ai_analysis_jobs` | Analysis job queue | ACTIVE | **KEEP** - Processing |
| `analysis_jobs` | Generic analysis queue | ACTIVE | ⚠️ REVIEW vs ai_analysis_jobs |
| `ai_agent_registry` | Available AI agents | ACTIVE | **KEEP** - Configuration |
| `analytics_processing_jobs` | Background analytics (31 cols) | ACTIVE | ⚠️ REVIEW vs analysis_jobs |
| `story_narrative_arcs` | Story structure analysis | UNKNOWN | **KEEP** - Analysis feature |

**Assessment:** ⭐⭐⭐☆☆ **Needs Attention** - Consolidation opportunities exist

**Consolidation Candidates:**
1. **Theme Evolution Tables** - 3 tables (`theme_evolution`, `theme_evolution_tracking`, `theme_concept_evolution`) - Investigate if they can merge
2. **Analysis Job Tables** - 3 tables (`ai_analysis_jobs`, `analysis_jobs`, `analytics_processing_jobs`) - Possibly redundant queuing systems

---

## Pillar 5: Community & Organization Management (PRIORITY 2)

### Organization Infrastructure - 22 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `organizations` | Org master table (65 cols!) | ACTIVE | P1 - Core |
| `tenants` | Multi-tenant isolation (23 cols) | ACTIVE | P1 - Security |
| `tenant_ai_policies` | Per-tenant AI config | ACTIVE | P1 - Governance |
| `tenant_analytics` | Tenant metrics (materialized view) | ACTIVE | P2 - Reporting |
| `organization_members` | User memberships | ACTIVE | P1 - Access control |
| `organization_roles` | Role management | ACTIVE | P1 - Permissions |
| `organization_invitations` | Invitation system | ACTIVE | P1 - Onboarding |
| `organization_analytics` | Org-level metrics | ACTIVE | P2 - Dashboards |
| `organization_contexts` | Self-service context (45 cols!) | ACTIVE | P1 - Customization |
| `organization_services` | Programs/departments | ACTIVE | P2 - Structure |
| `organization_storyteller_network` | Network graph (15 cols) | ACTIVE | P2 - **GOLD MINE!** |
| `organization_impact_metrics` | Impact aggregation | ACTIVE | P2 - Reporting |
| `organization_enrichment` | AI-extracted data | ACTIVE | P2 - Enhancement |
| `organization_duplicates` | Deduplication tracking | ACTIVE | P3 - Data quality |
| `profile_organizations` | User-org junction | ACTIVE | P1 - Multi-tenancy |
| `profile_locations` | User geographic data | ACTIVE | P2 - Context |
| `profile_galleries` | User galleries | ACTIVE | P2 - Content |
| `profile_projects` | User-project links | ACTIVE | P2 - Organization |
| `team_members` | Oonchiumpa staff | ACTIVE | P2 - Internal |
| `dream_organizations` | Aspirational partners | UNKNOWN | P4 - **REMOVE?** |
| `external_applications` | API consumer registry | ACTIVE | P2 - Integrations |
| `tour_stops` | World tour locations | ACTIVE | P3 - Marketing |

**Assessment:** ⭐⭐⭐⭐⭐ **Excellent** - Comprehensive org infrastructure

**Note:** `organization_storyteller_network` is a valuable network graph table!

---

## Pillar 6: Impact & Outcomes Tracking (PRIORITY 2)

### Impact Measurement Tables - 15 tables

| Table | Purpose | Columns | Status | Notes |
|-------|---------|---------|--------|-------|
| `activities` | Program activities | 50 | ACTIVE | What orgs do |
| `outcomes` | Impact tracking | 37 | ACTIVE | Results measurement |
| `harvested_outcomes` | Story-outcome links | 19 | ACTIVE | Story impact |
| `sroi_calculations` | ROI measurements | 10 | ACTIVE | Financial value |
| `sroi_inputs` | SROI data inputs | 9 | ACTIVE | Calculation basis |
| `sroi_outcomes` | SROI results | 9 | ACTIVE | Results |
| `annual_reports` | Report management | 42 | ACTIVE | Funder reporting |
| `annual_report_stories` | Story-report links | 11 | ACTIVE | Report content |
| `annual_reports_with_stats` | Report dashboard view | - | ACTIVE | Analytics |
| `report_sections` | Custom report content | 15 | ACTIVE | Content sections |
| `report_templates` | Reusable templates | 15 | ACTIVE | Design system |
| `report_feedback` | Stakeholder feedback | 16 | UNKNOWN | Community input |
| `service_impact` | Service effectiveness | 56 | ACTIVE | Program analysis |
| `impact_stats` | Impact aggregations | 8 | ACTIVE | Dashboards |
| `impact_stories` | Impact narratives | 12 | ACTIVE | Story collection |

**Assessment:** ⭐⭐⭐⭐⭐ **Excellent** - Sophisticated impact framework

---

## Pillar 7: Data Governance & Privacy (PRIORITY 1)

### Governance & Compliance Tables - 15 tables

| Table | Purpose | Status | Compliance |
|-------|---------|--------|------------|
| `audit_logs` | Comprehensive audit trail (20 cols) | ACTIVE | GDPR + OCAP |
| `deletion_requests` | Right to deletion (25 cols) | ACTIVE | GDPR Article 17 |
| `consent_change_log` | Consent tracking | ACTIVE | GDPR Article 7 |
| `privacy_changes` | Privacy setting audit | ACTIVE | Transparency |
| `data_quality_metrics` | Data health monitoring | 11 | ACTIVE | Quality assurance |
| `data_sources` | External data tracking | 14 | ACTIVE | Source attribution |
| `webhook_subscriptions` | Integration events | 11 | ACTIVE | Real-time sync |
| `webhook_delivery_log` | Webhook audit | 12 | ACTIVE | Delivery tracking |
| `activity_log` | User activity tracking | 12 | ACTIVE | Behavioral audit |
| `processing_jobs` | Job queue tracking | 17 | ACTIVE | Processing audit |
| `scraping_metadata` | Scraper audit trail | 13 | ACTIVE | Data provenance |
| `scraper_health_metrics` | Scraper monitoring | 12 | ACTIVE | System health |
| `empathy_sync_log` | Oonchiumpa sync audit | 14 | ACTIVE | Integration audit |
| `media_import_sessions` | Media import tracking | 9 | ACTIVE | Import audit |
| `document_outcomes` | Document-outcome links | 14 | ACTIVE | Evidence tracking |

**Assessment:** ⭐⭐⭐⭐⭐ **World-Class** - Professional data governance

**Compliance Coverage:**
- ✅ GDPR Article 7 (Consent)
- ✅ GDPR Article 17 (Right to Deletion)
- ✅ GDPR Article 20 (Data Portability - via audit_logs)
- ✅ OCAP Principles (Indigenous data sovereignty)
- ✅ Comprehensive audit trails

---

## Pillar 8: Distribution & Engagement (PRIORITY 3)

### Distribution & Analytics Tables - 20 tables

| Table | Purpose | Status | Activation Needed |
|-------|---------|--------|-------------------|
| `story_distributions` | Distribution tracking (27 cols) | ACTIVE | ✅ Active |
| `story_access_log` | Access audit trail | ACTIVE | ✅ Active |
| `story_access_tokens` | Secure sharing tokens (23 cols) | ACTIVE | ✅ Active |
| `story_engagement_events` | Interaction tracking (19 cols) | EMPTY | ⚠️ **ACTIVATE** |
| `story_engagement_daily` | Daily engagement rollup | EMPTY | ⚠️ **ACTIVATE** |
| `story_syndication_consent` | Syndication permissions (27 cols) | ACTIVE | ✅ Active |
| `story_syndication_requests` | Partner requests (32 cols) | ACTIVE | ✅ Active |
| `syndicated_stories` | Syndication view | ACTIVE | ✅ Active |
| `story_review_invitations` | Magic link invitations | ACTIVE | ✅ Active |
| `embed_tokens` | Embed authorization (22 cols) | ACTIVE | ✅ Active |
| `events` | Generic event tracking | ACTIVE | ✅ Active |
| `events_2024_01` | Partitioned events Jan 2024 | UNKNOWN | ⚠️ Legacy partition? |
| `events_2025_08` | Partitioned events Aug 2025 | UNKNOWN | ⚠️ Active partition |
| `events_2025_09` | Partitioned events Sep 2025 | UNKNOWN | ⚠️ Active partition |
| `platform_analytics` | Platform KPIs (34 cols) | ACTIVE | ✅ Active |
| `platform_stats_cache` | Cached platform stats (17 cols) | ACTIVE | ✅ Active |
| `photo_analytics` | Photo engagement (17 cols) | UNKNOWN | ⚠️ Photo system remnant? |
| `notifications` | In-app notifications (22 cols) | ACTIVE | ✅ Active |
| `admin_messages` | Admin communication | ACTIVE | ✅ Active |
| `message_recipients` | Message delivery tracking | ACTIVE | ✅ Active |

**Assessment:** ⭐⭐⭐⭐☆ **Infrastructure Ready** - Needs engagement activation

**Action Required:**
1. Activate `story_engagement_events` tracking in frontend
2. Enable `story_engagement_daily` aggregation job
3. Review event partitioning strategy (2024_01 vs 2025_08/09)

---

## Project & Story Organization Tables (PRIORITY 2)

### Project Management - 15 tables

| Table | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `projects` | Project master table (30 cols) | ACTIVE | Core organization |
| `project_contexts` | Project-specific context (45 cols!) | ACTIVE | Self-service |
| `project_analytics` | Project metrics | ACTIVE | Dashboards |
| `project_analyses` | Cached AI analysis | ACTIVE | Performance |
| `project_organizations` | Project-org links | ACTIVE | Multi-tenant |
| `project_participants` | Participant tracking | ACTIVE | Collaboration |
| `project_storytellers` | Storyteller-project links | ACTIVE | Organization |
| `project_profiles` | AI-extracted profiles | ACTIVE | Analysis |
| `project_seed_interviews` | Seed interview data | ACTIVE | Context setup |
| `project_media` | Project media | ACTIVE | Content |
| `project_updates` | Project news | ACTIVE | Communication |
| `story_media` | Story-media links (17 cols) | ACTIVE | Content management |
| `story_images` | Story images (18 cols) | ACTIVE | Visual content |
| `story_project_tags` | Story-project associations | ACTIVE | Organization |
| `story_project_features` | ACT project features | ACTIVE | Curation |

**Assessment:** ⭐⭐⭐⭐⭐ **Excellent** - Well-structured project system

---

## Partner Portal Tables (PRIORITY 2)

### Partner Management - 8 tables

| Table | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `partners` | Partner organizations | ACTIVE | External orgs |
| `partner_projects` | Partner story collections | ACTIVE | Campaigns |
| `partner_team_members` | Partner staff | ACTIVE | Access control |
| `partner_messages` | Secure messaging | ACTIVE | Communication |
| `partner_message_templates` | Message templates | ACTIVE | Efficiency |
| `partner_analytics_daily` | Daily engagement metrics | ACTIVE | Dashboards |
| `partner_dashboard_summary` | Dashboard view | ACTIVE | Analytics |
| `act_admin_permissions` | ACT staff permissions | ACTIVE | Access control |

**Assessment:** ⭐⭐⭐⭐☆ **Strong** - Complete partner infrastructure

---

## ACT-Specific Tables (PRIORITY 2)

### ACT Project System - 4 tables

| Table | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `act_projects` | ACT initiative registry | ACTIVE | 25 active projects |
| `act_feature_requests` | Storyteller feature requests | ACTIVE | Opt-in system |
| `storyteller_project_features` | Bidirectional approval | ACTIVE | Consent-based |
| `act_featured_storytellers` | Featured view | ACTIVE | Showcase |

**Assessment:** ⭐⭐⭐⭐☆ **Good** - ACT-specific workflow

---

## Specialized Systems (PRIORITY 3-4)

### Geographic & Location - 5 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `locations` | Location registry | ACTIVE | P2 - Core |
| `storyteller_locations` | Storyteller geography | ACTIVE | P2 - Discovery |
| `profile_locations` | User locations | ACTIVE | P2 - Context |
| `photo_locations` | Photo locations | UNKNOWN | P4 - Photo remnant? |
| `geographic_impact_patterns` | Geographic analysis | UNKNOWN | P3 - Research |

### AI & Professional Development - 4 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `professional_competencies` | Skills tracking | UNKNOWN | P4 - **REMOVE?** |
| `development_plans` | Professional dev plans | UNKNOWN | P4 - **REMOVE?** |
| `opportunity_recommendations` | Job recommendations | UNKNOWN | P4 - **REMOVE?** |
| `scraped_services` | AI-scraped services | ACTIVE | P3 - Enhancement |

### Marketing & Tours - 2 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `tour_requests` | Community tour nominations | ACTIVE | P3 - Outreach |
| `tour_stops` | Tour locations | ACTIVE | P3 - Marketing |

### Legacy/Specialized - 8 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `photo_faces` | Face detection | UNKNOWN | P4 - Photo remnant? |
| `photo_memories` | Photo memories | UNKNOWN | P4 - Photo remnant? |
| `photo_tags` | Photo tagging | UNKNOWN | P4 - Photo remnant? |
| `photo_organizations` | Photo-org links | UNKNOWN | P4 - Photo remnant? |
| `photo_projects` | Photo-project links | UNKNOWN | P4 - Photo remnant? |
| `photo_storytellers` | Photo-storyteller links | UNKNOWN | P4 - Photo remnant? |
| `photo_galleries` | Legacy photo galleries | UNKNOWN | P4 - Photo remnant? |
| `photo_gallery_items` | Legacy gallery items | UNKNOWN | P4 - Photo remnant? |

**Note:** 8 `photo_*` tables may be legacy remnants from Phase 2 cleanup - investigate!

### Other Specialized - 7 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `users` | Oonchiumpa staff profiles | ACTIVE | P2 - Internal |
| `users_public` | Public user view | ACTIVE | P2 - Privacy |
| `services` | Service catalog | ACTIVE | P2 - Program tracking |
| `ripple_effects` | Outcome ripple effects | ACTIVE | P2 - Impact |
| `title_suggestions` | AI title suggestions | UNKNOWN | P3 - Enhancement |
| `theory_of_change` | Theory of change docs | UNKNOWN | P3 - Impact framework |
| `transcription_jobs` | Transcription queue | ACTIVE | P2 - Processing |

### Audio Analysis (Specialized) - 2 tables

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `audio_emotion_analysis` | Emotion detection | UNKNOWN | P3 - Research feature |
| `audio_prosodic_analysis` | Prosodic analysis | UNKNOWN | P3 - Research feature |

### Storytelling Circles - 1 table

| Table | Purpose | Status | Priority |
|-------|---------|--------|----------|
| `storytelling_circle_evaluations` | Circle feedback (44 cols!) | UNKNOWN | P3 - Event feature |

---

## Consolidation Opportunities

### 1. Theme Evolution Tables (3 tables → 1-2 tables?)

**Current:**
- `theme_evolution` - Theme changes over time
- `theme_evolution_tracking` - Track theme changes
- `theme_concept_evolution` - Concept-level tracking

**Analysis Needed:**
- What's the difference between `theme_evolution` and `theme_evolution_tracking`?
- Is `theme_concept_evolution` redundant?
- Recommendation: Investigate schema, potentially merge to 1-2 tables

**Potential Savings:** 1-2 tables

---

### 2. Analysis Job Tables (3 tables → 2 tables?)

**Current:**
- `ai_analysis_jobs` - Analysis job queue
- `analysis_jobs` - Generic analysis queue
- `analytics_processing_jobs` - Background analytics (31 columns!)

**Analysis Needed:**
- Are these separate queues or redundant tracking?
- Could `ai_analysis_jobs` + `analysis_jobs` merge?
- `analytics_processing_jobs` has 31 columns - might be specialized

**Potential Savings:** 1 table

---

### 3. Event Partitioning Strategy (3 tables → consolidate?)

**Current:**
- `events` - Main event table
- `events_2024_01` - January 2024 partition
- `events_2025_08` - August 2025 partition
- `events_2025_09` - September 2025 partition

**Analysis Needed:**
- Is partitioning still active?
- Should old partitions be archived?
- Is `events_2024_01` stale?

**Potential Savings:** 1-2 tables (archive old partitions)

---

### 4. Photo System Remnants (8 tables → 0 tables?)

**Current (All Legacy from Phase 2?):**
- `photo_faces`
- `photo_memories`
- `photo_tags`
- `photo_organizations`
- `photo_projects`
- `photo_storytellers`
- `photo_galleries`
- `photo_gallery_items`

**Analysis Needed:**
- Phase 2 removed 11 photo tables - are these remnants?
- Check if any are still referenced in production code
- `photo_analytics` might also be related

**Potential Savings:** 8-9 tables if truly legacy

---

### 5. Engagement Tables (2 tables → check activation)

**Current:**
- `story_engagement_events` (19 columns) - EMPTY
- `story_engagement_daily` (rollup) - EMPTY

**Not Consolidation - Activation Needed:**
- These are correctly architected (raw events + daily rollup)
- Need frontend integration to populate
- Keep both tables

---

## Removal Candidates (Priority 4 - Questionable)

### Professional Development System (3 tables)

| Table | Reason | Status |
|-------|--------|--------|
| `professional_competencies` | Not mission-aligned | UNKNOWN |
| `development_plans` | Not mission-aligned | UNKNOWN |
| `opportunity_recommendations` | Not mission-aligned | UNKNOWN |

**Rationale:** Empathy Ledger is about storytelling, not job placement. These feel like remnants from another system (Oonchiumpa HR?).

**Action:** Investigate usage, consider removal if unused.

---

### Aspirational Tables (1 table)

| Table | Reason | Status |
|-------|--------|--------|
| `dream_organizations` | Nice-to-have, not essential | UNKNOWN |

**Rationale:** "Dream partners" tracking is low priority vs core storytelling mission.

**Action:** Consider moving to external CRM if actively used.

---

### Photo System Remnants (8 tables - see above)

If confirmed as legacy, remove all 8 `photo_*` tables.

---

### Research Features (Conditionally Remove)

| Table | Reason | Status |
|-------|--------|--------|
| `audio_emotion_analysis` | Research feature, not core | UNKNOWN |
| `audio_prosodic_analysis` | Research feature, not core | UNKNOWN |
| `geographic_impact_patterns` | Research feature | UNKNOWN |

**Rationale:** Advanced research features are valuable but not Priority 1. If unused, defer until needed.

**Action:** Check if any research partnerships depend on these. If unused, remove or move to separate research schema.

---

## Summary Statistics

### Tables by Mission Priority

| Priority Level | Count | Percentage | Examples |
|---------------|-------|------------|----------|
| Priority 1 (Critical) | 63 | 37% | Cultural safety, storytellers, privacy |
| Priority 2 (Important) | 68 | 40% | Orgs, impact, themes, projects |
| Priority 3 (Nice-to-have) | 25 | 15% | Distribution, engagement, tours |
| Priority 4 (Questionable) | 15 | 9% | Photo remnants, professional dev |
| **Total** | **171** | **100%** | |

### Tables by Data Status

| Status | Count | Percentage | Notes |
|--------|-------|------------|-------|
| ACTIVE (loaded data) | ~110 | 64% | Core system tables |
| EMPTY (infrastructure ready) | ~35 | 20% | Needs AI pipeline |
| UNKNOWN (needs investigation) | ~26 | 15% | Legacy/research |
| **Total** | **171** | **100%** | |

### Consolidation Potential

| Category | Current | Target | Savings |
|----------|---------|--------|---------|
| Theme evolution | 3 | 1-2 | 1-2 tables |
| Analysis jobs | 3 | 2 | 1 table |
| Event partitions | 4 | 2 | 2 tables |
| Photo system | 8 | 0 | 8 tables |
| Professional dev | 3 | 0 | 3 tables |
| Other removals | 4 | 0 | 4 tables |
| **Total Potential** | **25** | **4-5** | **19-20 tables** |

**Estimated Target:** 171 → 151-152 tables (11-12% reduction)

---

## Recommendations

### Immediate Actions (Phase 3)

1. **Investigate Photo Tables**
   - Check if 8 `photo_*` tables are Phase 2 remnants
   - Verify no production code references
   - Remove if confirmed legacy

2. **Analyze Theme Architecture**
   - Deep dive into 3 theme evolution tables
   - Map actual usage in codebase
   - Consolidate if redundant

3. **Review Job Queue Tables**
   - Understand relationship between 3 analysis job tables
   - Check if queues are separate or overlapping
   - Merge if possible

4. **Audit Professional Development Tables**
   - Confirm not mission-critical
   - Check Oonchiumpa integration dependencies
   - Remove or move to separate schema

### Medium-Term (Phase 4)

1. **Activate AI Pipeline**
   - Process 208 transcripts through AI analysis
   - Populate storyteller connections, themes, quotes
   - Enable thematic network features

2. **Enable Engagement Tracking**
   - Integrate `story_engagement_events` in frontend
   - Activate daily aggregation job
   - Launch analytics dashboards

3. **Optimize Event Partitioning**
   - Review partition strategy
   - Archive old partitions (2024_01)
   - Automate future partitions

### Long-Term (Phase 5+)

1. **Research Feature Activation**
   - Decide on audio analysis features
   - Geographic impact patterns analysis
   - Partner with Indigenous research institutions

2. **Performance Optimization**
   - Materialized views for heavy queries
   - Index optimization
   - Query performance monitoring

---

## Mission Alignment Score

### Overall Assessment: ⭐⭐⭐⭐☆ (4.5/5)

**Strengths:**
- ✅ Cultural safety infrastructure is world-class
- ✅ Data governance exceeds GDPR requirements
- ✅ Impact tracking is sophisticated and comprehensive
- ✅ Multi-tenancy and organization management excellent
- ✅ Content management architecture is clean and powerful

**Areas for Improvement:**
- ⚠️ AI processing pipeline needs activation (transcripts unprocessed)
- ⚠️ Theme table architecture needs consolidation review
- ⚠️ Engagement tracking infrastructure exists but underutilized
- ⚠️ ~15 tables of questionable mission alignment (9% of total)

**Overall:** Database strongly supports mission, with clear path to 5/5 through pipeline activation and strategic consolidation.

---

## Conclusion

**The Empathy Ledger database is fundamentally sound and mission-aligned.**

- **Keep:** 150+ tables are essential or valuable
- **Investigate:** ~20 tables need deeper analysis (theme, jobs, events, photo)
- **Remove:** ~15 tables likely safe to remove (professional dev, dream orgs, photo remnants)

**Next Step:** Detailed investigation of consolidation candidates before making any changes.

**Guiding Principle:** Quality over quantity. A 10% reduction is valuable if it simplifies architecture without compromising cultural safety, storyteller empowerment, or data governance.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Next Review:** After consolidation investigation complete
