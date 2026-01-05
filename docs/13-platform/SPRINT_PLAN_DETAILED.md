# Empathy Ledger v2 - Detailed Sprint Plan
## 8 Sprints × 2 Weeks = 16 Weeks to Launch

**Start Date**: January 6, 2026
**Launch Target**: April 28, 2026
**Sprint Duration**: 2 weeks (10 working days)
**Team**: ACT Development Studio + Indigenous Advisory Board

---

## Sprint Overview

| Sprint | Dates | Theme | Priority | Deliverables |
|--------|-------|-------|----------|--------------|
| **Sprint 1** | Jan 6-17 | Foundation & Profile | P0 | Profile display, Privacy settings, ALMA panel |
| **Sprint 2** | Jan 20-31 | Storyteller Dashboard | P0 | My Stories, Story creation wizard, Media upload |
| **Sprint 3** | Feb 3-14 | Public Story Experience | P0 | Homepage, Story browsing, Individual story page |
| **Sprint 4** | Feb 17-28 | Search & Discovery | P0 | Full-text search, Filters, Theme exploration |
| **Sprint 5** | Mar 3-14 | Organization Tools | P1 | Project management, Elder review, Consent tracking |
| **Sprint 6** | Mar 17-28 | Analytics & SROI | P1 | Org analytics, SROI calculator, Reports |
| **Sprint 7** | Mar 31-Apr 11 | Advanced Features | P1 | AI pipeline, Thematic network, Interactive map |
| **Sprint 8** | Apr 14-25 | Polish & Launch | P1 | Security audit, Performance, Training, Launch |

---

## SPRINT 1: Foundation & Profile (Jan 6-17)

**Theme**: Restore core storyteller experience with cultural safety
**Goal**: Storytellers can view and edit their profiles with full privacy controls

### Week 1 (Jan 6-10)

#### Day 1-2: Profile Page Display
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `ProfilePage` component
- [ ] Fetch profile data from `profiles` table (226 storytellers)
- [ ] Display: Name, bio, cultural affiliations, territories
- [ ] Profile photo with fallback to default avatar
- [ ] Privacy indicator badge
- [ ] Cultural protocols badge
- [ ] Accessibility: WCAG 2.1 AA, screen reader tested
- [ ] Cultural review: Indigenous Advisory Board approval

**Database Tables**:
- `profiles` (164 cols)
- `storyteller_demographics` (35 cols)
- `storyteller_locations` (8 cols)

**Components Created**:
```typescript
// src/components/profile/ProfilePage.tsx
// src/components/profile/ProfileHeader.tsx
// src/components/profile/CulturalAffiliations.tsx
// src/components/profile/PrivacyBadge.tsx
// src/components/profile/ProtocolsBadge.tsx
```

**Acceptance Criteria**:
- [ ] Profile page loads < 2s
- [ ] All 226 storyteller profiles display correctly
- [ ] Privacy badge shows correct visibility level
- [ ] Cultural protocols badge links to settings
- [ ] 100% accessible (keyboard nav, screen reader)
- [ ] No cultural safety violations

---

#### Day 3-4: Privacy Settings Panel
**Owner**: Frontend Design Team + GDPR/Compliance Team
**Tasks**:
- [ ] Create `PrivacySettingsPanel` component
- [ ] Story visibility defaults (public/community/private)
- [ ] Data sovereignty preferences
- [ ] Who can contact me selector
- [ ] Export my data button (JSON/PDF)
- [ ] Delete my account workflow
- [ ] Consent withdrawal UI
- [ ] Save to `profiles` and `consent_change_log`

**Database Tables**:
- `profiles` (privacy columns)
- `consent_change_log` (13 cols)
- `privacy_changes` (9 cols)
- `audit_logs` (20 cols)

**Components Created**:
```typescript
// src/components/privacy/PrivacySettingsPanel.tsx
// src/components/privacy/VisibilitySelector.tsx
// src/components/privacy/DataSovereigntyPreferences.tsx
// src/components/privacy/ContactPermissions.tsx
// src/components/privacy/ExportDataDialog.tsx
// src/components/privacy/DeleteAccountDialog.tsx
```

**Acceptance Criteria**:
- [ ] Privacy settings save correctly
- [ ] Audit log created for every change
- [ ] Export data generates complete JSON
- [ ] Delete account triggers `deletion_requests` workflow
- [ ] GDPR Article 7 (Consent) compliant
- [ ] GDPR Article 17 (Right to Deletion) compliant

---

#### Day 5: ALMA Settings Panel (CRITICAL - New Feature)
**Owner**: Cultural Safety Team + Frontend Design Team
**Tasks**:
- [ ] Create `ALMASettingsPanel` component
- [ ] Sacred knowledge protection toggle
- [ ] Elder review preferences (auto-route, manual request)
- [ ] AI analysis consent toggle
- [ ] Cultural protocol configuration
- [ ] Notification preferences (immediate/daily/weekly)
- [ ] Cultural protocol notes (free text)
- [ ] Save to `profiles` and `cultural_protocols`

**Database Tables**:
- `profiles` (ALMA columns)
- `cultural_protocols` (16 cols)
- `elder_review_queue` (16 cols)
- `ai_safety_logs` (8 cols)

**Components Created**:
```typescript
// src/components/alma/ALMASettingsPanel.tsx
// src/components/alma/SacredKnowledgeToggle.tsx
// src/components/alma/ElderReviewPreferences.tsx
// src/components/alma/AIConsentToggle.tsx
// src/components/alma/CulturalProtocolNotes.tsx
```

**Acceptance Criteria**:
- [ ] ALMA settings save to database
- [ ] Sacred knowledge flag prevents AI analysis
- [ ] Elder review auto-routes based on preferences
- [ ] Cultural protocols enforced across platform
- [ ] Indigenous Advisory Board approval received

---

### Week 2 (Jan 13-17)

#### Day 6-7: My Stories Dashboard
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `MyStoriesDashboard` component
- [ ] Fetch stories from `stories` + `transcripts` tables
- [ ] Display list/grid view toggle
- [ ] Status indicators (draft/pending/published/archived)
- [ ] Edit/delete action buttons
- [ ] Privacy level badges
- [ ] Basic analytics preview (views, engagement)
- [ ] Empty state for new storytellers
- [ ] Pagination (20 stories per page)

**Database Tables**:
- `stories` (98 cols)
- `transcripts` (59 cols)
- `story_engagement_events` (19 cols)
- `storyteller_analytics` (24 cols)

**Components Created**:
```typescript
// src/components/dashboard/MyStoriesDashboard.tsx
// src/components/dashboard/StoryCard.tsx
// src/components/dashboard/StoryListView.tsx
// src/components/dashboard/StoryGridView.tsx
// src/components/dashboard/StatusBadge.tsx
// src/components/dashboard/StoryActions.tsx
// src/components/dashboard/EmptyState.tsx
```

**Acceptance Criteria**:
- [ ] All storyteller stories display correctly
- [ ] Edit button navigates to story editor
- [ ] Delete shows confirmation dialog
- [ ] Privacy badges reflect actual visibility
- [ ] Analytics data accurate
- [ ] Load time < 2s for 100 stories

---

#### Day 8-10: Basic Story Creation Form
**Owner**: Frontend Design Team + Cultural Safety Team
**Tasks**:
- [ ] Create `StoryCreationWizard` component (6 steps)
- [ ] Step 1: Consent & Cultural Protocols
- [ ] Step 2: Storyteller Information
- [ ] Step 3: Story Content (text OR upload)
- [ ] Step 4: Media Upload (photos/videos)
- [ ] Step 5: Privacy Settings
- [ ] Step 6: Review & Submit
- [ ] Save draft functionality
- [ ] Auto-save every 30 seconds
- [ ] Cultural protocol checklist
- [ ] Submit to `stories` + `elder_review_queue` (if flagged)

**Database Tables**:
- `stories` (98 cols)
- `transcripts` (59 cols)
- `media_assets` (66 cols)
- `cultural_protocols`
- `elder_review_queue`
- `consent_change_log`

**Components Created**:
```typescript
// src/components/story/StoryCreationWizard.tsx
// src/components/story/ConsentStep.tsx
// src/components/story/StorytellerInfoStep.tsx
// src/components/story/ContentStep.tsx
// src/components/story/MediaUploadStep.tsx
// src/components/story/PrivacyStep.tsx
// src/components/story/ReviewStep.tsx
// src/components/story/CulturalProtocolChecklist.tsx
// src/components/story/AutoSaveIndicator.tsx
```

