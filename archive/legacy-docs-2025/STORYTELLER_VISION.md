# Storyteller Analytics & Visualization Vision

**Creating world-class storyteller cards, thematic analysis, and narrative linkages**

## 🌟 The Vision

Transform storyteller data into **living, breathing narratives** that reveal:
- **Deep connections** between storytellers across themes, geography, culture
- **Evolving impact** through time-series visualizations
- **Hidden patterns** in collective wisdom and shared experiences
- **Actionable insights** for community building and cultural preservation

## 🎯 What Makes This Special

### You Already Have (The Foundation)

✅ **Vector embeddings** (1536-dim) for semantic similarity
✅ **11 analytics tables** with comprehensive metrics
✅ **Multi-dimensional scoring** (engagement, impact, cultural, community)
✅ **AI theme extraction** with confidence scoring
✅ **Quote impact analysis** with wisdom & quotability scores
✅ **Connection discovery** with 8 connection types
✅ **Time-series tracking** (engagement by period)
✅ **Geographic & demographic** clustering
✅ **Recommendation engine** with 9 recommendation types
✅ **4 card variants** already built
✅ **Recharts, D3, Chart.js** ready to use

### What We Can Build (The Enhancement)

🚀 **Next-level storyteller cards** with:
- Interactive theme networks
- Impact trajectory sparklines
- Connection strength visualizations
- AI insight acceptance UI
- Quote galleries with scoring

🚀 **Thematic analysis dashboards** showing:
- Cross-narrative insights
- Theme co-occurrence graphs
- Geographic heat maps
- Sentiment evolution
- Cultural marker clouds

🚀 **Story linkage networks** revealing:
- Force-directed connection graphs
- Shared theme Venn diagrams
- Similarity matrices
- Collaboration opportunities
- Geographic clustering

## 💡 The Grand Design

### 1. Enhanced Storyteller Card System

**Component Architecture:**
```typescript
<StorytellerCardPro>
  <HeroPortrait />
  <ImpactSparkline />          // Time-series mini-chart
  <ThemeNetwork />              // D3 force graph
  <ConnectionMap />             // Geographic visualization
  <AIInsightPanel />            // Expandable with apply actions
  <QuoteGallery />              // Impact-scored quotes
  <RecommendationStream />      // AI suggestions
  <CollaborationOpportunities /> // Matched storytellers
</StorytellerCardPro>
```

**Data Flow:**
```
storyteller_analytics
├─> engagement_metrics (time-series)
├─> impact_metrics (scores + outcomes)
├─> themes (with embeddings)
├─> quotes (with impact scores)
├─> connections (strength matrix)
└─> recommendations (prioritized)
```

### 2. Thematic Analysis Engine

**Visualization Types:**

**A. Theme Network Graph** (D3 Force-Directed)
```javascript
// Nodes: Themes (sized by usage_count)
// Edges: Co-occurrence strength
// Colors: Cultural categories
// Interactive: Click to filter storytellers
```

**B. Cross-Narrative Insights Dashboard**
```javascript
<InsightsDashboard>
  <TrendTimeline />        // Emerging vs declining themes
  <GeographicHeatMap />    // Impact by region
  <SentimentRadial />      // Emotional tone distribution
  <ThemeEvolution />       // Historical theme tracking
  <CulturalMarkerCloud />  // Word cloud with cultural weighting
</InsightsDashboard>
```

**C. Theme Co-occurrence Matrix**
```javascript
// Heatmap showing which themes appear together
// Click cells to see storytellers with both themes
// Export for pattern analysis
```

### 3. Story Linkage Network

**Connection Visualization:**

**A. Storyteller Similarity Graph**
```javascript
<ConnectionGraph>
  // Force-directed layout
  // Node size: impact_score
  // Node color: primary_theme
  // Edge thickness: connection_strength
  // Clusters: geographic/thematic/cultural
  // Interactive: Drag, zoom, filter
</ConnectionGraph>
```

**B. Shared Theme Venn Diagrams**
```javascript
// Select 2-3 storytellers
// Show overlapping themes
// Display shared quotes
// Suggest collaboration areas
```

**C. Geographic Clustering Map**
```javascript
<GeoClusterMap>
  // Mapbox/Leaflet integration
  // Cluster storytellers by location
  // Show connection lines
  // Filter by theme/impact
  // Animate over time
</GeoClusterMap>
```

