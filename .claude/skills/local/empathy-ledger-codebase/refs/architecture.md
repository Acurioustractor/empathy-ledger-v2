# Architecture Reference

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: React Server Components (RSC), Client hooks where needed
- **UI**: shadcn/ui components, Lucide icons
- **Design**: Editorial Warmth design system

## Directory Structure
```
empathy-ledger-v2/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── profile/           # User profiles
│   │   ├── storytellers/      # Storyteller directory
│   │   └── my-story/          # Story management
│   ├── components/
│   │   ├── ui/                # shadcn base components
│   │   ├── shared/            # Shared components
│   │   ├── auth/              # Auth components
│   │   ├── storyteller/       # Storyteller components
│   │   ├── story/             # Story components
│   │   └── profile/           # Profile components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── database/          # Database types by domain
│   │   ├── utils.ts           # Utilities
│   │   └── hooks/             # Custom hooks
│   ├── types/                  # Type definitions
│   └── middleware.ts          # Auth middleware
├── supabase/
│   ├── migrations/            # SQL migrations
│   └── config.toml            # Config
├── .claude/skills/            # Claude skills
└── docs/                      # Documentation
```

## Key Principles
1. **Server-First**: Use RSC by default
2. **Type Safety**: Strict TypeScript, auto-generated DB types
3. **Cultural Safety**: Protocols at every level
4. **Multi-Tenancy**: Tenant isolation via RLS
5. **Progressive Enhancement**: Works without JS
