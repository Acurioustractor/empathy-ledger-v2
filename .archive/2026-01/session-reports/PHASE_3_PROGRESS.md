# Phase 3: Unified Publishing Interface - 70% Complete

## ✅ Completed

### 1. UnifiedContentFields Component
**File:** `src/components/stories/UnifiedContentFields.tsx` (470 lines)

**Features:**
- ✅ Article type selector (9 types: story, story_feature, program_spotlight, etc.)
- ✅ SEO fields (meta_title, meta_description, custom slug)
- ✅ Tags & themes input
- ✅ Super-admin org selector (publish to any org)
- ✅ Syndication controls (ACT sites checkboxes)
- ✅ Social media placeholders (Phase 4)
- ✅ Import metadata display (Webflow/WordPress imports)

### 2. Admin Navigation Updated
**File:** `src/components/admin/AdminNavigation.tsx`

**Changes:**
- ✅ Stories renamed to "Content & Stories"
- ✅ Description updated: "All content: stories, articles, and editorial"
- ✅ No separate Articles link (already consolidated)

### 3. All Article API Routes Updated
**Files Updated to Query Stories Table:**
- ✅ `/api/admin/articles/route.ts` (list articles)
- ✅ `/api/admin/articles/[id]/route.ts` (get/update/delete)
- ✅ `/api/admin/articles/[id]/publish/route.ts` (publish)
- ✅ `/api/admin/articles/[id]/schedule/route.ts` (schedule)
- ✅ `/api/admin/articles/[id]/submit-review/route.ts` (review workflow)

**All routes now:**
- Query `stories` table instead of `articles`
- Map `visibility` ↔ `cultural_permission_level`
- Support both `content` and `story_copy` fields

---

## ⏳ Remaining (30%)

### 1. Integrate UnifiedContentFields into Story Editor
**Target:** `src/app/stories/create/page.tsx`

**Steps:**
1. Import `UnifiedContentFields` component
2. Add to form (as new tab or section)
3. Wire up formData state
4. Handle super-admin org selector
5. Test article type switching

### 2. Add to Admin Story Editor
**Target:** `src/app/admin/stories/[id]/page.tsx`

**Steps:**
1. Add UnifiedContentFields to admin editor
2. Enable super-admin features
3. Test syndication controls

### 3. Testing
- [ ] Create story with article_type
- [ ] Toggle syndication destinations
- [ ] Test super-admin org selector
- [ ] Verify SEO fields save correctly
- [ ] Test imported content display

---

## 📊 What's Working Now

### API Layer
✅ All article endpoints query stories table
✅ Field mapping handles camelCase ↔ snake_case
✅ Backward compatibility maintained

### Components
✅ UnifiedContentFields component ready
✅ All props typed and documented
✅ Responsive design with shadcn/ui

### Features Available
✅ Article type selection (9 types)
✅ SEO optimization fields
✅ Multi-site syndication (ACT ecosystem)
✅ Super-admin cross-org publishing
✅ Import metadata display

---

## 🎯 Integration Pattern

```typescript
// In story create/edit page
import UnifiedContentFields from '@/components/stories/UnifiedContentFields'

// Add to form
<UnifiedContentFields
  formData={formData}
  onChange={handleChange}
  isSuperAdmin={isSuperAdmin}
  organizations={organizations}
  currentOrgId={currentOrgId}
/>

// Handle field changes
function handleChange(field: string, value: any) {
  setFormData(prev => ({ ...prev, [field]: value }))
}

// Process before submit
const processedData = {
  ...formData,
  tags: formData.tags_input?.split(',').map(t => t.trim()) || [],
  themes: formData.themes_input?.split(',').map(t => t.trim()) || [],
  syndication_destinations: formData.syndication_destinations || []
}
```

---

## 🔑 Key Decisions Made

1. **No Separate Article Editor** - UnifiedContentFields extends story editor
2. **Article Type = null** - Regular stories have article_type = null
3. **SEO Fields Conditional** - Only show when article_type is set
4. **Syndication Default** - Enabled by default, user can disable
5. **Super-Admin UX** - Org selector only visible to super-admins

---

## 📝 Next Steps

1. **Import into Story Editor** (15 min)
   - Add UnifiedContentFields to create page
   - Test basic functionality

2. **Wire Up State** (10 min)
   - Connect formData
   - Handle onChange events

3. **Test End-to-End** (15 min)
   - Create article-type story
   - Enable syndication
   - Verify saves correctly

4. **Document Complete** (5 min)
   - Update PHASE_3_COMPLETE.md
   - Update SESSION_STATE.md

---

## 🎉 Phase 3 Achievement Unlocked

**Before:**
- Stories and articles in separate tables
- Different editors
- Limited syndication
- No cross-org publishing

**Now:**
- ✅ Single stories table
- ✅ Unified component (ready to integrate)
- ✅ Multi-site syndication controls
- ✅ Super-admin cross-org powers
- ✅ All API routes updated

**Total Progress: 40% → 60%** (Phase 1: 100%, Phase 2: 100%, Phase 3: 70%)
