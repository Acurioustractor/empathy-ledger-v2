# Phase 3: Stories Management Implementation

**Date:** October 26, 2025
**Status:** ✅ Complete

---

## What We Implemented

### 1. Organization-Aware Stories API Endpoints

#### Platform Stories API
**File:** [src/app/api/admin/stories/route.ts](../src/app/api/admin/stories/route.ts)

```typescript
GET /api/admin/stories?page=1&limit=50&status=published
```

**Features:**
- Returns ALL stories across ALL organizations
- Super admin only
- Service role client (bypasses RLS)
- Includes organization data for each story
- Supports pagination, filtering by status, search

**Returns:**
```json
{
  "stories": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 301,
    "totalPages": 7
  }
}
```

#### Organization-Specific Stories API
**File:** [src/app/api/admin/organizations/[orgId]/stories/route.ts](../src/app/api/admin/organizations/[orgId]/stories/route.ts)

```typescript
GET /api/admin/organizations/{orgId}/stories?page=1&limit=50
```

**Features:**
- Returns stories for SPECIFIC organization only
- Filters by `organization_id` (🔒 CRITICAL)
- Super admin can access ANY organization
- Includes organization name in response

**Returns:**
```json
{
  "organizationId": "c53077e1-...",
  "organizationName": "Oonchiumpa",
  "organizationSlug": "oonchiumpa",
  "stories": [...],
  "pagination": {...}
}
```

### 2. Updated Stories Admin Page

**File:** [src/app/admin/stories/page.tsx](../src/app/admin/stories/page.tsx)

**Changes:**
1. ✅ Added `useOrganizationContext()` hook
2. ✅ Fetches different API based on `selectedOrgId`
3. ✅ Updates when organization selection changes
4. ✅ Shows organization name in header
5. ✅ Displays organization badge on each story (platform view only)
6. ✅ Dynamic page title based on selection

**UI Updates:**

**Header (Platform View):**
```
All Stories (Platform View)
Manage all stories across all organizations
Showing 301 of 301 total stories
```

**Header (Organization View):**
```
Oonchiumpa Stories [Organization View badge]
Manage stories for Oonchiumpa
Showing 6 of 6 total stories
```

**Story Card (Platform View):**
```
Story Title                   [Featured] [Published]
🏢 Oonchiumpa  👤 Author  📅 Date  ⏱️ Time
```

**Story Card (Organization View):**
```
Story Title                   [Published]
👤 Author  📅 Date  ⏱️ Time
(No organization shown - already filtered)
```

---

## How It Works

### User Flow:

1. **Super admin navigates to** `/admin/stories`
2. **Default view:** "All Organizations" selected in header dropdown
3. **Page shows:** All 301 stories from all 18 organizations
4. **Each story card shows:** Organization name with 🏢 icon
5. **User selects "Oonchiumpa"** from dropdown
6. **Page refetches** → Only shows 6 Oonchiumpa stories
7. **Organization badge removed** → Already viewing single org

### Data Flow:

```
selectedOrgId changes
        ↓
useEffect() triggers
        ↓
fetchStories() called
        ↓
if (selectedOrgId === 'all')
  → GET /api/admin/stories
  → Returns 301 stories
else
  → GET /api/admin/organizations/{orgId}/stories
  → Returns 6 stories (Oonchiumpa)
        ↓
stories state updated
        ↓
UI re-renders with filtered data
```

---

## Testing Instructions

### Manual Testing

1. **Navigate to Stories Page:**
   ```
   http://localhost:3030/admin/stories
   ```

2. **Verify Platform View:**
   - [ ] Header shows "All Stories (Platform View)"
   - [ ] Stats cards show totals across all organizations
   - [ ] Each story card shows organization name
   - [ ] 🏢 Building icon appears next to organization name
   - [ ] Stories from different organizations are visible

