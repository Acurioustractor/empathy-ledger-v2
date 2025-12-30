# Campaign API - Quick Start

Get started with the Campaign API in 5 minutes.

---

## Prerequisites

- Supabase authentication session
- TypeScript/JavaScript project
- Access to Empathy Ledger codebase

---

## 1. Import the API Client

```typescript
import { campaignApi, workflowApi } from '@/types/api/campaigns'
```

That's it! The API clients are already configured and ready to use.

---

## 2. Your First API Call

### List Active Campaigns

```typescript
const response = await campaignApi.list({
  status: 'active',
  limit: 10
})

if (response.success) {
  console.log(`Found ${response.meta.count} campaigns`)
  response.data.forEach(campaign => {
    console.log(`- ${campaign.name}`)
  })
}
```

---

## 3. Create a Campaign

```typescript
const response = await campaignApi.create({
  name: 'My First Campaign',
  campaign_type: 'tour_stop',
  storyteller_target: 20,
  story_target: 15,
  is_public: true
})

if (response.success) {
  console.log('Campaign created!', response.data.slug)
} else {
  console.error('Error:', response.error)
}
```

---

## 4. Add Participants

```typescript
const response = await campaignApi.addParticipant('campaign-uuid', {
  storyteller_id: 'storyteller-uuid',
  invitation_method: 'email'
})

if (response.success) {
  console.log('Participant added:', response.data.stage)
  // → 'invited'
}
```

---

## 5. Check Progress

```typescript
const analytics = await campaignApi.getAnalytics('campaign-uuid')

if (analytics.success) {
  const { progress } = analytics.data
  console.log(`Progress: ${progress.completion_percentage}%`)
}
```

---

## Common Patterns

### Error Handling

```typescript
try {
  const response = await campaignApi.create(data)

  if (!response.success) {
    // Handle validation error
    alert(response.error)
    return
  }

  // Success
  console.log('Created:', response.data)

} catch (error) {
  // Handle network error
  console.error('Network error:', error)
}
```

### Loading States

```typescript
const [campaigns, setCampaigns] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function load() {
    const response = await campaignApi.list({ status: 'active' })
    if (response.success) {
      setCampaigns(response.data)
    }
    setLoading(false)
  }
  load()
}, [])
```

### Pagination

```typescript
const [offset, setOffset] = useState(0)
const limit = 20

const response = await campaignApi.list({
  status: 'active',
  limit,
  offset
})

// Next page
setOffset(offset + limit)
```

---

## Next Steps

- [Full API Reference](README.md) - All endpoints documented
- [Usage Examples](examples.md) - Real-world patterns
- [Campaign Planning](../campaigns/world-tour/planning-guide.md) - How to run campaigns

---

## Quick Reference

### Campaign Lifecycle

```typescript
// 1. Create
const campaign = await campaignApi.create({ name: '...' })

// 2. Invite participants
await campaignApi.addParticipant(campaign.data.id, { storyteller_id: '...' })

// 3. Check analytics
const analytics = await campaignApi.getAnalytics(campaign.data.id)

// 4. Get moderation queue
const queue = await workflowApi.getQueue({ campaign_id: campaign.data.id })

// 5. Advance workflows
await workflowApi.update(workflowId, { stage: 'consented' })
```

### Workflow Stages

```
invited → interested → consented → recorded → reviewed → published
```

### Common Filters

```typescript
// Active campaigns only
campaignApi.list({ status: 'active' })

// Tour stops only
campaignApi.list({ type: 'tour_stop' })

// Featured campaigns
campaignApi.list({ featured: true })

// Participants needing consent
campaignApi.getParticipants(id, { stage: 'interested' })

// Workflows needing elder review
campaignApi.getParticipants(id, { elder_review: true })
```

---

## Support

- [GitHub Issues](https://github.com/yourusername/empathy-ledger-v2/issues)
- [Full Documentation](../INDEX.md)
- [Campaign Guides](../campaigns/)
