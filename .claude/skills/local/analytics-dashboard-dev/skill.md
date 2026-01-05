# Analytics Dashboard Dev Skill

**Purpose:** Guide implementation of analytics dashboards for storytellers, showing story performance, syndication usage, and cultural impact metrics.

**Auto-Invoke When User Says:**
- "Build analytics dashboard"
- "Show story performance"
- "Display usage metrics"
- "Create analytics view"
- "Storyteller insights"
- "Embed token analytics"

---

## 🎯 Analytics Dashboard Philosophy

**Core Principles:**
- **Storyteller-Owned Data:** Analytics belong to the storyteller, not the platform
- **Cultural Context:** Metrics celebrate impact, not extraction
- **Privacy-First:** No tracking without explicit consent
- **Transparency:** Show exactly what data is collected and why
- **Actionable:** Insights help storytellers amplify their narrative

---

## 📊 Analytics Categories

### 1. Story Performance
- **Views:** Total story views (internal + external)
- **Shares:** How many times shared
- **Reactions:** Engagement metrics (if enabled)
- **Time on Page:** Average reading time
- **Geographic Reach:** Where stories are being read (country/region level)

### 2. Syndication Metrics
- **Active Consents:** How many sites currently have access
- **Embed Token Usage:** Views per syndication partner
- **External Domains:** Which domains are accessing the story
- **Last Accessed:** When external sites last fetched content
- **Revocation History:** Audit trail of consent changes

### 3. Cultural Impact (Future)
- **Community Reach:** Stories within Indigenous networks
- **Elder Reviews:** Stories reviewed by Elders
- **Sacred Content Protection:** How many stories are protected
- **Language Preservation:** Stories in Indigenous languages

---

## 🎨 Dashboard Components

### Component 1: `StoryAnalyticsSummary.tsx`

**Purpose:** High-level overview card for a single story

**Props:**
```typescript
interface StoryAnalyticsSummaryProps {
  storyId: string
  showExternalMetrics?: boolean // Default: true if story is syndicated
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ Story Analytics                         │
├─────────────────────────────────────────┤
│ 📊 Total Views: 1,234                   │
│ 🔗 Active Consents: 2                   │
│ 🌍 External Views: 456                  │
│ 📅 Last Accessed: 2 hours ago           │
├─────────────────────────────────────────┤
│ View Details →                          │
└─────────────────────────────────────────┘
```

**Data Sources:**
- `embed_tokens` (usage_count, last_used_at)
- `embed_token_access_log` (detailed access logs)
- `syndication_consent` (active consents count)

---

### Component 2: `SyndicationUsageChart.tsx`

**Purpose:** Visualize embed token usage over time

**Props:**
```typescript
interface SyndicationUsageChartProps {
  storyId: string
  timeRange?: '7d' | '30d' | '90d' | 'all' // Default: 30d
}
```

**Chart Type:** Line chart showing views per day

**Data Query:**
```sql
SELECT
  DATE(accessed_at) as date,
  COUNT(*) as views,
  site_id
FROM embed_token_access_log
WHERE story_id = $1
  AND accessed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(accessed_at), site_id
ORDER BY date ASC
```

