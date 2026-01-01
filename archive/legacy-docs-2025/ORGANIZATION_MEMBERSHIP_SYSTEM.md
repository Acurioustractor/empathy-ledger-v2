# Organization Membership System - Architecture & Usage Guide

## System Architecture Overview

The system uses a **dual-tracking approach** for managing relationships between profiles and organizations:

### 1. Primary System: Tenant-Based (tenant_id + tenant_roles)
- **Location**: `profiles.tenant_id` + `profiles.tenant_roles[]`
- **Purpose**: Primary method for associating storytellers with organizations
- **How it works**:
  - Each organization has a `tenant_id`
  - Profiles connected to that organization have matching `tenant_id`
  - Profile's `tenant_roles` array includes `"storyteller"` role

### 2. Secondary System: Profile Organizations Junction Table
- **Table**: `profile_organizations`
- **Purpose**: Explicit membership tracking with additional metadata
- **Columns**:
  - `profile_id`: UUID of the profile
  - `organization_id`: UUID of the organization
  - `role`: String (e.g., "storyteller", "Team Member", "admin")
  - `is_active`: Boolean
  - `joined_at`: Timestamp

**Note**: The `organization_members` table defined in TypeScript types **does NOT exist** in the actual database. Use `profile_organizations` instead.

## Current State for Oonchiumpa

**Organization**: Oonchiumpa
- **ID**: `c53077e1-98de-4216-9149-6268891ff62e`
- **Tenant ID**: `8891e1a9-92ae-423f-928b-cec602660011`

### Connected Profiles (via tenant_id + tenant_roles):
1. **Kristy Bloomfield** (`b59a1f4c-94fd-4805-a2c5-cac0922133e0`)
2. **Patricia Ann Miller** (`1971d21d-5037-4f7b-90ce-966a4e74d398`)
3. **Tanya Turner** (`dc85700d-f139-46fa-9074-6afee55ea801`)

### Profile Organizations Entries:
- 5 total entries in `profile_organizations` table for Oonchiumpa
- Includes the 3 storytellers above plus 2 additional profiles

## How to Add Storytellers to an Organization

### Method 1: Via API (POST /api/organisations/[id]/storytellers)
```typescript
// Request body
{
  "userId": "profile-uuid-here"
}

// What it does:
1. Sets profile.tenant_id = organization.tenant_id
2. Adds "storyteller" to profile.tenant_roles array
3. Creates entry in profile_organizations table (optional fallback)
```

### Method 2: Direct Database Update
```sql
-- Get organization's tenant_id
SELECT tenant_id FROM organizations WHERE id = 'org-id';

-- Update profile
UPDATE profiles
SET
  tenant_id = 'org-tenant-id',
  tenant_roles = tenant_roles || '["storyteller"]'::jsonb
WHERE id = 'profile-id';

-- Optionally add to profile_organizations
INSERT INTO profile_organizations (profile_id, organization_id, role, is_active, joined_at)
VALUES ('profile-id', 'org-id', 'storyteller', true, NOW());
```

## Member vs Connected Storyteller

### Member (via profile_organizations)
- **Purpose**: Flexible organizational membership
- **Roles**: Can be "admin", "Team Member", "storyteller", etc.
- **Status**: Can be active or inactive (`is_active` field)
- **Use case**: Tracking formal membership, roles, and permissions

### Connected Storyteller (via tenant_id + tenant_roles)
- **Purpose**: Content attribution and storyteller association
- **Primary indicator**: Used by queries to find storytellers for an organization
- **Use case**: Displaying storytellers, filtering content by organization

### Key Difference
- A profile can be a **member** (in `profile_organizations`) but not a **connected storyteller** (missing tenant_id or "storyteller" role)
- A profile can be a **connected storyteller** (via tenant_id + roles) but not have an explicit **member** entry
- **Best practice**: Maintain both for complete relationship tracking

## Frontend Implementation

### Current "Add Storyteller" Button Location
- **File**: `src/app/organisations/[id]/storytellers/page.tsx`
- **Lines**: 125-128 (header), 224-227 (empty state)
- **Status**: ⚠️ Button exists but NOT FUNCTIONAL (no onClick handler)

### What Needs to be Fixed
1. Add dialog/modal component for user selection
2. Implement API call to POST endpoint
3. Refresh storytellers list after adding
4. Add error handling and success feedback

## Issues Found

### ✅ Fixed Issues
1. API route was selecting non-existent `avatar_url` field (fixed: now uses `profile_image_url`)
2. API route referenced non-existent `profile.location` field (fixed: set to undefined)

### ⚠️ Pending Issues
1. **"Add Storyteller" button is not functional** - no click handler implemented
2. Need user search/selection UI for adding storytellers
3. Missing success/error toast notifications

## Recommended Implementation Plan

1. Create `AddStorytellerDialog` component with user search
2. Wire up "Add Storyteller" button to open dialog
3. Implement user search API endpoint (or reuse existing)
4. Call POST `/api/organisations/[id]/storytellers` on selection
5. Refresh page data on success
6. Add toast notifications for feedback
