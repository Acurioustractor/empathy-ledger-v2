# Project Context Implementation Guide
## Two Models: Quick Setup & Full Setup

---

## ✅ What's Been Built

### 1. Database Schema
**File:** `supabase/migrations/20251011_project_context.sql`

**Tables Created:**
- `projects` - Added columns: `context_model`, `context_description`, `context_updated_at`
- `project_seed_interviews` - Stores seed interview transcripts
- `project_profiles` - Stores extracted project profiles with all context

**Helper Function:**
- `get_project_context(project_id)` - Returns context in AI-ready format

### 2. API Routes
- `/api/projects/[id]/context` - Get/update/delete project context (both models)
- `/api/projects/[id]/context/seed-interview` - Process seed interviews (full model)

### 3. AI Extraction
**File:** `src/lib/ai/project-profile-extractor.ts`

- `extractProjectProfile()` - Extracts full profile from seed interview
- `extractQuickProfile()` - Extracts basic context from description

---

## 🚀 How to Use: Quick Setup Model

### Perfect For:
- Fast setup (< 2 minutes)
- Smaller projects
- When you have a clear project description already written
- First-time users

### Step-by-Step:

**1. Run Migration**
```bash
# In Supabase Dashboard → SQL Editor, paste:
supabase/migrations/20251011_project_context.sql
```

**2. Add Context via API**
```typescript
// Example: Add quick context to Goods project
fetch('/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/context', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'quick',
    description: `
Goods is a philanthropic initiative supporting grassroots community
organizations doing incredible work but lacking access to traditional
funding. We connect them with resources, amplify their stories, and
build networks between organizations.

Success looks like: Organizations feeling confident and supported,
new collaborations forming, sustainable funding secured, and
communities thriving through their work.

Key outcomes we track:
- Organizational confidence and capacity
- Network connections and partnerships
- Financial sustainability
- Community impact and reach
    `.trim()
  })
})
```

**3. AI Automatically Extracts:**
```json
{
  "mission": "Support grassroots organizations through resources and story amplification",
  "primary_goals": [
    "Connect organizations with resources",
    "Amplify community stories",
    "Build inter-organizational networks"
  ],
  "outcome_categories": [
    {
      "category": "Organizational Confidence",
      "examples": ["feeling supported", "increased capacity", "validated work"],
      "keywords": ["confidence", "support", "validated", "capable", "empowered"]
    },
    {
      "category": "Network Building",
      "examples": ["new partnerships", "collaborations", "connected to peers"],
      "keywords": ["connected", "partnership", "network", "together", "collaboration"]
    }
  ],
  "positive_language": [
    "supported", "confident", "connected", "sustainable",
    "thriving", "empowered", "amplified", "resourced"
  ]
}
```

**4. Analysis Uses Context**
When analyzing transcripts, AI now looks for quotes demonstrating:
- Organizational confidence language
- Network/connection mentions
- Sustainability indicators
- Empowerment themes

---

## 🎙️ How to Use: Full Setup Model (Seed Interview)

### Perfect For:
- Comprehensive context
- Complex/multi-faceted projects
- Cultural protocols important
- Best practice impact measurement

### Step-by-Step:

**1. Conduct Seed Interview (10-15 min)**

Use these 5 core questions:

**Q1: Project Origin Story**
> "Can you tell me the story of how this project came to be? What need or gap was the community experiencing, and who initiated this?"

**Q2: How It Works**
> "Walk me through what actually happens in this project. What does a typical participant experience?"

**Q3: Intended Outcomes**
> "When this project is working at its best, what does that look like? What changes are you hoping to see in people's lives?"

**Q4: Cultural Context**
> "What cultural protocols or values guide this work? How does this project connect to community ways of knowing?"

**Q5: Measuring Success**
> "How do you currently know if the project is making a difference? What signs tell you something meaningful is happening?"

**Record:** Audio, video, or detailed notes

**2. Submit Interview via API**
```typescript
fetch('/api/projects/{projectId}/context/seed-interview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    interview_transcript: `
[Full transcript of interview - 5-10 pages]

INTERVIEWER: Can you tell me the story of how Goods came to be?

INTERVIEWEE: It started when we noticed incredible community
organizations doing transformative work but constantly struggling
for funding. Traditional philanthropy wasn't reaching them...

[etc...]
    `,
    interviewed_by: "Sarah Chen",
    interview_audio_url: "https://..."  // Optional
  })
})
```

**3. AI Extracts Comprehensive Profile**
```json
{
  "mission": "...",
  "origin_story": "...",
  "community_need": "...",
  "program_model": "...",
  "key_activities": [],
  "cultural_approaches": [],
  "cultural_protocols": [],
  "outcome_categories": [
    {
      "category": "Organizational Resilience",
      "examples": [
        "Navigating funding uncertainty with confidence",
        "Building internal capacity and systems",
        "Sustaining operations during challenges"
      ],
      "keywords": [
        "resilient", "sustainable", "capacity", "systems",
        "navigate", "adapt", "persist", "continue"
      ]
    }
  ],
  "success_indicators": [
    {
      "name": "Confident Decision-Making",
      "description": "Organizations making strategic choices without external validation",
      "why_matters": "Shows shift from dependency to self-determination"
    }
  ],
  "positive_language": [
    "we decided", "our choice", "felt supported",
    "could finally", "no longer struggling"
  ],
  "cultural_values": ["Community-led", "Relationship-first", "Trust-based"],
  "completeness_score": 85
}
```

