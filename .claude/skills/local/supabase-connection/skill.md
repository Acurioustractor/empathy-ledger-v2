# Supabase Connection

Database connections, migrations, and operational processes for Empathy Ledger.

## Project Details
- **ID**: `yvnuayzslukamizrlhwb`
- **Region**: ap-southeast-2 (Sydney)
- **Dashboard**: supabase.com/dashboard/project/yvnuayzslukamizrlhwb

## Connection Types
| Type | Port | Use For |
|------|------|---------|
| Pooler | 6543 | API routes, serverless, high concurrency |
| Direct | 5432 | Migrations, admin tasks |

## Client Selection
| Scenario | Client | File |
|----------|--------|------|
| Client components | Browser | `@/lib/supabase/client` |
| Server/API routes | Server | `@/lib/supabase/client-ssr` |
| Admin/bypasses RLS | Service Role | `@/lib/supabase/service-role-client` |

## Quick Commands
```bash
# Link project
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Migration workflow
npx supabase migration new feature_name
npx supabase db push --dry-run
npx supabase db push

# Generate types
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts
```

## Reference Files
| Topic | File |
|-------|------|
| Client types & usage | `refs/clients.md` |
| Migration process | `refs/migrations.md` |
| Troubleshooting | `refs/troubleshooting.md` |

## Environment Variables
Check `.env.local` for:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `DATABASE_URL`

## Related Skills
- `supabase-sql-manager` - SQL patterns
- `supabase-deployment` - Deploy process
- `empathy-ledger-codebase` - Architecture
