# Claude Skills Registry - Empathy Ledger v2

## Quick Reference

This registry catalogs all Claude Code skills available in this project. Skills are reusable prompts that provide specialized guidance for common tasks.

---

## 📚 Available Skills by Category

### 🏗️ Architecture & Codebase

#### `codebase-explorer`
- **Location**: `.claude/skills/codebase-explorer/`
- **Purpose**: Navigate and understand the Empathy Ledger codebase architecture
- **Use When**:
  - Exploring code organization
  - Understanding data flows
  - Finding where features are implemented
  - Mapping component relationships
- **Invoke**: "Help me explore the codebase" or "Show me how the data flows"

#### `empathy-ledger-codebase`
- **Location**: `.claude/skills/empathy-ledger-codebase/`
- **Purpose**: Best practices for code quality, architecture, and cultural sensitivity
- **Use When**:
  - Starting new features
  - Code review
  - Database schema design
  - API endpoint creation
  - UI component implementation
- **Invoke**: Automatically applied to architecture decisions

---

### 🗄️ Database & Data

#### `supabase`
- **Location**: `.claude/skills/supabase/`
- **Purpose**: Navigate database tables, relationships, and query patterns
- **Use When**:
  - Writing queries
  - Understanding table relationships
  - Finding the right data source
  - Database schema exploration
- **Invoke**: "Show me the database schema" or "How do I query stories?"

#### `supabase-sql-manager`
- **Location**: `.claude/skills/supabase-sql-manager/`
- **Purpose**: Execute SQL queries and manage database operations
- **Use When**:
  - Running database queries
  - Creating migrations
  - Testing SQL statements
  - Database administration
- **Invoke**: "Run this SQL query" or "Create a migration"

#### `database-navigator`
- **Location**: `.claude/skills/database-navigator.md`
- **Purpose**: Navigate complex multi-tenant database schema
- **Use When**:
  - Understanding RLS policies
  - Finding tenant-specific data
  - Multi-tenant query patterns
- **Invoke**: "How does multi-tenancy work?" or "Show me RLS policies"

#### `data-analysis`
- **Location**: `.claude/skills/data-analysis/`
- **Purpose**: AI-powered data analysis for themes, quotes, transcripts
- **Use When**:
  - Analyzing story themes
  - Extracting quotes
  - Generating insights
  - Storyteller connections
- **Invoke**: "Analyze story themes" or "Extract quotes from transcripts"

---

### 🎨 Design & Components

#### `design-component`
- **Location**: `.claude/skills/design-component/`
- **Purpose**: Design storyteller cards, UI components, AI-enriched displays
- **Use When**:
  - Creating card components
  - Implementing data displays
  - Adding AI enrichment
  - Cultural sensitivity in UI
- **Invoke**: "Design a storyteller card" or "How do I display themes?"

---

### 🔐 Security & Compliance

#### `cultural-review`
- **Location**: `.claude/skills/cultural-review/`
- **Purpose**: Review features for cultural sensitivity and Indigenous data sovereignty
- **Use When**:
  - Implementing storyteller features
  - Adding data collection
  - Privacy controls
  - Content moderation
- **Invoke**: "Review this for cultural sensitivity"

#### `gdpr-compliance`
- **Location**: `.claude/skills/gdpr-compliance/`
- **Purpose**: Ensure GDPR and data privacy compliance
- **Use When**:
  - Implementing data collection
  - User consent flows
  - Data export features
  - Privacy settings
- **Invoke**: "Is this GDPR compliant?"

---

### 🚀 Deployment & DevOps

#### `deployment-workflow`
- **Location**: `.claude/skills/deployment-workflow/`
- **Purpose**: Deploy to GitHub and Vercel with version sync
- **Use When**:
  - Ready to deploy to production
  - Creating releases
  - Version management
  - Rollback needed
- **Invoke**: "Deploy to production" or "I need to release"
- **Script**: `./scripts/deploy.sh`

