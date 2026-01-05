# Sprint 3: Public Story Experience - Implementation Plan

**Dates:** February 3-14, 2026 (10 working days)
**Theme:** Public can discover and consume stories
**Goal:** Beautiful, respectful public-facing story platform
**Status:** Ready to Start

---

## Sprint 3 Overview

### Components to Build (40+ components)

1. **Public Homepage** (9 components)
   - Hero section with featured story
   - Territory acknowledgment
   - Featured stories grid
   - Browse by theme
   - Recent stories carousel
   - Storyteller spotlights
   - Platform statistics
   - OCAP® education callout

2. **Story Browsing** (9 components)
   - Browse page with filters
   - Filter sidebar
   - Theme/cultural/media/language filters
   - Sort selector
   - Story preview cards
   - View toggle (grid/list)
   - Pagination
   - Loading/empty states

3. **Individual Story Page** (12 components)
   - Story header with metadata
   - Media player with transcript sync
   - Full transcript display
   - Cultural context panel
   - Storyteller bio sidebar
   - Media gallery
   - Cultural tags display
   - Sacred content warnings
   - Trigger warnings
   - Share button
   - Related stories

4. **Media Player** (8 components)
   - Synced media player
   - Audio waveform
   - Video player (HD)
   - Playback controls
   - Speed/volume controls
   - Transcript sync (karaoke)
   - Keyboard shortcuts
   - Download button

5. **Storyteller Public Profile** (8 components)
   - Profile header
   - Bio section
   - Published stories grid
   - Impact metrics
   - Themes expertise
   - Geographic reach
   - Contact/follow buttons

6. **Comment System** (6 components)
   - Comments section
   - Comment form
   - Comment thread
   - Moderation queue
   - Cultural safety filters
   - Elder approval

**Total:** ~52 components, estimated ~15,000 lines of code

---

## Week 5: Foundation (Feb 3-7)

### Day 1-2: Public Homepage

**Files to Create:**
```
src/app/page.tsx (replace existing)
src/components/public/PublicHomepage.tsx
src/components/public/HeroSection.tsx
src/components/public/TerritoryAcknowledgment.tsx
src/components/public/FeaturedStoriesGrid.tsx
src/components/public/BrowseByTheme.tsx
src/components/public/RecentStoriesCarousel.tsx
src/components/public/StorytellerSpotlight.tsx
src/components/public/PlatformStats.tsx
src/components/public/OCAPCallout.tsx
```

**Key Features:**

**Hero Section:**
- Large featured story with image/video
- Compelling headline
- Cultural territory badge
- CTA: "Explore Stories"

**Territory Acknowledgment:**
- Respectful land acknowledgment
- Rotating or location-based
- "We acknowledge the traditional custodians..."

**Featured Stories Grid:**
- 6-8 curated stories
- Mix of text/audio/video
- Cultural diversity representation
- Beautiful imagery

**Browse by Theme:**
- 12 theme categories
- Cultural icons
- Story counts
- Link to filtered browse

**Recent Stories Carousel:**
- Automatic rotation
- Manual navigation
- Story preview cards
- "View All" link

**Storyteller Spotlights:**
- 3-4 featured storytellers
- Photos, names, cultural affiliations
- Story count
- Link to profile

**Platform Stats:**
- Total stories
- Active storytellers
- Cultural communities represented
- Countries reached

**OCAP® Callout:**
- Educational section
- Ownership, Control, Access, Possession
- Link to learn more

**APIs Needed:**
- `GET /api/public/featured-stories` - Get curated stories
- `GET /api/public/recent-stories` - Get recent published
- `GET /api/public/stats` - Platform statistics
- `GET /api/public/storytellers/featured` - Featured storytellers

---

### Day 3-4: Story Browsing & Filtering

**Files to Create:**
```
src/app/stories/page.tsx
src/components/browse/StoryBrowsePage.tsx
src/components/browse/FilterSidebar.tsx
src/components/browse/ThemeFilter.tsx
src/components/browse/CulturalGroupFilter.tsx
src/components/browse/MediaTypeFilter.tsx
src/components/browse/LanguageFilter.tsx
src/components/browse/SortSelector.tsx
src/components/browse/StoryPreviewCard.tsx
src/components/browse/ViewToggle.tsx
src/components/browse/Pagination.tsx
```

