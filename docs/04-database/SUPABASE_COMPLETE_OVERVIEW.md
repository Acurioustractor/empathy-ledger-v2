# Supabase Complete Database Overview
**Generated:** 2026-01-06
**Total Tables:** 172 public tables
**Database:** PostgreSQL on Supabase

## Table of Contents
- [Core Story System](#core-story-system)
- [Storyteller & Profile Management](#storyteller--profile-management)
- [Thematic & Analysis System](#thematic--analysis-system)
- [Organization & Multi-Tenancy](#organization--multi-tenancy)
- [Projects & Campaigns](#projects--campaigns)
- [Media & Assets](#media--assets)
- [Consent & Cultural Safety](#consent--cultural-safety)
- [AI & Processing](#ai--processing)
- [Syndication & Distribution](#syndication--distribution)
- [Analytics & Metrics](#analytics--metrics)
- [Knowledge Base & RAG](#knowledge-base--rag)
- [Supporting Tables](#supporting-tables)

---

## Core Story System

### stories (315 total, 155 published)
**Purpose:** Central table for all storytelling content
**Key Relationships:**
- `storyteller_id` → `storytellers.id` (who told the story)
- `author_id` → `profiles.id` (who wrote/edited it)
- `project_id` → `projects.id` (which project it belongs to)
- `organization_id` → `organizations.id` (which org owns it)
- `transcript_id` → `transcripts.id` (source transcript)
- `campaign_id` → `campaigns.id` (marketing campaign)

**Key Fields:**
```sql
-- Content
title, content, excerpt, summary
story_type (personal, community, organizational, etc.)
story_category
cultural_themes text[] -- Array of theme names
themes jsonb -- Structured theme data

-- Media
story_image_url, media_urls text[]
video_link, video_embed_code
media_attachments jsonb

-- Status & Permissions
status (draft, published, archived)
is_public, is_featured
privacy_level, permission_tier
embeds_enabled, sharing_enabled
syndication_enabled

-- Cultural Safety
cultural_sensitivity_level
cultural_warnings jsonb
cultural_permission_level
requires_elder_review
elder_reviewed, elder_approved
traditional_knowledge_flag

-- Consent & GDPR
has_explicit_consent
consent_details jsonb
consent_withdrawn_at
anonymization_status
archive_consent_given

-- Engagement
views_count, likes_count, shares_count
reading_time, word_count

-- AI Processing
ai_processed, enable_ai_processing
ai_confidence_scores jsonb
ai_enhanced_content
search_vector tsvector
embedding vector

-- Location
location_text, latitude, longitude
location_id → locations.id
```

**Theme Support:**
- `cultural_themes` - Array of theme names for filtering
- `themes` - JSONB for rich theme data with metadata
- Links to `story_themes` junction table
- Links to `narrative_themes` for AI-extracted themes

---

## Storyteller & Profile Management

### storytellers (235 total, 201 with avatars)
**Purpose:** Storytelling personas - profiles who share stories
**Description:** _"Storytellers table - profiles who share stories. Links to profiles table via profile_id. All storyteller-specific data should be stored here."_

**Key Relationships:**
- `profile_id` → `profiles.id` (1-to-1, UNIQUE)
- `stories.storyteller_id` → `storytellers.id` (1-to-many)

**Key Fields:**
```sql
id uuid PRIMARY KEY
profile_id uuid UNIQUE REFERENCES profiles(id)
display_name text NOT NULL
bio text
cultural_background text[] -- Array of cultural identities
language_skills text[]
avatar_url text -- Synced from profiles.profile_image_url
is_active boolean DEFAULT true
created_at, updated_at timestamptz
```

**Related Tables:**
- `storyteller_analytics` - Central analytics hub
- `storyteller_connections` - AI-discovered narrative connections
- `storyteller_dashboard_config` - Custom dashboard settings
- `storyteller_demographics` - Rich demographic data
- `storyteller_engagement` - Engagement metrics over time
- `storyteller_impact_metrics` - Influence and reach metrics
- `storyteller_locations` - Geographic data
- `storyteller_media_links` - Multiple media links with metadata
- `storyteller_milestones` - Achievement tracking
- `storyteller_organizations` - Org memberships
- `storyteller_payouts` - Revenue sharing
- `storyteller_projects` - Project associations
- `storyteller_quotes` - Extracted powerful quotes
- `storyteller_recommendations` - Personalized recommendations
- `storyteller_themes` - Prominent narrative themes

### profiles (251 total)
**Purpose:** Core user accounts for authentication and general user data
**Description:** _"Storyteller and user profiles - cache refresh trigger"_

**Key Relationships:**
- `storytellers.profile_id` → `profiles.id`
- Auth user accounts (Supabase Auth)
- Multiple organization memberships

**Key Fields:**
```sql
id uuid PRIMARY KEY
full_name, display_name, bio
email (via auth.users)
profile_image_url text -- Primary avatar source
avatar_url text -- Secondary avatar source
avatar_media_id uuid -- Media asset reference
cultural_affiliations text[]
languages_spoken text[]
is_storyteller boolean
preferred_pronouns text
photo_consent_contexts text[]
created_by uuid REFERENCES profiles(id)
```

**Related Tables:**
- `profile_galleries` - Photo galleries
- `profile_locations` - Multiple locations
- `profile_organizations` - Org memberships with roles
- `profile_projects` - Project participation
- `development_plans` - Professional development
- `personal_insights` - Private analytics
- `professional_competencies` - Skills tracking
- `opportunity_recommendations` - Career opportunities
- `privacy_changes` - Privacy settings history

---

## Thematic & Analysis System

### How Themes Work in the Database

**Theme Storage (3 approaches):**

1. **stories.cultural_themes** (text array)
   - Simple array of theme names
   - Fast filtering: `WHERE 'healing' = ANY(cultural_themes)`
   - Used for: Quick filters, faceted search

2. **stories.themes** (jsonb)
   - Rich structured theme data
   - Metadata: confidence scores, context, sub-themes
   - Used for: Detailed analysis, theme evolution

3. **story_themes** (junction table)
   - Many-to-many: stories ↔ themes
   - Links to `themes` master list
   - Used for: Normalized theme management

### narrative_themes
**Purpose:** AI-extracted and manually curated themes from storytelling content
**Fields:**
```sql
id uuid
theme_name text
theme_category text
description text
keywords text[]
created_by_ai boolean
confidence_score decimal
usage_count integer
```

**Related to:**
- `storyteller_themes` - Which storytellers use which themes
- `theme_associations` - Theme co-occurrence
- `theme_concept_evolution` - How themes change over time
- `theme_evolution` - Theme evolution tracking
- `theme_evolution_tracking` - Detailed evolution metrics
- `organization_theme_analytics` - Per-org theme analytics

### transcript_analysis_results
**Purpose:** Stores versioned AI analysis results for transcripts with quality metrics
**Fields:**
```sql
id uuid
transcript_id uuid REFERENCES transcripts(id)
analysis_version text
themes_extracted jsonb
quotes_extracted jsonb
sentiment_analysis jsonb
entities_extracted jsonb
narrative_arcs jsonb
quality_metrics jsonb
processing_metadata jsonb
```

### transcripts (source material)
**Purpose:** Raw interview/conversation transcripts
**Relationships:**
- `storyteller_id` → `profiles.id`
- `stories.transcript_id` → `transcripts.id`
- `transcript_analysis_results` - Analysis outputs

**Processing Pipeline:**
```
transcripts
    ↓ (AI analysis)
transcript_analysis_results
    ↓ (extraction)
narrative_themes, extracted_quotes
    ↓ (synthesis)
stories (with themes and content)
```

---

## Organization & Multi-Tenancy

### organizations (multi-tenant architecture)
**Purpose:** Any organization using Empathy Ledger - Indigenous communities, NGOs, government services
**Key Fields:**
```sql
id uuid
tenant_id uuid REFERENCES tenants(id)
name, slug
description, mission, values
logo_url
contact_info jsonb
created_by uuid REFERENCES profiles(id)
```

**Related Tables:**
- `organization_members` - Member profiles with roles
- `organization_roles` - Role management with audit trail
- `organization_contexts` - Self-service context for AI
- `organization_impact_metrics` - Aggregated impact data
- `organization_theme_analytics` - Theme tracking
- `organization_analytics` - General analytics
- `organization_invitations` - Email invites to join
- `organization_storyteller_network` - Network graph
- `organization_cross_transcript_insights` - Cross-analysis
- `organization_duplicates` - Duplicate detection
- `organization_enrichment` - AI-extracted enrichment

### organization_contexts
**Purpose:** Self-service context management for organizations. Stores mission, values, impact methodology used for AI analysis.
**Impact on Thematic Analysis:**
- Guides AI to extract organization-relevant themes
- Customizes theme categorization per org
- Enables org-specific outcome tracking

**Key Fields:**
```sql
id uuid
organization_id uuid
mission_statement text
values jsonb
impact_methodology text
success_criteria jsonb
context_version integer
```

### tenants
**Purpose:** Top-level multi-tenancy isolation
**All major tables have:** `tenant_id uuid` for row-level security

---

## Projects & Campaigns

### projects
**Purpose:** Collections of stories organized by initiative, program, or research project
**Relationships:**
- `created_by` → `profiles.id`
- `organization_id` → `organizations.id`
- `stories.project_id` → `projects.id`

**Related Tables:**
- `project_contexts` - Self-service context for project-specific outcomes
- `project_analyses` - Cached AI analysis results
- `project_analytics` - Analytics dashboard data
- `project_participants` - Who's involved
- `project_storytellers` - Storyteller roster
- `project_media` - Project media assets
- `project_updates` - News and updates
- `project_seed_interviews` - Seed transcripts for context
- `project_profiles` - AI-extracted project profiles
- `project_organizations` - Multi-org projects
- `story_project_tags` - Story-to-project with approval
- `story_project_features` - Featured stories
- `storyteller_project_features` - Featured storytellers

### project_contexts
**Purpose:** Self-service context management for projects. Enables project-specific outcomes tracking instead of generic metrics.
**Impact on Themes:**
- Customizes theme extraction for project goals
- Links themes to specific outcomes
- Tracks theme evolution within project lifecycle

### campaigns
**Purpose:** Storytelling campaigns for organizing themed story collections
**Relationships:**
- `stories.campaign_id` → `campaigns.id`
- `campaign_consent_workflows` - Tracks storyteller journey from invitation to publication

---

## Media & Assets

### media_files
**Purpose:** Media library for photos, videos, audio files with cultural sensitivity controls
**Fields:**
```sql
file_path, file_type, file_size
thumbnail_url
cultural_sensitivity_flag
requires_consent
uploaded_by uuid REFERENCES profiles(id)
metadata jsonb
```

### media_assets
**Purpose:** General media asset management
**Relationships:**
- `uploader_id` → `profiles.id`
- `consent_granted_by` → `profiles.id`
- Links to `media_vision_analysis` for AI safety checks

### media_vision_analysis
**Purpose:** AI vision analysis results (OpenAI + Claude) for cultural safety
**Use Case:** Automatically flags culturally sensitive imagery before publication

### Related Tables
- `story_media` - Media attached to stories
- `story_images` - Story-specific images
- `project_media` - Project assets
- `galleries` - Photo galleries
- `gallery_media` - Gallery contents
- `gallery_media_associations` - Media relationships
- `videos` - Unified video gallery
- `storyteller_media_links` - Storyteller media links
- `media_usage_tracking` - Usage analytics
- `media_share_events` - Sharing audit trail
- `media_import_sessions` - Bulk import tracking

---

## Consent & Cultural Safety

### consents
**Purpose:** GDPR and OCAP compliant consent tracking for all content types
**Key Fields:**
```sql
id uuid
storyteller_id uuid REFERENCES profiles(id)
consent_type text
consent_given boolean
consent_scope jsonb
consent_metadata jsonb
expires_at timestamptz
withdrawn_at timestamptz
```

**Related Tables:**
- `consent_audit` - Complete audit trail
- `consent_change_log` - History for webhooks
- `syndication_consent` - Per-story, per-site consent
- `story_syndication_consent` - Storyteller approval for sharing

### cultural_protocols
**Purpose:** Cultural safety rules and guidelines
**Relationships:**
- `created_by` → `profiles.id`
- `approved_by` → `profiles.id`

### elder_review_queue
**Purpose:** Queue of content requiring elder cultural review
**Fields:**
```sql
id uuid
content_type text
content_id uuid
assigned_elder_id uuid REFERENCES profiles(id)
reviewed_by uuid REFERENCES profiles(id)
status text
review_notes text
```

### moderation_results
**Purpose:** Results from AI and elder cultural safety moderation
**Related:**
- `ai_moderation_logs` - Audit trail for moderation
- `moderation_appeals` - Appeals submitted
- `ai_safety_logs` - AI safety middleware checks

---

## AI & Processing

### AI Agent System

**ai_agent_registry**
**Purpose:** Registry of available AI agents and their configurations
**Agents:** Claude, OpenAI, custom analysis agents

**ai_usage_events**
**Purpose:** Tracks all AI agent invocations for billing, observability, and cost control
**Fields:**
```sql
user_id uuid REFERENCES profiles(id)
agent_name text
operation_type text
tokens_used integer
cost decimal
metadata jsonb
```

**Related Tables:**
- `ai_usage_daily` - Daily aggregated metrics
- `ai_processing_logs` - Detailed processing logs
- `ai_analysis_jobs` - Job queue
- `analytics_processing_jobs` - Background processing

### Thematic AI Processing

**How AI Extracts Themes:**

1. **Transcript Upload**
   ```
   transcripts table (raw text)
   ```

2. **AI Analysis Job**
   ```
   analytics_processing_jobs (queued)
       ↓
   AI Agent (Claude/OpenAI)
       ↓
   transcript_analysis_results (structured output)
   ```

3. **Theme Extraction**
   ```sql
   {
     "themes_extracted": [
       {
         "theme_name": "healing",
         "confidence": 0.92,
         "evidence": ["quote 1", "quote 2"],
         "context": "cultural healing practices"
       }
     ]
   }
   ```

4. **Theme Storage**
   ```
   narrative_themes (master list)
   story_themes (story associations)
   stories.cultural_themes[] (quick access)
   storyteller_themes (storyteller signatures)
   ```

### Processing Tables
- `processing_jobs` - Scraping and processing queue
- `transcription_jobs` - Audio transcription
- `analysis_jobs` - General analysis queue
- `analytics_processing_jobs` - Background analytics

---

## Syndication & Distribution

### syndication_sites
**Purpose:** Registry of approved external ACT sites that can request syndicated content
**Fields:**
```sql
id uuid
site_name text
site_url text
api_key_hash text
allowed_themes text[] -- Can request stories with these themes
approved boolean
```

### story_syndication_requests
**Purpose:** Requests from partners to feature stories, requiring storyteller approval
**OCAP Principle:** Storyteller controls where their stories appear

### embed_tokens
**Purpose:** Secure, time-limited, revocable access tokens for external sites
**Use Case:** Allow external embedding while maintaining storyteller control

### story_distributions
**Purpose:** Real-time tracking of where stories are currently live
**Fields:**
```sql
story_id uuid
site_id uuid
status (live, removed, pending)
published_at timestamptz
```

### Related Tables
- `syndication_consent` - Per-story, per-site consent
- `syndication_engagement_events` - Individual engagement tracking
- `syndication_webhook_events` - Webhook delivery audit
- `story_access_log` - All external access
- `story_access_tokens` - Ephemeral tokens
- `story_share_events` - Sharing tracking
- `webhook_subscriptions` - Registered webhooks
- `webhook_delivery_log` - Delivery audit

---

## Analytics & Metrics

### Story Engagement

**story_engagement_events**
**Purpose:** Raw engagement events from all platforms displaying stories
**Events:** views, clicks, shares, likes, time_on_page

**story_engagement_daily**
**Purpose:** Aggregated daily engagement stats for dashboard performance
**Optimized for:** Fast dashboard queries

### Storyteller Analytics

**storyteller_analytics**
**Purpose:** Central hub for all storyteller metrics and analytics data
**Metrics:**
- Total stories, total views, total shares
- Engagement rates
- Theme diversity
- Network reach
- Impact scores

**storyteller_engagement**
**Purpose:** Tracks storyteller engagement metrics over time
**Time series:** Daily/weekly/monthly aggregations

**storyteller_impact_metrics**
**Purpose:** Measures storyteller influence, reach, and community impact
**Derived from:** Story engagement + network connections + theme influence

### Organization & Project Analytics

- `organization_analytics` - Org-level metrics
- `organization_impact_metrics` - Impact from transcripts/stories
- `project_analytics` - Project dashboard data
- `partner_analytics_daily` - Partner engagement per project

### Platform Analytics

- `platform_analytics` - High-level platform KPIs
- `platform_stats_cache` - Cached stats for performance
- `data_quality_metrics` - Data quality tracking

---

## Knowledge Base & RAG

### Vector Search & Semantic Knowledge

**knowledge_documents**
**Purpose:** Metadata for documentation files in the knowledge base
**Count:** 231 documents processed
**Fields:**
```sql
id uuid
file_path text
title text
category text
processed_at timestamptz
chunk_count integer
```

**knowledge_chunks**
**Purpose:** Semantic chunks of documents with vector embeddings for RAG
**Count:** 22,506 chunks generated
**Fields:**
```sql
id uuid
document_id uuid
chunk_text text
chunk_index integer
embedding vector(1536) -- OpenAI embeddings
metadata jsonb
token_count integer
```

**knowledge_extractions**
**Purpose:** Q&A pairs extracted from chunks for SLM training
**Count:** 506 Q&A extractions
**Fields:**
```sql
id uuid
chunk_id uuid
question text
answer text
confidence_score decimal
validated boolean
```

**knowledge_graph**
**Purpose:** Relationships between knowledge chunks
**Use Case:** Graph-based knowledge traversal

### How RAG Works

```
User Query: "How do cultural protocols work?"
    ↓
Embed query with OpenAI (vector)
    ↓
Vector similarity search in knowledge_chunks
    ↓
Retrieve top-k most relevant chunks
    ↓
Include in Claude prompt as context
    ↓
Generate answer with citations
```

**CLI Commands:**
```bash
npm run kb:process  # Process docs → chunks → embeddings
npm run kb:stats    # Show knowledge base statistics
npm run kb:test "query"  # Test RAG search
```

---

## Supporting Tables

### Location & Geography

- `locations` - Location master table
- `profile_locations` - User locations
- `storyteller_locations` - Storyteller locations
- `storyteller_demographics` - Rich demographic + geographic data
- `geographic_impact_patterns` - Impact by region

### Outcomes & Impact (Oonchiumpa Integration)

- `outcomes` - Measured outcomes across services
- `harvested_outcomes` - Outcomes from stories/transcripts
- `document_outcomes` - Evidence linking
- `activities` - Program activities producing outcomes
- `ripple_effects` - Secondary impacts
- `sroi_calculations` - Social ROI
- `sroi_inputs`, `sroi_outcomes` - SROI components
- `theory_of_change` - Logic models
- `cross_sector_insights` - Cross-sector analysis

### Communication & Notifications

- `notifications` - In-app notifications
- `admin_messages` - Admin communications
- `partner_messages` - Partner-storyteller messaging
- `partner_message_templates` - Message templates
- `message_recipients` - Message delivery tracking

### External Integration

- `external_applications` - App registry for API access
- `data_sources` - External data source config
- `content_cache` - Web scraping cache
- `empathy_entries` - Core Empathy Ledger entries
- `empathy_sync_log` - Sync operations log

### Invitations & Recruitment

- `invitations` - Multi-channel recruitment (email, SMS, QR, magic links)
- `organization_invitations` - Org membership invites
- `story_review_invitations` - Story review magic links

### Annual Reports

- `annual_reports` - Report management
- `annual_report_stories` - Story placement in reports
- `report_sections` - Custom content sections
- `report_templates` - Reusable templates
- `report_feedback` - Community feedback

### Specialized Features

- `blog_posts` - Community stories blog
- `testimonials` - User testimonials
- `tour_requests` - World Tour nominations
- `tour_stops` - Tour locations
- `dream_organizations` - Aspirational partners
- `team_members` - Platform team
- `users` - Oonchiumpa staff profiles

### Technical Support

- `audit_logs` - Comprehensive audit trail
- `activity_log` - User activity tracking
- `events`, `events_2024_01`, `events_2025_08`, `events_2025_09` - Event partitioning
- `deletion_requests` - GDPR deletion tracking
- `tenant_ai_policies` - Per-tenant AI config

---

## Database Relationship Diagram (Key Tables)

```
┌─────────────┐
│   tenants   │ (Multi-tenancy root)
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
┌──────▼──────┐                  ┌───────▼────────┐
│organizations│                  │    profiles    │ (251 users)
└──────┬──────┘                  └───────┬────────┘
       │                                 │
       │                          ┌──────▼────────┐
       │                          │ storytellers  │ (235 personas)
       │                          │ profile_id FK │
       │                          └───────┬───────┘
       │                                  │
       ├──────────────────┬───────────────┤
       │                  │               │
┌──────▼──────┐    ┌──────▼──────┐ ┌─────▼─────┐
│  projects   │    │   stories   │ │transcripts│
│             │◄───┤ (315 total) │◄┤           │
└─────────────┘    │storyteller FK│ └───────────┘
                   └──────┬──────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │story_themes │ │story_media│ │story_share │
    │             │ │           │ │  _events   │
    └──────┬──────┘ └───────────┘ └────────────┘
           │
    ┌──────▼──────────┐
    │narrative_themes │
    │(AI-extracted)   │
    └─────────────────┘
```

## Thematic Data Flow

```
1. Content Creation
   transcripts → (AI analysis) → transcript_analysis_results
                                         ↓
                                 themes_extracted jsonb

2. Theme Extraction & Storage
   themes_extracted → narrative_themes (master list)
                   → story_themes (junction table)
                   → stories.cultural_themes[] (array)
                   → stories.themes (jsonb)

3. Theme Association
   storyteller_themes (storyteller signatures)
   theme_associations (co-occurrence)
   organization_theme_analytics (org trends)

4. Theme Evolution
   theme_evolution_tracking
   theme_concept_evolution
   organization_cross_transcript_insights

5. Theme Discovery & Search
   Vector search: knowledge_chunks.embedding
   Full-text: stories.search_vector
   Faceted: stories.cultural_themes[]
```

## Query Examples

### Get all stories with theme "healing"
```sql
SELECT s.id, s.title, s.storyteller_id, st.display_name
FROM stories s
JOIN storytellers st ON s.storyteller_id = st.id
WHERE 'healing' = ANY(s.cultural_themes)
  AND s.status = 'published'
  AND s.is_public = true;
```

### Get storyteller with theme breakdown
```sql
SELECT
  st.display_name,
  jsonb_object_agg(theme, count) as theme_counts
FROM storytellers st
JOIN stories s ON s.storyteller_id = st.id
CROSS JOIN LATERAL unnest(s.cultural_themes) as theme
WHERE st.id = 'storyteller-uuid'
GROUP BY st.id, st.display_name;
```

### Get organization impact metrics
```sql
SELECT
  o.name,
  oim.total_stories,
  oim.total_storytellers,
  oim.primary_themes,
  oim.impact_score
FROM organizations o
JOIN organization_impact_metrics oim ON oim.organization_id = o.id
ORDER BY oim.impact_score DESC;
```

### Vector semantic search
```sql
SELECT
  kc.chunk_text,
  kd.title as document_title,
  kc.embedding <=> query_embedding as distance
FROM knowledge_chunks kc
JOIN knowledge_documents kd ON kd.id = kc.document_id
ORDER BY kc.embedding <=> query_embedding
LIMIT 10;
```

---

## Table Count Summary

**By Category:**
- **Core Story System:** 25 tables
- **Storyteller & Profiles:** 20 tables
- **Thematic & Analysis:** 15 tables
- **Organizations:** 12 tables
- **Projects & Campaigns:** 18 tables
- **Media & Assets:** 15 tables
- **Consent & Safety:** 10 tables
- **AI & Processing:** 12 tables
- **Syndication:** 10 tables
- **Analytics:** 18 tables
- **Knowledge Base:** 4 tables
- **Supporting:** 13 tables

**Total:** 172 public tables

---

## Key Insights

### Multi-Tenant Architecture
- All major tables have `tenant_id` for isolation
- Row-Level Security (RLS) policies enforce access control
- Organizations can have multiple projects and storytellers

### Storyteller-Centric Design
- Storytellers own their stories (OCAP principle)
- Consent tracked at every level
- Cultural safety built into every workflow
- Elder review process integrated

### Theme Management is Flexible
- 3 storage approaches: array, jsonb, junction table
- Supports both AI-extracted and manual curation
- Tracks theme evolution over time
- Enables semantic search via vectors

### AI-First Platform
- Every AI operation tracked and logged
- Multiple AI agents (Claude, OpenAI, custom)
- Vector embeddings for semantic search
- Quality metrics on all AI outputs

### Analytics at Every Level
- Real-time engagement tracking
- Aggregated daily metrics for performance
- Multi-level analytics: story, storyteller, project, org, platform
- Impact measurement integrated throughout

---

## Quick Reference: Finding Data

**Want to find...**
- All stories? → `stories` table
- Who told a story? → `stories.storyteller_id → storytellers.id`
- What themes? → `stories.cultural_themes[]` or `story_themes` junction
- Story analytics? → `story_engagement_daily`
- Storyteller analytics? → `storyteller_analytics`
- AI analysis? → `transcript_analysis_results`
- Cultural safety? → `elder_review_queue`, `moderation_results`
- Consent status? → `consents`, `syndication_consent`
- Where story is published? → `story_distributions`
- Organization stories? → `stories WHERE organization_id = ?`
- Project stories? → `stories WHERE project_id = ?`

**Want to search...**
- By theme? → `WHERE 'theme' = ANY(cultural_themes)`
- Semantically? → Vector search on `knowledge_chunks.embedding`
- Full-text? → `stories.search_vector` tsvector
- By storyteller? → `storytellers JOIN stories`
- By location? → `storyteller_locations` or `stories.location_text`

---

## Database Health & Maintenance

### Current Status (2026-01-06)
✅ **All storyteller data consolidated** (235 storytellers, 201 with avatars)
✅ **All foreign keys verified** (0 orphaned records)
✅ **Stories properly linked** (292 stories → storytellers)
✅ **Knowledge base indexed** (22,506 chunks with embeddings)
✅ **Multi-tenant isolation** working correctly

### Indexes
- Primary keys on all tables
- Foreign key indexes for joins
- `idx_storytellers_profile_id` - Fast profile lookups
- `idx_storytellers_avatar_url` - Avatar filtering
- Vector indexes on `knowledge_chunks.embedding`
- Full-text indexes on `stories.search_vector`

### RLS Policies
- Enabled on all user-facing tables
- Tenant isolation enforced at database level
- Service role bypasses RLS for admin operations

---

## Resources

**Documentation:**
- [TABLE_ALIGNMENT_REPORT.md](./TABLE_ALIGNMENT_REPORT.md) - Recent consolidation
- [DATABASE_ACCESS_GUIDE.md](./DATABASE_ACCESS_GUIDE.md) - Connection guide
- [DATABASE_SETUP_EXPLANATION.md](./DATABASE_SETUP_EXPLANATION.md) - Architecture

**CLI Tools:**
```bash
# Database access
psql -h aws-1-ap-southeast-2.pooler.supabase.com -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb -d postgres

# Knowledge base
npm run kb:process    # Process documentation
npm run kb:stats      # Show statistics
npm run kb:test "Q"   # Test RAG search
```

**Migrations:**
- `supabase/migrations/` - All schema migrations
- Latest: `20260106000004_consolidate_storytellers.sql`
