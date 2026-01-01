# Multi-Tenant Website Backend Strategy
## Empathy Ledger as Backend for Organization Websites

**Version:** 1.0
**Date:** October 26, 2025
**Status:** STRATEGIC ALIGNMENT - Implementation Ready

---

## Executive Summary

This document addresses the **critical data architecture issue** discovered in the Empathy Ledger system and provides a comprehensive strategy for using Empathy Ledger as a multi-tenant backend to support organization websites like Oonchiumpa.

### The Core Problem Identified

**Current Issue:** Dashboard showing "11 Stories in Review" but these are NOT Oonchiumpa stories - they belong to other organizations using the Empathy Ledger platform. The root cause is:

1. **Missing Organization Filtering**: Stories table has `organization_id` but queries don't consistently filter by it
2. **Inconsistent Tenant Isolation**: Mix of `organization_id`, `tenant_id`, and `project_id` across tables
3. **RLS Not Fully Enforced**: Row Level Security policies exist but aren't comprehensive
4. **Cross-Tenant Data Leakage**: Dashboard queries returning data from ALL organizations

### The Solution Architecture

This document defines a **complete multi-tenant data isolation strategy** that ensures:
- Each organization only sees and manages their own data
- Scalable architecture supporting 1000+ organizations
- Complete data sovereignty and OCAP® compliance
- Clear data flow from documents → stories → blog posts

---

## 1. Current State Assessment

### 1.1 Database Architecture Analysis

#### Existing Multi-Tenant Tables ✅

```typescript
// Good: Already have organization_id
organizations (organisations) - Primary tenant table ✅
  ├── organization_contexts - Organization-level context ✅
  ├── organization_members - User-org relationships ✅
  └── projects - Sub-tenant level ✅

stories - Has organization_id ✅
  ├── BUT: Queries don't always filter by it ❌
  └── Has both organization_id AND tenant_id (redundant) ⚠️

transcripts - Has organization_id ✅
  └── Properly isolated ✅

blog_posts - Has organization_id ✅
  └── Properly isolated ✅

profiles - Has tenant_roles (array) ⚠️
  └── Should use organization_members for role isolation ✅
```

#### Data Flow (Current vs. Needed)

**Current Flow (Incomplete):**
```
Transcripts → ??? → Stories → Blog Posts
     ↓                ↓
  organization_id   organization_id + tenant_id (redundant)
```

**Needed Flow:**
```
1. Source Documents (NEW TABLE NEEDED)
   ↓ [upload by organization staff]
2. Document Transcripts (EXISTS: transcripts table)
   ↓ [AI analysis]
3. Document Analysis (NEW TABLE NEEDED)
   ↓ [staff selects quotes/themes]
4. Stories (EXISTS but needs fixing)
   ↓ [elder review]
5. Blog Posts (EXISTS: blog_posts table)
   ↓ [publish to website]
6. Blog Post Stories Junction (NEW TABLE NEEDED)
```

### 1.2 Key Findings

**What Works ✅**
- Multi-tenant architecture foundation in place
- `organizations` table as primary tenant
- `organization_members` for user-org relationships
- `blog_posts` properly filtered by organization_id
- `transcripts` has organization_id

**What's Broken ❌**
- Dashboard queries don't filter stories by organization_id
- Stories table has redundant `tenant_id` and `organization_id`
- Missing `source_documents` table
- Missing `document_analysis` table
- Missing `blog_post_stories` junction table
- RLS policies incomplete

**Data Counts (From Your Analysis)**
```
✅ 4 blog posts (Oonchiumpa - correctly filtered)
✅ 222 transcripts (ownership needs verification)
❌ 301 stories (OTHER organizations - not Oonchiumpa!)
❌ 0 Oonchiumpa stories (need to create)
✅ 2 gallery photos
```

---

## 2. Complete Multi-Tenant Architecture Design

### 2.1 Tenant Isolation Hierarchy

