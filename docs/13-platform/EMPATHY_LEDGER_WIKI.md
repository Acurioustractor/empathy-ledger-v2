# Empathy Ledger - Mission & Strategic Wiki

**Created:** 2026-01-02
**Status:** Living Document
**Purpose:** Align all technical decisions with platform mission and partnership values
**Messaging Review:** ACT Voice v1.0 (96/100 quality)

---

## 🎯 Core Mission

**Empathy Ledger partners with storytellers and communities to preserve narratives, protect cultural knowledge, and share wisdom on their terms:**

1. **Reclaim narrative sovereignty** - Communities own and control their data
2. **Share with dignity** - Cultural protocols and consent at every step
3. **Build connections** - Discover thematic links across stories and storytellers
4. **Demonstrate impact** - Track real-world outcomes and community value
5. **Preserve knowledge** - Multi-generational storytelling and archival

**Tagline:** "Storytelling platform where communities reclaim narrative sovereignty and share culture on their terms"

**Partnership Principles:**
- We partner with communities, not "empower" them
- Storytellers lead; we support
- Universal platform with Indigenous expertise guiding design
- Cultural safety is foundational, not auxiliary
- Control remains with storytellers always

---

## 🌟 Strategic Pillars

### 1. Community-Led Governance & Cultural Protocols (Foundational Pillar)

**What This Means:**
- **Elder authority** - Elders have highest review and approval power for Indigenous communities
- **Cultural protocols** - Content approval workflows adapted for specific community needs
- **OCAP principles** - Ownership, Control, Access, Possession guide all data relationships
- **Consent-first** - Explicit consent for every use of content (all communities)
- **Multi-tenant isolation** - Each community's data is completely separate with enhanced cultural safety for Indigenous tenants

**Database Support:**
- ✅ `elder_review_queue` - Elders approve culturally sensitive content
- ✅ `cultural_protocols` - Community-specific protocols (Indigenous-designed, universally applicable)
- ✅ `consent_change_log` - Track all consent modifications (GDPR Article 7)
- ✅ `tenants` - Multi-tenant data isolation for all communities
- ✅ RLS policies - Row-level security on all tables
- ✅ `profile_organizations` - Role-based access (elder, admin, member)
- ✅ `audit_logs` - Comprehensive audit trail for GDPR compliance

**Current Status:** **STRONG** - Comprehensive cultural safety infrastructure

**Messaging:** "Elder authority framework designed for Indigenous communities, respecting cultural protocols and community sovereignty. Multi-tenant architecture ensures complete data isolation for all communities, with enhanced cultural safety protocols for Indigenous tenants."

---

### 2. Storyteller Empowerment & Agency (Foundational Pillar)

**What This Means:**
- **Storytellers control their narrative** - Edit, delete, share on their terms
- **Dashboard analytics** - See impact of their stories
- **Network discovery** - Find connections with other storytellers
- **Recognition** - Milestones, quotes, featured storyteller highlights
- **Ownership** - Stories belong to storytellers, not the platform

**Database Support:**
- ✅ `profiles` (is_storyteller flag) - 232 storytellers
- ✅ `storyteller_analytics` - Central metrics hub
- ✅ `storyteller_dashboard_config` - Customizable dashboards
- ✅ `storyteller_connections` - AI-discovered connections (33 columns!)
- ✅ `storyteller_milestones` - Achievement tracking
- ✅ `storyteller_quotes` - Extracted memorable quotes
- ✅ `storyteller_impact_metrics` - Influence measurements
- ⚠️ **ISSUE:** Many storyteller tables are EMPTY (needs AI processing pipeline)

**Current Status:** **INFRASTRUCTURE READY** - Tables exist but need data pipeline

**Messaging:** "Storytellers lead their narratives. We provide tools; they decide what gets shared, when, and with whom."

---

### 3. Story Lifecycle & Content Management (Foundational Pillar)

**What This Means:**
- **Multiple content types** - Stories, transcripts, media, testimonials
- **Flexible workflows** - Draft → Review → Publish → Archive
- **Rich metadata** - Themes, tags, cultural context, locations
- **Media integration** - Photos, audio, video linked to stories
- **Versioning** - Track story evolution over time

