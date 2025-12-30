# Database Quick Reference

**Quick access to common database patterns and queries**

## 🔍 Finding Things

### Find All Tables
```bash
cat docs/database/SCHEMA_SUMMARY.md | grep -A 200 "All Tables"
```

### Find Tables by System
```bash
# Storyteller tables
grep -E "profiles|stories|transcripts" docs/database/SCHEMA_SUMMARY.md

# Media tables
grep -E "media|gallery|assets" docs/database/SCHEMA_SUMMARY.md

# Organization tables
grep -E "organization|tenant|member" docs/database/SCHEMA_SUMMARY.md
```

### Find Functions
```bash
grep "CREATE OR REPLACE FUNCTION" supabase/migrations/*.sql | cut -d: -f2 | sort -u
```

### Find Table Definition
```bash
grep -A 50 "CREATE TABLE.*your_table_name" supabase/migrations/*.sql
```

### Find RLS Policies
```bash
grep "CREATE POLICY.*your_table" supabase/migrations/*.sql
```

## 📊 Common Query Patterns

### Get Storyteller with Stories
```sql
SELECT
    p.*,
    COUNT(s.id) as story_count,
    ARRAY_AGG(s.title) as story_titles
FROM profiles p
LEFT JOIN stories s ON s.author_id = p.id
WHERE p.tenant_id = :tenant_id
GROUP BY p.id;
```

### Get Project with Transcripts
```sql
SELECT
    pr.*,
    COUNT(t.id) as transcript_count,
    ARRAY_AGG(DISTINCT t.storyteller_id) as storyteller_ids
FROM projects pr
LEFT JOIN transcripts t ON t.project_id = pr.id
WHERE pr.id = :project_id
GROUP BY pr.id;
```

### Get Media with Usage Stats
```sql
SELECT
    ma.*,
    COUNT(mut.id) as usage_count,
    MAX(mut.accessed_at) as last_accessed
FROM media_assets ma
LEFT JOIN media_usage_tracking mut ON mut.media_asset_id = ma.id
WHERE ma.tenant_id = :tenant_id
GROUP BY ma.id;
```

### Get Organization Analytics
```sql
SELECT
    o.*,
    COUNT(DISTINCT p.id) as storyteller_count,
    COUNT(DISTINCT s.id) as story_count,
    COUNT(DISTINCT t.id) as transcript_count
FROM organizations o
LEFT JOIN profiles p ON p.tenant_id = o.tenant_id
LEFT JOIN stories s ON s.tenant_id = o.tenant_id
LEFT JOIN transcripts t ON t.tenant_id = o.tenant_id
WHERE o.id = :org_id
GROUP BY o.id;
```

## 🔐 Security Patterns

### Standard RLS Policy (Tenant Isolation)
```sql
CREATE POLICY table_tenant_isolation ON table_name
    FOR ALL
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
```

### Public Read, Tenant Write
```sql
CREATE POLICY table_public_read ON table_name
    FOR SELECT USING (true);

CREATE POLICY table_tenant_write ON table_name
    FOR INSERT
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
```

### Owner-Only Access
```sql
CREATE POLICY table_owner_only ON table_name
    FOR ALL
    USING (user_id = auth.uid());
```

### Role-Based Access
```sql
CREATE POLICY table_role_access ON table_name
    FOR ALL
    USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
        AND (auth.jwt() ->> 'role') = 'admin'
    );
```

## 🎯 Common Indexes

### Tenant Queries (Required for almost all tables)
```sql
CREATE INDEX idx_table_tenant_id ON table_name(tenant_id);
```

### Foreign Keys (Recommended)
```sql
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_transcripts_storyteller_id ON transcripts(storyteller_id);
CREATE INDEX idx_media_gallery_id ON media_assets(gallery_id);
```

### Text Search (Full-text)
```sql
CREATE INDEX idx_stories_title_search
    ON stories USING GIN(to_tsvector('english', title));
```

### JSONB Queries
```sql
-- Full document search
CREATE INDEX idx_table_metadata ON table_name USING GIN(metadata);

-- Specific JSON path
CREATE INDEX idx_table_metadata_type
    ON table_name((metadata->>'type'));
```

### Array Queries
```sql
CREATE INDEX idx_table_tags ON table_name USING GIN(tags);
```

### Date Range Queries
```sql
CREATE INDEX idx_table_created_at ON table_name(created_at);
CREATE INDEX idx_table_date_range ON table_name(start_date, end_date);
```

## 🚀 Common Functions

### Get Storyteller Analytics
```sql
SELECT * FROM get_storyteller_analytics(:storyteller_id);
```

### Calculate Project Impact
```sql
SELECT * FROM calculate_project_impact(:project_id);
```

### Generate AI Insights
```sql
SELECT * FROM generate_ai_insights(:content_id);
```

### Check User Permissions
```sql
SELECT check_user_permission(:user_id, :resource_id, :permission_type);
```

## 📈 Analytics Queries

### Top Storytellers by Story Count
```sql
SELECT
    p.id,
    p.display_name,
    COUNT(s.id) as story_count,
    AVG(s.engagement_score) as avg_engagement
FROM profiles p
JOIN stories s ON s.author_id = p.id
WHERE p.tenant_id = :tenant_id
GROUP BY p.id, p.display_name
ORDER BY story_count DESC
LIMIT 10;
```

### Theme Distribution
```sql
SELECT
    theme,
    COUNT(*) as count,
    COUNT(DISTINCT author_id) as storyteller_count
FROM stories s,
     UNNEST(s.themes) as theme
WHERE s.tenant_id = :tenant_id
GROUP BY theme
ORDER BY count DESC;
```

### Content Growth Over Time
```sql
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as story_count,
    COUNT(DISTINCT author_id) as unique_storytellers
FROM stories
WHERE tenant_id = :tenant_id
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;
```

## 🛠️ Maintenance Commands

### Refresh Schema Cache
```sql
NOTIFY pgrst, 'reload schema';
```

### Vacuum Analyze (Performance)
```sql
VACUUM ANALYZE table_name;
```

### Check Table Size
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 🔧 Troubleshooting

### Check RLS Policies
```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'your_table';
```

### Test Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM your_table WHERE your_condition;
-- Look for "Seq Scan" (bad) vs "Index Scan" (good)
```

### Check Foreign Key Constraints
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'your_table';
```

## 📱 Client Usage

### Supabase JavaScript Client
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Query with RLS (automatically filtered by tenant)
const { data, error } = await supabase
  .from('stories')
  .select('*')
  .eq('author_id', authorId)
```

### Server-Side Client
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

const supabase = createSupabaseServerClient()

const { data, error } = await supabase
  .from('profiles')
  .select('*, stories(*)')
  .single()
```

## 🎨 TypeScript Types

### Using Generated Types
```typescript
import { Database } from '@/types/database-generated'

type Story = Database['public']['Tables']['stories']['Row']
type StoryInsert = Database['public']['Tables']['stories']['Insert']
type StoryUpdate = Database['public']['Tables']['stories']['Update']
```

### Custom Types by Domain
```typescript
import { Profile } from '@/types/database/user-profile'
import { Story } from '@/types/database/content-media'
import { MediaAsset } from '@/types/database/content-media'
```

---

**Tip**: Use `/database-navigator` skill for detailed exploration of any system!