```
Platform (Empathy Ledger)
├── Organization 1 (e.g., Oonchiumpa)
│   ├── Organization Context (mission, values, approach)
│   ├── Projects (optional sub-grouping)
│   │   └── Project Context (optional)
│   ├── Source Documents
│   ├── Transcripts
│   ├── Stories
│   ├── Blog Posts
│   └── Media Assets
├── Organization 2 (e.g., Another Community)
│   └── [Same structure, completely isolated]
└── Organization N
```

### 2.2 Database Schema (Complete)

#### Core Tables with Tenant Isolation

```sql
-- ============================================
-- TENANT DEFINITION (Already Exists)
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,  -- For subdomain routing
  name TEXT NOT NULL,
  website_url TEXT,
  cultural_significance TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Context (Already Exists)
CREATE TABLE organization_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core Identity
  mission TEXT,
  vision TEXT,
  values TEXT[],
  approach_description TEXT,
  cultural_frameworks TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- ============================================
-- PHASE 1: DOCUMENT MANAGEMENT (NEW)
-- ============================================

-- Source Documents Table (NEW - NEEDED)
CREATE TABLE source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Document Info
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT CHECK (document_type IN ('interview', 'pdf', 'video', 'audio', 'text')),
  file_path TEXT, -- Supabase Storage path
  file_size_bytes BIGINT,
  mime_type TEXT,

  -- Processing Status
  processing_status TEXT DEFAULT 'uploaded' CHECK (
    processing_status IN ('uploaded', 'transcribing', 'transcribed', 'analyzed', 'error')
  ),
  transcription_id UUID REFERENCES transcripts(id), -- Link to transcript

  -- Metadata
  uploaded_by UUID REFERENCES profiles(id),
  upload_date TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for organization lookups
CREATE INDEX idx_source_documents_org_id
ON source_documents(organization_id, created_at DESC);

-- Transcripts Table (EXISTS - Needs Enhancement)
-- ENHANCEMENT: Add source_document_id link
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS source_document_id UUID
  REFERENCES source_documents(id) ON DELETE SET NULL;

-- Document Analysis Table (NEW - NEEDED)
CREATE TABLE document_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,

  -- AI Analysis Results
  themes JSONB, -- Extracted themes with confidence scores
  quotes JSONB, -- Key quotes with metadata
  entities JSONB, -- People, places, events mentioned
  sentiment_analysis JSONB,
  cultural_significance JSONB,

  -- Processing Info
  ai_model_used TEXT,
  analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),

  -- Elder Review
  requires_elder_review BOOLEAN DEFAULT false,
  elder_reviewed BOOLEAN DEFAULT false,
  elder_review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(transcript_id)
);

CREATE INDEX idx_document_analysis_org_id
ON document_analysis(organization_id);

-- ============================================
-- PHASE 2: STORY CREATION (FIX EXISTING)
-- ============================================

-- Stories Table (EXISTS - NEEDS CLEANUP)
-- Current issue: Has both organization_id AND tenant_id
-- Solution: Remove tenant_id, use organization_id exclusively

-- Step 1: Ensure organization_id is populated for all stories
UPDATE stories
SET organization_id = tenant_id::UUID
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

-- Step 2: Make organization_id required
ALTER TABLE stories
ALTER COLUMN organization_id SET NOT NULL;

-- Step 3: Add source tracking
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS source_transcript_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source_analysis_ids UUID[] DEFAULT '{}';

-- Step 4: Clean up redundant tenant_id (future migration)
-- ALTER TABLE stories DROP COLUMN tenant_id; -- Do this after data migration

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_stories_org_id
ON stories(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stories_org_status
ON stories(organization_id, status, review_status);

-- ============================================
-- PHASE 3: BLOG INTEGRATION (NEW)
-- ============================================

-- Blog Posts Table (EXISTS - Already Good ✅)
-- Already has organization_id and proper filtering

-- Blog Post Stories Junction (NEW - NEEDED)
CREATE TABLE blog_post_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  -- Display Options
  display_type TEXT DEFAULT 'reference' CHECK (
    display_type IN ('reference', 'excerpt', 'embed')
  ),
  custom_excerpt TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blog_post_id, story_id)
);

CREATE INDEX idx_blog_post_stories_blog
ON blog_post_stories(blog_post_id, sort_order);

CREATE INDEX idx_blog_post_stories_story
ON blog_post_stories(story_id);
```

