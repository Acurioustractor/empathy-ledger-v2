/**
 * Knowledge Base Service
 *
 * Scans documentation files, generates metadata, creates semantic chunks,
 * and prepares data for RAG system + SLM training.
 *
 * Based on: docs/KNOWLEDGE_BASE_TRANSFORMATION_PLAN.md
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// =============================================================================
// TYPES
// =============================================================================

export type PMPPCategory = 'Principle' | 'Method' | 'Practice' | 'Procedure';
export type KnowledgeType = 'Factual' | 'Procedural' | 'Strategic' | 'Cultural';
export type CulturalLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Sacred';
export type ExtractionStatus = 'Pending' | 'Extracted' | 'Reviewed' | 'Published' | 'Archived';
export type ChunkType = 'Heading' | 'Paragraph' | 'Code' | 'List' | 'Table' | 'Quote' | 'Diagram';

export interface DocumentMetadata {
  title: string;
  category: PMPPCategory;
  subcategory?: string;
  knowledge_type: KnowledgeType;
  confidence: number;
  source_file: string;
  created_date?: Date;
  last_updated: Date;
  dependencies?: string[];
  tags: string[];
  cultural_sensitivity: CulturalLevel;
  extraction_status: ExtractionStatus;
  author?: string;
  version?: string;
  metrics: {
    word_count: number;
    code_examples: number;
    diagrams: number;
    external_references: number;
    internal_references: number;
  };
  pmpp_attributes: {
    is_principle: boolean;
    is_method: boolean;
    is_practice: boolean;
    is_procedure: boolean;
  };
  farmhand_attributes: {
    has_sacred_boundaries: boolean;
    has_cultural_protocols: boolean;
    has_examples: boolean;
    has_time_saved_metric: boolean;
  };
}

export interface KnowledgeChunk {
  document_id: string;
  chunk_type: ChunkType;
  content: string;
  semantic_summary?: string;
  token_count: number;
  position_in_doc: number;
  section_path: string[];
  references: {
    internal_links: string[];
    external_links: string[];
    code_references: string[];
  };
  retrieval_metadata: {
    similarity_threshold: number;
    boost_factor: number;
    requires_context: boolean;
    standalone: boolean;
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const DOCS_ROOT = join(process.cwd(), 'docs');

const PMPP_DIRECTORIES: Record<string, PMPPCategory> = {
  '01-principles': 'Principle',
  '02-methods': 'Method',
  '03-architecture': 'Practice',
  '04-database': 'Procedure',
  '05-features': 'Procedure',
  '06-development': 'Practice',
  '07-deployment': 'Procedure',
  '08-integrations': 'Procedure',
  '09-testing': 'Practice',
  '10-analytics': 'Practice',
  '11-projects': 'Practice',
  '12-design': 'Method',
  '13-platform': 'Practice',
  '14-poc': 'Practice',
  '15-reports': 'Principle',
};

// Cultural sensitivity keywords for automatic detection
const CULTURAL_KEYWORDS = {
  Sacred: ['Elder', 'sacred', 'ceremony', 'restricted knowledge', 'Traditional Owner'],
  High: ['OCAP', 'Indigenous', 'Aboriginal', 'Torres Strait', 'cultural protocol', 'sovereignty'],
  Medium: ['consent', 'cultural', 'community', 'storyteller', 'trauma-informed'],
  Low: ['diversity', 'inclusive', 'respect'],
};

const SACRED_BOUNDARIES_KEYWORDS = [
  'NEVER',
  'non-negotiable',
  'must not',
  'prohibited',
  'forbidden',
  'always required',
];

// =============================================================================
// SUPABASE CLIENT (lazy initialized)
// =============================================================================

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// =============================================================================
// OPENAI CLIENT (lazy initialized)
// =============================================================================

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return _openai;
}


// =============================================================================
// DOCUMENT SCANNING
// =============================================================================

/**
 * Scan all markdown files in docs directory
 */
