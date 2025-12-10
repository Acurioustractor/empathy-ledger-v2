# Partner Onboarding Guide

## Welcome to the Empathy Ledger Story Network

This guide will help you set up story syndication for your platform. Whether you're building a community site, advocacy platform, or organizational website, you can display powerful stories from the Empathy Ledger network while ensuring storytellers retain control and receive attribution.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                     YOUR ORGANIZATION                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Partner Portal (portal.empathyledger.com)       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │ Projects │  │  Story   │  │ Message  │  │Analytics │    │    │
│  │  │ Manager  │  │ Curator  │  │Storytlrs │  │Dashboard │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Your Website (e.g., act.place)                  │    │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐     │    │
│  │  │  Story Grid      │  │  Story Detail Pages          │     │    │
│  │  │  (Embed/API)     │  │  (Full content display)      │     │    │
│  │  └────────┬─────────┘  └──────────────┬───────────────┘     │    │
│  └───────────┼───────────────────────────┼─────────────────────┘    │
│              │                           │                          │
└──────────────┼───────────────────────────┼──────────────────────────┘
               │ Real-time API             │ Engagement data
               ▼                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EMPATHY LEDGER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Stories   │  │ Storyteller │  │    Impact Dashboard         │  │
│  │   Catalog   │  │  Profiles   │  │  (Views flow to storytlrs)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Register Your Organization

### Create Your Partner Account

1. Visit **portal.empathyledger.com/register**
2. Fill in your organization details:
   - Organization name
   - Website URL
   - Primary contact email
   - Organization type (nonprofit, government, media, etc.)
3. Describe your intended use case
4. Accept the Partnership Agreement

### What You'll Receive

After approval (usually within 24-48 hours), you'll receive:

| Credential | Description |
|------------|-------------|
| `APP_ID` | Your unique application identifier |
| `CLIENT_SECRET` | Secret key for API authentication |
| Portal Access | Login to manage your integration |

---

## Step 2: Create Your First Project

Projects help you organize stories by campaign, theme, or purpose.

### In the Partner Portal:

1. Go to **Projects > Create New**
2. Configure your project:

```
Project Name:        "Climate Justice Stories"
Description:         Stories from communities affected by climate change
Themes:              [climate, justice, community, resilience]
Story Types:         [testimony, personal, advocacy]
Geographic Focus:    Australia (optional)
```

3. Set display preferences:
   - Show storyteller names? ✓
   - Show storyteller photos? ✓
   - Allow full content? ✓
   - Enable comments/reactions? (coming soon)

---

## Step 3: Invite Stories to Your Project

### Option A: Browse & Request

1. Go to **Story Catalog** in the portal
2. Browse stories by theme, location, or storyteller
3. Click **Request for Project** on stories you'd like to feature
4. The storyteller receives a notification and can approve/decline

### Option B: Invite Storytellers Directly

1. Go to **Storytellers > Invite**
2. Enter email or share an invite link
3. New storytellers create their profile on Empathy Ledger
4. Their stories can be shared with your project

### Option C: Import Existing Stories

If your organization has existing stories:
1. Go to **Import > Upload Stories**
2. Stories are created on Empathy Ledger
3. Storytellers are invited to claim their profiles
4. Once claimed, stories become part of the network

---

## Step 4: Display Stories on Your Website

### Option 1: Embed Widget (Easiest)

Drop this code anywhere on your site:

```html
<!-- Story Grid -->
<div
  data-empathy-stories="true"
  data-project="YOUR_PROJECT_ID"
  data-layout="grid"
  data-columns="3"
  data-theme="light"
></div>
<script src="https://empathyledger.com/embed/stories.js"></script>
```

**Customization Options:**

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-layout` | `grid`, `list`, `carousel` | Display layout |
| `data-columns` | `1-4` | Grid columns |
| `data-theme` | `light`, `dark`, `brand` | Color scheme |
| `data-limit` | `1-50` | Max stories shown |
| `data-show-filters` | `true/false` | Show theme filters |

### Option 2: Next.js App (Recommended for Webflow Cloud)

Use our complete template for full control:

```bash
# Clone the template
git clone https://github.com/empathyledger/partner-template
cd partner-template

# Configure
cp .env.example .env.local
# Edit .env.local with your credentials

# Deploy to Webflow Cloud
npm run build
npx webflow-cli deploy
```

### Option 3: Direct API Integration

For custom implementations:

```javascript
// Generate JWT token
const token = await generateToken(APP_ID, CLIENT_SECRET)

// Fetch stories
const response = await fetch(
  'https://empathyledger.com/api/external/stories?project=YOUR_PROJECT_ID',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
)

