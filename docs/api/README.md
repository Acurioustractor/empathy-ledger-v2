# Empathy Ledger Campaign API

**Version**: 1.0.0
**Base URL**: `/api/v1`
**Authentication**: Supabase Auth (required)

---

## Overview

The Campaign API provides RESTful endpoints for managing storytelling campaigns, tracking participant workflows, and analyzing campaign performance. All endpoints require authentication and respect multi-tenant isolation via Row Level Security (RLS).

### API Design Principles

- **RESTful**: Standard HTTP methods (GET, POST, PATCH, DELETE)
- **Type-Safe**: Full TypeScript support with client wrappers
- **Consistent**: Uniform response format across all endpoints
- **Secure**: Authentication + RLS policies on all operations
- **Paginated**: List endpoints support limit/offset pagination

### Base Response Format

All endpoints return:

```typescript
{
  success: boolean        // Operation result
  data?: T | T[]         // Response payload (on success)
  error?: string         // Error message (on failure)
  meta?: {               // Optional metadata
    count?: number       // Result count
    limit?: number       // Pagination limit
    offset?: number      // Pagination offset
  }
}
```

---

## Quick Start

### Installation

The API client is built-in. Import from types:

```typescript
import { campaignApi, workflowApi } from '@/types/api/campaigns'
```

### Basic Usage

```typescript
// List active campaigns
const campaigns = await campaignApi.list({ status: 'active' })

// Create new campaign
const campaign = await campaignApi.create({
  name: 'Community Tour 2025',
  campaign_type: 'tour_stop',
  storyteller_target: 50
})

// Get analytics
const analytics = await campaignApi.getAnalytics(campaign.data.id)
console.log(`Progress: ${analytics.data.progress.completion_percentage}%`)
```

---

## Authentication

All API requests require a valid Supabase authentication session.

### Browser (Client Components)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  // Redirect to login
}

// API calls automatically use session
const response = await campaignApi.list()
```

### Server (API Routes, Server Components)

```typescript
import { createClient } from '@/lib/supabase/client-ssr'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}
```

### Authorization

Access is controlled via RLS policies:

- **Public campaigns**: Visible to all authenticated users
- **Tenant campaigns**: Only visible to tenant members
- **Create**: Requires admin, project_leader, or community_representative role
- **Update**: Campaign creator, admin, or project_leader
- **Delete**: Admin only

---

## Endpoints

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/campaigns` | List campaigns |
| POST | `/api/v1/campaigns` | Create campaign |
| GET | `/api/v1/campaigns/:id` | Get campaign details |
| PATCH | `/api/v1/campaigns/:id` | Update campaign |
| DELETE | `/api/v1/campaigns/:id` | Delete campaign |
| GET | `/api/v1/campaigns/:id/analytics` | Get campaign analytics |
| GET | `/api/v1/campaigns/:id/participants` | List participants |
| POST | `/api/v1/campaigns/:id/participants` | Add participant |

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflow` | Get prioritized queue |
| GET | `/api/v1/workflow/:id` | Get workflow details |
| PATCH | `/api/v1/workflow/:id` | Update workflow |
| POST | `/api/v1/workflow/batch` | Bulk advance workflows |

---

## Campaign Management

### List Campaigns

```http
GET /api/v1/campaigns
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (comma-separated): `draft,active,paused,completed,archived` |
| `type` | string | Filter by type: `tour_stop`, `community_outreach`, `partnership`, etc. |
| `featured` | boolean | Only featured campaigns |
| `public` | boolean | Only public campaigns |
| `limit` | number | Results per page (max 100, default 50) |
| `offset` | number | Pagination offset (default 0) |

**Example**:

```typescript
// Get active tour stops
const response = await campaignApi.list({
  status: 'active',
  type: 'tour_stop',
  limit: 20
})

console.log(`Found ${response.meta.count} campaigns`)
response.data.forEach(campaign => {
  console.log(`${campaign.name} - ${campaign.participant_count} participants`)
})
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Vancouver Island Tour Stop",
      "slug": "vancouver-island-tour-stop",
      "status": "active",
      "campaign_type": "tour_stop",
      "start_date": "2025-02-15",
      "end_date": "2025-02-17",
      "storyteller_target": 50,
      "story_target": 30,
      "participant_count": 28,
      "story_count": 12,
      "is_public": true,
      "traditional_territory": "Lekwungen and WSÁNEĆ territories"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Create Campaign

```http
POST /api/v1/campaigns
```

**Request Body**:

```typescript
{
  name: string              // Required
  description?: string
  tagline?: string
  campaign_type?: 'tour_stop' | 'community_outreach' | 'partnership' | 'collection_drive' | 'exhibition' | 'other'
  start_date?: string       // ISO date: '2025-02-15'
  end_date?: string
  location_text?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  storyteller_target?: number
  story_target?: number
  requires_consent_workflow?: boolean
  requires_elder_review?: boolean
  cultural_protocols?: string
  traditional_territory?: string
  is_public?: boolean
  metadata?: object
}
```

**Example**:

```typescript
const response = await campaignApi.create({
  name: 'Vancouver Island Tour Stop',
  description: 'Community storytelling event in Victoria, BC',
  campaign_type: 'tour_stop',
  start_date: '2025-02-15',
  end_date: '2025-02-17',
  city: 'Victoria',
  country: 'Canada',
  traditional_territory: 'Lekwungen and WSÁNEĆ territories',
  storyteller_target: 50,
  story_target: 30,
  requires_consent_workflow: true,
  requires_elder_review: true,
  is_public: true,
})

