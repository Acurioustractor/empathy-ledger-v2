# Social Impact & Community Metrics System Design

**Created:** 2026-01-02
**Status:** Planning Phase
**Foundation:** Claude Sonnet 4.5 AI Analysis

---

## Executive Summary

The Claude Sonnet 4.5 transcript analysis provides **rich, structured data** that can power comprehensive social impact measurement aligned with:
- ✅ **Indigenous Data Sovereignty** (OCAP principles)
- ✅ **UN Sustainable Development Goals** (SDGs)
- ✅ **Social Return on Investment** (SROI)
- ✅ **Theory of Change** frameworks
- ✅ **Community-defined success metrics**

---

## 1. Data Foundation (Already Built)

### AI Analysis Output (Per Transcript)

```typescript
interface TranscriptAnalysis {
  // Thematic Data
  themes: string[]                    // 0-15 standardized themes from taxonomy
  cultural_themes: string[]           // 0-10 Indigenous-specific themes

  // Evidence
  key_quotes: Quote[]                 // 1-10 verified quotes

  // Insights
  summary: string                     // 1000 char summary
  key_insights: string[]              // 1-10 key insights
  related_topics: string[]            // 1-10 related topics

  // Metadata
  emotional_tone: string              // Overall narrative tone
  cultural_sensitivity_level: 'low' | 'medium' | 'high' | 'sacred'
  requires_elder_review: boolean

  // Quality Metrics
  verification_stats: {
    quotes_extracted: number
    quotes_verified: number
    quotes_rejected: number
    verification_rate: number         // 0-100%
  }
  processing_time_ms: number
}
```

### Thematic Taxonomy (40+ Themes → SDG Mapping)

**Category 1: Cultural Sovereignty & Identity**
- `cultural_identity` → SDG 10, 16
- `data_sovereignty` → SDG 16
- `cultural_protocols` → SDG 16
- `connection_to_country` → SDG 15
- `language_preservation` → SDG 4

**Category 2: Knowledge Transmission & Education**
- `intergenerational_knowledge_transmission` → SDG 4
- `traditional_knowledge` → SDG 3, 15
- `education_access` → SDG 4

**Category 3: Self-Determination & Governance**
- `self_determination` → SDG 16
- `community_governance` → SDG 16
- `housing_sovereignty` → SDG 11

**Category 4: Economic Justice & Sustainability**
- `economic_independence` → SDG 8
- `social_enterprise` → SDG 8, 12
- `economic_exploitation` → SDG 10

**Category 5: Healing & Wellbeing**
- `healing_and_trauma` → SDG 3
- `mental_health` → SDG 3
- `family_violence` → SDG 5, 16

**Category 6: Systemic Injustice & Advocacy**
- `systemic_racism` → SDG 10, 16
- `colonization_impacts` → SDG 10, 16
- `justice_system` → SDG 16
- `media_representation` → SDG 16

**Category 7: Community & Relationships**
- `community_resilience` → SDG 11
- `kinship_systems` → SDG 1, 3
- `youth_empowerment` → SDG 4, 10

**Category 8: Environmental & Climate**
- `environmental_stewardship` → SDG 13, 14, 15
- `climate_adaptation` → SDG 13

---

## 2. Social Impact Metrics Framework

### A. Thematic Impact Metrics

**What We Can Measure:**
- **Theme Prevalence** - Which issues are most discussed?
- **Theme Evolution** - How do themes change over time?
- **Theme Co-occurrence** - Which issues are connected?
- **Geographic Theme Distribution** - Where are specific themes most relevant?
- **SDG Alignment** - Which SDGs are most addressed by stories?

**Database Queries:**

