# Complete Storyteller Onboarding Workflow - Implementation Plan

## Vision

Organization admins can create a complete storyteller profile in one seamless flow, adding:
- ✅ Basic info (name, bio)
- 📸 Profile photo
- 📝 Transcript(s)
- 📍 Location
- 🎯 Project tags
- 🖼️ Gallery tags

**No email/phone required** - contact info can be added later. The system tracks who created the profile and when.

---

## User Experience Flow

### Step 1: Basic Information
```
┌─────────────────────────────────────┐
│  Create New Storyteller             │
├─────────────────────────────────────┤
│  Full Name *          [____________]│
│  Display Name         [____________]│
│  Bio                  [____________]│
│                       [____________]│
│                       [____________]│
│                                     │
│  [Cancel]           [Next: Photo →]│
└─────────────────────────────────────┘
```

### Step 2: Profile Photo (Optional)
```
┌─────────────────────────────────────┐
│  Add Profile Photo                  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │   [📷 Upload Photo]          │   │
│  │                              │   │
│  │   or drag & drop here        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Preview:                           │
│  ┌───────┐                          │
│  │ 👤    │  name.jpg                │
│  │  150KB│  [Remove]                │
│  └───────┘                          │
│                                     │
│  [← Back]  [Skip]  [Next: Location]│
└─────────────────────────────────────┘
```

### Step 3: Location (Optional)
```
┌─────────────────────────────────────┐
│  Add Location                       │
├─────────────────────────────────────┤
│  Search for location                │
│  [Brisbane, Queensland   🔍]        │
│                                     │
│  Suggestions:                       │
│  • Brisbane, Queensland, Australia  │
│  • Brisbane City                    │
│  • Greater Brisbane                 │
│                                     │
│  Selected: Brisbane, QLD            │
│  [Remove]                           │
│                                     │
│  [← Back]  [Skip]  [Next: Content →]│
└─────────────────────────────────────┘
```

### Step 4: Upload Transcript (Optional)
```
┌─────────────────────────────────────┐
│  Add Transcript                     │
├─────────────────────────────────────┤
│  Title                [____________]│
│  Source (optional)    [____________]│
│                                     │
│  Content *                          │
│  ┌─────────────────────────────┐   │
│  │ Paste transcript text here  │   │
│  │ or upload a file...         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Or upload file:                    │
│  [📄 Choose File (.txt, .docx, .pdf)]│
│                                     │
│  [← Back]  [Skip]  [Next: Tags →]  │
└─────────────────────────────────────┘
```

### Step 5: Tag Projects & Galleries (Optional)
```
┌─────────────────────────────────────┐
│  Tag Projects & Galleries           │
├─────────────────────────────────────┤
│  Projects                           │
│  ☐ Youth Leadership Program         │
│  ☑ Community Stories 2024           │
│  ☐ Elder Wisdom Project             │
│                                     │
│  Galleries                          │
│  ☑ Community Portraits              │
│  ☐ Cultural Heritage                │
│  ☐ Stories of Resilience            │
│                                     │
│  [← Back]  [Skip]  [Create Profile]│
└─────────────────────────────────────┘
```

### Step 6: Review & Create
```
┌─────────────────────────────────────┐
│  Review & Create                    │
├─────────────────────────────────────┤
│  ┌───────┐  Sarah Johnson           │
│  │ 👤    │  Community Leader         │
│  └───────┘                          │
│                                     │
│  Bio: Sarah has been working...     │
│  Location: Brisbane, QLD            │
│  Transcript: "My Journey" (1 file)  │
│                                     │
│  Tagged to:                         │
│  • Community Stories 2024           │
│  • Community Portraits              │
│                                     │
│  Created by: You                    │
│  Date: Oct 4, 2025                  │
│                                     │
│  [← Back]         [Create Profile ✓]│
└─────────────────────────────────────┘
```

---

## Technical Architecture

### Database Schema Updates

