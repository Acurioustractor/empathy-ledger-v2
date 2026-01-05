# Week 5: Storyteller UAT Plan

**Purpose**: User Acceptance Testing plan for storytellers validating syndication, knowledge base, and core platform features

**Sprint**: Week 5 (January 6-10, 2026)

**Status**: PLANNING

---

## Overview

### What We're Testing

1. **Syndication System** - Story sharing approval/denial workflow
2. **Storyteller Dashboard** - Complete self-service experience
3. **Knowledge Base Search** - AI-powered documentation assistance
4. **Privacy & Data Sovereignty** - Consent and control mechanisms
5. **Cultural Safety Features** - ALMA settings and protocols

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion Rate | >85% | Users complete assigned tasks |
| User Satisfaction | >4.0/5 | Average rating across tasks |
| Critical Bugs Found | <3 | Blocking issues discovered |
| Time to Complete | <45 min | Full test session duration |
| Would Recommend | >80% | Tester recommendation rate |

---

## Test Personas

### Persona 1: Elder Grace (Sacred Knowledge Keeper)

**Background**: 67 years old, limited tech experience, holds sacred cultural knowledge
**Device**: Tablet (iPad)
**Priority Concerns**: Privacy, who sees her stories, cultural protocols
**Testing Focus**: Privacy controls, ALMA settings, consent workflows

**Key Scenarios**:
- Setting story visibility to "Community Only"
- Denying syndication requests
- Understanding where her content appears
- Exporting/deleting her data

---

### Persona 2: Marcus (Young Community Organizer)

**Background**: 28 years old, tech-savvy, activist sharing community stories
**Device**: Mobile (Android)
**Priority Concerns**: Reach, impact metrics, sharing widely
**Testing Focus**: Syndication approval, analytics, multi-site distribution

**Key Scenarios**:
- Approving syndication to multiple sites
- Tracking story performance across sites
- Understanding revenue share
- Managing active distributions

---

### Persona 3: Sarah (Field Worker/Interviewer)

**Background**: 35 years old, collects stories in remote communities
**Device**: Laptop (Chrome)
**Priority Concerns**: Easy upload, transcript management, offline support
**Testing Focus**: Transcript upload, video management, story creation

**Key Scenarios**:
- Uploading audio/video recordings
- Creating text transcripts
- Converting transcripts to stories
- Managing media gallery

---

### Persona 4: David (Storyteller with Multiple Organizations)

**Background**: 45 years old, works with 3 different community organizations
**Device**: Desktop (Windows)
**Priority Concerns**: Organization switching, keeping stories separate
**Testing Focus**: Multi-tenant experience, organization context

**Key Scenarios**:
- Viewing stories per organization
- Understanding which org sees which content
- Managing permissions across orgs
- Organization-specific analytics

---

### Persona 5: Kim (First-Time User)

**Background**: 22 years old, first time sharing personal story
**Device**: Mobile (iPhone)
**Priority Concerns**: Simplicity, understanding what happens to story
**Testing Focus**: Onboarding, first story creation, understanding platform

**Key Scenarios**:
- Creating first storyteller profile
- Submitting first story
- Understanding syndication concept
- Finding help/documentation

---

## Test Scenarios

### Module 1: Syndication Dashboard (8 scenarios)

#### 1.1 View Pending Requests
**Route**: `/syndication/dashboard`
**Steps**:
1. Navigate to syndication dashboard
2. View pending syndication requests tab
3. Identify which sites are requesting your story
4. Understand the purpose and audience for each request

**Expected**: See list of pending requests with site name, story title, purpose, audience, revenue share

**Pass Criteria**: User identifies all request details within 2 minutes

---

#### 1.2 Approve Syndication Request
**Steps**:
1. Select a pending request
2. Review site information
3. Check revenue share offer (e.g., 15%)
4. Click "Approve Sharing"
5. Confirm the approval

**Expected**: Request moves to "Active" tab, confirmation shown

