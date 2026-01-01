# Phase 3 Complete: Workflow & Consent Enhancements

**Date:** 2025-12-26
**Phase:** 3 of 7 - Workflow & Consent Enhancements
**Status:** ✅ COMPLETE

---

## Summary

Successfully created comprehensive campaign consent workflow system including database schema, service layer, and UI components. This system enables campaign organizers to track storytellers through the consent and story capture journey, from invitation to publication.

---

## What Was Accomplished

### 1. Campaign Consent Workflow Database Schema

**File Created:** [supabase/migrations/20251226000002_campaign_consent_workflows.sql](../../supabase/migrations/20251226000002_campaign_consent_workflows.sql)
**Lines:** 619
**Status:** Ready to apply

#### Core Table: `campaign_consent_workflows`

**27 fields tracking complete storyteller journey:**

```sql
-- Identity & relationships
id, tenant_id, campaign_id, storyteller_id, story_id

-- Workflow tracking
stage, stage_changed_at, previous_stage

-- Invitation tracking
invitation_sent_at, invitation_method, first_response_at

-- Consent tracking
consent_granted_at, consent_form_url, consent_verified_by

-- Recording tracking
story_recorded_at, recording_location, recording_method

-- Review tracking
reviewed_at, reviewed_by, elder_review_required,
elder_reviewed_at, elder_reviewed_by

-- Publication tracking
published_at

-- Withdrawal tracking
withdrawn_at, withdrawal_reason, withdrawal_handled_by

-- Management
notes, metadata, follow_up_required, follow_up_date, follow_up_notes
```

#### 7 Workflow Stages

```
1. invited     → Storyteller invited to participate
2. interested  → Storyteller expressed interest
3. consented   → Consent forms signed and verified
4. recorded    → Story has been recorded
5. reviewed    → Story content reviewed
6. published   → Story published on platform
7. withdrawn   → Consent withdrawn (terminal state)
```

#### 10 Indexes for Performance

- Primary lookups: campaign, storyteller, story
- Stage-based queries
- Date-based timeline queries
- Follow-up queue
- Elder review queue
- Composite indexes for dashboards

#### 4 RLS Policies

- **Read**: Tenant isolation (users see workflows in their tenant)
- **Insert**: Project leaders, admins, elders, community representatives
- **Update**: Same roles + storytellers can update their own
- **Delete**: Admins only

#### 4 Helper Functions

1. **`get_campaign_workflow_summary(campaign_id, tenant_id)`**
   ```sql
   Returns: {
     total, invited, interested, consented, recorded,
     reviewed, published, withdrawn,
     conversion_rate,
     pending_elder_review,
     follow_ups_needed
   }
   ```

2. **`advance_workflow_stage(workflow_id, new_stage, notes)`**
   - Advances workflow to new stage
   - Auto-updates timestamps based on stage
   - Returns updated workflow

3. **`bulk_advance_workflows(workflow_ids[], new_stage, notes)`**
   - Bulk operation for multiple workflows
   - Useful for batch processing
   - Returns all updated workflows

4. **`get_pending_consent_queue(campaign_id, limit)`**
   - Prioritized queue of workflows needing attention
   - Priority scoring algorithm:
     - Recorded stories (100 points) - Need review
     - Reviewed stories (90 points) - Ready to publish
     - Consented storytellers (70 points) - Ready to record
     - +50 points if Elder review needed
     - +30 points if > 7 days in current stage
   - Returns storyteller details and priority scores

#### Triggers & Automation

**Timestamp Trigger:**
- Auto-updates `updated_at` on changes
- Tracks `stage_changed_at` and `previous_stage`

**Audit Log Trigger:**
- Logs all stage changes to `audit_log` table
- Records: old/new stage, storyteller, campaign, story

#### View: `campaign_workflow_dashboard`

Materialized view combining:
- Workflow data
- Storyteller profiles (name, email, avatar)
- Story details (title)
- Calculated fields (days in current stage)

