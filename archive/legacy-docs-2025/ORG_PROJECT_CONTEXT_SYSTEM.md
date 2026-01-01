# Organization & Project Context Management System

## Vision

Organizations and projects should own and maintain their own "seed data" - the foundational information about their mission, approach, and impact methodology. This enables:

1. **Project-Specific Analysis** - AI analyzes transcripts against what THIS project defines as success
2. **Organizational Identity** - Clear, consistent representation across the platform
3. **Self-Service** - Organizations update their own context without developer intervention
4. **Contextual Intelligence** - Every analysis, recommendation, and insight uses the right context

---

## User Stories

### As an Organization Admin:
- I want to define our organization's mission, values, and approach
- I want to specify what impact means for our organization
- I want to update this information as our work evolves
- I want AI to understand our context when analyzing our projects

### As a Project Manager:
- I want to define what success looks like for THIS specific project
- I want to specify expected outcomes that matter to our community
- I want to paste in existing documents (theory of change, logic models)
- I want AI to extract structure from my free-form text
- I want project analysis to reflect OUR definition of success, not generic metrics

### As a Community Member:
- I want to see what the project is trying to achieve
- I want to understand how they measure success
- I want to know if my story contributed to their outcomes

---

## Data Model

### 1. Organization Context (`organization_contexts`)

```sql
CREATE TABLE organization_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core Identity
  mission TEXT, -- What we exist to do
  vision TEXT, -- What we're working toward
  values TEXT[], -- Our guiding principles

  -- Approach & Methodology
  approach_description TEXT, -- How we work
  cultural_frameworks TEXT[], -- e.g., "Dadirri", "Two-way learning", "OCAP"
  key_principles TEXT[], -- Operating principles

  -- Impact Framework
  impact_philosophy TEXT, -- Our theory of change
  impact_domains JSONB, -- What areas we focus on
  measurement_approach TEXT, -- How we know we're making a difference

  -- Links & Resources
  website TEXT,
  theory_of_change_url TEXT,
  impact_report_urls TEXT[],

  -- AI Processing
  embedding vector(1536), -- For semantic search
  last_updated_by UUID REFERENCES profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
)
```

### 2. Project Context (`project_contexts`)

```sql
CREATE TABLE project_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),

  -- What & Why
  purpose TEXT, -- What this project is trying to achieve
  context TEXT, -- Why this project exists (community need, opportunity)
  target_population TEXT, -- Who we're working with

  -- Expected Outcomes (structured)
  expected_outcomes JSONB, -- [{ category, description, indicators: [] }]
  success_criteria TEXT[], -- How we'll know we succeeded
  timeframe TEXT, -- Project duration/phases

  -- Methodology
  program_model TEXT, -- How the project works
  cultural_approaches TEXT[], -- Specific cultural practices/protocols
  key_activities TEXT[], -- What we do

  -- Raw Source Data
  seed_interview_text TEXT, -- Original seed interview responses
  existing_documents TEXT, -- Pasted theory of change, logic models, etc.

  -- Processing State
  context_type VARCHAR(20) CHECK (context_type IN ('quick', 'full', 'imported')),
  ai_extracted BOOLEAN DEFAULT FALSE,
  extraction_quality_score INTEGER, -- 0-100

  -- Inheritance
  inherits_from_org BOOLEAN DEFAULT TRUE, -- Use org context as base

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_by UUID REFERENCES profiles(id),

  UNIQUE(project_id)
)
```

### 3. Seed Interview Templates (`seed_interview_templates`)

