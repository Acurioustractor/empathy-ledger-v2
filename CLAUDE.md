# Empathy Ledger v2 - Context Management Optimized

## Project Overview
Multi-tenant storytelling platform for Indigenous communities and organizations with cultural sensitivity protocols.

## Current Focus
- ✅ Component modularization completed (ProjectManagement.tsx split)
- ✅ Database types organization completed
- ✅ ProfileDashboard.tsx optimized (1,191 → 657 lines, 45% reduction)
- ✅ Context optimization strategy implemented
- ✅ Complete field storytelling workflow (magic links, notifications, PWA)
- ✅ Deployment automation system with skills (./scripts/deploy.sh)

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

### Large Files to Avoid Reading Fully
| File | Lines | Approach |
|------|-------|----------|
| `src/lib/database/types/*.ts` | 300-500 each | Search for specific types |
| `src/components/*/tabs/*.tsx` | 200-400 each | Target specific tab |
| API routes | varies | Read only the route you need |

### Codebase Navigation
```bash
# Find files by pattern
glob "src/**/*Dashboard*.tsx"

# Search for code
grep "function handleSubmit" --type ts

# Check component structure
ls src/components/profile/tabs/
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

## Next Actions
Use `bd ready` to see current tasks. Priority items:
- Review cultural safety moderation system (el-qdo)
- Enhance multi-tenant organization dashboard (el-b8e)

## Task Management with Beads

This project uses [Beads](https://github.com/steveyegge/beads) for AI-native task tracking. Beads is a graph-based issue tracker designed for coding agents.

### Commands (binaries in ~/bin/)
```bash
# View tasks
~/bin/bd list              # List all issues
~/bin/bd ready             # Show unblocked work ready to start
~/bin/bd show el-1         # Show specific issue details

# Create tasks
~/bin/bd create "Task description" -p 1 -t feature
# Priority: 0=critical, 1=high, 2=medium, 3=low, 4=backlog

# Manage dependencies
~/bin/bd dep add el-2 el-1   # el-1 blocks el-2
~/bin/bd dep tree el-1       # Visualize dependency tree

# Update status
~/bin/bd update el-1 --status in_progress
~/bin/bd close el-1 --reason "Completed in commit abc123"

# Visualization (TUI)
~/bin/bv                   # Interactive terminal viewer
~/bin/bv --robot-plan      # JSON output for AI consumption
~/bin/bv --robot-priority  # Priority-sorted JSON
```

### Workflow Guidelines
1. **Before starting work**: Run `~/bin/bd ready` to see available tasks
2. **When discovering new work**: Create tasks with `~/bin/bd create`
3. **Track dependencies**: Use `~/bin/bd dep add` when tasks block each other
4. **Update status**: Mark tasks `in_progress` when starting, `close` when done
5. **Graph analysis**: Use `~/bin/bv` for visual dependency exploration

### Issue Prefix
All issues use the `el-` prefix (Empathy Ledger): el-1, el-2, etc.

## Claude Skills System

This project has 15+ specialized Claude Code skills for common tasks. Skills are automatically invoked through natural language.

### Quick Access
```bash
# Interactive skills menu
./scripts/skills-menu.sh

# View all skills
cat .claude/SKILLS_REGISTRY.md

# Quick reference
cat .claude/SKILLS_QUICK_REFERENCE.md
```

### Most Common Skills
| Task | Say This | Skill |
|------|----------|-------|
| Deploy | "Deploy to production" | `deployment-workflow` |
| Explore code | "Help me understand the codebase" | `codebase-explorer` |
| Database | "Show me database schema" | `supabase` |
| Design | "Design a storyteller card" | `design-component` |
| Cultural check | "Is this culturally sensitive?" | `cultural-review` |
| Data analysis | "Analyze story themes" | `data-analysis` |

### Skill Categories
- 🏗️ **Architecture**: `codebase-explorer`, `empathy-ledger-codebase`
- 🗄️ **Database**: `supabase`, `supabase-sql-manager`, `database-navigator`, `data-analysis`
- 🎨 **Design**: `design-component`
- 🔐 **Security**: `cultural-review`, `gdpr-compliance`
- 🚀 **Deployment**: `deployment-workflow`
- 📊 **Analytics**: `storyteller-analytics`
- 🔗 **Integrations**: `gohighlevel-oauth`
- ✍️ **Content**: `story-craft`

See `.claude/SKILLS_REGISTRY.md` for complete documentation.