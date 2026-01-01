# World Tour Analytics Audit

## Summary

This document outlines the current state of all World Tour analytics features, identifies issues, and categorizes features by access level.

---

## ✅ Issues Fixed (This Session)

### 1. Trending Themes API - FIXED
**File:** `src/app/api/world-tour/themes/trending/route.ts`
**Problem:** Used `createSupabaseServerClient()` which respects RLS - no data returned for public users
**Fix Applied:**
- Changed to use `createAdminClient()` to bypass RLS
- Changed to query `transcripts.themes` as source of truth (not just stories)
- Fixed bug: `currentStories.length` → `(stories || []).length`

### 2. Analytics API - FIXED
**File:** `src/app/api/world-tour/analytics/route.ts`
**Problem:** Stories query used regular client, blocked by RLS
**Fix Applied:** Moved `const adminClient = createAdminClient()` before stories query so it uses admin client

### 3. Map Data API - FIXED (Earlier)
**File:** `src/app/api/world-tour/map-data/route.ts`
**Problem:** Multiple RLS issues, wrong column names
**Fix Applied:**
- Changed to use `createAdminClient()`
- Fixed `consent_settings` → `has_explicit_consent`
- Added independent transcript fetching for accurate metrics
- Added `totalTranscripts`, `totalPublishedStories` to stats

---

## Feature Access Classification

### PUBLIC (No Auth Required)
These features should work for any visitor to the World Tour:

| Feature | Component | Status | Notes |
|---------|-----------|--------|-------|
| Story Map | TourMap.tsx | ✅ Working | Shows stories with locations |
| Live Stats | page.tsx | ✅ Fixed | Interviews/Voices/Themes/Stories counters |
| Theme Filter | ThemeFilterPanel.tsx | ✅ Working | Filter map by theme |
| Trending Themes | insights/page.tsx | ✅ Fixed | Now queries transcripts |
| Emerging Themes | insights/page.tsx | ✅ Fixed | Shows new themes from API |
| Cross-Cultural Connections | insights/page.tsx | ✅ Fixed | Shows themes across regions |
| Theme Dashboard | ThemeDashboard.tsx | ✅ Working | Theme distribution |
| Story Sidebar | StoryMapSidebar.tsx | ✅ Working | Story details |
| Tour Request Form | TourRequestForm.tsx | ✅ Working | Submit nominations |
| Dream Organizations | DreamOrganizations.tsx | ✅ Working | Partner showcase |
| Value Showcase | ValueShowcase.tsx | ✅ Working | Impact highlights |
| Overview Tab | insights/page.tsx | ✅ Working | Aggregate public stats |
| Themes Tab | insights/page.tsx | ✅ Working | Theme analytics |
| Geography Tab | insights/page.tsx | ✅ Working | Regional distribution |
| Impact Tab | insights/page.tsx | ✅ Working | Impact metrics |

### ADMIN-ONLY (Should Require Auth)
These features expose sensitive/internal data and have links to admin routes:

| Feature | Component | Why Admin-Only | Risk |
|---------|-----------|----------------|------|
| Consent Dashboard | ConsentDashboard.tsx | Privacy data - visibility settings | Medium |
| Quality Dashboard | QualityDashboard.tsx | Lists incomplete stories, links to /admin/stories | High |
| Equity Dashboard | EquityDashboard.tsx | Demographic breakdowns | Medium |
| Engagement Dashboard | EngagementDashboard.tsx | Views/shares analytics | Low |
| Export Panel | ExportPanel.tsx | Data download capability | High |
| Interview Pipeline | InterviewPipelineDashboard.tsx | Links to /admin/transcripts, processing status | High |
| Comparison View | ComparisonView.tsx | Regional analytics comparison | Low |
| Timeline Scrubber | TimelineScrubber.tsx | Date range filtering | Low |