### 2.3 Row Level Security (RLS) Policies

```sql
-- ============================================
-- RLS POLICIES FOR COMPLETE TENANT ISOLATION
-- ============================================

-- Enable RLS on all tables
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_stories ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(organization_id)
  FROM organization_members
  WHERE profile_id = user_id AND is_active = true
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Source Documents RLS
CREATE POLICY source_documents_tenant_isolation ON source_documents
  FOR ALL USING (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Document Analysis RLS
CREATE POLICY document_analysis_tenant_isolation ON document_analysis
  FOR ALL USING (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Stories RLS (FIX EXISTING)
DROP POLICY IF EXISTS stories_tenant_isolation ON stories;

CREATE POLICY stories_tenant_isolation ON stories
  FOR ALL USING (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Additional Stories visibility policy
CREATE POLICY stories_visibility_check ON stories
  FOR SELECT USING (
    CASE
      WHEN visibility = 'public' AND status = 'published' THEN true
      WHEN visibility = 'organization' THEN
        organization_id = ANY(get_user_organizations(auth.uid()))
      WHEN visibility = 'private' THEN
        author_id = auth.uid() OR storyteller_id = auth.uid()
      ELSE false
    END
  );

-- Blog Posts RLS (Verify existing)
CREATE POLICY blog_posts_tenant_isolation ON blog_posts
  FOR ALL USING (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Public blog posts (for website display)
CREATE POLICY blog_posts_public_read ON blog_posts
  FOR SELECT USING (
    status = 'published' AND visibility = 'public'
  );

-- Blog Post Stories RLS
CREATE POLICY blog_post_stories_access ON blog_post_stories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.id = blog_post_stories.blog_post_id
      AND bp.organization_id = ANY(get_user_organizations(auth.uid()))
    )
  );
```

---

## 3. API Architecture for Organization Websites

### 3.1 API Routing Strategy

```typescript
// Next.js App Router Structure for Multi-Tenant APIs

app/
├── api/
│   ├── organizations/
│   │   └── [orgId]/
│   │       ├── documents/          # Source document management
│   │       │   ├── upload/        # POST: Upload new document
│   │       │   └── [docId]/       # GET, PATCH, DELETE
│   │       ├── transcripts/       # Transcript management
│   │       │   └── [transcriptId]/
│   │       │       └── analyze/   # POST: Trigger AI analysis
│   │       ├── analysis/          # Analysis results
│   │       │   └── [analysisId]/
│   │       ├── stories/           # Story management
│   │       │   ├── create/        # POST: Create from analysis
│   │       │   └── [storyId]/     # GET, PATCH, DELETE
│   │       └── blog-posts/        # Blog post management
│   │           ├── [postId]/
│   │           └── [postId]/stories/  # Link stories
│   │
│   └── public/
│       └── [orgSlug]/            # Public website APIs
│           ├── blog/             # GET: Public blog posts
│           ├── stories/          # GET: Public stories
│           └── context/          # GET: Organization info
```

### 3.2 Organization-Scoped Middleware

```typescript
// middleware.ts - Tenant isolation at API level

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient()

  // Extract organization from URL
  const orgIdMatch = request.nextUrl.pathname.match(/\/api\/organizations\/([^\/]+)/)
  if (!orgIdMatch) return NextResponse.next()

  const requestedOrgId = orgIdMatch[1]

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Verify user has access to this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('profile_id', user.id)
    .eq('organization_id', requestedOrgId)
    .eq('is_active', true)
    .single()

  if (!membership) {
    return NextResponse.json(
      { error: 'Access denied: Not a member of this organization' },
      { status: 403 }
    )
  }

  // Add organization context to headers
  const response = NextResponse.next()
  response.headers.set('X-Organization-Id', requestedOrgId)
  response.headers.set('X-Organization-Role', membership.role)

  return response
}

export const config = {
  matcher: '/api/organizations/:path*'
}
```

