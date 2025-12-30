# Campaign Management Documentation

## Overview

Empathy Ledger's campaign system enables organizations to run storytelling initiatives across communities, manage consent workflows, and track engagement. Campaigns provide structured ways to collect stories through physical events, partnerships, and coordinated outreach.

## What are Campaigns?

Campaigns are coordinated storytelling initiatives with specific goals, timelines, and communities. They can be:

- **World Tour Stops** - Physical events in communities to capture stories
- **Community Outreach** - Targeted recruitment within specific communities
- **Partnership Campaigns** - Collaborative initiatives with Dream Organizations
- **Collection Drives** - Themed story collection around specific topics
- **Exhibitions** - Public storytelling events and displays

## Quick Start

### For Organizers

1. **Plan Your Campaign**
   - Read the [World Tour Planning Guide](world-tour/planning-guide.md)
   - Review [Use Cases](use-cases/) for campaign types
   - Study [Case Studies](case-studies/) for examples

2. **Set Up Partners**
   - Identify [Dream Organizations](use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md)
   - Establish cultural protocols
   - Formalize partnership agreements

3. **Launch Campaign**
   - Create campaign in admin dashboard
   - Set up consent workflow
   - Begin storyteller recruitment

4. **Measure Impact**
   - Track metrics via analytics
   - Monitor consent completion
   - Report on outcomes

### For Storytellers

1. **Receive Invitation** - Get invited to participate in a campaign
2. **Review Consent** - Understand how your story will be used
3. **Share Your Story** - Record your story at a tour stop or event
4. **See Your Impact** - View your story and its reach

## Documentation Structure

```
campaigns/
├── README.md (you are here)         # Overview and navigation
├── world-tour/                      # World Tour specific guides
│   └── planning-guide.md            # How to plan and run tour stops
├── use-cases/                       # Campaign types and strategies
│   ├── ACT_PROJECT_CONNECTIONS.md   # Cross-project collaboration
│   ├── CLIENT_IMPLEMENTATION_PLAYBOOK.md  # Partnership playbook
│   ├── GOVERNMENT_USE_CASES.md      # Government partnerships
│   └── LAUNCH_STRATEGY_1000_STORYTELLER_PROGRAM.md  # Scale strategy
├── case-studies/                    # Real examples and templates
│   ├── BEN_KNIGHT_STORYTELLER_CASE_STUDY_PLAN.md
│   ├── BEN_KNIGHT_COMPLETE_PROFILE_DEMO.md
│   ├── BEN_KNIGHT_PRIMARY_STORY.md
│   └── BEN_KNIGHT_PROFILE_CREATION_CASE_STUDY.md
└── brand-guidelines/                # Campaign branding and design
    ├── EMPATHY_LEDGER_BRAND_SYSTEM.md
    ├── EMPATHY_LEDGER_PHILOSOPHY.md
    ├── MASTER_STYLE_REFERENCE.md
    ├── BRAND_SYSTEM_VISUAL_COMPARISON.md
    └── design-tokens.json
```

## Campaign Types

### 1. World Tour Stops

**Purpose**: Physical events in communities to capture stories in person

**Key Features:**
- Cultural protocol adherence
- Dream Organization partnerships
- Consent workflow management
- Physical storytelling events
- Community engagement

**Documentation:**
- [World Tour Planning Guide](world-tour/planning-guide.md)
- [Launch Strategy](use-cases/LAUNCH_STRATEGY_1000_STORYTELLER_PROGRAM.md)

### 2. Community Outreach Campaigns

**Purpose**: Targeted recruitment within specific cultural or geographic communities

**Key Features:**
- Community-led nominations
- Cultural sensitivity protocols
- Elder review processes
- Relationship building

**Documentation:**
- [Client Implementation Playbook](use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md)

### 3. Partnership Campaigns

**Purpose**: Collaborative storytelling with Dream Organizations

**Key Features:**
- Co-branded initiatives
- Resource sharing
- Joint impact measurement
- Ongoing partnerships

**Documentation:**
- [Client Implementation Playbook](use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md)
- [ACT Project Connections](use-cases/ACT_PROJECT_CONNECTIONS.md)

### 4. Government & Institutional Campaigns

**Purpose**: Storytelling initiatives with government entities and institutions

**Key Features:**
- Policy alignment
- Compliance tracking
- Institutional partnerships
- Public sector engagement

**Documentation:**
- [Government Use Cases](use-cases/GOVERNMENT_USE_CASES.md)

## Core Campaign Workflows

### Consent Management Workflow

```
1. Invited        → Storyteller receives invitation
2. Interested     → Storyteller expresses interest
3. Consented      → Consent forms signed and verified
4. Recorded       → Story captured (audio/video)
5. Reviewed       → Content reviewed (Elder review if needed)
6. Published      → Story published per consent settings
7. Withdrawn      → (Optional) Consent withdrawn and content removed
```

**Manage via:** `/admin/campaigns/[id]/workflow`

### Dream Organizations Partnership

