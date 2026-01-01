# Project Context Seeding for AI Analysis
## Culturally-Responsive Impact Measurement Framework

## Problem Statement
Currently, AI analysis of transcripts happens without understanding:
- What the project is trying to achieve
- How the program works (theory of change)
- What outcomes matter to the community
- Cultural context and protocols
- Community-defined success indicators

This results in generic themes and quotes that may miss project-specific impacts.

---

## Solution: Multi-Modal Project Seeding

### Phase 1: Foundation Interview (Seed Conversation)
**Purpose:** Capture the essence of the project through conversation

**Conducted by:** Organization lead or project coordinator

**Interview Questions (15-20 minutes):**

1. **Project Origin Story**
   - "Can you tell me the story of how this project came to be?"
   - "What need or gap was the community experiencing?"
   - "Who initiated this project and why?"

2. **How It Works**
   - "Walk me through what actually happens in this project"
   - "What does a typical participant experience?"
   - "Who are the key people or roles involved?"

3. **Intended Outcomes**
   - "When this project is working at its best, what does that look like?"
   - "What changes are you hoping to see in people's lives?"
   - "What would success look like 1 year from now? 5 years?"

4. **Cultural Context**
   - "What cultural protocols or values guide this work?"
   - "How does this project connect to community ways of knowing?"
   - "What makes this approach culturally appropriate?"

5. **Measuring What Matters**
   - "How do you currently know if the project is making a difference?"
   - "What signs tell you that something meaningful is happening?"
   - "What do community members say when things are going well?"

**Output:**
- Recorded audio transcript (10-20 pages)
- This becomes the "project context document"
- AI extracts key elements automatically

---

### Phase 2: Structured Theory of Change
**Purpose:** Create clear logic model while remaining culturally grounded

**Database Schema Addition:**

```sql
CREATE TABLE project_theory_of_change (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),

  -- Context
  origin_story TEXT,
  community_need TEXT,
  cultural_protocols TEXT[],

  -- Inputs
  resources TEXT[],
  partnerships TEXT[],
  community_assets TEXT[],

  -- Activities
  what_we_do TEXT[],
  how_we_do_it TEXT[],
  cultural_approaches TEXT[],

  -- Outputs
  immediate_results TEXT[],
  participation_indicators TEXT[],

  -- Outcomes (Short/Medium/Long-term)
  short_term_outcomes TEXT[], -- 0-6 months
  medium_term_outcomes TEXT[], -- 6-24 months
  long_term_outcomes TEXT[], -- 2+ years

  -- Community-Defined Success
  success_indicators JSONB[], -- {name, description, why_it_matters}
  cultural_indicators TEXT[],
  story_based_indicators TEXT[],

  -- Impact Domains
  individual_impact TEXT[],
  family_impact TEXT[],
  community_impact TEXT[],
  systems_impact TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 3: AI-Generated Project Profile
**Purpose:** Automatically extract key elements from seed interview

**AI Extraction Process:**

```typescript
// Extract from seed interview transcript
interface ProjectProfile {
  // Core Purpose
  mission: string
  primary_goals: string[]
  target_population: string

  // How it Works
  program_model: string
  key_activities: string[]
  cultural_approaches: string[]

  // Expected Outcomes
  outcome_categories: {
    category: string
    examples: string[]
    keywords: string[]
  }[]

  // Success Language
  positive_indicators: string[] // Words/phrases that indicate success
  challenge_indicators: string[] // Words/phrases about obstacles
  transformation_markers: string[] // Signs of change

  // Cultural Context
  cultural_values: string[]
  protocols: string[]
  community_wisdom: string[]
}
```

---

### Phase 4: Context-Aware Analysis
**Purpose:** Use project context to guide quote extraction and theme identification

**Updated AI Analysis Prompts:**

```typescript
// Quote Extraction with Context
const quoteExtractionPrompt = `
PROJECT CONTEXT:
- Name: ${project.name}
- Purpose: ${projectProfile.mission}
- Key Activities: ${projectProfile.key_activities.join(', ')}
- Expected Outcomes: ${projectProfile.outcome_categories.map(c => c.category).join(', ')}
- Success Indicators: ${projectProfile.positive_indicators.join(', ')}
- Cultural Values: ${projectProfile.cultural_values.join(', ')}

TRANSCRIPT TO ANALYZE:
${transcript.text}

Extract quotes that demonstrate:
1. Alignment with project goals
2. Evidence of expected outcomes
3. Cultural values in action
4. Transformation or change
5. Community-defined success indicators

For each quote, identify:
- Which project outcome it relates to
- What success indicator it demonstrates
- Cultural significance (if any)
`

