# Sprint 7: Advanced Features - Implementation Plan

**Status**: Ready to Build
**Date**: January 5, 2026
**Estimated Time**: 8-10 hours
**Priority**: P1 (Platform Differentiation)

---

## 🎯 Sprint Mission

Transform the Empathy Ledger into an AI-powered discovery platform with intelligent theme extraction, network visualization, and interactive geographic storytelling.

---

## 📋 COMPONENTS TO BUILD (20 total)

### Phase 1: AI Analysis Pipeline (6 components)

1. **AIAnalysisDashboard.tsx** (~400 lines)
   - Analysis job queue display
   - Batch processing controls
   - Progress tracking
   - Results preview
   - Re-run analysis button
   - Cultural safety override controls

2. **ThemeExtractor.tsx** (~350 lines)
   - AI theme extraction from story content
   - Suggested themes display
   - Confidence scores
   - Manual theme editing
   - Approve/reject themes
   - Cultural theme mapping

3. **QuoteHighlighter.tsx** (~300 lines)
   - Significant quote extraction
   - Quote cards with context
   - Sentiment analysis
   - Cultural significance indicators
   - Export quotes feature
   - Attribution tracking

4. **LanguageAnalyzer.tsx** (~250 lines)
   - Indigenous language detection
   - Language preservation metrics
   - Word frequency analysis
   - Traditional knowledge indicators
   - Bilingual content detection

5. **SentimentAnalysis.tsx** (~200 lines)
   - Emotional tone detection
   - Healing vs trauma indicators
   - Cultural context awareness
   - Elder review triggers
   - Sensitivity warnings

6. **AISettingsPanel.tsx** (~250 lines)
   - AI analysis opt-in/opt-out
   - Model selection (GPT-4, Claude, local)
   - Sacred content exclusions
   - Batch processing preferences
   - Data usage consent

---

### Phase 2: Thematic Network Visualization (4 components)

7. **ThematicNetworkViewer.tsx** (~500 lines)
   - Interactive network graph
   - Theme nodes (size = story count)
   - Connection edges (shared themes)
   - Zoom and pan controls
   - Filter by cultural group
   - Click to explore theme
   - Export as image

8. **ThemeNode.tsx** (~200 lines)
   - Visual node representation
   - Hover tooltip (story count, examples)
   - Click handler (navigate to theme page)
   - Color coding by cultural group
   - Size scaling

9. **NetworkControls.tsx** (~250 lines)
   - Zoom in/out buttons
   - Layout algorithm selector (force, circular, hierarchical)
   - Filter controls (min connections, cultural group)
   - Search for theme
   - Reset view button

10. **ThemeConnectionsList.tsx** (~200 lines)
    - List view of theme relationships
    - Connection strength indicators
    - Stories that bridge themes
    - Export connections data

---

### Phase 3: Interactive Story Map (4 components)

11. **InteractiveStoryMap.tsx** (~600 lines)
    - Leaflet/Mapbox map component
    - Story markers on territories
    - Territory boundary overlays
    - Cluster markers (when zoomed out)
    - Click marker → story preview
    - Filter by cultural group
    - Heatmap layer toggle

12. **StoryMarker.tsx** (~200 lines)
    - Custom map marker
    - Cultural group color coding
    - Story count badge (for clusters)
    - Click → popup with preview
    - Hover → tooltip

13. **TerritoryOverlay.tsx** (~250 lines)
    - Traditional territory boundaries
    - Semi-transparent fill
    - Cultural group labels
    - Click → filter stories
    - Toggle visibility

14. **MapLegend.tsx** (~150 lines)
    - Color key for cultural groups
    - Marker symbols explanation
    - Scale indicator
    - Attribution

---

### Phase 4: Advanced Search (4 components)

15. **AdvancedSearchPanel.tsx** (~450 lines)
    - Full-text search input
    - Filter by multiple criteria:
      - Cultural themes (multi-select)
      - Cultural groups (multi-select)
      - Languages (multi-select)
      - Date range
      - Media type
      - Storyteller
      - Location
    - Sort options
    - Save search feature

