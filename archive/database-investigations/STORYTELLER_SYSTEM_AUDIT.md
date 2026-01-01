# Storyteller Creation System - Comprehensive Audit & Integration Plan

## Current State Analysis

### Existing Storyteller Creation Flows

#### 1. **Public Storyteller Self-Registration**
**Location**: `/storytellers/create`
**User**: Anyone can create their own profile
**Features**:
- Rich cultural background selection
- Storytelling styles (oral, digital, performance, etc.)
- Preferred topics and specialties
- Elder designation
- Very comprehensive form with ~15 fields

**Assessment**: ⭐⭐⭐⭐⭐ Excellent for self-service
**Issue**: Too complex for admin to fill out for someone else

---

#### 2. **Admin Storyteller Creation**
**Location**: `/admin/storytellers/create`
**User**: Admin users only
**Features**:
- Basic fields only (name, email, bio)
- Simple organization assignment
- Quick creation focused
- Generates email if not provided

**Assessment**: ⭐⭐⭐ Good for quick admin entry
**Issue**: Very basic, no photo/transcript/tagging capability

---

#### 3. **Transcript Creation (Separate)**
**Location**: `/transcripts/create`
**User**: Admin users
**Features**:
- Requires existing storyteller (dropdown)
- Title, content, source URL
- Status tracking
- Connects to AI processing

**Assessment**: ⭐⭐⭐⭐ Good functionality
**Issue**: Requires storyteller to exist first (2-step process)

---

### Existing Components Inventory

#### ✅ **Already Built - Can Reuse**

1. **PhotoUploadManager**
   - `src/components/galleries/PhotoUploadManager.tsx`
   - Full photo upload with drag & drop
   - Supabase storage integration
   - Thumbnail generation
   - **Status**: Production ready ✅

2. **LocationPicker**
   - `src/components/ui/location-picker.tsx`
   - Search locations
   - Autocomplete
   - **Status**: Production ready ✅

3. **ProfileDashboard**
   - `src/components/profile/ProfileDashboard.tsx`
   - Shows profile info
   - Can extract photo upload pattern
   - **Status**: Reference material ✅

4. **AI Processing Pipeline**
   - `src/lib/inngest/functions/process-transcript.ts`
   - Automatic transcript analysis
   - Theme extraction
   - Quote extraction
   - Summary generation
   - **Status**: Production ready ✅
   - **Trigger**: Inngest event `transcript/process`

---

### AI Integration - How It Works Now

#### Transcript Analysis Workflow
```
1. Transcript created → transcripts table
2. Inngest event triggered: { event: 'transcript/process', data: { transcriptId } }
3. Background job runs (process-transcript.ts):
   - Fetch transcript
   - Run hybrid analyzer (patterns + LLM)
   - Extract themes (stored in transcript.metadata.analysis.themes)
   - Extract quotes (stored in transcript_quotes table)
   - Generate summary
   - Update status to 'analysed'
4. Real-time updates via Supabase subscriptions
```

#### What Gets Analyzed
- **Themes**: Cultural markers, topics, emotional arcs
- **Quotes**: Key phrases, wisdom, impactful statements
- **Summary**: AI-generated overview
- **Impact**: Community leadership, healing, knowledge transmission scores
- **Connections**: Cross-storyteller relationship detection

#### API Endpoints
- `POST /api/transcripts/[id]/analyze` - Manual trigger
- Inngest webhook at `/api/inngest` - Background processing

---

## Integration Challenges & Solutions

### Challenge 1: Multiple Entry Points
**Problem**: 3 different ways to create storytellers, inconsistent UX

**Solution**: Create **unified creation component** that adapts to context:
```typescript
<StorytellerCreationWizard
  mode="admin-quick" | "admin-complete" | "self-register"
  organizationId={orgId}
  onComplete={(profile) => { ... }}
/>
```

### Challenge 2: Transcript Requires Existing Storyteller
**Problem**: Current flow = Create storyteller → Navigate away → Create transcript separately

**Solution**: Wizard allows transcript upload **during** profile creation
- Same transaction
- Auto-triggers AI analysis
- No navigation needed

### Challenge 3: Photo Upload Separate from Profile
**Problem**: Photos live in galleries, not directly on profiles

**Solution**:
```typescript
// Upload photo
POST /api/media/upload → media_id

// Link to profile
profile.profile_image_url = media.url
profile.avatar_media_id = media.id

// Optionally add to gallery too
```

