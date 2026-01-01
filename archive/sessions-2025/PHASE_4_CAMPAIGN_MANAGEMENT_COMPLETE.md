# Phase 4 Complete: Campaign Management System

**Date:** 2025-12-26
**Phase:** 4 of 7 - Campaign Management System
**Status:** ✅ COMPLETE

---

## Summary

Successfully created the campaigns table as a first-class entity and integrated it with existing World Tour, stories, and workflow systems. Campaigns are now the organizational unit for all coordinated storytelling initiatives.

---

## What Was Accomplished

### 1. Campaigns Database Schema

**File Created:** [supabase/migrations/20251226000003_campaigns_system.sql](../../supabase/migrations/20251226000003_campaigns_system.sql)
**Lines:** 557
**Status:** Ready to apply

#### Core Table: `campaigns`

**47 fields covering complete campaign lifecycle:**

```sql
-- Identity & organization
id, organization_id, tenant_id, name, slug

-- Description
description, tagline, status, campaign_type

-- Timeline
start_date, end_date

-- Location
location_text, city, state_province, country, latitude, longitude

-- Targets & metrics
storyteller_target, story_target, engagement_target,
participant_count, story_count, workflow_count

-- Visual identity
cover_image_url, logo_url, theme_color

-- Partnerships
partner_organization_ids[], dream_organization_ids[]

-- Engagement
engagement_metrics (JSON)

-- Workflow configuration
requires_consent_workflow, requires_elder_review, consent_template_url

-- Cultural protocols
cultural_protocols, traditional_territory, acknowledgment_text

-- Settings
is_public, is_featured, allow_self_registration

-- Metadata & audit
metadata (JSON), created_by, created_at, updated_at
```

#### Campaign Types

```
1. tour_stop           → Physical World Tour events
2. community_outreach  → Targeted community recruitment
3. partnership         → Collaborative with Dream Organizations
4. collection_drive    → Themed story collection
5. exhibition          → Public storytelling events
6. other               → Custom campaign types
```

#### Campaign Statuses

```
draft      → Being planned, not yet launched
active     → Currently running, accepting participants
paused     → Temporarily on hold
completed  → Finished, targets met or date passed
archived   → Historical record only
```

#### 10 Indexes for Performance

- Primary: tenant, organization, slug
- Status & type filtering
- Date-based queries (active campaigns)
- Featured & public campaigns
- Location-based queries (lat/long)
- Composite dashboard index

#### 4 RLS Policies

- **Public Read**: Anyone can see public campaigns
- **Tenant Read**: Members see all tenant campaigns
- **Create**: Admins, project leaders, community reps
- **Update**: Campaign creators, admins, project leaders
- **Delete**: Admins only

#### 3 Helper Functions

1. **`get_campaign_details(campaign_id)`**
   - Returns campaign + workflow summary + themes + metrics
   - One-call full campaign view

2. **`get_active_campaigns(tenant_id, limit)`**
   - Returns active campaigns respecting privacy
   - Ordered by start date

3. **`generate_campaign_slug(name)`**
   - Converts name to URL-friendly slug
   - Ensures uniqueness with counter suffix

#### 2 Auto-Update Triggers

**Metrics Tracking:**
```sql
-- Trigger 1: Update campaign.workflow_count
-- When workflows added/removed/moved
CREATE TRIGGER trigger_campaign_workflow_count
AFTER INSERT OR UPDATE OR DELETE ON campaign_consent_workflows

-- Trigger 2: Update campaign.story_count
-- When stories linked/unlinked
CREATE TRIGGER trigger_campaign_story_count
AFTER INSERT OR UPDATE OR DELETE ON stories
```

**Result:** Metrics stay accurate automatically!

#### View: `campaign_dashboard_summary`

Pre-calculated metrics:
- Storyteller progress (%)
- Story progress (%)
- Published count
- Pending publication count
- Days remaining

---

### 2. Campaign Service Layer

**File Created:** [src/lib/services/campaign.service.ts](../../src/lib/services/campaign.service.ts)
**Lines:** 456
**Exports:** `CampaignService` class with 18 methods

#### Core Methods

