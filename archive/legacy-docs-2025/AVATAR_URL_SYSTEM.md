# Avatar URL Resolution System

## Overview

The Empathy Ledger platform uses a **three-tier avatar resolution system** to ensure storyteller profile images display consistently across all components and pages.

## Database Schema

Profile avatars can be stored in three different database fields:

### `profiles` Table Fields

| Field | Type | Priority | Description |
|-------|------|----------|-------------|
| `profile_image_url` | TEXT | 1 (Highest) | Direct URL to profile image (legacy field) |
| `avatar_url` | TEXT | 2 | Direct URL to avatar image |
| `avatar_media_id` | UUID | 3 (Fallback) | Foreign key to `media_assets` table for CDN-hosted images |

### Resolution Priority Chain

```
profile_image_url → avatar_url → media_assets[avatar_media_id].cdn_url → null
```

## Architecture

### Centralized Utility: `avatar-resolver.ts`

Location: [`src/lib/utils/avatar-resolver.ts`](../src/lib/utils/avatar-resolver.ts)

This utility provides consistent avatar resolution across the entire application.

#### Key Functions

**1. `resolveAvatarUrl(profile, avatarMediaMap?)`**
- Resolves a single profile's avatar URL
- Uses pre-built media map for batch efficiency
- Returns `{ avatar_url: string | null, source: string }`

**2. `batchResolveAvatarMedia(profiles, supabase?)`**
- Batch fetches media assets for multiple profiles
- More efficient than individual lookups
- Returns `Record<mediaId, cdnUrl>` map

**3. `resolveProfileAvatars(profiles, supabase?)`**
- High-level batch processing function
- Resolves avatars for an array of profiles
- Returns profiles with `avatar_url` field populated

**4. `resolveSingleAvatar(profile, supabase?)`**
- Convenience wrapper for single profile resolution
- Handles database lookup automatically
- Use sparingly - prefer batch resolution

**5. `getAvatarInitials(name)`**
- Generates initials for avatar fallback display
- Returns uppercase 1-2 character string

## Implementation Patterns

### Pattern 1: Page Server Components (Recommended)

Use `resolveProfileAvatars` for batch resolution in server components:

```typescript
import { resolveProfileAvatars } from '@/lib/utils/avatar-resolver'

async function getStorytellers() {
  const supabase = createSupabaseServerClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')

  // Batch resolve all avatars
  const profilesWithAvatars = await resolveProfileAvatars(profiles || [], supabase)

  return profilesWithAvatars.map(profile => ({
    id: profile.id,
    avatar_url: profile.avatar_url, // Resolved URL
    // ... other fields
  }))
}
```

### Pattern 2: API Routes with Manual Batch Resolution

Use `batchResolveAvatarMedia` + `resolveAvatarUrl` for custom API responses:

```typescript
import { batchResolveAvatarMedia, resolveAvatarUrl } from '@/lib/utils/avatar-resolver'

export async function GET() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, avatar_url, profile_image_url, avatar_media_id')

  // Batch resolve media assets
  const avatarMediaMap = await batchResolveAvatarMedia(profiles, supabase)

  // Apply resolution to each profile
  return profiles.map(profile => {
    const resolved = resolveAvatarUrl(profile, avatarMediaMap)
    return {
      id: profile.id,
      avatarUrl: resolved.avatar_url, // camelCase for API
      // ... other fields
    }
  })
}
```

### Pattern 3: Single Profile Resolution

Use `resolveSingleAvatar` for individual profile lookups:

```typescript
import { resolveSingleAvatar } from '@/lib/utils/avatar-resolver'

const resolvedAvatarUrl = await resolveSingleAvatar(profile, supabase)
```

## Component Integration

### Storyteller Card Components

All storyteller card components expect **both** top-level and nested avatar URLs:

```typescript
interface StorytellerCardProps {
  storyteller: {
    avatar_url?: string        // Top-level (preferred)
    profile?: {
      avatar_url?: string      // Nested (fallback)
    }
  }
}
```