export async function scanDocumentation(): Promise<string[]> {
  const markdownFiles: string[] = [];

  async function scanDirectory(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scanDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        markdownFiles.push(fullPath);
      }
    }
  }

  await scanDirectory(DOCS_ROOT);
  return markdownFiles;
}

// =============================================================================
// METADATA EXTRACTION
// =============================================================================

/**
 * Extract metadata from a markdown file
 */
export async function extractMetadata(filePath: string): Promise<DocumentMetadata> {
  const content = await readFile(filePath, 'utf-8');
  const stats = await stat(filePath);
  const relativePath = relative(process.cwd(), filePath);

  // Parse frontmatter if exists
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Determine PMPP category from directory
  const category = detectPMPPCategory(relativePath);
  const subcategory = detectSubcategory(relativePath);

  // Count metrics
  const wordCount = markdownContent.split(/\s+/).length;
  const codeExamples = (markdownContent.match(/```/g) || []).length / 2;
  const diagrams = (markdownContent.match(/```(mermaid|ascii)/g) || []).length;
  const externalReferences = (markdownContent.match(/https?:\/\//g) || []).length;
  const internalReferences = (markdownContent.match(/\[.*?\]\((?!http).*?\)/g) || []).length;

  // Extract title
  const title = frontmatter.title ||
    extractTitle(markdownContent) ||
    filePath.split('/').pop()?.replace('.md', '') ||
    'Untitled';

  // Detect cultural sensitivity
  const culturalSensitivity = detectCulturalSensitivity(markdownContent);

  // Detect knowledge type
  const knowledgeType = detectKnowledgeType(markdownContent, category);

  // Extract tags
  const tags = frontmatter.tags || extractTags(markdownContent);

  // Detect PMPP attributes
  const pmpp_attributes = {
    is_principle: category === 'Principle',
    is_method: category === 'Method',
    is_practice: category === 'Practice',
    is_procedure: category === 'Procedure',
  };

  // Detect Farmhand attributes
  const farmhand_attributes = {
    has_sacred_boundaries: detectSacredBoundaries(markdownContent),
    has_cultural_protocols: detectCulturalProtocols(markdownContent),
    has_examples: codeExamples > 0 || /example|e\.g\.|for instance/i.test(markdownContent),
    has_time_saved_metric: /\d+\s*(hour|minute|week|month)s?\s*saved/i.test(markdownContent),
  };

  return {
    title,
    category,
    subcategory,
    knowledge_type: knowledgeType,
    confidence: 0.8, // Default confidence
    source_file: relativePath,
    created_date: frontmatter.date ? new Date(frontmatter.date) : undefined,
    last_updated: stats.mtime,
    dependencies: frontmatter.dependencies || [],
    tags,
    cultural_sensitivity: culturalSensitivity,
    extraction_status: 'Pending',
    author: frontmatter.author,
    version: frontmatter.version,
    metrics: {
      word_count: wordCount,
      code_examples: codeExamples,
      diagrams,
      external_references: externalReferences,
      internal_references: internalReferences,
    },
    pmpp_attributes,
    farmhand_attributes,
  };
}

/**
 * Detect PMPP category from file path
 */
function detectPMPPCategory(filePath: string): PMPPCategory {
  for (const [dir, category] of Object.entries(PMPP_DIRECTORIES)) {
    if (filePath.includes(`docs/${dir}/`)) {
      return category;
    }
  }

  // Fallback: analyze content patterns
  // Files in root docs/ default to Principle
  return 'Principle';
}

/**
 * Detect subcategory from file path
 */
function detectSubcategory(filePath: string): string | undefined {
  const parts = filePath.split('/');
  const docsIndex = parts.indexOf('docs');

  if (docsIndex !== -1 && parts.length > docsIndex + 2) {
    return parts[docsIndex + 2]; // e.g., "sessions" in "docs/15-reports/sessions/..."
  }

  return undefined;
}

/**
 * Extract title from markdown content (first # heading)
 */
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Detect cultural sensitivity level
 */
function detectCulturalSensitivity(content: string): CulturalLevel {
  for (const [level, keywords] of Object.entries(CULTURAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        return level as CulturalLevel;
      }
    }
  }

  return 'None';
}

/**
 * Detect knowledge type
 */
function detectKnowledgeType(content: string, category: PMPPCategory): KnowledgeType {
  if (category === 'Principle') return 'Strategic';
  if (category === 'Procedure') return 'Procedural';

  // Check for cultural keywords
  if (CULTURAL_KEYWORDS.High.some(k => content.includes(k)) ||
      CULTURAL_KEYWORDS.Sacred.some(k => content.includes(k))) {
    return 'Cultural';
  }

  // Check for factual patterns (numbers, dates, stats)
  if (/\d+\s*(tables?|endpoints?|components?|files?)/.test(content)) {
    return 'Factual';
  }

  return 'Procedural';
}

/**
 * Extract tags from content
 */
function extractTags(content: string): string[] {
  const tags: string[] = [];

  // Extract from markdown links
  const links = content.match(/\[([^\]]+)\]/g) || [];
  links.forEach(link => {
    const tag = link.replace(/[\[\]]/g, '').toLowerCase();
    if (tag.length > 3 && tag.length < 30) {
      tags.push(tag);
    }
  });

  // Extract from code blocks (programming languages)
  const codeBlocks = content.match(/```(\w+)/g) || [];
  codeBlocks.forEach(block => {
    const lang = block.replace('```', '');
    if (lang && lang !== 'bash' && lang !== 'sh') {
      tags.push(lang);
    }
  });

  // Deduplicate
  return [...new Set(tags)].slice(0, 10);
}