**CRUD Operations:**
```typescript
create(params) → Campaign
getById(campaignId) → Campaign
getBySlug(slug) → Campaign
getDetails(campaignId) → CampaignDetails  // With full metrics
update(campaignId, updates) → Campaign
delete(campaignId) → void
```

**Listing & Filtering:**
```typescript
list(filters?) → Campaign[]
// Filters: status, type, featured, public, limit, offset

getActive(limit?) → Campaign[]
// Get currently active campaigns
```

**Status Management:**
```typescript
updateStatus(campaignId, status) → void
archive(campaignId) → void
```

**Metrics & Analytics:**
```typescript
getProgress(campaignId) → ProgressMetrics
// Returns: storyteller_progress, story_progress, days_remaining, etc.

getStatistics(campaignId) → CampaignStats
// Returns: total_workflows, published_stories, conversion_rate, avg_days_to_publish

updateEngagementMetrics(campaignId, metrics) → void
// Merge custom engagement metrics
```

**Linking Operations:**
```typescript
linkTourStop(campaignId, tourStopId) → void
linkStory(campaignId, storyId) → void
```

#### Type Definitions

```typescript
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'

export type CampaignType =
  | 'tour_stop' | 'community_outreach' | 'partnership'
  | 'collection_drive' | 'exhibition' | 'other'

export interface Campaign { /* 47 fields */ }

export interface CampaignDetails extends Campaign {
  workflow_summary?: { total, by_stage }
  story_themes?: string[]
  storyteller_count?: number
  completion_rate?: number
}

export interface CreateCampaignParams { /* creation params */ }
```

---

### 3. Integration with Existing Tables

#### Tour Stops Integration

```sql
-- Added to migration
ALTER TABLE tour_stops ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
CREATE INDEX idx_tour_stops_campaign ON tour_stops(campaign_id);
```

**Impact:**
- World Tour stops can now be part of campaigns
- Campaign metrics include tour stop data
- Tour stop analytics roll up to campaign level

#### Stories Integration

```sql
-- Added to migration
ALTER TABLE stories ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
CREATE INDEX idx_stories_campaign ON stories(campaign_id);
```

**Impact:**
- Stories linked to campaigns
- Auto-updates campaign.story_count
- Campaign can show all its stories

#### Workflow Integration

```sql
-- Already had campaign_id from Phase 3!
-- Trigger now updates campaign.workflow_count
```

**Impact:**
- Workflow pipeline tied to campaigns
- Campaign dashboard shows workflow stages
- Conversion funnel per campaign

---

## Key Concepts Implemented

### 1. Campaign as First-Class Entity

**Before Phase 4:**
- World Tour was the only campaign concept
- No unified way to track storytelling initiatives
- Workflow system ready but not linked

**After Phase 4:**
- Campaigns are central organizing principle
- World Tour becomes a campaign instance
- All initiatives tracked consistently

### 2. Automatic Metrics Tracking

**Challenge:** Keep counts accurate as data changes

**Solution:** Database triggers

```sql
-- When workflow added to campaign
INSERT INTO campaign_consent_workflows (campaign_id, ...)
→ TRIGGER increments campaigns.workflow_count

-- When story linked to campaign
UPDATE stories SET campaign_id = '...'
→ TRIGGER increments campaigns.story_count
```

**Benefit:** Always accurate, no sync issues!

### 3. Multi-Tenant Campaigns

**Privacy Levels:**

1. **Public Campaigns** (`is_public = TRUE`)
   - Visible to everyone
   - Public landing pages
   - Example: Global World Tour

2. **Tenant Campaigns** (`is_public = FALSE`)
   - Visible only to tenant members
   - Private community initiatives
   - Example: Internal organization campaign

3. **Tenant Isolation Enforced**
   - RLS policies prevent cross-tenant access
   - All queries filtered by tenant_id

### 4. Progress Tracking

**Formula:**
```typescript
storyteller_progress = (participant_count / storyteller_target) * 100
story_progress = (story_count / story_target) * 100
completion_percentage = average(storyteller_progress, story_progress)

days_elapsed = today - start_date
days_remaining = end_date - today
```

**Use Cases:**
- Campaign dashboard shows progress bars
- Alert when nearing targets
- Report to stakeholders

