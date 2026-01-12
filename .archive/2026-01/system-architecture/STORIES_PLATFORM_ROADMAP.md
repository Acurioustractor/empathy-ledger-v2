# Stories Platform - World-Class Roadmap

**Current Status:** 62% Complete
**Assessment Date:** January 10, 2026
**Assessment Report:** See agent output aa4b17e

---

## Executive Summary

The Stories platform has solid core functionality but needs focused work on:
1. **Bug fixes** - Schema mismatches causing silent failures
2. **Feature completion** - Half-implemented editorial features
3. **Infrastructure** - Search, scheduling, notifications
4. **Analytics** - View tracking exists but no dashboards

**Target:** Reach 90%+ completeness in 4-6 weeks

---

## Phase 1: Critical Fixes & Foundation (Week 1) 🔴

### 1.1 Fix Schema Mismatches (Priority: CRITICAL)

**File:** `src/app/stories/create/page.tsx:586`
```typescript
// CURRENT (BROKEN):
if (formData.cultural_sensitivity_level === 'cultural' ||
    formData.cultural_sensitivity_level === 'sacred')

// OPTIONS DEFINED:
{ value: 'standard', label: 'Standard' },
{ value: 'sensitive', label: 'Sensitive' },
{ value: 'high_sensitivity', label: 'High Sensitivity' },
{ value: 'restricted', label: 'Restricted' }

// FIX: Update condition to match actual values
if (formData.cultural_sensitivity_level === 'high_sensitivity' ||
    formData.cultural_sensitivity_level === 'restricted')
```

**Action Items:**
- [ ] Fix cultural_sensitivity_level condition (lines 586-588)
- [ ] Verify `audience` column exists or remove from form
- [ ] Fix `views_count` vs `view_count` in browse API
- [ ] Fix `story_image_url` vs `featured_image_url` in browse API
- [ ] Fix storytellers join in `/api/stories/mine` (profile_id vs user_id)

**Estimated Time:** 2-3 hours
**Files to Update:**
- `src/app/stories/create/page.tsx`
- `src/app/api/stories/browse/route.ts`
- `src/app/api/stories/mine/route.ts`

### 1.2 Database Schema Audit & Migration

**Create:** `supabase/migrations/20260111000001_fix_stories_schema.sql`

```sql
-- Fix missing columns if needed
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS audience TEXT
  CHECK (audience IN ('all_ages', 'children', 'youth', 'adults', 'elders'));

-- Standardize view count column name
ALTER TABLE stories
  RENAME COLUMN views_count TO view_count;
  -- OR: ADD view_count, migrate data, drop views_count

-- Add missing boolean flags
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS elder_approval_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cultural_review_required BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stories_scheduled ON stories(scheduled_publish_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_stories_search ON stories USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_stories_themes ON stories USING gin(themes);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING gin(tags);

-- Add status history tracking
CREATE TABLE IF NOT EXISTS story_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_story_status_history_story ON story_status_history(story_id, changed_at DESC);
```

**Action Items:**
- [ ] Audit current production schema vs code expectations
- [ ] Create migration to fix mismatches
- [ ] Add story_status_history table
- [ ] Add performance indexes
- [ ] Test migration on staging

**Estimated Time:** 4-6 hours

### 1.3 Full-Text Search Implementation

**Create:** `src/app/api/stories/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const themes = searchParams.get('themes')?.split(',') || []
  const tags = searchParams.get('tags')?.split(',') || []
  const culturalGroup = searchParams.get('cultural_group')
  const audience = searchParams.get('audience')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const supabase = createSupabaseServerClient()

  let dbQuery = supabase
    .from('stories')
    .select(`
      id, title, excerpt, slug,
      featured_image_url, view_count,
      published_at, themes, tags,
      storytellers:storyteller_id (
        id, display_name, profile_image_url
      )
    `)
    .eq('status', 'published')
    .eq('is_public', true)

  // Full-text search using search_vector
  if (query) {
    dbQuery = dbQuery.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english'
    })
  }

  // Theme filtering
  if (themes.length > 0) {
    dbQuery = dbQuery.overlaps('themes', themes)
  }

  // Tag filtering
  if (tags.length > 0) {
    dbQuery = dbQuery.overlaps('tags', tags)
  }

  // Cultural group filtering
  if (culturalGroup) {
    dbQuery = dbQuery.contains('cultural_groups', [culturalGroup])
  }

  // Audience filtering
  if (audience) {
    dbQuery = dbQuery.eq('audience', audience)
  }

  // Pagination
  const offset = (page - 1) * limit
  dbQuery = dbQuery.range(offset, offset + limit - 1)

  // Order by relevance (if query) or recent
  if (query) {
    dbQuery = dbQuery.order('ts_rank(search_vector, websearch_to_tsquery($1))', {
      ascending: false,
      foreignTable: query
    })
  } else {
    dbQuery = dbQuery.order('published_at', { ascending: false })
  }

  const { data: stories, error, count } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    stories,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}
```

