# Data Integrity Guardian

**Purpose:** Maintain database quality, ensure mission alignment, and prepare stories for JusticeHub API syndication

---

## Quick Start

### Before JusticeHub Launch

1. **Run Full Audit:**
```bash
cd /Users/benknight/Code/empathy-ledger-v2
psql -f .claude/skills/local/data-integrity-guardian/checks/full-audit.sql
```

2. **Fix Any Issues:**
```bash
psql -f .claude/skills/local/data-integrity-guardian/fixes/automated-cleanup.sql
```

3. **Add JusticeHub Feature:**
```bash
psql -f .claude/skills/local/data-integrity-guardian/migrations/add-justicehub-featured.sql
```

4. **Select Featured Stories:**
```sql
-- Flag your best stories for JusticeHub homepage
UPDATE stories
SET justicehub_featured = true
WHERE id IN ('story-uuid-1', 'story-uuid-2', ...);
```

---

## Files

### `/migrations/`
- `add-justicehub-featured.sql` - Adds justicehub_featured field with validation

### `/checks/`
- `full-audit.sql` - Complete data integrity audit

### `/fixes/`
- `automated-cleanup.sql` - Safe automated fixes

---

## Critical Checks

### Relationship Integrity
- ✅ No orphaned stories (stories without storytellers)
- ✅ No orphaned storytellers (storytellers without profiles)
- ✅ All transcript references valid

### Data Completeness
- ✅ All published stories have: title, content, storyteller, excerpt, themes
- ✅ 85%+ storytellers have avatars
- ✅ All stories have word count and reading time

### Cultural Safety
- ✅ Stories requiring elder review are reviewed before publication
- ✅ Traditional knowledge properly protected
- ✅ Cultural sensitivity flags respected

### Consent & OCAP
- ✅ 100% of public stories have explicit consent
- ✅ Syndication consent tracked for all syndicated stories
- ✅ Storyteller control maintained (OCAP principles)

### JusticeHub Readiness
- ✅ Stories have all required fields
- ✅ Cultural safety approved
- ✅ Syndication consent obtained
- ✅ Quality standards met

---

## Mission Alignment

Every check enforces Empathy Ledger core values:

**OCAP (Ownership, Control, Access, Possession)**
- Storytellers own their stories
- Explicit consent required
- Withdrawal rights respected

**Cultural Safety**
- Elder review process
- Traditional knowledge protection
- Cultural sensitivity protocols

**Storyteller Empowerment**
- Full control over content
- Transparent syndication
- Revenue sharing tracked

---

## Usage

### Weekly Maintenance
```bash
# Check health
psql -f checks/full-audit.sql

# Fix issues
psql -f fixes/automated-cleanup.sql
```

### Before Major Releases
```bash
# Full audit
psql -f checks/full-audit.sql > audit-$(date +%Y%m%d).txt

# Review results
cat audit-$(date +%Y%m%d).txt
```

### For JusticeHub Integration
```bash
# 1. Audit
psql -f checks/full-audit.sql

# 2. Add feature
psql -f migrations/add-justicehub-featured.sql

# 3. Query ready stories
psql -c "
SELECT id, title, excerpt
FROM stories
WHERE status = 'published'
  AND is_public = true
  AND syndication_enabled = true
  AND has_explicit_consent = true
  AND (requires_elder_review = false OR elder_reviewed = true)
ORDER BY created_at DESC
LIMIT 20;
"

# 4. Feature best stories
psql -c "UPDATE stories SET justicehub_featured = true WHERE id = 'uuid';"
```

---

## Expected Results

### Full Audit Should Show:
```
✅ 0 orphaned stories
✅ 0 orphaned storytellers
✅ 0 missing essential fields
✅ 85%+ avatar coverage
✅ 100% OCAP compliance
✅ 100% cultural safety compliance
✅ N stories ready for JusticeHub
```

### Quality Metrics:
```
✅ Average word count > 200
✅ Average themes per story > 2
✅ Less than 5% stories too short
✅ Diverse theme representation
```

---

## Database Connection

```bash
# Use alias
alias eldb='PGDATABASE=postgres PGHOST=aws-1-ap-southeast-2.pooler.supabase.com PGPORT=6543 PGUSER=postgres.yvnuayzslukamizrlhwb PGPASSWORD=kedxah-qaxsap-jUhwo5 psql'

# Run checks
eldb -f checks/full-audit.sql
```

---

## When to Use

**CRITICAL - Must use before:**
- Launching JusticeHub API integration
- Making stories public
- Bulk data migrations
- Schema changes affecting relationships

**Regular - Weekly/Monthly:**
- Data quality audits
- Consent verification
- Avatar coverage checks
- Theme diversity analysis

**On-Demand:**
- User reports data issues
- Preparing for external sharing
- After large imports
- Before major releases

---

## Integration with Other Skills

- **database-navigator** - Understanding schema
- **supabase-deployment** - Running migrations
- **cultural-review** - Cultural safety validation
- **gdpr-compliance** - Consent management

---

## Documentation

- **Complete Overview:** `docs/04-database/SUPABASE_COMPLETE_OVERVIEW.md`
- **Alignment Report:** `docs/04-database/TABLE_ALIGNMENT_REPORT.md`
- **Migration Log:** `STORYTELLERS_DATA_REFRESH_COMPLETE.md`

---

## Support

For issues or questions:
1. Check audit results
2. Review skill.md for detailed checks
3. Run automated-cleanup.sql
4. If problems persist, manual investigation needed
