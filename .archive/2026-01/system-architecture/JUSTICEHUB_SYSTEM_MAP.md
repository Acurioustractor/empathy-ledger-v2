# JusticeHub Integration System Map

## Overview
Complete system documentation for Empathy Ledger's JusticeHub integration, including all frontend components, API routes, database schema, and user workflows.

---

## 1. Core Architecture

### Data Flow
```
Storyteller → ShareYourStoryModal → API → Supabase → JusticeHub Sync
    ↓              ↓                 ↓         ↓              ↓
  Profile     Syndication      consent_logs  stories       Webhook
  Controls    Preferences      & audit_logs  & profiles    Handler
```

### System Components
- **Frontend Layer**: React components for user interactions
- **API Layer**: Next.js API routes for data operations
- **Database Layer**: Supabase tables with RLS policies
- **Webhook Layer**: JusticeHub synchronization handlers

---

## 2. Database Schema

### Core Tables
```sql
-- profiles table
- id (UUID)
- email (STRING)
- justicehub_enabled (BOOLEAN) -- User opted into JusticeHub
- justicehub_featured (BOOLEAN) -- Profile featured on JusticeHub
- justicehub_role (STRING) -- Role in JusticeHub (storyteller, elder, keeper)
- justicehub_synced_at (TIMESTAMP) -- Last sync time

-- stories table
- id (UUID)
- title (STRING)
- content (TEXT)
- privacy_level (ENUM: public, community, private, restricted)
- is_public (BOOLEAN) -- Publicly searchable
- justicehub_featured (BOOLEAN) -- Featured on JusticeHub
- created_by (UUID) → profiles.id
- organization_id (UUID) → organizations.id
- visibility (ENUM: public, community, organisation, private)

-- organizations table
- id (UUID)
- name (STRING)
- justicehub_enabled (BOOLEAN)
- justicehub_synced_at (TIMESTAMP)
- justicehub_program_type (STRING)

-- projects table
- id (UUID)
- title (STRING)
- justicehub_enabled (BOOLEAN)
- justicehub_program_type (STRING)
- organization_id (UUID)

-- syndication_consents table
- id (UUID)
- storyteller_id (UUID) → profiles.id
- platform (STRING: 'justicehub', 'harvest', 'act-farm')
- status (ENUM: pending, granted, revoked)
- granted_at (TIMESTAMP)
- revoked_at (TIMESTAMP)
- consent_notes (TEXT)

-- consent_logs table
- id (UUID)
- storyteller_id (UUID)
- action (STRING: 'shared', 'revoked', 'updated')
- platform (STRING)
- timestamp (TIMESTAMP)
- metadata (JSONB)

-- audit_logs table
- id (UUID)
- user_id (UUID)
- action (STRING)
- resource_type (STRING)
- resource_id (UUID)
- timestamp (TIMESTAMP)
- changes (JSONB)
```

---

## 3. Frontend Components

### 3.1 User-Facing Components

#### ShareYourStoryModal.tsx
**Location**: `src/components/stories/ShareYourStoryModal.tsx`
**Purpose**: Allow storytellers to share stories with JusticeHub and other platforms
**Props**:
```typescript
{
  isOpen: boolean
  onClose: () => void
  storyId: string
  storyTitle: string
  onSuccess?: (platformsSharedTo: string[]) => void
}
```
**Features**:
- Multi-platform selection (JusticeHub, The Harvest, ACT Farm)
- Consent tracking and display
- Story metadata preview
- Platform-specific sharing options

**User Flow**:
1. Storyteller opens a story they've written
2. Clicks "Share Your Story" button
3. Modal displays available platforms
4. User selects platforms and consents to terms
5. Story is shared to selected platforms
6. Confirmation message and tracking shown

---

#### SyndicationConsentList.tsx
**Location**: `src/components/dashboard/SyndicationConsentList.tsx`
**Purpose**: Display all active and revoked syndication consents
**Features**:
- List of all syndication agreements
- Status indicators (active, revoked, pending)
- Revoke consent button
- Timestamp information
- Platform logos and details

**Data Structure**:
```typescript
interface SyndicationConsent {
  id: string
  platform: 'justicehub' | 'harvest' | 'act-farm'
  status: 'pending' | 'granted' | 'revoked'
  grantedAt?: string
  revokedAt?: string
  storyCount?: number
}
```

---

#### StoryConnectionsDashboard.tsx
**Location**: `src/components/dashboard/StoryConnectionsDashboard.tsx`
**Purpose**: Visualize story distribution across platforms
**Features**:
- Map view of story locations
- Platform distribution chart
- Story search and filter
- Connection details and metadata
- Audience reach statistics

---