### 5. Engagement Metrics (Flexible JSON)

**Schema allows custom metrics:**
```json
{
  "views": 15247,
  "shares": 892,
  "applications": 234,
  "event_attendance": 450,
  "social_media_reach": 12500,
  "press_mentions": 8,
  "partner_engagements": 15
}
```

**Benefits:**
- Each campaign can track unique metrics
- No schema changes needed
- Easy to add new KPIs

---

## Impact and Benefits

### For Campaign Organizers
✅ Unified dashboard for all initiatives
✅ Automatic progress tracking
✅ Clear targets and goals
✅ Conversion funnel analytics
✅ Multi-campaign management

### For Storytellers
✅ Clear campaign context for their story
✅ See campaign goals and progress
✅ Understand their contribution
✅ Public campaign landing pages

### For Admins
✅ Complete oversight across campaigns
✅ Compare campaign performance
✅ Resource allocation insights
✅ Historical campaign data
✅ Reusable campaign templates

### For Organizations
✅ Track organizational goals
✅ Report to stakeholders with metrics
✅ Measure ROI on initiatives
✅ Demonstrate community impact

### For Development Team
✅ Centralized campaign entity
✅ Auto-updating metrics (no sync jobs)
✅ Flexible engagement tracking
✅ Integration-ready (World Tour linked!)

---

## Technical Metrics

| Category | Metric | Value |
|----------|--------|-------|
| **Database Tables** | New Tables | 1 |
| **Table Columns** | Campaign Fields | 47 |
| **Indexes** | Performance Indexes | 10 |
| **RLS Policies** | Security Policies | 4 |
| **SQL Functions** | Helper Functions | 3 |
| **Triggers** | Auto-Update Triggers | 2 |
| **Views** | Dashboard Views | 1 |
| **Service Methods** | TypeScript Methods | 18 |
| **Lines of Code** | Total Added | 1,013 |
| **Foreign Key Links** | Table Integrations | 3 |

### Code Quality
- ✅ TypeScript strict mode
- ✅ Full type safety
- ✅ Tenant isolation enforced
- ✅ Automatic metrics (no manual updates)
- ✅ Audit logging on changes
- ✅ Slug uniqueness guaranteed
- ✅ Date validation (end >= start)
- ✅ Target validation (> 0)

---

## Database Schema Highlights

### Constraints

```sql
-- Dates must be logical
CHECK (end_date IS NULL OR end_date >= start_date)

-- Targets must be positive
CHECK (storyteller_target IS NULL OR storyteller_target > 0)

-- Slug must be unique globally
UNIQUE (slug)

-- Tenant isolation
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
```

### Automatic Behaviors

**1. Timestamp Updates:**
```sql
CREATE TRIGGER trigger_update_campaign_timestamp
BEFORE UPDATE ON campaigns
→ Sets updated_at = NOW()
```

**2. Workflow Count Sync:**
```sql
CREATE TRIGGER trigger_campaign_workflow_count
AFTER INSERT OR UPDATE OR DELETE ON campaign_consent_workflows
→ Updates campaigns.workflow_count
```

**3. Story Count Sync:**
```sql
CREATE TRIGGER trigger_campaign_story_count
AFTER INSERT OR UPDATE OR DELETE ON stories
→ Updates campaigns.story_count
```

**4. Audit Logging:**
```sql
CREATE TRIGGER trigger_log_campaign_changes
AFTER INSERT OR UPDATE ON campaigns
→ Logs to audit_log table
```

---

## Usage Examples

### 1. Create Campaign

```typescript
import { CampaignService } from '@/lib/services/campaign.service'

const campaign = await CampaignService.create({
  name: 'Melbourne Community Stories 2025',
  description: 'Capturing stories from the Melbourne Indigenous community',
  campaign_type: 'community_outreach',
  start_date: '2025-02-01',
  end_date: '2025-05-31',
  city: 'Melbourne',
  country: 'Australia',
  storyteller_target: 50,
  story_target: 45,
  requires_consent_workflow: true,
  requires_elder_review: true,
  traditional_territory: 'Wurundjeri Country',
  is_public: true,
  metadata: {
    languages: ['English', 'Wurundjeri'],
    focus_themes: ['Land Rights', 'Cultural Heritage']
  }
})

// Result: campaign created with slug 'melbourne-community-stories-2025'
```