**Acceptance Criteria**:
- [ ] Wizard completes all 6 steps
- [ ] Story saves to database correctly
- [ ] Cultural protocols enforced
- [ ] Sacred knowledge routes to elder review
- [ ] Auto-save prevents data loss
- [ ] Consent forms signed digitally
- [ ] Media uploads to Supabase Storage

---

### Sprint 1 Review & Retrospective (Jan 17)

**Demo to Indigenous Advisory Board**:
- Profile page display
- Privacy settings panel
- ALMA settings panel
- My Stories dashboard
- Basic story creation

**Success Metrics**:
- [ ] All 226 storyteller profiles load correctly
- [ ] Privacy settings functional
- [ ] ALMA settings save correctly
- [ ] My Stories dashboard displays existing stories
- [ ] Basic story creation works end-to-end
- [ ] Zero cultural safety violations
- [ ] Indigenous Advisory Board approval

**Deploy to Staging**: staging.empathy-ledger.vercel.app

---

## SPRINT 2: Storyteller Dashboard Complete (Jan 20-31)

**Theme**: Complete storytelling experience
**Goal**: Storytellers can create, edit, and manage stories with full media support

### Week 3 (Jan 20-24)

#### Day 11-12: Story Editor (Edit Existing Stories)
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `StoryEditor` component
- [ ] Load existing story data
- [ ] Edit all fields (content, metadata, privacy)
- [ ] Media management (add/remove photos/videos)
- [ ] Save changes with version history
- [ ] Cultural protocol re-review if content changed
- [ ] Audit trail of all edits
- [ ] Unpublish story option

**Database Tables**:
- `stories`
- `transcripts`
- `media_assets`
- `audit_logs`
- `elder_review_queue` (if re-flagged)

**Components Created**:
```typescript
// src/components/story/StoryEditor.tsx
// src/components/story/EditContentTab.tsx
// src/components/story/EditMetadataTab.tsx
// src/components/story/EditMediaTab.tsx
// src/components/story/EditPrivacyTab.tsx
// src/components/story/VersionHistory.tsx
// src/components/story/UnpublishDialog.tsx
```

**Acceptance Criteria**:
- [ ] All story fields editable
- [ ] Changes save correctly
- [ ] Version history tracked
- [ ] Cultural protocol re-check if needed
- [ ] Audit log entry created

---

#### Day 13-14: Media Upload & Gallery
**Owner**: Frontend Design Team + Integration Team
**Tasks**:
- [ ] Create `MediaUploader` component
- [ ] Drag & drop file upload
- [ ] Image preview thumbnails
- [ ] Video preview player
- [ ] Audio waveform preview
- [ ] Cultural tagging (ceremony, location, people)
- [ ] People tagging with consent tracking
- [ ] Sacred content flag
- [ ] Alt text generation (AI-suggested)
- [ ] Upload to Supabase Storage
- [ ] Save metadata to `media_assets`

**Database Tables**:
- `media_assets` (66 cols)
- `media_files` (35 cols)
- `gallery_media` (9 cols)
- `photo_faces` (21 cols - facial recognition)

**Components Created**:
```typescript
// src/components/media/MediaUploader.tsx
// src/components/media/DragDropZone.tsx
// src/components/media/ImagePreview.tsx
// src/components/media/VideoPreview.tsx
// src/components/media/AudioPreview.tsx
// src/components/media/CulturalTagging.tsx
// src/components/media/PeopleTagging.tsx
// src/components/media/SacredContentFlag.tsx
// src/components/media/AltTextGenerator.tsx
```

**Acceptance Criteria**:
- [ ] Upload accepts images, videos, audio
- [ ] Preview works for all media types
- [ ] Cultural tags save correctly
- [ ] People tagging requires consent
- [ ] Sacred content flagged properly
- [ ] Alt text generated and editable
- [ ] Files stored in Supabase Storage
- [ ] Metadata in database

---

#### Day 15: Smart Gallery Component
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `SmartGallery` component
- [ ] Grid layout (responsive)
- [ ] Lightbox modal for full-size view
- [ ] Slideshow mode
- [ ] Cultural tags displayed
- [ ] People tags with hover
- [ ] Sacred content blur/warning
- [ ] Zoom functionality
- [ ] Download button (if permitted)
- [ ] Share button (if permitted)

**Components Created**:
```typescript
// src/components/gallery/SmartGallery.tsx
// src/components/gallery/GalleryGrid.tsx
// src/components/gallery/Lightbox.tsx
// src/components/gallery/SlideshowMode.tsx
// src/components/gallery/CulturalTagDisplay.tsx
// src/components/gallery/PeopleTagHover.tsx
// src/components/gallery/SacredContentOverlay.tsx
```

**Acceptance Criteria**:
- [ ] Gallery displays all media correctly
- [ ] Lightbox works with keyboard navigation
- [ ] Cultural tags visible
- [ ] Sacred content protected
- [ ] Responsive on mobile/tablet/desktop

---

### Week 4 (Jan 27-31)

#### Day 16-17: Audio/Video Transcription Pipeline
**Owner**: AI/Analytics Team + Integration Team
**Tasks**:
- [ ] Integrate Whisper API for transcription
- [ ] Upload audio/video → auto-transcribe
- [ ] Save transcript to `transcripts` table
- [ ] Speaker diarization (multi-speaker)
- [ ] Timestamp markers
- [ ] Edit transcript UI
- [ ] Language detection
- [ ] Dialect preservation notes
- [ ] Cultural speech patterns detection
- [ ] Link transcript to story

**Database Tables**:
- `transcripts` (59 cols)
- `transcription_jobs` (12 cols)
- `cultural_speech_patterns` (12 cols)

**Components Created**:
```typescript
// src/components/transcription/TranscriptionUploader.tsx
// src/components/transcription/TranscriptEditor.tsx
// src/components/transcription/SpeakerDiarization.tsx
// src/components/transcription/TimestampMarkers.tsx
// src/components/transcription/LanguageDetector.tsx
// src/components/transcription/CulturalSpeechMarkers.tsx
```

**Acceptance Criteria**:
- [ ] Audio/video uploads trigger transcription
- [ ] Transcript generated within 5 minutes
- [ ] Speaker diarization accurate
- [ ] Timestamps sync with audio/video
- [ ] Transcript editable
- [ ] Cultural speech patterns preserved

---

#### Day 18-19: Storyteller Profile Edit
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `ProfileEditForm` component
- [ ] Edit personal information
- [ ] Update cultural affiliations
- [ ] Change profile photo
- [ ] Edit bio/about
- [ ] Add/remove territories
- [ ] Language preferences
- [ ] Elder status designation
- [ ] Save changes with audit log

**Components Created**:
```typescript
// src/components/profile/ProfileEditForm.tsx
// src/components/profile/PersonalInfoFields.tsx
// src/components/profile/CulturalAffiliationsEdit.tsx
// src/components/profile/ProfilePhotoUpload.tsx
// src/components/profile/BioEditor.tsx
// src/components/profile/TerritoriesSelector.tsx
```

**Acceptance Criteria**:
- [ ] All profile fields editable
- [ ] Changes save correctly
- [ ] Audit log created
- [ ] Profile photo uploads work
- [ ] Cultural affiliations validated

---

#### Day 20: Dashboard Analytics Preview
**Owner**: AI/Analytics Team + Frontend Design Team
**Tasks**:
- [ ] Create `AnalyticsPreview` component
- [ ] Story views count
- [ ] Engagement metrics (comments, shares)
- [ ] Ripple effects count
- [ ] Geographic reach preview
- [ ] Top performing stories
- [ ] Growth over time sparkline
- [ ] Link to full analytics page

**Database Tables**:
- `storyteller_analytics` (24 cols)
- `story_engagement_events` (19 cols)
- `ripple_effects` (15 cols)
- `storyteller_impact_metrics` (40 cols)

**Components Created**:
```typescript
// src/components/analytics/AnalyticsPreview.tsx
// src/components/analytics/ViewsCount.tsx
// src/components/analytics/EngagementMetrics.tsx
// src/components/analytics/RippleEffectsCount.tsx
// src/components/analytics/GeographicReach.tsx
// src/components/analytics/TopStoriesCard.tsx
// src/components/analytics/GrowthSparkline.tsx
```

