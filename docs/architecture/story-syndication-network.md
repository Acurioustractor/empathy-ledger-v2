# Story Syndication Network Architecture

## Vision: Storyteller-Centric Value Attribution

Empathy Ledger is the **source of truth** for stories. External platforms (JusticeHub, act.place, etc.) display stories, but all value—views, engagement, impact—flows back to storytellers.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMPATHY LEDGER (Source of Truth)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Stories   │  │ Storyteller │  │    Impact Dashboard         │  │
│  │   Catalog   │  │  Profiles   │  │  (Views, Reach, Engagement) │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────────┬──────────────┘  │
│         │                │                        ▲                  │
│         └────────────────┼────────────────────────┼──────────────────│
│                          │                        │                  │
└──────────────────────────┼────────────────────────┼──────────────────┘
                           │ Syndication            │ Engagement Data
                           ▼                        │
        ┌──────────────────┴──────────────────┐    │
        │         SYNDICATION LAYER           │    │
        │  • oEmbed API                       │    │
        │  • External Stories API             │    │
        │  • Embeddable Widgets               │    │
        │  • CMS Push (Webflow, etc.)         │    │
        │  • Engagement Tracking Pixel        │────┘
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │JusticeHub│      │act.place │      │ Future   │
  │  (API)   │      │(Webflow) │      │ Partners │
  └──────────┘      └──────────┘      └──────────┘
```

---

## The Simplest Possible Architecture

### Three Integration Methods

| Method | Platform Type | Complexity | Real-time | Best For |
|--------|---------------|------------|-----------|----------|
| **1. Embed Widget** | Any website | ⭐ Easy | Yes | Quick integration |
| **2. API Fetch** | Custom apps | ⭐⭐ Medium | Yes | Full control |
| **3. CMS Sync** | Webflow, etc. | ⭐⭐⭐ Complex | No (scheduled) | Static sites |

### Method 1: Embed Widget (Simplest)

External platform just adds an iframe or script:

```html
<!-- Option A: Single Story Embed -->
<iframe
  src="https://empathyledger.com/embed/story/abc123?theme=light"
  width="100%"
  height="400"
></iframe>

<!-- Option B: Story Grid/Catalog -->
<div
  data-empathy-catalog="true"
  data-app-id="justicehub"
  data-filter="consent.granted"
  data-layout="grid"
  data-columns="3"
></div>
<script src="https://empathyledger.com/embed/catalog.js"></script>
```

**Benefits:**
- Zero backend work for partner
- Always up-to-date
- Consent revocation = instant removal
- Built-in engagement tracking

### Method 2: API Fetch (JusticeHub)

JusticeHub fetches stories via API, renders their own UI:

```javascript
// JusticeHub Backend
const response = await fetch('https://empathyledger.com/api/external/stories', {
  headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
});
const { stories } = await response.json();

// Render stories with attribution
stories.forEach(story => {
  render(<StoryCard
    {...story}
    attribution={story.attribution}  // Required
    trackingPixel={story.tracking_pixel_url}  // For engagement
  />);
});
```

**Required Attribution:**
```html
<footer class="story-attribution">
  <a href="https://empathyledger.com/stories/abc123">
    View on Empathy Ledger
  </a>
  <span>Story by {storyteller_name}</span>
  <img src="https://empathyledger.com/badge/story/abc123" />
</footer>
```

### Method 3: Webflow Cloud App (RECOMMENDED for act.place)

**NEW in 2025**: [Webflow Cloud](https://webflow.com/feature/cloud) can host full-stack Next.js apps directly. This is ideal for maintaining brand consistency while getting real-time data.

```
┌────────────────────────────────────────────────────────────────────┐
│                        WEBFLOW CLOUD                                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │            act.place Next.js App                            │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │    │
│  │  │ Story Grid   │    │ Story Detail │    │ Search/Filter│ │    │
│  │  │  Component   │    │    Page      │    │   Component  │ │    │
│  │  └──────┬───────┘    └──────┬───────┘    └──────────────┘ │    │
│  │         │                   │                              │    │
│  │         └───────────────────┼──────────────────────────────┘    │
│  │                             │ API calls                         │
│  └─────────────────────────────┼───────────────────────────────────┘
│                                │                                    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    EMPATHY LEDGER      │
                    │  /api/external/stories │
                    │  (JWT authenticated)   │
                    └────────────────────────┘
