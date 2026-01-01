# Empathy Ledger v2 - Recovery & Rebuild Plan

**Date**: January 2, 2026
**Status**: 🔄 **REBUILDING WITH BEST PRACTICES**
**Goal**: Restore full functionality + Implement proper architecture

---

## WHAT HAPPENED: The Full Story

### Timeline of Events

**December 26, 2025**: "The Big Archive"
- You had TWO separate codebases:
  1. **Empathy Ledger v2** (main codebase) - 53 pages, 250 API routes, full production app
  2. **Empathy Ledger v.02** (campaign system) - Standalone Next.js app with World Tour, 3D visualization

- You decided to **consolidate** by extracting valuable features from v.02 into v2
- Completed **7 integration phases** over 1 day:
  - Phase 1: Campaign documentation (14 files)
  - Phase 2: Advanced analytics (3D Story Galaxy, Community Representatives)
  - Phase 3: Workflow & consent enhancements
  - Phase 4: Campaign management system
  - Phase 5: Notification triggers
  - Phase 6: Story distribution improvements
  - Phase 7: Partner portal sync

**Result of Integration**:
- ✅ New features successfully extracted from v.02
- ✅ v.02 codebase archived to `/archive/empathy-ledger-v02-2025/`
- ❌ **BUT**: The main v2 application (`src/app/`) got cleared during cleanup
- ❌ Only the homepage remained in `src/app/`
- ❌ All 53 pages accidentally moved to archive

**January 1, 2026**: "The Big Commit"
- Commit `b8e64d0` cleaned up documentation, organized skills
- Added 138 files of documentation and skills
- **Did NOT restore the missing pages**
- Codebase now has excellent docs but no working application

### Why This Happened

**Classic Refactoring Risk**:
1. Started extracting features from v.02 → v2
2. Archived v.02 codebase after extraction
3. During cleanup, accidentally archived v2 pages too
4. Focused on documentation organization
5. **Never noticed pages were missing** (because database/docs work continued)

**The Confusion**:
- Database still works (171 tables, all data intact)
- Documentation excellent (75+ guides)
- Skills system complete (15+ specialized skills)
- **But application shell empty** (only homepage)

---

## CURRENT STATE ASSESSMENT

### What We Have ✅

**1. Data (Production-Ready)**
- 171 tables in Supabase
- 251 profiles with real data (98% complete)
- 251 transcripts (analyzed with Claude Sonnet 4.5)
- 310 stories published
- Complete privacy/consent system
- Cultural protocol tracking active

**2. Documentation (World-Class)**
- 75+ guides in `/docs/`
- Complete database architecture docs
- API reference documentation
- Deployment guides
- Skills system fully documented

**3. Components (Archived but Intact)**
- All 53 pages exist in `/archive/empathy-ledger-v02-2025/Empathy Ledger v.02/`
- 250 API endpoints archived
- Complete privacy/ALMA system
- Storyteller dashboard
- Admin panels
- Analytics components

**4. Skills System (Production-Ready)**
- 15 specialized Claude Code skills
- Database workflows
- Design system guardian
- Cultural review
- Deployment automation

### What We're Missing ❌

**1. Application Pages** (Currently: 1 page, Should be: 53 pages)
- `/profile/[id]` - MISSING
- `/dashboard` - MISSING
- `/storytellers/[id]` - MISSING (13 routes)
- `/admin/*` - MISSING (30 routes)

**2. API Routes** (Currently: 0 routes, Should be: 250 routes)
- All endpoints in archive

**3. Component Integration**
- Privacy components exist but not connected
- ALMA UI never built
- Dashboard components not imported

**4. Database Schema Documentation**
- Migration files only have 6 tables
- 165 tables created manually, not documented

---

## RECOVERY STRATEGY: Best Practices Approach

### Phase 1: Assessment & Planning ✅ COMPLETE

**What We Did**:
- [x] Complete application sweep (5 parallel agents)
- [x] Database integrity check
- [x] Foreign key relationship mapping
- [x] Root cause analysis
- [x] Created comprehensive reports

**Deliverables**:
- `/docs/CRITICAL_ISSUES_REPORT.md` (complete findings)
- `/docs/COMPREHENSIVE_ANALYSIS_REPORT.md` (story review + page audit)
- This recovery plan

---

### Phase 2: Foundation Restore (TODAY)

**Goal**: Get basic application working

#### Step 1: Check Archive Structure

Before restoring, verify what we have:

