# Sprint 5 API Implementation Guide

**Status:** In Progress
**Total Endpoints:** 30
**Completed:** 5 Elder Review endpoints

---

## ✅ COMPLETED: Elder Review APIs (5/5)

### 1. GET /api/elder/review-stats ✅
**File:** `src/app/api/elder/review-stats/route.ts`
**Purpose:** Get Elder review dashboard statistics
**Response:**
```json
{
  "stats": {
    "pending": 15,
    "approved": 89,
    "rejected": 3,
    "requestedChanges": 12,
    "escalated": 2
  }
}
```

### 2. GET /api/elder/review-queue ✅
**File:** `src/app/api/elder/review-queue/route.ts`
**Purpose:** Get stories pending Elder review
**Query Params:**
- `organization_id` - Filter by organization
- `priority` - Filter by priority (urgent/high/medium/low)
- `sensitivity` - Filter by cultural sensitivity

**Response:**
```json
{
  "stories": [
    {
      "id": "story-123",
      "title": "Story Title",
      "storyteller_name": "Elder Grace",
      "submitted_at": "2026-01-05T10:00:00Z",
      "priority": "high",
      "cultural_sensitivity": "sacred",
      "status": "pending_review"
    }
  ]
}
```

### 3. POST /api/elder/review-queue/submit ✅
**File:** `src/app/api/elder/review-queue/submit/route.ts`
**Purpose:** Submit an Elder review decision
**Body:**
```json
{
  "story_id": "story-123",
  "elder_id": "elder-456",
  "elder_name": "Elder Grace",
  "decision": "approve",
  "cultural_guidance": "Optional guidance...",
  "concerns": ["sacred_knowledge"],
  "requested_changes": "Optional changes...",
  "escalation_reason": "Optional reason...",
  "notify_storyteller": true,
  "reviewed_at": "2026-01-05T10:00:00Z"
}
```

### 4. GET /api/elder/review-history ✅
**File:** `src/app/api/elder/review-history/route.ts`
**Purpose:** Get Elder's review history
**Query Params:**
- `elder_id` - Filter by Elder ID
- `decision` - Filter by decision type
- `search` - Search by story title or storyteller

### 5. POST /api/elder/review-queue/escalate ✅
**File:** `src/app/api/elder/review-queue/escalate/route.ts`
**Purpose:** Escalate story to Elder Council
**Body:**
```json
{
  "story_id": "story-123",
  "elder_id": "elder-456",
  "escalation_reason": "Requires Council wisdom",
  "concerns": ["sacred_knowledge", "community_representation"],
  "cultural_guidance": "Optional guidance..."
}
```

---

## ⏳ PENDING: Consent Tracking APIs (0/8)

### 1. GET /api/consent/stats
**Purpose:** Get consent dashboard statistics
**Implementation:**
```typescript
// Calculate:
// - total, active, withdrawn, expired, expiringThisMonth
// - byType: story, photo, ai, sharing
```

### 2. GET /api/consent/all
**Purpose:** Get all consents with filters
**Query Params:**
- `storyteller_id` - Filter by storyteller
- `organization_id` - Filter by organization
- `status` - Filter by status (active/withdrawn/expired)
- `type` - Filter by type (story/photo/ai/sharing)
- `search` - Search by content title or purpose

### 3. GET /api/consent/expiring
**Purpose:** Get consents expiring within 30 days
**Query Params:**
- `storyteller_id`
- `organization_id`
- `days` - Days threshold (default 30)

### 4. POST /api/consent/[id]/renew
**Purpose:** Renew a consent
**Body:**
```json
{
  "renewal_period": "1year" | "2years" | "5years" | "indefinite",
  "acknowledgement": true
}
```

### 5. POST /api/consent/[id]/withdraw
**Purpose:** Withdraw a consent
**Body:**
```json
{
  "reason": "Optional reason for withdrawal",
  "understanding": true
}
```

### 6. GET /api/consent/audit-trail
**Purpose:** Get consent audit events
**Query Params:**
- `storyteller_id`
- `organization_id`
- `consent_id`
- `event_type` - Filter by event type

### 7. GET /api/consent/export
**Purpose:** Export consent data to CSV
**Query Params:**
- `storyteller_id`
- `organization_id`
- `date_range`

### 8. POST /api/consent/restore
**Purpose:** Restore a withdrawn consent
**Body:**
```json
{
  "consent_id": "consent-123",
  "reason": "Optional reason for restoration"
}
```