---

### 📊 Analytics & Reporting

#### `storyteller-analytics`
- **Location**: `.claude/skills/storyteller-analytics.md`
- **Purpose**: Generate analytics and insights from storyteller data
- **Use When**:
  - Creating dashboards
  - Generating reports
  - Understanding user behavior
  - Measuring engagement
- **Invoke**: "Show me storyteller analytics"

---

### 🔗 Integrations

#### `gohighlevel-oauth`
- **Location**: `.claude/skills/gohighlevel-oauth/`
- **Purpose**: GoHighLevel OAuth integration patterns
- **Use When**:
  - Integrating with GHL
  - OAuth implementation
  - External API connections
- **Invoke**: "Set up GoHighLevel integration"

#### `supabase-connection`
- **Location**: `.claude/skills/supabase-connection/`
- **Purpose**: Supabase connection setup and troubleshooting
- **Use When**:
  - Connection issues
  - Environment setup
  - Auth configuration
- **Invoke**: "Fix Supabase connection"

---

### ✍️ Content Creation

#### `story-craft`
- **Location**: `.claude/skills/story-craft/`
- **Purpose**: Guide story creation, editing, and curation
- **Use When**:
  - Creating story workflows
  - Implementing story features
  - Content moderation
- **Invoke**: "Help with story creation"

---

### 🛠️ Development Tools

#### `empathy-ledger-dev`
- **Location**: `.claude/skills/empathy-ledger-dev/`
- **Purpose**: Development environment setup and tooling
- **Use When**:
  - Setting up local environment
  - Troubleshooting dev tools
  - Build configuration
- **Invoke**: "Set up development environment"

---

## 🎯 Quick Skill Selection Guide

### By Task Type

| Task | Recommended Skill |
|------|------------------|
| Understanding codebase | `codebase-explorer` |
| Writing database queries | `supabase`, `supabase-sql-manager` |
| Creating UI components | `design-component` |
| Analyzing story data | `data-analysis` |
| Deploying to production | `deployment-workflow` |
| Reviewing cultural safety | `cultural-review` |
| Database schema work | `database-navigator` |
| Story features | `story-craft` |
| Integration work | `gohighlevel-oauth` |
| Development setup | `empathy-ledger-dev` |

### By User Role

| Role | Common Skills |
|------|---------------|
| **Developer** | `codebase-explorer`, `empathy-ledger-codebase`, `deployment-workflow` |
| **Database Admin** | `supabase`, `supabase-sql-manager`, `database-navigator` |
| **Designer** | `design-component`, `cultural-review` |
| **Data Analyst** | `data-analysis`, `storyteller-analytics` |
| **DevOps** | `deployment-workflow`, `supabase-connection` |
| **Cultural Advisor** | `cultural-review`, `story-craft` |

---

## 📖 How to Use Skills

### Method 1: Conversational (Automatic)

Just mention what you need in natural language:

```
"I need to deploy to production"
→ Invokes: deployment-workflow

"Show me how to query stories by theme"
→ Invokes: supabase

"Design a storyteller card with cultural indicators"
→ Invokes: design-component

"Is this feature culturally sensitive?"
→ Invokes: cultural-review
```

### Method 2: Explicit Invocation

Use the `/skill` command (if available):

```
/skill deployment-workflow
/skill design-component
```

### Method 3: Via Scripts

Some skills have companion scripts:

```bash
# Deployment workflow
./scripts/deploy.sh

# Icon generation (part of deployment)
./scripts/create-icons.sh

# Database analysis
./scripts/analyze-database.sh
```

---

## 🔄 Skill Lifecycle

### Adding a New Skill

1. **Create skill directory**:
   ```bash
   mkdir -p .claude/skills/new-skill-name
   ```

2. **Create skill files**:
   ```
   .claude/skills/new-skill-name/
   ├── skill.json          # Metadata and config
   ├── skill.md            # Main skill documentation
   └── README.md           # Quick reference (optional)
   ```

