# Database Mission Alignment - Visual Summary

**Quick Reference:** Where do our 171 tables fit in the mission?

---

## Mission Priority Distribution

```
Priority 1 (Critical):     63 tables ████████████████████████░░░░░░░░ 37%
Priority 2 (Important):    68 tables ████████████████████████████░░░░ 40%
Priority 3 (Nice-to-have): 25 tables ███████████░░░░░░░░░░░░░░░░░░░░ 15%
Priority 4 (Questionable): 15 tables ██████░░░░░░░░░░░░░░░░░░░░░░░░░  9%
```

---

## The 8 Mission Pillars

### 🛡️ Pillar 1: Indigenous Leadership & Cultural Safety (P1)
**Tables:** 12 | **Status:** ⭐⭐⭐⭐⭐ Excellent

```
elder_review_queue ────────┐
cultural_protocols         ├─► Cultural Safety Core
consent_change_log         │
moderation_results ────────┘

ai_moderation_logs ────────┐
ai_safety_logs             ├─► Safety Infrastructure
content_approval_queue ────┘
```

**Never Touch:** These tables are sacred. Cultural safety is non-negotiable.

---

### 👤 Pillar 2: Storyteller Empowerment (P1)
**Tables:** 18 | **Status:** ⭐⭐⭐⭐☆ Infrastructure Ready

```
profiles (226 storytellers) ───┐
storyteller_analytics          │
storyteller_dashboard_config   ├─► Core Storyteller System
storyteller_demographics       │
storyteller_locations ─────────┘

storyteller_connections ───┐
storyteller_themes         │
storyteller_quotes         ├─► EMPTY - Needs AI Pipeline ⚠️
storyteller_impact_metrics │
extracted_quotes ──────────┘
```

**Action Required:** Build AI processing pipeline to activate analytics.

---

### 📚 Pillar 3: Story Lifecycle & Content (P1)
**Tables:** 15 | **Status:** ⭐⭐⭐⭐⭐ Excellent

```
stories (98 columns!) ─────┐
transcripts (208 loaded)   │
empathy_entries            ├─► Content Core
media_assets (66 cols!)    │
galleries ─────────────────┘

quotes ────────────────────┐
testimonials               ├─► Supporting Content
blog_posts                 │
videos ────────────────────┘
```

**Win:** Phase 2 removed 11 legacy photo tables - clean architecture!

---

### 🕸️ Pillar 4: Thematic Network & AI (P2)
**Tables:** 19 | **Status:** ⭐⭐⭐☆☆ Needs Attention

```
narrative_themes ──────────┐
themes                     │
theme_associations         ├─► Theme Core (KEEP)
storyteller_themes ────────┘

theme_evolution ───────────┐
theme_evolution_tracking   ├─► CONSOLIDATION CANDIDATE ⚠️
theme_concept_evolution ───┘

ai_usage_events ───────────┐
ai_processing_logs         ├─► AI Infrastructure (KEEP)
ai_analysis_jobs ──────────┘

analysis_jobs ─────────────┐
analytics_processing_jobs  ├─► REVIEW - Redundant? ⚠️
```

**Issues:**
- 3 theme evolution tables might be redundant
- 3 analysis job tables might overlap

---

### 🏢 Pillar 5: Community & Organizations (P2)
**Tables:** 22 | **Status:** ⭐⭐⭐⭐⭐ Excellent

```
organizations (65 cols!) ──┐
tenants                    │
organization_members       ├─► Organization Core
organization_roles         │
organization_contexts ─────┘

organization_storyteller_network (15 cols!) ─► GOLD MINE!
organization_cross_transcript_insights ──────► AI Insights

dream_organizations ──────► REMOVE? ⚠️
```

**Highlight:** `organization_storyteller_network` is a valuable network graph!

---

### 📊 Pillar 6: Impact & Outcomes (P2)
**Tables:** 15 | **Status:** ⭐⭐⭐⭐⭐ Excellent

```
activities (50 cols!) ─────┐
outcomes (37 cols!)        │
harvested_outcomes         ├─► Impact Core
service_impact (56 cols!)  │
sroi_calculations ─────────┘

annual_reports (42 cols!)  ┐
annual_report_stories      ├─► Reporting System
report_sections            │
report_templates ──────────┘
```

**Assessment:** Sophisticated impact measurement framework.

---

### 🔒 Pillar 7: Data Governance & Privacy (P1)
**Tables:** 15 | **Status:** ⭐⭐⭐⭐⭐ World-Class

```
audit_logs (20 cols!) ─────┐
deletion_requests (25 cols)│
consent_change_log         ├─► GDPR Compliance
privacy_changes            │
data_quality_metrics ──────┘

webhook_subscriptions ─────┐
webhook_delivery_log       ├─► Integration Audit
empathy_sync_log ──────────┘

activity_log ──────────────┐
processing_jobs            ├─► Processing Audit
scraping_metadata ─────────┘
```

**Coverage:**
- ✅ GDPR Article 7 (Consent)
- ✅ GDPR Article 17 (Right to Deletion)
- ✅ OCAP Principles
- ✅ Comprehensive audit trails

---

### 🌍 Pillar 8: Distribution & Engagement (P3)
**Tables:** 20 | **Status:** ⭐⭐⭐⭐☆ Infrastructure Ready

```
story_distributions ───────┐
story_access_tokens        │
story_access_log           ├─► Distribution Core (ACTIVE)
story_syndication_consent  │
embed_tokens ──────────────┘

story_engagement_events ───┐
story_engagement_daily     ├─► EMPTY - Needs Activation ⚠️

events ────────────────────┐
events_2024_01             │
events_2025_08             ├─► Partitioning Strategy? ⚠️
events_2025_09 ────────────┘

platform_analytics ────────┐
platform_stats_cache       ├─► Analytics (ACTIVE)
photo_analytics ───────────┘─► Photo Remnant? ⚠️
```