**Database Support:**
- ✅ `stories` (98 columns!) - Comprehensive story metadata
- ✅ `transcripts` (59 columns, 208 records) - Oral narratives
- ✅ `media_assets` (66 columns!) - Comprehensive media management
- ✅ `galleries` - Modern gallery system
- ✅ `quotes` - Extracted memorable moments
- ✅ `empathy_entries` - Core Empathy Ledger entries (28 columns)
- ✅ Consent tracking integrated at story level
- ❌ **REMOVED:** Old photo system (11 legacy tables) - **Phase 2 cleanup complete!**

**Current Status:** **EXCELLENT** - Clean, comprehensive content architecture

**Messaging:** "Content management designed with Indigenous communities as primary users, extensible to all."

---

### 4. Thematic Network & AI Analysis (Supporting Pillar)

**What This Means:**
- **Theme discovery** - AI extracts themes from transcripts (with consent)
- **Story connections** - Find stories with shared themes
- **Network visualization** - See storyteller-story-theme connections
- **Cultural themes** - Tag stories with culturally-specific concepts
- **Cross-narrative insights** - Platform-wide pattern recognition

**AI Principles:**
- Local processing (Ollama - llama3.1:8b) - Never sent to external companies
- Consent-gated - Only processes stories with explicit permission
- Storyteller control - AI suggests; storytellers decide what gets shared
- Cultural protocols honored - Respects elder review and community protocols
- Transparent - How AI works is clearly explained

**Database Support:**
- ✅ `narrative_themes` (13 columns) - AI-extracted themes
- ✅ `themes` - Theme registry (9 columns)
- ✅ `theme_associations` - Links themes to entities (stories, transcripts)
- ✅ `storyteller_themes` - Storyteller-theme connections
- ✅ `cross_narrative_insights` (33 columns!) - Platform-wide insights
- ✅ `ai_usage_events` (27 columns) - Track all AI invocations
- ✅ `ai_processing_logs` - Analysis audit trail
- ✅ `ai_agent_registry` - Registry of AI agents (21 columns)
- ✅ `tenant_ai_policies` - Community-specific AI governance (23 columns)
- ⚠️ **ISSUE:** Theme evolution tables exist but may be redundant (needs analysis)

**Current Status:** **NEEDS ATTENTION** - Infrastructure exists but consolidation deferred

**Messaging:** "AI discovers connections—storytellers decide what gets shared. Designed with Indigenous communities, for justice across all."

---

### 5. Community & Organization Management (Supporting Pillar)

**What This Means:**
- **Multi-organization support** - Partners, Indigenous nations, NGOs
- **Project-based storytelling** - Stories organized by initiatives
- **Partner portal** - Partners track their impact (no access to stories without consent)
- **Team collaboration** - Multiple users per organization
- **Cross-organization insights** - Share learnings (with explicit consent)

**Database Support:**
- ✅ `organizations` (65 columns!) - Rich org metadata
- ✅ `projects` - Story collection by initiative
- ✅ `partners` - External organizations
- ✅ `profile_organizations` - Role-based membership
- ✅ `organization_roles` - Fine-grained permissions
- ✅ `organization_analytics` - Org-level metrics
- ✅ `organization_storyteller_network` (15 columns) - **NETWORK GRAPH DATA!**
- ✅ `organization_cross_transcript_insights` - AI insights at org level

**Current Status:** **STRONG** - Comprehensive org infrastructure

**Messaging:** "Collaborative ecosystems with Indigenous partners, scalable to all."

---

### 6. Impact & Outcomes Tracking (Supporting Pillar)

**What This Means:**
- **Social Return on Investment (SROI)** - Measure community value
- **Harvested outcomes** - Real-world impact from stories
- **Activity tracking** - Document what organizations do
- **Annual reports** - Showcase impact to funders
- **Service impact** - Link services to outcomes

**Database Support:**
- ✅ `activities` (50 columns!) - What organizations do
- ✅ `outcomes` (37 columns!) - Impact tracking
- ✅ `harvested_outcomes` (19 columns) - Story-to-outcome links
- ✅ `sroi_calculations` - ROI measurements
- ✅ `annual_reports` (42 columns!) - Comprehensive reporting
- ✅ `service_impact` (56 columns!) - Service effectiveness

**Current Status:** **EXCELLENT** - Sophisticated impact framework

**Messaging:** "Economic models tested in Indigenous contexts, applicable to all communities."

---

### 7. Data Sovereignty & Privacy (Foundational Pillar)

**What This Means:**
- **Indigenous data sovereignty** - Non-negotiable for Indigenous communities
- **GDPR compliance** - Right to deletion, data portability (all users)
- **Consent management** - Track all consent changes
- **Audit trails** - Log all data access and modifications
- **Privacy controls** - Story-level visibility settings
- **Data quality** - Monitor data health