```

**Why Webflow Cloud is Better:**
- ✅ Real-time data (no sync lag)
- ✅ Same Next.js codebase as Empathy Ledger
- ✅ Share components via DevLink
- ✅ Consent revocation is instant
- ✅ Built-in CDN & 99.99% uptime
- ✅ Maintains act.place brand/design system

**Deployment:**
```bash
# Deploy act.place app to Webflow Cloud
npx webflow-cli deploy --site act-place
```

### Method 4: CMS Sync (Legacy Option)

For simpler setups or sites not on Webflow Cloud, scheduled sync pushes stories to Webflow CMS:

```
┌────────────────┐         ┌────────────────┐         ┌────────────────┐
│ Empathy Ledger │  sync   │   Make.com /   │  push   │    Webflow     │
│    Stories     │ ──────► │    Zapier      │ ──────► │   CMS Items    │
└────────────────┘         └────────────────┘         └────────────────┘
      │                                                      │
      │                    ┌────────────────┐               │
      │   engagement data  │   Tracking     │  pixel load  │
      └◄───────────────────│    Service     │◄─────────────┘
                           └────────────────┘
```

---

## Value Attribution System

### What Gets Tracked

| Metric | Description | How Captured |
|--------|-------------|--------------|
| **Views** | Story impressions | Tracking pixel/beacon |
| **Read Time** | Engagement depth | Intersection observer |
| **Shares** | Social amplification | Share button clicks |
| **Actions** | Donations, sign-ups | Conversion tracking |
| **Reach** | Geographic spread | IP geolocation |
| **Platform** | Where viewed | Referrer tracking |

### Tracking Pixel/Beacon

Every syndicated story includes a tiny tracking beacon:

```html
<!-- Invisible 1x1 pixel -->
<img
  src="https://empathyledger.com/beacon/story/abc123?platform=justicehub&action=view"
  width="1"
  height="1"
  style="opacity:0;position:absolute"
/>

<!-- Or JavaScript beacon for richer data -->
<script>
  window.EmpathyLedger?.track('view', {
    storyId: 'abc123',
    platform: 'justicehub',
    readTime: 45, // seconds
    scrollDepth: 80 // percent
  });
</script>
```

### Storyteller Impact Dashboard

Every storyteller sees their story's reach:

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Your Story Impact                           Last 30 Days ▼     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   1,247  │  │    23    │  │   5:32   │  │    4     │           │
│  │  Views   │  │  Shares  │  │ Avg Read │  │Platforms │           │
│  │  +18%    │  │  +4      │  │   Time   │  │          │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                     │
│  📍 Where Your Story Was Seen                                       │
│  ├── JusticeHub: 847 views, 15 shares                              │
│  ├── act.place: 312 views, 6 shares                                │
│  └── Direct (Empathy Ledger): 88 views, 2 shares                   │
│                                                                     │
│  🌍 Geographic Reach                                                │
│  [World map with dots showing view locations]                       │
│  Top regions: Sydney (423), Melbourne (298), Brisbane (156)        │
│                                                                     │
│  📈 Engagement Over Time                                            │
│  [Line chart showing views/shares over 30 days]                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## JusticeHub Integration (API)

### Setup

1. **Register as External App** → Get `app_id` and `client_secret`
2. **Generate JWT** → Use for all API calls
3. **Register Webhook** → Receive consent change notifications
4. **Fetch Stories** → Display with attribution

### API Flow

```javascript
// 1. Get stories they have consent for
GET /api/external/stories
Authorization: Bearer <jwt>

// Response includes everything needed
{
  "stories": [{
    "id": "abc123",
    "title": "My Journey",
    "content": "Full story text...",
    "featured_image": "https://...",
    "storyteller": {
      "display_name": "Sarah",
      "avatar": "https://..."
    },
    // REQUIRED - must display
    "attribution": {
      "text": "Story by Sarah | Empathy Ledger",
      "link": "https://empathyledger.com/stories/abc123",
      "badge_url": "https://empathyledger.com/badge/story/abc123"
    },
    // For tracking
    "tracking_pixel_url": "https://empathyledger.com/beacon/abc123?app=justicehub"
  }]
}
```

### Webhook for Instant Revocation

```javascript
// JusticeHub receives this when consent revoked
POST https://justicehub.org/webhooks/empathy-ledger
X-Empathy-Signature: sha256=abc123...

{
  "event": "consent.revoked",
  "story_id": "abc123",
  "reason": "Storyteller withdrew consent",
  "action_required": "remove_immediately"
}

// JusticeHub MUST:
// 1. Remove story from display
// 2. Delete any cached content
// 3. Respond with 200 OK
```

---

## act.place Integration (Webflow)

### Architecture

Since Webflow can't do real-time API calls, we use scheduled sync:

```
Every 15 minutes (or on-demand):

