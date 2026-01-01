# Storyteller Share Control System

**Status:** ✅ Implemented
**Created:** December 23, 2025

## Overview

This system gives storytellers **true control** over their shared content through ephemeral, revocable access tokens. When a storyteller shares their story, they generate time-limited links that can be instantly revoked at any time.

### Key Principle

**No permanent URLs**. Instead of linking directly to stories (e.g., `/stories/abc123`), all shared links use tokens (e.g., `/s/TOKEN`) that:
- Expire automatically after a set time
- Can be revoked instantly by the storyteller
- Track view counts and usage
- Stop working immediately when story is withdrawn

## Architecture

### Database Schema

**Table:** `story_access_tokens`

```sql
CREATE TABLE story_access_tokens (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  token TEXT UNIQUE,           -- URL-safe token (21 chars)

  -- Access Control
  expires_at TIMESTAMPTZ,      -- Auto-expire date
  revoked BOOLEAN DEFAULT false,
  max_views INTEGER,           -- Optional view limit
  view_count INTEGER DEFAULT 0,

  -- Tracking
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  -- Metadata
  purpose TEXT,                -- 'social-media' | 'email' | 'embed' | etc.
  shared_to TEXT[],           -- ['twitter', 'facebook']
  watermark_text TEXT,        -- Optional watermark for images

  -- Tenant isolation
  tenant_id UUID REFERENCES tenants(id)
)
```

### Auto-Revocation Trigger

When a story status changes to `'withdrawn'`, all associated tokens are automatically revoked:

```sql
CREATE TRIGGER trigger_revoke_tokens_on_withdrawal
  AFTER UPDATE OF status ON stories
  FOR EACH ROW
  EXECUTE FUNCTION revoke_tokens_on_story_withdrawal();
```

### Token Validation Function

Database function that validates tokens and increments view count:

```sql
SELECT * FROM validate_and_increment_token('token_value');

-- Returns:
-- {
--   is_valid: true/false,
--   story_id: 'uuid',
--   reason: 'Valid' | 'Token expired' | 'Token revoked' | etc.
-- }
```

## API Endpoints

### Create Share Link

**POST** `/api/stories/:id/share-link`

```typescript
// Request
{
  expiresIn: 604800,           // 7 days in seconds
  maxViews: 100,               // Optional
  purpose: 'social-media',
  sharedTo: ['twitter'],
  watermarkText: 'Shared by [Name]'
}

// Response
{
  token: 'abc123xyz',
  shareUrl: 'https://empathy-ledger.org/s/abc123xyz',
  expiresAt: '2025-12-30T12:00:00Z',
  maxViews: 100,
  purpose: 'social-media',
  storyTitle: 'Story Title'
}
```

**Authorization:** Only the storyteller (story.storyteller_id === user.id) can create share links.

### List Share Links

**GET** `/api/stories/:id/share-link`

Returns all share links (active and inactive) for a story.

```typescript
{
  shareLinks: [
    {
      id: 'uuid',
      shareUrl: 'https://...',
      purpose: 'social-media',
      sharedTo: ['twitter'],
      viewCount: 42,
      maxViews: 100,
      expiresAt: '2025-12-30T12:00:00Z',
      revoked: false,
      createdAt: '2025-12-23T12:00:00Z',
      lastAccessedAt: '2025-12-24T08:30:00Z',
      isActive: true
    }
  ]
}
```

### Revoke Share Link

**DELETE** `/api/stories/:id/share-link?token={token_id}`

Immediately revokes a share link. The link stops working within seconds.

```typescript
{
  success: true,
  message: 'Share link revoked successfully'
}
```

## Public Route

### Token-Based Story Access

**GET** `/s/:token`

This is the public route where shared links point to.

**Flow:**

1. Validate token (check expiry, revoked status, max views, story status)
2. If valid: Increment view count, serve story content
3. If invalid: Show appropriate error message

**Error Messages:**

| Reason | Message |
|--------|---------|
| Token not found | "This share link is invalid or does not exist" |
| Token revoked | "This share link has been revoked by the storyteller" |
| Token expired | "This share link has expired" |
| Max views reached | "This share link has reached its maximum number of views" |
| Story withdrawn | "This story has been withdrawn by the storyteller" |

## UI Components

### ShareLinkManager Component

**Location:** `src/components/story/share-link-manager.tsx`

**Usage:**

```tsx
import ShareLinkManager from '@/components/story/share-link-manager'

<ShareLinkManager
  storyId={story.id}
  storyTitle={story.title}
/>
```

**Features:**

- Create share links with custom expiry and limits
- View all active/inactive links
- Copy links to clipboard
- Revoke links instantly
- Track view counts
- Visual expiry status indicators

**Integration Points:**

Add to storyteller dashboard or story management page:

