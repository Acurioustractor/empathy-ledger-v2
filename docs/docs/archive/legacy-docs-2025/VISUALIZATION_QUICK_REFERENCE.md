# Impact Analysis & Visualization Quick Reference

**Fast lookup guide for visualization types, tools, and implementation patterns**

---

## Visualization Type Index

### 📊 Narrative & Story Analysis

| Visualization | Purpose | Best Tool | Difficulty | Priority |
|--------------|---------|-----------|------------|----------|
| **Story Arc / Emotional Trajectory** | Show emotional journey through narrative | D3 line chart | Medium | HIGH |
| **Sentiment Flow Timeline** | Track emotion changes over time | Recharts area chart | Easy | HIGH |
| **Quote Impact Network** | Connect similar quotes across stories | D3 force graph | Hard | MEDIUM |
| **Theme Evolution Flow** | Show how themes emerge/change | Sankey diagram | Medium | HIGH |
| **Narrative Structure Diagram** | Visualize story structure (acts, climax) | Custom D3 | Medium | LOW |

### 🎤 Voice & Audio Analysis

| Visualization | Purpose | Best Tool | Difficulty | Priority |
|--------------|---------|-----------|------------|----------|
| **Pitch Contour** | Show intonation patterns | D3 + Praat data | Medium | HIGH |
| **Intensity Waveform** | Display loudness over time | D3 area chart | Easy | MEDIUM |
| **Emotion Timeline** | AI-detected emotions from voice | Stacked area chart | Medium | HIGH |
| **Prosody Dashboard** | Combined pitch, intensity, pauses | Multi-panel D3 | Hard | MEDIUM |
| **Voice Quality Metrics** | HNR, jitter, shimmer display | Simple metrics | Easy | LOW |

### 🌐 Social Impact Measurement

| Visualization | Purpose | Best Tool | Difficulty | Priority |
|--------------|---------|-----------|------------|----------|
| **SROI Sankey Diagram** | Flow from investment to outcomes to value | D3 Sankey | Medium | HIGH |
| **Theory of Change Flow** | Inputs → Activities → Outcomes → Impact | Custom flow diagram | Medium | HIGH |
| **Ripple Effect Circles** | Concentric circles of spreading impact | D3 circles + force | Hard | HIGH |
| **Outcome Harvest Map** | Bubble chart of outcomes (time × significance) | D3 scatter | Medium | MEDIUM |
| **Impact Timeline** | Longitudinal tracking of changes | Timeline chart | Easy | MEDIUM |

### 🕸️ Network & Relationship

| Visualization | Purpose | Best Tool | Difficulty | Priority |
|--------------|---------|-----------|------------|----------|
| **Storyteller Network** | Thematic connections between storytellers | D3 force graph | Hard | HIGH |
| **Theme Co-occurrence Network** | Which themes appear together | D3 force graph | Medium | HIGH |
| **Geographic Map** | Where storytellers/stories are located | Mapbox GL | Medium | HIGH |
| **Community Structure** | Clusters and influencers | D3 + community detection | Hard | MEDIUM |
| **Beneficiary Journey Flow** | User flow through program | Mermaid/Lucidchart | Easy | LOW |

---

## Tool Selection Matrix

### By Use Case

**Quick Dashboards (Get Started Fast)**
- Recharts (React) - Easy integration, good defaults
- Chart.js - Simple, widely supported
- Tremor - Pre-built dashboard components

**Custom Visualizations (Full Control)**
- D3.js - Maximum flexibility, steep learning curve
- Visx (D3 + React) - D3 power with React components
- Observable Plot - D3 simplified

**Network Graphs**
- D3 force layout - Full control, in-browser
- Cytoscape.js - Biological networks, plugins
- Gephi - Desktop tool, export static images

**Maps**
- Mapbox GL - Beautiful, interactive, requires API key ($$$)
- Leaflet - Open-source, free, good enough
- Google Maps - Familiar, expensive

