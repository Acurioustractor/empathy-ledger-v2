# JusticeHub Integration Guide

**Purpose**: Enable JusticeHub to display syndicated stories from Empathy Ledger
**Status**: Ready for implementation
**Estimated Time**: 2-3 hours

---

## Overview

JusticeHub will display youth justice stories syndicated from Empathy Ledger. This integration requires:
1. Authentication (API key from Empathy Ledger)
2. Story fetching (Content Access API)
3. Story display (React component)
4. Webhook handler (revocation notifications)
5. Engagement tracking (view/click events)

---

## Step 1: Get API Credentials

### From Empathy Ledger Admin

Contact Empathy Ledger team to register JusticeHub:

```sql
-- Already registered in seed data:
SELECT id, api_key_hash FROM syndication_sites WHERE slug = 'justicehub';
```

**You'll receive**:
- **Site ID**: `{uuid}`
- **API Key**: `empathy-ledger-justicehub-{random}`
- **Webhook Secret**: For HMAC signature verification

**Store in environment**:
```env
# .env.local
EMPATHY_LEDGER_API_URL=https://empathyledger.com/api
EMPATHY_LEDGER_API_KEY=empathy-ledger-justicehub-xxx
EMPATHY_LEDGER_WEBHOOK_SECRET=webhook-secret-xxx
EMPATHY_LEDGER_SITE_ID=uuid-of-justicehub-site
```

---

## Step 2: Request Stories from Storytellers

### Process

1. **Browse Available Stories**
   ```typescript
   // GET /api/syndication/available-stories
   // Returns stories approved for syndication
   ```

2. **Request Specific Stories**
   ```typescript
   // POST /api/syndication/request
   {
     "siteId": "justicehub-site-uuid",
     "storyIds": ["story-1", "story-2", "story-3"],
     "reason": "We want to feature these powerful justice stories on our homepage"
   }
   ```

3. **Storyteller Approves**
   - Storyteller sees request in Empathy Ledger dashboard
   - Reviews JusticeHub's purpose and audience
   - Approves or denies

4. **Receive Embed Token**
   - On approval, Empathy Ledger generates embed token
   - Token sent to JusticeHub webhook
   - Store token in database

---

## Step 3: Fetch Story Content

### API Endpoint

```
GET https://empathyledger.com/api/syndication/content/{storyId}
Authorization: Bearer {embedToken}
Origin: https://justicehub.org.au
```

### Request Example

```typescript
const response = await fetch(
  `${process.env.EMPATHY_LEDGER_API_URL}/syndication/content/${storyId}`,
  {
    headers: {
      'Authorization': `Bearer ${embedToken}`,
      'X-Site-ID': process.env.EMPATHY_LEDGER_SITE_ID
    }
  }
)

const data = await response.json()
```

### Response Format

```json
{
  "story": {
    "id": "story-uuid",
    "title": "My Journey Through the Justice System",
    "content": "Full story content...",
    "excerpt": "A powerful story about transformation...",
    "themes": ["healing", "justice", "family"],
    "createdAt": "2025-12-01T00:00:00Z",
    "storyteller": {
      "id": "user-uuid",
      "displayName": "Sarah M.",
      "avatarUrl": "https://..."
    },
    "mediaAssets": [
      {
        "id": "media-uuid",
        "filename": "image.jpg",
        "mediaType": "image",
        "thumbnailUrl": "https://..."
      }
    ]
  },
  "attribution": {
    "platform": "Empathy Ledger",
    "url": "https://empathyledger.com/stories/story-uuid",
    "message": "This story is shared with permission from the storyteller via Empathy Ledger."
  },
  "permissions": {
    "canEmbed": true,
    "canModify": false,
    "mustAttribution": true,
    "revocable": true
  }
}
```

### Error Responses

**401 Unauthorized** - Invalid or expired token
```json
{
  "error": "Token has been revoked"
}
```

**403 Forbidden** - Sacred content or no permission
```json
{
  "error": "Sacred content cannot be syndicated",
  "message": "This story contains sacred cultural content..."
}
```

**404 Not Found** - Story doesn't exist or was removed
```json
{
  "error": "Story not found"
}
```

---

## Step 4: Display Stories on JusticeHub

### React Component Example