### Challenge 4: AI Processing Async
**Problem**: Analysis happens in background, user doesn't see immediate results

**Solution**:
- Show "Processing..." state
- Real-time updates via Supabase subscriptions
- Success notification when analysis completes
- Preview mode: Show transcript immediately, analysis results later

---

## Recommended System Architecture

### Option A: **Context-Aware Single Wizard** (RECOMMENDED)

```
StorytellerCreationWizard/
├── modes/
│   ├── AdminQuickMode.tsx       (2 steps: Basic + Review)
│   ├── AdminCompleteMode.tsx    (6 steps: Full workflow)
│   └── SelfRegisterMode.tsx     (Existing /storytellers/create)
├── shared-steps/
│   ├── BasicInfoStep.tsx
│   ├── PhotoUploadStep.tsx
│   ├── LocationStep.tsx
│   ├── TranscriptStep.tsx
│   ├── TaggingStep.tsx
│   └── ReviewStep.tsx
└── StorytellerCreationWizard.tsx (Main orchestrator)
```

**Benefits**:
- ✅ Single component to maintain
- ✅ Consistent UX across contexts
- ✅ Share validation logic
- ✅ Easier to add features globally

**Usage**:
```tsx
// In organization admin area
<StorytellerCreationWizard
  mode="admin-complete"
  organizationId={orgId}
  requiredSteps={['basic', 'photo', 'transcript', 'tagging']}
/>

// Quick add from anywhere
<StorytellerCreationWizard
  mode="admin-quick"
  organizationId={orgId}
  requiredSteps={['basic']}
/>

// Self-registration
<StorytellerCreationWizard
  mode="self-register"
  requiredSteps={['basic', 'cultural-info']}
/>
```

---

### Option B: Separate Components (NOT RECOMMENDED)
Keep existing separate pages, duplicate logic
**Issues**: Maintenance nightmare, inconsistent UX

---

## Scoping & Permissions

### Who Can Create Storytellers?

#### 1. **Organization Admins** ✅
- Full access to complete wizard
- Can create for their organization
- Can upload photos, transcripts
- Can tag to their projects/galleries
- **Permission**: `organization_member` with role `admin` or `member`

#### 2. **Platform Admins** ✅
- Can create for any organization
- Full wizard access
- **Permission**: `is_admin: true` or tenant_roles includes `admin`

#### 3. **Self-Registration** ✅
- Public users can create own profile
- Simplified wizard (no tagging to orgs)
- Can add cultural info
- **Permission**: Anyone (public)

#### 4. **Gallery Managers** 🤔
- Should they be able to create storytellers?
- **Recommendation**: No, but can **tag existing** storytellers to galleries

---

## Data Flow & Supabase Integration

### Complete Creation Flow

```
User completes wizard
        ↓
POST /api/organisations/[id]/storytellers/create-complete
        ↓
┌─────────────────────────────────────────────┐
│ Transaction Start                           │
│                                             │
│ 1. Create profile (with created_by)        │
│    - Generate UUID                          │
│    - Insert into profiles table             │
│    - Set tenant_id, tenant_roles            │
│                                             │
│ 2. Upload photo (if provided)              │
│    - Upload to Supabase Storage             │
│    - Create media_assets record             │
│    - Link to profile                        │
│                                             │
│ 3. Link location (if provided)             │
│    - Update profile.location_id             │
│                                             │
│ 4. Create transcript (if provided)         │
│    - Insert into transcripts table          │
│    - Set storyteller_id                     │
│    - Set created_by                         │
│                                             │
│ 5. Tag to projects (if any)                │
│    - Insert into project_storytellers       │
│    - Set added_by, added_at                 │
│                                             │
│ 6. Tag to galleries (if any)               │
│    - Insert into gallery_media              │
│    - Link profile photo                     │
│    - Set added_by                           │
│                                             │
│ Transaction Commit                          │
└─────────────────────────────────────────────┘
        ↓
If transcript created:
  Trigger Inngest event: 'transcript/process'
        ↓
  Background AI analysis starts
        ↓
  Real-time updates via Supabase subscriptions
```

### Error Handling
- Any step fails → Rollback entire transaction
- User sees clear error message
- Can retry or save draft

---

## AI Analysis Integration

### When Transcript Uploaded

#### Immediate Actions
1. Save transcript to database
2. Return success to user
3. Show "Analyzing..." badge

