# Operational Principles: Multi-Tenant Architecture
## Super Admin vs Organization Admin Access Patterns

**Version:** 1.0
**Date:** October 26, 2025
**Status:** OPERATIONAL DESIGN - Implementation Ready

---

## Executive Summary

This document defines the **operational principles** for how Empathy Ledger functions as a multi-tenant platform, with clear separation between:

1. **Platform Level** (Super Admin) - Manages the entire Empathy Ledger system
2. **Organization Level** (Org Admin) - Manages individual organization's content and users

### Key Insight from Current Architecture

**What Works Well ✅**
```typescript
// Current structure is solid:
organizations (Primary Tenant)
├── organization_members (User-Org relationships with roles)
├── organization_contexts (Org mission/values)
└── projects (Optional sub-grouping)

// Access control working:
- Super admin via email check (benjamin@act.place)
- Organization admin via organization_members.role
- RLS enforcement via profile_organizations table
```

**What Needs Alignment ⚠️**
```typescript
// Redundancy issue:
tenants table (has organization_id) ← Why separate from organizations?
projects table (has both organization_id AND tenant_id) ← Redundant
stories table (has both organization_id AND tenant_id) ← Redundant

// Solution: Use organizations as PRIMARY tenant, deprecate tenant_id
```

---

## 1. Tenant Hierarchy & Access Levels