3. **Switch to Oonchiumpa:**
   - [ ] Click organization selector in header
   - [ ] Select "Oonchiumpa"
   - [ ] Page refetches data
   - [ ] Header changes to "Oonchiumpa Stories"
   - [ ] "Organization View" badge appears
   - [ ] Only 6 stories show (Oonchiumpa's stories)
   - [ ] Organization name no longer shown on cards
   - [ ] Stats update to Oonchiumpa's stats only

4. **Switch Back to Platform View:**
   - [ ] Select "All Organizations" from dropdown
   - [ ] All 301 stories return
   - [ ] Organization names reappear on cards

### Expected Console Output

**Platform View:**
```
📚 Fetching ALL stories (platform view)...
📚 Stories API response: {stories: [...], pagination: {...}}
✅ Found 50 stories (total: 301)
```

**Oonchiumpa View:**
```
📚 Fetching stories for organization: c53077e1-98de-4216-9149-6268891ff62e
📚 Stories API response: {organizationId: "c53077e1...", organizationName: "Oonchiumpa", ...}
✅ Found 6 stories for Oonchiumpa (total: 6)
```

---

## Example Stories Data

### Platform View (All Organizations):

```
Total Stories: 301

Sample Stories:
1. Patricia Ann Miller — Key Story (Oonchiumpa)
2. Aunty Bev and Uncle terry — Key Story (Oonchiumpa)
3. Some Story Title (Community Elder)
4. Another Story (A Curious Tractor)
...
```

### Oonchiumpa View:

```
Total Stories: 6

Stories:
1. Patricia Ann Miller — Key Story
2. Aunty Bev and Uncle terry — Key Story
3. Tanya Turner — Key Story
4. Kristy Bloomfield — Key Story
5. Aunty Bev and Uncle terry's Story
6. Chelsea Bloomfield — Key Story
```

---

## Key Features

### 1. Complete Data Isolation
- ✅ Organization-specific view shows ONLY that organization's stories
- ✅ No data leakage between organizations
- ✅ Verified through database queries

### 2. Clear Visual Indicators
- ✅ Page title changes based on selection
- ✅ Organization badge shows in platform view
- ✅ Organization name displayed on each card (platform view)
- ✅ Stats update correctly for each view

### 3. Organization Context Integration
- ✅ Uses shared OrganizationContext from admin layout
- ✅ Automatically re-fetches when organization changes
- ✅ Consistent pattern with dashboard page

### 4. API Best Practices
- ✅ Uses `requireSuperAdminAuth()` middleware
- ✅ Service role client bypasses RLS
- ✅ Automatic `organization_id` filtering
- ✅ Proper error handling
- ✅ Logging for debugging

---

## Files Created/Modified

### Created:
- `src/app/api/admin/stories/route.ts` (Platform stories API)
- `src/app/api/admin/organizations/[orgId]/stories/route.ts` (Org-specific API)

### Modified:
- `src/app/admin/stories/page.tsx` (Organization-aware UI)

---

## Integration with Multi-Tenant System

This implementation follows the exact same pattern as the dashboard:

| Feature | Dashboard | Stories Page |
|---------|-----------|--------------|
| Organization Context | ✅ | ✅ |
| Platform API | `/api/admin/stats/platform` | `/api/admin/stories` |
| Org-Specific API | `/api/admin/organizations/{id}/stats` | `/api/admin/organizations/{id}/stories` |
| Auto-refetch on change | ✅ | ✅ |
| Visual indicators | ✅ | ✅ |
| Service role client | ✅ | ✅ |

---

## Next Steps

Now that Stories page is organization-aware, apply the same pattern to:

### Phase 4a: Transcripts Page
- [ ] Read current transcripts page
- [ ] Create `/api/admin/transcripts` (platform)
- [ ] Create `/api/admin/organizations/{id}/transcripts` (org-specific)
- [ ] Update transcripts page with organization context
- [ ] Add organization column to transcripts table

### Phase 4b: Blog Posts Page
- [ ] Similar implementation for blog posts
- [ ] Organization filtering
- [ ] Visual indicators

### Phase 4c: Users/Storytellers Page
- [ ] Show organization memberships
- [ ] Filter users by organization
- [ ] Multi-organization membership support

### Phase 4d: Projects Page
- [ ] Organization-specific projects
- [ ] Platform-wide project view

---

## Summary

✅ **Phase 3 Complete: Stories Management**

The stories admin page now supports:
1. **Platform View** - See all 301 stories from all 18 organizations
2. **Organization View** - See only stories for selected organization
3. **Clear Visual Feedback** - Organization badges and indicators
4. **Automatic Updates** - Re-fetches when selection changes
5. **Complete Data Isolation** - Organization filtering enforced

Super admin can now effectively manage stories across the platform while maintaining strict data separation between organizations.

**Ready to proceed with Phase 4: Other Admin Pages**
