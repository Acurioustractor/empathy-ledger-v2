# Empathy Ledger v2 - Architecture Reference

A comprehensive guide to understanding the codebase structure, data relationships, and system processes.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Database Architecture](#database-architecture)
3. [Type Definitions](#type-definitions)
4. [Service Layer](#service-layer)
5. [API Routes](#api-routes)
6. [Data Flow Examples](#data-flow-examples)
7. [Multi-Tenant Architecture](#multi-tenant-architecture)
8. [Component Structure](#component-structure)

---

## Quick Reference

### Where to Find Things

| Looking For... | Location |
|----------------|----------|
| Database schema | `supabase/migrations/` |
| TypeScript types | `src/types/database/` |
| Business logic | `src/lib/services/` |
| API endpoints | `src/app/api/` |
| React components | `src/components/` |
| Supabase clients | `src/lib/supabase/` |
| Constants/enums | `src/lib/constants/` |
| Utilities | `src/lib/utils/` |

### Key Files to Read First

1. **`src/types/database/index.ts`** - All type exports
2. **`src/lib/supabase/client-ssr.ts`** - Server-side DB access
3. **`src/lib/services/consent.service.ts`** - Core consent pattern
4. **`src/app/api/stories/route.ts`** - API pattern example

---

## Database Architecture

### Core Tables & Relationships

```
tenants (Top-level container)
    ├── organisations (Community organizations)
    │   ├── organization_members (User memberships)
    │   ├── organization_roles (Custom roles)
    │   └── projects (Story collections)
    │       ├── project_participants
    │       └── stories
    │           ├── transcripts
    │           ├── media_assets
    │           ├── story_distributions
    │           ├── consent_proofs
    │           └── story_access_log
    └── profiles (User accounts)
        ├── profile_settings
        ├── profile_locations
        └── notifications
```

### Table Purposes

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `tenants` | Multi-tenant isolation | id, name, tier, data_region |
| `organisations` | Community groups | id, tenant_id, name, distribution_policy |
| `profiles` | User accounts | id, tenant_id, display_name, role |
| `projects` | Story collections | id, organisation_id, name, status |
| `stories` | Core content | id, project_id, storyteller_id, status, consent_status |
| `transcripts` | Story text/audio | id, story_id, content, analysis_status |
| `story_distributions` | Distribution records | id, story_id, channel, consent_snapshot, status |
| `consent_proofs` | GDPR consent evidence | id, story_id, scope, verification_status |
| `story_access_log` | Audit trail | id, story_id, action, actor_id, ip_address |

### Recent Migrations (Latest First)

| Migration | Purpose |
|-----------|---------|
| `20251220093000_multi_org_tenants.sql` | Multi-org tenant structure |
| `20251220090000_saas_org_tier_and_distribution_policy.sql` | SaaS tier system |
| `20251210030000_webhook_subscriptions.sql` | Webhook infrastructure |
| `20251210000000_partner_portal_system.sql` | Partner distribution |
| `20251209000000_cultural_safety_moderation_tables.sql` | Cultural safety |
| `20251207_story_ownership_distribution.sql` | Story ownership |

---

## Type Definitions

All types are in `src/types/database/` organized by domain:

### Type Files

| File | Contains | Key Types |
|------|----------|-----------|
| `base.ts` | Shared types | `Json`, `Database` |
| `user-profile.ts` | User identity | `Profile`, `ProfileSettings` |
| `organization-tenant.ts` | Multi-tenant | `Organisation`, `Tenant`, `OrganizationMember` |
| `project-management.ts` | Projects | `Project`, `ProjectParticipant` |
| `content-media.ts` | Stories/media | `Story`, `Transcript`, `MediaAsset` |
| `story-ownership.ts` | Distribution | `StoryDistribution`, `ConsentProof` |
| `cultural-sensitivity.ts` | Safety | `CulturalSafetyModeration` |
| `location-events.ts` | Geography | `Location`, `Event` |
| `analysis-support.ts` | AI analysis | `TranscriptAnalysis`, `Theme`, `Quote` |

### Type Pattern

Each table has three variants:
```typescript
export type Story = Database['public']['Tables']['stories']['Row']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
```

---

## Service Layer

Services in `src/lib/services/` contain business logic:

### Consent & Distribution Services

| Service | Key Methods |
|---------|-------------|
| **consent.service.ts** | `grantConsent()`, `withdrawConsent()`, `checkConsentForDistribution()` |
| **distribution.service.ts** | `createDistribution()`, `validateDistribution()`, `enforcePolicy()` |
| **revocation.service.ts** | `revokeDistribution()`, `notifyDownstream()`, `invalidateTokens()` |
| **syndication-consent.service.ts** | `checkSyndicationConsent()`, `logSyndicationAccess()` |

### Organization Services

| Service | Key Methods |
|---------|-------------|
| **organization.service.ts** | `getOrganization()`, `getMembers()`, `getMetrics()` |
| **organization-dashboard.service.ts** | Dashboard analytics, activity feeds |

### Utility Services

| Service | Key Methods |
|---------|-------------|
| **audit.service.ts** | `logAction()`, `getAuditTrail()` |
| **embed.service.ts** | `generateEmbedToken()`, `validateToken()` |
| **gdpr.service.ts** | `anonymizeProfile()`, `exportUserData()` |
| **webhook.service.ts** | `triggerWebhook()`, `retryFailures()` |
| **notification.service.ts** | `sendNotification()`, `scheduleNotification()` |
| **email.service.ts** | `sendEmail()`, `sendTemplate()` |

### Service Pattern

```typescript
// Singleton pattern for services
let consentServiceInstance: ConsentService | null = null

export function getConsentService() {
  if (!consentServiceInstance) {
    consentServiceInstance = new ConsentService()
  }
  return consentServiceInstance
}

export class ConsentService {
  private supabase = createSupabaseServiceClient()
  private auditService = getAuditService()

  async grantConsent(input: ConsentGrantInput, verifiedBy: string, tenantId: string | null) {
    // 1. Validate authorization
    // 2. Create consent record
    // 3. Log to audit trail
    // 4. Return result
  }
}
```

---

## API Routes

Routes in `src/app/api/` follow Next.js 15 App Router patterns:

### Route Organization

```
src/app/api/
├── auth/
│   └── guest-session/route.ts
├── stories/
│   ├── route.ts                    # GET/POST stories
│   └── [id]/
│       ├── consent/
│       │   ├── route.ts            # GET/POST consent
│       │   └── withdraw/route.ts   # DELETE consent
│       ├── distributions/route.ts  # GET distributions
│       ├── revoke/route.ts         # POST revoke
│       ├── anonymize/route.ts      # POST anonymize
│       └── archive/route.ts        # POST archive
├── storytellers/
│   ├── route.ts                    # GET/POST storytellers
│   └── [id]/
│       └── dashboard/route.ts      # GET dashboard
├── projects/
│   ├── route.ts                    # GET/POST projects
│   └── [id]/
│       ├── transcripts/route.ts
│       ├── analysis/route.ts
│       ├── organisations/route.ts
│       └── context/route.ts
├── embed/
│   ├── catalog/route.ts
│   └── stories/[id]/
│       ├── route.ts
│       └── token/route.ts
├── admin/
│   ├── tenants/route.ts
│   └── organizations/[orgId]/
│       ├── transcripts/route.ts
│       ├── projects/route.ts
│       └── storytellers/route.ts
└── users/
    └── search/route.ts
```

### Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Get tenant context
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  // 3. Query with tenant filter
  let query = supabase.from('stories').select('*')
  if (profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id)
  }

  const { data, error } = await query

  // 4. Return response
  return NextResponse.json({ data })
}
```

---

## Data Flow Examples

### Example 1: Fetching Stories

```
User visits /stories
    ↓
StoriesPage component (src/app/stories/page.tsx)
    ↓
fetch('/api/stories?status=published')
    ↓
API Route: src/app/api/stories/route.ts
    ↓
createSupabaseServerClient()
    ↓
supabase.from('stories')
  .select('*, storyteller:profiles!stories_storyteller_id_fkey(*)')
  .eq('status', 'published')
  .eq('tenant_id', userTenantId)
    ↓
PostgreSQL with RLS policies
    ↓
Returns JSON { stories: [...] }
    ↓
StoryCard components render
```

### Example 2: Granting Consent

```
Storyteller clicks "Grant Consent"
    ↓
ConsentForm component
    ↓
POST /api/stories/[id]/consent
  body: { method: 'digital', scope: ['embed', 'email'], purpose: 'distribution' }
    ↓
API Route: src/app/api/stories/[id]/consent/route.ts
    ↓
consentService.grantConsent(input)
    ↓
1. Validates storyteller owns story
2. Creates consent_proofs record
3. auditService.logAction('consent.granted')
4. Returns { success: true, consent: ConsentProof }
    ↓
UI shows "Consent granted" confirmation
```

### Example 3: Revoking Distribution

```
Storyteller clicks "Revoke Access"
    ↓
RevocationDialog component
    ↓
POST /api/stories/[id]/revoke
  body: { reason: 'Personal request' }
    ↓
API Route: src/app/api/stories/[id]/revoke/route.ts
    ↓
revocationService.revokeDistribution(storyId)
    ↓
1. Marks story_distributions.status = 'revoked'
2. Invalidates embed tokens
3. webhookService.notifyDownstream(partners)
4. auditService.logAction('story.revoked')
    ↓
Partners receive webhook notification
    ↓
UI shows "Content revoked from all channels"
```

---

## Multi-Tenant Architecture

### Tenant Hierarchy

```
Tenant (e.g., "Queensland Indigenous Communities")
    ├── Organisation A (e.g., "Brisbane Cultural Center")
    │   ├── Members (users with roles)
    │   └── Projects
    │       └── Stories (owned by storytellers)
    │
    └── Organisation B (e.g., "Cairns Heritage Trust")
        ├── Members
        └── Projects
            └── Stories
```

### Tenant Isolation Enforcement

**1. Database Level (RLS)**
```sql
CREATE POLICY "tenant_isolation" ON stories
  USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

**2. Application Level (Middleware)**
```typescript
// src/lib/middleware/organization-role-middleware.ts
export function withOrganizationRole(minRole: number) {
  return async (request: NextRequest) => {
    const profile = await getProfile(user.id)
    if (profile.role_level < minRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
}
```

**3. Query Level**
```typescript
// Always filter by tenant
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('tenant_id', currentTenantId)
```

### Role Levels

| Role | Level | Capabilities |
|------|-------|-------------|
| elder | 100 | Cultural authority, approve sensitive content |
| cultural_keeper | 90 | Manage cultural protocols |
| admin | 70 | System administration |
| project_leader | 60 | Manage projects, invite members |
| storyteller | 50 | Create/edit own stories |
| community_member | 40 | View community content |
| guest | 10 | Read-only public content |

---

## Component Structure

### Directory Organization

```
src/components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── BottomNav.tsx
├── ui/                    # Base shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── stories/
│   ├── StoryCard.tsx
│   ├── StoryEditor.tsx
│   └── DistributionStudio.tsx
├── storyteller/
│   ├── StorytellerCard.tsx
│   └── StorytellerProfile.tsx
├── organization/
│   ├── OrganizationDashboard.tsx
│   └── MemberDirectory.tsx
├── projects/
│   ├── ProjectDashboard.tsx
│   └── tabs/
│       ├── OverviewTab.tsx
│       ├── StoriesTab.tsx
│       ├── MembersTab.tsx
│       └── SettingsTab.tsx
├── cultural/
│   ├── CulturalGuidelines.tsx
│   └── SensitivityChecker.tsx
└── analytics/
    ├── EngagementDashboard.tsx
    └── ThemeAnalyzer.tsx
```

### Component Pattern

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { Story } from '@/types/database'

interface StoryCardProps {
  story: Story & {
    storyteller?: { display_name: string }
  }
  variant?: 'default' | 'compact'
  className?: string
}

export function StoryCard({ story, variant = 'default', className }: StoryCardProps) {
  // Component logic
  return (
    <Card className={cn('...', className)}>
      {/* UI */}
    </Card>
  )
}
```

---

## Common Patterns

### Fetching Data with Tenant Context

```typescript
// In API route or server component
const supabase = createSupabaseServerClient()

// Get user's tenant
const { data: profile } = await supabase
  .from('profiles')
  .select('tenant_id')
  .eq('id', user.id)
  .single()

// Query with tenant filter
const { data: stories } = await supabase
  .from('stories')
  .select('*, storyteller:profiles(*)')
  .eq('tenant_id', profile.tenant_id)
  .eq('status', 'published')
```

### Using Services

```typescript
import { getConsentService } from '@/lib/services/consent.service'
import { getAuditService } from '@/lib/services/audit.service'

const consentService = getConsentService()
const auditService = getAuditService()

// Grant consent
const result = await consentService.grantConsent({
  storyId,
  method: 'digital',
  scope: ['embed'],
  purpose: 'distribution'
}, userId, tenantId)

// Log action
await auditService.logAction({
  action: 'consent.granted',
  actorId: userId,
  resourceId: storyId,
  resourceType: 'story'
})
```

### Client-Side Data Fetching

```typescript
'use client'

import { useEffect, useState } from 'react'

export function StoriesList() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStories() {
      const response = await fetch('/api/stories?status=published')
      const { data } = await response.json()
      setStories(data)
      setLoading(false)
    }
    fetchStories()
  }, [])

  if (loading) return <Spinner />
  return <StoryGrid stories={stories} />
}
```

---

## Useful Commands

```bash
# Explore database schema
cat supabase/migrations/20251220093000_multi_org_tenants.sql

# Find all usages of a table
grep -r "from('stories')" src/

# List all services
ls src/lib/services/

# Find API route for feature
ls src/app/api/stories/

# Check type definitions
cat src/types/database/content-media.ts

# Run type checking
npm run typecheck

# Start dev server
npm run dev
```

---

## Need More Help?

- Use the `/codebase-explorer` skill to interactively explore
- Check `CLAUDE.md` for project guidelines
- Read specific service files for business logic details
- Review migrations for database schema evolution