/**
 * Detect sacred boundaries
 */
function detectSacredBoundaries(content: string): boolean {
  return SACRED_BOUNDARIES_KEYWORDS.some(keyword =>
    content.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Detect cultural protocols
 */
function detectCulturalProtocols(content: string): boolean {
  return CULTURAL_KEYWORDS.High.some(k => content.includes(k)) ||
    CULTURAL_KEYWORDS.Sacred.some(k => content.includes(k)) ||
    /OCAP|Elder authority|consent/i.test(content);
}

// =============================================================================
// SEMANTIC CHUNKING
// =============================================================================

/**
 * Split document into semantic chunks
 */
export async function createSemanticChunks(
  filePath: string,
  documentId: string
): Promise<KnowledgeChunk[]> {
  const content = await readFile(filePath, 'utf-8');
  const { content: markdownContent } = matter(content);

  const chunks: KnowledgeChunk[] = [];
  const lines = markdownContent.split('\n');

  let currentChunk: string[] = [];
  let currentType: ChunkType = 'Paragraph';
  let sectionPath: string[] = [];
  let position = 0;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock && currentChunk.length > 0) {
        // End of code block
        chunks.push(createChunk(currentChunk.join('\n'), 'Code', documentId, position++, sectionPath));
        currentChunk = [];
      }
      inCodeBlock = !inCodeBlock;
      currentChunk.push(line);
      continue;
    }

    if (inCodeBlock) {
      currentChunk.push(line);
      continue;
    }

    // Detect headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      // Save previous chunk
      if (currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
        currentChunk = [];
      }

      // Update section path
      const level = headingMatch[1].length;
      const title = headingMatch[2];
      sectionPath = sectionPath.slice(0, level - 1);
      sectionPath.push(title);

      // Create heading chunk
      chunks.push(createChunk(line, 'Heading', documentId, position++, sectionPath));
      continue;
    }

    // Detect lists
    if (line.match(/^[\s]*[-*+]\s+/) || line.match(/^[\s]*\d+\.\s+/)) {
      if (currentType !== 'List' && currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
        currentChunk = [];
      }
      currentType = 'List';
      currentChunk.push(line);
      continue;
    }

    // Detect tables
    if (line.includes('|')) {
      if (currentType !== 'Table' && currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
        currentChunk = [];
      }
      currentType = 'Table';
      currentChunk.push(line);
      continue;
    }

    // Detect quotes
    if (line.startsWith('>')) {
      if (currentType !== 'Quote' && currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
        currentChunk = [];
      }
      currentType = 'Quote';
      currentChunk.push(line);
      continue;
    }

    // Default: paragraph
    if (line.trim().length > 0) {
      if (currentType !== 'Paragraph' && currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
        currentChunk = [];
        currentType = 'Paragraph';
      }
      currentChunk.push(line);
    } else if (currentChunk.length > 0) {
      // Empty line - end current chunk
      chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
      currentChunk = [];
      currentType = 'Paragraph';
    }
  }

  // Save final chunk
  if (currentChunk.length > 0) {
    chunks.push(createChunk(currentChunk.join('\n'), currentType, documentId, position++, sectionPath));
  }

  return chunks;
}