### 4. AI-Powered Insight Cards

**Smart Suggestion UI:**

**A. Profile Completeness Ring**
```javascript
<ProfileProgress
  completeness={78}
  missing={['expertise_areas', 'collaboration_preferences']}
  suggestions={aiSuggestions}
  onApply={acceptSuggestion}
/>
```

**B. AI Suggestion Cards**
```javascript
<AISuggestionCard
  type="theme_suggestion"
  confidence={0.87}
  suggestion="Add 'Intergenerational Healing' theme"
  reasoning="Detected in 3 recent transcripts"
  evidence={[quotes]}
  onAccept={() => applyTheme()}
  onDismiss={() => dismissSuggestion()}
/>
```

**C. Connection Opportunity Cards**
```javascript
<ConnectionOpportunity
  storyteller={potentialMatch}
  connectionStrength={0.92}
  sharedThemes={['Cultural Preservation', 'Youth Mentorship']}
  sharedGeography="Vancouver Island"
  potentialCollaboration="Co-create intergenerational workshop series"
  onConnect={sendInvitation}
/>
```

## 🛠️ Technical Implementation

### Phase 1: Enhanced Card Components

**New Components:**

1. **ImpactSparkline.tsx**
```typescript
import { Sparklines, SparklinesLine } from 'react-sparklines'

interface ImpactSparklineProps {
  data: EngagementMetric[]
  period: 'daily' | 'weekly' | 'monthly'
}

// Mini time-series showing impact trajectory
// Hover: Show exact values
// Color: Green (growing), amber (stable), red (declining)
```

2. **ThemeNetworkMini.tsx**
```typescript
import * as d3 from 'd3'

interface ThemeNetworkMiniProps {
  themes: Theme[]
  connections: ThemeConnection[]
  onThemeClick: (theme: Theme) => void
}

// Small D3 force-directed graph
// Nodes: Top 5-8 themes
// Edges: Co-occurrence
// Click: Expand to full view
```

3. **QuoteCarousel.tsx**
```typescript
import { Swiper, SwiperSlide } from 'swiper/react'

interface QuoteCarouselProps {
  quotes: Quote[]
  sortBy: 'impact' | 'wisdom' | 'quotability'
}

// Swipeable quote cards
// Show impact scores
// Click to see full context
// Share button
```

### Phase 2: Analytics Dashboards

**New Pages:**

1. **`/storytellers/[id]/analytics`**
```typescript
<StorytellerAnalyticsDashboard>
  <MetricsOverview />
  <ImpactTrajectory />
  <ThemeDistribution />
  <ConnectionNetwork />
  <QuoteGallery />
  <RecommendationStream />
  <InsightsTimeline />
</StorytellerAnalyticsDashboard>
```

2. **`/analytics/themes`**
```typescript
<ThematicAnalysisDashboard>
  <ThemeNetworkGraph />
  <ThemeEvolutionTimeline />
  <CrossNarrativeInsights />
  <GeographicDistribution />
  <SentimentAnalysis />
  <CulturalMarkerCloud />
</ThematicAnalysisDashboard>
```

3. **`/analytics/connections`**
```typescript
<ConnectionAnalyticsDashboard>
  <StorytellerSimilarityMatrix />
  <ConnectionNetworkGraph />
  <CollaborationOpportunities />
  <GeographicClusters />
  <ThematicClusters />
</ConnectionAnalyticsDashboard>
```

### Phase 3: Interactive Visualizations

**D3 Components:**

1. **ForceDirectedGraph.tsx**
```typescript
// Core reusable D3 force simulation
// Props: nodes, links, config
// Features: Drag, zoom, filter, export
// Use cases: Themes, connections, stories
```

2. **SankeyDiagram.tsx**
```typescript
// Flow visualization
// Show: Theme → Storyteller → Impact
// Or: Geography → Theme → Outcome
```

3. **RadialTree.tsx**
```typescript
// Hierarchical visualization
// Root: Storyteller
// Branches: Themes, connections, quotes
// Leaves: Specific content
```

4. **ChordDiagram.tsx**
```typescript
// Circular relationship viz
// Show inter-storyteller connections
// Segment by theme/geography
```

### Phase 4: AI Integration Layer

**API Routes:**