```typescript
// justicehub/src/components/EmpathyLedgerStoryCard.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface EmpathyLedgerStory {
  id: string
  title: string
  excerpt: string
  content: string
  themes: string[]
  storyteller: {
    displayName: string
    avatarUrl?: string
  }
  mediaAssets: Array<{
    id: string
    thumbnailUrl: string
  }>
}

interface StoryCardProps {
  storyId: string
  embedToken: string
  onView?: () => void
  onRemoved?: () => void
}

export default function EmpathyLedgerStoryCard({
  storyId,
  embedToken,
  onView,
  onRemoved
}: StoryCardProps) {
  const [story, setStory] = useState<EmpathyLedgerStory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStory()
  }, [storyId, embedToken])

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/empathy-ledger/stories/${storyId}`, {
        headers: {
          'Authorization': `Bearer ${embedToken}`
        }
      })

      if (response.status === 404) {
        // Story was removed
        setError('This story has been removed by the storyteller')
        onRemoved?.()
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch story')
      }

      const data = await response.json()
      setStory(data.story)

      // Track view
      onView?.()
      trackEngagement('view')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading story')
    } finally {
      setLoading(false)
    }
  }

  const trackEngagement = async (eventType: 'view' | 'click') => {
    try {
      await fetch('/api/empathy-ledger/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          eventType,
          timestamp: new Date().toISOString()
        })
      })
    } catch (err) {
      console.error('Failed to track engagement:', err)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading story...</div>
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">{error}</p>
      </div>
    )
  }

  if (!story) return null

  return (
    <article className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Featured Image */}
      {story.mediaAssets[0] && (
        <div className="relative h-64 w-full">
          <Image
            src={story.mediaAssets[0].thumbnailUrl}
            alt={story.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {story.storyteller.avatarUrl && (
            <Image
              src={story.storyteller.avatarUrl}
              alt={story.storyteller.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-sm text-gray-600">Story by</p>
            <p className="font-medium">{story.storyteller.displayName}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-3">{story.title}</h2>

        {/* Themes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {story.themes.map(theme => (
            <span
              key={theme}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>

        {/* Excerpt */}
        <p className="text-gray-700 mb-4 line-clamp-3">{story.excerpt}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <a
            href={`https://empathyledger.com/stories/${story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEngagement('click')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read Full Story →
          </a>

          {/* Attribution */}
          <p className="text-xs text-gray-500">
            via Empathy Ledger
          </p>
        </div>
      </div>

      {/* Footer Attribution (Required) */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          This story is shared with permission from the storyteller via{' '}
          <a
            href="https://empathyledger.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Empathy Ledger
          </a>
        </p>
      </div>
    </article>
  )
}
```

### Usage Example

```typescript
// justicehub/src/app/page.tsx

import EmpathyLedgerStoryCard from '@/components/EmpathyLedgerStoryCard'

export default function HomePage() {
  // Fetch stories from your database
  const syndicatedStories = await getSyndicatedStories()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Justice Stories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {syndicatedStories.map(story => (
          <EmpathyLedgerStoryCard
            key={story.id}
            storyId={story.empathyLedgerStoryId}
            embedToken={story.embedToken}
            onView={() => console.log('Story viewed:', story.id)}
            onRemoved={() => handleStoryRemoved(story.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Step 5: Implement Webhook Handler

### Purpose
Receive real-time notifications when:
- Content is revoked (must remove within 5 minutes)
- Content is updated
- Consent is approved/denied

### Webhook Endpoint

```typescript
// justicehub/src/app/api/webhooks/empathy-ledger/route.ts

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface WebhookPayload {
  event: 'content_revoked' | 'content_updated' | 'consent_approved' | 'consent_denied'
  storyId: string
  siteId: string
  timestamp: string
  data?: Record<string, any>
}

/**
 * Verify HMAC signature from Empathy Ledger
 */
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.EMPATHY_LEDGER_WEBHOOK_SECRET!
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    // Get signature from header
    const signature = request.headers.get('x-empathy-ledger-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const payload: WebhookPayload = JSON.parse(rawBody)

    // Verify signature
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Handle event
    switch (payload.event) {
      case 'content_revoked':
        await handleContentRevoked(payload.storyId)
        break

      case 'content_updated':
        await handleContentUpdated(payload.storyId)
        break

      case 'consent_approved':
        await handleConsentApproved(payload)
        break

      case 'consent_denied':
        await handleConsentDenied(payload)
        break

      default:
        console.log('Unknown event type:', payload.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle content revocation - CRITICAL: Must remove within 5 minutes
 */
async function handleContentRevoked(storyId: string) {
  console.log(`[URGENT] Removing story ${storyId} - 5 minute deadline`)

  // 1. Mark story as revoked in database
  await db.syndicatedStories.update({
    where: { empathyLedgerStoryId: storyId },
    data: {
      status: 'revoked',
      revokedAt: new Date(),
      isVisible: false
    }
  })

  // 2. Invalidate all caches
  await Promise.all([
    revalidatePath('/'),
    revalidatePath('/stories'),
    revalidateTag(`story-${storyId}`)
  ])

  // 3. Clear CDN cache if applicable
  if (process.env.CDN_PURGE_URL) {
    await fetch(process.env.CDN_PURGE_URL, {
      method: 'POST',
      body: JSON.stringify({ storyId })
    })
  }

  console.log(`Story ${storyId} removed successfully`)
}

/**
 * Handle content update
 */
async function handleContentUpdated(storyId: string) {
  console.log(`Updating story ${storyId}`)

  // Fetch latest content from Empathy Ledger
  const story = await fetchStoryFromEmpathyLedger(storyId)

  if (story) {
    await db.syndicatedStories.update({
      where: { empathyLedgerStoryId: storyId },
      data: {
        title: story.title,
        excerpt: story.excerpt,
        updatedAt: new Date()
      }
    })

    // Revalidate caches
    revalidateTag(`story-${storyId}`)
  }
}

/**
 * Handle consent approval - Store embed token
 */
async function handleConsentApproved(payload: WebhookPayload) {
  console.log(`Consent approved for story ${payload.storyId}`)

  const { embedToken } = payload.data || {}

  if (embedToken) {
    await db.syndicatedStories.create({
      data: {
        empathyLedgerStoryId: payload.storyId,
        embedToken,
        status: 'active',
        approvedAt: new Date()
      }
    })
  }
}

/**
 * Handle consent denial
 */
async function handleConsentDenied(payload: WebhookPayload) {
  console.log(`Consent denied for story ${payload.storyId}`)

  await db.syndicatedStories.delete({
    where: { empathyLedgerStoryId: payload.storyId }
  })
}
```

---

## Step 6: Track Engagement

### Send Events to Empathy Ledger

```typescript
// justicehub/src/app/api/empathy-ledger/track/route.ts

export async function POST(request: NextRequest) {
  const { storyId, eventType } = await request.json()

  try {
    await fetch(
      `${process.env.EMPATHY_LEDGER_API_URL}/syndication/webhook/engagement`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.EMPATHY_LEDGER_API_KEY!,
          'X-Site-ID': process.env.EMPATHY_LEDGER_SITE_ID!
        },
        body: JSON.stringify({
          storyId,
          eventType, // 'view', 'click', 'share'
          timestamp: new Date().toISOString(),
          referrer: request.headers.get('referer'),
          userAgent: request.headers.get('user-agent')
        })
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track engagement:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
```

---

## Step 7: Database Schema (JusticeHub)

```sql
-- justicehub/prisma/schema.prisma or migrations

CREATE TABLE syndicated_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Empathy Ledger Reference
  empathy_ledger_story_id UUID NOT NULL UNIQUE,
  embed_token TEXT NOT NULL,

  -- Cached Content (for performance)
  title TEXT,
  excerpt TEXT,
  thumbnail_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  is_visible BOOLEAN DEFAULT true,

  -- Timestamps
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_syndicated_stories_status ON syndicated_stories(status);
CREATE INDEX idx_syndicated_stories_visible ON syndicated_stories(is_visible);
```

---

## Step 8: Testing Checklist

### Before Launch
- [ ] Environment variables configured
- [ ] Webhook endpoint deployed and accessible
- [ ] HMAC signature verification working
- [ ] Story card component renders correctly
- [ ] Attribution footer present on all cards
- [ ] Cache invalidation tested

### Integration Testing
- [ ] Request story consent from Empathy Ledger
- [ ] Storyteller approves → receive webhook
- [ ] Fetch story content with embed token
- [ ] Display story on homepage
- [ ] Track view event
- [ ] Track click event (when user reads full story)
- [ ] Storyteller revokes → receive webhook
- [ ] Story removed from site within 5 minutes
- [ ] Verify removal (404 on subsequent fetches)

### Performance Testing
- [ ] Page load time < 2 seconds
- [ ] Images lazy-loaded
- [ ] API responses cached appropriately
- [ ] CDN configured for static assets

---

## Compliance Requirements

### MUST DO
1. ✅ **Attribution Required** - Every story must display Empathy Ledger attribution
2. ✅ **Link Back** - Stories must link to original on Empathy Ledger
3. ✅ **5-Minute Removal** - Must remove revoked content within 5 minutes
4. ✅ **No Modification** - Cannot edit storyteller's content
5. ✅ **Track Engagement** - Must report views/clicks back to Empathy Ledger

### MUST NOT DO
1. ❌ **No Scraping** - Only access via official API with embed token
2. ❌ **No Caching Forever** - Must check for revocations regularly
3. ❌ **No Sublicensing** - Cannot share embed tokens with third parties
4. ❌ **No Ownership Claims** - Content belongs to storytellers

---

## Support & Troubleshooting

### Common Issues

**401 Unauthorized**
- Check embed token is valid
- Verify token hasn't been revoked
- Check token hasn't expired

**403 Forbidden**
- Story may contain sacred content
- Storyteller may have changed permissions
- Check consent is still approved

**404 Not Found**
- Story has been removed/revoked
- Check webhook handler processed revocation
- Update local database status

### Contact
- **Technical Support**: tech@empathyledger.com
- **Integration Help**: integrations@empathyledger.com
- **Webhook Issues**: Check logs, verify HMAC signature

---

## Next Steps

1. Register JusticeHub with Empathy Ledger team
2. Receive API credentials
3. Implement webhook handler first (critical path)
4. Build story card component
5. Request first 5 stories for testing
6. Launch on staging environment
7. User acceptance testing
8. Production launch

**Estimated Timeline**: 1 week (2-3 days development + 2-3 days testing)