**Acceptance Criteria**:
- [ ] Analytics data accurate
- [ ] Updates in real-time
- [ ] Sparklines render correctly
- [ ] Link to full analytics works

---

### Sprint 2 Review & Retrospective (Jan 31)

**Demo**:
- Story editor
- Media upload & gallery
- Audio/video transcription
- Profile editing
- Analytics preview

**Success Metrics**:
- [ ] Storytellers can edit existing stories
- [ ] Media uploads and displays correctly
- [ ] Transcription pipeline functional
- [ ] Profile editing works
- [ ] Analytics preview shows accurate data

**Deploy to Staging**

---

## SPRINT 3: Public Story Experience (Feb 3-14)

**Theme**: Public can discover and consume stories
**Goal**: Beautiful, respectful public-facing story platform

### Week 5 (Feb 3-7)

#### Day 21-22: Public Homepage
**Owner**: Frontend Design Team + Brand Team
**Tasks**:
- [ ] Create `PublicHomepage` component
- [ ] Hero section with featured story
- [ ] Territory acknowledgment
- [ ] Featured stories grid (6-8 stories)
- [ ] Browse by theme section
- [ ] Recent stories carousel
- [ ] Storyteller spotlights
- [ ] Platform statistics (stories, storytellers, communities)
- [ ] OCAP® education callout
- [ ] Editorial Warmth design system

**Components Created**:
```typescript
// src/components/public/PublicHomepage.tsx
// src/components/public/HeroSection.tsx
// src/components/public/TerritoryAcknowledgment.tsx
// src/components/public/FeaturedStoriesGrid.tsx
// src/components/public/BrowseByTheme.tsx
// src/components/public/RecentStoriesCarousel.tsx
// src/components/public/StorytellerSpotlight.tsx
// src/components/public/PlatformStats.tsx
// src/components/public/OCAPCallout.tsx
```

**Acceptance Criteria**:
- [ ] Homepage loads < 2s
- [ ] Featured stories display correctly
- [ ] Territory acknowledgment respectful
- [ ] Responsive on all devices
- [ ] WCAG 2.1 AA compliant
- [ ] Editorial Warmth design applied

---

#### Day 23-24: Story Browsing & Filtering
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `StoryBrowsePage` component
- [ ] Grid/list view toggle
- [ ] Filter by theme
- [ ] Filter by cultural group
- [ ] Filter by media type (audio/video/text)
- [ ] Filter by language
- [ ] Sort by: recent, popular, alphabetical
- [ ] Pagination (20 stories per page)
- [ ] Story preview cards
- [ ] Loading states
- [ ] Empty states

**Database Tables**:
- `stories` (published only)
- `narrative_themes`
- `cultural_tags`

**Components Created**:
```typescript
// src/components/browse/StoryBrowsePage.tsx
// src/components/browse/FilterSidebar.tsx
// src/components/browse/ThemeFilter.tsx
// src/components/browse/CulturalGroupFilter.tsx
// src/components/browse/MediaTypeFilter.tsx
// src/components/browse/LanguageFilter.tsx
// src/components/browse/SortSelector.tsx
// src/components/browse/StoryPreviewCard.tsx
// src/components/browse/ViewToggle.tsx
```

**Acceptance Criteria**:
- [ ] Filters work correctly
- [ ] Sorting functions properly
- [ ] Pagination smooth
- [ ] Preview cards informative
- [ ] Fast filtering (< 500ms)

---

#### Day 25: Individual Story Page
**Owner**: Frontend Design Team + Cultural Safety Team
**Tasks**:
- [ ] Create `StoryPage` component
- [ ] Story header with metadata
- [ ] Audio/video player with transcript sync
- [ ] Full transcript display
- [ ] Cultural context panel
- [ ] Storyteller bio sidebar
- [ ] Media gallery (photos/videos)
- [ ] Cultural tags display
- [ ] Privacy indicators
- [ ] Sacred content warnings
- [ ] Trigger warnings (trauma content)
- [ ] Share button (if permitted)
- [ ] Related stories section

**Components Created**:
```typescript
// src/components/story/StoryPage.tsx
// src/components/story/StoryHeader.tsx
// src/components/story/MediaPlayer.tsx
// src/components/story/TranscriptDisplay.tsx
// src/components/story/CulturalContextPanel.tsx
// src/components/story/StorytellerSidebar.tsx
// src/components/story/StoryGallery.tsx
// src/components/story/CulturalTagsDisplay.tsx
// src/components/story/SacredContentWarning.tsx
// src/components/story/TriggerWarning.tsx
// src/components/story/ShareButton.tsx
// src/components/story/RelatedStories.tsx
```

**Acceptance Criteria**:
- [ ] Story displays correctly
- [ ] Audio/video syncs with transcript
- [ ] Cultural context clear
- [ ] Sacred content warnings shown
- [ ] Related stories relevant

---

### Week 6 (Feb 10-14)

#### Day 26-27: Audio/Video Player with Transcript Sync
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `SyncedMediaPlayer` component
- [ ] Audio waveform visualization
- [ ] Video HD streaming
- [ ] Playback controls (play/pause/seek)
- [ ] Speed control (0.5x - 2x)
- [ ] Volume control
- [ ] Transcript auto-scroll (karaoke-style)
- [ ] Click transcript to jump to timestamp
- [ ] Keyboard shortcuts
- [ ] Download button (if permitted)
- [ ] Captions/subtitles toggle

**Components Created**:
```typescript
// src/components/player/SyncedMediaPlayer.tsx
// src/components/player/AudioWaveform.tsx
// src/components/player/VideoPlayer.tsx
// src/components/player/PlaybackControls.tsx
// src/components/player/SpeedControl.tsx
// src/components/player/TranscriptSync.tsx
// src/components/player/KeyboardShortcuts.tsx
// src/components/player/DownloadButton.tsx
```

**Acceptance Criteria**:
- [ ] Player controls work smoothly
- [ ] Transcript syncs accurately
- [ ] Waveform visualization clear
- [ ] Video streams HD quality
- [ ] Keyboard shortcuts functional
- [ ] Accessible (screen reader compatible)

---

#### Day 28-29: Storyteller Public Profile
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `StorytellerPublicProfile` component
- [ ] Profile header (name, photo, cultural affiliations)
- [ ] Bio/about section
- [ ] Published stories grid
- [ ] Impact metrics (if public)
- [ ] Themes expertise
- [ ] Geographic reach
- [ ] Connection to territories
- [ ] Contact button (if allowed)
- [ ] Follow button (for registered users)
- [ ] Professional portfolio (cross-org)

**Database Tables**:
- `profiles`
- `storyteller_analytics`
- `storyteller_themes`
- `stories` (published)

**Components Created**:
```typescript
// src/components/profile/StorytellerPublicProfile.tsx
// src/components/profile/PublicProfileHeader.tsx
// src/components/profile/PublicBio.tsx
// src/components/profile/PublishedStoriesGrid.tsx
// src/components/profile/ImpactMetricsPublic.tsx
// src/components/profile/ThemesExpertise.tsx
// src/components/profile/GeographicReach.tsx
// src/components/profile/ContactButton.tsx
// src/components/profile/FollowButton.tsx
```

**Acceptance Criteria**:
- [ ] Profile displays correctly
- [ ] Only public stories shown
- [ ] Privacy settings respected
- [ ] Contact button works if allowed
- [ ] Responsive design

---

#### Day 30: Theme Exploration Page
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `ThemeExplorationPage` component
- [ ] Theme grid with icons
- [ ] Theme description cards
- [ ] Story count per theme
- [ ] Click theme → filter stories
- [ ] Theme relationships visualization (basic)
- [ ] Featured themes section
- [ ] Emerging themes callout

**Database Tables**:
- `narrative_themes` (13 cols)
- `theme_associations`
- `storyteller_themes`

**Components Created**:
```typescript
// src/components/themes/ThemeExplorationPage.tsx
// src/components/themes/ThemeGrid.tsx
// src/components/themes/ThemeCard.tsx
// src/components/themes/ThemeRelationships.tsx
// src/components/themes/FeaturedThemes.tsx
// src/components/themes/EmergingThemes.tsx
```

