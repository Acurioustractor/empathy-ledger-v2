# Sprint 5: Organization Tools - STATUS AUDIT

**Planned Dates:** March 3-14, 2026
**Current Date:** January 5, 2026
**Status:** Auditing existing components
**Priority:** P1 (Critical for Snow Foundation partnership)

---

## 🎯 Sprint Mission

Enable organizations to manage projects, recruit storytellers, curate stories, Elder review workflows, consent tracking, and basic analytics.

---

## 📋 COMPONENT AUDIT

### Day 41-42: Project Management Dashboard

**Requirement:**
- Project listing with search/filters
- Create new project form
- Edit project details
- Project timeline visualization
- Progress tracking

**Status:** ✅ **COMPLETE** (Existing)

**File:** `src/components/admin/ProjectManagement.tsx` (2,708 lines)

**Features Found:**
- ✅ Project listing with grid/list views
- ✅ Search by name, description, organization
- ✅ Filter by status (active/completed/paused/cancelled)
- ✅ Create project dialog
- ✅ Edit project dialog
- ✅ Delete project capability
- ✅ Project details view with tabs
- ✅ Statistics display (story count, participant count, engagement)
- ✅ Organization/tenant association
- ✅ Multi-tenant support

**Sub-components:**
- ✅ `ProjectDetailsView.tsx` - Project overview
- ✅ `ProjectStoriesTab.tsx` - Stories management
- ✅ `ProjectStorytellersTab.tsx` - Storyteller management
- ✅ `ProjectMediaTab.tsx` - Media assets
- ✅ `ProjectTranscriptsTab.tsx` - Transcripts

**Missing Features:**
- ⏳ Timeline visualization (Gantt chart or timeline view)
- ⏳ Progress percentage tracking
- ⏳ Milestone management

**Verdict:** 90% complete, timeline viz needed

---

### Day 43-44: Storyteller Recruitment & Management

**Requirement:**
- Email/SMS invitations
- QR code generation
- Magic link generation
- Invitation tracking
- Storyteller roster
- Assign to projects
- Consent form management

**Status:** ✅ **75% COMPLETE** (Existing)

**File:** `src/components/admin/StorytellerManagement.tsx`

**Features Found:**
- ✅ Storyteller listing with comprehensive stats
- ✅ Search by name, email, bio, background
- ✅ Filter by status, featured, elder, project, location, organization
- ✅ Sort by multiple fields
- ✅ Bulk selection
- ✅ Featured/Elder status toggles
- ✅ Verification status display
- ✅ Statistics (stories shared, engagement, followers, views)
- ✅ Language and specialties display
- ✅ Preferences (availability, travel, virtual sessions)

**Missing Features:**
- ❌ Email invitation form/dialog
- ❌ SMS invitation capability
- ❌ QR code generator
- ❌ Magic link generator
- ❌ Invitation tracking table
- ❌ Consent form upload/management
- ❌ Assign to project workflow

**Verdict:** Management exists, recruitment features needed

---

### Day 45: Story Assignment & Curation

**Requirement:**
- Assign stories to projects
- Tag stories with project themes
- Feature/unfeature stories
- Organize into campaigns
- Quality review queue
- Approve/reject submissions

**Status:** ⏳ **30% COMPLETE**

**Existing:**
- ✅ Story listing exists in ProjectStoriesTab.tsx
- ✅ Story details display
- ✅ Story search/filter

**Missing:**
- ❌ Assign story to project dialog
- ❌ Project theme tagging UI
- ❌ Feature toggle for stories
- ❌ Campaign organizer
- ❌ Quality review queue
- ❌ Approve/reject workflow
- ❌ Story curation dashboard

**Files to Create:**
- `src/components/admin/StoryCuration.tsx`
- `src/components/admin/AssignToProject.tsx`
- `src/components/admin/ProjectThemeTagger.tsx`
- `src/components/admin/CampaignOrganizer.tsx`
- `src/components/admin/QualityReviewQueue.tsx`

**Verdict:** Needs significant new components

---

### Day 46-47: Elder Review Dashboard

