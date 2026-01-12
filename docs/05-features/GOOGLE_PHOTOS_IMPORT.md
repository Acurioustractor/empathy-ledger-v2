# Google Photos Import Workflow

> Smart workflow for importing photos and videos from Google Photos into Empathy Ledger.

## Overview

This guide provides several methods to import your Google Photos media into Empathy Ledger, from simple drag-and-drop to bulk import via Google Takeout.

## Quick Methods

### Method 1: Direct Upload (Easiest)
Best for: **Small batches (1-20 photos)**

1. Open Google Photos in browser
2. Select photos you want to import
3. Click ⬇️ Download (downloads as ZIP if multiple)
4. Go to `/admin/compendium-media` or the Media Library
5. Drag and drop the photos

### Method 2: Share to Empathy Ledger
Best for: **Medium batches (20-100 photos)**

1. In Google Photos, select photos
2. Create a shared album
3. Get the shareable link
4. Use the import tool: `npm run import:google-album <url>`

### Method 3: Google Takeout (Bulk)
Best for: **Large archives (100+ photos)**

1. Go to [takeout.google.com](https://takeout.google.com)
2. Select only "Google Photos"
3. Choose specific albums or all photos
4. Export as `.tgz` or `.zip`
5. Download the export
6. Run: `npm run import:google-takeout <path-to-export>`

---

## Setting Up Google Photos Import

### Prerequisites

1. **Google Cloud Project** (for API access)
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Photos Library API"
   - Create OAuth 2.0 credentials

2. **Environment Variables**
   ```bash
   # .env.local
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_PHOTOS_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

### Connecting Your Google Account

1. Go to `/admin/settings/integrations`
2. Click "Connect Google Photos"
3. Authorize access to your photos
4. Select which albums to sync

---

## Import Tool Commands

### Single Album Import
```bash
npm run import:google-album -- --url="https://photos.google.com/share/..."
```

### Takeout Import
```bash
# Process a Google Takeout export
npm run import:google-takeout -- --path="/path/to/takeout-*.tgz"
```

### Sync Specific Album
```bash
npm run sync:google-album -- --album="ACT Farm 2025"
```

---

## Photo Organization

### Automatic Tagging
When importing, the system automatically:

- Extracts EXIF data (date, location, camera)
- Uses AI to detect faces and scenes
- Suggests tags based on content
- Groups by date/event

### Project Assignment

Photos can be assigned to projects during import:

```bash
npm run import:google-album -- \
  --url="https://photos.google.com/share/..." \
  --project="PICC Photo Kiosk"
```

Or assign after import in the Media Library.

### Storyteller Linking

Link photos to storytellers:

```bash
npm run import:google-album -- \
  --url="https://photos.google.com/share/..." \
  --storyteller="Benjamin Knight"
```

---

## Metadata Preservation

### What's Preserved
- ✓ Original filename
- ✓ Date taken (EXIF)
- ✓ GPS coordinates (if available)
- ✓ Camera/device info
- ✓ Google Photos description
- ✓ People tags (if face recognition enabled)

### What's Added
- Project association
- Storyteller link
- ACT organization context
- ALMA-aligned cultural tags
- Consent status tracking

---

## Storage Options

### Supabase Storage (Default)
- Direct upload to Supabase buckets
- Good for <10GB total
- Automatic CDN distribution

### External CDN (Recommended for Scale)
- Store originals in Google Cloud Storage / S3
- Use Supabase for metadata only
- Better for large archives

Configuration:
```bash
# .env.local
MEDIA_STORAGE_PROVIDER=gcs  # or 's3', 'supabase'
GCS_BUCKET_NAME=empathy-ledger-media
```

---

## Batch Import Workflow

For large collections (1000+ photos):

### Step 1: Export from Google
1. Request Google Takeout export
2. Select "Google Photos" only
3. Choose `.tgz` format
4. Wait for export (can take hours/days)

### Step 2: Process Locally
```bash
# Extract the takeout
tar -xzf takeout-*.tgz

# Preview what will be imported
npm run import:google-takeout -- --path="./Takeout" --dry-run

# Import with progress
npm run import:google-takeout -- --path="./Takeout" --batch-size=50
```

### Step 3: Review & Organize
1. Go to `/admin/compendium-media`
2. Filter by "Recently Imported"
3. Assign projects and tags
4. Link to storytellers

---

## Best Practices

### Before Import
- [ ] Organize Google Photos into albums first
- [ ] Remove duplicates in Google Photos
- [ ] Add descriptions to important photos
- [ ] Tag people in Google Photos (transfers over)

### During Import
- [ ] Import by album/project
- [ ] Use meaningful batch names
- [ ] Keep originals in Google Photos as backup

### After Import
- [ ] Review AI-generated tags
- [ ] Assign to appropriate projects
- [ ] Link to relevant storytellers
- [ ] Set visibility/consent status

---

## Troubleshooting

### "Rate limited by Google"
Wait 24 hours or use Takeout instead.

### "EXIF data missing"
Some phone photos don't have EXIF. Add metadata manually in Media Library.

### "Duplicates detected"
System uses hash matching. Review duplicates in `/admin/media/duplicates`.

### "Upload timeout"
For large files (>50MB), use the chunked uploader:
```bash
npm run import:chunked -- --file="large-video.mp4"
```

---

## API Reference

### Import Endpoint
```
POST /api/media/import/google
{
  "albumUrl": "https://photos.google.com/share/...",
  "projectId": "uuid",
  "storytellerId": "uuid",
  "tags": ["event", "2025"]
}
```

### Takeout Processing
```
POST /api/media/import/takeout
{
  "takeoutPath": "/path/to/Takeout",
  "batchSize": 50,
  "skipDuplicates": true
}
```

---

## Coming Soon

- [ ] Real-time Google Photos sync
- [ ] Automatic album mirroring
- [ ] Face recognition linking to storytellers
- [ ] Video processing pipeline
- [ ] Shared album collaboration

---

*For support: support@empathyledger.org*