**Database Support:**
- ✅ `audit_logs` (20 columns) - Comprehensive audit trail (GDPR Article 30)
- ✅ `deletion_requests` (25 columns) - GDPR right to deletion (Article 17)
- ✅ `consent_change_log` - Track consent modifications (Article 7)
- ✅ `privacy_changes` - Log privacy setting updates
- ✅ `data_quality_metrics` - Monitor data health
- ✅ `webhook_subscriptions` - Integration events
- ✅ `webhook_delivery_log` - Webhook audit trail
- ✅ AI consent tracking - `ai_processing_consent` field on profiles and transcripts

**Current Status:** **WORLD-CLASS** - Professional data governance

**Messaging:** "Data ownership for all, Indigenous sovereignty non-negotiable."

---

### 8. Distribution & Engagement (Supporting Pillar)

**What This Means:**
- **Story sharing** - Share to social media, embed on websites (with consent)
- **Access controls** - Token-based secure access
- **Engagement tracking** - Views, shares, comments
- **Syndication** - Stories on multiple platforms (explicit consent required)
- **Analytics** - Understand story reach and impact

**Database Support:**
- ✅ `story_distributions` (27 columns) - Track sharing
- ✅ `embed_tokens` (22 columns) - Secure embeds
- ✅ `story_access_log` - Track who views what
- ✅ `story_engagement_events` (19 columns) - Interaction tracking
- ✅ `story_syndication_consent` - Permission management
- ❌ **ISSUE:** Many engagement tables may be empty (needs activation)

**Current Status:** **INFRASTRUCTURE READY** - Needs activation

**Messaging:** "Storytellers control distribution. Platform provides tools; communities decide reach."

---

## 📊 Database Health Assessment

### Current State (Post-Phase 2 + Consent Campaign)
- **Total Tables:** ~160 (reduced from 174, down 11 legacy photo tables)
- **Total Columns:** 3,000+ across all tables
- **Data Volume:**
  - 208 transcripts (LOADED)
  - 232 storytellers (LOADED)
  - 210 storytellers WITH AI consent (90.5%)
  - 22 storytellers WITHOUT AI consent (9.5%)
  - 0 stories currently (stories ≠ transcripts)
  - Minimal AI analysis data (needs processing pipeline)

### Alignment with Mission

