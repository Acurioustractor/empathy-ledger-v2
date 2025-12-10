# act.place - Webflow Cloud App

A Next.js application for displaying stories from Empathy Ledger, designed to run on Webflow Cloud.

## Overview

This app fetches stories from Empathy Ledger's API in real-time, ensuring:
- **Instant consent updates** - If a storyteller revokes consent, their story disappears immediately
- **Value attribution** - All views and engagement flow back to storytellers
- **Brand consistency** - Full control over design and UX while keeping stories in sync

## Architecture

```
┌─────────────────────────────────────┐
│         Webflow Cloud               │
│  ┌───────────────────────────────┐  │
│  │     act.place Next.js App     │  │
│  │  ┌─────────┐  ┌─────────────┐ │  │
│  │  │ Stories │  │  Story      │ │  │
│  │  │  Grid   │  │  Detail     │ │  │
│  │  └────┬────┘  └──────┬──────┘ │  │
│  └───────┼──────────────┼────────┘  │
│          │              │           │
└──────────┼──────────────┼───────────┘
           │ API calls    │
           ▼              ▼
┌─────────────────────────────────────┐
│        EMPATHY LEDGER API           │
│    /api/external/stories            │
│    (JWT authenticated)              │
└─────────────────────────────────────┘
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your app credentials
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Deploy to Webflow Cloud:**
   ```bash
   npm run build
   npx webflow-cli deploy
   ```

## Configuration

### Environment Variables

```env
# Your Empathy Ledger app credentials
EMPATHY_LEDGER_APP_ID=your-app-id
EMPATHY_LEDGER_CLIENT_SECRET=your-client-secret

# API endpoint (default: production)
EMPATHY_LEDGER_API_URL=https://empathyledger.com/api

# Your app name (for tracking attribution)
EMPATHY_LEDGER_PLATFORM_NAME=act_place
```

## Features

- **Real-time stories** - Fetches directly from Empathy Ledger API
- **Instant consent** - Revoked stories disappear immediately
- **Engagement tracking** - Views flow back to storyteller dashboards
- **Responsive grid** - Works on all devices
- **Theme customization** - Match your brand
- **Search & filter** - By theme, storyteller, date

## Components

### `<StoryGrid />`
Displays a grid of stories with pagination.

```tsx
import { StoryGrid } from '@/components/stories'

export default function StoriesPage() {
  return (
    <StoryGrid
      columns={3}
      perPage={12}
      theme="earth"
      showFilters
    />
  )
}
```

### `<StoryCard />`
Individual story card with attribution.

```tsx
import { StoryCard } from '@/components/stories'

<StoryCard
  story={story}
  variant="compact" // or "full"
  showStoryteller
/>
```

### `<StoryDetail />`
Full story view page.

```tsx
// app/stories/[id]/page.tsx
import { StoryDetail } from '@/components/stories'

export default async function StoryPage({ params }) {
  return <StoryDetail storyId={params.id} />
}
```

## API Integration

The app uses JWT authentication with Empathy Ledger's External API:

```typescript
// lib/empathy-ledger.ts
import { EmpathyLedgerClient } from '@empathyledger/sdk'

export const client = new EmpathyLedgerClient({
  appId: process.env.EMPATHY_LEDGER_APP_ID!,
  clientSecret: process.env.EMPATHY_LEDGER_CLIENT_SECRET!,
})

// Fetch stories
const stories = await client.stories.list({
  limit: 12,
  theme: 'justice'
})
```

## Deployment to Webflow Cloud

### Prerequisites
- Webflow workspace with Cloud enabled
- Connected Git repository
- Empathy Ledger app credentials

### Step-by-Step Deployment

#### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial act.place app"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

#### 2. Connect to Webflow Cloud
1. Go to your Webflow workspace
2. Navigate to **Apps > Cloud**
3. Click **Connect Repository**
4. Select your Git repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Output directory: `.next`

#### 3. Configure Environment Variables
In the Webflow Cloud dashboard, add:
- `EMPATHY_LEDGER_APP_ID` - Your app ID
- `EMPATHY_LEDGER_CLIENT_SECRET` - Your secret key
- `EMPATHY_LEDGER_API_URL` - https://empathyledger.com
- `PLATFORM_NAME` - act_place

#### 4. Deploy
- Webflow automatically deploys on push to main
- Check deployment logs in the Webflow dashboard
- Verify the site loads at your-site.webflow.io

#### 5. Custom Domain (Optional)
1. Go to **Site Settings > Custom Domains**
2. Add your domain (e.g., act.place)
3. Update DNS with the provided records
4. Wait for SSL certificate provisioning

### Alternative Deployments

#### Vercel
```bash
npx vercel
# Follow prompts, add environment variables in dashboard
```

#### Self-hosted
```bash
npm run build
npm run start
# Configure reverse proxy (nginx/caddy) for production
```

## Customization

### Theming

Edit `tailwind.config.js` to match your brand:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      }
    }
  }
}
```

### Layout

The default layout uses a full-width grid. Customize in `app/layout.tsx`.

## Value Attribution

Every story display includes:
1. **Tracking pixel** - Records views for storyteller dashboards
2. **Read time tracking** - Measures engagement depth via `sendBeacon`
3. **Attribution link** - Links back to Empathy Ledger
4. **Storyteller credit** - Shows who told the story

This ensures storytellers see the impact of their stories across all platforms.

### Attribution Requirements

**Important**: Per the Empathy Ledger partnership agreement, you must:

1. Display the "Stories powered by Empathy Ledger" badge in footer
2. Link each story back to its canonical URL on Empathy Ledger
3. Include tracking pixels for engagement attribution
4. Show storyteller names when available

The template includes all required attribution by default.

## Tracking Components

### `<TrackingPixel />`
Invisible component that tracks page views and read time.

```tsx
import { TrackingPixel } from '@/components/TrackingPixel'

<TrackingPixel storyId={story.id} />
```

### `<DetailPageTracking />`
Enhanced tracking for story detail pages with scroll depth.

```tsx
import { DetailPageTracking } from '@/components/TrackingPixel'

<DetailPageTracking storyId={story.id} />
```

## Support

- Documentation: https://docs.empathyledger.com
- Issues: https://github.com/empathyledger/webflow-cloud-template/issues
- Email: support@empathyledger.com

## License

MIT - Use freely for displaying Empathy Ledger stories.
