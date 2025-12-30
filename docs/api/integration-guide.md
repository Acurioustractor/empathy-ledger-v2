# Campaign API - Integration Guide

Complete guide for integrating the Campaign API into your application.

---

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [React Integration](#react-integration)
3. [Server-Side Integration](#server-side-integration)
4. [State Management](#state-management)
5. [Real-Time Updates](#real-time-updates)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

---

## Authentication Setup

### Browser Context (Client Components)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { campaignApi } from '@/types/api/campaigns'
import { useEffect, useState } from 'react'

export function CampaignManager() {
  const supabase = createClient()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthenticated(!!session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!authenticated) {
    return <div>Please log in to manage campaigns</div>
  }

  // API calls work automatically with active session
  return <CampaignDashboard />
}
```

### Server Context (API Routes, Server Components)

```typescript
import { createClient } from '@/lib/supabase/client-ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Proceed with authenticated request
  // API calls use server-side Supabase client
}
```

### Authorization Checks

```typescript
// Get user's profile to check role
const { data: profile } = await supabase
  .from('profiles')
  .select('role, is_community_representative')
  .eq('id', user.id)
  .single()

// Check if user can create campaigns
const canCreate =
  profile.role === 'admin' ||
  profile.role === 'project_leader' ||
  profile.is_community_representative

if (!canCreate) {
  return { success: false, error: 'Insufficient permissions' }
}
```

---

## React Integration

### Custom Hook: useCampaign

```typescript
'use client'

import { useState, useEffect } from 'react'
import { campaignApi } from '@/types/api/campaigns'
import type { Campaign, CampaignDetails } from '@/types/api/campaigns'

type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

export function useCampaign(campaignId: string, detailed = false) {
  const [state, setState] = useState<LoadingState<Campaign | CampaignDetails>>({
    status: 'idle'
  })

  useEffect(() => {
    async function load() {
      setState({ status: 'loading' })

      try {
        const response = await campaignApi.get(campaignId, detailed)

        if (response.success) {
          setState({ status: 'success', data: response.data })
        } else {
          setState({ status: 'error', error: response.error || 'Unknown error' })
        }
      } catch (error) {
        setState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Network error'
        })
      }
    }

    load()
  }, [campaignId, detailed])

  return state
}

// Usage
function CampaignPage({ id }: { id: string }) {
  const campaign = useCampaign(id, true)

  if (campaign.status === 'loading') return <div>Loading...</div>
  if (campaign.status === 'error') return <div>Error: {campaign.error}</div>
  if (campaign.status === 'idle') return null

  return <div>{campaign.data.campaign.name}</div>
}
```

### Custom Hook: useCampaignList

```typescript
export function useCampaignList(params?: CampaignListParams) {
  const [state, setState] = useState<LoadingState<Campaign[]>>({
    status: 'idle'
  })

  const reload = useCallback(async () => {
    setState({ status: 'loading' })

    try {
      const response = await campaignApi.list(params)

      if (response.success) {
        setState({ status: 'success', data: response.data })
      } else {
        setState({ status: 'error', error: response.error || 'Unknown error' })
      }
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Network error'
      })
    }
  }, [params])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...state, reload }
}

