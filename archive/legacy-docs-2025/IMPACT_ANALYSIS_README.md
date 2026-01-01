# Impact Analysis & Visualization System

**Empathy Ledger v2** - Comprehensive impact measurement for Indigenous storytelling

---

## 🎯 Overview

This system provides world-class impact analysis and visualization tools specifically designed for Indigenous storytelling platforms. It combines narrative analysis, social return on investment (SROI), voice prosody analysis, and participatory evaluation in a culturally responsive framework.

## ✨ Key Features

### 1. Narrative Analysis
- **Story Arc Classification** - Identifies 8 narrative arc types including Indigenous-specific patterns (cyclical, seasonal)
- **Emotional Journey Tracking** - Maps valence and arousal throughout the story
- **Sentiment Analysis** - OpenAI-powered or lexicon-based approaches
- **Community Validation** - Community can override AI interpretations

### 2. Social Return on Investment (SROI)
- **Complete SROI Framework** - Following Social Value UK methodology
- **Financial Proxy Library** - 15+ researched proxies for social outcomes
- **Sensitivity Analysis** - Conservative, base, and optimistic scenarios
- **Multi-stakeholder Value** - Track value for storytellers, youth, elders, communities, policymakers

### 3. Voice & Audio Analysis
- **Prosodic Features** - Pitch, intensity, rhythm, pauses (via Praat)
- **Emotion Detection** - Arousal-valence mapping from voice
- **Cultural Markers** - Detect ceremonial speech, code-switching, traditional formulae
- **Voice Quality** - Jitter, shimmer, harmonics-to-noise ratio

### 4. Theme Evolution
- **Temporal Tracking** - Monitor theme prominence over time
- **Semantic Shift** - Detect how theme meanings evolve
- **Emerging Themes** - Identify new themes appearing in stories
- **Status Classification** - Emerging, growing, stable, declining, dormant, seasonal

### 5. Ripple Effects
- **5-Level Impact Model**:
  1. Storyteller (direct)
  2. Family/close relations
  3. Community
  4. Other communities
  5. Policy & systems
- **Connection Chains** - Track how one effect triggers another
- **Community Reporting** - Anyone can report observed ripple effects

### 6. Participatory Evaluation
- **Community Interpretation Sessions** - Document collective meaning-making
- **Outcome Harvesting** - Capture emergent, unexpected changes
- **Storytelling Circle Protocols** - Structured facilitation guides
- **Cultural Context** - Space for Indigenous knowledge and protocols

---

## 🏗️ Architecture

### Database Schema
15 interconnected tables with Row Level Security:
```
story_narrative_arcs          → Story emotional arcs
theme_evolution               → Theme tracking over time
theme_concept_evolution       → Semantic shift analysis
audio_prosodic_analysis       → Voice features (Praat)
audio_emotion_analysis        → Emotion from voice
cultural_speech_patterns      → Cultural markers
sroi_inputs                   → Investment tracking
sroi_outcomes                 → Outcome measurement
sroi_calculations             → SROI results
ripple_effects                → Impact spreading
harvested_outcomes            → Emergent changes
community_interpretation_sessions → Collective sense-making
storytelling_circle_evaluations → Circle protocols
community_story_responses     → Community feedback
storyteller_connections       → Network analysis
theory_of_change              → ToC framework
```

### Services
```
src/services/
├── narrative-analysis.ts      → Story arc & sentiment analysis
├── sroi-calculator.ts         → SROI calculation & templates
└── voice-analysis/
    ├── praat_analyzer.py      → Python Praat integration
    ├── requirements.txt       → Python dependencies
    └── setup.sh               → Environment setup
```

### Components
```
src/components/impact/
├── StoryArcVisualization.tsx         → Emotional journey charts
├── SROIVisualization.tsx             → SROI analysis & comparison
├── RippleEffectVisualization.tsx     → Concentric impact circles
├── ThemeEvolutionVisualization.tsx   → Theme tracking & semantic shift
├── ImpactDashboard.tsx               → Platform overview dashboard
└── ParticipatoryEvaluation.tsx       → Community evaluation tools
```

---

## 🚀 Quick Start

### 1. Run Database Migration

```bash
# Apply the impact analysis schema
supabase migration up
```

This creates all 15 tables, helper functions, and RLS policies.

### 2. Set Up Voice Analysis (Optional)

