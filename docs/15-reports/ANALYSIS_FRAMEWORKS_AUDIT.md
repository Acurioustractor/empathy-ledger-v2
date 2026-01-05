# Analysis Frameworks Audit - Executive Summary

**Date:** January 4, 2026
**Purpose:** Pre-Sprint 3 comprehensive analysis framework review

---

## 🎯 Key Findings

### What We Have (28 AI/Analysis Files)

**Transcript Analysis:** 3 versions (v1, v2, v3)
- ✅ **WINNER: v3-claude** (90-95% accuracy, quote verification)
- ⚠️ **DEPRECATE:** v1 (keyword-based), v2 (superseded)

**Quote Extraction:** 3 systems
- ✅ **PRIMARY: claude-quote-extractor-v2** (project-aligned, quality filtering)
- ✅ **FALLBACK: intelligent-quote-extractor** (Ollama/free tier)
- ⚠️ **DEPRECATE:** claude-quote-extractor v1

**Impact Analysis:** 3 versions
- ✅ **USE: intelligent-indigenous-impact-analyzer** (depth-based scoring)
- ⚠️ **DEPRECATE:** pattern-based versions

**Critical Infrastructure:**
- ✅ **thematic-taxonomy.ts** - 38 standardized OCAP-aligned themes
- ✅ **cultural-safety-middleware.ts** - OCAP enforcement
- ✅ **llm-client.ts** - Provider abstraction (Ollama → OpenAI fallback)

---

## 📊 Recommended Stack for Sprint 3

| Purpose | File | Provider | Cost/Quality |
|---------|------|----------|--------------|
| **Transcript Analysis** | transcript-analyzer-v3-claude.ts | Claude Sonnet 4.5 | $0.03 / 90-95% |
| **Quote Extraction** | claude-quote-extractor-v2.ts | Claude Opus | $0.04 / 85-90% |
| **Theme Taxonomy** | thematic-taxonomy.ts | N/A | FREE / Perfect |
| **Impact Assessment** | intelligent-indigenous-impact-analyzer.ts | Ollama/OpenAI | $0-0.02 / 80-85% |
| **Cultural Safety** | cultural-safety-middleware.ts | N/A | Wrapper |

**Full Pipeline Cost:** ~$0.09 per transcript (or FREE with Ollama)
**Processing Time:** ~15-20 seconds

---

## 🚨 Critical Issues

### Duplications to Remove
1. transcript-analyzer.ts (v1) 
2. transcript-analyzer-v2.ts
3. indigenous-impact-analyzer.ts (pattern-based)
4. outcome-matcher.ts (keyword-based)
5. claude-quote-extractor.ts (v1)
6. claude-impact-analyzer.ts (duplicate)

### API Endpoints to Upgrade
- `/api/ai/analyze-indigenous-impact` - Currently uses OLD pattern-based analyzer

### Missing Database Support
- No `transcript_analysis_results` table to store versioned analysis
- No tracking of analyzer version used
- No quality metrics storage

---

## 🎯 Sprint 3 Actions

### Week 1: Consolidation
1. ✅ Standardize on v3 analyzer across all imports
2. ✅ Create transcript_analysis_results table
3. ✅ Upgrade impact analysis API endpoint
4. ✅ Add version tracking to database

### Week 2: Build UI
1. ✅ TranscriptAnalysisView component
2. ✅ Integrate with existing tabs
3. ✅ Display themes, quotes, impact, cultural flags

### Week 3: Testing
1. ✅ Validate v3 analyzer with real data
2. ✅ Document recommended patterns
3. ✅ Remove deprecated analyzers

---

## 📁 Key Files to Review

**Primary Analyzers:**
- [transcript-analyzer-v3-claude.ts](src/lib/ai/transcript-analyzer-v3-claude.ts)
- [thematic-taxonomy.ts](src/lib/ai/thematic-taxonomy.ts)
- [claude-quote-extractor-v2.ts](src/lib/ai/claude-quote-extractor-v2.ts)
- [intelligent-indigenous-impact-analyzer.ts](src/lib/ai/intelligent-indigenous-impact-analyzer.ts)

**Infrastructure:**
- [cultural-safety-middleware.ts](src/lib/ai/cultural-safety-middleware.ts)
- [llm-client.ts](src/lib/ai/llm-client.ts)

**Existing Components:**
- [TranscriptCreationDialog.tsx](src/components/transcripts/TranscriptCreationDialog.tsx)
- [ProjectAnalysisView.tsx](src/components/projects/ProjectAnalysisView.tsx)

**API Endpoints:**
- [/api/ai/analyze-transcript](src/app/api/ai/analyze-transcript/route.ts)
- [/api/transcripts/[id]/analyze](src/app/api/transcripts/[id]/analyze/route.ts)

---

## 💡 Recommendations

### Do This
✅ Use v3 Claude analyzer for all new transcript analysis
✅ Store analysis results in database with version tracking
✅ Build TranscriptAnalysisView to display results
✅ Leverage existing thematic taxonomy (38 themes)
✅ Use cultural-safety-middleware for all AI calls

### Don't Do This
❌ Don't use v1 or v2 analyzers (deprecated)
❌ Don't use pattern-based impact analyzer (inaccurate)
❌ Don't duplicate theme extraction (use thematic-taxonomy.ts)
❌ Don't skip cultural safety middleware
❌ Don't create new analyzers without checking existing ones

---

**Full Audit Report:** See agent output above for complete details

**Status:** Ready for Sprint 3 implementation planning
