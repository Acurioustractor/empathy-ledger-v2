# Story & Media Sharing System

**Status:** ✅ Fully Implemented and Tested
**Version:** 1.0
**Last Updated:** January 4, 2026

## Overview

The Story & Media Sharing System enables controlled sharing of stories and media assets with comprehensive cultural safety protocols, consent verification, and analytics tracking.

## Table of Contents

1. [Features](#features)
2. [Cultural Safety Protocols](#cultural-safety-protocols)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Analytics](#analytics)

---

## Features

### ✅ Implemented Features

- **Story Sharing** - Share published stories via link, social media, email, or embed
- **Media Sharing** - Share media assets with permission and consent checks
- **Cultural Safety Checks** - Multi-level verification before allowing shares
- **Consent Verification** - Ensures explicit consent exists before sharing
- **Share Tracking** - Comprehensive tracking of all share events
- **Analytics** - Detailed analytics for storytellers on how their content is shared
- **Platform Tracking** - Track which platforms stories are shared to (Facebook, Twitter, WhatsApp, etc.)
- **Share Counting** - Automatic increment of share counts on stories

---

## Cultural Safety Protocols

### Pre-Share Verification Checklist

Before any story can be shared, the system verifies:

1. ✅ **Publication Status**
   - Story must have `status = 'published'`
   - Draft, archived, or review stories cannot be shared
   - Error code: `NOT_PUBLISHED`

2. ✅ **Explicit Consent**
   - Story must have `has_explicit_consent = true` OR
   - Story must have `consent_verified_at` timestamp set
   - Error code: `NO_CONSENT`

3. ✅ **Privacy Level**
   - Story must have `is_public = true` OR
   - Story must have `privacy_level = 'public'`
   - Error code: `PRIVACY_RESTRICTED`

4. ⚠️ **Cultural Sensitivity Warning**
   - If `cultural_sensitivity_level = 'high'`, requires additional confirmation
   - Shows warning message to sharer
   - Requires explicit confirmation to proceed
   - Code: `HIGH_SENSITIVITY_WARNING`

### Share Approval Flow

```
User clicks Share button
  ↓
Frontend calls POST /api/stories/[id]/share
  ↓
Backend verifies publication status
  ↓
Backend verifies consent
  ↓
Backend verifies privacy settings
  ↓
[If high sensitivity] Shows warning, requires confirmation
  ↓
Creates share event in database
  ↓
Increments share count
  ↓
Returns share URL and metadata
  ↓
Frontend completes native share or clipboard copy
```

---

## API Endpoints

### 1. Share Story

**Endpoint:** `POST /api/stories/[id]/share`

**Request Body:**
```json
{
  "method": "link",           // 'link', 'email', 'social', 'embed', 'download'
  "platform": "twitter",      // 'facebook', 'twitter', 'whatsapp', 'email', 'linkedin', etc.
  "userId": "uuid",           // Optional: ID of user sharing
  "confirmed": false,         // Set to true if confirming high sensitivity share
  "metadata": {}              // Optional: Additional metadata
}
```

**Success Response (200):**
```json
{
  "success": true,
  "shareUrl": "https://empathyledger.com/stories/615bcafa-...",
  "shareTitle": "Story Title",
  "shareText": "Check out this story: Story Title",
  "shareCount": 1,
  "culturalSensitivityLevel": "standard",
  "message": "Story shared successfully"
}
```

**High Sensitivity Warning (200):**
```json
{
  "warning": "This story has high cultural sensitivity...",
  "requiresConfirmation": true,
  "culturalSensitivity": "high",
  "code": "HIGH_SENSITIVITY_WARNING"
}
```

**Error Responses:**
- `404` - Story not found
- `403` - Not published (`NOT_PUBLISHED`)
- `403` - No consent (`NO_CONSENT`)
- `403` - Privacy restricted (`PRIVACY_RESTRICTED`)

### 2. Share Media

**Endpoint:** `POST /api/media/[id]/share`

**Request Body:**
```json
{
  "method": "link",           // 'link', 'download', 'embed', 'social'
  "platform": "facebook",
  "userId": "uuid",
  "confirmed": false,
  "metadata": {}
}
```

**Success Response (200):**
```json
{
  "success": true,
  "mediaId": "uuid",
  "mediaType": "image",
  "fileName": "photo.jpg",
  "shareUrl": "https://empathyledger.com/media/...",
  "mediaUrl": "https://storage.supabase.co/...",  // Only for downloads
  "embedCode": "<img src='...' />",              // Only for embeds
  "culturalSensitivity": "standard",
  "usageRights": "public",
  "message": "Media shared successfully"
}
```

**Media-Specific Checks:**
- `consent_status` must be 'granted' or 'verified'
- `is_public` must be true
- `usage_rights` must not be 'restricted'
- `cultural_sensitivity` triggers warning if 'high'

### 3. Share Analytics

**Endpoint:** `GET /api/storytellers/[id]/share-analytics?period=30`

**Query Parameters:**
- `period` - Number of days to include (default: 30)

**Response:**
```json
{
  "storytellerId": "uuid",
  "storytellerName": "Jane Doe",
  "summary": {
    "totalStoryShares": 156,
    "sharesLast30Days": 42,
    "sharesLast7Days": 12,
    "shareVelocity": 1.4,
    "lastShareDate": "2026-01-04T08:07:01Z"
  },
  "platformBreakdown": {
    "facebook": 35,
    "twitter": 28,
    "whatsapp": 45,
    "email": 30,
    "linkedin": 18
  },
  "methodBreakdown": {
    "link": 89,
    "social": 45,
    "email": 18,
    "embed": 4
  },
  "topSharedStories": [
    {
      "story_id": "uuid",
      "title": "My Story",
      "share_count": 45
    }
  ],
  "recentActivity": [...]
}
```

---

## Database Schema

### story_share_events

Tracks every share event for stories.

```sql
CREATE TABLE story_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Share details
  share_method TEXT NOT NULL,        -- 'link', 'email', 'social', 'embed', 'download'
  share_platform TEXT,               -- 'facebook', 'twitter', 'whatsapp', etc.
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Tracking data
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Geographic and cultural context
  geographic_region TEXT,
  cultural_context JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Multi-tenant
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_story_share_events_story_id` - Fast lookups by story
- `idx_story_share_events_storyteller_id` - Fast lookups by storyteller
- `idx_story_share_events_shared_at` - Time-based queries
- `idx_story_share_events_share_platform` - Platform analytics

### media_share_events

Tracks media asset shares and downloads.

```sql
CREATE TABLE media_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  share_method TEXT NOT NULL,
  share_platform TEXT,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  media_type TEXT,                   -- 'image', 'video', 'audio', 'document'
  download_count INTEGER DEFAULT 0,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);
```

### storyteller_share_analytics (VIEW)

Pre-calculated analytics view for efficient querying.

```sql
CREATE VIEW storyteller_share_analytics AS
SELECT
  s.storyteller_id,
  p.display_name AS storyteller_name,
  COUNT(DISTINCT sse.id) AS total_story_shares,
  COUNT(DISTINCT CASE WHEN sse.shared_at >= NOW() - INTERVAL '30 days' THEN sse.id END) AS shares_last_30_days,
  COUNT(DISTINCT CASE WHEN sse.shared_at >= NOW() - INTERVAL '7 days' THEN sse.id END) AS shares_last_7_days,

  -- Platform breakdown
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'facebook' THEN sse.id END) AS facebook_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'twitter' THEN sse.id END) AS twitter_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'whatsapp' THEN sse.id END) AS whatsapp_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'email' THEN sse.id END) AS email_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'linkedin' THEN sse.id END) AS linkedin_shares,

  -- Top stories
  (SELECT json_agg(...) FROM top_shared_stories_subquery) AS top_shared_stories,

  MAX(sse.shared_at) AS last_share_date
FROM stories s
LEFT JOIN story_share_events sse ON s.id = sse.story_id
LEFT JOIN profiles p ON s.storyteller_id = p.id
GROUP BY s.storyteller_id, p.display_name;
```

---

## Frontend Integration

### StoryCard Component

The `StoryCard` component includes integrated share functionality:

**Location:** `src/components/story/story-card.tsx`

**Usage:**
```tsx
import { StoryCard } from '@/components/story/story-card'

<StoryCard
  story={story}
  variant="default"  // or "compact"
  showActions={true}
  className="custom-class"
/>
```

**Share Button Handler:**

The share button automatically:
1. Calls the share API endpoint
2. Verifies permissions and consent
3. Shows cultural sensitivity warnings if needed
4. Tracks the share event
5. Uses native share dialog or clipboard fallback
6. Displays share count to user

```tsx
const handleShare = async (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  try {
    // Step 1: Call share API
    const response = await fetch(`/api/stories/${story.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'link',
        platform: navigator.share ? 'native_share' : 'copy_link'
      })
    })

    const data = await response.json()

    // Step 2: Handle high sensitivity warning
    if (data.requiresConfirmation) {
      const confirmed = window.confirm(
        `⚠️ Cultural Sensitivity Notice\n\n${data.warning}\n\nContinue?`
      )
      if (!confirmed) return

      // Re-submit with confirmation
      // ... (omitted for brevity)
    }

    // Step 3: Handle errors
    if (!response.ok || !data.success) {
      alert(data.error || 'Cannot share this story')
      return
    }

    // Step 4: Use native share or clipboard
    if (navigator.share) {
      await navigator.share({
        title: data.shareTitle,
        text: data.shareText,
        url: data.shareUrl
      })
    } else {
      await navigator.clipboard.writeText(data.shareUrl)
      alert(`Link copied! Shared ${data.shareCount} times.`)
    }
  } catch (error) {
    alert('Failed to share story. Please try again.')
  }
}
```

---

## Testing

### Test Story Sharing

```bash
# Test sharing a published story
curl -X POST http://localhost:3030/api/stories/615bcafa-04de-4a06-ae60-754596209b47/share \
  -H "Content-Type: application/json" \
  -d '{
    "method": "link",
    "platform": "twitter"
  }'

