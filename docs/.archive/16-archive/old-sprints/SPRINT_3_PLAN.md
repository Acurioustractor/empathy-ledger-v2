# Sprint 3 Planning: Community & Discovery

**Planning Date:** January 4, 2026
**Target Duration:** 2 weeks (Jan 6-17, 2026)
**Sprint Goal:** Build community engagement and story discovery features

---

## Sprint Context

**Sprint 1 Complete** ✅ (14 components - Foundation & Profile)
**Sprint 2 Complete** ✅ (8 components - Stories & Media)
**Total Delivered:** 22 components in 1 day!

---

## Theme Options

### Option A: Community Features (RECOMMENDED)
Build engagement features that connect storytellers and readers.

**Rationale:**
- Natural progression after publishing stories
- Completes the story lifecycle (create → publish → engage)
- High user value
- Leverages existing stories and profiles

**Components:**
1. **CommentSection** - Comment on stories with Elder moderation
2. **ReactionBar** - Respectful emoji reactions
3. **StorySharing** - Share stories (email, link, social)
4. **RelatedStories** - "You might also like..."
5. **FollowButton** - Follow storytellers
6. **NotificationCenter** - Activity notifications
7. **CommunityFeed** - Latest community stories
8. **EngagementMetrics** - Views, reactions, comments count

**Cultural Safety:**
- Sacred content: comments disabled or Elder-only
- Reaction moderation (prevent inappropriate)
- Share privacy respected
- Elder authority in comment moderation

---

### Option B: Analytics & Insights
Build data visualization and impact measurement tools.

**Components:**
1. **StoryAnalyticsDashboard** - Story performance metrics
2. **AudienceInsights** - Who's reading your stories
3. **ThemeAnalysis** - AI-extracted themes visualization
4. **ImpactReport** - Story impact summary
5. **EngagementChart** - Time-series engagement
6. **DemographicsView** - Reader demographics
7. **DownloadReport** - Export analytics as PDF
8. **ComparisonView** - Compare story performance

**Cultural Safety:**
- Anonymous aggregation (protect reader privacy)
- Opt-in analytics for storytellers
- Sacred content excluded from public analytics
- Community-focused metrics (not vanity metrics)

---

### Option C: Search & Discovery
Build intelligent story finding and recommendation system.

**Components:**
1. **SearchBar** - Full-text story search
2. **AdvancedFilters** - Filter by theme, location, sensitivity
3. **SearchResults** - Paginated results with previews
4. **TagCloud** - Visual tag exploration
5. **LocationMap** - Map of story locations
6. **ThemeExplorer** - Browse by theme/topic
7. **RecommendationEngine** - AI-powered recommendations
8. **SavedStories** - Bookmark stories to read later

**Cultural Safety:**
- Respect privacy levels in search
- Sacred content not in public search
- Location privacy (exact vs region)
- Cultural context in results
- Elder-reviewed content prioritized

---

## Recommended Sprint 3: Community Features

### Why This Sprint?

1. **User Value**: Storytelling is social - engagement matters
2. **Complete Workflow**: Create → Publish → **Engage** → Measure
3. **Platform Growth**: Community features drive retention
4. **Cultural Alignment**: Community-first approach
5. **Technical Foundation**: Builds on Sprint 2 stories

### Sprint 3 Component Details

#### 1. CommentSection (Priority: HIGH)
**File:** `src/components/community/CommentSection.tsx`

**Features:**
- Threaded comments (reply to comments)
- Elder moderation queue
- Edit/delete own comments
- Flag inappropriate content
- Character limit with counter
- Markdown support
- Comment notifications

**Cultural Safety:**
- Sacred content: comments disabled OR Elder-only
- Moderation workflow (pending → approved)
- Elder authority to remove/edit
- Respect cultural protocols
- Consent reminders

---

#### 2. ReactionBar (Priority: HIGH)
**File:** `src/components/community/ReactionBar.tsx`

**Features:**
- 6-8 respectful emoji reactions
- One-click to add/remove
- Reaction counts display
- Hover to see who reacted
- Anonymous reaction option
- Reaction history

**Reactions:**
- 💙 Gratitude (primary)
- 🙏 Respect
- ❤️ Love
- 🌟 Inspiring
- 💪 Strength
- 🌱 Growth
- 📖 Learning
- ✨ Sacred

**Cultural Safety:**
- No negative reactions (no dislike/sad)
- Sacred content: limited reactions
- Anonymous option (privacy)
- Reaction moderation (Elder can remove)

---

#### 3. StorySharing (Priority: MEDIUM)
**File:** `src/components/community/StorySharing.tsx`

**Features:**
- Copy link button
- Email share
- Social media share (if public)
- Embed code generator
- Share privacy warning
- Share tracking (optional)
- Custom share message

**Cultural Safety:**
- Respect visibility settings
- Private stories: no sharing
- Community stories: member-only share
- Sacred content: sharing disabled
- Warning before external share

---

#### 4. RelatedStories (Priority: MEDIUM)
**File:** `src/components/community/RelatedStories.tsx`

**Features:**
- AI-powered similarity matching
- Tag-based recommendations
- Same storyteller stories
- Same location stories
- Same cultural theme
- Configurable count (3-6)
- Respectful thumbnails

**Cultural Safety:**
- Respect privacy levels
- Sacred content not in suggestions
- Cultural sensitivity matching
- Elder-reviewed content prioritized

---

#### 5. FollowButton (Priority: MEDIUM)
**File:** `src/components/community/FollowButton.tsx`