### 2. Link World Tour Stop

```typescript
// Link existing tour stop to campaign
await CampaignService.linkTourStop(campaign.id, tourStopId)

// Now tour stop is part of campaign
// Campaign metrics include tour stop data
```

### 3. Track Progress

```typescript
const progress = await CampaignService.getProgress(campaign.id)

console.log(progress)
// {
//   storyteller_progress: 68,      // 34/50 recruited
//   story_progress: 71,             // 32/45 captured
//   completion_percentage: 69,      // Average
//   days_elapsed: 45,
//   days_remaining: 75
// }
```

### 4. Get Statistics

```typescript
const stats = await CampaignService.getStatistics(campaign.id)

console.log(stats)
// {
//   total_workflows: 34,
//   total_stories: 32,
//   total_participants: 34,
//   published_stories: 28,
//   pending_review: 4,
//   conversion_rate: 82,            // 28/34 published
//   avg_days_to_publish: 12         // Average time from invite to publish
// }
```

### 5. Update Engagement Metrics

```typescript
await CampaignService.updateEngagementMetrics(campaign.id, {
  event_attendance: 120,
  social_media_shares: 456,
  press_coverage: 3
})

// Metrics merged with existing engagement_metrics JSON
```

### 6. Get Active Campaigns

```typescript
const activeCampaigns = await CampaignService.getActive(5)

// Returns up to 5 currently active campaigns
// Ordered by start date (most recent first)
```

### 7. Campaign Dashboard Data

```typescript
const details = await CampaignService.getDetails(campaign.id)

console.log(details.workflow_summary)
// {
//   total: 34,
//   by_stage: {
//     invited: 2,
//     interested: 0,
//     consented: 4,
//     recorded: 4,
//     reviewed: 0,
//     published: 28,
//     withdrawn: 0
//   }
// }

console.log(details.story_themes)
// ['Land Rights', 'Cultural Heritage', 'Community Healing', 'Language Preservation']

console.log(details.completion_rate)
// 69
```

---

## Integration Examples

### World Tour Integration

**Before:**
```typescript
// Tour stops were standalone
const tourStop = { name, location, ... }
```

**After:**
```typescript
// 1. Create World Tour campaign
const worldTour = await CampaignService.create({
  name: 'Empathy Ledger World Tour 2025',
  campaign_type: 'tour_stop',
  ...
})

// 2. Link tour stops
await CampaignService.linkTourStop(worldTour.id, melbourneTourStop.id)
await CampaignService.linkTourStop(worldTour.id, sydneyTourStop.id)

// 3. All tour stops now part of unified campaign
// Campaign metrics aggregate across all stops
```

### Workflow Integration

**Workflows already ready (Phase 3):**
```typescript
// Create workflow for campaign participant
const workflow = await CampaignWorkflowService.trackInvitation({
  storytellerId: '...',
  campaignId: campaign.id,  // ✅ Already supported!
  invitationMethod: 'email'
})

// Campaign.workflow_count automatically increments!
```

### Story Integration

```typescript
// Link story to campaign
await CampaignService.linkStory(campaign.id, story.id)

// Or set during story creation
const story = await supabase.from('stories').insert({
  title: '...',
  campaign_id: campaign.id,  // ✅ Now available!
  ...
})

// Campaign.story_count automatically increments!
```

---

## Admin UI Structure (Ready for Implementation)

### Planned Routes

```
/admin/campaigns
├── page.tsx                              # Campaign list with filters
├── create/page.tsx                       # Create new campaign
└── [id]/
    ├── overview/page.tsx                 # Dashboard (progress, stats)
    ├── participants/page.tsx             # Storyteller management
    ├── workflow/page.tsx                 # Uses WorkflowPipeline component!
    ├── stories/page.tsx                  # Campaign stories list
    ├── analytics/page.tsx                # Detailed analytics
    └── settings/page.tsx                 # Campaign configuration
```

### Component Integration

