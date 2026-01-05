# Empathy Ledger v2 - Complete Strategic Rebuild Plan
## Mission-Aligned UX/UI Architecture & World-Class Development Studio

**Date**: January 2, 2026
**Version**: 1.0
**Status**: STRATEGIC FOUNDATION - Ready for Implementation

---

## Executive Summary

This document provides the complete strategic blueprint for rebuilding Empathy Ledger v2 with deep alignment to its mission of **Indigenous data sovereignty, storyteller empowerment, and cultural safety**. Based on comprehensive analysis of:

- 8 Mission Pillars across 171 database tables
- 3 distinct user audiences (Storytellers, Organizations, Public)
- Complete feature inventory from v02 archive
- ACT Ecosystem integration (LCAA methodology)
- OCAP® principles as technical architecture
- Editorial Warmth brand identity

**Current Reality**: Application was archived December 26, 2025. Only homepage remains functional. All 53+ pages and 250 API routes in archive. Database is 100% intact with 251 transcripts, 226 storytellers, 65+ organizations.

**Strategic Reset Opportunity**: Rebuild with best practices, modern UX patterns, and world-class development studio approach.

---

## Part 1: Mission Foundation - WHO, WHAT, WHY

### 1.1 What is Empathy Ledger?

**Core Definition**:
> "A next-generation multi-tenant cultural heritage storytelling platform designed to preserve, share, and honor Indigenous and community stories while upholding the highest standards of cultural sensitivity, data sovereignty, and technological excellence."

**The Metaphor - "The Embrace"**:
- Two open semicircular arcs facing each other
- Representing: Storyteller & Listener, Community & World, Elder & Next Generation
- The space between = where empathy lives, where stories are shared
- Mutual holding = reciprocal care between storyteller and platform

