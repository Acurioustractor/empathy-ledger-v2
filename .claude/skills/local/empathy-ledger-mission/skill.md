# Empathy Ledger Mission & Values Alignment Skill

**Purpose:** Ensure all development decisions align with Empathy Ledger's mission, values, and strategic pillars.

**Invoke When:**
- Starting any new feature
- Making architectural decisions
- Writing user-facing content
- Reviewing design choices
- Prioritizing backlog items
- Questioning "Should we build this?"

---

## 🎯 Core Mission

**Empathy Ledger partners with storytellers and communities to preserve narratives, protect cultural knowledge, and share wisdom on their terms.**

### Mission Pillars:
1. **Reclaim narrative sovereignty** - Communities own and control their data
2. **Share with dignity** - Cultural protocols and consent at every step
3. **Build connections** - Discover thematic links across stories and storytellers
4. **Demonstrate impact** - Track real-world outcomes and community value
5. **Preserve knowledge** - Multi-generational storytelling and archival

### Tagline:
"Storytelling platform where communities reclaim narrative sovereignty and share culture on their terms"

---

## 🌟 Partnership Principles (NON-NEGOTIABLE)

These principles guide EVERY decision:

### ✅ DO:
- **"We partner with communities"** - Collaborative, equal relationship
- **"Storytellers lead; we support"** - They have agency, we provide tools
- **"Universal platform with Indigenous expertise guiding design"** - Built for all, guided by those most harmed
- **"Cultural safety is foundational"** - Not an add-on, core architecture
- **"Control remains with storytellers always"** - They own their data