### 3.3 Example API Routes

```typescript
// app/api/organizations/[orgId]/stories/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const supabase = createServerClient()

  // RLS will automatically filter by organization
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id(display_name, avatar_url),
      author:author_id(display_name)
    `)
    .eq('organization_id', params.orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }

  return NextResponse.json({ stories })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const supabase = createServerClient()
  const body = await request.json()

  // Ensure organization_id is set correctly
  const storyData = {
    ...body,
    organization_id: params.orgId, // Force correct organization
    status: 'draft',
    review_status: 'pending'
  }

  const { data: story, error } = await supabase
    .from('stories')
    .insert(storyData)
    .select()
    .single()

  if (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }

  return NextResponse.json({ story }, { status: 201 })
}
```

---

## 4. Data Flow: Documents → Stories → Blog Posts

### 4.1 Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Document Upload & Processing                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Staff uploads interview recording/PDF                   │
│    → source_documents table                                 │
│                                                             │
│ 2. System transcribes (Whisper/Descript)                  │
│    → transcripts table (linked to source_document)         │
│                                                             │
│ 3. AI analyzes transcript                                  │
│    → document_analysis table                                │
│    - Extracts themes, quotes, entities                     │
│    - Calculates cultural significance                       │
│    - Flags for elder review if needed                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Story Creation                                     │
├─────────────────────────────────────────────────────────────┤
│ 4. Staff reviews analysis results                          │
│    - Selects key quotes                                     │
│    - Chooses themes                                         │
│    - Adds context                                           │
│                                                             │
│ 5. Staff creates story draft                               │
│    → stories table                                          │
│    - Links to source_transcript_ids                         │
│    - Links to source_analysis_ids                           │
│    - Adds media (photos/videos)                            │
│                                                             │
│ 6. Elder reviews story (if required)                       │
│    - Approves or requests changes                           │
│    - Adds cultural guidance                                 │
│    - story.review_status = 'approved'                       │
│                                                             │
│ 7. Story published                                          │
│    - story.status = 'published'                             │
│    - story.visibility = 'public'/'organization'             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Blog Post Creation                                 │
├─────────────────────────────────────────────────────────────┤
│ 8. Staff creates blog post                                  │
│    → blog_posts table                                       │
│    - Writes introduction/context                            │
│    - Sets SEO metadata                                      │
│                                                             │
│ 9. Staff links stories to blog post                        │
│    → blog_post_stories junction table                       │
│    - Selects which stories to include                       │
│    - Sets display order                                     │
│    - Chooses display type (reference/excerpt/embed)         │
│                                                             │
│ 10. Blog post published to website                         │
│     - blog_posts.status = 'published'                       │
│     - Visible on organization's public website              │
│     - Shows attribution to original stories                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Example: Oonchiumpa Use Case

```typescript
// Example workflow for Oonchiumpa organization

// Step 1: Upload interview recording
const { data: sourceDoc } = await supabase
  .from('source_documents')
  .insert({
    organization_id: OONCHIUMPA_ORG_ID,
    title: "Interview with Elder Mary",
    document_type: 'interview',
    file_path: 'organizations/oonchiumpa/interviews/elder-mary-2025.mp3',
    uploaded_by: currentUser.id
  })
  .select()
  .single()

// Step 2: Trigger transcription (background job)
await transcribeDocument(sourceDoc.id)

// Step 3: When transcript ready, trigger AI analysis
const { data: transcript } = await supabase
  .from('transcripts')
  .select('*')
  .eq('source_document_id', sourceDoc.id)
  .single()

const analysis = await analyzeTranscript(transcript.id)