#### PrivacySettingsPanel.tsx
**Location**: `src/components/settings/PrivacySettingsPanel.tsx`
**Purpose**: Comprehensive privacy and data control interface
**Sections**:
1. Visibility Settings
2. Data Sovereignty Preferences
3. Syndication Control
4. Access Permissions
5. Data Export Options

**Settings Available**:
```typescript
{
  profileVisibility: 'public' | 'community' | 'private'
  storyDefaultVisibility: 'public' | 'community' | 'organisation' | 'private'
  allowJusticeHubSharing: boolean
  dataExportEnabled: boolean
  analyticsTracking: boolean
  consentRequired: boolean
}
```

---

#### VisibilitySelector.tsx
**Location**: `src/components/common/VisibilitySelector.tsx`
**Purpose**: Dropdown/toggle component for story visibility
**Options**:
- **Public**: Visible to everyone, searchable, shareable
- **Community**: Visible to authenticated users
- **Organisation**: Visible to org members only
- **Private**: Visible to owner and invited users only
- **Restricted**: Requires elder approval before access

---

#### DataSovereigntyPreferences.tsx
**Location**: `src/components/settings/DataSovereigntyPreferences.tsx`
**Purpose**: OCAP principles-based data control
**OCAP Framework**:
- **Ownership**: Who owns the data
- **Control**: Who controls access
- **Access**: Who can access it
- **Possession**: Physical/technical possession

---

### 3.2 Admin Components

#### admin/storytellers/page.tsx
**Location**: `src/app/admin/storytellers/page.tsx`
**Purpose**: Manage storyteller profiles and JusticeHub status
**Admin Features**:
- List all storytellers
- Toggle `justicehub_featured` status
- View JusticeHub sync status
- Set JusticeHub role
- Manage storyteller permissions

**Admin Table Columns**:
| Column | Type | Editable |
|--------|------|----------|
| Name | String | No |
| Email | String | No |
| JusticeHub Enabled | Toggle | Yes |
| JusticeHub Featured | Toggle | Yes |
| JusticeHub Role | Select | Yes |
| Last Synced | DateTime | No |
| Actions | Buttons | Yes |

---

#### admin/stories/page.tsx
**Location**: `src/app/admin/stories/page.tsx`
**Purpose**: Manage stories and JusticeHub promotion
**Admin Features**:
- List all stories
- Toggle `justicehub_featured` status
- Manage privacy levels
- View distribution status
- Audit story modifications

**Admin Table Columns**:
| Column | Type | Editable |
|--------|------|----------|
| Title | String | Yes |
| Author | String | No |
| Privacy | Select | Yes |
| JusticeHub Featured | Toggle | Yes |
| Shared Platforms | Tags | No |
| Created | DateTime | No |
| Actions | Buttons | Yes |

---

## 4. API Routes

### 4.1 Storyteller Management

#### GET /api/admin/storytellers
**Purpose**: Fetch all storytellers with JusticeHub status
**Query Params**:
```typescript
{
  search?: string
  justicehub_enabled?: boolean
  justicehub_featured?: boolean
  page?: number
  limit?: number
}
```
**Response**:
```typescript
{
  storytellers: Storyteller[]
  total: number
  page: number
}
```

---

#### PUT /api/admin/storytellers/[id]
**Purpose**: Update storyteller JusticeHub settings
**Request Body**:
```typescript
{
  justicehub_enabled?: boolean
  justicehub_featured?: boolean
  justicehub_role?: string
  justicehub_notes?: string
}
```
**Response**:
```typescript
{
  storyteller: Storyteller
  updated_at: string
  synced: boolean
}
```

**Implementation**:
```typescript
// Location: src/app/api/admin/storytellers/[id]/route.ts
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServiceClient()
  const body = await request.json()

  // Validate admin access
  // Update profile with new JusticeHub settings
  // Log audit trail
  // Trigger JusticeHub sync if needed
  // Return updated storyteller
}
```

---

### 4.2 Story Management

#### GET /api/admin/stories
**Purpose**: Fetch stories with JusticeHub distribution info
**Query Params**:
```typescript
{
  search?: string
  privacy_level?: string
  justicehub_featured?: boolean
  organization_id?: string
  page?: number
  limit?: number
}
```

---

#### PUT /api/admin/stories/[id]
**Purpose**: Update story JusticeHub settings
**Request Body**:
```typescript
{
  privacy_level?: string
  is_public?: boolean
  justicehub_featured?: boolean
  visibility?: string
}
```

---

### 4.3 Syndication Management

#### POST /api/stories/[id]/share
**Purpose**: Share a story to a platform
**Request Body**:
```typescript
{
  platforms: ('justicehub' | 'harvest' | 'act-farm')[]
  consentGranted: boolean
  consentNotes?: string
}
```
**Response**:
```typescript
{
  success: boolean
  platformsSharedTo: string[]
  consentLogId: string
  timestamp: string
}
```

