# World Tour Campaign Planning Guide

## Overview

The Empathy Ledger World Tour is a global campaign to capture and preserve stories from communities around the world. This guide helps you plan, execute, and measure the impact of tour stops in your region.

## What is a Tour Stop?

A World Tour stop is a physical gathering where:
- Community members share their stories through recorded interviews
- Cultural protocols are respected and honored
- Stories are captured with proper consent
- Connections are made between storytellers and communities
- Stories are preserved for future generations

## Planning Your Tour Stop

### Phase 1: Community Preparation (4-6 weeks before)

#### 1. Identify Your Community
- Define geographic boundaries
- Identify cultural groups and communities
- Research traditional territories and protocols
- Connect with Elders and cultural leaders

#### 2. Establish Cultural Protocols
```markdown
Key Questions:
- What cultural protocols must be followed?
- Are there Elder permissions needed?
- What traditional acknowledgments are required?
- Are there restricted topics or stories?
- What consent processes are appropriate?
```

#### 3. Partner with Dream Organizations
Dream Organizations are local partners who help facilitate the tour stop:
- Community centers
- Indigenous organizations
- Cultural institutions
- Educational facilities
- Libraries and museums

**How to Partner:**
1. Identify potential partners aligned with community values
2. Present the World Tour vision and goals
3. Discuss resource sharing and responsibilities
4. Formalize partnership agreements
5. Add partners to the platform via `/admin/dream-organizations`

### Phase 2: Storyteller Recruitment (3-4 weeks before)

#### Recruitment Strategies

**Community Nominations**
- Ask community leaders to nominate storytellers
- Focus on diversity of voices (age, gender, background)
- Prioritize Elders and knowledge keepers
- Include emerging voices and youth perspectives

**Public Outreach**
- Social media announcements
- Community bulletin boards
- Local media coverage
- Word-of-mouth through trusted networks

**Direct Invitations**
- Personal invitations to specific storytellers
- Follow-up phone calls
- Provide clear information about the process
- Answer questions about consent and privacy

#### Consent Workflow

Use the campaign consent workflow to track each storyteller:

```
Invited → Interested → Consented → Recorded → Reviewed → Published
```

**Track via Admin Dashboard:**
- `/admin/campaigns/[tour-stop-id]/workflow`
- See pipeline visualization
- Advance storytellers through stages
- Monitor consent documentation

### Phase 3: Logistics (2-3 weeks before)

#### Venue Selection
```markdown
Ideal Venue Characteristics:
✅ Quiet, private recording space
✅ Accessible to community members
✅ Culturally appropriate setting
✅ Adequate seating and comfort
✅ Good lighting for video (if applicable)
✅ Reliable power and internet
✅ Parking and public transit access
```

#### Equipment Checklist
- [ ] Audio recording devices (backup recommended)
- [ ] Video equipment (if consent includes video)
- [ ] Consent forms (printed and digital)
- [ ] Release forms for photos/media
- [ ] Name tags and signage
- [ ] Refreshments and hospitality supplies
- [ ] Backup batteries and chargers
- [ ] External storage drives

#### Staffing Needs
- **Interview Lead** - Conducts interviews, asks questions
- **Technical Support** - Manages recording equipment
- **Cultural Liaison** - Ensures protocols are followed
- **Consent Coordinator** - Manages consent documentation
- **Hospitality Host** - Welcomes storytellers, provides comfort

### Phase 4: Execution (Event Day)

#### Setup (2 hours before)
1. Test all equipment
2. Arrange interview space
3. Set up hospitality area
4. Display cultural acknowledgments
5. Prepare consent stations
6. Brief all staff on protocols

#### During the Event
```markdown
For Each Storyteller:
1. Welcome and hospitality (10 min)
2. Consent review and signing (15 min)
3. Pre-interview briefing (5 min)
4. Story recording (30-60 min)
5. Post-interview discussion (10 min)
6. Thank you and next steps (5 min)

Total per storyteller: 75-105 minutes
```

#### Cultural Protocols During Recording
- Begin with traditional acknowledgment (if appropriate)
- Allow storyteller to set the pace
- Respect pauses and silence
- Watch for non-verbal cues of discomfort
- Have Elder present if discussing sacred knowledge
- Stop immediately if storyteller requests

### Phase 5: Post-Event Processing (1-2 weeks after)

#### Content Processing
1. **Upload Recordings** - Transfer to secure storage
2. **Transcription** - Generate automated transcripts
3. **Review** - Check accuracy of transcripts
4. **Elder Review** - If required by cultural protocols
5. **Publish** - Make stories available per consent preferences

#### Storyteller Follow-Up
- Send thank you messages
- Share link to their published story
- Provide analytics on story views/impact
- Invite to future events
- Request feedback on experience

#### Impact Measurement
Track via `/admin/world-tour/analytics`:
- Number of stories captured
- Diversity of storytellers (age, background)
- Geographic coverage
- Consent completion rates
- Partner organization engagement
- Story view metrics
- Connection discoveries (related storytellers)

## Campaign Consent Workflow

### Workflow Stages Explained