// Usage
function CampaignList() {
  const campaigns = useCampaignList({ status: 'active' })

  if (campaigns.status === 'success') {
    return (
      <div>
        <button onClick={campaigns.reload}>Refresh</button>
        {campaigns.data.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    )
  }

  return null
}
```

### Custom Hook: useCampaignAnalytics

```typescript
export function useCampaignAnalytics(campaignId: string, refreshInterval?: number) {
  const [state, setState] = useState<LoadingState<CampaignAnalyticsResponse>>({
    status: 'idle'
  })

  const load = useCallback(async () => {
    setState(prev => prev.status === 'idle' ? { status: 'loading' } : prev)

    try {
      const response = await campaignApi.getAnalytics(campaignId)

      if (response.success) {
        setState({ status: 'success', data: response.data })
      } else {
        setState({ status: 'error', error: response.error || 'Unknown error' })
      }
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Network error'
      })
    }
  }, [campaignId])

  useEffect(() => {
    load()

    // Auto-refresh if interval specified
    if (refreshInterval) {
      const interval = setInterval(load, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [load, refreshInterval])

  return { ...state, reload: load }
}

// Usage: Auto-refresh every 30 seconds
function AnalyticsDashboard({ campaignId }: { campaignId: string }) {
  const analytics = useCampaignAnalytics(campaignId, 30000)

  if (analytics.status === 'success') {
    return (
      <div>
        <h2>Progress: {analytics.data.progress.completion_percentage}%</h2>
        <button onClick={analytics.reload}>Refresh Now</button>
      </div>
    )
  }

  return null
}
```

---

## Server-Side Integration

### Server Action

```typescript
'use server'

import { campaignApi } from '@/types/api/campaigns'
import { createClient } from '@/lib/supabase/client-ssr'
import { revalidatePath } from 'next/cache'

export async function createCampaignAction(formData: FormData) {
  const supabase = createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Extract form data
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const campaignType = formData.get('campaign_type') as any

  // Create campaign
  const response = await campaignApi.create({
    name,
    description,
    campaign_type: campaignType,
    storyteller_target: 50,
    story_target: 30,
    is_public: true
  })

  if (response.success) {
    // Revalidate campaigns page
    revalidatePath('/admin/campaigns')
    return { success: true, data: response.data }
  }

  return response
}

// Usage in component
'use client'

export function CreateCampaignForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const result = await createCampaignAction(formData)

    if (result.success) {
      toast.success('Campaign created!')
      router.push(`/campaigns/${result.data.slug}`)
    } else {
      toast.error(result.error)
    }

    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="description" />
      <select name="campaign_type">
        <option value="tour_stop">Tour Stop</option>
        <option value="community_outreach">Community Outreach</option>
      </select>
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  )
}
```

### API Route

```typescript
// app/api/admin/campaigns/[id]/feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client-ssr'
import { campaignApi } from '@/types/api/campaigns'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // Verify admin auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin only' },
      { status: 403 }
    )
  }

  // Feature campaign
  const response = await campaignApi.update(params.id, {
    is_featured: true
  })

  return NextResponse.json(response)
}
```

---

## State Management

### React Context

```typescript
'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { campaignApi } from '@/types/api/campaigns'
import type { Campaign } from '@/types/api/campaigns'

interface CampaignContextType {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  createCampaign: (data: CreateCampaignRequest) => Promise<Campaign | null>
  updateCampaign: (id: string, data: UpdateCampaignRequest) => Promise<void>
}

const CampaignContext = createContext<CampaignContextType | null>(null)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await campaignApi.list({ limit: 100 })

      if (response.success) {
        setCampaigns(response.data)
      } else {
        setError(response.error || 'Failed to load campaigns')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCampaign = useCallback(async (data: CreateCampaignRequest) => {
    const response = await campaignApi.create(data)

    if (response.success) {
      setCampaigns(prev => [response.data, ...prev])
      return response.data
    } else {
      setError(response.error || 'Failed to create campaign')
      return null
    }
  }, [])

  const updateCampaign = useCallback(async (
    id: string,
    data: UpdateCampaignRequest
  ) => {
    const response = await campaignApi.update(id, data)

    if (response.success) {
      setCampaigns(prev =>
        prev.map(c => c.id === id ? response.data : c)
      )
    } else {
      setError(response.error || 'Failed to update campaign')
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        loading,
        error,
        reload,
        createCampaign,
        updateCampaign
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaigns() {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaigns must be used within CampaignProvider')
  }
  return context
}

// Usage
function App() {
  return (
    <CampaignProvider>
      <CampaignList />
      <CreateCampaignButton />
    </CampaignProvider>
  )
}

function CampaignList() {
  const { campaigns, loading } = useCampaigns()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {campaigns.map(campaign => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}
```

---

## Real-Time Updates

### Supabase Realtime Integration

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCampaignRealtime(campaignId: string) {
  const supabase = createClient()
  const [campaign, setCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    // Load initial data
    campaignApi.get(campaignId).then(response => {
      if (response.success) {
        setCampaign(response.data)
      }
    })

    // Subscribe to changes
    const channel = supabase
      .channel(`campaign:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${campaignId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCampaign(payload.new as Campaign)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId])

  return campaign
}
```

### Workflow Updates

```typescript
export function useWorkflowUpdates(campaignId: string) {
  const [workflows, setWorkflows] = useState<CampaignWorkflow[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Load workflows
    campaignApi.getParticipants(campaignId).then(response => {
      if (response.success) {
        setWorkflows(response.data)
      }
    })

    // Subscribe to workflow changes
    const channel = supabase
      .channel(`workflows:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_consent_workflows',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWorkflows(prev => [...prev, payload.new as CampaignWorkflow])
          } else if (payload.eventType === 'UPDATE') {
            setWorkflows(prev =>
              prev.map(w => w.id === payload.new.id ? payload.new as CampaignWorkflow : w)
            )
          } else if (payload.eventType === 'DELETE') {
            setWorkflows(prev => prev.filter(w => w.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId])

  return workflows
}
```

---

## Error Handling

### Centralized Error Handler

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<ApiResponse<T>>,
  context?: string
): Promise<T> {
  try {
    const response = await fn()

    if (!response.success) {
      throw new APIError(
        response.error || 'Unknown error',
        undefined,
        undefined
      )
    }

    return response.data
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`${context} failed:`, error.message)
      throw error
    }

    console.error(`${context} network error:`, error)
    throw new APIError('Network error')
  }
}

// Usage
async function loadCampaign(id: string) {
  try {
    const campaign = await withErrorHandling(
      () => campaignApi.get(id),
      'Load campaign'
    )

    return campaign
  } catch (error) {
    if (error instanceof APIError) {
      toast.error(error.message)
    }
    return null
  }
}
```

---

## Testing

### Unit Tests

```typescript
import { describe, test, expect, vi } from 'vitest'
import { campaignApi } from '@/types/api/campaigns'

// Mock fetch
global.fetch = vi.fn()

describe('Campaign API', () => {
  test('creates campaign successfully', async () => {
    const mockCampaign = {
      id: 'test-uuid',
      name: 'Test Campaign',
      slug: 'test-campaign'
    }

    ;(fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockCampaign })
    })

    const response = await campaignApi.create({
      name: 'Test Campaign',
      campaign_type: 'tour_stop'
    })

    expect(response.success).toBe(true)
    expect(response.data.name).toBe('Test Campaign')
  })

  test('handles validation errors', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: 'Campaign name is required'
      })
    })

    const response = await campaignApi.create({} as any)

    expect(response.success).toBe(false)
    expect(response.error).toContain('required')
  })
})
```

### Integration Tests

```typescript
import { test, expect } from '@playwright/test'

