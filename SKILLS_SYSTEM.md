# 🎯 Claude Skills System - Complete Guide

## What Is This?

The Empathy Ledger project now has a **comprehensive skills management system** with 15+ specialized Claude Code skills that provide expert guidance for common development tasks.

**Think of skills as expert consultants** - each one knows how to help with specific aspects of the project.

---

## 🚀 Quick Start

### Option 1: Interactive Menu (Recommended)

```bash
./scripts/skills-menu.sh
```

This gives you a beautiful color-coded menu where you can:
- Browse all 17 skills by category
- Read skill documentation
- Run deployment scripts
- Access quick actions

### Option 2: Natural Language (Easiest)

Just ask Claude what you need:

```
You: "I need to deploy to production"
→ Claude invokes: deployment-workflow skill

You: "Show me the database schema"
→ Claude invokes: supabase skill

You: "Design a storyteller card"
→ Claude invokes: design-component skill
```

**You don't need to know skill names!** Claude automatically picks the right skill based on what you're asking.

### Option 3: Browse Documentation

```bash
# Complete registry (comprehensive)
cat .claude/SKILLS_REGISTRY.md

# Quick reference (one-pager)
cat .claude/SKILLS_QUICK_REFERENCE.md
```

---

## 📚 Skills by Category

### 🏗️ Architecture & Codebase (2 skills)

**`codebase-explorer`** - Navigate and understand the codebase
- Use when: Exploring code, understanding data flows, finding features
- Say: "Help me explore the codebase" or "Where is [feature] implemented?"

**`empathy-ledger-codebase`** - Best practices guide
- Use when: Starting features, code review, architecture decisions
- Say: "What are the best practices for [task]?"

### 🗄️ Database & Data (4 skills)

**`supabase`** - Database schema and relationships
- Use when: Writing queries, understanding tables, finding data
- Say: "Show me database schema" or "How do I query stories?"

**`supabase-sql-manager`** - Execute SQL and manage database
- Use when: Running queries, creating migrations, database admin
- Say: "Run this SQL query" or "Create a migration"

**`database-navigator`** - Multi-tenant patterns and RLS
- Use when: Understanding multi-tenancy, RLS policies, tenant data
- Say: "How does multi-tenancy work?" or "Show me RLS policies"

**`data-analysis`** - AI-powered insights and analytics
- Use when: Analyzing themes, extracting quotes, generating insights
- Say: "Analyze story themes" or "Extract quotes from transcripts"

### 🎨 Design & Components (1 skill)

**`design-component`** - UI component design patterns
- Use when: Creating cards, displaying data, AI enrichment, cultural UI
- Say: "Design a storyteller card" or "How do I display themes?"

### 🔐 Security & Compliance (2 skills)

**`cultural-review`** - Cultural sensitivity checks
- Use when: Storyteller features, data collection, privacy, content moderation
- Say: "Is this culturally sensitive?" or "Review this feature"

**`gdpr-compliance`** - Privacy and GDPR compliance
- Use when: Data collection, consent flows, exports, privacy settings
- Say: "Is this GDPR compliant?" or "How do I handle user data?"

### 🚀 Deployment & DevOps (1 skill)

**`deployment-workflow`** - Deploy to GitHub and Vercel
- Use when: Deploying to production, releases, version management
- Say: "Deploy to production" or "I need to release"
- Script: `./scripts/deploy.sh`

### 📊 Analytics & Reporting (2 skills)

**`storyteller-analytics`** - Generate analytics and reports
- Use when: Creating dashboards, reports, understanding behavior
- Say: "Show me storyteller analytics" or "Generate usage report"

### 🔗 Integrations (2 skills)

**`gohighlevel-oauth`** - OAuth integration patterns
- Use when: Integrating with GHL, OAuth setup, external APIs
- Say: "Set up GoHighLevel integration"

**`supabase-connection`** - Connection troubleshooting
- Use when: Connection issues, environment setup, auth config
- Say: "Fix Supabase connection" or "Connection troubleshooting"

### ✍️ Content & Stories (1 skill)

**`story-craft`** - Story creation and curation
- Use when: Story workflows, story features, content moderation
- Say: "Help with story creation" or "Story workflow guidance"

---