// Step 4: Staff reviews analysis and creates story
const { data: story } = await supabase
  .from('stories')
  .insert({
    organization_id: OONCHIUMPA_ORG_ID,
    title: "Healing Through Connection",
    content: "... story content ...",
    source_transcript_ids: [transcript.id],
    source_analysis_ids: [analysis.id],
    storyteller_id: elderMary.id,
    status: 'draft',
    review_status: 'pending',
    requires_elder_review: true
  })
  .select()
  .single()

// Step 5: Elder reviews and approves
await supabase
  .from('stories')
  .update({
    review_status: 'approved',
    elder_approved: true,
    reviewed_by: elderReviewer.id,
    reviewed_at: new Date().toISOString()
  })
  .eq('id', story.id)

// Step 6: Publish story
await supabase
  .from('stories')
  .update({
    status: 'published',
    visibility: 'public',
    published_at: new Date().toISOString()
  })
  .eq('id', story.id)

// Step 7: Create blog post linking multiple stories
const { data: blogPost } = await supabase
  .from('blog_posts')
  .insert({
    organization_id: OONCHIUMPA_ORG_ID,
    title: "Stories of Healing and Community",
    content: "... blog post content ...",
    status: 'published',
    visibility: 'public'
  })
  .select()
  .single()

// Step 8: Link stories to blog post
await supabase
  .from('blog_post_stories')
  .insert([
    { blog_post_id: blogPost.id, story_id: story.id, sort_order: 1 },
    { blog_post_id: blogPost.id, story_id: anotherStory.id, sort_order: 2 }
  ])
```

---

## 5. Implementation Plan

### 5.1 Phase 1: Data Isolation Fix (URGENT - Week 1)

**Priority: CRITICAL** - Fix the immediate data leakage issue

**Tasks:**
1. ✅ Audit all database queries in dashboard
   - Find queries that fetch stories without organization_id filter
   - Add organization_id filter to ALL queries

2. ✅ Fix Dashboard Components
   ```typescript
   // BEFORE (Wrong)
   const { data: stories } = await supabase
     .from('stories')
     .select('*')
     .eq('status', 'review')  // ❌ Returns ALL organizations!

   // AFTER (Correct)
   const { data: stories } = await supabase
     .from('stories')
     .select('*')
     .eq('organization_id', currentOrganization.id)  // ✅ Filtered
     .eq('status', 'review')
   ```

3. ✅ Deploy RLS Policies
   - Enable RLS on all tables
   - Create organization isolation policies
   - Test with multiple test organizations

4. ✅ Verify Data Isolation
   - Create test query script
   - Verify each organization sees only their data
   - Test cross-organization access attempts

**Success Criteria:**
- [ ] Dashboard shows accurate counts (may be zero for some orgs)
- [ ] Stories filtered by organization_id in all queries
- [ ] RLS policies block cross-organization access
- [ ] Test organizations completely isolated

### 5.2 Phase 2: Document Management (Week 2-3)

**Tasks:**
1. ✅ Create `source_documents` table
2. ✅ Create `document_analysis` table
3. ✅ Build document upload API
4. ✅ Integrate transcription service (Whisper/Descript)
5. ✅ Build AI analysis pipeline (OpenAI/Claude)
6. ✅ Create document management UI

**Deliverables:**
- Document upload interface
- Transcription processing queue
- Analysis results dashboard
- Elder review queue for sensitive content

### 5.3 Phase 3: Story Creation Workflow (Week 4-5)

**Tasks:**
1. ✅ Fix stories table (remove tenant_id redundancy)
2. ✅ Add source tracking fields
3. ✅ Build story creation wizard
4. ✅ Implement "Create Story from Analysis" feature
5. ✅ Build elder review interface
6. ✅ Add story publishing workflow

**Deliverables:**
- Story creation wizard UI
- Analysis-to-story conversion tool
- Elder review dashboard
- Story publishing interface

### 5.4 Phase 4: Blog Integration (Week 6)

**Tasks:**
1. ✅ Create `blog_post_stories` junction table
2. ✅ Build story linking interface
3. ✅ Create blog post template system
4. ✅ Add story attribution display
5. ✅ Build public API for website integration

**Deliverables:**
- Blog post creation with story links
- Story attribution system
- Public API for organization websites
- Example Oonchiumpa website integration

### 5.5 Phase 5: Multi-Organization Scaling (Week 7-8)

**Tasks:**
1. ✅ Organization onboarding workflow
2. ✅ Subdomain routing setup
3. ✅ Organization context management
4. ✅ Data export tools (OCAP® compliance)
5. ✅ Performance optimization for 1000+ orgs

**Deliverables:**
- Organization signup flow
- Self-service organization management
- Data sovereignty tools
- Performance benchmarks

---

## 6. Scaling Strategy for Multiple Organizations

### 6.1 Technical Scaling Approach

```
Single Database with RLS (Current)
└── Scales to ~1,000 organizations
    - Shared schema
    - Policy-enforced isolation
    - Cost-effective
    - Good performance with proper indexing