### ❌ DON'T:
- **"We empower communities"** - Implies they lack power (savior complex)
- **"We give voice to"** - They have voices; we provide platforms
- **"Our storytellers"** - Implies ownership/possession
- **"For Indigenous only"** - Exclusionary framing (it's universal with Indigenous-led design)
- **"Help Indigenous communities"** - Patronizing

---

## 🛡️ The 8 Strategic Pillars

### Pillar 1: Indigenous Leadership & Cultural Safety 🔴 CRITICAL

**What It Means:**
- Elder authority framework (highest review power for Indigenous communities)
- OCAP principles (Ownership, Control, Access, Possession)
- Cultural protocols adapted for each community
- Consent-first for ALL communities
- Multi-tenant data isolation

**Database Tables (12):**
- `elder_review_queue` - Elders approve culturally sensitive content
- `cultural_protocols` - Community-specific protocols
- `consent_change_log` - Track all consent modifications
- `moderation_results`, `ai_moderation_logs`, `ai_safety_logs`
- `content_approval_queue`, `moderation_appeals`
- `cultural_tags`, `cultural_speech_patterns`

**Development Guidelines:**
- NEVER bypass Elder review for sacred content
- ALWAYS get explicit consent before using storyteller content
- NEVER make cultural assumptions
- ALWAYS support custom cultural protocols per community
- Cultural safety features are MANDATORY, not optional

**Check Before Shipping:**
- [ ] Does this feature respect Elder authority?
- [ ] Is consent explicitly captured?
- [ ] Can communities customize protocols?
- [ ] Is data isolated per tenant?
- [ ] Have you invoked `cultural-review` skill?

---

### Pillar 2: Storyteller Empowerment & Agency 🔴 CRITICAL

**What It Means:**
- Storytellers control their narrative (edit, delete, share on their terms)
- Dashboard analytics (see impact of their stories)
- Network discovery (find connections with other storytellers)
- Recognition (milestones, quotes, featured highlights)
- Ownership (stories belong to storytellers, not platform)

**Database Tables (18):**
- `profiles` (is_storyteller flag) - 226 storytellers
- `storyteller_analytics` - Central metrics hub
- `storyteller_dashboard_config` - Customizable dashboards
- `storyteller_connections` - AI-discovered connections (33 columns!)
- `storyteller_milestones`, `storyteller_quotes`
- `storyteller_impact_metrics`, `storyteller_engagement`

**Development Guidelines:**
- Storytellers ALWAYS have final say on their content
- Never auto-publish without storyteller approval
- Dashboard must show storyteller impact, not platform metrics
- Privacy controls must be granular and easy to understand
- Delete must mean ACTUALLY delete (GDPR right to erasure)

**Check Before Shipping:**
- [ ] Does storyteller have full control?
- [ ] Can they see their impact?
- [ ] Can they delete their data completely?
- [ ] Are privacy settings clear and accessible?
- [ ] Does this empower or extract?

---

### Pillar 3: Story Lifecycle & Content Management 🔴 CRITICAL

**What It Means:**
- Multiple content types (stories, transcripts, media, testimonials)
- Flexible workflows (Draft → Review → Publish → Archive)
- Rich metadata (themes, tags, cultural context, locations)
- Media integration (photos, audio, video linked to stories)
- Versioning (track story evolution over time)

**Database Tables (15):**
- `stories` (98 columns!) - Comprehensive story metadata
- `transcripts` (59 columns, 208 records) - Oral narratives
- `media_assets` (66 columns!) - Media management
- `galleries`, `quotes`, `testimonials`, `blog_posts`, `videos`
- `empathy_entries` - Core Empathy Ledger entries

**Development Guidelines:**
- Support ALL story formats (text, audio, video, photos)
- Metadata should be rich but optional
- Never lock storytellers into one workflow
- Versioning must preserve original intent
- Media must link back to storyteller consent

**Check Before Shipping:**
- [ ] Does it support multiple content types?
- [ ] Is metadata capture optional, not required?
- [ ] Can storytellers choose their workflow?
- [ ] Is versioning tracked?
- [ ] Are media files linked to consent?

---

### Pillar 4: Thematic Network & AI Analysis 🟡 IMPORTANT

**What It Means:**
- AI-powered theme extraction from stories
- Storyteller network discovery (shared themes, geographic, temporal)
- Cross-narrative insights (patterns across many stories)
- Ethical AI with transparency and consent

**Database Tables (19):**
- `narrative_themes`, `themes`, `theme_associations`
- `storyteller_connections` (AI-discovered)
- `cross_narrative_insights`, `cross_sector_insights`
- `ai_usage_events`, `ai_processing_logs`, `ai_analysis_jobs`

**Development Guidelines:**
- AI is OPTIONAL - storytellers can opt out
- Always show AI confidence scores
- Never use AI for moderation of cultural content (Elders decide)
- AI results must be reviewable and editable by storytellers
- Track all AI usage for transparency

**Check Before Shipping:**
- [ ] Can storytellers opt out of AI processing?
- [ ] Are confidence scores shown?
- [ ] Can storytellers edit AI results?
- [ ] Is AI usage logged and transparent?
- [ ] Does this enhance or replace human connection?

---

### Pillar 5: Multi-Tenant Organizations & Projects 🟡 IMPORTANT

**What It Means:**
- Each community/organization is a separate tenant
- Projects group stories around initiatives
- Partners can have portals with custom analytics
- Complete data isolation between tenants

**Database Tables (25):**
- `tenants` (multi-tenant isolation)
- `organizations` (65 columns), `organization_members`
- `projects`, `project_participants`, `project_analytics`
- `partners`, `partner_team_members`, `partner_dashboard_summary`

**Development Guidelines:**
- NEVER leak data across tenants (RLS policies critical)
- Organizations can customize their experience
- Projects should be flexible containers
- Partners get views, not raw data access
- Tenant deletion must cascade properly

**Check Before Shipping:**
- [ ] Is RLS policy tested for this table?
- [ ] Can data leak across tenants?
- [ ] Do organizations have customization options?
- [ ] Are partner analytics aggregated safely?
- [ ] Does tenant deletion work?

---

### Pillar 6: Privacy, Consent & Data Sovereignty 🔴 CRITICAL

**What It Means:**
- GDPR Article 7 compliance (consent tracking)
- OCAP principles for Indigenous data sovereignty
- Granular privacy levels (public, community, private, restricted)
- Data portability (export in standard formats)
- Right to erasure (complete deletion)

**Database Tables (10):**
- `consent_change_log` - Track all consent modifications
- `deletion_requests`, `privacy_changes`
- `data_quality_metrics`, `audit_logs`
- `story_access_log`, `story_access_tokens`
- `story_syndication_consent`, `embed_tokens`

**Development Guidelines:**
- Consent must be explicit, informed, revocable
- Privacy levels apply at story AND storyteller level
- Data export must include ALL user data
- Deletion must be complete and irreversible
- Audit every access to sensitive data

**Check Before Shipping:**
- [ ] Is consent explicitly captured?
- [ ] Can users revoke consent easily?
- [ ] Does data export include everything?
- [ ] Is deletion truly complete?
- [ ] Are accesses audited?

---

### Pillar 7: Impact Measurement & SROI 🟢 NICE-TO-HAVE

**What It Means:**
- Track real-world outcomes from storytelling
- Social Return on Investment (SROI) calculations
- Impact stories and evidence collection
- Community value demonstration

**Database Tables (10):**
- `outcomes`, `harvested_outcomes`, `document_outcomes`
- `sroi_calculations`, `sroi_inputs`, `sroi_outcomes`
- `impact_stories`, `impact_stats`, `service_impact`
- `activities` (50 columns!)

**Development Guidelines:**
- Impact should serve storytellers, not just platform
- SROI must be opt-in
- Never reduce stories to just metrics
- Qualitative impact matters as much as quantitative

**Check Before Shipping:**
- [ ] Does impact tracking serve storytellers?
- [ ] Is SROI opt-in?
- [ ] Are qualitative outcomes captured?
- [ ] Can storytellers see their impact?

---

### Pillar 8: Distribution & Syndication 🟢 NICE-TO-HAVE

**What It Means:**
- Stories can be shared with consent
- Secure embeds for partner sites
- Syndication requests tracked
- Revenue sharing when stories are used

**Database Tables (10):**
- `story_distributions`, `story_syndication_requests`
- `embed_tokens`, `story_access_tokens`
- `story_engagement_events`, `story_engagement_daily`
- `external_applications`, `webhook_subscriptions`

**Development Guidelines:**
- Syndication ALWAYS requires consent
- Embed tokens must be revocable
- Revenue sharing must be transparent
- Storytellers control who can use their stories

**Check Before Shipping:**
- [ ] Is syndication consent-based?
- [ ] Can embeds be revoked?
- [ ] Is revenue sharing clear?
- [ ] Do storytellers control distribution?

---

## 🎨 Voice & Messaging Guidelines

### ACT Brand Alignment

Empathy Ledger is an ACT project. Follow ACT voice principles:

- **Grounded yet Visionary** - Practical wisdom + ambitious vision
- **Humble yet Confident** - No savior complex, but know our value
- **Warm yet Challenging** - Invite participation + truth-tell about systems
- **Poetic yet Clear** - Beautiful language that illuminates, not obscures

### Farm Metaphors (ACT System)
- **Seeds** - Stories/ideas planted
- **Soil** - Communities/conditions for growth
- **Seasons** - Natural cycles of change
- **Harvest** - Outcomes shared back to community
- **Fields** - Different project areas
- **Tractor/PTO** - Transferring capacity to communities

### Empathy Ledger-Specific Voice

**Use:**
- "Partner with storytellers"
- "Communities reclaim narrative sovereignty"
- "Share culture on your terms"
- "Stories remain yours"
- "Elder authority framework"
- "Data sovereignty non-negotiable"

**Avoid:**
- "Empower storytellers" (savior complex)
- "Give voice to communities" (they have voices)
- "Our storytellers" (implies ownership)
- "Help Indigenous communities" (patronizing)
- "For Indigenous only" (exclusionary)

---

## ✅ Feature Decision Framework

### Before Building ANY Feature, Ask:

1. **Mission Alignment:**
   - Does this advance narrative sovereignty?
   - Does it support storyteller agency?
   - Is cultural safety foundational, not added?

2. **Partnership Principles:**
   - Are we partnering or extracting?
   - Do storytellers lead this, or us?
   - Does this support or undermine control?

3. **Cultural Safety:**
   - Have we invoked `cultural-review` skill?
   - Does this respect Elder authority?
   - Are cultural protocols customizable?

4. **Data Sovereignty:**
   - Do storytellers own their data?
   - Can they delete completely?
   - Is consent explicit and revocable?

5. **Impact on Storytellers:**
   - Does this empower or burden them?
   - Can they opt out easily?
   - Do THEY benefit, or just us?

### Green Light (Build It):
✅ Advances mission pillars
✅ Storytellers retain control
✅ Cultural safety foundational
✅ Consent-based
✅ Serves storytellers first

### Yellow Light (Redesign):
⚠️ Mission alignment unclear
⚠️ Control shifts to platform
⚠️ Cultural safety feels like add-on
⚠️ Consent implicit, not explicit
⚠️ Serves platform more than storytellers

### Red Light (Don't Build):
❌ Undermines narrative sovereignty
❌ Extracts from communities
❌ Bypasses cultural protocols
❌ Takes control from storytellers
❌ Monetizes without consent

---

## 📊 Priority Framework

### Priority 1: CRITICAL (Must Have)
- Pillars 1, 2, 3, 6 (Cultural Safety, Storyteller Agency, Content, Privacy)
- These are non-negotiable foundations
- Never deprioritize for features

### Priority 2: IMPORTANT (Should Have)
- Pillars 4, 5 (AI Analysis, Multi-Tenant)
- These enhance core value
- Can iterate on these

### Priority 3: NICE-TO-HAVE (Could Have)
- Pillars 7, 8 (Impact, Distribution)
- These add strategic value
- Build after P1/P2 solid

---

## 🔗 Related Skills & Documents

### Invoke These Skills Together:
- **`cultural-review`** - MANDATORY for storyteller-facing features
- **`act-brand-alignment`** - For messaging and voice
- **`gdpr-compliance`** - For data handling features
- **`design-component`** - For UI work (use cultural color palette)

### Reference Documents:
- [EMPATHY_LEDGER_WIKI.md](../../../docs/EMPATHY_LEDGER_WIKI.md) - Full mission documentation (755 lines)
- [mission-summary.md](../../../docs/database/mission-summary.md) - Database-to-mission mapping
- [mission-map.md](../../../docs/database/mission-map.md) - Visual mission alignment

---

## 🎯 Usage Examples

### Example 1: New Feature - Story Sharing
**User:** "Add a 'share story' button"

**Invoke This Skill:**
1. Check Mission: Does sharing advance narrative sovereignty?
   - ✅ Yes, IF storyteller controls who/how/when
2. Check Partnership: Are storytellers leading?
   - ✅ Yes, IF sharing is opt-in with granular controls
3. Check Cultural Safety: Cultural protocols respected?
   - ✅ Yes, IF Elder review required for sacred content
4. Check Data Sovereignty: Storytellers own data?
   - ✅ Yes, IF consent tracked and revocable
5. **Invoke:** `cultural-review` skill for implementation

**Result:** Build with consent-first, granular controls, Elder review for sacred content.

---

### Example 2: Design Decision - Analytics Dashboard
**User:** "Design a storyteller analytics dashboard"

**Invoke This Skill:**
1. Check Pillar 2 (Storyteller Empowerment):
   - Dashboard shows THEIR impact, not platform's ✅
   - Customizable to their interests ✅
   - Privacy-preserving (no comparison to others) ✅
2. Check Voice:
   - Use "Your Impact" not "Platform Metrics" ✅
   - Use "Stories you've shared" not "Content generated" ✅
3. **Invoke:** `design-component` skill with cultural color palette

**Result:** Build dashboard focused on storyteller value, using clay colors for warmth.

---

### Example 3: Backlog Prioritization
**User:** "Should we build advanced theme clustering or improve consent UX?"

**Invoke This Skill:**
1. Theme clustering = Pillar 4 (P2 - Important)
2. Consent UX = Pillar 6 (P1 - Critical)
3. **Decision:** Consent UX wins (P1 > P2)
4. **Rationale:** Cultural safety and data sovereignty are foundational

**Result:** Prioritize consent UX. Theme clustering can wait.

---

## 🚨 Red Flags - Stop and Review

If you hear these phrases, STOP and invoke this skill:

- "Users will love this" → Do STORYTELLERS love it?
- "Industry standard" → Does it align with OUR mission?
- "Quick win" → Does it advance narrative sovereignty?
- "We can add cultural safety later" → NO. It's foundational.
- "Most users won't need this" → Storytellers are not "most users"
- "Let's simplify consent" → Consent cannot be simplified away
- "We should own this data" → NO. Storytellers own data.

---

## 📚 Quick Reference

### The 3 Mission Checks (Every Feature)

1. **Sovereignty Check:** Does this give storytellers MORE control or LESS?
2. **Safety Check:** Is cultural safety foundational or auxiliary?
3. **Partnership Check:** Are we partnering or extracting?

### The 3 Non-Negotiables

1. **OCAP Principles** - Ownership, Control, Access, Possession
2. **Elder Authority** - Highest review power for Indigenous communities
3. **Consent-First** - Explicit consent for every use of content

### The 3 Voice Rules

1. **Partner, not empower** - Collaborative relationship
2. **Support, not help** - They lead, we support
3. **Theirs, not ours** - Stories belong to storytellers

---

**Remember:** Every line of code is a political act. Every design choice either advances or undermines narrative sovereignty. Choose wisely.

🌾 **"Every story is a seed. Every seed is a possibility. Every possibility is a future we cultivate together."** 🌱
