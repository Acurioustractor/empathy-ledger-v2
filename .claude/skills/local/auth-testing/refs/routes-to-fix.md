# Routes Requiring Auth Fixes

## Priority 1: Critical (Week 1)

### Admin Routes Missing `requireAdminAuth()`

| Route | File | Fix |
|-------|------|-----|
| `/api/admin/organisations/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/organizations/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/profiles/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/articles/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/reviews/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/stats/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/moderation/*` | Multiple | Add `requireAdminAuth()` |
| `/api/admin/projects/*` | Multiple | Add `requireAdminAuth()` |

### Organisation Routes (Auth Commented Out)

| Route | File | Issue |
|-------|------|-------|
| `/api/organisations/[id]/dashboard` | `route.ts` | Auth is commented out |
| `/api/organisations/[id]/roles` | `route.ts` | Auth is commented out |
| `/api/organisations/[id]/members/*` | Multiple | No auth, service client |
| `/api/organisations/[id]/invitations` | `route.ts` | No auth, service client |

## Priority 2: High (Week 2)

### Storyteller Routes Missing `canAccessStoryteller()`

| Route | File | Current | Fix |
|-------|------|---------|-----|
| `/api/storytellers/[id]/stats` | `route.ts` | Session client only | Add auth check |
| `/api/storytellers/[id]/stories` | `route.ts` | Session client only | Add auth check |
| `/api/storytellers/[id]/analytics` | `route.ts` | Service client | Add auth + ownership |
| `/api/storytellers/[id]/transcripts` | `route.ts` | Service client | Add auth + ownership |
| `/api/storytellers/[id]/media` | `route.ts` | Session client | Add auth check |
| `/api/storytellers/[id]/galleries` | `route.ts` | Session client | Add auth check |
| `/api/storytellers/[id]/videos` | `route.ts` | Service client | Add auth + ownership |
| `/api/storytellers/[id]/impact-metrics` | `route.ts` | None | Add auth + ownership |
| `/api/storytellers/[id]/trigger-analysis` | `route.ts` | Service client | Add auth + ownership |
| `/api/storytellers/[id]/share-analytics` | `route.ts` | Service client | Add auth + ownership |

## Priority 3: Medium (Week 3)

### Project Routes

| Route | Fix Required |
|-------|--------------|
| `/api/projects/[id]/analysis` | Add project access check |
| `/api/projects/[id]/context/*` | Add project access check |
| `/api/projects/[id]/storytellers` | Add project access check |
| `/api/projects/[id]/galleries` | Add project access check |

### Stories Routes

| Route | Fix Required |
|-------|--------------|
| `/api/stories/[id]/edit` | Add ownership check |
| `/api/stories/[id]/publish` | Add ownership check |
| `/api/stories/mine` | Add auth check |
| `/api/stories/drafts` | Add auth check |

## Priority 4: Lower (Week 4)

### User Settings Routes

| Route | Fix Required |
|-------|--------------|
| `/api/user/privacy-settings` | Add auth check |
| `/api/user/alma-settings` | Add auth check |
| `/api/user/email-preferences` | Add auth check |

### Media Routes

| Route | Fix Required |
|-------|--------------|
| `/api/media/upload` | Add auth check |
| `/api/media/library` | Add auth check |

## Intentionally Public (No Fix Needed)

| Route | Purpose |
|-------|---------|
| `/api/public/featured-stories` | Homepage content |
| `/api/public/recent-stories` | Homepage content |
| `/api/public/stats` | Platform stats |
| `/api/public/storytellers/featured` | Featured storytellers |
| `/api/stories/browse` | Public browsing |
| `/api/search` | Public search |

## Quick Fix Template

For most routes, add this at the start of the handler:

```typescript
import { getAuthenticatedUser, canAccessStoryteller, isSuperAdmin } from '@/lib/auth/api-auth'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest, { params }) {
  // 1. Check authentication
  const { user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Please sign in' },
      { status: 401 }
    )
  }

  // 2. Check authorization (for storyteller routes)
  const { id: storytellerId } = await params
  const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: reason || 'Forbidden' },
      { status: 403 }
    )
  }

  // 3. Use appropriate client
  const supabase = isSuperAdmin(user.email)
    ? getServiceClient()
    : await createSupabaseServerClient()

  // ... rest of handler
}
```

For admin routes:

```typescript
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }
  const { user } = authResult

  // ... rest of handler
}
```