**Library:** Use [recharts](https://recharts.org/) (already in project)

**Example:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

// Data format: [{ date: '2026-01-01', justicehub: 45, actfarm: 23 }]
<LineChart data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="justicehub" stroke="#C85A54" name="JusticeHub" />
  <Line type="monotone" dataKey="actfarm" stroke="#6B8E72" name="ACT Farm" />
</LineChart>
```

---

### Component 3: `ExternalAccessTable.tsx`

**Purpose:** Show which external sites are accessing the story

**Props:**
```typescript
interface ExternalAccessTableProps {
  storyId: string
  limit?: number // Default: 10
}
```

**Table Columns:**
- Site Name (with logo)
- Domain
- Total Views
- Last Accessed
- Status (Active, Revoked, Expired)

**Data Query:**
```sql
SELECT
  s.name as site_name,
  s.slug,
  s.logo_url,
  COUNT(l.id) as total_views,
  MAX(l.accessed_at) as last_accessed,
  c.status as consent_status,
  t.status as token_status
FROM syndication_sites s
  INNER JOIN syndication_consent c ON s.id = c.site_id
  INNER JOIN embed_tokens t ON c.story_id = t.story_id
  LEFT JOIN embed_token_access_log l ON t.id = l.token_id
WHERE c.story_id = $1
GROUP BY s.id, c.status, t.status
ORDER BY last_accessed DESC
LIMIT $2
```

---

### Component 4: `ConsentHistoryTimeline.tsx`

**Purpose:** Audit trail of consent changes

**Props:**
```typescript
interface ConsentHistoryTimelineProps {
  storyId: string
}
```

**Timeline Events:**
- ✅ Consent created (date, site, cultural permission level)
- 🔄 Elder approved (date, elder name)
- 🚫 Consent revoked (date, reason)
- ⏱️ Token expired (date)

**Data Sources:**
- `syndication_consent` (created_at, status, revoked_at)
- `embed_token_access_log` (metadata field for audit events)

**Example:**
```
2026-01-05 15:30 ✅ Consent granted to JusticeHub (Public level)
2026-01-05 15:30 🔑 Embed token created (expires 2026-02-04)
2026-01-05 16:45 🚫 Consent revoked: "Storyteller requested removal"
```

---

### Component 5: `Storyteller AnalyticsDashboard.tsx`

**Purpose:** Main dashboard page showing all storyteller analytics

**Route:** `/storytellers/[id]/analytics`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Analytics Dashboard                                     │
├─────────────────────────────────────────────────────────┤
│ 📊 Overview                                             │
│ ┌─────────────┬─────────────┬─────────────┬───────────┐│
│ │Total Stories│Total Views  │Active Syndi.│ External  ││
│ │     12      │   1,234     │      3      │    456    ││
│ └─────────────┴─────────────┴─────────────┴───────────┘│
│                                                         │
│ 🔗 Syndication Usage (Last 30 Days)                    │
│ [Line Chart Component]                                  │
│                                                         │
│ 📖 Top Stories                                          │
│ [Table: Story | Views | Syndi. Sites | Last Accessed]  │
│                                                         │
│ 🌍 External Sites Accessing Your Stories               │
│ [ExternalAccessTable Component]                        │
└─────────────────────────────────────────────────────────┘
```

**Tabs:**
1. **Overview** - High-level metrics
2. **Syndication** - Detailed syndication analytics
3. **Performance** - Story views, engagement
4. **Cultural Impact** - Language, community reach (future)

---

## 🗄️ Database Views for Analytics

### View 1: `v_story_analytics`

**Purpose:** Pre-aggregated story metrics for fast dashboard loading

```sql
CREATE OR REPLACE VIEW v_story_analytics AS
SELECT
  s.id as story_id,
  s.title,
  s.storyteller_id,
  s.tenant_id,

  -- Consent metrics
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'approved') as active_consents,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'revoked') as revoked_consents,

  -- Token metrics
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'active') as active_tokens,
  SUM(t.usage_count) as total_external_views,
  MAX(t.last_used_at) as last_external_access,

  -- Access log metrics
  COUNT(DISTINCT l.id) as total_access_events,
  COUNT(DISTINCT l.site_id) as unique_sites_accessed

FROM stories s
  LEFT JOIN syndication_consent c ON s.id = c.story_id
  LEFT JOIN embed_tokens t ON s.id = t.story_id
  LEFT JOIN embed_token_access_log l ON t.id = l.token_id
GROUP BY s.id, s.title, s.storyteller_id, s.tenant_id;
```

**Usage in Component:**
```typescript
const { data: analytics } = await supabase
  .from('v_story_analytics')
  .select('*')
  .eq('story_id', storyId)
  .single()
```

---

### View 2: `v_storyteller_overview`

**Purpose:** Storyteller-level aggregate metrics

```sql
CREATE OR REPLACE VIEW v_storyteller_overview AS
SELECT
  p.id as storyteller_id,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'published') as published_stories,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'approved') as active_consents,
  SUM(t.usage_count) as total_external_views,
  MAX(t.last_used_at) as last_external_access
FROM profiles p
  LEFT JOIN stories s ON p.id = s.storyteller_id
  LEFT JOIN syndication_consent c ON s.id = c.story_id
  LEFT JOIN embed_tokens t ON s.id = t.story_id
GROUP BY p.id;
```

---

## 🔐 Privacy Controls

### Analytics Consent

**Table: `storyteller_analytics_consent`**
```sql
CREATE TABLE storyteller_analytics_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Granular consent
  allow_view_tracking BOOLEAN DEFAULT true,
  allow_geographic_tracking BOOLEAN DEFAULT false,
  allow_device_tracking BOOLEAN DEFAULT false,
  allow_external_metrics BOOLEAN DEFAULT true,

  -- Sharing
  share_with_organization BOOLEAN DEFAULT true,
  share_aggregate_only BOOLEAN DEFAULT true,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default:** Opt-IN for basic metrics, opt-OUT for detailed tracking

---

## 📊 API Endpoints

### GET `/api/analytics/story/[storyId]`

**Purpose:** Get analytics for a single story

**Response:**
```json
{
  "storyId": "1c8bdfb9-fcf1-458a-aed7-ffdc6b272ab6",
  "title": "Young person returns to school",
  "metrics": {
    "totalViews": 1234,
    "externalViews": 456,
    "activeConsents": 2,
    "activeSites": ["JusticeHub", "ACT Farm"],
    "lastAccessed": "2026-01-05T14:30:00Z"
  },
  "usage": [
    { "date": "2026-01-01", "views": 45, "site": "justicehub" },
    { "date": "2026-01-02", "views": 52, "site": "justicehub" }
  ]
}
```

### GET `/api/analytics/storyteller`

**Purpose:** Get storyteller-level analytics (current user)

**Response:**
```json
{
  "storytellerId": "494b6ec3-f944-46cc-91f4-216028b8389c",
  "overview": {
    "totalStories": 12,
    "publishedStories": 8,
    "activeConsents": 3,
    "totalExternalViews": 1234,
    "lastExternalAccess": "2026-01-05T14:30:00Z"
  },
  "topStories": [
    {
      "storyId": "...",
      "title": "...",
      "views": 456,
      "sites": 2
    }
  ]
}
```

---

## 🎨 Cultural Design Patterns

### Color Coding for Metrics

- **Clay (#D97757)** - Indigenous/cultural metrics (community reach, language)
- **Sage (#6B8E72)** - Growth metrics (views, shares)
- **Sky (#4A90A4)** - Transparency metrics (access logs, consent history)
- **Ember (#C85A54)** - Important alerts (revocations, expired tokens)

### Trauma-Informed Analytics

**DON'T:**
- ❌ Use competitive language ("Beat your record!")
- ❌ Pressure metrics ("Only 2 views this week...")
- ❌ Gamify story sharing

**DO:**
- ✅ Celebrate impact ("Your story reached 5 communities")
- ✅ Affirm sovereignty ("You're in control of where your story appears")
- ✅ Show gratitude ("Thank you for sharing your narrative")

---

## 🧪 Testing Analytics

### 1. Seed Test Data

```sql
-- Create test access logs
INSERT INTO embed_token_access_log (story_id, site_id, status, accessed_at, metadata)
SELECT
  '1c8bdfb9-fcf1-458a-aed7-ffdc6b272ab6',
  'f5f0ed14-b3d0-4fe2-b6db-aaa4701c94ab',
  'success',
  NOW() - (random() * 30 || ' days')::interval,
  '{"views": 1}'::jsonb
FROM generate_series(1, 100); -- 100 test views over 30 days
```

### 2. Verify Aggregations

```sql
-- Check view counts match
SELECT
  story_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT DATE(accessed_at)) as unique_days