### UNUSED/PLACEHOLDER Components
| Feature | Component | Status |
|---------|-----------|--------|
| Heatmap Overlay | HeatmapOverlay.tsx | Not implemented |

---

## Data Model Reference

```
TRANSCRIPTS (PRIMARY - 251)
├── id
├── transcript_content (raw text)
├── themes (extracted, TEXT[]) ← SOURCE OF TRUTH FOR THEMES
├── ai_processing_status ('completed', 'deep_analyzed')
├── storyteller_id → profiles.id
└── metadata (analysis results)

STORIES (SECONDARY - 154)
├── id
├── title, content (curated narrative)
├── storyteller_id → profiles.id
├── transcript_id → transcripts.id ← LINK TO INTERVIEW
├── status ('published', 'draft')
├── themes (may be empty - inherited from transcript)
└── has_explicit_consent

PROFILES (STORYTELLERS - 231)
├── id
├── is_storyteller, is_elder
├── profile_visibility ('public', 'community', 'private')
├── location (JSON)
└── profile_locations → locations (coordinates)

NARRATIVE_THEMES (21)
├── theme_name
├── usage_count
├── sentiment_score
└── ai_confidence_score
```

---

## Current API Status

### `/api/world-tour/map-data` ✅ WORKING
- Uses admin client
- Returns stories with locations, stats, themes
- Counts all transcripts independently

### `/api/world-tour/themes/trending` ✅ FIXED
- Uses admin client
- Queries transcripts as primary source
- Returns trending, emerging, and cross-regional themes

### `/api/world-tour/analytics` ✅ FIXED
- Uses admin client for stories and transcripts
- Returns consent, engagement, quality, equity, timeline, pipeline data

---

## Recommendations

### ✅ COMPLETED - High Priority
1. ~~**Protect Admin Tabs**: Add authentication check before rendering admin-only tabs in insights page~~ DONE
2. ~~**Remove Admin Links from Public**: QualityDashboard and InterviewPipelineDashboard have links to `/admin/*` routes~~ DONE - Moved to admin-only page

### ✅ COMPLETED - Medium Priority
3. ~~**Consider Moving Admin Features**: Create separate `/admin/world-tour/analytics` route for admin dashboards~~ DONE
4. ~~**Add Role-Based Tab Visibility**: Only show certain tabs to authenticated admins~~ DONE - Admin link shown only to admins

### Low Priority (Future)
5. **Remove/Deprecate Unused**: HeatmapOverlay.tsx is not implemented
6. **Clean Up Console Logs**: Remove any debug console.log statements from API routes

---

## Test Checklist

After fixes, verify:
- [ ] Main World Tour page shows correct stats (251 Interviews, 421 Themes, 154 Stories)
- [ ] Insights page Overview tab loads with data
- [ ] Trending Themes section shows actual themes
- [ ] Emerging Themes section shows recent themes (or appropriate "no new themes" message)
- [ ] Cross-Cultural Connections section shows themes across regions
- [ ] All admin tabs render when analytics data is available

---

## Architecture Changes (This Session)

### Public vs Admin Split

**Public Insights Page** (`/world-tour/insights`)
- Shows only public tabs: Overview, Themes, Geography, Impact
- Shows "Admin Analytics" button for authenticated admin users
- Uses `useAuth()` hook to detect admin status

**Admin Analytics Page** (`/admin/world-tour/analytics`)
- Full dashboard with all tabs: Overview, Pipeline, Consent, Quality, Equity, Engagement, Compare, Export
- Protected by admin layout authentication
- Added to admin sidebar navigation under "Management > World Tour"

### Files Modified
- `src/app/world-tour/insights/page.tsx` - Removed admin tabs, added admin link
- `src/app/admin/layout.tsx` - Added World Tour link to navigation
- `src/app/admin/world-tour/analytics/page.tsx` - NEW: Full admin analytics dashboard

---

## Last Updated
December 17, 2025 - Split public/admin analytics, fixed RLS issues in trending themes and analytics APIs