```
1. Identify       → Find aligned organizations
2. Outreach       → Present campaign vision
3. Agreement      → Formalize partnership terms
4. Collaboration  → Joint planning and execution
5. Co-impact      → Shared metrics and outcomes
```

**Manage via:** `/admin/dream-organizations`

### Story Collection Process

```
1. Plan           → Define campaign goals and community
2. Recruit        → Invite storytellers
3. Consent        → Obtain and verify consent
4. Capture        → Record stories
5. Process        → Transcribe and review
6. Publish        → Make stories available
7. Measure        → Track impact and engagement
```

## Campaign Planning Checklist

### Pre-Campaign (4-6 weeks before)
- [ ] Define campaign goals and community
- [ ] Research cultural protocols
- [ ] Identify Dream Organization partners
- [ ] Secure venue (if physical event)
- [ ] Create campaign in admin dashboard
- [ ] Set up consent workflow

### Recruitment (3-4 weeks before)
- [ ] Launch storyteller recruitment
- [ ] Send invitations
- [ ] Track consent workflow stages
- [ ] Confirm storyteller participation
- [ ] Schedule interviews/recordings

### Logistics (2-3 weeks before)
- [ ] Finalize venue and equipment
- [ ] Brief staff and volunteers
- [ ] Print materials and consent forms
- [ ] Test recording equipment
- [ ] Prepare hospitality

### Execution (Event week)
- [ ] Set up venue
- [ ] Welcome storytellers
- [ ] Record stories with consent
- [ ] Document cultural protocols followed
- [ ] Thank participants

### Post-Campaign (1-2 weeks after)
- [ ] Upload and process recordings
- [ ] Transcribe stories
- [ ] Elder review (if required)
- [ ] Publish stories
- [ ] Send thank you messages
- [ ] Measure and report impact

## Use Cases by Campaign Type

### Community-Led Story Collection

**When to use:**
- Community wants to preserve their own stories
- Cultural protocols require community control
- Building trust within community
- Long-term relationship development

**Example:** [Ben Knight Case Study](case-studies/BEN_KNIGHT_STORYTELLER_CASE_STUDY_PLAN.md)

### Multi-Location Tours

**When to use:**
- Capturing stories across multiple communities
- Building global narrative
- Connecting related communities
- Large-scale initiatives

**Example:** [Launch Strategy: 1000 Storytellers](use-cases/LAUNCH_STRATEGY_1000_STORYTELLER_PROGRAM.md)

### Partnership-Driven Campaigns

**When to use:**
- Co-creating with established organizations
- Sharing resources and networks
- Building institutional relationships
- Scaling impact

**Example:** [ACT Project Connections](use-cases/ACT_PROJECT_CONNECTIONS.md)

### Government Collaborations

**When to use:**
- Policy-driven storytelling initiatives
- Public sector partnerships
- Compliance requirements
- Institutional storytelling

**Example:** [Government Use Cases](use-cases/GOVERNMENT_USE_CASES.md)

## Key Concepts

### Dream Organizations

Organizations that align with Empathy Ledger's values and help facilitate campaigns:
- Provide venue and logistics
- Help recruit storytellers
- Ensure cultural protocols
- Co-brand and promote campaigns
- Share impact and metrics

[Learn more →](use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md)

### Cultural Protocols

Respectful practices when working with Indigenous and cultural communities:
- Elder permissions and involvement
- Traditional territory acknowledgments
- Sacred knowledge protection
- Community-led processes
- Consent and ownership

