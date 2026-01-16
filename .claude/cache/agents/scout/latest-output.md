# API Authentication Audit Report
Generated: 2026-01-17

## Executive Summary

**Total API Routes:** 304 routes
**Routes with Authentication Checks:** ~15 routes (5%)
**Authentication Coverage:** **CRITICAL GAPS IDENTIFIED**

### Authentication Patterns Found

| Pattern | Usage | Files |
|---------|-------|-------|
| `getAuthenticatedUser()` | Session-based auth check | 1 route |
| `requireAdminAuth()` | Admin middleware | 14 routes |
| `canAccessStoryteller()` | Resource authorization | 1 route |
| Service client (no auth) | Direct DB access | ~280 routes |
| Session client (RLS) | Implicit RLS auth | ~10 routes |

### Critical Finding

**95% of API routes lack explicit authentication checks**, relying solely on:
- RLS policies (when using session client)
- Service client with no access control (majority)
- No validation of user identity

---

## Detailed Analysis by Route Category

### 1. Storytellers Routes (`/api/storytellers/*`)

#### ✅ PROTECTED (1 route)
| Route | Auth Method | Authorization |
|-------|-------------|---------------|
| `/api/storytellers/[id]/dashboard` | `getAuthenticatedUser()` | `canAccessStoryteller()` + `isSuperAdmin()` |

**Implementation Pattern:**
```typescript
// ✓ VERIFIED - Proper auth in dashboard route
const { user, error: authError } = await getAuthenticatedUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)
if (!allowed) {
  return NextResponse.json({ error: reason }, { status: 403 })
}

// Use service client for admins, session client for self-access
const supabase = isSuperAdmin(user.email) ? getServiceClient() : await createSupabaseServerClient()
```

#### ❌ MISSING AUTH (20+ routes)

