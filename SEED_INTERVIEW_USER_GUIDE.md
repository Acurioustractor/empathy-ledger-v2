# Seed Interview System - User Guide

## Overview

The **Seed Interview System** allows projects and organizations to define their own success metrics and outcomes. Instead of generic impact scores, you get project-specific tracking based on **your** definition of success.

## ✅ System Status: READY TO USE

- ✅ Backend APIs: Fully functional
- ✅ AI Extraction: Working with Ollama (FREE)
- ✅ Frontend Display: Already integrated
- ✅ Database Storage: Configured with proper security

---

## How It Works

### 1. Define Your Project Context

Complete a **14-question seed interview** about your project:
- What are you trying to achieve?
- Who are you working with?
- What does success look like?
- How will you know you're making a difference?

### 2. AI Extracts Structure

Our AI reads your responses and extracts:
- **Purpose** - What the project is trying to achieve
- **Expected Outcomes** - Specific, measurable results
- **Success Criteria** - How you'll know it's working
- **Cultural Approaches** - Your unique methodologies
- **Key Activities** - What you do

### 3. Track Project-Specific Outcomes

Once context is defined, the system:
- Analyzes transcripts for evidence of **YOUR** outcomes
- Scores each outcome based on storyteller evidence
- Shows quotes that demonstrate progress
- Identifies which storytellers are mentioning outcomes
- Highlights wins and opportunities

---

## Using the System

### For Project Managers

#### Step 1: Complete Seed Interview

**API Endpoint:**
```
POST /api/projects/{project-id}/context/seed-interview
```

**Test Script** (Currently working):
```bash
npx tsx scripts/test-seed-interview-fixed.ts
```

#### Step 2: Clear Analysis Cache

After defining context, clear the cache to regenerate analysis:

**Via API:**
```bash
curl -X POST 'http://localhost:3030/api/projects/{project-id}/analysis/clear-cache'
```

**Via UI:**
- Navigate to Project page
- Click "Clear Cache & Regenerate" button

#### Step 3: View Project Outcomes

Navigate to: **Projects → [Your Project] → Analysis → Project Outcomes Tab**

You'll see:
- Each outcome with evidence strength (Not Found / Mentioned / Described / Demonstrated)
- Score (0-100) based on depth of evidence
- Quotes from storytellers
- Which storytellers mentioned each outcome
- Overall progress summary
- Key wins
- Gaps and opportunities

---

## Example: Goods Manufacturing Project

### Input (Seed Interview Responses):

**Q: What is this project trying to achieve?**
> Build durable, repairable household goods with and by First Nations communities, so ownership, skills, and value stay on-country while meeting urgent needs for beds, washing machines, and fridges.

**Q: What specific outcomes do you expect to see?**
> Fewer people sleeping on floors and improved sleep quality. Better hygiene, dignity, and reduced infections including RHD-related risks. Local jobs, skills transfer, and pride in making and maintaining their own goods. Faster, cheaper repairs and longer product lifespans that reduce waste.

**Q: How will you know if the project is successful?**
> Community-defined indicators and stories show improved sleep, hygiene, and dignity. Local health data reflects reductions in infections and RHD risk factors. Lifecycle and repair records demonstrate durability and maintainability. Facilities, training, and decision-making are owned locally.

### Output (Extracted Outcomes):

AI extracts structured outcomes like:
1. **Sleep Quality** - "Improved sleep and dignity for families"
   - Indicators: Fewer people sleeping on floors, Reduced health issues
   - Timeframe: Short-term

2. **Hygiene & Health** - "Better hygiene and reduced infections"
   - Indicators: Working washing machines, Reduced RHD risk
   - Timeframe: Medium-term

3. **Manufacturing Capacity** - "Local production and maintenance skills"
   - Indicators: Trained community teams, Local facilities operating
   - Timeframe: Long-term

### Analysis Result:

When transcripts are analyzed, the system shows:
- **Sleep Quality: 85/100** (Strong Evidence)
  - 12 quotes about beds and better sleep
  - 8 storytellers mentioned this