**Acceptance Criteria**:
- [ ] All themes display
- [ ] Story counts accurate
- [ ] Click theme filters correctly
- [ ] Theme descriptions clear

---

### Sprint 3 Review & Retrospective (Feb 14)

**Demo**:
- Public homepage
- Story browsing
- Individual story page
- Media player with sync
- Storyteller public profile
- Theme exploration

**Success Metrics**:
- [ ] Public can browse stories
- [ ] Individual story page functional
- [ ] Media player works smoothly
- [ ] Storyteller profiles public
- [ ] Theme exploration intuitive

**Deploy to Staging**

---

## SPRINT 4: Search & Discovery (Feb 17-28)

**Theme**: Advanced discovery and engagement
**Goal**: Powerful search, filters, and respectful engagement

### Week 7 (Feb 17-21)

#### Day 31-32: Full-Text Search
**Owner**: Database Architect Team + Frontend Design Team
**Tasks**:
- [ ] Implement PostgreSQL full-text search
- [ ] Search across transcripts, titles, descriptions
- [ ] Highlight matching text
- [ ] Search suggestions (autocomplete)
- [ ] Recent searches
- [ ] Popular searches
- [ ] Search filters (theme, cultural group, media type)
- [ ] Sort by relevance
- [ ] Search analytics tracking

**Database Tables**:
- `transcripts` (search_vector column)
- `stories`
- `narrative_themes`

**API Routes**:
```typescript
// src/app/api/search/route.ts
// Full-text search with filters
```

**Components Created**:
```typescript
// src/components/search/SearchPage.tsx
// src/components/search/SearchBar.tsx
// src/components/search/SearchSuggestions.tsx
// src/components/search/SearchFilters.tsx
// src/components/search/SearchResults.tsx
// src/components/search/ResultHighlight.tsx
// src/components/search/RecentSearches.tsx
```

**Acceptance Criteria**:
- [ ] Search returns relevant results
- [ ] Highlighting works correctly
- [ ] Autocomplete suggestions accurate
- [ ] Filters apply correctly
- [ ] Search speed < 500ms

---

#### Day 33-34: Advanced Filters & Faceted Search
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Multi-select filters
- [ ] Date range filter
- [ ] Geographic filter (territories)
- [ ] Language filter
- [ ] Story type filter (teaching, witnessing, etc.)
- [ ] Narrative arc filter
- [ ] Media type filter
- [ ] Filter combinations
- [ ] Clear all filters button
- [ ] Active filters display

**Components Created**:
```typescript
// src/components/filters/AdvancedFilters.tsx
// src/components/filters/MultiSelectFilter.tsx
// src/components/filters/DateRangeFilter.tsx
// src/components/filters/GeographicFilter.tsx
// src/components/filters/LanguageFilter.tsx
// src/components/filters/StoryTypeFilter.tsx
// src/components/filters/ActiveFiltersDisplay.tsx
```

**Acceptance Criteria**:
- [ ] All filters functional
- [ ] Combinations work correctly
- [ ] Clear filters resets all
- [ ] Active filters visible

---

#### Day 35: Quote Search & Wisdom Discovery
**Owner**: Frontend Design Team + AI/Analytics Team
**Tasks**:
- [ ] Create `QuoteSearchPage` component
- [ ] Search powerful quotes
- [ ] Filter by impact score
- [ ] Filter by wisdom score
- [ ] Filter by quotability score
- [ ] Quote attribution to storyteller
- [ ] Link to full story
- [ ] Share quote functionality
- [ ] Save favorite quotes

**Database Tables**:
- `quotes` (30 cols)
- `storyteller_quotes` (28 cols)
- `extracted_quotes` (14 cols)

**Components Created**:
```typescript
// src/components/quotes/QuoteSearchPage.tsx
// src/components/quotes/QuoteCard.tsx
// src/components/quotes/QuoteFilters.tsx
// src/components/quotes/QuoteAttribution.tsx
// src/components/quotes/ShareQuote.tsx
// src/components/quotes/FavoriteQuotes.tsx
```

**Acceptance Criteria**:
- [ ] Quote search works
- [ ] Attribution clear
- [ ] Share quote functional
- [ ] Favorite quotes save

---

### Week 8 (Feb 24-28)

#### Day 36-37: Ripple Effects Reporting
**Owner**: Frontend Design Team + Cultural Safety Team
**Tasks**:
- [ ] Create `RippleEffectForm` component
- [ ] Select ripple level (1-5)
- [ ] Describe impact
- [ ] People affected count
- [ ] Geographic scope
- [ ] Time lag tracking
- [ ] Evidence upload
- [ ] Link to inspiring story
- [ ] Save to `ripple_effects` table
- [ ] Notification to storyteller

**Database Tables**:
- `ripple_effects` (15 cols)
- `community_story_responses` (11 cols)

**Components Created**:
```typescript
// src/components/ripple/RippleEffectForm.tsx
// src/components/ripple/RippleLevelSelector.tsx
// src/components/ripple/ImpactDescription.tsx
// src/components/ripple/PeopleAffectedInput.tsx
// src/components/ripple/GeographicScopeInput.tsx
// src/components/ripple/EvidenceUpload.tsx
// src/components/ripple/RippleVisualization.tsx (concentric circles)
```

**Acceptance Criteria**:
- [ ] Form submits correctly
- [ ] Ripple effects save to database
- [ ] Storyteller notified
- [ ] Visualization updates

---

#### Day 38-39: Comments & Engagement (Respectful Design)
**Owner**: Cultural Safety Team + Frontend Design Team
**Tasks**:
- [ ] Create `CommentsSection` component (if storyteller allows)
- [ ] Threaded discussions
- [ ] Cultural moderation (AI + elder oversight)
- [ ] Respectful language enforcement
- [ ] Report inappropriate content
- [ ] Edit/delete own comments
- [ ] Elder can hide/delete comments
- [ ] Storyteller can disable comments
- [ ] Notification system
- [ ] Comment analytics

**Database Tables**:
- `comments` (create table)
- `moderation_results` (10 cols)
- `ai_moderation_logs` (14 cols)

**Components Created**:
```typescript
// src/components/comments/CommentsSection.tsx
// src/components/comments/CommentThread.tsx
// src/components/comments/CommentForm.tsx
// src/components/comments/CommentModeration.tsx
// src/components/comments/ReportDialog.tsx
// src/components/comments/CommentActions.tsx
```

**Acceptance Criteria**:
- [ ] Comments post correctly
- [ ] Threads work
- [ ] Moderation catches inappropriate content
- [ ] Report function works
- [ ] Storyteller controls functional

---

#### Day 40: Social Sharing & Collections
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `ShareButton` component
- [ ] Share to social media (Facebook, Twitter, LinkedIn)
- [ ] Generate embed code
- [ ] Email story link
- [ ] QR code generation
- [ ] Create collections/playlists
- [ ] Save to reading list
- [ ] Bookmark stories
- [ ] Download offline (PWA)

**Components Created**:
```typescript
// src/components/sharing/ShareButton.tsx
// src/components/sharing/SocialMediaShare.tsx
// src/components/sharing/EmbedCodeGenerator.tsx
// src/components/sharing/EmailShare.tsx
// src/components/sharing/QRCodeGenerator.tsx
// src/components/collections/CreateCollection.tsx
// src/components/collections/SaveToCollection.tsx
// src/components/collections/ReadingList.tsx
```

**Acceptance Criteria**:
- [ ] Share buttons work
- [ ] Embed code generates correctly
- [ ] QR codes functional
- [ ] Collections save
- [ ] PWA offline works

---

### Sprint 4 Review & Retrospective (Feb 28)

**Demo**:
- Full-text search
- Advanced filters
- Quote search
- Ripple effects reporting
- Comments system
- Social sharing

**Success Metrics**:
- [ ] Search finds relevant results
- [ ] Filters work correctly
- [ ] Ripple effects reportable
- [ ] Comments respectful
- [ ] Sharing functional

**Deploy to Staging**

---

## SPRINT 5: Organization Tools (Mar 3-14)

**Theme**: Organization campaign management
**Goal**: Organizations can manage projects, recruit storytellers, track impact

### Week 9 (Mar 3-7)

