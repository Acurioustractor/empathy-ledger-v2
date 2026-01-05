# Multi-Tenant Best Practices
## How to Build Secure Multi-Tenant Applications

**Date:** October 26, 2025
**Status:** IMPLEMENTATION GUIDE

---

## The Problem We're Solving

**❌ BEFORE:** Dashboard showed "11 Stories in Review" but they were from OTHER organizations!

**✅ AFTER:** Dashboard shows only YOUR organization's data

---

## Core Principles

### 1. **Always Filter by Organization ID**

```typescript
// ❌ BAD: Returns ALL organizations' data
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('status', 'review')

// ✅ GOOD: Returns only YOUR organization's data
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('organization_id', currentOrgId) // 🔒 CRITICAL
  .eq('status', 'review')
```

### 2. **Use Helper Functions**

```typescript
// ❌ BAD: Manual filtering (easy to forget)
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('organization_id', orgId)

// ✅ GOOD: Helper enforces filtering
const { data } = await getOrganizationStories(supabase, orgId)
```

### 3. **Get Organization Context First**

```typescript
// ✅ ALWAYS do this at the start of API routes
const context = await getCurrentOrganizationContext(userId, orgId)

if (!context) {
  return { error: 'Not authorized' }
}

// Now use context.organizationId for all queries
const stories = await getOrganizationStories(supabase, context.organizationId)
```

---

## Complete Example: Fixing an API Route

### BEFORE (Broken)

```typescript
// ❌ This returns ALL organizations' stories!
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  // BUG: No organization filter!
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'review')

  return NextResponse.json({ stories })
}
```

### AFTER (Fixed)

```typescript
// ✅ Only returns current organization's stories
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getCurrentOrganizationContext } from '@/lib/multi-tenant/context'
import { getOrganizationStories } from '@/lib/multi-tenant/queries'

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  // Step 1: Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 2: Get organization context
  const context = await getCurrentOrganizationContext(user.id)
  if (!context) {
    return NextResponse.json({ error: 'No organization access' }, { status: 403 })
  }

  // Step 3: Use helper function (automatically filters)
  const { data: stories } = await getOrganizationStories(
    supabase,
    context.organizationId, // 🔒 CRITICAL
    { status: ['review'] }
  )

  return NextResponse.json({
    stories,
    organizationName: context.organizationName
  })
}
```

---

## Multi-Tenant Helper Functions

### 1. Organization Context

```typescript
import { getCurrentOrganizationContext } from '@/lib/multi-tenant/context'

// Get user's organization context
const context = await getCurrentOrganizationContext(userId)

// Returns:
{
  organizationId: 'uuid',
  organizationSlug: 'oonchiumpa',
  organizationName: 'Oonchiumpa',
  userRole: 'admin',
  isSuperAdmin: false
}

// Check if user can access specific organization
const context = await getCurrentOrganizationContext(userId, requestedOrgId)
// Returns null if user doesn't have access

// Get all organizations user has access to
const { organizations, isSuperAdmin } = await getUserOrganizations(userId)
```

### 2. Query Helpers

```typescript
import {
  getOrganizationStories,
  getOrganizationTranscripts,
  getOrganizationBlogPosts,
  getOrganizationMembers,
  getOrganizationDashboardStats
} from '@/lib/multi-tenant/queries'

// Get stories (automatically filtered)
const { data: stories } = await getOrganizationStories(supabase, orgId, {
  status: ['review', 'published'],
  limit: 10,
  includeRelations: true
})

// Get dashboard stats (all counts filtered by org)
const stats = await getOrganizationDashboardStats(supabase, orgId)
// Returns:
{
  stories: { total: 12, draft: 3, review: 2, published: 7 },
  transcripts: { total: 5 },
  blogPosts: { total: 4, published: 4 },
  members: { total: 3 },
  projects: { total: 2 }
}

// Create story (automatically sets organization_id)
const { data: newStory } = await createOrganizationStory(
  supabase,
  orgId,
  { title: 'My Story', content: '...' }
)

// Update story (validates organization ownership)
const { data: updated } = await updateOrganizationStory(
  supabase,
  orgId,
  storyId,
  { title: 'Updated Title' }
)
```

---

## API Route Patterns

### Pattern 1: Organization-Scoped Route

```typescript
// /api/organizations/[orgId]/stories/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user has access to this organization
  const context = await getCurrentOrganizationContext(user.id, params.orgId)

  if (!context) {
    return NextResponse.json(
      { error: 'Not a member of this organization' },
      { status: 403 }
    )
  }

  // Get organization's stories
  const { data: stories } = await getOrganizationStories(
    supabase,
    params.orgId // From URL params
  )

  return NextResponse.json({ stories })
}
```

### Pattern 2: User's Default Organization

```typescript
// /api/my/stories/route.ts

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's default/first organization
  const context = await getCurrentOrganizationContext(user.id)

  if (!context) {
    return NextResponse.json({ error: 'No organization' }, { status: 404 })
  }

  // Get stories from user's organization
  const { data: stories } = await getOrganizationStories(
    supabase,
    context.organizationId
  )

  return NextResponse.json({ stories })
}
```

