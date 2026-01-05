# Sprint 2 Features - Quick Reference

## Story Creation API

### Basic Story
```bash
curl -X POST http://localhost:3030/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Story",
    "content": "Story content here...",
    "storyteller_id": "user-id",
    "tenant_id": "tenant-id"
  }'
```

### Full Sprint 2 Story
```bash
curl -X POST http://localhost:3030/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Community Gathering",
    "content": "A story about our community gathering...",
    "excerpt": "Short summary",
    "storyteller_id": "user-id",
    "tenant_id": "tenant-id",
    "story_type": "text",
    "location": "Traditional Territory",
    "tags": ["community", "gathering"],
    "cultural_sensitivity_level": "standard",
    "requires_elder_review": false,
    "privacy_level": "public",
    "is_public": true,
    "enable_ai_processing": true,
    "notify_community": true,
    "language": "en",
    "has_explicit_consent": true
  }'
```

### Sacred Story (Auto-Protected)
```bash
curl -X POST http://localhost:3030/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sacred Teaching",
    "content": "Sacred knowledge...",
    "storyteller_id": "user-id",
    "tenant_id": "tenant-id",
    "cultural_sensitivity_level": "sacred"
  }'

# Automatically sets:
# - requires_elder_review = true
# - enable_ai_processing = false
```

## Cultural Sensitivity Levels

| Level | Use Case | Auto-Actions |
|-------|----------|--------------|
| `standard` | General community stories | None |
| `sensitive` | Requires cultural awareness | None |
| `sacred` | Sacred teachings/ceremonies | Requires Elder review, disables AI |
| `restricted` | Limited access needed | None |

## Auto-Calculated Fields

### Word Count
- Automatically calculated from `content`
- Formula: Count words separated by whitespace
- Trigger: `calculate_story_metrics_trigger`

### Reading Time
- Automatically calculated from word count
- Formula: `CEIL(word_count / 200)` minutes
- Trigger: `calculate_story_metrics_trigger`

## Elder Review Workflow

### 1. Create Story Requiring Review
```json
{
  "cultural_sensitivity_level": "sacred",
  // Auto-sets requires_elder_review = true
}
```

### 2. Story Status
- `status`: 'draft'
- `requires_elder_review`: true
- `elder_reviewed`: false
- Cannot publish until reviewed

### 3. Elder Approves (Admin/Elder Only)
```sql
UPDATE stories SET
  elder_reviewed = true,
  elder_reviewer_id = 'elder-user-id',
  elder_review_notes = 'Approved for community sharing',
  elder_review_date = NOW()
WHERE id = 'story-id';
```

### 4. Publish
```bash
POST /api/stories/{id}/publish
```

## Media Assets

### Update Metadata
```bash
curl -X PUT http://localhost:3030/api/media/{media-id}/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Traditional dance ceremony",
    "cultural_tags": ["dance", "ceremony", "traditional"],
    "culturally_sensitive": true,
    "requires_attribution": true,
    "attribution_text": "Photo by Elder Name"
  }'
```

### Alt Text Requirement
```json
{
  "media_type": "image",
  "alt_text": "Required for accessibility"
  // Missing alt_text will cause error
}
```

## Testing

### Database Direct
```bash
export PGPASSWORD=kedxah-qaxsap-jUhwo5
psql -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "SELECT title, word_count, reading_time FROM stories ORDER BY created_at DESC LIMIT 5;"
```

### API Test
```bash
./test-story-api-final.sh
```

### Check Audit Logs
```sql
SELECT entity_type, action, entity_id, created_at
FROM audit_logs
WHERE entity_type = 'story'
ORDER BY created_at DESC
LIMIT 10;
```

## Common Patterns

### Standard Community Story
```json
{
  "cultural_sensitivity_level": "standard",
  "privacy_level": "community",
  "is_public": false,
  "enable_ai_processing": true
}
```

### Public Sharing Story
```json
{
  "cultural_sensitivity_level": "standard",
  "privacy_level": "public",
  "is_public": true,
  "notify_community": true
}
```

### Private Draft
```json
{
  "privacy_level": "private",
  "is_public": false,
  "status": "draft"
}
```

## Troubleshooting

### Story Won't Publish
- Check: `requires_elder_review` and `elder_reviewed`
- If `requires_elder_review = true`, must have `elder_reviewed = true`

### Word Count = 0
- Check: `content` field has text
- Trigger runs on INSERT and UPDATE of content

### Alt Text Error
- All images MUST have `alt_text`
- Required for WCAG 2.1 AA accessibility

### RLS Error
- API uses service client (bypasses RLS)
- Direct database operations require proper auth context

## File Locations

- API Routes: `src/app/api/stories/`
- Dashboard: `src/app/storytellers/[id]/dashboard/page.tsx`
- Database Types: `src/types/supabase-generated.ts`
- Migrations: `supabase/migrations/`
- Tests: `test-story-api-final.sh`, `test-direct-insert.sql`