#### Day 41-42: Project Management Dashboard
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `ProjectManagementDashboard` component
- [ ] Projects list view
- [ ] Create new project
- [ ] Edit project details
- [ ] Project timeline visualization
- [ ] Storyteller count per project
- [ ] Story count per project
- [ ] Progress tracking
- [ ] Funding information
- [ ] Geographic scope

**Database Tables**:
- `projects` (30 cols)
- `project_contexts` (45 cols!)
- `project_analytics` (21 cols)

**Components Created**:
```typescript
// src/components/admin/ProjectManagementDashboard.tsx
// src/components/admin/ProjectsList.tsx
// src/components/admin/CreateProjectForm.tsx
// src/components/admin/ProjectDetailsEdit.tsx
// src/components/admin/ProjectTimeline.tsx
// src/components/admin/ProjectProgress.tsx
```

**Acceptance Criteria**:
- [ ] Projects display correctly
- [ ] Create project works
- [ ] Edit saves correctly
- [ ] Timeline visualization clear
- [ ] Progress tracking accurate

---

#### Day 43-44: Storyteller Recruitment & Management
**Owner**: Frontend Design Team + Integration Team
**Tasks**:
- [ ] Create `StorytellerRecruitment` component
- [ ] Send email invitations
- [ ] Send SMS invitations
- [ ] Generate QR codes for events
- [ ] Magic link generation (no password)
- [ ] Track invitation status
- [ ] Assign storytellers to projects
- [ ] Storyteller roster view
- [ ] Consent form management
- [ ] Field worker access

**Database Tables**:
- `organization_invitations` (12 cols)
- `project_participants` (9 cols)
- `storyteller_projects` (10 cols)

**Components Created**:
```typescript
// src/components/admin/StorytellerRecruitment.tsx
// src/components/admin/InvitationForm.tsx
// src/components/admin/QRCodeGenerator.tsx
// src/components/admin/MagicLinkGenerator.tsx
// src/components/admin/InvitationTracker.tsx
// src/components/admin/StorytellerRoster.tsx
// src/components/admin/ConsentFormManager.tsx
```

**Acceptance Criteria**:
- [ ] Email invitations send
- [ ] SMS invitations send
- [ ] QR codes generate
- [ ] Magic links work
- [ ] Invitation tracking accurate
- [ ] Consent forms manageable

---

#### Day 45: Story Assignment & Curation
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `StoryCuration` component
- [ ] Assign stories to projects
- [ ] Tag stories with project themes
- [ ] Feature/unfeature stories
- [ ] Organize into campaigns
- [ ] Story collection progress
- [ ] Quality review queue
- [ ] Approve/reject submissions

**Database Tables**:
- `story_project_tags` (20 cols)
- `story_project_features` (13 cols)
- `act_featured_storytellers`

**Components Created**:
```typescript
// src/components/admin/StoryCuration.tsx
// src/components/admin/AssignToProject.tsx
// src/components/admin/ProjectThemeTagger.tsx
// src/components/admin/FeatureStoryToggle.tsx
// src/components/admin/CampaignOrganizer.tsx
// src/components/admin/QualityReviewQueue.tsx
```

**Acceptance Criteria**:
- [ ] Stories assign to projects
- [ ] Tagging works
- [ ] Feature toggle functional
- [ ] Curation saves correctly

---

### Week 10 (Mar 10-14)

#### Day 46-47: Elder Review Dashboard
**Owner**: Cultural Safety Team + Frontend Design Team
**Tasks**:
- [ ] Create `ElderReviewDashboard` component
- [ ] Pending review queue
- [ ] Story preview
- [ ] Cultural concern categories
- [ ] Annotation tools
- [ ] Approve/reject workflow
- [ ] Cultural guidance notes
- [ ] Request changes
- [ ] Review history
- [ ] Escalation to elder council

**Database Tables**:
- `elder_review_queue` (16 cols)
- `elder_review_dashboard` (19 cols)
- `moderation_results`

**Components Created**:
```typescript
// src/components/elder/ElderReviewDashboard.tsx
// src/components/elder/ReviewQueue.tsx
// src/components/elder/StoryPreview.tsx
// src/components/elder/ConcernCategories.tsx
// src/components/elder/AnnotationTools.tsx
// src/components/elder/ApprovalWorkflow.tsx
// src/components/elder/CulturalGuidanceNotes.tsx
// src/components/elder/ReviewHistory.tsx
```

**Acceptance Criteria**:
- [ ] Queue displays correctly
- [ ] Story preview clear
- [ ] Approval workflow functional
- [ ] Notes save correctly
- [ ] History tracked

---

#### Day 48-49: Consent Tracking System
**Owner**: GDPR/Compliance Team + Frontend Design Team
**Tasks**:
- [ ] Create `ConsentTrackingDashboard` component
- [ ] All consents list
- [ ] Filter by type (story, photo, AI, sharing)
- [ ] Consent status (active, withdrawn, expired)
- [ ] Expiration reminders
- [ ] Renewal workflows
- [ ] Withdrawal processing
- [ ] Multi-party consent (family members)
- [ ] Consent forms download
- [ ] Audit trail display

**Database Tables**:
- `consent_change_log` (13 cols)
- `privacy_changes` (9 cols)
- `audit_logs`

**Components Created**:
```typescript
// src/components/consent/ConsentTrackingDashboard.tsx
// src/components/consent/ConsentsList.tsx
// src/components/consent/ConsentFilters.tsx
// src/components/consent/ConsentStatus.tsx
// src/components/consent/ExpirationReminders.tsx
// src/components/consent/RenewalWorkflow.tsx
// src/components/consent/WithdrawalProcessor.tsx
// src/components/consent/MultiPartyConsent.tsx
// src/components/consent/ConsentAuditTrail.tsx
```

**Acceptance Criteria**:
- [ ] All consents tracked
- [ ] Expiration reminders sent
- [ ] Withdrawal processes correctly
- [ ] Multi-party consent works
- [ ] Audit trail complete

---

#### Day 50: Basic Organization Analytics
**Owner**: AI/Analytics Team + Frontend Design Team
**Tasks**:
- [ ] Create `OrganizationAnalytics` component
- [ ] Total stories count
- [ ] Total storytellers count
- [ ] Stories by theme chart
- [ ] Stories by region map
- [ ] Timeline visualization
- [ ] Engagement metrics
- [ ] Language distribution
- [ ] Export to CSV/PDF

**Database Tables**:
- `organization_analytics` (18 cols)
- `project_analytics` (21 cols)
- `storyteller_analytics`

**Components Created**:
```typescript
// src/components/analytics/OrganizationAnalytics.tsx
// src/components/analytics/StoriesCount.tsx
// src/components/analytics/StorytellersCount.tsx
// src/components/analytics/ThemeChart.tsx
// src/components/analytics/RegionMap.tsx
// src/components/analytics/TimelineViz.tsx
// src/components/analytics/EngagementMetrics.tsx
// src/components/analytics/ExportButton.tsx
```

**Acceptance Criteria**:
- [ ] Analytics accurate
- [ ] Charts display correctly
- [ ] Export works (CSV/PDF)
- [ ] Real-time updates

---

### Sprint 5 Review & Retrospective (Mar 14)

**Demo**:
- Project management
- Storyteller recruitment
- Elder review dashboard
- Consent tracking
- Basic analytics

**Success Metrics**:
- [ ] Organizations can manage projects
- [ ] Storytellers recruited successfully
- [ ] Elder review functional
- [ ] Consent tracked completely
- [ ] Analytics informative

**Deploy to Staging**

---

## SPRINT 6: Analytics & SROI (Mar 17-28)

**Theme**: Advanced analytics and impact measurement
**Goal**: Organizations can calculate SROI and generate funder reports

### Week 11 (Mar 17-21)

#### Day 51-53: SROI Calculator
**Owner**: AI/Analytics Team + Frontend Design Team
**Tasks**:
- [ ] Create `SROICalculator` component
- [ ] Input form (investment, funding sources, period)
- [ ] Outcomes definition wizard
- [ ] Stakeholder groups selector
- [ ] Financial proxy database/selector
- [ ] Deadweight calculator
- [ ] Attribution calculator
- [ ] Drop-off rate input
- [ ] Duration of benefits
- [ ] Calculation engine
- [ ] Sensitivity analysis (conservative/base/optimistic)
- [ ] Results visualization
- [ ] SROI ratio display
- [ ] Value by stakeholder breakdown

