# Empathy Ledger Documentation Reorganization Plan

**Date**: January 2, 2026
**Status**: Implementation Ready
**Purpose**: Reorganize 250+ documentation files to be AI-agent friendly using ACT Farmhand principles

---

## Current State Summary

- **Total Files**: 250+ documentation files (2.3 MB)
- **Project Root**: 68 markdown files (needs organization)
- **Main Docs Folder**: 152 files (well-organized in subdirectories, cluttered at root)
- **Claude Skills**: 37 files (well-organized)
- **Status**: Moderately organized with opportunity for major improvement

---

## Design Principles Applied

Based on ACT Personal AI project patterns:

### 1. **PMPP Framework** (Principles, Methods, Practices, Procedures)
All documentation classified into four knowledge types

### 2. **Multi-Level Access Architecture**
- **Community** (Public) - What, How, Projects
- **Partners** (Semi-Public) - Strategy, Vision, Impact
- **Development Team** (Internal) - Architecture, Technical Decisions
- **System Admins** (Restricted) - Infrastructure, Security

### 3. **Specs-Before-Code**
New template for feature specifications with cultural protocol checks

### 4. **Agent-First README Structure**
Clear purpose, sacred boundaries, usage examples, exact file paths

### 5. **Living Wiki Pattern**
Knowledge extraction with confidence scoring

---

## New Documentation Structure

```
/docs/
├── README.md                           # Navigation hub for all documentation
│
├── 01-principles/                      # Why we do things (PMPP: Principles)
│   ├── ACT_DEVELOPMENT_PHILOSOPHY.md  # Cultural sovereignty, simplicity over cleverness
│   ├── CULTURAL_PROTOCOLS.md          # OCAP, Elder authority, sacred boundaries
│   ├── MESSAGING_GUIDELINES.md        # Partnership language, what we say/avoid
│   └── MULTI_TENANT_PHILOSOPHY.md     # Organization sovereignty principles
│
├── 02-methods/                         # Frameworks and approaches (PMPP: Methods)
│   ├── AI_ENHANCEMENT_SYSTEM.md       # AI pipeline framework
│   ├── TRANSCRIPT_ANALYSIS_FRAMEWORK.md
│   ├── REVENUE_ATTRIBUTION_ALGORITHM.md
│   └── STORYTELLING_FRAMEWORK.md
│
├── 03-architecture/                    # Technical architecture (PMPP: Methods)
│   ├── README.md                       # Architecture overview with diagrams
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── COMPLETE_PAGE_ARCHITECTURE.md
│   ├── DATABASE_ARCHITECTURE.md
│   ├── API_ARCHITECTURE.md
│   └── SYNDICATION_SYSTEM_ARCHITECTURE.md
│
├── 04-database/                        # ✅ Already excellent (PMPP: Procedures)
│   ├── README.md                       # Database navigation hub
│   ├── architecture.md
│   ├── best-practices.md
│   ├── local-setup.md
│   ├── migration-strategy.md
│   ├── mission-map.md
│   ├── optimization-plan.md
│   ├── strategy.md
│   ├── workflow.md
│   └── workflow-quick-ref.md
│
├── 05-features/                        # Feature specifications (PMPP: Practices/Procedures)
│   ├── README.md                       # Feature index
│   ├── TEMPLATE.md                     # Spec template (from ACT Personal AI)
│   ├── super-admin/                    # 7 super admin docs
│   ├── storyteller-analytics/          # 7 analytics docs
│   ├── transcript-system/              # 6 transcript docs
│   ├── project-context/                # 2 project docs
│   ├── syndication/                    # Syndication feature docs
│   └── [feature-name]/                 # Each feature gets a folder
│       ├── SPEC.md                     # Main specification
│       ├── IMPLEMENTATION.md           # Implementation guide
│       └── TESTING.md                  # Testing guide
│
├── 06-development/                     # ✅ Already good (PMPP: Practices)
│   ├── README.md                       # Development workflow hub
│   ├── GETTING_STARTED.md
│   ├── DEVELOPMENT_STANDARDS.md
│   ├── FRONTEND_BEST_PRACTICES.md
│   ├── AUSTRALIAN_SPELLING_GUIDE.md
│   └── [existing development docs]
│
├── 07-deployment/                      # Deployment guides (PMPP: Procedures)
│   ├── README.md                       # Deployment navigation
│   ├── DEPLOYMENT_SETUP_COMPLETE.md
│   ├── INNGEST_DEPLOYMENT_GUIDE.md
│   ├── VERCEL_DEPLOYMENT.md
│   └── [existing deployment docs]
│
├── 08-integrations/                    # External integrations (PMPP: Procedures)
│   ├── README.md                       # Integration hub
│   ├── justicehub/
│   │   ├── integration-guide.md
│   │   ├── webhook-spec.md
│   │   └── example-components/
│   ├── act-farm/
│   ├── the-harvest/
│   ├── goods-asset-register/
│   └── [other-integrations]/
│
├── 09-testing/                         # ✅ Already good (PMPP: Procedures)
│   ├── README.md                       # Testing navigation
│   ├── end-to-end-testing-guide.md
│   ├── SEED_INTERVIEW_TESTING_GUIDE.md
│   └── [existing testing docs]
│
├── 10-analytics/                       # ✅ Already good (PMPP: Practices)
│   ├── README.md                       # Analytics hub
│   └── [existing analytics docs]
│
├── 11-projects/                        # Project-specific documentation
│   ├── README.md                       # Projects index
│   ├── goods/
│   │   ├── GOODS_PROJECT_SETUP.md
│   │   ├── GOODS_STRATEGIC_PATH_FORWARD.md
│   │   └── [other GOODS docs]
│   ├── oonchiumpa/                     # 3 Oonchiumpa docs
│   ├── deadly-hearts-trek/
│   ├── snow-foundation/
│   └── kristy-account/
│
├── 12-design/                          # Design system (PMPP: Methods/Procedures)
│   ├── README.md                       # Design system hub
│   ├── BRAND_AND_UI_STYLE_GUIDE.md
│   ├── SMART_GALLERY_QUICK_REFERENCE.md
│   ├── DESIGN_PRINCIPLES.md
│   └── COMPONENT_LIBRARY.md
│
├── 13-platform/                        # ✅ Already good (PMPP: Principles/Methods)
│   ├── README.md                       # Platform overview
│   ├── EMPATHY_LEDGER_WIKI.md
│   ├── STRATEGIC_FOUNDATION.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── [existing platform docs]
│
├── 14-poc/                             # ✅ Already good - Proof of concepts
│   ├── README.md                       # POC index
│   └── [existing POC docs]
│
├── 15-reports/                         # Status reports and summaries
│   ├── README.md                       # Reports navigation
│   ├── sessions/                       # Session completion reports
│   │   ├── 2025-10-11-session-complete.md
│   │   ├── 2025-11-15-claude-v2-integration.md
│   │   └── [all SESSION_* files from root]
│   ├── implementation/                 # Implementation summaries
│   │   ├── IMPLEMENTATION_STATUS.md
│   │   ├── WEEK_3_COMPLETE.md
│   │   └── [all IMPLEMENTATION_* files]
│   ├── analysis/                       # Analysis reports
│   │   ├── COMPREHENSIVE_DATABASE_STATUS.md
│   │   ├── COMPREHENSIVE_ANALYSIS_REPORT.md
│   │   └── [all analysis reports]
│   └── reviews/                        # Review reports
│       └── PRIVACY_COMPONENTS_CULTURAL_REVIEW.md
│
├── 16-legacy/                          # ✅ Already good - Archived docs
│   ├── README.md                       # Legacy navigation
│   └── [existing legacy-reports docs]
│
└── 99-archive/                         # Outdated/superseded docs
    ├── README.md                       # What's archived and why
    └── [old session reports >3 months]
```