**Reports (Export to PDF/PPTX)**
- Puppeteer - Render HTML → PDF
- PptxGenJS - Generate PowerPoint
- jsPDF - Direct PDF generation

### By Skill Level

**Beginner** (Can implement in 1-2 days)
- Simple bar/line charts: **Recharts**
- Basic maps: **Leaflet**
- Metrics display: **Custom React components**

**Intermediate** (Can implement in 1 week)
- Force graphs: **D3.js with tutorial**
- Sankey diagrams: **D3 Sankey plugin**
- Timeline charts: **Vis.js Timeline**

**Advanced** (Requires 2+ weeks)
- Custom interactive visualizations: **D3.js from scratch**
- Real-time animated charts: **D3 + WebSocket**
- 3D network visualizations: **Three.js**

---

## Common Patterns & Code Templates

### Pattern 1: Time Series with Tooltip

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function EmotionalTrajectory({ data }: { data: Array<{time: number, valence: number}> }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="valence"
          stroke="#BFA888"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 2: Force-Directed Network

```typescript
import * as d3 from 'd3'

export function NetworkGraph({ nodes, links }: NetworkData) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const width = 800, height = 600

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#BFA888')
      .attr('stroke-width', d => d.weight)

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', '#D4936A')
      .call(drag(simulation))

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    })
  }, [nodes, links])

  return <svg ref={svgRef} width={800} height={600} />
}
```

### Pattern 3: Interactive Map with Markers

```typescript
import mapboxgl from 'mapbox-gl'

export function StoryMap({ stories }: { stories: Story[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-95, 60],
      zoom: 3
    })

    stories.forEach(story => {
      new mapboxgl.Marker({ color: '#BFA888' })
        .setLngLat([story.longitude, story.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h4>${story.title}</h4>
          <p>${story.storyteller}</p>
        `))
        .addTo(map)
    })
  }, [stories])

  return <div ref={mapContainer} className="w-full h-96" />
}
```

### Pattern 4: Sankey Diagram (SROI Flow)

```typescript
import { Sankey } from 'recharts'

interface SROIFlow {
  nodes: Array<{ name: string }>
  links: Array<{ source: number, target: number, value: number }>
}

export function SROISankey({ data }: { data: SROIFlow }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <Sankey
        data={data}
        node={{ fill: '#BFA888' }}
        link={{ stroke: '#D4C4A8' }}
      />
    </ResponsiveContainer>
  )
}
```

---

## Database Queries for Common Visualizations

### Query 1: Story Arc Data

```sql
-- Get sentiment trajectory for story arc visualization
SELECT
  s.id as story_id,
  s.title,
  sa.trajectory_data,
  sa.arc_type,
  sa.emotional_range,
  sa.transformation_score
FROM stories s
JOIN story_narrative_arcs sa ON sa.story_id = s.id
WHERE s.id = $1;
```

### Query 2: Theme Evolution Over Time

```sql
-- Get theme prevalence by time period
SELECT
  t.name as theme_name,
  te.time_period,
  te.story_count,
  te.prominence_avg,
  te.growth_rate,
  te.is_emerging
FROM themes t
JOIN theme_evolution te ON te.theme_id = t.id
WHERE te.time_period >= $1 AND te.time_period <= $2
ORDER BY te.time_period, te.story_count DESC;
```

### Query 3: Storyteller Network (Thematic Connections)

```sql
-- Get storyteller connections for network visualization
SELECT
  sc.storyteller_1_id,
  sc.storyteller_2_id,
  p1.display_name as storyteller_1_name,
  p2.display_name as storyteller_2_name,
  sc.connection_strength,
  sc.shared_themes
FROM storyteller_connections sc
JOIN profiles p1 ON p1.id = sc.storyteller_1_id
JOIN profiles p2 ON p2.id = sc.storyteller_2_id
WHERE sc.connection_type = 'thematic'
  AND sc.connection_strength > 0.3
