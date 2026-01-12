-- Knowledge Base for RAG System + SLM Training
-- Based on docs/knowledge-base/schema/document-metadata.yaml

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- KNOWLEDGE DOCUMENTS TABLE
-- =============================================================================
-- Stores metadata for each documentation file

CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic metadata
  title TEXT NOT NULL,
  category TEXT NOT NULL,  -- PMPP: Principle | Method | Practice | Procedure
  subcategory TEXT,
  knowledge_type TEXT NOT NULL,  -- Factual | Procedural | Strategic | Cultural

  -- Quality and confidence
  confidence FLOAT DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),

  -- Source tracking
  source_file TEXT NOT NULL UNIQUE,
  created_date TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  dependencies UUID[],  -- Array of related document IDs
  tags TEXT[],

  -- Cultural sensitivity
  cultural_sensitivity TEXT DEFAULT 'None',  -- None | Low | Medium | High | Sacred

  -- Workflow status
  extraction_status TEXT DEFAULT 'Pending',  -- Pending | Extracted | Reviewed | Published | Archived

  -- Optional metadata
  author TEXT,
  version TEXT,

  -- Metrics (JSONB for flexibility)
  metrics JSONB DEFAULT '{}'::jsonb,
  -- Example: {"word_count": 1200, "code_examples": 5, "diagrams": 2}

  -- PMPP attributes
  pmpp_attributes JSONB DEFAULT '{}'::jsonb,
  -- Example: {"is_principle": true, "is_method": false, "is_practice": false, "is_procedure": false}

  -- Empathy Ledger specific
  farmhand_attributes JSONB DEFAULT '{}'::jsonb,
  -- Example: {"has_sacred_boundaries": true, "has_cultural_protocols": true, "has_examples": true}

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_knowledge_documents_category ON knowledge_documents(category);
CREATE INDEX idx_knowledge_documents_knowledge_type ON knowledge_documents(knowledge_type);
CREATE INDEX idx_knowledge_documents_cultural_sensitivity ON knowledge_documents(cultural_sensitivity);
CREATE INDEX idx_knowledge_documents_extraction_status ON knowledge_documents(extraction_status);
CREATE INDEX idx_knowledge_documents_tags ON knowledge_documents USING gin(tags);

-- Full-text search on title
CREATE INDEX idx_knowledge_documents_title_fts ON knowledge_documents
  USING gin(to_tsvector('english', title));

-- =============================================================================
-- KNOWLEDGE CHUNKS TABLE
-- =============================================================================
-- Stores semantic chunks of documents with embeddings

CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,

  -- Chunk content
  chunk_type TEXT NOT NULL,  -- Heading | Paragraph | Code | List | Table | Quote | Diagram
  content TEXT NOT NULL,
  semantic_summary TEXT,  -- AI-generated summary (50-100 words)

  -- Vector embedding (OpenAI text-embedding-3-small)
  embedding vector(1536),

  -- Position and context
  token_count INT,
  position_in_doc INT,
  section_path TEXT[],  -- Breadcrumb path e.g., ["Database", "Setup", "Local"]

  -- References and relationships (JSONB)
  chunk_references JSONB DEFAULT '{}'::jsonb,
  -- Example: {"internal_links": ["uuid1", "uuid2"], "external_links": ["https://..."], "code_references": ["src/lib/..."]}

  -- Retrieval metadata
  retrieval_metadata JSONB DEFAULT '{
    "similarity_threshold": 0.7,
    "boost_factor": 1.0,
    "requires_context": false,
    "standalone": true
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_knowledge_chunks_document ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_chunks_type ON knowledge_chunks(chunk_type);
CREATE INDEX idx_knowledge_chunks_position ON knowledge_chunks(position_in_doc);

-- Vector similarity index (ivfflat for fast approximate search)
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search on content
CREATE INDEX idx_knowledge_chunks_content_fts ON knowledge_chunks
  USING gin(to_tsvector('english', content));

-- =============================================================================
-- KNOWLEDGE EXTRACTIONS TABLE
-- =============================================================================
-- Stores Q&A pairs extracted from chunks for SLM training

