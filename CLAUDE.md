# Empathy Ledger v2 - Context Management Optimized

## Project Overview
Multi-tenant storytelling platform for Indigenous communities and organizations with cultural sensitivity protocols.

## 🎯 CURRENT SPRINT - CHECK HERE FIRST!

**Sprint 1:** Foundation & Profile (Jan 6-17, 2026)
**Status:** ✅ 100% COMPLETE - 3 days ahead of schedule! 🎉
**Next Sprint:** Sprint 2 starts January 6, 2026

**→ [docs/13-platform/SPRINT_STATUS.md](docs/13-platform/SPRINT_STATUS.md) - Real-time progress tracker**
**→ [SPRINT_1_COMPLETE.md](SPRINT_1_COMPLETE.md) - Sprint 1 completion summary**
**→ Invoke `sprint-tracker` skill for instant status**

---

## Recent Completions
- ✅ **SPRINT 1 COMPLETE!** (14 components, 100% cultural safety, 3 days ahead)
  - Profile Display: PrivacyBadge, ProtocolsBadge, CulturalAffiliations
  - Privacy Settings: 6 components with GDPR compliance
  - ALMA Settings: 5 components with cultural safety protocols
- ✅ **Week 5 Storyteller UAT** (9 improvements implemented from Elder Grace session)
- ✅ **Knowledge base processing** (231 docs → 22,506 chunks, 506 Q&A extractions)
- ✅ **Documentation reorganization** (200+ files organized into PMPP framework)
- ✅ **Claude Skills audit** (18 local + 4 global skills organized)
- ✅ Component modularization (ProjectManagement.tsx split)
- ✅ Database types organization

## Key Architecture
- **Database**: Supabase with multi-tenant architecture
- **Frontend**: Next.js 15 with TypeScript
- **Types**: Organized by domain (user-profile, organization-tenant, project-management, content-media, etc.)
- **Components**: Modular tab-based structure for complex management interfaces

## Context Management Strategy

### Commands
- `/clear` - Reset context between major tasks
- `/compact` - Summarize conversation to free context space

### Best Practices
1. **Prefer search over full reads** - Use grep/glob to find specific code
2. **Target line ranges** - Read specific sections with `offset` and `limit`
3. **Use Task agents** - Delegate exploration to subagents to preserve main context
4. **Clear between tasks** - Use `/clear` when switching focus areas

### Documentation Navigation (NEW - January 2, 2026)

**Start here**: [docs/README.md](docs/README.md) - Central documentation hub

**🔍 AI Knowledge Base** (RAG System):
- **Search 200+ docs** → [docs/knowledge-base/](docs/knowledge-base/) - Semantic search + vector embeddings
- **CLI Commands**: `npm run kb:process`, `npm run kb:stats`, `npm run kb:test "query"`
- **Week 1 Complete**: Database schema + extraction pipeline built
- **Next**: Deploy migration → Run processing → Build RAG query API

**PMPP Framework** (Principles, Methods, Practices, Procedures):
- **Why we do things** → [docs/01-principles/](docs/01-principles/) - OCAP, messaging, multi-tenant philosophy
- **Frameworks** → [docs/02-methods/](docs/02-methods/) - AI enhancement, transcript analysis
- **Technical design** → [docs/03-architecture/](docs/03-architecture/) - System architecture
- **Database** → [docs/04-database/](docs/04-database/) - Database docs (excellent)
- **Features** → [docs/05-features/](docs/05-features/) - Feature specifications with TEMPLATE.md
- **Development** → [docs/06-development/](docs/06-development/) - Dev workflow and standards
- **Deployment** → [docs/07-deployment/](docs/07-deployment/) - Deployment procedures
- **Integrations** → [docs/08-integrations/](docs/08-integrations/) - JusticeHub, ACT Farm, etc.
- **Testing** → [docs/09-testing/](docs/09-testing/) - Testing guides
- **Analytics** → [docs/10-analytics/](docs/10-analytics/) - Analytics system
- **Projects** → [docs/11-projects/](docs/11-projects/) - GOODS, Oonchiumpa, etc.
- **Design** → [docs/12-design/](docs/12-design/) - Brand guide, style guide
- **Platform** → [docs/13-platform/](docs/13-platform/) - Strategic foundation, wiki
- **POCs** → [docs/14-poc/](docs/14-poc/) - Proof of concept results
- **Reports** → [docs/15-reports/](docs/15-reports/) - Session reports, implementation summaries

