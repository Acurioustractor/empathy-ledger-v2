# Empathy Ledger v2 - Codebase Best Practices

**Purpose**: Comprehensive guide for maintaining code quality, architecture consistency, and cultural sensitivity in the Empathy Ledger platform.

**Use this skill when**:
- Starting new features or components
- Reviewing code architecture decisions
- Setting up database schemas or migrations
- Creating API endpoints
- Implementing UI components
- Ensuring cultural safety protocols

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Database Best Practices](#database-best-practices)
3. [Frontend Patterns](#frontend-patterns)
4. [API Design](#api-design)
5. [Cultural Sensitivity](#cultural-sensitivity)
6. [Security & RLS](#security--rls)
7. [Component Design](#component-design)
8. [Development Workflow](#development-workflow)

---

## Project Architecture

### Tech Stack

```
Frontend:  Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
Backend:   Supabase (PostgreSQL + Auth + Storage + Realtime)
State:     React Server Components (RSC), Client hooks where needed
UI:        shadcn/ui components, Lucide icons
Design:    Editorial Warmth design system
Testing:   Playwright (E2E), Jest (unit)
```

### Directory Structure

```
empathy-ledger-v2/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Auth routes (sign-in, sign-up)
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── profile/           # User profiles
│   │   ├── storytellers/      # Storyteller directory
│   │   └── my-story/          # Story management
│   ├── components/
│   │   ├── ui/                # shadcn base components
│   │   ├── shared/            # Shared components (headers, footers)
│   │   ├── auth/              # Authentication components
│   │   ├── storyteller/       # Storyteller-specific components
│   │   ├── story/             # Story display components
│   │   └── profile/           # Profile components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients (client.ts, server.ts)
│   │   ├── database/          # Database types (organized by domain)
│   │   ├── utils.ts           # Utility functions
│   │   └── hooks/             # Custom React hooks
│   ├── types/
│   │   ├── database.ts        # Auto-generated from Supabase
│   │   └── shared/            # Shared type definitions
│   └── middleware.ts          # Next.js middleware (auth refresh)
├── supabase/
│   ├── migrations/            # Versioned SQL migrations
│   ├── seed.sql               # Development seed data
│   └── config.toml            # Supabase configuration
├── .claude/
│   └── skills/                # Claude Code skills
├── docs/                      # Documentation
└── scripts/                   # Helper scripts

```

### Key Principles

1. **Server-First Architecture**: Use React Server Components by default
2. **Type Safety**: Strict TypeScript, auto-generated database types
3. **Cultural Safety**: Protocols embedded at every level
4. **Multi-Tenancy**: Tenant isolation in database and RLS policies
5. **Progressive Enhancement**: Works without JavaScript where possible

---

## Database Best Practices

### Migration Workflow

**ALWAYS use migrations, NEVER manually edit database in Studio**

```bash
# Daily workflow
npm run db:pull      # Pull remote changes to local
npm run db:sync      # Interactive menu for common operations

# Create new migration
supabase migration new feature_name

# Test locally
npm run db:reset     # Safe - only affects local Docker

# Deploy
npm run db:push      # Requires confirmation

# Generate types
npm run db:types     # Auto-generate TypeScript types
```

### Idempotent SQL Patterns

**Tables**:
```sql
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions**:
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**RLS Policies**:
```sql
-- Always drop first for idempotency
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ON table_name
  FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text::uuid);
```

**Indexes**:
```sql
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
```

**Triggers**:
```sql
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION function_name();
```

### Multi-Tenant Schema Pattern

**Every tenant-scoped table MUST have**:

```sql
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- ... other columns ...

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant isolation index
CREATE INDEX IF NOT EXISTS idx_my_table_tenant
  ON my_table(tenant_id);

-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
DROP POLICY IF EXISTS tenant_isolation ON my_table;
CREATE POLICY tenant_isolation ON my_table
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid()
    )
  );
```

### Type Organization

Database types are organized by domain in `src/lib/database/`:

- `user-profile.ts` - User profiles, authentication, preferences
- `organization-tenant.ts` - Organizations, tenants, members
- `project-management.ts` - Projects, tasks, collaboration
- `content-media.ts` - Stories, transcripts, media files
- `tagging-categorization.ts` - Tags, themes, categories
- `engagement-analytics.ts` - Analytics, metrics, engagement
- `cultural-safety.ts` - Cultural protocols, consent, moderation
- `external-integrations.ts` - API keys, webhooks, syndication

Import pattern:
```typescript
import type { Profile, UserPreferences } from '@/lib/database/user-profile'
import type { Story, Transcript } from '@/lib/database/content-media'
```

---

## Frontend Patterns

### Server vs Client Components

**Use Server Components (default)** for:
- Data fetching
- Direct database queries
- SEO-important content
- Static content

**Use Client Components** (`'use client'`) only when you need:
- useState, useEffect, or other hooks
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Interactive UI (forms, modals, dropdowns)

### Supabase Client Pattern

**Server Components**:
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('tenant_id', tenantId)

  return <div>{/* render data */}</div>
}
```

**Client Components**:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function MyClientComponent() {
  const supabase = createClient()

  const handleSubmit = async () => {
    await supabase.from('stories').insert({ ... })
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

**Admin Operations** (bypasses RLS):
```typescript
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const adminClient = await createAdminClient()

  // Can access all data regardless of RLS
  const { data } = await adminClient.from('stories').select('*')

  return Response.json(data)
}
```

### Component Organization

**Tab-based complex interfaces**:

For complex management UIs (like Profile Dashboard, Project Management), split into tab components:

```
src/components/profile/
├── ProfileDashboard.tsx          # Main container, tab navigation
└── tabs/
    ├── PersonalInfoTab.tsx       # Personal information
    ├── StorytellingTab.tsx       # Storytelling settings
    ├── PrivacyTab.tsx            # Privacy controls
    └── OrganizationsTab.tsx      # Organization memberships
```

**Pattern**:
```typescript
// ProfileDashboard.tsx (Main Container)
import PersonalInfoTab from './tabs/PersonalInfoTab'
import StorytellingTab from './tabs/StorytellingTab'

export default function ProfileDashboard({ profile }: Props) {
  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="storytelling">Storytelling</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <PersonalInfoTab profile={profile} />
      </TabsContent>

      <TabsContent value="storytelling">
        <StorytellingTab profile={profile} />
      </TabsContent>
    </Tabs>
  )
}
```

### Design System - Editorial Warmth

**Color Palette** (CSS Variables):
```css
--background       /* Cream/warm white */
--foreground       /* Deep charcoal */
--primary          /* Warm earth tone */
--accent           /* Sunshine yellow */
--muted            /* Soft grey */
--border           /* Subtle borders */
```

**Typography**:
- Headings: Serif font (elegant, editorial)
- Body: Sans-serif (readable, modern)
- Monospace: Code/technical content

**Cultural Color Meanings**:
| Color | Meaning | Usage |
|-------|---------|-------|
| Amber/Gold | Elder wisdom | Elder badges, featured |
| Emerald | Growth, community | Story counts, active status |
| Purple | Sacred knowledge | Knowledge keeper badges |
| Terracotta | Earth, connection | Cultural affiliations |
| Sage | Calm, respectful | General UI elements |

---

## API Design

### Route Structure

```
src/app/api/
├── v1/                          # Versioned API
│   ├── stories/
│   │   ├── route.ts            # GET /api/v1/stories
│   │   └── [id]/
│   │       └── route.ts        # GET /api/v1/stories/:id
│   ├── storytellers/
│   └── projects/
└── world-tour/                  # Feature-specific APIs
    ├── map-data/
    ├── analytics/
    └── themes/
```

### API Route Pattern

```typescript
// src/app/api/v1/stories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query with RLS enforcement
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('tenant_id', user.tenant_id)

    if (error) throw error

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('API Error:', error)

    // Graceful error handling for missing tables
    if (error?.code === '42P01') {
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
```

### Error Handling Standards

**Graceful degradation for missing tables**:
```typescript
catch (error: any) {
  // Return empty data instead of 500 for missing tables
  if (error?.code === '42P01' ||
      error?.message?.includes('relation') ||
      error?.message?.includes('does not exist')) {
    return NextResponse.json({
      data: [],
      // ... empty structures
    })
  }

  return NextResponse.json(
    { error: 'Failed to fetch', details: error?.message },
    { status: 500 }
  )
}
```

---

## Cultural Sensitivity

### Core Principles

1. **Consent-First**: Always require explicit consent for sharing stories
2. **Respectful Language**: Use "storyteller" not "user", "elder" with reverence
3. **Cultural Context**: Display traditional territories, cultural backgrounds
4. **Privacy Controls**: Granular control over what's shared
5. **Sacred Knowledge**: Mark and protect culturally sensitive content

### Cultural Safety Checklist

Before deploying features that handle cultural content:

- [ ] Consent workflow implemented and tested
- [ ] Cultural background displayed respectfully
- [ ] Traditional territory acknowledged (when provided)
- [ ] Elder status prominently indicated (if applicable)
- [ ] Culturally sensitive content marked appropriately
- [ ] Privacy controls allow granular sharing preferences
- [ ] No appropriation of cultural symbols or imagery
- [ ] Language is respectful and inclusive

### Database Schema for Cultural Safety

```sql
-- Cultural protocols on stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cultural context
  cultural_background TEXT,
  traditional_territory TEXT,
  languages_spoken TEXT[],

  -- Consent tracking
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  consent_version TEXT,

  -- Sensitivity markers
  contains_sacred_knowledge BOOLEAN DEFAULT false,
  cultural_sensitivity_level TEXT CHECK (
    cultural_sensitivity_level IN ('public', 'community', 'restricted', 'sacred')
  ),

  -- Sharing controls
  sharing_permissions JSONB DEFAULT '{
    "public": false,
    "community": true,
    "researchers": false,
    "media": false
  }'::jsonb
);
```

### UI Patterns for Cultural Context

**Storyteller Card**:
```tsx
<Card>
  <Avatar />

  {/* Elder status prominently displayed */}
  {storyteller.is_elder && (
    <Badge variant="elder">
      <Crown className="w-3 h-3" /> Elder
    </Badge>
  )}

  <h3>{storyteller.display_name}</h3>

  {/* Cultural background with respect */}
  <div className="flex items-center gap-2">
    <MapPin className="w-4 h-4 text-terracotta" />
    <span className="text-sm">
      {storyteller.cultural_background}
      {storyteller.traditional_territory && (
        <span className="text-xs ml-1">
          ({storyteller.traditional_territory})
        </span>
      )}
    </span>
  </div>

  {/* Traditional knowledge keeper */}
  {storyteller.traditional_knowledge_keeper && (
    <Badge variant="sacred">
      <Book className="w-3 h-3" /> Knowledge Keeper
    </Badge>
  )}
</Card>
```

---

## Security & RLS

### Row Level Security Patterns

**Pattern 1: Tenant Isolation** (Most common)
```sql
CREATE POLICY tenant_isolation ON my_table
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid()
    )
  );
```

**Pattern 2: Owner-Only Access**
```sql
CREATE POLICY owner_access ON my_table
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

**Pattern 3: Role-Based Access**
```sql
-- Create helper function
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND required_role = ANY(tenant_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policy
CREATE POLICY admin_access ON sensitive_table
  FOR ALL
  USING (user_has_role('admin') OR user_has_role('super_admin'));
```

**Pattern 4: Public Read, Authenticated Write**
```sql
-- Public read
DROP POLICY IF EXISTS public_read ON my_table;
CREATE POLICY public_read ON my_table
  FOR SELECT
  USING (true);

-- Authenticated write
DROP POLICY IF EXISTS authenticated_write ON my_table;
CREATE POLICY authenticated_write ON my_table
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
```

### Policy Consolidation

❌ **Anti-pattern** (4 separate policies):
```sql
CREATE POLICY users_select ON users FOR SELECT ...;
CREATE POLICY users_insert ON users FOR INSERT ...;
CREATE POLICY users_update ON users FOR UPDATE ...;
CREATE POLICY users_delete ON users FOR DELETE ...;
```

✅ **Better** (1 consolidated policy):
```sql
DROP POLICY IF EXISTS users_own_data ON users;
CREATE POLICY users_own_data ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Security Best Practices

1. **Never bypass RLS in client code** - Use server-side admin client only
2. **Validate all input** - Use Zod schemas for API validation
3. **Sanitize user content** - Prevent XSS attacks
4. **Rate limiting** - Implement on public endpoints
5. **API key security** - Store in environment variables, never commit
6. **Audit logging** - Log sensitive operations (data access, deletions)

---

## Component Design

### Storyteller Card Patterns

See the `design-component` skill for detailed card design patterns.

**Key data hierarchy**:

```
TIER 1 - Always Display:
├── display_name
├── avatar (or initials fallback)
├── cultural_background
└── story_count

TIER 2 - Show on Card:
├── elder_status badge
├── featured badge
├── top 3 specialties
└── primary location

TIER 3 - Show on Hover/Expand:
├── full bio
├── all specialties
└── theme expertise

TIER 4 - Profile Page Only:
├── contact info
├── full story list
└── connection graph
```

### Form Patterns

**Server Actions** (preferred for forms):

```typescript
// app/actions/story-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStory(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('stories')
    .insert({
      title: formData.get('title'),
      content: formData.get('content'),
      storyteller_id: user.id,
      tenant_id: user.tenant_id
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/my-stories')
  return data
}
```

**Form Component**:
```typescript
'use client'

import { createStory } from '@/app/actions/story-actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button disabled={pending}>
      {pending ? 'Creating...' : 'Create Story'}
    </Button>
  )
}

export function StoryForm() {
  return (
    <form action={createStory}>
      <Input name="title" required />
      <Textarea name="content" required />
      <SubmitButton />
    </form>
  )
}
```

---

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit frequently
git add .
git commit -m "feat: add feature description"

# Push and create PR
git push -u origin feature/my-feature
gh pr create --title "Add feature" --body "Description"
```

### Commit Message Standards

Use conventional commits:

```
feat: add user story editing
fix: correct storyteller card display on mobile
docs: update database workflow guide
refactor: split ProfileDashboard into tabs
chore: update dependencies
test: add E2E tests for story creation
```

### Pre-Deployment Checklist

Before pushing to main:

- [ ] All TypeScript types valid (`npm run build`)
- [ ] Tests passing (`npm test`)
- [ ] Database migrations tested locally (`npm run db:reset`)
- [ ] Types generated and up-to-date (`npm run db:types`)
- [ ] Cultural sensitivity review completed
- [ ] RLS policies tested
- [ ] Environment variables documented
- [ ] No console.log statements in production code
- [ ] No sensitive data in commits

### Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # Server-side only, NEVER expose

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional integrations
OPENAI_API_KEY=sk-xxx  # For AI features
GHL_API_KEY=xxx        # Go High Level integration
```

### Testing Strategy

1. **E2E Tests** (Playwright) - Critical user journeys
   - Story creation and editing
   - User authentication flow
   - Cultural consent workflow

2. **Unit Tests** (Jest) - Utility functions
   - Date formatting
   - String transformations
   - Validation logic

3. **Manual Testing** - Cultural sensitivity
   - Elder profile display
   - Traditional territory display
   - Consent flows

---

## Common Patterns & Solutions

### Pagination Pattern

```typescript
const { data, error } = await supabase
  .from('stories')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1)
  .order('created_at', { ascending: false })
```

### Search Pattern

```typescript
const { data, error } = await supabase
  .from('stories')
  .select('*')
  .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  .limit(20)
```

### Real-time Subscription Pattern

```typescript
'use client'

useEffect(() => {
  const channel = supabase
    .channel('stories')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stories',
        filter: `tenant_id=eq.${tenantId}`
      },
      (payload) => {
        // Handle real-time updates
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [tenantId])
```

### File Upload Pattern

```typescript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('story-media')
  .upload(`${userId}/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('story-media')
  .getPublicUrl(path)
```

---

## Resources & Documentation

### Internal Documentation

- **Database Workflow**: `/docs/DATABASE_WORKFLOW.md`
- **RLS Policy Audit**: `/docs/RLS_POLICY_AUDIT.md`
- **Design System**: Component documentation in Storybook (if available)

### Skills

- **Supabase SQL Manager**: `.claude/skills/supabase-sql-manager/`
- **Design Component**: `.claude/skills/design-component/`
- **Codebase Explorer**: `.claude/skills/codebase-explorer/`
- **Database Schema**: `.claude/skills/supabase/`
- **Data Analysis**: `.claude/skills/data-analysis/`

### External Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Production server

# Database
npm run db:sync          # Interactive database menu
npm run db:pull          # Pull remote schema
npm run db:push          # Push migrations to remote
npm run db:reset         # Reset local database
npm run db:types         # Generate TypeScript types
npm run db:audit         # Audit RLS policies

# Supabase
supabase start           # Start local Supabase
supabase stop            # Stop local Supabase
supabase status          # Check service status
supabase migration new   # Create new migration

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "msg"      # Commit with message
git push                 # Push to remote
gh pr create             # Create pull request
```

---

## Anti-Patterns to Avoid

❌ **Don't**:
- Make schema changes directly in Supabase Studio
- Use client-side Supabase client for sensitive data
- Skip RLS policies ("I'll add them later")
- Commit `.env` files or API keys
- Use `any` type in TypeScript
- Create separate CRUD policies when one `FOR ALL` policy suffices
- Hardcode tenant IDs or user IDs
- Skip cultural sensitivity review
- Use offensive or culturally insensitive placeholder text
- Forget to handle loading and error states

✅ **Do**:
- Use migrations for all schema changes
- Use server-side admin client for sensitive operations
- Implement RLS from the start
- Use environment variables for secrets
- Strict TypeScript types everywhere
- Consolidate policies using `FOR ALL` with USING/WITH CHECK
- Get tenant context from auth token
- Review all cultural content with respect
- Use respectful, real-world example content
- Implement proper loading states and error boundaries

---

## Getting Started with a New Feature

1. **Plan**: Review architecture, identify affected tables/components
2. **Database**: Create migration if schema changes needed
3. **Types**: Generate types after migration
4. **Backend**: Create API routes or server actions
5. **Frontend**: Build components (server-first, client where needed)
6. **Cultural**: Review for cultural sensitivity
7. **Security**: Implement RLS policies
8. **Test**: E2E and manual testing
9. **Document**: Update relevant docs
10. **Deploy**: Create PR, review, merge

---

## Contact & Support

For questions about:
- **Architecture**: Review this skill or `codebase-explorer` skill
- **Database**: Use `supabase` or `database-migration` skills
- **Design**: Use `design-component` skill
- **Cultural Protocols**: Use `review-cultural` skill
- **Security**: Use `review-security` skill

This living document should be updated as new patterns emerge and best practices evolve.