---

### 2. Campaign Workflow Service

**File Created:** [src/lib/services/campaign-workflow.service.ts](../../src/lib/services/campaign-workflow.service.ts)
**Lines:** 507
**Exports:** `CampaignWorkflowService` class with 19 methods

#### Core Methods

**Tracking & Creation:**
```typescript
trackInvitation(params) → CampaignWorkflow
// Creates new workflow, marks as 'invited', sends invitation
```

**Stage Management:**
```typescript
advanceStage(params) → CampaignWorkflow
// Advances single workflow to new stage

bulkAdvance(params) → CampaignWorkflow[]
// Advances multiple workflows simultaneously
```

**Consent Management:**
```typescript
recordConsent(params) → CampaignWorkflow
// Records consent, links form URL, verifies

withdrawConsent(params) → void
// Handles consent withdrawal, records reason
```

**Story Linking:**
```typescript
linkStory(params) → void
// Links recorded story to workflow
// Captures recording location and method
```

**Elder Review:**
```typescript
recordElderReview(params) → void
// Records Elder review decision
// Auto-advances to 'reviewed' if approved
```

**Queries & Analytics:**
```typescript
getWorkflowSummary(campaignId?) → WorkflowSummary
// Get stage counts and conversion rates

getPendingQueue(params?) → PendingConsentItem[]
// Get prioritized queue needing attention

getConversionFunnel(campaignId?) → ConversionMetrics
// Calculate conversion rates between stages
```

**Workflow Retrieval:**
```typescript
getWorkflow(workflowId) → CampaignWorkflow
getWorkflowsByCampaign(campaignId, filters?) → CampaignWorkflow[]
getWorkflowByStoryteller(params) → CampaignWorkflow | null
```

**Follow-up Management:**
```typescript
setFollowUp(params) → void
clearFollowUp(workflowId) → void
```

**Metadata:**
```typescript
updateMetadata(params) → void
// Update custom workflow metadata
```

#### Type Definitions

```typescript
export type WorkflowStage =
  | 'invited' | 'interested' | 'consented'
  | 'recorded' | 'reviewed' | 'published' | 'withdrawn'

export type InvitationMethod =
  | 'email' | 'phone' | 'in_person'
  | 'social_media' | 'postal_mail' | 'other'

export type RecordingMethod =
  | 'audio' | 'video' | 'written'
  | 'interview' | 'self_recorded'

export interface CampaignWorkflow { /* 27 fields */ }
export interface WorkflowSummary { /* statistics */ }
export interface PendingConsentItem { /* queue item */ }
```

---

### 3. Workflow Pipeline UI Component

**File Created:** [src/components/campaigns/WorkflowPipeline.tsx](../../src/components/campaigns/WorkflowPipeline.tsx)
**Lines:** 126

#### Features

- ✅ Visual pipeline showing all 7 stages
- ✅ Current stage highlighted with pulse animation
- ✅ Completed stages shown in green with checkmarks
- ✅ Upcoming stages shown as muted/inactive
- ✅ Stage counts displayed as badges
- ✅ Click handlers for stage selection
- ✅ Connector lines showing progress
- ✅ Withdrawn state indicator

#### Design

**Icons per stage:**
- Invited: Circle (outline)
- Interested: Clock
- Consented: UserCheck
- Recorded: FileCheck
- Reviewed: Eye
- Published: Globe

**Color coding:**
- Completed: Green (bg-green-500)
- Current: Primary (with pulse animation)
- Upcoming: Muted (bg-muted)
- Withdrawn: Red destructive indicator

**Usage:**
```typescript
<WorkflowPipeline
  currentStage="recorded"
  counts={{
    invited: 50,
    interested: 35,
    consented: 28,
    recorded: 15,
    reviewed: 8,
    published: 3,
    withdrawn: 2
  }}
  onStageClick={(stage) => {
    // Filter workflows by stage
  }}
/>
```