**Pass Criteria**: User completes approval, understands revenue terms

---

#### 1.3 Deny Syndication Request
**Steps**:
1. Select a pending request
2. Click "Decline Request"
3. Optionally provide reason
4. Confirm denial

**Expected**: Request removed from pending, denial recorded

**Pass Criteria**: User successfully denies, understands it's their choice

---

#### 1.4 View Active Distributions
**Route**: `/syndication/dashboard` (Active tab)
**Steps**:
1. Click "Active" tab
2. View all currently active distributions
3. Check metrics: Views, Clicks, Shares
4. Note the approval date

**Expected**: See active stories with performance metrics

**Pass Criteria**: User finds their distributed stories, understands metrics

---

#### 1.5 Stop Sharing (Revoke Distribution)
**Steps**:
1. Find an active distribution
2. Click "Stop Sharing"
3. Read the warning message
4. Confirm or cancel

**Expected**: Distribution marked for removal, clear messaging about process

**Pass Criteria**: User understands they can revoke at any time

---

#### 1.6 View Revenue Earnings
**Route**: `/syndication/dashboard` (Revenue tab)
**Steps**:
1. Click "Revenue" tab
2. View total earned, pending payout, this month
3. Identify top-earning story
4. Understand revenue share breakdown

**Expected**: Clear revenue summary with earnings attribution

**Pass Criteria**: User understands how they earn from syndication

---

#### 1.7 Explore Partner Sites
**Route**: `/admin/platform-value` (Syndication tab)
**Steps**:
1. Navigate to Platform Value dashboard
2. Click "Syndication" tab
3. Review partner site network
4. Note site focus areas (Justice, Agriculture, etc.)

**Expected**: See all partner sites with their purpose and status

**Pass Criteria**: User understands the syndication network

---

#### 1.8 Understand Syndication Concept
**Observation Task**:
After completing syndication tasks, ask user:
- "In your own words, what is syndication?"
- "Do you feel in control of where your stories go?"
- "What would make you more comfortable with syndication?"

**Pass Criteria**: User can explain syndication accurately, feels in control

---

### Module 2: Storyteller Dashboard (7 scenarios)

#### 2.1 Navigate Personal Dashboard
**Route**: `/storytellers/[id]/dashboard`
**Steps**:
1. Navigate to your storyteller dashboard
2. View your avatar and profile summary
3. Check your stats (Transcripts, Stories, Videos, Words)
4. Understand the tab navigation

**Expected**: Full dashboard with personal metrics and navigation

**Pass Criteria**: User finds all sections within 3 minutes

---

#### 2.2 View and Manage Transcripts
**Route**: Dashboard → Transcripts tab
**Steps**:
1. Click "Transcripts" tab
2. View transcript list
3. Click on a transcript to view details
4. Try "Create Story from Transcript" button

**Expected**: List of transcripts with status, content preview, action buttons

**Pass Criteria**: User navigates transcript workflow

---

#### 2.3 Add New Transcript
**Steps**:
1. Click "Add Text Transcript"
2. Enter title and paste/type transcript text
3. See word count update
4. Click "Create Transcript"

**Expected**: New transcript created, visible in list

**Pass Criteria**: User creates transcript successfully

---

#### 2.4 Upload Media (Audio/Video)
**Steps**:
1. Click "Upload Audio/Video"
2. Select file from device
3. Wait for upload and processing
4. Check that transcript is generated

**Expected**: Media uploaded, transcript auto-generated

**Pass Criteria**: User successfully uploads and sees result

---

#### 2.5 View Stories
**Route**: Dashboard → Stories tab
**Steps**:
1. Click "Stories" tab
2. View published and draft stories
3. Check story status badges
4. Click a story to view/edit

**Expected**: Story list with status, themes, actions

**Pass Criteria**: User navigates story management

---

#### 2.6 View Photo Gallery
**Route**: Dashboard → Photos tab
**Steps**:
1. Click "Photos" tab
2. View uploaded photos
3. Check photo metadata (date, size)
4. Try adding a new photo