16. **SearchResults.tsx** (~350 lines)
    - Paginated results
    - Result cards with highlights
    - Relevance score
    - Faceted navigation
    - Export results

17. **SavedSearches.tsx** (~200 lines)
    - List of saved searches
    - Run saved search
    - Edit/delete saved search
    - Share search with team

18. **SearchSuggestions.tsx** (~150 lines)
    - Autocomplete for themes
    - Related searches
    - Popular searches
    - Recent searches

---

### Phase 5: Cultural Theme Explorer (2 components)

19. **CulturalThemeExplorer.tsx** (~400 lines)
    - Browse 20+ Indigenous themes
    - Theme cards with descriptions
    - Story count per theme
    - Visual theme icons
    - Filter by cultural group
    - Related themes suggestions
    - Theme timeline (when stories were created)

20. **ThemeDetailPage.tsx** (~350 lines)
    - Theme description
    - Stories tagged with theme
    - Sub-themes
    - Related themes network
    - Cultural significance notes
    - Elder commentary (if available)

---

## 🔧 API ENDPOINTS NEEDED (15 total)

### AI Analysis Pipeline (6 endpoints)

1. **POST /api/ai/analyze/story/[id]**
   - Body: story content, analysis type (themes/quotes/sentiment)
   - Returns: extracted themes, quotes, sentiment data
   - Uses: Claude API or GPT-4

2. **POST /api/ai/analyze/batch**
   - Body: story IDs array, analysis type
   - Returns: batch job ID
   - Queues: background processing

3. **GET /api/ai/jobs/[jobId]**
   - Returns: job status, progress, results

4. **GET /api/ai/themes/suggestions/[storyId]**
   - Returns: AI-suggested themes with confidence scores

5. **POST /api/ai/themes/approve**
   - Body: story ID, theme IDs to approve
   - Returns: updated story themes

6. **GET /api/ai/quotes/[storyId]**
   - Returns: extracted significant quotes

---

### Thematic Network (3 endpoints)

7. **GET /api/network/themes**
   - Query: organization_id, min_connections
   - Returns: nodes (themes) and edges (connections)
   - Format: { nodes: [], edges: [] }

8. **GET /api/network/theme/[themeId]/connections**
   - Returns: related themes and connection strength

9. **GET /api/network/stories-between-themes**
   - Query: theme1_id, theme2_id
   - Returns: stories that bridge the themes

---

### Interactive Map (3 endpoints)

10. **GET /api/map/stories**
    - Query: bounds (lat/lng), filters
    - Returns: stories with geocoded locations

11. **GET /api/map/territories**
    - Returns: territory boundary GeoJSON
    - Cultural group associations

12. **GET /api/map/clusters**
    - Query: zoom level, bounds
    - Returns: clustered story markers

---

### Advanced Search (3 endpoints)

13. **POST /api/search/advanced**
    - Body: full-text query, filters, sort
    - Returns: paginated results with highlights
    - Uses: PostgreSQL full-text search or Algolia

14. **POST /api/search/save**
    - Body: search query, filters, name
    - Returns: saved search ID

15. **GET /api/search/suggestions**
    - Query: partial query
    - Returns: autocomplete suggestions

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### New Tables (4)

