# Storyteller Media Library - Design Specification

## Vision

Every storyteller should have their own **media library** - a personal collection of photos, videos, transcripts, story ideas, and drafts that they can draw from when crafting stories. Think of it like a storyteller's toolkit that grows over time.

## User Flow

### Storyteller Perspective

**Before (Current State):**
```
1. User creates a story
2. Has to add media inline
3. No way to organize or reuse content
4. Transcripts are one-time use
5. Can't build up a collection over time
```

**After (Media Library):**
```
1. User uploads photos/videos to their library
2. Adds transcripts from interviews
3. Saves story ideas and snippets
4. Creates drafts
5. When crafting a story:
   - Browse their photo library
   - Select relevant images/videos
   - Pull from existing transcripts
   - Link to draft stories
   - Embed videos
6. Story is enriched with multimedia
7. Media is reusable across multiple stories
```

## Database Schema

### New Tables

#### storyteller_media_library

Stores all media items for a storyteller.

```sql
CREATE TABLE storyteller_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Media Details
  media_type TEXT NOT NULL CHECK (media_type IN (
    'photo',
    'video',
    'audio',
    'document',
    'transcript'
  )),
  file_url TEXT,                    -- Supabase storage URL
  thumbnail_url TEXT,                -- Thumbnail for preview

  -- Metadata
  title TEXT,
  description TEXT,
  tags TEXT[],                       -- For organization

  -- Original Context
  captured_date DATE,                -- When was this captured?
  location TEXT,                     -- Where was this taken?
  people TEXT[],                     -- Who's in it?

  -- Technical
  file_size INTEGER,                 -- Bytes
  mime_type TEXT,                    -- image/jpeg, video/mp4, etc
  duration_seconds INTEGER,          -- For video/audio
  width INTEGER,                     -- For images/video
  height INTEGER,

  -- Organization
  folder TEXT,                       -- Optional folder structure
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Usage tracking
  used_in_stories UUID[],           -- Story IDs where this is used
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes
  CONSTRAINT unique_media_per_storyteller UNIQUE(storyteller_id, file_url)
);

CREATE INDEX idx_media_library_storyteller ON storyteller_media_library(storyteller_id);
CREATE INDEX idx_media_library_type ON storyteller_media_library(media_type);
CREATE INDEX idx_media_library_tags ON storyteller_media_library USING gin(tags);
CREATE INDEX idx_media_library_featured ON storyteller_media_library(is_featured) WHERE is_featured = true;
```

#### storyteller_transcripts

Stores interview transcripts and audio/video captures.

```sql
CREATE TABLE storyteller_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Content
  title TEXT NOT NULL,
  raw_transcript TEXT,               -- Original transcript with timecodes
  cleaned_transcript TEXT,           -- Cleaned version (no timecodes)
  summary TEXT,                      -- AI-generated summary

  -- Source
  source_type TEXT CHECK (source_type IN ('audio', 'video', 'written', 'interview')),
  source_media_id UUID REFERENCES storyteller_media_library(id),
  interviewer TEXT,                  -- Who conducted the interview?
  interview_date DATE,

  -- Extracted Data
  themes TEXT[],                     -- AI-extracted themes
  key_quotes TEXT[],                 -- Notable quotes
  people_mentioned TEXT[],           -- Names mentioned
  places_mentioned TEXT[],           -- Locations mentioned

  -- Processing
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  word_count INTEGER,

  -- Usage
  used_in_stories UUID[],           -- Stories created from this
  story_ideas TEXT[],                -- Potential story angles

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transcripts_storyteller ON storyteller_transcripts(storyteller_id);
CREATE INDEX idx_transcripts_themes ON storyteller_transcripts USING gin(themes);
CREATE INDEX idx_transcripts_processed ON storyteller_transcripts(is_processed);
```

#### story_drafts

Stores work-in-progress stories and ideas.

```sql
CREATE TABLE story_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Content
  title TEXT,
  content TEXT,
  excerpt TEXT,

  -- Organization
  status TEXT CHECK (status IN ('idea', 'outline', 'draft', 'review', 'ready')),
  folder TEXT,                       -- Optional categorization

  -- Source Material
  based_on_transcript_id UUID REFERENCES storyteller_transcripts(id),
  linked_media_ids UUID[],           -- Media from library

  -- Metadata
  tags TEXT[],
  themes TEXT[],
  notes TEXT,                        -- Internal notes

  -- Publishing
  target_publish_date DATE,
  published_story_id UUID REFERENCES stories(id),

  -- Versioning
  version INTEGER DEFAULT 1,
  last_edited_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_drafts_storyteller ON story_drafts(storyteller_id);
CREATE INDEX idx_drafts_status ON story_drafts(status);
CREATE INDEX idx_drafts_transcript ON story_drafts(based_on_transcript_id);
```

