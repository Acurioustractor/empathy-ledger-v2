# UAT Readiness Checklist

**Purpose**: Pre-session checklist to ensure successful UAT execution

**Sprint**: Week 5 (January 6-10, 2026)

---

## Environment Readiness

### Production-Like Environment
- [ ] Vercel deployment is current with latest code
- [ ] Database migrations are applied
- [ ] All environment variables are set correctly
- [ ] SSL certificates are valid
- [ ] No blocking errors in production logs

### Feature Availability
- [ ] Syndication Dashboard accessible at `/syndication/dashboard`
- [ ] Platform Value Dashboard accessible at `/admin/platform-value`
- [ ] Storyteller Dashboard accessible at `/storytellers/[id]/dashboard`
- [ ] User Testing UI accessible at `/admin/testing`
- [ ] Knowledge Base search is functional

---

## Demo Data Seeded

### Stories & Content
- [ ] At least 3 sample stories exist in database
- [ ] Stories have varying statuses (draft, published)
- [ ] Stories have associated transcripts
- [ ] Media assets are uploaded and visible

### Syndication Data
- [ ] 2+ pending syndication requests exist
- [ ] 1+ active distribution with view metrics
- [ ] Revenue data populated for testing
- [ ] 6 ACT partner sites are configured

### Knowledge Base
- [ ] 231 documents indexed
- [ ] 22,506 chunks available for search
- [ ] RAG search returns relevant results
- [ ] Example queries tested and working

---

## Test Accounts (Using Existing Storytellers)

The database already contains storyteller profiles that can be used for UAT testing:

| Persona | Use Profile | Storyteller ID | Tenant |
|---------|-------------|----------------|--------|
| Elder Grace | Olga Havnen | d113d379-46f6-4113-9ad6-be7f76463c20 | Oonchiumpa |
| Marcus | Chelsea Rolfe | ea82e328-ae82-4bcc-9de4-c73114e37e6c | Oonchiumpa |
| Sarah | Veronica Vos | 2fec0751-c3cd-44a4-8887-66707f4cc1c8 | Oonchiumpa |
| David | Javier Aparicio Grau | ee202ace-d18b-4d9f-bf2a-c700eb3480fa | Oonchiumpa |
| Kim | Mary Running Bear | a055dd3a-28ff-4019-9cf5-1f151b7e8975 | Oonchiumpa |

### Access URLs for Testing
```
/storytellers/d113d379-46f6-4113-9ad6-be7f76463c20/dashboard  (Elder Grace)
/storytellers/ea82e328-ae82-4bcc-9de4-c73114e37e6c/dashboard  (Marcus)
/storytellers/2fec0751-c3cd-44a4-8887-66707f4cc1c8/dashboard  (Sarah)
/storytellers/ee202ace-d18b-4d9f-bf2a-c700eb3480fa/dashboard  (David)
/storytellers/a055dd3a-28ff-4019-9cf5-1f151b7e8975/dashboard  (Kim)
```

### Existing Content Available
- [x] Multiple published stories
- [x] Draft stories for editing
- [x] Transcripts with various statuses
- [x] Media assets and photos

---

## Facilitator Preparation

### Equipment
- [ ] Screen recording software installed (with tester consent)
- [ ] Note-taking template ready
- [ ] Backup device available
- [ ] Stable internet connection confirmed

### Materials
- [ ] Session script printed/accessible
- [ ] Scenario list for each persona
- [ ] Feedback forms prepared
- [ ] Contact info for tech support

### Training
- [ ] Facilitator understands all test scenarios
- [ ] Facilitator can navigate all features
- [ ] Facilitator knows escalation path for issues
- [ ] Facilitator has tested the testing UI

---

## Communication

### Participant Outreach
- [ ] Test session invitations sent
- [ ] Calendar holds confirmed
- [ ] Video call links shared (if remote)
- [ ] Pre-session instructions provided

### Internal Coordination
- [ ] Dev team aware of UAT schedule
- [ ] Support team on standby
- [ ] Stakeholders informed of timeline
- [ ] Issue tracking system ready (GitHub Issues)

---

## Day-Of Checklist

### 30 Minutes Before
- [ ] Test login with each account
- [ ] Verify all routes are accessible
- [ ] Check demo data is intact
- [ ] Start screen recording (if applicable)
- [ ] Open testing UI at `/admin/testing`

### Session Start
- [ ] Welcome participant
- [ ] Explain purpose (not testing them, testing product)
- [ ] Confirm consent for recording
- [ ] Share screen or provide URL
- [ ] Start timing

### During Session
- [ ] Observe without interrupting
- [ ] Note any confusion or hesitation
- [ ] Document errors encountered
- [ ] Encourage think-aloud protocol
- [ ] Mark task completion in testing UI

### Session End
- [ ] Complete feedback form with participant
- [ ] Ask open-ended questions
- [ ] Thank participant
- [ ] Save recordings and notes

---

## Post-Session Actions

### Immediate (Within 1 Hour)
- [ ] Export session data from testing UI
- [ ] Create GitHub issues for critical bugs
- [ ] Note any environmental issues
- [ ] Save backup of feedback data

### Same Day
- [ ] Write brief session summary
- [ ] Categorize feedback by theme
- [ ] Prioritize discovered issues
- [ ] Share highlights with team

### After All Sessions
- [ ] Compile comprehensive report
- [ ] Calculate success metrics
- [ ] Create Week 6 remediation plan
- [ ] Schedule follow-up if needed

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Lead Developer | TBD | |
| Database Admin | TBD | |
| Vercel Support | | support@vercel.com |
| Product Owner | TBD | |

---

## Quick Reference URLs

| Feature | URL |
|---------|-----|
| Testing UI | `/admin/testing` |
| Syndication Dashboard | `/syndication/dashboard` |
| Platform Value | `/admin/platform-value` |
| Storyteller Dashboard | `/storytellers/[id]/dashboard` |
| Create Storyteller | `/storytellers/create` |
| Create Story | `/stories/create` |
| Knowledge Base API | `/api/knowledge-base/search` |

---

**Last Updated**: January 3, 2026
**Owner**: Development Team
