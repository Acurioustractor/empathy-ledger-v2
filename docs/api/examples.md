# Campaign API - Usage Examples

Practical examples for common campaign management workflows.

---

## Table of Contents

1. [Campaign Creation & Management](#campaign-creation--management)
2. [Participant Recruitment](#participant-recruitment)
3. [Workflow Progression](#workflow-progression)
4. [Analytics & Reporting](#analytics--reporting)
5. [Moderation Queue](#moderation-queue)
6. [Bulk Operations](#bulk-operations)
7. [React Component Integration](#react-component-integration)
8. [Error Handling Patterns](#error-handling-patterns)

---

## Campaign Creation & Management

### Create a World Tour Stop

```typescript
import { campaignApi } from '@/types/api/campaigns'

async function createTourStop() {
  const response = await campaignApi.create({
    name: 'Vancouver Island Tour Stop',
    description: 'Community storytelling event celebrating Indigenous stories from Vancouver Island',
    tagline: 'Stories from the Island',
    campaign_type: 'tour_stop',

    // Timeline
    start_date: '2025-02-15',
    end_date: '2025-02-17',

    // Location
    location_text: 'Victoria Community Centre',
    city: 'Victoria',
    country: 'Canada',
    latitude: 48.4284,
    longitude: -123.3656,

    // Cultural context
    traditional_territory: 'Lekwungen and WSÁNEĆ territories',
    cultural_protocols: 'Elder opening ceremony, cultural safety protocols',

    // Goals
    storyteller_target: 50,
    story_target: 30,

    // Workflow settings
    requires_consent_workflow: true,
    requires_elder_review: true,

    // Visibility
    is_public: true,
    is_featured: false,

    // Custom metadata
    metadata: {
      venue: 'Victoria Community Centre',
      contact_email: 'victoria@empathyledger.com',
      local_partners: ['Victoria Indigenous Friendship Centre']
    }
  })

  if (response.success) {
    console.log('✅ Campaign created:', response.data.slug)
    console.log('Campaign ID:', response.data.id)
    return response.data
  } else {
    console.error('❌ Error:', response.error)
    throw new Error(response.error)
  }
}
```

### Create a Community Outreach Campaign

```typescript
async function createOutreachCampaign() {
  const response = await campaignApi.create({
    name: 'Healing Stories Collection',
    description: 'Collecting healing and wellness stories from community members',
    campaign_type: 'community_outreach',

    // Virtual campaign (no location)
    start_date: '2025-01-01',
    end_date: '2025-12-31',

    // Goals
    storyteller_target: 100,
    story_target: 150,

    // Workflow
    requires_consent_workflow: true,
    requires_elder_review: false,

    // Metadata
    metadata: {
      themes: ['healing', 'wellness', 'traditional medicine'],
      collection_method: 'remote',
      languages: ['English', 'Halkomelem', 'SENĆOŦEN']
    }
  })

  return response.data
}
```

### Update Campaign Status

```typescript
async function launchCampaign(campaignId: string) {
  // Activate campaign
  const response = await campaignApi.update(campaignId, {
    status: 'active',
    start_date: new Date().toISOString().split('T')[0]
  })

  console.log('Campaign launched:', response.data.status)
}

async function pauseCampaign(campaignId: string, reason: string) {
  // Pause campaign
  await campaignApi.update(campaignId, {
    status: 'paused',
    metadata: {
      pause_reason: reason,
      paused_at: new Date().toISOString()
    }
  })
}

async function completeCampaign(campaignId: string) {
  // Mark as completed
  await campaignApi.update(campaignId, {
    status: 'completed',
    end_date: new Date().toISOString().split('T')[0]
  })
}
```

### Feature a Campaign

```typescript
async function featureCampaign(campaignId: string, coverImageUrl: string) {
  const response = await campaignApi.update(campaignId, {
    is_featured: true,
    cover_image_url: coverImageUrl,
    theme_color: '#F59E0B' // Amber accent
  })

  console.log('Campaign featured on homepage')
}
```

---

## Participant Recruitment

### Invite Single Storyteller

```typescript
async function inviteStoryteller(
  campaignId: string,
  storytellerId: string,
  method: 'email' | 'phone' | 'in_person'
) {
  const response = await campaignApi.addParticipant(campaignId, {
    storyteller_id: storytellerId,
    invitation_method: method,
    notes: `Invited via ${method} on ${new Date().toLocaleDateString()}`
  })

  if (response.success) {
    console.log(`✅ ${storytellerId} invited to campaign`)
    console.log('Workflow ID:', response.data.id)
    console.log('Stage:', response.data.stage) // → 'invited'
    return response.data
  }
}
```

### Bulk Invite Storytellers

```typescript
async function bulkInviteStorytellers(
  campaignId: string,
  storytellerIds: string[],
  invitationMethod: string
) {
  const results = await Promise.allSettled(
    storytellerIds.map(id =>
      campaignApi.addParticipant(campaignId, {
        storyteller_id: id,
        invitation_method: invitationMethod as any,
        notes: `Bulk invitation - ${new Date().toLocaleDateString()}`
      })
    )
  )

  const successful = results.filter(r => r.status === 'fulfilled')
  const failed = results.filter(r => r.status === 'rejected')

  console.log(`✅ ${successful.length} invitations sent`)
  console.log(`❌ ${failed.length} failed`)

  return { successful, failed }
}
```

### Get Campaign Participants

```typescript
async function getCampaignParticipants(campaignId: string) {
  const response = await campaignApi.getParticipants(campaignId)

  console.log(`Total participants: ${response.meta.count}`)

  // Group by stage
  const byStage = response.data.reduce((acc, workflow) => {
    acc[workflow.stage] = (acc[workflow.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('Participants by stage:', byStage)

  return response.data
}
```

### Filter Participants by Stage

```typescript
async function getParticipantsNeedingConsent(campaignId: string) {
  // Get storytellers who expressed interest but haven't consented
  const response = await campaignApi.getParticipants(campaignId, {
    stage: 'interested'
  })

  console.log(`${response.meta.count} storytellers need consent follow-up`)

  return response.data
}

async function getParticipantsNeedingElderReview(campaignId: string) {
  const response = await campaignApi.getParticipants(campaignId, {
    elder_review: true
  })

  return response.data.filter(w => !w.elder_reviewed_at)
}
```

---

## Workflow Progression

### Track Storyteller Journey

```typescript
async function trackStorytellerJourney(workflowId: string) {
  // 1. Storyteller expresses interest
  await workflowApi.update(workflowId, {
    stage: 'interested',
    notes: 'Responded to email invitation'
  })

  // 2. Consent granted
  await workflowApi.update(workflowId, {
    stage: 'consented',
    notes: 'Signed consent form at community event'
  })

  // 3. Story recorded
  await workflowApi.update(workflowId, {
    stage: 'recorded',
    notes: 'Recorded 15-minute video interview'
  })

  // 4. Story reviewed
  await workflowApi.update(workflowId, {
    stage: 'reviewed',
    notes: 'Content reviewed and approved for publication'
  })

  // 5. Story published
  await workflowApi.update(workflowId, {
    stage: 'published',
    notes: 'Published to platform'
  })

  console.log('✅ Storyteller journey complete: invited → published')
}
```

### Handle Workflow with Elder Review

```typescript
async function processElderReview(
  workflowId: string,
  approved: boolean,
  elderNotes: string
) {
  if (approved) {
    // Advance to next stage
    await workflowApi.update(workflowId, {
      stage: 'reviewed',
      notes: `Elder review approved: ${elderNotes}`
    })
  } else {
    // Request revisions
    await workflowApi.update(workflowId, {
      notes: `Elder review requires changes: ${elderNotes}`,
      follow_up_date: getFutureDateISO(7), // 1 week from now
      follow_up_notes: 'Follow up on requested changes'
    })
  }
}

function getFutureDateISO(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}
```

### Add Follow-up Reminders

```typescript
async function scheduleFollowUp(
  workflowId: string,
  daysFromNow: number,
  notes: string
) {
  await workflowApi.update(workflowId, {
    follow_up_date: getFutureDateISO(daysFromNow),
    follow_up_notes: notes
  })

  console.log(`Follow-up scheduled for ${daysFromNow} days from now`)
}

// Example: Schedule recording session
await scheduleFollowUp(
  'workflow-uuid',
  7,
  'Schedule video recording session'
)
```

---

## Analytics & Reporting

### Campaign Dashboard Data

```typescript
async function getCampaignDashboardData(campaignId: string) {
  // Get campaign details and analytics in parallel
  const [detailsRes, analyticsRes] = await Promise.all([
    campaignApi.get(campaignId, true),
    campaignApi.getAnalytics(campaignId)
  ])

  const campaign = detailsRes.data
  const { progress, statistics } = analyticsRes.data

  return {
    // Campaign info
    name: campaign.campaign.name,
    status: campaign.campaign.status,
    dateRange: {
      start: campaign.campaign.start_date,
      end: campaign.campaign.end_date
    },

    // Progress metrics
    storytellerProgress: progress.storyteller_progress,
    storyProgress: progress.story_progress,
    overallCompletion: progress.completion_percentage,
    daysRemaining: progress.days_remaining,

    // Statistics
    totalWorkflows: statistics.total_workflows,
    publishedStories: statistics.published_stories,
    conversionRate: statistics.conversion_rate,
    avgTimeToPublish: statistics.avg_days_to_publish,

    // Workflow breakdown
    workflowByStage: campaign.workflow_summary.by_stage,
    storytellerCount: campaign.storyteller_count,
    themes: campaign.story_themes
  }
}
```

### Generate Campaign Report

```typescript
async function generateCampaignReport(campaignId: string) {
  const [campaign, analytics, participants] = await Promise.all([
    campaignApi.get(campaignId, true),
    campaignApi.getAnalytics(campaignId),
    campaignApi.getParticipants(campaignId)
  ])

  const report = {
    campaign_name: campaign.data.campaign.name,
    generated_at: new Date().toISOString(),

    timeline: {
      start_date: campaign.data.campaign.start_date,
      end_date: campaign.data.campaign.end_date,
      days_elapsed: analytics.data.progress.days_elapsed,
      days_remaining: analytics.data.progress.days_remaining
    },

    goals: {
      storyteller_target: campaign.data.campaign.storyteller_target,
      storyteller_current: campaign.data.campaign.participant_count,
      storyteller_progress: analytics.data.progress.storyteller_progress,

      story_target: campaign.data.campaign.story_target,
      story_current: campaign.data.campaign.story_count,
      story_progress: analytics.data.progress.story_progress
    },

    workflow_funnel: {
      invited: campaign.data.workflow_summary.by_stage.invited || 0,
      interested: campaign.data.workflow_summary.by_stage.interested || 0,
      consented: campaign.data.workflow_summary.by_stage.consented || 0,
      recorded: campaign.data.workflow_summary.by_stage.recorded || 0,
      reviewed: campaign.data.workflow_summary.by_stage.reviewed || 0,
      published: campaign.data.workflow_summary.by_stage.published || 0,
      conversion_rate: analytics.data.statistics.conversion_rate
    },

    performance: {
      avg_days_to_publish: analytics.data.statistics.avg_days_to_publish,
      pending_review: analytics.data.statistics.pending_review
    },

    content: {
      total_stories: analytics.data.statistics.total_stories,
      published_stories: analytics.data.statistics.published_stories,
      themes: campaign.data.story_themes
    }
  }

  console.log('Campaign Report:')
  console.log(JSON.stringify(report, null, 2))

  return report
}
```

### Track Progress Over Time

```typescript
interface ProgressSnapshot {
  date: string
  storyteller_count: number
  story_count: number
  workflow_count: number
  published_count: number
}

async function captureProgressSnapshot(
  campaignId: string
): Promise<ProgressSnapshot> {
  const [campaign, analytics] = await Promise.all([
    campaignApi.get(campaignId),
    campaignApi.getAnalytics(campaignId)
  ])

  const snapshot: ProgressSnapshot = {
    date: new Date().toISOString().split('T')[0],
    storyteller_count: campaign.data.participant_count,
    story_count: campaign.data.story_count,
    workflow_count: campaign.data.workflow_count,
    published_count: analytics.data.statistics.published_stories
  }

  // Store in campaign metadata
  await campaignApi.update(campaignId, {
    metadata: {
      ...campaign.data.metadata,
      progress_snapshots: [
        ...(campaign.data.metadata?.progress_snapshots || []),
        snapshot
      ]
    }
  })

  return snapshot
}
```

---

## Moderation Queue

### Get Prioritized Queue

```typescript
async function getModerationQueue(campaignId?: string) {
  const response = await workflowApi.getQueue({
    campaign_id: campaignId,
    limit: 50
  })

  console.log(`${response.meta.count} items in moderation queue`)

  // Sort by priority
  const sorted = response.data.sort((a, b) => b.priority_score - a.priority_score)

  return sorted
}
```

### Process Queue Items

```typescript
async function processModerationQueue() {
  const queue = await workflowApi.getQueue({ limit: 50 })

  for (const item of queue.data) {
    console.log(`\n[${item.priority_score}] ${item.storyteller_name}`)
    console.log(`  Stage: ${item.stage}`)
    console.log(`  Campaign: ${item.campaign_name}`)

    // High priority: Needs elder review
    if (item.elder_review_required && !item.elder_reviewed_at) {
      console.log('  🔴 URGENT: Needs elder review')
    }

    // Medium priority: Long wait time
    if (item.days_in_stage > 7) {
      console.log(`  🟡 WARNING: ${item.days_in_stage} days in ${item.stage} stage`)
    }

    // Action items
    if (item.stage === 'recorded') {
      console.log('  → ACTION: Review and approve story')
    } else if (item.stage === 'reviewed') {
      console.log('  → ACTION: Publish story')
    } else if (item.stage === 'consented') {
      console.log('  → ACTION: Schedule recording')
    }
  }
}
```

### Filter Queue by Criteria

```typescript
async function getUrgentReviews(campaignId: string) {
  const queue = await workflowApi.getQueue({ campaign_id: campaignId })

  // Filter: Recorded stories waiting >7 days OR needing elder review
  const urgent = queue.data.filter(item =>
    (item.stage === 'recorded' && item.days_in_stage > 7) ||
    (item.elder_review_required && !item.elder_reviewed_at)
  )

  console.log(`${urgent.length} urgent reviews needed`)

  return urgent
}
```

---

## Bulk Operations

### Bulk Approve Consents

```typescript
async function bulkApproveConsents(
  workflowIds: string[],
  eventName: string
) {
  const response = await workflowApi.bulkAdvance({
    workflow_ids: workflowIds,
    stage: 'consented',
    notes: `Consent granted at ${eventName} on ${new Date().toLocaleDateString()}`
  })

  console.log(`✅ Approved ${response.meta.updated_count} consents`)

  return response.data
}

// Example: After community event
const consentedWorkflows = [
  'workflow-uuid-1',
  'workflow-uuid-2',
  'workflow-uuid-3',
  // ... more IDs
]

await bulkApproveConsents(consentedWorkflows, 'Vancouver Island Tour Stop')
```

### Bulk Publish Stories

```typescript
async function bulkPublishStories(workflowIds: string[]) {
  const response = await workflowApi.bulkAdvance({
    workflow_ids: workflowIds,
    stage: 'published',
    notes: `Published via bulk operation on ${new Date().toLocaleDateString()}`
  })

  console.log(`✅ Published ${response.meta.updated_count} stories`)

  return response.data
}
```

### Bulk Mark as Interested

```typescript
async function processEventAttendees(
  campaignId: string,
  attendeeIds: string[]
) {
  // 1. Get existing workflows
  const participants = await campaignApi.getParticipants(campaignId)
  const existingIds = new Set(participants.data.map(p => p.storyteller_id))

  // 2. Create workflows for new attendees
  const newAttendees = attendeeIds.filter(id => !existingIds.has(id))

  await Promise.all(
    newAttendees.map(id =>
      campaignApi.addParticipant(campaignId, {
        storyteller_id: id,
        invitation_method: 'in_person',
        notes: 'Met at community event'
      })
    )
  )

  // 3. Mark all attendees as interested
  const allWorkflows = await campaignApi.getParticipants(campaignId)
  const attendeeWorkflows = allWorkflows.data
    .filter(w => attendeeIds.includes(w.storyteller_id))
    .filter(w => w.stage === 'invited')

  if (attendeeWorkflows.length > 0) {
    await workflowApi.bulkAdvance({
      workflow_ids: attendeeWorkflows.map(w => w.id),
      stage: 'interested',
      notes: 'Attended community event'
    })
  }

  console.log(`✅ Processed ${attendeeIds.length} event attendees`)
}
```

---

## React Component Integration

### Campaign Dashboard Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { campaignApi } from '@/types/api/campaigns'
import type { CampaignAnalyticsResponse } from '@/types/api/campaigns'

export function CampaignDashboard({ campaignId }: { campaignId: string }) {
  const [analytics, setAnalytics] = useState<CampaignAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await campaignApi.getAnalytics(campaignId)

        if (response.success) {
          setAnalytics(response.data)
        } else {
          setError(response.error || 'Failed to load analytics')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [campaignId])

  if (loading) return <div>Loading analytics...</div>
  if (error) return <div>Error: {error}</div>
  if (!analytics) return null

  const { progress, statistics } = analytics

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Progress Card */}
      <div className="p-4 border rounded">
        <h3>Overall Progress</h3>
        <div className="text-3xl font-bold">
          {progress.completion_percentage.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">
          {progress.days_remaining} days remaining
        </div>
      </div>

      {/* Storytellers Card */}
      <div className="p-4 border rounded">
        <h3>Storyteller Progress</h3>
        <div className="text-3xl font-bold">
          {progress.storyteller_progress?.toFixed(1) || 0}%
        </div>
        <div className="text-sm text-muted-foreground">
          {statistics.total_participants} participants
        </div>
      </div>

      {/* Stories Card */}
      <div className="p-4 border rounded">
        <h3>Story Progress</h3>
        <div className="text-3xl font-bold">
          {progress.story_progress?.toFixed(1) || 0}%
        </div>
        <div className="text-sm text-muted-foreground">
          {statistics.published_stories} published
        </div>
      </div>
    </div>
  )
}
```

### Campaign List Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { campaignApi } from '@/types/api/campaigns'
import type { Campaign } from '@/types/api/campaigns'

export function CampaignList({ status }: { status?: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCampaigns() {
      const response = await campaignApi.list({
        status: status as any,
        limit: 50
      })

      if (response.success) {
        setCampaigns(response.data)
      }

      setLoading(false)
    }

    loadCampaigns()
  }, [status])

  if (loading) return <div>Loading campaigns...</div>

  return (
    <div className="grid gap-4">
      {campaigns.map(campaign => (
        <div key={campaign.id} className="p-4 border rounded">
          <h3 className="font-bold">{campaign.name}</h3>
          <p className="text-sm text-muted-foreground">{campaign.tagline}</p>

          <div className="flex gap-4 mt-2 text-sm">
            <span>
              {campaign.participant_count}/{campaign.storyteller_target} participants
            </span>
            <span>
              {campaign.story_count}/{campaign.story_target} stories
            </span>
          </div>

          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
              campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {campaign.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Moderation Queue Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { workflowApi } from '@/types/api/campaigns'
import type { PendingConsentItem } from '@/lib/services/campaign-workflow.service'

export function ModerationQueue() {
  const [queue, setQueue] = useState<PendingConsentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQueue()
  }, [])

  async function loadQueue() {
    const response = await workflowApi.getQueue({ limit: 50 })
    if (response.success) {
      setQueue(response.data)
    }
    setLoading(false)
  }

  async function handleAdvance(workflowId: string, newStage: string) {
    await workflowApi.update(workflowId, {
      stage: newStage as any
    })

    // Reload queue
    await loadQueue()
  }

  if (loading) return <div>Loading queue...</div>

  return (
    <div className="space-y-4">
      <h2>{queue.length} items in queue</h2>

      {queue.map(item => (
        <div
          key={item.workflow_id}
          className="p-4 border rounded flex justify-between items-center"
        >
          <div>
            <div className="font-bold">{item.storyteller_name}</div>
            <div className="text-sm text-muted-foreground">
              {item.campaign_name} - {item.stage}
            </div>

            {item.elder_review_required && !item.elder_reviewed_at && (
              <div className="text-xs text-red-600 mt-1">
                ⚠️ Needs elder review
              </div>
            )}

            {item.days_in_stage > 7 && (
              <div className="text-xs text-orange-600 mt-1">
                ⏰ {item.days_in_stage} days in stage
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {item.stage === 'recorded' && (
              <button
                onClick={() => handleAdvance(item.workflow_id, 'reviewed')}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Review
              </button>
            )}

            {item.stage === 'reviewed' && (
              <button
                onClick={() => handleAdvance(item.workflow_id, 'published')}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Error Handling Patterns

### Comprehensive Error Handling

```typescript
async function createCampaignWithErrorHandling(data: CreateCampaignRequest) {
  try {
    const response = await campaignApi.create(data)

    if (!response.success) {
      // Handle API validation errors
      if (response.error?.includes('required')) {
        throw new ValidationError(response.error)
      }

      if (response.error?.includes('already exists')) {
        throw new DuplicateError(response.error)
      }

      // Generic API error
      throw new APIError(response.error || 'Unknown error')
    }

    // Success
    return response.data

  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to server')
    }

    // Re-throw known errors
    if (error instanceof ValidationError ||
        error instanceof DuplicateError ||
        error instanceof APIError) {
      throw error
    }

    // Unknown error
    console.error('Unexpected error:', error)
    throw new Error('An unexpected error occurred')
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class DuplicateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DuplicateError'
  }
}

class APIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'APIError'
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}
```

### Retry Logic

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))

      // Exponential backoff
      delay *= 2
    }
  }

  throw new Error('Max retries exceeded')
}

// Usage
const analytics = await fetchWithRetry(() =>
  campaignApi.getAnalytics('campaign-uuid')
)
```

### Loading States

```typescript
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

function useCampaignAnalytics(campaignId: string) {
  const [state, setState] = useState<LoadingState<CampaignAnalyticsResponse>>({
    status: 'idle'
  })

  useEffect(() => {
    async function load() {
      setState({ status: 'loading' })

      try {
        const response = await campaignApi.getAnalytics(campaignId)

        if (response.success) {
          setState({ status: 'success', data: response.data })
        } else {
          setState({ status: 'error', error: response.error || 'Unknown error' })
        }
      } catch (error) {
        setState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Network error'
        })
      }
    }

    load()
  }, [campaignId])

  return state
}
```

---

## Complete Example: Campaign Lifecycle

```typescript
/**
 * Complete example: Create campaign, invite participants, track progress
 */
async function runCompleteCampaignWorkflow() {
  console.log('🚀 Starting campaign workflow...\n')

  // 1. Create campaign
  console.log('📝 Creating campaign...')
  const campaignRes = await campaignApi.create({
    name: 'Example Tour Stop 2025',
    campaign_type: 'tour_stop',
    start_date: '2025-03-01',
    end_date: '2025-03-03',
    storyteller_target: 20,
    story_target: 15,
    requires_consent_workflow: true,
    is_public: true
  })

  const campaign = campaignRes.data
  console.log(`✅ Campaign created: ${campaign.slug}\n`)

  // 2. Invite participants
  console.log('📧 Inviting 5 storytellers...')
  const storytellerIds = [
    'storyteller-1',
    'storyteller-2',
    'storyteller-3',
    'storyteller-4',
    'storyteller-5'
  ]

  const invitations = await Promise.all(
    storytellerIds.map(id =>
      campaignApi.addParticipant(campaign.id, {
        storyteller_id: id,
        invitation_method: 'email'
      })
    )
  )

  console.log(`✅ ${invitations.length} invitations sent\n`)

  // 3. Simulate some responses
  console.log('💬 Processing responses...')
  const workflowIds = invitations.map(inv => inv.data.id)

  // 3 storytellers express interest
  await workflowApi.bulkAdvance({
    workflow_ids: workflowIds.slice(0, 3),
    stage: 'interested',
    notes: 'Responded to invitation'
  })

  // 2 storytellers consent
  await workflowApi.bulkAdvance({
    workflow_ids: workflowIds.slice(0, 2),
    stage: 'consented',
    notes: 'Signed consent form'
  })

  console.log('✅ Responses processed\n')

  // 4. Check analytics
  console.log('📊 Checking analytics...')
  const analyticsRes = await campaignApi.getAnalytics(campaign.id)
  const { progress, statistics } = analyticsRes.data

  console.log(`Progress: ${progress.completion_percentage}%`)
  console.log(`Participants: ${statistics.total_participants}`)
  console.log(`Workflows: ${statistics.total_workflows}`)
  console.log(`Conversion: ${statistics.conversion_rate}%\n`)

  // 5. Get moderation queue
  console.log('📋 Checking moderation queue...')
  const queueRes = await workflowApi.getQueue({
    campaign_id: campaign.id
  })

  console.log(`${queueRes.meta.count} items in queue`)
  queueRes.data.forEach(item => {
    console.log(`  - ${item.storyteller_name}: ${item.stage} (priority: ${item.priority_score})`)
  })

  console.log('\n✅ Campaign workflow complete!')
}
```

---

## Next Steps

- [API Reference](README.md) - Full endpoint documentation
- [Campaign Planning Guide](../campaigns/world-tour/planning-guide.md)
- [Workflow Management](../campaigns/guides/workflow-management.md)
- [Database Schema](../database/SCHEMA_REFERENCE.md)