**Implementation Flow**:
1. Validate storyteller owns the story
2. Verify consent is properly granted
3. Create syndication_consent records
4. Log action to consent_logs
5. Trigger platform sync webhooks
6. Return success confirmation

---

#### GET /api/storyteller/consents
**Purpose**: Fetch all syndication consents for current user
**Query Params**:
```typescript
{
  status?: 'pending' | 'granted' | 'revoked'
  platform?: string
}
```
**Response**:
```typescript
{
  consents: SyndicationConsent[]
  activeCount: number
  revokedCount: number
}
```

---

#### DELETE /api/storyteller/consents/[id]
**Purpose**: Revoke a syndication consent
**Response**:
```typescript
{
  success: boolean
  revokedAt: string
  platform: string
}
```

**Revocation Process**:
1. Verify storyteller owns the consent
2. Mark consent as revoked
3. Log revocation to consent_logs
4. Trigger platform unsync webhooks
5. Remove stories from platform if applicable

---

### 4.4 Privacy Settings

#### GET /api/storyteller/privacy-settings
**Purpose**: Fetch current privacy settings
**Response**:
```typescript
{
  profileVisibility: string
  storyDefaultVisibility: string
  allowJusticeHubSharing: boolean
  dataExportEnabled: boolean
  analyticsTracking: boolean
  consentRequired: boolean
}
```

---

#### PUT /api/storyteller/privacy-settings
**Purpose**: Update privacy settings
**Request Body**:
```typescript
{
  profileVisibility?: string
  storyDefaultVisibility?: string
  allowJusticeHubSharing?: boolean
  dataExportEnabled?: boolean
  analyticsTracking?: boolean
  consentRequired?: boolean
}
```

---

## 5. User Workflows

### 5.1 Storyteller Sharing Flow
```
1. Storyteller writes story
2. Story visibility set (public/community/private)
3. Story published/submitted for review
4. Admin approves story
5. Storyteller views story in dashboard
6. Clicks "Share Your Story" button
7. ShareYourStoryModal opens
8. Storyteller selects platforms (JusticeHub, Harvest, etc)
9. Reviews story preview and platform policies
10. Grants consent
11. Story shared to selected platforms
12. Confirmation email sent
13. Story appears in SyndicationConsentList
14. Storyteller can revoke consent anytime
```

### 5.2 Admin Promotion Flow
```
1. Admin logs in to admin panel
2. Navigates to Stories or Storytellers
3. Views list with JusticeHub status
4. Selects story/storyteller to promote
5. Toggles "Featured on JusticeHub" checkbox
6. Confirms action
7. Setting persists to database
8. Webhook triggered for JusticeHub sync
9. Content appears/disappears from JusticeHub
10. Admin sees confirmation message
```

### 5.3 Privacy Control Flow
```
1. Storyteller accesses Privacy Settings
2. Views current settings for each category
3. Can toggle individual permissions
4. Sets default story visibility
5. Configures data sovereignty preferences
6. Reviews active syndication consents
7. Can revoke any consent from list
8. Changes saved immediately
9. Receives confirmation notification
10. All changes logged to audit_logs
```

---

## 6. Integration Points

### 6.1 JusticeHub Webhook Endpoint
**Location**: `src/app/api/webhooks/justicehub/route.ts`
**Purpose**: Receive updates from JusticeHub about shared stories
**Events**:
- `story.viewed` - Story was viewed on JusticeHub
- `story.shared` - Story was shared from JusticeHub
- `story.updated` - Story metadata updated
- `story.flagged` - Story flagged for review

---

### 6.2 Supabase Realtime Subscriptions
**Purpose**: Real-time updates for syndication status
```typescript
supabase
  .channel('syndication_consents')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'syndication_consents' },
    (payload) => {
      // Update UI with new consent status
    }
  )
  .subscribe()
```

---

### 6.3 Email Notifications
**Triggers**:
- Story shared to platform
- Consent revoked
- Story removed from platform
- Admin featured story on JusticeHub
- Privacy settings changed

---

## 7. Security & Access Control

### 7.1 Row Level Security (RLS)

#### syndication_consents table
```sql
-- Storytellers can see/manage only their own consents
CREATE POLICY "Users can view their own consents"
  ON syndication_consents
  FOR SELECT
  USING (storyteller_id = auth.uid());

-- Admins can view all consents
CREATE POLICY "Admins can view all consents"
  ON syndication_consents
  FOR SELECT
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
```

#### consent_logs table
```sql
-- Storytellers can view their own logs
CREATE POLICY "Users can view their own logs"
  ON consent_logs
  FOR SELECT
  USING (storyteller_id = auth.uid());

-- Immutable logs (no updates/deletes)
CREATE POLICY "Logs are append-only"
  ON consent_logs
  FOR INSERT
  WITH CHECK (true);
```

