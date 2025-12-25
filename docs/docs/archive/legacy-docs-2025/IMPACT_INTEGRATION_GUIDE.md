# Impact Analysis Integration Guide

Quick guide to integrating impact analysis components into your Empathy Ledger pages.

---

## 🎯 3 Example Pages Created

### 1. **Demo Page** - `/impact/demo`
Full showcase of all components with example data and getting started guide.

**File**: `src/app/impact/demo/page.tsx`

**What it shows**:
- All 6 visualization components
- Participatory evaluation forms
- Getting started code examples
- System status

### 2. **Story Impact Page** - `/stories/[id]/impact`
Individual story analysis showing emotional arc and ripple effects.

**File**: `src/app/stories/[id]/impact/page.tsx`

**What it shows**:
- Story arc visualization
- Ripple effects for that story
- Community responses
- Auto-analysis trigger

### 3. **Organization Impact Dashboard** - `/organizations/[id]/impact`
Comprehensive organization-level impact dashboard.

**File**: `src/app/organizations/[id]/impact/page.tsx`

**What it shows**:
- Full impact dashboard
- SROI analysis
- Theme evolution
- Participatory evaluation results
- SROI setup guide

---

## 🚀 Quick Start - Add to Existing Page

### Example: Add Story Arc to Story Detail Page

```typescript
// src/app/stories/[id]/page.tsx

import { StoryArcVisualization } from '@/components/impact/StoryArcVisualization'
import { createClient } from '@/lib/supabase/server'

export default async function StoryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch story
  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('id', params.id)
    .single()

  // Fetch narrative arc (if exists)
  const { data: arc } = await supabase
    .from('story_narrative_arcs')
    .select('*')
    .eq('story_id', params.id)
    .single()

  return (
    <div>
      {/* Your existing story content */}
      <h1>{story.title}</h1>
      <p>{story.description}</p>

      {/* Add story arc visualization */}
      {arc && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Emotional Journey</h2>
          <StoryArcVisualization
            arc={arc}
            storyTitle={story.title}
            variant="default"
          />
        </div>
      )}
    </div>
  )
}
```

---

## 📊 Component Usage Examples

### 1. Story Arc Visualization

**When to use**: Show emotional journey of a single story

```typescript
import { StoryArcVisualization } from '@/components/impact/StoryArcVisualization'

<StoryArcVisualization
  arc={arcData}
  storyTitle="The Winter Teaching"
  variant="detailed"  // 'compact' | 'default' | 'detailed'
  showMetrics={true}
  showDescription={true}
/>
```

### 2. SROI Visualization

**When to use**: Display social return on investment for a project/organization

```typescript
import { SROIVisualization } from '@/components/impact/SROIVisualization'

<SROIVisualization
  inputs={sroiInputs}
  outcomes={sroiOutcomes}
  calculation={sroiCalculation}  // optional
  projectName="Language Revitalization Project"
  variant="full"  // 'full' | 'summary' | 'compact'
/>
```

### 3. Ripple Effect Visualization

**When to use**: Show spreading impact from a story or project

```typescript
import { RippleEffectVisualization } from '@/components/impact/RippleEffectVisualization'

<RippleEffectVisualization
  effects={rippleEffects}
  variant="detailed"  // 'compact' | 'default' | 'detailed'
  allowReporting={true}  // Show community reporting form
/>
```

### 4. Theme Evolution

**When to use**: Track how themes emerge and evolve over time

```typescript
import { ThemeEvolutionVisualization } from '@/components/impact/ThemeEvolutionVisualization'

<ThemeEvolutionVisualization
  evolutions={themeEvolutions}
  conceptEvolutions={conceptEvolutions}
  variant="full"  // 'timeline' | 'flow' | 'semantic' | 'full'
  showPredictions={true}
/>
```

### 5. Impact Dashboard

**When to use**: Comprehensive overview at platform, organization, or storyteller level