test('create and manage campaign', async ({ page }) => {
  // Navigate to campaigns
  await page.goto('/admin/campaigns')

  // Create campaign
  await page.click('text=Create Campaign')
  await page.fill('[name="name"]', 'E2E Test Campaign')
  await page.selectOption('[name="campaign_type"]', 'tour_stop')
  await page.click('button:has-text("Create")')

  // Verify redirect
  await expect(page).toHaveURL(/\/campaigns\/e2e-test-campaign/)

  // Check campaign details
  await expect(page.locator('h1')).toContainText('E2E Test Campaign')
})
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const campaign = await campaignApi.get(id)
console.log(campaign.data.name) // May crash if error

// ✅ Good
const response = await campaignApi.get(id)
if (response.success) {
  console.log(response.data.name)
} else {
  console.error(response.error)
}
```

### 2. Use TypeScript Types

```typescript
import type {
  Campaign,
  CreateCampaignRequest,
  CampaignAnalyticsResponse
} from '@/types/api/campaigns'

// Type-safe request
const request: CreateCampaignRequest = {
  name: 'Test',
  campaign_type: 'tour_stop' // Autocomplete + validation
}
```

### 3. Implement Loading States

```typescript
// ✅ Good: Show loading feedback
function CampaignList() {
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    campaignApi.list().then(response => {
      if (response.success) setCampaigns(response.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Skeleton />
  return <List campaigns={campaigns} />
}
```

### 4. Cache Expensive Calls

```typescript
import { unstable_cache } from 'next/cache'

const getCampaignAnalytics = unstable_cache(
  async (id: string) => {
    const response = await campaignApi.getAnalytics(id)
    return response.data
  },
  ['campaign-analytics'],
  { revalidate: 300 } // 5 minutes
)
```

### 5. Use Optimistic Updates

```typescript
async function updateCampaignStatus(id: string, status: string) {
  // Update UI immediately
  setCampaigns(prev =>
    prev.map(c => c.id === id ? { ...c, status } : c)
  )

  // Send API request
  const response = await campaignApi.update(id, { status })

  if (!response.success) {
    // Revert on error
    reload()
    toast.error('Failed to update')
  }
}
```

---

## Next Steps

- [API Reference](README.md) - Full endpoint documentation
- [Usage Examples](examples.md) - Real-world patterns
- [Quick Start](quick-start.md) - 5-minute guide

---

## Support

- [GitHub Issues](https://github.com/yourusername/empathy-ledger-v2/issues)
- [Documentation Index](../INDEX.md)