## 🎯 Common Use Cases

### "I need to deploy my changes"

```bash
# Option 1: Interactive script
./scripts/deploy.sh

# Option 2: Ask Claude
"I need to deploy to production"
→ Claude guides you through deployment-workflow skill
```

### "I don't understand this codebase"

```
"Help me explore the codebase"
→ Claude invokes codebase-explorer skill
→ Shows you architecture, data flows, file locations
```

### "How do I query stories by theme?"

```
"Show me how to query stories by theme"
→ Claude invokes supabase skill
→ Provides query examples and patterns
```

### "I'm creating a new component"

```
"Design a storyteller card with cultural indicators"
→ Claude invokes design-component skill
→ Shows data model, UI patterns, cultural sensitivity
```

### "Is this feature culturally appropriate?"

```
"Is this feature culturally sensitive?"
→ Claude invokes cultural-review skill
→ Checks against OCAP principles and Indigenous data sovereignty
```

---

## 🗺️ How Skills Are Organized

### File Structure

```
.claude/
├── SKILLS_REGISTRY.md           ← Complete catalog (you are here)
├── SKILLS_QUICK_REFERENCE.md    ← One-page cheat sheet
└── skills/
    ├── codebase-explorer/
    │   ├── SKILL.md
    │   └── ...
    ├── deployment-workflow/
    │   ├── skill.md
    │   ├── skill.json
    │   └── README.md
    ├── design-component/
    │   ├── SKILL.md
    │   ├── ai-enrichment.md
    │   └── card-variants.md
    ├── supabase/
    │   ├── SKILL.md
    │   └── relationship-diagram.md
    └── [13 more skills...]
```

### Naming Conventions

Most skills follow this pattern:
- `skill.json` - Metadata (name, version, triggers, tags)
- `skill.md` - Main documentation
- `README.md` - Quick reference (optional)
- Additional `.md` files - Supplementary docs

---

## 💡 Pro Tips

### You Don't Need to Remember Skill Names

Just describe what you need:
- ❌ "Run the supabase-sql-manager skill"
- ✅ "Help me write a query to get all stories by theme"

Claude automatically picks the right skill!

### Browse Interactively

```bash
./scripts/skills-menu.sh
```

This gives you a visual menu with all skills organized by category.

### Search Skills

```bash
# Find skills mentioning "database"
grep -r "database" .claude/skills/

# List all skill directories
ls -1 .claude/skills/
```

### Quick Reference

Keep this open while working:
```bash
cat .claude/SKILLS_QUICK_REFERENCE.md
```

---

## 🔄 Skills Lifecycle

### How Skills Work

1. **You ask a question** - "How do I deploy?"
2. **Claude matches keywords** - "deploy" → `deployment-workflow` skill
3. **Skill provides guidance** - Step-by-step deployment checklist
4. **You get expert help** - Without needing to know the skill existed!

### Automatic Invocation

Skills are triggered by:
- **Natural language** - "Deploy to production"
- **Keywords** - Mentions of deployment, Vercel, GitHub
- **Context** - Claude sees you're working on deployment code

### Manual Invocation

If you want a specific skill:
```
"Use the design-component skill to help me"
```

But usually not needed - natural language works better!

---

## 📊 Skills Coverage

### What We Have ✅

- Architecture & codebase navigation
- Database schema & queries
- UI component design
- Cultural sensitivity review
- Deployment automation
- Data analysis & insights
- Security & compliance
- Integrations & OAuth
- Story creation workflows

### Future Opportunities 🔄

- E2E testing patterns
- API endpoint design
- Performance optimization
- Mobile PWA testing
- Error monitoring
- Accessibility (WCAG)
- SEO optimization
- Documentation generation

See "Future Skill Opportunities" in `SKILLS_REGISTRY.md`

---

## 🛠️ Managing Skills

### Viewing Skills

```bash
# Interactive menu
./scripts/skills-menu.sh

# Full registry
cat .claude/SKILLS_REGISTRY.md | less

# Quick reference
cat .claude/SKILLS_QUICK_REFERENCE.md

# List all
ls -1 .claude/skills/
```

### Creating New Skills