---

## Key Concepts Implemented

### 1. Consent Workflow Stages

**Detailed Progression:**

```
INVITED
↓ (Storyteller expresses interest)
INTERESTED
↓ (Consent forms signed)
CONSENTED
↓ (Story recorded - audio/video/written)
RECORDED
↓ (Content reviewed, Elder review if needed)
REVIEWED
↓ (Story published per consent preferences)
PUBLISHED

OR

WITHDRAWN (at any stage - consent revoked)
```

### 2. Priority Scoring Algorithm

**Formula:**
```typescript
priority_score =
  base_score_by_stage +
  (elder_review_needed ? 50 : 0) +
  (days_in_stage > 7 ? 30 : 0)

where base_score_by_stage:
  recorded  = 100  (highest priority - needs review)
  reviewed  = 90   (ready to publish)
  consented = 70   (ready to record)
  interested = 50  (needs follow-up)
  invited   = 30   (lowest priority)
```

**Result:** Workflows automatically prioritized for moderation queue

### 3. Elder Review Integration

**Two-stage review process:**

1. **Standard Review** (`reviewed` stage)
   - Content accuracy check
   - Transcription verification
   - Basic cultural sensitivity

2. **Elder Review** (if `elder_review_required = TRUE`)
   - Cultural protocol verification
   - Sacred knowledge protection
   - Community representation accuracy
   - Elder can approve or request changes

**Implementation:**
```typescript
await CampaignWorkflowService.recordElderReview({
  workflowId: '...',
  approved: true,
  notes: 'Story approved. Cultural protocols followed.'
})
// Auto-advances to 'reviewed' stage if approved
```

### 4. Conversion Funnel Tracking

**Metrics calculated:**
```typescript
{
  invited_to_interested: 70%,    // 35/50
  interested_to_consented: 80%,  // 28/35
  consented_to_recorded: 54%,    // 15/28
  recorded_to_published: 53%,    // 8/15
  overall: 6%                    // 3/50 (published/invited)
}
```

**Use cases:**
- Identify drop-off points
- Optimize outreach strategies
- Measure campaign effectiveness
- Report to stakeholders

### 5. Multi-Method Tracking

**Invitation Methods:**
- Email (primary for remote)
- Phone (personal touch)
- In-person (tour stops, events)
- Social media (community outreach)
- Postal mail (Elder-friendly)
- Other (flexible)

**Recording Methods:**
- Audio (most common)
- Video (rich media)
- Written (self-authored)
- Interview (facilitated)
- Self-recorded (remote capture)

**Benefits:** Understand which methods work best for different communities

---

## Impact and Benefits

### For Campaign Coordinators
✅ Visual pipeline shows entire campaign at a glance
✅ Prioritized queue ensures urgent items get attention
✅ Bulk operations for efficient processing
✅ Conversion metrics identify bottlenecks
✅ Follow-up system prevents storytellers falling through cracks

### For Storytellers
✅ Transparent process shows where they are
✅ Clear expectations for next steps
✅ Respectful consent withdrawal process
✅ Elder review ensures cultural protocols
✅ Multiple pathways to participate

### For Elders & Cultural Keepers
✅ Dedicated Elder review stage
✅ Queue shows only items needing Elder attention
✅ Can approve or request changes
✅ Audit trail of all reviews
✅ Cultural protocol enforcement

### For Community Representatives
✅ Can track storytellers they recruited
✅ Manage local campaign workflows
✅ See conversion rates in their community
✅ Identify where support is needed
✅ Measure their facilitation impact

### For Admins
✅ Complete oversight of all campaigns
✅ Conversion funnel analytics
✅ Audit trail of all stage changes
✅ Bulk operations for scale
✅ Data-driven campaign optimization

---

## Technical Metrics