/**
 * Create a knowledge chunk
 */
function createChunk(
  content: string,
  type: ChunkType,
  documentId: string,
  position: number,
  sectionPath: string[]
): KnowledgeChunk {
  // Extract references
  const internalLinks = (content.match(/\[.*?\]\((?!http)([^\)]+)\)/g) || [])
    .map(match => match.match(/\(([^\)]+)\)/)?.[1] || '')
    .filter(Boolean);

  const externalLinks = (content.match(/\[.*?\]\((https?:\/\/[^\)]+)\)/g) || [])
    .map(match => match.match(/\((https?:\/\/[^\)]+)\)/)?.[1] || '')
    .filter(Boolean);

  const codeReferences = (content.match(/`([^`]+\.(ts|tsx|js|jsx|sql|md))`/g) || [])
    .map(match => match.replace(/`/g, ''));

  // Estimate token count (rough: 1 token ≈ 4 characters)
  const tokenCount = Math.ceil(content.length / 4);

  return {
    document_id: documentId,
    chunk_type: type,
    content,
    token_count: tokenCount,
    position_in_doc: position,
    section_path: sectionPath,
    references: {
      internal_links: internalLinks,
      external_links: externalLinks,
      code_references: codeReferences,
    },
    retrieval_metadata: {
      similarity_threshold: 0.7,
      boost_factor: type === 'Heading' ? 1.2 : 1.0, // Boost headings
      requires_context: type === 'Code' || type === 'Quote',
      standalone: type === 'Paragraph' || type === 'List',
    },
  };
}

// =============================================================================
// EMBEDDING GENERATION
// =============================================================================

/**
 * Generate OpenAI embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for all chunks in batch
 */
export async function generateEmbeddingsBatch(chunks: KnowledgeChunk[]): Promise<number[][]> {
  const texts = chunks.map(chunk => chunk.content);

  // OpenAI allows up to 2048 inputs per request
  const batchSize = 2048;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await getOpenAI().embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });

    embeddings.push(...response.data.map(d => d.embedding));
  }

  return embeddings;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Store document metadata in database
 */
