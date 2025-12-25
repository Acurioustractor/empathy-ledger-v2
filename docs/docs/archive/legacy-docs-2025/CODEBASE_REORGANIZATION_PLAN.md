# Empathy Ledger v2: Codebase Reorganization Plan

## Executive Summary

**Current State**: The repository has significant organizational debt with 70+ markdown files in the root directory, 306 scattered scripts, and inconsistent documentation structure.

**Goal**: Create a world-class, maintainable repository structure that supports:
- Clear separation between development and production
- Easy onboarding for new developers
- GitHub-friendly workflows for collaboration
- Proper archival of historical documentation

---

## Current State Analysis

### Root Directory Audit

| Category | Count | Issue |
|----------|-------|-------|
| Session summaries | ~25 | Should be archived |
| Implementation docs | ~20 | Should be in docs/ |
| Project-specific docs (GOODS, etc.) | ~15 | Should be in docs/projects/ |
| Configuration files | ~10 | Correct location |
| PDFs | 2 | Should be in docs/research/ |
| JSON data files | ~5 | Should be in docs/data/ |
| Shell scripts | 2 | Move to scripts/ |

### Scripts Folder (306 files!)

| Type | Estimated Count | Recommendation |
|------|-----------------|----------------|
| SQL migrations | ~50 | Move to migrations/ |
| One-off analysis scripts | ~100 | Archive or delete |
| Utility scripts | ~50 | Organize by function |
| Test scripts | ~30 | Move to tests/ |
| Build/deploy scripts | ~20 | Keep in scripts/ |

### Duplicate Archive Folders

- `.archive/` - Contains database backups (hidden)
- `archive/` - Contains old workflows, investigations

**Recommendation**: Consolidate into single `archive/` folder

---

## Proposed Directory Structure

```
empathy-ledger-v2/
├── .claude/                    # Claude Code configuration
├── .github/
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── workflows/
│   │   ├── ci.yml             # Main CI pipeline
│   │   ├── deploy-preview.yml # PR preview deployments
│   │   ├── deploy-production.yml
│   │   └── security-scan.yml
│   └── CODEOWNERS
├── .husky/                     # Git hooks
├── .vercel/                    # Vercel configuration
│
├── docs/                       # All documentation
│   ├── README.md              # Documentation index
│   ├── getting-started/       # Onboarding docs
│   │   ├── SETUP.md
│   │   ├── ENVIRONMENT.md
│   │   └── FIRST_CONTRIBUTION.md
│   ├── architecture/          # Technical architecture
│   │   ├── DATABASE.md
│   │   ├── MULTI_TENANT.md
│   │   ├── AI_SYSTEM.md
│   │   └── PLATFORM_ARCHITECTURE.md
│   ├── guides/                # How-to guides
│   │   ├── SEED_INTERVIEW_GUIDE.md
│   │   ├── TRANSCRIPT_UPLOAD.md
│   │   ├── BULK_UPLOAD.md
│   │   └── ADMIN_GUIDE.md
│   ├── cultural/              # Cultural safety documentation
│   │   ├── OCAP_PRINCIPLES.md
│   │   ├── CULTURAL_PROTOCOLS.md
│   │   └── ELDER_REVIEW_WORKFLOW.md
│   ├── design/                # Design system docs
│   │   ├── DESIGN_SYSTEM.md
│   │   ├── COMPONENTS.md
│   │   └── ACCESSIBILITY.md
│   ├── api/                   # API documentation
│   │   ├── REST_API.md
│   │   └── WEBHOOKS.md
│   ├── projects/              # Project-specific docs
│   │   ├── goods/
│   │   ├── oonchiumpa/
│   │   └── deadly-hearts/
│   ├── research/              # Research and analysis
│   │   └── *.pdf
│   ├── rfp/                   # Grant applications (renamed from PFR)
│   │   └── prf-2026/
│   └── archive/               # Historical session notes
│       ├── sessions-2024-10/
│       └── sessions-2024-11/
│
├── database/                   # Database schemas and seeds
│   ├── schema/                # Current schema files
│   ├── seeds/                 # Seed data
│   └── types/                 # Generated types
│
├── migrations/                 # Database migrations (versioned)
│   ├── 20241001_initial.sql
│   ├── 20241015_add_projects.sql
│   └── README.md
│
├── scripts/                    # Development/deployment scripts
│   ├── build/                 # Build scripts
│   ├── deploy/                # Deployment scripts
│   ├── dev/                   # Development utilities
│   └── data/                  # Data manipulation scripts
│
├── src/                        # Application source code
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities and services
│   └── types/                 # TypeScript types
│
├── tests/                      # Test files
│   ├── e2e/                   # End-to-end tests
│   ├── integration/           # Integration tests
│   └── unit/                  # Unit tests
│
├── public/                     # Static assets
│
├── archive/                    # Archived files (not in docs)
│   ├── legacy-scripts/
│   ├── old-migrations/
│   └── database-backups/
│
├── .env.example               # Environment template
├── .gitignore
├── CLAUDE.md                  # Claude Code context
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE
├── README.md                  # Main readme
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## Migration Plan

### Phase 1: Root Directory Cleanup (Immediate)

**Step 1.1: Create folder structure**
```bash
mkdir -p docs/{getting-started,architecture,guides,cultural,design,api,projects/{goods,oonchiumpa,deadly-hearts},research,rfp/prf-2026,archive/{sessions-2024-10,sessions-2024-11}}
mkdir -p scripts/{build,deploy,dev,data}
mkdir -p archive/{legacy-scripts,old-migrations,database-backups}
```

**Step 1.2: Move session notes to archive**
Files to move: `SESSION_*.md`, `WEEK_*.md` → `docs/archive/sessions-2024-10/`

**Step 1.3: Move project-specific docs**
- `GOODS_*.md` → `docs/projects/goods/`
- `OONCHIUMPA_*.md` → `docs/projects/oonchiumpa/`
- `DEADLY_HEARTS_*.md` → `docs/projects/deadly-hearts/`

**Step 1.4: Move implementation docs**
- `AI_*.md` → `docs/architecture/`
- `OLLAMA_*.md` → `docs/guides/`
- `*_GUIDE.md` → `docs/guides/`

**Step 1.5: Move PDFs**
- `*.pdf` → `docs/research/`

### Phase 2: Scripts Organization

**Step 2.1: Categorize scripts**
- SQL files → `migrations/` (if versioned) or `archive/old-migrations/`
- Analysis scripts → `archive/legacy-scripts/`
- Active utility scripts → `scripts/dev/`

**Step 2.2: Create migration versioning**
Rename migrations with date prefix: `YYYYMMDD_description.sql`

### Phase 3: GitHub Workflow Enhancement

**Step 3.1: Add CI/CD workflows**
- Main CI pipeline with tests
- Preview deployments for PRs
- Production deployment (manual trigger)
- Security scanning

**Step 3.2: Add GitHub templates**
- Issue templates (bug, feature, cultural safety)
- PR template with checklist
- CODEOWNERS file

### Phase 4: Documentation Consolidation

**Step 4.1: Create documentation index**
- `docs/README.md` with navigation
- Cross-references between related docs

**Step 4.2: Update main README**
- Simplified quickstart
- Links to detailed docs
- Badge indicators (build status, coverage)

---

## Branch Strategy

### Current State
- `main` - Production branch
- `develop` - Development branch

### Recommended Strategy

```
main (protected)
  │
  ├── Protected branch rules:
  │   - Require PR reviews (1+)
  │   - Require status checks to pass
  │   - Require up-to-date branches
  │