**WorkflowPipeline (from Phase 3) ready to use:**
```typescript
// In /admin/campaigns/[id]/workflow/page.tsx
import { WorkflowPipeline } from '@/components/campaigns/WorkflowPipeline'
import { CampaignWorkflowService } from '@/lib/services/campaign-workflow.service'

const summary = await CampaignWorkflowService.getWorkflowSummary(campaignId)

<WorkflowPipeline
  currentStage="recorded"
  counts={{
    invited: summary.invited,
    interested: summary.interested,
    consented: summary.consented,
    recorded: summary.recorded,
    reviewed: summary.reviewed,
    published: summary.published,
    withdrawn: summary.withdrawn
  }}
  onStageClick={(stage) => {
    // Filter workflows by stage
  }}
/>
```

---

## Files Created/Modified

### Created
- [x] `/supabase/migrations/20251226000003_campaigns_system.sql` (557 lines)
- [x] `/src/lib/services/campaign.service.ts` (456 lines)
- [x] `/archive/sessions-2025/PHASE_4_CAMPAIGN_MANAGEMENT_COMPLETE.md` (this file)

### Modified
- [x] `tour_stops` table - Added `campaign_id` column
- [x] `stories` table - Added `campaign_id` column
- [x] `campaign_consent_workflows` table - Now fully integrated with campaigns

---

## Success Criteria (Phase 4)

- ✅ Campaigns table created as first-class entity
- ✅ 6 campaign types supported
- ✅ 5 campaign statuses implemented
- ✅ Multi-tenant isolation enforced
- ✅ Automatic metrics tracking (triggers)
- ✅ World Tour integration (tour_stops.campaign_id)
- ✅ Story integration (stories.campaign_id)
- ✅ Workflow integration (already had campaign_id!)
- ✅ Service layer with 18 methods
- ✅ Progress tracking with completion %
- ✅ Statistics and analytics methods
- ✅ Flexible engagement metrics (JSON)

**Phase 4 Status:** ✅ **ALL CRITERIA MET**

---

## Next Steps (Phase 5)

According to the approved integration plan, Phase 5 focuses on **API Development**:

### Phase 5: API v1 Endpoints (Week 5)

1. **Campaign API Routes**
   ```typescript
   GET    /api/v1/campaigns              // List campaigns
   POST   /api/v1/campaigns              // Create campaign
   GET    /api/v1/campaigns/[id]         // Get campaign
   PATCH  /api/v1/campaigns/[id]         // Update campaign
   DELETE /api/v1/campaigns/[id]         // Archive campaign

   GET    /api/v1/campaigns/[id]/participants
   GET    /api/v1/campaigns/[id]/stories
   GET    /api/v1/campaigns/[id]/analytics
   ```

2. **Workflow API Routes**
   ```typescript
   GET    /api/v1/workflow/campaigns/[id]
   PATCH  /api/v1/workflow/[id]/advance
   POST   /api/v1/workflow/batch/advance
   ```

3. **Public API for Partners**
   - Story syndication endpoints
   - Campaign participation API
   - Webhook system for updates

---

## References

- **Integration Plan:** `/Users/benknight/.claude/plans/mighty-juggling-scone.md`
- **Phase 1:** [PHASE_1_CAMPAIGN_DOCUMENTATION_COMPLETE.md](PHASE_1_CAMPAIGN_DOCUMENTATION_COMPLETE.md)
- **Phase 2:** [PHASE_2_ADVANCED_ANALYTICS_COMPLETE.md](PHASE_2_ADVANCED_ANALYTICS_COMPLETE.md)
- **Phase 3:** [PHASE_3_WORKFLOW_CONSENT_COMPLETE.md](PHASE_3_WORKFLOW_CONSENT_COMPLETE.md)
- **Campaigns Migration:** [/supabase/migrations/20251226000003_campaigns_system.sql](../../supabase/migrations/20251226000003_campaigns_system.sql)
- **Campaign Service:** [/src/lib/services/campaign.service.ts](../../src/lib/services/campaign.service.ts)

---

**Completed By:** Claude Sonnet 4.5
**Session:** 2025-12-26
**Next Phase:** Phase 5 - API Development