ORDER BY sc.connection_strength DESC;
```

### Query 4: Ripple Effects for Circles Visualization

```sql
-- Get ripple effects with their levels and impact
SELECT
  re.id,
  re.effect_description,
  re.ripple_level,
  re.ripple_label,
  re.people_affected,
  re.time_lag_days,
  re.triggered_by,
  s.title as story_title
FROM ripple_effects re
JOIN stories s ON s.id = re.story_id
WHERE re.story_id = $1
ORDER BY re.ripple_level, re.time_lag_days;
```

### Query 5: SROI Calculation Data

```sql
-- Get SROI data for Sankey diagram
WITH outcomes AS (
  SELECT
    outcome_type,
    SUM(total_value) as total_outcome_value,
    COUNT(*) as outcome_count
  FROM sroi_outcomes
  WHERE project_id = $1
  GROUP BY outcome_type
),
inputs AS (
  SELECT
    total_investment
  FROM sroi_inputs
  WHERE project_id = $1
)
SELECT
  'Investment' as source,
  o.outcome_type as target,
  o.total_outcome_value as value
FROM outcomes o
CROSS JOIN inputs i
UNION ALL
SELECT
  o.outcome_type as source,
  'Total Social Value' as target,
  o.total_outcome_value as value
FROM outcomes o;
```

---

## Analysis Service Templates

### Service 1: Story Arc Analysis

```python
# services/analyze_story_arc.py
import openai
from typing import List, Dict

async def analyze_story_arc(transcript: str) -> Dict:
    """
    Analyze emotional trajectory and classify narrative arc
    """
    # Get sentiment for segments
    segments = split_into_segments(transcript, num_segments=20)

    trajectory = []
    for i, segment in enumerate(segments):
        sentiment = await get_sentiment(segment)
        trajectory.append({
            'time': i / len(segments),
            'valence': sentiment['valence'],
            'arousal': sentiment['arousal']
        })

    # Classify arc type
    arc_type = classify_arc(trajectory)

    # Calculate metrics
    valences = [t['valence'] for t in trajectory]
    emotional_range = max(valences) - min(valences)
    transformation_score = valences[-1] - valences[0]

    return {
        'trajectory_data': trajectory,
        'arc_type': arc_type,
        'emotional_range': emotional_range,
        'transformation_score': transformation_score,
        'arc_confidence': calculate_confidence(trajectory, arc_type)
    }

def classify_arc(trajectory: List[Dict]) -> str:
    """
    Classify into one of six arc types
    """
    valences = [t['valence'] for t in trajectory]

    # Simple heuristic classification
    start = np.mean(valences[:3])
    middle = np.mean(valences[8:12])
    end = np.mean(valences[-3:])

    if end > start + 0.2:
        if middle < start - 0.1:
            return 'man_in_hole'  # Fall then rise
        else:
            return 'rags_to_riches'  # Steady rise

    elif end < start - 0.2:
        if middle > start + 0.1:
            return 'icarus'  # Rise then fall
        else:
            return 'tragedy'  # Steady fall

    else:
        if middle < min(start, end) - 0.15:
            return 'cinderella'  # Rise-fall-rise
        elif middle > max(start, end) + 0.15:
            return 'oedipus'  # Fall-rise-fall

    return 'linear'  # Default
```

### Service 2: Voice Prosody Analysis

```python
# services/analyze_prosody.py
import parselmouth
import numpy as np