**Database Tables**:
- `sroi_calculations` (11 cols)
- `sroi_inputs` (10 cols)
- `sroi_outcomes` (17 cols)

**Components Created**:
```typescript
// src/components/sroi/SROICalculator.tsx
// src/components/sroi/InputForm.tsx
// src/components/sroi/OutcomesWizard.tsx
// src/components/sroi/StakeholderGroups.tsx
// src/components/sroi/FinancialProxySelector.tsx
// src/components/sroi/DeadweightCalculator.tsx
// src/components/sroi/AttributionCalculator.tsx
// src/components/sroi/DropOffRate.tsx
// src/components/sroi/CalculationEngine.tsx
// src/components/sroi/SensitivityAnalysis.tsx
// src/components/sroi/ResultsVisualization.tsx
// src/components/sroi/SROIRatioDisplay.tsx
```

**Acceptance Criteria**:
- [ ] Calculator completes all steps
- [ ] SROI ratio accurate
- [ ] Sensitivity analysis correct
- [ ] Results save to database
- [ ] Visualizations clear

---

#### Day 54-55: Theme Evolution Tracking
**Owner**: AI/Analytics Team + Frontend Design Team
**Tasks**:
- [ ] Create `ThemeEvolutionDashboard` component
- [ ] 6-month timeline per theme
- [ ] Prominence score over time
- [ ] Theme status (emerging/growing/stable/declining)
- [ ] Semantic shift detection
- [ ] Theme relationships graph
- [ ] Story count per theme
- [ ] Storyteller count per theme
- [ ] Growth rate calculation
- [ ] Export theme data

**Database Tables**:
- `narrative_themes` (13 cols)
- `theme_evolution` (10 cols)
- `theme_evolution_tracking` (16 cols)
- `theme_concept_evolution` (9 cols)

**Components Created**:
```typescript
// src/components/themes/ThemeEvolutionDashboard.tsx
// src/components/themes/ThemeTimeline.tsx
// src/components/themes/ProminenceChart.tsx
// src/components/themes/ThemeStatus.tsx
// src/components/themes/SemanticShiftDetector.tsx
// src/components/themes/ThemeRelationshipsGraph.tsx
// src/components/themes/GrowthRateCalculator.tsx
```

**Acceptance Criteria**:
- [ ] Timeline displays correctly
- [ ] Semantic shifts detected
- [ ] Relationships clear
- [ ] Growth rates accurate

---

### Week 12 (Mar 24-28)

#### Day 56-57: Community Interpretation Sessions
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `InterpretationSessionForm` component
- [ ] Session details (date, participants)
- [ ] Story selection
- [ ] Key interpretations input
- [ ] Consensus points
- [ ] Divergent views
- [ ] Cultural context notes
- [ ] Recommendations capture
- [ ] Session summary
- [ ] Link to stories

**Database Tables**:
- `community_interpretation_sessions` (14 cols)
- `community_story_responses` (11 cols)

**Components Created**:
```typescript
// src/components/interpretation/InterpretationSessionForm.tsx
// src/components/interpretation/SessionDetails.tsx
// src/components/interpretation/StorySelection.tsx
// src/components/interpretation/KeyInterpretations.tsx
// src/components/interpretation/ConsensusPoints.tsx
// src/components/interpretation/DivergentViews.tsx
// src/components/interpretation/CulturalContext.tsx
// src/components/interpretation/Recommendations.tsx
// src/components/interpretation/SessionSummary.tsx
```

**Acceptance Criteria**:
- [ ] Sessions documented
- [ ] All fields save correctly
- [ ] Link to stories works
- [ ] Summary generates

---

#### Day 58-59: Harvested Outcomes Tracking
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `HarvestedOutcomesForm` component
- [ ] Link to stories
- [ ] Outcome description
- [ ] Unexpected benefits capture
- [ ] Community-reported impacts
- [ ] Real-world changes
- [ ] Policy influences
- [ ] Evidence upload
- [ ] Outcomes list view
- [ ] Filter by project

**Database Tables**:
- `harvested_outcomes` (19 cols)
- `outcomes` (37 cols)
- `document_outcomes` (14 cols)

**Components Created**:
```typescript
// src/components/outcomes/HarvestedOutcomesForm.tsx
// src/components/outcomes/StoryLinkSelector.tsx
// src/components/outcomes/OutcomeDescription.tsx
// src/components/outcomes/UnexpectedBenefits.tsx
// src/components/outcomes/CommunityImpacts.tsx
// src/components/outcomes/RealWorldChanges.tsx
// src/components/outcomes/PolicyInfluences.tsx
// src/components/outcomes/EvidenceUpload.tsx
// src/components/outcomes/OutcomesList.tsx
```

**Acceptance Criteria**:
- [ ] Outcomes documented
- [ ] Link to stories works
- [ ] Evidence uploaded
- [ ] List filterable

---

#### Day 60: Funder Report Generator
**Owner**: Frontend Design Team + AI/Analytics Team
**Tasks**:
- [ ] Create `FunderReportGenerator` component
- [ ] Report template selection
- [ ] Executive summary auto-generation
- [ ] SROI headline
- [ ] People impacted
- [ ] Stories collected
- [ ] Featured story arcs
- [ ] Emotional journey charts
- [ ] Social value breakdown
- [ ] Ripple effects visualization
- [ ] Community voice quotes
- [ ] Export to PDF
- [ ] Export to PowerPoint
- [ ] Embed widgets for website

**Database Tables**:
- `annual_reports` (42 cols)
- `report_sections` (21 cols)
- `report_templates` (17 cols)

**Components Created**:
```typescript
// src/components/reports/FunderReportGenerator.tsx
// src/components/reports/TemplateSelector.tsx
// src/components/reports/ExecutiveSummary.tsx
// src/components/reports/SROIHeadline.tsx
// src/components/reports/FeaturedStoryArcs.tsx
// src/components/reports/SocialValueBreakdown.tsx
// src/components/reports/RippleEffectsViz.tsx
// src/components/reports/CommunityVoiceQuotes.tsx
// src/components/reports/ExportPDF.tsx
// src/components/reports/ExportPowerPoint.tsx
// src/components/reports/EmbedWidget.tsx
```

**Acceptance Criteria**:
- [ ] Reports generate correctly
- [ ] PDF export works
- [ ] PowerPoint export works
- [ ] Widgets embeddable
- [ ] Professional formatting

---

### Sprint 6 Review & Retrospective (Mar 28)

**Demo**:
- SROI calculator
- Theme evolution tracking
- Interpretation sessions
- Harvested outcomes
- Funder report generator

**Success Metrics**:
- [ ] SROI calculations accurate
- [ ] Theme evolution insightful
- [ ] Sessions documented
- [ ] Outcomes tracked
- [ ] Reports professional

**Deploy to Staging**

---

## SPRINT 7: Advanced Features (Mar 31-Apr 11)

**Theme**: AI pipeline activation and advanced visualizations
**Goal**: Activate AI analysis for 208 transcripts, build thematic network, interactive map

### Week 13 (Mar 31-Apr 4)

#### Day 61-63: AI Analysis Pipeline Activation
**Owner**: AI/Analytics Team + Farmhand Integration
**Tasks**:
- [ ] Process all 208 existing transcripts
- [ ] Theme extraction (populate `narrative_themes`)
- [ ] Quote detection (populate `extracted_quotes`, `storyteller_quotes`)
- [ ] Narrative arc analysis (populate `story_narrative_arcs`)
- [ ] Voice analysis - prosody (populate `audio_prosodic_analysis`)
- [ ] Voice analysis - emotion (populate `audio_emotion_analysis`)
- [ ] Cultural speech patterns (populate `cultural_speech_patterns`)
- [ ] Storyteller connections discovery (populate `storyteller_connections`)
- [ ] Storyteller themes linking (populate `storyteller_themes`)
- [ ] Cross-narrative insights (populate `cross_narrative_insights`)
- [ ] Community validation UI for all AI results

**Farmhand Agents Used**:
- ALMA (cultural safety checking)
- Impact Analyzer
- Story Analysis Agent
- Theme Extractor
- Quote Detector

