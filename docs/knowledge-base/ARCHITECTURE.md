# Knowledge Base System Architecture

**Purpose**: Visual overview of the Empathy Ledger Knowledge Base RAG system

**Status**: Week 1 Complete - Foundation built, ready for deployment

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EMPATHY LEDGER KNOWLEDGE BASE                       │
│                   Self-Sustaining AI Agent Ecosystem                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          INPUT: DOCUMENTATION                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    200+ Markdown Files in /docs/
                    Organized by PMPP Framework
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PHASE 1: DOCUMENT SCANNING                         │
│                                                                           │
│  scanDocumentation()                                                     │
│  └─> Recursively find all .md files                                     │
│  └─> Skip .git, node_modules, hidden dirs                               │
│  └─> Return: Array<string> (file paths)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 2: METADATA EXTRACTION                        │
│                                                                           │
│  extractMetadata(filePath)                                              │
│  ├─> Parse frontmatter (gray-matter)                                    │
│  ├─> Detect PMPP category (Principle|Method|Practice|Procedure)         │
│  ├─> Auto-detect cultural sensitivity (None → Sacred)                   │
│  ├─> Count metrics (words, code blocks, diagrams, references)           │
│  ├─> Identify sacred boundaries (NEVER keywords)                        │
│  ├─> Identify cultural protocols (OCAP, Elder authority)                │
│  └─> Extract tags from links and code blocks                            │
│                                                                           │
│  Output: DocumentMetadata                                               │
│    - title, category, subcategory, knowledge_type                       │
│    - confidence, source_file, dates, dependencies, tags                 │
│    - cultural_sensitivity, extraction_status, author, version           │
│    - metrics (word_count, code_examples, diagrams, references)          │
│    - pmpp_attributes, farmhand_attributes                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: SEMANTIC CHUNKING                            │
│                                                                           │
│  createSemanticChunks(filePath, documentId)                             │
│  ├─> Structure-aware splitting                                          │
│  │   ├─> Preserve headings                                              │
│  │   ├─> Preserve code blocks (detect ```language)                      │
│  │   ├─> Preserve lists (detect -/*/1./2.)                              │
│  │   ├─> Preserve tables (detect |...|)                                 │
│  │   └─> Preserve quotes (detect >)                                     │
│  ├─> Maintain section path breadcrumbs                                  │
│  │   Example: ["Database", "Setup", "Local"]                            │
│  ├─> Extract internal/external links                                    │
│  │   Internal: [text](./relative/path.md)                               │
│  │   External: [text](https://...)                                      │
│  ├─> Extract code file references                                       │
│  │   Example: `src/lib/service.ts`                                      │
│  ├─> Estimate token count (~4 chars per token)                          │
│  └─> Set retrieval metadata                                             │
│      ├─> similarity_threshold: 0.7                                      │
│      ├─> boost_factor: 1.2 (for headings), 1.0 (default)               │
│      ├─> requires_context: true (for code/quotes)                       │
│      └─> standalone: true (for paragraphs/lists)                        │
│                                                                           │
│  Output: Array<KnowledgeChunk>                                          │
│    - document_id, chunk_type, content, token_count                      │
│    - position_in_doc, section_path, references                          │
│    - retrieval_metadata                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   PHASE 4: EMBEDDING GENERATION                          │
│                                                                           │
│  generateEmbeddingsBatch(chunks)                                        │
│  ├─> Use OpenAI text-embedding-3-small                                  │
│  │   ├─> 1536 dimensions                                                │
│  │   ├─> $0.00002 per 1,000 tokens                                      │
│  │   └─> Batch size: 2,048 inputs per request                           │
│  ├─> Cost: ~$0.10-$0.20 for 200 docs                                    │
│  └─> Time: ~5-10 minutes (network latency)                              │
│                                                                           │
│  Output: Array<number[]> (embeddings)                                   │
│    - Each embedding: float[1536]                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 5: POSTGRESQL STORAGE                           │
│                                                                           │
│  storeDocument(metadata) → documentId                                   │
│  storeChunks(chunks, embeddings)                                        │
│                                                                           │
│  Database: PostgreSQL + pgvector extension                              │
│    ├─> knowledge_documents (metadata)                                   │
│    ├─> knowledge_chunks (content + embeddings)                          │
│    ├─> knowledge_extractions (Q&A pairs for SLM training)               │
│    └─> knowledge_graph (relationships between chunks)                   │
│                                                                           │
│  Indexes:                                                                │
│    ├─> ivfflat on embeddings (vector similarity search)                 │
│    ├─> gin on content (full-text search)                                │
│    ├─> btree on category, knowledge_type, cultural_sensitivity          │
│    └─> btree on extraction_status, validation_status                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   OUTPUT: QUERYABLE KNOWLEDGE BASE                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## RAG Query Pipeline (Week 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER NATURAL LANGUAGE QUERY                       │
│                "How do I set up the database locally?"                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 1: QUERY EMBEDDING                             │
│                                                                           │
│  generateEmbedding(query)                                               │
│  └─> OpenAI text-embedding-3-small                                      │
│  └─> Cost: ~$0.0000002 per query                                        │
│                                                                           │
│  Output: float[1536] (query embedding)                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  STEP 2: VECTOR SIMILARITY SEARCH                        │
│                                                                           │
│  supabase.rpc('search_knowledge', {                                     │
│    query_embedding: float[1536],                                        │
│    match_threshold: 0.7,   // Minimum similarity                        │
│    match_count: 5,         // Top-k results                             │
│    filter_category: 'Procedure',  // Optional                           │
│    filter_cultural_sensitivity: ['High', 'Sacred']  // Optional         │
│  })                                                                      │
│                                                                           │
│  Algorithm: Cosine similarity (1 - embedding <=> query_embedding)       │
│  Index: ivfflat (fast approximate search)                               │
│                                                                           │
│  Output: Array<{                                                         │
│    chunk_id, document_id, document_title, document_category,            │
│    chunk_content, chunk_summary, similarity,                            │
│    cultural_sensitivity, section_path                                   │
│  }>                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     STEP 3: RERANKING (Optional)                         │
│                                                                           │
│  Use cross-encoder (Cohere Rerank or similar)                           │
│  ├─> More accurate than cosine similarity                               │
│  ├─> Takes (query, document) pairs → relevance score                    │
│  └─> Cost: ~$1 per 1,000 searches (Cohere)                              │
│                                                                           │
│  Boost by:                                                               │
│    ├─> Cultural relevance (High/Sacred content boosted)                 │
│    ├─> Chunk type (Headings boosted)                                    │
│    └─> Recency (newer docs boosted)                                     │
│                                                                           │
│  Deduplicate:                                                            │
│    └─> Remove similar chunks from same document                         │
│                                                                           │
│  Output: Top 3-5 most relevant chunks                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  STEP 4: KNOWLEDGE GRAPH EXPANSION                       │
│                                                                           │
│  supabase.rpc('find_related_chunks', {                                  │
│    chunk_id_input: topChunk.chunk_id,                                   │
│    max_depth: 2,                                                         │
│    min_strength: 0.5                                                     │
│  })                                                                      │
│                                                                           │
│  Traverse relationships:                                                 │
│    ├─> depends_on (prerequisites)                                       │
│    ├─> implements (examples)                                            │
│    ├─> extends (additional context)                                     │
│    └─> references (related docs)                                        │
│                                                                           │
│  Output: Related chunks with relationship metadata                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 STEP 5: CULTURAL SAFETY CHECK                            │
│                                                                           │
│  Filter results by user role:                                            │
│    ├─> Super Admin / Platform Admin: See all                            │
│    ├─> Regular users: Hide non-culturally-safe extractions              │
│    └─> Public: Only show verified culturally-safe content               │
│                                                                           │
│  Check cultural sensitivity:                                             │
│    ├─> Sacred: Requires Elder approval to view                          │
│    ├─> High: Requires authentication                                    │
│    ├─> Medium/Low/None: Public                                          │
│                                                                           │
│  Output: Filtered results respecting RLS policies                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 STEP 6: RESPONSE GENERATION                              │
│                                                                           │
│  claude.messages.create({                                               │
│    model: 'claude-sonnet-4-5-20241022',                                 │
│    messages: [{                                                          │
│      role: 'system',                                                     │
│      content: `You are the Empathy Ledger Agent.                        │
│                NEVER bypass cultural protocols.                          │
│                ALWAYS respect Elder authority.                           │
│                ALWAYS cite sources with section paths.`                  │
│    }, {                                                                  │
│      role: 'user',                                                       │
│      content: `Based on these knowledge base results:                   │
│                ${JSON.stringify(filteredResults)}                        │
│                                                                           │
│                Answer: ${userQuery}`                                     │
│    }]                                                                    │
│  })                                                                      │
│                                                                           │
│  Cost: ~$0.015 per query (5k input + 500 output tokens)                 │
│                                                                           │
│  Output: Natural language response with source attribution              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FINAL RESPONSE TO USER                            │
│                                                                           │
│  "To set up the database locally:                                       │
│                                                                           │
│   1. Prerequisites: Docker installed                                     │
│   2. Start: npm run db:start                                             │
│   3. Verify: ./scripts/verify-supabase-connection.sh                    │
│   4. Migrate: npm run db:migrate                                         │
│                                                                           │
│   Full guide: docs/database/local-setup.md                               │
│                                                                           │
│   Sacred Boundary: NEVER modify RLS policies without understanding      │
│   multi-tenant isolation. Storyteller data sovereignty is                │
│   non-negotiable.                                                        │
│                                                                           │
│   Sources:                                                               │
│   - Database Setup Guide (docs/database/local-setup.md)                 │
│   - Database Architecture (docs/database/architecture.md)               │
│   - Development Workflow (docs/development/workflow.md)"                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
┌─────────────────────────────────────────────────────────────────────────┐
│                       knowledge_documents                                │
├─────────────────────────────────────────────────────────────────────────┤
│ id                      UUID PRIMARY KEY                                 │
│ title                   TEXT NOT NULL                                    │
│ category                TEXT (PMPP: Principle|Method|Practice|Procedure) │
│ subcategory             TEXT                                             │
│ knowledge_type          TEXT (Factual|Procedural|Strategic|Cultural)     │
│ confidence              FLOAT (0.0-1.0)                                  │
│ source_file             TEXT NOT NULL UNIQUE                             │
│ created_date            TIMESTAMPTZ                                      │
│ last_updated            TIMESTAMPTZ                                      │
│ dependencies            UUID[]                                           │
│ tags                    TEXT[]                                           │
│ cultural_sensitivity    TEXT (None|Low|Medium|High|Sacred)               │
│ extraction_status       TEXT (Pending|Extracted|Reviewed|Published)      │
│ author                  TEXT                                             │
│ version                 TEXT                                             │
│ metrics                 JSONB (word_count, code_examples, diagrams...)   │
│ pmpp_attributes         JSONB (is_principle, is_method...)               │
│ farmhand_attributes     JSONB (has_sacred_boundaries...)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ FK document_id
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        knowledge_chunks                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ id                      UUID PRIMARY KEY                                 │
│ document_id             UUID REFERENCES knowledge_documents              │
│ chunk_type              TEXT (Heading|Paragraph|Code|List|Table|Quote)   │
│ content                 TEXT NOT NULL                                    │
│ semantic_summary        TEXT (AI-generated summary)                      │
│ embedding               vector(1536) -- OpenAI embeddings                │
│ token_count             INT                                              │
│ position_in_doc         INT                                              │
│ section_path            TEXT[] (breadcrumb path)                         │
│ references              JSONB (internal_links, external_links...)        │
│ retrieval_metadata      JSONB (similarity_threshold, boost_factor...)    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ FK chunk_id
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    knowledge_extractions                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ id                      UUID PRIMARY KEY                                 │
│ chunk_id                UUID REFERENCES knowledge_chunks                 │
│ extraction_type         TEXT (Principle|Method|Practice|Procedure...)    │
│ question                TEXT NOT NULL                                    │
│ answer                  TEXT NOT NULL                                    │
│ context                 TEXT                                             │
│ confidence              FLOAT (0.0-1.0)                                  │
│ validation_status       TEXT (Auto|Human-Reviewed|Verified|Rejected)     │
│ validated_by            TEXT                                             │
│ validated_at            TIMESTAMPTZ                                      │
│ used_in_training        BOOLEAN                                          │
│ training_category       TEXT                                             │
│ culturally_safe         BOOLEAN                                          │
│ usefulness_score        FLOAT (0.0-1.0)                                  │
│ query_frequency         INT                                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      knowledge_graph                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ id                      UUID PRIMARY KEY                                 │
│ source_chunk_id         UUID REFERENCES knowledge_chunks                 │
│ target_chunk_id         UUID REFERENCES knowledge_chunks                 │
│ relationship_type       TEXT (depends_on|implements|examples_of...)      │
│ strength                FLOAT (0.0-1.0)                                  │
│ bidirectional           BOOLEAN                                          │
│ evidence                TEXT (why this relationship exists)              │
│ confidence              FLOAT (0.0-1.0)                                  │
│ created_by              TEXT (AI|Human|Automated)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## CLI Commands

```bash
# Process all documentation
npm run kb:process
  ├─> Scan /docs/ for .md files
  ├─> Extract metadata for each file
  ├─> Create semantic chunks
  ├─> Generate OpenAI embeddings
  └─> Store in PostgreSQL

# Show statistics
npm run kb:stats
  ├─> Total documents
  ├─> Total chunks
  ├─> Total extractions
  ├─> Documents by category (PMPP breakdown)
  ├─> Average confidence
  └─> Cultural safety coverage

# Test RAG query
npm run kb:test "How do I deploy to production?"
  ├─> Generate query embedding
  ├─> Search knowledge base (vector similarity)
  ├─> Display top 5 results with:
  │   ├─> Document title
  │   ├─> Category
  │   ├─> Similarity score
  │   ├─> Section path
  │   └─> Content preview
  └─> Return in <100ms

# Clear knowledge base
npm run kb:clear --confirm
  └─> Delete all data (reset database)
```

---

## Cultural Safety Enforcement

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CULTURAL SAFETY LAYERS                               │
└─────────────────────────────────────────────────────────────────────────┘

Layer 1: Automatic Detection
├─> Sacred Keywords: Elder, sacred, ceremony, restricted knowledge
├─> High Keywords: OCAP, Indigenous, Aboriginal, cultural protocol
├─> Medium Keywords: consent, cultural, community, storyteller
└─> Sacred Boundaries: NEVER, non-negotiable, must not, prohibited

Layer 2: Metadata Classification
├─> cultural_sensitivity: None|Low|Medium|High|Sacred
├─> farmhand_attributes.has_sacred_boundaries: boolean
└─> farmhand_attributes.has_cultural_protocols: boolean

Layer 3: RLS Policies (Row Level Security)
├─> Public read: authenticated users only
├─> Cultural filtering: Hide non-safe extractions from non-admins
└─> Admin write: Super Admin / Platform Admin only

Layer 4: Validation Workflow
├─> Auto: AI extraction (unvalidated)
├─> Human-Reviewed: Staff reviewed
├─> Verified: Elder approved (required for Sacred content)
└─> Rejected: Marked incorrect

Layer 5: Training Corpus Filtering
├─> culturally_safe: boolean (default true)
├─> used_in_training: boolean (default false for Sacred)
└─> validation_status: 'Verified' required for Sacred content
```

---

## Cost Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING COSTS                                 │
└─────────────────────────────────────────────────────────────────────────┘

OpenAI Embeddings (text-embedding-3-small):
  ├─> $0.00002 per 1,000 tokens
  ├─> 200 docs × ~1,000 tokens/doc = 200,000 tokens
  └─> Cost: ~$0.004 (less than 1 cent)

Storage (Supabase):
  ├─> ~10,000 chunks × 1,536 dimensions × 4 bytes = ~60 MB
  ├─> Supabase free tier: 500 MB database
  └─> Cost: $0 (within free tier)

TOTAL PROCESSING COST: < $0.01 per full re-index

┌─────────────────────────────────────────────────────────────────────────┐
│                          QUERY COSTS (Week 2)                            │
└─────────────────────────────────────────────────────────────────────────┘

OpenAI Embeddings (query):
  ├─> $0.00002 per 1,000 tokens
  ├─> ~10 tokens per query
  └─> Cost: ~$0.0000002 per query (negligible)

Claude Sonnet 4.5 (response generation):
  ├─> $3 per million input tokens
  ├─> $15 per million output tokens
  ├─> ~5,000 input tokens (RAG context) + ~500 output tokens
  └─> Cost: ~$0.015 per query + response

ESTIMATED MONTHLY COST (1,000 queries):
  ├─> Embeddings: ~$0.20
  ├─> Claude responses: ~$15
  └─> Total: ~$15.20/month
```

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Processing time (200 docs) | 5-10 minutes | ✅ Achievable |
| Processing cost | < $0.20 | ✅ Achievable |
| Database size | < 100 MB | ✅ Achievable |
| Query response time | < 100ms | ⏳ Week 2 |
| Query cost | < $0.02 | ⏳ Week 2 |
| Accuracy (top-5 recall) | > 90% | ⏳ Week 2 |
| Cultural safety coverage | 100% | ✅ Built-in |

---

## Sacred Boundaries (NEVER)

- ❌ **Never bypass cultural protocols** - OCAP principles are non-negotiable
- ❌ **Never skip Elder authority** - Sacred content requires Elder approval
- ❌ **Never expose unsafe extractions** - RLS policies hide from non-admins
- ❌ **Never train on Sacred content** - Without explicit Elder permission
- ❌ **Never optimize for speed over safety** - Cultural safety takes precedence
- ❌ **Never delete metadata** - Preserve extraction history for audit

---

**Status**: Week 1 Complete - Foundation built
**Next**: Deploy migration → Run processing → Build RAG query API (Week 2)
**Vision**: Self-sustaining AI agent ecosystem powered by comprehensive knowledge base