**Requirement:**
- Pending review queue
- Story preview
- Cultural concern categories
- Annotation tools
- Approve/reject workflow
- Cultural guidance notes
- Request changes
- Review history
- Escalation to elder council

**Status:** ❌ **10% COMPLETE**

**Existing:**
- ✅ `StoryReviewModal.tsx` exists (basic review UI)
- ✅ `ContentModeration.tsx` exists (AI moderation)
- ⏳ Elder review queue mentioned in ProjectManagement.tsx

**Missing (Major Gap):**
- ❌ ElderReviewDashboard component
- ❌ Review queue with priority sorting
- ❌ Cultural concern tagging
- ❌ Annotation tools
- ❌ Approval workflow with reasons
- ❌ Cultural guidance notes field
- ❌ Request changes workflow
- ❌ Review history timeline
- ❌ Escalation mechanism

**Database Tables:**
- ✅ `elder_review_queue` (16 cols) - EXISTS
- ✅ `elder_review_dashboard` (19 cols) - EXISTS
- ✅ `moderation_results` - EXISTS

**Files to Create:**
- `src/components/elder/ElderReviewDashboard.tsx`
- `src/components/elder/ReviewQueue.tsx`
- `src/components/elder/StoryPreview.tsx`
- `src/components/elder/ConcernCategories.tsx`
- `src/components/elder/AnnotationTools.tsx`
- `src/components/elder/ApprovalWorkflow.tsx`
- `src/components/elder/CulturalGuidanceNotes.tsx`
- `src/components/elder/ReviewHistory.tsx`

**Verdict:** Critical feature, needs full buildout

---

### Day 48-49: Consent Tracking System

**Requirement:**
- All consents list
- Filter by type (story, photo, AI, sharing)
- Consent status tracking
- Expiration reminders
- Renewal workflows
- Withdrawal processing
- Multi-party consent
- Consent forms download
- Audit trail display

**Status:** ❌ **20% COMPLETE**

**Existing:**
- ✅ Database tables exist (`consent_change_log`, `privacy_changes`, `audit_logs`)
- ✅ Syndication consent tracking (Sprint 4)
- ✅ Privacy settings exist (Sprint 1)

**Missing (Major Gap):**
- ❌ ConsentTrackingDashboard component
- ❌ Comprehensive consent list view
- ❌ Filter by type/status UI
- ❌ Expiration date tracking & alerts
- ❌ Renewal workflow dialogs
- ❌ Withdrawal process UI
- ❌ Multi-party consent UI
- ❌ Consent form generator/downloader
- ❌ Audit trail visualization

**Files to Create:**
- `src/components/consent/ConsentTrackingDashboard.tsx`
- `src/components/consent/ConsentsList.tsx`
- `src/components/consent/ConsentFilters.tsx`
- `src/components/consent/ConsentStatus.tsx`
- `src/components/consent/ExpirationReminders.tsx`
- `src/components/consent/RenewalWorkflow.tsx`
- `src/components/consent/WithdrawalProcessor.tsx`
- `src/components/consent/MultiPartyConsent.tsx`
- `src/components/consent/ConsentAuditTrail.tsx`

**Verdict:** Critical GDPR/compliance feature, needs full buildout

---

### Day 50: Basic Organization Analytics

**Requirement:**
- Total stories count
- Total storytellers count
- Stories by theme chart
- Stories by region map
- Timeline visualization
- Engagement metrics
- Language distribution
- Export to CSV/PDF

**Status:** ✅ **60% COMPLETE** (Existing)

**File:** `src/components/admin/AnalyticsDashboard.tsx`

**Features Found:**
- ✅ Total users count
- ✅ New users this month
- ✅ Active users this week
- ✅ Total stories count
- ✅ Published/pending stories
- ✅ Stories this month
- ✅ Total storytellers
- ✅ Active storytellers
- ✅ User growth trends
- ✅ Story growth trends
- ✅ Cultural sensitivity breakdown
- ✅ Story types breakdown
- ✅ Daily story creation activity

