# Claude Skills - Quick Reference Card

## 🎯 Most Common Skills

| What You Need | Say This | Or Use |
|---------------|----------|--------|
| **Deploy to production** | "Deploy to production" | `./scripts/deploy.sh` |
| **Understand codebase** | "Help me explore the codebase" | Read `.claude/skills/codebase-explorer/` |
| **Query database** | "Show me how to query stories" | Read `.claude/skills/supabase/` |
| **Design a card** | "Design a storyteller card" | Read `.claude/skills/design-component/` |
| **Check cultural safety** | "Is this culturally sensitive?" | Read `.claude/skills/cultural-review/` |
| **Analyze story data** | "Analyze story themes" | Read `.claude/skills/data-analysis/` |

## 📚 All Skills by Category

### 🏗️ Architecture
- `codebase-explorer` - Navigate codebase architecture
- `empathy-ledger-codebase` - Best practices guide

### 🗄️ Database
- `supabase` - Database schema and queries
- `supabase-sql-manager` - Execute SQL
- `database-navigator` - Multi-tenant patterns
- `data-analysis` - AI-powered insights

### 🎨 Design
- `design-component` - UI components

### 🔐 Security
- `cultural-review` - Cultural sensitivity
- `gdpr-compliance` - Privacy compliance

### 🚀 Deployment
- `deployment-workflow` - Deploy to production

### 📊 Analytics
- `storyteller-analytics` - Generate reports

### 🔗 Integrations
- `gohighlevel-oauth` - OAuth setup

### ✍️ Content
- `story-craft` - Story workflows

## 🚀 Quick Actions

```bash
# View all skills interactively
./scripts/skills-menu.sh

# Read skills registry
cat .claude/SKILLS_REGISTRY.md

# Deploy to production
./scripts/deploy.sh

# Generate app icons
./scripts/create-icons.sh
```

## 💬 Natural Language Invocation

Just ask Claude naturally:

- "I need to deploy to production"
- "Show me the database schema"
- "How do I query stories by theme?"
- "Design a storyteller card with themes"
- "Is this feature culturally appropriate?"
- "Help me explore the codebase"
- "Analyze story themes"
- "Create a migration"

## 📍 Skill Locations

All skills are in: `.claude/skills/`

```
.claude/skills/
├── codebase-explorer/
├── cultural-review/
├── data-analysis/
├── database-navigator.md
├── deployment-workflow/
├── design-component/
├── empathy-ledger-codebase/
├── gdpr-compliance/
├── gohighlevel-oauth/
├── story-craft/
├── storyteller-analytics.md
├── supabase/
└── supabase-sql-manager/
```

## 🔍 Finding Skills

**Interactive menu**:
```bash
./scripts/skills-menu.sh
```

**Search for keyword**:
```bash
grep -r "keyword" .claude/skills/
```

**List all skills**:
```bash
ls -1 .claude/skills/
```

**Full registry**:
```bash
cat .claude/SKILLS_REGISTRY.md
```

## 🎨 Skill Types

| Icon | Type | Examples |
|------|------|----------|
| 🏗️ | Architecture | `codebase-explorer`, `empathy-ledger-codebase` |
| 🗄️ | Database | `supabase`, `database-navigator` |
| 🎨 | Design | `design-component` |
| 🔐 | Security | `cultural-review`, `gdpr-compliance` |
| 🚀 | DevOps | `deployment-workflow` |
| 📊 | Analytics | `data-analysis`, `storyteller-analytics` |
| 🔗 | Integration | `gohighlevel-oauth` |
| ✍️ | Content | `story-craft` |

## 🆘 Help

**Can't find the right skill?**
- Browse: `.claude/SKILLS_REGISTRY.md`
- Menu: `./scripts/skills-menu.sh`
- Ask: "What skills are available for [task]?"

**Skill not working?**
- Check location: `ls .claude/skills/skill-name/`
- Read docs: `cat .claude/skills/skill-name/skill.md`
- Ask: "Help me use the [skill-name] skill"

**Want to create a skill?**
- Template: See "Adding a New Skill" in `SKILLS_REGISTRY.md`
- Location: `.claude/skills/new-skill-name/`
- Files needed: `skill.json`, `skill.md`

---

**💡 Tip**: You don't need to remember skill names! Just describe what you need in natural language, and Claude will invoke the right skill automatically.

---

**Last Updated**: 2025-12-26
