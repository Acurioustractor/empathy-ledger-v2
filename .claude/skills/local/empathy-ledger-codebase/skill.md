# Empathy Ledger Codebase

Multi-tenant storytelling platform for Indigenous communities with cultural sensitivity protocols.

## When to Use
- Starting new features/components
- Architecture decisions
- Database migrations
- API endpoints
- UI components
- Cultural safety review

## Quick Facts
- **Stack**: Next.js 15, React 19, TypeScript, Supabase, Tailwind
- **UI**: shadcn/ui + Editorial Warmth design system
- **State**: Server Components default, Client hooks when needed
- **DB**: PostgreSQL with RLS multi-tenancy

## Core Principles
1. Server-first (RSC by default)
2. Type safety (strict TS, generated DB types)
3. Cultural safety (protocols at every level)
4. Multi-tenancy (RLS isolation)

## Reference Files
Read these as needed - don't load all at once:

| Topic | File |
|-------|------|
| Architecture & structure | `refs/architecture.md` |
| Database patterns | `refs/database.md` |
| Frontend patterns | `refs/frontend.md` |
| Cultural safety | `refs/cultural-safety.md` |
| Security & RLS | `refs/security.md` |
| Commands | `refs/commands.md` |

## Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/supabase/` - DB clients (server.ts, client.ts)
- `src/lib/database/` - Types by domain
- `supabase/migrations/` - SQL migrations

## Anti-Patterns
❌ Direct DB edits in Studio - use migrations
❌ Client-side admin operations - use server
❌ Skip RLS - implement from start
❌ `any` types - strict TypeScript
❌ Skip cultural review - always review

## Related Skills
- `supabase-sql-manager` - Database operations
- `design-component` - UI patterns
- `cultural-review` - Cultural sensitivity
- `deployment-workflow` - Deploy process

## External Docs
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