**Features:**

**Filter Sidebar:**
- Collapsible sections
- Multi-select filters
- Active filter badges
- Clear all button

**Theme Filter:**
- 20+ Indigenous themes
- Checkboxes
- Story counts per theme

**Cultural Group Filter:**
- First Nations
- Métis
- Inuit
- Multiple cultural backgrounds

**Media Type Filter:**
- Text stories
- Audio recordings
- Video stories
- Photo essays

**Language Filter:**
- English
- Indigenous languages
- Multilingual content

**Sort Options:**
- Most Recent
- Most Popular (views)
- Alphabetical
- Oldest First
- Most Commented

**Story Preview Card:**
- Thumbnail image/video
- Title
- Excerpt (150 chars)
- Storyteller name & photo
- Cultural tags
- Media type icon
- Reading time / duration
- View count

**APIs Needed:**
- `GET /api/stories/browse` - Browse with filters
- `GET /api/stories/themes` - Get all themes
- `GET /api/stories/cultural-groups` - Get groups
- `GET /api/stories/languages` - Get languages

---

### Day 5: Individual Story Page

**Files to Create:**
```
src/app/stories/[id]/page.tsx
src/components/story/StoryPage.tsx
src/components/story/StoryHeader.tsx
src/components/story/CulturalContextPanel.tsx
src/components/story/StorytellerSidebar.tsx
src/components/story/StoryGallery.tsx
src/components/story/CulturalTagsDisplay.tsx
src/components/story/SacredContentWarning.tsx
src/components/story/TriggerWarning.tsx
src/components/story/ShareButton.tsx
src/components/story/RelatedStories.tsx
```

**Story Header:**
- Title
- Storyteller (name, photo, link)
- Date published
- Reading time / duration
- Cultural tags
- Location

**Cultural Context Panel:**
- Cultural background
- Territory information
- Historical context
- Significance
- Protocols to observe

**Storyteller Sidebar:**
- Mini profile
- Cultural affiliations
- Bio (150 chars)
- Published stories count
- View full profile link

**Story Gallery:**
- Grid of images/videos
- Lightbox viewer
- Captions
- Cultural tags per image

**Cultural Tags:**
- Visual badges
- Hover for description
- Link to browse by tag

**Sacred Content Warning:**
- Full-screen modal
- Cultural protocols
- "I understand" button
- Cannot proceed without acknowledgment

**Trigger Warning:**
- Trauma content
- Historical violence
- Substance use
- "Continue with caution"

**Share Button:**
- Only if storyteller permits
- Copy link
- Social media (with permissions)
- Embed code (if allowed)

**Related Stories:**
- 4-6 related stories
- Same theme or storyteller
- Same cultural group
- Algorithm-based

**APIs Needed:**
- `GET /api/stories/[id]/public` - Get full story
- `GET /api/stories/[id]/related` - Related stories
- `POST /api/stories/[id]/view` - Track view
- `POST /api/stories/[id]/share` - Track share

---

## Week 6: Advanced Features (Feb 10-14)

### Day 6-7: Media Player with Transcript Sync

**Files to Create:**
```
src/components/player/SyncedMediaPlayer.tsx
src/components/player/AudioWaveform.tsx
src/components/player/VideoPlayer.tsx
src/components/player/PlaybackControls.tsx
src/components/player/SpeedControl.tsx
src/components/player/VolumeControl.tsx
src/components/player/TranscriptSync.tsx
src/components/player/KeyboardShortcuts.tsx
src/components/player/DownloadButton.tsx
```

**Synced Media Player:**
- Play/pause/seek
- Progress bar
- Current time / total time
- Fullscreen (video)
- Picture-in-picture

**Audio Waveform:**
- Visual representation
- Clickable for seek
- Current position indicator
- Amplitude visualization

**Transcript Sync:**
- Auto-scroll as audio plays
- Highlight current phrase
- Click phrase to jump to timestamp
- Karaoke-style highlighting

