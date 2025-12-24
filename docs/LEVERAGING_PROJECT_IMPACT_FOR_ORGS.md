# Leveraging Existing Project Impact Framework for Organizations

## Executive Summary

**DISCOVERY**: Empathy Ledger already has a comprehensive **Project Impact Analysis System** that can be leveraged for organization-level impact measurement! This system includes:

- Indigenous-defined impact dimensions (Relationship Strengthening, Cultural Continuity, Community Empowerment, System Transformation)
- Intelligent AI analysis with contextual assessment (not keyword-based)
- Outcome tracking and aggregation
- Quote extraction with impact scoring
- Transformation evidence tracking
- Sovereignty markers assessment

**KEY INSIGHT**: Instead of building separate organization analytics from scratch, we can **aggregate project-level analyses** to create organization dashboards.

## Existing Project Impact Framework

### 1. Impact Dimensions (Indigenous-Defined)

```typescript
// From: src/lib/ai/intelligent-indigenous-impact-analyzer.ts

interface ImpactDimensions {
  relationshipStrengthening: number   // 0-100: Trust-building, connection depth
  culturalContinuity: number          // 0-100: Cultural knowledge transmission
  communityEmpowerment: number        // 0-100: Agency, self-determination
  systemTransformation: number        // 0-100: Institutional change
  healingProgression: number          // 0-100: Healing journey evidence
  knowledgePreservation: number       // 0-100: Wisdom transmission
}
```

### 2. Scoring Methodology

**NOT keyword-based** - Uses contextual depth assessment:

| Score Range | Depth Level | Meaning |
|-------------|-------------|---------|
| 0-30 | **Mention** | Brief reference to concept |
| 31-60 | **Description** | Describes activities or processes |
| 61-80 | **Demonstration** | Shows specific outcomes with evidence |
| 81-100 | **Transformation** | Demonstrates deep transformative impact |

**Example**:
- ❌ "Community" mentioned 50 times → Score: 25 (just mentions)
- ✅ Detailed story of community making self-determined decisions → Score: 85 (transformation shown)

### 3. Sovereignty Markers Assessment

```typescript
interface SovereigntyMarkers {
  communityLedDecisionMaking: boolean      // Is community driving decisions?
  culturalProtocolsRespected: boolean      // Are protocols being followed?
  externalSystemsResponding: boolean       // Are systems changing in response?
  resourceControlIncreasing: boolean       // Is community control growing?
}
```

### 4. Existing API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/projects/[id]/analysis` | Full project impact analysis |
| `POST /api/projects/[id]/analyze` | Trigger analysis for project |
| `GET /api/organisations/[id]/analysis` | Organization analysis (may need enhancement) |

## How Projects Relate to Organizations

### Current Database Structure

```
organisations
    ├── projects (via organization_id)
    │   ├── project_participants (storytellers)
    │   └── transcripts (via project_id or storyteller_id)
    └── organization_members (all members including storytellers)
        └── profiles (storytellers)
            └── transcripts (via storyteller_id)
```

### Two Analysis Approaches

**Approach 1: Project-Aggregated** (Recommended)
- Analyze each project separately
- Aggregate project-level insights to organization level
- **Pros**: Maintains project context, cleaner attribution
- **Cons**: Requires all transcripts linked to projects

**Approach 2: Direct Storyteller Aggregation**
- Get all storytellers for organization
- Analyze their transcripts collectively
- **Pros**: Captures all content regardless of project linkage
- **Cons**: May lose project context

**RECOMMENDED**: Use both approaches combined:
1. Run project analyses for structured initiatives
2. Run storyteller-direct analysis for unlinked content
3. Merge insights at organization level

## Organization Impact Dashboard Design

### Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│              ORGANIZATION IMPACT DASHBOARD                    │
└──────────────────────────────────────────────────────────────┘

1. GET /api/organizations/[id]/impact-dashboard
   ↓
2. Fetch all projects for organization
   ├─ For each project:
   │  └─ GET /api/projects/[project_id]/analysis
   ↓
3. Aggregate project analyses:
   ├─ Average impact dimension scores
   ├─ Combine all powerful quotes
   ├─ Merge themes across projects
   ├─ Aggregate sovereignty markers
   └─ Extract cross-project patterns
   ↓
4. Fetch unlinked storyteller transcripts
   ├─ Get organization_members (storytellers)
   ├─ Get their transcripts not in projects
   └─ Analyze separately and merge
   ↓
5. Return comprehensive organization dashboard:
   ├─ Overall impact scores (6 dimensions)
   ├─ Project breakdowns
   ├─ Powerful quotes by theme
   ├─ Sovereignty indicators
   ├─ Transformation evidence
   └─ Storyteller network
