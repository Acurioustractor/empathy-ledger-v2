# Supabase Access Guide

**Last Updated:** December 22, 2025
**Purpose:** World-class setup for Supabase access, MCP integration, and API key management

---

## Quick Links

| Resource | URL |
|----------|-----|
| **Project Dashboard** | https://app.supabase.com/project/yvnuayzslukamizrlhwb |
| **API Settings** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/settings/api |
| **Database Schema** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/editor |
| **SQL Editor** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/sql |
| **Auth Users** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/auth/users |
| **Storage Buckets** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/storage/buckets |
| **Edge Functions** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/functions |
| **Logs** | https://app.supabase.com/project/yvnuayzslukamizrlhwb/logs/explorer |
| **Personal Access Tokens** | https://app.supabase.com/dashboard/account/tokens |

---

## MCP (Model Context Protocol) Setup

### What is MCP?

MCP allows AI assistants (Claude Code, Cursor, Windsurf) to interact directly with your Supabase project - querying data, viewing schema, and even running migrations.

### Current Configuration

Located at `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=yvnuayzslukamizrlhwb&read_only=true&features=database,docs,debugging,development"
    },
    "supabase-write": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=yvnuayzslukamizrlhwb&features=database,docs,debugging,development,functions,branching"
    }
  }
}
```

### MCP URL Parameters

| Parameter | Description | Recommendation |
|-----------|-------------|----------------|
| `project_ref` | Your Supabase project ID | **Always set** - limits access to one project |
| `read_only` | Execute queries as read-only user | **true for development** - prevents accidental writes |
| `features` | Comma-separated feature groups | Limit to what you need |

### Available Feature Groups

| Feature | Description | Included By Default |
|---------|-------------|---------------------|
| `account` | Project/org management | ✅ |
| `database` | Tables, schema, SQL queries | ✅ |
| `docs` | Documentation search | ✅ |
| `debugging` | Logs and advisors | ✅ |
| `development` | API keys, type generation | ✅ |
| `functions` | Edge function deployment | ✅ |
| `branching` | Database branching | ✅ |
| `storage` | Bucket configuration | ❌ |

### MCP Tools Available

When connected, your AI assistant can:

**Database Operations:**
- `list_tables` - View all tables and columns
- `list_extensions` - See installed Postgres extensions
- `list_migrations` - View migration history
- `apply_migration` - Run new migrations (if not read-only)
- `execute_sql` - Run SQL queries

**Development:**
- `get_project_url` - Get API endpoints
- `get_publishable_keys` - Retrieve API keys
- `generate_typescript_types` - Generate types from schema

**Debugging:**
- `get_logs` - View application logs
- `get_advisors` - Performance recommendations

---

## API Key Types

### Current Keys (Legacy Format)

| Key Type | Prefix | Usage | Security |
|----------|--------|-------|----------|
| **Anon Key** | `eyJ...` | Client-side, respects RLS | Safe to expose |
| **Service Role** | `eyJ...` | Server-side, bypasses RLS | **NEVER expose** |

### New Keys (Q2 2025+)

Supabase is transitioning to new key formats:

| Key Type | Prefix | Usage | Benefits |
|----------|--------|-------|----------|
| **Publishable** | `sb_publishable_...` | Client-side | Low privilege, safe to expose |
| **Secret** | `sb_secret_...` | Server-side only | Instant revocation, browser-blocked |

**Key improvements:**
- Secret keys can't be used from browsers (HTTP 401)
- Multiple secret keys for zero-downtime rotation
- Instant revocation (no more JWT expiry waiting)

See: https://github.com/orgs/supabase/discussions/29260

---

## Client Setup Best Practices

### 1. Browser Client (`client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

// Uses anon key, respects RLS, cookie-based auth
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Server SSR Client (`client-ssr.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Uses anon key but with server-side cookie access
export const createSupabaseServerClient = () => {
  return createServerClient<Database>(url, anonKey, {
    cookies: { getAll, setAll },
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'x-application-name': 'empathy-ledger-server' } }
  })
}
```

### 3. Service Role Client (`server.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

// Uses service role key, BYPASSES RLS - use carefully!
export const createAdminClient = () => {
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

### When to Use Each Client

| Scenario | Client | RLS Respected |
|----------|--------|---------------|
| React components | Browser | ✅ Yes |
| API routes (user context) | Server SSR | ✅ Yes |
| Server actions | Server SSR | ✅ Yes |
| Background jobs | Service Role | ❌ No |
| Admin operations | Service Role | ❌ No |
| Webhooks | Service Role | ❌ No |

---

## Security Best Practices

### 1. Never Expose Service Role Key

```typescript
// ❌ WRONG - service key in client bundle
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ✅ CORRECT - use anon key for client
const supabase = createBrowserClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### 2. Always Use RLS

All tables should have Row Level Security enabled. Check with:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

### 3. Scope MCP to Development

```json
{
  "url": "https://mcp.supabase.com/mcp?project_ref=xxx&read_only=true"
}
```

### 4. Use Database Branching for Testing

```bash
# Create a development branch
npx supabase branches create feature-xyz

# Test migrations safely
npx supabase db push --branch feature-xyz

# Merge when ready
npx supabase branches merge feature-xyz
```

---

## Type Generation

### Generate Types from Live Schema

```bash
# Using Supabase CLI
npx supabase gen types typescript --local > src/types/database/generated.ts

# Using MCP (via AI assistant)
# The assistant can call generate_typescript_types
```

### Current Type Files

| File | Tables Covered |
|------|----------------|
| `user-profile.ts` | profiles, profile_locations, profile_organizations |
| `organization-tenant.ts` | organisations, organization_members, tenants |
| `project-management.ts` | projects, project_participants |
| `content-media.ts` | stories, transcripts, media_assets |
| `story-ownership.ts` | story_distributions, embed_tokens |

---

## Troubleshooting

### MCP Connection Issues

1. **Authentication failed**: Re-authenticate via browser
   - Delete cached credentials
   - Restart Claude Code/Cursor
   - Login when prompted

2. **Project not found**: Check project_ref in URL
   - Find at: Project Settings → General → Project ID

3. **Permission denied**: Check feature scoping
   - Some features require specific permissions
   - Verify your org role

### API Key Issues

1. **401 Unauthorized with new keys**:
   - Secret keys can't be used from browsers
   - Check you're using publishable key for client-side

2. **Key not working after rotation**:
   - New keys take effect immediately
   - Old keys are revoked immediately
   - Update all services in parallel

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional (for CI/MCP automation)
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_PROJECT_REF=yvnuayzslukamizrlhwb
```

---

## Related Documentation

- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [MCP Security Best Practices](https://supabase.com/docs/guides/getting-started/mcp#security-recommendations)
- [API Key Migration Discussion](https://github.com/orgs/supabase/discussions/29260)
- [Database Alignment Audit](./DATABASE_ALIGNMENT_AUDIT.md)
- [Supabase Skill](./.claude/skills/supabase/SKILL.md)

---

*This guide follows Supabase's December 2025 best practices for secure, world-class database access.*
