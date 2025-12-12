# Story Syndication Ecosystem

## The Core Vision

Empathy Ledger is the **storyteller's home base** - where they create, control, and monitor their stories. External platforms (JusticeHub, news sites, social media) are **distribution channels** that the storyteller chooses to share with.

```
                    STORYTELLER'S CONTROL CENTER
                    ┌─────────────────────────────┐
                    │      EMPATHY LEDGER         │
                    │                             │
                    │  Create → Review → Publish  │
                    │         ↓                   │
                    │    Consent Dashboard        │
                    │    "Where is my story?"     │
                    └──────────────┬──────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
    │  JusticeHub  │       │   News Site  │       │  Social Feed │
    │  (API Pull)  │       │  (Embed/oEmb)│       │   (Widget)   │
    └──────────────┘       └──────────────┘       └──────────────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                                   ▼
                         ACCESS LOG & ANALYTICS
                         "Story viewed 47 times on JusticeHub"
```

---

## How Stories Flow: The Complete Process

### Step 1: Story Creation (Empathy Ledger)

Storyteller creates their story in Empathy Ledger with full support:
- Guided prompts for reflection
- Cultural safety protocols (elder review if needed)
- Media attachments (photos, audio)
- Transcript uploads from interviews
- AI-assisted theme extraction

### Step 2: Visibility & Consent Settings

Storyteller sets their preferences:

```
┌─────────────────────────────────────────────────────────────┐
│  MY STORY: "Finding Home After Removal"                     │
├─────────────────────────────────────────────────────────────┤
│  BASE VISIBILITY                                            │
│  ○ Private (only me)                                        │
│  ○ Community (organization members)                         │
│  ● Public (anyone with link)                                │
├─────────────────────────────────────────────────────────────┤
│  SYNDICATION CONSENT                                        │
│                                                             │
│  ┌─────────────────────────────────────────┐               │
│  │ ✅ JusticeHub                            │               │
│  │    Share: Full content, Media, My name  │               │
│  │    Purpose: Legal advocacy              │               │
│  │    Expires: Never                       │               │
│  │    [Edit] [Revoke]                      │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────┐               │
│  │ ⏳ ABC News (Request Pending)           │               │
│  │    Wants: Summary only                  │               │
│  │    Purpose: Documentary                 │               │
│  │    [Review Request]                     │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────┐               │
│  │ ➕ Add New Platform                      │               │
│  │    Browse registered apps...            │               │
│  └─────────────────────────────────────────┘               │
├─────────────────────────────────────────────────────────────┤
│  WHERE MY STORY APPEARS                                     │
│                                                             │
│  📍 JusticeHub - Viewed 47 times (last: 2 hours ago)       │
│  📍 My organization's website - Embedded                    │
│  📍 Direct link shares: 12                                  │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Platform Integration (Multiple Methods)

---

## Distribution Methods

### Method 1: REST API (For Apps Like JusticeHub)

Best for: **Integrated platforms** that want to display stories within their own UI.

```typescript
// JusticeHub fetches stories they have consent for
const client = new EmpathyLedgerClient(apiKey)
const stories = await client.getStories({ type: 'testimony' })

// Display in JusticeHub's interface
stories.forEach(story => {
  renderInJusticeHubUI(story)
})
```

**Pros:**
- Full control over presentation
- Can add platform-specific context
- Works offline after fetch

**Cons:**
- Story updates require re-fetch
- Platform owns the display

---

### Method 2: Embeddable Widgets (For Websites)

Best for: **Organization websites** that want to show stories with Empathy Ledger branding.

```html
<!-- Embed a single story -->
<iframe
  src="https://empathyledger.com/embed/story/abc123"
  width="100%"
  height="400"
  data-theme="light"
></iframe>

<!-- Embed a story gallery -->
<iframe
  src="https://empathyledger.com/embed/gallery?org=snow-foundation&limit=5"
  width="100%"
  height="600"
></iframe>

<!-- Embed storyteller profile -->
<iframe
  src="https://empathyledger.com/embed/storyteller/xyz789"
  width="100%"
  height="500"
></iframe>
```

**Features:**
- Responsive design
- Theme customization (light/dark/custom colors)
- Automatic updates when story changes
- Built-in accessibility
- Cultural safety indicators shown

**Pros:**
- Always up-to-date
- Zero maintenance
- Consistent experience
- Storyteller can revoke and it disappears

---

### Method 3: oEmbed Protocol (For Social/CMS)

Best for: **Social media, WordPress, Medium** - automatic rich previews.

```
GET https://empathyledger.com/oembed?url=https://empathyledger.com/stories/abc123

