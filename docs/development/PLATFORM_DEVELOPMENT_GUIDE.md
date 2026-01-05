# Empathy Ledger v2 - Platform Development Guide

**Last Updated:** October 26, 2025
**Purpose:** Complete context for LLM-assisted development of transcripts, stories, profiles, documents, and multi-tenant features

---

## Quick Reference

### What is this platform?
Multi-tenant storytelling platform for Indigenous communities. Enables collection, preservation, AI analysis, and culturally-sensitive sharing of oral histories and stories.

### Key Technologies
- **Frontend:** Next.js 15 (App Router), TypeScript, React, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, Supabase (PostgreSQL + Auth)
- **AI:** OpenAI GPT-4 / Ollama (llama3.1:8b)
- **Architecture:** Multi-tenant with RLS, Service Role for super admin

---

## Multi-Tenant Architecture

### Three Levels of Isolation

**1. Tenant (tenant_id)** - Top-level isolation
- All users belong to ONE tenant
- Tenant owns organizations, projects, profiles
- RLS enforces tenant boundaries

**2. Organization (organization_id)** - Mid-level grouping
- Multiple organizations per tenant
- Stories, projects linked to organizations
- Super admin can view across all orgs

**3. Project (project_id)** - Specific programs
- Projects belong to organizations
- Transcripts and stories belong to projects

### Critical Relationship: Transcripts

**IMPORTANT:** Transcripts don't have `organization_id` directly!

```
transcript → storyteller_id (profile) → tenant_id
```

To filter transcripts by organization:
1. Get organization's `tenant_id`
2. Find all profiles with that `tenant_id` and role `storyteller`
3. Filter transcripts: `.in('storyteller_id', [storytellerIds])`

---

## Database Schema

### Core Tables

**profiles** (Users/Storytellers)
```
id UUID
email, display_name, full_name
bio, cultural_background
tenant_id → tenants
tenant_roles TEXT[] (admin, storyteller, viewer)
is_super_admin BOOLEAN
```

**organizations**
```
id UUID
name, slug, type
tenant_id → tenants
```

**projects**
```
id UUID
name, description
organization_id → organizations
tenant_id → tenants
```

**transcripts**
```
id UUID
title, text
storyteller_id → profiles
project_id → projects
organization_id (often NULL!)
status, duration_seconds, word_count
```

**stories**
```
id UUID
title, content
storyteller_id → profiles (who told it)
author_id → profiles (who wrote it)
project_id → projects
organization_id → organizations
status, cultural_sensitivity_level
```

### Context Tables

**project_contexts** (AI-extracted project understanding)
```
id UUID
project_id → projects (UNIQUE)
organization_id → organizations
purpose TEXT
expected_outcomes JSONB [{category, description, indicators[], timeframe}]
success_criteria TEXT[]
cultural_approaches TEXT[]
seed_interview_text TEXT
ai_extracted BOOLEAN
extraction_quality_score INTEGER (0-100)
```

**organization_contexts** (Org-level understanding)
```
id UUID
organization_id → organizations (UNIQUE)
mission TEXT
vision TEXT
values TEXT[]
cultural_frameworks TEXT[]
impact_domains JSONB {individual[], family[], community[], systems[]}
seed_interview_responses JSONB
```

---

## API Patterns

### Dual API Structure

**Platform-Wide APIs** (Super admin, all orgs)
```
/api/admin/stories
/api/admin/transcripts
/api/admin/projects
/api/admin/storytellers
```
- Require `requireSuperAdminAuth()`
- Use `createServiceRoleClient()` to bypass RLS
- Return all data across organizations

**Organization-Specific APIs** (Filtered)
```
/api/admin/organizations/[orgId]/stories
/api/admin/organizations/[orgId]/transcripts
/api/admin/organizations/[orgId]/projects
/api/admin/organizations/[orgId]/storytellers
```
- Filter by `organization_id` or `tenant_id`
- Return `organizationName` in response
- Use Service Role Client with filters