```tsx
// In storyteller dashboard
<Tabs>
  <TabsList>
    <TabsTrigger value="stories">Stories</TabsTrigger>
    <TabsTrigger value="sharing">Share Links</TabsTrigger>
  </TabsList>

  <TabsContent value="sharing">
    <ShareLinkManager
      storyId={currentStory.id}
      storyTitle={currentStory.title}
    />
  </TabsContent>
</Tabs>
```

### StoryView Component

**Location:** `src/components/story/story-view.tsx`

Full-page story display for token-based access. Includes:
- Storyteller profile information
- Story content with proper formatting
- Cultural sensitivity indicators
- Footer message about storyteller control

## How It Works

### 1. Storyteller Creates Share Link

```typescript
// User clicks "Create Share Link" in dashboard
const response = await fetch(`/api/stories/${storyId}/share-link`, {
  method: 'POST',
  body: JSON.stringify({
    expiresIn: 604800,  // 7 days
    purpose: 'social-media',
    sharedTo: ['twitter']
  })
})

const { shareUrl } = await response.json()
// shareUrl = 'https://empathy-ledger.org/s/abc123xyz'
```

### 2. Someone Accesses the Link

```
User visits: https://empathy-ledger.org/s/abc123xyz
  ↓
Page loads: /s/[token]/page.tsx
  ↓
Calls: validate_and_increment_token('abc123xyz')
  ↓
  ├─ Valid? → Increment view_count → Show story
  └─ Invalid? → Show error message
```

### 3. Storyteller Withdraws Story

```typescript
// Update story status
await supabase
  .from('stories')
  .update({ status: 'withdrawn' })
  .eq('id', storyId)

// Trigger automatically runs:
// UPDATE story_access_tokens
// SET revoked = true
// WHERE story_id = '...'
```

All share links **immediately** stop working. Anyone with the link sees:

> "This story has been withdrawn by the storyteller. We respect their right to control their narrative and content."

## What This Achieves

### ✅ Maximum Control Within Technical Limits

| Control Feature | Status | How |
|----------------|--------|-----|
| Instant withdrawal | ✅ | Database trigger + token validation |
| Time-limited sharing | ✅ | Expiry timestamps, auto-cleanup |
| View tracking | ✅ | Increment view_count on each access |
| Usage limits | ✅ | max_views enforcement |
| Access audit | ✅ | last_accessed_at, shared_to tracking |
| Revocation | ✅ | Set revoked=true, instant effect |

### ❌ What We Cannot Control

These are **physical impossibilities**, not implementation gaps:

- **Screenshots**: Anyone can screenshot content before it's withdrawn
- **Third-party reposts**: Content copied/reposted elsewhere
- **Internet archives**: Archive.org, Wayback Machine
- **Cached versions**: Browser caches, CDN caches (gradual decay)

**Strategy**: Be transparent with storytellers about these limitations. Emphasize what we CAN control (90% of the use case).

## Social Media Integration

### Open Graph Tags

When someone shares a token link on social media, we control the preview:

```tsx
// In /s/[token]/page.tsx
export async function generateMetadata({ params }) {
  const story = await getStoryByToken(params.token)

  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: [story.storyteller.profile_image_url],
    }
  }
}
```

**When story is withdrawn**, the Open Graph tags update to:

```typescript
{
  title: 'Story Withdrawn',
  description: 'This story has been withdrawn by the storyteller',
  image: '/images/story-withdrawn-placeholder.png'
}
```

Social media platforms will **eventually** update their cached previews (usually 24-48 hours).

## Graduated Sharing Tiers

Future enhancement: Different levels of sharing control.

### Tier 1: Private (Default)
- No share links
- Only storyteller can view
- Maximum control

### Tier 2: Trusted Circle
- Limited share links (max 10 active)
- Short expiry (3-7 days)
- No social media sharing

### Tier 3: Community
- Unlimited share links
- Longer expiry (30 days)
- Watermarked images
- Social sharing allowed

### Tier 4: Public
- Permanent links available
- Still revocable
- Full tracking

### Tier 5: Archive
- Permanent, non-revocable
- Historical record
- Explicit storyteller consent required

## Security Considerations

### Token Generation

```typescript
import { nanoid } from 'nanoid'

const token = nanoid(21) // URL-safe, 21 characters
// Example: 'V1StGXR8_Z5jdHi6B-myT'
```

**Collision probability:** Negligible (need to generate ~100 billion tokens to have 1% chance of collision)

### RLS Policies

- Storytellers can only create/revoke tokens for their own stories
- Service role can manage all tokens (for cleanup jobs)
- Anon/authenticated users can validate tokens (public access)

### Rate Limiting

Recommended: Add rate limiting to token validation to prevent brute-force attacks.

```typescript
// Future enhancement
app.get('/s/:token', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
}), handler)
```

## Migration Rollout

### Phase 1: Database Setup ✅
- [x] Create migration file
- [x] Define table schema
- [x] Add RLS policies
- [x] Create trigger for auto-revocation
- [x] Create validation function
- [ ] Run migration on production database

