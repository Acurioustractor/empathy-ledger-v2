# Super Admin Frontend Refactor Plan
## Aligning with Multi-Tenant Best Practices

**Date:** October 26, 2025
**Status:** REFACTOR PLAN

---

## Current Issues Found

### ❌ Problems in Current Super Admin:

1. **No Organization Context**
   - Stats APIs fetch ALL organizations' data without filtering
   - No way to view specific organization's data
   - No organization selector

2. **Direct API Calls Without Helpers**
   ```typescript
   // CURRENT (Bad):
   const response = await fetch('/api/admin/stats/stories')
   // Returns ALL stories from ALL organizations mixed together
   ```

3. **No Organization Scoping**
   - Stories page shows all stories
   - No way to filter by organization
   - No indication which organization story belongs to

4. **Missing Super Admin Features**
   - Can't switch between organizations
   - Can't edit specific organization's data
   - No audit trail visibility

---

## Refactored Architecture

### 1. Organization Selector Component

```typescript
// components/admin/OrganizationSelector.tsx

'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2 } from 'lucide-react'

export function OrganizationSelector({
  value,
  onChange
}: {
  value: string | 'all'
  onChange: (value: string) => void
}) {
  const [organizations, setOrganizations] = useState([])

  useEffect(() => {
    fetch('/api/admin/organizations')
      .then(res => res.json())
      .then(data => setOrganizations(data.organizations))
  }, [])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[300px]">
        <Building2 className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          All Organizations (Platform View)
        </SelectItem>
        {organizations.map(org => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### 2. Updated Admin Layout

```typescript
// app/admin/layout.tsx

'use client'

import { useState } from 'react'
import { OrganizationSelector } from '@/components/admin/OrganizationSelector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | 'all'>('all')

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Super Admin Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
        <Alert className="border-0 bg-transparent p-0">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Super Admin Mode:</strong> You have full access to all organizations.
            All actions are logged.
          </AlertDescription>
        </Alert>
      </div>

      {/* Header with Organization Selector */}
      <div className="bg-white border-b border-grey-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <OrganizationSelector
            value={selectedOrgId}
            onChange={setSelectedOrgId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Page Content with Context */}
        <div className="flex-1">
          <OrganizationContext.Provider value={{ selectedOrgId }}>
            {children}
          </OrganizationContext.Provider>
        </div>
      </div>
    </div>
  )
}
```

### 3. Refactored Admin Dashboard

```typescript
// app/admin/page.tsx

'use client'

import { useEffect, useState, useContext } from 'react'
import { OrganizationContext } from '@/lib/contexts/OrganizationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
  const { selectedOrgId } = useContext(OrganizationContext)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)

      if (selectedOrgId === 'all') {
        // Platform-wide stats
        const res = await fetch('/api/admin/stats/platform')
        const data = await res.json()
        setStats(data)
      } else {
        // Specific organization stats
        const res = await fetch(`/api/admin/organizations/${selectedOrgId}/stats`)
        const data = await res.json()
        setStats(data)
      }

      setLoading(false)
    }

    fetchStats()
  }, [selectedOrgId])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {selectedOrgId === 'all'
            ? 'Platform Overview'
            : `${stats.organizationName} Overview`}
        </h2>
        <p className="text-grey-600">
          {selectedOrgId === 'all'
            ? 'Aggregated data across all organizations'
            : 'Organization-specific data'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          title="Stories"
          value={stats.stories.total}
          breakdown={[
            { label: 'In Review', count: stats.stories.review },
            { label: 'Published', count: stats.stories.published }
          ]}
        />

        <StatsCard
          title="Transcripts"
          value={stats.transcripts.total}
        />

        <StatsCard
          title="Blog Posts"
          value={stats.blogPosts.total}
        />

        <StatsCard
          title="Members"
          value={stats.members.total}
        />
      </div>

      {/* Organization List (if viewing all) */}
      {selectedOrgId === 'all' && (
        <OrganizationList organizations={stats.organizations} />
      )}

      {/* Organization Details (if viewing specific) */}
      {selectedOrgId !== 'all' && (
        <OrganizationDetails organizationId={selectedOrgId} />
      )}
    </div>
  )
}
```

### 4. Refactored Stories Page

```typescript
// app/admin/stories/page.tsx

'use client'

import { useEffect, useState, useContext } from 'react'
import { OrganizationContext } from '@/lib/contexts/OrganizationContext'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