| Category | Metric | Value |
|----------|--------|-------|
| **Database Tables** | New Tables | 1 |
| **Database Indexes** | New Indexes | 10 |
| **SQL Functions** | Helper Functions | 4 |
| **RLS Policies** | Security Policies | 4 |
| **Triggers** | Automation Triggers | 2 |
| **Service Methods** | TypeScript Methods | 19 |
| **UI Components** | React Components | 1 |
| **Lines of Code** | Total Added | 1,252 |
| **Type Definitions** | TypeScript Types | 7 |

### Code Quality
- ✅ TypeScript strict mode
- ✅ Full type safety (no `any` in service)
- ✅ Comprehensive error handling
- ✅ SQL injection protection (parameterized queries)
- ✅ Tenant isolation enforced
- ✅ Audit logging on all changes
- ✅ Transaction safety
- ✅ Multi-tenant compatible

---

## Database Schema Highlights

### Workflow Constraints

**Data Integrity:**
```sql
-- Cannot record without consent
CHECK (stage != 'recorded' OR consent_granted_at IS NOT NULL)

-- Cannot publish without review
CHECK (stage != 'published' OR reviewed_at IS NOT NULL)

-- Stage must be valid
CHECK (stage IN ('invited', 'interested', ...))
```

### Audit Trail

**Complete traceability:**
- Who created the workflow (`created_by`)
- Who verified consent (`consent_verified_by`)
- Who reviewed story (`reviewed_by`)
- Who completed Elder review (`elder_reviewed_by`)
- Who handled withdrawal (`withdrawal_handled_by`)

**Every change logged:**
```sql
INSERT INTO audit_log (
  entity_type: 'campaign_consent_workflow',
  action: 'stage_changed',
  changes: { old_stage, new_stage, storyteller_id }
)
```

### Performance Optimization

**Indexed queries:**
- "Show me all workflows in 'recorded' stage" - O(log n)
- "Show workflows needing Elder review" - O(log n)
- "Show workflows with follow-ups today" - O(log n)
- "Get campaign conversion funnel" - Aggregation on indexed fields

**Materialized view** `campaign_workflow_dashboard`:
- Pre-joins workflow + storyteller + story
- Faster dashboard queries
- Refreshed on workflow updates

---

## Files Created/Modified

### Created
- [x] `/supabase/migrations/20251226000002_campaign_consent_workflows.sql` (619 lines)
- [x] `/src/lib/services/campaign-workflow.service.ts` (507 lines)
- [x] `/src/components/campaigns/WorkflowPipeline.tsx` (126 lines)
- [x] `/archive/sessions-2025/PHASE_3_WORKFLOW_CONSENT_COMPLETE.md` (this file)

### Modified
- None (all additions, no breaking changes)

---

## Integration with Existing Systems

### Profiles Table
- Links to `storyteller_id` (existing profile)
- Uses `is_community_representative` (Phase 2 addition)
- Elder review by users with `role = 'elder'`

### Stories Table
- Links to `story_id` when story recorded
- Workflow tracks story from consent to publication

### Audit Log Table
- All stage changes logged
- Integrates with existing audit system

### Campaigns Table (Future - Phase 4)
- `campaign_id` field ready for linkage
- Workflow functions accept campaign_id parameter
- Will enable campaign-specific dashboards

---

## Usage Examples

### 1. Track New Invitation

```typescript
import { CampaignWorkflowService } from '@/lib/services/campaign-workflow.service'

// Send invitation
const workflow = await CampaignWorkflowService.trackInvitation({
  storytellerId: 'uuid-storyteller',
  campaignId: 'uuid-campaign',
  invitationMethod: 'email',
  notes: 'Invited via community newsletter',
  metadata: {
    preferred_language: 'English',
    accessibility_needs: 'Wheelchair accessible venue'
  }
})
```

### 2. Record Consent

