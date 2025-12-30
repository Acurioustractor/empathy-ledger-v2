# Empathy Ledger Documentation Index

**Complete directory of all documentation, organized by frequency of use.**

---

## 🚀 Quick Start (START HERE!)

**New to the project? Follow these in order:**

1. **[../QUICK_START.md](../QUICK_START.md)** - 5-minute quick start ⭐
2. **[getting-started/installation.md](getting-started/installation.md)** - Full installation (15-20 min)
3. **[getting-started/authentication.md](getting-started/authentication.md)** - Auth setup (10 min)
4. **[getting-started/common-tasks.md](getting-started/common-tasks.md)** - Daily workflows (reference)

**Total time to productivity: ~30 minutes**

---

## 📖 Daily Use Documentation

**Reference these frequently during development:**

### Getting Started
📁 [getting-started/](getting-started/)
- [README.md](getting-started/README.md) - Getting started guide overview
- [installation.md](getting-started/installation.md) - Full installation guide
- [authentication.md](getting-started/authentication.md) - Auth setup and RLS
- [common-tasks.md](getting-started/common-tasks.md) - Quick command reference
- [current-priorities.md](getting-started/current-priorities.md) - Active team priorities

### Development
📁 [development/](development/)
- Development workflows
- Environment setup
- Deployment checklists
- Dev server configuration

### Database
📁 [database/](database/)
- Database schema documentation
- Migration workflows
- RLS policy reference
- Query patterns

### Campaigns
📁 [campaigns/](campaigns/)
- [README.md](campaigns/README.md) - Campaign overview and navigation
- [world-tour/planning-guide.md](campaigns/world-tour/planning-guide.md) - How to plan tour stops
- [use-cases/](campaigns/use-cases/) - Campaign types and strategies
- [case-studies/](campaigns/case-studies/) - Real examples (Ben Knight case study)
- [brand-guidelines/](campaigns/brand-guidelines/) - Campaign branding and design
- Campaign management and execution
- Consent workflow tracking
- Dream Organization partnerships
- Physical storytelling events

---

## 🏗️ System Documentation

**Understand how the system works:**

### Architecture
📁 [architecture/](architecture/)
- System design and data flows
- Multi-tenant architecture
- AI integration patterns
- Service layer organization
- Story syndication system
- Partner portal architecture

### API Reference
📁 [api/](api/)
- [README.md](api/README.md) - Campaign API v1 documentation ⭐
- [examples.md](api/examples.md) - Practical usage examples and patterns
- RESTful endpoints for campaign management
- Workflow tracking and moderation
- Type-safe client wrappers
- Authentication and authorization
- Error handling patterns

### Features
📁 [features/](features/)
- Feature documentation by domain
- Implementation guides
- Signup/authentication flows
- Story management

---

## 🎨 Design & UX

### Design System
📁 [design-system/](design-system/)
- Component library
- Color palette and typography
- Cultural sensitivity in design
- Accessibility guidelines

### UX Documentation
📁 [ux/](ux/)
- User journeys and flows
- Storyteller experience
- Minimal capture flows
- Interaction patterns

---

## 🔌 Integrations & Analytics

### Integrations
📁 [integrations/](integrations/)
- Partner onboarding
- JusticeHub integration
- Platform integration guides
- API client libraries

### Analytics
📁 [analytics/](analytics/)
- Analytics implementation
- Event tracking
- Data visualization
- Reporting dashboards

---

## 🚀 Deployment

### Deployment Documentation
📁 [deployment/](deployment/)
- [mobile-pwa.md](deployment/mobile-pwa.md) - Deploy to mobile devices
- [field-workflow.md](deployment/field-workflow.md) - Offline storytelling
- [ready-to-deploy.md](deployment/ready-to-deploy.md) - Deployment readiness
- Vercel deployment guides
- Environment configuration
- Database migration workflows

---

## 🔍 Research & Platform

### Research
📁 [research/](research/)
- Research analysis frameworks
- Feature research
- Technical evaluations

### Platform
📁 [platform/](platform/)
- Platform prospectus
- Production readiness reports
- Site audit reports
- Deployment completion docs

---

## 🧪 Testing & Visualization

### Testing
📁 [testing/](testing/)
- Test documentation
- RBAC testing
- Transcript testing
- E2E test guides

### Visualizations
📁 [visualizations/](visualizations/)
- Data visualization guides
- Network graphs
- Analytics dashboards

---

## 📚 Reference Guides

### Comprehensive Guides
📁 [guides/](guides/)
- Walkthrough demos
- Step-by-step tutorials
- Integration guides