def analyze_prosody(audio_path: str) -> Dict:
    """
    Extract prosodic features using Praat
    """
    sound = parselmouth.Sound(audio_path)

    # Pitch analysis
    pitch = sound.to_pitch()
    pitch_values = pitch.selected_array['frequency']
    pitch_values = pitch_values[pitch_values > 0]  # Remove unvoiced

    # Intensity analysis
    intensity = sound.to_intensity()
    intensity_values = intensity.values[0]

    # Detect pauses
    pauses = detect_pauses(intensity_values, threshold=0.4)

    return {
        'pitch_mean_hz': float(np.mean(pitch_values)),
        'pitch_std_hz': float(np.std(pitch_values)),
        'pitch_range_hz': float(np.ptp(pitch_values)),
        'intensity_mean_db': float(np.mean(intensity_values)),
        'intensity_std_db': float(np.std(intensity_values)),
        'duration_seconds': float(sound.duration),
        'pause_count': len(pauses),
        'avg_pause_duration_sec': float(np.mean([p['duration'] for p in pauses])),
        'harmonics_to_noise_ratio': float(calculate_hnr(sound)),

        # Time series for visualization
        'pitch_contour': [
            {'time': float(t), 'pitch': float(p)}
            for t, p in zip(pitch.xs(), pitch_values)
        ],
        'intensity_contour': [
            {'time': float(t), 'intensity': float(i)}
            for t, i in enumerate(intensity_values)
        ],
        'pauses': pauses
    }
```

### Service 3: SROI Calculator

```typescript
// services/calculate-sroi.ts
interface SROIOutcome {
  outcomeType: string
  quantity: number
  financialProxy: number
  deadweight: number
  attribution: number
  dropOff: number
  durationYears: number
}

export function calculateSROI(
  investment: number,
  outcomes: SROIOutcome[]
): {
  ratio: number
  totalValue: number
  netValue: number
} {
  const discountRate = 0.035  // 3.5% standard

  let totalValue = 0

  for (const outcome of outcomes) {
    const grossValue = outcome.quantity * outcome.financialProxy

    // Apply discounting factors
    const netValue = grossValue * (1 - outcome.deadweight) * outcome.attribution

    // Calculate present value over duration
    for (let year = 1; year <= outcome.durationYears; year++) {
      const yearlyValue = netValue * Math.pow(1 - outcome.dropOff, year - 1)
      const presentValue = yearlyValue / Math.pow(1 + discountRate, year)
      totalValue += presentValue
    }
  }

  return {
    ratio: totalValue / investment,
    totalValue: totalValue,
    netValue: totalValue - investment
  }
}
```

---

## Common Metrics to Track

### Story-Level Metrics

```typescript
interface StoryMetrics {
  // Engagement
  viewCount: number
  shareCount: number
  responseCount: number
  averageViewDuration: number  // seconds

  // Impact
  impactScore: number  // 0-100, AI-generated
  rippleEffectCount: number
  peopleReached: number

  // Narrative
  arcType: string
  emotionalRange: number
  transformationScore: number

  // Voice
  dominantEmotion: string
  emotionalIntensity: number
  speakingRate: number

  // Themes
  themeCount: number
  primaryTheme: string
  themeProminence: number
}
```

### Storyteller-Level Metrics

```typescript
interface StorytellerMetrics {
  // Activity
  storyCount: number
  totalViewCount: number
  averageImpactScore: number

  // Network
  connectionCount: number  // Other storytellers with shared themes
  networkCentrality: number  // Importance in storyteller network
  influenceScore: number

  // Themes
  primaryThemes: string[]
  themeRange: number  // How many different themes

  // Reach
  communitiesReached: number
  geographicReach: string  // 'local', 'regional', 'national'
}
```

### Project-Level Metrics

```typescript
interface ProjectMetrics {
  // Scale
  storytellerCount: number
  storyCount: number
  totalViewCount: number

  // Impact
  sroiRatio: number
  totalSocialValue: number
  rippleEffectCount: number
  peopleAffected: number

  // Themes
  topThemes: Array<{ name: string, count: number }>
  emergingThemes: string[]