```bash
cd src/services/voice-analysis
./setup.sh
```

This installs Praat (Parselmouth), NumPy, and SciPy in a virtual environment.

### 3. Configure OpenAI API Key

For narrative analysis:

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

### 4. Use Components

```typescript
import { StoryArcVisualization } from '@/components/impact/StoryArcVisualization'
import { ImpactDashboard } from '@/components/impact/ImpactDashboard'

// In your page/component
<StoryArcVisualization
  arc={arcData}
  variant="detailed"
  showMetrics={true}
/>

<ImpactDashboard
  view="platform"
  narrativeArcs={arcs}
  sroiInputs={inputs}
  sroiOutcomes={outcomes}
/>
```

---

## 📖 Usage Examples

### Analyze Story Arc

```typescript
import { analyzeStoryNarrativeArc } from '@/services/narrative-analysis'

const arc = await analyzeStoryNarrativeArc(
  storyTranscript,
  {
    method: 'openai',  // or 'lexicon' for faster batch processing
    model: 'gpt-4o'
  }
)

// Result includes:
// - arc_type: "man_in_hole"
// - trajectory_data: [{ time: 0.1, valence: 0.5, arousal: 0.7 }, ...]
// - emotional_range: 0.8
// - transformation_score: 0.3
// - peak_moment: 0.8
// - valley_moment: 0.4
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

### Analyze Voice Prosody

```typescript
import { analyzeAndSaveAudioProsody } from '@/services/voice-analysis'

const { prosodic, emotion } = await analyzeAndSaveAudioProsody(
  audioId,
  '/path/to/audio.wav',
  storyId
)

// prosodic includes:
// - mean_pitch_hz: 180
// - pitch_range_semitones: 12
// - speech_rate_sps: 4.5
// - hnr_db: 15

// emotion includes:
// - emotion_label: "pride"
// - arousal: 0.6
// - valence: 0.7
```

### Community Interpretation Session

```typescript
import { InterpretationSessionForm } from '@/components/impact/ParticipatoryEvaluation'

<InterpretationSessionForm
  storyId={storyId}
  onSubmit={async (session) => {
    await supabase
      .from('community_interpretation_sessions')
      .insert(session)
  }}