### Cultural Protocols
📁 [cultural/](cultural/)
- OCAP principles
- Indigenous data sovereignty
- Cultural sensitivity guidelines
- Consent and approval workflows

---

## 🔧 Quick Command Reference

### Development
```bash
npm run dev              # Start dev server (port 3005)
npm run build            # Build for production
npm run lint             # Run linter
npm run type-check       # Check TypeScript types
```

### Database
```bash
npm run db:sync          # Interactive database CLI ⭐
npm run db:pull          # Pull schema from remote
npm run db:push          # Push migrations to remote
npm run db:types         # Generate TypeScript types
npm run db:audit         # Audit RLS policies
```

### Testing
```bash
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:watch       # Watch mode
```

### Deployment
```bash
./scripts/deploy.sh      # Interactive deployment workflow
```

---

## 🤖 Claude Code Skills

**AI-powered development assistance:**

Located in [../.claude/skills/](../.claude/skills/)

### Core Skills
- **codebase-explorer** - Navigate codebase architecture ⭐
- **supabase** - Database management and queries
- **data-analysis** - AI-powered analysis features
- **design-component** - UI component patterns
- **cultural-review** - Cultural sensitivity review

### Specialized Skills
- **database-migration** - Migration creation
- **api-endpoint** - API endpoint creation
- **generate-e2e-test** - E2E test generation
- **review-security** - Security audits
- **review-cultural** - Cultural review workflows

**See:** [../.claude/SKILLS_REGISTRY.md](../.claude/SKILLS_REGISTRY.md) for complete catalog

---

## 📂 Documentation Organization

### By Category

| Category | Directory | Purpose |
|----------|-----------|---------|
| **Getting Started** | [getting-started/](getting-started/) | Onboarding and setup |
| **Development** | [development/](development/) | Daily dev workflows |
| **Database** | [database/](database/) | Schema and migrations |
| **Architecture** | [architecture/](architecture/) | System design |
| **API** | [api/](api/) | API reference |
| **Features** | [features/](features/) | Feature docs |
| **Design** | [design-system/](design-system/), [ux/](ux/) | UI/UX |
| **Integrations** | [integrations/](integrations/) | Partner integrations |
| **Analytics** | [analytics/](analytics/) | Data and reporting |
| **Deployment** | [deployment/](deployment/) | Deployment guides |
| **Testing** | [testing/](testing/) | Test documentation |
| **Research** | [research/](research/) | Research docs |
| **Platform** | [platform/](platform/) | Platform docs |
| **Guides** | [guides/](guides/) | Tutorials |
| **Cultural** | [cultural/](cultural/) | Cultural protocols |
| **Visualizations** | [visualizations/](visualizations/) | Data viz |

### By Frequency of Access

**Tier 1 - Daily Use** (access constantly):
- [getting-started/](getting-started/) - Setup and onboarding
- [development/](development/) - Dev workflows
- [database/](database/) - Database operations
- [../.claude/skills/](../.claude/skills/) - AI assistance

**Tier 2 - Weekly/Monthly** (reference as needed):
- [architecture/](architecture/) - System understanding
- [api/](api/) - API integration
- [features/](features/) - Feature development
- [deployment/](deployment/) - Releases

**Tier 3 - Occasional** (specific needs):
- [design-system/](design-system/) - UI components
- [integrations/](integrations/) - Partner work
- [analytics/](analytics/) - Reporting
- [testing/](testing/) - Testing

**Tier 4 - Archive** (historical reference):
- [../archive/](../archive/) - Archived content
  - [legacy-docs-2025/](../archive/legacy-docs-2025/) - 150+ archived docs
  - [sessions-2024/](../archive/sessions-2024/) - 2024 sessions
  - [sessions-2025/](../archive/sessions-2025/) - 2025 sessions
  - [legacy-reports/](../archive/legacy-reports/) - Historical reports

---

## 🔍 Finding What You Need

### "How do I...?"