**Missing:**
- ❌ Stories by theme chart (needs AI analysis integration)
- ❌ Stories by region map visualization
- ❌ Timeline visualization (project timeline)
- ❌ Language distribution chart
- ❌ Export to CSV button
- ❌ Export to PDF button
- ❌ Organization-level filtering

**Files to Enhance:**
- Enhance `AnalyticsDashboard.tsx` with:
  - Theme chart component
  - Region map component
  - Timeline component
  - Export functionality

**Verdict:** Good foundation, needs charts and export

---

## 📊 SPRINT 5 COMPLETION STATUS

### Overall Progress: **45% Complete**

| Component | Status | Completion % |
|-----------|--------|--------------|
| Project Management | ✅ Existing | 90% |
| Storyteller Recruitment | ⏳ Partial | 75% |
| Story Curation | ❌ Missing | 30% |
| Elder Review Dashboard | ❌ Missing | 10% |
| Consent Tracking | ❌ Missing | 20% |
| Organization Analytics | ✅ Existing | 60% |

---

## 🎯 PRIORITY WORK NEEDED

### Critical Path (Must Have for Snow Foundation):

1. **Elder Review Dashboard** (Days 46-47) - P0
   - Complete workflow from queue → review → approval
   - Cultural safety is core to platform
   - Snow Foundation requires Elder oversight

2. **Consent Tracking Dashboard** (Days 48-49) - P0
   - GDPR/legal compliance requirement
   - Multi-party consent for family stories
   - Audit trail for accountability

3. **Storyteller Recruitment** (Days 43-44) - P1
   - Magic links for easy onboarding
   - QR codes for event recruitment
   - Invitation tracking for campaigns

4. **Story Curation** (Day 45) - P1
   - Assign stories to projects
   - Feature stories for campaigns
   - Quality review before publication

5. **Project Timeline Visualization** (Day 41-42 enhancement) - P2
   - Visual progress tracking
   - Milestone management
   - Stakeholder communication tool

6. **Analytics Enhancements** (Day 50 enhancement) - P2
   - Export functionality for reports
   - Theme/region visualizations
   - Funder reporting requirements

---

## 📝 FILES TO CREATE (Estimated 14 new components)

### Elder Review (8 components):
1. `src/components/elder/ElderReviewDashboard.tsx` (~400 lines)
2. `src/components/elder/ReviewQueue.tsx` (~300 lines)
3. `src/components/elder/StoryPreview.tsx` (~250 lines)
4. `src/components/elder/ConcernCategories.tsx` (~150 lines)
5. `src/components/elder/AnnotationTools.tsx` (~300 lines)
6. `src/components/elder/ApprovalWorkflow.tsx` (~350 lines)
7. `src/components/elder/CulturalGuidanceNotes.tsx` (~200 lines)
8. `src/components/elder/ReviewHistory.tsx` (~250 lines)

### Consent Tracking (9 components):
1. `src/components/consent/ConsentTrackingDashboard.tsx` (~400 lines)
2. `src/components/consent/ConsentsList.tsx` (~300 lines)
3. `src/components/consent/ConsentFilters.tsx` (~150 lines)
4. `src/components/consent/ConsentStatus.tsx` (~100 lines)
5. `src/components/consent/ExpirationReminders.tsx` (~200 lines)
6. `src/components/consent/RenewalWorkflow.tsx` (~250 lines)
7. `src/components/consent/WithdrawalProcessor.tsx` (~200 lines)
8. `src/components/consent/MultiPartyConsent.tsx` (~300 lines)
9. `src/components/consent/ConsentAuditTrail.tsx` (~250 lines)

### Story Curation (5 components):
1. `src/components/admin/StoryCuration.tsx` (~400 lines)
2. `src/components/admin/AssignToProject.tsx` (~200 lines)
3. `src/components/admin/ProjectThemeTagger.tsx` (~250 lines)
4. `src/components/admin/CampaignOrganizer.tsx` (~300 lines)
5. `src/components/admin/QualityReviewQueue.tsx` (~350 lines)

