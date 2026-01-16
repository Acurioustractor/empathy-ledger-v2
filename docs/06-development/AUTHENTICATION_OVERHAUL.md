# Authentication System Overhaul

**Date:** January 17, 2026
**Status:** Complete
**Build:** Passing ✅

## Summary

Complete security overhaul of all API routes to enforce proper authentication and authorization. Previously, many routes either had no auth checks or used module-level service clients that bypassed Row Level Security (RLS).

## Key Changes

### 1. Authentication Patterns Established

| Route Type | Auth Pattern | Helper Used |
|------------|--------------|-------------|
| Admin routes | `requireAdminAuth(request)` | `@/lib/middleware/admin-auth` |
| Super admin routes | `requireSuperAdminAuth(request)` | `@/lib/middleware/admin-auth` |
| Organisation routes | `requireOrganizationMember()` / `requireOrganizationAdmin()` | `@/lib/middleware/organization-auth` |
| Storyteller routes | `getAuthenticatedUser()` + `canAccessStoryteller()` | `@/lib/auth/api-auth` |
| Project routes | Basic `supabase.auth.getUser()` check | Direct Supabase call |

### 2. Routes Fixed

#### Admin Routes (~60 routes)
All routes under `/api/admin/*` now require `requireAdminAuth()` or `requireSuperAdminAuth()`:
- `/api/admin/audit-logs` - Super admin only
- `/api/admin/quick-add` - Super admin only
- `/api/admin/scheduled-posts` - Super admin only
- `/api/admin/social-connections` - Super admin only
- `/api/admin/stats/platform` - Super admin only
- `/api/admin/stories/*` - Super admin only
- All other admin routes - Admin auth required

#### Organisation Routes (~20 routes)
Routes under `/api/organisations/*`:
- Read operations: `requireOrganizationMember()`
- Write operations: `requireOrganizationAdmin()`

#### Project Routes (~15 routes)
Routes under `/api/projects/*`:
- `/api/projects/[id]/analysis/clear-cache` - Admin only
- `/api/projects/[id]/transcripts` - Auth required
- `/api/projects/[id]/storytellers` - Auth required (all CRUD)
- `/api/projects/[id]/organisations` - Auth required (all CRUD)
- `/api/projects/[id]/galleries` - Auth required
- `/api/projects/[id]/context/*` - Admin/Project Manager only
- `/api/projects/[id]/impact-analysis` - Auth required

#### Storyteller Routes (~20 routes)
Routes under `/api/storytellers/*`:
- `/api/storytellers/[id]/dashboard` - Own profile or admin
- `/api/storytellers/[id]/analytics` - Own profile or admin
- `/api/storytellers/[id]/videos` - Own profile or admin
- `/api/storytellers/[id]/trigger-analysis` - Own profile or admin
- `/api/storytellers/[id]/recommendations` - Own profile or admin
- `/api/storytellers/[id]/impact-metrics` - Own profile or admin
- `/api/storytellers/[id]/share-analytics` - Own profile or admin
- `/api/storytellers/[id]/skills-extraction` - Own profile or admin
- `/api/storytellers/[id]/transcript-analysis` - Own profile or admin
- `/api/storytellers/[id]/unified-analysis` - Own profile or admin
- `/api/storytellers/[id]/profile-with-impact` - Own profile or admin
- `/api/storytellers/[id]/summary` - Own profile or admin
- `/api/storytellers/[id]/stats` - Own profile or admin

### 3. Security Issues Fixed

#### Module-Level Service Clients (Critical)
**Before:** Service clients created at module level bypassed RLS without any auth check
```typescript
// BROKEN - created at build time, no auth
const supabase = createClient(url, serviceKey)

export async function GET() {
  // No auth check - anyone can access!
  const { data } = await supabase.from('profiles').select('*')
}
```

**After:** Auth check first, then service client
```typescript
export async function GET() {
  // Auth check FIRST
  const { user, error } = await getAuthenticatedUser()
  if (error || !user) return unauthorized()

  // THEN create service client
  const supabase = createServiceRoleClient()
}
```

#### Dev Bypass Removal
Removed development bypass code that disabled auth:
```typescript
// REMOVED - was allowing unauthenticated access in dev
if (process.env.NODE_ENV === 'development') {
  // Skip auth check
}
```

#### Next.js 15 Params Pattern
Updated all routes to use the new async params pattern:
```typescript
// Old (broken in Next.js 15)
{ params }: { params: { id: string } }
const id = params.id

// New (correct)
{ params }: { params: Promise<{ id: string }> }
const { id } = await params
```

### 4. Auth Helpers

#### `@/lib/auth/api-auth.ts`
```typescript
// Get authenticated user from session
export async function getAuthenticatedUser()

// Check if user can access a storyteller's data
export async function canAccessStoryteller(userId, userEmail, storytellerId)

// Check if user is super admin
export function isSuperAdmin(email)
```

#### `@/lib/middleware/admin-auth.ts`
```typescript
// Require any admin role
export async function requireAdminAuth(request)

// Require super admin specifically
export async function requireSuperAdminAuth(request)
```

## Testing

### Super Admin Test Account
- **Email:** benjamin@act.place
- **Role:** Super Admin
- **Access:** All routes, all organisations, all storytellers

### Test Scenarios

1. **Unauthenticated Access**
   - All API routes should return 401

2. **Wrong User Access**
   - Accessing another user's storyteller dashboard should return 403

3. **Own Dashboard Access**
   - User accessing their own dashboard should work

4. **Admin Access**
   - Super admin (benjamin@act.place) should access any dashboard

### Test Commands
```bash
# Build to verify no TypeScript errors
npm run build

# Run the dev server
npm run dev

# Test unauthenticated access (should fail)
curl http://localhost:3000/api/storytellers/any-id/dashboard
# Expected: 401 Unauthorized

# Test authenticated access via browser
# 1. Sign in as benjamin@act.place
# 2. Navigate to any storyteller dashboard
# 3. Should load successfully
```

## Files Modified

### New Files
- `src/lib/auth/api-auth.ts` - Auth helpers for API routes
- `src/lib/supabase/server.ts` - Session-aware server client

### Modified Files (Summary)
- ~60 admin routes
- ~20 organisation routes
- ~15 project routes
- ~20 storyteller routes
- Total: ~115 route files updated

## Rollback

If issues arise, the changes can be reverted by:
1. Removing auth checks from individual routes
2. However, this would re-expose security vulnerabilities

The auth checks are essential for production security.

## Related Documentation

- [API Auth Middleware](./api-auth-middleware.md)
- [Supabase RLS Policies](../04-database/rls-policies.md)
- [Admin Configuration](./admin-config.md)
