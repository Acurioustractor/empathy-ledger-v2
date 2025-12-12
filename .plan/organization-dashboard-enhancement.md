# Organization Dashboard Enhancement Plan

## Overview

Enhance the multi-tenant organization dashboard with improved analytics, member management, and project oversight capabilities. Build on existing patterns using Recharts, MetricCard components, and the earth/clay/sage color system.

## Current State

The dashboard at `/organisations/[id]/dashboard` currently shows:
- Basic metrics (Members, Stories, Projects, Engagement, Analytics counts)
- Quick action buttons
- Recent activity grid (stories, projects, member highlights)

## Enhancement Architecture

### New Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome Header + Quick Actions (existing)                       │
├─────────────────────────────────────────────────────────────────┤
│  ENHANCED METRICS ROW                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Members  │ │Stories  │ │Projects │ │Impact   │ │Syndicate│   │
│  │   +12%  │ │   +5    │ │  2 new  │ │  87/100 │ │  3 apps │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ANALYTICS INSIGHTS (NEW)                                        │
│  ┌──────────────────────────┐ ┌──────────────────────────┐      │
│  │  Trending Themes         │ │  Story Pipeline          │      │
│  │  [BarChart]              │ │  Draft → Review → Pub    │      │
│  └──────────────────────────┘ └──────────────────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  ACTIVITY GRID (enhanced existing)                               │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ Recent Stories │ │ Project Health │ │ Member Activity│       │
│  │ + engagement   │ │ + progress     │ │ + contributions│       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  MULTI-TENANT SUMMARY (if user has multiple orgs)               │
│  Compare metrics across your organizations                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Phase 1: Enhanced Metrics (Foundation)

#### Task 1.1: Create EnhancedOrganizationMetrics component
**File**: `src/components/organization/EnhancedOrganizationMetrics.tsx`

Replace basic metrics with trend-aware metrics using existing MetricCard:
- Members: Show growth trend (this month vs last)
- Stories: Show new this week + total
- Projects: Active vs completed ratio
- Community Impact Score: Aggregate from `community_impact_metrics`
- Syndication Stats: From new `story_syndication_consent` table

**Data needed**:
```typescript
interface EnhancedMetrics {
  members: { total: number; trend: number; newThisMonth: number }
  stories: { total: number; published: number; drafts: number; newThisWeek: number }
  projects: { total: number; active: number; completed: number }
  impactScore: { score: number; confidence: number; topAreas: string[] }
  syndication: { appsConnected: number; storiesShared: number; totalViews: number }
}
```

#### Task 1.2: Update dashboard API endpoint
**File**: `src/app/api/organisations/[id]/dashboard/route.ts`

Add new data fetching for:
- Trend calculations (compare current vs previous period)
- Community impact aggregation
- Syndication stats from new tables

---

### Phase 2: Analytics Insights Widgets

#### Task 2.1: Create TrendingThemesWidget component
**File**: `src/components/organization/widgets/TrendingThemesWidget.tsx`

Show top 5 themes from stories using Recharts BarChart:
- Extract from `stories.cultural_themes` and `stories.ai_themes`
- Show frequency with cultural color palette
- Link to full analytics page

#### Task 2.2: Create StoryPipelineWidget component
**File**: `src/components/organization/widgets/StoryPipelineWidget.tsx`

Visual funnel showing story workflow:
- Drafts → In Review → Published
- Use horizontal progress bars or Sankey-style flow
- Click to filter stories by status

#### Task 2.3: Create TopContributorsWidget component
**File**: `src/components/organization/widgets/TopContributorsWidget.tsx`

Show most active storytellers:
- Story count, transcript count, engagement
- Avatar + name + role badge
- Link to storyteller profile

---

### Phase 3: Enhanced Activity Grid

#### Task 3.1: Enhance RecentActivity component
**File**: `src/components/organization/RecentActivity.tsx` (modify existing)

Add to existing story cards:
- View count badge
- Cultural sensitivity indicator
- Syndication status (if shared externally)

#### Task 3.2: Create ProjectHealthWidget component
**File**: `src/components/organization/widgets/ProjectHealthWidget.tsx`

Replace basic RecentProjects with health indicators:
- Progress bar (stories collected vs target)
- Status badge (on-track, at-risk, completed)
- Days until deadline (if set)
- Storyteller participation rate