export default function AdminStoriesPage() {
  const { selectedOrgId } = useContext(OrganizationContext)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStories() {
      setLoading(true)

      const url = selectedOrgId === 'all'
        ? '/api/admin/stories' // All organizations
        : `/api/admin/organizations/${selectedOrgId}/stories` // Specific org

      const res = await fetch(url)
      const data = await res.json()
      setStories(data.stories)

      setLoading(false)
    }

    fetchStories()
  }, [selectedOrgId])

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title'
    },
    {
      header: 'Organization',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.organization.name}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row.original)}
        >
          Edit
        </Button>
      )
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stories</h2>
          <p className="text-grey-600">
            {selectedOrgId === 'all'
              ? `Viewing ${stories.length} stories across all organizations`
              : `Viewing ${stories.length} stories for selected organization`}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={stories}
        loading={loading}
      />
    </div>
  )
}
```

---

## API Updates Needed

### 1. Platform Stats API

```typescript
// app/api/admin/stats/platform/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/stats/platform
 * Returns platform-wide aggregated stats
 * Super admin only
 */
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  // Get all organizations
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug')

  // Aggregate stats across all organizations
  const [storiesResult, transcriptsResult, blogPostsResult] = await Promise.all([
    supabase
      .from('stories')
      .select('status', { count: 'exact' }),

    supabase
      .from('transcripts')
      .select('id', { count: 'exact' }),

    supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
  ])

  // Calculate totals
  const storiesByStatus = {
    total: storiesResult.count || 0,
    draft: 0,
    review: 0,
    published: 0
  }

  storiesResult.data?.forEach(story => {
    const status = story.status || 'draft'
    if (status === 'draft') storiesByStatus.draft++
    else if (status === 'review') storiesByStatus.review++
    else if (status === 'published') storiesByStatus.published++
  })

  return NextResponse.json({
    platform: {
      totalOrganizations: orgs?.length || 0,
      stories: storiesByStatus,
      transcripts: { total: transcriptsResult.count || 0 },
      blogPosts: { total: blogPostsResult.count || 0 }
    },
    organizations: orgs
  })
}
```

### 2. Organization-Specific Stats API

```typescript
// app/api/admin/organizations/[orgId]/stats/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'
import { getOrganizationDashboardStats } from '@/lib/multi-tenant/queries'

/**
 * GET /api/admin/organizations/[orgId]/stats
 * Returns stats for specific organization
 * Super admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  // Get organization info
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', params.orgId)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Get stats using helper function
  const stats = await getOrganizationDashboardStats(supabase, params.orgId)

  return NextResponse.json({
    organizationId: org.id,
    organizationName: org.name,
    organizationSlug: org.slug,
    ...stats
  })
}
```

### 3. Super Admin Stories List API

```typescript
// app/api/admin/stories/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/stories
 * Returns ALL stories across ALL organizations
 * Super admin only - for platform overview
 */
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()

  // Get all stories with organization info
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      *,
      organization:organization_id(id, name, slug),
      storyteller:storyteller_id(id, display_name, avatar_url),
      author:author_id(id, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ stories })
}
```

---

## Implementation Checklist

### Phase 1: Core Components
- [ ] Create OrganizationSelector component
- [ ] Create OrganizationContext
- [ ] Update admin layout with selector
- [ ] Add super admin warning banner

### Phase 2: Dashboard
- [ ] Refactor AdminDashboard to use context
- [ ] Create platform stats API
- [ ] Create organization-specific stats API
- [ ] Add organization list view
- [ ] Add organization detail view

### Phase 3: Stories Management
- [ ] Refactor stories page to use context
- [ ] Update stories API for super admin
- [ ] Add organization column to stories table
- [ ] Add edit functionality per organization

### Phase 4: Other Pages
- [ ] Update transcripts page
- [ ] Update blog posts page
- [ ] Update members page
- [ ] Update projects page

### Phase 5: Super Admin Features
- [ ] Add audit log viewer
- [ ] Add bulk operations
- [ ] Add organization management
- [ ] Add data export tools

---

## Key Improvements

### Before vs After

**BEFORE:**
```
❌ Shows mixed data from all organizations
❌ No way to filter by organization
❌ No context about which org data belongs to
❌ Can't edit specific organization's data
```

**AFTER:**
```
✅ Organization selector at top
✅ Clear indication of which org viewing
✅ Can switch between "All Organizations" and specific org
✅ Full edit access to each organization's data
✅ Super admin warning banner
✅ Audit trail visible
```

---

## Next Steps

1. Create OrganizationContext and Selector
2. Update admin layout
3. Refactor dashboard with stats APIs
4. Update stories page
5. Test with real data

