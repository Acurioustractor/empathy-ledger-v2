# Empathy Ledger v2 - Development Workflow Guide

**Last Updated:** January 6, 2026
**Purpose:** Recommended workflows for common development tasks using Claude Code skills

---

## Table of Contents
- [Skill Index](#skill-index)
- [Feature Development Workflow](#feature-development-workflow)
- [Database Management Workflow](#database-management-workflow)
- [Content Management Workflow](#content-management-workflow)
- [Deployment Workflow](#deployment-workflow)
- [Code Review Workflow](#code-review-workflow)
- [Onboarding Workflow](#onboarding-workflow)

---

## Skill Index

All skills follow lean architecture: ~60-100 lines max, with detailed content in `refs/` subdirectories.

### Core Development (Optimized)
| Skill | Purpose | Lines |
|-------|---------|-------|
| `empathy-ledger-codebase` | Codebase patterns & architecture | ~60 |
| `design-system-guardian` | Design token enforcement | ~61 |
| `design-component` | UI component patterns | ~73 |
| `data-analysis` | Theme/quote analysis patterns | ~67 |
| `supabase-connection` | Database clients & migrations | ~54 |
| `database-navigator` | Schema exploration & queries | ~60 |

### Compliance & Review
| Skill | Purpose | Status |
|-------|---------|--------|
| `cultural-review` | OCAP principles, cultural safety | MANDATORY |
| `gdpr-compliance` | Data protection compliance | As-needed |
| `data-integrity-guardian` | Data quality checks | As-needed |
| `frontend-backend-auditor` | API contract validation | As-needed |

### Deployment & Ops
| Skill | Purpose |
|-------|---------|
| `local-deployment` | ACT Ecosystem (all 6 sites) |
| `local-dev-server` | PM2 setup, port 3030 |
| `deployment-workflow` | Production deployment |
| `supabase-deployment` | Database deployment |
| `sprint-tracker` | Sprint status tracking |

### Content & Features
| Skill | Purpose |
|-------|---------|
| `story-craft` | Story quality standards |
| `analytics-dashboard-dev` | Dashboard development |
| `api-integration-webhooks` | External integrations |
| `empathy-ledger-mission` | Mission & values context |

### Skill Structure
```
skills/local/
├── [skill-name]/
│   ├── skill.md          # Lean (<100 lines) - "map" to references
│   └── refs/             # Detailed reference files
│       ├── patterns.md
│       ├── queries.md
│       └── ...
└── _archived/            # Legacy files
```

---

## Feature Development Workflow

### 1. Start New Feature

**Say to Claude:**
> "I need to build [feature description]. Help me understand the codebase architecture for this."

**What Happens:**
- Claude invokes `empathy-ledger-dev` (quick orientation)
- Claude invokes `empathy-ledger-codebase` (best practices)
- Claude invokes `codebase-explorer` (architecture understanding)

### 2. Design UI Components

**Say to Claude:**
> "Design a [component name] following Empathy Ledger design system"

**What Happens:**
- Claude invokes `design-component` skill
- Applies Editorial Warmth color palette (clay, sage, sky, ember)
- Ensures accessibility (WCAG 2.1 AA)
- Provides cultural sensitivity guidance

**Key Principles:**
- Use `clay` colors for Indigenous/cultural elements
- Use `sage` for supportive, growth themes
- Use `sky` for trust, transparency
- Use `ember` for calls to action, warmth

### 3. Work with Database

**Say to Claude:**
> "I need to query/update the [table name] table"

**What Happens:**
- Claude invokes `supabase` skill (schema understanding)
- Provides multi-tenant query patterns
- Shows RLS policy requirements

**For Schema Changes:**
> "Create a migration to [describe change]"

**What Happens:**
- Claude invokes `supabase-sql-manager` skill
- Creates idempotent migration
- Provides testing instructions

### 4. Handle Storyteller Content (CRITICAL)

**Before ANY storyteller-facing feature:**

**Say to Claude:**
> "Review this feature for cultural sensitivity"

**What Happens:**
- Claude **MUST** invoke `cultural-review` skill
- Checks OCAP principles (Ownership, Control, Access, Possession)
- Verifies privacy levels (public/community/private/restricted)
- Ensures Elder review workflow
- Validates sacred content protection

**CRITICAL:** This is non-negotiable for Indigenous data sovereignty.

### 5. Before Committing

**Checklist:**
- [ ] TypeScript builds without errors
- [ ] No ESLint warnings
- [ ] Database migrations tested locally
- [ ] Cultural review completed (if storyteller-facing)
- [ ] Design system compliance verified (if UI changes)
- [ ] GDPR compliance reviewed (if data handling)

---

## Database Management Workflow

### Understanding Database Schema

**Say to Claude:**
> "Show me the database schema for [domain area]"

**Skills Invoked:**
- `codebase-explorer` - High-level architecture
- `supabase` - Detailed table relationships

**Output:**
- Table relationships diagram
- Foreign key mappings
- Type file locations
- RLS policy overview

### Creating Migrations

**Step-by-step:**

1. **Create Migration File:**
   ```bash
   npx supabase migration new [description]
   ```

2. **Write Idempotent SQL:**
   > "Claude, help me write an idempotent migration for [change]"

   **Skills Invoked:** `supabase-sql-manager`

3. **Test Locally:**
   ```bash
   npx supabase db reset
   ```

4. **Generate Types:**
   ```bash
   npx supabase gen types typescript --local > src/lib/database/types/database-generated.ts
   ```

5. **Commit:**
   ```bash
   git add supabase/migrations/ src/lib/database/types/
   git commit -m "feat: [migration description]"
   ```

### Querying Data

**Say to Claude:**
> "How do I query [data description] with multi-tenant isolation?"

**Skills Invoked:** `supabase` skill

**Example Patterns:**

**User's Own Data:**
```typescript
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('author_id', userId)  // RLS auto-enforces
```

**Organization Data:**
```typescript
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('organization_id', orgId)  // RLS checks membership
```

**Multi-Tenant Pattern:**
```typescript
// RLS automatically filters by tenant_id
const { data } = await supabase
  .from('stories')
  .select('*')
  // No need to manually add .eq('tenant_id', ...)
```

---

## Content Management Workflow

### Reviewing Story Quality

**Say to Claude:**
> "Review this story for quality and cultural sensitivity"

**Skills Invoked:**
- `story-craft` - Content quality standards
- `cultural-review` - Cultural sensitivity

**Quality Markers:**

**✅ Good Story:**
- Clear narrative voice (first or third person)
- Specific, vivid details
- Cultural context acknowledged
- Emotional truth and authenticity
- Respectful language

**❌ Poor Story:**
- Contains timecodes `[00:00:00]`
- Speaker labels (`Speaker 1:`, `Interviewer:`)
- No paragraphs (wall of text)
- Generic AI language
- No cultural context

### Ensuring GDPR Compliance

**Say to Claude:**
> "Review this feature for GDPR compliance"

**Skills Invoked:** `gdpr-compliance` skill

**Checklist:**
- [ ] Right to access (data export)
- [ ] Right to erasure (account deletion)
- [ ] Data portability (standard formats)
- [ ] Consent tracked and revocable
- [ ] Audit logging implemented

---

## Deployment Workflow

### Local Development (ACT Ecosystem)

**All 6 ACT sites managed from one place.** Use this after sprints/major tasks to review all local sites.

**Quick Commands (from anywhere in terminal):**
```bash
act-start      # Start all 6 sites + open Chrome with 6 tabs
act-stop       # Stop all sites
act-restart    # Restart all sites (use after code changes)
act-status     # Show which sites are running
act-logs       # View live logs from all sites
act-monitor    # Open PM2 monitoring dashboard
```

**Sites & Ports:**
| Site | Port | URL |
|------|------|-----|
| ACT Regenerative Studio | 3002 | http://localhost:3002 |
| **Empathy Ledger** | 3030 | http://localhost:3030 |
| JusticeHub | 3003 | http://localhost:3003 |
| The Harvest Website | 3004 | http://localhost:3004 |
| ACT Farm | 3005 | http://localhost:3005 |
| ACT Placemat | 3999 | http://localhost:3999 |

**Sprint Review Workflow:**
1. Run `act-restart` to ensure fresh builds
2. Chrome opens automatically with 6 tabs
3. Test Empathy Ledger at http://localhost:3030
4. Verify features and cross-site integrations

**Troubleshooting:**
```bash
act-logs                       # Check for errors
pm2 logs empathy-ledger        # Logs for just Empathy Ledger
pm2 restart empathy-ledger     # Restart just one site
```

**Full Documentation:** `/Users/benknight/act-global-infrastructure/deployment/`

---

### Pre-Deployment Checklist

**Say to Claude:**
> "Prepare for deployment to production"

**Skills Invoked:** `deployment-workflow` skill

**Automated Checks:**
```bash
npm run build        # TypeScript compilation
npm run lint         # ESLint
npm run test         # Tests (if configured)
```

**Manual Checks:**
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Cultural review completed
- [ ] GDPR compliance verified
- [ ] Design system compliance verified

### Deployment Process

**Development → Staging:**
```bash
git checkout develop
git merge feature/your-feature
git push origin develop
```
- Auto-deploys to Vercel preview: `empathy-ledger-v2-git-develop-....vercel.app`

**Staging → Production:**
```bash
git checkout main
git merge develop
git push origin main
```
- Auto-deploys to production: `empathy-ledger.com`

### Post-Deployment Verification

- [ ] Production URL loads successfully
- [ ] Database migrations applied
- [ ] No console errors
- [ ] Storyteller features working
- [ ] Privacy controls functional

### Rollback Procedure

**If deployment fails:**

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or use Vercel dashboard to redeploy previous version
```

---

## Code Review Workflow

### Reviewer Checklist

**Say to Claude:**
> "Review this PR for [type of change]"

**Skills Invoked Based on Change Type:**

| Change Type | Skills Invoked |
|-------------|----------------|
| UI/Design | `design-component`, `design-system-guardian` |
| Storyteller Features | `cultural-review` (MANDATORY) |
| Database | `supabase`, `supabase-sql-manager` |
| Content | `story-craft`, `cultural-review` |
| Data Handling | `gdpr-compliance` |
| Deployment | `deployment-workflow` |

### Cultural Sensitivity Review (MANDATORY for storyteller features)

**Process:**
1. Open PR in GitHub
2. Check PR template "Storyteller-Facing Features" section
3. Invoke `cultural-review` skill
4. Verify:
   - [ ] OCAP principles maintained
   - [ ] Privacy levels respected
   - [ ] Elder review workflow appropriate
   - [ ] No cultural appropriation
   - [ ] Sacred content protected

**If ANY red flags:** Request changes immediately.

### Code Quality Review

**Standards:**
- TypeScript strict mode enabled
- No `any` types (use proper types)
- Server vs client components appropriate
- Multi-tenant isolation maintained
- Error handling comprehensive

---

## Onboarding Workflow

### New Developer First Day

**Step 1: Read Project Overview**
```bash
cat CLAUDE.md
```

**Step 2: Quick Reference**
> "Claude, give me a quick orientation to Empathy Ledger"

**Skills Invoked:** `empathy-ledger-dev`

**Step 3: Best Practices**
> "Claude, show me Empathy Ledger best practices"

**Skills Invoked:** `empathy-ledger-codebase`

**Step 4: Explore Codebase**
> "Claude, help me understand the [specific area] architecture"

**Skills Invoked:** `codebase-explorer`

**Step 5: Local Setup**
```bash
npm install
cp .env.example .env.local
# Add Supabase credentials
npx supabase start
npm run dev
```

**Step 6: First Task**
> "Claude, I'm ready to work on my first task"

Claude will guide you through the feature development workflow.

---

## Skill Reference by Task

### Daily Use Skills
- `codebase-explorer` - Understanding architecture
- `empathy-ledger-codebase` - Best practices reference
- `supabase` - Database schema and queries

### Weekly Use Skills
- `deployment-workflow` - Deployment checklist
- `design-component` - UI component design
- `cultural-review` - Cultural sensitivity verification

### Monthly Use Skills
- `supabase-sql-manager` - Creating migrations
- `data-analysis` - Theme/quote extraction
- `story-craft` - Content quality standards

### As-Needed Skills
- `gdpr-compliance` - Data handling compliance
- `gohighlevel-oauth` - GoHighLevel integration
- `design-system-guardian` - Design audits

---

## Emergency Procedures

### Database Connection Issues

**Say to Claude:**
> "Help me debug database connection issues"

**Skills Invoked:** `supabase-connection` skill

**Common Fixes:**
- Verify environment variables
- Check Supabase project status
- Test connection strings
- Review RLS policies

### Deployment Failures

**Say to Claude:**
> "Deployment failed with [error message]"

**Skills Invoked:** `deployment-workflow` skill

**Common Fixes:**
- Check build logs in Vercel
- Verify environment variables
- Test build locally
- Review migration status

### Cultural Sensitivity Concerns

**If someone reports a cultural sensitivity issue:**

1. **Immediate Action:**
   - Take content offline if necessary
   - Document the concern
   - Alert team lead

2. **Say to Claude:**
   > "Review [feature/content] for cultural sensitivity concerns"

   **Skills Invoked:** `cultural-review` skill

3. **Follow OCAP Principles:**
   - Contact storyteller (Ownership)
   - Get consent for changes (Control)
   - Respect privacy settings (Access)
   - Ensure data sovereignty (Possession)

---

## Integration with GitHub Projects

### Creating Issues

**For feature work:**
```bash
gh issue create --title "[Feature] Description" --label "enhancement"
```

**For bugs:**
```bash
gh issue create --title "[Bug] Description" --label "bug"
```

**For cultural review:**
```bash
gh issue create --title "[Cultural Review] Description" --label "cultural-sensitivity"
```

### Linking PRs to Issues

In PR description:
```markdown
Closes #123
```

---

## Summary: When to Invoke Which Skill

| You Say | Claude Invokes |
|---------|----------------|
| "I need to build a feature" | `empathy-ledger-dev`, `codebase-explorer` |
| "Design a component" | `design-component` |
| "Query the database" | `supabase` |
| "Create a migration" | `supabase-sql-manager` |
| "Review for cultural sensitivity" | `cultural-review` |
| "Check GDPR compliance" | `gdpr-compliance` |
| "Review story quality" | `story-craft` |
| "Start local dev servers" | `local-deployment` |
| "Deploy to production" | `deployment-workflow` |
| "Debug database connection" | `supabase-connection` |
| "Extract themes from stories" | `data-analysis` |

---

## Best Practices Summary

### DO:
✅ Invoke `cultural-review` for ALL storyteller-facing features
✅ Test migrations locally before pushing
✅ Use Editorial Warmth color palette
✅ Maintain multi-tenant isolation
✅ Follow OCAP principles
✅ Document environment variables
✅ Write idempotent migrations
✅ Include accessibility attributes

### DON'T:
❌ Skip cultural review (non-negotiable)
❌ Use `any` types in TypeScript
❌ Bypass RLS policies
❌ Commit without testing
❌ Deploy without checklist
❌ Share user data without consent
❌ Ignore Elder review requirements
❌ Make assumptions about cultural context

---

**For questions or issues with this workflow, ask Claude to clarify specific steps or invoke the relevant skill.**