- **Hygiene & Health: 72/100** (Some Evidence)
  - 7 quotes about washing machines and health
  - 6 storytellers mentioned this

- **Manufacturing Capacity: 68/100** (Some Evidence)
  - 5 quotes about making and fixing goods
  - 4 storytellers mentioned this

---

## UI Changes

### Before Context Defined:
- **"Impact Framework"** tab shows generic scores:
  - Relationship Strengthening: 48/100
  - Cultural Continuity: 52/100
  - Community Empowerment: 65/100
  - (Generic metrics that may not match your project)

### After Context Defined:
- **"Project Outcomes"** tab shows YOUR outcomes:
  - Sleep Quality: 85/100
  - Hygiene & Health: 72/100
  - Manufacturing Capacity: 68/100
  - (Project-specific metrics YOU defined)

---

## API Endpoints

### Get Interview Template

**GET** `/api/projects/{id}/context/seed-interview`

Returns 14 questions to guide context definition.

**Example:**
```bash
curl 'http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/context/seed-interview'
```

### Submit Interview Responses

**POST** `/api/projects/{id}/context/seed-interview`

**Body:**
```json
{
  "responses": [
    {
      "question_id": "project_overview",
      "question": "What is this project trying to achieve?",
      "answer": "Your answer here..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "context": {
    "id": "...",
    "project_id": "...",
    "purpose": "Extracted purpose...",
    "expected_outcomes": [...],
    "extraction_quality_score": 100
  },
  "extracted": {
    "purpose": "...",
    "expected_outcomes": [...]
  },
  "message": "Context created from seed interview"
}
```

---

## Database Schema

### `project_contexts` Table

All extracted context is stored here:

```sql
CREATE TABLE project_contexts (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Core Context
  purpose TEXT,
  context TEXT,
  target_population TEXT,

  -- Structured Outcomes
  expected_outcomes JSONB,  -- Array of outcome objects
  success_criteria TEXT[],
  timeframe TEXT,

  -- Methodology
  program_model TEXT,
  cultural_approaches TEXT[],
  key_activities TEXT[],

  -- Raw Data
  seed_interview_text TEXT,

  -- Metadata
  context_type VARCHAR(20),  -- 'quick', 'full', 'imported'
  ai_extracted BOOLEAN,
  extraction_quality_score INTEGER,  -- 0-100
  ai_model_used VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id)
)
```

---

## AI Processing

### Model Used
- **Development**: Ollama (llama3.1:8b) - FREE, unlimited, ~10-15 seconds
- **Production**: OpenAI (gpt-4o-mini) - Paid, rate-limited, ~2-5 seconds

### Quality Scoring
AI assigns a score (0-100) based on:
- Completeness of information
- Clarity of outcomes
- Specificity of success criteria

**Scores:**
- 90-100: Excellent, ready for outcomes tracking
- 75-89: Good, may benefit from minor clarifications
- 50-74: Acceptable, consider adding more detail
- <50: Incomplete, re-do interview with more detail

### Expected Outcomes Format

```json
{
  "category": "Sleep Quality",
  "description": "Improved sleep and dignity for families",
  "indicators": [
    "Fewer people sleeping on floors",
    "Reduced health issues from poor sleep"
  ],
  "timeframe": "short_term"  // or "medium_term", "long_term"
}
```

---

## Troubleshooting

### Issue: "No project context defined" message

**Solution:**
1. Complete the seed interview
2. Check that context was saved: View project settings
3. Clear analysis cache
4. Refresh the analysis

### Issue: Outcomes not showing in UI

**Checklist:**
- [ ] Seed interview completed and saved
- [ ] Analysis cache cleared
- [ ] New analysis generated (may take 5-15 minutes with Ollama)
- [ ] Browser cache cleared (hard refresh: Cmd+Shift+R)

### Issue: Generic impact scores still showing

**Reason:** Project context not defined yet, or analysis is using old cache.

**Solution:**
1. Complete seed interview
2. Clear cache: `POST /api/projects/{id}/analysis/clear-cache`
3. Trigger new analysis: Visit project analysis page