### Storyteller Recruitment (4 components):
1. `src/components/admin/RecruitmentDashboard.tsx` (~350 lines)
2. `src/components/admin/InvitationManager.tsx` (~400 lines)
3. `src/components/admin/MagicLinkGenerator.tsx` (~200 lines)
4. `src/components/admin/ConsentFormManager.tsx` (~250 lines)

**Total Estimated:** ~6,600 new lines across 26 components

---

## 🔗 API ENDPOINTS NEEDED

### Elder Review:
- `GET /api/elder/review-queue` - Fetch pending reviews
- `POST /api/elder/review-queue/[id]/approve` - Approve story
- `POST /api/elder/review-queue/[id]/reject` - Reject story
- `POST /api/elder/review-queue/[id]/request-changes` - Request changes
- `GET /api/elder/review-history` - Review history

### Consent Tracking:
- `GET /api/consent/all` - All consents for org/storyteller
- `GET /api/consent/expiring` - Expiring soon
- `POST /api/consent/[id]/renew` - Renew consent
- `POST /api/consent/[id]/withdraw` - Withdraw consent
- `GET /api/consent/[id]/audit-trail` - Audit history

### Story Curation:
- `POST /api/admin/stories/[id]/assign-project` - Assign to project
- `POST /api/admin/stories/[id]/tag-themes` - Tag with themes
- `POST /api/admin/stories/[id]/feature` - Toggle featured
- `GET /api/admin/stories/review-queue` - Quality review queue

### Storyteller Recruitment:
- `POST /api/admin/invitations/send-email` - Send email invite
- `POST /api/admin/invitations/send-sms` - Send SMS invite
- `POST /api/admin/invitations/magic-link` - Generate magic link
- `GET /api/admin/invitations/tracking` - Track invitation status

**Total Estimated:** ~18 new API endpoints

---

## 🧪 TESTING PLAN

### Sprint 5 Test Pages:
- `/test/sprint-5/elder-review` - Elder review workflow
- `/test/sprint-5/consent-tracking` - Consent management
- `/test/sprint-5/story-curation` - Story curation tools
- `/test/sprint-5/recruitment` - Storyteller recruitment

### Integration Tests:
- [ ] Elder approves story → status changes to published
- [ ] Elder rejects story → storyteller notified
- [ ] Consent expires → reminder sent
- [ ] Consent withdrawn → content removed
- [ ] Story assigned to project → appears in project view
- [ ] Invitation sent → tracking updated
- [ ] Magic link used → storyteller onboarded

---

## 🎯 SUCCESS CRITERIA

### Completed When:
- [x] Organizations can manage projects (EXISTING)
- [x] Project progress tracked visually (needs timeline viz)
- [ ] Storytellers recruited via email/SMS/QR codes
- [ ] Stories assigned to projects and curated
- [ ] Elder review queue functional with approval workflow
- [ ] All consents tracked with expiration monitoring
- [ ] Multi-party consent supported
- [ ] Basic analytics display with export
- [ ] Snow Foundation can use platform for Deadly Hearts Trek

---

## 📅 RECOMMENDED APPROACH

Given that 45% already exists, focus on the **critical gaps**:

### Phase 1: Elder Review (P0) - 2-3 hours
Build complete Elder review workflow with cultural safety

### Phase 2: Consent Tracking (P0) - 2-3 hours
GDPR compliance and audit trail

### Phase 3: Storyteller Recruitment (P1) - 1-2 hours
Magic links, invitations, QR codes

### Phase 4: Story Curation (P1) - 1-2 hours
Assign, tag, feature, review queue

### Phase 5: Enhancements (P2) - 1 hour
Timeline viz, export, theme charts

**Total Estimated:** 7-11 hours for complete Sprint 5

---

**Ready to begin Sprint 5 implementation?**

Suggested order:
1. Elder Review Dashboard (most complex, highest impact)
2. Consent Tracking Dashboard (legal compliance)
3. Storyteller Recruitment (user acquisition)
4. Story Curation (content organization)
5. Polish existing components (timeline, analytics)