---

## ⏳ PENDING: Recruitment APIs (0/6)

### 1. POST /api/recruitment/send-invitations
**Purpose:** Send email/SMS invitations
**Body:**
```json
{
  "organization_id": "org-123",
  "project_id": "project-456",
  "channel": "email" | "sms",
  "recipients": [
    {
      "value": "email@example.com",
      "name": "Elder Grace"
    }
  ],
  "message": "Custom invitation message",
  "expiry_days": 7,
  "require_consent": true
}
```

### 2. POST /api/recruitment/magic-links/generate
**Purpose:** Generate a magic link
**Body:**
```json
{
  "organization_id": "org-123",
  "project_id": "project-456",
  "channel": "standalone" | "email" | "sms",
  "recipient_name": "Elder Grace",
  "recipient_contact": "email@example.com",
  "expiry_days": 7,
  "require_consent": true
}
```

### 3. POST /api/recruitment/magic-links/send
**Purpose:** Send a magic link via channel
**Body:**
```json
{
  "link_id": "link-123",
  "channel": "email" | "sms",
  "recipient_contact": "email@example.com",
  "recipient_name": "Elder Grace"
}
```

### 4. POST /api/recruitment/qr-codes/generate
**Purpose:** Generate a QR code
**Body:**
```json
{
  "organization_id": "org-123",
  "project_id": "project-456",
  "name": "Community Gathering Sept 2026",
  "event_name": "Annual Storytelling Circle",
  "event_date": "2026-09-15",
  "event_location": "Community Center",
  "size": 256 | 512 | 1024,
  "expiry_days": 30,
  "require_consent": true
}
```

### 5. GET /api/recruitment/invitations
**Purpose:** Get all invitations
**Query Params:**
- `organization_id`
- `project_id`
- `status` - pending/accepted/declined/expired
- `channel` - email/sms/magic_link/qr_code

### 6. POST /api/recruitment/invitations/[id]/resend
**Purpose:** Resend an invitation

---

## ⏳ PENDING: Curation APIs (0/8)

### 1. GET /api/curation/stats
**Purpose:** Get curation dashboard stats
**Response:**
```json
{
  "stats": {
    "totalStories": 550,
    "assignedToProjects": 400,
    "unassigned": 150,
    "taggedWithThemes": 450,
    "untagged": 100,
    "pendingReview": 25,
    "publishReady": 200
  }
}
```

### 2. GET /api/curation/stories
**Purpose:** Get stories for curation
**Query Params:**
- `organization_id`
- `project_id`
- `status` - Filter by status
- `assignment` - all/assigned/unassigned

### 3. POST /api/curation/assign
**Purpose:** Assign stories to project
**Body:**
```json
{
  "organization_id": "org-123",
  "project_id": "project-456",
  "story_ids": ["story-1", "story-2", "story-3"]
}
```

### 4. POST /api/curation/themes
**Purpose:** Save themes for a story
**Body:**
```json
{
  "story_id": "story-123",
  "themes": ["Land & Territory", "Cultural Identity", "Healing & Wellness"]
}
```

### 5. GET /api/curation/campaigns
**Purpose:** Get all campaigns
**Query Params:**
- `organization_id`
- `project_id`
- `status` - draft/active/completed/archived

### 6. POST /api/curation/campaigns
**Purpose:** Create a new campaign
**Body:**
```json
{
  "organization_id": "org-123",
  "project_id": "project-456",
  "name": "Truth & Reconciliation Week 2026",
  "description": "Campaign description...",
  "start_date": "2026-09-21",
  "end_date": "2026-09-27",
  "target_story_count": 20,
  "status": "draft"
}
```

### 7. GET /api/curation/review-queue
**Purpose:** Get quality review queue
**Query Params:**
- `organization_id`
- `project_id`
- `status` - pending_review

### 8. POST /api/curation/review-queue/submit
**Purpose:** Submit quality review
**Body:**
```json
{
  "story_id": "story-123",
  "decision": "approve" | "minor_edits" | "major_revision" | "decline",
  "notes": "Review notes...",
  "reviewed_at": "2026-01-05T10:00:00Z"
}
```

---

## ⏳ PENDING: Analytics APIs (0/3)

