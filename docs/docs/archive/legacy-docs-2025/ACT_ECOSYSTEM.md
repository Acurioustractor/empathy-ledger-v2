# A Curious Tractor (ACT) Ecosystem Architecture

**Multi-site storytelling platform with unified design, shared stories, and storyteller sovereignty**

---

## 🌍 The Vision

### What We're Building

**A network of interconnected storytelling sites** where:
- Each site has its own identity and project focus
- All sites share the **Empathy Ledger design language**
- Stories can flow between sites **with consent**
- Storytellers maintain **complete control** over their stories
- Content can be shared via API **or revoked instantly**
- Accessibility is consistent across the network

---

## 🏗️ Architecture Overview

### The Hub-and-Spoke Model

```
┌─────────────────────────────────────────────────┐
│         Empathy Ledger (Central Hub)            │
│                                                  │
│  - Core storyteller profiles                    │
│  - Master story repository                      │
│  - Consent & rights management                  │
│  - Sharing API                                  │
│  - Design system source                         │
│  - Analytics aggregation                        │
└────────────┬────────────────────────────────────┘
             │
             │ Shares stories via API
             │ (with storyteller consent)
             │
     ┌───────┼───────┬───────────┬──────────┐
     │       │       │           │          │
     ▼       ▼       ▼           ▼          ▼
┌─────────┐ │  ┌─────────┐ ┌─────────┐ ┌─────────┐
│ ACT     │ │  │ Project │ │ Project │ │ Project │
│ Main    │ │  │ Site A  │ │ Site B  │ │ Site C  │
│ Site    │ │  │         │ │         │ │         │
│         │ │  │ Youth   │ │ Land    │ │ Cultural│
│ Public  │ │  │ Stories │ │ Rights  │ │ Archive │
│ Portal  │ │  │         │ │         │ │         │
└─────────┘ │  └─────────┘ └─────────┘ └─────────┘
            │
            │ Third-party sites
            │ (via public API)
            ▼
     ┌─────────────┐
     │ External    │
     │ Research    │
     │ Platform    │
     └─────────────┘
```

---

## 🎨 Cross-Site Design Consistency

### 1. Shared Design System Package

**Strategy: NPM Package + Git Submodule**

```bash
# Central design system repository
@act/empathy-ledger-design-system/
├── components/
│   ├── core/
│   ├── narrative/
│   └── data/
├── styles/
│   ├── tokens.css
│   └── animations.css
├── themes/
│   ├── act-main.ts
│   ├── youth-stories.ts
│   └── land-rights.ts
└── package.json
```

**Each site installs:**

```bash
# Install design system
npm install @act/empathy-ledger-design-system

# Or use as git submodule for development
git submodule add https://github.com/ACT/empathy-ledger-design-system src/design-system
```

### 2. Theme Variants for Each Site

**Empathy Ledger base + site-specific accent:**

```typescript
// ACT Main Site - Default warmth
export const actMainTheme = {
  extends: 'empathy-ledger-base',
  accent: '#E07A5F',  // Warm coral
  name: 'A Curious Tractor'
}

// Youth Stories - Vibrant
export const youthStoriesTheme = {
  extends: 'empathy-ledger-base',
  accent: '#06B6D4',  // Bright cyan
  name: 'Youth Voices'
}

// Land Rights - Earth tones
export const landRightsTheme = {
  extends: 'empathy-ledger-base',
  accent: '#059669',  // Deep green
  name: 'Land & Territory'
}

// Cultural Archive - Heritage
export const culturalArchiveTheme = {
  extends: 'empathy-ledger-base',
  accent: '#D97706',  // Amber heritage
  name: 'Cultural Preservation'
}
```

**Usage:**

```typescript
// Each site wraps app in ThemeProvider
import { EmpathyLedgerThemeProvider } from '@act/empathy-ledger-design-system'
import { youthStoriesTheme } from './themes'

export default function RootLayout({ children }) {
  return (
    <EmpathyLedgerThemeProvider theme={youthStoriesTheme}>
      {children}
    </EmpathyLedgerThemeProvider>
  )
}
```

### 3. Consistent Accessibility Standards

**Enforced across all ACT sites:**