| Route | Current Client | Risk Level | Should Require |
|-------|---------------|------------|----------------|
| `/api/storytellers/[id]/stats` | Session client | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/stories` | Session client | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/analytics` | Service client | **CRITICAL** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/transcripts` | Service client | **CRITICAL** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/media` | Session client | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/galleries` | Session client | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/videos` | Service client | **CRITICAL** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/impact-metrics` | None | **CRITICAL** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/recommendations` | None | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/share-analytics` | Service client | **CRITICAL** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/transcript-analysis` | None | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/unified-analysis` | Session client | **HIGH** | `canAccessStoryteller()` |
| `/api/storytellers/[id]/trigger-analysis` | Service client | **CRITICAL** | `canAccessStoryteller()` |
| `/api/storytellers/search` | Session client | **MEDIUM** | Public or authenticated |
| `/api/storytellers` (GET) | Service client | **HIGH** | `requireAdminAuth()` |
| `/api/storytellers/[id]` (GET) | Session client | **HIGH** | `canAccessStoryteller()` |

**Example Vulnerable Code:**
```typescript
// ✗ UNVERIFIED - No auth check in stats route
export async function GET(request: NextRequest, { params }) {
  const supabase = await createSupabaseServerClient()
  const { id: storytellerId } = await params
  
  // VULNERABILITY: No check if current user can access this storyteller
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('author_id', storytellerId)
  // ...
}
```

---

### 2. Admin Routes (`/api/admin/*`)

#### ✅ PROTECTED (14 routes)
| Route | Auth Method | Notes |
|-------|-------------|-------|
| `/api/admin/storytellers` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/storytellers/[id]/relationships` | Service client only | ⚠️ No explicit check |
| `/api/admin/storytellers/relationships` | Service client only | ⚠️ No explicit check |
| `/api/admin/content/stories` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/tenants` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/locations` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/users` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/users/[id]/status` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/users/[id]` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/galleries` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/analytics/overview` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/media` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/media/link-galleries` | `requireAdminAuth()` | ✓ Proper middleware |
| `/api/admin/organizations` | Service client only | ⚠️ No explicit check |

#### ❌ MISSING AUTH (60+ routes)

**All admin routes using service client without `requireAdminAuth()` middleware:**

| Route Pattern | Count | Risk Level |
|---------------|-------|------------|
| `/api/admin/organisations/*` | 4 | **CRITICAL** |
| `/api/admin/organizations/[orgId]/*` | 5 | **CRITICAL** |
| `/api/admin/projects/*` | 6 | **CRITICAL** |
| `/api/admin/articles/*` | 8 | **CRITICAL** |
| `/api/admin/reviews/*` | 5 | **CRITICAL** |
| `/api/admin/stats/*` | 5 | **CRITICAL** |
| `/api/admin/profiles/*` | 2 | **CRITICAL** |
| `/api/admin/media/*` | 10 | **CRITICAL** |
| `/api/admin/moderation/*` | 2 | **CRITICAL** |
| Other admin routes | 15+ | **CRITICAL** |

**Example Vulnerable Code:**
```typescript
// ✗ UNVERIFIED - No auth in admin organisations route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  // VULNERABILITY: Anyone can call this endpoint
  const { data: organisations } = await supabase
    .from('organizations')
    .select('*')
  // ...
}
```

---

### 3. Organisations Routes (`/api/organisations/*`)

#### ❌ ALL ROUTES MISSING AUTH (20+ routes)

| Route | Current Client | Risk Level | Should Require |
|-------|---------------|------------|----------------|
| `/api/organisations` | Session client | **HIGH** | Auth + org membership |
| `/api/organisations/[id]/dashboard` | Session client | **CRITICAL** | `canAccessOrganisation()` |
| `/api/organisations/[id]/members` | Service client | **CRITICAL** | `canAccessOrganisation()` |
| `/api/organisations/[id]/members/add-existing` | Service client | **CRITICAL** | `canManageMembers()` |
| `/api/organisations/[id]/projects` | Session client | **HIGH** | `canAccessOrganisation()` |
| `/api/organisations/[id]/storytellers` | Service client | **CRITICAL** | `canAccessOrganisation()` |
| `/api/organisations/[id]/storytellers/create` | Session client | **CRITICAL** | `canManageMembers()` |
| `/api/organisations/[id]/storytellers/[storytellerId]` | Session client | **CRITICAL** | `canManageMembers()` |
| `/api/organisations/[id]/transcripts` | Service client | **CRITICAL** | `canAccessOrganisation()` |
| `/api/organisations/[id]/galleries` | Service client | **HIGH** | `canAccessOrganisation()` |
| `/api/organisations/[id]/analytics` | Service client | **CRITICAL** | `canAccessOrganisation()` |
| `/api/organisations/[id]/stats` | Service client | **CRITICAL** | `canAccessOrganisation()` |
| `/api/organisations/[id]/invitations` | Service client | **CRITICAL** | `canManageMembers()` |
| `/api/organisations/[id]/roles` | Session client | **CRITICAL** | `requireOrganizationAdmin()` |

**Note:** The `roles` and `dashboard` routes have commented-out auth code:
```typescript
// ⚠️ Auth temporarily disabled in organisations routes
console.log('⚠️ TEMPORARILY BYPASSING AUTH FOR TESTING')
// const authResult = await requireAdminAuth(request)
// if (authResult instanceof NextResponse) { return authResult }
```

---

### 4. Projects Routes (`/api/projects/*`)

#### ❌ ALL ROUTES MISSING AUTH (15+ routes)

| Route | Current Client | Risk Level | Should Require |
|-------|---------------|------------|----------------|
| `/api/projects` | Session client | **HIGH** | Auth + project membership |
| `/api/projects/[id]/storytellers` | Session client | **HIGH** | `canAccessProject()` |
| `/api/projects/[id]/transcripts` | Session client | **HIGH** | `canAccessProject()` |
| `/api/projects/[id]/galleries` | Session client | **HIGH** | `canAccessProject()` |
| `/api/projects/[id]/analysis` | Service client | **CRITICAL** | `canAccessProject()` |
| `/api/projects/[id]/analysis/clear-cache` | Service client | **CRITICAL** | `requireAdminAuth()` |
| `/api/projects/[id]/context` | Session client | **HIGH** | `canAccessProject()` |
| `/api/projects/[id]/context/import` | Session client | **CRITICAL** | `canManageProject()` |
| `/api/projects/[id]/context/seed-interview` | Session client | **CRITICAL** | `canManageProject()` |
| `/api/projects/[id]/organisations` | Session client | **HIGH** | `canAccessProject()` |
| `/api/projects/[id]/updates` | Session client | **MEDIUM** | `canAccessProject()` |
| `/api/projects/[id]/impact-analysis` | Session client | **HIGH** | `canAccessProject()` |

---

### 5. Public Routes (`/api/public/*`)

#### ✅ INTENTIONALLY PUBLIC (4 routes)
| Route | Client | Purpose |
|-------|--------|---------|
| `/api/public/featured-stories` | Service client | Homepage featured content |
| `/api/public/recent-stories` | Service client | Homepage recent content |
| `/api/public/stats` | Service client | Platform statistics |
| `/api/public/storytellers/featured` | Service client | Featured storytellers |

**Implementation Pattern:**
```typescript
// ✓ VERIFIED - Intentionally public endpoint
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Public data only - filtered by is_public=true
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'published')
    .eq('is_public', true)
    .eq('is_featured', true)
  // ...
}
```

---

### 6. Other Critical Routes

#### Stories Routes (`/api/stories/*`)

| Route | Current Client | Risk Level | Auth Status |
|-------|---------------|------------|-------------|
| `/api/stories` | Service client | **HIGH** | ❌ Missing |
| `/api/stories/create` | Session client | **MEDIUM** | ⚠️ RLS only |
| `/api/stories/[id]` | Session client | **MEDIUM** | ⚠️ RLS only |
| `/api/stories/[id]/edit` | Session client | **HIGH** | ❌ Missing |
| `/api/stories/[id]/publish` | Session client | **CRITICAL** | ❌ Missing |
| `/api/stories/[id]/archive` | Session client | **HIGH** | ❌ Missing |
| `/api/stories/[id]/comments` | Session client | **MEDIUM** | ⚠️ RLS only |
| `/api/stories/browse` | Service client | **MEDIUM** | ⚠️ Public? |
| `/api/stories/search` | Service client | **MEDIUM** | ⚠️ Public? |
| `/api/stories/drafts` | Session client | **HIGH** | ❌ Missing |
| `/api/stories/mine` | Session client | **HIGH** | ❌ Missing |

#### Media Routes (`/api/media/*`)

| Route | Current Client | Risk Level | Auth Status |
|-------|---------------|------------|-------------|
| `/api/media/library` | Session client | **HIGH** | ❌ Missing |
| `/api/media/upload` | Session client | **CRITICAL** | ❌ Missing |
| `/api/media/[id]` | Session client | **MEDIUM** | ⚠️ RLS only |
| `/api/media/[id]/tags` | Session client | **MEDIUM** | ⚠️ RLS only |
| `/api/media/search` | Session client | **MEDIUM** | ⚠️ Public? |

#### User Routes (`/api/user/*`)

| Route | Current Client | Risk Level | Auth Status |
|-------|---------------|------------|-------------|
| `/api/user/privacy-settings` | Session client | **HIGH** | ❌ Missing |
| `/api/user/alma-settings` | Session client | **HIGH** | ❌ Missing |
| `/api/user/email-preferences` | Session client | **MEDIUM** | ❌ Missing |

---

## Authentication Utilities Analysis

### ✓ VERIFIED - Available Auth Functions

**File:** `/Users/benknight/Code/empathy-ledger-v2/src/lib/auth/api-auth.ts`

```typescript
// Session-based auth check
export async function getAuthenticatedUser(): Promise<AuthResult>

// Super admin check (email-based)
export function isSuperAdmin(email: string | null | undefined): boolean

// Admin status check (super admin or org admin)
export async function checkAdminStatus(userId: string, email: string | null | undefined): Promise<boolean>

// Storyteller access authorization
export async function canAccessStoryteller(
  userId: string,
  userEmail: string | null | undefined,
  storytellerId: string
): Promise<{ allowed: boolean; reason?: string }>
```

**File:** `/Users/benknight/Code/empathy-ledger-v2/src/lib/middleware/admin-auth.ts`

```typescript
// Admin middleware (checks tenant_roles)
export async function requireAdminAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse>

// Super admin middleware
export async function requireSuperAdminAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse>
```

### ❌ MISSING - Authorization Functions Needed

```typescript
// NOT IMPLEMENTED - Would check org membership/role
canAccessOrganisation(userId: string, orgId: string): Promise<{ allowed: boolean }>

// NOT IMPLEMENTED - Would check project access
canAccessProject(userId: string, projectId: string): Promise<{ allowed: boolean }>

// NOT IMPLEMENTED - Would check org admin role
requireOrganizationAdmin(userId: string, orgId: string): Promise<boolean>

// NOT IMPLEMENTED - Would check member management permission
canManageMembers(userId: string, orgId: string): Promise<boolean>

// NOT IMPLEMENTED - Would check project management permission
canManageProject(userId: string, projectId: string): Promise<boolean>
```

**Note:** There is a `/Users/benknight/Code/empathy-ledger-v2/src/lib/middleware/organization-role-middleware.ts` file that appears to define these functions, but routes are not using them.

---

## Security Implications

### Critical Vulnerabilities

#### 1. **Unauthorized Data Access**
**Routes using service client with no auth checks can expose all tenant data.**

Example attack:
```bash
# Any user can view any storyteller's analytics
curl https://app.empathyledger.com/api/storytellers/ANY-USER-ID/analytics

# Any user can view any organisation's members
curl https://app.empathyledger.com/api/organisations/ANY-ORG-ID/storytellers

# Any user can trigger AI analysis for any storyteller
curl -X POST https://app.empathyledger.com/api/storytellers/ANY-USER-ID/trigger-analysis
```

#### 2. **Unauthorized Modifications**
**POST/PUT/PATCH/DELETE routes with no auth can modify any resource.**

Example attack:
```bash
# Any user can add members to any organisation
curl -X POST https://app.empathyledger.com/api/organisations/ANY-ORG-ID/members \
  -d '{"email": "attacker@evil.com", "role": "admin"}'

# Any user can modify storyteller videos
curl -X PATCH https://app.empathyledger.com/api/storytellers/ANY-USER-ID/videos \
  -d '{"video_introduction_url": "https://malicious.com"}'
```

#### 3. **RLS Bypass via Service Client**
**Routes using service client completely bypass Row Level Security policies.**

80+ admin and resource routes use service client without checking if the requesting user has admin privileges.

#### 4. **Inconsistent Security Model**
**Some routes use auth, most don't, creating confusion and gaps.**

- `/api/storytellers/[id]/dashboard` - ✅ Has auth
- `/api/storytellers/[id]/analytics` - ❌ No auth
- `/api/storytellers/[id]/stats` - ❌ No auth

Users might assume all storyteller routes are protected like `dashboard`.

---

## Recommendations

### Immediate Actions (P0 - Critical)

1. **Add authentication to all admin routes**
   ```typescript
   // Pattern to implement in ALL /api/admin/* routes
   export async function GET/POST/PUT/DELETE(request: NextRequest) {
     const authResult = await requireAdminAuth(request)
     if (authResult instanceof NextResponse) {
       return authResult
     }
     const { user } = authResult
     // ... rest of handler
   }
   ```

2. **Add authorization to storyteller routes**
   ```typescript
   // Pattern to implement in /api/storytellers/[id]/* routes
   export async function GET(request: NextRequest, { params }) {
     const { user, error } = await getAuthenticatedUser()
     if (error || !user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }
     
     const { id: storytellerId } = await params
     const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)
     if (!allowed) {
       return NextResponse.json({ error: reason }, { status: 403 })
     }
     // ... rest of handler
   }
   ```

3. **Implement missing authorization functions**
   ```typescript
   // Implement in /src/lib/auth/api-auth.ts
   export async function canAccessOrganisation(userId, userEmail, orgId)
   export async function canAccessProject(userId, userEmail, projectId)
   export async function canManageMembers(userId, userEmail, orgId)
   export async function canManageProject(userId, userEmail, projectId)
   ```

### Short-term Actions (P1 - High Priority)

4. **Audit all routes using service client**
   - Identify which routes should be public vs protected
   - Replace service client with session client where appropriate
   - Add explicit auth checks before service client usage

5. **Document intentionally public routes**
   - Add comments explaining why routes are public
   - Ensure public routes filter by `is_public` flag
   - Consider rate limiting for public endpoints

6. **Standardize auth patterns**
   - Create auth middleware decorators
   - Apply consistently across all routes
   - Update existing routes to use standard patterns

### Long-term Actions (P2 - Medium Priority)

7. **Implement route-level auth tests**
   - Test each route with no auth
   - Test with wrong user auth
   - Test with correct user auth
   - Automated security testing in CI

8. **Add request context logging**
   - Log user ID for all authenticated requests
   - Track authorization decisions
   - Monitor for unauthorized access attempts

9. **Review RLS policies**
   - Ensure RLS policies match API-level auth
   - Test RLS with session client
   - Document RLS policy coverage

---

## Prioritized Fix List

### Week 1 - Critical Admin Routes

**Must fix immediately (potential org takeover):**

1. `/api/admin/organisations/*` - All routes
2. `/api/admin/organizations/*` - All routes
3. `/api/organisations/[id]/members/*` - Add/remove members
4. `/api/organisations/[id]/invitations` - Send invites
5. `/api/admin/users/*` - User management
6. `/api/admin/profiles/*` - Profile management

**Estimated effort:** 2-3 days

### Week 2 - Storyteller Routes

**High priority (privacy violation):**

1. `/api/storytellers/[id]/analytics` - Private analytics
2. `/api/storytellers/[id]/transcripts` - Private transcripts
3. `/api/storytellers/[id]/videos` - Video management
4. `/api/storytellers/[id]/trigger-analysis` - Unauthorized processing
5. `/api/storytellers/[id]/share-analytics` - Analytics exposure
6. All other `/api/storytellers/[id]/*` routes

**Estimated effort:** 3-4 days

### Week 3 - Organisation & Project Routes

**Medium-high priority (data exposure):**

1. `/api/organisations/[id]/dashboard` - Re-enable auth
2. `/api/organisations/[id]/storytellers` - Member list
3. `/api/organisations/[id]/transcripts` - Org transcripts
4. `/api/projects/[id]/*` - All project routes

**Estimated effort:** 3-4 days

### Week 4 - Stories & Media Routes

**Medium priority (content access control):**

1. `/api/stories/[id]/edit` - Unauthorized edits
2. `/api/stories/[id]/publish` - Unauthorized publishing
3. `/api/media/upload` - Upload access
4. `/api/user/*` - User settings

**Estimated effort:** 2-3 days

---

## Testing Strategy

### Authentication Tests
```typescript
// Test pattern for each route
describe('GET /api/storytellers/[id]/analytics', () => {
  it('returns 401 when not authenticated', async () => {
    const response = await fetch('/api/storytellers/123/analytics')
    expect(response.status).toBe(401)
  })

  it('returns 403 when accessing other user data', async () => {
    const response = await authenticatedFetch('/api/storytellers/456/analytics', user123)
    expect(response.status).toBe(403)
  })

  it('returns 200 when accessing own data', async () => {
    const response = await authenticatedFetch('/api/storytellers/123/analytics', user123)
    expect(response.status).toBe(200)
  })

  it('returns 200 when super admin accesses any user', async () => {
    const response = await authenticatedFetch('/api/storytellers/456/analytics', superAdmin)
    expect(response.status).toBe(200)
  })
})
```

### Authorization Tests
```typescript
// Test org/project access
describe('GET /api/organisations/[id]/members', () => {
  it('allows org admin to view members', async () => {
    const response = await authenticatedFetch('/api/organisations/org1/members', orgAdmin)
    expect(response.status).toBe(200)
  })

  it('denies non-member access', async () => {
    const response = await authenticatedFetch('/api/organisations/org1/members', nonMember)
    expect(response.status).toBe(403)
  })

  it('allows super admin access', async () => {
    const response = await authenticatedFetch('/api/organisations/org1/members', superAdmin)
    expect(response.status).toBe(200)
  })
})
```

---

## Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total API Routes** | 304 | 100% |
| **Routes with Explicit Auth** | 15 | 5% |
| **Routes Missing Auth** | 289 | 95% |
| **Public Routes (Intentional)** | 4 | 1.3% |
| **Admin Routes** | 80 | 26% |
| **Admin Routes Protected** | 14 | 17.5% |
| **Storyteller Routes** | 22 | 7% |
| **Storyteller Routes Protected** | 1 | 4.5% |
| **Organisation Routes** | 20 | 6.5% |
| **Organisation Routes Protected** | 0 | 0% |
| **Project Routes** | 15 | 5% |
| **Project Routes Protected** | 0 | 0% |

---

## References

### Key Files
- Authentication utilities: `/src/lib/auth/api-auth.ts`
- Admin middleware: `/src/lib/middleware/admin-auth.ts`
- Organization middleware: `/src/lib/middleware/organization-role-middleware.ts`
- Protected route example: `/src/app/api/storytellers/[id]/dashboard/route.ts`
- Public route example: `/src/app/api/public/featured-stories/route.ts`

### Auth Patterns Used
1. **getAuthenticatedUser + canAccessStoryteller** - Storyteller dashboard only
2. **requireAdminAuth** - 14 admin routes
3. **Service client (no auth)** - Majority of routes
4. **Session client (RLS only)** - Some routes
5. **Commented out auth** - Organisations routes

---

**Report completed at:** 2026-01-17
**Generated by:** Scout Agent (Sonnet 4.5)
