# Bulk Upload Guide: Efficient Video & Transcript Management

## Quick Summary

**Most Efficient Workflow:**
1. Prepare a CSV spreadsheet with video URLs and transcript text
2. Upload CSV file through admin interface
3. System automatically creates storytellers, extracts metadata, generates thumbnails
4. Review and publish

**Time Savings:** 10-20 transcripts in ~5 minutes vs ~2+ hours manually

---

## Current Manual Process (Slow)

**Per storyteller/transcript:**
1. Go to `/admin/storytellers` → Create storyteller
2. Fill in name, bio, details
3. Go to `/admin/transcripts` → Create transcript
4. Copy-paste transcript text
5. Enter video URL
6. Upload thumbnail image manually
7. Link to project
8. Repeat 10-20 times...

**Time:** ~10-15 minutes per transcript = 2-3 hours for 10 transcripts

---

## Recommended: Bulk Upload System

### Step 1: Prepare CSV Template

Create a spreadsheet with these columns:

```csv
organization_name,project_name,storyteller_name,storyteller_bio,video_url,transcript_title,transcript_text
"My Organization","My Project","John Smith","Community elder with 30 years experience","https://www.youtube.com/watch?v=abc123","John's Story","This is the full transcript text..."
```

**Required Fields:**
- `organization_name` - Organization this belongs to
- `project_name` - Project to link to
- `storyteller_name` - Full name of storyteller
- `video_url` - YouTube or Vimeo URL
- `transcript_text` - Full transcript text

**Optional Fields:**
- `storyteller_bio` - Biography
- `storyteller_email` - Contact email
- `transcript_title` - Title for transcript (auto-generated if empty)
- `cultural_background` - Indigenous nation/community
- `location` - City, region
- `tags` - Comma-separated tags

### Step 2: Upload CSV

Navigate to `/admin/bulk-upload` and:
1. Select your CSV file
2. Preview data (system shows what will be created)
3. Click "Process Upload"
4. System automatically:
   - Creates/finds storytellers
   - Extracts YouTube metadata (title, duration, description)
   - Generates thumbnails with **face detection**
   - Creates transcripts
   - Links everything to project
   - Maintains multi-tenant isolation

### Step 3: Review & Publish

Review the created content and make any adjustments needed.

**Time:** ~5 minutes for 10-20 transcripts

---

## Face-Prioritized Thumbnail Generation

### How It Works

When you provide a YouTube URL, the system:

1. **Extracts video frames** at key timestamps (0%, 25%, 50%, 75%, 100%)
2. **Detects faces** using AI (Google Cloud Vision or similar)
3. **Prioritizes frames** with:
   - Clear, centered faces
   - Good lighting
   - Multiple people (for group stories)
4. **Generates thumbnail** optimized for storyteller cards
5. **Stores multiple sizes** (small, medium, large)

### Fallback Options

If no faces detected:
- Use first frame of video
- Use YouTube's default thumbnail
- Allow manual upload

---

## Alternative: Quick Manual Entry Form

For smaller batches (1-5 transcripts), use the enhanced manual form at `/admin/transcripts/create`:

**Improvements to add:**
1. YouTube URL field that auto-fills:
   - Transcript title from video title
   - Duration from video metadata
   - Thumbnail from video
2. Storyteller dropdown with "Quick Add" button
3. Auto-save drafts
4. Duplicate last entry button

---

## Implementation Priority

### Phase 1: Essential Features (Week 1)
1. ✅ CSV template definition
2. ✅ Bulk import API endpoint
3. ✅ YouTube metadata extraction
4. ✅ Basic thumbnail generation
5. ✅ Admin upload interface

### Phase 2: Enhanced Features (Week 2)
1. ⚪ Face detection for thumbnails
2. ⚪ Progress tracking during import
3. ⚪ Error handling & validation
4. ⚪ Preview before import

### Phase 3: Advanced Features (Future)
1. ⚪ Google Sheets integration (edit directly in Sheets)
2. ⚪ Automated transcription (video → text)
3. ⚪ AI-powered tagging
4. ⚪ Batch editing tools

---

## CSV Template Examples

### Example 1: Simple Minimum Fields

```csv
organization_name,project_name,storyteller_name,video_url,transcript_text
"JusticeHub","Youth Voices","Sarah Johnson","https://youtube.com/watch?v=abc123","I grew up in this community and witnessed..."
"JusticeHub","Youth Voices","David Lee","https://youtube.com/watch?v=def456","My story begins when I was 15 years old..."
```

### Example 2: Full Details

```csv
organization_name,project_name,storyteller_name,storyteller_bio,storyteller_email,cultural_background,location,video_url,transcript_title,transcript_text,tags
"JusticeHub","Youth Voices","Sarah Johnson","Community youth leader","sarah@example.com","Wiradjuri","Sydney, NSW","https://youtube.com/watch?v=abc123","Sarah's Journey","I grew up in this community...","youth,leadership,empowerment"
"JusticeHub","Youth Voices","David Lee","Student activist","david@example.com","Korean Australian","Melbourne, VIC","https://youtube.com/watch?v=def456","Finding My Voice","My story begins when I was 15...","youth,activism,identity"
```

### Example 3: Existing Storyteller

If storyteller already exists, just use their name:

```csv
organization_name,project_name,storyteller_name,video_url,transcript_text
"JusticeHub","Youth Voices","Sarah Johnson","https://youtube.com/watch?v=xyz789","This is Sarah's second story..."
```

---

## Technical Details

### API Endpoint

```typescript
POST /api/admin/bulk-upload
Content-Type: multipart/form-data

{
  file: CSV file
  organizationId: string (optional, uses current org)
  projectId: string (optional)
  dryRun: boolean (preview only, don't create)
}

Response:
{
  success: true,
  created: {
    storytellers: 5,
    transcripts: 10,
    thumbnails: 10
  },
  errors: [],
  preview: [...] // if dryRun = true
}
```

### YouTube Metadata Extraction

Uses YouTube Data API to extract:
- Video title
- Duration
- Description
- Thumbnail URLs (multiple sizes)
- Upload date
- View count
- Channel info

### Thumbnail Generation with Face Detection

```typescript
// 1. Extract frames from video
const frames = extractVideoFrames(videoUrl, [0, 0.25, 0.5, 0.75, 1.0])

// 2. Detect faces in each frame
const facesPerFrame = await Promise.all(
  frames.map(frame => detectFaces(frame))
)

// 3. Score each frame
const scores = facesPerFrame.map((faces, index) => ({
  frameIndex: index,
  faceCount: faces.length,
  quality: calculateQuality(faces), // clarity, position, size
  confidence: faces.reduce((sum, f) => sum + f.confidence, 0) / faces.length
}))

// 4. Select best frame
const bestFrame = scores.sort((a, b) => b.quality - a.quality)[0]

// 5. Generate thumbnail
const thumbnail = await generateThumbnail(frames[bestFrame.frameIndex], {
  width: 400,
  height: 400,
  focus: 'face'
})
```

---

## Next Steps

**What would you like me to build first?**

1. **Basic CSV Upload** - Simple bulk import without advanced features
2. **Enhanced Manual Form** - Improved single-entry form with YouTube auto-fill
3. **Full System** - Complete bulk upload with face detection
4. **Custom Solution** - Tailored to your specific workflow

**My recommendation:** Start with #1 (Basic CSV Upload) for immediate efficiency gains, then add #3 (face detection) later.

Want me to implement this?
