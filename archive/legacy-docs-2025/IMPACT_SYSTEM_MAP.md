# Impact Analysis System Map

Complete visual reference showing how all components, services, database tables, and pages connect in the Empathy Ledger impact analysis system.

---

## 🗺️ Complete System Overview

```mermaid
graph TB
    subgraph "Frontend Pages"
        DemoPage["/impact/demo<br/>Demo Showcase"]
        StoryImpact["/stories/[id]/impact<br/>Story Analysis"]
        OrgImpact["/organizations/[id]/impact<br/>Organization Dashboard"]
    end

    subgraph "Visualization Components"
        StoryArc["StoryArcVisualization<br/>Emotional Journey"]
        SROI["SROIVisualization<br/>Social ROI"]
        Ripple["RippleEffectVisualization<br/>Impact Spread"]
        Theme["ThemeEvolutionVisualization<br/>Theme Tracking"]
        Dashboard["ImpactDashboard<br/>Comprehensive Overview"]
        Participatory["ParticipatoryEvaluation<br/>Community Forms"]
    end

    subgraph "Analysis Services"
        NarrativeService["narrative-analysis.ts<br/>Story Arc Detection"]
        SROIService["sroi-calculator.ts<br/>Social Value Calculation"]
        VoiceService["voice-analysis.ts<br/>Praat Prosody Analysis"]
    end

    subgraph "Database Tables"
        DB_Arcs[("story_narrative_arcs")]
        DB_Theme[("theme_evolution<br/>theme_concept_evolution")]
        DB_SROI[("sroi_inputs<br/>sroi_outcomes<br/>sroi_calculations")]
        DB_Ripple[("ripple_effects")]
        DB_Audio[("audio_prosodic_analysis<br/>audio_emotion_analysis<br/>cultural_speech_patterns")]
        DB_Participatory[("harvested_outcomes<br/>community_interpretation_sessions<br/>community_story_responses<br/>storytelling_circle_evaluations")]
        DB_ToC[("theory_of_change")]
    end

    %% Pages to Components
    DemoPage --> Dashboard
    DemoPage --> StoryArc
    DemoPage --> SROI
    DemoPage --> Ripple
    DemoPage --> Theme
    DemoPage --> Participatory

    StoryImpact --> StoryArc
    StoryImpact --> Ripple

    OrgImpact --> Dashboard
    OrgImpact --> SROI
    OrgImpact --> Theme
    OrgImpact --> Participatory

    %% Components to Services
    StoryArc --> NarrativeService
    SROI --> SROIService
    StoryArc --> VoiceService
    Dashboard --> NarrativeService
    Dashboard --> SROIService

    %% Services to Database
    NarrativeService --> DB_Arcs
    SROIService --> DB_SROI
    VoiceService --> DB_Audio

    %% Components to Database (direct reads)
    StoryArc --> DB_Arcs
    SROI --> DB_SROI
    Ripple --> DB_Ripple
    Theme --> DB_Theme
    Dashboard --> DB_Arcs
    Dashboard --> DB_Theme
    Dashboard --> DB_SROI
    Dashboard --> DB_Ripple
    Dashboard --> DB_ToC
    Participatory --> DB_Participatory

    %% Styling
    classDef page fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px

    class DemoPage,StoryImpact,OrgImpact page
    class StoryArc,SROI,Ripple,Theme,Dashboard,Participatory component
    class NarrativeService,SROIService,VoiceService service
    class DB_Arcs,DB_Theme,DB_SROI,DB_Ripple,DB_Audio,DB_Participatory,DB_ToC database
```

---

## 📋 Quick Reference Tables

### Components → Database Tables

| Component | Primary Tables | Purpose |
|-----------|----------------|---------|
| **StoryArcVisualization** | `story_narrative_arcs` | Display emotional journey line chart |
| **SROIVisualization** | `sroi_inputs`, `sroi_outcomes`, `sroi_calculations` | Show social return on investment |
| **RippleEffectVisualization** | `ripple_effects` | Concentric circles showing impact spread |
| **ThemeEvolutionVisualization** | `theme_evolution`, `theme_concept_evolution` | Stacked area charts for theme tracking |
| **ImpactDashboard** | All tables | Comprehensive multi-tab overview |
| **ParticipatoryEvaluation** | `harvested_outcomes`, `community_interpretation_sessions`, `community_story_responses`, `storytelling_circle_evaluations` | Community forms and lists |

