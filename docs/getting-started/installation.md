# Installation Guide - Empathy Ledger v2

Complete setup guide for local development environment.

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Comes with Node.js
- **Git**: For version control ([Download](https://git-scm.com/))
- **Supabase CLI**: For database management (optional but recommended)

### Accounts Needed
- **Supabase Account**: [Create free account](https://app.supabase.com)
- **GitHub Account**: For repository access
- **Vercel Account**: For deployment (optional)

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/empathy-ledger-v2.git

# Navigate to project directory
cd empathy-ledger-v2

# Verify you're on the correct branch
git status
```

## Step 2: Install Dependencies

```bash
# Using npm (recommended)
npm install

# OR using pnpm (faster)
pnpm install

# Verify installation
npm list --depth=0
```

**Expected output**: List of installed packages (~50-70 dependencies)

## Step 3: Environment Configuration

### Create Environment File

```bash
# Copy example environment file
cp .env.local.example .env.local
```

### Required Environment Variables

Edit `.env.local` with your configuration:

```bash
# ========================================
# SUPABASE CONFIGURATION (REQUIRED)
# ========================================

# Get these from: https://app.supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (for admin operations)
# WARNING: Keep this secret! Never commit to git
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ========================================
# APPLICATION CONFIGURATION
# ========================================

# Application URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3005

# Feature flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# ========================================
# OPTIONAL: AI FEATURES
# ========================================

# OpenAI API key (for AI-powered features)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key-here

# ========================================
# OPTIONAL: ANALYTICS
# ========================================

# PostHog (for analytics)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create new one)
3. Navigate to **Project Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys** → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API Keys** → `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

**Security Note**:
- ✅ `NEXT_PUBLIC_*` variables are safe to expose in browser
- ❌ `SUPABASE_SERVICE_ROLE_KEY` must be kept secret (bypasses RLS)

## Step 4: Database Setup

### Option A: Use Existing Supabase Project

If you have an existing Supabase project with migrations:

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Pull latest schema
npm run db:pull

# Generate TypeScript types
npm run db:types
```

### Option B: Set Up New Supabase Project

If starting fresh:

```bash
# Initialize Supabase locally (optional)
npx supabase init

# Start local Supabase (Docker required)
npx supabase start

# Push migrations to your remote Supabase project
npm run db:push

# Generate TypeScript types
npm run db:types
```

**Note**: Local Supabase requires Docker. If you don't have Docker, use remote Supabase only.

## Step 5: Verify Installation

### Start Development Server

```bash
# Start the Next.js development server
npm run dev

# OR specify custom port
npm run dev -- -p 3006
```

**Expected output**:
```
> empathy-ledger-v2@0.1.0 dev
> next dev -p 3005

   ▲ Next.js 15.x.x
   - Local:        http://localhost:3005
   - Ready in X.Xs
```

### Check Application

1. **Open browser**: [http://localhost:3005](http://localhost:3005)
2. **Verify homepage loads** without errors
3. **Check console** for warnings (some warnings are OK, but no errors)

### Test Database Connection

```bash
# Test Supabase connection
curl http://localhost:3005/api/health
```

**Expected response**:
```json
{"status": "ok", "database": "connected"}
```

## Step 6: Install Optional Tools

### Supabase CLI (Recommended)

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version

# Login to Supabase
supabase login
```

### Playwright (for E2E testing)

```bash
# Install Playwright browsers
npx playwright install

# Run test suite
npm run test:e2e
```

### Database Management Scripts

The project includes helpful database management commands:

```bash
# Interactive database sync CLI
npm run db:sync

# Pull schema from remote
npm run db:pull

# Push migrations to remote
npm run db:push

# Reset local database
npm run db:reset

# Generate TypeScript types
npm run db:types

# Audit RLS policies
npm run db:audit
```

## Troubleshooting

### Port 3005 Already in Use

```bash
# Find and kill process on port 3005
lsof -ti:3005 | xargs kill

# OR use different port
npm run dev -- -p 3006
```

### Database Connection Failed

**Error**: `Could not connect to Supabase`

**Solutions**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Ensure Supabase project is running (check dashboard)
4. Try regenerating API keys in Supabase dashboard

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lockfile
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If using pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors

```bash
# Regenerate database types
npm run db:types

# Restart TypeScript server in VS Code
# CMD+Shift+P → "TypeScript: Restart TS Server"
```

### Build Fails

```bash
# Check for type errors
npm run type-check

# Run linter
npm run lint

# Try clean build
rm -rf .next
npm run build
```

### Supabase CLI Issues

```bash
# Update Supabase CLI
npm update -g supabase

# Check status
supabase status

# If stuck, stop and restart
supabase stop
supabase start
```

## Next Steps

Once installation is complete:

1. **Authentication**: [authentication.md](authentication.md) - Set up user auth
2. **First Story**: [common-tasks.md](common-tasks.md) - Create your first story
3. **Architecture**: [../architecture/](../architecture/) - Understand the system
4. **Contributing**: [../../CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3005)
npm run build            # Build for production
npm run lint             # Run linter
npm run type-check       # Check TypeScript types

# Database
npm run db:sync          # Interactive database CLI
npm run db:pull          # Pull schema from remote
npm run db:push          # Push migrations to remote
npm run db:types         # Generate TypeScript types
npm run db:audit         # Audit RLS policies

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:watch       # Watch mode

# Deployment
./scripts/deploy.sh      # Interactive deployment
```

### File Locations

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (gitignored) |
| `.env.local.example` | Environment template |
| `supabase/migrations/` | Database migrations |
| `src/lib/supabase/` | Supabase client configuration |
| `src/types/database/` | Generated database types |

### Important URLs

- **Local App**: http://localhost:3005
- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/your-org/empathy-ledger-v2

## Getting Help

- **Documentation**: [docs/INDEX.md](../INDEX.md)
- **Common Tasks**: [common-tasks.md](common-tasks.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/empathy-ledger-v2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/empathy-ledger-v2/discussions)

---

**Installation Time**: ~15-20 minutes (with Supabase setup)
**Next**: [Authentication Setup](authentication.md) →
