# Empathy Ledger Platform Architecture

## Overview
The Empathy Ledger is a multi-tenant storytelling platform designed for Indigenous communities and organizations. This document explains how profiles, storytellers, organizations, projects, stories, and transcripts all connect together.

## Core Data Model

### 1. **Profiles** (The Foundation)
```
profiles table
├── Basic info: name, email, bio, cultural_background
├── Flags: is_storyteller, is_elder, is_featured
├── Visibility: profile_visibility (public, private, draft, etc.)
├── Tenant: tenant_id (for multi-tenancy)
└── Relationships: Connected to organizations, projects, locations
```

**Key Concept**: Every person on the platform is a `profile`. They can have different roles and relationships.

### 2. **Multi-Tenancy System**
```
tenants table
├── Snow Foundation Tenant (special handling)
├── Other Organization Tenants
└── Independent/Default Tenant
```

**Purpose**: Data isolation between different organizations for privacy and security.

### 3. **Organizations**
```
organizations table
├── Name, description, contact info
├── Cultural significance, website
└── Related to: tenants, profiles, projects
```

**Examples**: Snow Foundation, Orange Sky, MMEIC, Independent Storytellers

### 4. **Projects**
```
projects table
├── Name, description, status
├── Belongs to: organization_id
├── Cultural protocols, consent requirements
└── Connected to: profiles, stories, transcripts
```

**Examples**: "Deadly Hearts Track", "MMEIC Cultural Initiative", "Orange Sky Community Services"

## Relationship System

### Profile ↔ Organization Relationships
```
profile_organizations table
├── profile_id → profiles
├── organization_id → organizations
├── role: 'storyteller', 'member', 'admin', 'Team Member'
├── is_active: boolean
└── Purpose: Track who belongs to which organizations and their role
```

**Logic**:
- A person can belong to multiple organizations
- They can have different roles in each organization
- Role determines permissions and how they appear in listings

### Profile ↔ Project Relationships
```
profile_projects table
├── profile_id → profiles
├── project_id → projects
├── role: 'contributor', 'participant', 'lead'
└── Purpose: Track who works on which projects
```

**Logic**:
- Projects are specific initiatives within organizations
- People contribute to projects based on their organization membership
- Project participation can span across organizations

### Profile ↔ Location Relationships
```
profile_locations table
├── profile_id → profiles
├── location_id → locations
├── is_primary: boolean
└── Purpose: Track where storytellers are based
```

## Content Model

### Stories
```
stories table
├── title, content, audio_url
├── author_id → profiles (the storyteller)
├── status: 'draft', 'published', 'archived'
├── cultural_context, consent_verified
├── tenant_id (for multi-tenancy)
└── Connected to: projects (via project assignments)
```

### Transcripts
```
transcripts table
├── title, content, audio_url
├── storyteller_id → profiles
├── project_id → projects (direct link)
├── status: 'pending', 'completed', 'published'
└── Raw material that can become stories
```

## Key Business Logic

### 1. **Consistent Tenant-Based Filtering**
```javascript
// All organizations use tenant-based filtering for performance and consistency
if (organization && organization !== 'all') {
  // Find the tenant_id for the selected organization
  const { data: orgData } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('name', organization)
    .single()

  if (orgData) {
    query = query.eq('tenant_id', orgData.tenant_id)
  }
}
```

**Why**: All organizations have their own tenant_id, providing consistent data isolation and efficient filtering.

### 2. **Profile Visibility System**
```
profile_visibility values:
├── 'public' → Visible to everyone
├── 'private' → Visible only to organization members
├── 'draft' → Visible only to admins
├── 'active'/'inactive' → Legacy statuses
└── 'suspended' → Blocked profiles
```

### 3. **Content Flow**
```
Storyteller Interview → Transcript (raw) → Story (refined) → Project → Organization
                    ↓                  ↓           ↓           ↓
                 project_id        author_id   assigned    belongs_to
```

## API Routes & Their Purpose

### Profile Management
```
/api/admin/storytellers
├── GET: List storytellers with filtering
├── POST: Create new storyteller profiles
├── PUT: Update storyteller details
└── DELETE: Deactivate storytellers

/api/admin/storytellers/[id]/relationships
├── GET: Get current org/project relationships
└── PUT: Update org/project assignments (with tenant_id sync)
```