[Learn more →](world-tour/planning-guide.md#phase-1-community-preparation-4-6-weeks-before)

### Consent Workflow

Structured process to track storyteller consent through campaign stages:
- Visual pipeline representation
- Stage-by-stage tracking
- Documentation management
- Bulk actions for efficiency
- Audit trail for compliance

[Learn more →](world-tour/planning-guide.md#campaign-consent-workflow)

## Case Studies

### Ben Knight: Indigenous Land Rights Storyteller

A comprehensive example of creating a storyteller profile, capturing stories, and building a campaign around Indigenous land rights advocacy.

**Files:**
- [Storyteller Case Study Plan](case-studies/BEN_KNIGHT_STORYTELLER_CASE_STUDY_PLAN.md)
- [Complete Profile Demo](case-studies/BEN_KNIGHT_COMPLETE_PROFILE_DEMO.md)
- [Primary Story](case-studies/BEN_KNIGHT_PRIMARY_STORY.md)
- [Profile Creation Process](case-studies/BEN_KNIGHT_PROFILE_CREATION_CASE_STUDY.md)

**Key Learnings:**
- Importance of cultural context in storytelling
- How to structure storyteller profiles
- Story collection and consent workflow
- Impact measurement and analytics

## Brand Guidelines

Campaigns should follow the Empathy Ledger brand system for consistency:

- **[Brand System Overview](brand-guidelines/EMPATHY_LEDGER_BRAND_SYSTEM.md)** - Core brand principles
- **[Philosophy](brand-guidelines/EMPATHY_LEDGER_PHILOSOPHY.md)** - Why we tell stories this way
- **[Style Reference](brand-guidelines/MASTER_STYLE_REFERENCE.md)** - Visual and writing standards
- **[Design Tokens](brand-guidelines/design-tokens.json)** - Technical implementation

**Key Brand Principles:**
- Warmth and editorial tone
- Cultural respect and sensitivity
- Accessibility and inclusivity
- Story-first approach
- Community ownership

## Technical Implementation

### Campaign Database Schema

```sql
-- Campaigns as first-class entities
campaigns (
  id, organization_id, tenant_id,
  name, slug, description, status,
  campaign_type, start_date, end_date,
  location, targets, metrics, etc.
)

-- Workflow tracking
campaign_consent_workflows (
  id, campaign_id, storyteller_id, story_id,
  stage, notes, consent_docs, etc.
)

-- Link tour stops to campaigns
tour_stops (
  ..., campaign_id, ...
)

-- Link stories to campaigns
stories (
  ..., campaign_id, ...
)
```

### API Endpoints

```typescript
// Campaign management
GET    /api/v1/campaigns              // List campaigns
POST   /api/v1/campaigns              // Create campaign
GET    /api/v1/campaigns/[id]         // Get campaign
PATCH  /api/v1/campaigns/[id]         // Update campaign
DELETE /api/v1/campaigns/[id]         // Archive campaign

// Campaign details
GET    /api/v1/campaigns/[id]/participants   // List storytellers
POST   /api/v1/campaigns/[id]/participants   // Add storyteller
GET    /api/v1/campaigns/[id]/stories        // Campaign stories
GET    /api/v1/campaigns/[id]/analytics      // Metrics

// Workflow management
GET    /api/v1/workflow/campaigns/[id]       // Workflow status
PATCH  /api/v1/workflow/[id]/advance         // Move stage
POST   /api/v1/workflow/batch/advance        // Bulk update
```

### Admin Routes

```
/admin/campaigns/                          # Campaign list
/admin/campaigns/create/                   # Create campaign
/admin/campaigns/[id]/overview/            # Dashboard
/admin/campaigns/[id]/participants/        # Storyteller management
/admin/campaigns/[id]/workflow/            # Consent workflow
/admin/campaigns/[id]/analytics/           # Campaign metrics
/admin/campaigns/moderation/               # Consent queue
```

## Metrics and Analytics

### Campaign Success Metrics

**Quantitative:**
- Stories captured
- Storyteller diversity
- Consent completion rate
- Partner organizations engaged
- Geographic coverage
- Story views and engagement

**Qualitative:**
- Cultural protocol adherence
- Storyteller satisfaction
- Community reception
- Story depth and quality
- Relationship building
- Cultural preservation impact

**Track via:** `/admin/campaigns/[id]/analytics`

## Resources

### Templates
- Storyteller invitation letters
- Consent forms
- Partnership agreements
- Interview question guides
- Cultural protocol checklists

### Tools
- Campaign Dashboard: `/admin/campaigns`
- Workflow Manager: `/admin/campaigns/[id]/workflow`
- Dream Organizations: `/admin/dream-organizations`
- Analytics: `/admin/campaigns/[id]/analytics`

### Related Documentation
- [Database Workflow](../../database/DATABASE_WORKFLOW.md) - Database management
- [API Documentation](../../api/) - API reference
- [Main Documentation Index](../../INDEX.md) - All documentation

## Getting Help

### Common Questions

**Q: How do I create a new campaign?**
A: Navigate to `/admin/campaigns/create` and fill in campaign details. See [World Tour Planning Guide](world-tour/planning-guide.md) for comprehensive planning steps.

**Q: How do I track storyteller consent?**
A: Use the campaign workflow at `/admin/campaigns/[id]/workflow`. Each storyteller moves through stages from invited to published.

**Q: What are Dream Organizations?**
A: Partner organizations that help facilitate campaigns. See [Client Implementation Playbook](use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md).

**Q: How do I ensure cultural protocols are followed?**
A: Work with Elders and cultural advisors, use the cultural protocol checklist, and enable Elder review in your campaign settings.

**Q: Can I run multiple campaigns at once?**
A: Yes! Each campaign is independent with its own workflow, participants, and metrics.

### Support Channels
- **Technical Issues**: See [Technical Documentation](../../technical/)
- **Cultural Protocols**: Consult with Elders and cultural advisors
- **Platform Questions**: Contact platform support team
- **Partnership Questions**: See [Client Implementation Playbook](use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md)

## Next Steps

1. **Learn**: Read the [World Tour Planning Guide](world-tour/planning-guide.md)
2. **Explore**: Review [Use Cases](use-cases/) and [Case Studies](case-studies/)
3. **Plan**: Define your campaign goals and community
4. **Partner**: Identify Dream Organizations
5. **Launch**: Create your campaign and begin storytelling

---

**Last Updated:** 2025-12-26
**Maintained By:** Empathy Ledger Team

For questions or feedback, see the main [Documentation Index](../INDEX.md).