**Database Tables Populated**:
- `narrative_themes` (13 cols)
- `extracted_quotes` (14 cols)
- `storyteller_quotes` (28 cols)
- `story_narrative_arcs` (19 cols)
- `audio_prosodic_analysis` (23 cols)
- `audio_emotion_analysis` (12 cols)
- `cultural_speech_patterns` (12 cols)
- `storyteller_connections` (33 cols!)
- `storyteller_themes` (14 cols)
- `cross_narrative_insights` (33 cols)

**Acceptance Criteria**:
- [ ] All 208 transcripts processed
- [ ] Themes extracted correctly
- [ ] Quotes detected accurately
- [ ] Narrative arcs identified
- [ ] Voice analysis complete (if audio exists)
- [ ] Storyteller connections discovered
- [ ] Community validation UI works
- [ ] ALMA cultural safety check passes

---

#### Day 64-65: Thematic Network Visualization
**Owner**: Frontend Design Team + AI/Analytics Team
**Tasks**:
- [ ] Create `ThematicNetworkGraph` component
- [ ] D3.js force-directed graph
- [ ] Nodes: Themes (sized by usage_count)
- [ ] Edges: Co-occurrence strength
- [ ] Colors: Cultural categories
- [ ] Interactive: Click theme to filter storytellers
- [ ] Zoom/pan functionality
- [ ] Tooltip with theme details
- [ ] Filter by cultural group
- [ ] Filter by time period
- [ ] Export graph as image/SVG

**Database Tables**:
- `narrative_themes`
- `theme_associations`
- `storyteller_themes`
- `theme_evolution`

**Components Created**:
```typescript
// src/components/network/ThematicNetworkGraph.tsx
// src/components/network/D3ForceDirected.tsx
// src/components/network/ThemeNode.tsx
// src/components/network/ThemeEdge.tsx
// src/components/network/NetworkTooltip.tsx
// src/components/network/NetworkFilters.tsx
// src/components/network/NetworkExport.tsx
```

**Acceptance Criteria**:
- [ ] Graph renders correctly
- [ ] Interactive features work
- [ ] Performance smooth (< 500ms render)
- [ ] Filters apply correctly
- [ ] Export works

---

### Week 14 (Apr 7-11)

#### Day 66-67: Interactive Map
**Owner**: Frontend Design Team + Integration Team
**Tasks**:
- [ ] Create `InteractiveStoryMap` component
- [ ] Integrate Mapbox/Leaflet
- [ ] Plot stories on traditional territories
- [ ] Cultural boundaries overlay
- [ ] Cluster stories by region
- [ ] Respectful zoom limits (prevent sacred site exposure)
- [ ] Territory acknowledgment on hover
- [ ] Click marker to open story preview
- [ ] Filter by theme
- [ ] Filter by cultural group
- [ ] Heat map mode

**Database Tables**:
- `stories` (geographic data)
- `locations` (10 cols)
- `storyteller_locations`
- `profile_locations`

**Components Created**:
```typescript
// src/components/map/InteractiveStoryMap.tsx
// src/components/map/MapboxIntegration.tsx
// src/components/map/CulturalBoundaries.tsx
// src/components/map/StoryMarker.tsx
// src/components/map/StoryCluster.tsx
// src/components/map/TerritoryAcknowledgment.tsx
// src/components/map/StoryPreviewPopup.tsx
// src/components/map/MapFilters.tsx
// src/components/map/HeatMapMode.tsx
```

**Acceptance Criteria**:
- [ ] Map displays correctly
- [ ] Stories plotted accurately
- [ ] Cultural boundaries respectful
- [ ] Zoom limits enforced
- [ ] Territory acknowledgment shown
- [ ] Filters work

---

#### Day 68-69: Professional Networking Features
**Owner**: Frontend Design Team
**Tasks**:
- [ ] Create `NetworkingDashboard` component
- [ ] Find similar storytellers
- [ ] AI-powered recommendations
- [ ] Send connection requests
- [ ] Accept/decline requests
- [ ] Messaging system
- [ ] Mentorship matching (elders & emerging)
- [ ] Collaboration invitations
- [ ] Professional portfolio (cross-org)
- [ ] Skills/themes expertise display

**Database Tables**:
- `storyteller_connections` (33 cols)
- `storyteller_recommendations` (35 cols)
- `storyteller_projects` (cross-org identity)

**Components Created**:
```typescript
// src/components/networking/NetworkingDashboard.tsx
// src/components/networking/FindStorytellerCard.tsx
// src/components/networking/AIRecommendations.tsx
// src/components/networking/ConnectionRequest.tsx
// src/components/networking/MessagingSystem.tsx
// src/components/networking/MentorshipMatching.tsx
// src/components/networking/CollaborationInvite.tsx
// src/components/networking/ProfessionalPortfolio.tsx
```

**Acceptance Criteria**:
- [ ] Similar storytellers found
- [ ] Recommendations relevant
- [ ] Connection requests work
- [ ] Messaging functional
- [ ] Mentorship matching effective

---

#### Day 70: Personal Impact Analytics
**Owner**: AI/Analytics Team + Frontend Design Team
**Tasks**:
- [ ] Create `PersonalImpactDashboard` component
- [ ] Storytelling journey timeline
- [ ] Stories published over time
- [ ] Total views/engagement
- [ ] Ripple effects visualization (concentric circles)
- [ ] Geographic reach map
- [ ] Theme evolution (my themes over time)
- [ ] Connections made
- [ ] Quotes shared
- [ ] Professional growth tracking

**Database Tables**:
- `storyteller_analytics` (24 cols)
- `storyteller_impact_metrics` (40 cols!)
- `storyteller_engagement` (40 cols)
- `ripple_effects`

**Components Created**:
```typescript
// src/components/impact/PersonalImpactDashboard.tsx
// src/components/impact/JourneyTimeline.tsx
// src/components/impact/StoriesPublishedChart.tsx
// src/components/impact/TotalEngagement.tsx
// src/components/impact/RippleEffectsCircles.tsx
// src/components/impact/GeographicReachMap.tsx
// src/components/impact/ThemeEvolutionPersonal.tsx
// src/components/impact/ConnectionsMade.tsx
// src/components/impact/QuotesShared.tsx
// src/components/impact/GrowthTracking.tsx
```

**Acceptance Criteria**:
- [ ] Dashboard displays correctly
- [ ] All metrics accurate
- [ ] Visualizations clear
- [ ] Real-time updates

---

### Sprint 7 Review & Retrospective (Apr 11)

**Demo**:
- AI pipeline results (208 transcripts processed)
- Thematic network visualization
- Interactive map
- Professional networking
- Personal impact dashboard

**Success Metrics**:
- [ ] AI pipeline complete
- [ ] Thematic network functional
- [ ] Interactive map works
- [ ] Networking features live
- [ ] Impact analytics accurate

**Deploy to Staging**

---

## SPRINT 8: Polish & Launch (Apr 14-25)

**Theme**: Production readiness and launch
**Goal**: Security audit, performance optimization, training materials, launch

### Week 15 (Apr 14-18)

#### Day 71-72: Security Audit
**Owner**: Cultural Safety Team + Database Architect Team
**Tasks**:
- [ ] Penetration testing
- [ ] SQL injection testing
- [ ] XSS vulnerability scan
- [ ] CSRF protection verification
- [ ] RLS policy audit (all 228 policies)
- [ ] Access control testing
- [ ] Authentication flow testing
- [ ] Authorization verification
- [ ] Secrets audit (no exposed API keys)
- [ ] HTTPS/TLS verification
- [ ] Rate limiting testing
- [ ] File upload security
- [ ] Cultural protocol enforcement testing

**Tools**:
- OWASP ZAP
- Burp Suite
- npm audit
- Snyk
- Manual testing

**Acceptance Criteria**:
- [ ] Zero high-severity vulnerabilities
- [ ] All RLS policies tested
- [ ] Access control verified
- [ ] Cultural protocols enforced
- [ ] Security report generated

---

#### Day 73-74: Performance Optimization
**Owner**: Frontend Design Team + Database Architect Team
**Tasks**:
- [ ] Load testing (1000+ concurrent users)
- [ ] Database query optimization
- [ ] Index optimization
- [ ] CDN configuration (CloudFlare)
- [ ] Image optimization (WebP/AVIF)
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] Cache strategy (Redis)
- [ ] Static generation where possible
- [ ] API response time optimization
- [ ] Lighthouse audit (target: 95+ score)