---

## Agent-Friendly README Pattern

Every directory gets a README.md following this pattern:

```markdown
# [Directory Name]

**Purpose**: [One-sentence explanation]

**What This Is**: [2-3 sentences on what this directory contains]

**Sacred Boundaries** (NEVER):
- ❌ [What agents should never do with this documentation]
- ❌ [What to avoid]

## Quick Navigation

- **[Link to most important doc]** - [One-line description]
- **[Link to second most important doc]** - [One-line description]

## File Index

| File | Purpose | Last Updated |
|------|---------|--------------|
| [filename.md](./filename.md) | [Purpose] | YYYY-MM-DD |

## Related Documentation

- See [../other-directory/](../other-directory/) for [related topic]

---

**Time Saved**: Using this directory well saves [X] hours of [task]
```

---

## Root-Level Documentation Structure

```
/
├── README.md                           # Main project README (agent-first)
├── CLAUDE.md                           # AI assistant context (currently good)
├── GETTING_STARTED.md                  # Quick start guide
├── CONTRIBUTING.md                     # How to contribute
├── CHANGELOG.md                        # Version history
└── docs/                               # All other documentation moves here
```

**Archive these root files to docs/15-reports/**:
- All SESSION_* files (40+ files)
- All IMPLEMENTATION_* files
- All *_COMPLETE.md files
- All *_SUMMARY.md files
- All analysis reports

**Keep in root**:
- README.md (rewritten for agents)
- CLAUDE.md (update with new doc structure)
- GETTING_STARTED.md
- CONTRIBUTING.md (new)
- CHANGELOG.md (new)

---

## Feature Specification Template

Create `/docs/05-features/TEMPLATE.md`:

```markdown
# Spec: [Feature Name]

**Date**: YYMMDD
**Status**: Draft | Review | Approved | Rejected | Implemented
**Iteration**: a
**Maintainer**: [Name/Team]

---

## Summary

[1-2 sentences describing what this feature does]

---

## User Story

**As a** [user type]
**I want** [capability]
**So that** [benefit]

---

## Requirements

### Must Have
- [ ] Requirement 1
- [ ] Requirement 2

### Nice to Have
- [ ] Enhancement 1
- [ ] Enhancement 2

### Out of Scope
- Item 1 (reason)
- Item 2 (reason)

---

## Cultural Protocol Check

**OCAP Compliance**:
- [ ] Ownership: [How storyteller owns their data]
- [ ] Control: [How storyteller controls access]
- [ ] Access: [Who can access and why]
- [ ] Possession: [How data is stored/protected]

**Elder Authority**:
- [ ] Requires Elder approval: Yes/No
- [ ] Sacred content risk: None/Low/Medium/High
- [ ] Cultural sensitivity review: Required/Not Required

**Trauma-Informed Design**:
- [ ] Reversible actions: [What can be undone]
- [ ] Clear outcomes: [What happens is visible]
- [ ] No surprises: [User knows what will happen]

---

## Technical Approach

**Which Agent/Component Owns This?**
- Primary: [Agent/component name]
- Supporting: [Other agents/components]

**Database Changes**:
- [ ] New tables: [List]
- [ ] New columns: [List]
- [ ] Migrations needed: [Yes/No]

**API Endpoints**:
- [ ] `GET /api/...` - [Purpose]
- [ ] `POST /api/...` - [Purpose]

**UI Components**:
- [ ] Component 1 - [Location]
- [ ] Component 2 - [Location]

**Dependencies**:
- [ ] Dependency 1
- [ ] Dependency 2

---

## Simplicity Check

**Complexity Score**: [Low/Medium/High]

**Can We Make This Simpler?**
- [ ] Remove feature X (not essential)
- [ ] Simplify UI to Y (fewer options)
- [ ] Use existing Z (don't reinvent)

**Fat Agent or Skinny Tool?**
[Should this be autonomous (fat agent) or user-controlled (skinny tool)?]

---

## Test Plan

### Unit Tests
- [ ] Test 1: [What to test]
- [ ] Test 2: [What to test]

### Integration Tests
- [ ] Test 1: [End-to-end flow]

### Cultural Safety Tests
- [ ] Test sacred content protection
- [ ] Test Elder authority workflow
- [ ] Test storyteller sovereignty

### User Acceptance Tests
- [ ] Test with 3-5 storytellers
- [ ] Test with 1-2 Elders
- [ ] Test with organization admin

---

## Review History

### Iteration A (YYMMDD)
- **Reviewer**: [Name]
- **Feedback**: [Summary]
- **Decision**: Draft | Revise | Approve | Reject

---

## Implementation

**Status**: Not Started | In Progress | Complete
**Implementation Date**: YYYY-MM-DD
**Files Modified**: [List with links]
**Migration Run**: YYYY-MM-DD
**Deployed**: YYYY-MM-DD

---

## Related Documentation

- [Link to related spec]
- [Link to architecture doc]
- [Link to testing guide]
```

---

## Migration Plan

### Phase 1: Structure Creation (30 minutes)
1. Create new directory structure in `/docs/`
2. Create README.md in each directory
3. Create TEMPLATE.md in `/docs/05-features/`

### Phase 2: File Classification (2 hours)
1. Classify all 68 root-level .md files by PMPP type
2. Classify all 88 /docs/*.md files by topic
3. Create move plan (CSV or JSON)

### Phase 3: File Migration (1 hour)
1. Move files to new locations
2. Update internal links
3. Update CLAUDE.md with new structure

### Phase 4: README Creation (2 hours)
1. Write README.md for each directory
2. Include file index, navigation, time saved
3. Add sacred boundaries

### Phase 5: Root Cleanup (30 minutes)
1. Rewrite main README.md for agents
2. Create CONTRIBUTING.md
3. Create CHANGELOG.md
4. Archive old session reports

### Phase 6: Validation (1 hour)
1. Test all internal links
2. Verify file paths in code
3. Test with Claude agent navigation

**Total Time**: ~7 hours

---

## Success Criteria

### Agent Navigation
- [ ] Agent can find any document in <30 seconds
- [ ] Every directory has clear purpose
- [ ] No orphaned files
- [ ] All links work

### PMPP Classification
- [ ] Every doc classified as Principle/Method/Practice/Procedure
- [ ] Easy to find "why" (principles) vs "how" (procedures)

### Cultural Safety
- [ ] Sacred boundaries documented in every README
- [ ] Cultural protocol checks in all specs
- [ ] OCAP principles visible

### Maintainability
- [ ] Template for new features
- [ ] Clear contribution guide
- [ ] Changelog for tracking
- [ ] Review process documented

---

## Implementation Order

1. **Create structure** (this plan is step 1)
2. **Write main /docs/README.md** (navigation hub)
3. **Move feature docs** (05-features/)
4. **Move reports** (15-reports/)
5. **Move project docs** (11-projects/)
6. **Create integration folders** (08-integrations/)
7. **Write directory READMEs**
8. **Update root README.md**
9. **Update CLAUDE.md**
10. **Test navigation**

---

## Next Step

Run the file migration script to move files according to this plan.
