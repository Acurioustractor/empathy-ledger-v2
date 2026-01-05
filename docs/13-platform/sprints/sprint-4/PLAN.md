# Sprint 4: Storyteller Tools - Implementation Plan

**Dates:** February 17-28, 2026 (10 working days)
**Theme:** Storytellers can create and manage their stories
**Goal:** Empower storytellers with intuitive, culturally-safe story creation tools

---

## Components to Build (35+ components)

### 1. Story Editor (10 components)
- **StoryEditorPage.tsx** - Main editor container with autosave
- **RichTextEditor.tsx** - TipTap-based rich text editor with formatting
- **EditorToolbar.tsx** - Formatting toolbar (bold, italic, headings, lists, etc.)
- **MediaInsertButton.tsx** - Insert media into story content
- **StoryMetadataPanel.tsx** - Title, excerpt, featured image
- **CulturalProtocolsSelector.tsx** - Select cultural protocols/warnings
- **PrivacySettingsPanel.tsx** - Who can view this story
- **SensitivityLevelSelector.tsx** - Public/Sensitive/Sacred content levels
- **TagsInput.tsx** - Cultural tags, themes input
- **EditorPreview.tsx** - Side-by-side or fullscreen preview

### 2. Media Management (8 components)
- **MediaLibrary.tsx** - Grid view of all storyteller's media
- **MediaUploader.tsx** - Drag-and-drop multi-file uploader
- **MediaUploadProgress.tsx** - Upload progress with thumbnails
- **MediaEditor.tsx** - Edit metadata, crop, cultural tags
- **MediaSelector.tsx** - Select media for story
- **MediaGrid.tsx** - Grid display with filters
- **MediaDetails.tsx** - Full metadata editor
- **MediaDelete.tsx** - Delete confirmation with warnings

### 3. Draft Management (6 components)
- **DraftsList.tsx** - List all drafts with filters
- **DraftCard.tsx** - Draft preview card
- **DraftFilters.tsx** - Filter by status, date, type
- **VersionHistory.tsx** - Show story versions
- **VersionCompare.tsx** - Side-by-side version comparison
- **RestoreVersion.tsx** - Restore previous version

### 4. Publishing Workflow (7 components)
- **PublishingWizard.tsx** - Multi-step publishing flow
- **PublishingChecklist.tsx** - Pre-publish validation
- **PreviewModal.tsx** - Full story preview before publish
- **SchedulePublish.tsx** - Schedule future publish
- **PublishConfirmation.tsx** - Final confirmation with OCAP reminder
- **UnpublishDialog.tsx** - Unpublish with reason
- **ArchiveDialog.tsx** - Archive story

### 5. Collaboration (4 components)
- **CollaboratorsList.tsx** - Show all collaborators
- **InviteCollaborator.tsx** - Invite by email/username
- **CollaboratorPermissions.tsx** - Set permissions (view/edit/publish)
- **CollaborationActivity.tsx** - Recent collaboration activity

---

## APIs to Build (20+ endpoints)

### Story Management
```
POST   /api/stories/create              # Create new story draft
GET    /api/stories/drafts              # Get all user's drafts
GET    /api/stories/[id]/edit           # Get story for editing
PATCH  /api/stories/[id]                # Update story (autosave)
POST   /api/stories/[id]/publish        # Publish story
POST   /api/stories/[id]/unpublish      # Unpublish story
POST   /api/stories/[id]/archive        # Archive story
DELETE /api/stories/[id]                # Delete story (soft delete)
```

### Media Management
```
POST   /api/media/upload                # Upload media file
GET    /api/media/library               # Get user's media library
PATCH  /api/media/[id]                  # Update media metadata
DELETE /api/media/[id]                  # Delete media
POST   /api/media/bulk-upload           # Bulk upload multiple files
```

### Versioning
```
GET    /api/stories/[id]/versions       # Get version history
POST   /api/stories/[id]/versions       # Create new version
POST   /api/stories/[id]/restore        # Restore to version
```

### Collaboration
```
GET    /api/stories/[id]/collaborators  # Get collaborators
POST   /api/stories/[id]/collaborators  # Invite collaborator
PATCH  /api/collaborators/[id]          # Update permissions
DELETE /api/collaborators/[id]          # Remove collaborator
```

### Validation
```
POST   /api/stories/[id]/validate       # Validate before publish
POST   /api/stories/[id]/preview        # Generate preview
```

---

## Database Schema Additions

### story_versions table
```sql
CREATE TABLE story_versions (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  version_number INTEGER,
  title TEXT,
  content TEXT,
  metadata JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  restored_from UUID REFERENCES story_versions(id)
);
```

### story_collaborators table
```sql
CREATE TABLE story_collaborators (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  collaborator_id UUID REFERENCES profiles(id),
  invited_by UUID REFERENCES profiles(id),
  role TEXT, -- 'viewer', 'editor', 'co-author'
  can_edit BOOLEAN,
  can_publish BOOLEAN,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  status TEXT -- 'pending', 'accepted', 'declined'
);
```