### Services → Database Tables

| Service | Input | Output Tables | Method |
|---------|-------|---------------|--------|
| **narrative-analysis.ts** | Story transcript | `story_narrative_arcs` | OpenAI GPT-4 sentiment analysis or lexicon-based |
| **sroi-calculator.ts** | Inputs + outcomes | `sroi_calculations` | Social Value UK framework calculations |
| **voice-analysis.ts** | Audio file (.wav) | `audio_prosodic_analysis`, `audio_emotion_analysis`, `cultural_speech_patterns` | Praat phonetics analysis (Python) |

### Pages → Components Used

| Page | Components | Purpose |
|------|------------|---------|
| **/impact/demo** | All 6 components | Full system showcase with examples |
| **/stories/[id]/impact** | StoryArcVisualization, RippleEffectVisualization | Individual story analysis |
| **/organizations/[id]/impact** | ImpactDashboard, SROIVisualization, ThemeEvolutionVisualization, ParticipatoryEvaluation | Organization-level impact tracking |

---

## 🔄 Data Flow Examples

### Example 1: Story Published → Emotional Arc Displayed

```mermaid
sequenceDiagram
    participant User
    participant Page as /stories/[id]/impact
    participant Service as narrative-analysis.ts
    participant DB as story_narrative_arcs
    participant Component as StoryArcVisualization

    User->>Page: Visits story impact page
    Page->>DB: Check if arc exists
    DB-->>Page: Not found
    Page->>Service: analyzeStoryNarrativeArc(transcript)
    Service->>Service: OpenAI sentiment analysis
    Service-->>Page: Arc data (type, trajectory, metrics)
    Page->>DB: Insert arc data
    Page->>Component: Render with arc data
    Component-->>User: Display emotional journey chart
```

### Example 2: Organization Calculates SROI

```mermaid
sequenceDiagram
    participant Admin as Org Admin
    participant Page as /organizations/[id]/impact
    participant Service as sroi-calculator.ts
    participant DB as Database

    Admin->>Page: Navigate to impact page
    Page-->>Admin: Show "Set Up SROI" prompt
    Admin->>Page: Input investment data
    Page->>DB: Insert into sroi_inputs
    Admin->>Page: Document outcomes for stakeholders
    Page->>DB: Insert into sroi_outcomes (multiple)
    Admin->>Page: Click "Calculate SROI"
    Page->>Service: calculateSROI(inputs, outcomes)
    Service->>Service: Apply discounting, duration, NPV
    Service-->>Page: SROI result (ratio: 3.5)
    Page->>DB: Insert into sroi_calculations
    Page->>Page: Render SROIVisualization
    Page-->>Admin: Display SROI: $3.50 per $1 invested
```

### Example 3: Community Reports Ripple Effect

```mermaid
sequenceDiagram
    participant Community as Community Member
    participant Story as /stories/[id]
    participant Form as RippleEffectVisualization
    participant DB as ripple_effects

    Community->>Story: Hears story at gathering
    Note over Community: Inspired to take action!
    Community->>Story: Navigate to story page
    Story->>Form: Render with allowReporting=true
    Form-->>Community: Show "Report Ripple Effect" button
    Community->>Form: Click button
    Form-->>Community: Show form
    Community->>Form: Fill form (level 3, 50 people affected)
    Form->>DB: Insert ripple effect
    DB-->>Form: Confirmed
    Form->>Form: Re-render visualization
    Form-->>Community: Updated concentric circles
    Note over Community: Sees their impact on the map!
```

---

## 🎯 Integration Points

### Where Users Interact with Impact System