```sql
-- AI Analysis Jobs
CREATE TABLE ai_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id),
  job_type TEXT NOT NULL, -- 'themes', 'quotes', 'sentiment', 'language'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Input
  story_ids UUID[],
  total_stories INTEGER DEFAULT 0,

  -- Progress
  processed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Results
  results JSONB DEFAULT '{}',
  error_message TEXT,

  -- Settings
  ai_model TEXT DEFAULT 'claude-3-sonnet', -- or 'gpt-4', 'local'
  parameters JSONB DEFAULT '{}',

  created_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ
);

-- AI Extracted Themes
CREATE TABLE ai_extracted_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  job_id UUID REFERENCES ai_analysis_jobs(id),

  -- Theme data
  theme_name TEXT NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected')),

  -- Context
  evidence_text TEXT, -- excerpt supporting this theme
  reasoning TEXT, -- AI explanation

  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ
);

-- Significant Quotes
CREATE TABLE significant_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  job_id UUID REFERENCES ai_analysis_jobs(id),

  -- Quote data
  quote_text TEXT NOT NULL,
  start_position INTEGER, -- character position in story
  end_position INTEGER,

  -- Analysis
  significance_score NUMERIC(3,2),
  sentiment TEXT, -- 'healing', 'trauma', 'neutral', 'mixed'
  cultural_significance BOOLEAN DEFAULT false,
  themes TEXT[], -- related themes

  -- Metadata
  featured BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ
);

-- Saved Searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- User
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),

  -- Search data
  name TEXT NOT NULL,
  description TEXT,
  query_text TEXT,
  filters JSONB DEFAULT '{}', -- themes, groups, languages, dates, etc.
  sort_by TEXT DEFAULT 'relevance',

  -- Usage
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,

  -- Sharing
  is_public BOOLEAN DEFAULT false,
  shared_with UUID[] -- profile IDs
);
```

### Indexes for Performance

```sql
-- Full-text search on stories
CREATE INDEX idx_stories_content_fts ON stories USING gin(to_tsvector('english', content));
CREATE INDEX idx_stories_title_fts ON stories USING gin(to_tsvector('english', title));

-- AI analysis lookups
CREATE INDEX idx_ai_jobs_status ON ai_analysis_jobs(status, created_at);
CREATE INDEX idx_ai_themes_story ON ai_extracted_themes(story_id, status);
CREATE INDEX idx_quotes_story ON significant_quotes(story_id, featured);

-- Geographic queries
CREATE INDEX idx_stories_location ON stories USING gist(location_point);

-- Theme network queries
CREATE INDEX idx_stories_themes ON stories USING gin(cultural_themes);
```

---

## 🤖 AI INTEGRATION ARCHITECTURE

### AI Model Options

1. **Claude 3 Sonnet** (Recommended)
   - Best for theme extraction
   - Excellent cultural sensitivity
   - Good quote identification
   - API: Anthropic SDK

2. **GPT-4 Turbo**
   - Alternative for theme extraction
   - Good performance
   - API: OpenAI SDK

3. **Local Model** (Future)
   - Privacy-focused option
   - Llama 2 or similar
   - Requires GPU infrastructure

### Analysis Pipeline

```typescript
// Theme Extraction Prompt
const themePrompt = `
Analyze this Indigenous story and extract cultural themes.

Story: "${story.content}"

Extract 3-5 themes that are:
1. Culturally significant
2. Specific and meaningful
3. Relevant to Indigenous contexts

Return JSON:
{
  "themes": [
    {
      "name": "Connection to Land",
      "confidence": 0.95,
      "evidence": "excerpt from story",
      "reasoning": "why this theme applies"
    }
  ]
}
`

// Quote Extraction Prompt
const quotePrompt = `
Identify 3-5 significant quotes from this story that:
1. Capture the essence of the narrative
2. Are culturally significant
3. Could inspire others
4. Respect the storyteller's voice

Return JSON with quotes and significance scores.
`
```

---

## 🗺️ MAP INTEGRATION

### Technology Options

1. **Mapbox GL JS** (Recommended)
   - Beautiful styling
   - Custom territory layers
   - Good performance
   - $0 for < 50k loads/month

2. **Leaflet**
   - Open source
   - Lightweight
   - Good plugin ecosystem
   - Free

3. **Google Maps**
   - Familiar UX
   - Good geocoding
   - $$$ expensive

### Territory Data

```typescript
// Example GeoJSON for territories
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Anishinaabe Territory",
        "cultural_group": "Anishinaabe",
        "color": "#D97757"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], [lng, lat], ...]]
      }
    }
  ]
}
```

