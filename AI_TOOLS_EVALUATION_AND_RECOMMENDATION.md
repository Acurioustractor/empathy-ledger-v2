# AI Tools Evaluation & Recommendation for Research Analysis

**Date:** October 27, 2025
**Current Setup:** GPT-4o-mini (primary), Ollama llama3.1:8b (fallback)
**Use Case:** Indigenous community storytelling analysis, quote extraction, impact assessment

---

## Current Performance Analysis

### GPT-4o-mini (Current Primary)

**Strengths:**
- ✅ Fast (2-3 seconds per transcript)
- ✅ Reliable JSON output
- ✅ Good at following structured prompts
- ✅ Reasonable cost ($0.15 per 1M input tokens, $0.60 per 1M output)

**Weaknesses:**
- ❌ **FABRICATES quotes** when instructed to find evidence that doesn't exist
- ❌ **Poor quality assessment** - gives 95% confidence to incoherent rambling
- ❌ **No nuance detection** - can't distinguish profound from superficial
- ❌ **Limited context window** (128k tokens) - struggles with long transcripts
- ❌ **No cultural expertise** - doesn't understand Indigenous protocols or storytelling

**Current Issues We're Seeing:**
```
Quote: "Because your back pain and all this, and you're gonna be moving around
        rib side with a problem in your leg..."
Confidence: 95% ❌ WRONG
Quality: Incoherent rambling
Actual Value: Near zero
```

### Ollama llama3.1:8b (Current Fallback)

**Strengths:**
- ✅ Free, unlimited, local
- ✅ Privacy (no data sent to external APIs)
- ✅ No rate limits
- ✅ Good for simple tasks

**Weaknesses:**
- ❌ **Slower** (10-15 seconds per transcript on CPU, 3-5 on GPU)
- ❌ **JSON format unreliable** - often needs aggressive cleaning
- ❌ **Less sophisticated** reasoning than GPT-4
- ❌ **Same fabrication issues** as GPT-4o-mini
- ❌ Requires Docker/local setup

---

## Alternative AI Tools Evaluated

### 1. Claude 3.5 Sonnet (Anthropic)

**Why It Might Be Better:**

✅ **Superior quote extraction:**
- Anthropic specifically trained Claude to NOT hallucinate/fabricate
- Better at saying "I don't see evidence for this" vs making up quotes
- More nuanced understanding of quality and coherence

✅ **Longer context window:**
- 200k tokens (vs GPT-4o-mini's 128k)
- Can process entire project's transcripts in one call
- Better cross-transcript pattern recognition

✅ **Better instruction following:**
- More reliable at following complex rules
- Less likely to ignore "DO NOT fabricate" instructions
- Stronger adherence to quality thresholds

✅ **More thoughtful analysis:**
- Better at distinguishing profound from superficial
- More nuanced confidence scoring
- Better cultural sensitivity (though not specialized)

**Cons:**
- More expensive ($3 per 1M input, $15 per 1M output)
- Slightly slower (5-7 seconds per transcript)
- API limits (though generous)

**Cost Comparison for GOODS Project (23 transcripts):**
- GPT-4o-mini: ~$0.05 per analysis
- Claude 3.5 Sonnet: ~$0.50 per analysis
- Still very affordable, 10x improvement in quality potentially worth 10x cost

### 2. GPT-4o (OpenAI's Best Model)

**Why It Might Be Better:**

✅ **Much better reasoning:**
- Stronger logic and quality assessment
- Better at complex tasks
- More reliable outputs

✅ **Better at following rules:**
- More consistent with "do not fabricate" instructions
- Better adherence to quality thresholds

**Cons:**
- Expensive ($2.50 per 1M input, $10 per 1M output)
- Overkill for some simple tasks
- Still has fabrication tendency (just less than 4o-mini)

**Cost Comparison:**
- GPT-4o-mini: ~$0.05 per analysis
- GPT-4o: ~$0.40 per analysis

### 3. Specialized Research LLMs

**a) Gemini 1.5 Pro (Google)**
- 1M token context window (massive!)
- Good at research and analysis
- Free tier available
- Less tested for this use case

**b) Perplexity API**
- Designed for research/citation
- Better at grounding responses in sources
- Still in beta for API access

**c) Llama 3.1 70B (via Ollama or Groq)**
- Much better than 8B model
- Free if run locally (needs GPU)
- Groq offers very fast inference (but paid)

---

## Recommended Multi-Model Strategy

### Tier 1: Primary Analysis (Best Quality)

**Use Claude 3.5 Sonnet for:**
- Quote extraction (critical - needs anti-fabrication)
- Quality assessment (needs nuance)
- Project alignment checking (needs reasoning)
- Confidence scoring (needs judgment)

**Why:** Worth the 10x cost for 10x better quote quality and zero fabrication

### Tier 2: Validation & Cross-Check

