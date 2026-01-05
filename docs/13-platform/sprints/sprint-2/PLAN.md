# Sprint 2: Storyteller Dashboard - Implementation Plan

**Dates:** January 20-31, 2026 (10 working days)
**Theme:** Complete storytelling experience
**Goal:** Storytellers can create, edit, and manage stories with full media support
**Status:** Ready to Start

---

## Sprint 2 Overview

### Components to Build (20 components)

1. **My Stories Dashboard** (5 components)
   - Stories list with filters
   - Story cards with status
   - Quick actions menu
   - Empty state
   - Search and filter bar

2. **Story Creation Wizard** (9 components)
   - Multi-step wizard (6 steps)
   - Consent step
   - Storyteller info step
   - Content step
   - Media upload step
   - Privacy step
   - Review step
   - Cultural protocol checklist
   - Auto-save indicator

3. **Story Editor** (6 components)
   - Edit content tab
   - Edit metadata tab
   - Edit media tab
   - Edit privacy tab
   - Version history
   - Unpublish dialog

4. **Media Management** (9 components)
   - Media uploader
   - Drag & drop zone
   - Image preview
   - Video preview
   - Audio preview
   - Cultural tagging
   - People tagging
   - Sacred content flag
   - Alt text generator

5. **Smart Gallery** (3 components)
   - Gallery grid view
   - Lightbox viewer
   - Caption editor

**Total:** ~30 components, estimated ~10,000 lines of code

---

## Week 3: Foundation (Jan 20-24)

### Day 1-2: My Stories Dashboard

**Files to Create:**
```
src/app/storytellers/[id]/stories/page.tsx
src/components/storyteller/MyStoriesDashboard.tsx
src/components/storyteller/StoryCard.tsx
src/components/storyteller/StoriesFilter.tsx
src/components/storyteller/QuickActions.tsx
src/components/storyteller/EmptyStories.tsx
```

**Features:**
- List all stories by storyteller
- Filter by status (draft, published, pending_review)
- Search by title/content
- Sort by date/title
- Quick actions (edit, delete, share)
- Stats cards (total, published, drafts)

**APIs Needed:**
- `GET /api/storytellers/[id]/stories` - Get all stories
- `DELETE /api/stories/[id]` - Delete story
- `PATCH /api/stories/[id]/status` - Update status

---

### Day 3-5: Story Creation Wizard

**Files to Create:**
```
src/components/story/StoryCreationWizard.tsx
src/components/story/wizard/ConsentStep.tsx
src/components/story/wizard/StorytellerInfoStep.tsx
src/components/story/wizard/ContentStep.tsx
src/components/story/wizard/MediaUploadStep.tsx
src/components/story/wizard/PrivacyStep.tsx
src/components/story/wizard/ReviewStep.tsx
src/components/story/CulturalProtocolChecklist.tsx
src/components/story/AutoSaveIndicator.tsx
```

**Wizard Steps:**

1. **Step 1: Consent** (5 minutes)
   - Story sharing consent
   - Photo/video consent
   - AI processing consent (optional)
   - Family member multi-party consent

2. **Step 2: Storyteller Info** (5 minutes)
   - Name confirmation
   - Location selection
   - Cultural affiliations
   - Preferred pronouns

3. **Step 3: Story Content** (15 minutes)
   - Title field
   - Story text (rich text editor)
   - Key quotes
   - Timeline/date

4. **Step 4: Media Upload** (10 minutes)
   - Upload photos/videos
   - Cultural tagging
   - People tagging
   - Sacred content flags

5. **Step 5: Privacy & Protocols** (5 minutes)
   - Visibility settings
   - Elder review request
   - Community-only toggle
   - Attribution preferences

6. **Step 6: Review & Submit** (5 minutes)
   - Preview story
   - Cultural protocol checklist
   - Confirm and submit

**Features:**
- Progress indicator (1/6, 2/6, etc.)
- Auto-save every 30 seconds
- Back/Next navigation
- Skip to step (for editing)
- Exit and save draft

**APIs Needed:**
- `POST /api/stories` - Create new story
- `PATCH /api/stories/[id]` - Auto-save draft
- `POST /api/stories/[id]/submit` - Submit for review

---

## Week 4: Advanced Features (Jan 27-31)

### Day 6-7: Story Editor

**Files to Create:**
```
src/app/stories/[id]/edit/page.tsx
src/components/story/StoryEditor.tsx
src/components/story/editor/EditContentTab.tsx
src/components/story/editor/EditMetadataTab.tsx
src/components/story/editor/EditMediaTab.tsx
src/components/story/editor/EditPrivacyTab.tsx
src/components/story/editor/VersionHistory.tsx
src/components/story/editor/UnpublishDialog.tsx
```

**Features:**
- Tab-based editing interface
- Load existing story
- Edit all fields
- Version history tracking
- Unpublish option
- Re-submit for Elder review if needed

**APIs Needed:**
- `GET /api/stories/[id]` - Get story
- `PATCH /api/stories/[id]` - Update story
- `POST /api/stories/[id]/unpublish` - Unpublish
- `GET /api/stories/[id]/versions` - Version history

---

### Day 8-9: Media Upload & Gallery

**Files to Create:**
```
src/components/media/MediaUploader.tsx
src/components/media/DragDropZone.tsx
src/components/media/ImagePreview.tsx
src/components/media/VideoPreview.tsx
src/components/media/AudioPreview.tsx
src/components/media/CulturalTagging.tsx
src/components/media/PeopleTagging.tsx
src/components/media/SacredContentFlag.tsx
src/components/media/AltTextGenerator.tsx
```

