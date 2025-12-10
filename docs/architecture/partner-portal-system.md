# Partner Portal System Architecture

## Overview

A self-service portal for partner organizations (ACT, JusticeHub, etc.) to manage their story syndication relationship with Empathy Ledger.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PARTNER PORTAL                                         │
│                    (portal.empathyledger.com)                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Dashboard  │  │  Projects   │  │   Story     │  │  Messages   │            │
│  │  Overview   │  │  Manager    │  │  Curator    │  │   Center    │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                │                    │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐            │
│  │                    Partner Portal API                           │            │
│  │              /api/partner/* (authenticated)                     │            │
│  └─────────────────────────────┬───────────────────────────────────┘            │
│                                │                                                 │
└────────────────────────────────┼─────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        EMPATHY LEDGER CORE                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │                         DATABASE LAYER                                  │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │     │
│  │  │   Partners   │  │   Projects   │  │  Story      │  │  Messages  │ │     │
│  │  │ (external_   │  │  (partner_   │  │  Requests   │  │  (partner_ │ │     │
│  │  │ applications)│  │   projects)  │  │ (story_     │  │  messages) │ │     │
│  │  │              │  │              │  │ syndication │  │            │ │     │
│  │  └──────────────┘  └──────────────┘  │ _consent)   │  └────────────┘ │     │
│  │                                      └──────────────┘                  │     │
│  └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │                       NOTIFICATION SYSTEM                               │     │
│  │  • Storyteller notifications (new requests, messages)                   │     │
│  │  • Partner notifications (consent changes, new messages)                │     │
│  │  • Email + in-app + push                                               │     │
│  └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Tables

```sql
-- Partner Projects (collections of stories for specific campaigns/purposes)
CREATE TABLE partner_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,

  -- Configuration
  themes TEXT[] DEFAULT '{}',
  story_types TEXT[] DEFAULT '{}',
  geographic_focus TEXT,

  -- Display preferences
  show_storyteller_names BOOLEAN DEFAULT true,
  show_storyteller_photos BOOLEAN DEFAULT true,
  allow_full_content BOOLEAN DEFAULT true,
  custom_branding JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(app_id, slug)
);

-- Story requests (partner requesting a story for their project)
CREATE TABLE story_syndication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES partner_projects(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,

  -- Request details
  requested_by UUID REFERENCES auth.users(id),
  request_message TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),

  -- Response
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'revoked')),
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Creates consent record when approved
  consent_id UUID REFERENCES story_syndication_consent(id),

  UNIQUE(story_id, project_id)
);

-- Partner-Storyteller messaging
CREATE TABLE partner_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants (never expose storyteller contact to partner)
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,

  -- Thread tracking
  thread_id UUID NOT NULL,
  parent_message_id UUID REFERENCES partner_messages(id),

  -- Message content
  sender_type TEXT NOT NULL CHECK (sender_type IN ('partner', 'storyteller')),
  sender_user_id UUID REFERENCES auth.users(id),
  subject TEXT,
  content TEXT NOT NULL,

  -- Related context
  story_id UUID REFERENCES stories(id),
  project_id UUID REFERENCES partner_projects(id),

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Partner team members (multiple people can manage a partner account)
CREATE TABLE partner_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(app_id, user_id)
);

-- Partner analytics snapshots (daily aggregates)
CREATE TABLE partner_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  project_id UUID REFERENCES partner_projects(id),
  date DATE NOT NULL,

  -- Metrics
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_read_time_seconds INTEGER DEFAULT 0,
  avg_scroll_depth NUMERIC(5,2),
  shares INTEGER DEFAULT 0,

  -- Story counts
  stories_displayed INTEGER DEFAULT 0,
  stories_with_engagement INTEGER DEFAULT 0,

  -- Geographic
  top_countries JSONB DEFAULT '[]',
  top_cities JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(app_id, project_id, date)
);

-- Indexes
CREATE INDEX idx_partner_projects_app ON partner_projects(app_id);
CREATE INDEX idx_story_requests_story ON story_syndication_requests(story_id);
CREATE INDEX idx_story_requests_project ON story_syndication_requests(project_id);
CREATE INDEX idx_story_requests_status ON story_syndication_requests(status);
CREATE INDEX idx_partner_messages_thread ON partner_messages(thread_id);
CREATE INDEX idx_partner_messages_storyteller ON partner_messages(storyteller_id);
CREATE INDEX idx_partner_messages_app ON partner_messages(app_id);
CREATE INDEX idx_partner_analytics_date ON partner_analytics_daily(date);

-- RLS Policies
ALTER TABLE partner_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_syndication_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Partners can only see their own data
CREATE POLICY partner_projects_policy ON partner_projects
  FOR ALL USING (
    app_id IN (
      SELECT app_id FROM partner_team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY story_requests_policy ON story_syndication_requests
  FOR ALL USING (
    app_id IN (
      SELECT app_id FROM partner_team_members WHERE user_id = auth.uid()
    )
    OR
    -- Storytellers can see requests for their stories
    story_id IN (
      SELECT id FROM stories WHERE storyteller_id IN (
        SELECT id FROM storytellers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY partner_messages_partner_policy ON partner_messages
  FOR ALL USING (
    app_id IN (
      SELECT app_id FROM partner_team_members WHERE user_id = auth.uid()
    )
    OR
    -- Storytellers can see their messages
    storyteller_id IN (
      SELECT id FROM storytellers WHERE user_id = auth.uid()
    )
  );
```

---

## API Endpoints

### Partner Portal API

```
/api/partner/

Authentication: JWT token with partner team member role

── Dashboard ──
GET    /dashboard                    Overview stats
GET    /dashboard/analytics          Detailed analytics

── Projects ──
GET    /projects                     List projects
POST   /projects                     Create project
GET    /projects/:id                 Get project details
PATCH  /projects/:id                 Update project
DELETE /projects/:id                 Delete project
GET    /projects/:id/stories         Stories in project
GET    /projects/:id/analytics       Project analytics

── Story Catalog ──
GET    /catalog                      Browse available stories
GET    /catalog/themes               Get available themes
GET    /catalog/storytellers         Browse storytellers
POST   /catalog/request              Request story for project

── Requests ──
GET    /requests                     List all requests
GET    /requests/pending             Pending requests
GET    /requests/:id                 Request details
DELETE /requests/:id                 Cancel request

── Messages ──
GET    /messages                     List conversations
GET    /messages/thread/:id          Get thread
POST   /messages                     Send message
PATCH  /messages/:id/read            Mark as read

── Team ──
GET    /team                         List team members
POST   /team/invite                  Invite member
PATCH  /team/:id                     Update member role
DELETE /team/:id                     Remove member

── Settings ──
GET    /settings                     Get partner settings
PATCH  /settings                     Update settings
POST   /settings/regenerate-secret   New API secret
GET    /settings/webhooks            Webhook config
POST   /settings/webhooks            Add webhook
```

### Storyteller API (new endpoints)

```
/api/storyteller/

── Syndication Requests ──
GET    /requests                     Requests for my stories
GET    /requests/:id                 Request details
POST   /requests/:id/approve         Approve request
POST   /requests/:id/decline         Decline request
POST   /requests/:id/revoke          Revoke consent

── Partner Messages ──
GET    /messages                     Messages from partners
GET    /messages/thread/:id          Conversation thread
POST   /messages/:id/reply           Reply to message

── Impact ──
GET    /impact                       Cross-platform impact
GET    /impact/by-platform           Breakdown by partner
```

---

## Portal Pages

### 1. Dashboard

```
/portal/dashboard

┌─────────────────────────────────────────────────────────────────────┐
│  🏢 act.place Partner Portal                    [Team ▼] [Settings] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Welcome back, Sarah!                                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │    1,247     │  │      23      │  │    5:32      │  │    4    │ │
│  │ Total Views  │  │   Stories    │  │ Avg Read     │  │Projects │ │
│  │  +18% ↑      │  │  Active      │  │   Time       │  │         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘ │
│                                                                      │
│  📊 Engagement This Week                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [Area chart showing views over past 7 days]                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ── Recent Activity ──────────────────────────────────────────────  │
│                                                                      │
│  ✅ "Climate Journey" consent approved by Maria T.     2 hours ago  │
│  📩 New message from David K. about "My Story"        Yesterday     │
│  ⏳ Request pending for "Finding Hope"                3 days ago    │
│                                                                      │
│  ── Quick Actions ────────────────────────────────────────────────  │
│                                                                      │
│  [📖 Browse Stories]  [➕ Create Project]  [📨 Messages (3)]        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Story Catalog

```
/portal/catalog

┌─────────────────────────────────────────────────────────────────────┐
│  📖 Story Catalog                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 [Search stories...                    ]  Theme: [All ▼]         │
│                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────┐ │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌────────┐ │ │
│  │  │   [Image]     │  │  │  │   [Image]     │  │  │  │[Image] │ │ │
│  │  └───────────────┘  │  │  └───────────────┘  │  │  └────────┘ │ │
│  │  Climate Journey    │  │  Finding Home       │  │  My Path    │ │
│  │                     │  │                     │  │             │ │
│  │  A story about...   │  │  After years of...  │  │  Walking... │ │
│  │                     │  │                     │  │             │ │
│  │  👤 Maria T.        │  │  👤 David K.        │  │  👤 Sam L.  │ │
│  │  🏷️ climate, justice│  │  🏷️ housing, hope   │  │  🏷️ health │ │
│  │                     │  │                     │  │             │ │
│  │  [Request Story]    │  │  [✓ In Project]     │  │  [Request]  │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────┘ │
│                                                                      │
│  Showing 12 of 156 stories  [Load More]                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Project Manager

```
/portal/projects/:id

┌─────────────────────────────────────────────────────────────────────┐
│  📁 Climate Justice Stories                        [Edit] [⚙️]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Stories highlighting climate impacts on communities                 │
│  Themes: climate, justice, community, resilience                    │
│                                                                      │
│  ── Stories (12 approved) ────────────────────────────────────────  │
│                                                                      │
│  │ Story               │ Storyteller │ Status    │ Views │ Actions │
│  ├─────────────────────┼─────────────┼───────────┼───────┼─────────┤
│  │ Climate Journey     │ Maria T.    │ ✅ Active │ 423   │ [···]   │
│  │ Rising Waters       │ James P.    │ ✅ Active │ 287   │ [···]   │
│  │ Our Land            │ Elder Sarah │ ✅ Active │ 198   │ [···]   │
│  │ Tomorrow's Hope     │ Anonymous   │ ⏳ Pending│ -     │ [···]   │
│                                                                      │
│  ── Embed Code ───────────────────────────────────────────────────  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ <div data-empathy-stories="true"                            │    │
│  │      data-project="clim-just-2024"                          │    │
│  │      data-layout="grid">                                    │    │
│  │ </div>                                                      │    │
│  │ <script src="https://empathyledger.com/embed/stories.js">   │    │
│  │ </script>                                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  [📋 Copy Code]                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Message Center

```
/portal/messages

┌─────────────────────────────────────────────────────────────────────┐
│  📨 Messages                                        [New Message]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐   │
│  │                  │  │                                        │   │
│  │  ● Maria T.      │  │  Re: Climate Journey Story             │   │
│  │    About story   │  │  ────────────────────────────────────  │   │
│  │    request       │  │                                        │   │
│  │    2 hours ago   │  │  Maria T. • 2 hours ago               │   │
│  │                  │  │                                        │   │
│  │  David K.        │  │  Thank you for reaching out! I'm      │   │
│  │  Question about  │  │  happy for my story to be featured    │   │
│  │  usage           │  │  in your project. I've approved the   │   │
│  │  Yesterday       │  │  request through my dashboard.        │   │
│  │                  │  │                                        │   │
│  │  Sam L.          │  │  ────────────────────────────────────  │   │
│  │  Follow-up       │  │                                        │   │
│  │  3 days ago      │  │  You • 5 hours ago                    │   │
│  │                  │  │                                        │   │
│  │                  │  │  Hi Maria, we'd love to feature your  │   │
│  │                  │  │  Climate Journey story in our...      │   │
│  │                  │  │                                        │   │
│  │                  │  │  [Reply...]                            │   │
│  └──────────────────┘  └────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Story Card Designs

### Card Variants

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STANDARD CARD                                │
│                                                                      │
│  ┌───────────────────────────────────────────────┐                  │
│  │                                               │                  │
│  │              Featured Image                   │                  │
│  │              (16:9 aspect)                    │                  │
│  │                                               │                  │
│  └───────────────────────────────────────────────┘                  │
│                                                                      │
│  🏷️ climate  🏷️ resilience                                          │
│                                                                      │
│  Story Title Here                                                    │
│  ─────────────────────────────────────                              │
│  Brief summary text that introduces the story                       │
│  and gives readers context about what they'll...                    │
│                                                                      │
│  ┌────┐                                                             │
│  │ 👤 │  Storyteller Name                                           │
│  └────┘  via Empathy Ledger                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         COMPACT CARD                                 │
│                                                                      │
│  ┌────────┐  Story Title                                            │
│  │        │  ─────────────────────────                              │
│  │ Image  │  Brief summary text that gives                          │
│  │        │  readers context...                                     │
│  │        │                                                         │
│  └────────┘  👤 Storyteller  •  🏷️ climate                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         FEATURED CARD                                │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                    Full-width Featured Image                  │  │
│  │                    (21:9 cinematic aspect)                    │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │                                                         │ │  │
│  │  │  FEATURED STORY                                         │ │  │
│  │  │  ────────────────────────────────                      │ │  │
│  │  │  Story Title That Commands Attention                    │ │  │
│  │  │                                                         │ │  │
│  │  │  A longer excerpt that draws readers in and gives      │ │  │
│  │  │  them a real sense of what this story is about...      │ │  │
│  │  │                                                         │ │  │
│  │  │  👤 Storyteller Name  •  🏷️ climate, justice, hope      │ │  │
│  │  │                                                         │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Theme Styling

```css
/* Card themes for partner customization */