# Expected response:
{
  "success": true,
  "shareUrl": "http://localhost:3030/stories/615bcafa-...",
  "shareTitle": "Story Title",
  "shareText": "Check out this story: Story Title",
  "shareCount": 1,
  "culturalSensitivityLevel": "standard",
  "message": "Story shared successfully"
}
```

### Verify Share Event

```sql
-- Check share was tracked
SELECT
  id,
  story_id,
  share_method,
  share_platform,
  shared_at
FROM story_share_events
ORDER BY shared_at DESC
LIMIT 1;

-- Check share count was incremented
SELECT id, title, shares_count
FROM stories
WHERE id = '615bcafa-04de-4a06-ae60-754596209b47';
```

### Test Cultural Safety Checks

```bash
# Test unpublished story (should fail)
curl -X POST http://localhost:3030/api/stories/[draft-story-id]/share \
  -H "Content-Type: application/json" \
  -d '{"method": "link"}'

# Expected: 403 with "NOT_PUBLISHED" error

# Test story without consent (should fail)
curl -X POST http://localhost:3030/api/stories/[no-consent-id]/share \
  -H "Content-Type: application/json" \
  -d '{"method": "link"}'

# Expected: 403 with "NO_CONSENT" error

# Test high sensitivity story (should warn)
curl -X POST http://localhost:3030/api/stories/[high-sensitivity-id]/share \
  -H "Content-Type: application/json" \
  -d '{"method": "link"}'