### Issue: Low extraction quality score (<50)

**Reason:** Responses too vague or incomplete.

**Solution:**
- Be specific about outcomes (not just "better health" but "reduced RHD infections")
- Include measurable indicators
- Describe how you'll know success happened
- Mention who you're working with
- Explain your approach/methodology

---

## Best Practices

### Writing Good Responses

**❌ Vague:**
> "We want to help the community"

**✅ Specific:**
> "We're training 15 community members in bed manufacturing so families have durable beds that last 10+ years"

**❌ Generic:**
> "Better health outcomes"

**✅ Measurable:**
> "Reduced RHD-related infections measured through local health center data and community-reported improvements in hygiene"

### Defining Outcomes

1. **Be Concrete**: "10 families with new beds" not "improved living conditions"
2. **Include Evidence**: How will you see/hear/measure this?
3. **Specify Timeframe**: Short-term (months), medium-term (1-2 years), long-term (3+ years)
4. **Cultural Context**: Mention protocols, practices, or cultural approaches
5. **Community Voice**: How does community define success?

### Iteration

You can:
- **Update context** anytime by re-submitting seed interview
- **Refine outcomes** as project evolves
- **Add detail** if extraction quality score is low
- **Review regularly** (quarterly recommended)

---

## What Happens Next?

### Immediate (After Seed Interview):
1. ✅ Context saved to database
2. ✅ Quality score calculated
3. ✅ Ready for analysis

### After Cache Clear:
1. 🔄 Old analysis deleted
2. 🔄 System ready to regenerate

### After New Analysis:
1. ✅ Transcripts analyzed for YOUR outcomes
2. ✅ Evidence extracted and scored
3. ✅ Project Outcomes tab populated
4. ✅ Generic Impact Framework hidden

---

## Example Workflow

### Week 1: Define Context
```bash
# Complete seed interview
npx tsx scripts/test-seed-interview-fixed.ts

# Result: Context saved with quality score 95/100
```

### Week 2: Collect Stories
- Interview storytellers
- Upload transcripts
- System processes automatically

### Week 3: Review Outcomes
```bash
# Clear cache
curl -X POST 'http://localhost:3030/api/projects/{id}/analysis/clear-cache'

# View in UI
# Navigate to: Projects → [Project] → Analysis → Project Outcomes
```

**See:**
- Sleep Quality: 85/100 (12 quotes, 8 storytellers)
- Hygiene & Health: 72/100 (7 quotes, 6 storytellers)
- Key Win: "Community reports sleeping better for first time in years"
- Opportunity: "Only 4 storytellers mentioned manufacturing - gather more stories from workshop participants"

### Month 3: Refine & Report
- Review outcomes
- Share insights with community
- Update context if project evolved
- Generate reports for funders

---

## Next Steps

### For This Project:
1. ✅ Backend fully functional
2. ✅ Frontend already integrated
3. ⏳ Waiting for analysis to complete (~5-10 mins with Ollama)
4. ⏳ Test UI display when ready

### Future Enhancements:
- Frontend wizard UI (guided interview experience)
- Organization-level context management
- Template customization
- Multi-language support
- Context quality monitoring dashboard

---

## Support & Documentation

### Related Docs:
- [SEED_INTERVIEW_TESTING_GUIDE.md](SEED_INTERVIEW_TESTING_GUIDE.md) - Technical testing guide
- [docs/ORG_PROJECT_CONTEXT_SYSTEM.md](docs/ORG_PROJECT_CONTEXT_SYSTEM.md) - Complete architecture
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Current status

### Need Help?
- Check troubleshooting section above
- Review test script: `scripts/test-seed-interview-fixed.ts`
- Check server logs for errors

---

## Success! 🎉

You now have a system that tracks outcomes based on **your project's definition of success**, not generic metrics. This enables:

- ✅ Community-defined impact measurement
- ✅ Culturally appropriate analysis
- ✅ Evidence-based progress tracking
- ✅ Meaningful reporting to funders
- ✅ Stories connected to outcomes

**The system respects that different projects have different goals, and measures what matters to YOUR community.**