/>
```

---

## 🎨 Visualization Components

### StoryArcVisualization

Shows emotional journey through a story.

**Props**:
- `arc`: Story arc data
- `variant`: 'compact' | 'default' | 'detailed'
- `showMetrics`: boolean
- `showDescription`: boolean

**Features**:
- Line chart with area fill
- Peak and valley markers
- Arc type badge
- Emotional range, transformation, volatility metrics
- Narrative segments (opening, crisis, resolution)

### SROIVisualization

Complete SROI analysis display.

**Props**:
- `inputs`: SROI input data
- `outcomes`: Array of outcomes
- `calculation`: Optional pre-calculated result
- `variant`: 'full' | 'summary' | 'compact'

**Features**:
- Hero SROI ratio display
- Sensitivity analysis (conservative/base/optimistic)
- Stakeholder pie chart
- Value breakdown
- Key findings and recommendations

### RippleEffectVisualization

Concentric circles showing impact spread.

**Props**:
- `effects`: Array of ripple effects
- `variant`: 'compact' | 'default' | 'detailed'
- `allowReporting`: boolean

**Features**:
- 5 concentric circles (storyteller → policy)
- Effect dots sized by people affected
- Connection lines for triggered effects
- Timeline view
- Community reporting form

### ThemeEvolutionVisualization

Theme prominence over time.

**Props**:
- `evolutions`: Theme evolution data
- `conceptEvolutions`: Semantic shift data
- `variant`: 'timeline' | 'flow' | 'semantic' | 'full'
- `showPredictions`: boolean

**Features**:
- Stacked area timeline
- Emerging/growing/stable status
- Semantic shift scatter plot
- Theme comparison
- Trend predictions

### ImpactDashboard

Comprehensive platform overview.

**Props**:
- `view`: 'storyteller' | 'organization' | 'platform'
- All data arrays (arcs, themes, SROI, ripples)
- Summary metrics

**Features**:
- Tabbed interface (overview, stories, themes, impact, network)
- Key metrics grid
- All visualizations integrated
- Export functionality

### ParticipatoryEvaluation

Community evaluation tools.

**Components**:
- `InterpretationSessionForm` - Document collective meaning-making
- `OutcomeHarvestingForm` - Capture emergent outcomes
- `InterpretationSessionsList` - View past sessions
- `HarvestedOutcomesList` - View harvested outcomes

**Features**:
- Cultural context field
- Consensus & divergent views tracking
- Evidence-based outcome documentation
- Community validation flags

---

## 🔬 Research Foundation

### Narrative Analysis
- **University of Vermont** - Validated 6 emotional arcs in 1,700+ stories
- **Reagan et al. (2016)** - "The emotional arcs of stories are dominated by six basic shapes"

### SROI
- **Social Value UK** - Official SROI framework
- **HACT Social Value Bank** - Financial proxy values
- **New Economics Foundation** - Well-being valuation

### Voice Analysis
- **Praat** - Industry-standard phonetics software (Boersma & Weenink)
- **Arousal-Valence Model** - Russell's circumplex model of affect
- **Scherer's Component Process Model** - Voice emotion recognition

### Indigenous Methodologies
- **Wilson's Relational Accountability** - Research is Ceremony
- **Kirkness & Barnhardt** - Four R's (Respect, Relevance, Reciprocity, Responsibility)
- **OCAP Principles** - Ownership, Control, Access, Possession

---

## 🛡️ Cultural Safety

### Data Sovereignty
- Row Level Security on all tables
- Storyteller consent required
- Community approval workflows
- Export restrictions

### Community Control
- Override AI interpretations
- Validate/invalidate analyses
- Report ripple effects
- Lead interpretation sessions

### Respect for Protocols
- Cyclical and seasonal arc types
- Cultural context documentation
- Traditional knowledge markers
- Ceremonial speech detection

---

## 📊 Metrics & KPIs

### Story-Level
- Emotional range (0-2)
- Transformation score (-1 to +1)
- Valence/arousal trajectories
- Arc type distribution

### Platform-Level
- Total stories analyzed
- Active themes
- Emerging themes
- SROI ratio
- People affected by ripples
- Community validation rate

### Voice-Level
- Mean pitch (Hz)
- Pitch range (semitones)
- Speech rate (syllables/second)
- Voice quality (HNR dB)
- Emotion distribution

---

## 🧪 Testing

```bash
# Test narrative analysis
npm run test src/services/__tests__/narrative-analysis.test.ts

# Test SROI calculator
npm run test src/services/__tests__/sroi-calculator.test.ts

# Test voice analysis (requires Python setup)
cd src/services/voice-analysis
python3 -m pytest tests/
```

---

## 📈 Performance

### Optimization Strategies
- **Batch processing** - Analyze multiple stories at once
- **Lexicon fallback** - Fast sentiment without API calls
- **Database functions** - Auto-calculate SROI values
- **Cached queries** - React Query for visualization data
- **Recharts** - Performant chart rendering

### Scalability
- **RLS policies** - Database-level multi-tenancy
- **Helper functions** - Auto-detect connections
- **Indexed columns** - Fast theme/storyteller queries
- **JSONB** - Flexible data structures

---

## 🤝 Contributing

When adding new impact analysis features:

1. **Update database schema** - Add tables/columns to migration
2. **Add TypeScript types** - Update `impact-analysis.ts`
3. **Create service** - Add calculation/analysis logic
4. **Build visualization** - Create React component
5. **Update dashboard** - Integrate into `ImpactDashboard`
6. **Document** - Add to this README

---

## 📚 Further Reading

- [IMPACT_ANALYSIS_STRATEGY.md](./IMPACT_ANALYSIS_STRATEGY.md) - Complete 13,000-line framework
- [VISUALIZATION_QUICK_REFERENCE.md](./VISUALIZATION_QUICK_REFERENCE.md) - Quick lookup guide
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) - What's built and what's next

---

## 🙏 Acknowledgments

Built with respect for Indigenous storytelling traditions and in partnership with storytellers, Elders, and communities.

**Research Partners**: University of Vermont (narrative arcs), Social Value UK (SROI), Praat developers

**Community Partners**: Indigenous storytellers and knowledge keepers who guide this work

---

**Version**: 1.0.0 (Phase 1 + Phase 2 Complete)
**Last Updated**: December 25, 2025
**License**: Proprietary - Empathy Ledger v2