1. **`/api/storytellers/[id]/ai-insights`**
```typescript
// GET: Fetch AI-generated insights
// POST: Accept/reject AI suggestions
// Response: Updated profile + confidence scores
```

2. **`/api/analytics/theme-network`**
```typescript
// GET: Theme graph data with embeddings
// Params: minStrength, limit, filters
// Response: Nodes, edges, metadata
```

3. **`/api/analytics/connection-graph`**
```typescript
// GET: Storyteller connection data
// Params: storytellerId, connectionTypes[], depth
// Response: Graph data for D3
```

4. **`/api/recommendations/accept`**
```typescript
// POST: Accept AI recommendation
// Body: recommendationId, customizations
// Response: Updated data + new recommendations
```

## 📊 Data Queries & Optimizations

### Key Queries

**1. Get Rich Storyteller Card Data**
```sql
WITH theme_data AS (
  SELECT
    st.storyteller_id,
    ARRAY_AGG(nt.theme_name ORDER BY st.prominence_score DESC) as themes,
    ARRAY_AGG(st.prominence_score ORDER BY st.prominence_score DESC) as theme_scores
  FROM storyteller_themes st
  JOIN narrative_themes nt ON nt.id = st.theme_id
  WHERE st.storyteller_id = $1
  GROUP BY st.storyteller_id
),
quote_data AS (
  SELECT
    storyteller_id,
    COUNT(*) as quote_count,
    AVG(emotional_impact_score) as avg_impact,
    ARRAY_AGG(quote_text ORDER BY quotability_score DESC LIMIT 3) as top_quotes
  FROM storyteller_quotes
  WHERE storyteller_id = $1 AND is_public = true
  GROUP BY storyteller_id
),
connection_data AS (
  SELECT
    sc.storyteller_a_id,
    COUNT(*) as connection_count,
    AVG(sc.connection_strength) as avg_strength,
    ARRAY_AGG(
      jsonb_build_object(
        'id', p.id,
        'name', p.display_name,
        'strength', sc.connection_strength,
        'type', sc.connection_type
      ) ORDER BY sc.connection_strength DESC LIMIT 5
    ) as top_connections
  FROM storyteller_connections sc
  JOIN profiles p ON p.id = sc.storyteller_b_id
  WHERE sc.storyteller_a_id = $1
    AND sc.status != 'blocked'
  GROUP BY sc.storyteller_a_id
)
SELECT
  p.*,
  sa.*,
  sim.*,
  td.themes,
  td.theme_scores,
  qd.quote_count,
  qd.avg_impact,
  qd.top_quotes,
  cd.connection_count,
  cd.avg_strength,
  cd.top_connections
FROM profiles p
LEFT JOIN storyteller_analytics sa ON sa.storyteller_id = p.id
LEFT JOIN storyteller_impact_metrics sim ON sim.storyteller_id = p.id
LEFT JOIN theme_data td ON td.storyteller_id = p.id
LEFT JOIN quote_data qd ON qd.storyteller_id = p.id
LEFT JOIN connection_data cd ON cd.storyteller_a_id = p.id
WHERE p.id = $1;
```

**2. Get Theme Network Graph Data**
```sql
WITH theme_pairs AS (
  SELECT
    st1.theme_id as theme_a,
    st2.theme_id as theme_b,
    COUNT(DISTINCT st1.storyteller_id) as co_occurrence_count,
    AVG(st1.prominence_score * st2.prominence_score) as strength
  FROM storyteller_themes st1
  JOIN storyteller_themes st2
    ON st1.storyteller_id = st2.storyteller_id
    AND st1.theme_id < st2.theme_id
  GROUP BY st1.theme_id, st2.theme_id
  HAVING COUNT(DISTINCT st1.storyteller_id) >= 2
)
SELECT
  nt.id,
  nt.theme_name,
  nt.theme_category,
  nt.usage_count,
  nt.theme_embedding,
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'target', tp.theme_b,
        'strength', tp.strength,
        'count', tp.co_occurrence_count
      )
    )
    FROM theme_pairs tp
    WHERE tp.theme_a = nt.id),
    '[]'::jsonb
  ) as connections
FROM narrative_themes nt
WHERE nt.usage_count > 0
ORDER BY nt.usage_count DESC;
```