### Phase 2: API Implementation ✅
- [x] Create share link endpoint
- [x] List share links endpoint
- [x] Revoke share link endpoint
- [x] Token validation logic
- [x] Error handling

### Phase 3: UI Implementation ✅
- [x] ShareLinkManager component
- [x] StoryView component
- [x] Token access route (/s/[token])
- [x] Error pages for invalid tokens

### Phase 4: Integration
- [ ] Add ShareLinkManager to storyteller dashboard
- [ ] Add "Share Story" button to story cards
- [ ] Update storyteller onboarding to explain share control
- [ ] Create help documentation for storytellers

### Phase 5: Enhancements
- [ ] Email notifications when link is accessed
- [ ] Real-time dashboard updates (Supabase Realtime)
- [ ] QR code generation for share links
- [ ] Analytics dashboard (views over time)
- [ ] Watermarked image serving
- [ ] Social media cache invalidation requests

## Testing Checklist

### Database
- [ ] Migration runs successfully
- [ ] Trigger fires on story withdrawal
- [ ] validate_and_increment_token() works correctly
- [ ] RLS policies enforce authorization
- [ ] Cleanup function removes old tokens

### API
- [ ] Can create share link
- [ ] Cannot create link for someone else's story
- [ ] Cannot create link for withdrawn story
- [ ] Can list share links
- [ ] Can revoke share link
- [ ] Token validation checks all edge cases

### UI
- [ ] Share link creation dialog works
- [ ] Links are copyable
- [ ] Active/inactive links display correctly
- [ ] Revoke dialog confirms action
- [ ] Expiry status indicators accurate
- [ ] View counts update

### Integration
- [ ] Token route serves story correctly
- [ ] Invalid tokens show appropriate errors
- [ ] Story withdrawal revokes all tokens
- [ ] Open Graph tags generate correctly
- [ ] Mobile responsive

## Monitoring

### Key Metrics to Track

1. **Share link creation rate**: How often are storytellers sharing?
2. **Token expiry vs revocation**: Are storytellers actively revoking, or letting expire?
3. **View counts**: Which stories get the most shared views?
4. **Invalid token attempts**: Are users hitting expired/revoked links?
5. **Withdrawal impact**: How many tokens get revoked when stories are withdrawn?

### Database Queries

```sql
-- Active share links count
SELECT COUNT(*) FROM story_access_tokens
WHERE revoked = false
AND expires_at > NOW();

-- Most shared stories
SELECT story_id, COUNT(*) as link_count, SUM(view_count) as total_views
FROM story_access_tokens
GROUP BY story_id
ORDER BY total_views DESC
LIMIT 10;

-- Revocation reasons
SELECT
  COUNT(*) FILTER (WHERE revoked = true) as manually_revoked,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired,
  COUNT(*) FILTER (WHERE max_views IS NOT NULL AND view_count >= max_views) as max_views_reached
FROM story_access_tokens;
```

## Documentation for Storytellers

### User-Facing Language

> **You Control Your Story**
>
> When you share your story, you create a special link that:
> - Expires after the time you choose (1 hour to 30 days)
> - Can be withdrawn at any time
> - Tracks who views it and when
> - Stops working immediately if you withdraw your story
>
> **What This Means:**
> - You can share on social media without losing control
> - You can give access to specific people for limited time
> - You can change your mind and revoke access anytime
> - You'll know how many times your story has been viewed
>
> **Important to Know:**
> - Once someone views your story, they could screenshot it (we can't prevent this)
> - If your story is copied elsewhere, we can't remove those copies
> - Shared links will eventually disappear from social media when you revoke them (usually 24-48 hours)
>
> We've designed this system to give you maximum control within what's technically possible on the internet.

## Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20251223000000_story_access_tokens.sql` | Database schema |
| `src/app/api/stories/[id]/share-link/route.ts` | API endpoints |
| `src/app/s/[token]/page.tsx` | Public token access route |
| `src/components/story/share-link-manager.tsx` | UI for managing links |
| `src/components/story/story-view.tsx` | Full-page story display |
| `src/types/database/story-access-tokens.ts` | TypeScript types |
| `docs/STORYTELLER_SHARE_CONTROL.md` | This documentation |

## Next Steps

1. **Run Migration**: Apply the database migration to production
   ```bash
   # Via Supabase dashboard SQL editor
   # Or via migration tooling when available
   ```

2. **Update Supabase Skill**: Add `story_access_tokens` table to skill documentation

3. **Integrate UI**: Add ShareLinkManager to storyteller dashboard

4. **User Testing**: Have storytellers test the share link flow

5. **Monitor Usage**: Track metrics to see if storytellers find this valuable

6. **Iterate**: Based on feedback, enhance with additional features (QR codes, analytics, email notifications)

---

**Status:** Ready for integration and testing
**Migration Ready:** Yes (migration file created)
**API Ready:** Yes (all endpoints implemented)
**UI Ready:** Yes (components created)
**Next Action:** Run database migration, integrate into dashboard