Future: Database Sharding (Optional)
└── Scales to 10,000+ organizations
    - Shard by organization_id
    - Geographic distribution
    - Higher complexity
    - Only if needed
```

### 6.2 Performance Optimization

```sql
-- Critical indexes for multi-tenant performance

-- Stories by organization (most common query)
CREATE INDEX idx_stories_org_created
ON stories(organization_id, created_at DESC)
INCLUDE (status, review_status);

-- Blog posts by organization
CREATE INDEX idx_blog_posts_org_published
ON blog_posts(organization_id, published_at DESC)
WHERE status = 'published';

-- Organization member lookups
CREATE INDEX idx_org_members_user
ON organization_members(profile_id, is_active)
INCLUDE (organization_id, role);

-- Document processing queue
CREATE INDEX idx_source_docs_processing
ON source_documents(organization_id, processing_status, upload_date);
```

### 6.3 Caching Strategy

```typescript
// Organization-aware caching

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
})

export async function getCachedOrgStories(orgId: string) {
  const cacheKey = `org:${orgId}:stories:published`

  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  // Fetch from database
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(stories))

  return stories
}

// Invalidate cache on story update
export async function invalidateOrgCache(orgId: string) {
  await redis.del(`org:${orgId}:stories:published`)
  await redis.del(`org:${orgId}:blog_posts:published`)
}
```

---

## 7. Organization Website Integration

### 7.1 API Endpoints for Organization Websites

```typescript
// Public API for Oonchiumpa website to consume

// GET /api/public/oonchiumpa/blog
// Returns published blog posts with linked stories

export async function GET(request: NextRequest) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'oonchiumpa')
    .single()

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      stories:blog_post_stories(
        story:story_id(
          id,
          title,
          excerpt,
          story_image_url,
          storyteller:storyteller_id(display_name)
        )
      )
    `)
    .eq('organization_id', organization.id)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false })

  return NextResponse.json({ blogPosts })
}
```

### 7.2 Example Website Integration

```typescript
// Oonchiumpa Next.js website

// app/blog/page.tsx
export default async function BlogPage() {
  // Fetch from Empathy Ledger backend
  const res = await fetch('https://api.empathyledger.com/public/oonchiumpa/blog')
  const { blogPosts } = await res.json()

  return (
    <div>
      <h1>Oonchiumpa Blog</h1>
      {blogPosts.map(post => (
        <BlogPostCard key={post.id} post={post}>
          {/* Show linked stories */}
          <div className="linked-stories">
            <h3>Based on stories from:</h3>
            {post.stories.map(({ story }) => (
              <StoryReference key={story.id} story={story} />
            ))}
          </div>
        </BlogPostCard>
      ))}
    </div>
  )
}
```

---

## 8. Success Metrics & Monitoring

### 8.1 Data Isolation Metrics

