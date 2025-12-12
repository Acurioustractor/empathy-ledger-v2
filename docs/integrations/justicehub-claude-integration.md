# JusticeHub CLAUDE.md Integration Guide

Add the following sections to JusticeHub's CLAUDE.md file to enable integration with Empathy Ledger's Stories as a Service platform.

---

## Add to JusticeHub CLAUDE.md:

```markdown
## Empathy Ledger Integration

JusticeHub integrates with Empathy Ledger as a **story consumer**. Stories are managed and approved in Empathy Ledger, then syndicated to JusticeHub via Supabase.

### Architecture

- **Source of Truth**: Empathy Ledger (stories, consent, approvals)
- **Access Method**: Shared Supabase database with RLS policies
- **Consent Model**: Storytellers approve sharing per-app in Empathy Ledger

### Environment Variables

```env
# Empathy Ledger Integration
EMPATHY_LEDGER_APP_KEY=your_justicehub_api_key
EMPATHY_LEDGER_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
EMPATHY_LEDGER_SUPABASE_ANON_KEY=your_anon_key
```

### Database Access

JusticeHub accesses stories through the `syndicated_stories` view:

```typescript
// src/lib/empathy-ledger/client.ts
import { createClient } from '@supabase/supabase-js'

const empathyLedgerClient = createClient(
  process.env.EMPATHY_LEDGER_SUPABASE_URL!,
  process.env.EMPATHY_LEDGER_SUPABASE_ANON_KEY!
)

export async function fetchSyndicatedStories(options?: {
  type?: string
  limit?: number
  offset?: number
}) {
  // Set app context for RLS
  await empathyLedgerClient.rpc('set_app_context', {
    app_key: process.env.EMPATHY_LEDGER_APP_KEY
  })

  let query = empathyLedgerClient
    .from('syndicated_stories')
    .select('*')

  if (options?.type) {
    query = query.eq('story_type', options.type)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function logStoryAccess(storyId: string, accessType: 'view' | 'embed' | 'export') {
  await empathyLedgerClient.rpc('set_app_context', {
    app_key: process.env.EMPATHY_LEDGER_APP_KEY
  })

  await empathyLedgerClient.from('story_access_log').insert({
    story_id: storyId,
    app_id: await getAppId(),
    access_type: accessType,
    accessor_user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
  })
}
```

### Story Types Available to JusticeHub

- `testimony` - Personal testimonies for legal advocacy
- `case_study` - Case studies and legal precedents
- `advocacy` - Advocacy stories and campaigns

### Displaying Stories

```typescript
// src/components/empathy-stories/StoryCard.tsx
import { SyndicatedStory } from '@/lib/empathy-ledger/types'

interface StoryCardProps {
  story: SyndicatedStory
  onView?: () => void
}

export function StoryCard({ story, onView }: StoryCardProps) {
  return (
    <div className="story-card">
      <h3>{story.title}</h3>
      <p className="storyteller">By {story.storyteller_name}</p>
      <div className="content">{story.content}</div>

      {story.cultural_restrictions && (
        <div className="cultural-notice">
          Cultural protocols apply to this story.
        </div>
      )}

      <footer>
        <span>Source: Empathy Ledger</span>
        <span>Shared with consent</span>
      </footer>
    </div>
  )
}
```

### Required Attribution

All stories from Empathy Ledger must include:

1. **Source attribution**: "Story shared via Empathy Ledger"
2. **Consent notice**: "Shared with storyteller consent"
3. **Cultural protocols**: Display any cultural restrictions
4. **Link back**: Optional link to full story in Empathy Ledger

### API Routes

```typescript
// src/app/api/stories/empathy-ledger/route.ts
import { fetchSyndicatedStories } from '@/lib/empathy-ledger/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || undefined
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const stories = await fetchSyndicatedStories({ type, limit, offset })
    return NextResponse.json(stories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
```

### Testing Integration

```bash
# Test fetching stories
curl http://localhost:3000/api/stories/empathy-ledger?type=testimony&limit=5

# Verify consent is working
# Stories should only appear if storyteller has granted JusticeHub access
```

### Consent Flow

1. Storyteller creates story in **Empathy Ledger**
2. Storyteller goes to **Sharing Settings** in Empathy Ledger
3. Storyteller enables **JusticeHub** and sets preferences
4. Story appears in JusticeHub's `syndicated_stories` view
5. JusticeHub displays story with proper attribution
6. All access is logged for storyteller to review

### Error Handling

```typescript
// Handle consent-related errors gracefully
try {
  const stories = await fetchSyndicatedStories()
} catch (error) {
  if (error.message.includes('Invalid or inactive app key')) {
    // App not registered or key revoked
    console.error('Empathy Ledger integration not configured')
  }
  // Fall back to local stories or show message
}
```

### Beads Integration

JusticeHub uses Beads for task management. Integration tasks:

```bash
# Create integration tasks
bd create "Implement Empathy Ledger story fetching" -p 1 -t feature
bd create "Add story attribution components" -p 2 -t feature
bd create "Set up access logging" -p 2 -t feature
bd create "Test consent flow end-to-end" -p 1 -t test
```
```

---

## Copy to JusticeHub project

Save this content to your JusticeHub project's `CLAUDE.md` file to enable Claude Code to understand the integration.