```sql
CREATE TABLE seed_interview_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_type VARCHAR(50), -- 'organization', 'project', 'both'

  questions JSONB, -- [{ id, question, help_text, section }]

  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## Seed Interview Questions

### For Organizations:

**Section 1: Core Identity**
1. What is your organization's mission? (What do you exist to do?)
2. What's your vision? (What world are you working toward?)
3. What values guide your work?

**Section 2: Approach & Culture**
4. How would you describe your approach to this work?
5. What cultural frameworks or practices guide your work? (e.g., Dadirri, Two-way learning, OCAP principles)
6. What makes your approach different or unique?

**Section 3: Impact & Measurement**
7. What does impact mean for your organization?
8. What areas of life/systems do you focus on? (individual, family, community, systems)
9. How do you know when you're making a difference?
10. What would you celebrate as a major success?

**Section 4: Resources** (Optional)
11. Website URL
12. Link to theory of change or impact framework document
13. Recent impact report or annual report URL

### For Projects:

**Section 1: Purpose & Context**
1. What is this project trying to achieve?
2. Why does this project exist? (What need or opportunity?)
3. Who are you working with? (Target population/community)

**Section 2: How Success is Defined**
4. What does success look like for this project?
5. How will you know when you've made a difference?
6. What specific changes are you hoping to see in people's lives?

**Section 3: How It Works**
7. How does this project work? (Program model)
8. What are the key activities or services?
9. What cultural approaches or protocols guide this project?
10. Who leads the project? (Community-led, partnership, etc.)

**Section 4: Outcomes & Timeline**
11. What outcomes are you expecting? (Short-term, medium-term, long-term)
12. What's the project timeframe?
13. What would you consider "early wins" vs "long-term impact"?

**Section 5: Existing Documents** (Optional - Copy/Paste)
14. If you have an existing theory of change, logic model, or project description, paste it here:

---

## User Interface Design

### 1. Organization Settings → Context Tab

```
┌─────────────────────────────────────────────────────────────┐
│ Organization Context                                [Edit]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯 Why This Matters                                      │ │
│ │                                                           │ │
│ │ This information helps our AI understand YOUR approach    │ │
│ │ to impact, so analysis reflects what matters to YOUR      │ │
│ │ organization - not generic metrics.                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Two Options:                                                  │
│                                                               │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ 📝 Seed Interview   │  │ 📄 Import Existing  │           │
│ │                     │  │                     │           │
│ │ Answer guided       │  │ Paste your existing │           │
│ │ questions (15 min)  │  │ documents - AI will │           │
│ │                     │  │ extract structure   │           │
│ │ [Start Interview]   │  │ [Import Document]   │           │
│ └─────────────────────┘  └─────────────────────┘           │
│                                                               │
│ Current Status: ⚠️  No context defined                       │
│                                                               │
│ Last Updated: Never                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Seed Interview Wizard (Modal)

```
┌─────────────────────────────────────────────────────────────┐
│ Organization Seed Interview          [Step 3 of 4] [Save ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Section 3: Impact & Measurement                              │
│                                                               │
│ 7. What does impact mean for your organization?              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ For us, impact means seeing First Nations communities    │ │
│ │ leading their own healing and development processes...    │ │
│ │                                                           │ │
│ │ [500 characters remaining]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ℹ️  Think about both immediate and long-term impact          │
│                                                               │
│ 8. What areas of life/systems do you focus on?              │
│ ☑ Individual wellbeing                                       │
│ ☑ Family strengthening                                       │
│ ☑ Community development                                      │
│ ☑ Systems change                                             │
│ ☐ Other: ________________                                    │
│                                                               │
│ 9. How do you know when you're making a difference?         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ We listen to community stories and watch for signs       │ │
│ │ of increased self-determination...                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [← Previous]  [Save Progress]  [Next →]  [Finish Later]     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Import Existing Document (Smart Paste)

```
┌─────────────────────────────────────────────────────────────┐
│ Import Existing Context                      [✕]             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Paste your existing document below:                          │
│ (Theory of change, logic model, about page, etc.)           │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Our organization works with Aboriginal communities       │ │
│ │ across NSW to strengthen cultural connection and...      │ │
│ │                                                           │ │
│ │                                                           │ │
│ │                                                           │ │
│ │                                                           │ │
│ │ [Paste here - supports plain text, Word, PDF text]       │ │
│ │                                                           │ │
│ │                                                           │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🤖 AI will extract:                                      │ │
│ │ • Mission & vision                                        │ │
│ │ • Key principles & values                                 │ │
│ │ • Impact areas & outcomes                                 │ │
│ │ • How you measure success                                 │ │
│ │                                                           │ │
│ │ You can review and edit everything before saving.         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Cancel]  [Extract with AI →]                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4. Review & Edit Extracted Context

