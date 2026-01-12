# Deprecated Patterns Reference

## Tables to Avoid

### Use `storytellers` instead of `profiles` for storyteller data
```typescript
// ❌ OUTDATED
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('is_storyteller', true)

// ✅ CURRENT
const { data } = await supabase
  .from('storytellers')
  .select('*')
  .eq('is_active', true)
```

### Use `transcript_analysis_results` instead of `analysis_jobs`
```typescript
// ❌ OUTDATED
const { data } = await supabase
  .from('analysis_jobs')
  .select('*')

// ✅ CURRENT
const { data } = await supabase
  .from('transcript_analysis_results')
  .select('*')
  .eq('analysis_version', 'v2')
  .order('created_at', { ascending: false })
```

## Deprecated Columns

### Stories Table
```sql
-- DEPRECATED (don't use)
stories.legacy_story_id
stories.legacy_storyteller_id
stories.legacy_airtable_id
stories.legacy_fellow_id
stories.legacy_author

-- CURRENT (use these)
stories.id
stories.storyteller_id  -- FK to storytellers table
stories.cultural_themes[]
stories.transcript_id
```

## Current AI Systems (Use These)
- `transcript_analysis_results` - Latest AI analysis with versioning
- `narrative_themes` - AI-extracted themes (current model)
- `story_themes` - Junction table (normalized)
- `stories.cultural_themes[]` - Array for filtering
- `knowledge_chunks` - RAG vector embeddings

## Deprecated AI Systems (Archive)
- Old `analysis_jobs` without version tracking
- Stale `ai_analysis_jobs` results
- Obsolete theme extractions (pre-consolidation)
- Cached summaries from old models
- Unversioned AI outputs

## Theme System Current Patterns

```typescript
// ❌ OLD - Direct theme query without structure
const { data } = await supabase
  .from('stories')
  .select('themes')  // Was JSONB blob

// ✅ NEW - Structured theme access
const { data } = await supabase
  .from('stories')
  .select(`
    cultural_themes,
    story_themes!inner(
      theme:narrative_themes(
        theme_name,
        theme_category,
        confidence_score
      )
    )
  `)
```

## Grep Commands to Find Issues
```bash
# Find deprecated table usage
grep -r "from('profiles')" src/ --include="*.tsx" --include="*.ts"
grep -r "from('analysis_jobs')" src/ --include="*.tsx" --include="*.ts"

# Find deprecated columns
grep -r "legacy_" src/ --include="*.tsx" --include="*.ts"
grep -r "airtable_record_id" src/
grep -r "fellow_id" src/
```