#### 1. Profiles Table (Already exists)
```sql
profiles:
  - id (uuid, PK)
  - full_name (text, required)
  - display_name (text)
  - bio (text)
  - email (text, nullable)
  - phone_number (text, nullable)
  - profile_image_url (text)
  - tenant_id (uuid)
  - tenant_roles (jsonb)
  - location_id (uuid, FK) -- NEW or EXISTS?
  - created_by (uuid, FK to profiles) -- ADD THIS
  - created_at (timestamp)
  - updated_at (timestamp)
```

#### 2. Transcripts Table (Exists)
```sql
transcripts:
  - id (uuid, PK)
  - storyteller_id (uuid, FK to profiles)
  - title (text)
  - content (text)
  - source (text)
  - tenant_id (uuid)
  - created_by (uuid, FK to profiles)
  - created_at (timestamp)
```

#### 3. Project Storytellers (Junction)
```sql
project_storytellers:
  - id (uuid, PK)
  - project_id (uuid, FK)
  - storyteller_id (uuid, FK)
  - added_by (uuid, FK to profiles)
  - added_at (timestamp)
```

#### 4. Gallery Media (Exists - link profile photos)
```sql
gallery_media:
  - id (uuid, PK)
  - gallery_id (uuid, FK)
  - media_id (uuid, FK)
  - profile_id (uuid, FK) -- Link to storyteller
  - added_by (uuid, FK)
  - added_at (timestamp)
```

### Component Architecture

#### Main Component
```
AddStorytellerWizard
├── Step1: BasicInfoForm
├── Step2: ProfilePhotoUpload
├── Step3: LocationPicker
├── Step4: TranscriptUpload
├── Step5: ProjectGalleryTagger
└── Step6: ReviewAndCreate
```

#### Shared Components to Build/Reuse
- **PhotoUploadManager** (already exists at `src/components/galleries/PhotoUploadManager.tsx`)
- **LocationPicker** (already exists at `src/components/ui/location-picker.tsx`)
- **TranscriptUploadForm** (need to create)
- **ProjectSelector** (create multi-select)
- **GallerySelector** (create multi-select)

---

## API Endpoints

### 1. Create Complete Storyteller Profile
```typescript
POST /api/organisations/[id]/storytellers/create-complete

Body: {
  // Step 1: Basic Info
  fullName: string
  displayName?: string
  bio?: string

  // Step 2: Photo (upload separately, then send media_id)
  profilePhotoId?: string

  // Step 3: Location
  locationId?: string

  // Step 4: Transcript
  transcript?: {
    title: string
    content: string
    source?: string
  }

  // Step 5: Tags
  projectIds?: string[]
  galleryIds?: string[]

  // System tracking
  createdBy: string // Current user's profile ID
}

Response: {
  success: true
  profile: { id, fullName, displayName, ... }
  transcript?: { id, title }
  projectLinks: number
  galleryLinks: number
}
```

### 2. Upload Profile Photo
```typescript
POST /api/media/upload

Body: FormData {
  file: File
  type: 'profile_photo'
  uploadedBy: string
}

Response: {
  success: true
  media: { id, url, thumbnailUrl }
}
```

### 3. Search/Create Location
```typescript
GET /api/locations/search?q=Brisbane
POST /api/locations/create { name, ... }
```

---

## Implementation Steps

### Phase 1: Core Wizard Structure (2-3 hours)
1. ✅ Create `AddStorytellerWizard` component
2. ✅ Implement step navigation (Next, Back, Skip)
3. ✅ State management for multi-step form
4. ✅ Progress indicator UI
5. ✅ Step 1: BasicInfoForm (already mostly done)

### Phase 2: Media Upload (2 hours)
1. ✅ Step 2: Integrate PhotoUploadManager
2. ✅ Handle photo upload to Supabase storage
3. ✅ Preview uploaded photo
4. ✅ Store media_id for profile creation

### Phase 3: Location (1 hour)
1. ✅ Step 3: Integrate existing LocationPicker
2. ✅ Handle location selection
3. ✅ Store location_id