```
┌─────────────────────────────────────────────────────────────┐
│ Review Extracted Context                    [Discard] [Save] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ✅ AI Extraction Complete - Quality Score: 87/100            │
│                                                               │
│ Review and edit each section below:                          │
│                                                               │
│ ▼ Core Identity                                              │
│   Mission [Edit]                                             │
│   "To support First Nations communities in leading their     │
│   own healing and development processes..."                  │
│                                                               │
│   Values [Edit]                                              │
│   • Self-determination                                        │
│   • Cultural continuity                                       │
│   • Community-led decision making                            │
│   + Add value                                                │
│                                                               │
│ ▼ Approach & Methodology                                     │
│   Approach Description [Edit]                                │
│   "We work alongside communities, never imposing..."         │
│                                                               │
│   Cultural Frameworks [Edit]                                 │
│   • Dadirri (Deep listening)                                 │
│   • Two-way learning                                          │
│   + Add framework                                            │
│                                                               │
│ ▼ Impact Framework                                           │
│   Impact Philosophy [Edit]                                   │
│   "Change happens when communities have agency..."           │
│                                                               │
│   Impact Domains [Edit]                                      │
│   • Individual healing & wellbeing                           │
│   • Family strengthening                                      │
│   • Community development                                     │
│   • Systems change                                            │
│   + Add domain                                               │
│                                                               │
│ [Cancel]  [Save Context]                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 5. Project Context Management (Embedded in Project Settings)

```
┌─────────────────────────────────────────────────────────────┐
│ Project: Goods Manufacturing Initiative                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Tabs: [Details] [Context] [Storytellers] [Analysis]         │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Project Context                         [Edit Context] │ │
│ │                                                           │ │
│ │ Status: ✅ Fully defined (Quality: 92/100)               │ │
│ │ Last Updated: Oct 11, 2025 by Sarah Johnson              │ │
│ │                                                           │ │
│ │ Purpose:                                                  │ │
│ │ "Build durable, repairable household goods with and by   │ │
│ │  First Nations communities..."                            │ │
│ │                                                           │ │
│ │ Expected Outcomes (6):                                    │ │
│ │ • Sleep Quality (tracked in 23 transcripts)              │ │
│ │ • Manufacturing Capacity (tracked in 18 transcripts)     │ │
│ │ • Health & Hygiene (tracked in 23 transcripts)           │ │
│ │ • ... (show all)                                         │ │
│ │                                                           │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 💡 This context powers:                            │   │ │
│ │ │ • Project Outcomes tracking                        │   │ │
│ │ │ • Relevant quote extraction                        │   │ │
│ │ │ • Community voice analysis                         │   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ │                                                           │ │
│ │ [View Full Context] [Update] [Clear & Start Over]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Organization Context

```typescript
// Get organization context
GET /api/organizations/[id]/context
Response: OrganizationContext

// Create/Update via seed interview
POST /api/organizations/[id]/context/seed-interview
Body: { answers: { [questionId]: string } }
Response: { success: boolean, context: OrganizationContext }

// Create/Update via import
POST /api/organizations/[id]/context/import
Body: { documentText: string }
Response: { success: boolean, context: OrganizationContext, quality: number }

// Update specific fields
PATCH /api/organizations/[id]/context
Body: Partial<OrganizationContext>
Response: OrganizationContext
```

### Project Context

```typescript
// Get project context
GET /api/projects/[id]/context
Response: ProjectContext

// Create via seed interview
POST /api/projects/[id]/context/seed-interview
Body: { answers: { [questionId]: string }, inheritFromOrg: boolean }
Response: { success: boolean, context: ProjectContext }

// Create via import
POST /api/projects/[id]/context/import
Body: { documentText: string, inheritFromOrg: boolean }
Response: { success: boolean, context: ProjectContext, quality: number }

// Update
PATCH /api/projects/[id]/context
Body: Partial<ProjectContext>
Response: ProjectContext

// Delete (clears context)
DELETE /api/projects/[id]/context
Response: { success: boolean }
```

---

## AI Processing Pipeline

### 1. Seed Interview → Structured Context

```typescript
async function processSeedInterview(
  answers: Record<string, string>,
  type: 'organization' | 'project'
): Promise<StructuredContext> {
  const systemPrompt = `Extract structured context from seed interview answers.

  Focus on:
  - Clear, actionable mission/purpose statements
  - Specific, measurable outcomes
  - Cultural frameworks and approaches
  - Community-defined success indicators

  Be culturally humble and preserve Indigenous terms/concepts.`

  const userPrompt = `
  TYPE: ${type}

  ANSWERS:
  ${formatAnswers(answers)}

  Extract structured context as JSON.
  `

  const response = await llmClient.createChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    responseFormat: 'json',
    model: 'gpt-4o-mini' // Fast, accurate for extraction
  })

  return parseAndValidate(response)
}
```