### media_library table (enhance existing media_assets)
```sql
ALTER TABLE media_assets ADD COLUMN:
- uploader_id UUID REFERENCES profiles(id),
- upload_status TEXT, -- 'uploading', 'processing', 'ready', 'failed'
- file_size INTEGER,
- duration INTEGER, -- for audio/video
- width INTEGER, -- for images/video
- height INTEGER,
- cultural_sensitivity TEXT,
- usage_count INTEGER
```

---

## Design Patterns

### Editor Layout
```
┌─────────────────────────────────────────────────────┐
│ [Back to Stories] Story Title          [Save] [•••] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐│
│  │                  │  │                          ││
│  │  Left Sidebar    │  │   Main Editor            ││
│  │  - Metadata      │  │   - Rich Text            ││
│  │  - Settings      │  │   - Media                ││
│  │  - Media Library │  │   - Preview              ││
│  │  - Versions      │  │                          ││
│  │                  │  │                          ││
│  └──────────────────┘  └──────────────────────────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Publishing Workflow
```
Draft → Review → Cultural Check → Preview → Publish
  ↓       ↓            ↓             ↓         ↓
[Edit] [Metadata] [Protocols]   [Preview]  [Live]
```

---

## Cultural Safety Features

### 1. Pre-Publish Checklist
- [ ] Cultural protocols selected
- [ ] Sensitivity level set
- [ ] Appropriate warnings added
- [ ] Media properly attributed
- [ ] Privacy settings reviewed
- [ ] OCAP principles honored

### 2. Elder Review (Optional)
- Stories marked "Sacred" require Elder approval
- Submit to Elder review queue
- Elder can approve/request changes/reject
- Notification system for review status

### 3. Content Warnings
- Automatic suggestions based on content analysis
- Manual override available
- Required for sensitive content

### 4. Attribution & Consent
- Require attribution for all media
- Consent forms for featured individuals
- Cultural knowledge attribution

---

## User Flows

### Creating a New Story

1. **Start:** Click "Create Story" from dashboard
2. **Choose Type:** Text, Audio, Video, Mixed
3. **Editor:** Rich text editor opens with blank canvas
4. **Autosave:** Every 30 seconds, saves to drafts
5. **Add Media:** Upload or select from library
6. **Metadata:** Set title, excerpt, tags, cultural info
7. **Preview:** See how it will look published
8. **Publish:** Complete checklist, set privacy, publish

### Editing an Existing Story

1. **Select:** Choose story from "My Stories"
2. **Edit:** Opens in editor with current content
3. **Version:** Creates new version on first edit
4. **Save:** Manual save or autosave
5. **Preview:** Preview changes before saving
6. **Update:** Save changes (stays published) or unpublish

### Collaborating

1. **Invite:** Enter collaborator email/username
2. **Permissions:** Set view/edit/publish permissions
3. **Notify:** Collaborator receives invitation
4. **Accept:** Collaborator accepts invitation
5. **Collaborate:** Both can edit (with conflict resolution)
6. **Activity:** See who changed what

---

## Technical Implementation

### Rich Text Editor: TipTap
```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

const editor = useEditor({
  extensions: [StarterKit, Image, Link],
  content: initialContent,
  onUpdate: ({ editor }) => {
    autosave(editor.getHTML())
  }
})
```

### Autosave Pattern
```tsx
const [content, setContent] = useState('')
const [lastSaved, setLastSaved] = useState(null)
const [saving, setSaving] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft(content)
  }, 30000) // 30 seconds

  return () => clearTimeout(timer)
}, [content])
```

### Media Upload with Progress
```tsx
const uploadMedia = async (files: File[]) => {
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress.loaded / progress.total
        }))
      }
    })
  }
}
```

---

## Accessibility

- **Keyboard Shortcuts:** Ctrl+S (save), Ctrl+P (preview), Ctrl+Shift+P (publish)
- **Focus Management:** Proper focus trapping in dialogs
- **Screen Reader:** All buttons and inputs labeled
- **High Contrast:** Support for high contrast mode
- **Font Scaling:** Respects user font size preferences

---

## Success Criteria

- [ ] Storytellers can create new stories in < 2 minutes
- [ ] Autosave prevents data loss
- [ ] Media upload supports drag-and-drop
- [ ] Preview accurately shows published appearance
- [ ] Publishing workflow guides cultural safety
- [ ] Collaboration invites work seamlessly
- [ ] Version history tracks all changes
- [ ] All components follow Editorial Warmth design
- [ ] Fully responsive on mobile/tablet
- [ ] WCAG 2.1 AA compliant

---

## Timeline (10 days)

### Days 1-3: Story Editor
- Rich text editor with toolbar
- Autosave functionality
- Metadata panel
- Cultural protocols selector

### Days 4-5: Media Management
- Media library
- Upload with progress
- Media editor
- Media selector for stories

### Days 6-7: Publishing Workflow
- Publishing wizard
- Preview modal
- Validation checklist
- Schedule publish

### Days 8-9: Drafts & Versions
- Drafts list
- Version history
- Version comparison
- Restore version

### Day 10: Collaboration
- Invite collaborators
- Set permissions
- Collaboration activity

---

## Dependencies

### npm packages to install
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
npm install react-dropzone
npm install date-fns
npm install react-diff-viewer
```

---

**Ready to build Sprint 4!** 🚀
