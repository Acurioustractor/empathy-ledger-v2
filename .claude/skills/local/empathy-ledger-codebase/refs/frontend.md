# Frontend Patterns

## Server vs Client Components
**Server (default)**: Data fetching, DB queries, SEO, static content
**Client ('use client')**: Hooks, events, browser APIs, interactivity

## Supabase Clients
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Admin (bypasses RLS)
import { createAdminClient } from '@/lib/supabase/server'
const admin = await createAdminClient()
```

## Tab Component Pattern
```
src/components/profile/
├── ProfileDashboard.tsx    # Main container
└── tabs/
    ├── PersonalInfoTab.tsx
    ├── PrivacyTab.tsx
    └── OrganizationsTab.tsx
```

## Design System - Editorial Warmth
**Colors**: `--background` (cream), `--foreground` (charcoal), `--primary` (earth), `--accent` (gold)

**Cultural Colors**:
| Color | Meaning | Usage |
|-------|---------|-------|
| Amber | Elder wisdom | Elder badges |
| Emerald | Growth | Active status |
| Purple | Sacred | Knowledge keeper |
| Terracotta | Connection | Cultural affiliation |

## Form Pattern (Server Actions)
```typescript
// app/actions/story-actions.ts
'use server'
export async function createStory(formData: FormData) {
  const supabase = await createClient()
  // validate, insert, revalidatePath
}

// Component
<form action={createStory}>...</form>
```
