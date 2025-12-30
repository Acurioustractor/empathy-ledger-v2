# Quick Start - Empathy Ledger v2

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or pnpm
- Git

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/empathy-ledger-v2.git
cd empathy-ledger-v2

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open in browser
# → http://localhost:3005
```

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

## Verify Installation

✅ **Development server running**: Visit http://localhost:3005
✅ **Database connected**: You should see the homepage without errors
✅ **Authentication works**: Try signing in

## Common Issues

**Port 3005 already in use?**
```bash
# Kill the process
lsof -ti:3005 | xargs kill
```

**Database connection failed?**
- Check your Supabase URL and keys in `.env.local`
- Verify Supabase project is running

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

### For Developers
→ [Full setup guide](docs/getting-started/installation.md)
→ [Database schema](docs/database/)
→ [Development workflow](docs/development/)
→ [Contributing guide](CONTRIBUTING.md)

### For Deployment
→ [Deploy to production](docs/deployment/)
→ [Mobile PWA setup](docs/deployment/mobile-pwa.md)
→ [Field workflow](docs/deployment/field-workflow.md)

### Understanding the Codebase
→ [Architecture overview](docs/architecture/)
→ [Documentation index](docs/INDEX.md)
→ [Claude skills system](docs/getting-started/skills-system.md)

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (port 3005)
npm run build            # Build for production
npm run lint             # Run linter

# Database
npm run db:sync          # Interactive database CLI
npm run db:pull          # Pull schema from remote
npm run db:push          # Push migrations to remote
npm run db:types         # Generate TypeScript types

# Deployment
./scripts/deploy.sh      # Interactive deployment workflow
```

## Get Help

**Documentation**: [docs/INDEX.md](docs/INDEX.md)
**Issues**: [GitHub Issues](https://github.com/your-org/empathy-ledger-v2/issues)
**Claude AI**: See [CLAUDE.md](CLAUDE.md) for AI-assisted development

---

**Total time**: ~5 minutes to running locally
**Next**: Explore the [full documentation](docs/) or start [contributing](CONTRIBUTING.md)!
