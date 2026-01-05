# Quick Add Storyteller & Transcript - Optimized Workflow

## Your Workflow (Optimized for Speed)

### Single Form - Everything in One Place

```
┌─────────────────────────────────────────────────┐
│  Quick Add: Storyteller & Transcript           │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. STORYTELLER (Required)                      │
│     ○ Existing: [Dropdown ▼]                    │
│     ○ New: [Name_______________]                │
│           [Email______________] (optional)      │
│           [Bio________________] (optional)      │
│                                                 │
│  2. TRANSCRIPT (Required)                       │
│     [Paste full transcript here...]            │
│     ┌────────────────────────────────────────┐ │
│     │                                        │ │
│     │  Large text area - just paste!        │ │
│     │                                        │ │
│     └────────────────────────────────────────┘ │
│                                                 │
│  3. VIDEO (Required)                            │
│     [https://share.descript.com/view/...]      │
│     Preview: [Video thumbnail shows here]      │
│                                                 │
│  4. PROJECT (Required)                          │
│     [Select Project ▼]                          │
│                                                 │
│  5. OPTIONAL DETAILS                            │
│     [+ Add photo]                               │
│     [+ Add location]                            │
│     [+ Add tags]                                │
│                                                 │
│  [Cancel]  [Save & Add Another]  [Save & Done] │
└─────────────────────────────────────────────────┘
```

### Time: ~2 minutes per story

1. Paste transcript
2. Paste Descript link
3. Type/select storyteller name
4. Select project
5. Done!

---

## Features

### Auto-Save Draft
- Saves as you type
- Won't lose work if browser closes
- Resume later

### Smart Defaults
- Project: Uses last selected
- Organization: Auto-detects from current context
- Storyteller: Shows recent/frequent at top

### Descript Video Support
- Paste any Descript share link:
  - `https://share.descript.com/view/...`
  - `https://share.descript.com/embed/...`
- Auto-generates thumbnail from video
- Stores video metadata

### Quick Storyteller Entry
Two modes:
1. **Existing**: Dropdown with search
2. **New**: Inline quick-add
   - Just name required
   - Email/bio optional
   - Can edit details later

### Optional Enhancements
- Photo upload (drag & drop)
- Location (text or dropdown)
- Tags (comma-separated or chips)
- Cultural background
- Interview date

---

## Implementation Details

### Page Location
`/admin/quick-add` or `/admin/transcripts/quick-add`

### API Endpoint
```typescript
POST /api/admin/quick-add
{
  // Storyteller (existing or new)
  storytellerId?: string,
  newStoryteller?: {
    name: string,
    email?: string,
    bio?: string
  },

  // Transcript
  transcript: {
    text: string,
    videoUrl: string,
    title?: string
  },

  // Project
  projectId: string,
  organizationId: string,

  // Optional
  photo?: File,
  location?: string,
  tags?: string[],
  culturalBackground?: string
}
```

### Success Flow
After saving:
1. Show success message
2. Show preview card of what was created
3. Options:
   - "Add Another" → Clear form, keep project selected
   - "View Story" → Go to story page
   - "Done" → Back to admin dashboard

---

## Descript Video Integration

### Supported Formats
```
✅ https://share.descript.com/view/ABC123
✅ https://share.descript.com/embed/XYZ789
✅ Descript share links with timestamps
```

### What We Extract
- Video thumbnail (first frame or custom)
- Duration (if available in embed data)
- Title (from Descript metadata)
- Raw video URL for playback

### Thumbnail Priority
1. Descript's thumbnail (if provided)
2. First frame extraction
3. Default placeholder image
4. Manual upload (optional)

---

## CSV Import (Secondary)

For bulk work, simple CSV:

```csv
storyteller_name,transcript,video_url,project_name
"John Smith","Full transcript text...","https://share.descript.com/view/123","Project Name"
```

Upload at `/admin/bulk-upload`

---

## Next Steps

**Phase 1: Essential Quick Add (2-3 days)**
- ✅ Single-page form
- ✅ Storyteller dropdown + quick-add
- ✅ Large transcript textarea
- ✅ Descript video URL
- ✅ Project selector
- ✅ Save & add another

**Phase 2: Enhancements (1-2 days)**
- ⚪ Photo upload
- ⚪ Auto-save drafts
- ⚪ Descript thumbnail extraction
- ⚪ Success preview

**Phase 3: CSV Import (1 day)**
- ⚪ CSV template
- ⚪ Upload interface
- ⚪ Bulk processing

---

## Ready to Build?

Which would you like me to start with?

1. **Quick Add Form** (Your priority - I recommend this)
2. **CSV Import** (Nice to have)
3. **Both** (Full solution)
