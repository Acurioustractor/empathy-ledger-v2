# Oonchiumpa Storyteller Analysis Report
*Generated: 2025-10-09*

## Executive Summary

**Organization:** Oonchiumpa
**Total Storytellers:** 4
**Total Transcripts:** 7
**Total Projects:** 2

### Key Findings
- ✅ All storytellers have comprehensive bios
- ⚠️ 2/4 storytellers missing cultural background information
- ⚠️ 2/7 transcripts need AI analysis
- ⚠️ No storytellers formally assigned to projects via project_storytellers table

---

## Storyteller Profiles

### 1. Kristy Bloomfield
**ID:** `b59a1f4c-94fd-4805-a2c5-cac0922133e0`

**Profile Status:**
- ✅ Bio: 914 characters (comprehensive)
- ✅ Cultural Background: Aboriginal Australian - Traditional Owner (Bloomfield and Liddle families)

**Transcripts (4 total):**

| Title | Status | AI Summary | Themes | Quotes | Action Required |
|-------|--------|------------|--------|--------|-----------------|
| Caterpillar Dreaming | pending | ❌ | ❌ | ❌ | **NEEDS FULL AI ANALYSIS** |
| Sitdown interview #1 | pending | ❌ | ❌ | ❌ | **NEEDS FULL AI ANALYSIS** |
| Kristy - Full Interview Law Students | pending | ✅ | ✅ (7) | ✅ (5) | None - Complete |
| Kristy Bloomfield - Interview Transcript | pending | ✅ | ✅ (5) | ✅ (5) | None - Complete |

**Project Associations:**
- "Kristy - Full Interview Law Students" linked to **Law Student Workshops** project

---

### 2. Tanya Turner
**ID:** `dc85700d-f139-46fa-9074-6afee55ea801`

**Profile Status:**
- ✅ Bio: 724 characters (comprehensive)
- ✅ Cultural Background: Aboriginal woman from Central Australia

**Transcripts (1 total):**

| Title | Status | AI Summary | Themes | Quotes | Action Required |
|-------|--------|------------|--------|--------|-----------------|
| Tanya | pending | ✅ | ✅ (5) | ✅ (4) | None - Complete |

**Project Associations:**
- No project linkages

---

### 3. Patricia Ann Miller
**ID:** `1971d21d-5037-4f7b-90ce-966a4e74d398`

**Profile Status:**
- ✅ Bio: 676 characters (comprehensive)
- ❌ Cultural Background: **MISSING** - needs to be added

**Transcripts (1 total):**

| Title | Status | AI Summary | Themes | Quotes | Action Required |
|-------|--------|------------|--------|--------|-----------------|
| Untitled | pending | ✅ | ✅ (3) | ✅ (5) | Consider adding meaningful title |

**Project Associations:**
- No project linkages

---

### 4. Aunty Bev and Uncle Terry
**ID:** `f8e99ed8-723a-48bc-a346-40f4f7a4032e`

**Profile Status:**
- ✅ Bio: 746 characters (comprehensive)
- ❌ Cultural Background: **MISSING** - needs to be added

**Transcripts (1 total):**

| Title | Status | AI Summary | Themes | Quotes | Action Required |
|-------|--------|------------|--------|--------|-----------------|
| Untitled | pending | ✅ | ✅ (5) | ✅ (5) | Consider adding meaningful title |

**Project Associations:**
- No project linkages

---

## Project Overview

### Project 1: Law Student Workshops
**ID:** `1bfcbf56-4a36-42a1-b819-e0dab7749597`
**Status:** Active

**Assigned Storytellers:** None (via project_storytellers table)

**Linked Transcripts (5):**
1. Chelsea Kenneally - Law Student reflection ✅
2. Suzie Ma Law Student Reflection ✅
3. Kristy - Full Interview Law Students ✅ *(Kristy Bloomfield)*
4. Adelaide Hayes Law Student Reflection ✅
5. Aidan Harris Law Student Reflections ✅

**Note:** All transcripts in this project have complete AI analysis

---

### Project 2: The Homestead
**ID:** `d10daf41-02ae-45e4-9e9b-1c96e56ee820`
**Status:** Active

**Assigned Storytellers:** None
**Linked Transcripts:** None

---

## Required Actions

### High Priority

#### 1. Complete AI Analysis for Missing Transcripts
**Transcripts requiring analysis (2):**
- Kristy Bloomfield: "Caterpillar Dreaming"
- Kristy Bloomfield: "Sitdown interview #1"

**Required AI Processing:**
- Generate AI summary
- Extract themes
- Identify key quotes
- Generate metadata

**Recommended Approach:**
Use the transcript analysis pipeline at `src/lib/workflows/transcript-processing-pipeline.ts` or the AI analyzer at `src/lib/ai/transcript-analyzer-v2.ts`

