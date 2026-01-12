# Install Continuous Claude v3 - Interactive Wizard Guide

**Status**: Ready to Run
**Location**: `/Users/benknight/Code/Continuous-Claude-v3`
**Prerequisites**: ✅ All met

---

## 🚀 Quick Start

Open a new terminal and run:

```bash
cd /Users/benknight/Code/Continuous-Claude-v3/opc
uv run python -m scripts.setup.wizard
```

Then follow the prompts below.

---

## 📋 Wizard Prompts & Recommended Answers

The wizard will ask you 12 questions. Here are the recommended answers:

### Step 0: Backup
✅ **Automatic** - Backs up `~/.claude` to `.claude.backup.TIMESTAMP`

### Step 1: System Requirements Check
✅ **Automatic** - Checks Docker, Python, uv

### Step 2: Database Configuration
**Prompt**: `Configure database connection? [y/n]`
**Recommended**: `n` (use defaults)

**Default configuration:**
- Host: localhost
- Port: 5432
- Database: continuity
- User: postgres
- Password: postgres

**If you choose `y` (custom):**
- Useful if port 5432 is already in use
- Or if using remote PostgreSQL

### Step 3: API Keys (Optional)
**Prompt**: `Configure API keys? [y/n]`
**Recommended**: `n` (skip for now, add later)

**Optional APIs:**
- **Perplexity** - Enhanced web search ($20/month, very good)
- **NIA** - Research summaries (free tier available)
- **Anthropic** - For custom agents (you likely already have this)

**Note**: You can add these later by editing `~/.claude/.env`

### Step 4: Math Features
**Prompt**: `Install math features (SymPy, Z3, Pint)? [y/n]`
**Recommended**: `n` (unless you need symbolic math)

**What it includes:**
- SymPy - Symbolic mathematics
- Z3 - Theorem prover
- Pint - Unit conversions

**For Empathy Ledger**: Not needed

### Step 5: Start Docker Stack
**Prompt**: `Start Docker containers now? [y/n]`
**Recommended**: `y` (required for memory system)

**What starts:**
- PostgreSQL with pgvector extension
- Port: 5432 (configurable)
- Storage: Persistent volume

### Step 6: Run Database Migrations
✅ **Automatic** - Creates tables for memory system

### Step 7: Install Claude Code Integration
✅ **Automatic** - Installs:
- 32 agents → `~/.claude/agents/`
- 109 skills → `~/.claude/skills/`
- 30 hooks → `~/.claude/hooks/`
- Rules → `~/.claude/rules/`

### Step 8: TLDR Code Analysis
**Prompt**: `Install TLDR tool? [y/n]`
**Recommended**: `y` (THIS IS THE BIG WIN!)

**What it does:**
- 5-layer code analysis
- 95% token savings on file reads
- Semantic indexing

**Example:**
- Before: 2,708 tokens to read ProjectManagement.tsx
- After: ~135 tokens (TLDR summary)
- **Savings**: 95%!

### Step 9: Install Diagnostic Tools
**Prompt**: `Install diagnostics? [y/n]`
**Recommended**: `y` (helpful for debugging)

**Tools:**
- Token usage tracker
- Agent performance monitor
- Memory system inspector

### Step 10: Loogle Integration (Lean Theorem Prover)
**Prompt**: `Install Loogle? [y/n]`
**Recommended**: `n` (not needed for web development)

**What it is:**
- Lean4 theorem prover search
- For formal verification
- Overkill for most projects

### Step 11: Finalize Setup
✅ **Automatic** - Creates config files, validates installation

### Step 12: Success!
✅ **Shows summary** and next steps

---

## 🎯 Recommended Configuration Summary

**Quick answers (for copy-paste speed):**
```
Step 2 - Database config: n
Step 3 - API keys: n (add later if needed)
Step 4 - Math features: n
Step 5 - Start Docker: y
Step 8 - TLDR tool: y (CRITICAL!)
Step 9 - Diagnostics: y
Step 10 - Loogle: n
```

**Time**: ~10-15 minutes (includes package downloads)

---

## ✅ Post-Installation Verification

After the wizard completes, verify installation:

```bash
# Check installed agents
ls ~/.claude/agents/ | wc -l
# Should show: 32

# Check installed skills
ls ~/.claude/skills/ | wc -l
# Should show: 109

# Check Docker containers
docker ps
# Should show: continuity-postgres running

# Test TLDR
cd /Users/benknight/Code/empathy-ledger-v2
# Start Claude Code and read a large file
# Should see TLDR summary instead of full file
```

---

## 🎨 After Installation: Custom Empathy Ledger Skills

Once installed, we'll create 5 custom skills for your project:

### 1. `/simplify-component`
```bash
# Location: ~/.claude/skills/local/simplify-component/
```
Apply our proven refactoring patterns:
- Extract constants
- Extract utilities
- Create primitive components
- Generate before/after summary

### 2. `/archive-session`
```bash
# Location: ~/.claude/skills/local/archive-session/
```
Auto-archive session reports:
- Move to `.archive/2026-01/session-reports/`
- Update INDEX.md
- Create summary

### 3. `/cultural-check`
```bash
# Location: ~/.claude/skills/local/cultural-check/
```
Cultural safety verification:
- OCAP compliance check
- Consent management review
- Elder approval workflow validation