```typescript
// Accessibility config (shared)
export const accessibilityStandards = {
  // WCAG AAA compliance
  contrast: {
    normalText: 7.0,      // 7:1 ratio
    largeText: 4.5,       // 4.5:1 ratio
    ui: 3.0               // 3:1 for UI components
  },

  // Keyboard navigation
  focusVisible: {
    outline: '2px solid var(--accent)',
    outlineOffset: '2px',
    borderRadius: '4px'
  },

  // Touch targets
  minTouchTarget: 44,  // px (WCAG 2.5.5)
  minSpacing: 8,       // px between targets

  // Screen reader support
  ariaRequired: true,
  semanticHTML: true,

  // Animation preferences
  respectReducedMotion: true
}
```

**Accessibility testing across sites:**

```bash
# Run on all ACT sites
npm run a11y:audit

# Tests:
# - Color contrast (automated)
# - Keyboard navigation (automated)
# - Screen reader compatibility (manual)
# - Touch target sizes (automated)
# - ARIA labels presence (automated)
```

---

## 📊 Database Architecture

### Multi-Site Story Management

**Core tables (Empathy Ledger Hub):**

```sql
-- Existing: profiles, stories, transcripts, projects

-- NEW: Cross-site story visibility
CREATE TABLE story_site_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,

  -- Consent tracking
  storyteller_consent BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_expires_at TIMESTAMPTZ,  -- Optional expiration

  -- Visibility settings
  visibility 'public' | 'unlisted' | 'private',
  show_on_homepage BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,

  -- Project tagging
  project_tags TEXT[],  -- Which projects this story belongs to

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),

  -- Constraints
  UNIQUE(story_id, site_id)
);

-- NEW: ACT Sites registry
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_key TEXT UNIQUE NOT NULL,  -- 'act-main', 'youth-stories', 'land-rights'
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,

  -- Design theme
  theme_config JSONB,  -- Theme customization

  -- API access
  api_key_hash TEXT,
  api_enabled BOOLEAN DEFAULT true,
  rate_limit INT DEFAULT 1000,  -- requests per hour

  -- Settings
  allow_story_requests BOOLEAN DEFAULT true,
  auto_approve_stories BOOLEAN DEFAULT false,  -- Require manual approval

  -- Status
  status 'active' | 'maintenance' | 'archived',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NEW: Story sharing API access log
CREATE TABLE story_api_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),
  site_id UUID REFERENCES sites(id),
  accessed_at TIMESTAMPTZ DEFAULT now(),
  api_key_hash TEXT,
  request_type 'read' | 'embed' | 'download',
  ip_address INET,
  user_agent TEXT
);

-- NEW: Storyteller consent management
CREATE TABLE storyteller_consent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Global sharing preferences
  allow_cross_site_sharing BOOLEAN DEFAULT false,
  allow_api_access BOOLEAN DEFAULT false,
  allow_downloads BOOLEAN DEFAULT false,

  -- Approved sites
  approved_sites UUID[],  -- Array of site IDs
  blocked_sites UUID[],

  -- Default consent duration
  default_consent_duration INTERVAL DEFAULT '1 year',

  -- Notification preferences
  notify_on_share BOOLEAN DEFAULT true,
  notify_on_api_access BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(storyteller_id)
);
```

### Project-Based Story Tagging

**Existing `project_stories` table gets enhanced:**

```sql
-- Add site visibility to project stories
ALTER TABLE project_stories
ADD COLUMN visible_on_sites UUID[],  -- Which sites show this story
ADD COLUMN featured_on_sites UUID[],  -- Featured placement on specific sites
ADD COLUMN tags TEXT[];  -- Project-specific tags

-- Example data:
-- story_id: abc-123
-- project_id: youth-voices-2024
-- visible_on_sites: [act-main, youth-stories]
-- featured_on_sites: [youth-stories]
-- tags: ['youth', 'climate-action', 'vancouver-island']
```

---

## 🔐 Story Sharing API

### 1. Authentication System

**Multi-tier API access:**

```typescript
// API Key types
type APIKeyType =
  | 'act-internal'     // Full access across ACT sites
  | 'project-site'     // Access to specific project stories
  | 'public-read'      // Public stories only
  | 'research'         // Research access with consent
  | 'embed'            // Embedded display only

// API Key structure
interface APIKey {
  key_hash: string
  site_id: string
  type: APIKeyType
  scopes: string[]  // ['stories:read', 'stories:embed', 'storytellers:read']
  rate_limit: number
  expires_at?: Date
}
```