```mermaid
journey
    title User Touchpoints in Impact System
    section Storyteller
      Upload story: 5: Storyteller
      View emotional arc: 5: Storyteller
      Validate AI interpretation: 4: Storyteller
      See ripple effects: 5: Storyteller
    section Organization Admin
      Set up SROI: 3: Admin
      Document outcomes: 4: Admin
      View impact dashboard: 5: Admin
      Export reports: 5: Admin
    section Community Member
      Report ripple effect: 4: Community
      Document interpretation: 4: Community
      Harvest outcomes: 4: Community
      Respond to stories: 5: Community
    section Researcher
      Analyze themes: 5: Researcher
      View semantic shifts: 5: Researcher
      Export data: 5: Researcher
    section Funder
      Review SROI: 5: Funder
      Read impact reports: 5: Funder
      Make funding decision: 5: Funder
```

---

## 🏗️ Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        NextJS[Next.js 15<br/>React Server Components]
        TypeScript[TypeScript<br/>50+ interfaces]
        Recharts[Recharts<br/>Chart Library]
        Empathy[Empathy Ledger<br/>Design System]
    end

    subgraph "Backend Services"
        OpenAI[OpenAI API<br/>GPT-4 Sentiment]
        Praat[Praat + Python<br/>Voice Analysis]
        SROI[Social Value UK<br/>SROI Framework]
    end

    subgraph "Database"
        Supabase[Supabase<br/>PostgreSQL + Auth]
        RLS[Row Level Security<br/>All tables]
        JSONB[JSONB Fields<br/>Flexible data]
    end

    subgraph "Infrastructure"
        Cloud[Supabase Cloud<br/>yvnuayzslukamizrlhwb]
        Migration[SQL Migrations<br/>Version controlled]
    end

    NextJS --> OpenAI
    NextJS --> Praat
    NextJS --> SROI
    NextJS --> Supabase

    Supabase --> RLS
    Supabase --> JSONB
    Supabase --> Cloud

    Cloud --> Migration