```

### API Implementation

```typescript
// File: src/app/api/organizations/[id]/impact-dashboard/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params
  const supabase = createSupabaseServerClient()

  // 1. Get all projects for this organization
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('organization_id', organizationId)

  // 2. Fetch analysis for each project
  const projectAnalyses = await Promise.all(
    projects.map(async (project) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${project.id}/analysis?intelligent=true`
      )
      return response.json()
    })
  )

  // 3. Aggregate impact dimensions across projects
  const aggregatedImpact = aggregateProjectImpacts(projectAnalyses)

  // 4. Get storytellers not in projects (if any)
  const { data: unlinkedStory Tellers } = await supabase
    .from('organization_members')
    .select(`
      profile:profiles!inner(
        id,
        display_name,
        is_storyteller
      )
    `)
    .eq('organization_id', organizationId)
    .eq('profile.is_storyteller', true)

  // Filter out storytellers already in projects
  const projectStorytellerIds = new Set(
    projectAnalyses.flatMap(p => p.storytellers.map(s => s.id))
  )

  const unlinkedIds = unlinkedStoryTellers
    .filter(m => !projectStorytellerIds.has(m.profile.id))
    .map(m => m.profile.id)

  // 5. Analyze unlinked storyteller transcripts if any
  let unlinkedAnalysis = null
  if (unlinkedIds.length > 0) {
    const { data: unlinkedTranscripts } = await supabase
      .from('transcripts')
      .select('*')
      .in('storyteller_id', unlinkedIds)

    unlinkedAnalysis = await analyzeTranscriptsBatch(unlinkedTranscripts)
  }

  // 6. Merge all analyses
  const completeOrgAnalysis = mergeAnalyses(
    aggregatedImpact,
    unlinkedAnalysis
  )

  return NextResponse.json({
    organization: {
      id: organizationId,
      name: org.name,
      total_projects: projects.length,
      total_storytellers: projectAnalyses.reduce((sum, p) => sum + p.storytellerCount, 0)
    },
    impact: completeOrgAnalysis.impactFramework,
    sovereignty: completeOrgAnalysis.sovereigntyMarkers,
    insights: completeOrgAnalysis.keyInsights,
    projects: projects.map((p, i) => ({
      ...p,
      impact: projectAnalyses[i].aggregatedInsights.impactFramework
    })),
    powerfulQuotes: completeOrgAnalysis.topQuotes,
    themes: completeOrgAnalysis.dominantThemes
  })
}

// Helper function to aggregate project impacts
function aggregateProjectImpacts(projectAnalyses: any[]): any {
  const totalProjects = projectAnalyses.length

  const aggregated = {
    impactFramework: {
      relationshipStrengthening: 0,
      culturalContinuity: 0,
      communityEmpowerment: 0,
      systemTransformation: 0,
      healingProgression: 0,
      knowledgePreservation: 0
    },
    sovereigntyMarkers: {
      communityLedDecisionMaking: 0,
      culturalProtocolsRespected: 0,
      externalSystemsResponding: 0,
      resourceControlIncreasing: 0
    },
    topQuotes: [],
    dominantThemes: new Map(),
    keyInsights: []
  }

  // Average impact scores across projects
  projectAnalyses.forEach(analysis => {
    const impact = analysis.aggregatedInsights.impactFramework

    aggregated.impactFramework.relationshipStrengthening += impact.relationshipStrengthening
    aggregated.impactFramework.culturalContinuity += impact.culturalContinuity
    aggregated.impactFramework.communityEmpowerment += impact.communityEmpowerment
    aggregated.impactFramework.systemTransformation += impact.systemTransformation
    aggregated.impactFramework.healingProgression += impact.healingProgression
    aggregated.impactFramework.knowledgePreservation += impact.knowledgePreservation

    // Collect all powerful quotes
    aggregated.topQuotes.push(...analysis.aggregatedInsights.powerfulQuotes)

    // Aggregate themes
    analysis.aggregatedInsights.overallThemes.forEach(t => {
      const current = aggregated.dominantThemes.get(t.theme) || 0
      aggregated.dominantThemes.set(t.theme, current + t.frequency)
    })
  })

  // Calculate averages
  Object.keys(aggregated.impactFramework).forEach(key => {
    aggregated.impactFramework[key] /= totalProjects
  })

  // Sort quotes by confidence and take top 20
  aggregated.topQuotes.sort((a, b) => b.confidence - a.confidence)
  aggregated.topQuotes = aggregated.topQuotes.slice(0, 20)

  // Sort themes by frequency
  aggregated.dominantThemes = Array.from(aggregated.dominantThemes.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([theme, frequency]) => ({ theme, frequency }))

  return aggregated
}
```

## Reusing Existing Components

### Project Analysis View (Already Built!)

```tsx
// Existing component: src/components/projects/ProjectAnalysisView.tsx
// Can be adapted for organization-level view

import { ProjectAnalysisView } from '@/components/projects/ProjectAnalysisView'

// For organization dashboard, create similar:
<OrganizationAnalysisView
  organizationId={organizationId}
  // Reuses same impact dimensions display
  impactDimensions={orgAnalysis.impactFramework}
  powerfulQuotes={orgAnalysis.topQuotes}
  themes={orgAnalysis.themes}
  projects={orgAnalysis.projects} // Breakdown by project
/>
```

### Impact Dimensions Display (Reusable)

The existing project analysis UI already has:
- ✅ Impact dimension radar charts
- ✅ Sovereignty markers indicators
- ✅ Powerful quote carousels
- ✅ Theme tag clouds
- ✅ Transformation evidence lists

**These can be directly reused for organization dashboards!**

## Implementation Plan

### Phase 1: Leverage Existing (Immediate - No New Code)

1. **Use Project Analysis API for Each Project**
   - Call `GET /api/projects/[id]/analysis` for each org project
   - Aggregate results client-side
   - Display in organization dashboard

2. **Reuse Project Analysis Components**
   - Copy `ProjectAnalysisView.tsx` → `OrganizationAnalysisView.tsx`
   - Update to show aggregated multi-project data
   - Add project breakdown section

### Phase 2: Optimize Aggregation (1-2 days)

3. **Create Organization Analysis Endpoint**
   - `GET /api/organizations/[id]/impact-analysis`
   - Server-side aggregation (faster than client-side)
   - Cache results for performance

4. **Add Unlinked Storyteller Analysis**
   - Analyze transcripts not in projects
   - Merge with project analyses
   - Ensure complete coverage

### Phase 3: Enhanced Features (1 week)

5. **Comparison Views**
   - Compare projects within organization
   - Track impact trends over time
   - Identify high-impact projects

6. **Custom Organization Insights**
   - Cross-project patterns
   - Organization-specific sovereignty indicators
   - Funder-ready impact reports

## Database Tables Needed (Minimal)

Instead of complex new analytics tables, just add:

```sql
-- Simple cache table for organization analyses
CREATE TABLE organization_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Cached analysis result (from aggregating projects)
  analysis_result JSONB NOT NULL,

  -- Cache metadata
  projects_included UUID[] DEFAULT '{}',
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  cache_valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_org_cache UNIQUE(organization_id)
);

CREATE INDEX idx_org_cache_org ON organization_analysis_cache(organization_id);
CREATE INDEX idx_org_cache_valid ON organization_analysis_cache(cache_valid_until);
```

That's it! Everything else already exists.

## Benefits of This Approach

### 1. Consistency
- Organization and project dashboards use same impact framework
- Consistent scoring methodology
- Unified terminology

### 2. Less Code to Maintain
- Reuse existing analyzers
- Reuse existing UI components
- Single source of truth for impact assessment

### 3. Project Context Preserved
- Can drill down from org → project → storyteller
- Understand which projects drive which impacts
- Compare project effectiveness

### 4. Already Battle-Tested
- Project analysis framework is proven
- Indigenous-defined dimensions are validated
- AI prompts are refined

## Next Steps

1. **Verify Project Analysis System Works**
   - Test `GET /api/projects/[id]/analysis` on a real project
   - Confirm impact dimensions are being calculated
   - Check quote extraction quality

2. **Create Simple Organization Aggregator**
   - Single endpoint that fetches all project analyses
   - Averages impact scores
   - Combines quotes and themes

3. **Build Organization Dashboard UI**
   - Copy `ProjectAnalysisView` component
   - Update to show multi-project data
   - Add project comparison section

4. **Test with Real Organization**
   - Use Orange Sky (28 storytellers, multiple projects)
   - Generate organization impact report
   - Refine based on results

## Summary

**DON'T BUILD NEW**: Organization impact analytics from scratch

**DO LEVERAGE**: Existing project impact analysis framework by:
1. Aggregating project-level analyses to organization level
2. Reusing impact dimensions, sovereignty markers, quote extraction
3. Adapting existing UI components for organization view
4. Adding simple caching for performance

This approach:
- ✅ Saves development time (reuse > rebuild)
- ✅ Maintains consistency across platform
- ✅ Preserves Indigenous-defined impact framework
- ✅ Allows project-level drill-down
- ✅ Already proven and battle-tested

**Estimated effort**: 2-3 days vs 2-3 weeks for ground-up rebuild

---

**Status**: Ready to implement using existing framework
**Next Action**: Test project analysis API, then build organization aggregator
**Files to Review**:
- `src/app/api/projects/[id]/analysis/route.ts` - Project analysis logic
- `src/lib/ai/intelligent-indigenous-impact-analyzer.ts` - Impact assessment
- `src/components/projects/ProjectAnalysisView.tsx` - UI components to reuse
