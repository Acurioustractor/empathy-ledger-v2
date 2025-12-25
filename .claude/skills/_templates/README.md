# Skill Templates

This directory contains templates for creating new Claude Code skills quickly and consistently.

## Available Templates

### Basic Skill Template

**Location**: `basic-skill/`

**Use For**:
- Simple, focused skills
- Single-purpose utilities
- Quick reference skills

**Includes**:
- `skill.json` - Metadata and configuration
- `skill.md` - Main documentation
- `README.md` - Quick reference

**Create New Skill**:
```bash
cp -r .claude/skills/_templates/basic-skill .claude/skills/new-skill-name
cd .claude/skills/new-skill-name
# Edit files to customize
```

---

### Advanced Skill Template

**Location**: `advanced-skill/`

**Use For**:
- Complex, multi-step workflows
- Skills with integrations
- Comprehensive feature sets

**Includes**:
- `skill.json` - Metadata
- `skill.md` - Comprehensive documentation with:
  - Table of contents
  - Prerequisites
  - Multiple phases
  - Advanced features
  - Integrations
  - Performance optimization
  - Best practices
  - Testing
- `examples/` - Code examples
- `README.md` - Quick reference

**Create New Skill**:
```bash
cp -r .claude/skills/_templates/advanced-skill .claude/skills/new-skill-name
cd .claude/skills/new-skill-name
# Edit files to customize
```

---

## Quick Start Guide

### 1. Choose Template

Pick `basic-skill` or `advanced-skill` based on complexity.

### 2. Copy Template

```bash
# For basic skill
cp -r .claude/skills/_templates/basic-skill .claude/skills/my-new-skill

# For advanced skill
cp -r .claude/skills/_templates/advanced-skill .claude/skills/my-new-skill
```

### 3. Customize Metadata

Edit `skill.json`:
```json
{
  "name": "my-new-skill",
  "description": "What your skill does",
  "triggers": ["keyword1", "keyword2"],
  "category": "appropriate-category",
  "priority": "high"
}
```

### 4. Write Documentation

Edit `skill.md`:
- Update purpose and use cases
- Add step-by-step instructions
- Include code examples
- Add troubleshooting tips

### 5. Add to Index

Update `.claude/skills/index.json`:
```json
{
  "skills": [
    {
      "name": "my-new-skill",
      "path": "my-new-skill",
      "triggers": ["keyword1", "keyword2"],
      "priority": "high"
    }
  ]
}
```

### 6. Update Registry

Update `.claude/SKILLS_REGISTRY.md`:
- Add to appropriate category
- Add to quick reference tables
- Document invocation patterns

### 7. Commit to Git

```bash
git add -f .claude/skills/my-new-skill/
git commit -m "feat: add my-new-skill Claude skill"
```

---

## Template Customization Guide

### skill.json Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique skill identifier (kebab-case) |
| `description` | Yes | One-line description |
| `version` | Yes | Semantic version (1.0.0) |
| `type` | Yes | `project` or `general` |
| `category` | Yes | Category for organization |
| `priority` | Yes | `critical`, `high`, `medium`, `low` |
| `triggers` | Yes | Keywords for auto-invocation |
| `tags` | Yes | Searchable tags |
| `tools` | Optional | Required Claude tools |
| `author` | Optional | Creator name |

### skill.md Sections

**Essential** (always include):
- Purpose statement
- Use cases
- Invocation examples
- Step-by-step guide

**Recommended** (for most skills):
- Context & background
- Common patterns
- Troubleshooting
- Examples

**Optional** (for complex skills):
- Prerequisites
- Advanced features
- Integrations
- Performance optimization
- Best practices
- Testing

---

## Naming Conventions

### Skill Names
- Use kebab-case: `deployment-workflow`, `design-component`
- Be descriptive: `data-analysis` not `analyze`
- Avoid redundancy: `supabase` not `supabase-skill`

### File Names
- `skill.json` - Metadata (always lowercase)
- `skill.md` - Main docs (always lowercase)
- `README.md` - Quick reference (always uppercase)
- `examples/` - Code samples (lowercase directory)

### Trigger Keywords
- Use natural language: "deploy to production"
- Include variations: "deploy", "deployment", "release"
- Be specific: "storyteller card" not just "card"

---

## Best Practices

### Documentation
- ✅ Write for beginners - assume no prior knowledge
- ✅ Include code examples from the actual project
- ✅ Show expected output
- ✅ Document common errors
- ❌ Don't assume user knows the codebase
- ❌ Don't skip verification steps

### Code Examples
- ✅ Use real file paths from project
- ✅ Show complete, runnable code
- ✅ Include error handling
- ❌ Don't use pseudo-code
- ❌ Don't omit imports

### Triggers
- ✅ Include 5-10 keywords
- ✅ Use natural language phrases
- ✅ Think about what users will actually say
- ❌ Don't use obscure terminology
- ❌ Don't overlap too much with other skills

---

## Testing Your Skill

### 1. Test Auto-Invocation

Try these phrases:
- "Help me [trigger keyword]"
- "I need to [trigger keyword]"
- "Show me how to [trigger keyword]"

Verify Claude loads your skill.

### 2. Test Documentation

- Read through as if you're a new user
- Follow steps exactly as written
- Verify all code examples work
- Check all links

### 3. Test with Team

- Share with colleague
- Ask them to use it without your help
- Collect feedback
- Iterate

---

## Maintenance

### Regular Reviews

**Monthly**:
- [ ] Verify examples still work
- [ ] Update for any codebase changes
- [ ] Check trigger keywords still relevant

**Quarterly**:
- [ ] Review for accuracy
- [ ] Add new examples
- [ ] Consolidate learnings

**Annually**:
- [ ] Major refactor if needed
- [ ] Technology updates
- [ ] Comprehensive audit

---

## Examples of Good Skills

**To Learn From**:
- `deployment-workflow` - Comprehensive, actionable
- `design-component` - Well-organized, examples
- `cultural-review` - Critical domain knowledge
- `supabase` - Clear query patterns

**Study These For**:
- Clear structure
- Helpful examples
- Effective triggers
- Good troubleshooting sections

---

## Questions?

See:
- `.claude/SKILLS_REGISTRY.md` - Complete skill catalog
- `.claude/SKILLS_QUICK_REFERENCE.md` - Quick reference
- `scripts/skills-menu.sh` - Interactive browser

Or ask Claude: "How do I create a new skill?"

---

**Last Updated**: 2025-12-26