| Task | Documentation |
|------|---------------|
| Get started | [getting-started/README.md](getting-started/README.md) |
| Install locally | [getting-started/installation.md](getting-started/installation.md) |
| Set up auth | [getting-started/authentication.md](getting-started/authentication.md) |
| Create a story | [getting-started/common-tasks.md](getting-started/common-tasks.md#story-management) |
| Run migrations | [getting-started/common-tasks.md](getting-started/common-tasks.md#database-operations) |
| Use the API | [api/README.md](api/README.md) + [api/examples.md](api/examples.md) |
| Manage campaigns | [campaigns/README.md](campaigns/README.md) |
| Deploy | [deployment/](deployment/) |
| Use Claude skills | [../.claude/SKILLS_REGISTRY.md](../.claude/SKILLS_REGISTRY.md) |

### "Where is...?"

| Looking for... | Location |
|---------------|----------|
| API routes | [api/](api/) |
| Database schema | [database/](database/) |
| React components | See `src/components/` (codebase) |
| Type definitions | See `src/types/` (codebase) |
| Migrations | See `supabase/migrations/` (codebase) |
| Environment setup | [getting-started/installation.md](getting-started/installation.md) |

### "What is...?"

| Concept | Documentation |
|---------|---------------|
| Multi-tenant architecture | [architecture/](architecture/) |
| RLS policies | [database/](database/) + [getting-started/authentication.md](getting-started/authentication.md) |
| Role hierarchy | [getting-started/authentication.md](getting-started/authentication.md#step-4-understand-roles) |
| Cultural protocols | [cultural/](cultural/) |
| AI features | [features/](features/), [architecture/](architecture/) |

---

## 🗂️ File Count by Directory

```
Total Documentation: ~200 active files + 200+ archived

Active Documentation:
├── getting-started/    ~8 files   (essential onboarding)
├── development/        ~15 files  (dev workflows)
├── database/           ~12 files  (DB docs)
├── architecture/       ~20 files  (system design)
├── api/                ~5 files   (API reference)
├── features/           ~8 files   (feature docs)
├── design-system/      ~6 files   (UI/UX)
├── integrations/       ~8 files   (partners)
├── deployment/         ~10 files  (deployment)
├── guides/             ~15 files  (tutorials)
├── analytics/          ~8 files   (data)
├── testing/            ~6 files   (tests)
├── research/           ~5 files   (research)
├── platform/           ~7 files   (platform)
├── cultural/           ~3 files   (cultural)
├── ux/                 ~4 files   (UX)
└── visualizations/     ~3 files   (viz)

Archived:
└── archive/            200+ files (historical)
```

---

## 🤝 Contributing

**Before contributing, read:**
- [../CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [cultural/](cultural/) - Cultural sensitivity protocols
- [getting-started/current-priorities.md](getting-started/current-priorities.md) - Current team priorities

**Development workflow:**
1. Read [getting-started/installation.md](getting-started/installation.md)
2. Review [getting-started/common-tasks.md](getting-started/common-tasks.md)
3. Check [database/](database/) for database changes
4. Follow [deployment/](deployment/) for releases

---

## 📞 Getting Help

### Documentation
- **Quick Start**: [../QUICK_START.md](../QUICK_START.md)
- **Full Installation**: [getting-started/installation.md](getting-started/installation.md)
- **Common Tasks**: [getting-started/common-tasks.md](getting-started/common-tasks.md)
- **This Index**: You are here!

### Community
- **GitHub Issues**: [Report bugs](https://github.com/your-org/empathy-ledger-v2/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/your-org/empathy-ledger-v2/discussions)
- **Pull Requests**: [Contribute](https://github.com/your-org/empathy-ledger-v2/pulls)

### Claude Code
- **Skills**: [../.claude/skills/](../.claude/skills/) - AI-powered assistance
- **Quick Reference**: [../.claude/SKILLS_QUICK_REFERENCE.md](../.claude/SKILLS_QUICK_REFERENCE.md)
- **Registry**: [../.claude/SKILLS_REGISTRY.md](../.claude/SKILLS_REGISTRY.md)

---

## 🔄 Recent Updates

### 2025-12-26 - Major Documentation Reorganization
- ✅ Reduced root directory from 20+ files to 5 essential files
- ✅ Created comprehensive getting-started guides
- ✅ Consolidated archive to single location (200+ files)
- ✅ Organized docs by frequency of use (Tier 1-4)
- ✅ Created master INDEX.md (this file)
- ✅ Removed 150+ redundant/obsolete docs to archive

### 2025-12-25 - Skills System Optimization
- ✅ Created skills index with 90+ trigger keywords
- ✅ Added skill templates (basic + advanced)
- ✅ Implemented testing framework
- ✅ Configured MCP integration

---

## 📌 Navigation Tips

### Use This Index
- **Bookmark this page** for quick navigation
- **Use Ctrl+F / Cmd+F** to search for topics
- **Follow category links** to explore sections

### Quick Searches

**Search all docs:**
```bash
grep -r "search term" docs/
```

**Find by file name:**
```bash
find docs/ -name "*keyword*"
```

**List all markdown files:**
```bash
find docs/ -name "*.md" | sort
```

---

**Last Updated**: 2025-12-26
**Documentation Version**: 2.0.0
**Total Active Docs**: ~200 files
**Archived Docs**: 200+ files