```bash
# Navigate to archive
cd "archive/empathy-ledger-v02-2025/Empathy Ledger v.02"

# Check if src-backup-pre-streamline exists (likely location)
ls -la | grep src

# Check structure
tree -L 2 -d src-backup-pre-streamline/app/ || ls -R src-backup-pre-streamline/app/ | head -50
```

#### Step 2: Restore Core Pages (Selective)

**DON'T** blindly copy everything. **DO** selectively restore with improvements:

**Pages to Restore First** (Priority Order):
1. `/profile/[id]` - Storyteller profiles (highest user impact)
2. `/dashboard` - Storyteller management
3. `/storytellers` - Directory and individual pages
4. `/api/profiles/me` - Core profile API
5. `/api/storytellers/[id]` - Core storyteller API

**Restoration Process** (not just `cp`):
```bash
# 1. CREATE the target directories
mkdir -p src/app/profile/[id]
mkdir -p src/app/dashboard
mkdir -p src/app/storytellers/[id]
mkdir -p src/app/api/profiles/me
mkdir -p src/app/api/storytellers/[id]

# 2. COPY with inspection (one at a time)
# We'll review each file before copying to ensure quality
```

#### Step 3: Modernize As We Restore

**Best Practice**: Don't restore blindly - improve as we go

**For Each Component**:
1. ✅ **Check imports** - Are they still valid?
2. ✅ **Review dependencies** - Are packages still installed?
3. ✅ **Align with design system** - Use Editorial Warmth palette
4. ✅ **Add TypeScript types** - Ensure type safety
5. ✅ **Test locally** - Verify it works before moving on

**Example Restoration Workflow**:
```typescript
// BEFORE (from archive)
import { Button } from '@/components/ui/button'

export default function Profile({ params }) {
  // No types, old design
  return <div>Profile {params.id}</div>
}

// AFTER (restored with improvements)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Properly typed, uses design system
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        Profile {params.id}
      </Card>
    </div>
  )
}
```

---

### Phase 3: Database Schema Export (TODAY)

**Goal**: Document ALL 171 tables properly

#### Step 1: Export Production Schema

```bash
# Full schema dump
npx supabase db dump \
  --db-url "postgresql://postgres.yvnuayzslukamizrlhwb:[password]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" \
  --schema-only \
  > supabase/migrations/20260103000000_production_schema_complete.sql

# Verify export
wc -l supabase/migrations/20260103000000_production_schema_complete.sql
# Should be 10,000+ lines for 171 tables
```

#### Step 2: Split Into Logical Migrations

**Best Practice**: Don't have one massive migration

Split into themed migrations:
1. `20260103000001_core_tables.sql` - tenants, orgs, profiles, stories
2. `20260103000002_storyteller_tables.sql` - transcripts, quotes, themes
3. `20260103000003_media_tables.sql` - media_assets, galleries, photos
4. `20260103000004_consent_gdpr_tables.sql` - consent_change_log, privacy
5. `20260103000005_alma_cultural_tables.sql` - cultural_protocols, elder_review
6. `20260103000006_analytics_tables.sql` - ai_analysis, usage_events
7. `20260103000007_foreign_keys.sql` - ALL foreign key constraints
8. `20260103000008_indexes.sql` - ALL indexes
9. `20260103000009_rls_policies.sql` - Row Level Security
10. `20260103000010_triggers_functions.sql` - Database functions

#### Step 3: Document Relationships

Create visual documentation:
```bash
# Generate ER diagram (using dbdocs or similar)
# Or document manually in docs/database/SCHEMA_MAP.md
```

---

### Phase 4: Build ALMA Settings Component (TODAY)

**Goal**: Create the missing ALMA UI with design system alignment

#### Component Requirements

**Filename**: `src/components/alma/ALMASettings.tsx`

**Features Needed**:
1. Sacred knowledge protection toggle
2. Elder review preferences
3. Notification frequency (daily/weekly/immediate)
4. Cultural protocol preferences (free text)
5. Auto trigger warning toggle
6. Consent tracking visibility

**Design Alignment**:
- Use Editorial Warmth palette (terracotta, sunshine, ink, cream)
- shadcn/ui components (Card, Switch, Select)
- Trauma-informed design (gentle transitions, clear labels)
- Accessibility (ARIA labels, keyboard navigation)

**Database Fields** (verify these exist):
```sql
-- Check profiles table for ALMA fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name ILIKE '%alma%' OR column_name ILIKE '%elder%' OR column_name ILIKE '%cultural%';
```

---

### Phase 5: Privacy Column Migration (TODAY)