#### story_media_links

Links stories to media library items.

```sql
CREATE TABLE story_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES storyteller_media_library(id) ON DELETE CASCADE,

  -- Display
  display_order INTEGER,             -- Order in story
  caption TEXT,                      -- Caption for this usage
  display_type TEXT CHECK (display_type IN (
    'inline',                        -- Embedded in content
    'gallery',                       -- Part of gallery
    'header',                        -- Header image
    'featured'                       -- Featured/hero image
  )),

  -- Layout
  position_in_content INTEGER,       -- Paragraph/section number
  width_percent INTEGER,             -- Display width (optional)

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(story_id, media_id, display_order)
);

CREATE INDEX idx_story_media_story ON story_media_links(story_id);
CREATE INDEX idx_story_media_media ON story_media_links(media_id);
```

## UI Components

### Media Library View

**Location**: `/storyteller/[id]/media`

```
┌─────────────────────────────────────────────────────────────┐
│ 📚 My Media Library                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Upload] [New Folder] [🔍 Search] [Filter ▼]              │
│                                                             │
│  📁 Folders:                                                │
│  ├─ Photos (24)                                             │
│  ├─ Videos (8)                                              │
│  ├─ Transcripts (12)                                        │
│  └─ Drafts (6)                                              │
│                                                             │
│  ┌────────┬────────┬────────┬────────┐                     │
│  │ [IMG]  │ [IMG]  │ [VID]  │ [DOC]  │                     │
│  │ Sunset │ Elder  │ Interv.│ Trans. │                     │
│  │ 2.1 MB │ 1.8 MB │ 45 min │ 8 pages│                     │
│  │ ❤️ 3   │ ❤️ 12  │ ❤️ 5   │ ❤️ 2   │                     │
│  └────────┴────────┴────────┴────────┘                     │
│                                                             │
│  [Load More...]                                             │
└─────────────────────────────────────────────────────────────┘
```

### Story Composer with Media

**Location**: `/stories/new` or `/stories/[id]/edit`