### Organization & Project Management
```
/api/admin/orgs
├── GET: List all organizations
└── POST: Create new organizations

/api/admin/projects
├── GET: List all projects
└── POST: Create new projects
```

### Content Management
```
/api/stories
├── GET: List stories (filtered by permissions)
├── POST: Create new stories
└── PUT: Update story content

/api/transcripts
├── GET: List transcripts
├── POST: Create new transcripts
└── PUT: Update transcript status
```

## Filtering & Search Logic

### Organization Filtering
```javascript
// Consistent tenant-based filtering for all organizations
if (organization && organization !== 'all') {
  // Look up tenant_id for the organization
  const { data: orgData } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('name', organization)
    .single()

  if (orgData) {
    // Filter by tenant_id at database level for optimal performance
    query = query.eq('tenant_id', orgData.tenant_id)
  }
}
```

### Multi-Level Filtering
```javascript
// Profiles can be filtered by:
├── Organization membership (via profile_organizations)
├── Project participation (via profile_projects)
├── Location (via profile_locations)
├── Status (profile_visibility)
├── Flags (is_featured, is_elder)
└── Search (name, email, cultural_background)
```

## Data Consistency Rules

### 1. **Tenant Synchronization**
```javascript
// When updating organization relationships
if (orgRelationships.length > 0) {
  // Find primary organization (admin role or first organization)
  const primaryOrg = orgRelationships.find(rel => rel.role === 'admin') || orgRelationships[0]

  // Get tenant_id for the primary organization
  const { data: orgData } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('id', primaryOrg.organization_id)
    .single()

  // Update profile tenant_id to match their primary organization
  profile.tenant_id = orgData?.tenant_id || null
}
```

### 2. **Relationship Cascade**
- Removing from organization → Check project assignments
- Deactivating profile → Update all relationships
- Changing tenant → Update content ownership

### 3. **Permission Inheritance**
```
Organization Member → Can view organization projects
Project Contributor → Can view/edit project content
Storyteller → Can create stories in assigned projects
Admin → Can manage relationships and assignments
```

## Frontend Components

### Admin Interface
```
/admin/storytellers → Profile management with inline editing
├── StatusEditor → Change profile_visibility
├── LocationEditor → Update profile locations
├── RelationshipManager → Manage org/project assignments
└── Bulk operations → CSV export, batch updates
```

### Public Interface
```
/storytellers → Public storyteller directory
/stories → Published story listings
/organizations/[id] → Organization-specific views
└── Filtering respects profile_visibility settings
```

## Performance Optimizations

### 1. **Tenant-Based Queries**
- All organizations: Single tenant query (fast and consistent)
- Fallback to relationship joins only when tenant_id is not available

### 2. **Cached Relationships**
- Profile organizations loaded once per request
- Project relationships cached in profile data
- Location data pre-joined in main queries

### 3. **Pagination & Limits**
- Default 20 items per page
- Search/filter applied after main query
- Total counts calculated separately

## Security Model

### 1. **Multi-Tenant Isolation**
```javascript
// Data automatically filtered by tenant_id where applicable
// Prevents cross-organization data leakage
if (profile.tenant_id) {
  content = content.filter(item => item.tenant_id === profile.tenant_id)
}
```

### 2. **Role-Based Access**
```
Admin → Full access to all data
Organization Admin → Access to organization data only
Storyteller → Access to own content + assigned projects
Member → Read-only access to organization content
```

### 3. **Profile Visibility**
```javascript
// Content visibility based on profile settings
if (profile.profile_visibility === 'private') {
  // Only show to organization members
} else if (profile.profile_visibility === 'public') {
  // Show to everyone
}
```

This architecture ensures that:
✅ **Data integrity** - Relationships stay consistent
✅ **Performance** - Optimized queries for large datasets
✅ **Security** - Multi-tenant isolation and role-based access
✅ **Flexibility** - People can belong to multiple orgs/projects
✅ **Cultural sensitivity** - Proper consent and visibility controls