develop
  │
  ├── Default branch for PRs
  │   - Auto-deploy to staging
  │   - Allow direct pushes for maintainers
  │
feature/*
  │
  └── Feature branches
      - Branch from develop
      - PR back to develop
```

### Environment Mapping

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | empathy-ledger.com |
| `develop` | Staging | staging.empathy-ledger.com |
| `feature/*` | Preview | PR preview URLs |

---

## Files to Delete (After Review)

These files appear to be temporary or obsolete:

1. `tsconfig.tsbuildinfo` - Regenerated on build
2. `comparison-results.txt` - Temporary output
3. Duplicate archive folders - Consolidate
4. Old session notes older than 60 days - Archive

---

## Implementation Priority

### High Priority (Do First)
1. Move root markdown files to docs/
2. Create CONTRIBUTING.md
3. Update .gitignore

### Medium Priority
1. Organize scripts folder
2. Add GitHub workflows
3. Create documentation index

### Low Priority
1. Clean up old migrations
2. Add issue templates
3. Set up CODEOWNERS

---

## Validation Checklist

After reorganization:

- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] No broken imports
- [ ] All documentation links work
- [ ] Git history preserved
- [ ] No secrets exposed

---

## Appendix: Files to Move

### Root → docs/archive/sessions-2024-10/
- SESSION_COMPLETE_*.md
- SESSION_STATUS_*.md
- SESSION_SUMMARY*.md
- SESSION_UPDATE_*.md
- WEEK_3_*.md

### Root → docs/projects/goods/
- GOODS_*.md
- GOODS_*.json

### Root → docs/architecture/
- AI_*.md
- CLAUDE_*.md
- CONTEXT_SYSTEM_*.md
- INTEGRATION_*.md

### Root → docs/guides/
- *_GUIDE.md
- *_SETUP*.md
- HOW_TO_*.md

### Root → docs/research/
- *.pdf (2 files)