**Usage:**

```bash
# Request story via API
curl -H "Authorization: Bearer ACT_API_KEY" \
     https://api.empathyledger.org/v1/stories/abc-123
```

### 2. Consent-Based Sharing Endpoints

**GET /v1/stories/:id**

```typescript
// GET /v1/stories/abc-123
// Returns story ONLY if:
// 1. Storyteller has granted cross-site consent
// 2. Requesting site is approved
// 3. Story is marked visible for that site
// 4. Consent has not expired

interface StoryAPIResponse {
  story: {
    id: string
    title: string
    storyteller: {
      id: string
      display_name: string
      avatar_url: string
      // Only public fields
    }
    content: {
      transcript: string
      summary: string
      // Sensitive content excluded
    }
    metadata: {
      themes: string[]
      tags: string[]
      project: string
      created_at: string
    }
    sharing: {
      consent_expires_at: string
      allowed_uses: string[]  // ['display', 'embed', 'research']
      attribution_required: boolean
    }
  }
  access: {
    site_id: string
    granted_at: string
    expires_at: string
  }
}
```

**POST /v1/consent/grant**

```typescript
// Storyteller grants consent for a story to appear on site
POST /v1/consent/grant
{
  story_id: "abc-123",
  site_id: "youth-stories",
  visibility: "public",
  duration_days: 365,
  allowed_uses: ["display", "embed"],
  featured: true
}

// Creates entry in story_site_visibility
```

**DELETE /v1/consent/revoke**

```typescript
// Storyteller revokes consent - story disappears from site
DELETE /v1/consent/revoke
{
  story_id: "abc-123",
  site_id: "youth-stories",
  reason: "storyteller_request"  // Optional
}

// Soft deletes visibility entry
// Story no longer accessible via API
// Site must refresh/remove cached content
```

### 3. Webhook System for Real-Time Updates

**Sites subscribe to story updates:**

```typescript
// Register webhook
POST /v1/webhooks/register
{
  site_id: "youth-stories",
  webhook_url: "https://youthstories.act.org/api/webhooks/story-updates",
  events: [
    "story.consent.granted",
    "story.consent.revoked",
    "story.updated",
    "story.deleted"
  ]
}

// Webhook payload example
{
  event: "story.consent.revoked",
  story_id: "abc-123",
  site_id: "youth-stories",
  timestamp: "2024-12-24T10:00:00Z",
  action_required: "remove_story"  // What site should do
}
```

**Site responds by:**
- Removing story from display
- Clearing caches
- Updating search indexes
- Notifying site admins

---

## 🌐 Multi-Site Integration Example

### Scenario: Youth Stories Project Site

**1. Site Setup**

```typescript
// youth-stories.act.org configuration
{
  site_id: "youth-stories-site",
  site_key: "youth-stories",
  theme: youthStoriesTheme,
  project_filter: "youth-voices-2024",
  api_key: "ACT_YOUTH_STORIES_KEY",

  // What stories to show
  story_sources: [
    {
      type: "project",
      project_id: "youth-voices-2024",
      auto_display: true
    },
    {
      type: "tag",
      tags: ["youth", "climate", "education"],
      requires_approval: true  // Manual curation
    }
  ]
}
```

**2. Story Display Page**