```

---

## 📊 Database Schema Summary

### 15 Tables Organized by Category

**1. Story Analysis (3 tables)**
- `story_narrative_arcs` - Emotional journey classification
- `community_story_responses` - Community feedback
- `ripple_effects` - Impact spreading (5 levels)

**2. Theme Analysis (2 tables)**
- `theme_evolution` - Theme prominence over time
- `theme_concept_evolution` - Semantic shift tracking

**3. Voice Analysis (3 tables)**
- `audio_prosodic_analysis` - Pitch, rhythm, intensity
- `audio_emotion_analysis` - Emotion from voice
- `cultural_speech_patterns` - Indigenous linguistic markers

**4. Social ROI (3 tables)**
- `sroi_inputs` - Investment data
- `sroi_outcomes` - Stakeholder outcomes
- `sroi_calculations` - SROI results

**5. Participatory Evaluation (4 tables)**
- `harvested_outcomes` - Emergent changes
- `community_interpretation_sessions` - Group interpretations
- `storytelling_circle_evaluations` - Circle protocols
- `theory_of_change` - ToC framework

---

## 🔑 Key Relationships

```mermaid
erDiagram
    STORIES ||--o{ STORY_NARRATIVE_ARCS : "1:1"
    STORIES ||--o{ RIPPLE_EFFECTS : "1:many"
    PROJECTS ||--o{ RIPPLE_EFFECTS : "1:many"
    ORGANIZATIONS ||--o{ SROI_INPUTS : "1:many"
    SROI_INPUTS ||--o{ SROI_OUTCOMES : "1:many"
    SROI_INPUTS ||--o{ SROI_CALCULATIONS : "1:many"
    THEMES ||--o{ THEME_EVOLUTION : "1:many"
    MEDIA_ASSETS ||--o{ AUDIO_PROSODIC_ANALYSIS : "1:1"
    RIPPLE_EFFECTS }o--o| RIPPLE_EFFECTS : "chain"
```

**Cardinality Explained:**
- **Story → Narrative Arc**: 1:1 (each story has one emotional journey)
- **Story → Ripple Effects**: 1:many (one story can create multiple ripples)
- **SROI Input → Outcomes**: 1:many (one analysis period has multiple outcomes)
- **Ripple Effect → Ripple Effect**: Self-referencing (ripples trigger other ripples)
- **Media Asset → Prosodic Analysis**: 1:1 (each audio file has one analysis)

---

## 🎨 Component Variants

### StoryArcVisualization
- `compact` - Small inline preview
- `default` - Standard card display
- `detailed` - Full metrics + description

### SROIVisualization
- `compact` - Just SROI ratio badge
- `summary` - Ratio + key metrics
- `full` - Complete analysis with charts

### RippleEffectVisualization
- `compact` - Simple list view
- `default` - Concentric circles
- `detailed` - Circles + timeline + stats

### ThemeEvolutionVisualization
- `timeline` - Linear timeline view
- `flow` - Sankey/flow diagram
- `semantic` - Semantic shift focus
- `full` - All views combined

### ImpactDashboard
Views by role:
- `storyteller` - Personal impact
- `organization` - Org-level metrics
- `platform` - Platform-wide analytics

---

## 📖 Documentation Index

| Document | Purpose | Key Content |
|----------|---------|-------------|
| [IMPACT_SYSTEM_ARCHITECTURE.md](./IMPACT_SYSTEM_ARCHITECTURE.md) | Technical architecture | ERD, data flow, table reference |
| [IMPACT_USER_JOURNEY.md](./IMPACT_USER_JOURNEY.md) | User flows | 6 journey maps, sequence diagrams |
| [IMPACT_SYSTEM_MAP.md](./IMPACT_SYSTEM_MAP.md) | System overview (this doc) | Complete system visualization |
| [IMPACT_ANALYSIS_README.md](./IMPACT_ANALYSIS_README.md) | Usage guide | How to use components and services |
| [IMPACT_INTEGRATION_GUIDE.md](./IMPACT_INTEGRATION_GUIDE.md) | Integration examples | Code examples for common patterns |
| [IMPACT_SYSTEM_SUMMARY.md](../IMPACT_SYSTEM_SUMMARY.md) | Executive summary | What was built, by the numbers |

---

## 🚀 Quick Start Guide

### 1. View the Demo
```bash
# Navigate to demo page
/impact/demo
```

### 2. Analyze a Story
```typescript
// In /stories/[id]/impact page
const arc = await analyzeStoryNarrativeArc(transcript, { method: 'openai' })
await supabase.from('story_narrative_arcs').insert({ story_id, ...arc })
```

### 3. Calculate SROI
```typescript
// In /organizations/[id]/impact page
const result = calculateSROI(inputs, outcomes)
// result.sroi_ratio: 3.5
```

### 4. Display Visualization
```typescript
import { StoryArcVisualization } from '@/components/impact/StoryArcVisualization'

<StoryArcVisualization
  arc={arcData}
  storyTitle="The Winter Teaching"
  variant="detailed"
/>
```

---

## 🔍 Finding Your Way

**Want to understand the database?**
→ See [IMPACT_SYSTEM_ARCHITECTURE.md](./IMPACT_SYSTEM_ARCHITECTURE.md) - Complete ERD + table reference

**Want to see how users interact?**
→ See [IMPACT_USER_JOURNEY.md](./IMPACT_USER_JOURNEY.md) - 6 user journey flows

**Want to integrate components?**
→ See [IMPACT_INTEGRATION_GUIDE.md](./IMPACT_INTEGRATION_GUIDE.md) - Code examples

**Want to understand methodologies?**
→ See [IMPACT_ANALYSIS_STRATEGY.md](./IMPACT_ANALYSIS_STRATEGY.md) - 13,000-line framework

**Want a quick lookup?**
→ See [VISUALIZATION_QUICK_REFERENCE.md](./VISUALIZATION_QUICK_REFERENCE.md) - Fast component reference

---

**Complete. Production Ready. Documented.** ✅

The Empathy Ledger impact analysis system is live and ready to demonstrate measurable social value!
