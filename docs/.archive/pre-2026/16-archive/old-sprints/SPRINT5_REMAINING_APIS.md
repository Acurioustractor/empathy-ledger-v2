# Sprint 5 Remaining APIs - Quick Implementation Guide

**Status:** 17/30 Complete
**Remaining:** 13 endpoints (6 Recruitment + 8 Curation - 1 exists + 3 Analytics)

---

## Recruitment APIs (6 endpoints)

All recruitment APIs need to be created in `/src/app/api/recruitment/`

### Implementation Notes:
- Email/SMS sending requires integration with email service (e.g., Resend, SendGrid)
- QR code generation requires `qrcode` npm package
- Magic links need cryptographically secure tokens
- All invitations track in `invitations` table

---

## Curation APIs (7 endpoints - 1 exists)

**Note:** `/api/projects` already exists, so we only need 7 new endpoints.

All curation APIs in `/src/app/api/curation/`

### Key Tables:
- `stories` - existing
- `story_themes` - new (many-to-many)
- `campaigns` - new
- `project_story_assignments` - use existing `stories.project_id`

---

## Analytics APIs (3 endpoints)

All analytics APIs in `/src/app/api/analytics/`

### Export Implementation:
- CSV: Use string building (already shown in consent/export)
- PDF: Requires `pdfkit` or similar library
- Include proper Content-Disposition headers

---

## QUICK WINS - Copy/Paste Ready Code

Since we're optimizing for speed, here are the most critical endpoints with full implementations:

### 1. POST /api/recruitment/send-invitations

**File:** `src/app/api/recruitment/send-invitations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      organization_id,
      project_id,
      channel,
      recipients,
      message,
      expiry_days,
      require_consent
    } = body

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiry_days)

    // Create invitation records
    const invitationPromises = recipients.map(async (recipient: any) => {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id,
          project_id,
          channel,
          recipient_name: recipient.name,
          recipient_contact: recipient.value,
          status: 'pending',
          sent_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          message
        })
        .select()
        .single()

      if (error) throw error

      // TODO: Actually send email/SMS via service
      // For now, just return the invitation record
      return data
    })

    const invitations = await Promise.all(invitationPromises)

    return NextResponse.json({
      success: true,
      sent: invitations.length,
      invitations
    })
  } catch (error) {
    console.error('Error sending invitations:', error)
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 })
  }
}
```

### 2. POST /api/curation/assign

**File:** `src/app/api/curation/assign/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { organization_id, project_id, story_ids } = body

    if (!project_id || !story_ids || story_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id, story_ids' },
        { status: 400 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update all stories to assign them to the project
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        project_id,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id
      })
      .in('id', story_ids)

    if (updateError) {
      console.error('Error assigning stories:', updateError)
      return NextResponse.json({ error: 'Failed to assign stories' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: story_ids.length,
      message: `${story_ids.length} stories assigned to project`
    })
  } catch (error) {
    console.error('Error in assign stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 3. POST /api/curation/themes

**File:** `src/app/api/curation/themes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { story_id, themes } = body

    if (!story_id || !themes) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, themes' },
        { status: 400 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete existing themes for this story
    await supabase
      .from('story_themes')
      .delete()
      .eq('story_id', story_id)

    // Insert new themes
    const themeInserts = themes.map((theme: string) => ({
      story_id,
      theme,
      added_by: user.id,
      ai_suggested: false
    }))

    const { error: insertError } = await supabase
      .from('story_themes')
      .insert(themeInserts)

    if (insertError) {
      console.error('Error saving themes:', insertError)
      return NextResponse.json({ error: 'Failed to save themes' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: themes.length,
      message: `${themes.length} themes saved`
    })
  } catch (error) {
    console.error('Error in save themes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 4. GET /api/analytics/themes

**File:** `src/app/api/analytics/themes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const timeRange = searchParams.get('time_range') || '30days'

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date threshold
    let dateThreshold: Date | null = null
    if (timeRange !== 'all') {
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90
      dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)
    }

    // Get themes with story counts
    let query = supabase
      .from('story_themes')
      .select('theme, stories!inner(id, created_at, tenant_id, project_id)')

    if (organizationId) {
      query = query.eq('stories.tenant_id', organizationId)
    }
    if (projectId) {
      query = query.eq('stories.project_id', projectId)
    }
    if (dateThreshold) {
      query = query.gte('stories.created_at', dateThreshold.toISOString())
    }

    const { data: themeData, error: themesError } = await query

    if (themesError) {
      console.error('Error fetching themes:', themesError)
      return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
    }

    // Aggregate theme counts
    const themeCounts: Record<string, number> = {}
    themeData?.forEach(item => {
      themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1
    })

    const totalStories = themeData?.length || 1 // Avoid division by zero

    // Format and sort themes
    const themes = Object.entries(themeCounts)
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: Math.round((count / totalStories) * 100),
        trend: 'stable' as const, // TODO: Calculate actual trend
        growth: 0 // TODO: Calculate growth vs previous period
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ themes })
  } catch (error) {
    console.error('Error in analytics themes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## SUMMARY - Create These Files:

### Recruitment (6 files):
1. `src/app/api/recruitment/send-invitations/route.ts` ✅ (code above)
2. `src/app/api/recruitment/magic-links/generate/route.ts` (similar pattern)
3. `src/app/api/recruitment/magic-links/send/route.ts` (similar pattern)
4. `src/app/api/recruitment/qr-codes/generate/route.ts` (needs qrcode lib)
5. `src/app/api/recruitment/invitations/route.ts` (GET - similar to consent/all)
6. `src/app/api/recruitment/invitations/[id]/resend/route.ts` (similar to renew)

### Curation (7 files):
1. `src/app/api/curation/stats/route.ts` (similar to consent/stats)
2. `src/app/api/curation/stories/route.ts` (GET - similar to review-queue)
3. `src/app/api/curation/assign/route.ts` ✅ (code above)
4. `src/app/api/curation/themes/route.ts` ✅ (code above)
5. `src/app/api/curation/campaigns/route.ts` (GET/POST both)
6. `src/app/api/curation/review-queue/route.ts` (similar to elder/review-queue)
7. `src/app/api/curation/review-queue/submit/route.ts` (similar pattern)

### Analytics (3 files):
1. `src/app/api/analytics/export/route.ts` (similar to consent/export)
2. `src/app/api/analytics/themes/route.ts` ✅ (code above)
3. `src/app/api/analytics/timeline/route.ts` (query events by date)

---

## COMPLETION STRATEGY

**Time Estimate:** ~2-3 hours for all remaining endpoints

**Recommended Approach:**
1. Create the 4 files with code provided above (5 minutes)
2. Create remaining files using similar patterns from completed endpoints (2 hours)
3. Test basic functionality (30 minutes)
4. Create database migrations (30 minutes)

**Or you can delegate to me and I'll create all remaining endpoints systematically!**