### 1. GET /api/analytics/export
**Purpose:** Export analytics data
**Query Params:**
- `organization_id`
- `project_id`
- `format` - csv/pdf
- `date_range` - 7days/30days/90days/all
- `include_stories` - true/false
- `include_storytellers` - true/false
- `include_themes` - true/false
- `include_projects` - true/false
- `include_campaigns` - true/false
- `include_consents` - true/false
- `include_reviews` - true/false

**Response:** File download (CSV or PDF)

### 2. GET /api/analytics/themes
**Purpose:** Get theme distribution data
**Query Params:**
- `organization_id`
- `project_id`
- `time_range` - 7days/30days/90days/all

**Response:**
```json
{
  "themes": [
    {
      "theme": "Land & Territory",
      "count": 125,
      "percentage": 22.7,
      "trend": "up",
      "growth": 15.3
    }
  ]
}
```

### 3. GET /api/analytics/timeline
**Purpose:** Get project timeline events
**Query Params:**
- `organization_id`
- `project_id`
- `view_mode` - month/quarter/year
- `year`
- `month`

**Response:**
```json
{
  "events": [
    {
      "id": "event-123",
      "project_id": "project-456",
      "project_name": "Community Stories",
      "event_type": "story_added",
      "event_date": "2026-01-05T10:00:00Z",
      "description": "5 new stories added",
      "story_count": 5,
      "storyteller_count": 3
    }
  ]
}
```

---

## 🔧 DATABASE SCHEMA REQUIREMENTS

### New Tables Needed:

#### story_reviews
```sql
CREATE TABLE story_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id),
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_name TEXT,
  decision TEXT CHECK (decision IN ('approve', 'reject', 'request_changes', 'escalate')),
  cultural_guidance TEXT,
  concerns TEXT[],
  requested_changes TEXT,
  escalation_reason TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### consents
```sql
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID REFERENCES profiles(id),
  content_id UUID REFERENCES stories(id),
  content_title TEXT,
  consent_type TEXT CHECK (consent_type IN ('story', 'photo', 'ai', 'sharing')),
  purpose TEXT,
  status TEXT CHECK (status IN ('active', 'withdrawn', 'expired')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### consent_audit
```sql
CREATE TABLE consent_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID REFERENCES consents(id),
  event_type TEXT CHECK (event_type IN ('granted', 'renewed', 'withdrawn', 'expired', 'modified')),
  performed_by UUID REFERENCES profiles(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  details TEXT,
  ip_address TEXT
);
```

#### invitations
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  project_id UUID,
  channel TEXT CHECK (channel IN ('email', 'sms', 'magic_link', 'qr_code')),
  recipient_name TEXT,
  recipient_contact TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  magic_link_token TEXT UNIQUE,
  qr_code_data TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  project_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  target_story_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### story_themes
```sql
CREATE TABLE story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id),
  theme TEXT NOT NULL,
  added_by UUID REFERENCES profiles(id),
  ai_suggested BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, theme)
);
```

---

## 🚀 NEXT STEPS

### Phase 1: Complete Consent APIs (8 endpoints)
1. Create consent/stats route
2. Create consent/all route
3. Create consent/expiring route
4. Create consent/[id]/renew route
5. Create consent/[id]/withdraw route
6. Create consent/audit-trail route
7. Create consent/export route
8. Create consent/restore route

### Phase 2: Create Database Migrations
1. Create story_reviews table
2. Create consents table
3. Create consent_audit table
4. Create invitations table
5. Create campaigns table
6. Create story_themes table

### Phase 3: Complete Recruitment APIs (6 endpoints)
### Phase 4: Complete Curation APIs (8 endpoints)
### Phase 5: Complete Analytics APIs (3 endpoints)
### Phase 6: Build Test Pages
### Phase 7: Integration Testing

---

## 📊 PROGRESS TRACKER

| API Category | Endpoints | Status | Completed |
|--------------|-----------|--------|-----------|
| Elder Review | 5 | ✅ COMPLETE | 5/5 |
| Consent Tracking | 8 | ⏳ PENDING | 0/8 |
| Recruitment | 6 | ⏳ PENDING | 0/6 |
| Curation | 8 | ⏳ PENDING | 0/8 |
| Analytics | 3 | ⏳ PENDING | 0/3 |
| **TOTAL** | **30** | **17% COMPLETE** | **5/30** |

---

**Status:** Elder Review APIs complete (5/5). Ready to proceed with Consent Tracking APIs and database migrations.