### 2. Document Import → Structured Context

```typescript
async function extractContextFromDocument(
  documentText: string,
  type: 'organization' | 'project'
): Promise<{ context: StructuredContext, quality: number }> {
  const systemPrompt = `You're extracting organizational/project context from an existing document.

  The document might be:
  - Theory of change
  - Logic model
  - About page
  - Grant application
  - Impact report

  Extract:
  - Mission/purpose
  - Approach & methodology
  - Expected outcomes
  - Success indicators
  - Cultural frameworks mentioned

  Assign a quality score (0-100) based on:
  - Completeness of information
  - Clarity of outcomes
  - Specificity of success criteria
  `

  const response = await llmClient.createChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extract from:\n\n${documentText.substring(0, 8000)}` }
    ],
    responseFormat: 'json'
  })

  const result = JSON.parse(response)

  return {
    context: result.extracted_context,
    quality: result.quality_score
  }
}
```

### 3. Context Enhancement Over Time

```typescript
async function enhanceContextFromTranscripts(
  projectId: string,
  transcripts: Transcript[]
): Promise<ContextEnhancements> {
  // As more transcripts are added, AI can suggest:
  // - Additional outcomes mentioned by storytellers
  // - Cultural approaches/protocols observed
  // - Success indicators that emerge from stories
  // - Refinements to existing outcome descriptions

  const systemPrompt = `Analyze transcripts to suggest context enhancements.

  Look for:
  - Outcomes mentioned by storytellers that aren't in our tracking
  - Cultural practices/protocols being used
  - Ways community defines success
  - Language patterns indicating impact

  Suggest additions/refinements, don't replace existing context.`

  const response = await llmClient.createChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: formatTranscriptsForAnalysis(transcripts) }
    ]
  })

  return {
    suggested_outcomes: [...],
    suggested_indicators: [...],
    cultural_observations: [...]
  }
}
```

---

## Implementation Phases

### Phase 1: Database & Core API (Week 1)
- [ ] Create migration for organization_contexts table
- [ ] Create migration for project_contexts table
- [ ] Create seed_interview_templates table with default questions
- [ ] Build API routes for context CRUD
- [ ] Build AI extraction functions using LLM client

### Phase 2: Frontend - Organization Context (Week 2)
- [ ] Organization Settings → Context tab
- [ ] Seed interview wizard component
- [ ] Document import component
- [ ] Review & edit extracted context
- [ ] Save/update functionality

### Phase 3: Frontend - Project Context (Week 3)
- [ ] Project Settings → Context tab
- [ ] Project seed interview (reuse organization wizard)
- [ ] Option to inherit from organization
- [ ] Link to analysis: "Using this context for outcomes tracking"
- [ ] Update project outcomes tracker to use new schema

### Phase 4: Integration & Polish (Week 4)
- [ ] Migrate existing Goods context to new schema
- [ ] Add context status indicators throughout UI
- [ ] Build "suggested enhancements" from transcripts feature
- [ ] Documentation & training materials
- [ ] Admin tools for reviewing context quality

---

## Benefits

### For Organizations:
✅ Own your narrative and impact definition
✅ Update as your work evolves
✅ Consistent representation across platform
✅ Better analysis reflects YOUR approach

### For AI Analysis:
✅ Project-specific outcomes tracking
✅ Culturally-informed quote extraction
✅ Relevant themes & insights
✅ Community voice aligned with project goals

### For Platform:
✅ Scalable context management
✅ Self-service reduces admin burden
✅ Richer, more accurate analysis
✅ Organizations feel ownership of their data

---

## Success Metrics

- **Adoption**: % of organizations with defined context (target: 80% within 3 months)
- **Quality**: Average context quality score (target: >75/100)
- **Usage**: % of projects using project-specific outcomes (target: 60%)
- **Satisfaction**: Organization feedback on relevance of analysis (target: 4.5/5)
- **Efficiency**: Time saved by AI extraction vs manual entry (target: 70% reduction)

---

## Next Steps

1. Review & approve this design
2. Create database migrations
3. Build LLM-powered extraction functions
4. Create frontend components
5. Test with pilot organizations
6. Roll out gradually with support
