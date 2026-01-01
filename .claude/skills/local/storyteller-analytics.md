# Storyteller Analytics Visualization Skill

**Name**: `storyteller-analytics`
**Type**: Project Skill
**Purpose**: Design and implement world-class storyteller analytics, thematic visualizations, and narrative connection systems

## What This Skill Does

Helps you create cutting-edge visualizations that transform storyteller data into actionable insights:

1. **Enhanced Storyteller Cards** - Rich, interactive cards with themes, connections, impact metrics
2. **Thematic Analysis** - Network graphs, evolution timelines, cross-narrative insights
3. **Story Linkages** - Connection networks, similarity matrices, collaboration opportunities
4. **AI-Powered Insights** - Suggestion cards, confidence visualizations, recommendation flows

## When to Use This Skill

Use when you need to:

- "Create a D3 theme network visualization"
- "Design storyteller connection graph with force simulation"
- "Build AI insight acceptance UI for profile suggestions"
- "Implement quote carousel with impact scoring"
- "Design cross-narrative insights dashboard"
- "Create geographic heat map for storyteller clustering"
- "Build interactive theme co-occurrence matrix"
- "Implement impact trajectory sparklines"

## Core Capabilities

### 1. Data Query Design

**Complex Analytics Queries:**
- Rich storyteller card data (themes, quotes, connections)
- Theme network graph data with co-occurrence
- Connection similarity using vector embeddings
- Time-series engagement metrics
- Cross-narrative insights aggregation

**Optimization Patterns:**
- Common Table Expressions (CTEs) for complex joins
- JSONB aggregation for flexible data structures
- Vector embedding distance calculations
- Efficient graph traversal queries

### 2. D3 Visualization Components

**Force-Directed Graphs:**
- Theme networks (nodes = themes, edges = co-occurrence)
- Storyteller connections (nodes = storytellers, edges = similarities)
- Multi-level hierarchies with zoom/pan

**Specialized Charts:**
- Chord diagrams for inter-storyteller relationships
- Sankey flows for theme → storyteller → impact
- Radial trees for hierarchical exploration
- Heat maps for similarity matrices

**Interactive Features:**
- Drag nodes to reorganize
- Click for detail panels
- Filter by type/strength
- Export as PNG/SVG
- Responsive layouts

### 3. AI Integration Patterns

**Profile Completeness:**
- Progress ring visualization
- Missing fields highlighting
- AI-suggested completions
- Confidence score display

**Theme Suggestions:**
- Confidence-weighted cards
- Evidence display (quotes, context)
- Accept/reject actions
- Batch application

**Connection Recommendations:**
- Similarity scoring visualization
- Shared themes display
- Collaboration opportunity cards
- Connection invitation flow

### 4. Interactive Component Design

**Enhanced Card Components:**
- Impact sparklines (mini time-series)
- Theme network previews (D3 mini-graphs)
- Quote carousels (swipeable)
- Connection previews (hover cards)
- AI insight panels (expandable)

**Dashboard Layouts:**
- Responsive grid systems
- Filter/sort controls
- View mode switching
- Export capabilities
- Real-time updates

## Foundation You Have

### Rich Data Model

✅ **11 Analytics Tables**:
- `storyteller_analytics` - Core metrics, themes, style
- `storyteller_engagement` - Time-series engagement
- `storyteller_impact_metrics` - Multi-dimensional impact
- `storyteller_connections` - 8 connection types
- `storyteller_quotes` - Impact-scored quotes
- `narrative_themes` - Vector embeddings (1536-dim)
- `cross_narrative_insights` - Pattern detection
- `theme_evolution_tracking` - Historical trends
- `storyteller_recommendations` - AI suggestions
- `analytics_processing_jobs` - Background analysis

✅ **AI Analysis Infrastructure**:
- Theme extraction with confidence
- Quote impact scoring (wisdom, quotability, inspiration)
- Connection strength calculation
- Cultural sensitivity detection
- Recommendation engine

✅ **Visualization Libraries**:
- Recharts (v3.2.0)
- D3 (v7.9.0)
- Chart.js (v4.5.0)
- Framer Motion (v12.23.12)

✅ **Existing Components**:
- 4 storyteller card variants
- ThematicAnalysis.tsx with charts
- Cultural color palette
- Interactive filters

## Example Usage

### "Create a theme network graph"

**Skill generates**:

1. **Data Query**:
```sql
WITH theme_pairs AS (
  SELECT
    st1.theme_id as theme_a,
    st2.theme_id as theme_b,
    COUNT(DISTINCT st1.storyteller_id) as co_occurrence,
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
  jsonb_agg(tp.*) as connections
FROM narrative_themes nt
LEFT JOIN theme_pairs tp ON tp.theme_a = nt.id OR tp.theme_b = nt.id
GROUP BY nt.id, nt.theme_name, nt.theme_category, nt.usage_count;
```

2. **D3 Component**:
```typescript
import * as d3 from 'd3'

interface ThemeNetworkGraphProps {
  data: { nodes: Theme[], links: Connection[] }
  width: number
  height: number
  onNodeClick: (theme: Theme) => void
}

export function ThemeNetworkGraph({ data, width, height, onNodeClick }: ThemeNetworkGraphProps) {
  // Force simulation setup
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))

  // SVG rendering with drag, zoom, click handlers
  // Node sizing by usage_count
  // Edge thickness by strength
  // Color by theme_category
}
```