```typescript
// Critical metrics to track

export const isolationMetrics = {
  // Cross-organization access attempts (should be 0)
  crossOrgAccessAttempts: counter('cross_org_access_attempts_total'),

  // RLS policy performance
  rlsPolicyLatency: histogram('rls_policy_duration_seconds'),

  // Organization data size
  orgDataSize: gauge('organization_data_size_bytes'),

  // Active organizations
  activeOrganizations: gauge('active_organizations_total')
}
```

### 8.2 Dashboard Accuracy Verification

```sql
-- Query to verify dashboard accuracy for each organization

WITH org_counts AS (
  SELECT
    o.id as organization_id,
    o.name,
    (SELECT COUNT(*) FROM stories s
     WHERE s.organization_id = o.id) as total_stories,
    (SELECT COUNT(*) FROM stories s
     WHERE s.organization_id = o.id
     AND s.status = 'review') as stories_in_review,
    (SELECT COUNT(*) FROM blog_posts bp
     WHERE bp.organization_id = o.id) as blog_posts,
    (SELECT COUNT(*) FROM transcripts t
     WHERE t.organization_id = o.id) as transcripts
  FROM organizations o
)
SELECT * FROM org_counts;

-- For Oonchiumpa specifically
SELECT
  'Stories in Review' as metric,
  COUNT(*) as count
FROM stories
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'oonchiumpa')
  AND status = 'review';
```

---

## 9. Conclusion & Recommendations

### 9.1 Immediate Actions Required

**CRITICAL (Do First):**
1. Fix dashboard queries to filter by organization_id
2. Deploy RLS policies for tenant isolation
3. Verify data isolation with test organizations
4. Audit ALL API routes for organization filtering

**HIGH PRIORITY (Week 1-2):**
1. Create source_documents and document_analysis tables
2. Build document upload and transcription pipeline
3. Implement story creation workflow from analysis
4. Create blog_post_stories junction table

**IMPORTANT (Week 3-4):**
1. Build organization onboarding flow
2. Create data export tools (OCAP® compliance)
3. Optimize performance for multi-tenant queries
4. Document API for organization websites

### 9.2 Why This Architecture Will Succeed

**✅ Scalable**: RLS-based multi-tenancy proven to scale to 1000+ organizations
**✅ Secure**: Database-enforced isolation prevents data leakage
**✅ Compliant**: Meets OCAP® principles for data sovereignty
**✅ Flexible**: Organizations can use as backend for any website
**✅ Cost-Effective**: Single database with logical isolation
**✅ Performant**: Proper indexing and caching strategies

### 9.3 Expected Outcomes

**For Oonchiumpa:**
- Dashboard shows accurate data (only Oonchiumpa content)
- Complete workflow: Documents → Analysis → Stories → Blog Posts
- Public API for website integration
- Full data sovereignty and control

**For Empathy Ledger Platform:**
- Can onboard unlimited organizations
- Each organization completely isolated
- Scalable architecture proven to work
- Reusable patterns for all organizations

---

## 10. Next Steps

### Immediate (Today):
1. ✅ Run audit query to verify current data isolation issue
2. ✅ Create test script to reproduce dashboard problem
3. ✅ Identify all queries that need organization_id filter

### This Week:
1. 🔲 Deploy data isolation fix to dashboard
2. 🔲 Enable RLS policies on all tables
3. 🔲 Create source_documents table migration
4. 🔲 Begin document upload API development

### Next Week:
1. 🔲 Complete document management system
2. 🔲 Build AI analysis pipeline
3. 🔲 Create story creation workflow
4. 🔲 Test end-to-end with Oonchiumpa data

---

**Document Status**: Ready for Implementation
**Review Status**: Pending stakeholder approval
**Implementation Priority**: URGENT - Critical data isolation issue

---

*This strategy ensures Empathy Ledger can successfully serve as a multi-tenant backend for organization websites while maintaining complete data sovereignty, security, and cultural sensitivity.*
