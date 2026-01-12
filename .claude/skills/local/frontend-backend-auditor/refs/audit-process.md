# Audit Process Reference

## Phase 1: Component Inventory

```bash
# Find all TSX files
find src/ -name "*.tsx" -type f

# Scan for database access patterns
for file in $(find src/ -name "*.tsx"); do
  echo "=== $file ==="
  grep -n "fetch.*\/api\/" "$file" || echo "No API calls"
  grep -n "supabase\.from" "$file" || echo "No direct queries"
  grep -n "from('profiles')" "$file" && echo "⚠️ USES PROFILES TABLE"
  grep -n "from('analysis_jobs')" "$file" && echo "⚠️ USES OLD ANALYSIS"
done > component-audit.txt
```

## Phase 2: API Endpoint Validation

For each API route, verify:
1. Tables queried match current schema
2. JOIN relationships use correct FKs
3. No references to deprecated columns
4. Response format matches TypeScript types

## Phase 3: AI Analysis Pattern Review

### Current AI Architecture
```
User Uploads Transcript
    ↓
transcripts table
    ↓
AI Analysis Job (Inngest/background)
    ↓
transcript_analysis_results
  - analysis_version: 'v2' (current)
  - themes_extracted: jsonb
  - quotes_extracted: jsonb
    ↓
Extracted to normalized tables:
  - narrative_themes
  - extracted_quotes
  - stories (synthesized)
    ↓
Frontend displays current analysis
```

## Phase 4: Type Safety Verification

```bash
# Regenerate types
npm run types:generate

# Check for type drift
git diff src/types/database/
```

## Automated Audit Script

```bash
#!/bin/bash
echo "=== Frontend-Backend Alignment Audit ==="

# Count components
find src/ -name "*.tsx" | wc -l
echo " components found"

# Deprecated table usage
grep -r "from('profiles')" src/ --include="*.tsx" --include="*.ts" | wc -l
echo " references to profiles table (should use storytellers)"

grep -r "from('analysis_jobs')" src/ --include="*.tsx" --include="*.ts" | wc -l
echo " references to analysis_jobs (should use transcript_analysis_results)"

# Deprecated columns
grep -r "legacy_" src/ --include="*.tsx" --include="*.ts" | wc -l
echo " references to legacy columns"

# Type sync check
if git diff --quiet src/types/database/; then
  echo "✅ Types in sync with schema"
else
  echo "⚠️ Types out of sync - run npm run types:generate"
fi
```

## Success Criteria

- ✅ All components use current tables
- ✅ No references to deprecated AI analysis
- ✅ TypeScript types match schema
- ✅ API endpoints use correct relationships
- ✅ No legacy columns in queries
- ✅ Alignment Score >95%