export async function storeDocument(metadata: DocumentMetadata): Promise<string> {
  const { data, error } = await getSupabase()
    .from('knowledge_documents')
    .insert({
      title: metadata.title,
      category: metadata.category,
      subcategory: metadata.subcategory,
      knowledge_type: metadata.knowledge_type,
      confidence: metadata.confidence,
      source_file: metadata.source_file,
      created_date: metadata.created_date?.toISOString(),
      last_updated: metadata.last_updated.toISOString(),
      dependencies: metadata.dependencies,
      tags: metadata.tags,
      cultural_sensitivity: metadata.cultural_sensitivity,
      extraction_status: metadata.extraction_status,
      author: metadata.author,
      version: metadata.version,
      metrics: metadata.metrics,
      pmpp_attributes: metadata.pmpp_attributes,
      farmhand_attributes: metadata.farmhand_attributes,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Store knowledge chunks with embeddings
 */
export async function storeChunks(chunks: KnowledgeChunk[], embeddings: number[][]): Promise<void> {
  const chunksWithEmbeddings = chunks.map((chunk, i) => ({
    document_id: chunk.document_id,
    chunk_type: chunk.chunk_type,
    content: chunk.content,
    semantic_summary: chunk.semantic_summary,
    embedding: embeddings[i],
    token_count: chunk.token_count,
    position_in_doc: chunk.position_in_doc,
    section_path: chunk.section_path,
    chunk_references: chunk.references,
    retrieval_metadata: chunk.retrieval_metadata,
  }));

  const { error } = await getSupabase()
    .from('knowledge_chunks')
    .insert(chunksWithEmbeddings);

  if (error) throw error;
}

// =============================================================================
// MAIN PIPELINE
// =============================================================================

/**
 * Process a single document: extract metadata, chunk, embed, store
 */
export async function processDocument(filePath: string): Promise<void> {
  console.log(`Processing: ${filePath}`);

  // 1. Extract metadata
  const metadata = await extractMetadata(filePath);

  // 2. Store document
  const documentId = await storeDocument(metadata);

  // 3. Create semantic chunks
  const chunks = await createSemanticChunks(filePath, documentId);

  // 4. Generate embeddings
  const embeddings = await generateEmbeddingsBatch(chunks);

  // 5. Store chunks with embeddings
  await storeChunks(chunks, embeddings);

  console.log(`✅ Processed: ${metadata.title} (${chunks.length} chunks)`);
}

/**
 * Process all documentation files
 */
export async function processAllDocumentation(): Promise<void> {
  const files = await scanDocumentation();

  console.log(`Found ${files.length} documentation files`);

  for (const file of files) {
    try {
      await processDocument(file);
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error);
    }
  }

  console.log('✅ All documentation processed');
}

// =============================================================================
// Q&A EXTRACTION FOR SLM TRAINING
// =============================================================================

export type ExtractionType = 'Principle' | 'Method' | 'Practice' | 'Procedure' | 'Fact' | 'Process' | 'Warning';

export interface QAExtraction {
  chunk_id: string;
  extraction_type: ExtractionType;
  question: string;
  answer: string;
  context?: string;
  confidence: number;
  culturally_safe: boolean;
  training_category?: string;
}

/**
 * Extract Q&A pairs from a chunk using OpenAI GPT-4
 */
export async function extractQAFromChunk(
  chunkId: string,
  content: string,
  documentTitle: string,
  documentCategory: PMPPCategory,
  sectionPath: string[],
  culturalSensitivity: CulturalLevel
): Promise<QAExtraction[]> {
  const systemPrompt = `You are an expert at extracting knowledge from documentation to create Q&A pairs for training a specialized language model (SLM) focused on the Empathy Ledger platform.

The Empathy Ledger is a multi-tenant storytelling platform serving Indigenous communities with cultural sensitivity protocols. Extract ONLY knowledge that would help an AI assistant understand and work with this platform.

CULTURAL SAFETY RULES:
- NEVER extract sacred or restricted knowledge
- NEVER include specific Elder names, ceremonial details, or community-specific protocols
- Mark extractions as culturally_safe: false if they discuss cultural protocols in abstract/educational ways
- Principle: If in doubt, err on the side of cultural safety

EXTRACTION TYPES:
- Principle: Core values, philosophy, "why we do things" (e.g., OCAP principles)
- Method: Frameworks, approaches, high-level strategies
- Practice: Technical implementations, best practices
- Procedure: Step-by-step instructions, how-to guides
- Fact: Statistics, specifications, concrete data points
- Process: Workflow steps, sequences of actions
- Warning: Important caveats, things to avoid, error handling

OUTPUT FORMAT: Return a JSON array of extractions:
[
  {
    "extraction_type": "Principle|Method|Practice|Procedure|Fact|Process|Warning",
    "question": "Clear question someone might ask about this topic",
    "answer": "Comprehensive answer based on the content",
    "context": "Optional surrounding context for clarity",
    "confidence": 0.0-1.0,
    "culturally_safe": true/false,
    "training_category": "optional category for organizing training data"
  }
]

QUALITY GUIDELINES:
- Questions should be natural, like what a developer/user would actually ask
- Answers should be self-contained and actionable
- Aim for 2-5 extractions per chunk depending on content richness
- Skip chunks with minimal extractable knowledge
- Include code examples where relevant
- Confidence should reflect how certain you are about the extraction accuracy`;

  const userPrompt = `Document: "${documentTitle}"
Category: ${documentCategory}
Section: ${sectionPath.join(' > ') || 'Root'}
Cultural Sensitivity: ${culturalSensitivity}

Content to extract from:
---
${content}
---

Extract Q&A pairs for SLM training. Return ONLY a valid JSON array.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const responseText = response.choices[0]?.message?.content || '';

    // Parse JSON response
    let parsed: { extractions?: Array<unknown> } | Array<unknown>;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        console.log(`  No valid JSON in response`);
        return [];
      }
    }

    // Handle both array and object with extractions key
    let extractionsArray: Array<unknown>;
    if (Array.isArray(parsed)) {
      extractionsArray = parsed;
    } else if (parsed && typeof parsed === 'object' && 'extractions' in parsed && Array.isArray(parsed.extractions)) {
      extractionsArray = parsed.extractions;
    } else {
      console.log(`  No extractions found for chunk`);
      return [];
    }

    if (extractionsArray.length === 0) {
      return [];
    }

    const extractions = extractionsArray as Array<{
      extraction_type: ExtractionType;
      question: string;
      answer: string;
      context?: string;
      confidence: number;
      culturally_safe: boolean;
      training_category?: string;
    }>;

    // Add chunk_id to each extraction
    return extractions.map(ext => ({
      chunk_id: chunkId,
      ...ext,
    }));
  } catch (error) {
    console.error(`Failed to extract Q&A from chunk:`, error);
    return [];
  }
}

/**
 * Store Q&A extractions in database
 */
export async function storeExtractions(extractions: QAExtraction[]): Promise<void> {
  if (extractions.length === 0) return;

  const rows = extractions.map(ext => ({
    chunk_id: ext.chunk_id,
    extraction_type: ext.extraction_type,
    question: ext.question,
    answer: ext.answer,
    context: ext.context,
    confidence: ext.confidence,
    culturally_safe: ext.culturally_safe,
    training_category: ext.training_category,
    validation_status: 'Auto',
  }));

  const { error } = await getSupabase()
    .from('knowledge_extractions')
    .insert(rows);

  if (error) throw error;
}

/**
 * Extract Q&A pairs from all chunks in the knowledge base
 */
export async function extractAllQA(options?: {
  limit?: number;
  minTokens?: number;
  skipExisting?: boolean;
  batchSize?: number;
  delayMs?: number;
}): Promise<{ total: number; extracted: number; failed: number }> {
  const {
    limit = 1000,
    minTokens = 50, // Skip very short chunks
    skipExisting = true,
    batchSize = 10,
    delayMs = 1000, // Rate limiting delay between batches
  } = options || {};

  // Get existing chunk IDs if skipping
  let existingChunkIds: string[] = [];
  if (skipExisting) {
    const { data: existing } = await getSupabase()
      .from('knowledge_extractions')
      .select('chunk_id');
    existingChunkIds = existing?.map(e => e.chunk_id) || [];
  }

  // Get chunks that need extraction
  let query = getSupabase()
    .from('knowledge_chunks')
    .select(`
      id,
      content,
      token_count,
      section_path,
      document_id,
      knowledge_documents (
        title,
        category,
        cultural_sensitivity
      )
    `)
    .gte('token_count', minTokens)
    .order('position_in_doc', { ascending: true })
    .limit(limit + existingChunkIds.length); // Get extra to account for filtering

  const { data: allChunks, error } = await query;

  // Filter out chunks that already have extractions
  const chunks = skipExisting && existingChunkIds.length > 0
    ? allChunks?.filter(c => !existingChunkIds.includes(c.id)).slice(0, limit)
    : allChunks?.slice(0, limit);

  if (error) throw error;
  if (!chunks || chunks.length === 0) {
    console.log('No chunks to process');
    return { total: 0, extracted: 0, failed: 0 };
  }

  console.log(`\nExtracting Q&A from ${chunks.length} chunks...\n`);

  let extracted = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);

    // Process batch concurrently
    const results = await Promise.allSettled(
      batch.map(async (chunk) => {
        const doc = chunk.knowledge_documents as unknown as {
          title: string;
          category: PMPPCategory;
          cultural_sensitivity: CulturalLevel;
        };

        const extractions = await extractQAFromChunk(
          chunk.id,
          chunk.content,
          doc.title,
          doc.category,
          chunk.section_path || [],
          doc.cultural_sensitivity
        );

        if (extractions.length > 0) {
          await storeExtractions(extractions);
          console.log(`  ✅ ${doc.title}: ${extractions.length} extractions`);
          return extractions.length;
        }
        return 0;
      })
    );

    // Count results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        extracted += result.value;
      } else {
        failed++;
        console.error(`  ❌ Failed:`, result.reason);
      }
    }

    // Rate limiting delay between batches
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { total: chunks.length, extracted, failed };
}

/**
 * Export Q&A extractions for SLM training
 */
export async function exportTrainingData(options?: {
  format?: 'jsonl' | 'csv' | 'json';
  minConfidence?: number;
  onlyCulturallySafe?: boolean;
  validationStatus?: string[];
}): Promise<string> {
  const {
    format = 'jsonl',
    minConfidence = 0.6,
    onlyCulturallySafe = true,
    validationStatus = ['Auto', 'Human-Reviewed', 'Verified'],
  } = options || {};

  let query = getSupabase()
    .from('knowledge_extractions')
    .select(`
      extraction_type,
      question,
      answer,
      context,
      confidence,
      training_category,
      knowledge_chunks (
        section_path,
        knowledge_documents (
          title,
          category
        )
      )
    `)
    .gte('confidence', minConfidence)
    .in('validation_status', validationStatus);

  if (onlyCulturallySafe) {
    query = query.eq('culturally_safe', true);
  }

  const { data: extractions, error } = await query;

  if (error) throw error;
  if (!extractions) return '';

  // Format output
  if (format === 'jsonl') {
    return extractions.map(ext => {
      const chunk = ext.knowledge_chunks as unknown as {
        section_path: string[];
        knowledge_documents: { title: string; category: string };
      };

      return JSON.stringify({
        type: ext.extraction_type,
        question: ext.question,
        answer: ext.answer,
        context: ext.context,
        document: chunk?.knowledge_documents?.title,
        category: chunk?.knowledge_documents?.category,
        section: chunk?.section_path?.join(' > '),
        confidence: ext.confidence,
      });
    }).join('\n');
  }

  if (format === 'json') {
    return JSON.stringify(extractions, null, 2);
  }

  // CSV format
  const headers = ['type', 'question', 'answer', 'context', 'document', 'category', 'confidence'];
  const rows = extractions.map(ext => {
    const chunk = ext.knowledge_chunks as unknown as {
      knowledge_documents: { title: string; category: string };
    };
    return [
      ext.extraction_type,
      `"${ext.question.replace(/"/g, '""')}"`,
      `"${ext.answer.replace(/"/g, '""')}"`,
      `"${(ext.context || '').replace(/"/g, '""')}"`,
      chunk?.knowledge_documents?.title || '',
      chunk?.knowledge_documents?.category || '',
      ext.confidence,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