if (response.success) {
  console.log('Campaign created:', response.data.slug)
  // Navigate to campaign page
  router.push(`/campaigns/${response.data.slug}`)
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vancouver Island Tour Stop",
    "slug": "vancouver-island-tour-stop",
    "status": "draft",
    "created_at": "2025-12-26T10:30:00Z"
  }
}
```

---

### Get Campaign Details

```http
GET /api/v1/campaigns/:id
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `detailed` | boolean | Include workflow summary, themes, storyteller count |

**Example**:

```typescript
// Basic details
const response = await campaignApi.get('campaign-uuid')

// Detailed view with analytics
const detailed = await campaignApi.get('campaign-uuid', true)

console.log(`Completion: ${detailed.data.completion_rate}%`)
console.log(`Storytellers: ${detailed.data.storyteller_count}`)

// Workflow breakdown
Object.entries(detailed.data.workflow_summary.by_stage).forEach(([stage, count]) => {
  console.log(`${stage}: ${count}`)
})
```

**Response** (detailed=true):

```json
{
  "success": true,
  "data": {
    "campaign": { /* full campaign object */ },
    "workflow_summary": {
      "total": 45,
      "by_stage": {
        "invited": 10,
        "interested": 8,
        "consented": 12,
        "recorded": 7,
        "reviewed": 5,
        "published": 3
      }
    },
    "story_themes": ["healing", "land rights", "cultural preservation"],
    "storyteller_count": 28,
    "completion_rate": 75.5
  }
}
```

---

### Update Campaign

```http
PATCH /api/v1/campaigns/:id
```

**Request Body** (all fields optional):

```typescript
{
  name?: string
  description?: string
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  campaign_type?: string
  start_date?: string
  end_date?: string
  storyteller_target?: number
  story_target?: number
  cover_image_url?: string
  is_public?: boolean
  is_featured?: boolean
  // ... (any campaign field)
}
```

**Example**:

```typescript
// Launch campaign
const response = await campaignApi.update('campaign-uuid', {
  status: 'active',
  start_date: new Date().toISOString().split('T')[0]
})

// Feature campaign
await campaignApi.update('campaign-uuid', {
  is_featured: true
})
```

---

### Delete Campaign

```http
DELETE /api/v1/campaigns/:id
```

**Authorization**: Admin only

**Example**:

```typescript
const response = await campaignApi.delete('campaign-uuid')

if (response.success) {
  console.log('Campaign deleted')
}
```

---

## Campaign Analytics

### Get Analytics

```http
GET /api/v1/campaigns/:id/analytics
```

Returns comprehensive campaign metrics including progress tracking, conversion rates, and workflow statistics.

**Example**:

```typescript
const response = await campaignApi.getAnalytics('campaign-uuid')

if (response.success) {
  const { progress, statistics } = response.data

  // Progress metrics
  console.log(`Storyteller Progress: ${progress.storyteller_progress}%`)
  console.log(`Story Progress: ${progress.story_progress}%`)
  console.log(`Overall Completion: ${progress.completion_percentage}%`)
  console.log(`Days Remaining: ${progress.days_remaining}`)

  // Statistics
  console.log(`Total Workflows: ${statistics.total_workflows}`)
  console.log(`Published Stories: ${statistics.published_stories}`)
  console.log(`Conversion Rate: ${statistics.conversion_rate}%`)
  console.log(`Avg Time to Publish: ${statistics.avg_days_to_publish} days`)
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "campaign_id": "uuid",
    "generated_at": "2025-12-26T10:30:00Z",
    "progress": {
      "storyteller_progress": 85.7,
      "story_progress": 62.5,
      "workflow_progress": 45.0,
      "days_elapsed": 42,
      "days_remaining": 28,
      "completion_percentage": 74.1
    },
    "statistics": {
      "total_workflows": 45,
      "total_stories": 25,
      "total_participants": 30,
      "published_stories": 18,
      "pending_review": 7,
      "conversion_rate": 40.0,
      "avg_days_to_publish": 14.5
    }
  }
}
```

