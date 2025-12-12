# Platform Integration Guide

Choose the best integration method for your platform.

## Quick Decision Matrix

| Your Platform | Best Method | Why |
|---------------|-------------|-----|
| **Webflow (Cloud)** | Webflow Cloud App | Real-time, same tech, share components |
| **Webflow (Standard)** | Embed Widget | Simplest, always current |
| **Custom App (React/Next)** | API Integration | Full control, custom UI |
| **WordPress** | oEmbed + Widget | Auto-embedding, widgets |
| **Static Site** | Embed Widget | No backend needed |
| **Mobile App** | API Integration | Native experience |

---

## Method 1: Webflow Cloud App

**Best for:** act.place, any Webflow site wanting full control

### What You Get
- Full Next.js app hosted on Webflow Cloud
- Real-time data from Empathy Ledger API
- Custom UI matching your brand
- Share components via Webflow DevLink
- Built-in CDN, 99.99% uptime

### Setup Steps

1. **Get Credentials**
   - Register at Empathy Ledger → External Apps
   - Receive `app_id` and `client_secret`

2. **Clone Template**
   ```bash
   git clone https://github.com/empathyledger/webflow-cloud-template
   cd webflow-cloud-template
   npm install
   ```

3. **Configure**
   ```env
   EMPATHY_LEDGER_APP_ID=your-app-id
   EMPATHY_LEDGER_CLIENT_SECRET=your-secret
   EMPATHY_LEDGER_PLATFORM_NAME=act_place
   ```

4. **Customize**
   - Edit components in `/components/stories`
   - Adjust theme in `tailwind.config.js`
   - Add your logo/branding

5. **Deploy**
   ```bash
   webflow login
   webflow deploy --site your-site
   ```

### Cost
- Webflow Cloud hosting: Included in site plan
- Empathy Ledger API: Free tier available

---

## Method 2: Embed Widget

**Best for:** Quick integration, any website

### What You Get
- Drop-in iframe or script tag
- Always shows current stories
- No backend work needed
- Automatic consent handling

### iframe Embed

```html
<iframe
  src="https://empathyledger.com/embed/catalog?app=YOUR_APP_ID&layout=grid&columns=3"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

### JavaScript Widget

```html
<div
  data-empathy-catalog
  data-app-id="YOUR_APP_ID"
  data-layout="grid"
  data-columns="3"
  data-theme="light"
></div>
<script src="https://empathyledger.com/embed.js"></script>
```

### Configuration Options

| Option | Values | Default |
|--------|--------|---------|
| `layout` | grid, list, carousel | grid |
| `columns` | 1-4 | 3 |
| `theme` | light, dark, earth | light |
| `limit` | 1-50 | 12 |
| `filter-theme` | any theme slug | none |

---

## Method 3: API Integration

**Best for:** JusticeHub, custom applications

### What You Get
- Full control over data
- Build custom UI
- Webhook notifications
- Direct database-like access

### Authentication

```javascript
// 1. Generate JWT token
const jwt = await fetch('https://empathyledger.com/api/external/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: 'your-app-id',
    client_secret: 'your-secret'
  })
}).then(r => r.json())

// Token valid for 1 hour
const token = jwt.access_token
```

### Fetch Stories

```javascript
const response = await fetch('https://empathyledger.com/api/external/stories', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const { stories } = await response.json()
```

### Story Object

```typescript
interface Story {
  id: string
  title: string
  content: string          // Full text if consent allows
  summary: string          // Always available
  featured_image: string   // If consent allows
  storyteller: {
    display_name: string
    avatar_url: string
  }
  themes: string[]
  created_at: string

  // Required for display
  attribution: {
    text: string           // "Story by X | Empathy Ledger"
    link: string           // Canonical URL
    badge_url: string      // Attribution badge
  }
  tracking_pixel_url: string  // Include in your display
}
```

### Webhooks

Register to receive real-time notifications:

```javascript
// Register webhook
await fetch('https://empathyledger.com/api/external/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://your-app.com/webhooks/empathy-ledger',
    events: ['consent.revoked', 'story.updated']
  })
})
```

**Events:**
- `consent.granted` - New story available
- `consent.revoked` - Remove story immediately
- `consent.updated` - Share level changed
- `story.updated` - Content changed
- `story.deleted` - Remove story

### Webhook Payload

```json
{
  "event": "consent.revoked",
  "story_id": "abc123",
  "timestamp": "2025-12-10T10:30:00Z",
  "action_required": "remove_immediately",
  "reason": "Storyteller withdrew consent"
}
```

---

## Method 4: oEmbed

**Best for:** WordPress, Medium, content platforms

### Auto-Embedding

Paste an Empathy Ledger story URL and it auto-embeds:

```
https://empathyledger.com/stories/abc123
```

### oEmbed Endpoint

```
GET https://empathyledger.com/api/oembed?url=https://empathyledger.com/stories/abc123
```

### Response

```json
{
  "type": "rich",
  "version": "1.0",
  "title": "Story Title",
  "author_name": "Storyteller Name",
  "provider_name": "Empathy Ledger",
  "html": "<iframe src='...'></iframe>",
  "width": 600,
  "height": 400
}
```

---

## Value Attribution Requirements

**All integrations must include:**

1. **Attribution Link**
   ```html
   <a href="https://empathyledger.com/stories/{id}">
     View on Empathy Ledger
   </a>
   ```

2. **Storyteller Credit**
   ```html
   Story by {storyteller_name}
   ```

3. **Tracking Pixel** (for engagement analytics)
   ```html
   <img src="{tracking_pixel_url}" width="1" height="1" />
   ```

---

## Consent Handling

### On Consent Revocation

When a storyteller revokes consent:

1. **Webhook fires** → `consent.revoked` event
2. **Your action** → Remove story from display
3. **Delete cached content** → Don't retain revoked stories
4. **Confirm removal** → Return 200 OK to webhook

### Cache Policy

Always use no-cache for story content:
```
Cache-Control: no-store, no-cache, must-revalidate
```

This ensures consent changes take effect immediately.

---

## Support

- **Documentation:** https://docs.empathyledger.com
- **Developer Portal:** https://empathyledger.com/developers
- **API Status:** https://status.empathyledger.com
- **Email:** developers@empathyledger.com

## Sources

- [Webflow Cloud Announcement](https://www.prnewswire.com/news-releases/webflow-cloud-brings-full-stack-app-hosting-to-the-website-experience-platform-302445528.html)
- [Webflow API Documentation](https://developers.webflow.com/)
- [Webflow Apps Platform](https://webflow.com/apps)