#### Task 3.3: Enhance MemberHighlights component
**File**: `src/components/organization/MemberHighlights.tsx` (modify existing)

Add member contribution metrics:
- Stories contributed
- Last active date
- Role badge with tenure
- Engagement score

---

### Phase 4: Multi-Tenant Features

#### Task 4.1: Create MultiOrgSummary component
**File**: `src/components/organization/MultiOrgSummary.tsx`

For users with access to multiple organizations:
- Comparison table of key metrics
- Quick switch between orgs
- Only show if user has 2+ org memberships

#### Task 4.2: Update dashboard page to check multi-org
**File**: `src/app/organisations/[id]/dashboard/page.tsx`

Query user's organization memberships and conditionally render MultiOrgSummary.

---

### Phase 5: API & Data Layer

#### Task 5.1: Create dashboard analytics API
**File**: `src/app/api/organisations/[id]/dashboard-analytics/route.ts`

Consolidated endpoint returning all enhanced dashboard data:
```typescript
{
  metrics: EnhancedMetrics,
  themes: { name: string; count: number }[],
  pipeline: { draft: number; review: number; published: number },
  contributors: { id: string; name: string; stories: number; avatar: string }[],
  projectHealth: { id: string; name: string; progress: number; status: string }[],
  memberActivity: { id: string; name: string; lastActive: Date; contributions: number }[]
}
```

#### Task 5.2: Add database helper functions
**File**: `src/lib/services/organization-dashboard.service.ts`

Service functions:
- `getOrganizationTrends(orgId, period)` - Calculate growth trends
- `getThemeDistribution(orgId)` - Aggregate themes from stories
- `getProjectHealth(orgId)` - Calculate project progress metrics
- `getMemberEngagement(orgId)` - Score member activity

---

## Component Structure

```
src/components/organization/
├── EnhancedOrganizationMetrics.tsx  (NEW)
├── MultiOrgSummary.tsx              (NEW)
├── widgets/
│   ├── TrendingThemesWidget.tsx     (NEW)
│   ├── StoryPipelineWidget.tsx      (NEW)
│   ├── TopContributorsWidget.tsx    (NEW)
│   └── ProjectHealthWidget.tsx      (NEW)
├── RecentActivity.tsx               (ENHANCE)
├── MemberHighlights.tsx             (ENHANCE)
└── ... (existing components)
```

---

## Dependencies

**Existing (no new packages needed)**:
- Recharts (v3.2.0) - For bar charts, progress indicators
- Lucide React - Icons
- Radix UI - Tabs, Cards
- Tailwind - Styling with earth/clay/sage palette

**Database tables used**:
- `organizations`, `profile_organizations` - Member data
- `stories` - Content metrics, themes
- `projects`, `profile_projects` - Project tracking
- `community_impact_metrics` - Impact scores
- `story_syndication_consent`, `story_access_log` - Syndication (new)

---

## Implementation Order

1. **Task 5.1-5.2**: API and service layer (data foundation)
2. **Task 1.1-1.2**: Enhanced metrics (quick visual win)
3. **Task 2.1-2.3**: Analytics widgets (high value)
4. **Task 3.1-3.3**: Activity enhancements (refinement)
5. **Task 4.1-4.2**: Multi-tenant features (bonus)

---

## File Changes Summary

| File | Action | Complexity |
|------|--------|------------|
| `organization-dashboard.service.ts` | CREATE | Medium |
| `dashboard-analytics/route.ts` | CREATE | Medium |
| `EnhancedOrganizationMetrics.tsx` | CREATE | Low |
| `widgets/TrendingThemesWidget.tsx` | CREATE | Medium |
| `widgets/StoryPipelineWidget.tsx` | CREATE | Low |
| `widgets/TopContributorsWidget.tsx` | CREATE | Low |
| `widgets/ProjectHealthWidget.tsx` | CREATE | Medium |
| `MultiOrgSummary.tsx` | CREATE | Medium |
| `dashboard/page.tsx` | MODIFY | Low |
| `RecentActivity.tsx` | MODIFY | Low |
| `MemberHighlights.tsx` | MODIFY | Low |

**Total**: 8 new files, 3 modified files
**Estimated complexity**: Medium (uses existing patterns throughout)