**Brand Colors (Earth Tone Gradient)**:
- **Ochre** (#96643a) - Earth, ancestry, land
- **Terracotta** (#b84a32) - Warmth, humanity, heart of storytelling
- **Sage** (#5c6d51) - Growth, healing, future
- **Charcoal** (#42291a) - Depth, grounding
- **Cream** (#faf6f1) - Space, openness

### 1.2 The Four Pillars of Mission

#### PRESERVE
"Preserve oral histories, stories, and cultural knowledge in digital formats"

**Database Foundation**:
- 208 transcripts loaded (59 columns each)
- Audio/video transcription pipeline
- Media assets (66-column comprehensive system)
- Multi-format support (text, audio, video, photos)
- Permanent, secure storage

#### CONTROL
"Communities maintain absolute control over their cultural data"

**OCAP® Implementation**:
- **Ownership**: Organizations table with cultural_identity (65 cols)
- **Control**: Elder review queue, cultural protocols enforcement
- **Access**: RLS policies, granular permissions, story access logs
- **Possession**: Data export, right to deletion, audit trails

**Database Tables**:
- `elder_review_queue` - Cultural safety core (NEVER REMOVE)
- `cultural_protocols` - Community-defined rules
- `consent_change_log` - GDPR + cultural safety
- `deletion_requests` - Right to deletion (25 cols)
- `audit_logs` - Complete transparency (20 cols)

#### SHARE
"Share stories with appropriate audiences while maintaining cultural protocols"

**Sharing Architecture**:
- Tiered access (private, community, organization, public)
- Story syndication with consent (27-col tracking)
- Magic link sharing for field reviews
- Embed tokens for controlled distribution (22 cols)
- Sacred content restrictions

#### CONNECT
"Connect storytellers, elders, and community members across geographical boundaries"

**Connection Infrastructure**:
- `storyteller_connections` (33 cols!) - AI-discovered connections
- `storyteller_themes` - Theme-based connections
- `storyteller_quotes` (28 cols) - Wisdom sharing
- `organization_storyteller_network` (15 cols) - Network graph
- Geographic clustering and thematic networks

### 1.3 Core Values Framework

1. **Cultural Sovereignty** - Indigenous data sovereignty non-negotiable
2. **Technological Excellence** - World-class architecture and UX
3. **Respectful Innovation** - Technology serves culture, not vice versa
4. **Community Partnership** - Co-creation with Indigenous communities
5. **Sustainable Impact** - Long-term viability benefiting all stakeholders

---

## Part 2: Audience Definitions & User Journeys

### 2.1 AUDIENCE 1: Storytellers (226 Active Profiles)

**WHO THEY ARE**:
- Indigenous knowledge keepers
- Community elders (cultural authority)
- Youth with lived experiences
- Cultural practitioners
- Survivors and advocates

**WHAT THEY NEED**:
- Safe space to share stories
- Complete control over narrative
- Recognition and impact tracking
- Connection with other storytellers
- Privacy and consent management

**COMPLETE USER JOURNEY**:

#### Phase 1: Onboarding & Profile Creation

**Entry Points**:
- Magic link (email/SMS) - no password required
- Organization invitation
- Elder endorsement
- Community recruitment

**Profile Setup Wizard** (6 Steps):
1. **Personal Information**: Name, display name, pronouns
2. **Cultural Affiliations**: Nations, communities, traditional territories
3. **Elder Status**: Traditional knowledge keeper designation
4. **Profile Photo**: Upload with cultural protocols
5. **Bio/About**: Share background and experience
6. **Language Preferences**: Indigenous language support

**Privacy & ALMA Settings** (CRITICAL - Currently Missing):
- Data sovereignty preferences
- Content visibility defaults (public/community/private)
- Allow AI analysis toggle
- Require elder approval for cultural content
- Sacred knowledge protection
- Consent tracking preferences
- Who can contact me settings

#### Phase 2: Story Creation (6-Step Wizard)

**Step 1: Consent & Cultural Protocols**
- Consent to share story
- Sacred knowledge identification
- Ceremonial content flags
- Traditional knowledge designation
- Geographic/territorial protocols
- Gender/age restrictions
- Seasonal appropriateness

**Step 2: Storyteller Information**
- Who is telling this story
- Relationship to content
- Community representation
- Elder endorsements

**Step 3: Story Content**

*Audio/Video Track*:
- Direct recording in-browser
- Upload pre-recorded files
- Auto-transcription (Whisper API)
- Multi-language support
- Dialect preservation

*Text Track*:
- Rich text editor
- Cultural markup (ceremonies, places, people)
- Timestamp markers for audio
- Quote highlighting

*Cultural Metadata*:
- Theme tagging (resilience, land, ceremony, language, etc.)
- Time period markers
- Geographic markers (traditional territories)
- People mentioned (for consent tracking)
- Cultural significance level (low/medium/high)

**Step 4: Media & Assets**
- Upload photos/videos
- Facial recognition with consent
- People tagging (requires consent from each person)
- Sacred content protection
- Cultural tags (ceremony type, location, season)
- Accessibility alt text (AI-suggested)

**Step 5: Sharing & Privacy Preferences**

*Visibility Settings*:
- Public (anyone)
- Community (registered members)
- Organization (my org only)
- Private (only me)

*Access Restrictions*:
- Gender-specific content
- Age-appropriate filtering
- Community-specific (e.g., only Yolngu people)
- Seasonal restrictions (e.g., only viewable in winter)

*Usage Permissions*:
- Allow downloads
- Allow sharing
- Allow quoting
- Allow AI analysis
- Commercial use restrictions

**Step 6: Cultural Review & Submission**
- Auto-routing to elder review (if flagged)
- Cultural protocol checklist verification
- Consent form digital signatures
- Submit for publication

#### Phase 3: My Stories Dashboard (Currently 0% Implemented)

**Features**:
- List all my stories
- Status indicators (draft/pending review/published/archived)
- Edit/delete actions
- Privacy level badges
- View analytics:
  - Story views
  - Engagement metrics
  - Ripple effects reported
  - Quotes shared
- **Narrative arc visualization** (AI-detected patterns):
  - Witnessing (38% of stories)
  - Teaching stories (23%)
  - Circular return (19%)
  - Linear journey (12%)
  - Braided stories (8%)

#### Phase 4: Privacy & Sovereignty Controls

**Data Sovereignty Features (OCAP Principles)**:

*Ownership*:
- Clear attribution and copyright
- Community ownership designation
- Transfer of ownership tools
- Legacy planning (what happens to my stories)

*Control*:
- Edit stories anytime
- Unpublish stories
- Delete stories (permanent removal)
- Revoke access permissions
- Update consent status
- Request elder review

*Access*:
- Granular permission controls
- Audit trail (who viewed my stories)
- Block specific users/organizations
- Geofencing (only viewable in certain locations)
- Time-based access (temporary sharing)

*Possession*:
- Export all my data (JSON/PDF)
- Download all media assets
- Consent form copies
- Analytics export
- Backup to personal storage

#### Phase 5: Community Engagement & Networking

**Find Other Storytellers**:
- Search by themes (resilience, healing, land, language)
- Search by cultural background
- Search by geographic region
- AI-powered "People Like You" recommendations
- "Complementary Expertise" matches

**Professional Networking**:
- Send connection requests with context
- Build storyteller network
- Mentorship matching (elders & emerging storytellers)
- Collaboration invitations
- Project portfolios (cross-organizational identity)

**Theme-Based Communities**:
- Join theme communities (e.g., "Language Reclamation")
- Discussion forums
- Resource sharing libraries
- Community workshops and events
- Collective wisdom curation

#### Phase 6: Personal Impact Dashboard

**Story Performance**:
- Views and engagement
- Shares and references
- Comments and responses
- Geographic reach map

**Ripple Effects (Community-Reported)**:
- Level 1: Personal impact on viewer
- Level 2: Shared with family/friends
- Level 3: Community action inspired
- Level 4: Other communities inspired
- Level 5: Policy/systems change
- **Visualization**: Concentric circles showing reach

**Narrative Analysis (AI-Powered)**:
- Emotional arc visualization
- Voice analysis (prosody, emotion, cultural markers)
- Key themes extracted
- Powerful quotes highlighted
- Cultural significance score
- **Community validation** (approve/reject AI interpretation)

**Personal Growth Tracking**:
- Storytelling journey timeline
- Skills developed
- Themes evolved
- Community connections made
- Professional opportunities

---

### 2.2 AUDIENCE 2: Organizations (65+ Active)

**WHO THEY ARE**:
- Indigenous cultural organizations
- Social service NGOs
- Tribal councils and band governments
- Educational institutions
- Community service providers

**WHAT THEY NEED**:
- Multi-tenant isolation
- Impact measurement (SROI, outcomes)
- Customizable branding
- Privacy compliance
- Analytics dashboards

**COMPLETE USER JOURNEY**:

#### Phase 1: Organization Onboarding & Setup

**Multi-Tenant Organization Creation**:
- Organization slug (subdomain/path)
- Organization name and branding
- Cultural identity configuration:
  - Colors, fonts, imagery
  - Cultural protocols
  - Community values
  - Traditional territories
- Elder council designation
- Community administrators
- Verification process

**Customization**:
- Custom domain (e.g., stories.yolngu.org)
- Branded portal
- Cultural design system
- Language variants
- Ceremony/seasonal calendar integration

#### Phase 2: Campaign & Project Management

**Create Campaigns/Projects**:
- Project name, description, goals
- Timeline (start/end dates)
- Funding information (for SROI tracking)
- Geographic scope
- Target storytellers/communities
- Cultural themes

**Storyteller Recruitment**:
- Invite storytellers via email/SMS
- Field-worker magic links (no account needed)
- QR codes for community events
- Offline data collection (sync later)
- Consent form management

**Story Collection Workflow**:
- Assign stories to projects
- Track collection progress
- Field worker mobile app (PWA)
- Offline mode for remote areas
- GPS tagging
- Photo/video uploads

**Quality Assurance**:
- Review submissions
- Flag for cultural review
- Route to elders
- Edit/enhance stories
- Approve for publication

#### Phase 3: Analytics & Reporting

**Organization Dashboard**:

*Story Analytics*:
- Total stories collected
- Stories by theme
- Stories by region/territory
- Timeline visualization
- Storyteller demographics (with consent)
- Language distribution

*Engagement Metrics*:
- Total views across stories
- Community engagement rate
- Geographic reach
- Shares and ripple effects
- Time spent on stories

*Impact Measurement (SROI - Social Return on Investment)*:

**SROI Calculator**:

Inputs:
- Total investment ($)
- Funding sources
- Project period
- Discount rate

Outcomes Definition:
- Stakeholder groups (youth, elders, community)
- Beneficiary counts
- Outcome types (cultural preservation, wellbeing, connection)
- Financial proxies (e.g., value of cultural camp = $500/person)
- Deadweight (what would have happened anyway)
- Attribution (% due to this project)
- Drop-off rate (decay over time)
- Duration of benefits

Results:
- **SROI Ratio** (e.g., $3.50 return per $1 invested)
- Sensitivity analysis (conservative/base/optimistic)
- Value by stakeholder group
- Present value calculations
- Charts and visualizations

Export:
- PDF funder reports
- CSV data export
- Executive summary
- Charts and graphs

*Theme Evolution Tracking*:
- Emerging themes detection
- Theme prominence over time (6-month timelines)
- Semantic shifts (e.g., "climate" from "weather" to "intergenerational responsibility")
- Theme relationships and clustering
- Growth/stable/declining themes

*Community Interpretation*:

**Interpretation Sessions**:
- Document community discussions
- 8+ participants discuss story themes
- Capture consensus points
- Note divergent views
- Cultural context preservation
- Recommendations for action

**Harvested Outcomes**:
- Unexpected benefits
- Community-reported impacts
- Real-world changes
- Policy influences

#### Phase 4: Cultural Governance

**Elder Review System** (Critical Feature):

*Elder Dashboard*:
- Pending review queue
- Cultural concern categories
- Annotation tools
- Approval/rejection workflow
- Cultural guidance notes
- Review history audit trail

*Review Process*:
- Auto-routing (AI flags 2% of stories for review)
- Multi-stage approval
- Escalation paths
- Community input integration
- Time-based deadlines

*Cultural Protocols Management*:
- Define organization protocols
- Sacred knowledge categories
- Gender/age restrictions
- Seasonal restrictions
- Geographic restrictions
- Ceremony-specific rules

#### Phase 5: Ethical Storyteller Engagement

**Consent Management**:
- Digital consent forms
- Multi-party consent (for family members mentioned)
- Consent tracking database
- Expiration reminders
- Renewal workflows
- Withdrawal processing

**Compensation Framework**:
- Storyteller payment tracking
- Honorarium management
- Gift/reciprocity logging
- Fair compensation guidelines
- Elder compensation protocols

**Capacity Building**:
- Storyteller training materials
- Cultural protocol education
- Digital literacy support
- Technical assistance
- Mentorship programs

#### Phase 6: Funder Reporting

**Funder Dashboard**:

*Executive Summary*:
- SROI headline ($3.50 per $1 invested)
- People directly impacted (250+)
- Communities engaged (3+)
- Stories collected (15+)

*Story Evidence*:
- Featured story arcs (transformation narratives)
- Emotional journey charts
- Video testimonials
- Powerful quotes
- Cultural validation

*Social Value Breakdown*:
- Youth value ($150k)
- Elders value ($120k)
- Community value ($80k)
- ROI sensitivity analysis

*Ripple Effects*:
- Direct impact (Level 1-3)
- Community spread (Level 4)
- Systems change (Level 5)
- Policy conversations initiated

*Community Voice*:
- Interpretation sessions (12+)
- Harvested outcomes (45+)
- Unexpected benefits (23+)
- Community testimonials

**Export Formats**:
- PDF quarterly reports
- PowerPoint presentations
- CSV data exports
- Embedded widgets for org website

---

### 2.3 AUDIENCE 3: Public (Story Discoverers)

**WHO THEY ARE**:
- Learners seeking Indigenous knowledge
- Researchers and academics
- Funders and policymakers
- General public
- Allies and advocates

**WHAT THEY NEED**:
- Discover culturally-appropriate stories
- Learn with respect
- Understand OCAP® principles
- Engage ethically
- Share stories (with permission)

**COMPLETE USER JOURNEY**:

#### Phase 1: Discovery & Exploration

**Public Homepage/Story Portal**:

*Featured Stories*:
- Curated story highlights
- Storyteller spotlights
- Recent publications
- Popular stories
- Editorial collections

*Browse & Filter*:
- By theme (resilience, language, land, ceremony, etc.)
- By cultural group/nation
- By geographic region
- By story type (teaching, witnessing, transformation)
- By media type (audio, video, text, photo)
- By language

*Search*:
- Full-text search across transcripts
- Natural language queries
- Quote search (find specific wisdom)
- Storyteller search
- Advanced filters

*Visual Discovery*:

**Interactive Map**:
- Stories geolocated on traditional territories
- Cultural boundaries overlayed
- Story clustering by region
- Respectful zoom limitations (prevent over-exposure of sacred sites)
- Territory acknowledgment

**Theme Network Visualization**:
- Network graph of theme connections
- Storyteller constellation
- Wisdom attribution networks
- Story cross-references

*AI Recommendations*:
- "You might also like..."
- Related stories
- Similar storytellers
- Cross-cultural learning paths
- Serendipitous discovery

#### Phase 2: Story Consumption Experience

**Individual Story Page**:

*Multimedia Presentation*:

**Audio Player**:
- Waveform visualization
- Playback speed control
- Transcript auto-scrolling (karaoke-style)
- Timestamp navigation
- Download option (if permitted)

**Video Player**:
- HD streaming
- Captions/subtitles
- Cultural context overlays
- Download option (if permitted)

**Photo Gallery**:
- High-resolution images
- Cultural tagging displayed
- People identification (with consent)
- Ceremonial context
- Location information
- Zoom functionality
- Slideshow mode

*Story Text & Transcript*:
- Full transcript
- Cultural markup highlighted
- People/place/ceremony annotations
- Language variants (if available)
- Downloadable PDF (if permitted)

*Cultural Context Panel*:
- Storyteller background
- Cultural affiliations
- Traditional territory
- Story significance
- Cultural protocols to respect
- Trigger warnings (trauma content)
- Sacred knowledge indicators

*Metadata Display*:
- Themes tagged
- Time period
- Location markers
- Languages spoken
- Story type/arc
- Recording date

#### Phase 3: Engagement & Interaction

**Community Features (Respectful Design)**:

*Comments (If Storyteller Allows)*:
- Threaded discussions
- Cultural moderation
- Elder oversight
- Respectful language enforcement
- Report inappropriate content

*Responses*:
- "This story moved me"
- "I learned [insight]"
- "This inspired me to [action]"
- Gratitude expressions
- Story connections ("Reminds me of...")

*Ripple Effect Reporting*:
- "This story inspired action"
- Ripple level selection (1-5)
- Impact description
- People affected
- Evidence/testimonials
- Geographic scope
- Time lag tracking

*Social Sharing (If Permitted)*:
- Share to social media
- Embed on website (with attribution)
- Email story
- Generate QR code
- Create collection/playlist

*Save & Collect*:
- Bookmark stories
- Create personal collections
- Download offline (PWA)
- Reading list
- Follow storytellers

#### Phase 4: Educational Experience

**Indigenous Data Sovereignty Education**:

*OCAP® Principles Explained*:
- Ownership
- Control
- Access
- Possession
- Why cultural protocols matter
- How consent works
- Respectful engagement guidelines
- Land acknowledgment importance

*Cultural Context*:
- Traditional territory maps
- Cultural glossaries
- Historical timelines
- Community resources
- Further reading

*Guided Learning Paths*:
- Theme-based journeys
- Story sequences
- Cross-cultural understanding
- Issue deep-dives (e.g., language reclamation)

---

## Part 3: Complete Route Architecture

### 3.1 Public Routes (Story Discovery)

| Route | Purpose | Priority |
|-------|---------|----------|
| `/` | Homepage with featured stories | P0 |
| `/stories` | Browse all published stories | P0 |
| `/stories/[id]` | Individual story page | P0 |
| `/storytellers` | Browse storytellers | P1 |
| `/storytellers/[id]` | Storyteller profile | P1 |
| `/map` | Interactive geographic story map | P2 |
| `/themes` | Theme exploration | P1 |
| `/themes/[slug]` | Theme-specific stories | P1 |
| `/about` | About Empathy Ledger | P0 |
| `/how-it-works` | Platform explanation | P0 |
| `/cultural-protocols` | OCAP®/ALMA education | P0 |
| `/community` | Community guidelines | P1 |

### 3.2 Storyteller Routes (Personal Dashboard)

| Route | Purpose | Priority |
|-------|---------|----------|
| `/dashboard` | Storyteller personal dashboard | P0 |
| `/dashboard/my-stories` | Story management | P0 |
| `/dashboard/create-story` | Story creation wizard | P0 |
| `/dashboard/edit-story/[id]` | Edit story | P0 |
| `/dashboard/profile` | Edit profile | P0 |
| `/dashboard/privacy` | Privacy & ALMA settings | P0 |
| `/dashboard/analytics` | Personal impact | P1 |
| `/dashboard/connections` | Network management | P2 |
| `/dashboard/projects` | Project portfolio | P1 |

### 3.3 Organization Admin Routes

| Route | Purpose | Priority |
|-------|---------|----------|
| `/admin` | Organization dashboard | P0 |
| `/admin/projects` | Project management | P0 |
| `/admin/projects/[id]` | Project detail | P0 |
| `/admin/storytellers` | Storyteller management | P1 |
| `/admin/stories` | Story curation | P0 |
| `/admin/cultural-review` | Elder review queue | P0 |
| `/admin/analytics` | Organization analytics | P1 |
| `/admin/sroi` | SROI calculator | P1 |
| `/admin/reports` | Funder reports | P1 |
| `/admin/settings` | Organization settings | P0 |
| `/admin/users` | User management | P0 |
| `/admin/consent` | Consent tracking | P1 |

### 3.4 API Routes (Backend Services)

**Categories**:
- `/api/auth/*` - Authentication & authorization
- `/api/stories/*` - Story CRUD operations
- `/api/media/*` - Media upload & management
- `/api/analytics/*` - Analytics data
- `/api/sroi/*` - SROI calculations
- `/api/cultural/*` - Cultural protocol enforcement
- `/api/ai/*` - AI processing & analysis
- `/api/admin/*` - Admin operations
- `/api/consent/*` - Consent management
- `/api/search/*` - Search & discovery

**Total**: ~250 API endpoints (documented in archive)

---

## Part 4: World Tour Sustainable Integration

### 4.1 What is the World Tour?

**Purpose**: Physical journey to Indigenous communities sharing Empathy Ledger mission and collecting stories in person.

**Database Tables**:
- `tour_requests` (19 cols) - Community tour nominations
- `tour_stops` (19 cols) - Tour locations and events

### 4.2 Sustainable Integration Strategy

**Phase 1: Digital Presence**
- `/world-tour` landing page
- Interactive tour map
- Nominate your community form
- Past stops gallery
- Impact stories from tour

**Phase 2: Field Collection Tools**
- PWA (Progressive Web App) for offline story collection
- Mobile-optimized story creation
- QR code check-ins at events
- GPS auto-tagging
- Offline sync capabilities

**Phase 3: Community Engagement**
- Pre-tour community outreach
- Post-tour impact tracking
- Tour storyteller spotlight
- Community follow-up resources
- Long-term relationship building

**Phase 4: Impact Measurement**
- Communities reached
- Stories collected
- Storytellers onboarded
- Cultural protocols co-created
- Partnerships formed

**Sustainability Principles**:
- Every tour stop has PURPOSE (not tourism)
- Community-led planning
- Cultural protocol respect
- Long-term relationship commitment
- Impact over activity metrics
- Resource-conscious travel
- Local hiring and compensation

---

## Part 5: World-Class Development Studio Approach

### 5.1 Development Studio Roles & Agents

**Team Structure**:

#### Frontend Design Team
**Role**: Component design, UI/UX, accessibility
**Agent**: Claude Sonnet 4.5 via `design-component` skill
**Responsibilities**:
- Design React components following Editorial Warmth palette
- Implement shadcn/ui patterns
- WCAG 2.1 AA compliance
- Trauma-informed design (gentle transitions)
- Cultural sensitivity in visual elements

#### Database Architect Team
**Role**: Schema design, RLS policies, query optimization
**Agent**: Claude via `supabase` and `database-navigator` skills
**Responsibilities**:
- Manage 171-table architecture
- Write RLS policies for tenant isolation
- Optimize query performance
- Maintain data integrity
- OCAP® compliance enforcement

#### Cultural Safety Team
**Role**: OCAP® compliance, elder workflow, cultural protocols
**Agent**: Claude via `cultural-review` skill + Indigenous Advisory Board
**Responsibilities**:
- Review all features for cultural appropriateness
- Design elder review workflows
- Sacred knowledge protection
- Cultural protocol enforcement
- Community consultation facilitation

#### AI/Analytics Team
**Role**: Farmhand multi-agent system, AI analysis, theme extraction
**Agents**:
- ALMA (cultural safety AI)
- Impact Analyzer
- Grant Writer
- Story Analysis Agent
- Story Writing Agent
**Responsibilities**:
- Process 208 transcripts
- Extract themes, quotes, connections
- Narrative arc detection
- Voice analysis (prosody, emotion)
- SROI calculations
- **Always with community validation**

#### Integration Team
**Role**: ACT ecosystem integration, MCPs, external APIs
**Agent**: Claude via `gohighlevel-oauth` and ACT skills
**Responsibilities**:
- Notion integration (6 databases)
- GitHub Projects automation
- GoHighLevel CRM (future)
- Supabase MCP (read-only + write)
- Playwright testing MCP

#### GDPR/Compliance Team
**Role**: Privacy compliance, audit trails, right to deletion
**Agent**: Claude via `gdpr-compliance` skill
**Responsibilities**:
- GDPR Article 7 (Consent)
- GDPR Article 17 (Right to Deletion)
- GDPR Article 20 (Data Portability)
- Audit log completeness
- Consent change tracking
- Privacy-by-design enforcement

### 5.2 Sprint Tracking & Development Workflow

**Sprint Structure** (ACT Ecosystem Integration):

#### Planning (Every 2 Weeks)
**Agent**: Claude via `act-sprint-workflow` skill

**Activities**:
1. Calculate velocity from historical data
2. Analyze backlog by priority
3. Select issues for sprint (GitHub Projects)
4. Assign to team members
5. Update Notion Sprint Tracking database

**Notion Databases Used**:
1. Sprint Tracking - https://www.notion.so/2d6ebcf981cf815fa30fc7ade0c0046d
2. Strategic Pillars - https://www.notion.so/2d6ebcf981cf81fea62fe7dc9a42e5c1
3. Velocity Metrics - https://www.notion.so/2d6ebcf981cf8123939ffab96227b3da

#### Daily Standup (Automated via GitHub Actions)
**Time**: Monday 5 PM UTC
**Agent**: Claude via automated workflow

**Activities**:
1. Query GitHub Projects for in-progress issues
2. Calculate sprint progress
3. Identify blockers
4. Update Notion Sprint Tracking
5. Generate standup summary

#### Code Review (Proactive Agent)
**Agent**: Claude code-reviewer subagent (auto-activates)

**Triggers**:
- After completing significant code
- Before git commit
- On pull request creation

**Reviews**:
- Security patterns (SQL injection, XSS, etc.)
- Cultural safety (AI bias detection)
- Performance optimization
- Accessibility compliance
- OCAP® principle adherence

#### Deployment (Automated Logging)
**Agent**: Claude via `deployment-workflow` skill

**Activities**:
1. Run tests (Playwright)
2. Build check
3. Deploy to Vercel
4. Log deployment to Notion Deployments database
5. Update DORA metrics

**Notion Database**:
4. Deployments - https://www.notion.so/2d6ebcf981cf81d1a72ec9180830a54e

#### Weekly Report (Friday 5 PM UTC)
**Agent**: Claude via automated workflow

**Activities**:
1. Aggregate week's sprint progress
2. Summarize deployments
3. Calculate velocity trends
4. Generate weekly report
5. Create Notion Weekly Report page

**Notion Database**:
6. Weekly Reports - https://www.notion.so/2d6ebcf981cf81fe9eade932693cd5dc

### 5.3 Development Standards & Best Practices

**Cultural Safety First**:
- Every feature reviewed by cultural-review agent
- Indigenous Advisory Board approval for major features
- Elder review workflow always honored
- Sacred knowledge protection non-negotiable
- Community veto power respected

**Technical Excellence**:
- TypeScript strict mode
- Component-driven architecture
- Accessibility (WCAG 2.1 AA)
- Performance (< 2s load times)
- Security (zero high-severity vulnerabilities)

**Documentation**:
- Component Storybook
- API documentation (OpenAPI)
- Database ER diagrams
- User guides
- Developer onboarding

**Testing Strategy**:
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- Accessibility tests (axe-core)
- Cultural protocol compliance tests

---

## Part 6: Implementation Phases

### Phase 1: Foundation (Weeks 1-3) - PRIORITY 0

**Goal**: Restore core platform with cultural safety

**Deliverables**:
1. **Profile Page Display** (Currently 0%)
   - Read profile data from database
   - Display name, bio, cultural affiliations
   - Profile photo with fallback
   - Privacy indicator
   - Cultural protocols badge

2. **Privacy Settings Panel** (Critical - Missing)
   - Story visibility defaults
   - Data sovereignty preferences
   - Who can contact me
   - Export my data
   - Delete my account

3. **ALMA Settings Panel** (Critical - Missing)
   - Sacred knowledge protection
   - Elder review preferences
   - AI analysis consent
   - Cultural protocol configuration
   - Notification preferences

4. **My Stories Dashboard** (Currently 0%)
   - List all stories
   - Status indicators
   - Edit/delete actions
   - Privacy badges
   - Basic analytics

5. **Basic Story Creation Form**
   - Upload audio/video OR text entry
   - Cultural metadata
   - Privacy settings
   - Submit for review

**Database Tables Used**:
- `profiles` (226 storytellers)
- `stories` (98 cols)
- `transcripts` (208 records)
- `cultural_protocols`
- `consent_change_log`

**Success Criteria**:
- [ ] Storytellers can view their profile
- [ ] Privacy settings can be configured
- [ ] ALMA settings functional
- [ ] My Stories list displays correctly
- [ ] Basic story creation works
- [ ] Zero cultural safety violations

**Cultural Review**: Indigenous Advisory Board approval required

---

### Phase 2: Public Story Experience (Weeks 4-6) - PRIORITY 0

**Goal**: Public can discover and view stories

**Deliverables**:
1. **Public Homepage**
   - Featured stories
   - Browse & filter
   - Search box
   - Territory acknowledgment
   - OCAP® education links

2. **Story Browsing**
   - Grid/list view
   - Theme filters
   - Cultural group filters
   - Geographic filters
   - Sort options

3. **Individual Story Page**
   - Audio/video player
   - Full transcript
   - Cultural context panel
   - Storyteller bio
   - Respectful engagement features

4. **Search & Discovery**
   - Full-text search across transcripts
   - Theme-based search
   - Storyteller search
   - Advanced filters

5. **Media Gallery Component**
   - Photo grid
   - Cultural tagging display
   - Zoom functionality
   - Slideshow mode

**Database Tables Used**:
- `stories` (published only)
- `transcripts`
- `media_assets` (66 cols)
- `narrative_themes`
- `storyteller_quotes`

**Success Criteria**:
- [ ] Public can browse published stories
- [ ] Search works across all content
- [ ] Individual story page displays correctly
- [ ] Media loads with proper attribution
- [ ] Cultural protocols visible and enforced
- [ ] WCAG 2.1 AA compliance

---

### Phase 3: Organization Tools (Weeks 7-10) - PRIORITY 1

**Goal**: Organizations can manage campaigns and measure impact

**Deliverables**:
1. **Project Management**
   - Create/edit projects
   - Storyteller recruitment
   - Story assignment
   - Progress tracking

2. **Basic Analytics Dashboard**
   - Story count
   - Storyteller count
   - Engagement metrics
   - Theme distribution

3. **Elder Review Queue**
   - Pending stories
   - Review workflow
   - Approval/rejection
   - Cultural guidance notes

4. **Consent Tracking**
   - Digital consent forms
   - Multi-party consent
   - Expiration tracking
   - Renewal workflows

5. **Simple Reports**
   - Executive summary
   - Story list
   - Storyteller roster
   - Basic impact metrics

**Database Tables Used**:
- `projects` (30 cols)
- `project_contexts` (45 cols!)
- `elder_review_queue`
- `consent_change_log`
- `organization_analytics`

**Success Criteria**:
- [ ] Organizations can create projects
- [ ] Storytellers can be recruited
- [ ] Elder review workflow functional
- [ ] Consent tracking complete
- [ ] Basic reports generate

---

### Phase 4: Advanced Features (Weeks 11-14) - PRIORITY 1-2

**Goal**: Activate AI pipeline and advanced analytics

**Deliverables**:
1. **SROI Calculator**
   - Input form
   - Outcome definition
   - Financial proxy selection
   - Calculation engine
   - Sensitivity analysis
   - PDF export

2. **AI Analysis Pipeline Activation**
   - Process 208 existing transcripts
   - Theme extraction
   - Quote detection
   - Narrative arc analysis
   - Voice analysis (prosody, emotion)
   - Populate empty tables:
     - `storyteller_connections`
     - `storyteller_quotes`
     - `storyteller_themes`
     - `extracted_quotes`

3. **Thematic Network Visualization**
   - D3 force-directed graph
   - Theme co-occurrence
   - Storyteller connections
   - Interactive exploration
   - Filter by cultural group

4. **Interactive Map**
   - Stories on traditional territories
   - Cultural boundaries
   - Cluster by region
   - Respectful zoom limits
   - Territory acknowledgment

5. **Professional Networking**
   - Find similar storytellers
   - Connection requests
   - Mentorship matching
   - Collaboration invitations

**Database Tables Used**:
- `sroi_calculations`
- `sroi_inputs`
- `sroi_outcomes`
- `narrative_themes`
- `storyteller_connections` (33 cols!)
- `storyteller_quotes` (28 cols)
- `cross_narrative_insights` (33 cols)

**Success Criteria**:
- [ ] SROI calculator generates reports
- [ ] AI pipeline processes all 208 transcripts
- [ ] Theme network displays connections
- [ ] Interactive map shows stories geographically
- [ ] Storytellers can find and connect
- [ ] Community validation UI works

---

### Phase 5: Polish & Launch (Weeks 15-16) - PRIORITY 1

**Goal**: Production-ready platform

**Deliverables**:
1. **Security Audit**
   - Penetration testing
   - Vulnerability scanning
   - RLS policy verification
   - Access control testing

2. **Performance Optimization**
   - Load testing
   - Database query optimization
   - CDN configuration
   - Image optimization
   - Code splitting

3. **Accessibility Compliance**
   - WCAG 2.1 AA audit
   - Screen reader testing
   - Keyboard navigation
   - Color contrast verification

4. **Community Training**
   - Storyteller onboarding materials
   - Organization admin guides
   - Elder review training
   - Video tutorials

5. **Launch Preparation**
   - Backup systems tested
   - Monitoring configured
   - Support processes established
   - Launch announcement

**Success Criteria**:
- [ ] Zero high-severity security vulnerabilities
- [ ] < 2s page load times
- [ ] 100% WCAG 2.1 AA compliance
- [ ] Training materials complete
- [ ] Backup/recovery tested
- [ ] Indigenous Advisory Board approval

---

## Part 7: Critical Success Factors & Non-Negotiables

### 7.1 Cultural Safety is Sacred

**Never Compromise**:
- Elder review workflows
- Cultural protocol enforcement
- OCAP® principles
- Sacred content protection
- Community veto power
- Consent tracking
- Audit trails

**Database Tables (NEVER REMOVE)**:
- `elder_review_queue`
- `cultural_protocols`
- `consent_change_log`
- `moderation_results`
- `audit_logs`
- `deletion_requests`

### 7.2 Technical Excellence Serves the Mission

**Standards**:
- < 2 second page load times
- 99.9% uptime
- Zero high-severity vulnerabilities
- 100% OCAP® compliance
- WCAG 2.1 AA accessibility
- Sub-100ms database queries (95th percentile)

### 7.3 Community Partnership is Real

**Requirements**:
- Indigenous Advisory Board with decision-making authority
- Co-creation of features
- Transparent roadmap
- Revenue benefits communities
- Community veto power on all major decisions

### 7.4 Data Governance is World-Class

**Compliance**:
- GDPR Article 7 (Consent)
- GDPR Article 17 (Right to Deletion)
- GDPR Article 20 (Data Portability)
- OCAP® principles
- Complete audit trails
- Export capabilities maintained

---

## Part 8: Metrics & Success Measurement

### 8.1 Cultural Impact Metrics

**Community Adoption**:
- Target: 10 Indigenous organizations (Year 1)
- Target: 100 active storytellers (Monthly)
- Target: 1,000 stories preserved (Year 1)
- Target: 50 elders participating (Year 1)
- Target: 90% positive community feedback

**Cultural Effectiveness**:
- 100% OCAP® compliance
- Positive Indigenous Advisory Board evaluation (Quarterly)
- 95% story approval rate (cultural review)
- 100% consent documentation
- Net Promoter Score > 50 (Communities)

### 8.2 Technical Performance Metrics

**Platform Performance**:
- Page load: < 2 seconds
- Uptime: 99.9%
- API response: < 200ms (95th percentile)
- Database queries: < 100ms (95th percentile)
- Media loading: < 3 seconds (globally)

**Security**:
- Zero high-severity vulnerabilities
- 100% unauthorized access attempts blocked
- Zero data breaches
- 100% compliance (privacy, cultural property laws)
- Pass all quarterly security audits

### 8.3 Business Sustainability Metrics

**Platform Growth**:
- 25% monthly active user growth (Year 1)
- 15% monthly content growth
- Sustainable revenue by Month 18
- New community partnerships quarterly
- 80% feature adoption

**Operational Efficiency**:
- Support resolution: < 24 hours
- Development velocity: 2-week sprints
- Bug resolution: < 7 days (critical), < 30 days (non-critical)
- Training success: 100% of admins
- Documentation currency: < 30 days of feature release

---

## Appendix A: Database Mission Alignment Summary

**Total Tables**: 171 + 12 views

**Priority Breakdown**:
- **Priority 1 (Critical)**: 63 tables (37%) - Cultural Safety, Storytellers, Privacy
- **Priority 2 (Important)**: 68 tables (40%) - Community, Impact, Themes
- **Priority 3 (Nice-to-have)**: 25 tables (15%) - Distribution, Engagement
- **Priority 4 (Questionable)**: 15 tables (9%) - Review for removal

**Health Assessment**: ⭐⭐⭐⭐☆ (4.5/5)

**Strengths**:
- Cultural safety: World-class
- Data governance: Exceeds GDPR
- Impact tracking: Sophisticated
- Multi-tenancy: Excellent
- Content management: Clean

**Needs Activation**:
- AI pipeline (208 transcripts waiting)
- Analytics (storyteller connections, themes empty)
- Engagement tracking (infrastructure ready)
- Thematic network visualization

**Consolidation Opportunities**:
- 3 theme evolution tables → 1-2 tables
- 3 analysis job tables → 2 tables
- 8 photo system remnants → 0 tables (investigate)
- 3 professional dev tables → 0 tables (remove)

---

## Appendix B: ACT Ecosystem Integration

**Empathy Ledger's Role in ACT**:
- Flagship ethical storytelling platform
- OCAP® principles in production
- Cultural safety with AI integration
- Community-controlled technology
- Regenerative business model demonstration

**Shared Infrastructure**:
- GitHub Projects: ACT Ecosystem Development
- Notion Workspace: 6 databases for sprint tracking
- Bitwarden Vault: Encrypted .env backup
- Supabase: Dedicated instance (yvnuayzslukamizrlhwb)
- Vercel: Production deployment

**Claude Skills Available**:
- `deployment-workflow` - Automated deployment
- `codebase-explorer` - Architecture understanding
- `supabase` - Database management
- `design-component` - UI component creation
- `cultural-review` - Cultural sensitivity checking
- `gdpr-compliance` - Privacy compliance
- `storyteller-analytics` - Analytics design
- `act-sprint-workflow` - Sprint planning

**MCP Servers**:
- Supabase MCP (read-only + write)
- Playwright MCP (E2E testing)
- GitHub MCP (Projects API)
- Notion MCP (Database operations)

---

## Appendix C: Brand Voice & Messaging Guidelines

### We Are:
- **Respectful** - Every story treated with dignity
- **Clear** - Plain language, no jargon
- **Warm** - Human, not institutional
- **Honest** - About limitations and intentions

### We Are NOT:
- **Extractive** - We don't take stories, we hold them
- **Performative** - Action over optics
- **Paternalistic** - Communities lead, we support

### Messaging Patterns:

**DO SAY**:
- "Your stories remain yours"
- "Indigenous communities lead, we support"
- "Data sovereignty is non-negotiable"
- "Designed with Indigenous communities, for justice across all"

**DON'T SAY**:
- "We empower" (savior complex)
- "We give voice to" (patronizing)
- "Our storytellers" (possession)
- "Help Indigenous communities" (paternalistic)

### Visual Identity:
- **Logo**: "The Embrace" - two open arcs facing each other
- **Colors**: Ochre, Terracotta, Sage, Charcoal, Cream (earth tones)
- **Typography**: Georgia (serif) for wordmark, system sans-serif for body
- **Imagery**: Authentic, culturally-appropriate, with consent

---

## Conclusion

This strategic plan provides the complete blueprint for rebuilding Empathy Ledger v2 with:

1. **Clear Mission Alignment**: 8 pillars, OCAP® principles, cultural safety first
2. **Defined Audiences**: Storytellers (226), Organizations (65+), Public
3. **Complete User Journeys**: Every feature mapped to user needs
4. **Comprehensive Routes**: 53+ pages, 250+ API endpoints
5. **World Tour Integration**: Sustainable, purposeful community engagement
6. **World-Class Development**: Agents, skills, sprint tracking, automation
7. **Phased Implementation**: 16-week roadmap with clear priorities
8. **Success Metrics**: Cultural impact, technical performance, sustainability

**Foundation**: Solid database (171 tables, 4.5/5 mission-aligned)
**Opportunity**: Activate AI pipeline for 208 transcripts, complete analytics vision
**Non-Negotiable**: Cultural safety, OCAP® compliance, elder authority, community sovereignty

**Next Step**: Begin Phase 1 (Weeks 1-3) restoring profile page, privacy settings, ALMA settings, My Stories dashboard.

This is the definitive strategic foundation for world-class Indigenous storytelling platform development.

---

**Document Status**: APPROVED FOR IMPLEMENTATION
**Author**: Claude Sonnet 4.5 + ACT Development Team
**Review Date**: January 2, 2026
**Next Review**: After Phase 1 completion