**Expected**: Photo grid with management options

**Pass Criteria**: User manages photo assets

---

#### 2.7 Access Analytics
**Route**: Dashboard → Analytics tab
**Steps**:
1. Click "Analytics" tab
2. View story performance metrics
3. Understand view trends
4. Check audience breakdown

**Expected**: Analytics visualizations with actionable data

**Pass Criteria**: User interprets their analytics

---

### Module 3: Privacy & Settings (5 scenarios)

#### 3.1 Access Privacy Settings
**Route**: Dashboard → Settings tab → Privacy & Data
**Steps**:
1. Navigate to Settings tab
2. Click "Privacy & Data"
3. Review available privacy controls
4. Understand each setting's purpose

**Expected**: Privacy panel with clear options

**Pass Criteria**: User finds and understands privacy controls

---

#### 3.2 Manage Data Sovereignty
**Steps**:
1. Find Data Sovereignty section
2. Understand OCAP principles explanation
3. Set data usage preferences
4. Review third-party sharing settings

**Expected**: Clear sovereignty options with cultural context

**Pass Criteria**: User feels ownership of their data

---

#### 3.3 Export Personal Data
**Steps**:
1. Find "Export My Data" option
2. Select export format
3. Initiate export
4. Receive/download exported data

**Expected**: GDPR-compliant data export

**Pass Criteria**: User successfully exports their data

---

#### 3.4 Configure ALMA Settings
**Route**: Dashboard → Settings tab → ALMA & Cultural Safety
**Steps**:
1. Click "ALMA & Cultural Safety" tab
2. Understand what ALMA does
3. Configure cultural sensitivity levels
4. Set content moderation preferences

**Expected**: ALMA configuration with clear explanations

**Pass Criteria**: User configures cultural safety settings

---

#### 3.5 Understand Content Visibility
**Steps**:
1. Review visibility options for stories
2. Understand difference between Public/Community/Private
3. Set default visibility preference
4. Confirm understanding

**Expected**: Clear visibility explanations

**Pass Criteria**: User correctly explains visibility levels

---

### Module 4: Knowledge Base & Help (3 scenarios)

#### 4.1 Search Knowledge Base
**Route**: `/admin/platform-value` → Knowledge Base tab
**Steps**:
1. Navigate to Knowledge Base search
2. Try query: "How do I create a storyteller?"
3. Review search results
4. Click on a result to see content

**Expected**: Relevant results with similarity scores

**Pass Criteria**: User finds helpful documentation

---

#### 4.2 Use Quick Search Examples
**Steps**:
1. Click on example search queries
2. View results for each
3. Compare result quality
4. Note which queries work best

**Expected**: Example queries return useful results

**Pass Criteria**: User understands how to phrase queries

---

#### 4.3 Find Help When Stuck
**Steps**:
1. From any page, look for help resources
2. Try finding documentation on a specific topic
3. Rate the helpfulness of found content
4. Note any gaps in documentation

**Expected**: Help is discoverable and useful

**Pass Criteria**: User finds help when needed

---

### Module 5: First-Time User Journey (2 scenarios)

#### 5.1 Onboarding Flow
**Route**: `/storytellers/create`
**Steps**:
1. Start as new user (logged out or new account)
2. Navigate to create storyteller profile
3. Complete basic info step
4. Add location
5. Upload photo
6. Review and submit

**Expected**: Smooth wizard with clear steps

**Pass Criteria**: New user creates profile in <10 minutes

---

#### 5.2 First Story Submission
**Steps**:
1. After profile creation, navigate to dashboard
2. Click "Share New Story"
3. Enter story title and content
4. Set visibility and themes
5. Submit for review

**Expected**: Story created with correct status

**Pass Criteria**: First story submitted successfully

---

## Feedback Collection

### Per-Task Feedback
After each task, collect:
- **Rating**: 1-5 stars
- **Difficulty**: Easy / Moderate / Hard
- **Issues Encountered**: Bug / UI Confusing / Missing Feature / Other
- **Comments**: Free-form feedback