### Phase 4: Transcript Upload (2-3 hours)
1. ✅ Step 4: Create TranscriptUploadForm
2. ✅ Support text paste AND file upload
3. ✅ Parse .txt, .docx, .pdf files
4. ✅ Preview transcript content
5. ✅ Character/word count display

### Phase 5: Tagging (2 hours)
1. ✅ Step 5: Create ProjectSelector (multi-select)
2. ✅ Fetch organization's projects
3. ✅ Create GallerySelector (multi-select)
4. ✅ Fetch organization's galleries
5. ✅ Show selected tags

### Phase 6: Review & Submit (1 hour)
1. ✅ Step 6: Display all collected data
2. ✅ Allow edit (go back to specific step)
3. ✅ Submit button
4. ✅ Loading state during creation

### Phase 7: Backend API (3-4 hours)
1. ✅ Create comprehensive API endpoint
2. ✅ Transaction handling (all or nothing)
3. ✅ Create profile with generated UUID
4. ✅ Upload transcript (if provided)
5. ✅ Create project_storytellers entries
6. ✅ Create gallery_media entries
7. ✅ Set created_by and timestamps
8. ✅ Return complete result

### Phase 8: Audit Trail (1 hour)
1. ✅ Add created_by field to profiles (if not exists)
2. ✅ Track who created each storyteller
3. ✅ Display creator info in profile view
4. ✅ Add "Created by X on DATE" to UI

### Phase 9: Polish & Testing (2 hours)
1. ✅ Error handling at each step
2. ✅ Validation feedback
3. ✅ Success animations
4. ✅ Mobile responsive design
5. ✅ Test all scenarios (skip steps, full flow, etc.)

**Total Estimated Time: 15-18 hours**

---

## Key Features

### 1. **Progressive Enhancement**
- Each step is optional except basic info
- Can skip steps and come back later
- Can add/edit info after profile creation

### 2. **Audit Trail**
- Tracks who created the profile
- Tracks who added transcripts
- Tracks who tagged to projects/galleries
- Timestamp everything

### 3. **Flexible Workflow**
- No email/phone required initially
- Can be added later by admin or storyteller
- Focus on content first, contact later

### 4. **Batch Operations**
- Can tag to multiple projects at once
- Can tag to multiple galleries at once
- Efficient for organizing large sets

### 5. **Data Integrity**
- All creates happen in transaction
- Rollback if any step fails
- Validate at each step

---

## Database Queries Needed

### Check for existing fields:
```sql
-- Does profiles have created_by?
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'created_by';

-- Does profiles have location_id?
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'location_id';

-- Does project_storytellers table exist?
SELECT table_name FROM information_schema.tables
WHERE table_name = 'project_storytellers';
```

### Add if missing:
```sql
-- Add created_by to profiles
ALTER TABLE profiles ADD COLUMN created_by UUID REFERENCES profiles(id);

-- Add created_by to transcripts
ALTER TABLE transcripts ADD COLUMN created_by UUID REFERENCES profiles(id);

-- Create project_storytellers if needed
CREATE TABLE project_storytellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant',
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, storyteller_id)
);
```

---

## Success Metrics

After implementation, admins can:
- ✅ Create full storyteller profile in < 5 minutes
- ✅ Add profiles without email/phone (contact later)
- ✅ Upload and organize content immediately
- ✅ Tag to projects/galleries in one flow
- ✅ Track who created each profile
- ✅ See complete audit trail

---

## Future Enhancements

1. **Bulk Import**: CSV upload for multiple storytellers
2. **Template Profiles**: Save common configurations
3. **Quick Actions**: Duplicate profile for similar storytellers
4. **AI Assistance**: Auto-generate bio from transcript
5. **Workflow States**: Draft → Review → Published
6. **Notifications**: Alert storyteller when profile created (if email known)
7. **Mobile App**: Capture stories in the field

---

## Next Steps

1. **Review this plan** - get approval on workflow
2. **Database audit** - check what fields/tables exist
3. **Start Phase 1** - build wizard structure
4. **Iterative development** - one phase at a time
5. **User testing** - validate UX with real admins

**Ready to start? Let me know and I'll begin with the database audit!**
