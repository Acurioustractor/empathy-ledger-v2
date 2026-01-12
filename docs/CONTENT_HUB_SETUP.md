# Empathy Ledger Content Hub Setup

## Enable Vector Extension (Required for Semantic Search)

The Content Hub uses pgvector for semantic similarity search. Enable it via Supabase Dashboard:

### Steps:

1. **Go to Supabase Dashboard**
   https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/database/extensions

2. **Find "vector" extension**
   - Search for "vector" in the extensions list
   - Or look under "AI / ML" category

3. **Enable the extension**
   - Click the toggle to enable
   - This creates the `vector` data type for embeddings

4. **After enabling, run this migration:**
   ```sql
   -- Add face encoding column to person recognition table
   ALTER TABLE media_person_recognition
   ADD COLUMN IF NOT EXISTS face_encoding vector(512);

   -- Create index for face similarity search
   CREATE INDEX IF NOT EXISTS idx_face_encoding_similarity
   ON media_person_recognition
   USING ivfflat (face_encoding vector_cosine_ops)
   WITH (lists = 100);
   ```

## Environment Variables

All required secrets are stored in Bitwarden under "Empathy Ledger" folder:

### AI Keys (for Media Intelligence)
- **ANTHROPIC_API_KEY** - Claude Vision for photo/video analysis
- **OPENAI_API_KEY** - Embeddings for semantic search

### Content Hub Settings
```env
# Add to .env.local
CONTENT_HUB_API_KEY=ch_act_2026_empathyledger_syndication_key
ENABLE_MEDIA_INTELLIGENCE=true
ENABLE_FACE_RECOGNITION=true
ENABLE_THEME_EXTRACTION=true
EMBEDDING_MODEL=text-embedding-3-small
SIMILARITY_THRESHOLD=0.75
```

## API Endpoints

The Content Hub exposes these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/content-hub/stories` | GET | List published stories |
| `/api/v1/content-hub/stories/:id` | GET | Get single story |
| `/api/v1/content-hub/articles` | GET | List articles |
| `/api/v1/content-hub/articles/:slug` | GET | Get article by slug |
| `/api/v1/content-hub/media` | GET | Browse media library |
| `/api/v1/content-hub/themes` | GET | Discover content by themes |
| `/api/v1/content-hub/search` | GET | Full-text search |
| `/api/v1/content-hub/syndicate` | POST | Register syndication |

## Authentication

### For ACT Projects
```http
X-API-Key: ch_act_2026_empathyledger_syndication_key
```

### For Community Members
```http
Authorization: Bearer <supabase_jwt>
```

### Anonymous Access
- Public content only
- No auth headers required

## Database Tables Created

1. **media_ai_analysis** - AI photo/video analysis results
2. **media_person_recognition** - Face recognition (consent-gated)
3. **media_narrative_themes** - Theme extraction
4. **articles** - Blog/article content
5. **content_syndication** - Syndication tracking
6. **article_type_config** - Article type configuration