  // Network
  storytellerConnections: number
  networkDensity: number
  communityCount: number
}
```

---

## Accessibility Checklist

✅ **Color Contrast**
- All text: 7:1 ratio (WCAG AAA)
- Chart elements: 4.5:1 minimum
- Don't rely on color alone for meaning

✅ **Keyboard Navigation**
- All interactive elements keyboard accessible
- Focus indicators visible
- Logical tab order

✅ **Screen Reader Support**
- Alt text for all visualizations
- ARIA labels for interactive charts
- Data table alternatives for complex charts

✅ **Alternative Formats**
- Provide data tables alongside charts
- Export options (CSV, Excel)
- Text descriptions of key insights

**Example**:

```tsx
<EmpathyCard>
  <CardHeader title="Story Arc" />
  <CardContent>
    {/* Visual chart */}
    <svg aria-describedby="arc-description">
      {/* Chart content */}
    </svg>

    {/* Screen reader description */}
    <div id="arc-description" className="sr-only">
      This story follows a "Man in a Hole" narrative arc, starting at neutral
      (0.5), dropping to sadness (0.2) at the midpoint, then rising to hope (0.7)
      by the end. The emotional range is 0.5 and transformation score is +0.2.
    </div>

    {/* Data table alternative */}
    <details className="mt-4">
      <summary>View data table</summary>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Emotion</th>
          </tr>
        </thead>
        <tbody>
          {trajectoryData.map(point => (
            <tr key={point.time}>
              <td>{Math.round(point.time * 100)}%</td>
              <td>{point.valence.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  </CardContent>
</EmpathyCard>
```

---

## Performance Optimization

### Large Datasets

**Problem**: 10,000+ data points slow down D3 rendering

**Solutions**:
1. **Sampling**: Show representative subset
2. **Aggregation**: Group data points (e.g., daily → monthly)
3. **Canvas instead of SVG**: For many points, canvas is faster
4. **Virtualization**: Only render visible portion

**Example**:

```typescript
// Sample large dataset
function sampleData<T>(data: T[], targetSize: number): T[] {
  if (data.length <= targetSize) return data

  const step = data.length / targetSize
  const sampled: T[] = []

  for (let i = 0; i < targetSize; i++) {
    sampled.push(data[Math.floor(i * step)])
  }

  return sampled
}

// Usage
const sampledTrajectory = sampleData(trajectoryData, 100)
```

### Network Graphs

**Problem**: Force simulations with 1000+ nodes are slow

**Solutions**:
1. **Limit visible nodes**: Show top N by importance
2. **Pre-calculate layouts**: Run simulation server-side
3. **Progressive loading**: Load core, then add periphery
4. **WebGL**: Use deck.gl for very large networks

---

## Next Steps Checklist

**Immediate (This Week)**
- [ ] Review IMPACT_ANALYSIS_STRATEGY.md document
- [ ] Decide which visualizations are highest priority
- [ ] Test Praat installation for voice analysis
- [ ] Prototype one simple visualization (e.g., story arc)

**Short-term (This Month)**
- [ ] Implement database schema changes for Phase 1
- [ ] Build sentiment analysis pipeline
- [ ] Create first dashboard (Platform Overview)
- [ ] Test with sample stories

**Medium-term (Next 3 Months)**
- [ ] Deploy voice analysis pipeline
- [ ] Build SROI calculator
- [ ] Create storyteller network visualization
- [ ] Launch beta to community partners

---

## Resources

**Official Documentation**
- [D3.js](https://d3js.org/)
- [Recharts](https://recharts.org/)
- [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/)
- [Praat](https://www.fon.hum.uva.nl/praat/)

**Tutorials**
- [D3 Graph Gallery](https://d3-graph-gallery.com/)
- [Observable HQ](https://observablehq.com/@d3/gallery)
- [Recharts Examples](https://recharts.org/en-US/examples)

**Academic References**
- [Story Arcs Research (Vermont)](https://arxiv.org/abs/1606.07772)
- [Social Value UK SROI Guide](https://www.socialvalueint.org/guide-to-sroi)
- [Indigenous Evaluation Methods](https://journals.sagepub.com/doi/10.1177/16094069231174764)