**Playback Controls:**
- Speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Volume slider
- Mute toggle
- 15s forward/back

**Keyboard Shortcuts:**
- Space: Play/Pause
- Arrow Left/Right: Seek ±15s
- Arrow Up/Down: Volume
- F: Fullscreen
- M: Mute

**Download Button:**
- Only if storyteller permits
- Audio file download
- Video file download
- Transcript PDF download

**Libraries:**
- `wavesurfer.js` for audio waveform
- `react-player` for video
- Custom transcript sync logic

---

### Day 8: Storyteller Public Profile

**Files to Create:**
```
src/app/storytellers/[id]/public/page.tsx
src/components/storyteller/StorytellerPublicProfile.tsx
src/components/storyteller/ProfileHeader.tsx
src/components/storyteller/ProfileBio.tsx
src/components/storyteller/PublishedStoriesGrid.tsx
src/components/storyteller/ImpactMetrics.tsx
src/components/storyteller/ThemesExpertise.tsx
src/components/storyteller/GeographicReach.tsx
src/components/storyteller/ContactButton.tsx
src/components/storyteller/FollowButton.tsx
```

**Profile Header:**
- Profile photo
- Name
- Cultural affiliations
- Elder status badge
- Location
- Member since

**Bio Section:**
- About me
- Cultural background
- Storytelling focus
- Languages spoken

**Published Stories Grid:**
- All public stories
- Filter by media type
- Sort options
- Pagination

**Impact Metrics** (if public):
- Total views
- Total stories
- Countries reached
- Languages

**Themes Expertise:**
- Top themes
- Story count per theme
- Visual representation

**Geographic Reach:**
- Map showing reach
- Territories represented

**Contact/Follow:**
- Contact button (if allowed)
- Follow button (authenticated users)
- Share profile

**APIs Needed:**
- `GET /api/storytellers/[id]/public` - Public profile
- `GET /api/storytellers/[id]/stories` - Published stories
- `POST /api/storytellers/[id]/follow` - Follow storyteller

---

### Day 9: Comment System

**Files to Create:**
```
src/components/comments/CommentsSection.tsx
src/components/comments/CommentForm.tsx
src/components/comments/CommentThread.tsx
src/components/comments/CommentItem.tsx
src/components/comments/CommentModeration.tsx
src/components/comments/ReportDialog.tsx
```

**Comments Section:**
- Comment count
- Sort by: Recent, Oldest, Most Liked
- Load more pagination

**Comment Form:**
- Text input (required)
- Character limit (500)
- Cultural respect reminder
- Submit button
- Authenticated users only

**Comment Thread:**
- Nested replies (1 level)
- Reply button
- Like button
- Report button (inappropriate)

**Comment Item:**
- Commenter name & avatar
- Date posted
- Comment text
- Like count
- Reply count
- Actions (edit, delete if own)

**Moderation:**
- Elder approval required
- AI cultural safety check
- Report queue
- Ban/delete options

**Cultural Safety:**
- Detect inappropriate language
- Block hate speech
- Require respect
- Elder can delete any comment

**APIs Needed:**
- `GET /api/stories/[id]/comments` - Get comments
- `POST /api/stories/[id]/comments` - Add comment
- `POST /api/comments/[id]/like` - Like comment
- `POST /api/comments/[id]/report` - Report comment
- `DELETE /api/comments/[id]` - Delete comment
- `GET /api/comments/moderation` - Moderation queue

---

### Day 10: Polish & Testing

**Tasks:**
- Responsive design testing
- Accessibility audit (WCAG 2.1 AA)
- Performance optimization
- Cultural safety review
- Elder UAT
- Test pages

---

## Database Schema Requirements

### New Tables

**comments:**
```sql
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  commenter_id UUID REFERENCES profiles(id),
  commenter_name TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**story_views:**
```sql
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id),
  viewer_ip TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  reading_time_seconds INTEGER
);
```

**story_shares:**
```sql
CREATE TABLE IF NOT EXISTS story_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  sharer_id UUID REFERENCES profiles(id),
  platform TEXT,
  shared_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Endpoints to Create (25 endpoints)