CREATE TABLE knowledge_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id UUID REFERENCES knowledge_chunks(id) ON DELETE CASCADE,

  -- Extraction type
  extraction_type TEXT NOT NULL,  -- Principle | Method | Practice | Procedure | Fact | Process | Warning

  -- Q&A format for training
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context TEXT,  -- Optional surrounding context

  -- Quality and validation
  confidence FLOAT DEFAULT 0.7 CHECK (confidence >= 0 AND confidence <= 1),
  validation_status TEXT DEFAULT 'Auto',  -- Auto | Human-Reviewed | Verified | Rejected
  validated_by TEXT,
  validated_at TIMESTAMPTZ,

  -- Training data flags
  used_in_training BOOLEAN DEFAULT FALSE,
  training_category TEXT,
  culturally_safe BOOLEAN DEFAULT TRUE,

  -- Value metrics
  usefulness_score FLOAT CHECK (usefulness_score >= 0 AND usefulness_score <= 1),
  query_frequency INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_knowledge_extractions_chunk ON knowledge_extractions(chunk_id);
CREATE INDEX idx_knowledge_extractions_type ON knowledge_extractions(extraction_type);
CREATE INDEX idx_knowledge_extractions_validation ON knowledge_extractions(validation_status);
CREATE INDEX idx_knowledge_extractions_training ON knowledge_extractions(used_in_training);
CREATE INDEX idx_knowledge_extractions_cultural ON knowledge_extractions(culturally_safe);

-- Full-text search on questions
CREATE INDEX idx_knowledge_extractions_question_fts ON knowledge_extractions
  USING gin(to_tsvector('english', question));

-- =============================================================================
-- KNOWLEDGE GRAPH TABLE
-- =============================================================================
-- Stores relationships between knowledge chunks

CREATE TABLE knowledge_graph (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationship endpoints
  source_chunk_id UUID REFERENCES knowledge_chunks(id) ON DELETE CASCADE,
  target_chunk_id UUID REFERENCES knowledge_chunks(id) ON DELETE CASCADE,

  -- Relationship type
  relationship_type TEXT NOT NULL,  -- depends_on | implements | examples_of | contradicts | extends | related_to | replaces | references

  -- Relationship metadata
  strength FLOAT DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  bidirectional BOOLEAN DEFAULT FALSE,
  evidence TEXT,  -- Why this relationship exists
  confidence FLOAT DEFAULT 0.7 CHECK (confidence >= 0 AND confidence <= 1),

  -- Creation tracking
  created_by TEXT DEFAULT 'Automated',  -- AI | Human | Automated
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate relationships
  UNIQUE(source_chunk_id, target_chunk_id, relationship_type)
);

-- Indexes for performance
CREATE INDEX idx_knowledge_graph_source ON knowledge_graph(source_chunk_id);
CREATE INDEX idx_knowledge_graph_target ON knowledge_graph(target_chunk_id);
CREATE INDEX idx_knowledge_graph_type ON knowledge_graph(relationship_type);
CREATE INDEX idx_knowledge_graph_strength ON knowledge_graph(strength);

