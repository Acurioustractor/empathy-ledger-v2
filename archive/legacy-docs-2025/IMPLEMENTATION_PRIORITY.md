# Implementation Priority - Story & Media System

## Current Status

✅ **Done:**
- Admin stories page redesigned with grid/list views
- Story quality audit system created
- Test stories deleted (8 removed)
- Media library database schema created
- story-craft Claude skill built
- Profile images fixed (using correct field: profile_image_url)
- Beautiful story reading page complete with world-class typography

⚠️ **Issues:**
- 54 stories need transformation (raw transcripts)
- No rich story editor yet
- No media upload system yet

## Phase 1: Critical Fixes (Today) ⭐

### 1.1 Run Database Migration
```bash
# Apply media library schema
supabase db push
```

### 1.2 Fix Story Images
The profile avatars are working correctly (showing initials). The real task is:
- Allow storytellers to upload profile photos
- Store in Supabase storage
- Update avatar_url in profiles table

### 1.3 Transform Top 10 Poor-Quality Stories
Use `/skill story-craft` to fix the worst stories:
1. Shayne Bloomfield (severity 10/10)
2. Tarren — Key Story (10/10)
3. Kate Bjur — Key Story (10/10)
4. Neilson Naje — Key Story (10/10)
5. Freddy Wai — Key Story (10/10)
6. Chris Mourad — Key Story (10/10)
7. David Allen — Key Story (10/10)
8. Paul Marchesi (7/10)
9. Henry Bloomfield (7/10)
10. Aunty Maureen (7/10)

## Phase 2: Story Reading Experience (This Week) 🎨

### 2.1 Beautiful Story Page
Create `/stories/[id]` with:
- Hero image header
- Storyteller info with avatar
- Cultural context display
- Rich typography
- Photo galleries
- Video embeds
- Smooth scrolling
- Related stories

**Design inspiration**: Medium, Substack, NYT

### 2.2 Story Card Component
Update existing story cards to show:
- Profile images (with fallback)
- Better previews
- Hover effects
- Cultural indicators

## Phase 3: WordPress-Style Editor (Next Week) ✍️

### 3.1 Rich Text Editor
Using Tiptap or similar:
- Drag & drop blocks
- Inline image insertion
- Video embeds
- Quote blocks
- Heading styles
- Link insertion

### 3.2 Media Sidebar
- Browse media library
- Drag photos into story
- Upload new media
- Preview before inserting

### 3.3 Editing Experience
- Auto-save drafts
- Version history
- Live preview
- Mobile-friendly

## Phase 4: Media Upload System (Week 2) 📸

### 4.1 Photo Upload
- Drag & drop
- Multiple files
- Progress indicators
- Thumbnail generation
- EXIF extraction

### 4.2 Video Upload
- Direct upload to Supabase
- Thumbnail generation
- Duration extraction
- Compression options

### 4.3 Media Library Page
- Grid view
- Search & filter
- Folders
- Bulk operations

## Phase 5: AI Story Transformation (Ongoing) 🤖

### 5.1 Batch Transform Stories
Script to:
- Read raw transcript
- Call story-craft skill
- Generate proper story
- Update database
- Preserve original as backup

### 5.2 Transcript Management
- Upload transcripts
- AI cleaning
- Theme extraction
- Quote extraction
- Link to stories

## Quick Wins (Can Do Now)

### A. Deploy Media Library Schema
```bash
cd supabase
supabase db push
```

### B. Create Profile Avatar Upload
Simple component to:
- Upload photo
- Crop/resize
- Save to storage
- Update avatar_url

### C. Improve Story Display
Even without editor, improve how stories are shown:
- Better typography
- Paragraph spacing
- Quote styling
- Image support (if URLs in content)

### D. Transform 5 Stories Manually
Use story-craft skill to fix 5 worst stories today

## Recommended Start Order

**Today (2-3 hours):**
1. ✅ Deploy media library migration
2. ✅ Create beautiful story reading page with world-class typography
3. ⏳ Transform 5 worst stories with story-craft skill

**Tomorrow (3-4 hours):**
4. Create profile avatar upload component
5. Build media library basic UI
6. Transform 10 more stories

**This Week:**
7. Build WordPress-style editor (Tiptap)
8. Add media insertion
9. Create photo/video upload
10. Transform all remaining poor stories

## Technical Stack Decisions

### Story Editor
**Recommendation**: Tiptap
- Modern, extensible
- React-friendly
- Markdown support
- Custom blocks
- Media embeds
- Similar to Notion/WordPress Gutenberg

### Media Storage
**Using**: Supabase Storage
- Already set up
- Easy uploads
- CDN support
- Access control

### Image Processing
**Recommendation**: Sharp (server-side) or browser-native
- Thumbnail generation
- Compression
- Format conversion

## Success Metrics

### By End of Week 1:
- ✅ All test stories deleted (Done!)
- ✅ Media library schema deployed
- 🎯 Top 20 poor stories transformed
- 🎯 Beautiful story reading page live
- 🎯 Profile avatars working

### By End of Week 2:
- 🎯 All 54 poor stories transformed
- 🎯 Rich story editor working
- 🎯 Media upload functional
- 🎯 100+ stories with proper formatting

### By End of Month:
- 🎯 90% of stories are high quality
- 🎯 Storytellers uploading own media
- 🎯 Beautiful multimedia stories
- 🎯 Story reading experience is amazing

## What to Build First?

**My Recommendation**: Focus on the reading experience first, then the editing tools.

### Why?
1. **Immediate impact** - Users see beautiful stories now
2. **Motivation** - Shows vision of what's possible
3. **Testing ground** - Learn what works before building editor
4. **Quick win** - Can be done in a few hours

### Start with Beautiful Story Page

Create `/stories/[id]/page.tsx` with:
- Clean typography
- Proper spacing
- Image support
- Cultural context
- Storyteller info

Then build backward to the editor.

## Next Action

What should I build first?

**Option A**: Beautiful story reading page (2-3 hours)
**Option B**: Profile avatar upload (1 hour)
**Option C**: Transform 10 stories with story-craft (2 hours)
**Option D**: WordPress-style editor (1 day)

My vote: **A** → **C** → **B** → **D**

Let me know which you prefer and I'll start building!