### Homepage (4 endpoints)
1. `GET /api/public/featured-stories` - Curated stories
2. `GET /api/public/recent-stories` - Recent published
3. `GET /api/public/stats` - Platform statistics
4. `GET /api/public/storytellers/featured` - Featured storytellers

### Story Browsing (4 endpoints)
5. `GET /api/stories/browse` - Browse with filters/sort
6. `GET /api/stories/themes` - All themes
7. `GET /api/stories/cultural-groups` - Cultural groups
8. `GET /api/stories/languages` - Languages

### Individual Story (4 endpoints)
9. `GET /api/stories/[id]/public` - Full public story
10. `GET /api/stories/[id]/related` - Related stories
11. `POST /api/stories/[id]/view` - Track view
12. `POST /api/stories/[id]/share` - Track share

### Storyteller Profile (3 endpoints)
13. `GET /api/storytellers/[id]/public` - Public profile
14. `GET /api/storytellers/[id]/stories/public` - Published stories
15. `POST /api/storytellers/[id]/follow` - Follow

### Comments (10 endpoints)
16. `GET /api/stories/[id]/comments` - Get comments
17. `POST /api/stories/[id]/comments` - Add comment
18. `PATCH /api/comments/[id]` - Edit comment
19. `DELETE /api/comments/[id]` - Delete comment
20. `POST /api/comments/[id]/like` - Like comment
21. `DELETE /api/comments/[id]/like` - Unlike comment
22. `POST /api/comments/[id]/report` - Report comment
23. `GET /api/comments/moderation` - Moderation queue
24. `POST /api/comments/[id]/approve` - Approve comment
25. `POST /api/comments/[id]/reject` - Reject comment

---

## Design System: Editorial Warmth

### Color Palette
- **Primary:** Warm terracotta (#D97757)
- **Secondary:** Deep forest green (#2D5F4F)
- **Accent:** Golden ochre (#D4A373)
- **Background:** Cream (#F8F6F1)
- **Text:** Charcoal (#2C2C2C)

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Mono:** Fira Code

### Spacing
- Base: 8px grid
- Section padding: 80px (desktop), 40px (mobile)

### Cultural Elements
- Indigenous patterns (respectful)
- Natural imagery
- Warm, inviting tone
- Respectful spacing

---

## Success Criteria

- [ ] Homepage loads < 2s
- [ ] Featured stories displayed beautifully
- [ ] Territory acknowledgment present
- [ ] Browse page filters work smoothly
- [ ] Story page displays all content
- [ ] Media player syncs with transcript
- [ ] Sacred content warnings shown
- [ ] Comments require moderation
- [ ] Storyteller profiles public
- [ ] All 25 API endpoints functional
- [ ] WCAG 2.1 AA compliant
- [ ] Cultural safety reviewed
- [ ] Elder UAT approved

---

## Cultural Safety Checkpoints

**Before Implementation:**
- [ ] Review homepage messaging
- [ ] Validate territory acknowledgment
- [ ] Confirm sacred content protocols

**During Implementation:**
- [ ] Sacred content warnings working
- [ ] Trigger warnings displayed
- [ ] Comment moderation active
- [ ] Elder approval integrated

**After Implementation:**
- [ ] Cultural safety audit
- [ ] Elder review session
- [ ] Public UAT (non-Indigenous allies)
- [ ] Indigenous Advisory Board approval

---

## Estimated Timeline

| Phase | Duration | Components | Lines of Code |
|-------|----------|------------|---------------|
| Public Homepage | 2 days | 9 | ~3,000 |
| Story Browsing | 2 days | 9 | ~3,000 |
| Individual Story Page | 1 day | 12 | ~3,500 |
| Media Player | 2 days | 8 | ~2,500 |
| Storyteller Profile | 1 day | 8 | ~2,000 |
| Comment System | 1 day | 6 | ~2,000 |
| Polish & Testing | 1 day | - | ~500 |

**Total:** 10 days, ~52 components, ~16,500 lines

---

**Ready to start Sprint 3?** Let's build a beautiful, respectful public story experience! 🌾