See "Adding a New Skill" section in `SKILLS_REGISTRY.md` for:
- Directory structure
- Required files (skill.json, skill.md)
- Metadata format
- Best practices
- How to commit (force-add since .claude is gitignored)

### Updating Skills

When a skill needs updates:
1. Edit files in `.claude/skills/skill-name/`
2. Update version in `skill.json`
3. Document changes
4. Commit with: `git add -f .claude/skills/skill-name/`

---

## 🎨 Example Workflow

### Scenario: Deploying a new feature

**Step 1: Ask Claude**
```
You: "I'm ready to deploy my new storyteller analytics feature"
```

**Step 2: Claude Invokes Skills**
```
Claude: [Invokes deployment-workflow skill]
Claude: "Let me help you deploy safely. First, let's run pre-deployment checks..."
```

**Step 3: Interactive Guidance**
```
Claude: "✅ TypeScript build passed
         ✅ Linting passed
         ✅ PWA files verified
         ✅ Database migrations current

         Ready to deploy! Run: ./scripts/deploy.sh"
```

**Step 4: Deploy**
```bash
./scripts/deploy.sh
# → Interactive prompts
# → Version bump
# → Push to GitHub
# → Deploy to Vercel
# → Testing checklist
```

**All without you needing to know:**
- That a `deployment-workflow` skill exists
- Where the skill documentation lives
- What the deployment checklist includes

---

## 📖 Documentation Hierarchy

1. **Quick Reference** (`.claude/SKILLS_QUICK_REFERENCE.md`)
   - One-page overview
   - Most common skills
   - Quick commands

2. **This Guide** (`SKILLS_SYSTEM.md`)
   - Medium-depth overview
   - Use cases and examples
   - How skills work

3. **Complete Registry** (`.claude/SKILLS_REGISTRY.md`)
   - Full catalog of all skills
   - Lifecycle management
   - Maintenance procedures
   - Future opportunities

4. **Individual Skills** (`.claude/skills/*/`)
   - Detailed documentation for each skill
   - Step-by-step guides
   - Code examples
   - Best practices

---

## 🆘 Troubleshooting

### "I can't find the skill I need"

**Browse the registry:**
```bash
cat .claude/SKILLS_REGISTRY.md | less
```

**Or use the interactive menu:**
```bash
./scripts/skills-menu.sh
```

**Or just ask Claude:**
```
"What skills are available for [your task]?"
```

### "The skill isn't working"

**Check if skill file exists:**
```bash
ls .claude/skills/skill-name/
```

**Read the documentation:**
```bash
cat .claude/skills/skill-name/skill.md
```

**Ask Claude for help:**
```
"Help me use the [skill-name] skill"
```

### "I want to create a new skill"

See the "Adding a New Skill" section in `SKILLS_REGISTRY.md` for:
- Template structure
- Required fields
- Best practices
- How to commit

---

## 🎯 Summary

### What You Get

✅ **15+ Expert Skills** - Specialized guidance for common tasks
✅ **Natural Language** - No need to memorize skill names
✅ **Interactive Menu** - Visual skill browser (`./scripts/skills-menu.sh`)
✅ **Comprehensive Docs** - Complete registry and quick reference
✅ **Easy Discovery** - Browse by category, task, or role
✅ **Scalable System** - Easy to add/update skills as project grows

### How to Use

**Easiest**: Just ask Claude naturally
- "Deploy to production"
- "Show me database schema"
- "Design a storyteller card"

**Visual**: Interactive menu
```bash
./scripts/skills-menu.sh
```

**Reference**: Browse documentation
```bash
cat .claude/SKILLS_QUICK_REFERENCE.md
```

### Files to Know

- `.claude/SKILLS_QUICK_REFERENCE.md` - One-page cheat sheet ⭐
- `.claude/SKILLS_REGISTRY.md` - Complete catalog
- `SKILLS_SYSTEM.md` - This guide
- `scripts/skills-menu.sh` - Interactive browser
- `CLAUDE.md` - Main project context (updated with skills section)

---

**🎉 You now have a professional skills management system!**

Just ask Claude what you need, and the right expert knowledge will automatically guide you.

---

**Last Updated**: 2025-12-26
**Version**: 1.0.0
**Total Skills**: 15+
**Quick Start**: `./scripts/skills-menu.sh`