### 4. `/docs-navigator`
```bash
# Location: ~/.claude/skills/local/docs-navigator/
```
Smart PMPP navigation:
- Find docs by number (04-database)
- Search by topic
- Update master indexes

### 5. `/migration-create`
```bash
# Location: ~/.claude/skills/local/migration-create/
```
Guided migration creation:
- Generate timestamped file
- Populate template (UP + DOWN)
- Update timeline.json
- Add entry to README

---

## 🔧 Configuration Files Created

After installation, you'll have:

**Main config:**
- `~/.claude/.env` - Environment variables (API keys, DB connection)
- `~/.claude/config.yaml` - Agent and skill configuration

**Installation:**
- `~/.claude/agents/` - 32 specialized agents
- `~/.claude/skills/` - 109 built-in skills (+ your custom ones)
- `~/.claude/hooks/` - 30 lifecycle hooks
- `~/.claude/rules/` - Behavioral rules

**Backup:**
- `~/.claude.backup.TIMESTAMP/` - Your original config (if existed)

---

## 🐛 Troubleshooting

### Docker Won't Start
```bash
# Check Docker is running
docker info

# If not running
open -a Docker

# Wait 30 seconds, try again
```

### Port 5432 Already in Use
```bash
# Find what's using port 5432
lsof -i :5432

# Stop it or reconfigure wizard with different port
# When wizard asks "Configure database connection?" → Answer "y"
# Change port to 5433 (or any free port)
```

### uv Command Not Found
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="$HOME/.local/bin:$PATH"

# Reload shell
source ~/.zshrc
```

### Wizard Fails Midway
```bash
# Restore backup if needed
rm -rf ~/.claude
mv ~/.claude.backup.TIMESTAMP ~/.claude

# Try again
cd /Users/benknight/Code/Continuous-Claude-v3/opc
uv run python -m scripts.setup.wizard
```

---

## 📊 Expected Results

### File Structure After Installation
```
~/.claude/
├── .env                        # Environment configuration
├── config.yaml                 # Main configuration
├── agents/
│   ├── architect.md           # Planning agent
│   ├── kraken.md              # Code execution agent
│   ├── oracle.md              # Codebase knowledge agent
│   ├── scout.md               # Exploration agent
│   └── ... (28 more)
├── skills/
│   ├── global/
│   │   ├── ask-docs/          # Documentation search
│   │   ├── create-handoff/    # Session continuity
│   │   └── ... (109 total)
│   └── local/
│       └── (your custom skills go here)
├── hooks/
│   ├── pre-read.py            # TLDR analysis
│   ├── post-edit.py           # Auto-formatting
│   ├── pre-commit.py          # Validation
│   └── ... (27 more)
└── rules/
    ├── behavioral.yaml        # Agent behavior rules
    └── routing.yaml           # Tool routing rules
```

### Docker Containers Running
```bash
$ docker ps
CONTAINER ID   IMAGE                  STATUS
abc123def456   postgres:16-alpine     Up 5 minutes   0.0.0.0:5432->5432/tcp
```

### Database Tables Created
```sql
-- Memory system tables
- learnings         -- Extracted insights from sessions
- embeddings        -- Vector embeddings for semantic search
- session_history   -- Session metadata and handoffs
- agent_performance -- Agent usage analytics
```

---

## 🎯 Success Criteria

After installation, you should be able to:

1. ✅ Start Claude Code normally (no errors)
2. ✅ See TLDR summaries when reading large files
3. ✅ Use `/create-handoff` to save session state
4. ✅ Ask "What did we learn last session?" and get answers
5. ✅ Run custom skills (after we create them)

---

## 🚀 Next Steps After Installation

Once the wizard completes successfully:

**Immediate:**
1. Test TLDR analysis on a large file
2. Create your first handoff: `/create-handoff`
3. Explore available skills: Ask "What skills are available?"

**Within 1 hour:**
1. Create the 5 custom Empathy Ledger skills
2. Configure any optional API keys you want
3. Test memory system: Ask about previous session

**Within 1 day:**
1. Use Continuous Claude for actual development work
2. Notice the massive token efficiency improvements
3. Let the memory system learn your patterns

---

## 📞 Support

**If installation fails:**
1. Check [troubleshooting section](#-troubleshooting) above
2. Review `/Users/benknight/Code/Continuous-Claude-v3/README.md`
3. Check `/Users/benknight/Code/Continuous-Claude-v3/docs/`

**After successful installation:**
1. Read `CONTINUOUS_CLAUDE_INTEGRATION_PLAN.md` for custom skills
2. Check `.claude/SESSION_STATE.md` for session continuity
3. Review your simplified codebase to see it in action

---

## 💡 Pro Tips

1. **Accept defaults** - The wizard's defaults are well-chosen
2. **Skip optional features** - Add them later if needed
3. **Say YES to TLDR** - This is the biggest win (95% token savings!)
4. **Say YES to diagnostics** - Helpful for monitoring
5. **Say NO to Loogle** - Unless you're doing formal verification

---

## 🎉 Ready to Install!

**Your optimized codebase + Continuous Claude = 99.3% token efficiency**

Run this command and follow the prompts above:

```bash
cd /Users/benknight/Code/Continuous-Claude-v3/opc
uv run python -m scripts.setup.wizard
```

**Installation time**: ~10-15 minutes
**Lifetime benefit**: Massive efficiency gains on every future session

---

**Good luck! See you on the other side with your supercharged development environment!** 🚀
