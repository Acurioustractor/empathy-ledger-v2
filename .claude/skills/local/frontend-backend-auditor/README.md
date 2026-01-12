# Frontend-Backend Alignment Auditor

**Purpose:** Ensure frontend components use current database schema and AI analysis systems

---

## Quick Start

```bash
cd /Users/benknight/Code/empathy-ledger-v2
bash .claude/skills/local/frontend-backend-auditor/scripts/audit.sh
```

This will:
1. Scan all components for database access patterns
2. Identify deprecated table/column usage
3. Check AI analysis system alignment
4. Generate detailed report with recommendations
5. Calculate alignment score

---

## What It Checks

### ✅ Current Patterns (Good)
- `from('storytellers')` - Uses current storytellers table
- `from('transcript_analysis_results')` - Current AI analysis
- `from('narrative_themes')` - Current theme system
- `cultural_themes[]` - Array-based theme filtering

### ❌ Deprecated Patterns (Bad)
- `from('profiles')` for storyteller data - Should use `storytellers`
- `from('analysis_jobs')` - Should use `transcript_analysis_results`
- `from('ai_analysis_jobs')` - Obsolete AI system
- `legacy_*` columns - Migration artifacts
- Old `.themes` jsonb - Use `cultural_themes[]` instead

---

## Critical Issues It Finds

1. **Outdated Storyteller Queries**
   - Components querying `profiles` instead of `storytellers`
   - Shows outdated data to users

2. **Old AI Analysis Usage**
   - Using deprecated `analysis_jobs` table
   - Displays stale AI summaries and themes

3. **Deprecated Columns**
   - References to `legacy_*` fields
   - Airtable migration artifacts

4. **Type Mismatches**
   - TypeScript types out of sync with database

---

## Report Format

```markdown
# Frontend-Backend Alignment Report

## Summary
- Alignment Score: 92%
- Total Issues: 8
- Components Affected: 12

## Critical Issues

### 1. ProfileCard.tsx - Uses Deprecated Profile Table
Location: src/components/profile/ProfileCard.tsx:45
Issue: Direct query to profiles for storyteller data
Recommended Fix: Use storytellers table

### 2. AnalysisDashboard.tsx - Old Analysis System
Location: src/app/admin/analysis/AnalysisDashboard.tsx:112
Issue: Queries analysis_jobs instead of transcript_analysis_results
Impact: HIGH - Shows outdated AI analysis

## Recommendations
1. Update ProfileCard to use storytellers table
2. Migrate AnalysisDashboard to current AI system
3. Remove legacy column references
```

---

## Usage Scenarios

### Before Major Releases
```bash
# Run full audit
bash scripts/audit.sh > pre-release-audit.txt

# Review issues
cat pre-release-audit.txt

# Fix high-priority issues
# Re-run audit
bash scripts/audit.sh
```

### After Database Migrations
```bash
# Check what broke
bash scripts/audit.sh

# Update affected components
# Verify types are synced
npm run types:generate
```

### Weekly Maintenance
```bash
# Quick health check
bash scripts/audit.sh | grep "Alignment Score"
```

---

## Integration with Other Skills

- **data-integrity-guardian** - Database quality checks
- **database-navigator** - Schema understanding
- **cultural-review** - AI analysis validation

---

## Files

```
frontend-backend-auditor/
├── skill.md          - Complete documentation
├── README.md         - This file
└── scripts/
    └── audit.sh      - Automated audit script
```

---

## Expected Results

### Good Alignment (>95%)
```
Alignment Score: 97%
Total Issues: 2
✅ No critical issues
```

### Needs Work (<90%)
```
Alignment Score: 78%
Total Issues: 15
⚠️ HIGH PRIORITY: Update AI analysis queries
⚠️ MEDIUM: Migrate profile queries to storytellers
```

---

## Quick Fixes

### Replace Deprecated Profiles Query
```typescript
// ❌ OLD
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('is_storyteller', true)

// ✅ NEW
const { data } = await supabase
  .from('storytellers')
  .select('*')
  .eq('is_active', true)
```

### Replace Old AI Analysis
```typescript
// ❌ OLD
const { data } = await supabase
  .from('analysis_jobs')
  .select('*')

// ✅ NEW
const { data } = await supabase
  .from('transcript_analysis_results')
  .select('*')
  .eq('analysis_version', 'v2')
  .order('created_at', { ascending: false })
```

### Use Current Theme System
```typescript
// ❌ OLD
const { data } = await supabase
  .from('stories')
  .select('themes')  // JSONB blob

// ✅ NEW
const { data } = await supabase
  .from('stories')
  .select('cultural_themes')  // Text array
  .contains('cultural_themes', ['healing'])
```

---

## CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Frontend-Backend Alignment Check
  run: bash .claude/skills/local/frontend-backend-auditor/scripts/audit.sh
```

This will fail the build if alignment score <90%.

---

## Support

For issues:
1. Run audit script
2. Review generated report
3. Check skill.md for detailed patterns
4. Consult database-navigator for current schema