---

### 7.2 Admin Authorization
```typescript
// Check admin status before allowing operations
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

export async function PUT(request: NextRequest) {
  const admin = await requireAdminAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Proceed with admin operation
}
```

---

## 8. Audit & Compliance

### 8.1 Audit Log Structure
```typescript
interface AuditLog {
  id: string
  userId: string
  action: string // 'shared', 'revoked', 'featured', 'updated'
  resourceType: string // 'story', 'profile', 'consent'
  resourceId: string
  timestamp: string
  changes: {
    before: Record<string, any>
    after: Record<string, any>
  }
  ipAddress?: string
  userAgent?: string
}
```

### 8.2 Consent Log Structure
```typescript
interface ConsentLog {
  id: string
  storytellerId: string
  action: 'shared' | 'revoked' | 'updated'
  platform: string
  timestamp: string
  metadata: {
    storyId?: string
    storyTitle?: string
    consentNotes?: string
    previousStatus?: string
  }
}
```

---

## 9. Testing Checklist

### Unit Tests
- [ ] ShareYourStoryModal shares to correct platforms
- [ ] SyndicationConsentList displays consents correctly
- [ ] PrivacySettingsPanel updates settings
- [ ] API endpoints validate admin access
- [ ] Consent creation/revocation logic

### Integration Tests
- [ ] End-to-end story sharing flow
- [ ] Admin can toggle JusticeHub featured status
- [ ] Storyteller can revoke consent
- [ ] Privacy settings affect story visibility
- [ ] Audit logs capture all actions

### E2E Tests
- [ ] Storyteller signs in, writes story, shares to JusticeHub
- [ ] Admin reviews story, promotes to featured
- [ ] Story appears on JusticeHub
- [ ] Storyteller revokes consent
- [ ] Story removed from JusticeHub

---

## 10. Deployment Checklist

- [ ] Environment variables configured for JusticeHub API
- [ ] Database migrations run (new tables created)
- [ ] RLS policies enabled on all tables
- [ ] Webhook endpoint live and tested
- [ ] Email notifications configured
- [ ] Admin users assigned appropriate roles
- [ ] Supabase realtime enabled
- [ ] Production secrets rotated
- [ ] Error monitoring enabled
- [ ] User documentation updated

---

## 11. Quick Reference

### Key Files
| Purpose | File |
|---------|------|
| Story sharing modal | `src/components/stories/ShareYourStoryModal.tsx` |
| Consent display | `src/components/dashboard/SyndicationConsentList.tsx` |
| Privacy settings | `src/components/settings/PrivacySettingsPanel.tsx` |
| Admin storyteller mgmt | `src/app/admin/storytellers/page.tsx` |
| Admin story mgmt | `src/app/admin/stories/page.tsx` |
| Syndication API | `src/app/api/stories/[id]/share/route.ts` |
| Consent API | `src/app/api/storyteller/consents/route.ts` |
| JusticeHub webhook | `src/app/api/webhooks/justicehub/route.ts` |

### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User data with JusticeHub settings |
| `stories` | Story content with privacy/syndication flags |
| `syndication_consents` | Sharing agreements |
| `consent_logs` | Audit trail of consent actions |
| `audit_logs` | System-wide activity log |

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/storytellers` | List storytellers |
| PUT | `/api/admin/storytellers/[id]` | Update storyteller |
| GET | `/api/admin/stories` | List stories |
| PUT | `/api/admin/stories/[id]` | Update story |
| POST | `/api/stories/[id]/share` | Share story |
| GET | `/api/storyteller/consents` | List consents |
| DELETE | `/api/storyteller/consents/[id]` | Revoke consent |
| GET | `/api/storyteller/privacy-settings` | Get settings |
| PUT | `/api/storyteller/privacy-settings` | Update settings |

---

## 12. Future Enhancements

- [ ] Automated JusticeHub content recommendation system
- [ ] Real-time collaboration features with JusticeHub
- [ ] Advanced analytics dashboard for story reach
- [ ] Multi-language support for syndicated content
- [ ] Blockchain-based consent verification
- [ ] Mobile app for Empathy Ledger
- [ ] AI-powered content tagging for JusticeHub
- [ ] Community moderation tools
- [ ] Story translation service
- [ ] Accessibility audit tools

---

## Related Documentation
- [JusticeHub API Docs](https://justicehub.example.com/docs)
- [OCAP Principles](https://www.ocapprinciples.org)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Last Updated**: January 2025
**Maintained By**: Benjamin Knight (benjamin@act.place)
**Status**: Active & Production Ready