**Action Items:**
- [ ] Create search endpoint
- [ ] Test search_vector queries
- [ ] Add search to browse UI
- [ ] Add autocomplete suggestions endpoint

**Estimated Time:** 6-8 hours

### 1.4 Scheduled Publishing Trigger

**Use Inngest** (already in codebase)

**Create:** `src/lib/inngest/functions/publish-scheduled-stories.ts`

```typescript
import { inngest } from '../client'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const publishScheduledStories = inngest.createFunction(
  {
    id: 'publish-scheduled-stories',
    name: 'Publish Scheduled Stories'
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const supabase = createSupabaseAdminClient()

    // Find stories ready to publish
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, organization_id')
      .eq('status', 'scheduled')
      .lte('scheduled_publish_at', new Date().toISOString())

    if (error || !stories?.length) {
      return { published: 0, error: error?.message }
    }

    const results = await Promise.all(
      stories.map(async (story) => {
        const { error: updateError } = await supabase
          .from('stories')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            scheduled_publish_at: null
          })
          .eq('id', story.id)

        if (!updateError) {
          // Log status change
          await supabase.from('story_status_history').insert({
            story_id: story.id,
            from_status: 'scheduled',
            to_status: 'published',
            reason: 'Scheduled publish time reached'
          })

          // TODO: Send notification to author
          // await sendNotification(story.storyteller_id, 'story_published', story)
        }

        return { id: story.id, success: !updateError, error: updateError?.message }
      })
    )

    return {
      published: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  }
)
```

**Register in:** `src/lib/inngest/functions.ts`
```typescript
import { publishScheduledStories } from './functions/publish-scheduled-stories'

export const functions = [
  // ... existing functions
  publishScheduledStories
]
```

**Action Items:**
- [ ] Create Inngest function for scheduled publishing
- [ ] Register function
- [ ] Test with scheduled story
- [ ] Add monitoring/logging

**Estimated Time:** 4-6 hours

---

## Phase 2: Editorial Features (Week 2) 🟠

### 2.1 Complete UnifiedContentFields Integration

**Update:** `src/app/stories/create/page.tsx`

Add article type, SEO fields, syndication to main form (already exists as component):

```typescript
// After line 485, enhance UnifiedContentFields integration:
<UnifiedContentFields
  formData={formData}
  onChange={handleInputChange}
  isSuperAdmin={user?.is_super_admin || false}
  organizations={organizations || []}
  currentOrgId={currentOrgId}
/>
```

**Ensure these fields are submitted:**
- article_type
- meta_title
- meta_description
- slug (editable)
- syndication_destinations
- primary_project
- tags
- themes

**Action Items:**
- [ ] Verify UnifiedContentFields updates formData
- [ ] Add validation for SEO fields (meta_title < 60 chars, meta_description < 160)
- [ ] Auto-generate slug from title with override option
- [ ] Test article creation end-to-end

**Estimated Time:** 3-4 hours

### 2.2 Featured Image Management

**Update:** `src/components/admin/StoryMediaEditor.tsx`

Add featured image selection:

```typescript
// Add to media tab
<div className="space-y-4">
  <Label>Featured Image</Label>
  <p className="text-sm text-stone-500">
    This image will be used for story previews and social sharing
  </p>

  {featuredImage ? (
    <div className="relative">
      <img
        src={featuredImage.url}
        alt="Featured"
        className="w-full h-48 object-cover rounded"
      />
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setFeaturedImage(null)}
        className="absolute top-2 right-2"
      >
        Remove
      </Button>
    </div>
  ) : (
    <Button onClick={() => setShowMediaPicker(true)}>
      Select Featured Image
    </Button>
  )}
</div>

// On selection, update story:
const { error } = await supabase
  .from('stories')
  .update({
    featured_image_id: selectedMedia.id,
    featured_image_url: selectedMedia.url
  })
  .eq('id', storyId)
```

