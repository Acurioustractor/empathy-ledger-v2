/**
 * Platform Development Context - Seed Interview
 *
 * This creates comprehensive context for LLM-assisted development of Empathy Ledger.
 * It documents the architecture, multi-tenant system, database schema, and key features
 * so future development sessions have full understanding of the platform.
 */

const PLATFORM_CONTEXT_INTERVIEW = {
  responses: [
    {
      question_id: 'platform_overview',
      question: 'What is the Empathy Ledger platform and what does it do?',
      answer: `Empathy Ledger is a multi-tenant storytelling platform designed specifically for Indigenous communities and organizations.

The platform enables communities to:
- Collect and preserve oral histories and stories
- Record and transcribe audio/video interviews
- Analyze stories using AI to extract cultural insights and project outcomes
- Manage storytellers, projects, and organizational contexts
- Track culturally-defined impact metrics (not generic Western frameworks)
- Share stories with appropriate cultural sensitivity controls

Core purpose: Enable Indigenous communities to own, control, and derive value from their stories while respecting cultural protocols and community self-determination.`
    },
    {
      question_id: 'technical_architecture',
      question: 'What is the technical architecture of the platform?',
      answer: `Multi-Tenant Web Application built with:

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- React Server Components
- Tailwind CSS + shadcn/ui components
- Tab-based modular component architecture

**Backend:**
- Next.js API routes (serverless functions)
- Supabase (PostgreSQL database with Row Level Security)
- Service Role Client for super admin operations
- Multi-tenant data isolation via organization_id and tenant_id

**AI/ML:**
- OpenAI GPT-4 for transcript analysis and context extraction
- Ollama (llama3.1:8b) for local development
- Structured extraction of quotes, themes, and outcomes
- Culturally-sensitive analysis frameworks

**Authentication & Authorization:**
- Supabase Auth
- Multi-level access control (super admin, org admin, storyteller, viewer)
- Development mode bypass for testing
- Row-level security policies per tenant

**Key Architectural Patterns:**
- Service Role Client bypasses RLS for platform-wide admin operations
- Organization Context React context for filtering
- Dual API pattern: platform-wide (/api/admin/*) and org-specific (/api/admin/organizations/[orgId]/*)
- Database types organized by domain (user-profile, organization-tenant, project-management, content-media)`
    },
    {
      question_id: 'multi_tenant_system',
      question: 'How does the multi-tenant system work?',
      answer: `The platform uses a sophisticated multi-tenant architecture with three levels of isolation:

**1. Tenant Level (tenant_id)**
- Top-level isolation boundary
- All users belong to exactly one tenant
- Tenant owns organizations, projects, profiles
- RLS policies enforce tenant isolation

**2. Organization Level (organization_id)**
- Organizations belong to tenants
- Multiple organizations per tenant supported
- Stories, projects, and transcripts linked to organizations
- Super admin can view/manage across all organizations

**3. Project Level (project_id)**
- Projects belong to organizations
- Transcripts and stories belong to projects
- Project-specific context and outcomes

**Data Relationships:**
- Organizations → Tenant (via tenant_id)
- Projects → Organization (via organization_id)
- Stories → Organization + Project
- Transcripts → Storyteller (Profile) → Tenant
  * NOTE: Transcripts don't have organization_id directly
  * Filter transcripts by organization via storyteller's tenant_id

**Super Admin System:**
- Platform-wide view across all organizations
- Organization selector in UI to filter to specific org
- Service Role Client bypasses RLS
- Dual API endpoints: /api/admin/* (all) and /api/admin/organizations/[orgId]/* (filtered)

**Security:**
- Row Level Security (RLS) on all tables
- Service role bypasses RLS only for super admin
- profile_organizations join table controls org membership
- Development mode bypass with hardcoded super admin ID`
    },
    {
      question_id: 'database_schema_core',
      question: 'What are the core database tables and their relationships?',
      answer: `**Core Tables:**

**1. profiles** (Users)
- id (UUID, primary key)
- email, display_name, full_name
- bio, cultural_background
- profile_image_url
- tenant_id (FK to tenants)
- tenant_roles (text[] - 'admin', 'storyteller', 'viewer')
- is_admin, is_super_admin (boolean flags)
- is_elder, is_featured (cultural markers)

**2. tenants** (Top-level isolation)
- id (UUID, primary key)
- name, slug
- organization_id (FK to organizations - primary org)
- settings (JSONB)

**3. organizations**
- id (UUID, primary key)
- name, slug
- type ('community', 'research', 'government', 'ngo')
- tenant_id (FK to tenants)
- is_active (boolean)

**4. profile_organizations** (Membership join table)
- profile_id (FK to profiles)
- organization_id (FK to organizations)
- role ('admin', 'member', 'viewer')
- is_active (boolean)
- joined_at, invited_by

**5. projects**
- id (UUID, primary key)
- name, slug
- description, objectives
- organization_id (FK to organizations)
- tenant_id (FK to tenants)
- status ('planning', 'active', 'completed', 'archived')
- start_date, end_date

**6. transcripts**
- id (UUID, primary key)
- title
- storyteller_id (FK to profiles)
- project_id (FK to projects)
- text (full transcript text)
- status ('pending', 'processing', 'completed', 'failed')
- duration_seconds, file_size, word_count
- language, location
- organization_id (often NULL - filter via storyteller's tenant!)

**7. stories**
- id (UUID, primary key)
- title, content
- storyteller_id (FK to profiles)
- author_id (FK to profiles - who wrote it)
- project_id (FK to projects)
- organization_id (FK to organizations)
- status ('draft', 'pending_review', 'approved', 'published')
- cultural_sensitivity_level
- requires_approval (boolean)

**Key Relationships:**
- Profile → Tenant (1:1)
- Profile → Organizations (M:M via profile_organizations)
- Organization → Tenant (M:1)
- Project → Organization (M:1)
- Transcript → Profile/Storyteller (M:1)
- Transcript → Project (M:1)
- Story → Project → Organization`
    },
    {
      question_id: 'database_schema_context',
      question: 'How does the context and analysis system work in the database?',
      answer: `**Context Tables:**

**1. project_contexts** (AI-extracted project understanding)
- id (UUID, primary key)
- project_id (FK to projects, UNIQUE - one context per project)
- organization_id (FK to organizations)
- purpose (TEXT - what the project is trying to achieve)
- context (TEXT - background and situation)
- target_population (TEXT - who it's for)
- expected_outcomes (JSONB - array of structured outcomes)
  * Format: { category, description, indicators[], timeframe }
- success_criteria (TEXT[] - how you know it's working)
- program_model (TEXT - theory of change)
- cultural_approaches (TEXT[] - protocols, practices)
- key_activities (TEXT[] - what they do)
- seed_interview_text (TEXT - raw interview responses)
- context_type ('quick', 'full', 'imported')
- ai_extracted (BOOLEAN)
- extraction_quality_score (INTEGER 0-100)
- ai_model_used (VARCHAR)

**2. organization_contexts** (Organization-level understanding)
- id (UUID, primary key)
- organization_id (FK to organizations, UNIQUE)
- mission (TEXT - core purpose)
- vision (TEXT - world they're working toward)
- values (TEXT[] - core values)
- approach_description (TEXT - how they work)
- cultural_frameworks (TEXT[] - e.g., "Dadirri", "OCAP")
- key_principles (TEXT[] - operating principles)
- impact_philosophy (TEXT - theory of change)
- impact_domains (JSONB - { individual, family, community, systems })
- measurement_approach (TEXT - how they track impact)
- seed_interview_text (TEXT)
- Similar metadata fields as project_contexts

**3. project_analyses** (Cache of AI analysis results)
- id (UUID, primary key)
- project_id (FK to projects)
- organization_id (FK to organizations)
- analysis_type ('themes' | 'outcomes' | 'sentiment' | 'quotes')
- results (JSONB - structured analysis data)
- transcripts_analyzed (INTEGER)
- cache_key (TEXT - unique identifier)
- is_stale (BOOLEAN)
- expires_at (TIMESTAMPTZ)

**Seed Interview Workflow:**
1. Admin completes 14-question seed interview for project
2. POST /api/projects/[id]/context/seed-interview
3. AI (GPT-4 or Ollama) extracts structured context
4. Saves to project_contexts table with quality score
5. Analysis system uses expected_outcomes to find evidence
6. Results cached in project_analyses

**Context-Aware Analysis:**
- If project_context exists → Analyze for project-specific outcomes
- If no context → Fall back to generic impact framework
- Quotes extracted with evidence strength (not_found, mentioned, described, demonstrated)
- Scores 0-100 based on depth and frequency of evidence`
    },
    {
      question_id: 'api_architecture',
      question: 'How are the API endpoints organized and what patterns do they follow?',
      answer: `**API Organization Pattern:**

**1. Admin Platform APIs** (Super admin, all orgs)
- /api/admin/stories (GET) - All stories across platform
- /api/admin/transcripts (GET) - All transcripts
- /api/admin/projects (GET) - All projects
- /api/admin/storytellers (GET) - All storytellers
- Each requires super admin auth
- Uses createServiceRoleClient() to bypass RLS
- Returns data from all organizations

**2. Organization-Specific APIs** (Filtered to one org)
- /api/admin/organizations/[orgId]/stories
- /api/admin/organizations/[orgId]/transcripts
- /api/admin/organizations/[orgId]/projects
- /api/admin/organizations/[orgId]/storytellers
- Filters by organization_id or tenant_id
- Returns organizationName in response
- Uses Service Role Client with .eq() filters

**3. Context Management APIs**
- GET /api/projects/[id]/context/seed-interview - Get template questions
- POST /api/projects/[id]/context/seed-interview - Submit responses, extract context
- GET /api/organizations/[id]/context/seed-interview - Org template
- POST /api/organizations/[id]/context/seed-interview - Org context creation

**4. Analysis APIs**
- POST /api/projects/[id]/analysis/clear-cache - Clear cached analysis
- GET /api/projects/[id]/analysis - Get analysis with project outcomes

**Auth Middleware Pattern:**
\`\`\`typescript
// Development bypass
if (process.env.NODE_ENV === 'development') {
  return { user: { id: 'd0a162d2...', is_super_admin: true }}
}

// Production
const authResult = await requireSuperAdminAuth(request)
if (authResult instanceof NextResponse) return authResult
\`\`\`

**API Response Pattern:**
\`\`\`typescript
{
  [resource]: [...], // e.g., "stories", "transcripts"
  organizationName?: string, // If org-specific
  organizationId?: string,
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
\`\`\`

**Filtering Transcripts by Organization:**
Since transcripts don't have organization_id, we filter indirectly:
1. Get organization's tenant_id
2. Find all profiles for that tenant
3. Filter to profiles with 'storyteller' role
4. Get transcript IDs: .in('storyteller_id', storytellerIds)`
    },
    {
      question_id: 'frontend_organization',
      question: 'How is the frontend organized and what component patterns are used?',
      answer: `**Component Organization:**

**1. Page Structure** (src/app/*)
- App Router with server/client components
- admin/* - Super admin pages (stories, transcripts, projects, storytellers)
- projects/[id]/* - Project detail pages
- organization/[id]/* - Organization pages

**2. Component Patterns**

**Tab-Based Management Pages:**
Large admin interfaces split into focused tab components:
- ProjectManagement.tsx → 4 tab components (Overview, Team, Context, Settings)
- Each tab is self-contained with own state
- Shared props passed down from parent

**Organization Context System:**
\`\`\`typescript
// src/lib/contexts/OrganizationContext.tsx
const { selectedOrgId, setSelectedOrgId } = useOrganizationContext()

// In components:
useEffect(() => {
  fetchData()
}, [selectedOrgId]) // Re-fetch when org changes
\`\`\`

**Dynamic Headers:**
\`\`\`typescript
<h1>
  {selectedOrgId === 'all'
    ? 'All Stories (Platform View)'
    : \`\${organizationName} Stories\`}
</h1>
\`\`\`

**Conditional Columns:**
Show "Organization" column only in platform view

**3. Shared Components** (src/components/*)
- ui/* - shadcn/ui primitives (Button, Card, Table, etc.)
- organization/* - Org management (SeedInterviewWizard, OrganizationContextManager)
- projects/* - Project management (ProjectSeedInterviewWizard, ProjectContextManager)
- shared/* - Reusable (InterviewRecorder, loading states)

**4. Type Organization** (src/types/*)
Split by domain:
- user-profile.types.ts
- organization-tenant.types.ts
- project-management.types.ts
- content-media.types.ts
- storytelling-analysis.types.ts
- cultural-protocol.types.ts
- admin-workflow.types.ts
- database.types.ts (Supabase generated)

**5. State Management**
- React Context for global state (OrganizationContext)
- Local useState for component state
- useEffect for data fetching with dependencies
- Server Components for initial data loading`
    },
    {
      question_id: 'key_features',
      question: 'What are the key features that make this platform unique?',
      answer: `**1. Cultural Sensitivity First**
- Stories require cultural approval workflows
- Elder review flags
- Cultural sensitivity levels (public, community, restricted)
- Cultural protocols table tracks community-specific rules
- Indigenous terminology preserved (no translation)

**2. Community-Defined Impact**
- Seed interview system lets projects define their own success metrics
- No generic Western impact frameworks imposed
- AI extracts project-specific outcomes from narrative responses
- Evidence tracked per community's definitions

**3. Multi-Tenant Isolation**
- Complete data separation between tenants
- Row-level security at database level
- Super admin can manage platform without seeing sensitive stories
- Organizations can own multiple projects

**4. AI-Powered Analysis (Culturally Aware)**
- Transcripts analyzed for project-specific outcomes
- Quotes extracted with context
- Evidence strength scoring (not_found → mentioned → described → demonstrated)
- Respects cultural terminology in analysis
- Local Ollama option for sensitive data (doesn't leave server)

**5. Storyteller-Centric**
- Profiles with bio, cultural background, community roles
- Elder and Featured markers
- transcript → storyteller relationship preserved
- Stories attributed to both storyteller (who told it) and author (who wrote it)

**6. Flexible Context System**
- Project-level: Specific program outcomes
- Organization-level: Mission, values, approaches
- Both use seed interview → AI extraction → structured storage
- Templates customizable per organization

**7. Document Management**
- Media files with usage tracking
- Cultural protocol attachments
- Transcript files (audio/video)
- Usage consent tracking

**8. Super Admin Dashboard**
- Platform-wide statistics
- Organization selector for filtered views
- Service role access to bypass RLS safely
- Development mode for testing`
    },
    {
      question_id: 'development_workflow',
      question: 'What is the recommended development workflow and best practices?',
      answer: `**Local Development Setup:**

\`\`\`bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Access at http://localhost:3030
\`\`\`

**Environment Variables:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (for admin operations)
- OPENAI_API_KEY (for AI analysis)
- NODE_ENV=development (enables auth bypass)

**Development Patterns:**

**1. Database Changes:**
- Create migration in supabase/migrations/
- Test locally with Supabase CLI
- Push to remote: \`npx supabase db push\`
- Update types: Generate from Supabase dashboard

**2. Adding New Admin Pages:**
Example code pattern:
// 1. Create platform-wide API in src/app/api/admin/[resource]/route.ts
// 2. Create org-specific API in src/app/api/admin/organizations/[orgId]/[resource]/route.ts
// 3. Create page with organization context using useOrganizationContext()
// 4. Add selectedOrgId to useEffect dependencies to trigger re-fetch

**3. Context Management:**
Use /clear frequently to manage context limits
Target specific files with grep/search instead of full reads
Strategic /compact at breakpoints

**4. Component Splitting:**
When files exceed ~1,500 lines, consider tab-based splitting
Keep shared state in parent
Pass props to focused child components
Maintain full functionality

**5. Type Safety:**
Organize types by domain
Import from @/types/[domain].types
Extend Supabase-generated types
Use TypeScript strict mode

**6. Testing:**
Scripts in scripts/* for testing APIs
Use curl for quick endpoint tests
Development bypass for rapid iteration
Test multi-tenant isolation thoroughly`
    },
    {
      question_id: 'common_challenges',
      question: 'What are common challenges and gotchas when working on this platform?',
      answer: `**1. Multi-Tenant Data Filtering**

**Challenge:** Forgetting to filter by organization_id or tenant_id
**Solution:**
- Always use .eq('organization_id', orgId) or .eq('tenant_id', tenantId)
- Remember: transcripts don't have organization_id directly
- Filter transcripts via storyteller's tenant_id

**2. RLS vs Service Role**

**Challenge:** Queries return empty when they shouldn't
**Solution:**
- Super admin APIs must use createServiceRoleClient()
- Service role bypasses RLS entirely
- Regular users use createServerClient() with RLS enforcement

**3. Organization Context Not Updating**

**Challenge:** Page doesn't refresh when changing organizations
**Solution:**
- Add selectedOrgId to useEffect dependencies
- Clear state when switching to 'all' view
- Reset pagination when changing orgs

**4. Analysis Cache Staleness**

**Challenge:** Changes to context don't reflect in analysis
**Solution:**
- Clear cache after updating project_context
- POST /api/projects/[id]/analysis/clear-cache
- Analysis regenerates on next view

**5. Development Auth Bypass**

**Challenge:** Can't test locally without setting up auth
**Solution:**
- Set NODE_ENV=development
- Middleware automatically uses super admin ID
- Remember to test with real auth before production

**6. Type Mismatches**

**Challenge:** Supabase types don't match application logic
**Solution:**
- Keep domain types separate from database types
- Map database results to application types
- Use TypeScript utility types (Pick, Omit, Partial)

**7. Component Re-renders**

**Challenge:** Entire page re-renders when only one section changes
**Solution:**
- Use React.memo for expensive components
- Split into smaller focused components
- Lift state only when needed

**8. Seed Interview Quality**

**Challenge:** Low extraction quality scores
**Solution:**
- Be specific and measurable in responses
- Include who, what, when, where, why
- Mention cultural approaches explicitly
- Describe indicators of success`
    },
    {
      question_id: 'future_roadmap',
      question: 'What are the planned improvements and future directions?',
      answer: `**Near-Term Improvements:**

**1. Frontend Wizards**
- Complete SeedInterviewWizard UI
- Step-by-step guided experience
- Audio recording option for interviews
- Progress saving between sessions

**2. Context Management UI**
- Visual context editor
- Quality score dashboard
- Template customization interface
- Context version history

**3. Analysis Enhancements**
- Real-time analysis status
- Background job queue for heavy processing
- Comparative analysis across projects
- Outcome trend tracking over time

**4. Multi-Language Support**
- Interface translation
- Language-specific analysis
- Preserve Indigenous language text
- Translation workflow with approval

**5. Document Management**
- Full document library UI
- Advanced search and filtering
- Tagging and categorization
- Usage tracking and consent

**Long-Term Vision:**

**1. Mobile App**
- React Native app for field interviews
- Offline recording and sync
- GPS location tagging
- Photo/video capture

**2. Advanced AI**
- Fine-tuned models on cultural data
- Automatic theme clustering
- Story generation from transcripts
- Multi-modal analysis (text + audio + video)

**3. Community Portal**
- Public-facing story library
- Cultural protocol enforcement
- Community moderation tools
- Elder approval workflows

**4. Integration Ecosystem**
- Export to common formats
- API for external tools
- Webhooks for events
- Third-party authentication

**5. Analytics & Reporting**
- Custom report builder
- Funder report templates
- Impact visualization dashboards
- Longitudinal study support

**Platform Governance:**
- Indigenous data sovereignty principles
- Community ownership of code
- Open source with cultural sensitivity
- Co-design all major features`
    }
  ]
}

// Export for use in scripts
export default PLATFORM_CONTEXT_INTERVIEW

console.log('Platform Development Context Interview Created')
console.log('Total questions:', PLATFORM_CONTEXT_INTERVIEW.responses.length)
console.log('Total content length:', JSON.stringify(PLATFORM_CONTEXT_INTERVIEW).length, 'characters')