**Every directory has a README.md** with:
- Purpose and sacred boundaries (what NEVER to do)
- File index and quick navigation
- Time saved metrics

### Large Files to Avoid Reading Fully
| File | Lines | Approach |
|------|-------|----------|
| `src/lib/database/types/*.ts` | 300-500 each | Search for specific types |
| `src/components/*/tabs/*.tsx` | 200-400 each | Target specific tab |
| API routes | varies | Read only the route you need |
| Session reports | 400-700 each | Check docs/15-reports/sessions/README.md first |

### Codebase Navigation
```bash
# Find files by pattern
glob "src/**/*Dashboard*.tsx"

# Search for code
grep "function handleSubmit" --type ts

# Check component structure
ls src/components/profile/tabs/

# Navigate documentation
cat docs/README.md
ls docs/01-principles/
```

### When to Use /clear
- After completing a Beads task
- Before starting unrelated work
- When context feels cluttered
- After large refactoring operations

## Database Schema Highlights
- **Multi-tenant**: All tables have tenant_id for isolation
- **Cultural Sensitivity**: Protocols, approval workflows, consent management
- **Media Management**: Comprehensive metadata, usage tracking
- **Storytelling**: Projects → Stories → Transcripts → Analysis pipeline

## Recent Completions
- ProjectManagement.tsx split into 4 focused tab components (2,708 lines → modular)
- Database types split into 8 domain-specific files (2,463 lines → organized)
- All components maintain full functionality with improved maintainability

## Claude Code Skills & Workflow

### Quick Start
**New to the project?** Read [Development Workflow Guide](.claude/DEVELOPMENT_WORKFLOW.md)

### Skills Organization
- **16 Active Skills** - Comprehensive coverage of development needs
- **Cultural Review MANDATORY** - Required for all storyteller-facing features
- **PR Template** - Enforces quality and cultural sensitivity standards

See [Skills Cleanup Summary](.claude/SKILLS_CLEANUP_SUMMARY.md) for details.

### Vibe Kanban (Task Orchestration)

For parallel agent execution and multi-task development:

```bash
# Launch Vibe Kanban
npx vibe-kanban
```

**Features:**
- Run multiple Claude Code agents in parallel
- Git worktree isolation per task
- Built-in code review before merge
- Real-time agent monitoring

**When to use:** Sprint tasks, parallel features, large refactors
**Full docs:** [.claude/skills/global/agent-kanban/skill.md](.claude/skills/global/agent-kanban/skill.md)

### Common Workflows

**"I need to build a feature"**
→ Claude invokes: `empathy-ledger-dev`, `codebase-explorer`
→ Use Vibe Kanban for multi-step features

**"Design a component"**
→ Claude invokes: `design-component`

**"Review for cultural sensitivity"** (CRITICAL)
→ Claude invokes: `cultural-review`

**"Create a database migration"**
→ Claude invokes: `supabase-sql-manager`

**"Deploy to production"**
→ Claude invokes: `deployment-workflow`

Full skill reference: [.claude/DEVELOPMENT_WORKFLOW.md](.claude/DEVELOPMENT_WORKFLOW.md)

## Next Actions
Use `bd ready` to see current tasks. Priority items:
- Review cultural safety moderation system (el-qdo)
- Enhance multi-tenant organization dashboard (el-b8e)