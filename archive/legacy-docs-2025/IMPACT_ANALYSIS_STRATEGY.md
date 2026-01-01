# Empathy Ledger Impact Analysis & Visualization Strategy

**Comprehensive framework for storyteller impact analysis, voice analysis, and social return measurement**

---

## Executive Summary

This document outlines a world-class impact analysis framework for the Empathy Ledger platform, integrating:

- **Narrative Analysis**: Story arc visualization, sentiment flow, thematic evolution
- **Voice Analysis**: Prosodic patterns, emotional tone, cultural linguistics
- **Social Impact Measurement**: SROI, Theory of Change, ripple effect mapping
- **Network Analysis**: Storyteller connections, theme networks, community impact
- **Cultural Responsiveness**: Indigenous methodologies, participatory evaluation, storyteller sovereignty

The framework prioritizes **culturally appropriate**, **technically rigorous**, and **community-empowering** approaches that respect Indigenous knowledge systems while demonstrating measurable impact.

---

## Table of Contents

1. [Platform Architecture Integration](#1-platform-architecture-integration)
2. [Narrative Analysis Pipeline](#2-narrative-analysis-pipeline)
3. [Voice & Audio Analysis](#3-voice--audio-analysis)
4. [Social Impact Measurement](#4-social-impact-measurement)
5. [Network & Relationship Analysis](#5-network--relationship-analysis)
6. [Indigenous Methodologies](#6-indigenous-methodologies)
7. [Visualization Dashboard Strategy](#7-visualization-dashboard-strategy)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Tools & Technologies](#9-tools--technologies)
10. [Ethical Considerations](#10-ethical-considerations)

---

## 1. Platform Architecture Integration

### Current Empathy Ledger Data Assets

**Already in Database:**
- ✅ Stories with transcripts and metadata
- ✅ Storyteller profiles with demographics
- ✅ Organizations and projects
- ✅ Themes extracted via AI (OpenAI embeddings)
- ✅ Quotes with impact scores
- ✅ Audio/video media files
- ✅ Consent and cultural protocol tracking
- ✅ Multi-site visibility system

**Analysis Gaps to Fill:**
- ⚠️ Narrative arc/emotional trajectory tracking
- ⚠️ Voice prosody and emotional tone analysis
- ⚠️ SROI and impact value quantification
- ⚠️ Storyteller network visualization
- ⚠️ Ripple effect mapping
- ⚠️ Longitudinal impact tracking
- ⚠️ Participatory evaluation frameworks

### Data Flow for Impact Analysis

```
Story Submission
    ↓
[Audio/Video Upload] → [Transcription] → [Text Analysis]
                            ↓                    ↓
                    [Voice Analysis]     [Narrative Analysis]
                            ↓                    ↓
                    [Emotion Detection]  [Theme Extraction]
                            ↓                    ↓
                        [Impact Metrics Dashboard]
                                    ↓
                            [Network Analysis]
                                    ↓
                        [Community Impact Visualization]
                                    ↓
                            [SROI Calculation]
```

---

## 2. Narrative Analysis Pipeline

### 2.1 Story Arc Visualization

**Goal**: Visualize emotional trajectory of each story using validated computational methods.

**Methodology**:
Based on University of Vermont's research identifying six core emotional arcs:
1. **Rags to Riches** - steady emotional rise
2. **Tragedy** - steady emotional fall
3. **Man in a Hole** - fall then rise
4. **Icarus** - rise then fall
5. **Cinderella** - rise-fall-rise
6. **Oedipus** - fall-rise-fall

**Technical Implementation**:

```typescript
// Database schema addition
CREATE TABLE story_narrative_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),

  -- Arc classification
  arc_type VARCHAR(50), -- 'rags_to_riches', 'tragedy', etc.
  arc_confidence FLOAT, -- 0.0 to 1.0

  -- Emotional trajectory data
  trajectory_data JSONB, -- [{time: 0.1, valence: 0.45}, ...]

  -- Segmentation
  segments JSONB, -- [{start: 0, end: 0.3, emotion: 'struggle'}, ...]

  -- Metrics
  emotional_range FLOAT, -- max - min valence
  volatility FLOAT, -- standard deviation
  transformation_score FLOAT, -- beginning vs. end delta

  -- Analysis metadata
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_version VARCHAR(20)
);
```

**Sentiment Analysis Approach**:

1. **Lexicon-Based Scoring** (quick, multilingual):
   - Use sentiment lexicon (10,000 words scored 1-9)
   - Sliding window through transcript (500-word segments)
   - Calculate average valence per segment
   - Plot emotional trajectory

2. **AI-Based Analysis** (deeper, context-aware):
   - OpenAI API for emotional analysis
   - Extract: joy, sadness, anger, fear, surprise, trust
   - Generate narrative tension curve
   - Identify transformation moments

**Visualization Component**:

```typescript
// Component: StoryArcVisualization.tsx
interface StoryArcProps {
  storyId: string
  trajectoryData: Array<{ time: number; valence: number }>
  arcType: 'rags_to_riches' | 'tragedy' | 'man_in_hole' | 'icarus' | 'cinderella' | 'oedipus'
}

export function StoryArcVisualization({ storyId, trajectoryData, arcType }: StoryArcProps) {
  return (
    <EmpathyCard variant="insight">
      <CardHeader
        title="Emotional Journey"
        subtitle={arcTypeLabels[arcType]}
      />
      <CardContent>
        {/* D3 line chart showing emotional valence over story progression */}
        <svg className="w-full h-64">
          <path d={lineGenerator(trajectoryData)} fill="none" stroke="#BFA888" strokeWidth={3} />
          {/* Add annotations for key moments */}
        </svg>

        {/* Story structure labels */}
        <div className="mt-4 flex justify-between text-sm">
          <span>Beginning</span>
          <span>Crisis/Turning Point</span>
          <span>Resolution</span>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Metrics Displayed**:
- Arc type classification
- Emotional range (how much variation)
- Transformation score (beginning vs. end)
- Key emotional moments (peaks/valleys)

**Cultural Considerations**:
- Some Indigenous narratives follow circular rather than linear arcs
- Include "Cyclical" and "Spiral" arc types for seasonal/ceremonial stories
- Allow storyteller to override AI classification
- Respect non-Western narrative structures

### 2.2 Thematic Evolution Tracking

**Goal**: Track how themes emerge, evolve, and connect across time and storytellers.

**Database Schema**:

```sql
CREATE TABLE theme_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id),

  -- Temporal data
  time_period VARCHAR(20), -- 'Q1 2024', 'Winter 2024', etc.

  -- Prevalence metrics
  story_count INTEGER, -- How many stories mention this theme
  prominence_avg FLOAT, -- Average prominence score

  -- Emergence indicators
  is_emerging BOOLEAN, -- Newly appeared theme
  growth_rate FLOAT, -- Rate of increase

  -- Co-occurrence with other themes
  connected_themes JSONB -- [{theme_id: '...', co_occurrence: 0.65}, ...]
);

CREATE TABLE theme_concept_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id),
  time_period VARCHAR(20),

  -- Semantic shift tracking
  representative_quotes TEXT[],
  key_concepts TEXT[], -- ['sovereignty', 'land rights', 'self-determination']
  sentiment_shift FLOAT -- How sentiment about this theme changed
);
```

**Visualization**: Alluvial/Sankey diagrams showing theme flows over time.

```typescript
// Component: ThemeEvolutionFlow.tsx
interface ThemeFlowData {
  themes: Array<{
    id: string
    name: string
    periods: Array<{
      period: string
      storyCount: number
      prominence: number
    }>
  }>
}

export function ThemeEvolutionFlow({ themes }: { themes: ThemeFlowData }) {
  return (
    <EmpathyCard variant="insight" elevation="focused">
      <CardHeader
        title="Theme Evolution Over Time"
        subtitle="How community priorities and narratives shift"
      />
      <CardContent>
        {/* Alluvial diagram showing theme flows across time periods */}
        <svg className="w-full h-96">
          {/* Time period columns */}
          {/* Theme flows (width = prevalence) */}
          {/* Emerging themes highlighted */}
          {/* Declining themes faded */}
        </svg>

        {/* Interactive legend */}
        <ThemeLegend
          themes={themes}
          onThemeClick={highlightTheme}
        />
      </CardContent>
    </EmpathyCard>
  )
}
```

**Analysis Features**:
- Identify emerging community concerns
- Track cultural revitalization themes
- Monitor sentiment shifts around specific topics
- Detect theme splitting/merging
- Find seasonal/cyclical themes

### 2.3 Quote Impact Scoring & Visualization

**Enhanced Quote Analysis**:

Currently have: Quote extraction with basic impact scores.

**Add**:
- Rhetorical device detection (metaphor, repetition, imagery)
- Cultural reference identification
- Emotional resonance scoring
- Shareability prediction
- Cross-story quote clustering

**Visualization**:

```typescript
// Component: QuoteImpactNetwork.tsx
interface Quote {
  id: string
  text: string
  storyteller: string
  impactScore: number
  themes: string[]
  rhetoricalDevices: string[]
  culturalReferences: string[]
  relatedQuotes: string[] // Similar quotes from other storytellers
}

export function QuoteImpactNetwork({ quotes }: { quotes: Quote[] }) {
  return (
    <EmpathyCard variant="heritage">
      <CardHeader title="Voices Across Stories" />
      <CardContent>
        {/* Force-directed graph */}
        {/* Nodes = quotes (size = impact score) */}
        {/* Edges = thematic/semantic similarity */}
        {/* Color by theme */}
        {/* Hover shows full quote + context */}
      </CardContent>
    </EmpathyCard>
  )
}
```

**Metrics**:
- Impact score (AI-generated, 0-100)
- Thematic centrality (how core to theme)
- Cross-story resonance (similar expressions)
- Rhetorical strength (use of literary devices)
- Cultural significance (reference to traditions)

---

## 3. Voice & Audio Analysis

### 3.1 Prosodic Analysis (Pitch, Intonation, Rhythm)

**Goal**: Extract emotional and cultural meaning from voice patterns, not just words.

**Why This Matters**:
- Oral traditions convey meaning through *how* stories are told
- Prosody reveals emotion, emphasis, cultural protocols
- Elders' voice patterns preserve linguistic heritage
- Stress, pause, and rhythm carry cultural significance

**Technical Implementation**:

**Tool Selection**: **Praat** (open-source, gold standard for linguistic research)

```bash
# Install Praat
brew install praat  # macOS

# Alternative: Python integration
pip install praat-parselmouth
```

**Analysis Pipeline**:

```python
# scripts/analyze-voice-prosody.py
import parselmouth
from parselmouth.praat import call
import numpy as np

def analyze_prosody(audio_path):
    """
    Extract prosodic features from audio file
    """
    sound = parselmouth.Sound(audio_path)

    # Extract pitch (F0) contour
    pitch = sound.to_pitch()
    pitch_values = pitch.selected_array['frequency']
    pitch_values[pitch_values == 0] = np.nan  # Remove unvoiced segments

    # Extract intensity (loudness)
    intensity = sound.to_intensity()
    intensity_values = intensity.values[0]

    # Calculate prosodic metrics
    metrics = {
        'pitch_mean': np.nanmean(pitch_values),
        'pitch_std': np.nanstd(pitch_values),
        'pitch_range': np.nanmax(pitch_values) - np.nanmin(pitch_values),
        'intensity_mean': np.mean(intensity_values),
        'intensity_std': np.std(intensity_values),

        # Speaking rate
        'duration': sound.duration,
        'syllable_rate': estimate_syllable_rate(sound),

        # Pauses
        'pause_count': count_pauses(intensity_values),
        'avg_pause_duration': avg_pause_duration(intensity_values),

        # Voice quality
        'harmonics_to_noise_ratio': calculate_hnr(sound)
    }

    # Time-series data for visualization
    time_series = {
        'time': pitch.xs(),
        'pitch': pitch_values,
        'intensity': intensity_values
    }

    return metrics, time_series
```

**Database Schema**:

```sql
CREATE TABLE audio_prosodic_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id),
  story_id UUID REFERENCES stories(id),

  -- Pitch metrics
  pitch_mean_hz FLOAT,
  pitch_std_hz FLOAT,
  pitch_range_hz FLOAT,
  pitch_contour JSONB, -- Time-series data

  -- Intensity metrics
  intensity_mean_db FLOAT,
  intensity_std_db FLOAT,
  intensity_contour JSONB,

  -- Speaking rate
  duration_seconds FLOAT,
  syllable_rate FLOAT, -- syllables per second
  speaking_rate_category VARCHAR(20), -- 'slow', 'moderate', 'fast'

  -- Pauses
  pause_count INTEGER,
  avg_pause_duration_sec FLOAT,
  pause_locations JSONB, -- [{time: 23.4, duration: 1.2}, ...]

  -- Voice quality
  harmonics_to_noise_ratio FLOAT,

  -- Cultural linguistic markers
  tonal_variation_pattern VARCHAR(50), -- For tonal languages
  ceremonial_prosody BOOLEAN, -- Detected formal/ceremonial speech patterns

  analyzed_at TIMESTAMPTZ DEFAULT now()
);
```

**Visualization Component**:

```typescript
// Component: VoiceProsodyVisualization.tsx
interface ProsodyData {
  pitchContour: Array<{ time: number; pitch: number }>
  intensityContour: Array<{ time: number; intensity: number }>
  pauses: Array<{ time: number; duration: number }>
  metrics: {
    pitchMean: number
    pitchRange: number
    speakingRate: number
    hnr: number
  }
}

export function VoiceProsodyVisualization({ data }: { data: ProsodyData }) {
  return (
    <EmpathyCard variant="warmth">
      <CardHeader
        title="Voice Analysis"
        subtitle="The music of storytelling"
      />
      <CardContent>
        {/* Pitch contour visualization */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Pitch Contour (Intonation)</h4>
          <svg className="w-full h-32">
            <path
              d={lineGenerator(data.pitchContour)}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth={2}
            />
            {/* Mark pauses with vertical lines */}
            {data.pauses.map(pause => (
              <line
                x1={timeToX(pause.time)}
                x2={timeToX(pause.time)}
                y1={0}
                y2={128}
                stroke="#D4C4A8"
                strokeWidth={pause.duration * 2}
                opacity={0.5}
              />
            ))}
          </svg>
        </div>

        {/* Intensity visualization */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Intensity (Loudness)</h4>
          <svg className="w-full h-32">
            <path
              d={areaGenerator(data.intensityContour)}
              fill="#BFA888"
              opacity={0.4}
            />
          </svg>
        </div>

        {/* Prosodic metrics */}
        <MetricGrid columns={4} metrics={[
          { label: 'Pitch Range', value: `${Math.round(data.metrics.pitchRange)} Hz` },
          { label: 'Speaking Rate', value: `${data.metrics.speakingRate.toFixed(1)} syl/s` },
          { label: 'Voice Quality (HNR)', value: `${data.metrics.hnr.toFixed(1)} dB` },
          { label: 'Pauses', value: data.pauses.length.toString() }
        ]} />
      </CardContent>
    </EmpathyCard>
  )
}
```

**Cultural Applications**:
- **Preserving Linguistic Heritage**: Document tonal patterns in endangered languages
- **Emotional Authenticity**: Detect genuine emotion vs. performed narratives
- **Ceremonial Speech Recognition**: Identify formal/sacred speech patterns
- **Storyteller Health Monitoring**: Voice stress may indicate trauma/wellbeing concerns
- **Intergenerational Comparison**: Compare Elder vs. youth prosodic patterns

### 3.2 Speech Emotion Recognition

**Goal**: Automatically detect emotional states in storyteller voices.

**Methodology**: Paralinguistic feature analysis (language-independent, works across all Indigenous languages)

**Features Extracted**:
- Mel-frequency cepstral coefficients (MFCC)
- Spectral centroid and rolloff
- Pitch dynamics
- Energy envelope
- Speaking rate variations

**Implementation**:

```python
# scripts/analyze-speech-emotion.py
import librosa
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib  # Load pre-trained emotion model

def extract_emotion_features(audio_path):
    """
    Extract paralinguistic features for emotion recognition
    """
    y, sr = librosa.load(audio_path, sr=16000)

    # MFCCs (13 coefficients)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfccs_mean = np.mean(mfccs, axis=1)
    mfccs_std = np.std(mfccs, axis=1)

    # Spectral features
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)

    # Prosodic features
    pitch, _ = librosa.piptrack(y=y, sr=sr)
    pitch_mean = np.mean(pitch[pitch > 0])

    # Energy
    rms = librosa.feature.rms(y=y)

    # Combine all features
    features = np.concatenate([
        mfccs_mean,
        mfccs_std,
        [np.mean(spectral_centroid), np.std(spectral_centroid)],
        [np.mean(spectral_rolloff), np.std(spectral_rolloff)],
        [pitch_mean],
        [np.mean(rms), np.std(rms)]
    ])

    return features

def predict_emotion(audio_path, model_path='models/emotion_classifier.pkl'):
    """
    Predict emotion from audio
    """
    features = extract_emotion_features(audio_path)
    features = features.reshape(1, -1)

    # Load pre-trained model
    model = joblib.load(model_path)
    scaler = joblib.load(model_path.replace('.pkl', '_scaler.pkl'))

    features_scaled = scaler.transform(features)

    # Predict emotion probabilities
    emotion_probs = model.predict_proba(features_scaled)[0]

    emotions = ['neutral', 'joy', 'sadness', 'anger', 'fear']

    return {
        'primary_emotion': emotions[np.argmax(emotion_probs)],
        'confidence': np.max(emotion_probs),
        'all_emotions': dict(zip(emotions, emotion_probs))
    }
```

**Database Schema**:

```sql
CREATE TABLE audio_emotion_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id),
  story_id UUID REFERENCES stories(id),

  -- Emotion detection
  primary_emotion VARCHAR(20), -- 'joy', 'sadness', 'neutral', 'anger', 'fear'
  confidence FLOAT, -- 0.0 to 1.0

  -- All emotion probabilities
  emotion_joy FLOAT,
  emotion_sadness FLOAT,
  emotion_anger FLOAT,
  emotion_fear FLOAT,
  emotion_neutral FLOAT,

  -- Temporal emotion data (emotion over time)
  emotion_timeline JSONB, -- [{time: 5.2, emotion: 'joy', conf: 0.82}, ...]

  -- Arousal and valence
  arousal_level FLOAT, -- High energy vs. low energy
  valence FLOAT, -- Positive vs. negative

  analyzed_at TIMESTAMPTZ DEFAULT now()
);
```

**Visualization**:

```typescript
// Component: EmotionTimeline.tsx
export function EmotionTimeline({ emotionData }: { emotionData: EmotionTimelineData }) {
  return (
    <EmpathyCard variant="insight">
      <CardHeader
        title="Emotional Journey Through Voice"
        subtitle="AI-detected emotions from speech patterns"
      />
      <CardContent>
        {/* Stacked area chart showing emotion probabilities over time */}
        <svg className="w-full h-48">
          {/* Each emotion as colored layer */}
          <StackedArea
            data={emotionData.timeline}
            emotions={['joy', 'sadness', 'anger', 'fear', 'neutral']}
            colors={{
              joy: '#10B981',
              sadness: '#3B82F6',
              anger: '#EF4444',
              fear: '#8B5CF6',
              neutral: '#6B7280'
            }}
          />
        </svg>

        {/* Dominant emotion summary */}
        <div className="mt-4 flex gap-2">
          <EmpathyBadge variant="emotion" emotion="joy">
            Joy: {Math.round(emotionData.summary.joy * 100)}%
          </EmpathyBadge>
          <EmpathyBadge variant="emotion" emotion="sadness">
            Sadness: {Math.round(emotionData.summary.sadness * 100)}%
          </EmpathyBadge>
          {/* ... other emotions */}
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Ethical Considerations**:
- ⚠️ **Do NOT use for deception detection** (scientifically invalid, culturally inappropriate)
- ✅ Use for understanding emotional impact of storytelling
- ✅ Help identify stories needing trauma-informed support
- ✅ Track collective emotional resilience
- ✅ Validate that difficult stories are being heard with appropriate gravity

### 3.3 Cultural Linguistics Markers

**Goal**: Detect and preserve culturally specific speech patterns.

**Features to Track**:
- Code-switching patterns (shifting between languages)
- Traditional storytelling formulae ("Long ago...", "They say...")
- Ceremonial speech markers
- Call-and-response patterns
- Oral poetry structures (rhythm, repetition)

**Implementation** (requires Indigenous language expertise):

```sql
CREATE TABLE cultural_speech_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),
  language_code VARCHAR(10), -- ISO code or custom for Indigenous langs

  -- Code-switching
  code_switching_detected BOOLEAN,
  primary_language VARCHAR(50),
  secondary_languages TEXT[],
  switching_points JSONB, -- [{time: 34.2, from: 'Cree', to: 'English'}, ...]

  -- Traditional formulae
  storytelling_formulae TEXT[], -- Detected opening/closing phrases
  ceremonial_markers BOOLEAN,

  -- Oral poetry
  repetition_patterns JSONB,
  rhythmic_structure VARCHAR(50),

  -- Community validation
  validated_by UUID REFERENCES profiles(id),
  cultural_notes TEXT
);
```

---

## 4. Social Impact Measurement

### 4.1 Social Return on Investment (SROI)

**Goal**: Quantify the social value created by storytelling initiatives.

**SROI Formula**:
```
SROI Ratio = (Social Value Created) / (Investment)
```

**Example**: For every $1 invested in storytelling program, $3.50 in social value is returned.

**What Counts as Social Value**:
- Cultural preservation (language retention, tradition transmission)
- Community healing (reduced trauma, increased wellbeing)
- Youth engagement (connection to Elders, cultural pride)
- Policy influence (stories leading to law changes)
- Intergenerational knowledge transfer

**Database Schema**:

```sql
CREATE TABLE sroi_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Financial inputs
  total_investment DECIMAL(12,2),
  funding_sources JSONB, -- [{source: 'Grant ABC', amount: 50000}, ...]

  -- Resource inputs
  staff_hours FLOAT,
  volunteer_hours FLOAT,
  in_kind_contributions JSONB
);

CREATE TABLE sroi_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Outcome description
  outcome_type VARCHAR(50), -- 'cultural_preservation', 'community_healing', etc.
  outcome_description TEXT,

  -- Beneficiaries
  stakeholder_group VARCHAR(50), -- 'storytellers', 'youth', 'community', 'elders'
  beneficiary_count INTEGER,

  -- Quantification
  quantity FLOAT, -- How much change occurred
  financial_proxy DECIMAL(12,2), -- Dollar value assigned to outcome
  financial_proxy_rationale TEXT, -- Why this value

  -- Attribution factors
  deadweight FLOAT, -- What would have happened anyway (0.0-1.0)
  attribution FLOAT, -- Contribution of others (0.0-1.0)
  drop_off FLOAT, -- Decline over time (0.0-1.0)

  -- Duration
  duration_years FLOAT, -- How long impact lasts

  -- Evidence
  evidence_sources JSONB, -- [{type: 'survey', description: '...'}, ...]

  -- Calculated value
  total_value DECIMAL(12,2) -- Quantity × Financial Proxy × Attribution × Duration
);

CREATE TABLE sroi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  calculation_date TIMESTAMPTZ DEFAULT now(),

  -- Calculation
  total_investment DECIMAL(12,2),
  total_social_value DECIMAL(12,2),
  sroi_ratio FLOAT, -- total_social_value / total_investment

  -- Sensitivity analysis
  conservative_ratio FLOAT,
  optimistic_ratio FLOAT,

  -- Report
  methodology_notes TEXT,
  assumptions JSONB,
  stakeholder_validation JSONB
);
```

**Example SROI Calculation**:

```typescript
// services/sroi-calculator.ts
interface SROIOutcome {
  outcomeType: string
  stakeholderGroup: string
  beneficiaryCount: number
  quantity: number // e.g., 50 youth gained cultural pride
  financialProxy: number // e.g., $500 value per youth
  deadweight: number // 0.2 = 20% would have happened anyway
  attribution: number // 0.8 = we contributed 80%
  dropOff: number // 0.1 = 10% decline per year
  durationYears: number // 3 years
}

function calculateOutcomeValue(outcome: SROIOutcome): number {
  const grossValue = outcome.quantity * outcome.financialProxy

  // Apply discounting factors
  const netValue = grossValue * (1 - outcome.deadweight) * outcome.attribution

  // Calculate present value over duration with drop-off
  let totalValue = 0
  for (let year = 1; year <= outcome.durationYears; year++) {
    const yearlyValue = netValue * Math.pow(1 - outcome.dropOff, year - 1)
    const discountedValue = yearlyValue / Math.pow(1.035, year) // 3.5% discount rate
    totalValue += discountedValue
  }

  return totalValue
}

function calculateSROI(investment: number, outcomes: SROIOutcome[]): number {
  const totalSocialValue = outcomes.reduce(
    (sum, outcome) => sum + calculateOutcomeValue(outcome),
    0
  )

  return totalSocialValue / investment
}

// Example usage
const storytellingProjectSROI = calculateSROI(
  100000, // $100k investment
  [
    {
      outcomeType: 'cultural_preservation',
      stakeholderGroup: 'youth',
      beneficiaryCount: 50,
      quantity: 50,
      financialProxy: 500, // Value of cultural connection per youth
      deadweight: 0.2,
      attribution: 0.8,
      dropOff: 0.1,
      durationYears: 3
    },
    {
      outcomeType: 'intergenerational_connection',
      stakeholderGroup: 'elders',
      beneficiaryCount: 20,
      quantity: 20,
      financialProxy: 300, // Value of purpose/contribution
      deadweight: 0.3,
      attribution: 0.9,
      dropOff: 0.05,
      durationYears: 2
    }
    // ... more outcomes
  ]
)

// Result: e.g., 3.5 (for every $1, $3.50 in social value created)
```

**Visualization**:

```typescript
// Component: SROIVisualization.tsx
export function SROIVisualization({ project }: { project: Project }) {
  return (
    <EmpathyCard variant="warmth" elevation="focused">
      <CardHeader
        title="Social Return on Investment"
        subtitle={`${project.name} Impact Analysis`}
      />
      <CardContent>
        {/* Main SROI ratio */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-primary-600">
            ${project.sroi.ratio.toFixed(2)}
          </div>
          <div className="text-lg text-muted-foreground mt-2">
            for every $1 invested
          </div>
        </div>

        {/* Sankey diagram: Investment → Outcomes → Value */}
        <SankeyDiagram
          inputs={project.sroi.inputs}
          outcomes={project.sroi.outcomes}
          totalValue={project.sroi.totalValue}
        />

        {/* Outcome breakdown */}
        <div className="mt-6 space-y-3">
          {project.sroi.outcomes.map(outcome => (
            <div key={outcome.id} className="border-l-4 border-primary-300 pl-4">
              <h4 className="font-medium">{outcome.outcomeDescription}</h4>
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                <span>{outcome.beneficiaryCount} people</span>
                <span>${outcome.totalValue.toLocaleString()} value</span>
                <span>{outcome.durationYears} years</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sensitivity analysis */}
        <div className="mt-6 p-4 bg-amber-50 rounded">
          <h4 className="font-medium mb-2">Sensitivity Analysis</h4>
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Conservative:</span>
              <span className="ml-2 font-medium">${project.sroi.conservative.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Optimistic:</span>
              <span className="ml-2 font-medium">${project.sroi.optimistic.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Stakeholder-Specific Value**:

Track different value types for different groups:

| Stakeholder | Outcome Type | Financial Proxy | Rationale |
|-------------|--------------|-----------------|-----------|
| Storytellers | Healing & wellbeing | $300/person | Equivalent to counseling sessions |
| Youth | Cultural connection | $500/person | Equivalent to cultural camp attendance |
| Elders | Purpose & contribution | $300/person | Wellbeing value of meaningful engagement |
| Community | Cultural preservation | $1000/language item | Cost to recreate lost knowledge |
| Researchers | Access to knowledge | $200/hour | Value of research time saved |
| Policy makers | Evidence for decisions | $5000/policy | Cost of commissioning research |

### 4.2 Theory of Change Visualization

**Goal**: Map the logical pathway from inputs to long-term impact.

**Structure**:
```
Inputs → Activities → Outputs → Outcomes → Impact
```

**Example for Storytelling Program**:

```
INPUTS:
- Funding ($100k)
- Staff (2 FTE)
- Recording equipment
- Elder knowledge holders

ACTIVITIES:
- Story recording sessions
- Training workshops
- Community gatherings
- Digital archiving

OUTPUTS:
- 50 stories recorded
- 100 youth trained
- 20 Elders engaged
- Digital archive launched

SHORT-TERM OUTCOMES (0-1 year):
- Youth report increased cultural pride
- Elders feel valued and heard
- Community access to stories

MEDIUM-TERM OUTCOMES (1-3 years):
- Language retention improves
- Intergenerational relationships strengthen
- Traditional knowledge applied

LONG-TERM IMPACT (3+ years):
- Cultural revitalization
- Community resilience
- Self-determination strengthened
```

**Database Schema**:

```sql
CREATE TABLE theory_of_change (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Each stage
  inputs JSONB,
  activities JSONB,
  outputs JSONB,
  short_term_outcomes JSONB,
  medium_term_outcomes JSONB,
  long_term_impact JSONB,

  -- Assumptions and risks
  assumptions JSONB,
  external_factors JSONB,

  -- Evidence needed
  indicators JSONB, -- How we'll measure each stage

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Visualization Component**:

```typescript
// Component: TheoryOfChangeFlow.tsx
export function TheoryOfChangeFlow({ toc }: { toc: TheoryOfChange }) {
  return (
    <EmpathyCard variant="insight" elevation="focused">
      <CardHeader
        title="Theory of Change"
        subtitle="How storytelling creates lasting impact"
      />
      <CardContent>
        {/* Flow diagram with cards for each stage */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          <TOCStage
            title="Inputs"
            items={toc.inputs}
            color="blue"
          />

          <ArrowRight className="self-center text-muted-foreground" />

          <TOCStage
            title="Activities"
            items={toc.activities}
            color="purple"
          />

          <ArrowRight className="self-center" />

          <TOCStage
            title="Outputs"
            items={toc.outputs}
            color="green"
          />

          <ArrowRight className="self-center" />

          <TOCStage
            title="Outcomes"
            items={[...toc.shortTerm, ...toc.mediumTerm]}
            color="amber"
          />

          <ArrowRight className="self-center" />

          <TOCStage
            title="Impact"
            items={toc.longTerm}
            color="primary"
          />
        </div>

        {/* Assumptions and risks */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded">
            <h4 className="font-medium mb-2">Key Assumptions</h4>
            <ul className="list-disc list-inside text-sm">
              {toc.assumptions.map((assumption, i) => (
                <li key={i}>{assumption}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-red-50 rounded">
            <h4 className="font-medium mb-2">External Factors</h4>
            <ul className="list-disc list-inside text-sm">
              {toc.externalFactors.map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

### 4.3 Ripple Effect Mapping

**Goal**: Visualize how storytelling impacts spread through concentric circles of influence.

**Circles of Impact**:
1. **Center**: Storyteller (healing, voice, agency)
2. **First Ring**: Family & close community (understanding, connection)
3. **Second Ring**: Wider community (awareness, empathy)
4. **Third Ring**: Other communities (inspiration, solidarity)
5. **Outer Ring**: Policy & systems (evidence for change, public discourse)

**Database Schema**:

```sql
CREATE TABLE ripple_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),
  project_id UUID REFERENCES projects(id),

  -- Effect description
  effect_description TEXT,
  effect_type VARCHAR(50), -- 'healing', 'awareness', 'policy', 'action', etc.

  -- Ripple level
  ripple_level INTEGER, -- 1 (direct) to 5 (systemic)
  ripple_label VARCHAR(50), -- 'storyteller', 'family', 'community', etc.

  -- Reach
  people_affected INTEGER,
  geographic_reach VARCHAR(50), -- 'local', 'regional', 'national', 'international'

  -- Timing
  occurred_at TIMESTAMPTZ,
  time_lag_days INTEGER, -- Days after story shared

  -- Evidence
  evidence_type VARCHAR(50), -- 'interview', 'survey', 'observation', 'document'
  evidence_source TEXT,

  -- Connections
  triggered_by UUID REFERENCES ripple_effects(id), -- Chain of effects

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Visualization**:

```typescript
// Component: RippleEffectMap.tsx
interface RippleEffect {
  id: string
  description: string
  level: number
  peopleAffected: number
  triggeredBy?: string
  timeLagDays: number
}

export function RippleEffectMap({ effects, storyTitle }: {
  effects: RippleEffect[]
  storyTitle: string
}) {
  return (
    <EmpathyCard variant="connection" elevation="focused">
      <CardHeader
        title="Ripple Effects"
        subtitle={`How "${storyTitle}" created waves of change`}
      />
      <CardContent>
        {/* Concentric circles SVG */}
        <svg className="w-full h-96" viewBox="0 0 600 600">
          {/* Circles */}
          <circle cx="300" cy="300" r="40" fill="#BFA888" opacity="0.2" />
          <circle cx="300" cy="300" r="100" fill="none" stroke="#BFA888" strokeWidth="2" opacity="0.3" />
          <circle cx="300" cy="300" r="160" fill="none" stroke="#BFA888" strokeWidth="2" opacity="0.3" />
          <circle cx="300" cy="300" r="220" fill="none" stroke="#BFA888" strokeWidth="2" opacity="0.3" />
          <circle cx="300" cy="300" r="280" fill="none" stroke="#BFA888" strokeWidth="2" opacity="0.3" />

          {/* Center: Story */}
          <text x="300" y="305" textAnchor="middle" className="font-bold">Story</text>

          {/* Effects as dots */}
          {effects.map((effect, i) => {
            const angle = (i / effects.length) * 2 * Math.PI
            const radius = 40 + (effect.level * 60)
            const x = 300 + radius * Math.cos(angle)
            const y = 300 + radius * Math.sin(angle)

            return (
              <g key={effect.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={Math.sqrt(effect.peopleAffected) / 2}
                  fill="#059669"
                  opacity="0.6"
                  className="cursor-pointer hover:opacity-100"
                  onClick={() => showEffectDetails(effect)}
                />
                {/* Connection line to trigger */}
                {effect.triggeredBy && (
                  <line
                    x1={x}
                    y1={y}
                    x2={/* triggering effect position */}
                    y2={/* triggering effect position */}
                    stroke="#D4C4A8"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                )}
              </g>
            )
          })}

          {/* Ring labels */}
          <text x="300" y="250" textAnchor="middle" className="text-sm" opacity="0.6">Family</text>
          <text x="300" y="180" textAnchor="middle" className="text-sm" opacity="0.6">Community</text>
          <text x="300" y="110" textAnchor="middle" className="text-sm" opacity="0.6">Other Communities</text>
          <text x="300" y="40" textAnchor="middle" className="text-sm" opacity="0.6">Policy & Systems</text>
        </svg>

        {/* Timeline of effects */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Timeline of Impact</h4>
          <div className="space-y-2">
            {effects
              .sort((a, b) => a.timeLagDays - b.timeLagDays)
              .map(effect => (
                <div key={effect.id} className="flex items-start gap-3">
                  <div className="text-xs text-muted-foreground w-20">
                    +{effect.timeLagDays} days
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{effect.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {effect.peopleAffected} people affected
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Participatory Data Collection**:

```typescript
// Interface for community members to report ripple effects
export function ReportRippleEffect({ storyId }: { storyId: string }) {
  const [form, setForm] = useState({
    description: '',
    effectType: '',
    rippleLevel: 1,
    peopleAffected: 1,
    evidenceSource: ''
  })

  return (
    <EmpathyCard>
      <CardHeader
        title="Share the Impact"
        subtitle="Help us understand how this story created change"
      />
      <CardContent>
        <form onSubmit={submitRippleEffect}>
          <label>What happened as a result of this story?</label>
          <textarea
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="E.g., 'My grandmother started teaching me our language after hearing this'"
          />

          <label>Who was affected?</label>
          <select value={form.rippleLevel} onChange={handleLevelChange}>
            <option value={1}>The storyteller themselves</option>
            <option value={2}>Family and close friends</option>
            <option value={3}>Wider community</option>
            <option value={4}>Other communities</option>
            <option value={5}>Policy or systems</option>
          </select>

          <label>How many people were affected?</label>
          <input type="number" value={form.peopleAffected} onChange={handleCountChange} />

          <button type="submit">Share Impact</button>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}
```

---

## 5. Network & Relationship Analysis

### 5.1 Storyteller Connection Network

**Goal**: Visualize how storytellers connect through shared themes, experiences, and relationships.

**Network Types**:

1. **Thematic Network**: Storytellers connected by shared themes
2. **Geographic Network**: Storytellers from same territories
3. **Relationship Network**: Explicit family/community ties
4. **Temporal Network**: Storytellers from similar time periods

**Database Schema** (already exists, enhance):

```sql
-- Add to existing schema
CREATE TABLE storyteller_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Storytellers
  storyteller_1_id UUID REFERENCES profiles(id),
  storyteller_2_id UUID REFERENCES profiles(id),

  -- Connection type
  connection_type VARCHAR(50), -- 'thematic', 'geographic', 'familial', 'temporal'

  -- Strength
  connection_strength FLOAT, -- 0.0 to 1.0

  -- For thematic connections
  shared_themes UUID[], -- Array of theme IDs
  theme_overlap_score FLOAT,

  -- For geographic connections
  shared_territory VARCHAR(100),
  distance_km FLOAT,

  -- For relationship connections
  relationship_type VARCHAR(50), -- 'family', 'mentor', 'community_member'

  -- For temporal connections
  time_period_overlap VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Automatic Connection Detection**:

```typescript
// services/storyteller-network.ts
async function detectThematicConnections(storyteller1: string, storyteller2: string): Promise<number> {
  // Get themes for both storytellers
  const themes1 = await getStorytellerThemes(storyteller1)
  const themes2 = await getStorytellerThemes(storyteller2)

  // Calculate Jaccard similarity
  const intersection = themes1.filter(t => themes2.includes(t))
  const union = [...new Set([...themes1, ...themes2])]

  const similarity = intersection.length / union.length

  return similarity
}

async function buildStorytellerNetwork(): Promise<Network> {
  const storytellers = await getActiveStorytellers()

  const nodes = storytellers.map(st => ({
    id: st.id,
    label: st.displayName,
    storyCount: st.storyCount,
    primaryThemes: st.primaryThemes,
    location: st.location
  }))

  const edges = []

  // Create connections for all pairs
  for (let i = 0; i < storytellers.length; i++) {
    for (let j = i + 1; j < storytellers.length; j++) {
      const st1 = storytellers[i]
      const st2 = storytellers[j]

      const thematicSim = await detectThematicConnections(st1.id, st2.id)

      if (thematicSim > 0.3) { // Threshold for connection
        edges.push({
          source: st1.id,
          target: st2.id,
          weight: thematicSim,
          type: 'thematic'
        })
      }
    }
  }

  return { nodes, edges }
}
```

**Visualization**:

```typescript
// Component: StorytellerNetwork.tsx
import * as d3 from 'd3'

export function StorytellerNetwork({ network }: { network: Network }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = 1000
    const height = 700

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Force simulation
    const simulation = d3.forceSimulation(network.nodes)
      .force('link', d3.forceLink(network.edges).id(d => d.id).strength(d => d.weight))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Draw edges
    const link = svg.append('g')
      .selectAll('line')
      .data(network.edges)
      .join('line')
      .attr('stroke', '#BFA888')
      .attr('stroke-width', d => d.weight * 4)
      .attr('stroke-opacity', 0.6)

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(network.nodes)
      .join('g')
      .call(drag(simulation))

    node.append('circle')
      .attr('r', d => Math.sqrt(d.storyCount) * 3)
      .attr('fill', '#D4936A')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('font-size', '10px')

    // Tooltips
    node.on('mouseover', (event, d) => {
      showTooltip(event, `
        <h4>${d.label}</h4>
        <p>${d.storyCount} stories</p>
        <p>Themes: ${d.primaryThemes.join(', ')}</p>
      `)
    })
    .on('mouseout', hideTooltip)

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

  }, [network])

  return (
    <EmpathyCard variant="connection" elevation="focused">
      <CardHeader
        title="Storyteller Connection Network"
        subtitle="How storytellers connect through shared themes and experiences"
      />
      <CardContent>
        <svg ref={svgRef} className="w-full"></svg>

        {/* Network statistics */}
        <MetricGrid columns={3} metrics={[
          { label: 'Storytellers', value: network.nodes.length },
          { label: 'Connections', value: network.edges.length },
          { label: 'Avg Connections', value: (network.edges.length * 2 / network.nodes.length).toFixed(1) }
        ]} />
      </CardContent>
    </EmpathyCard>
  )
}
```

**Network Analysis Metrics**:

```typescript
// Calculate network centrality metrics
function analyzeNetwork(network: Network) {
  const degreeMap = new Map<string, number>()

  // Degree centrality (number of connections)
  network.edges.forEach(edge => {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1)
    degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1)
  })

  // Betweenness centrality (bridge role)
  const betweenness = calculateBetweenness(network)

  // Community detection (clusters of related storytellers)
  const communities = detectCommunities(network)

  return {
    degreeMap,
    betweenness,
    communities,
    density: (network.edges.length * 2) / (network.nodes.length * (network.nodes.length - 1))
  }
}
```

### 5.2 Geographic Impact Mapping

**Goal**: Show where storytellers are located and where impact is spreading.

**Implementation**: Use Mapbox or Leaflet for interactive mapping.

```typescript
// Component: StorytellerMap.tsx
import mapboxgl from 'mapbox-gl'

export function StorytellerMap({ storytellers }: { storytellers: Storyteller[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-95, 60], // Center on Canada
      zoom: 3
    })

    // Add storyteller locations as markers
    storytellers.forEach(st => {
      if (!st.location?.latitude || !st.location?.longitude) return

      const marker = new mapboxgl.Marker({
        color: '#BFA888'
      })
        .setLngLat([st.location.longitude, st.location.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <h4>${st.displayName}</h4>
            <p>${st.storyCount} stories</p>
            <p>${st.location.territoryName}</p>
          `)
        )
        .addTo(map)
    })

    // Add territory boundaries (if available)
    map.on('load', () => {
      map.addSource('territories', {
        type: 'geojson',
        data: territoryBoundaries
      })

      map.addLayer({
        id: 'territories-fill',
        type: 'fill',
        source: 'territories',
        paint: {
          'fill-color': '#BFA888',
          'fill-opacity': 0.2
        }
      })
    })

  }, [storytellers])

  return (
    <EmpathyCard variant="heritage" elevation="focused">
      <CardHeader
        title="Storyteller Territories"
        subtitle="Where stories come from"
      />
      <CardContent>
        <div ref={mapContainer} className="w-full h-96 rounded" />

        {/* Legend */}
        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary-300"></div>
            <span className="text-sm">Storyteller location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-100 border border-primary-300"></div>
            <span className="text-sm">Territory boundary</span>
          </div>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Heat Map Overlay**:

```typescript
// Show story density heat map
map.addSource('story-density', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: storytellers.map(st => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [st.location.longitude, st.location.latitude]
      },
      properties: {
        storyCount: st.storyCount
      }
    }))
  }
})

map.addLayer({
  id: 'story-heat',
  type: 'heatmap',
  source: 'story-density',
  paint: {
    'heatmap-weight': ['get', 'storyCount'],
    'heatmap-intensity': 0.6,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(191, 168, 136, 0)',
      0.2, 'rgba(212, 147, 106, 0.4)',
      0.4, 'rgba(191, 168, 136, 0.6)',
      0.6, 'rgba(170, 128, 86, 0.8)',
      1, 'rgba(139, 92, 68, 1)'
    ]
  }
})
```

---

## 6. Indigenous Methodologies

### 6.1 Participatory Evaluation

**Core Principle**: Community members are co-researchers, not research subjects.

**Implementation Approach**:

1. **Community Research Team**:
   - Train community members in evaluation methods
   - Co-design research questions
   - Joint data interpretation

2. **Participatory Data Collection Tools**:

```typescript
// Community story response form
export function CommunityStoryResponse({ storyId }: { storyId: string }) {
  return (
    <EmpathyCard>
      <CardHeader
        title="Community Response"
        subtitle="How does this story resonate with you?"
      />
      <CardContent>
        <form>
          {/* Open-ended reflection */}
          <label>What stood out to you in this story?</label>
          <textarea
            placeholder="Share your thoughts..."
            rows={4}
          />

          {/* Relational impact */}
          <label>How does this connect to your own experience?</label>
          <textarea
            placeholder="Connections you see..."
            rows={3}
          />

          {/* Action inspiration */}
          <label>What action, if any, does this inspire you to take?</label>
          <textarea
            placeholder="What you might do..."
            rows={3}
          />

          {/* Sharing permission */}
          <label>
            <input type="checkbox" />
            You may share my response (anonymously) with others
          </label>

          <button type="submit">Share Response</button>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}
```

3. **Community Interpretation Sessions**:

```sql
CREATE TABLE community_interpretation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Session details
  session_date DATE,
  location VARCHAR(100),
  facilitator_id UUID REFERENCES profiles(id),

  -- Participants
  participant_ids UUID[], -- Array of profile IDs
  participant_count INTEGER,

  -- Data reviewed
  stories_reviewed UUID[],
  themes_discussed UUID[],

  -- Collective interpretation
  key_findings TEXT[],
  community_insights TEXT[],
  recommended_actions TEXT[],

  -- Documentation
  recording_url TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Visualization**: Community interpretation dashboard

```typescript
// Component: CommunityInterpretationDashboard.tsx
export function CommunityInterpretationDashboard({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-6">
      <EmpathyCard variant="warmth">
        <CardHeader
          title="Community Voices in Analysis"
          subtitle="What community members are saying about the data"
        />
        <CardContent>
          {/* Recent interpretation sessions */}
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="border-l-4 border-primary-300 pl-4">
                <h4 className="font-medium">{session.location} - {session.date}</h4>
                <p className="text-sm text-muted-foreground">
                  {session.participantCount} community members
                </p>

                <div className="mt-2">
                  <h5 className="text-sm font-medium">Key Findings:</h5>
                  <ul className="list-disc list-inside text-sm">
                    {session.keyFindings.map((finding, i) => (
                      <li key={i}>{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </EmpathyCard>

      {/* Recommended actions from community */}
      <EmpathyCard variant="connection">
        <CardHeader title="Community-Recommended Actions" />
        <CardContent>
          {collectiveActions.map(action => (
            <ActionCard
              action={action}
              votingEnabled={true}
              onVote={handleVote}
            />
          ))}
        </CardContent>
      </EmpathyCard>
    </div>
  )
}
```

### 6.2 Outcome Harvesting

**Goal**: Identify emergent changes instead of measuring against predetermined outcomes.

**Process**:

1. **Outcome Collection** (stories of change):

```typescript
// Component: OutcomeHarvestingForm.tsx
export function OutcomeHarvestingForm({ projectId }: { projectId: string }) {
  return (
    <EmpathyCard>
      <CardHeader
        title="Share a Story of Change"
        subtitle="Tell us about changes you've noticed"
      />
      <CardContent>
        <form>
          {/* What changed? */}
          <label>What change have you noticed?</label>
          <textarea
            placeholder="Describe the change..."
            rows={4}
          />

          {/* Who changed? */}
          <label>Who experienced this change?</label>
          <select>
            <option value="individual">An individual</option>
            <option value="family">A family</option>
            <option value="community">The community</option>
            <option value="organization">An organization</option>
            <option value="policy">Policy or systems</option>
          </select>

          {/* When? */}
          <label>When did this happen?</label>
          <input type="date" />

          {/* Evidence */}
          <label>How do you know this change happened?</label>
          <textarea
            placeholder="What you saw, heard, or experienced..."
            rows={3}
          />

          {/* Connection to project */}
          <label>How did the storytelling project contribute to this change?</label>
          <textarea
            placeholder="The connection you see..."
            rows={3}
          />

          <button type="submit">Submit Outcome</button>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}
```

2. **Outcome Substantiation**:

```sql
CREATE TABLE harvested_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Outcome description
  change_description TEXT,
  who_changed VARCHAR(50), -- 'individual', 'family', 'community', etc.
  when_occurred DATE,

  -- Evidence
  evidence_description TEXT,
  evidence_sources JSONB, -- [{type: 'observation', description: '...'}, ...]

  -- Project contribution
  contribution_description TEXT,
  contribution_assessment VARCHAR(20), -- 'direct', 'indirect', 'enabling'

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verification_notes TEXT,

  -- Significance
  significance_level VARCHAR(20), -- 'low', 'medium', 'high', 'transformative'
  significance_rationale TEXT,

  -- Reporting
  reported_by UUID REFERENCES profiles(id),
  reported_at TIMESTAMPTZ DEFAULT now()
);
```

3. **Collective Sense-Making**:

```typescript
// Component: OutcomeHarvestReview.tsx
// Community members review and categorize outcomes together
export function OutcomeHarvestReview({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <EmpathyCard variant="insight">
      <CardHeader
        title="Outcomes Review"
        subtitle="What patterns do we see in the changes?"
      />
      <CardContent>
        {/* Categorize outcomes */}
        <div className="grid grid-cols-2 gap-4">
          <OutcomeCategoryColumn
            title="Individual Healing"
            outcomes={outcomes.filter(o => o.category === 'healing')}
            onMove={moveOutcome}
          />

          <OutcomeCategoryColumn
            title="Cultural Revitalization"
            outcomes={outcomes.filter(o => o.category === 'cultural')}
            onMove={moveOutcome}
          />

          <OutcomeCategoryColumn
            title="Intergenerational Connection"
            outcomes={outcomes.filter(o => o.category === 'intergenerational')}
            onMove={moveOutcome}
          />

          <OutcomeCategoryColumn
            title="Policy Influence"
            outcomes={outcomes.filter(o => o.category === 'policy')}
            onMove={moveOutcome}
          />
        </div>

        {/* Vote on most significant */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Most Significant Changes</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Vote for the outcomes that represent the most important changes
          </p>

          {outcomes.map(outcome => (
            <OutcomeVoteCard
              outcome={outcome}
              votes={outcome.votes}
              onVote={handleVote}
            />
          ))}
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Visualization**: Outcome map showing distribution and significance

```typescript
// Component: OutcomeMap.tsx
export function OutcomeMap({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <EmpathyCard variant="warmth" elevation="focused">
      <CardHeader
        title="Harvested Outcomes Map"
        subtitle="Changes observed across the project"
      />
      <CardContent>
        {/* Bubble chart: x = time, y = significance, size = people affected */}
        <svg className="w-full h-96">
          {outcomes.map(outcome => (
            <circle
              cx={timeScale(outcome.occurredAt)}
              cy={significanceScale(outcome.significanceLevel)}
              r={Math.sqrt(outcome.peopleAffected) * 3}
              fill={categoryColors[outcome.category]}
              opacity={0.6}
              className="cursor-pointer hover:opacity-100"
              onClick={() => showOutcomeDetails(outcome)}
            />
          ))}
        </svg>

        {/* Category breakdown */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          {Object.entries(outcomesByCategory).map(([category, count]) => (
            <CompactMetric
              label={category}
              value={count}
              trend="up"
            />
          ))}
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

### 6.3 Storytelling Circles for Evaluation

**Goal**: Use culturally appropriate storytelling methods instead of surveys/interviews.

**Implementation**:

```typescript
// Component: StorytellingCircleGuide.tsx
export function StorytellingCircleGuide({ projectId }: { projectId: string }) {
  return (
    <EmpathyCard variant="heritage">
      <CardHeader
        title="Storytelling Circle Evaluation"
        subtitle="Gathering reflections through story"
      />
      <CardContent>
        <div className="space-y-6">
          {/* Circle protocol */}
          <div>
            <h4 className="font-medium mb-2">Opening the Circle</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Begin with opening prayer or acknowledgment</li>
              <li>Share the purpose: reflecting on our storytelling journey</li>
              <li>Remind participants: all voices are valued, no judgment</li>
            </ul>
          </div>

          {/* Guiding prompts */}
          <div>
            <h4 className="font-medium mb-2">Reflection Prompts</h4>
            <div className="space-y-3">
              <PromptCard
                prompt="Tell us about a moment when you felt the power of storytelling in this project."
                purpose="Identifying peak experiences"
              />

              <PromptCard
                prompt="Share a story about how this work has touched your family or community."
                purpose="Understanding ripple effects"
              />

              <PromptCard
                prompt="What would you tell your grandchildren about why this work matters?"
                purpose="Long-term significance"
              />

              <PromptCard
                prompt="If this project was a river, where are we in the journey? What's ahead?"
                purpose="Metaphorical understanding of progress"
              />
            </div>
          </div>

          {/* Documentation approach */}
          <div>
            <h4 className="font-medium mb-2">Respectful Documentation</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Ask permission before recording</li>
              <li>Note-taker captures essence, not transcription</li>
              <li>Participants review and approve what's documented</li>
              <li>Sacred or sensitive content excluded from public data</li>
            </ul>
          </div>

          {/* Closing */}
          <div>
            <h4 className="font-medium mb-2">Closing the Circle</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Go around circle: one word or brief reflection</li>
              <li>Thank all participants for sharing</li>
              <li>Closing prayer or song</li>
              <li>Refreshments and informal conversation</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Database Schema for Circle Documentation**:

```sql
CREATE TABLE storytelling_circle_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Circle details
  circle_date DATE,
  location VARCHAR(100),
  facilitator_id UUID REFERENCES profiles(id),

  -- Participants (anonymized if requested)
  participant_count INTEGER,
  participant_demographics JSONB, -- Aggregate only: {elders: 5, youth: 3, etc.}

  -- Documentation (stories shared)
  shared_stories JSONB, -- [{speaker: 'Elder (anonymous)', story: '...', theme: '...'}, ...]

  -- Key themes emerged
  emergent_themes TEXT[],
  significant_moments TEXT[],

  -- Metaphors used
  metaphors JSONB, -- [{metaphor: 'river journey', interpretation: '...'}, ...]

  -- Cultural protocols observed
  opening_protocol TEXT,
  closing_protocol TEXT,
  cultural_notes TEXT,

  -- Consent
  recording_permitted BOOLEAN,
  public_sharing_permitted BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Visualization Dashboard Strategy

### 7.1 Multi-Level Dashboard Architecture

**Hierarchy**:

```
Platform Overview Dashboard
    ↓
Project-Level Dashboard
    ↓
Story-Level Dashboard
    ↓
Storyteller-Level Dashboard
```

**Example: Platform Overview Dashboard**

```typescript
// Page: /dashboard/overview
export default function PlatformOverviewDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Hero metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Stories"
          value={1247}
          trend={{ value: 23, direction: 'up', period: 'this month' }}
          icon={<BookIcon />}
        />

        <MetricCard
          label="Storytellers"
          value={342}
          trend={{ value: 8, direction: 'up', period: 'this month' }}
          icon={<UsersIcon />}
        />

        <MetricCard
          label="Communities Reached"
          value={67}
          icon={<MapIcon />}
        />

        <MetricCard
          label="Social Value Created"
          value="$4.2M"
          subtitle="SROI: $3.50 per $1"
          icon={<TrendingUpIcon />}
        />
      </div>

      {/* Story activity timeline */}
      <EmpathyCard variant="warmth">
        <CardHeader title="Story Activity Over Time" />
        <CardContent>
          <AreaChart
            data={monthlyStoryData}
            xAxis="month"
            yAxis="count"
            color="#BFA888"
          />
        </CardContent>
      </EmpathyCard>

      {/* Geographic distribution */}
      <div className="grid grid-cols-2 gap-4">
        <StorytellerMap storytellers={storytellers} />

        <EmpathyCard variant="heritage">
          <CardHeader title="Top Territories" />
          <CardContent>
            <BarChart
              data={territoryCounts}
              orientation="horizontal"
              color="#D4936A"
            />
          </CardContent>
        </EmpathyCard>
      </div>

      {/* Theme network */}
      <ThemeNetworkVisualization
        themes={platformThemes}
        connections={themeConnections}
      />

      {/* Recent impact stories */}
      <EmpathyCard variant="insight">
        <CardHeader
          title="Recent Impact Stories"
          subtitle="Ripple effects reported by community"
        />
        <CardContent>
          <div className="space-y-4">
            {recentImpacts.map(impact => (
              <ImpactStoryCard
                impact={impact}
                showStory={true}
              />
            ))}
          </div>
        </CardContent>
      </EmpathyCard>
    </div>
  )
}
```

**Example: Story-Level Dashboard**

```typescript
// Page: /stories/[id]/analytics
export default function StoryAnalyticsDashboard({ storyId }: { storyId: string }) {
  return (
    <div className="space-y-6 p-6">
      {/* Story header */}
      <StoryHeader story={story} storyteller={storyteller} />

      {/* Engagement metrics */}
      <MetricGrid columns={5} metrics={[
        { label: 'Views', value: story.viewCount },
        { label: 'Shares', value: story.shareCount },
        { label: 'Responses', value: story.responseCount },
        { label: 'Impact Score', value: story.impactScore },
        { label: 'Sites Shared', value: story.siteCount }
      ]} />

      {/* Narrative analysis */}
      <div className="grid grid-cols-2 gap-4">
        <StoryArcVisualization
          trajectoryData={story.arc.trajectory}
          arcType={story.arc.type}
        />

        <EmotionTimeline
          emotionData={story.voiceAnalysis.emotionTimeline}
        />
      </div>

      {/* Voice prosody */}
      <VoiceProsodyVisualization
        data={story.voiceAnalysis.prosody}
      />

      {/* Themes */}
      <EmpathyCard variant="insight">
        <CardHeader title="Themes in This Story" />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {story.themes.map(theme => (
              <ThemeBadge
                theme={theme}
                prominence={theme.prominence}
                onClick={() => navigateToTheme(theme.id)}
              />
            ))}
          </div>

          {/* Theme prominence chart */}
          <BarChart
            data={story.themes}
            xAxis="name"
            yAxis="prominence"
            className="mt-4"
          />
        </CardContent>
      </EmpathyCard>

      {/* Quotes */}
      <EmpathyCard variant="heritage">
        <CardHeader title="Impactful Quotes" />
        <CardContent>
          <div className="space-y-3">
            {story.quotes
              .sort((a, b) => b.impactScore - a.impactScore)
              .slice(0, 3)
              .map(quote => (
                <QuoteCard
                  quote={quote}
                  variant="minimal"
                  showActions={false}
                />
              ))}
          </div>
        </CardContent>
      </EmpathyCard>

      {/* Ripple effects */}
      <RippleEffectMap
        effects={story.rippleEffects}
        storyTitle={story.title}
      />

      {/* Community responses */}
      <EmpathyCard variant="connection">
        <CardHeader
          title="Community Responses"
          subtitle={`${story.responses.length} people shared how this resonated`}
        />
        <CardContent>
          <div className="space-y-4">
            {story.responses.map(response => (
              <ResponseCard response={response} />
            ))}
          </div>
        </CardContent>
      </EmpathyCard>
    </div>
  )
}
```

### 7.2 Interactive Filtering & Exploration

**Filter Panel Component**:

```typescript
// Component: DataExplorationFilters.tsx
export function DataExplorationFilters({ onFilterChange }: {
  onFilterChange: (filters: Filters) => void
}) {
  return (
    <EmpathyCard variant="default" className="sticky top-4">
      <CardHeader title="Explore Data" />
      <CardContent>
        {/* Date range */}
        <FilterSection title="Time Period">
          <DateRangePicker onChange={handleDateChange} />
        </FilterSection>

        {/* Themes */}
        <FilterSection title="Themes">
          <MultiSelectDropdown
            options={allThemes}
            selected={selectedThemes}
            onChange={handleThemeChange}
          />
        </FilterSection>

        {/* Territories */}
        <FilterSection title="Territories">
          <MultiSelectDropdown
            options={territories}
            selected={selectedTerritories}
            onChange={handleTerritoryChange}
          />
        </FilterSection>

        {/* Story arc type */}
        <FilterSection title="Narrative Arc">
          <CheckboxGroup
            options={arcTypes}
            selected={selectedArcs}
            onChange={handleArcChange}
          />
        </FilterSection>

        {/* Emotions */}
        <FilterSection title="Dominant Emotion">
          <CheckboxGroup
            options={emotions}
            selected={selectedEmotions}
            onChange={handleEmotionChange}
          />
        </FilterSection>

        {/* Impact level */}
        <FilterSection title="Impact Score">
          <RangeSlider
            min={0}
            max={100}
            value={impactRange}
            onChange={handleImpactChange}
          />
        </FilterSection>

        <button
          onClick={clearFilters}
          className="mt-4 w-full"
        >
          Clear All Filters
        </button>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Filtered Results View**:

```typescript
// Component: FilteredStoriesView.tsx
export function FilteredStoriesView({ filters }: { filters: Filters }) {
  const stories = useFilteredStories(filters)

  return (
    <div className="space-y-6">
      {/* Result count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {stories.length} stories match your filters
        </h3>

        <ViewToggle
          view={view}
          options={['grid', 'list', 'network', 'map']}
          onChange={setView}
        />
      </div>

      {/* View options */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {stories.map(story => (
            <StoryCard story={story} variant="compact" />
          ))}
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-3">
          {stories.map(story => (
            <StoryListItem story={story} />
          ))}
        </div>
      )}

      {view === 'network' && (
        <StoryThemeNetwork stories={stories} />
      )}

      {view === 'map' && (
        <StoryMap stories={stories} />
      )}
    </div>
  )
}
```

### 7.3 Export & Reporting

**Report Generation Component**:

```typescript
// Component: ReportGenerator.tsx
export function ReportGenerator({ projectId }: { projectId: string }) {
  return (
    <EmpathyCard>
      <CardHeader
        title="Generate Impact Report"
        subtitle="Create custom reports for stakeholders"
      />
      <CardContent>
        <form onSubmit={generateReport}>
          {/* Report type */}
          <label>Report Type</label>
          <select name="reportType">
            <option value="executive_summary">Executive Summary</option>
            <option value="full_impact_analysis">Full Impact Analysis</option>
            <option value="sroi_report">SROI Report</option>
            <option value="storyteller_showcase">Storyteller Showcase</option>
            <option value="community_report">Community Report (Plain Language)</option>
          </select>

          {/* Date range */}
          <label>Time Period</label>
          <DateRangePicker name="dateRange" />

          {/* Include sections */}
          <label>Include Sections</label>
          <CheckboxGroup
            options={[
              { value: 'overview', label: 'Platform Overview' },
              { value: 'stories', label: 'Story Highlights' },
              { value: 'storytellers', label: 'Storyteller Profiles' },
              { value: 'themes', label: 'Thematic Analysis' },
              { value: 'voice', label: 'Voice Analysis' },
              { value: 'network', label: 'Network Analysis' },
              { value: 'geographic', label: 'Geographic Distribution' },
              { value: 'ripple', label: 'Ripple Effects' },
              { value: 'sroi', label: 'SROI Calculation' },
              { value: 'testimonials', label: 'Community Testimonials' }
            ]}
            name="sections"
          />

          {/* Format */}
          <label>Export Format</label>
          <RadioGroup
            options={[
              { value: 'pdf', label: 'PDF (printable)' },
              { value: 'html', label: 'HTML (web)' },
              { value: 'pptx', label: 'PowerPoint' },
              { value: 'docx', label: 'Word Document' }
            ]}
            name="format"
          />

          {/* Audience */}
          <label>Audience</label>
          <select name="audience">
            <option value="funders">Funders/Donors</option>
            <option value="community">Community Members</option>
            <option value="academic">Academic/Research</option>
            <option value="government">Government/Policy</option>
          </select>

          <button type="submit">Generate Report</button>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}
```

**Automated Report Template**:

```typescript
// services/report-generator.ts
interface ReportConfig {
  type: string
  dateRange: { start: Date; end: Date }
  sections: string[]
  format: 'pdf' | 'html' | 'pptx' | 'docx'
  audience: string
}

async function generateImpactReport(config: ReportConfig): Promise<Blob> {
  // Fetch data
  const data = await fetchReportData(config)

  // Generate visualizations
  const charts = await generateCharts(data, config.format)

  // Build report structure
  const report = {
    coverPage: {
      title: `Empathy Ledger Impact Report`,
      period: `${config.dateRange.start} - ${config.dateRange.end}`,
      logo: '/assets/logo.png',
      date: new Date().toLocaleDateString()
    },

    executiveSummary: {
      keyMetrics: [
        { label: 'Stories Collected', value: data.storyCount },
        { label: 'Storytellers', value: data.storytellerCount },
        { label: 'Communities', value: data.communityCount },
        { label: 'SROI Ratio', value: `$${data.sroiRatio}` }
      ],
      highlights: data.highlights,
      recommendations: data.recommendations
    },

    storyHighlights: config.sections.includes('stories') ? {
      featuredStories: data.topStories,
      impactfulQuotes: data.topQuotes,
      narrativeArcs: charts.arcDistribution
    } : null,

    thematicAnalysis: config.sections.includes('themes') ? {
      topThemes: data.topThemes,
      themeEvolution: charts.themeEvolution,
      themeNetwork: charts.themeNetwork,
      emergingThemes: data.emergingThemes
    } : null,

    voiceAnalysis: config.sections.includes('voice') ? {
      emotionalPatterns: charts.emotionDistribution,
      prosodicInsights: data.prosodicSummary,
      culturalMarkers: data.culturalMarkers
    } : null,

    networkAnalysis: config.sections.includes('network') ? {
      storytellerConnections: charts.storytellerNetwork,
      communityStructure: data.communityStructure,
      influencers: data.keyStorytellers
    } : null,

    geographicImpact: config.sections.includes('geographic') ? {
      map: charts.geographicMap,
      territoryBreakdown: data.territoryStats,
      reach: data.geographicReach
    } : null,

    rippleEffects: config.sections.includes('ripple') ? {
      totalEffects: data.rippleEffects.length,
      rippleMap: charts.rippleVisualization,
      significantChanges: data.mostSignificantChanges
    } : null,

    sroiCalculation: config.sections.includes('sroi') ? {
      ratio: data.sroiRatio,
      breakdown: charts.sroiSankey,
      outcomes: data.sroiOutcomes,
      methodology: data.sroiMethodology
    } : null,

    communityVoices: config.sections.includes('testimonials') ? {
      responses: data.communityResponses,
      interpretations: data.communityInterpretations,
      recommendations: data.communityRecommendations
    } : null,

    appendix: {
      methodology: data.methodologyNotes,
      dataQuality: data.dataQualityStatement,
      limitations: data.limitations
    }
  }

  // Render based on format
  if (config.format === 'pdf') {
    return await renderPDF(report)
  } else if (config.format === 'html') {
    return await renderHTML(report)
  } else if (config.format === 'pptx') {
    return await renderPowerPoint(report)
  } else {
    return await renderWord(report)
  }
}
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Database Schema Enhancements**
- [ ] Add `story_narrative_arcs` table
- [ ] Add `audio_prosodic_analysis` table
- [ ] Add `audio_emotion_analysis` table
- [ ] Add `cultural_speech_patterns` table
- [ ] Add `sroi_inputs`, `sroi_outcomes`, `sroi_calculations` tables
- [ ] Add `theory_of_change` table
- [ ] Add `ripple_effects` table
- [ ] Add `harvested_outcomes` table
- [ ] Add `storytelling_circle_evaluations` table

**Core Analysis Services**
- [ ] Implement sentiment analysis pipeline
- [ ] Integrate Praat for prosody analysis
- [ ] Build speech emotion recognition
- [ ] Create theme evolution tracking
- [ ] Develop SROI calculator

**Basic Visualizations**
- [ ] Story arc visualization component
- [ ] Emotion timeline component
- [ ] Theme network (enhance existing)
- [ ] Basic SROI display

### Phase 2: Voice & Narrative Analysis (Months 3-4)

**Voice Analysis Pipeline**
- [ ] Deploy Praat analysis scripts
- [ ] Build prosody visualization components
- [ ] Implement emotion detection model
- [ ] Create cultural linguistics markers
- [ ] Build voice analysis dashboard

**Narrative Analysis**
- [ ] Sentiment trajectory analysis
- [ ] Arc classification system
- [ ] Quote impact scoring enhancement
- [ ] Story structure identification
- [ ] Narrative dashboard

### Phase 3: Impact Measurement (Months 5-6)

**SROI Implementation**
- [ ] Build SROI input forms
- [ ] Create outcome tracking
- [ ] Implement financial proxy library
- [ ] Build SROI visualization
- [ ] Generate SROI reports

**Theory of Change**
- [ ] ToC builder interface
- [ ] Logic model visualization
- [ ] Indicator tracking
- [ ] Progress monitoring dashboard

**Ripple Effect Mapping**
- [ ] Ripple effect reporting forms
- [ ] Ripple visualization
- [ ] Timeline of effects
- [ ] Chain of impact tracking

### Phase 4: Network & Community (Months 7-8)

**Network Analysis**
- [ ] Build storyteller connection network
- [ ] Implement theme co-occurrence analysis
- [ ] Create geographic impact maps
- [ ] Build community structure analysis
- [ ] Interactive network explorer

**Participatory Tools**
- [ ] Community response forms
- [ ] Outcome harvesting interface
- [ ] Storytelling circle guide
- [ ] Community interpretation dashboard
- [ ] Collective sense-making tools

### Phase 5: Dashboards & Reporting (Months 9-10)

**Dashboard Development**
- [ ] Platform overview dashboard
- [ ] Project-level dashboard
- [ ] Story-level analytics
- [ ] Storyteller-level analytics
- [ ] Filtering and exploration interface

**Reporting System**
- [ ] Report template engine
- [ ] PDF generation
- [ ] PowerPoint export
- [ ] Custom report builder
- [ ] Scheduled report automation

### Phase 6: Refinement & Training (Months 11-12)

**User Testing**
- [ ] Community beta testing
- [ ] Gather feedback
- [ ] Iterate on UX
- [ ] Accessibility audit
- [ ] Performance optimization

**Training & Documentation**
- [ ] User guides for all dashboards
- [ ] Video tutorials
- [ ] Community training workshops
- [ ] Research methodology documentation
- [ ] API documentation

**Launch**
- [ ] Production deployment
- [ ] Data migration
- [ ] Launch communications
- [ ] Support infrastructure
- [ ] Ongoing maintenance plan

---

## 9. Tools & Technologies

### Core Analysis Tools

**Voice & Audio Analysis**:
- **Praat** - Prosodic analysis (FREE, open-source)
- **Parselmouth** - Python interface to Praat
- **librosa** - Audio feature extraction (Python)
- **openSMILE** - Paralinguistic features

**Natural Language Processing**:
- **OpenAI API** - Sentiment, emotion, theme extraction
- **spaCy** - NLP pipeline for text analysis
- **Sentence Transformers** - Semantic similarity

**Network Analysis**:
- **D3.js** - Interactive network visualizations
- **NetworkX** - Network analysis (Python)
- **Gephi** - Network visualization (export static images)

**Mapping**:
- **Mapbox GL** - Interactive maps
- **Turf.js** - Geospatial analysis

**Data Visualization**:
- **D3.js** - Custom visualizations
- **Recharts** - React chart library
- **Chart.js** - Quick charts
- **Plotly** - Scientific visualizations

**Report Generation**:
- **Puppeteer** - PDF generation from HTML
- **jsPDF** - PDF generation
- **PptxGenJS** - PowerPoint generation
- **docx** - Word document generation

**Qualitative Analysis** (Optional Advanced):
- **MAXQDA** - Professional QDA software
- **NVivo** - Qualitative data analysis
- **ATLAS.ti** - Network-focused QDA

### Database & Infrastructure

**Database**:
- **Supabase/PostgreSQL** - Primary database
- **pgvector** - Vector similarity for semantic search

**Processing**:
- **Celery** (Python) - Async task queue for analysis
- **Redis** - Task queue and caching
- **Docker** - Containerization for Python analysis services

**Storage**:
- **Supabase Storage** - Audio files, generated reports
- **CloudFront/CDN** - Report distribution

---

## 10. Ethical Considerations

### Data Sovereignty

**Principle**: Indigenous communities own and control their data.

**Implementation**:
- All analysis respects storyteller consent
- Communities can request data deletion
- Analysis results belong to community
- External researchers require community permission

**Code Example**:

```typescript
// Check community data sovereignty before analysis
async function performAnalysis(storyId: string, analysisType: string, requestedBy: string): Promise<void> {
  // 1. Check story consent
  const story = await getStory(storyId)
  if (!story.consent.analyticsPermitted) {
    throw new Error('Storyteller has not consented to analytics')
  }

  // 2. Check if external researcher
  const requester = await getProfile(requestedBy)
  if (requester.profileType === 'researcher' && requester.organizationId !== story.organizationId) {
    // External researcher - check community permission
    const communityApproval = await hasResearchPermission(
      requester.id,
      story.organizationId,
      analysisType
    )

    if (!communityApproval) {
      throw new Error('Community approval required for external research')
    }
  }

  // 3. Proceed with analysis
  await runAnalysis(storyId, analysisType, requestedBy)

  // 4. Log access for audit
  await logDataAccess({
    storyId,
    accessedBy: requestedBy,
    purpose: analysisType,
    timestamp: new Date()
  })
}
```

### Cultural Sensitivity in AI Analysis

**Concerns**:
- AI models trained on Western data may misinterpret Indigenous narratives
- Emotion detection may not capture culturally specific expressions
- Automated analysis might miss cultural nuance

**Mitigations**:
- Always show AI analysis as **suggestions**, not truth
- Provide override controls for community members
- Include "Report Inappropriate Analysis" feature
- Regular community review of AI outputs
- Train custom models on Indigenous data (with permission)

**Example**:

```typescript
// Component: AIAnalysisWithOverride.tsx
export function AIAnalysisWithOverride({ storyId, analysis }: {
  storyId: string
  analysis: AIAnalysis
}) {
  return (
    <EmpathyCard variant="insight">
      <CardHeader
        title="AI-Suggested Analysis"
        subtitle="Review and correct as needed"
      />
      <CardContent>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded mb-4">
          <p className="text-sm">
            ⚠️ This analysis was generated by AI and may not capture cultural nuance.
            Community members can override or correct these suggestions.
          </p>
        </div>

        {/* AI suggestions with edit buttons */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Primary Emotion</h4>
              <button onClick={() => editEmotion()}>Edit</button>
            </div>
            <EmpathyBadge variant="emotion" emotion={analysis.primaryEmotion}>
              {analysis.primaryEmotion} ({Math.round(analysis.confidence * 100)}% confidence)
            </EmpathyBadge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Narrative Arc</h4>
              <button onClick={() => editArc()}>Edit</button>
            </div>
            <p>{analysis.arcType}</p>
          </div>

          {/* Report inappropriate analysis */}
          <button
            onClick={() => reportAnalysis()}
            className="text-red-600 text-sm"
          >
            Report inappropriate or culturally insensitive analysis
          </button>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
```

### Privacy & Anonymization

**Approach**:
- Aggregate data for public reports
- Individual-level data only with explicit consent
- Option to participate in analysis anonymously

**Example**:

```typescript
// Anonymize storyteller data for external reports
function anonymizeStorytellerData(storyteller: Storyteller): AnonymizedStoryteller {
  return {
    id: generateAnonymousId(storyteller.id), // One-way hash
    demographics: {
      ageRange: getAgeRange(storyteller.age), // "50-60" instead of exact age
      territory: storyteller.territory, // Keep if permitted
      indigenousNation: storyteller.consent.shareNation ? storyteller.nation : 'Indigenous'
    },
    storyCount: storyteller.storyCount,
    themes: storyteller.primaryThemes,
    // Omit: name, email, photo, exact location
  }
}
```

### Avoiding Extractive Research

**Principle**: Research must benefit the community, not just extract knowledge.

**Implementation**:
- All reports shared with community first
- Communities co-author publications
- Research findings translated to plain language
- Community receives resources/capacity from research
- External researchers pay for access (funds support community)

**Database Schema**:

```sql
CREATE TABLE research_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),

  -- Agreement
  purpose TEXT,
  research_questions TEXT[],
  data_requested TEXT[],

  -- Reciprocity
  community_benefits TEXT[], -- What community gets
  financial_contribution DECIMAL(12,2),
  capacity_building TEXT, -- Training, tools provided

  -- Collaboration
  community_co_authors UUID[], -- Profile IDs
  community_review_required BOOLEAN DEFAULT true,

  -- Approval
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Duration
  start_date DATE,
  end_date DATE,

  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Conclusion

This comprehensive impact analysis framework positions the Empathy Ledger platform as a world-class tool for:

✅ **Culturally Responsive Evaluation** - Honors Indigenous methodologies and storyteller sovereignty
✅ **Technical Rigor** - Validated computational methods (narrative arcs, voice analysis, SROI)
✅ **Holistic Understanding** - Combines quantitative metrics with qualitative depth
✅ **Community Empowerment** - Participatory tools that build local capacity
✅ **Demonstrable Impact** - Multiple frameworks for showing social value created
✅ **Ethical Foundation** - Data sovereignty, privacy, non-extractive research principles

The implementation roadmap provides a clear 12-month path to deploying these capabilities, starting with foundational database enhancements and progressing through voice analysis, impact measurement, network analysis, dashboards, and finally community training.

By integrating storytelling, AI analysis, and Indigenous methodologies, the Empathy Ledger becomes more than a digital archive—it becomes a **living system for understanding, preserving, and demonstrating the transformative power of Indigenous narratives**.

---

**Next Steps**:

1. Review this strategy with community partners
2. Prioritize features based on community needs
3. Begin Phase 1 database schema enhancements
4. Pilot voice analysis with consenting storytellers
5. Co-design dashboard interfaces with community members

**Questions for Community Discussion**:

- Which analysis methods feel most culturally appropriate?
- What would make these tools useful for your organization?
- How should we handle sensitive cultural content in automated analysis?
- What training would community members need to use these tools?
- What reports would be most valuable for funders/partners?