#### 2. Add Missing Cultural Background Information
**Profiles requiring cultural background (2):**
- Patricia Ann Miller (ID: `1971d21d-5037-4f7b-90ce-966a4e74d398`)
- Aunty Bev and Uncle Terry (ID: `f8e99ed8-723a-48bc-a346-40f4f7a4032e`)

**Recommended Approach:**
- Review transcript content for cultural identity mentions
- Consult with storyteller or organization for accurate cultural background
- Update profile via admin interface or API

### Medium Priority

#### 3. Formalize Project-Storyteller Relationships
**Issue:** No storytellers are formally assigned to projects via the `project_storytellers` junction table, even though transcripts are linked to projects.

**Recommended Actions:**
- Review which storytellers should be assigned to "Law Student Workshops"
  - Kristy Bloomfield (has transcript in project)
- Review which storytellers should be assigned to "The Homestead"
- Create assignments via project management interface

#### 4. Add Meaningful Titles to Untitled Transcripts
**Transcripts needing titles (2):**
- Patricia Ann Miller: "Untitled"
- Aunty Bev and Uncle Terry: "Untitled"

**Recommended Approach:**
- Review transcript content
- Generate descriptive title based on main themes/topics
- Update via transcript editor

### Low Priority

#### 5. Review Transcript Status
**All transcripts currently marked as "pending"**

**Consider updating status based on:**
- Completion of AI analysis
- Publication readiness
- Review/approval workflow

---

## Analysis Workflow Recommendations

### For Transcript AI Analysis

When analyzing the 2 remaining transcripts, the recommended workflow is:

1. **Load Transcript**
   ```typescript
   // Use transcript-analyzer-v2.ts
   import { analyzeTranscript } from '@/lib/ai/transcript-analyzer-v2';
   ```

2. **Generate Analysis**
   - AI Summary (executive summary of content)
   - Themes (5-7 key themes from content)
   - Key Quotes (4-6 significant quotes)

3. **Update Database**
   ```sql
   UPDATE transcripts
   SET
     ai_summary = '...',
     themes = ARRAY['theme1', 'theme2', ...],
     key_quotes = ARRAY['quote1', 'quote2', ...]
   WHERE id = '...'
   ```

4. **Verify Completion**
   - Re-run analysis script to confirm all fields populated

### For Project-Specific Analysis

To analyze storytellers and transcripts within specific project contexts:

1. **Group by Project**
   - Law Student Workshops: Focus on educational impact themes
   - The Homestead: Define project scope and assign relevant storytellers

2. **Cross-Reference Analysis**
   - Compare themes across storytellers within same project
   - Identify common narratives
   - Extract project-level insights

3. **Generate Project Summaries**
   - Aggregate storyteller contributions
   - Synthesize key learnings
   - Create impact reports

---

## Database Queries for Common Tasks

### Get Storyteller with All Transcripts
```sql
SELECT
  p.display_name,
  p.bio,
  p.cultural_background,
  json_agg(
    json_build_object(
      'title', t.title,
      'ai_summary', t.ai_summary,
      'themes', t.themes,
      'key_quotes', t.key_quotes
    )
  ) as transcripts
FROM profiles p
LEFT JOIN transcripts t ON t.storyteller_id = p.id
WHERE p.id = 'storyteller-id'
GROUP BY p.id;
```

### Find Transcripts Needing Analysis
```sql
SELECT
  t.id,
  t.title,
  p.display_name as storyteller
FROM transcripts t
JOIN profiles p ON p.id = t.storyteller_id
WHERE
  (t.ai_summary IS NULL OR t.themes IS NULL OR t.key_quotes IS NULL)
  AND p.tenant_roles @> ARRAY['storyteller']::text[]
ORDER BY t.created_at DESC;
```

### Assign Storyteller to Project
```sql
INSERT INTO project_storytellers (project_id, storyteller_id)
VALUES ('project-id', 'storyteller-id')
ON CONFLICT DO NOTHING;
```

---

## Next Steps

1. **Immediate (Today):**
   - Run AI analysis on Kristy's 2 missing transcripts
   - Add cultural background for Patricia and Aunty Bev/Uncle Terry

2. **Short-term (This Week):**
   - Assign storytellers to appropriate projects
   - Add meaningful titles to "Untitled" transcripts
   - Review and update transcript statuses

3. **Medium-term (This Month):**
   - Generate project-level analysis reports
   - Create cross-storyteller theme analysis
   - Review project completion and next steps

---

*For scripts to check status, see:*
- `scripts/analyze-oonchiumpa-storytellers.js`
- `scripts/check-oonchiumpa-projects.js`