**Metrics Explained**:

| Metric | Formula | Use Case |
|--------|---------|----------|
| `storyteller_progress` | `(participant_count / target) * 100` | Recruitment progress |
| `story_progress` | `(story_count / target) * 100` | Content collection progress |
| `workflow_progress` | `% in final stages (reviewed, published)` | Content readiness |
| `completion_percentage` | Average of storyteller & story progress | Overall campaign health |
| `conversion_rate` | `(published / total_workflows) * 100` | Workflow efficiency |
| `avg_days_to_publish` | Average time from invited → published | Process speed |

---

## Participant Management

### List Participants

```http
GET /api/v1/campaigns/:id/participants
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `stage` | string | Filter by workflow stage |
| `elder_review` | boolean | Filter by elder review requirement |

**Example**:

```typescript
// Get all participants
const response = await campaignApi.getParticipants('campaign-uuid')

// Get participants needing consent
const needingConsent = await campaignApi.getParticipants('campaign-uuid', {
  stage: 'interested'
})

// Get workflows requiring elder review
const elderReview = await campaignApi.getParticipants('campaign-uuid', {
  elder_review: true
})

response.data.forEach(workflow => {
  console.log(`${workflow.storyteller_name} - ${workflow.stage}`)
})
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "workflow-uuid",
      "campaign_id": "campaign-uuid",
      "storyteller_id": "storyteller-uuid",
      "storyteller_name": "John Doe",
      "stage": "interested",
      "invitation_sent_at": "2025-12-01T10:00:00Z",
      "invitation_method": "email",
      "elder_review_required": false,
      "notes": "Met at community event"
    }
  ],
  "meta": {
    "count": 1,
    "campaign_id": "campaign-uuid"
  }
}
```

---

### Add Participant

```http
POST /api/v1/campaigns/:id/participants
```

**Request Body**:

```typescript
{
  storyteller_id: string              // Required
  invitation_method?: 'email' | 'phone' | 'in_person' | 'social_media' | 'postal_mail' | 'other'
  notes?: string
  metadata?: object
}
```

**Example**:

```typescript
const response = await campaignApi.addParticipant('campaign-uuid', {
  storyteller_id: 'storyteller-uuid',
  invitation_method: 'email',
  notes: 'Invited via community email list'
})

if (response.success) {
  console.log('Workflow created:', response.data.stage)
  // → 'invited'
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "workflow-uuid",
    "campaign_id": "campaign-uuid",
    "storyteller_id": "storyteller-uuid",
    "stage": "invited",
    "invitation_sent_at": "2025-12-26T10:30:00Z",
    "invitation_method": "email",
    "created_at": "2025-12-26T10:30:00Z"
  }
}
```

---

## Workflow Management

### Get Workflow Queue

```http
GET /api/v1/workflow
```

Returns prioritized list of workflows needing attention, sorted by priority score.

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `campaign_id` | string | Filter to specific campaign |
| `limit` | number | Max results (max 100, default 50) |

**Example**:

```typescript
// Get prioritized queue
const response = await workflowApi.getQueue({ limit: 50 })

console.log(`${response.meta.count} items in queue`)

response.data.forEach(item => {
  console.log(`[${item.priority_score}] ${item.storyteller_name} - ${item.stage}`)

  if (item.elder_review_required && !item.elder_reviewed_at) {
    console.log('  ⚠️ Needs elder review')
  }

  if (item.days_in_stage > 7) {
    console.log(`  ⏰ ${item.days_in_stage} days in stage`)
  }
})
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "workflow_id": "uuid",
      "storyteller_id": "uuid",
      "storyteller_name": "John Doe",
      "story_id": "uuid",
      "story_title": "My Journey",
      "campaign_id": "uuid",
      "campaign_name": "World Tour 2025",
      "stage": "recorded",
      "elder_review_required": true,
      "elder_reviewed_at": null,
      "days_in_stage": 12,
      "priority_score": 180,
      "notes": "Recorded on mobile device",
      "created_at": "2025-12-01T10:00:00Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

**Priority Scoring**:

```typescript
priority_score = (
  stage_priority +        // recorded=100, reviewed=90, consented=70
  elder_review_boost +    // +50 if needed and not done
  urgency_boost          // +30 if >7 days in stage
)
```

---

### Update Workflow

