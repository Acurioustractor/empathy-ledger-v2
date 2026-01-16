# Auth Testing Skill

Test and verify API authentication across all routes.

## Quick Commands

### Test Unauthenticated Access
```bash
# Test any route without auth - should return 401
curl -s "https://empathy-ledger-v2.vercel.app/api/storytellers/test-id/dashboard" | jq .

# Expected response:
# {"success":false,"error":"Unauthorized - Please sign in","version":"v2"}
```

### Test Local Development
```bash
# Start dev server first
npm run dev

# Test unauthenticated
curl -s "http://localhost:3000/api/storytellers/test-id/dashboard" | jq .
```

### Test Routes in Bulk
```bash
# Run the auth audit script
npm run test:auth-audit
```

## Route Categories

### Protected Routes (require auth)
All routes under:
- `/api/storytellers/[id]/*` - User's own data
- `/api/admin/*` - Admin-only
- `/api/organisations/[id]/*` - Org members only
- `/api/projects/[id]/*` - Project members only
- `/api/user/*` - Current user's settings

### Public Routes (intentionally open)
- `/api/public/*` - Homepage content
- `/api/stories/browse` - Public story browsing
- `/api/search` - Public search

## Auth Patterns

### Pattern 1: User Self-Access
```typescript
import { getAuthenticatedUser, canAccessStoryteller, isSuperAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest, { params }) {
  const { user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Please sign in' },
      { status: 401 }
    )
  }

  const { id: storytellerId } = await params
  const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: reason || 'Forbidden' },
      { status: 403 }
    )
  }

  // Use service client for admins, session client for self
  const supabase = isSuperAdmin(user.email)
    ? getServiceClient()
    : await createSupabaseServerClient()

  // ... fetch data
}
```

### Pattern 2: Admin-Only Routes
```typescript
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult // Returns 401 or 403
  }

  const { user } = authResult
  // ... admin logic
}
```

### Pattern 3: Organisation Access
```typescript
import { getAuthenticatedUser } from '@/lib/auth/api-auth'
import { canAccessOrganisation } from '@/lib/auth/org-auth'

export async function GET(request: NextRequest, { params }) {
  const { user, error } = await getAuthenticatedUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: orgId } = await params
  const { allowed } = await canAccessOrganisation(user.id, orgId)
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ... org logic
}
```

## Available Auth Functions

### From `/lib/auth/api-auth.ts`
```typescript
// Check if request has valid session
getAuthenticatedUser(): Promise<{ user: User | null, error: string | null }>

// Check if email is super admin
isSuperAdmin(email: string | null): boolean

// Check if user can access storyteller data
canAccessStoryteller(userId, userEmail, storytellerId): Promise<{ allowed: boolean, reason?: string }>

// Check admin status (super or org admin)
checkAdminStatus(userId, email): Promise<boolean>
```

### From `/lib/middleware/admin-auth.ts`
```typescript
// Require admin role (checks tenant_roles)
requireAdminAuth(request): Promise<{ user } | NextResponse>

// Require super admin only
requireSuperAdminAuth(request): Promise<{ user } | NextResponse>
```

## Test Checklist

When adding auth to a route, verify:

1. [ ] **401 for no auth** - Request without session returns 401
2. [ ] **403 for wrong user** - User A can't access User B's data
3. [ ] **200 for correct user** - User can access their own data
4. [ ] **200 for super admin** - Super admin can access any data
5. [ ] **Correct client used** - Service client only for admins

## Audit Status

See full audit report: `.claude/cache/agents/scout/latest-output.md`

### Summary
- **Total Routes:** 304
- **Protected:** ~15 (5%)
- **Missing Auth:** ~289 (95%)

### Priority Fixes
1. `/api/admin/*` routes - Add `requireAdminAuth()`
2. `/api/storytellers/[id]/*` - Add `canAccessStoryteller()`
3. `/api/organisations/[id]/*` - Add org membership check
4. `/api/projects/[id]/*` - Add project access check

## Running Tests

```bash
# Test all auth routes
npm run test:auth

# Test specific category
npm run test:auth -- --grep "storytellers"

# Generate auth coverage report
npm run test:auth:coverage
```