**Action Required:**
1. Activate engagement tracking in frontend
2. Review event partitioning (is 2024_01 stale?)

---

## Supporting Systems

### 📁 Projects (15 tables) - ⭐⭐⭐⭐⭐ Excellent
```
projects → project_contexts (45 cols!) → project_analytics
         → project_storytellers
         → project_media
         → story_project_tags
```

### 🤝 Partners (8 tables) - ⭐⭐⭐⭐☆ Strong
```
partners → partner_projects → partner_analytics_daily
         → partner_team_members
         → partner_messages
```

### 🎯 ACT System (4 tables) - ⭐⭐⭐⭐☆ Good
```
act_projects (25 active) → storyteller_project_features
                         → act_feature_requests
                         → act_featured_storytellers
```

---

## Consolidation Opportunities

### High Priority Investigations

#### 1. Photo System Remnants (8 tables)
```
photo_faces             ┐
photo_memories          │
photo_tags              │
photo_organizations     ├─► All legacy from Phase 2? ⚠️
photo_projects          │
photo_storytellers      │
photo_galleries         │
photo_gallery_items ────┘

photo_analytics ───────────► Also legacy? ⚠️
```

**Potential Savings:** 8-9 tables if confirmed legacy

#### 2. Theme Evolution (3 tables)
```
theme_evolution         ┐
theme_evolution_tracking├─► Can these merge? ⚠️
theme_concept_evolution ┘
```

**Potential Savings:** 1-2 tables

#### 3. Analysis Jobs (3 tables)
```
ai_analysis_jobs        ┐
analysis_jobs           ├─► Separate queues or redundant? ⚠️
analytics_processing_jobs (31 cols!)
```

**Potential Savings:** 1 table

#### 4. Event Partitions (4 tables)
```
events ──────────────────► Main table
events_2024_01 ──────────► Archive this? ⚠️
events_2025_08 ──────────► Active
events_2025_09 ──────────► Active
```

**Potential Savings:** 1-2 tables (archive old)

---

## Removal Candidates

### Professional Development (3 tables) - Not Mission Aligned
```
professional_competencies ┐
development_plans         ├─► Job placement, not storytelling ⚠️
opportunity_recommendations
```

### Aspirational (1 table)
```
dream_organizations ──────► Nice-to-have, not essential ⚠️
```

### Research Features (3 tables) - Conditional
```
audio_emotion_analysis ───┐
audio_prosodic_analysis   ├─► Keep if research active ⚠️
geographic_impact_patterns┘
```

**Total Removal Candidates:** ~15 tables (9% of total)

---

## The Path Forward

### Phase 3: Intelligent Consolidation

**Target:** 171 → 151-152 tables (11-12% reduction)

```
Current Breakdown:
├─ Keep (Priority 1-2): ~136 tables (80%) ✅
├─ Investigate: ~20 tables (12%) 🔍
└─ Remove: ~15 tables (9%) ❌

After Phase 3:
├─ Core System: ~150 tables (88%) ✅
├─ Under Review: ~5 tables (3%) 🔍
└─ Removed: ~16 tables (9%) ❌
```

### Quality Gates

**Before Removing ANY Table:**
1. ✅ Grep codebase for references
2. ✅ Check production queries in Supabase logs
3. ✅ Verify not in TypeScript types
4. ✅ Confirm no webhook/integration dependencies
5. ✅ Archive data to `_archive` table first

**Never Remove:**
- ❌ Cultural safety tables (elder review, protocols, consent)
- ❌ Storyteller core tables (profiles, analytics)
- ❌ Audit logs (governance, compliance)
- ❌ Multi-tenant tables (tenants, RLS)

---

## Success Metrics

### Mission Alignment
```
Cultural Safety:      ⭐⭐⭐⭐⭐ (100%) World-class
Storyteller Empower:  ⭐⭐⭐⭐☆ (80%)  Pipeline needed
Content Management:   ⭐⭐⭐⭐⭐ (100%) Excellent
Thematic Network:     ⭐⭐⭐☆☆ (60%)  Needs consolidation
Community/Orgs:       ⭐⭐⭐⭐⭐ (100%) Excellent
Impact Tracking:      ⭐⭐⭐⭐⭐ (100%) Excellent
Data Governance:      ⭐⭐⭐⭐⭐ (100%) World-class
Distribution:         ⭐⭐⭐⭐☆ (80%)  Activation needed

Overall: ⭐⭐⭐⭐☆ (4.5/5)
```

### Database Health
```
Active Tables:     ~110 (64%) ✅
Empty (Pipeline):   ~35 (20%) ⚠️  Needs AI activation
Unknown (Audit):    ~26 (15%) 🔍  Needs investigation
```

---

## Next Actions

### Immediate (This Week)
1. 🔍 Investigate 8 photo tables - Phase 2 remnants?
2. 🔍 Analyze theme evolution table relationships
3. 🔍 Review analysis job queue architecture

### Short-Term (This Month)
1. ✅ Remove confirmed legacy tables (target: 8-15 tables)
2. ✅ Consolidate theme/job tables (target: 2-3 tables)
3. 📝 Document consolidation decisions

### Medium-Term (Next Quarter)
1. 🚀 Build AI processing pipeline
2. 🚀 Activate engagement tracking
3. 🚀 Enable thematic network features

---

**The Empathy Ledger database is fundamentally sound. Strategic consolidation will strengthen mission alignment without compromising cultural safety or storyteller empowerment.**

---

**See [DATABASE_TABLE_MISSION_MAP.md](DATABASE_TABLE_MISSION_MAP.md) for complete 171-table analysis.**