```typescript
// youth-stories.act.org/stories/[id]/page.tsx
import { EmpathyCard, QuoteCard, MetricDisplay } from '@act/empathy-ledger-design-system'
import { fetchStoryWithConsent } from '@/lib/api/empathy-ledger'

export default async function StoryPage({ params }) {
  // Fetch from Empathy Ledger API
  const { story, access } = await fetchStoryWithConsent({
    story_id: params.id,
    site_id: 'youth-stories',
    api_key: process.env.ACT_API_KEY
  })

  // If no access (consent revoked or expired)
  if (!access) {
    return <ConsentRevokedMessage />
  }

  // Render with Empathy Ledger components
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Same warm design across all ACT sites */}
      <EmpathyCard elevation="focused" variant="warmth">
        <h1 className="text-4xl font-editorial font-bold mb-4">
          {story.title}
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <Avatar src={story.storyteller.avatar_url} />
          <div>
            <p className="font-semibold">{story.storyteller.display_name}</p>
            <p className="text-sm text-muted-foreground">
              Shared with consent until {formatDate(access.expires_at)}
            </p>
          </div>
        </div>

        {/* Story content */}
        <div className="prose prose-lg">
          {story.content.transcript}
        </div>

        {/* Themes */}
        <div className="flex flex-wrap gap-2 mt-6">
          {story.metadata.themes.map(theme => (
            <EmpathyBadge key={theme} variant="cultural" theme={theme}>
              {theme}
            </EmpathyBadge>
          ))}
        </div>
      </EmpathyCard>

      {/* Featured quote */}
      {story.featured_quote && (
        <QuoteCard
          quote={story.featured_quote.text}
          author={story.storyteller.display_name}
          variant="featured"
        />
      )}

      {/* Attribution (required by consent) */}
      {story.sharing.attribution_required && (
        <EmpathyCard variant="heritage" elevation="flat">
          <p className="text-sm text-muted-foreground">
            This story is shared from the Empathy Ledger with the storyteller's consent.
            Part of the {story.metadata.project} project.
          </p>
        </EmpathyCard>
      )}
    </div>
  )
}
```

**3. Storyteller Dashboard**

```typescript
// Storytellers see where their stories appear
import { MetricGrid, StatusBadge } from '@act/empathy-ledger-design-system'

export function StorytellerConsentDashboard({ storyteller }) {
  const { stories, siteVisibility } = storyteller

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-editorial font-bold">
        Your Stories Across ACT Sites
      </h2>

      {/* Overview metrics */}
      <MetricGrid
        columns={3}
        metrics={[
          {
            label: "Stories Shared",
            value: stories.filter(s => s.shared_count > 0).length
          },
          {
            label: "Active Sites",
            value: siteVisibility.active_sites.length
          },
          {
            label: "Total Views",
            value: stories.reduce((acc, s) => acc + s.views, 0)
          }
        ]}
      />

      {/* Story-by-story consent management */}
      {stories.map(story => (
        <EmpathyCard key={story.id} elevation="lifted">
          <CardHeader title={story.title} />

          <CardContent>
            <h4 className="font-semibold mb-3">Visible on:</h4>

            {story.site_visibility.map(site => (
              <div key={site.site_id} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <StatusBadge status={site.consent_active ? "success" : "warning"}>
                    {site.site_name}
                  </StatusBadge>
                  {site.consent_expires_at && (
                    <span className="text-sm text-muted-foreground">
                      Expires {formatDate(site.consent_expires_at)}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeConsent(story.id, site.site_id)}
                >
                  Revoke Access
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => grantConsentToNewSite(story.id)}
              className="mt-4"
            >
              Share on Another Site
            </Button>
          </CardContent>
        </EmpathyCard>
      ))}
    </div>
  )
}
```

---

## 🧪 Testing Multi-Project Story Tagging

### Test Scenario Setup

**1. Create Multiple Projects**

```sql
-- Insert test projects
INSERT INTO projects (id, name, organization_id, project_type, status) VALUES
  ('proj-youth-2024', 'Youth Voices 2024', 'org-act', 'community_storytelling', 'active'),
  ('proj-land-rights', 'Land Rights Archive', 'org-act', 'cultural_preservation', 'active'),
  ('proj-elders-wisdom', 'Elders Wisdom Series', 'org-act', 'knowledge_transfer', 'active');

-- Insert test sites
INSERT INTO sites (id, site_key, site_name, site_url, status) VALUES
  ('site-act-main', 'act-main', 'A Curious Tractor', 'https://acurioustractor.org', 'active'),
  ('site-youth', 'youth-stories', 'Youth Voices', 'https://youth.acurioustractor.org', 'active'),
  ('site-land', 'land-rights', 'Land & Territory', 'https://land.acurioustractor.org', 'active');
```

**2. Create Test Storytellers**

```sql
-- Insert test storytellers
INSERT INTO profiles (id, email, display_name, profile_type) VALUES
  ('user-sarah', 'sarah@example.com', 'Elder Sarah', 'storyteller'),
  ('user-jordan', 'jordan@example.com', 'Jordan (Youth)', 'storyteller'),
  ('user-alex', 'alex@example.com', 'Alex (Land Defender)', 'storyteller');

-- Grant cross-site consent
INSERT INTO storyteller_consent_settings (storyteller_id, allow_cross_site_sharing, allow_api_access) VALUES
  ('user-sarah', true, true),
  ('user-jordan', true, true),
  ('user-alex', true, false);  -- Alex doesn't allow API
```