3. **API Route**:
```typescript
// /api/analytics/theme-network
export async function GET(request: NextRequest) {
  const { data } = await supabase.rpc('get_theme_network_data', {
    min_connections: 2,
    limit: 50
  })

  return NextResponse.json({
    nodes: data.map(d => ({ id: d.id, label: d.theme_name, size: d.usage_count, category: d.theme_category })),
    links: data.flatMap(d => d.connections || [])
  })
}
```

### "Build AI insight acceptance UI"

**Skill generates**:

1. **Component**:
```typescript
interface AISuggestionCardProps {
  suggestion: {
    type: 'theme' | 'connection' | 'tag' | 'profile_field'
    value: string
    confidence: number
    reasoning: string
    evidence: Quote[] | Story[]
  }
  onAccept: () => Promise<void>
  onDismiss: () => void
}

export function AISuggestionCard({ suggestion, onAccept, onDismiss }: AISuggestionCardProps) {
  return (
    <Card className="border-l-4 border-l-accent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Suggestion
          </Badge>
          <ConfidenceScore value={suggestion.confidence} />
        </div>
      </CardHeader>

      <CardContent>
        <h4>{suggestion.value}</h4>
        <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>

        {suggestion.evidence.length > 0 && (
          <EvidencePanel evidence={suggestion.evidence} />
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={onAccept} variant="default">Apply Suggestion</Button>
        <Button onClick={onDismiss} variant="ghost">Dismiss</Button>
      </CardFooter>
    </Card>
  )
}
```

2. **State Management**:
```typescript
const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
const [applying, setApplying] = useState(false)

const handleAccept = async (suggestionId: string) => {
  setApplying(true)
  const res = await fetch(`/api/recommendations/accept`, {
    method: 'POST',
    body: JSON.stringify({ recommendationId: suggestionId })
  })

  if (res.ok) {
    // Update profile data
    // Remove suggestion
    // Show success toast
  }
  setApplying(false)
}
```

## Implementation Patterns

### Pattern 1: Rich Storyteller Card

```typescript
// Query all card data in one efficient call
const { data } = await supabase.rpc('get_rich_storyteller_data', {
  storyteller_id: id
})

// Returns:
// - Profile fields
// - Analytics metrics (engagement, impact)
// - Top themes with scores
// - Top quotes with impact
// - Top connections with strength
// - Active recommendations
// - Time-series engagement data

<StorytellerCardPro storyteller={data}>
  <HeroPortrait />
  <ImpactSparkline data={data.engagement_history} />
  <ThemeNetworkMini themes={data.top_themes} />
  <QuoteCarousel quotes={data.top_quotes} />
  <ConnectionPreview connections={data.top_connections} />
  <AIInsightPanel suggestions={data.recommendations} />
</StorytellerCardPro>
```

### Pattern 2: Interactive Dashboard

```typescript
<ThematicAnalysisDashboard>
  <FilterPanel>
    <ThemeFilter />
    <DateRangeFilter />
    <CategoryFilter />
  </FilterPanel>

  <VisualizationGrid>
    <ThemeNetworkGraph />
    <ThemeEvolutionTimeline />
    <CrossNarrativeInsights />
    <GeographicHeatMap />
  </VisualizationGrid>

  <ExportPanel />
</ThematicAnalysisDashboard>
```

### Pattern 3: Connection Discovery

```typescript
// Use vector embeddings for similarity
const { data } = await supabase.rpc('find_similar_storytellers', {
  storyteller_id: id,
  similarity_threshold: 0.7,
  limit: 10
})

<ConnectionGraph
  nodes={data.storytellers}
  links={data.connections}
  layout="force"
  colorBy="primaryTheme"
  sizeBy="impactScore"
  onNodeClick={showStorytellerDetails}
/>
```

## Skill Workflow

When invoked, the skill will:

1. **Understand the visualization goal**
   - What data needs to be shown
   - What insights to reveal
   - What interactions are needed

2. **Design the data query**
   - Identify required tables
   - Optimize with CTEs and aggregations
   - Include all necessary metrics

3. **Create the component**
   - Choose appropriate chart type
   - Design interactive features
   - Apply cultural color palette
   - Add responsive layouts

4. **Build the API route** (if needed)
   - Efficient database queries
   - Data transformation
   - Error handling
   - Caching strategy

5. **Provide integration guide**
   - Where to place the component
   - Required props and types
   - State management needs
   - Performance considerations

## Best Practices

### Data Queries

✅ Use CTEs for complex logic
✅ Aggregate in SQL, not JavaScript
✅ Limit result sets appropriately
✅ Include confidence scores
✅ Return rich metadata

### Visualizations

✅ Cultural color palette consistency
✅ Responsive design (mobile-first)
✅ Touch-friendly targets (44px min)
✅ Keyboard navigation support
✅ Screen reader compatibility

### AI Integration

✅ Always show confidence scores
✅ Provide reasoning/evidence
✅ Allow user override
✅ Track acceptance rates
✅ Learn from feedback

### Performance

✅ Virtualize long lists
✅ Debounce search/filter
✅ Lazy load heavy charts
✅ Cache computed data
✅ Optimize re-renders

## Related Skills

- `design-component` - UI component design
- `data-analysis` - AI analysis patterns
- `database-navigator` - Query optimization
- `supabase` - Database interactions

---

**Ready to build world-class storyteller analytics!**

Use this skill when you need to transform rich storytelling data into beautiful, actionable visualizations that reveal deep connections and patterns.