FROM embed_token_access_log
WHERE story_id = '1c8bdfb9-fcf1-458a-aed7-ffdc6b272ab6'
GROUP BY story_id;
```

### 3. Performance Test

```sql
-- Ensure analytics view performs well
EXPLAIN ANALYZE
SELECT * FROM v_story_analytics WHERE story_id = '...';

-- Should complete in < 100ms
```

---

## 📋 Implementation Checklist

### Phase 1: Database (1 hour)
- [ ] Create `v_story_analytics` view
- [ ] Create `v_storyteller_overview` view
- [ ] Add indexes for analytics queries
- [ ] Seed test data for 30 days
- [ ] Performance test views

### Phase 2: API (1 hour)
- [ ] Create `/api/analytics/story/[storyId]` endpoint
- [ ] Create `/api/analytics/storyteller` endpoint
- [ ] Add RLS policies (storytellers only see their own)
- [ ] Test with real tokens and consents

### Phase 3: Components (2-3 hours)
- [ ] Create `StoryAnalyticsSummary.tsx`
- [ ] Create `SyndicationUsageChart.tsx`
- [ ] Create `ExternalAccessTable.tsx`
- [ ] Create `ConsentHistoryTimeline.tsx`
- [ ] Create main `StorytellerAnalyticsDashboard.tsx` page

### Phase 4: Integration (1 hour)
- [ ] Add analytics tab to storyteller dashboard
- [ ] Link from story cards to analytics detail
- [ ] Add "View Analytics" button to story management
- [ ] Cultural review (invoke `cultural-review` skill)

---

## 🔗 Related Documentation

- [docs/10-analytics/](../../../docs/10-analytics/) - Analytics system architecture
- [SYNDICATION_CONSENT_COMPLETE.md](../../../SYNDICATION_CONSENT_COMPLETE.md) - Embed token system

---

## �� Success Criteria

**After implementation:**
- ✅ Storytellers can see story view counts
- ✅ Syndication usage displayed per site
- ✅ Consent history visible as timeline
- ✅ Analytics load in < 500ms
- ✅ Cultural design patterns followed
- ✅ No competitive or extractive language
- ✅ Privacy controls respected

---

**Remember:** Analytics serve storytellers, not platforms. Every metric should empower, not surveil.

🌾 **"Numbers without narrative are just noise. Context turns data into dignity."**