| Mission Priority | Database Support | Status | Action Needed |
|-----------------|------------------|--------|---------------|
| Community-Led Governance | ⭐⭐⭐⭐⭐ Excellent | ✅ Ready | Monitor cultural protocols |
| Storyteller Empowerment | ⭐⭐⭐⭐☆ Very Good | ⚠️ Pipeline needed | Build AI analysis jobs (#130) |
| Content Management | ⭐⭐⭐⭐⭐ Excellent | ✅ Ready | Continue using |
| Thematic Network | ⭐⭐⭐☆☆ Good | ⚠️ Needs work | Consolidate theme tables |
| Community/Orgs | ⭐⭐⭐⭐⭐ Excellent | ✅ Ready | Continue using |
| Impact Tracking | ⭐⭐⭐⭐⭐ Excellent | ✅ Ready | Continue using |
| Data Sovereignty | ⭐⭐⭐⭐⭐ World-class | ✅ Ready | Continue using |
| Distribution | ⭐⭐⭐⭐☆ Very Good | ⚠️ Activation needed | Enable engagement tracking (#136) |

---

## 🎯 Strategic Focus Areas

### What's Working (Keep & Enhance)

1. **Cultural Safety Infrastructure** - Elder review, protocols, consent
2. **Impact Tracking** - SROI, outcomes, annual reports
3. **Data Governance** - Audit logs, GDPR compliance, consent management
4. **Content Management** - Stories, transcripts, media
5. **Multi-tenancy** - Organization isolation, role-based access
6. **Partnership Messaging** - ACT Voice 96/100 quality rating

### What Needs Attention (Priority for Sprint 1)

1. **AI Analysis Pipeline** (#130)
   - **Issue:** 208 transcripts exist but ZERO have AI analysis
   - **Impact:** Thematic network is empty, storyteller connections missing
   - **Action:** Build processing pipeline (Inngest jobs or triggers)
   - **Consent:** 210/232 storytellers (90.5%) have granted consent

2. **Storyteller Connection Discovery** (#131)
   - **Issue:** `storyteller_connections` table is empty
   - **Impact:** No network visualization data
   - **Action:** Run connection discovery algorithm on consented transcripts

3. **Theme Association Network** (#132, #133)
   - **Issue:** Theme tables exist but relationships unclear
   - **Impact:** Network visualization missing theme nodes
   - **Action:** Populate `storyteller_themes` and theme associations

4. **Engagement Activation** (#136)
   - **Issue:** Story distribution/engagement tables may be underutilized
   - **Impact:** Missing insights on story reach and impact
   - **Action:** Activate engagement tracking in frontend

---

## 🚀 Optimization Strategy

### Phase 3: Intelligent Consolidation (Future)

**Goal:** Simplify database while strengthening mission alignment

**Approach:**
1. **Map all tables to mission pillars** - Which tables support which priorities?
2. **Identify redundant tables** - Multiple tables doing the same thing?
3. **Find unused tables** - Tables with zero rows that aren't needed?
4. **Consolidate where safe** - Merge overlapping functionality
5. **Preserve critical infrastructure** - Never touch cultural safety, consent, audit

**Target Reduction:** 160 → 150 tables (6% reduction, quality over quantity)

**Principles:**
- ✅ **Preserve mission-critical tables** (cultural safety, consent, storyteller empowerment)
- ✅ **Remove truly obsolete tables** (superseded systems, empty unused tables)
- ✅ **Consolidate redundancy** (combine overlapping tracking tables)
- ❌ **Never compromise cultural safety** (elder review, protocols, consent)
- ❌ **Never lose data** (backup to _archive tables first)

---

## 📚 Knowledge Areas

### What We Know Well

1. **Production schema** - 171 tables fully mapped
2. **Migration history** - 42 migration files analyzed
3. **Core mission** - Partnership-focused storytelling with data sovereignty
4. **Cultural protocols** - Elder authority, OCAP, consent-first
5. **Local testing workflow** - Works perfectly (caught bugs!)
6. **Partnership messaging** - ACT Voice review completed (96/100)
7. **GDPR compliance** - Audit logging, consent tracking, deletion requests

### What Needs Investigation

1. **Theme table relationships** - How do 6+ theme tables interact?
2. **AI analysis current state** - Why are transcripts unprocessed? (Issue #130)
3. **Table usage patterns** - Which tables are actively queried vs dormant?
4. **Frontend dependencies** - Which tables does UI actually use?
5. **Partner integrations** - Oonchiumpa sync, external APIs

---

## 🎯 Success Metrics

**Technical Excellence:**
- ✅ Database < 150 tables
- ✅ All migrations pass validation
- ✅ Local testing catches all bugs
- ✅ Zero production errors
- ✅ TypeScript types always current

**Mission Alignment:**
- ✅ Cultural protocols enforced at DB level
- ✅ Storytellers control their narratives
- ✅ Elder authority preserved for Indigenous communities
- ✅ Consent tracked for all content (GDPR Article 7)
- ✅ Multi-tenant isolation perfect
- ✅ Partnership language throughout (not savior complex)
- ✅ AI processing consent-gated (90.5% opt-in rate)

**Performance:**
- ✅ Story page load < 2 seconds
- ✅ Storyteller dashboard < 1 second
- ✅ Network visualization smooth 60fps
- ✅ Theme queries < 500ms
- ✅ Admin queries < 1 second

**Developer Experience:**
- ✅ Migration creation < 10 minutes
- ✅ Local testing < 2 minutes
- ✅ Schema changes documented
- ✅ Database wiki maintained
- ✅ Best practices followed

---

## 🛠️ Tools & Processes

### Database Management Commands

```bash
# Daily workflow
npm run db:start          # Start local Supabase
npm run db:status         # Check migration sync
npm run validate:schema   # Run automated checks
npm run db:migrate        # Test migrations locally
npm run db:migrate:remote # Deploy to production
npm run db:types          # Regenerate TypeScript types

# Analysis
npm run db:sql            # Interactive SQL console
npx supabase db pull      # Pull latest schema

# Testing
./scripts/test-audit-logging.sh      # Test audit system
./scripts/test-consent-api.sh        # Test consent infrastructure
./scripts/verify-supabase-connection.sh  # Verify production connection
```

### Quality Gates

**Before ANY migration:**
1. ✅ Run `npm run validate:schema` - Must pass
2. ✅ Test locally with `npm run db:migrate` - Must succeed
3. ✅ Verify mission alignment - Does this support core values?
4. ✅ Check for backups - Archive data before dropping tables
5. ✅ Review rollback plan - Can we undo this?
6. ✅ Verify partnership messaging - Does language empower or patronize?

**After deployment:**
1. ✅ Verify with `npm run db:status` - Migrations synced?
2. ✅ Regenerate types with `npm run db:types`
3. ✅ Monitor Supabase logs for 10 minutes
4. ✅ Test affected frontend pages
5. ✅ Update documentation (this wiki!)

---

## 📖 Key Documentation

- **[MIGRATION_STRATEGY.md](MIGRATION_STRATEGY.md)** - Perfect migration patterns
- **[DATABASE_BEST_PRACTICES.md](DATABASE_BEST_PRACTICES.md)** - Query patterns, RLS, roles
- **[LOCAL_SUPABASE_SUCCESS.md](LOCAL_SUPABASE_SUCCESS.md)** - Local setup guide
- **[PHASE2_READY_TO_DEPLOY.md](PHASE2_READY_TO_DEPLOY.md)** - Phase 2 summary
- **[/Users/benknight/act-global-infrastructure/EMPATHY_LEDGER_MESSAGING_REVIEW.md](../../../act-global-infrastructure/EMPATHY_LEDGER_MESSAGING_REVIEW.md)** - ACT Voice messaging guidelines (96/100)
- **This file** - Strategic alignment and mission focus

---

## 🎉 Recent Wins

1. ✅ **Local Supabase Working** - Test migrations safely before production
2. ✅ **Phase 2 Deployed** - Removed 11 legacy photo tables
3. ✅ **Schema Validator** - Automated checks catch common errors
4. ✅ **Migration Workflow** - Clean, documented, repeatable process
5. ✅ **Cultural Safety Preserved** - Elder review, protocols, consent intact
6. ✅ **Audit Logging Active** - GDPR Article 30 compliance (Issue #128)
7. ✅ **AI Consent Campaign** - 75% complete, partnership-focused messaging (Issue #129)
8. ✅ **Messaging Review** - ACT Voice 96/100 quality rating
9. ✅ **Consent Revocation Cleanup** - Automatic AI data deletion on consent withdrawal

---

## 🔮 Vision: Where We're Going

**6 Months:**
- AI analysis pipeline processing all consented transcripts automatically
- Thematic network visualization showing 200+ storyteller connections
- 10+ Indigenous communities actively using platform
- Partner portal with real-time impact dashboards
- Database optimized to 140 tables (20% reduction, zero mission compromise)
- Partnership messaging throughout platform (no savior complex)

**12 Months:**
- 500+ storytellers with analyzed narratives
- Cross-community insights revealing shared themes (with consent)
- Annual impact reports auto-generated from SROI data
- International recognition as model for Indigenous data sovereignty
- Open-source release of cultural safety framework
- Community-governed AI policies active

**Long-term:**
- Leading partnership platform for Indigenous storytelling worldwide
- Template for community-owned narrative platforms
- Research partnerships with Indigenous universities
- Generational knowledge preservation at scale
- Universal platform with Indigenous expertise guiding design

---

## 🌱 Partnership Messaging Guidelines

**Language We Use:**
- ✅ "Partner with communities"
- ✅ "Storytellers lead; we support"
- ✅ "Communities reclaim narrative sovereignty"
- ✅ "Your stories remain yours"
- ✅ "Designed with Indigenous communities, for justice across all"

**Language We Avoid:**
- ❌ "Empower communities" (savior complex)
- ❌ "Give voice to" (implies they don't have voice)
- ❌ "Help Indigenous communities" (patronizing)
- ❌ "Our storytellers" (possession - stories belong to storytellers, not platform)
- ❌ "Platform for Indigenous communities only" (exclusive framing)

**Balance:**
- Universal framing: "Everyone's stories"
- With dedication: "Indigenous expertise guiding design"
- Without dilution: "Indigenous data sovereignty non-negotiable"
- Active voice: "Communities reclaim" (not "we empower")
- Clear control: "Storytellers decide what gets shared"

**Source:** ACT Voice v1.0 Messaging Review (96/100 quality)

---

**This wiki guides all database decisions. Every table, every migration, every optimization must support the mission: Partnership-focused storytelling with dignity, sovereignty, and impact. Communities reclaim narrative sovereignty; we provide tools and support on their terms.**