**3. Create Test Stories**

```sql
-- Story 1: Youth climate action (shows on youth site only)
INSERT INTO stories (id, title, storyteller_id, status) VALUES
  ('story-climate', 'My Climate Action Journey', 'user-jordan', 'published');

INSERT INTO project_stories (project_id, story_id, role) VALUES
  ('proj-youth-2024', 'story-climate', 'primary');

INSERT INTO story_site_visibility (story_id, site_id, storyteller_consent, visibility, project_tags) VALUES
  ('story-climate', 'site-youth', true, 'public', ARRAY['youth', 'climate', 'activism']);

-- Story 2: Land rights (shows on land site AND main site)
INSERT INTO stories (id, title, storyteller_id, status) VALUES
  ('story-land', 'The Land Remembers', 'user-alex', 'published');

INSERT INTO project_stories (project_id, story_id, role) VALUES
  ('proj-land-rights', 'story-land', 'primary');

INSERT INTO story_site_visibility (story_id, site_id, storyteller_consent, visibility, project_tags) VALUES
  ('story-land', 'site-land', true, 'public', ARRAY['land', 'territory', 'rights']),
  ('story-land', 'site-act-main', true, 'public', ARRAY['featured']);

-- Story 3: Elder wisdom (shows on ALL sites)
INSERT INTO stories (id, title, storyteller_id, status) VALUES
  ('story-wisdom', 'Winter Teaching', 'user-sarah', 'published');

INSERT INTO project_stories (project_id, story_id, role) VALUES
  ('proj-elders-wisdom', 'story-wisdom', 'primary'),
  ('proj-youth-2024', 'story-wisdom', 'related');  -- Also relevant to youth

INSERT INTO story_site_visibility (story_id, site_id, storyteller_consent, visibility, show_on_homepage, project_tags) VALUES
  ('story-wisdom', 'site-act-main', true, 'public', true, ARRAY['wisdom', 'elders', 'featured']),
  ('story-wisdom', 'site-youth', true, 'public', false, ARRAY['wisdom', 'intergenerational']),
  ('story-wisdom', 'site-land', true, 'public', false, ARRAY['wisdom', 'land']);
```

**4. Test Queries**

```sql
-- Get all stories for Youth site
SELECT
  s.id,
  s.title,
  p.display_name as storyteller,
  ssv.project_tags,
  ssv.visibility,
  ssv.consent_expires_at
FROM stories s
JOIN profiles p ON p.id = s.storyteller_id
JOIN story_site_visibility ssv ON ssv.story_id = s.id
WHERE ssv.site_id = 'site-youth'
  AND ssv.storyteller_consent = true
  AND ssv.visibility = 'public'
  AND (ssv.consent_expires_at IS NULL OR ssv.consent_expires_at > now());

-- Expected results:
-- 1. "My Climate Action Journey" (Jordan)
-- 2. "Winter Teaching" (Elder Sarah)

-- Get featured stories for main site homepage
SELECT s.*, ssv.project_tags
FROM stories s
JOIN story_site_visibility ssv ON ssv.story_id = s.id
WHERE ssv.site_id = 'site-act-main'
  AND ssv.show_on_homepage = true
  AND ssv.storyteller_consent = true;

-- Expected: "Winter Teaching"
```

---

## 🔄 Consent Revocation Flow

### What Happens When Storyteller Revokes Consent

**1. Storyteller Action**

```typescript
// Storyteller clicks "Revoke Access" on Youth site
async function revokeConsent(storyId: string, siteId: string) {
  const response = await fetch('/api/consent/revoke', {
    method: 'POST',
    body: JSON.stringify({
      story_id: storyId,
      site_id: siteId,
      reason: 'storyteller_request'
    })
  })

  // Immediate effect
  return response.json()
}
```

**2. Database Update**

```sql
-- Mark consent as revoked
UPDATE story_site_visibility
SET
  storyteller_consent = false,
  consent_revoked_at = now(),
  revocation_reason = 'storyteller_request'
WHERE story_id = 'story-climate'
  AND site_id = 'site-youth';
```

**3. Webhook Notification**