1. Empathy Ledger identifies stories with consent for act.place
2. Transforms to Webflow CMS format
3. Pushes to Webflow CMS API
4. Updates existing, adds new, removes revoked
```

### Webflow CMS Collection Structure

```
Collection: Stories
├── name (text) - Story title
├── slug (text) - URL slug
├── storyteller-name (text)
├── storyteller-photo (image)
├── summary (rich text)
├── full-content (rich text) - Only if full consent
├── featured-image (image)
├── themes (multi-reference) → Themes collection
├── empathy-ledger-id (text) - For sync tracking
├── empathy-ledger-url (link) - Canonical link
├── tracking-pixel (embed) - For engagement
├── published-date (date)
```

### Sync Script (Make.com/n8n)

```javascript
// Pseudo-code for sync workflow

// 1. Fetch stories with act.place consent
const stories = await fetch('https://empathyledger.com/api/external/stories', {
  headers: { 'Authorization': `Bearer ${ACT_PLACE_JWT}` }
}).then(r => r.json());

// 2. Get current Webflow items
const webflowItems = await webflow.getCollectionItems('stories');

// 3. Sync logic
for (const story of stories) {
  const existing = webflowItems.find(w => w.fields['empathy-ledger-id'] === story.id);

  if (existing) {
    // Update
    await webflow.updateItem(existing._id, mapToWebflow(story));
  } else {
    // Create
    await webflow.createItem(mapToWebflow(story));
  }
}

// 4. Remove revoked
for (const webflowItem of webflowItems) {
  if (!stories.find(s => s.id === webflowItem.fields['empathy-ledger-id'])) {
    await webflow.deleteItem(webflowItem._id);
  }
}

// 5. Publish changes
await webflow.publish();
```

### Tracking on Webflow

Each story on act.place includes:

```html
<!-- In Webflow CMS template -->
<div class="story-card">
  <img src="{featured-image}" alt="{name}">
  <h3>{name}</h3>
  <p>{summary}</p>
  <p class="attribution">
    Story by {storyteller-name} |
    <a href="{empathy-ledger-url}">View on Empathy Ledger</a>
  </p>

  <!-- Tracking pixel embed -->
  {tracking-pixel}
</div>
```

---

## Value Flow Back to Storytellers

### The Storyteller Dashboard Shows:

1. **Total Reach** - Views across all platforms
2. **Platform Breakdown** - Which platforms show their story
3. **Engagement Depth** - How long people engage
4. **Geographic Impact** - Where their story reaches
5. **Actions Taken** - Donations, sign-ups inspired
6. **Consent Status** - Where they've granted/revoked

### Revenue Attribution (Future)

If a platform monetizes stories (ads, subscriptions), revenue share:

```
┌─────────────────────────────────────────────────────────────────────┐
│  💰 Revenue Attribution (Coming Soon)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Your stories generated:                                            │
│  ├── Ad Revenue Share: $45.20 (from JusticeHub)                    │
│  ├── Subscription Share: $12.00 (from act.place premium)           │
│  └── Direct Donations: $230.00 (via story links)                   │
│                                                                     │
│  Total This Month: $287.20                                          │
│                                                                     │
│  [Withdraw to Bank] [Donate to Cause]                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Tracking & Attribution (Now)
- [x] External Stories API
- [x] Webhook system
- [ ] Tracking beacon/pixel
- [ ] Basic storyteller dashboard

### Phase 2: Embeddable Catalog
- [ ] Story grid widget
- [ ] Catalog embed script
- [ ] Theme customization

### Phase 3: Webflow Sync
- [ ] Make.com/n8n template
- [ ] act.place CMS setup
- [ ] Sync monitoring

### Phase 4: Revenue Attribution
- [ ] Revenue share contracts
- [ ] Payment processing
- [ ] Tax handling

---

## Simplicity Principles

1. **One canonical source** - Stories live on Empathy Ledger
2. **Passive attribution** - Tracking requires no partner effort
3. **Instant revocation** - Pull consent, story disappears
4. **Storyteller control** - Dashboard shows all platform activity
5. **Platform-agnostic** - Same API works everywhere

---

## Sources & Research

- [Creator Marketing Attribution Models](https://impact.com/affiliate/creator-attribution-marketing-models/)
- [Content Syndication Guide 2025](https://www.techmagnate.com/blog/content-syndication-guide/)
- [Webflow CMS API](https://developers.webflow.com/data/reference/cms)
- [Syncmate for Webflow](https://webflow.com/apps/detail/syncmate)
- [Impact Story Toolkit](https://www.sureimpact.com/post/impact-story)
- [Nonprofit Analytics Guide](https://fiftyandfifty.org/nonprofit-analytics-guide/)
- [Story Foundation Licensing](https://docs.story.foundation/concepts/licensing-module/overview)