**3. Find Similar Storytellers (Embedding-based)**
```sql
WITH target_embedding AS (
  SELECT theme_embedding
  FROM narrative_themes
  WHERE theme_name = (
    SELECT theme_name
    FROM storyteller_themes st
    JOIN narrative_themes nt ON nt.id = st.theme_id
    WHERE st.storyteller_id = $1
    ORDER BY st.prominence_score DESC
    LIMIT 1
  )
)
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  st.theme_id,
  nt.theme_name,
  (1 - (nt.theme_embedding <=> te.theme_embedding)) as similarity_score
FROM profiles p
JOIN storyteller_themes st ON st.storyteller_id = p.id
JOIN narrative_themes nt ON nt.id = st.theme_id
CROSS JOIN target_embedding te
WHERE p.id != $1
  AND p.status = 'active'
ORDER BY similarity_score DESC
LIMIT 10;
```

## 🎨 Design System Extensions

### Color Palettes

**Cultural Themes** (from themes.ts):
```typescript
const culturalPalette = {
  cultural: '#D97706', // amber-600
  family: '#059669',   // emerald-600
  land: '#0284C7',     // sky-600
  resilience: '#DC2626', // red-600
  knowledge: '#7C3AED', // violet-600
  justice: '#EA580C',  // orange-600
  arts: '#06B6D4',     // cyan-600
  everyday: '#65A30D'  // lime-600
}
```

**Impact Scores**:
```typescript
const impactColors = {
  high: '#10B981',      // green-500
  medium: '#F59E0B',    // amber-500
  low: '#EF4444',       // red-500
  emerging: '#8B5CF6',  // violet-500
  peak: '#EC4899'       // pink-500
}
```

**Connection Strength**:
```typescript
const connectionStrength = {
  strong: 'rgba(16, 185, 129, 0.8)',   // green with opacity
  medium: 'rgba(245, 158, 11, 0.6)',
  weak: 'rgba(107, 114, 128, 0.4)'
}
```

### Animation Patterns

**Framer Motion Variants**:
```typescript
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
}

const graphVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}
```

## 🚀 Implementation Roadmap

### Sprint 1: Enhanced Cards (Week 1-2)
- [ ] Create ImpactSparkline component
- [ ] Build ThemeNetworkMini (D3)
- [ ] Implement QuoteCarousel
- [ ] Add AI suggestion acceptance UI
- [ ] Create ConnectionPreview component

### Sprint 2: Analytics Dashboards (Week 3-4)
- [ ] Build `/analytics/themes` page
- [ ] Create ThemeNetworkGraph (full D3)
- [ ] Implement CrossNarrativeInsights panel
- [ ] Add GeographicHeatMap (Recharts)
- [ ] Build SentimentRadial chart

### Sprint 3: Connection Networks (Week 5-6)
- [ ] Create `/analytics/connections` page
- [ ] Build ForceDirectedGraph component
- [ ] Implement StorytellerSimilarityMatrix
- [ ] Add CollaborationOpportunities cards
- [ ] Create Geographic clustering map

### Sprint 4: AI Integration (Week 7-8)
- [ ] Build AI insights API routes
- [ ] Create recommendation acceptance flow
- [ ] Implement profile completeness ring
- [ ] Add AI suggestion cards
- [ ] Build connection opportunity matching

## 📚 Required Skills Development

### New Claude Skill: `storyteller-analytics`

**Purpose**: Design and implement world-class storyteller analytics visualizations

**Capabilities**:
1. **Data Query Optimization**
   - Write complex SQL with CTEs for rich card data
   - Optimize vector embedding queries
   - Design efficient graph traversal queries

2. **D3 Visualization Design**
   - Force-directed graphs
   - Chord diagrams
   - Sankey flows
   - Radial trees

3. **AI Integration Patterns**
   - Theme extraction and scoring
   - Connection strength calculation
   - Recommendation generation
   - Confidence score visualization

4. **Component Architecture**
   - Reusable chart components
   - Interactive data visualization
   - Real-time updates
   - Export capabilities

**When to use**:
```
"Create a D3 theme network visualization"
"Design a storyteller connection graph"
"Build an AI insight acceptance UI"
"Optimize the theme co-occurrence query"
```

---

**This is your world-class storytelling platform waiting to emerge!** 🌟

Your foundation is **exceptional**. Now we bring it to life with stunning visualizations that reveal the deep connections and patterns in your storytelling data.