**Features:**
- One-click follow/unfollow
- Follow count display
- Follower list (privacy controlled)
- Following list for user
- Follow notifications
- Mutual follow indicator

**Cultural Safety:**
- Optional follower visibility
- Elder authority (can't be "unfollowed")
- Privacy-first design
- No gamification (no rankings)

---

#### 6. NotificationCenter (Priority: HIGH)
**File:** `src/components/community/NotificationCenter.tsx`

**Features:**
- Bell icon with unread count
- Dropdown notification list
- Mark as read/unread
- Notification types:
  - New comment on your story
  - New follower
  - Story published
  - Elder review complete
  - Reaction on your story
  - Reply to your comment
- Mark all as read
- Notification preferences

**Cultural Safety:**
- Respectful notification content
- Opt-in notification types
- Email digest option
- Elder notifications prioritized

---

#### 7. CommunityFeed (Priority: MEDIUM)
**File:** `src/components/community/CommunityFeed.tsx`

**Features:**
- Latest published stories
- Filter by community/all
- Infinite scroll
- Story preview cards
- Sort options (newest, popular, trending)
- "New since last visit" badge

**Cultural Safety:**
- Respect visibility settings
- Sacred content excluded
- Community-only stories for members
- Elder-reviewed content highlighted

---

#### 8. EngagementMetrics (Priority: LOW)
**File:** `src/components/community/EngagementMetrics.tsx`

**Features:**
- View count
- Reaction count
- Comment count
- Share count
- Save count
- Reading time total
- Compact display
- Tooltip details

**Cultural Safety:**
- Anonymous aggregation
- Opt-out for storyteller
- Sacred content: metrics disabled
- Focus on impact not vanity

---

## Sprint 3 Technical Requirements

### Database Schema
```sql
-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  author_id UUID REFERENCES profiles(id),
  parent_comment_id UUID REFERENCES comments(id),
  content TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  elder_reviewed BOOLEAN DEFAULT false,
  elder_reviewer_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Reactions table
CREATE TABLE story_reactions (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  user_id UUID REFERENCES profiles(id),
  reaction_type TEXT, -- gratitude, respect, love, etc.
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  UNIQUE(story_id, user_id)
);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  UNIQUE(follower_id, following_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT, -- comment, reaction, follow, etc.
  title TEXT,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
);

-- Story saves (bookmarks)
CREATE TABLE saved_stories (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  UNIQUE(story_id, user_id)
);
```

### API Endpoints
```
POST   /api/stories/[id]/comments
GET    /api/stories/[id]/comments
PUT    /api/comments/[id]
DELETE /api/comments/[id]

POST   /api/stories/[id]/reactions
GET    /api/stories/[id]/reactions
DELETE /api/stories/[id]/reactions

POST   /api/profiles/[id]/follow
DELETE /api/profiles/[id]/follow
GET    /api/profiles/[id]/followers
GET    /api/profiles/[id]/following

GET    /api/notifications
PUT    /api/notifications/[id]/read
PUT    /api/notifications/mark-all-read

POST   /api/stories/[id]/save
DELETE /api/stories/[id]/save
GET    /api/user/saved-stories

GET    /api/stories/feed
GET    /api/stories/[id]/related
```

---

## Sprint 3 Success Criteria

1. ✅ All 8 components built and tested
2. ✅ Database schema deployed
3. ✅ API endpoints functional
4. ✅ Test page created (`/test/sprint-3`)
5. ✅ Cultural safety embedded throughout
6. ✅ WCAG 2.1 AA compliance
7. ✅ Integration with storyteller dashboard
8. ✅ Documentation complete

---

## Sprint 3 Timeline (Estimated)

**Week 1 (Jan 6-10):**
- Day 1: Database schema + CommentSection + ReactionBar
- Day 2: StorySharing + RelatedStories
- Day 3: FollowButton + NotificationCenter
- Day 4: CommunityFeed + EngagementMetrics
- Day 5: Testing + bug fixes

**Week 2 (Jan 13-17):**
- Day 1: API endpoint integration
- Day 2: Dashboard integration
- Day 3: Test page creation
- Day 4: Documentation
- Day 5: UAT + refinements

---

## Risks & Mitigation

**Risk 1: Comment Moderation Complexity**
- Mitigation: Start with simple pending/approved flow
- Phase 2: Advanced moderation tools

**Risk 2: Notification Overload**
- Mitigation: Smart defaults (important only)
- Preference controls from day 1

**Risk 3: Performance (feed loading)**
- Mitigation: Pagination + caching
- Limit feed to last 30 days

**Risk 4: Cultural Safety Edge Cases**
- Mitigation: Elder review for all new features
- Conservative defaults (disable if unsure)

---

## Alternative: Combined Sprint

If we want faster delivery, combine highest priority features from all three options:

**Mini-Sprint: Essential Engagement**
1. CommentSection (from Community)
2. ReactionBar (from Community)
3. SearchBar (from Discovery)
4. StoryAnalyticsDashboard (from Analytics)

This gives immediate value in all three areas without full commitment to one theme.

---

## Decision Required

**Which Sprint 3 should we build?**

A. Community Features (8 components) ← RECOMMENDED
B. Analytics & Insights (8 components)
C. Search & Discovery (8 components)
D. Combined Mini-Sprint (4 components from each)

**Recommendation:** Option A (Community Features)
- Most natural next step
- Highest user engagement
- Completes story lifecycle
- Strong cultural safety alignment
- Foundation for future sprints

---

**Ready to start Sprint 3?** Let me know which option you prefer!