Response:
{
  "type": "rich",
  "title": "Finding Home After Removal",
  "author_name": "Sarah Williams",
  "provider_name": "Empathy Ledger",
  "html": "<iframe src='...'></iframe>",
  "thumbnail_url": "https://empathyledger.com/stories/abc123/thumbnail"
}
```

**Implementation:**
```html
<!-- WordPress auto-expands this -->
https://empathyledger.com/stories/abc123

<!-- Medium auto-embeds -->
Just paste the URL and it becomes a card
```

---

### Method 4: Web Components (For Developers)

Best for: **Custom integrations** that need flexibility without iframes.

```html
<script src="https://empathyledger.com/components.js"></script>

<!-- Single story card -->
<empathy-story id="abc123" theme="earth"></empathy-story>

<!-- Story feed -->
<empathy-feed
  org="snow-foundation"
  limit="10"
  layout="grid"
></empathy-feed>

<!-- Storyteller badge (shows on their other sites) -->
<empathy-badge storyteller="xyz789"></empathy-badge>
```

**Pros:**
- No iframe isolation issues
- Full styling control with CSS variables
- Can interact with host page
- Lightweight

---

### Method 5: RSS/Atom Feeds (For News Aggregators)

Best for: **News organizations, podcast apps, feed readers.**

```xml
GET https://empathyledger.com/feed/org/snow-foundation.rss

<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Snow Foundation Stories</title>
    <link>https://empathyledger.com/organisations/snow-foundation</link>
    <item>
      <title>Finding Home After Removal</title>
      <description>A powerful testimony about...</description>
      <pubDate>Mon, 09 Dec 2024 10:00:00 GMT</pubDate>
      <link>https://empathyledger.com/stories/abc123</link>
      <enclosure url="https://..." type="audio/mpeg" />
    </item>
  </channel>
</rss>
```

---

### Method 6: Webhooks (For Real-Time Updates)

Best for: **Platforms that need instant notifications.**

```
POST https://justicehub.com/webhooks/empathy-ledger
{
  "event": "story.published",
  "story_id": "abc123",
  "storyteller_id": "xyz789",
  "app_consent": {
    "share_full_content": true,
    "share_media": true
  }
}

Events:
- story.published
- story.updated
- story.unpublished
- consent.granted
- consent.revoked
```

---

## Innovative Approaches

### 1. Decentralized Verification (Like Blue Check for Stories)

```
┌──────────────────────────────────────────────────────────┐
│  ✓ Verified by Empathy Ledger                            │
│                                                          │
│  This story was:                                         │
│  ✓ Created by a verified storyteller                     │
│  ✓ Reviewed for cultural safety                          │
│  ✓ Consent verified on Dec 9, 2024                       │
│  ✓ Original source: empathyledger.com/stories/abc123     │
│                                                          │
│  [Verify on Blockchain] [View Consent Record]            │
└──────────────────────────────────────────────────────────┘
```

Each story gets a cryptographic signature. Any platform displaying the story can verify:
- The story hasn't been modified
- The consent is still valid
- The storyteller is real

**Novel approach:** Use content-addressable hashing (like IPFS) so even if Empathy Ledger goes down, the verification still works.

---

### 2. Consent-Aware CDN

Stories are served through a CDN that checks consent in real-time:

```
https://cdn.empathyledger.com/stories/abc123/content
```

If consent is revoked:
- API returns 403 with explanation
- Embeds show "This story has been withdrawn"
- Cached versions expire immediately
- Platforms receive webhook notification

**This ensures storytellers can truly "unpublish" even from external sites.**

---

### 3. Story "Passports" (Portable Consent)

Storyteller gets a QR code / short URL they can share anywhere:

```
empathy.link/s/abc123

When scanned/visited:
1. Shows story summary
2. Lists current distribution (JusticeHub, 2 news sites)
3. Offers "Request Access" for new platforms
4. Storyteller gets notified
```

This puts the storyteller in control of discovery.

---

### 4. Journalist Portal

Special interface for journalists:

```
┌──────────────────────────────────────────────────────────┐
│  EMPATHY LEDGER - MEDIA ACCESS                           │
├──────────────────────────────────────────────────────────┤
│  You're logged in as: ABC News                           │
│                                                          │
│  BROWSE AVAILABLE STORIES                                │
│  [Themes ▾] [Region ▾] [Date ▾]                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ "Finding Home After Removal"                       │ │
│  │ By Sarah Williams • Snow Foundation                │ │
│  │ Themes: Stolen Generations, Reconnection           │ │
│  │ Available: Summary only                            │ │
│  │ [Request Full Access] [Contact Storyteller]        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  REQUEST QUEUE                                           │
│  ⏳ 3 requests pending storyteller approval              │
│  ✓ 2 requests approved this week                         │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Verified journalist accounts
- Request-based access (not automatic)
- Storyteller can see journalist's track record
- Usage reporting requirements