#### Background (Inngest)
```typescript
// In create API after transcript insert:
await inngest.send({
  name: 'transcript/process',
  data: {
    transcriptId: newTranscript.id,
    storytellerId: profile.id,
    organizationId: organizationId
  }
})
```

#### What Gets Analyzed
- **Themes**: Automatically extracted
- **Quotes**: Key phrases identified
- **Summary**: AI-generated overview
- **Impact Scores**: Leadership, healing, knowledge transmission
- **Cultural Markers**: Indigenous concepts, place names

#### User Sees Results
- Real-time notification when analysis completes
- Themes appear on profile
- Quotes available for browsing
- Summary displayed

---

## Unified UX Design Principles

### 1. **Progressive Disclosure**
- Start simple (name only)
- Progressively add more detail
- Never overwhelming

### 2. **Contextual Defaults**
- Auto-fill organization from context
- Pre-select current user's tenant
- Smart suggestions based on existing data

### 3. **Consistent Patterns**
- Same photo upload UX everywhere
- Same location picker everywhere
- Same tagging UI everywhere

### 4. **Forgiving Workflow**
- Can skip optional steps
- Can go back and edit
- Can save draft and finish later

### 5. **Clear Feedback**
- Loading states
- Success confirmations
- Error messages with recovery options
- Real-time AI processing status

---

## Implementation Recommendations

### Phase 1: Refactor Existing (Week 1)
1. ✅ Extract shared components from existing flows
2. ✅ Create unified StorytellerCreationWizard shell
3. ✅ Implement mode switching logic
4. ✅ Keep existing pages as wrappers around new wizard

### Phase 2: Complete Wizard for Org Admins (Week 2)
1. ✅ Build admin-complete mode (6 steps)
2. ✅ Integrate PhotoUploadManager
3. ✅ Integrate LocationPicker
4. ✅ Build TranscriptUploadStep
5. ✅ Build TaggingStep (projects + galleries)
6. ✅ Create complete API endpoint

### Phase 3: AI Integration (Week 3)
1. ✅ Wire up Inngest trigger on transcript creation
2. ✅ Add real-time subscription for analysis updates
3. ✅ Build "Processing..." UI
4. ✅ Show analysis results when complete

### Phase 4: Polish & Optimization (Week 4)
1. ✅ Add draft saving
2. ✅ Improve mobile UX
3. ✅ Add keyboard shortcuts
4. ✅ Performance optimization
5. ✅ User testing & feedback

---

## Decision Points Needed

### 1. Contact Info Required?
**Current**: Email/phone required
**Proposed**: Optional, can be added later

**✅ APPROVED**: No contact required initially

---

### 2. Who Can Access Complete Wizard?
**Options**:
- A) Only org admins in org admin area
- B) Org admins + platform admins anywhere
- C) Anyone with storyteller creation permission

**Recommendation**: Option B

---

### 3. Draft Saving Strategy?
**Options**:
- A) LocalStorage (client-side, simple)
- B) Database drafts table (persistent, complex)
- C) No drafts (must complete in one session)

**Recommendation**: Option A for MVP, Option B later

---

### 4. AI Processing Blocking?
**Options**:
- A) Wait for analysis before showing profile (slow but complete)
- B) Create profile immediately, analyze in background (fast but incomplete)

**Recommendation**: Option B (existing behavior)

---

### 5. Migration Strategy?
**Options**:
- A) Keep existing pages, add new complete wizard
- B) Replace all with unified wizard
- C) Gradual migration page by page

**Recommendation**: Option C (safest)

---

## Success Metrics

### Quantitative
- ⏱️ Time to create complete profile: < 5 minutes
- 📊 Completion rate: > 80%
- 🔄 Steps skipped on average: ~2
- ✅ Profiles with photos: > 60%
- 📝 Profiles with transcripts: > 40%

### Qualitative
- ✅ Admins report it's "easy to use"
- ✅ No confusion about which creation flow to use
- ✅ AI analysis results are valuable
- ✅ Tagging workflow is intuitive

---

## Next Steps

1. **Decision required**: Approve recommended architecture (Option A)
2. **Database audit**: Check for missing fields (created_by, etc.)
3. **Start Phase 1**: Extract shared components
4. **Design review**: Finalize 6-step wizard UI
5. **Begin implementation**: Week 1 goals

**Ready to proceed with unified wizard approach?**