# Expected: 200 with "requiresConfirmation: true"
```

### Test Share Analytics

```bash
# Get share analytics for storyteller
curl http://localhost:3030/api/storytellers/[storyteller-id]/share-analytics?period=30

# Expected: Full analytics breakdown with platform stats, top stories, etc.
```

---

## Analytics

### Metrics Tracked

**Per Story:**
- Total shares count (`shares_count` column)
- Shares by platform (Facebook, Twitter, WhatsApp, Email, LinkedIn)
- Shares by method (link, social, email, embed, download)
- Share velocity (shares per day)
- Most recent share date

**Per Storyteller:**
- Total story shares across all stories
- Shares in last 30 days
- Shares in last 7 days
- Platform breakdown
- Method breakdown
- Top 5 most shared stories
- Recent share activity timeline

**Share Event Data:**
- Timestamp
- Platform/method
- IP address (for security)
- User agent (for analytics)
- Referrer (for attribution)
- Geographic region (optional)
- Cultural context (JSONB for flexibility)

### Analytics Views

Storytellers can access their share analytics through:

1. **Dashboard Widget** - Summary of recent shares
2. **Analytics Page** - Detailed breakdown by platform and story
3. **Story Details** - Individual story share counts and history
4. **API Endpoint** - Programmatic access for integrations

---

## Security & Privacy

### Data Protection

- IP addresses are stored for security auditing only
- User agents help detect bot/automated sharing
- Share events can be purged after retention period
- Storytellers can only see their own share analytics (RLS enforced)

### Row Level Security (RLS)

```sql
-- Storytellers can view their own share events
CREATE POLICY "Storytellers can view their share events"
  ON story_share_events
  FOR SELECT
  USING (storyteller_id = auth.uid());

-- Service role can insert share events
CREATE POLICY "Service role can insert share events"
  ON story_share_events
  FOR INSERT
  WITH CHECK (true);
```

---

## Error Codes

| Code | HTTP Status | Meaning | Action |
|------|-------------|---------|--------|
| `NOT_PUBLISHED` | 403 | Story is not published | Publish story first |
| `NO_CONSENT` | 403 | Missing explicit consent | Get consent from storyteller |
| `PRIVACY_RESTRICTED` | 403 | Privacy settings prevent sharing | Change privacy to public |
| `HIGH_SENSITIVITY_WARNING` | 200 | Cultural sensitivity confirmation needed | Confirm with storyteller/elders |
| `RESTRICTED_USAGE` | 403 | Media usage rights restricted | Review media permissions |

---

## Future Enhancements

### Planned Features

- [ ] Social media preview cards (Open Graph tags)
- [ ] Embed widget with customizable themes
- [ ] Share tracking with UTM parameters
- [ ] Email share templates with cultural branding
- [ ] Share limits/throttling for abuse prevention
- [ ] Share expiration dates for time-sensitive content
- [ ] Community share leaderboards (opt-in)
- [ ] Share attribution tracking (who shares to whom)

---

## Support

For questions or issues with the sharing system:

1. Check this documentation
2. Review error codes and responses
3. Test with the provided curl examples
4. Check database for share events
5. Contact platform administrator

**Last Updated:** January 4, 2026
**Implemented By:** Claude Code AI Assistant
**Status:** ✅ Production Ready