```typescript
// System sends webhook to Youth site
POST https://youth.acurioustractor.org/api/webhooks/story-updates
{
  event: "story.consent.revoked",
  story_id: "story-climate",
  site_id: "site-youth",
  timestamp: "2024-12-24T10:00:00Z",
  action_required: "remove_story",
  grace_period_hours: 24  // Optional: time to comply
}
```

**4. Site Response**

```typescript
// Youth site webhook handler
export async function POST(request: Request) {
  const event = await request.json()

  if (event.event === 'story.consent.revoked') {
    // Remove story from public display
    await db.stories.update({
      where: { id: event.story_id },
      data: {
        status: 'consent_revoked',
        hidden_at: new Date()
      }
    })

    // Clear caches
    await revalidatePath(`/stories/${event.story_id}`)
    await purgeCache(`story:${event.story_id}`)

    // Remove from search index
    await searchIndex.remove(event.story_id)

    // Log for audit
    await auditLog.create({
      action: 'story_removed',
      reason: 'consent_revoked',
      story_id: event.story_id
    })

    return Response.json({ status: 'removed' })
  }
}
```

**5. User Experience**

```typescript
// Story page now shows consent revoked message
export default function StoryPage({ params }) {
  const story = await fetchStory(params.id)

  if (story.status === 'consent_revoked') {
    return (
      <EmpathyCard elevation="lifted" variant="heritage">
        <CardHeader
          title="Story No Longer Available"
          icon={<Info />}
        />
        <CardContent>
          <p className="leading-relaxed">
            The storyteller has chosen to remove this story from this site.
            We respect their right to control how and where their story is shared.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            Removed on: {formatDate(story.hidden_at)}
          </p>
        </CardContent>
      </EmpathyCard>
    )
  }

  // Normal story display
  return <StoryDisplay story={story} />
}
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)

- [ ] **Database Schema**
  - [ ] Create `sites` table
  - [ ] Create `story_site_visibility` table
  - [ ] Create `story_api_access_log` table
  - [ ] Create `storyteller_consent_settings` table
  - [ ] Add RLS policies for all new tables
  - [ ] Create helper functions for consent checks

- [ ] **Design System Package**
  - [ ] Extract Empathy Ledger components to separate repo
  - [ ] Publish to npm (or setup git submodule)
  - [ ] Create theme variants for each site
  - [ ] Document theme customization

- [ ] **API Foundation**
  - [ ] Setup API routes in `/api/v1/`
  - [ ] Implement authentication middleware
  - [ ] Create rate limiting
  - [ ] Build consent checking functions

### Phase 2: Story Sharing API (Weeks 3-4)

- [ ] **Core Endpoints**
  - [ ] `GET /v1/stories/:id` - Fetch story with consent check
  - [ ] `GET /v1/stories` - List stories for site
  - [ ] `POST /v1/consent/grant` - Grant sharing consent
  - [ ] `DELETE /v1/consent/revoke` - Revoke consent
  - [ ] `GET /v1/storytellers/:id` - Storyteller public profile

- [ ] **Webhook System**
  - [ ] Webhook registration endpoint
  - [ ] Event queue system
  - [ ] Retry logic for failed webhooks
  - [ ] Webhook security (HMAC signatures)

### Phase 3: Multi-Site Testing (Weeks 5-6)

- [ ] **Test Data**
  - [ ] Create test projects
  - [ ] Create test storytellers with various consent settings
  - [ ] Create test stories with different visibility patterns
  - [ ] Setup test sites

- [ ] **Integration Testing**
  - [ ] Test story appears on correct sites
  - [ ] Test consent revocation flow
  - [ ] Test API access with different key types
  - [ ] Test webhook delivery
  - [ ] Test accessibility across all sites

### Phase 4: Storyteller Dashboard (Weeks 7-8)

- [ ] **Consent Management UI**
  - [ ] View where stories are shared
  - [ ] Grant consent to new sites
  - [ ] Revoke consent from existing sites
  - [ ] Set consent expiration
  - [ ] View access logs

- [ ] **Analytics**
  - [ ] Views per site
  - [ ] Access patterns
  - [ ] Engagement metrics per site
  - [ ] Export consent history

---

This is a comprehensive foundation for the ACT ecosystem! Want me to start building specific parts, like the API routes or the storyteller consent dashboard?