**Action Items:**
- [ ] Add featured image UI to media tab
- [ ] Connect to existing media library
- [ ] Generate OG meta tags from featured image
- [ ] Add image optimization

**Estimated Time:** 4-6 hours

### 2.3 Review Workflow UI

**Create:** `src/app/admin/reviews/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

export default function ReviewQueuePage() {
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetchReviewQueue()
  }, [])

  async function fetchReviewQueue() {
    const res = await fetch('/api/admin/reviews/queue')
    const data = await res.json()
    setStories(data.stories)
  }

  async function handleApprove(storyId: string) {
    await fetch(`/api/admin/reviews/${storyId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback })
    })
    fetchReviewQueue()
  }

  async function handleReject(storyId: string) {
    await fetch(`/api/admin/reviews/${storyId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, reason: 'needs_revision' })
    })
    fetchReviewQueue()
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Review Queue</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Queue list */}
        <div className="col-span-1 space-y-4">
          {stories.map(story => (
            <div
              key={story.id}
              className="p-4 border rounded cursor-pointer hover:bg-stone-50"
              onClick={() => setSelectedStory(story)}
            >
              <h3 className="font-semibold">{story.title}</h3>
              <p className="text-sm text-stone-500">
                by {story.storytellers?.display_name}
              </p>
              <Badge variant="outline">{story.status}</Badge>
            </div>
          ))}
        </div>

        {/* Story preview */}
        <div className="col-span-2">
          {selectedStory && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{selectedStory.title}</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedStory.content }}
              />

              <div className="space-y-4 border-t pt-4">
                <Label>Reviewer Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the author..."
                  rows={4}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(selectedStory.id)}
                    variant="default"
                  >
                    Approve & Publish
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedStory.id)}
                    variant="destructive"
                  >
                    Request Revisions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Create API Routes:**
- `src/app/api/admin/reviews/queue/route.ts` - GET stories in review
- `src/app/api/admin/reviews/[id]/approve/route.ts` - POST approve
- `src/app/api/admin/reviews/[id]/reject/route.ts` - POST reject

**Action Items:**
- [ ] Create review queue page
- [ ] Create review API endpoints
- [ ] Add email notifications on approval/rejection
- [ ] Track review history in story_status_history

**Estimated Time:** 8-10 hours

---

## Phase 3: Analytics & Engagement (Week 3-4) 🟡

### 3.1 Analytics Dashboard

**Create:** `src/app/admin/analytics/stories/page.tsx`

**Metrics:**
- Total views (last 7/30/90 days)
- Top performing stories
- Engagement rate (comments per view)
- Theme/tag distribution
- Publishing velocity
- Average reading time

**Charts:**
- Views over time (line chart)
- Stories by status (pie chart)
- Top themes (bar chart)
- Engagement funnel

**Action Items:**
- [ ] Create analytics page
- [ ] Query story_views table
- [ ] Calculate engagement metrics
- [ ] Add charts (use Recharts or Chart.js)
- [ ] Export to CSV

**Estimated Time:** 12-16 hours

### 3.2 Notifications System

**Create:** `src/lib/services/notification.service.ts`

**Types:**
- Story published
- Collaboration invite
- Comment on your story
- Review approved/rejected
- Scheduled publish complete

**Delivery:**
- In-app notifications
- Email notifications
- Push notifications (future)

**Action Items:**
- [ ] Create notifications table
- [ ] Create notification service
- [ ] Add email templates
- [ ] Integrate with SendGrid/Resend
- [ ] Add notification center UI

**Estimated Time:** 10-12 hours

### 3.3 Comment Moderation

**Create:** `src/app/admin/comments/page.tsx`

**Features:**
- Pending comments queue
- Bulk approve/reject
- Flag spam
- Ban users
- Comment reports

**Action Items:**
- [ ] Create moderation UI
- [ ] Add bulk actions API
- [ ] Implement spam detection
- [ ] Add user reporting

**Estimated Time:** 8-10 hours

---

## Phase 4: Syndication & Advanced (Week 5-6) 🟢

### 4.1 Syndication System

**Update:** UnifiedContentFields to enable syndication destinations

**Create:** `src/lib/services/syndication.service.ts`

**Platforms:**
- Medium
- LinkedIn
- Dev.to
- Hashnode

**Features:**
- OAuth connection
- Auto-publish on story publish
- Track syndication status
- Pull analytics from platforms

**Action Items:**
- [ ] Create platform connections UI
- [ ] Implement OAuth flows
- [ ] Create syndication worker
- [ ] Track syndication performance

**Estimated Time:** 20-24 hours

### 4.2 Story Recommendations

**Create:** `src/app/api/stories/[id]/related/route.ts`

**Algorithm:**
- Match on themes
- Match on tags
- Match on cultural groups
- Consider user reading history

**Action Items:**
- [ ] Implement recommendation logic
- [ ] Create related stories endpoint
- [ ] Add to story display page
- [ ] Track recommendation clicks

**Estimated Time:** 8-10 hours

### 4.3 Bulk Operations

**Create:** `src/app/admin/stories/bulk/page.tsx`

**Operations:**
- Bulk publish
- Bulk archive
- Bulk tag addition
- Bulk status change
- Bulk export

**Action Items:**
- [ ] Create bulk operations UI
- [ ] Create bulk API endpoints
- [ ] Add progress tracking
- [ ] Add undo capability

**Estimated Time:** 10-12 hours

---

## Success Metrics

### Technical Metrics
- [ ] All schema mismatches resolved
- [ ] Full-text search returning results in <200ms
- [ ] Scheduled publishing executing within 5 minutes of scheduled time
- [ ] 95%+ test coverage on story APIs
- [ ] Zero critical bugs in production

### Feature Metrics
- [ ] 100% of editorial features accessible in UI
- [ ] Review workflow reducing publication time by 50%
- [ ] Analytics dashboard showing real-time data
- [ ] Syndication reaching 3+ platforms
- [ ] Search finding relevant stories with 80%+ accuracy

### User Experience Metrics
- [ ] Story creation completing in <5 minutes
- [ ] Search results appearing in <1 second
- [ ] Mobile-responsive on all story pages
- [ ] Accessibility score 90+ on Lighthouse
- [ ] User satisfaction 8+/10

---

## Resource Requirements

### Development Time
- **Phase 1:** 20-24 hours (1 week with focused effort)
- **Phase 2:** 24-30 hours (1.5 weeks)
- **Phase 3:** 36-44 hours (2 weeks)
- **Phase 4:** 48-56 hours (2.5 weeks)
- **Total:** 128-154 hours (~7 weeks at 20 hours/week)

### Infrastructure
- Inngest for scheduled jobs (already available)
- Email service (SendGrid/Resend)
- Image optimization service (Cloudinary/imgix)
- Search infrastructure (PostgreSQL FTS sufficient initially)
- Analytics database (PostgreSQL sufficient initially)

### External Services
- Medium API (for syndication)
- LinkedIn API (for syndication)
- Email service provider
- Monitoring (Sentry, LogRocket)

---

## Risk Mitigation

### Technical Risks
1. **Schema migrations breaking production**
   - Mitigation: Test all migrations on staging first
   - Rollback plan: Keep backups, reversible migrations

2. **Search performance degradation**
   - Mitigation: Index optimization, query limits
   - Fallback: Metadata-only search initially

3. **Scheduled publishing failures**
   - Mitigation: Retry logic, monitoring alerts
   - Fallback: Manual publish dashboard

### Business Risks
1. **Feature creep delaying launch**
   - Mitigation: Strict phase gating, MVP definition
   - Focus: Phase 1-2 essential, Phase 3-4 can ship later

2. **User adoption of new features**
   - Mitigation: User testing, documentation, onboarding
   - Measure: Track feature usage, collect feedback

---

## Next Steps

### Immediate (Today)
1. Review this roadmap with team
2. Prioritize Phase 1 items
3. Set up staging environment
4. Create Phase 1 tickets

### This Week
1. Complete Phase 1.1 (schema fixes)
2. Start Phase 1.2 (database migration)
3. Begin Phase 1.3 (search implementation)

### Ongoing
1. Weekly progress reviews
2. User feedback collection
3. Performance monitoring
4. Documentation updates

---

**Last Updated:** January 10, 2026
**Next Review:** January 17, 2026