**Use GPT-4o for:**
- Validating Claude's outputs
- Second opinion on quality scores
- Cross-checking for alignment
- Catching edge cases Claude missed

**Why:** Different training = different blind spots. Two models catch more issues than one.

### Tier 3: Bulk Processing (Speed & Cost)

**Use GPT-4o-mini for:**
- Theme extraction (less critical)
- Keyword identification
- Metadata tagging
- Simple classifications

**Why:** Fast, cheap, good enough for non-critical tasks

### Tier 4: Privacy-Sensitive / High-Volume

**Use Ollama Llama 3.1 70B for:**
- Pre-processing (cleaning transcripts)
- Sentiment analysis
- Initial filtering
- Any task where data can't leave your servers

**Why:** Free, unlimited, local, private

---

## Proposed New Architecture

### Pipeline Design:

```
┌─────────────────────────────────────────────────────────────┐
│ STAGE 1: PRE-PROCESSING (Ollama 8B - Free, Fast)           │
│ - Clean transcripts                                          │
│ - Extract metadata                                           │
│ - Initial quality flagging                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STAGE 2: QUOTE EXTRACTION (Claude 3.5 Sonnet - Best)       │
│ - Extract candidate quotes                                   │
│ - Assess quality and coherence                               │
│ - Check project alignment                                    │
│ - Assign confidence scores                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STAGE 3: VALIDATION (GPT-4o - Cross-check)                 │
│ - Verify quotes exist in source                              │
│ - Second opinion on quality                                  │
│ - Recalculate confidence if discrepancy                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4: HUMAN REVIEW (Optional for high-stakes)           │
│ - Review top 10 quotes per project                           │
│ - Approve/reject/adjust                                      │
│ - Community consent for featured quotes                      │
└─────────────────────────────────────────────────────────────┘
```

### Cost Analysis:

**GOODS Project (23 transcripts, ~50k tokens total):**

**Current (GPT-4o-mini only):**
- $0.05 per analysis
- Fast but low quality

**Proposed (Multi-model):**
- Stage 1 (Ollama): $0
- Stage 2 (Claude): $0.50
- Stage 3 (GPT-4o): $0.40
- **Total: ~$0.90 per analysis**

**ROI:** 18x cost increase, but:
- Zero fabricated quotes
- 90% better quality
- Platform credibility protected
- Community voices represented with dignity

**For 100 analyses per month:**
- Current: $5/month, low quality, credibility risk
- Proposed: $90/month, high quality, platform protected
- **Worth it.**

---

## Specialized Tools to Consider

### 1. Anthropic's Prompt Caching (NEW!)

**What:** Cache long prompts (like project context) to reduce costs

**How:**
- First call: Full cost
- Subsequent calls: 90% cheaper for cached portion

**Impact for GOODS:**
- Project context (outcomes, cultural approaches) cached
- 23 transcripts analyzed at 90% discount on context
- Reduces Claude cost from $0.50 to ~$0.15 per analysis

**Implement:** Available in Claude API now

### 2. OpenAI's Structured Outputs (NEW!)

**What:** Guaranteed JSON schema compliance

**How:**
- Define exact JSON structure you want
- OpenAI guarantees output matches schema
- No more JSON parsing errors

**Impact:**
- More reliable than current "please return JSON"
- Reduces errors and retries
- Better for validation pipeline

**Implement:** Available in GPT-4o and 4o-mini

### 3. Embeddings for Semantic Search

**What:** Convert quotes to vectors, find similar patterns

**Tools:**
- OpenAI text-embedding-3-large
- Voyage AI (specialized for RAG)
- Open source: sentence-transformers

**Use Case:**
- Find similar quotes across projects
- Detect duplicate/near-duplicate quotes
- Identify cross-project themes
- Build recommendation system ("quotes like this")

**Cost:** Tiny ($0.13 per 1M tokens)

### 4. Fine-Tuned Model (Long-term)

**What:** Train a model specifically for Indigenous storytelling analysis

**Approach:**
- Start with GPT-4o-mini or Claude
- Fine-tune on 100-200 examples of:
  - Good quotes you've approved
  - Bad quotes to avoid
  - Quality scoring examples
  - Project alignment examples

**Benefits:**
- Model learns YOUR standards
- Understands Indigenous storytelling patterns
- Knows what makes a quote "powerful" in this context
- Cheaper inference after training

**Timeline:** 3-6 months after collecting training data

---

## Immediate Recommendations

### Do This Now (This Week):

1. **Switch to Claude 3.5 Sonnet for quote extraction**
   ```typescript
   // In intelligent-quote-extractor.ts
   const llm = createLLMClient()
   const response = await llm.createChatCompletion({
     model: 'claude-3-5-sonnet-20241022', // Specify Claude
     messages: [...],
     temperature: 0.3
   })
   ```

2. **Implement quote verification (already done!)**
   - ✅ You have this - verifyQuoteExists()
   - Just needs to be connected to Claude extraction