.story-card--light {
  --card-bg: #ffffff;
  --card-text: #1c1917;
  --card-muted: #78716c;
  --card-border: #e7e5e4;
  --tag-bg: #f5f5f4;
  --tag-text: #44403c;
}

.story-card--dark {
  --card-bg: #1c1917;
  --card-text: #fafaf9;
  --card-muted: #a8a29e;
  --card-border: #44403c;
  --tag-bg: #292524;
  --tag-text: #d6d3d1;
}

.story-card--sage {
  --card-bg: #f4f7f5;
  --card-text: #2c3a30;
  --card-muted: #5a7c65;
  --card-border: #c9d7cd;
  --tag-bg: #e4ebe6;
  --tag-text: #3d5444;
}

.story-card--earth {
  --card-bg: #faf8f5;
  --card-text: #473728;
  --card-muted: #8b6f4e;
  --card-border: #e4d9cc;
  --tag-bg: #f2ede6;
  --tag-text: #654d36;
}
```

---

## Implementation Priority

### Phase 1: Core Portal (MVP)
1. Partner registration & authentication
2. Basic project management
3. Story catalog browsing
4. Request/consent flow
5. Embed widget generation

### Phase 2: Communication
1. Partner-storyteller messaging
2. Notification system
3. Message templates
4. Thread management

### Phase 3: Analytics
1. Partner dashboard metrics
2. Project-level analytics
3. Story performance reports
4. Export capabilities

### Phase 4: Advanced Features
1. Team management
2. Custom branding
3. API rate limiting & tiers
4. Webhook management
5. Billing integration (if applicable)

---

## Security Considerations

1. **Data Isolation**: Partners only see stories they have consent for
2. **Contact Protection**: Storyteller emails/phones never exposed
3. **Message Moderation**: Option to review partner messages
4. **Consent Audit**: Full trail of consent changes
5. **Rate Limiting**: Prevent catalog scraping
6. **JWT Expiry**: Short-lived tokens, refresh mechanism
