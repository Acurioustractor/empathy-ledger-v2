# Deployment Guide

## Branch Strategy

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/partner-portal
        ├── feature/story-syndication
        └── fix/auth-issue
```

### Branches

| Branch | Environment | URL | Auto-Deploy |
|--------|-------------|-----|-------------|
| `main` | Production | empathyledger.com | Yes |
| `develop` | Staging | develop.empathyledger.vercel.app | Yes |
| `feature/*` | Preview | [auto-generated].vercel.app | On PR |
| `fix/*` | Preview | [auto-generated].vercel.app | On PR |

## Workflow

### 1. Feature Development

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/partner-portal

# Make changes, commit
git add .
git commit -m "Add partner portal dashboard"

# Push and create PR
git push -u origin feature/partner-portal
```

### 2. Preview Deployments

When you open a PR:
1. GitHub Actions triggers Vercel preview deployment
2. Bot comments with preview URL
3. Test at: `https://[branch]-empathy-ledger.vercel.app`

### 3. Merge to Develop (Staging)

```bash
# After PR approval, merge to develop
# This triggers staging deployment
git checkout develop
git merge feature/partner-portal
git push origin develop
```

### 4. Production Release

```bash
# When staging is verified, merge to main
git checkout main
git merge develop
git push origin main
# This triggers production deployment
```

## Vercel Configuration

### Required Secrets (GitHub Repository Settings)

Add these in Settings > Secrets and variables > Actions:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | From Vercel Settings > Tokens |
| `VERCEL_ORG_ID` | From `.vercel/project.json` or Vercel dashboard |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` or Vercel dashboard |

### Environment Variables

Set in Vercel Dashboard > Settings > Environment Variables:

**Production (main)**
```
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://empathyledger.com
```

**Preview (develop, PRs)**
```
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://develop.empathyledger.vercel.app
```

## Testing Checklist

Before merging to `main`:

### Partner Portal
- [ ] `/portal` - Dashboard loads with metrics
- [ ] `/portal/catalog` - Story catalog displays
- [ ] `/portal/projects` - Projects CRUD works
- [ ] `/portal/messages` - Messaging interface loads

### API Routes
- [ ] `POST /api/partner/projects` - Creates project
- [ ] `GET /api/partner/catalog` - Returns stories
- [ ] `POST /api/partner/catalog/request` - Creates request
- [ ] `GET /api/partner/messages` - Returns threads

### External API (for partners)
- [ ] `GET /api/external/stories` - JWT auth works
- [ ] `GET /api/embed/catalog` - CORS enabled
- [ ] `GET /api/beacon` - Tracking pixel returns

## Rollback

If production has issues:

```bash
# Revert to previous commit
git checkout main
git revert HEAD
git push origin main

# Or use Vercel dashboard to rollback to previous deployment
```

## Monitoring

- **Vercel Analytics**: Built-in, view in dashboard
- **Error Tracking**: Check Vercel Functions logs
- **API Health**: `GET /api/health` returns system status

## Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Type checking
npm run lint

# Build locally
npm run build
```

## Database Migrations

Before deploying features that need new tables:

1. Apply migration to staging Supabase first
2. Test on develop branch
3. Apply to production Supabase
4. Deploy to main

```bash
# Apply migration
npx supabase db push --db-url "postgresql://..."

# Or use Supabase Dashboard > SQL Editor
```