```sql
-- Theme Prevalence (Organization-level)
SELECT
  unnest(themes) as theme,
  COUNT(*) as story_count,
  COUNT(DISTINCT storyteller_id) as storyteller_count
FROM transcripts
WHERE organization_id = $1
GROUP BY theme
ORDER BY story_count DESC;

-- SDG Impact Coverage
SELECT
  sdg_goal,
  COUNT(DISTINCT t.id) as stories_addressing_sdg,
  COUNT(DISTINCT t.storyteller_id) as storytellers_contributing
FROM transcripts t
JOIN LATERAL unnest(t.themes) theme ON true
JOIN thematic_taxonomy tax ON tax.theme_key = theme
JOIN LATERAL unnest(tax.sdgs) sdg_goal ON true
WHERE t.organization_id = $1
GROUP BY sdg_goal
ORDER BY stories_addressing_sdg DESC;

-- Theme Evolution Over Time
SELECT
  DATE_TRUNC('month', created_at) as month,
  unnest(themes) as theme,
  COUNT(*) as occurrences
FROM transcripts
WHERE organization_id = $1
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY month, theme
ORDER BY month, occurrences DESC;
```

### B. Community Voice Metrics

**What We Can Measure:**
- **Storyteller Diversity** - How many unique voices?
- **Geographic Reach** - How many communities represented?
- **Cultural Representation** - Which cultural backgrounds are heard?
- **Intergenerational Participation** - Youth, elders, middle-aged?

**Key Indicators:**

```sql
-- Storyteller Diversity Score
SELECT
  COUNT(DISTINCT storyteller_id) as unique_storytellers,
  COUNT(DISTINCT cultural_background) as cultural_diversity,
  COUNT(DISTINCT location) as geographic_diversity,
  COUNT(DISTINCT CASE WHEN age_group = 'elder' THEN storyteller_id END) as elder_voices,
  COUNT(DISTINCT CASE WHEN age_group = 'youth' THEN storyteller_id END) as youth_voices
FROM transcripts t
JOIN profiles p ON t.storyteller_id = p.id
WHERE t.organization_id = $1;

-- Community Representation Heatmap Data
SELECT
  p.location,
  p.cultural_background,
  COUNT(*) as story_count,
  COUNT(DISTINCT p.id) as storyteller_count,
  ARRAY_AGG(DISTINCT unnest(t.themes)) as themes_represented
FROM transcripts t
JOIN profiles p ON t.storyteller_id = p.id
WHERE t.organization_id = $1
GROUP BY p.location, p.cultural_background;
```

### C. Impact Evidence Metrics

**What We Can Measure:**
- **Transformation Stories** - How many show positive change?
- **Challenge Documentation** - What barriers are identified?
- **Wisdom Preservation** - How much traditional knowledge captured?
- **Cultural Insight Depth** - Quality of cultural understanding?

**Quote Category Analysis:**

```sql
-- Impact Quote Distribution
SELECT
  category,
  COUNT(*) as quote_count,
  AVG(impact_score) as avg_impact_score,
  AVG(confidence_score) as avg_confidence
FROM transcripts t
JOIN LATERAL jsonb_to_recordset(
  t.metadata->'ai_analysis'->'key_quotes'
) AS q(
  category text,
  impact_score numeric,
  confidence_score numeric
) ON true
WHERE t.organization_id = $1
GROUP BY category
ORDER BY quote_count DESC;

-- High-Impact Transformation Evidence
SELECT
  t.id,
  t.title,
  p.display_name as storyteller,
  q.text as quote,
  q.impact_score,
  q.category
FROM transcripts t
JOIN profiles p ON t.storyteller_id = p.id
JOIN LATERAL jsonb_to_recordset(
  t.metadata->'ai_analysis'->'key_quotes'
) AS q(
  text text,
  category text,
  impact_score numeric
) ON true
WHERE t.organization_id = $1
  AND q.category = 'transformation'
  AND q.impact_score >= 4
ORDER BY q.impact_score DESC
LIMIT 20;
```

### D. SROI (Social Return on Investment) Metrics

**Theory of Change Integration:**

```
INPUTS → ACTIVITIES → OUTPUTS → OUTCOMES → IMPACT
```

**Mapping AI Analysis to SROI:**

