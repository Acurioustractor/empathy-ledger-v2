# Model Context Protocol (MCP) Setup Guide

## What is MCP?

Model Context Protocol allows Claude Code skills to interact with external tools and services directly:
- Query databases (Supabase/PostgreSQL)
- Create GitHub PRs and issues
- Search the web for documentation
- Access filesystem programmatically

---

## Quick Start

### 1. Configuration File

MCP servers are configured in `.claude/mcp-config.json`.

**Current servers available**:
- ✅ `filesystem` - Enabled (project files access)
- ⏸️ `supabase` - Disabled (needs connection string)
- ⏸️ `github` - Disabled (needs API token)
- ⏸️ `brave-search` - Disabled (needs API key)

### 2. Enable a Server

Edit `.claude/mcp-config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "disabled": false  // Change from true to false
    }
  }
}
```

### 3. Set Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc

# For Supabase server
export POSTGRES_CONNECTION_STRING="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# For GitHub server
export GITHUB_TOKEN="ghp_your_token_here"

# For Brave Search server
export BRAVE_API_KEY="your_api_key_here"
```

**Reload shell**:
```bash
source ~/.bashrc  # or ~/.zshrc
```

---

## Server Details

### Filesystem Server (Enabled ✅)

**Purpose**: Access project files programmatically

**No setup needed** - works out of the box!

**Skills that use it**:
- All skills (file reading/writing)

**Allowed directories**:
- `/Users/benknight/Code/empathy-ledger-v2`
- `/tmp`

---

### Supabase/PostgreSQL Server (Disabled ⏸️)

**Purpose**: Direct database queries from skills

**Setup**:

1. Get connection string from Supabase:
   ```
   Dashboard → Project Settings → Database → Connection String (URI)
   ```

2. Set environment variable:
   ```bash
   export POSTGRES_CONNECTION_STRING="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
   ```

3. Enable in `.claude/mcp-config.json`:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "disabled": false
       }
     }
   }
   ```

**Skills that benefit**:
- `supabase` - Direct query execution
- `supabase-sql-manager` - Database admin tasks
- `database-navigator` - Schema exploration
- `data-analysis` - Query storyteller data

**Example usage**:
```
You: "Query all stories from the last week"
Claude: [Uses MCP to execute SQL directly]
```

**Security note**: Connection string contains password - never commit to git!

---

### GitHub Server (Disabled ⏸️)

**Purpose**: Create PRs, issues, manage repository

**Setup**:

1. Create GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Scopes needed: `repo`, `workflow`
   - Copy token

2. Set environment variable:
   ```bash
   export GITHUB_TOKEN="ghp_your_token_here"
   ```

3. Enable in `.claude/mcp-config.json`:
   ```json
   {
     "mcpServers": {
       "github": {
         "disabled": false
       }
     }
   }
   ```

**Skills that benefit**:
- `deployment-workflow` - Create PRs, check CI status
- Any skill creating features (auto-create issues)

**Example usage**:
```
You: "Create a PR for this feature"
Claude: [Uses MCP to create PR via GitHub API]
```

---

### Brave Search Server (Disabled ⏸️)

**Purpose**: Search web for documentation and solutions

**Setup**:

1. Get Brave Search API key:
   - Go to: https://brave.com/search/api/
   - Sign up for free tier (2,000 queries/month)

2. Set environment variable:
   ```bash
   export BRAVE_API_KEY="your_api_key_here"
   ```

3. Enable in `.claude/mcp-config.json`:
   ```json
   {
     "mcpServers": {
       "brave-search": {
         "disabled": false
       }
     }
   }
   ```

**Skills that benefit**:
- All skills (when you ask "search for [topic]")

**Example usage**:
```
You: "Search for Next.js 15 deployment best practices"
Claude: [Uses MCP to search and summarize results]
```

---

## Security Best Practices

### Environment Variables

✅ **DO**:
- Store secrets in environment variables
- Use `~/.bashrc` or `~/.zshrc` for persistence
- Never echo secrets in scripts

