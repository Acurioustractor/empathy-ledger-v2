# Multi-Tenant Project Ecosystem Design

## Overview
This document outlines the design for a comprehensive project ecosystem that supports:
- Projects linked to multiple organizations (many-to-many)
- Standalone community projects
- Rich content connections (stories, storytellers, media)
- Proper tenant isolation and access control

## Current Architecture Issues

### Current State
- Projects have a single `organization_id` (one-to-many)
- Content is connected by `tenant_id` only
- No explicit project-content relationships

### Desired State  
- Projects can belong to multiple organizations
- Direct project-content relationships
- Flexible tenant/organization access patterns

## Proposed Database Schema

### Core Tables

#### `projects` (Enhanced)
```sql
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    status text DEFAULT 'active',
    
    -- Location and timing
    location text,
    start_date date,
    end_date date,
    
    -- Financial
    budget numeric,
    
    -- Tenant relationship (primary tenant for access control)
    tenant_id uuid NOT NULL,
    
    -- Creator tracking
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

#### `project_organizations` (New - Many-to-Many)
```sql
CREATE TABLE project_organizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Relationship metadata
    role text DEFAULT 'participant', -- lead, participant, sponsor, etc.
    joined_at timestamptz DEFAULT now(),
    
    -- Unique constraint
    UNIQUE(project_id, organization_id)
);
```

#### `project_stories` (New - Explicit Content Links)
```sql
CREATE TABLE project_stories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
    
    -- Relationship context
    connection_type text DEFAULT 'related', -- featured, related, background
    added_by uuid REFERENCES profiles(id),
    added_at timestamptz DEFAULT now(),
    
    UNIQUE(project_id, story_id)
);
```

#### `project_members` (New - Direct Project Participation)
```sql
CREATE TABLE project_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Member role in project
    role text DEFAULT 'member', -- lead, coordinator, member, contributor
    joined_at timestamptz DEFAULT now(),
    
    UNIQUE(project_id, profile_id)
);
```

#### `project_media` (New - Direct Media Connections)
```sql
CREATE TABLE project_media (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    media_asset_id uuid REFERENCES media_assets(id) ON DELETE CASCADE,
    
    -- Media context
    usage_type text DEFAULT 'gallery', -- hero, gallery, documentation
    caption text,
    added_by uuid REFERENCES profiles(id),
    added_at timestamptz DEFAULT now(),
    
    UNIQUE(project_id, media_asset_id)
);
```

## Access Control & Tenant Isolation

### Multi-Level Access Model

1. **Tenant Level** - Primary isolation boundary
   - All users/content within a tenant can see each other
   - Projects have a primary `tenant_id` for base access control

2. **Organization Level** - Secondary grouping
   - Organizations can "adopt" or sponsor projects via `project_organizations`
   - Multiple organizations can be connected to one project
   - Organization members get enhanced access to their org's projects

3. **Project Level** - Explicit participation
   - Direct project membership via `project_members`
   - Project-specific roles and permissions

### Access Logic
```typescript
// User can access project if:
// 1. Same tenant as project (base access)
// 2. Member of organization linked to project (enhanced access)  
// 3. Direct project member (full access)
// 4. Admin role (override access)

function canAccessProject(user: Profile, project: Project): boolean {
  // Same tenant - base access
  if (user.tenant_id === project.tenant_id) return true;
  
  // Admin override
  if (user.tenant_roles?.includes('admin')) return true;
  
  // Organization member
  const userOrgs = getUserOrganizations(user.id);
  const projectOrgs = getProjectOrganizations(project.id);
  if (hasOverlap(userOrgs, projectOrgs)) return true;
  
  // Direct project member
  if (isProjectMember(user.id, project.id)) return true;
  
  return false;
}
```

## Implementation Strategy

### Phase 1: Enhanced Content Display (Current)
- ✅ Add related stories, storytellers to project pages
- ✅ Improve organization linking in project display
- ✅ Better project navigation

### Phase 2: Multi-Organization Support
- Create `project_organizations` table
- Update project creation/editing to support multiple orgs
- Migrate existing `organization_id` data to new table
- Update access control logic

### Phase 3: Explicit Content Relationships
- Create `project_stories`, `project_members`, `project_media` tables
- Add UI for managing project content connections
- Migrate implicit tenant-based connections to explicit relationships

### Phase 4: Advanced Project Features
- Project-specific permissions and roles
- Project collaboration tools
- Advanced project analytics across organizations

## Benefits

### For Organizations
- Can collaborate on shared initiatives
- Maintain their own project portfolios
- Sponsor community projects without full ownership

### for Projects
- Can have multiple sponsors/supporters
- Access to broader community resources
- Flexible governance models

### For Community
- Better discovery of related projects
- Cross-organization collaboration
- Richer project context and connections

## Migration Strategy

1. **Backwards Compatible**: Keep existing `organization_id` field during transition
2. **Gradual Migration**: Move data to new tables incrementally  
3. **Dual Support**: Support both old and new relationship models temporarily
4. **User-Driven**: Let users/admins choose how to reorganize existing projects

This design provides the flexibility you need for both standalone community projects and complex multi-organization initiatives, while maintaining proper tenant isolation and access control.