**Tools**:
- k6 (load testing)
- Lighthouse
- WebPageTest
- Chrome DevTools

**Acceptance Criteria**:
- [ ] Page load < 2s (all pages)
- [ ] API response < 200ms (95th percentile)
- [ ] Database queries < 100ms (95th percentile)
- [ ] Lighthouse score > 95
- [ ] Handle 1000+ concurrent users

---

#### Day 75: Accessibility Compliance Audit
**Owner**: Frontend Design Team
**Tasks**:
- [ ] WCAG 2.1 AA audit (all pages)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard navigation testing
- [ ] Color contrast verification
- [ ] Focus indicators
- [ ] Form labels
- [ ] Image alt text
- [ ] Heading structure
- [ ] ARIA attributes
- [ ] Skip links
- [ ] axe-core automated testing

**Tools**:
- axe DevTools
- WAVE
- Lighthouse accessibility
- Manual screen reader testing

**Acceptance Criteria**:
- [ ] 100% WCAG 2.1 AA compliance
- [ ] All pages keyboard navigable
- [ ] Screen readers work correctly
- [ ] Color contrast passes
- [ ] Zero accessibility violations

---

### Week 16 (Apr 21-25)

#### Day 76-77: Community Training Materials
**Owner**: Cultural Safety Team + Frontend Design Team
**Tasks**:
- [ ] Storyteller onboarding guide (PDF + video)
- [ ] Organization admin guide (PDF + video)
- [ ] Elder review training (PDF + video)
- [ ] Privacy settings tutorial
- [ ] ALMA settings tutorial
- [ ] Story creation walkthrough
- [ ] Media upload tutorial
- [ ] SROI calculator guide
- [ ] FAQ documentation
- [ ] Troubleshooting guide
- [ ] Video tutorials (10-15 videos)
- [ ] Interactive product tour

**Deliverables**:
- Storyteller Onboarding Guide (20 pages)
- Organization Admin Guide (40 pages)
- Elder Review Training (15 pages)
- 15 tutorial videos (5-10 min each)
- Interactive product tour (built-in)

**Components Created**:
```typescript
// src/components/onboarding/ProductTour.tsx
// src/components/onboarding/TooltipGuide.tsx
// src/components/onboarding/VideoTutorials.tsx
// src/components/onboarding/FAQ.tsx
```

**Acceptance Criteria**:
- [ ] All guides complete
- [ ] Videos professional quality
- [ ] Product tour functional
- [ ] FAQ comprehensive

---

#### Day 78-79: Backup, Monitoring, Support
**Owner**: Database Architect Team + Integration Team
**Tasks**:
- [ ] Automated backup configuration (daily)
- [ ] Multi-region backup
- [ ] Disaster recovery testing
- [ ] Backup restoration testing
- [ ] Monitoring setup (Sentry for errors)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database monitoring (Supabase)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Alert configuration (critical errors)
- [ ] Support ticketing system setup
- [ ] Community support processes
- [ ] Escalation procedures

**Tools**:
- Sentry (error tracking)
- Vercel Analytics
- Supabase monitoring
- UptimeRobot
- Zendesk/Intercom (support)

**Acceptance Criteria**:
- [ ] Daily backups automated
- [ ] Disaster recovery tested
- [ ] Monitoring configured
- [ ] Alerts firing correctly
- [ ] Support system ready

---

#### Day 80: Launch Preparation
**Owner**: Full Team + Indigenous Advisory Board
**Tasks**:
- [ ] Final Indigenous Advisory Board review
- [ ] Launch announcement draft
- [ ] Press release preparation
- [ ] Community outreach plan
- [ ] Social media strategy
- [ ] Email campaign to existing users
- [ ] Onboarding storyteller invitations
- [ ] Organization partner notifications
- [ ] Launch checklist verification
- [ ] Go/No-go decision meeting

**Deliverables**:
- Launch announcement
- Press release
- Social media posts (10+)
- Email templates (5)
- Community outreach plan

**Launch Checklist**:
- [ ] All P0 features functional
- [ ] Zero high-severity bugs
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Accessibility compliance verified
- [ ] Training materials complete
- [ ] Backup/monitoring configured
- [ ] Indigenous Advisory Board approval
- [ ] Community partners ready
- [ ] Support team trained

**GO/NO-GO Criteria**:
- [ ] Cultural safety: 100% compliant
- [ ] Technical performance: Meets targets
- [ ] Community readiness: Partners prepared
- [ ] Support readiness: Team trained
- [ ] Indigenous Advisory Board: Approval received

---

### Sprint 8 Review & Launch (Apr 25)

**Final Demo to Indigenous Advisory Board**:
- Complete platform walkthrough
- All 3 audience experiences
- Cultural safety features
- OCAP® compliance demonstration
- Performance metrics
- Security audit results

**Launch Decision**: GO/NO-GO

**If GO**:
- [ ] Deploy to production (production.empathy-ledger.vercel.app)
- [ ] DNS cutover to primary domain
- [ ] Send launch announcements
- [ ] Activate community outreach
- [ ] Monitor closely for 48 hours
- [ ] Celebrate with community! 🎉

---

## Post-Launch: Continuous Improvement

### Week 17+ (Apr 28+)

**Ongoing**:
- Daily monitoring
- Weekly community feedback review
- Bi-weekly sprint planning
- Monthly security audits
- Quarterly Indigenous Advisory Board reviews
- Continuous feature development
- Community training sessions
- Performance optimization

**Metrics Tracking**:
- Storyteller growth (target: 25% monthly)
- Story collection rate (target: 15% monthly)
- Community satisfaction (target: 90% positive)
- SROI value demonstrated
- Cultural safety incidents (target: zero)
- Performance (target: < 2s load times)
- Uptime (target: 99.9%)

---

## Sprint Success Metrics Summary

| Sprint | Key Metric | Target | Measurement |
|--------|------------|--------|-------------|
| Sprint 1 | Profile pages functional | 100% | All 226 storytellers viewable |
| Sprint 2 | Stories creatable | 100% | End-to-end wizard works |
| Sprint 3 | Public browsing | < 2s load | Lighthouse score > 90 |
| Sprint 4 | Search accuracy | > 90% | Relevant results |
| Sprint 5 | Elder review | 100% | Workflow functional |
| Sprint 6 | SROI accuracy | ± 5% | Calculation verification |
| Sprint 7 | AI processing | 208/208 | All transcripts analyzed |
| Sprint 8 | Security | Zero high | Vulnerabilities patched |

---

## Team Capacity & Velocity

**Team Size**: 7 agents + Indigenous Advisory Board

**Sprint Velocity** (Estimated):
- Sprint 1: 50 story points
- Sprint 2: 55 story points
- Sprint 3: 60 story points
- Sprint 4: 55 story points
- Sprint 5: 50 story points
- Sprint 6: 45 story points
- Sprint 7: 40 story points (AI processing heavy)
- Sprint 8: 30 story points (testing/polish)

**Total**: 385 story points over 16 weeks

---

## Risk Mitigation

**Identified Risks**:

1. **AI Pipeline Delay** (Sprint 7)
   - Mitigation: Start AI testing in Sprint 4
   - Backup: Manual theme tagging if needed

2. **Indigenous Advisory Board Availability**
   - Mitigation: Schedule reviews in advance
   - Backup: Asynchronous review process

3. **Performance Issues at Scale**
   - Mitigation: Load testing in Sprint 5-6
   - Backup: Horizontal scaling plan ready

4. **Cultural Safety Violations**
   - Mitigation: Continuous cultural review
   - Backup: Immediate rollback capability

5. **Storyteller Recruitment Lag**
   - Mitigation: Early recruitment in Sprint 1-2
   - Backup: Use test accounts for demos

---

## Documentation Deliverables

**Throughout Sprints**:
- [ ] Component Storybook
- [ ] API documentation (OpenAPI)
- [ ] Database ER diagrams
- [ ] Cultural protocol guide
- [ ] Developer onboarding guide
- [ ] User guides (Storyteller, Org, Elder)
- [ ] Video tutorials
- [ ] FAQ
- [ ] Troubleshooting guide

---

**This sprint plan provides the complete 16-week roadmap from foundation to launch with clear deliverables, metrics, and success criteria for each sprint.**