Component implementation ([`storyteller-card.tsx:141-143`](../src/components/storyteller/storyteller-card.tsx#L141-L143)):

```tsx
{storyteller.avatar_url || storyteller.profile?.avatar_url ? (
  <img
    src={storyteller.avatar_url || storyteller.profile?.avatar_url}
    alt={`Portrait of ${storyteller.display_name}`}
  />
) : (
  // Fallback to initials badge
)}
```

### Defensive Fallback Pattern

All components implement graceful degradation:

1. **Try top-level**: `storyteller.avatar_url`
2. **Try nested**: `storyteller.profile?.avatar_url`
3. **Show initials**: Gradient badge with `getAvatarInitials(name)`

## Updated API Routes

The following API routes now use the centralized avatar resolution utility:

### ✅ Updated Routes

| Route | File | Method Used |
|-------|------|-------------|
| `/storytellers` (page) | `src/app/storytellers/page.tsx` | `resolveProfileAvatars` |
| `/api/organisations/[id]/storytellers` | `src/app/api/organisations/[id]/storytellers/route.ts` | `batchResolveAvatarMedia` + `resolveAvatarUrl` |
| `/api/projects/[id]/storytellers` | `src/app/api/projects/[id]/storytellers/route.ts` | `batchResolveAvatarMedia` + `resolveAvatarUrl` |
| `/api/storytellers/[id]` | `src/app/api/storytellers/[id]/route.ts` | `resolveSingleAvatar` |

### Response Format Standards

**API Routes (camelCase):**
```json
{
  "id": "uuid",
  "avatarUrl": "https://cdn.example.com/image.jpg",
  "profileImageUrl": "https://cdn.example.com/image.jpg"  // backward compat
}
```

**Server Components (snake_case):**
```typescript
{
  id: "uuid",
  avatar_url: "https://cdn.example.com/image.jpg",
  profile: {
    avatar_url: "https://cdn.example.com/image.jpg"  // nested fallback
  }
}
```

## Performance Considerations

### Batch Resolution is Critical

**❌ Bad - N+1 Query Problem:**
```typescript
// Don't do this - causes one query per profile
for (const profile of profiles) {
  const avatarUrl = await resolveSingleAvatar(profile, supabase)
}
```

**✅ Good - Single Batch Query:**
```typescript
// Do this - single query for all media assets
const avatarUrlMap = await batchResolveAvatarMedia(profiles, supabase)
const resolved = profiles.map(p => resolveAvatarUrl(p, avatarUrlMap))
```

### Database Query Best Practices

Always select all avatar fields in queries:

```typescript
import { AVATAR_FIELDS_SELECT } from '@/lib/utils/avatar-resolver'

const { data } = await supabase
  .from('profiles')
  .select(`
    id,
    display_name,
    ${AVATAR_FIELDS_SELECT}
  `)
```

This ensures:
- `avatar_url` is available
- `profile_image_url` is available
- `avatar_media_id` can be resolved if needed

## Troubleshooting

### Images Not Showing?

**Checklist:**

1. ✅ **Query includes avatar fields**
   - Check your `.select()` includes `avatar_url`, `profile_image_url`, `avatar_media_id`

2. ✅ **Avatar resolution is applied**
   - Server components should use `resolveProfileAvatars()`
   - API routes should use `batchResolveAvatarMedia()` + `resolveAvatarUrl()`

3. ✅ **Component receives correct data**
   - Top-level: `storyteller.avatar_url` should be populated
   - Nested fallback: `storyteller.profile.avatar_url` should match

4. ✅ **Image URLs are valid**
   - Check browser network tab for 404/403 errors
   - Verify CDN URLs are accessible

5. ✅ **Component implements fallback**
   - Should show initials badge if no avatar URL

### Console Debugging

Add logging to verify resolution:

```typescript
const profilesWithAvatars = await resolveProfileAvatars(profiles, supabase)

console.log('Avatar resolution:', profilesWithAvatars.map(p => ({
  id: p.id.substring(0, 8),
  name: p.display_name,
  avatar_url: p.avatar_url,
  has_avatar: !!p.avatar_url
})))
```

## Migration Guide

### Updating Existing Code

**Before:**
```typescript
const { data: profiles } = await supabase.from('profiles').select('*')

const storytellers = profiles.map(p => ({
  id: p.id,
  avatar_url: p.avatar_url,  // May be null even if avatar_media_id exists
}))
```

**After:**
```typescript
import { resolveProfileAvatars } from '@/lib/utils/avatar-resolver'

const { data: profiles } = await supabase.from('profiles').select('*')

// Resolve all avatars in batch
const profilesWithAvatars = await resolveProfileAvatars(profiles, supabase)

const storytellers = profilesWithAvatars.map(p => ({
  id: p.id,
  avatar_url: p.avatar_url,  // Guaranteed to be resolved
}))
```

## Testing

### Manual Verification

1. Navigate to `/storytellers` directory page
2. Verify all cards show profile images or initials
3. Check browser console for avatar resolution logs
4. Open network tab and verify CDN URLs return 200 OK

### Automated Tests (TODO)

```typescript
describe('Avatar Resolution', () => {
  it('should resolve profile_image_url with highest priority', async () => {
    const profile = {
      id: 'test',
      profile_image_url: 'http://example.com/profile.jpg',
      avatar_url: 'http://example.com/avatar.jpg',
      avatar_media_id: 'media-123'
    }

    const resolved = resolveAvatarUrl(profile)
    expect(resolved.avatar_url).toBe('http://example.com/profile.jpg')
    expect(resolved.source).toBe('profile_image_url')
  })

  // ... more tests
})
```

## Future Improvements

### Planned Enhancements

1. **Type Safety**
   - Strict TypeScript interfaces for all avatar-related types
   - Compile-time checks for missing avatar fields

2. **Caching Layer**
   - In-memory cache for frequently accessed avatars
   - Redis cache for media_asset CDN URL lookups

3. **Image Optimization**
   - Automatic resizing based on component needs
   - WebP conversion for modern browsers
   - Lazy loading for off-screen avatars

4. **Error Tracking**
   - Log avatar resolution failures to monitoring service
   - Alert on high failure rates
   - Track broken CDN URLs

## Contact

For questions about the avatar resolution system:
- Check this documentation first
- Review [`src/lib/utils/avatar-resolver.ts`](../src/lib/utils/avatar-resolver.ts)
- Check component implementations in `src/components/storyteller/`

---

**Last Updated**: 2024-12-24
**Version**: 1.0
**Status**: ✅ Production Ready