3. **Define skill.json**:
   ```json
   {
     "name": "new-skill-name",
     "description": "Brief description",
     "version": "1.0.0",
     "type": "project",
     "triggers": ["keyword1", "keyword2"],
     "tags": ["category", "feature"],
     "tools": ["Read", "Write", "Bash"]
   }
   ```

4. **Write skill.md**:
   - Purpose and use cases
   - Step-by-step guidance
   - Code examples
   - Best practices
   - Common pitfalls

5. **Update this registry**:
   - Add to appropriate category
   - Add to quick reference tables
   - Document invocation patterns

6. **Commit with force** (skills directory is gitignored):
   ```bash
   git add -f .claude/skills/new-skill-name/
   git commit -m "feat: add new-skill-name Claude skill"
   ```

### Updating an Existing Skill

1. Edit skill files in `.claude/skills/skill-name/`
2. Update version in `skill.json`
3. Document changes in skill's README or changelog section
4. Commit changes:
   ```bash
   git add -f .claude/skills/skill-name/
   git commit -m "feat: update skill-name skill - [description]"
   ```

### Deprecating a Skill

1. Mark as deprecated in skill.json:
   ```json
   {
     "deprecated": true,
     "deprecated_reason": "Replaced by new-skill-name",
     "replacement": "new-skill-name"
   }
   ```

2. Update this registry with ⚠️ deprecation notice
3. Keep files for backwards compatibility
4. Eventually move to `.claude/skills/archive/` after grace period

---

## 🗂️ Skill Organization Patterns

### File Naming Conventions

**Recommended**:
- `skill.md` - Main skill content (most important)
- `skill.json` - Metadata and configuration
- `README.md` - Quick reference guide
- `examples/` - Code examples (optional)
- `templates/` - Reusable templates (optional)

**Legacy** (being standardized):
- `SKILL.md` - Older convention
- Various naming patterns

**Standalone** (no directory):
- `.claude/skills/skill-name.md` - Simple single-file skills

### Skill Types

**Project Skills** (`type: "project"`):
- Specific to Empathy Ledger
- Domain knowledge embedded
- Examples: `codebase-explorer`, `cultural-review`

**General Skills** (`type: "general"`):
- Reusable across projects
- Technology-focused
- Examples: `deployment-workflow`, `supabase-sql-manager`

**Tool Skills** (`type: "tool"`):
- Operate specific tools
- Automation-focused
- Examples: Scripts, CLI wrappers

---

## 🎨 Skill Best Practices

### Writing Effective Skills

1. **Clear Purpose**: First line should state exactly what the skill does
2. **Specific Triggers**: List common phrases that should invoke the skill
3. **Step-by-Step Guidance**: Provide actionable steps, not just information
4. **Code Examples**: Include real code snippets from the project
5. **Context-Aware**: Reference actual files and patterns in the codebase
6. **Cultural Sensitivity**: Especially important for Empathy Ledger

### Skill Content Structure

```markdown
# Skill Name

**Purpose**: One-line description

**Use When**:
- Specific scenario 1
- Specific scenario 2

**Invocation Examples**:
- "Natural language phrase 1"
- "Natural language phrase 2"

---

## Context & Background
[Why this skill exists, domain knowledge]

## Step-by-Step Guide
[Actionable steps with code examples]

## Common Patterns
[Reusable templates and examples]

## Troubleshooting
[Common issues and solutions]

## Related Skills
[Links to other relevant skills]
```

---

## 🔍 Skill Discovery

### Finding the Right Skill

**By browsing this registry**:
- Scan category sections
- Use task/role quick reference tables

**By searching**:
```bash
# Find skills by keyword
grep -r "keyword" .claude/skills/*/skill.md

# List all skills
ls -1 .claude/skills/
```