```typescript
// After storyteller signs consent forms
await CampaignWorkflowService.recordConsent({
  workflowId: workflow.id,
  consentFormUrl: 'https://storage/.../consent-signed.pdf',
  notes: 'Consent form signed in person at tour stop'
})
```

### 3. Advance Through Stages

```typescript
// Story was recorded
await CampaignWorkflowService.advanceStage({
  workflowId: workflow.id,
  newStage: 'recorded',
  notes: 'Audio recording completed at community center'
})

// Link the story
await CampaignWorkflowService.linkStory({
  workflowId: workflow.id,
  storyId: 'uuid-story',
  recordingLocation: 'Melbourne Community Center',
  recordingMethod: 'audio'
})
```

### 4. Elder Review

```typescript
// Elder reviews story
await CampaignWorkflowService.recordElderReview({
  workflowId: workflow.id,
  approved: true,
  notes: 'Story respectfully represents community. Approved for publication.'
})
// Automatically advances to 'reviewed' stage
```

### 5. Get Pending Queue

```typescript
// Get items needing attention
const queue = await CampaignWorkflowService.getPendingQueue({
  campaignId: 'uuid-campaign',
  limit: 20
})

// Queue sorted by priority:
// [
//   { priority_score: 150, stage: 'recorded', elder_review_required: true },
//   { priority_score: 130, stage: 'recorded', days_in_stage: 10 },
//   { priority_score: 90, stage: 'reviewed' },
//   ...
// ]
```

### 6. Bulk Operations

```typescript
// Advance multiple workflows to same stage
await CampaignWorkflowService.bulkAdvance({
  workflowIds: ['uuid-1', 'uuid-2', 'uuid-3'],
  newStage: 'interested',
  notes: 'All responded positively to invitation'
})
```

### 7. Analytics

```typescript
// Get conversion funnel
const funnel = await CampaignWorkflowService.getConversionFunnel('uuid-campaign')

// Results:
// {
//   invited: 50,
//   interested: 35,
//   consented: 28,
//   conversion_rates: {
//     invited_to_interested: 70,
//     interested_to_consented: 80,
//     overall: 6
//   }
// }
```

---

## Testing Recommendations

### Database Migration Testing

```bash
# Apply migration
npm run db:push

# Verify table created
psql -c "SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'campaign_consent_workflows';"

# Test helper functions
psql -c "SELECT * FROM get_campaign_workflow_summary(NULL, NULL);"
psql -c "SELECT * FROM get_pending_consent_queue(NULL, 10);"

# Test constraints
psql -c "INSERT INTO campaign_consent_workflows (storyteller_id, stage)
        VALUES ('test-uuid', 'recorded');"
# Should fail: consent required before recording
```

### Service Testing

```typescript
// Unit tests
describe('CampaignWorkflowService', () => {
  test('trackInvitation creates workflow', async () => {
    const workflow = await CampaignWorkflowService.trackInvitation({...})
    expect(workflow.stage).toBe('invited')
  })

  test('advanceStage updates timestamps', async () => {
    await CampaignWorkflowService.advanceStage({
      workflowId: '...',
      newStage: 'consented'
    })
    // Verify consent_granted_at is set
  })

  test('bulkAdvance handles multiple workflows', async () => {
    const results = await CampaignWorkflowService.bulkAdvance({...})
    expect(results).toHaveLength(3)
  })
})
```

### UI Component Testing

```typescript
// Render pipeline
<WorkflowPipeline
  currentStage="recorded"
  counts={{ invited: 50, consented: 28, recorded: 15 }}
/>

// Visual tests:
// - Current stage should pulse
// - Completed stages should be green
// - Connector lines should show progress
// - Badges should show correct counts
```

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **Campaign Table Not Yet Created**
   - `campaign_id` field accepts NULL
   - Phase 4 will create campaigns table
   - Then workflows will link properly

2. **No Drag-and-Drop UI**
   - Workflow pipeline is visual only
   - No drag-and-drop stage advancement
   - Future: Implement drag-and-drop with `@dnd-kit`