| Stage | Description | Actions |
|-------|-------------|---------|
| **Invited** | Storyteller has been invited | Send invitation email/letter |
| **Interested** | Storyteller expressed interest | Schedule interview, send details |
| **Consented** | Consent forms signed | Upload consent docs, verify completeness |
| **Recorded** | Story recorded | Upload audio/video files |
| **Reviewed** | Content reviewed for accuracy | Check transcript, Elder review if needed |
| **Published** | Story published on platform | Story visible per consent settings |
| **Withdrawn** | Consent withdrawn (rare) | Remove story, delete recordings |

### Managing Workflow via Admin
```typescript
// Navigate to campaign workflow page
/admin/campaigns/[tour-stop-id]/workflow

// Actions available:
- Drag storytellers between stages
- Bulk advance multiple storytellers
- Add notes to each workflow entry
- Upload consent documentation
- Set reminders for follow-up
```

## Dream Organizations Partnership

### What are Dream Organizations?
Organizations that share our values and help facilitate community storytelling:
- Provide venue and logistical support
- Help recruit storytellers
- Ensure cultural protocols are followed
- Promote the tour stop in their networks
- Co-brand the event (with permission)

### Partnership Benefits
**For Dream Organizations:**
- Access to storytelling platform
- Co-branded content and impact
- Community engagement and visibility
- Strengthened community connections
- Cultural preservation support

**For Empathy Ledger:**
- Local knowledge and trust
- Venue and logistics support
- Community access and introductions
- Cultural protocol guidance
- Ongoing partnership opportunities

### Adding Dream Organizations
```markdown
Via Admin Dashboard:
1. Go to /admin/dream-organizations
2. Click "Nominate Organization"
3. Fill in organization details:
   - Name, location, website
   - Mission and values alignment
   - Contact person
   - Proposed partnership activities
4. Submit for review
5. Formalize partnership agreement
6. Link organization to tour stop
```

## Budget Planning

### Sample Tour Stop Budget (50 storytellers)

| Category | Estimated Cost |
|----------|---------------|
| Venue rental | $500 - $1,500 |
| Equipment | $1,000 - $3,000 |
| Staffing (honorariums) | $2,000 - $5,000 |
| Storyteller honorariums | $2,500 - $5,000 |
| Hospitality (food, supplies) | $500 - $1,000 |
| Marketing materials | $300 - $800 |
| Transportation support | $500 - $1,500 |
| **Total** | **$7,300 - $17,800** |

### Funding Sources
- Grant applications
- Partner organization cost-sharing
- Crowdfunding campaigns
- Sponsorships (culturally appropriate)
- In-kind donations

## Timeline Template

### 12-Week Tour Stop Timeline

**Week 1-2: Foundation**
- Identify community and partners
- Research cultural protocols
- Secure venue

**Week 3-4: Partnerships**
- Formalize Dream Organization partnerships
- Establish advisory committee
- Confirm cultural protocols

**Week 5-7: Recruitment**
- Launch storyteller recruitment
- Send invitations
- Conduct pre-interviews

**Week 8-9: Logistics**
- Finalize venue setup
- Test equipment
- Brief staff

**Week 10: Final Preparations**
- Confirm all storytellers
- Print materials
- Conduct run-through

**Week 11: Event Execution**
- Tour stop events
- Story recordings
- Consent documentation

**Week 12: Post-Event**
- Upload and process stories
- Thank you messages
- Impact reporting

## Success Metrics

### Quantitative Metrics
- Number of stories captured
- Storyteller diversity (age, gender, cultural background)
- Consent completion rate
- Story publication rate
- Partner organizations engaged
- Geographic coverage

### Qualitative Metrics
- Cultural protocol adherence
- Storyteller satisfaction
- Community reception
- Story quality and depth
- Relationship building
- Cultural preservation impact

## Resources

### Templates
- [Storyteller Invitation Letter Template](#)
- [Consent Form Templates](#)
- [Partnership Agreement Template](#)
- [Interview Question Guide](#)
- [Cultural Protocol Checklist](#)

### Tools
- Campaign Workflow Dashboard: `/admin/campaigns/[id]/workflow`
- Dream Organizations Manager: `/admin/dream-organizations`
- Tour Stop Analytics: `/admin/world-tour/analytics`
- Story Upload Portal: `/admin/stories/upload`

### Support
- Technical questions: See [Technical Documentation](../../technical/)
- Cultural protocol questions: Consult with Elders and cultural advisors
- Platform questions: Contact platform support team

---

**Next Steps:**
1. Review this planning guide
2. Identify your community and partners
3. Create your tour stop in the admin dashboard
4. Begin community outreach and storyteller recruitment

**Related Documentation:**
- [Use Cases: Community Nominations](../use-cases/CLIENT_IMPLEMENTATION_PLAYBOOK.md)
- [Case Study: Ben Knight Profile](../case-studies/BEN_KNIGHT_COMPLETE_PROFILE_DEMO.md)
- [Launch Strategy: 1000 Storyteller Program](../use-cases/LAUNCH_STRATEGY_1000_STORYTELLER_PROGRAM.md)