| SROI Component | AI Analysis Data | Measurement |
|----------------|------------------|-------------|
| **Inputs** | Organization resources | Number of transcripts collected |
| **Activities** | Storytelling sessions | Sessions per month, storyteller engagement |
| **Outputs** | Stories created | 188 transcripts analyzed with themes |
| **Outcomes** | Community change | Theme prevalence in: `self_determination`, `healing_and_trauma`, `economic_independence` |
| **Impact** | Long-term change | Theme evolution showing shift from `challenge` → `transformation` |

**SROI Calculation Framework:**

```typescript
interface SROIMetrics {
  // Financial Investment
  total_investment: number           // Platform costs + staff time
  cost_per_story: number             // Investment / story_count

  // Social Value Created
  stories_collected: number          // 188 transcripts
  unique_voices_heard: number        // 226 storytellers
  communities_represented: number    // Geographic diversity
  sdgs_addressed: number[]           // Which SDGs impacted

  // Outcome Indicators (from themes)
  self_determination_stories: number      // Stories with self_determination theme
  healing_journeys_documented: number     // Stories with healing_and_trauma theme
  cultural_knowledge_preserved: number    // Stories with traditional_knowledge theme
  systemic_issues_identified: number      // Stories with systemic_racism theme

  // Monetized Social Value (optional)
  estimated_therapy_equivalent_value: number      // healing_and_trauma stories × therapy cost
  estimated_cultural_preservation_value: number   // traditional_knowledge × archival value
  estimated_advocacy_value: number                // systemic_racism stories × advocacy campaign value

  // SROI Ratio
  sroi_ratio: number                 // Total social value / Total investment
}
```

### E. Community Impact Dashboard

**Real-time Metrics for Organizations:**

```typescript
interface CommunityImpactDashboard {
  // Overview
  total_stories: number
  total_storytellers: number
  total_themes_identified: number
  total_quotes_verified: number

  // Top Themes (Last 30 days)
  trending_themes: Array<{
    theme: string
    count: number
    change_vs_last_month: number    // +/- percentage
  }>

  // SDG Impact
  sdg_coverage: Array<{
    sdg_number: number
    sdg_name: string
    stories_addressing: number
    storytellers_contributing: number
  }>

  // Community Voice
  cultural_backgrounds_represented: string[]
  locations_represented: string[]
  age_diversity: {
    youth: number
    adult: number
    elder: number
  }

  // Impact Evidence
  transformation_stories: number         // category = 'transformation'
  wisdom_captured: number                // category = 'wisdom'
  challenges_documented: number          // category = 'challenge'

  // Quality Metrics
  avg_quote_verification_rate: number    // Should be ~100%
  avg_themes_per_story: number           // 3-8 expected
  avg_cultural_sensitivity: string       // low/medium/high/sacred distribution
  stories_requiring_elder_review: number

  // Temporal Trends
  stories_per_month: Array<{
    month: string
    count: number
  }>

  theme_evolution: Array<{
    theme: string
    timeline: Array<{
      month: string
      count: number
    }>
  }>
}
```

---

## 3. Implementation Roadmap

### Phase 1: Foundation (COMPLETED ✅)
- ✅ Claude Sonnet 4.5 analyzer
- ✅ Thematic taxonomy with SDG mapping
- ✅ Quote verification (100% accuracy)
- ✅ 188 transcripts processed

### Phase 2: Data Aggregation (NEXT - 1 week)
**Goal:** Create aggregate tables for fast queries

**Tasks:**
1. **Create `theme_analytics` table**
   - Stores theme prevalence by organization/project/time
   - Updates daily via cron job

2. **Create `sdg_impact_tracking` table**
   - Maps stories → themes → SDGs
   - Enables SDG reporting

3. **Create `community_voice_metrics` table**
   - Diversity metrics by organization
   - Cultural representation tracking

4. **Create `impact_evidence_catalog` table**
   - High-impact quotes by category
   - Transformation stories registry

**Database Schema:**