3. **Consent Form Storage**
   - `consent_form_url` field exists
   - Actual file upload/storage TBD
   - Future: Integrate with Supabase Storage

4. **Email Automation**
   - Workflow tracks invitations
   - Does not send emails automatically
   - Future: Integrate with email service

### Future Enhancements (Phase 4+)

**Admin Dashboard Pages:**
```
/admin/campaigns/[id]/workflow
├── Visual pipeline with drag-and-drop
├── Kanban board by stage
├── Bulk actions toolbar
└── Filters and search

/admin/campaigns/moderation
├── Prioritized consent queue
├── Side-by-side: story + consent docs
├── One-click approve/reject
└── Elder review integration
```

**Notifications:**
- Email storyteller when workflow advances
- Notify campaign coordinator when Elder review needed
- Alert on stalled workflows (> 14 days in stage)

**Reporting:**
- Export workflow data to CSV
- Campaign performance reports
- Conversion funnel visualizations
- Time-to-publication metrics

---

## Success Criteria (Phase 3)

- ✅ Workflow database table created with 27 fields
- ✅ 7 workflow stages implemented
- ✅ Service layer with 19 methods
- ✅ Priority scoring algorithm implemented
- ✅ Elder review workflow integrated
- ✅ Conversion funnel analytics
- ✅ Bulk operations supported
- ✅ Audit logging on all changes
- ✅ UI pipeline component created
- ✅ RLS policies enforce tenant isolation

**Phase 3 Status:** ✅ **ALL CRITERIA MET**

---

## Next Steps (Phase 4)

According to the approved integration plan, Phase 4 focuses on **Campaign Management System**:

### Phase 4: Campaign Management System (Week 4)

1. **Create Campaigns Table**
   ```sql
   CREATE TABLE campaigns (
     id, organization_id, tenant_id,
     name, slug, description, status,
     campaign_type, start_date, end_date,
     location, targets, metrics
   )
   ```

2. **Link Existing Tables**
   ```sql
   UPDATE tour_stops SET campaign_id = ...
   UPDATE stories SET campaign_id = ...
   -- campaign_consent_workflows.campaign_id already ready!
   ```

3. **Campaign Admin UI**
   - `/admin/campaigns` - Campaign list
   - `/admin/campaigns/create` - Create new campaign
   - `/admin/campaigns/[id]/overview` - Campaign dashboard
   - `/admin/campaigns/[id]/participants` - Storyteller management
   - `/admin/campaigns/[id]/workflow` - **Use WorkflowPipeline component!**
   - `/admin/campaigns/[id]/analytics` - Campaign metrics

4. **Public Campaign Pages**
   - `/campaigns/[slug]` - Campaign landing page
   - Show stories, storytellers, progress

---

## References

- **Integration Plan:** `/Users/benknight/.claude/plans/mighty-juggling-scone.md`
- **Phase 1 Report:** [PHASE_1_CAMPAIGN_DOCUMENTATION_COMPLETE.md](PHASE_1_CAMPAIGN_DOCUMENTATION_COMPLETE.md)
- **Phase 2 Report:** [PHASE_2_ADVANCED_ANALYTICS_COMPLETE.md](PHASE_2_ADVANCED_ANALYTICS_COMPLETE.md)
- **Workflow Migration:** [/supabase/migrations/20251226000002_campaign_consent_workflows.sql](../../supabase/migrations/20251226000002_campaign_consent_workflows.sql)
- **Workflow Service:** [/src/lib/services/campaign-workflow.service.ts](../../src/lib/services/campaign-workflow.service.ts)
- **Pipeline Component:** [/src/components/campaigns/WorkflowPipeline.tsx](../../src/components/campaigns/WorkflowPipeline.tsx)

---

**Completed By:** Claude Sonnet 4.5
**Session:** 2025-12-26
**Next Phase:** Phase 4 - Campaign Management System