---

## 🎨 NETWORK VISUALIZATION

### Library Options

1. **React Flow** (Recommended)
   - React-native
   - Good performance
   - Customizable nodes
   - MIT license

2. **D3.js**
   - Ultimate flexibility
   - Steeper learning curve
   - Force-directed layouts

3. **Cytoscape.js**
   - Graph theory focused
   - Good for complex networks

### Network Data Structure

```typescript
interface NetworkData {
  nodes: Array<{
    id: string
    label: string
    size: number // story count
    color: string // cultural group
    group: string
  }>
  edges: Array<{
    id: string
    source: string // theme ID
    target: string // theme ID
    weight: number // connection strength (shared stories)
  }>
}
```

---

## 🧪 TESTING PLAN

### Sprint 7 Test Pages
- `/test/sprint-7/ai-analysis` - AI pipeline testing
- `/test/sprint-7/network` - Thematic network
- `/test/sprint-7/map` - Interactive map
- `/test/sprint-7/search` - Advanced search

### Test Scenarios

1. **AI Analysis**:
   - [ ] Extract themes from story
   - [ ] Batch process 10 stories
   - [ ] Approve/reject suggested themes
   - [ ] Extract significant quotes
   - [ ] Detect sentiment

2. **Thematic Network**:
   - [ ] Display network of themes
   - [ ] Click node → navigate to theme page
   - [ ] Filter by cultural group
   - [ ] Zoom and pan
   - [ ] Export network image

3. **Interactive Map**:
   - [ ] Display stories on map
   - [ ] Click marker → story preview
   - [ ] Territory overlays
   - [ ] Cluster markers
   - [ ] Filter by cultural group

4. **Advanced Search**:
   - [ ] Full-text search
   - [ ] Multi-criteria filters
   - [ ] Save search
   - [ ] Run saved search
   - [ ] Export results

---

## ✅ SUCCESS CRITERIA

### Functionality
- [ ] AI can extract themes with >80% accuracy
- [ ] Network visualization is interactive and fast
- [ ] Map displays 1000+ stories without lag
- [ ] Search returns relevant results in <1s

### Cultural Safety
- [ ] AI respects sacred content exclusions
- [ ] Elder can review AI suggestions
- [ ] No exploitation of stories for data
- [ ] Transparent AI methodology

### User Experience
- [ ] Network is intuitive to explore
- [ ] Map is beautiful and informative
- [ ] Search is powerful but simple
- [ ] Components load in < 3s

---

## 📈 EXPECTED IMPACT

**For Storytellers**:
- Stories connected through themes
- Quotes highlighted and preserved
- Geographic context visualized
- Discovery through relationships

**For Researchers**:
- Thematic analysis at scale
- Network patterns revealed
- Geographic distribution mapped
- Advanced search capabilities

**For Communities**:
- Cultural themes documented
- Story connections visualized
- Territories represented
- Knowledge preserved

**For Platform**:
- AI-powered differentiation
- Unique visualization features
- Powerful discovery tools
- Research-grade capabilities

---

## 🚀 IMPLEMENTATION ORDER

### Phase 1: AI Analysis Pipeline (3-4 hours)
Build theme extraction, quote highlighting, and sentiment analysis.

### Phase 2: Thematic Network (2-3 hours)
Create interactive network visualization of theme relationships.

### Phase 3: Interactive Map (2-3 hours)
Build map with territory overlays and story markers.

### Phase 4: Advanced Search (1-2 hours)
Implement full-text search with multiple filters.

### Phase 5: APIs & Database (2 hours)
Create all endpoints and database migrations.

**Total Estimated: 10-14 hours**

---

**Ready to begin Sprint 7: Advanced Features!** 🚀

*"AI amplifies Indigenous voices. Visualization honors connections. Discovery serves sovereignty. Let's build the future of cultural preservation."*