### Auth Pattern

```typescript
// Development bypass
if (process.env.NODE_ENV === 'development') {
  return { user: { id: '...', is_super_admin: true }}
}

// Production
const authResult = await requireSuperAdminAuth(request)
if (authResult instanceof NextResponse) return authResult
const supabase = createServiceRoleClient()
```

### Response Format

```json
{
  "stories": [...],
  "organizationName": "Oonchiumpa",
  "organizationId": "...",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

## Frontend Organization

### Component Structure

**Page Components** (`src/app/admin/*`)
```
admin/
  stories/page.tsx
  transcripts/page.tsx
  projects/page.tsx
  storytellers/page.tsx
```

Each page:
- Uses `useOrganizationContext()` for filtering
- Re-fetches on `selectedOrgId` change
- Shows conditional UI (platform view vs org view)
- Displays organization name in header

**Shared Components** (`src/components/*`)
```
organization/
  OrganizationContextManager.tsx
  SeedInterviewWizard.tsx
projects/
  ProjectContextManager.tsx
  ProjectSeedInterviewWizard.tsx
shared/
  InterviewRecorder.tsx
```

### Organization Context Pattern

```typescript
const { selectedOrgId } = useOrganizationContext()

useEffect(() => {
  fetchData()
}, [selectedOrgId]) // Re-fetch when org changes

const apiUrl = selectedOrgId === 'all'
  ? '/api/admin/stories'
  : `/api/admin/organizations/${selectedOrgId}/stories`
```

### Type Organization (`src/types/*`)

Split by domain:
```
user-profile.types.ts
organization-tenant.types.ts
project-management.types.ts
content-media.types.ts
storytelling-analysis.types.ts
cultural-protocol.types.ts
admin-workflow.types.ts
database.types.ts (Supabase generated)
```

---

## Seed Interview System

### Purpose
Enables projects and organizations to define their OWN success metrics instead of generic Western frameworks.

### Workflow

1. **Complete Seed Interview** (14 questions)
   - What are you trying to achieve?
   - Who are you working with?
   - What does success look like?

2. **AI Extraction**
   - POST `/api/projects/[id]/context/seed-interview`
   - AI reads responses, extracts structure
   - Saves to `project_contexts` with quality score

3. **Context-Aware Analysis**
   - Transcripts analyzed for PROJECT-SPECIFIC outcomes
   - Evidence extracted with strength (mentioned → described → demonstrated)
   - Scores 0-100 based on depth of evidence

4. **Display**
   - "Project Outcomes" tab shows extracted outcomes
   - Quotes from storytellers as evidence
   - Progress tracking per outcome

### Example

**Input:** "We're building beds with community so families don't sleep on floors, improving sleep quality and health"

**Extracted Outcome:**
```json
{
  "category": "Sleep Quality",
  "description": "Improved sleep and dignity for families",
  "indicators": [
    "Fewer people sleeping on floors",
    "Reduced health issues from poor sleep"
  ],
  "timeframe": "short_term"
}
```

**Analysis Result:**
- Sleep Quality: 85/100 (12 quotes, 8 storytellers)

---

## Key Features

### 1. Cultural Sensitivity
- Stories require cultural approval workflows
- Elder review flags (`is_elder`)
- Cultural sensitivity levels
- Cultural protocols tracked
- Indigenous terminology preserved

### 2. AI Analysis (Culturally Aware)
- Project-specific outcome extraction
- Quote extraction with context
- Evidence strength scoring
- Respects cultural terminology
- Local Ollama option (doesn't leave server)

### 3. Storyteller-Centric
- Profiles with bio, cultural background
- `storyteller_id` vs `author_id` distinction
- Elder and Featured markers
- Transcript → storyteller relationship

### 4. Document Management
- Media files with usage tracking
- Cultural protocol attachments
- Transcript audio/video files
- Usage consent tracking

### 5. JusticeHub Integration (NEW!)
- Super admin can enable/disable profiles on JusticeHub platform
- Checkbox toggle in storytellers admin table
- Synced badge shows when profile synchronized
- Database columns: `justicehub_enabled`, `justicehub_role`, `justicehub_featured`, `justicehub_synced_at`
- Extends to organizations and projects
- API endpoint handles toggle updates

---

## Development Workflow

### Local Setup

```bash
npm install
npm run dev # Port 3030
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
NODE_ENV=development # Enables auth bypass
```

### Adding New Admin Feature

1. **Create platform API** (`/api/admin/[resource]/route.ts`)
```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminAuth(request)
  const supabase = createServiceRoleClient()
  // ... fetch all
}
```

2. **Create org-specific API** (`/api/admin/organizations/[orgId]/[resource]/route.ts`)
```typescript
export async function GET(request, { params }) {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from(resource)
    .eq('organization_id', params.orgId)
}
```

3. **Create page with org context** (`/app/admin/[resource]/page.tsx`)
```typescript
const { selectedOrgId } = useOrganizationContext()
useEffect(() => { fetchData() }, [selectedOrgId])
```

### Database Changes

```bash
# Create migration in supabase/migrations/
# Apply directly via psql or Supabase dashboard
```

---

## Common Challenges

### 1. Transcripts Filtering
**Problem:** Transcripts show 0 for organization despite having storytellers
**Cause:** Transcripts don't have `organization_id`
**Solution:** Filter by storyteller's `tenant_id`

### 2. RLS Issues
**Problem:** Queries return empty when they shouldn't
**Solution:** Super admin APIs must use `createServiceRoleClient()`

### 3. Organization Context Not Updating
**Problem:** Page doesn't refresh when changing orgs
**Solution:** Add `selectedOrgId` to `useEffect` dependencies

### 4. Analysis Cache Staleness
**Problem:** Changes don't reflect in analysis
**Solution:** POST `/api/projects/[id]/analysis/clear-cache`

### 5. Development Auth
**Problem:** Can't test without full auth setup
**Solution:** Set `NODE_ENV=development` for bypass

---

## Project Statistics (October 2025)

### Platform-Wide (All Organizations)
- **Stories:** 301 total
- **Transcripts:** 222 total
- **Projects:** 10 total
- **Organizations:** 18 active

### Oonchiumpa Organization
- **Stories:** 6
- **Transcripts:** 11 (via 8 storytellers)
- **Projects:** 2
- **Storytellers:** 8

---

## Recent Improvements

### Multi-Tenant Super Admin System (Oct 26, 2025)
✅ Organization selector in admin dashboard
✅ Platform-wide stats API
✅ Organization-specific filtering for:
  - Stories
  - Transcripts (fixed indirect filtering)
  - Projects
  - Storytellers
✅ Dual API pattern (platform + org-specific)
✅ Development mode bypass for rapid testing

### Fixed Issues
- Transcripts now correctly filter by organization via storyteller's tenant
- Service Role Client properly bypasses RLS
- Organization context updates trigger re-fetching
- Dynamic headers show platform vs org view

---

## Use This Guide When...

- Creating new admin pages for transcripts, stories, profiles
- Implementing organization or project features
- Working with the AI analysis system
- Debugging multi-tenant data filtering
- Setting up seed interviews for context
- Understanding the database schema
- Planning new features

---

## Next Steps / Roadmap

### Near-Term
- Complete SeedInterviewWizard UI
- Visual context editor
- Real-time analysis status
- Multi-language support

### Long-Term
- Mobile app for field interviews
- Fine-tuned cultural AI models
- Community portal
- Advanced analytics dashboard

---

## Support Files

- `CLAUDE.md` - Project instructions for AI agents
- `SEED_INTERVIEW_USER_GUIDE.md` - How to use seed interviews
- `SESSION_COMPLETE_SEED_INTERVIEW.md` - Implementation details

---

**This guide provides complete context for LLM-assisted development. Share it at the start of development sessions for full platform understanding.**