**Goal**: Fix the `privacy_level` mismatch

#### Option A: Add Column (Database Change)

**Migration**: `20260103000011_add_privacy_level_column.sql`

```sql
-- Add privacy_level column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_level TEXT
GENERATED ALWAYS AS (
  COALESCE(story_visibility_level, 'public')
) STORED;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_level
ON profiles(privacy_level);

-- Document the column
COMMENT ON COLUMN profiles.privacy_level IS
'Computed column: Derived from story_visibility_level for backward compatibility with frontend queries. Use story_visibility_level for updates.';
```

**Benefit**: No frontend code changes needed
**Drawback**: Adds redundancy (but computed, so no data duplication)

#### Option B: Update Frontend Queries (Code Change)

**Search and Replace**:
```bash
# Find all occurrences
grep -r "privacy_level" src/app src/components | grep -v node_modules

# Replace in all TypeScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\.privacy_level/.story_visibility_level/g' {} +

# Verify changes
git diff src/
```

**Benefit**: Uses actual database structure
**Drawback**: Requires code changes across many files

**Recommendation**: **Option A** (add computed column) - safer, no breaking changes

---

### Phase 6: Component Quality Audit (TOMORROW)

**Goal**: Ensure all restored components follow best practices

#### Quality Checklist

For each restored component:

**1. TypeScript Compliance**
- [ ] All props have interfaces
- [ ] No `any` types
- [ ] Function signatures complete
- [ ] Return types explicit

**2. Design System Alignment**
- [ ] Uses Editorial Warmth colors (terracotta, sunshine, ink, cream, stone)
- [ ] shadcn/ui components where applicable
- [ ] Consistent spacing (Tailwind scale)
- [ ] Mobile-first responsive design

**3. Accessibility (WCAG 2.1 AA)**
- [ ] All images have alt text
- [ ] Buttons have accessible labels
- [ ] Form inputs have labels/ARIA
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Heading hierarchy correct (h1 → h2 → h3)

**4. Performance**
- [ ] Images lazy-loaded
- [ ] Code-split appropriately (dynamic imports for heavy components)
- [ ] No unnecessary re-renders (React.memo where needed)
- [ ] Database queries optimized (select only needed fields)

**5. Cultural Sensitivity**
- [ ] No extraction language ("harvest", "collect")
- [ ] No savior language ("empower", "give voice")
- [ ] Strength-based framing
- [ ] OCAP principles respected

**6. Security**
- [ ] RLS policies enforced
- [ ] Tenant isolation verified
- [ ] No SQL injection risks
- [ ] Consent verified before data access

#### Audit Tool

Create automated checker:
```bash
# Component quality checker script
./scripts/audit-component-quality.sh src/app/profile
```

---

### Phase 7: Integration Testing (TOMORROW)

**Goal**: Verify everything works together

#### Test Scenarios

**1. User Flow: View Profile**
```
1. Visit /storytellers/[id]
2. Verify profile image loads
3. Verify display name shows
4. Verify bio displays
5. Verify story count accurate
6. Verify privacy indicator shows
```

**2. User Flow: Manage Stories**
```
1. Login as storyteller
2. Visit /dashboard
3. See stories list
4. Click Edit on story
5. Update privacy settings
6. Save successfully
7. Verify changes persist
```

**3. User Flow: Privacy Settings**
```
1. Visit /dashboard
2. Open Privacy tab
3. Toggle "Allow AI analysis"
4. Verify consent_change_log entry created
5. Verify UI updates immediately
```

**4. User Flow: ALMA Settings**
```
1. Visit /dashboard
2. Open ALMA tab
3. Toggle "Sacred knowledge protection"
4. Set notification frequency to "Weekly"
5. Add cultural protocol note
6. Save successfully
7. Verify database updates
```

#### Automated Tests

Create E2E tests with Playwright:
```typescript
// tests/e2e/storyteller-dashboard.spec.ts
import { test, expect } from '@playwright/test'

test('storyteller can access dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
  await expect(page.locator('.my-stories')).toBeVisible()
  await expect(page.locator('.privacy-settings')).toBeVisible()
  await expect(page.locator('.alma-settings')).toBeVisible()
})

test('storyteller can update privacy settings', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Privacy')
  await page.click('text=Allow AI analysis')
  await page.click('text=Save')
  await expect(page.locator('text=Saved successfully')).toBeVisible()
})
```

---

### Phase 8: Documentation Update (WEEK 1)

**Goal**: Keep docs in sync with restored code