### Pattern 3: Super Admin Access

```typescript
// /api/admin/organizations/[orgId]/stories/route.ts

import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Verify super admin
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  // Super admin uses service role client (bypasses RLS)
  const supabase = createServiceRoleClient()

  // Super admin can access ANY organization
  const { data: stories } = await getOrganizationStories(
    supabase,
    params.orgId // Any organization
  )

  return NextResponse.json({ stories })
}
```

---

## Frontend Component Patterns

### Pattern 1: Organization Dashboard

```typescript
// app/organisations/[id]/dashboard/page.tsx

export default async function OrganizationDashboard({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify access
  const context = await getCurrentOrganizationContext(user.id, params.id)
  if (!context) redirect('/unauthorized')

  // Get organization stats
  const stats = await getOrganizationDashboardStats(supabase, params.id)

  return (
    <div>
      <h1>{context.organizationName} Dashboard</h1>

      <div className="stats">
        <StatCard
          title="Stories"
          total={stats.stories.total}
          breakdown={[
            { label: 'In Review', count: stats.stories.review },
            { label: 'Published', count: stats.stories.published }
          ]}
        />

        <StatCard
          title="Transcripts"
          total={stats.transcripts.total}
        />

        <StatCard
          title="Blog Posts"
          total={stats.blogPosts.total}
        />
      </div>
    </div>
  )
}
```

### Pattern 2: Organization Selector

```typescript
// components/OrganizationSelector.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function OrganizationSelector({ currentOrgId }: { currentOrgId: string }) {
  const router = useRouter()
  const [organizations, setOrganizations] = useState([])

  useEffect(() => {
    // Fetch user's organizations
    fetch('/api/my/organizations')
      .then(res => res.json())
      .then(data => setOrganizations(data.organizations))
  }, [])

  const handleChange = (orgId: string) => {
    router.push(`/organisations/${orgId}/dashboard`)
  }

  return (
    <select value={currentOrgId} onChange={(e) => handleChange(e.target.value)}>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  )
}
```

---

## Common Mistakes to Avoid

### Mistake 1: Forgetting Organization Filter

```typescript
// ❌ WRONG
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('status', 'published')

// Returns ALL organizations' published stories!
```

### Mistake 2: Using Wrong Organization ID

```typescript
// ❌ WRONG
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('organization_id', user.id) // user.id is NOT organization.id!

// ✅ CORRECT
const context = await getCurrentOrganizationContext(user.id)
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('organization_id', context.organizationId)
```

### Mistake 3: Not Validating Organization Access

```typescript
// ❌ WRONG: User provides org ID, we trust it
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Directly use params.orgId without checking access!
  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('organization_id', params.orgId)

  return NextResponse.json({ data })
}

// ✅ CORRECT: Verify user has access first
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify user can access this organization
  const context = await getCurrentOrganizationContext(user.id, params.orgId)
  if (!context) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Now safe to query
  const { data } = await getOrganizationStories(supabase, params.orgId)
  return NextResponse.json({ data })
}
```

---

## Testing Your Implementation

### Test 1: Data Isolation

```bash
# Create test script
npx tsx scripts/test-data-isolation.ts

# Should verify:
# - User 1 (Org A) can only see Org A data
# - User 2 (Org B) can only see Org B data
# - Super admin can see all data
```

### Test 2: Dashboard Accuracy

```typescript
// Test that dashboard shows correct counts
const stats = await getOrganizationDashboardStats(supabase, oonchiumpaOrgId)

console.log('Oonchiumpa Stats:', stats)
// Should show only Oonchiumpa's data

const stats2 = await getOrganizationDashboardStats(supabase, curiousTractorOrgId)

console.log('A Curious Tractor Stats:', stats2)
// Should show only A Curious Tractor's data
// Should be completely different numbers!
```

---

## Checklist: Implementing Multi-Tenant

Before deploying, verify:

- [ ] All queries include `organization_id` filter
- [ ] All API routes get organization context
- [ ] All API routes validate user access
- [ ] Helper functions are used instead of raw queries
- [ ] Super admin uses service role client
- [ ] Frontend shows organization selector
- [ ] Dashboard displays correct organization name
- [ ] Stats show only current organization's data
- [ ] Tested with multiple test organizations
- [ ] Verified complete data isolation

---

## Summary

**The Golden Rule:**
> Every query that touches user content MUST filter by `organization_id`

**The Three Steps:**
1. Get organization context
2. Validate user access
3. Use helper functions that enforce filtering

**Remember:**
- Organizations cannot see each other's data
- Super admin can see all (for support)
- Always log which organization's data is accessed
- Test with multiple organizations to verify isolation

---

*This document defines the standard for all multi-tenant queries in Empathy Ledger. All developers must follow these patterns.*