```sql
-- Theme Analytics (Aggregate)
CREATE TABLE theme_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  theme TEXT NOT NULL,
  time_period TSRANGE NOT NULL,  -- Date range (month, quarter, year)

  story_count INTEGER NOT NULL,
  storyteller_count INTEGER NOT NULL,
  quote_count INTEGER NOT NULL,
  avg_impact_score NUMERIC(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_theme_period UNIQUE (organization_id, project_id, theme, time_period)
);

-- SDG Impact Tracking
CREATE TABLE sdg_impact_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  sdg_goal INTEGER NOT NULL CHECK (sdg_goal BETWEEN 1 AND 17),

  story_count INTEGER NOT NULL,
  storyteller_count INTEGER NOT NULL,
  themes TEXT[] NOT NULL,  -- Which themes map to this SDG

  sample_quotes JSONB,     -- Top 5 quotes related to this SDG

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Impact Evidence Catalog
CREATE TABLE impact_evidence_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  transcript_id UUID REFERENCES transcripts(id),
  storyteller_id UUID REFERENCES profiles(id),

  quote_text TEXT NOT NULL,
  quote_category TEXT NOT NULL,  -- transformation, wisdom, challenge, etc.
  impact_score NUMERIC(2,1) NOT NULL,
  confidence_score INTEGER NOT NULL,

  theme TEXT NOT NULL,
  context TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3: API Endpoints (1 week)

**Create RESTful APIs:**

```typescript
// GET /api/organizations/{id}/impact-metrics
interface ImpactMetricsResponse {
  overview: {
    total_stories: number
    total_storytellers: number
    date_range: { start: string, end: string }
  }

  themes: {
    top_themes: Array<{ theme: string, count: number }>
    theme_evolution: Array<{ month: string, theme: string, count: number }>
  }

  sdgs: {
    coverage: Array<{ sdg: number, stories: number }>
    top_sdg: number
  }

  community: {
    cultural_diversity: number
    geographic_diversity: number
    age_diversity: { youth: number, adult: number, elder: number }
  }

  evidence: {
    transformation_stories: number
    high_impact_quotes: Quote[]
  }
}

// GET /api/organizations/{id}/sroi-report
interface SROIReportResponse {
  financial: {
    total_investment: number
    cost_per_story: number
  }

  outcomes: {
    stories_collected: number
    voices_heard: number
    sdgs_addressed: number[]
  }

  social_value: {
    cultural_preservation_value: number
    healing_journey_value: number
    advocacy_value: number
    total_value: number
  }

  sroi_ratio: number

  supporting_evidence: {
    quotes: Quote[]
    themes: string[]
  }
}

// GET /api/organizations/{id}/theme-network
interface ThemeNetworkResponse {
  nodes: Array<{
    id: string          // theme name
    label: string       // theme label
    count: number       // story count
    category: string    // theme category
  }>