**By asking Claude**:
```
"What skills are available for [task]?"
"Which skill should I use for [problem]?"
"Show me all deployment-related skills"
```

---

## 📊 Skill Metrics

### Current Statistics

- **Total Skills**: 15+
- **Categories**: 8
- **Lines of Documentation**: 20,000+
- **Most Used**: `codebase-explorer`, `supabase`, `deployment-workflow`

### Skill Coverage Map

| Area | Skills | Coverage |
|------|--------|----------|
| Architecture | 2 | ✅ Excellent |
| Database | 4 | ✅ Excellent |
| Design | 1 | ⚠️ Good |
| Security | 2 | ✅ Excellent |
| Deployment | 1 | ✅ Excellent |
| Analytics | 2 | ⚠️ Good |
| Integrations | 2 | ⚠️ Good |
| Content | 1 | 🔄 Needs expansion |
| Testing | 0 | ❌ Gap |
| Monitoring | 0 | ❌ Gap |

---

## 🎯 Future Skill Opportunities

### High Priority

- [ ] **E2E Testing Skill** - Guide for Playwright tests
- [ ] **API Endpoint Design** - REST/GraphQL patterns
- [ ] **Migration Workflow** - Database migration best practices
- [ ] **Performance Optimization** - Query optimization, caching
- [ ] **Error Monitoring** - Sentry, logging patterns

### Medium Priority

- [ ] **Mobile Testing** - PWA testing on devices
- [ ] **Accessibility** - WCAG compliance patterns
- [ ] **SEO Optimization** - Meta tags, Open Graph
- [ ] **Documentation** - Auto-generating docs
- [ ] **Code Review** - Automated review checklists

### Future Ideas

- [ ] **AI Model Integration** - OpenAI/Claude API patterns
- [ ] **Webhook Management** - Event-driven patterns
- [ ] **Feature Flags** - Progressive rollout
- [ ] **A/B Testing** - Experimentation patterns
- [ ] **Internationalization** - i18n setup

---

## 🛠️ Skill Maintenance

### Regular Reviews

**Monthly**:
- Review skill usage patterns
- Update documentation for accuracy
- Add new examples from recent work
- Check for outdated patterns

**Quarterly**:
- Consolidate overlapping skills
- Archive deprecated skills
- Identify gaps in coverage
- Update this registry

**Annually**:
- Major refactoring if needed
- Technology stack updates
- Comprehensive audit

### Quality Checklist

For each skill, verify:
- [ ] Purpose clearly stated
- [ ] Invocation patterns documented
- [ ] Code examples are current
- [ ] References actual project files
- [ ] No broken links
- [ ] Culturally sensitive (if applicable)
- [ ] Version number current
- [ ] Tools list accurate

---

## 📚 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project context and task management
- [DEPLOYMENT_READY.md](../DEPLOYMENT_READY.md) - Deployment system overview
- [docs/](../docs/) - Technical documentation
- [.claude/agents/](../agents/) - Specialized agents (if different from skills)

---

## 🤝 Contributing Skills

When creating or updating skills:

1. **Follow naming conventions** - Use `skill.md` and `skill.json`
2. **Update this registry** - Keep it synchronized
3. **Test invocation patterns** - Ensure triggers work
4. **Add examples** - Real code from the project
5. **Document thoroughly** - Future you will thank you
6. **Force-add to git** - Skills directory is gitignored by default

---

**Last Updated**: 2025-12-26
**Registry Version**: 1.0.0
**Total Skills**: 15+

---

## Quick Command Reference

```bash
# List all skills
ls -1 .claude/skills/

# Search skills
grep -r "keyword" .claude/skills/

# Create new skill
mkdir -p .claude/skills/new-skill
touch .claude/skills/new-skill/{skill.json,skill.md,README.md}

# Update skill in git
git add -f .claude/skills/skill-name/
git commit -m "feat: update skill-name"

# Run deployment skill script
./scripts/deploy.sh
```