❌ **DON'T**:
- Commit `.env` files with secrets
- Hardcode passwords in config files
- Share connection strings in documentation

### Example .env.local (Not Committed)

```bash
# .env.local (add to .gitignore)
POSTGRES_CONNECTION_STRING="postgresql://..."
GITHUB_TOKEN="ghp_..."
BRAVE_API_KEY="..."
```

Load before using MCP:
```bash
source .env.local
```

---

## Testing MCP Setup

### 1. Check Environment Variables

```bash
# Verify variables are set
echo $POSTGRES_CONNECTION_STRING  # Should show connection string
echo $GITHUB_TOKEN                # Should show ghp_...
echo $BRAVE_API_KEY               # Should show key
```

### 2. Test with Claude

**Filesystem** (should already work):
```
You: "List all files in src/app/"
Claude: [Uses MCP filesystem server]
```

**Supabase** (after enabling):
```
You: "Query the profiles table and show 5 storytellers"
Claude: [Uses MCP to execute SELECT query]
```

**GitHub** (after enabling):
```
You: "Show me open issues in this repository"
Claude: [Uses MCP GitHub server]
```

---

## Troubleshooting

### Issue: MCP server not working

**Check**:
1. Environment variable set correctly
   ```bash
   echo $VARIABLE_NAME
   ```

2. Server enabled in config
   ```json
   { "disabled": false }
   ```

3. Restart Claude Code after changes

### Issue: Permission denied

**Solution**: Check `allowedDirectories` in `.claude/mcp-config.json`

Only these paths are accessible:
- `/Users/benknight/Code/empathy-ledger-v2`
- `/tmp`

### Issue: Database connection fails

**Check**:
- Connection string correct (from Supabase dashboard)
- Password updated (if changed in Supabase)
- Database is running
- Network allows connection

---

## Advanced Configuration

### Custom MCP Servers

You can add custom MCP servers:

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "node",
      "args": ["./scripts/custom-mcp-server.js"],
      "env": {
        "CUSTOM_VAR": "${CUSTOM_VAR}"
      },
      "description": "Your custom server"
    }
  }
}
```

### Multiple Environments

Create environment-specific configs:

```bash
# Development
.claude/mcp-config.dev.json

# Production
.claude/mcp-config.prod.json

# Use with
cp .claude/mcp-config.dev.json .claude/mcp-config.json
```

---

## Skills Integration

### How Skills Use MCP

Skills automatically use available MCP servers when relevant:

**Example**: `supabase` skill
```markdown
When MCP Supabase server enabled:
→ Can execute queries directly
→ Real-time schema inspection
→ Query results in responses

When MCP Supabase server disabled:
→ Provides SQL you should run manually
→ Suggests query patterns
→ No direct execution
```

### Skill Enhancement Opportunities

With MCP, skills can:
- **Database skills**: Execute queries, not just show examples
- **Deployment skills**: Create PRs, check CI status
- **Analysis skills**: Query data for real insights
- **Integration skills**: Test APIs directly

---

## Recommended Setup

### For Development

**Enable**:
- ✅ filesystem (already enabled)
- ✅ supabase (for database work)
- ✅ github (for deployment)

**Optional**:
- ⏸️ brave-search (if you want web search)

### For Production

Use MCP carefully in production:
- ✅ Read-only database connections
- ✅ Limited scope GitHub tokens
- ❌ Avoid write operations via MCP

---

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude/docs/mcp)

---

## Quick Commands

```bash
# Check setup
cat .claude/mcp-config.json

# View environment variables
env | grep -E "POSTGRES_|GITHUB_|BRAVE_"

# Test Supabase connection
psql $POSTGRES_CONNECTION_STRING -c "SELECT version();"

# Restart Claude Code (to apply changes)
# Exit and restart Claude Code CLI
```

---

**Last Updated**: 2025-12-26
**Status**: Filesystem enabled, others optional