```
┌─────────────────────────────────────────────────────────────┐
│ ✍️ Compose Story                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title: [_____________________________________]             │
│                                                             │
│  Content:                                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Once upon a time in Palm Island...                    │ │
│  │                                                        │ │
│  │ [+ Insert Media]  [+ Insert from Transcript]          │ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Media Sidebar:                                             │
│  ┌─────────────────────┐                                   │
│  │ 📷 My Photos (24)   │                                   │
│  │ ┌────┬────┬────┐    │                                   │
│  │ │[I] │[I] │[I] │    │                                   │
│  │ └────┴────┴────┘    │                                   │
│  │ [Browse Library...] │                                   │
│  │                     │                                   │
│  │ 📝 My Transcripts   │                                   │
│  │ • Interview 1       │                                   │
│  │ • Interview 2       │                                   │
│  │ [View All...]       │                                   │
│  └─────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

### Media Picker Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Select Media from Your Library                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Photos] [Videos] [Audio] [Documents]                      │
│  [🔍 Search...]                                             │
│                                                             │
│  ┌─────────┬─────────┬─────────┬─────────┐                │
│  │ [IMAGE] │ [IMAGE] │ [IMAGE] │ [IMAGE] │                │
│  │  ☑️      │         │         │  ☑️      │                │
│  │ Sunset  │ Elder   │ Gather  │ Dance   │                │
│  │ 2.1 MB  │ 1.8 MB  │ 3.2 MB  │ 1.5 MB  │                │
│  └─────────┴─────────┴─────────┴─────────┘                │
│                                                             │
│  Selected: 2 items                                          │
│                                                             │
│  [Cancel]                       [Insert Selected]           │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Upload & Organize

**Photo/Video Upload:**
- Drag & drop interface
- Batch upload support
- Auto-generate thumbnails
- Extract metadata (date, location, EXIF)
- Organize into folders

**Transcript Management:**
- Upload text files
- Paste raw transcripts
- AI-powered cleaning (remove timecodes, speaker labels)
- Extract themes and quotes
- Link to source audio/video

### 2. Browse & Search

**Filters:**
- By media type (photo, video, audio, document)
- By date range
- By tags
- By usage (used/unused in stories)
- By folder

**Search:**
- Full-text search in titles, descriptions
- Search by tags
- Search by people/places mentioned
- Search in transcript content

### 3. Story Crafting

**Media Integration:**
- Browse library while writing
- Drag & drop media into story
- Preview before inserting
- Set captions and alt text
- Choose display style (inline, gallery, header)

**Transcript to Story:**
- Select a transcript
- AI transforms it using story-craft skill
- Keep link to original transcript
- Pull quotes directly from transcript
- Reference specific moments

**Video Embeds:**
- Upload video to library
- Get embed code
- Insert at specific paragraph
- Auto-generate thumbnail
- Set autoplay/controls options

### 4. Reuse & Track

**Usage Tracking:**
- See which stories use each media item
- Track view counts
- Identify most-used photos
- Find unused content

**Collections:**
- Create themed collections
- "Community Events" folder
- "Cultural Practices" folder
- "Personal Journey" folder

## Implementation Plan

### Phase 1: Database Setup (Week 1)

- [ ] Create migration for media_library table
- [ ] Create migration for transcripts table
- [ ] Create migration for story_drafts table
- [ ] Create migration for story_media_links table
- [ ] Set up Supabase storage buckets
- [ ] Create RLS policies

### Phase 2: Upload System (Week 2)

- [ ] Build photo/video upload component
- [ ] Implement drag & drop
- [ ] Add thumbnail generation
- [ ] Create metadata extraction
- [ ] Build folder organization
- [ ] Add batch upload

### Phase 3: Media Library UI (Week 3)

- [ ] Create media library page
- [ ] Build grid/list view toggle
- [ ] Add search and filters
- [ ] Implement media preview modal
- [ ] Add edit/delete functionality
- [ ] Create folder management

### Phase 4: Story Integration (Week 4)

- [ ] Build media picker modal
- [ ] Add media insertion in story editor
- [ ] Implement transcript selector
- [ ] Create video embed component
- [ ] Add gallery component
- [ ] Build image positioning controls

### Phase 5: AI Enhancement (Week 5)

- [ ] Transcript cleaning AI
- [ ] Theme extraction from transcripts
- [ ] Quote extraction
- [ ] Story suggestion from media
- [ ] Auto-tagging of photos
- [ ] Smart search

## Example User Journeys

### Journey 1: Photo Story

```
1. Sarah uploads 20 photos from community event
2. AI auto-tags them: "ceremony", "dancing", "Elders"
3. She organizes them into "Ceremony 2024" folder
4. Creates new story
5. Clicks "Insert Media" → sees her photos
6. Selects 5 photos
7. They're inserted as a gallery
8. She adds captions for each
9. Story is published with beautiful photo gallery
```

### Journey 2: Transcript to Story

```
1. Uncle James has an interview transcript
2. Uploads it to his library
3. AI cleans it (removes timecodes, speaker labels)
4. AI extracts 3 key themes: "healing", "Country", "youth"
5. AI suggests potential story angles
6. He creates a new story based on "healing" theme
7. Pulls relevant quotes from transcript
8. Uses story-craft skill to transform into narrative
9. Links to original video in media library
10. Story is published with embedded video
```

### Journey 3: Multi-Media Story

```
1. Elder creates story about traditional fishing
2. Adds header photo from photo library
3. Embeds video of fishing demonstration
4. Inserts historical photo from archive
5. Links to audio recording of song
6. All media is reusable for future stories
```

## Technical Architecture

### Storage

**Supabase Storage Buckets:**
```
storyteller-photos/
  ├─ {storyteller_id}/
     ├─ originals/
     └─ thumbnails/

storyteller-videos/
  ├─ {storyteller_id}/
     └─ {video_id}/
        ├─ video.mp4
        └─ thumbnail.jpg

storyteller-documents/
  └─ {storyteller_id}/
     └─ transcripts/
```

### File Upload Flow

```
User uploads photo
  ↓
Client validates (size, type)
  ↓
Upload to Supabase Storage
  ↓
Generate thumbnail (server-side)
  ↓
Extract metadata (EXIF, date, location)
  ↓
Create media_library record
  ↓
Show success + preview
```

### Media Insertion Flow

```
User clicks "Insert Media"
  ↓
Open media picker modal
  ↓
Fetch storyteller's media from library
  ↓
User selects item(s)
  ↓
Insert at cursor position
  ↓
Create story_media_link record
  ↓
Render in story preview
```

## Benefits

### For Storytellers

- ✅ Build media library over time
- ✅ Organize personal collection
- ✅ Reuse photos/videos across stories
- ✅ Transform transcripts easily
- ✅ Rich multimedia stories
- ✅ Track what's been used

### For Administrators

- ✅ Better content quality
- ✅ Professional story presentation
- ✅ Reduced duplicate uploads
- ✅ Content analytics
- ✅ Media rights tracking

### For Readers

- ✅ Engaging visual stories
- ✅ Video embeds
- ✅ Photo galleries
- ✅ Audio clips
- ✅ Richer experience

## Next Steps

1. **Review this design** - feedback on approach
2. **Create database migration** - set up tables
3. **Build upload component** - basic photo upload
4. **Create media library page** - browse uploaded items
5. **Integrate with story editor** - insert media

Would you like me to start implementing any part of this system?