```http
PATCH /api/v1/workflow/:id
```

**Request Body**:

```typescript
{
  stage?: 'invited' | 'interested' | 'consented' | 'recorded' | 'reviewed' | 'published' | 'withdrawn'
  notes?: string
  metadata?: object
  follow_up_date?: string      // ISO date
  follow_up_notes?: string
}
```

**Example**:

```typescript
// Advance to next stage
const response = await workflowApi.update('workflow-uuid', {
  stage: 'consented',
  notes: 'Consent form signed at community event'
})

console.log('Consent granted:', response.data.consent_granted_at)

// Add follow-up reminder
await workflowApi.update('workflow-uuid', {
  follow_up_date: '2025-12-30',
  follow_up_notes: 'Schedule recording session'
})
```

**Automatic Timestamps**:

When advancing stages, the API automatically sets:

| Stage | Timestamp Set |
|-------|--------------|
| `interested` | `first_response_at` |
| `consented` | `consent_granted_at` |
| `recorded` | `story_recorded_at` |
| `published` | `published_at` |

---

### Bulk Advance Workflows

```http
POST /api/v1/workflow/batch
```

**Request Body**:

```typescript
{
  workflow_ids: string[]      // Required, min 1
  stage: WorkflowStage        // Required
  notes?: string              // Applied to all
}
```

**Example**:

```typescript
// Bulk approve consents after event
const response = await workflowApi.bulkAdvance({
  workflow_ids: [
    'workflow-uuid-1',
    'workflow-uuid-2',
    'workflow-uuid-3',
  ],
  stage: 'consented',
  notes: 'Consent granted at Vancouver Island Tour Stop'
})

console.log(`Updated ${response.meta.updated_count} workflows`)
```

**Response**:

```json
{
  "success": true,
  "data": [
    { "id": "workflow-uuid-1", "stage": "consented" },
    { "id": "workflow-uuid-2", "stage": "consented" },
    { "id": "workflow-uuid-3", "stage": "consented" }
  ],
  "meta": {
    "updated_count": 3
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Operation completed |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation failed, missing required fields |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, unexpected failure |

### Error Handling Pattern

```typescript
try {
  const response = await campaignApi.create(data)

  if (!response.success) {
    // Handle API error
    console.error('API Error:', response.error)
    toast.error(response.error)
    return
  }

  // Success
  console.log('Campaign created:', response.data)

} catch (error) {
  // Handle network/unexpected errors
  console.error('Network Error:', error)
  toast.error('Failed to connect to server')
}
```

### Common Validation Errors

```typescript
// Missing required field
{
  "success": false,
  "error": "Campaign name is required"
}

// Invalid enum value
{
  "success": false,
  "error": "Invalid stage. Must be one of: invited, interested, consented, recorded, reviewed, published, withdrawn"
}

// Invalid array
{
  "success": false,
  "error": "workflow_ids array is required"
}
```

---

## Rate Limiting

**Current**: No rate limiting implemented

**Recommended**: Add rate limiting middleware for production:

```typescript
// Example: 100 requests per minute per IP
const rateLimit = {
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                   // 100 requests
}
```

---

## Type Safety

### Using API Clients

```typescript
import { campaignApi, workflowApi } from '@/types/api/campaigns'
import type {
  Campaign,
  CampaignDetails,
  CampaignWorkflow,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@/types/api/campaigns'

// Type-safe request
const request: CreateCampaignRequest = {
  name: 'Test Campaign',
  campaign_type: 'tour_stop',  // Type-checked enum
}

const response = await campaignApi.create(request)

// Type-safe response
if (response.success) {
  const campaign: Campaign = response.data  // Fully typed
  console.log(campaign.slug)
}
```

### Type Guards

```typescript
import { isCampaignResponse, isCampaignListResponse } from '@/types/api/campaigns'

const response = await fetch('/api/v1/campaigns')
const data = await response.json()

if (isCampaignListResponse(data)) {
  // TypeScript knows data.data is Campaign[]
  data.data.forEach(campaign => {
    console.log(campaign.name)
  })
}
```

---

## Related Documentation

- [Campaign System Overview](../campaigns/README.md)
- [Workflow Management Guide](../campaigns/guides/workflow-management.md)
- [Campaign Planning Guide](../campaigns/world-tour/planning-guide.md)
- [Database Schema](../database/SCHEMA_REFERENCE.md)

---

## Support

For issues or questions:
- GitHub Issues: [empathy-ledger-v2/issues](https://github.com/yourusername/empathy-ledger-v2/issues)
- Documentation: [/docs](/docs)
- API Examples: [/docs/api/examples.md](/docs/api/examples.md)