**Features:**
- Drag & drop upload
- Multiple file types (images, videos, audio)
- Preview before upload
- Cultural tagging (ceremony, location, season)
- People tagging with consent
- Sacred content warnings
- AI-generated alt text
- Upload to Supabase Storage

**APIs Needed:**
- `POST /api/media/upload` - Upload file
- `POST /api/media/[id]/tag` - Add cultural tags
- `POST /api/media/[id]/people` - Tag people
- `GET /api/media/[id]/alt-text` - Generate alt text

---

### Day 10: Smart Gallery & Polish

**Files to Create:**
```
src/components/media/SmartGallery.tsx
src/components/media/GalleryGrid.tsx
src/components/media/Lightbox.tsx
src/components/media/CaptionEditor.tsx
```

**Features:**
- Grid layout with responsive sizing
- Lightbox for full-size viewing
- Navigation between images
- Caption editing
- Download option
- Share option

---

## Database Schema Requirements

### Tables Used

1. **stories** (existing)
   - Add `draft_content` JSONB column
   - Add `auto_saved_at` timestamp

2. **media_assets** (existing)
   - Ensure cultural_tags JSONB
   - Ensure people_tags JSONB
   - Ensure sacred_content boolean

3. **story_versions** (new - optional)
   ```sql
   CREATE TABLE story_versions (
     id UUID PRIMARY KEY,
     story_id UUID REFERENCES stories(id),
     content JSONB,
     changed_by UUID REFERENCES profiles(id),
     changed_at TIMESTAMP,
     change_summary TEXT
   );
   ```

---

## API Endpoints to Create (15 endpoints)

### Stories Management (5 endpoints)
1. `GET /api/storytellers/[id]/stories` - Get all stories by storyteller
2. `POST /api/stories` - Create new story
3. `PATCH /api/stories/[id]` - Update story (auto-save)
4. `DELETE /api/stories/[id]` - Delete story
5. `POST /api/stories/[id]/submit` - Submit for Elder review

### Story Status (3 endpoints)
6. `POST /api/stories/[id]/publish` - Publish story
7. `POST /api/stories/[id]/unpublish` - Unpublish story
8. `PATCH /api/stories/[id]/status` - Update status

### Media Management (4 endpoints)
9. `POST /api/media/upload` - Upload media file
10. `POST /api/media/[id]/tag` - Add cultural tags
11. `POST /api/media/[id]/people` - Tag people
12. `DELETE /api/media/[id]` - Delete media

### AI Features (3 endpoints)
13. `POST /api/ai/alt-text` - Generate alt text for image
14. `POST /api/ai/extract-quotes` - Extract key quotes from story
15. `POST /api/ai/suggest-themes` - Suggest themes

---

## Testing Strategy

### Unit Tests
- Story creation wizard flow
- Auto-save functionality
- Media upload validation
- Cultural protocol checks

### Integration Tests
- End-to-end story creation
- Story editing workflow
- Media upload and tagging
- Elder review submission

### User Acceptance Tests
- Storyteller creates complete story
- Storyteller edits existing story
- Storyteller uploads media
- Elder reviews submitted story

---

## Success Criteria

- [ ] Storytellers can create stories with all fields
- [ ] Auto-save prevents data loss
- [ ] Media uploads work for all types
- [ ] Cultural protocols enforced
- [ ] Elder review queue populated
- [ ] Version history tracks changes
- [ ] All 15 API endpoints functional
- [ ] Zero cultural safety violations
- [ ] Performance: Story creation < 3s
- [ ] Accessibility: WCAG 2.1 AA compliant

---

## Cultural Safety Checkpoints

### Before Implementation
- [ ] Review story creation flow with Indigenous Advisory Board
- [ ] Confirm cultural protocol checklist items
- [ ] Validate consent workflow

### During Implementation
- [ ] Sacred knowledge detection working
- [ ] Elder review routing correct
- [ ] Multi-party consent captured

### After Implementation
- [ ] Full cultural safety review
- [ ] Elder testing session
- [ ] Storyteller UAT feedback

---

## Dependencies

### External Services
- Supabase Storage (media files)
- Claude API (AI features - alt text, quotes, themes)
- Email service (notifications)

### Internal Dependencies
- Sprint 1 Profile components ✅
- Sprint 5 Elder Review system ✅
- Sprint 5 Consent Tracking ✅

---

## Risk Mitigation

**Risk:** Media upload performance issues
**Mitigation:**
- Use progressive upload with chunks
- Implement upload queue
- Show progress indicators

**Risk:** Auto-save conflicts (multiple devices)
**Mitigation:**
- Use optimistic locking
- Timestamp-based conflict resolution
- Manual merge UI

**Risk:** Cultural protocol complexity
**Mitigation:**
- Start with essential protocols
- Iterate based on Elder feedback
- Clear documentation

---

## Estimated Timeline

| Phase | Duration | Components | Lines of Code |
|-------|----------|------------|---------------|
| My Stories Dashboard | 2 days | 5 | ~1,500 |
| Story Creation Wizard | 3 days | 9 | ~3,500 |
| Story Editor | 2 days | 6 | ~2,500 |
| Media Management | 2 days | 9 | ~3,000 |
| Smart Gallery | 1 day | 3 | ~1,000 |

**Total:** 10 days, ~30 components, ~11,500 lines

---

## Next Steps

1. **Review this plan** with Indigenous Advisory Board
2. **Create database migrations** for new columns/tables
3. **Start with My Stories Dashboard** (most foundational)
4. **Build incrementally** - test each component before moving on
5. **Daily demos** to stakeholders for feedback

---

**Ready to start Sprint 2?** Let's build the complete storytelling experience! 🌾