-- =============================================================================
-- RPC FUNCTIONS FOR RAG QUERIES
-- =============================================================================

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL,
  filter_cultural_sensitivity text[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  document_title text,
  document_category text,
  chunk_content text,
  chunk_summary text,
  similarity float,
  cultural_sensitivity text,
  section_path text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id AS chunk_id,
    kd.id AS document_id,
    kd.title AS document_title,
    kd.category AS document_category,
    kc.content AS chunk_content,
    kc.semantic_summary AS chunk_summary,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kd.cultural_sensitivity,
    kc.section_path
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE
    -- Apply filters
    (filter_category IS NULL OR kd.category = filter_category)
    AND (filter_cultural_sensitivity IS NULL OR kd.cultural_sensitivity = ANY(filter_cultural_sensitivity))
    -- Similarity threshold
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find related chunks via knowledge graph
CREATE OR REPLACE FUNCTION find_related_chunks(
  chunk_id_input uuid,
  max_depth int DEFAULT 2,
  min_strength float DEFAULT 0.5
)
RETURNS TABLE (
  related_chunk_id uuid,
  relationship_type text,
  strength float,
  depth int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE chunk_graph AS (
    -- Base case: direct relationships
    SELECT
      CASE
        WHEN kg.source_chunk_id = chunk_id_input THEN kg.target_chunk_id
        WHEN kg.bidirectional THEN kg.source_chunk_id
      END AS related_chunk_id,
      kg.relationship_type,
      kg.strength,
      1 AS depth
    FROM knowledge_graph kg
    WHERE
      (kg.source_chunk_id = chunk_id_input OR (kg.bidirectional AND kg.target_chunk_id = chunk_id_input))
      AND kg.strength >= min_strength

    UNION

    -- Recursive case: follow relationships
    SELECT
      CASE
        WHEN kg.source_chunk_id = cg.related_chunk_id THEN kg.target_chunk_id
        WHEN kg.bidirectional THEN kg.source_chunk_id
      END AS related_chunk_id,
      kg.relationship_type,
      kg.strength,
      cg.depth + 1 AS depth
    FROM knowledge_graph kg
    JOIN chunk_graph cg ON (
      kg.source_chunk_id = cg.related_chunk_id OR
      (kg.bidirectional AND kg.target_chunk_id = cg.related_chunk_id)
    )
    WHERE
      cg.depth < max_depth
      AND kg.strength >= min_strength
  )
  SELECT DISTINCT * FROM chunk_graph
  WHERE related_chunk_id IS NOT NULL
  ORDER BY depth, strength DESC;
END;
$$;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_knowledge_base_stats()
RETURNS TABLE (
  total_documents bigint,
  total_chunks bigint,
  total_extractions bigint,
  total_relationships bigint,
  documents_by_category jsonb,
  average_confidence float,
  cultural_safety_coverage float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM knowledge_documents) AS total_documents,
    (SELECT COUNT(*) FROM knowledge_chunks) AS total_chunks,
    (SELECT COUNT(*) FROM knowledge_extractions) AS total_extractions,
    (SELECT COUNT(*) FROM knowledge_graph) AS total_relationships,

    -- Documents by category
    (SELECT jsonb_object_agg(category, count)
     FROM (
       SELECT category, COUNT(*) AS count
       FROM knowledge_documents
       GROUP BY category
     ) cat_counts
    ) AS documents_by_category,

    -- Average extraction confidence
    (SELECT AVG(confidence) FROM knowledge_extractions) AS average_confidence,

    -- Cultural safety coverage (% of extractions that are culturally safe)
    (SELECT
      COUNT(*) FILTER (WHERE culturally_safe = TRUE)::float /
      NULLIF(COUNT(*), 0) * 100
     FROM knowledge_extractions
    ) AS cultural_safety_coverage;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Knowledge base is public read for authenticated users

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph ENABLE ROW LEVEL SECURITY;

-- Public read for authenticated users
CREATE POLICY "Public read access to knowledge documents"
  ON knowledge_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to knowledge chunks"
  ON knowledge_chunks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to knowledge extractions"
  ON knowledge_extractions FOR SELECT
  TO authenticated
  USING (
    -- Only show culturally safe extractions OR if user is admin
    culturally_safe = TRUE OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_roles && ARRAY['super_admin', 'platform_admin']::text[]
    )
  );

CREATE POLICY "Public read access to knowledge graph"
  ON knowledge_graph FOR SELECT
  TO authenticated
  USING (true);

-- Admin write access
CREATE POLICY "Admin write access to knowledge documents"
  ON knowledge_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_roles && ARRAY['super_admin', 'platform_admin']::text[]
    )
  );

CREATE POLICY "Admin write access to knowledge chunks"
  ON knowledge_chunks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_roles && ARRAY['super_admin', 'platform_admin']::text[]
    )
  );

CREATE POLICY "Admin write access to knowledge extractions"
  ON knowledge_extractions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_roles && ARRAY['super_admin', 'platform_admin']::text[]
    )
  );

CREATE POLICY "Admin write access to knowledge graph"
  ON knowledge_graph FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_roles && ARRAY['super_admin', 'platform_admin']::text[]
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE knowledge_documents IS 'Metadata for documentation files in the knowledge base';
COMMENT ON TABLE knowledge_chunks IS 'Semantic chunks of documents with vector embeddings for RAG';
COMMENT ON TABLE knowledge_extractions IS 'Q&A pairs extracted from chunks for SLM training';
COMMENT ON TABLE knowledge_graph IS 'Relationships between knowledge chunks';

COMMENT ON FUNCTION search_knowledge IS 'Vector similarity search for RAG queries with optional filters';
COMMENT ON FUNCTION find_related_chunks IS 'Find related chunks via knowledge graph traversal';
COMMENT ON FUNCTION get_knowledge_base_stats IS 'Get statistics about the knowledge base';