---

### 5. Storyteller-to-Storyteller Network

Storytellers can discover and connect:

```
"Your story 'Finding Home' resonates with 3 other stories
in the network. Would you like to connect with these storytellers?"

- Similar themes in different regions
- Cross-referencing for researchers
- Collective impact measurement
```

---

### 6. Story "Licensing" for Commercial Use

For documentaries, books, exhibitions:

```
┌──────────────────────────────────────────────────────────┐
│  COMMERCIAL LICENSE REQUEST                              │
├──────────────────────────────────────────────────────────┤
│  Requester: National Geographic Documentary              │
│  Project: "Voices of Resilience"                         │
│  Usage: Documentary film, streaming platforms            │
│  Territory: Worldwide                                    │
│  Duration: 5 years                                       │
│  Compensation: $500 licensing fee to storyteller         │
│                                                          │
│  [Accept] [Negotiate] [Decline]                          │
└──────────────────────────────────────────────────────────┘
```

**Revenue sharing model:**
- Empathy Ledger takes small platform fee
- Majority goes to storyteller
- Optional donation to community organization

---

## How Existing Platforms Do This (Research)

### The Markup - Document Cloud

News organization that shares source documents with verification:
- Documents can be embedded anywhere
- Original stays on their servers
- Annotations are preserved

### Spotify - Podcast Distribution

Podcasters upload once, distribute everywhere:
- Single RSS feed serves all platforms
- Analytics come back to creator dashboard
- Can see listens per platform

### Medium - Embeddable Stories

Writers can embed Medium stories anywhere:
- oEmbed support
- Stays updated
- Traffic attribution

### YouTube - Video Syndication

- Embed anywhere with iframe
- Creator controls monetization
- Can block specific domains
- Analytics per embed location

### Adobe Stock / Getty - Licensed Media

- Watermarked previews
- Licensed versions delivered after payment
- Usage tracking via steganography

---

## Recommended Implementation Priority

### Phase 1: Foundation (Done)
- [x] REST API for apps
- [x] Consent management
- [x] Access logging

### Phase 2: Easy Embedding
- [ ] Embeddable story widget (`/embed/story/[id]`)
- [ ] oEmbed endpoint
- [ ] Theme customization

### Phase 3: Real-Time
- [ ] Webhook notifications
- [ ] Consent-aware CDN
- [ ] Instant revocation

### Phase 4: Discovery
- [ ] Journalist portal
- [ ] Story passports
- [ ] RSS feeds

### Phase 5: Innovation
- [ ] Web components
- [ ] Commercial licensing
- [ ] Verification badges
- [ ] Storyteller network

---

## Database Schema Additions Needed

```sql
-- Track where stories are embedded
CREATE TABLE story_embeds (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  embed_domain TEXT NOT NULL,        -- 'justicehub.org'
  embed_url TEXT,                    -- Full page URL
  embed_type TEXT,                   -- 'iframe', 'oembed', 'api'
  first_seen_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,  -- Storyteller can block domains
  UNIQUE(story_id, embed_domain)
);

-- Journalist/media verification
CREATE TABLE media_organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  verification_status TEXT,          -- 'verified', 'pending', 'rejected'
  track_record JSONB,                -- Previous story usage
  created_at TIMESTAMPTZ
);

-- Commercial licensing requests
CREATE TABLE license_requests (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  requester_org_id UUID REFERENCES media_organizations(id),
  project_name TEXT,
  usage_description TEXT,
  territory TEXT,
  duration_months INT,
  compensation_amount DECIMAL,
  status TEXT,                       -- 'pending', 'approved', 'declined', 'negotiating'
  created_at TIMESTAMPTZ
);
```

---

## The Storyteller Promise

> "Your story lives in Empathy Ledger. You decide who sees it, where it appears, and for how long. Revoke access anytime, and it disappears everywhere. You'll always know exactly where your story has been shared and how many people it's reached."

This is the core value proposition that makes Empathy Ledger different from just "submit your story to a platform." It's **ownership** and **visibility** and **control**.