```typescript
import { ImpactDashboard } from '@/components/impact/ImpactDashboard'

<ImpactDashboard
  view="organization"  // 'storyteller' | 'organization' | 'platform'
  narrativeArcs={arcs}
  themeEvolutions={themes}
  sroiInputs={inputs}
  sroiOutcomes={outcomes}
  rippleEffects={effects}
  totalStories={100}
  totalStorytellers={25}
/>
```

### 6. Participatory Evaluation Forms

**When to use**: Let community document interpretations and harvest outcomes

```typescript
import {
  InterpretationSessionForm,
  OutcomeHarvestingForm
} from '@/components/impact/ParticipatoryEvaluation'

// Community Interpretation
<InterpretationSessionForm
  storyId={storyId}
  onSubmit={async (session) => {
    await supabase.from('community_interpretation_sessions').insert(session)
  }}
/>

// Outcome Harvesting
<OutcomeHarvestingForm
  projectId={projectId}
  onSubmit={async (outcome) => {
    await supabase.from('harvested_outcomes').insert(outcome)
  }}
/>
```

---

## 🔧 Service Usage

### Analyze Story Arc

```typescript
import { analyzeStoryNarrativeArc } from '@/services/narrative-analysis'

// Analyze with OpenAI (recommended)
const arc = await analyzeStoryNarrativeArc(transcript, {
  method: 'openai',
  model: 'gpt-4o'
})

// Or use lexicon method (faster, no API key needed)
const arc = await analyzeStoryNarrativeArc(transcript, {
  method: 'lexicon'
})

// Save to database
await supabase.from('story_narrative_arcs').insert({
  story_id: storyId,
  ...arc
})
```

### Calculate SROI

```typescript
import { calculateSROI, FINANCIAL_PROXIES } from '@/services/sroi-calculator'

const inputs = {
  total_investment: 100000,
  funding_sources: [{ source: 'Grant', amount: 100000 }],
  period_start: '2024-01-01',
  period_end: '2024-12-31'
}

const outcomes = [
  {
    outcome_type: 'cultural_preservation',
    stakeholder_group: 'youth',
    beneficiary_count: 50,
    quantity: 50,
    financial_proxy: FINANCIAL_PROXIES.cultural_connection_youth.value,
    deadweight: 0.2,
    attribution: 0.8,
    drop_off: 0.1,
    duration_years: 3
  }
]

const result = calculateSROI(inputs, outcomes)
// result.sroi_ratio: 3.5 ($3.50 per $1 invested)
```

### Voice Analysis

```typescript
import { analyzeAndSaveAudioProsody } from '@/services/voice-analysis'

// Analyze audio file
const { prosodic, emotion } = await analyzeAndSaveAudioProsody(
  audioId,
  '/path/to/audio.wav',
  storyId
)

// prosodic.mean_pitch_hz: 180
// emotion.emotion_label: "pride"
// emotion.arousal: 0.6
```

---

## 📝 Common Integration Patterns

### Pattern 1: Story Detail Page

Add impact tab to story page:

```typescript
// src/app/stories/[id]/page.tsx

export default async function StoryPage({ params }) {
  const [activeTab, setActiveTab] = useState('story')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button onClick={() => setActiveTab('story')}>Story</button>
        <button onClick={() => setActiveTab('impact')}>Impact</button>
      </div>

      {/* Content */}
      {activeTab === 'story' && <StoryContent />}
      {activeTab === 'impact' && <StoryImpactAnalysis />}
    </div>
  )
}
```

### Pattern 2: Organization Dashboard

Add impact section to organization page:

```typescript
// src/app/organizations/[id]/page.tsx

export default async function OrganizationPage({ params }) {
  return (
    <div className="space-y-8">
      {/* Existing content */}
      <OrganizationInfo />
      <ProjectList />

      {/* Add impact section */}
      <section>
        <h2>Impact Summary</h2>
        <ImpactDashboard
          view="organization"
          organizationId={params.id}
          {...impactData}
        />
      </section>
    </div>
  )
}
```