const { stories } = await response.json()
```

---

## Step 5: Communicate with Storytellers

### Send Messages (via Empathy Ledger)

You can reach out to storytellers **without accessing their personal contact info**:

1. Go to **Messages > New Conversation**
2. Select the storyteller
3. Write your message
4. They receive notification via Empathy Ledger

**Example Use Cases:**
- Request permission for a specific use
- Ask clarifying questions about their story
- Invite them to events
- Share impact data ("Your story was viewed 500 times!")

### Message Templates

Use pre-approved templates for common requests:

```
📋 Story Feature Request
────────────────────────
Hi [Storyteller Name],

We'd love to feature your story "[Story Title]" in our
[Project Name] project on [Your Organization].

This would help [brief description of impact].

Would you be comfortable with this? You can approve or
decline directly from your Empathy Ledger dashboard.

Best regards,
[Your Organization]
```

---

## Step 6: Track Your Impact

### Partner Dashboard Metrics

Your dashboard shows:

| Metric | Description |
|--------|-------------|
| **Total Views** | Story views across your site |
| **Read Depth** | How much of stories people read |
| **Engagement** | Shares, saves, time spent |
| **Geographic Reach** | Where your audience is |
| **Story Performance** | Which stories resonate most |

### Storyteller Attribution

All engagement data flows back to storytellers:

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Storyteller Dashboard (what they see)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Your story "My Climate Journey" was viewed on:                     │
│  ├── act.place: 847 views, 5:32 avg read time                      │
│  ├── JusticeHub: 312 views, 4:15 avg read time                     │
│  └── Direct (Empathy Ledger): 88 views                             │
│                                                                     │
│  🌍 Reached people in: Sydney, Melbourne, Brisbane, Perth           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Guidelines

### Story Cards

Your story display should include:

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         Featured Image          │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Theme Badge] [Theme Badge]            │
│                                         │
│  Story Title Goes Here                  │
│                                         │
│  Brief summary of the story that        │
│  gives readers context...               │
│                                         │
│  ┌────┐                                 │
│  │ 👤 │  Storyteller Name              │
│  └────┘  via Empathy Ledger            │
│                                         │
└─────────────────────────────────────────┘
```

### Required Attribution

You **must** include:

1. ✅ Storyteller name (when provided)
2. ✅ "via Empathy Ledger" or badge
3. ✅ Link to original story
4. ✅ Tracking pixel (automatic with our components)

### Branding Options

You can customize:
- Colors to match your brand
- Card layouts and sizes
- Filter and search UI
- Typography

You cannot:
- Remove attribution
- Claim stories as your own content
- Display stories without consent
- Share storyteller contact info

---

## Consent & Privacy

### How Consent Works

```
Storyteller Control Flow:
─────────────────────────

1. Storyteller creates story on Empathy Ledger
                    │
                    ▼
2. You request story for your project
                    │
                    ▼
3. Storyteller receives notification
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    APPROVE                  DECLINE
        │                       │
        ▼                       ▼
Story appears              Story not
on your site               available
        │
        ▼
4. Storyteller can REVOKE anytime
        │
        ▼
Story immediately removed
from your site
```

### Data You Receive

| Data | Access |
|------|--------|
| Story content | As consented (full/summary/title) |
| Storyteller display name | If they choose to share |
| Storyteller photo | If they choose to share |
| Story themes | Always |
| Created date | Always |
| Contact info | **Never** (communicate via platform) |

---

## Technical Reference

### API Endpoints

```
Base URL: https://empathyledger.com/api/external

GET  /stories              List stories for your app
GET  /stories/:id          Get single story
GET  /projects             List your projects
GET  /projects/:id/stories Stories in a project
GET  /themes               Available story themes
POST /messages             Send message to storyteller
GET  /analytics            Your engagement data
```

### Webhook Events

Configure webhooks to receive real-time updates:

```json
{
  "event": "consent.granted",
  "story_id": "abc123",
  "project_id": "your-project",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

| Event | Description |
|-------|-------------|
| `consent.granted` | Storyteller approved your request |
| `consent.revoked` | Storyteller withdrew consent |
| `story.updated` | Story content was modified |
| `storyteller.message` | New message from storyteller |

---

## Support

### Getting Help

- **Documentation**: docs.empathyledger.com
- **Email**: partners@empathyledger.com
- **Portal Support**: In-app chat in partner portal

### Common Issues

**Stories not appearing?**
- Check consent is granted in portal
- Verify API credentials are correct
- Ensure project ID matches

**Engagement not tracking?**
- Include tracking pixel/component
- Check CORS settings if self-hosting
- Verify beacon endpoint is reachable

---

## Next Steps

1. ☐ Register at portal.empathyledger.com
2. ☐ Create your first project
3. ☐ Request or invite stories
4. ☐ Implement display on your site
5. ☐ Monitor impact in dashboard

Welcome to the network! Every story you share helps amplify voices that need to be heard.