#### Updates Needed

**1. Update Architecture Docs**
```
/docs/database/architecture.md
- Add section: "Recent Recovery (Jan 2026)"
- Document schema export process
- Explain privacy_level computed column
```

**2. Create Developer Onboarding Guide**
```
/docs/DEVELOPER_ONBOARDING.md
- How to set up local environment
- How to restore from archive (if needed again)
- How to verify database schema matches code
- How to run quality audits
```

**3. Update Component README**
```
/docs/COMPONENT_LIBRARY.md
- Document all restored components
- Show design system usage examples
- List ALMA Settings API
```

**4. Create Recovery Postmortem**
```
/docs/POSTMORTEM_JAN_2026_RECOVERY.md
- What happened
- Why it happened
- How we recovered
- Safeguards to prevent recurrence
```

---

## BEST PRACTICES FRAMEWORK

### 1. Version Control Strategy

**Branch Naming**:
```
main - Production-ready code
develop - Integration branch
feature/restore-profiles - Feature branches
hotfix/privacy-column - Emergency fixes
```

**Commit Messages** (Conventional Commits):
```
feat: restore storyteller profile pages from archive
fix: add privacy_level computed column to profiles table
docs: update architecture to reflect schema export
refactor: align ALMA component with design system
test: add E2E tests for dashboard functionality
```

**Before Any Major Change**:
```bash
# Create feature branch
git checkout -b feature/restore-dashboard

# Make changes
# ...

# Commit with context
git add .
git commit -m "feat: restore storyteller dashboard with privacy/ALMA settings

- Restored from archive/empathy-ledger-v02-2025
- Aligned with Editorial Warmth design system
- Added TypeScript interfaces
- Integrated PrivacySettings and ALMASettings components
- Added E2E tests for dashboard flows

Refs: #RECOVERY-2026, docs/CRITICAL_ISSUES_REPORT.md"

# Push and create PR
git push -u origin feature/restore-dashboard
```

### 2. Code Review Checklist

Before merging any restored component:

**Reviewer Checklist**:
- [ ] Code compiles without errors
- [ ] All TypeScript types defined
- [ ] Design system colors used (no hardcoded hex)
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader friendly
- [ ] Mobile responsive (test 375px, 768px, 1920px)
- [ ] Database queries use proper types
- [ ] RLS policies enforced
- [ ] Cultural sensitivity (no problematic language)
- [ ] Tests pass
- [ ] Documentation updated

### 3. Component Development Standards

**Template for New/Restored Components**:

```typescript
/**
 * ComponentName
 *
 * Purpose: [Brief description]
 * Used in: [Which pages use this]
 * Cultural considerations: [OCAP, ALMA, consent]
 * Accessibility: [WCAG compliance notes]
 *
 * @example
 * <ComponentName prop1="value" />
 */

'use client' // Only if needed for interactivity

import { type ComponentProps } from 'react'
import { Card } from '@/components/ui/card'

interface ComponentNameProps {
  /** Description of prop */
  prop1: string
  /** Optional prop with default */
  prop2?: boolean
}

export function ComponentName({
  prop1,
  prop2 = false
}: ComponentNameProps) {
  return (
    <Card className="p-4">
      {/* Component JSX */}
    </Card>
  )
}

// Export types for reuse
export type { ComponentNameProps }
```

### 4. Database Schema Management

**Migration Workflow**:

```bash
# 1. Create migration
npx supabase migration new descriptive_name

# 2. Write SQL
vim supabase/migrations/[timestamp]_descriptive_name.sql

# 3. Test locally
npx supabase db reset
npx supabase start

# 4. Verify migration
npx supabase db diff

# 5. Deploy to production (only after review)
npx supabase db push
```

**Migration Template**:
```sql
-- Migration: [Purpose]
-- Date: [YYYY-MM-DD]
-- Author: [Name]
-- Refs: [Related issues/docs]

-- =============================================================================
-- Description
-- =============================================================================
--
-- This migration does X, Y, Z for the following reasons...
--
-- =============================================================================
-- Tables Affected
-- =============================================================================
--
-- - profiles (ADD privacy_level column)
-- - consent_change_log (CREATE table)
--
-- =============================================================================
-- Backward Compatibility
-- =============================================================================
--
-- This migration is BACKWARD COMPATIBLE because:
-- - New column has default value
-- - Existing queries unaffected
--
-- =============================================================================

BEGIN;

-- Your migration SQL here
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_level TEXT
GENERATED ALWAYS AS (COALESCE(story_visibility_level, 'public')) STORED;

COMMIT;

-- =============================================================================
-- Verification Queries
-- =============================================================================
--
-- Run these to verify migration succeeded:
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'privacy_level';
--
```