### Session Summary
At session end, collect:
- **Overall Rating**: 1-5 stars
- **Would Recommend**: Yes / No / Maybe
- **Top 3 Issues**: What frustrated you most?
- **Top 3 Praises**: What worked well?
- **Missing Features**: What should we add?
- **Additional Comments**: Anything else?

---

## Test Session Schedule

### Suggested Schedule

| Day | Time | Persona | Tester | Facilitator |
|-----|------|---------|--------|-------------|
| Mon Jan 6 | 10:00 AM | Elder Grace | TBD | TBD |
| Mon Jan 6 | 2:00 PM | Marcus | TBD | TBD |
| Tue Jan 7 | 10:00 AM | Sarah | TBD | TBD |
| Tue Jan 7 | 2:00 PM | David | TBD | TBD |
| Wed Jan 8 | 10:00 AM | Kim | TBD | TBD |

### Session Structure (45 minutes)

1. **Welcome & Context** (5 min)
   - Explain testing purpose
   - Assure feedback is valued
   - Set up recording (with consent)

2. **Scenario Testing** (30 min)
   - Complete assigned scenarios
   - Think-aloud protocol
   - Note issues as they occur

3. **Feedback Collection** (10 min)
   - Complete session summary form
   - Open discussion
   - Thank participant

---

## Testing Tools

### User Testing Dashboard
**Route**: `/admin/testing`

The built-in testing UI provides:
- Task progress tracking
- Per-task feedback forms
- Session management (start/pause/reset)
- Summary view with all feedback

### Issue Tracking
For bugs found during UAT:
- Log in GitHub Issues with `[UAT]` prefix
- Include steps to reproduce
- Attach screenshots if possible
- Tag with `uat-week5` label

---

## UAT Readiness Checklist

### Before Sessions
- [ ] All test routes accessible and working
- [ ] Demo data seeded (stories, transcripts, syndication requests)
- [ ] Test accounts created for each persona
- [ ] Testing UI deployed at `/admin/testing`
- [ ] Recording/note-taking setup ready
- [ ] Facilitator trained on protocol

### Environment
- [ ] Production-like environment available
- [ ] Mobile-responsive views tested
- [ ] Slow connection simulation available
- [ ] Error states handled gracefully

### Data
- [ ] 3+ sample stories for syndication testing
- [ ] 2+ pending syndication requests
- [ ] 1+ active distribution with metrics
- [ ] Revenue data seeded
- [ ] Knowledge base indexed and searchable

---

## Post-UAT Actions

### Immediate (Day of)
1. Compile all feedback from session
2. Create GitHub issues for bugs found
3. Document critical blockers

### Week After
1. Synthesize feedback across all sessions
2. Prioritize fixes by severity
3. Create Week 6 remediation plan
4. Share results with stakeholders

### Success Metrics Review
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Task Completion Rate | >85% | TBD | |
| User Satisfaction | >4.0/5 | TBD | |
| Critical Bugs Found | <3 | TBD | |
| Time to Complete | <45 min | TBD | |
| Would Recommend | >80% | TBD | |

---

## Appendix

### Test Account Credentials
(To be populated before UAT)

| Persona | Email | Password | Storyteller ID |
|---------|-------|----------|----------------|
| Elder Grace | | | |
| Marcus | | | |
| Sarah | | | |
| David | | | |
| Kim | | | |

### Routes Reference

| Feature | Route |
|---------|-------|
| Syndication Dashboard | `/syndication/dashboard` |
| Platform Value Dashboard | `/admin/platform-value` |
| Storyteller Dashboard | `/storytellers/[id]/dashboard` |
| User Testing UI | `/admin/testing` |
| Create Storyteller | `/storytellers/create` |
| Create Story | `/stories/create` |

---

**Document Owner**: Development Team
**Last Updated**: January 3, 2026
**Next Review**: After UAT Week 5