  edges: Array<{
    source: string      // theme 1
    target: string      // theme 2
    weight: number      // co-occurrence count
  }>
}
```

### Phase 4: Visualization Dashboard (2 weeks)

**Components to Build:**

1. **Impact Overview Card**
   - Total stories, storytellers, themes
   - Time range selector
   - Export to PDF button

2. **Theme Prevalence Chart**
   - Horizontal bar chart
   - Top 10 themes
   - Click to drill down

3. **SDG Impact Wheel**
   - Circular chart with 17 SDGs
   - Size = story count addressing SDG
   - Color = intensity of coverage

4. **Theme Evolution Timeline**
   - Line chart
   - Multiple themes over time
   - Identify trends

5. **Community Voice Map**
   - Geographic heatmap
   - Storyteller density by location
   - Cultural background overlay

6. **Impact Evidence Gallery**
   - Filterable quote cards
   - Category filters (transformation, wisdom, etc.)
   - Share individual quotes

7. **SROI Summary Card**
   - Investment vs. value created
   - Breakdown by outcome type
   - Export button for funders

8. **Theme Network Graph**
   - Force-directed graph
   - Shows theme connections
   - Interactive exploration

### Phase 5: Reporting & Export (1 week)

**Auto-Generated Reports:**

1. **Monthly Impact Report (PDF)**
   - Executive summary
   - Theme highlights
   - Top quotes
   - SDG coverage
   - Community voice metrics

2. **SROI Report (PDF)**
   - Investment breakdown
   - Outcome metrics
   - Social value calculation
   - Evidence appendix

3. **Funder Report (PDF/Excel)**
   - Customizable date range
   - KPIs aligned with grant requirements
   - Story excerpts
   - Impact quotes

4. **Community Report (PDF - Plain Language)**
   - Simplified metrics
   - Story highlights
   - Visual charts
   - Culturally appropriate design

---

## 4. Advanced Analytics (Future)

### A. Predictive Analytics
- **Theme Trend Forecasting** - Predict emerging themes
- **Impact Prediction** - Identify high-potential stories early
- **Resource Optimization** - Suggest where to focus storytelling efforts

### B. Cross-Organization Insights
- **Sector-wide Theme Analysis** - What themes are common across Indigenous orgs?
- **Best Practice Identification** - Which approaches yield most transformation stories?
- **Collaborative Opportunities** - Connect orgs working on similar themes

### C. AI-Enhanced Insights
- **Pattern Recognition** - Identify subtle connections between themes
- **Impact Correlation** - Which combinations of themes lead to best outcomes?
- **Story Recommendation** - Suggest stories to funders/media based on themes

---

## 5. Success Metrics for Impact System

**Technical Metrics:**
- ✅ API response time < 200ms for dashboard queries
- ✅ Daily aggregate updates complete in < 5 minutes
- ✅ 99.9% uptime for impact dashboard
- ✅ Export reports generated in < 10 seconds

**User Metrics:**
- ✅ Organizations use dashboard weekly
- ✅ Funders cite metrics in grant reports
- ✅ Community members understand their impact
- ✅ 90% satisfaction with metric clarity

**Impact Metrics:**
- ✅ Organizations secure more funding using SROI reports
- ✅ Media cites evidence from impact catalog
- ✅ Policy makers reference theme analysis
- ✅ Communities see their stories driving change

---

## 6. Data Governance & Ethics

**Principles:**
1. **OCAP Compliance** - Communities own their impact data
2. **Consent-Driven** - Only analyze consented transcripts
3. **Culturally Safe** - Respect `requires_elder_review` flags
4. **Transparent** - Show storytellers their contribution to metrics
5. **Reversible** - Communities can withdraw stories from metrics at any time

**Access Control:**
- Organization admins: Full dashboard access
- Project managers: Project-level metrics only
- Storytellers: See their own contribution
- Public: Only aggregate metrics (if org approves)

---

## Next Steps

1. **Review this design** with stakeholders
2. **Create database migrations** for aggregate tables (Phase 2)
3. **Build API endpoints** for impact metrics (Phase 3)
4. **Design dashboard UI** (Phase 4)
5. **Implement reporting** (Phase 5)

**Estimated Timeline:** 5-6 weeks to full production

**Current Status:** Foundation complete (188 transcripts analyzed with Claude Sonnet 4.5)

---

## Appendix: Example Impact Story

**Scenario:** Indigenous housing organization

**Data:**
- 45 transcripts analyzed
- 32 unique storytellers
- Top themes: `housing_sovereignty`, `self_determination`, `economic_independence`
- 178 verified quotes
- 23 transformation stories

**Impact Report Output:**

> "Over 6 months, 32 community members shared 45 stories documenting their housing journey. Analysis reveals:
>
> - **Housing Sovereignty (23 stories)**: Communities are actively designing culturally appropriate homes
> - **Self-Determination (18 stories)**: Families making autonomous decisions about living spaces
> - **Economic Independence (15 stories)**: Housing projects creating local employment
>
> **SDG Impact:** Primary contribution to SDG 11 (Sustainable Cities), SDG 8 (Decent Work)
>
> **SROI:** $50,000 platform investment → $450,000 estimated social value (9:1 ratio)
> - Cultural preservation: $200,000 (traditional design knowledge captured)
> - Economic impact: $150,000 (jobs created)
> - Wellbeing impact: $100,000 (housing security)
>
> **Evidence:** 23 high-impact transformation quotes showcasing community-led success"

This data helps the organization secure their next grant round. ✅