---

## 🧠 How Analysis Uses Context

### Before (No Context):
```
Generic quote extraction finds:
- "community" mentioned 14 times
- "support" mentioned 9 times

Themes: community, support, connection (generic)
```

### After (With Context):
```
Context-aware extraction finds:
- 8 quotes about "Organizational Confidence" (project outcome)
- 5 quotes about "Network Building" (project outcome)
- 3 quotes about "Sustainability" (project outcome)

Themes: organizational resilience, peer networks,
sustainable funding models (specific to project goals)

Quotes selected demonstrate actual project outcomes!
```

### Example Quote With Context:

**Without Context:**
> "We felt more confident about our work."
> Theme: confidence (generic)

**With Context:**
> "We felt more confident about our work - knowing Goods believed
> in us meant we could take risks we wouldn't have before."
>
> **Relates to:** Organizational Confidence outcome
> **Demonstrates:** Success indicator "Confident Decision-Making"
> **Cultural value:** Trust-based support
> **Significance:** Shows impact of relational funding approach

---

## 📊 Integration with Analysis API

The analysis route automatically uses context:

```typescript
// In /api/projects/[id]/analysis/route.ts

// Fetch project context
const { data: contextData } = await supabase
  .rpc('get_project_context', { p_project_id: projectId })

// Pass to quote extractor
const quotes = await extractIntelligentQuotes(
  transcript.text,
  storytellerName,
  5,
  contextData  // ← Context guides extraction
)
```

Updated prompt with context:
```
PROJECT CONTEXT:
Mission: ${context.mission}
Key Outcomes: ${context.outcome_categories.map(c => c.category).join(', ')}
Success Language: ${context.positive_language.join(', ')}

Extract quotes that demonstrate these specific project outcomes...
```

---

## 🎯 Example: Goods Project

### Quick Setup (2 min):
```
Description: "Support grassroots orgs with resources and story amplification.
Success = confident orgs, strong networks, sustainable funding."

AI extracts:
- 3 outcome categories
- 10 success keywords
- Basic context for analysis
```

### Full Setup (15 min):
```
Seed Interview covering:
- How Goods started (founder's story)
- Trust-based funding model
- Relationship-first approach
- Community-defined success
- Network effect intentions

AI extracts:
- 6 outcome categories (with examples)
- 15 success indicators (with why they matter)
- 20+ positive language patterns
- Cultural values (trust, relationships, community-led)
- Impact domains (individual, organizational, ecosystem)
```

**Result:** Analysis finds quotes like:
- "Goods trusted us to know what we needed" (Trust-based value)
- "Now we're connected to 5 other orgs doing similar work" (Network outcome)
- "We can plan 2 years ahead now" (Sustainability outcome)

---

## 🔄 Updating Context

### Quick Model:
```typescript
// Update description anytime
PUT /api/projects/{id}/context
{ model: 'quick', description: 'Updated description...' }
```

### Full Model:
```typescript
// Update interview and re-extract
PUT /api/projects/{id}/context/seed-interview
{ interview_transcript: 'Updated transcript...' }
```

---

## 📱 Next: Build UI

### Quick Setup UI:
```
┌─────────────────────────────────────┐
│ Add Project Context (Quick)         │
├─────────────────────────────────────┤
│                                     │
│ Tell us about your project:        │
│ ┌─────────────────────────────────┐│
│ │ What is the project's purpose?  ││
│ │ What activities happen?         ││
│ │ What outcomes do you hope for?  ││
│ │                                 ││
│ │ (Free text, 200-500 words)      ││
│ └─────────────────────────────────┘│
│                                     │
│ [Extract Context with AI]          │
└─────────────────────────────────────┘
```

### Full Setup UI:
```
┌─────────────────────────────────────┐
│ Seed Interview (Comprehensive)      │
├─────────────────────────────────────┤
│ Let's have a conversation about     │
│ your project (10-15 minutes)        │
│                                     │
│ 🎙️ [Record Audio] or               │
│ 💬 [Text Interview]                 │
│                                     │
│ Question 1 of 5:                    │
│ "Tell me the story of how this      │
│  project came to be..."             │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ [Your answer here...]           ││
│ └─────────────────────────────────┘│
│                                     │
│ [Next Question →]                   │
└─────────────────────────────────────┘
```

---

## 🚀 Ready to Use!

**Next Steps:**
1. Run migration in Supabase
2. Try quick setup with Goods project
3. See improved analysis results
4. Build UI for easy setup

**Files created:**
- ✅ Database schema
- ✅ API routes (both models)
- ✅ AI extractors
- ✅ Documentation

**To implement in analysis:**
- Modify quote extractors to accept context parameter
- Update analysis route to fetch and pass context
- Clear analysis cache to regenerate

---

This dramatically improves analysis quality by giving AI the context it needs to identify quotes and themes that actually matter to your project!