### 1.1 Three-Tier Access Model

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: PLATFORM SUPER ADMIN                               │
├─────────────────────────────────────────────────────────────┤
│ Access: ALL organizations, ALL data - FULL EDIT ACCESS      │
│ Location: /admin/* routes                                   │
│ Purpose: Platform management, onboarding, system monitoring │
│                                                             │
│ Capabilities:                                               │
│ ✓ View all organizations                                    │
│ ✓ Create/edit/delete organizations                          │
│ ✓ Create/edit/delete ANY content in ANY organization        │
│ ✓ Edit stories, documents, blog posts across all orgs       │
│ ✓ Manage users across all organizations                     │
│ ✓ Assign/remove organization admins                         │
│ ✓ Override cultural review/approval workflows               │
│ ✓ Platform analytics and monitoring                         │
│ ✓ System configuration                                      │
│                                                             │
│ Use Cases:                                                  │
│ • Fix data issues across organizations                      │
│ • Support organizations with technical help                 │
│ • Migrate content between systems                           │
│ • Emergency content moderation                              │
│ • Quality assurance and testing                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Level 2: ORGANIZATION ADMIN                                 │
├─────────────────────────────────────────────────────────────┤
│ Access: SINGLE organization, organization's data only       │
│ Location: /organisations/[id]/* routes                      │
│ Purpose: Manage organization's content, users, settings     │
│                                                             │
│ Capabilities:                                               │
│ ✓ Manage organization profile                               │
│ ✓ Invite/manage organization members                        │
│ ✓ Create/edit/delete stories                                │
│ ✓ Upload documents and media                                │
│ ✓ Create blog posts                                         │
│ ✓ Review elder submissions                                  │
│ ✓ Manage projects                                           │
│ ✓ View organization analytics                               │
│ ✗ Cannot see other organizations                            │
│ ✗ Cannot access platform settings                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Level 3: ORGANIZATION MEMBER / STORYTELLER                  │
├─────────────────────────────────────────────────────────────┤
│ Access: Limited to own content + public org content         │
│ Location: /org/[slug]/* public routes                       │
│ Purpose: Contribute stories, view community content         │
│                                                             │
│ Capabilities:                                               │
│ ✓ View organization's public content                        │
│ ✓ Submit stories (pending approval)                         │
│ ✓ Edit own profile                                          │
│ ✓ View own submissions                                      │
│ ✗ Cannot manage organization                                │
│ ✗ Cannot see other members' drafts                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Current Implementation Analysis

```typescript
// ✅ GOOD: Super Admin Check (admin-auth.ts)
const is_super_admin = profile.email === 'benjamin@act.place'

// ✅ GOOD: Organization Permission Check (organization-permissions.ts)
const { data: membership } = await supabase
  .from('profile_organizations')
  .select('role, is_active')
  .eq('organization_id', organizationId)
  .eq('profile_id', userId)
  .single()

const isAdmin = role === 'admin' || role === 'owner'

// ⚠️ ISSUE: Redundant tenant_id checks
// projects table has both organization_id AND tenant_id
// stories table has both organization_id AND tenant_id
// Should standardize on organization_id only
```

---

## 2. Operational Workflows

### 2.1 Super Admin Workflows

#### Onboard New Organization

```
1. Super Admin logs into /admin
   ↓
2. Navigates to /admin/organisations
   ↓
3. Clicks "Create Organization"
   ↓
4. Fills in organization details:
   - Name: "A Curious Tractor"
   - Slug: "curious-tractor" (for URL routing)
   - Type: "Community Organization"
   - Contact: admin@acurioustractor.com
   ↓
5. System creates:
   - organizations record
   - organization_contexts record (empty, to be filled)
   ↓
6. Super Admin assigns first org admin:
   - Invites user via email
   - Creates profile_organizations record
   - Sets role = 'admin'
   ↓
7. Organization is now ready
   - Org admin can log in
   - Access via /organisations/[id]/dashboard
```

#### Monitor Organization Activity

```
Super Admin Dashboard (/admin)
├── Overview
│   ├── Total Organizations: 2
│   ├── Active Users: 45
│   └── Total Stories: 156
├── Organizations List
│   ├── Oonchiumpa (12 stories, 5 users)
│   └── A Curious Tractor (0 stories, 1 user)
└── System Health
    ├── Database Performance
    ├── Storage Usage by Org
    └── API Rate Limits
```

#### Access & Edit Organization Data (Full Access)

```
Purpose: Platform support, data fixes, quality assurance
Access Pattern:
  Super Admin → /admin/organisations/[id]/edit
  ↓
  Full read/write access to:
  - All stories (including drafts) - CAN EDIT
  - All documents - CAN EDIT/DELETE
  - All users - CAN MANAGE
  - Organization settings - CAN MODIFY
  - Activity logs - VIEW ONLY
  - Data sovereignty compliance checks

Examples:
  • Fix typo in published story across any organization
  • Help organization admin with technical issue
  • Migrate content from old system
  • Remove inappropriate content (emergency moderation)
  • Assist with bulk operations
  • QA testing on production data
```

### 2.2 Organization Admin Workflows

#### Log Into Organization Backend

```
1. Org Admin logs in with credentials
   ↓
2. System checks organization_members table
   - Finds organizations where profile_id = user.id
   - Filters by is_active = true
   ↓
3. If multiple organizations:
   - Shows organization selector
   - User picks "Oonchiumpa"
   ↓
4. Redirects to /organisations/[oonchiumpa-id]/dashboard
   ↓
5. Dashboard shows ONLY Oonchiumpa data:
   - Stories (Oonchiumpa only)
   - Documents (Oonchiumpa only)
   - Members (Oonchiumpa only)
   - Projects (Oonchiumpa only)
```

#### Manage Organization Content

```
Organization Dashboard (/organisations/[id]/dashboard)
├── Overview
│   ├── Stories: 12 (3 in review, 9 published)
│   ├── Documents: 5 (2 transcribed, 3 pending)
│   └── Members: 5 (1 admin, 4 members)
├── Content Management
│   ├── Stories (/organisations/[id]/stories)
│   ├── Documents (/organisations/[id]/documents)
│   ├── Blog Posts (/organisations/[id]/blog)
│   └── Media Gallery (/organisations/[id]/gallery)
├── Team Management
│   ├── Members (/organisations/[id]/members)
│   └── Invitations (/organisations/[id]/invitations)
└── Settings
    ├── Organization Profile
    ├── Context Management (mission/values)
    └── Cultural Protocols
```

#### Create Story from Document

```
1. Org Admin uploads interview recording
   → /organisations/[id]/documents/upload
   ↓
2. System transcribes (background job)
   → Creates source_documents record
   → Creates transcripts record
   → Both have organization_id = [id]
   ↓
3. AI analyzes transcript
   → Creates document_analysis record
   → Extracts themes, quotes
   ↓
4. Org Admin reviews analysis
   → /organisations/[id]/documents/[doc-id]/analysis
   ↓
5. Clicks "Create Story"
   → Pre-fills story editor with:
     - Selected quotes
     - Extracted themes
     - Source links
   ↓
6. Org Admin edits and saves
   → Creates stories record
   → story.organization_id = [id]
   → story.status = 'draft'
   ↓
7. If requires elder review:
   → story.requires_elder_review = true
   → Notifies elders
   ↓
8. Elder approves
   → story.review_status = 'approved'
   ↓
9. Org Admin publishes
   → story.status = 'published'
   → story.visibility = 'public'
```

---

## 3. Database Schema Alignment

### 3.1 Current State Analysis

```sql
-- ✅ CORRECT: Organizations as primary tenant
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,  -- For URL routing
  name TEXT NOT NULL,
  -- ... other fields
);

-- ✅ CORRECT: User-Organization membership
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  profile_id UUID REFERENCES profiles(id),
  role TEXT,  -- 'admin', 'member', 'viewer'
  is_active BOOLEAN DEFAULT true,
  UNIQUE(organization_id, profile_id)
);

-- ⚠️ QUESTION: Why separate tenants table?
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  -- ... tenant-specific billing/subscription fields
);

-- ❌ ISSUE: Redundant tenant_id in projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),  -- ✓ Keep this
  tenant_id UUID REFERENCES tenants(id),              -- ✗ Remove this
  -- ... other fields
);

-- ❌ ISSUE: Redundant tenant_id in stories
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),  -- ✓ Keep this
  tenant_id UUID,                                     -- ✗ Remove this
  -- ... other fields
);
```

### 3.2 Recommended Schema Cleanup

```sql
-- DECISION 1: Keep organizations as PRIMARY tenant
-- DECISION 2: Remove tenant_id from content tables
-- DECISION 3: Keep tenants table ONLY if needed for billing

-- Migration Plan:
-- Step 1: Ensure all content has organization_id
UPDATE projects SET organization_id = tenant_id::UUID
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

UPDATE stories SET organization_id = tenant_id::UUID
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

-- Step 2: Make organization_id required
ALTER TABLE projects ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE stories ALTER COLUMN organization_id SET NOT NULL;

-- Step 3: Remove tenant_id (future migration after verification)
-- ALTER TABLE projects DROP COLUMN tenant_id;
-- ALTER TABLE stories DROP COLUMN tenant_id;

-- Step 4: Update indexes for organization-based queries
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_stories_org_id ON stories(organization_id, created_at DESC);
CREATE INDEX idx_stories_org_status ON stories(organization_id, status, review_status);
```

### 3.3 Tenant Isolation via RLS

```sql
-- Helper function: Get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(organization_id)
  FROM organization_members
  WHERE profile_id = user_id AND is_active = true
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND (
      tenant_roles @> ARRAY['super_admin']::text[]
      OR email = 'benjamin@act.place'
    )
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policy: Stories (Organization Isolation with Super Admin Full Access)
CREATE POLICY stories_organization_isolation ON stories
  FOR SELECT USING (
    -- Super admin can see everything
    is_super_admin(auth.uid())
    OR
    -- Org members can see their org's content
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Super Admin: Full edit access (INSERT, UPDATE, DELETE)
CREATE POLICY stories_super_admin_full_access ON stories
  FOR ALL USING (
    is_super_admin(auth.uid())
  )
  WITH CHECK (
    is_super_admin(auth.uid())
  );

-- Organization Members: Edit their org's content
CREATE POLICY stories_organization_edit ON stories
  FOR INSERT
  WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY stories_organization_update ON stories
  FOR UPDATE USING (
    organization_id = ANY(get_user_organizations(auth.uid()))
  )
  WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY stories_organization_delete ON stories
  FOR DELETE USING (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- RLS Policy: Stories (Visibility Rules)
CREATE POLICY stories_visibility ON stories
  FOR SELECT USING (
    CASE
      -- Published public stories visible to all
      WHEN status = 'published' AND visibility = 'public' THEN true
      -- Organization members can see org content
      WHEN organization_id = ANY(get_user_organizations(auth.uid())) THEN true
      -- Authors can see their own drafts
      WHEN author_id = auth.uid() THEN true
      ELSE false
    END
  );

-- Apply same pattern to all content tables:
-- projects, documents, blog_posts, media, etc.
```

---

## 4. API Route Structure

### 4.1 Super Admin Routes

```typescript
// Platform-level administration
app/
└── api/
    └── admin/                              // Super admin only - FULL ACCESS
        ├── organisations/                  // List all organizations
        │   ├── route.ts                    // GET, POST
        │   └── [id]/
        │       ├── route.ts                // GET, PATCH, DELETE
        │       ├── stories/                // CRUD any org's stories
        │       │   └── [storyId]/
        │       │       └── route.ts        // GET, PATCH, DELETE
        │       ├── documents/              // CRUD any org's documents
        │       │   └── [docId]/
        │       │       └── route.ts        // GET, PATCH, DELETE
        │       ├── blog-posts/             // CRUD any org's blog posts
        │       └── members/                // Manage any org's members
        ├── users/                          // Platform user management
        │   └── route.ts
        ├── system/                         // System configuration
        │   ├── health/
        │   └── metrics/
        └── billing/                        // Platform billing (future)
            └── route.ts

// Middleware: Require super admin - GRANTS FULL ACCESS
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  // Super admin has access to all organizations
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .order('name')

  return NextResponse.json({ organizations: orgs })
}

// Super Admin: Edit ANY organization's story
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; storyId: string } }
) {
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServerClientWithServiceRole() // Service role bypasses RLS
  const body = await request.json()

  // Super admin can edit ANY story in ANY organization
  const { data: story, error } = await supabase
    .from('stories')
    .update(body)
    .eq('id', params.storyId)
    .eq('organization_id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ story })
}
```

### 4.2 Organization Admin Routes

```typescript
// Organization-scoped administration
app/
└── api/
    └── organizations/                      // Organization admins
        └── [orgId]/                        // Scoped to specific org
            ├── stories/
            │   ├── route.ts                // GET (org stories only), POST
            │   └── [storyId]/
            │       └── route.ts            // GET, PATCH, DELETE
            ├── documents/
            │   ├── upload/
            │   └── [docId]/
            │       ├── route.ts
            │       └── transcribe/
            ├── blog-posts/
            │   └── route.ts
            ├── members/                    // Org member management
            │   └── route.ts
            └── settings/
                └── route.ts

// Middleware: Require organization membership
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const supabase = createServerClient()

  // Check if user is member of this organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permissions = await checkOrganizationPermissions(params.orgId, user.id)

  if (!permissions.canView) {
    return NextResponse.json(
      { error: 'Not a member of this organization' },
      { status: 403 }
    )
  }

  // Query is automatically filtered by RLS
  // But we explicitly filter by organization_id for clarity
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('organization_id', params.orgId)  // Explicit filter
    .order('created_at', { ascending: false })

  return NextResponse.json({ stories })
}
```

### 4.3 Public Organization Routes

```typescript
// Public-facing organization content
app/
└── api/
    └── public/
        └── [orgSlug]/                      // Public access (no auth)
            ├── blog/
            │   └── route.ts                // Public blog posts
            ├── stories/
            │   └── route.ts                // Published public stories
            ├── about/
            │   └── route.ts                // Organization profile
            └── context/
                └── route.ts                // Organization mission/values

// Example: Public blog posts for organization website
export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const supabase = createClient()

  // Get organization by slug
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', params.orgSlug)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Get published public blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      stories:blog_post_stories(
        story:story_id(
          id,
          title,
          excerpt,
          storyteller:storyteller_id(display_name)
        )
      )
    `)
    .eq('organization_id', org.id)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false })

  return NextResponse.json({ blogPosts })
}
```

---

## 5. Frontend Route Structure

### 5.1 Super Admin Frontend

```typescript
// Super admin dashboard
src/app/
└── admin/                                  // Super admin only
    ├── layout.tsx                          // Check super admin auth
    ├── page.tsx                            // Platform dashboard
    ├── organisations/
    │   ├── page.tsx                        // List all organizations
    │   └── [id]/
    │       ├── page.tsx                    // Org details (admin view)
    │       └── audit/
    │           └── page.tsx                // Audit view (read-only)
    ├── users/
    │   └── page.tsx                        // Platform users
    ├── analytics/
    │   └── page.tsx                        // Platform analytics
    └── settings/
        └── page.tsx                        // Platform settings

// Layout: Check super admin
export default async function AdminLayout({ children }) {
  const user = await getCurrentUser()

  if (!user || !user.is_super_admin) {
    redirect('/unauthorized')
  }

  return (
    <div>
      <SuperAdminNav />
      {children}
    </div>
  )
}
```

### 5.2 Organization Admin Frontend

```typescript
// Organization-scoped dashboard
src/app/
└── organisations/                          // Organization admins
    └── [id]/                               // Scoped to organization
        ├── layout.tsx                      // Check org membership
        ├── dashboard/
        │   └── page.tsx                    // Org overview
        ├── stories/
        │   ├── page.tsx                    // List org stories
        │   ├── create/
        │   └── [storyId]/
        │       └── edit/
        ├── documents/
        │   ├── page.tsx                    // Document library
        │   └── upload/
        ├── blog/
        │   └── page.tsx                    // Blog post management
        ├── gallery/
        │   └── page.tsx                    // Media gallery
        ├── members/
        │   └── page.tsx                    // Org member management
        ├── projects/
        │   └── page.tsx                    // Project management
        └── settings/
            ├── profile/
            ├── context/                    // Mission/values management
            └── cultural-protocols/

// Layout: Check organization membership
export default async function OrganizationLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const permissions = await checkOrganizationPermissions(params.id, user.id)

  if (!permissions.canView) {
    redirect('/unauthorized')
  }

  // Get organization details
  const organization = await getOrganization(params.id)

  return (
    <div>
      <OrganizationNav
        organization={organization}
        permissions={permissions}
      />
      {children}
    </div>
  )
}
```

### 5.3 Public Organization Website Integration

```typescript
// Example: Oonchiumpa public website consuming Empathy Ledger API

// Separate Next.js project: oonchiumpa-website
// Uses Empathy Ledger as headless CMS

// app/blog/page.tsx
export default async function BlogPage() {
  // Fetch from Empathy Ledger public API
  const res = await fetch(
    'https://api.empathyledger.com/public/oonchiumpa/blog',
    { next: { revalidate: 300 } }  // Cache for 5 minutes
  )

  const { blogPosts } = await res.json()

  return (
    <div className="oonchiumpa-blog">
      <h1>Oonchiumpa Stories & News</h1>

      {blogPosts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>

          {/* Show linked stories */}
          <div className="story-attribution">
            <h3>Based on stories from:</h3>
            {post.stories.map(({ story }) => (
              <div key={story.id}>
                <a href={`/stories/${story.id}`}>
                  {story.title}
                </a>
                <span>by {story.storyteller.display_name}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
```

---

## 6. Testing Plan: Two Organizations

### 6.1 Organization 1: Oonchiumpa (Existing)

**Purpose:** First test case - existing organization with data

**Current State:**
- Organization exists in database
- Has blog posts (4 posts)
- Has transcripts (222 - needs verification of ownership)
- Has stories (0 Oonchiumpa stories, showing other orgs' stories)

**Test Objectives:**
1. ✅ Fix data isolation (show only Oonchiumpa data)
2. ✅ Verify organization admin can access dashboard
3. ✅ Test document upload → transcript → analysis → story workflow
4. ✅ Test story → blog post linking
5. ✅ Test public API for Oonchiumpa website

**Test Steps:**

```bash
# Step 1: Verify organization exists
curl https://api.empathyledger.com/api/admin/organisations | jq '.[] | select(.slug == "oonchiumpa")'

# Expected: Should return Oonchiumpa organization

# Step 2: Assign test org admin
# Super admin creates organization_members record:
INSERT INTO organization_members (organization_id, profile_id, role, is_active)
VALUES (
  (SELECT id FROM organizations WHERE slug = 'oonchiumpa'),
  'test-user-id',
  'admin',
  true
);

# Step 3: Test org admin login
# Log in as test user
# Navigate to /organisations/[oonchiumpa-id]/dashboard
# Verify sees ONLY Oonchiumpa data

# Step 4: Upload test document
# Upload interview recording
# Verify transcription works
# Verify AI analysis generates themes/quotes

# Step 5: Create story from analysis
# Select quotes and themes
# Create story draft
# Verify story.organization_id = oonchiumpa_id

# Step 6: Create blog post
# Link story to blog post
# Publish blog post
# Verify appears in public API

# Step 7: Test public API
curl https://api.empathyledger.com/api/public/oonchiumpa/blog

# Expected: Returns blog posts with linked stories
```

### 6.2 Organization 2: A Curious Tractor (New)

**Purpose:** Second test case - new organization onboarding

**Current State:**
- Organization does NOT exist yet
- Fresh start, no legacy data
- Clean test of onboarding workflow

**Test Objectives:**
1. ✅ Super admin creates new organization
2. ✅ Assign org admin
3. ✅ Org admin sets up context (mission/values)
4. ✅ Upload first document
5. ✅ Create first story
6. ✅ Verify complete isolation from Oonchiumpa

**Test Steps:**

```bash
# Step 1: Super admin creates organization
POST /api/admin/organisations
{
  "name": "A Curious Tractor",
  "slug": "curious-tractor",
  "type": "Community Organization",
  "contact_email": "admin@acurioustractor.com",
  "description": "Community-led storytelling and learning organization"
}

# Step 2: Invite org admin
POST /api/admin/organisations/[curious-tractor-id]/members/invite
{
  "email": "admin@acurioustractor.com",
  "role": "admin"
}

# Step 3: Org admin logs in
# Navigate to /organisations/[curious-tractor-id]/dashboard
# Should see EMPTY dashboard (no content yet)

# Step 4: Set up organization context
POST /api/organizations/[curious-tractor-id]/settings/context
{
  "mission": "To foster community learning through shared stories...",
  "values": ["Curiosity", "Community", "Connection"],
  "approach_description": "We use story as a tool for learning..."
}

# Step 5: Upload first document
POST /api/organizations/[curious-tractor-id]/documents/upload
# Upload test document

# Step 6: Create first story
# Follow same workflow as Oonchiumpa

# Step 7: Verify isolation
# Log in as Oonchiumpa admin
# Verify CANNOT see A Curious Tractor content

# Log in as A Curious Tractor admin
# Verify CANNOT see Oonchiumpa content

# Log in as super admin
# Verify CAN see BOTH organizations
```

---

## 7. Implementation Checklist

### Phase 1: Database Cleanup (Week 1)

**Objective:** Fix data isolation and remove redundancy

- [ ] Audit all tables with tenant_id
- [ ] Migrate all content to use organization_id
- [ ] Make organization_id required on all content tables
- [ ] Deploy RLS policies for organization isolation
- [ ] Test isolation with existing Oonchiumpa data
- [ ] Verify dashboard shows correct data

**Success Criteria:**
- All queries filtered by organization_id
- RLS policies block cross-organization access
- Dashboard shows accurate counts

### Phase 2: Organization Backend (Week 2)

**Objective:** Build organization-scoped admin interface

- [ ] Create organization dashboard route
- [ ] Build organization layout with auth check
- [ ] Create organization navigation
- [ ] Migrate existing admin pages to org-scoped routes
- [ ] Test with Oonchiumpa organization

**Success Criteria:**
- Organization admin can access dashboard
- Only sees own organization's data
- Cannot access other organizations

### Phase 3: Super Admin Interface (Week 3)

**Objective:** Build platform-level admin interface

- [ ] Create super admin dashboard
- [ ] Build organization list view
- [ ] Add organization creation form
- [ ] Build member invitation system
- [ ] Add audit/read-only views

**Success Criteria:**
- Super admin can view all organizations
- Can create new organizations
- Can assign organization admins
- Has read-only access to all data

### Phase 4: A Curious Tractor Onboarding (Week 4)

**Objective:** Test complete onboarding flow

- [ ] Super admin creates A Curious Tractor organization
- [ ] Invite and set up org admin
- [ ] Complete context setup (mission/values)
- [ ] Upload first document
- [ ] Create first story
- [ ] Verify isolation from Oonchiumpa

**Success Criteria:**
- New organization fully functional
- Complete data isolation verified
- All workflows tested end-to-end

---

## 8. Key Decisions & Principles

### 8.1 Design Principles

**1. Organizations are Primary Tenants**
- Use `organizations.id` as the primary tenant identifier
- Deprecate `tenant_id` in favor of `organization_id`
- Keep `tenants` table only if needed for billing/subscription

**2. Explicit Organization Filtering**
- Always filter by `organization_id` in queries
- Use RLS as safety net, not primary mechanism
- Make tenant isolation obvious in code

**3. Role-Based Access Control**
- Super admin: platform-level access
- Organization admin: organization-scoped access
- Organization member: limited content access

**4. Data Sovereignty**
- Each organization owns their data
- Organizations cannot see each other's data
- Super admin has **full edit access** for platform support and maintenance
- Super admin actions are logged for audit trail

**5. Clear Separation of Concerns**
```
/admin/*           → Super admin (platform level)
/organisations/*   → Organization admin (org level)
/org/*             → Public organization content
/api/admin/*       → Super admin APIs
/api/organizations/* → Organization-scoped APIs
/api/public/*      → Public APIs (no auth)
```

### 8.2 Technical Standards

**Query Pattern:**
```typescript
// ✅ ALWAYS include organization_id filter (for org admins)
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('organization_id', currentOrganizationId)

// ✅ Super admin can query across all organizations
if (user.is_super_admin) {
  // Service role client bypasses RLS
  const supabase = createServerClientWithServiceRole()

  // Can query without organization filter
  const { data } = await supabase
    .from('stories')
    .select('*')

  // Or filter by specific organization to help that org
  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('organization_id', targetOrganizationId)
}

// ❌ NEVER query without organization filter (for non-super-admin users)
const { data } = await supabase
  .from('stories')
  .select('*')
  // Missing .eq('organization_id', ...) - WRONG for org admins!
```

**Authentication Pattern:**
```typescript
// For organization routes:
const permissions = await checkOrganizationPermissions(orgId, userId)
if (!permissions.canView) return { error: 'Unauthorized' }

// For super admin routes:
const { user } = await requireSuperAdminAuth(request)
```

**RLS Pattern:**
```sql
-- Every content table needs this policy
CREATE POLICY [table]_organization_isolation ON [table]
  FOR ALL USING (
    is_super_admin(auth.uid())
    OR organization_id = ANY(get_user_organizations(auth.uid()))
  );
```

---

## 9. Super Admin Implementation Guide

### 9.1 Service Role Client for Super Admin

Super admins need to bypass RLS policies to edit any organization's data. This requires using the **service role client** instead of the regular authenticated client.

```typescript
// lib/supabase/service-role-client.ts

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Service role client - BYPASSES RLS
 * Only use for super admin operations
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY - required for super admin operations')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Get appropriate Supabase client based on user role
 * - Super admin: Service role client (bypasses RLS)
 * - Others: Regular client (enforces RLS)
 */
export async function getSupabaseClientForUser(userId: string) {
  const regularClient = createServerClient()

  // Check if user is super admin
  const { data: profile } = await regularClient
    .from('profiles')
    .select('email, tenant_roles')
    .eq('id', userId)
    .single()

  const isSuperAdmin =
    profile?.tenant_roles?.includes('super_admin') ||
    profile?.email === 'benjamin@act.place'

  if (isSuperAdmin) {
    console.log('🔐 Using service role client for super admin')
    return {
      client: createServiceRoleClient(),
      isSuperAdmin: true
    }
  }

  return {
    client: regularClient,
    isSuperAdmin: false
  }
}
```

### 9.2 Super Admin API Route Pattern

```typescript
// app/api/admin/organisations/[id]/stories/[storyId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET - Super admin can view any organization's story
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; storyId: string } }
) {
  // Verify super admin
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  // Use service role client to bypass RLS
  const supabase = createServiceRoleClient()

  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      organization:organization_id(id, name, slug),
      storyteller:storyteller_id(display_name, avatar_url),
      author:author_id(display_name)
    `)
    .eq('id', params.storyId)
    .eq('organization_id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ story })
}

/**
 * PATCH - Super admin can edit any organization's story
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; storyId: string } }
) {
  // Verify super admin
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()

  // Use service role client to bypass RLS
  const supabase = createServiceRoleClient()

  // Update story
  const { data: story, error } = await supabase
    .from('stories')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.storyId)
    .eq('organization_id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log super admin action
  await logSuperAdminAction({
    user_id: authResult.user.id,
    action: 'update_story',
    resource_type: 'story',
    resource_id: params.storyId,
    organization_id: params.id,
    changes: body
  })

  return NextResponse.json({ story })
}

/**
 * DELETE - Super admin can delete any organization's story
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; storyId: string } }
) {
  // Verify super admin
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  // Use service role client to bypass RLS
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', params.storyId)
    .eq('organization_id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log super admin action
  await logSuperAdminAction({
    user_id: authResult.user.id,
    action: 'delete_story',
    resource_type: 'story',
    resource_id: params.storyId,
    organization_id: params.id
  })

  return NextResponse.json({ success: true })
}
```

### 9.3 Super Admin Audit Logging

```typescript
// lib/audit/super-admin-logger.ts

interface SuperAdminAuditLog {
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  organization_id: string
  changes?: any
  timestamp?: string
}

export async function logSuperAdminAction(log: SuperAdminAuditLog) {
  const supabase = createServiceRoleClient()

  await supabase.from('super_admin_audit_logs').insert({
    ...log,
    timestamp: new Date().toISOString(),
    ip_address: await getRequestIP(),
    user_agent: await getRequestUserAgent()
  })

  // Also log to external service for immutable audit trail
  if (process.env.NODE_ENV === 'production') {
    await logToExternalAuditService(log)
  }
}

// Create audit logs table
/*
CREATE TABLE super_admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for audit queries
  INDEX idx_audit_user (user_id, timestamp DESC),
  INDEX idx_audit_org (organization_id, timestamp DESC),
  INDEX idx_audit_resource (resource_type, resource_id)
);

-- RLS: Super admins can view, only system can insert
ALTER TABLE super_admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY super_admin_audit_view ON super_admin_audit_logs
  FOR SELECT USING (is_super_admin(auth.uid()));

-- No policy for INSERT - only service role can insert
*/
```

### 9.4 Super Admin Frontend Routes

```typescript
// app/admin/organisations/[id]/edit/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function SuperAdminEditOrganizationPage() {
  const params = useParams()
  const orgId = params.id as string

  const [organization, setOrganization] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganizationData()
  }, [orgId])

  async function loadOrganizationData() {
    try {
      // Super admin can access any organization's data
      const [orgRes, storiesRes] = await Promise.all([
        fetch(`/api/admin/organisations/${orgId}`),
        fetch(`/api/admin/organisations/${orgId}/stories`)
      ])

      const orgData = await orgRes.json()
      const storiesData = await storiesRes.json()

      setOrganization(orgData.organization)
      setStories(storiesData.stories)
    } catch (error) {
      console.error('Error loading organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleEditStory(storyId: string, updates: any) {
    try {
      const res = await fetch(
        `/api/admin/organisations/${orgId}/stories/${storyId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      )

      if (res.ok) {
        alert('Story updated successfully by super admin')
        loadOrganizationData() // Reload
      }
    } catch (error) {
      console.error('Error updating story:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-4 bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-800 font-semibold">
          ⚠️ Super Admin Mode: You are editing {organization?.name}'s data
        </p>
        <p className="text-yellow-700 text-sm">
          All actions are logged for audit purposes
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-6">
        Edit Organization: {organization?.name}
      </h1>

      <div className="space-y-6">
        {stories.map(story => (
          <div key={story.id} className="border p-4 rounded">
            <h3 className="font-semibold">{story.title}</h3>
            <p className="text-sm text-gray-600">{story.excerpt}</p>
            <button
              onClick={() => handleEditStory(story.id, { /* updates */ })}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit Story
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 9.5 Super Admin Use Cases

**1. Fix Data Issues**
```typescript
// Super admin fixes a typo in a published story
PATCH /api/admin/organisations/[oonchiumpa-id]/stories/[story-id]
{
  "title": "Healing Through Connection" // Fixed typo
}
```

**2. Help Organization with Technical Issue**
```typescript
// Organization admin can't access their dashboard
// Super admin investigates and finds missing organization_members record
POST /api/admin/organisations/[org-id]/members
{
  "profile_id": "user-id",
  "role": "admin",
  "is_active": true
}
```

**3. Migrate Content Between Systems**
```typescript
// Super admin uploads bulk stories from old system
for (const story of oldSystemStories) {
  await supabase
    .from('stories')
    .insert({
      ...story,
      organization_id: targetOrgId,
      migrated_from: 'old_system',
      migrated_at: new Date().toISOString()
    })
}
```

**4. Emergency Content Moderation**
```typescript
// Remove inappropriate content immediately
DELETE /api/admin/organisations/[org-id]/stories/[story-id]
// Reason logged in audit trail
```

**5. Quality Assurance Testing**
```typescript
// Super admin tests story creation workflow on production
// Creates test story, verifies, then deletes
POST /api/admin/organisations/[test-org-id]/stories
// ... test workflow ...
DELETE /api/admin/organisations/[test-org-id]/stories/[test-story-id]
```

---

## 10. Operational Benefits

### 9.1 For Platform (Empathy Ledger)

✅ **Scalability**
- Can onboard unlimited organizations
- Shared infrastructure = cost efficient
- Single codebase for all organizations

✅ **Maintainability**
- Centralized updates benefit all organizations
- Consistent feature set
- Easier monitoring and support

✅ **Security**
- Database-enforced isolation
- Audit trail for all access
- Compliance-ready architecture

### 9.2 For Organizations (Oonchiumpa, A Curious Tractor)

✅ **Control**
- Own backend for managing content
- Team collaboration
- Cultural protocol enforcement

✅ **Integration**
- Use Empathy Ledger as headless CMS
- Public APIs for website integration
- Data export for sovereignty

✅ **Features**
- AI-powered analysis
- Elder review workflows
- Story-to-blog-post pipeline
- Media management

---

## 10. Next Actions

### Immediate (This Week):
1. ✅ Run database audit on tenant_id vs organization_id usage
2. ✅ Fix dashboard queries to use organization_id
3. ✅ Test with Oonchiumpa data
4. ✅ Document current data isolation issues

### Short-term (Next 2 Weeks):
1. 🔲 Deploy RLS policies for complete isolation
2. 🔲 Build organization dashboard route structure
3. 🔲 Migrate existing admin pages to org-scoped
4. 🔲 Test with Oonchiumpa organization admin

### Medium-term (Week 3-4):
1. 🔲 Build super admin interface
2. 🔲 Create organization onboarding workflow
3. 🔲 Onboard A Curious Tractor
4. 🔲 Verify complete isolation between organizations

---

**Document Status**: Ready for Implementation
**Review Status**: Pending stakeholder approval
**Implementation Priority**: HIGH - Critical for multi-tenant operations

---

*This operational design ensures Empathy Ledger can successfully serve multiple organizations while maintaining complete data sovereignty, security, and clear separation of concerns between platform and organization levels.*