### 5. Testing Strategy

**Test Pyramid**:
```
      /\
     /E2E\         (Few) - Complete user flows
    /------\
   /  API   \      (Some) - API endpoint tests
  /----------\
 / Component  \    (Many) - Component unit tests
/--------------\
```

**Example Test Suite**:

```typescript
// components/alma/ALMASettings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ALMASettings } from './ALMASettings'

describe('ALMASettings', () => {
  it('renders all toggle controls', () => {
    render(<ALMASettings storytellerId="test-id" />)

    expect(screen.getByText('Sacred knowledge protection')).toBeInTheDocument()
    expect(screen.getByText('Elder review preferences')).toBeInTheDocument()
    expect(screen.getByText('Notification frequency')).toBeInTheDocument()
  })

  it('saves settings when toggle clicked', async () => {
    const mockSave = jest.fn()
    render(<ALMASettings storytellerId="test-id" onSave={mockSave} />)

    const toggle = screen.getByLabelText('Sacred knowledge protection')
    fireEvent.click(toggle)

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        sacred_knowledge_protection: true
      })
    })
  })
})
```

---

## RISK MITIGATION

### Safeguards to Prevent Future Issues

**1. Automated Backups**

```bash
# Add to .github/workflows/backup.yml
name: Daily Database Backup

on:
  schedule:
    - cron: '0 2 * * *' # 2 AM daily

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Supabase
        run: |
          npx supabase db dump --data-only > backup-$(date +%Y%m%d).sql
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v1
        # ...upload logic
```

**2. Pre-Deploy Checklist**

```markdown
## Deployment Checklist

Before deploying:
- [ ] All tests pass (`npm test`)
- [ ] Database migrations tested locally
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No console errors in development
- [ ] Mobile responsive verified
- [ ] Accessibility audit passed
- [ ] Privacy/ALMA functionality verified
- [ ] RLS policies enforced
- [ ] Backup created
- [ ] Rollback plan documented
```

**3. Monitoring & Alerts**

```typescript
// Add to monitoring
export function pageHealthCheck() {
  const criticalPages = [
    '/profile/[id]',
    '/dashboard',
    '/storytellers/[id]'
  ]

  criticalPages.forEach(async (page) => {
    const response = await fetch(page)
    if (response.status !== 200) {
      alertTeam(`Page ${page} is down!`)
    }
  })
}
```

---

## TIMELINE

### Today (January 2, 2026)

**Morning**:
- [x] Complete analysis (DONE)
- [ ] Export database schema
- [ ] Restore core pages (/profile, /dashboard)
- [ ] Add privacy_level computed column

**Afternoon**:
- [ ] Build ALMA Settings component
- [ ] Integrate privacy components
- [ ] Basic smoke tests

**Evening**:
- [ ] Document recovery process
- [ ] Create developer onboarding guide

### Tomorrow (January 3)

**Morning**:
- [ ] Component quality audit
- [ ] Design system alignment
- [ ] Accessibility review

**Afternoon**:
- [ ] Integration testing
- [ ] E2E test creation
- [ ] Fix any discovered issues

### Week 1 (January 6-10)

- [ ] Restore all 53 pages (gradually, with review)
- [ ] Restore all 250 API endpoints
- [ ] Complete test coverage
- [ ] Documentation updates
- [ ] Deploy to staging

### Week 2 (January 13-17)

- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] Post-deployment monitoring

---

## SUCCESS METRICS

**How We'll Know We've Succeeded**:

1. ✅ **Functionality Restored**
   - All 53 pages accessible
   - All 250 API endpoints working
   - Zero broken links
   - Database queries performant

2. ✅ **Quality Improved**
   - 100% TypeScript coverage
   - Design system aligned
   - WCAG 2.1 AA compliant
   - 90+ Lighthouse score

3. ✅ **Documentation Complete**
   - All components documented
   - Database schema fully mapped
   - Developer onboarding guide ready
   - Recovery process documented

4. ✅ **Safeguards in Place**
   - Automated backups running
   - Pre-deploy checklist enforced
   - Monitoring active
   - Test coverage >80%

---

**Next Steps**: Let's start with Phase 2, Step 1 - checking the archive structure and planning the selective restoration.

**Ready to proceed?** I'll guide you through each restoration step with review and best practice implementation.