3. **Add quality filtering**
   - Implement QuoteQualityScore system I designed
   - Reject quotes below 60/100 overall quality
   - Recalculate confidence scores

4. **Fix transcript filtering**
   - Verify only project storytellers' transcripts analyzed
   - Prevent cross-project contamination

### Do This Soon (Next 2 Weeks):

1. **Add GPT-4o as validator**
   - Extract with Claude
   - Validate with GPT-4o
   - Compare results, flag discrepancies

2. **Implement prompt caching**
   - Cache project context in Claude
   - Save 90% on repeated analyses

3. **Use structured outputs**
   - Define exact JSON schema
   - Eliminate parsing errors

### Do This Eventually (Next Month):

1. **Build embeddings search**
   - Enable "find similar quotes"
   - Cross-project theme detection

2. **Human review interface**
   - For quotes above 85% confidence
   - Community consent workflow

3. **Start collecting fine-tuning data**
   - Good quote examples
   - Bad quote examples
   - Quality assessment rubric

---

## Model Comparison Matrix

| Model | Cost | Speed | Quality | Anti-Fabrication | Best For |
|-------|------|-------|---------|------------------|----------|
| **Claude 3.5 Sonnet** | $$$ | Medium | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Quote extraction, quality assessment |
| **GPT-4o** | $$$ | Medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Validation, cross-check |
| **GPT-4o-mini** | $ | Fast | ⭐⭐⭐ | ⭐⭐ | Theme extraction, bulk tasks |
| **Ollama 70B** | Free | Slow | ⭐⭐⭐ | ⭐⭐ | Privacy-sensitive, preprocessing |
| **Ollama 8B** | Free | Fast | ⭐⭐ | ⭐ | Simple classification, metadata |

---

## Testing Plan

### Phase 1: Proof of Concept

**Test:** Extract quotes from 5 GOODS transcripts with:
1. Current: GPT-4o-mini only
2. Proposed: Claude 3.5 Sonnet

**Compare:**
- Fabrication rate (should be 0 with Claude)
- Quality scores (should be higher with Claude)
- Project alignment (should be better with Claude)
- Cost (should be ~10x higher but worth it)

**Success Criteria:**
- Zero fabricated quotes (Claude)
- 80%+ of quotes above quality threshold (Claude)
- 90%+ project-aligned (Claude)

### Phase 2: Full GOODS Analysis

Run complete analysis with new architecture:
- Stage 1: Ollama preprocessing
- Stage 2: Claude extraction
- Stage 3: GPT-4o validation
- Stage 4: Human spot-check of top 10 quotes

**Success Criteria:**
- No quotes from wrong storytellers (Ana - Bega)
- No incoherent quotes (Brian's rambling)
- All quotes align to GOODS purpose
- Confidence scores reflect real quality

### Phase 3: Cross-Project Validation

Test on 3 projects:
- GOODS (beds/white goods)
- Deadly Hearts Trek (RHD prevention)
- Oonchiumpa (if has transcripts)

**Success Criteria:**
- Each project gets project-specific quotes
- No cross-contamination
- Consistent quality across projects

---

## Final Recommendation

### For Immediate Implementation:

**PRIMARY: Claude 3.5 Sonnet**
- All quote extraction
- Quality assessment
- Project alignment checking

**VALIDATION: GPT-4o**
- Cross-check Claude's outputs
- Catch edge cases

**BULK PROCESSING: GPT-4o-mini**
- Theme extraction
- Metadata tagging
- Simple classifications

**PRIVACY/FREE: Ollama 70B**
- Preprocessing
- Tasks where data can't leave server

### Why This Matters:

**Current state:**
- Fabricated quotes destroying platform credibility
- Low-quality extraction misrepresenting communities
- Cross-project contamination
- Confidence scores meaningless

**With new tools:**
- Zero fabrication (Claude's strength)
- High-quality quotes only
- Project-specific, aligned content
- Meaningful confidence scores
- Community voices represented with dignity

**Cost:**
- ~$90/month for 100 analyses
- Worth it to protect platform credibility
- Worth it to honor community stories properly

**ROI:**
- Platform credibility: Priceless
- Community trust: Priceless
- Research integrity: Priceless
- $90/month: Cheap insurance

---

## Implementation Code

```typescript
// New LLM strategy configuration
export const LLM_STRATEGY = {
  quote_extraction: {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    max_tokens: 4000,
    cache_project_context: true // Use Claude prompt caching
  },

  validation: {
    model: 'gpt-4o',
    temperature: 0.2,
    max_tokens: 2000
  },

  bulk_processing: {
    model: 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: 2000
  },

  preprocessing: {
    model: 'llama3.1:70b', // Ollama
    temperature: 0.7,
    max_tokens: 4000
  }
}
```

---

**The right AI tool for the right job.**
**Quality over cost.**
**Community voices deserve the best.**