// Theme Analysis with Context
const themeAnalysisPrompt = `
PROJECT OUTCOMES TO LOOK FOR:
${projectProfile.outcome_categories.map(c =>
  `- ${c.category}: ${c.examples.join(', ')}`
).join('\n')}

Identify themes that:
1. Relate to project outcomes
2. Show unexpected impacts
3. Reveal challenges or barriers
4. Demonstrate cultural continuity
5. Indicate systems change
`
```

---

## Implementation Approach

### Option A: Conversational Onboarding (Recommended)
**Flow:**
1. Create new project
2. System prompts: "Let's have a conversation about your project to help our AI understand what you're trying to achieve"
3. Voice or text chat interface (10-15 minutes)
4. AI asks follow-up questions based on responses
5. Generates project profile automatically
6. User reviews and edits
7. Profile saved and used for all future analysis

**Pros:**
- Natural, conversational
- Captures nuance and context
- Engaging for users
- Can be done by anyone familiar with project
- AI can probe deeper based on responses

**Cons:**
- Requires voice/chat interface
- May take 15-20 minutes
- Needs good AI interviewer

### Option B: Guided Form + Optional Interview
**Flow:**
1. Structured form with sections:
   - Project Story (free text)
   - Activities (checkboxes + custom)
   - Outcomes (predefined + custom)
   - Success Indicators (community-defined)
2. Optional: Upload audio/video interview
3. AI extracts additional context from interview
4. Merges form + interview data

**Pros:**
- Faster (5-10 minutes)
- Structured data
- Can skip interview if pressed for time
- Easy to update

**Cons:**
- Less rich than conversation
- May miss important context
- Feels more administrative

### Option C: Hybrid (Best of Both)
**Flow:**
1. Quick form (3 minutes) - basic info
2. Optional seed interview (voice/text)
3. AI enriches form data with interview insights
4. User approves final profile

---

## Cultural Considerations

### Community Ownership
- Project profiles should be **community-controlled**
- Ability to mark certain outcomes as "private" (not shared externally)
- Option to use cultural language/terms
- Respect for sacred knowledge

### Flexibility
- Not all projects have formal "theory of change"
- Some work through relationship-building (not linear logic)
- Story-based indicators valid alongside quantitative
- Room for emergent outcomes not originally planned

### Validation
- Community members review what AI extracted
- Elders or cultural advisors can provide input
- Ongoing refinement as project evolves

---

## Example: Goods Project

**Seed Interview Extract:**
> "Goods is about supporting grassroots community organizations that are doing incredible work but often don't have access to traditional funding or recognition. We connect them with resources and help amplify their stories. Success looks like organizations feeling more confident, connected to each other, and able to sustain their work long-term."

**AI-Generated Profile:**
```json
{
  "mission": "Support grassroots community organizations through resources and story amplification",
  "outcome_categories": [
    {
      "category": "Organizational Confidence",
      "examples": ["feeling supported", "validated", "recognized"],
      "keywords": ["confidence", "belief", "trust", "validated"]
    },
    {
      "category": "Network Building",
      "examples": ["connected to peers", "collaboration", "partnerships"],
      "keywords": ["connected", "network", "together", "collaboration"]
    },
    {
      "category": "Sustainability",
      "examples": ["ongoing funding", "capacity", "able to continue"],
      "keywords": ["sustainable", "ongoing", "continue", "long-term"]
    }
  ],
  "positive_indicators": [
    "feeling supported",
    "more connected",
    "able to sustain",
    "amplified stories",
    "increased confidence"
  ]
}
```

**Analysis Impact:**
When analyzing transcripts, AI now looks for:
- Evidence of increased organizational confidence
- Stories of new connections/networks forming
- Indicators of sustainability
- Quotes about feeling supported/validated

---

## Technical Implementation

### 1. Database Migration
```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN project_context JSONB;
ALTER TABLE projects ADD COLUMN seed_interview_url TEXT;
ALTER TABLE projects ADD COLUMN theory_of_change_id UUID;

-- Create theory of change table (see Phase 2 schema above)
```

### 2. Project Setup Flow
```
1. /projects/new → Basic info form
2. /projects/{id}/context → Seed interview/conversation
3. AI processes → Generates profile
4. /projects/{id}/context/review → User approves
5. Ready for transcript analysis
```

### 3. Updated Analysis API
```typescript
// In analysis/route.ts
const projectContext = await getProjectContext(projectId)

// Pass to AI analyzers
const quotes = await extractQuotes(transcript, {
  storytellerName,
  projectContext: {
    mission: projectContext.mission,
    outcomes: projectContext.outcome_categories,
    successIndicators: projectContext.positive_indicators,
    culturalValues: projectContext.cultural_values
  }
})
```

---

## Benefits

### For Organizations
- AI finds quotes/themes aligned with actual goals
- Better reporting to funders
- See progress toward specific outcomes
- Community-defined success captured

### For Storytellers
- Their stories interpreted in proper context
- Cultural significance recognized
- Contributions linked to project impact

### For Funders/Partners
- Clear connection between stories and outcomes
- Evidence of theory of change in action
- Community-led evaluation
- Culturally responsive measurement

---

## Next Steps

1. **Prototype seed interview questions**
2. **Design conversational interface**
3. **Build AI extraction pipeline**
4. **Test with 1-2 projects**
5. **Refine based on feedback**
6. **Roll out to all projects**

---

## Questions to Consider

1. **Voice or text?** Voice feels more natural but requires transcription
2. **Required or optional?** Strong recommendation but not mandatory?
3. **Who conducts?** Project coordinator, anyone, or AI-guided?
4. **When to update?** Annual review? When project evolves?
5. **Privacy controls?** What can be shared externally vs internal only?

---

## Timeline Estimate

- **Design & Research:** 1 week
- **Database schema:** 2 days
- **Interview flow UI:** 1 week
- **AI extraction:** 1 week
- **Integration with analysis:** 3 days
- **Testing & refinement:** 1 week
- **Total:** ~4 weeks

---

**This approach transforms AI from generic text analysis into culturally-informed, outcome-focused impact measurement that respects community knowledge and honors the purpose of each project.**