### Pattern 3: Platform Analytics

Create admin analytics page:

```typescript
// src/app/admin/analytics/page.tsx

export default async function PlatformAnalyticsPage() {
  return (
    <ImpactDashboard
      view="platform"
      {...platformData}
    />
  )
}
```

---

## 🎨 Styling & Theming

All components use the Empathy Ledger design system and will automatically match your theme:

- Uses `EmpathyCard` with variants (warmth, insight, heritage, connection)
- Supports dark mode
- Responsive by default
- Accessible (WCAG AAA)

### Custom Colors

Components respect your theme colors:
- Primary: Story arcs, SROI ratios
- Secondary: Stakeholder groups
- Muted: Background elements

---

## 🔒 Security & Permissions

All tables have Row Level Security (RLS) enabled:

```sql
-- Public read access (view data)
CREATE POLICY "Public read access" ON story_narrative_arcs FOR SELECT USING (true);

-- Authenticated insert (community participation)
CREATE POLICY "Authenticated insert" ON community_story_responses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

To add custom RLS policies:

```sql
-- Example: Only organization members can see SROI data
CREATE POLICY "Organization members only" ON sroi_inputs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## 📦 Data Flow

### 1. Story Published
```
Story created → Transcript generated → Narrative analysis → Save to story_narrative_arcs
```

### 2. Impact Reported
```
Community observes impact → Report via form → Save to ripple_effects → Display in visualization
```

### 3. SROI Calculated
```
Define inputs → Document outcomes → Calculate SROI → Generate report → Share with funders
```

---

## 🧪 Testing with Sample Data

To test components without real data:

```typescript
// Create sample narrative arc
const sampleArc = {
  id: 'sample-1',
  story_id: 'story-1',
  arc_type: 'man_in_hole',
  arc_confidence: 0.85,
  trajectory_data: [
    { time: 0.0, valence: 0.5, arousal: 0.4 },
    { time: 0.2, valence: 0.3, arousal: 0.6 },
    { time: 0.4, valence: -0.2, arousal: 0.8 },  // Valley
    { time: 0.6, valence: 0.1, arousal: 0.7 },
    { time: 0.8, valence: 0.6, arousal: 0.5 },   // Peak
    { time: 1.0, valence: 0.7, arousal: 0.3 }
  ],
  emotional_range: 0.9,
  transformation_score: 0.2,
  volatility: 0.3,
  peak_moment: 0.8,
  valley_moment: 0.4,
  // ... other fields
}

<StoryArcVisualization arc={sampleArc} />
```

---

## 🆘 Troubleshooting

### Component not displaying?

1. **Check data structure**: Ensure your data matches the TypeScript interfaces
2. **Check imports**: Make sure you're importing from the correct path
3. **Check RLS**: Verify Row Level Security allows reading the data
4. **Check console**: Look for TypeScript or runtime errors

### SROI calculation not working?

1. **Check financial proxies**: Ensure all outcomes have valid `financial_proxy` values
2. **Check discounting**: Verify `deadweight`, `attribution`, `drop_off` are between 0-1
3. **Check duration**: Ensure `duration_years` is a positive integer

### Voice analysis failing?

1. **Setup Python**: Run `cd src/services/voice-analysis && ./setup.sh`
2. **Check audio format**: Praat works best with WAV files
3. **Check file path**: Ensure the audio file path is accessible

---

## 📚 Further Resources

- [Complete Guide](./IMPACT_ANALYSIS_README.md) - Full documentation
- [Strategy Document](./IMPACT_ANALYSIS_STRATEGY.md) - 13,000-line framework
- [Quick Reference](./VISUALIZATION_QUICK_REFERENCE.md) - Fast lookup
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md) - What's built

---

**Questions?** Check the demo page at `/impact/demo` for live examples!
