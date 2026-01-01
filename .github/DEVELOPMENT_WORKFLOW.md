# Development Workflow & Deployment Guide

**Complete GitHub + Vercel workflow for Empathy Ledger v2**

---

## Branch Strategy

### Main Branches

```
main (production)
  ↑
  └── develop (staging/preview)
       ↑
       └── feature/* (feature branches)
            ├── feat/*
            ├── fix/*
            ├── docs/*
            └── chore/*
```

### Branch Rules

#### `main` - Production
- **Protected**: Requires PR approval
- **Auto-deploys to**: Vercel Production (`empathy-ledger.com`)
- **Merge from**: `develop` only
- **Deployment**: Automatic on merge
- **Testing**: Full test suite must pass
- **Status checks**: Required (CI/CD, Lighthouse, Security)

#### `develop` - Staging
- **Protected**: Requires PR approval
- **Auto-deploys to**: Vercel Preview (`develop.empathy-ledger.com`)
- **Merge from**: Feature branches
- **Deployment**: Automatic on merge
- **Testing**: Full test suite must pass
- **Purpose**: Integration testing before production

#### Feature Branches
- **Naming**: `feat/description`, `fix/description`, `docs/description`, `chore/description`
- **Deploys to**: Unique Vercel preview URL per PR
- **Merge to**: `develop` via Pull Request
- **Lifespan**: Delete after merge
- **Testing**: Unit tests + E2E tests

---

## Deployment Environments

### Production (`main` → Vercel Production)
- **URL**: `https://empathy-ledger.com`
- **Database**: Production Supabase
- **Environment**: `.env.production`
- **Deploy trigger**: Merge to `main`
- **Rollback**: Available via Vercel dashboard

### Staging (`develop` → Vercel Preview)
- **URL**: `https://develop.empathy-ledger.com`
- **Database**: Staging Supabase (separate project)
- **Environment**: `.env.staging`
- **Deploy trigger**: Merge to `develop`
- **Purpose**: Pre-production testing

### Feature Previews (PR → Vercel Preview)
- **URL**: `https://empathy-ledger-git-feat-xyz.vercel.app`
- **Database**: Staging Supabase (shared with develop)
- **Environment**: `.env.preview`
- **Deploy trigger**: Open/update PR
- **Purpose**: Feature review before merge

---

## Development Workflow

### Sprint Start (Every 2 weeks)

```bash
# 1. Pull latest develop
git checkout develop
git pull origin develop

# 2. Create sprint branch
git checkout -b feat/sprint-1-profile-pages

# 3. Set up local environment
npm install
cp .env.example .env.local
# Configure local Supabase or connect to staging
```

### Daily Development

```bash
# 1. Start local dev server
npm run dev

# 2. Make changes, commit frequently
git add .
git commit -m "feat: add Avatar component with fallback chain"

# 3. Push to remote (creates Vercel preview)
git push origin feat/sprint-1-profile-pages
```

### Creating Pull Request

```bash
# 1. Ensure all tests pass locally
npm run test
npm run build
npm run lint

# 2. Push final changes
git push origin feat/sprint-1-profile-pages

# 3. Create PR via GitHub CLI
gh pr create \
  --base develop \
  --head feat/sprint-1-profile-pages \
  --title "Sprint 1: Profile Pages with Privacy Controls" \
  --body "$(cat <<'EOF'
## Sprint 1 Deliverables

- [x] Avatar component with fallback chain
- [x] ProfilePage component
- [x] PrivacySettingsPanel
- [x] ALMA settings panel
- [x] Profile edit functionality

## Testing
- [x] Unit tests passing (32/32)
- [x] E2E tests passing (12/12)
- [x] Lighthouse score > 90
- [x] Accessibility WCAG 2.1 AA

## Database Changes
- Migration: 20260106_add_avatar_fallback.sql
- No breaking changes

## Preview
https://empathy-ledger-git-feat-sprint-1.vercel.app

## Acceptance Criteria
- [x] All 226 storyteller profiles viewable
- [x] Profile page loads < 2s
- [x] Avatar displays with fallback
- [x] Privacy settings functional
- [x] ALMA controls working

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# 4. Wait for CI/CD checks to pass
# 5. Request review from team
# 6. Address feedback, push updates
# 7. Merge when approved
```

### Merging to Develop

```bash
# After PR approval, merge via GitHub UI or CLI
gh pr merge --squash --delete-branch

# Automatic actions:
# 1. Squash commits into single commit
# 2. Delete feature branch
# 3. Deploy to staging (develop.empathy-ledger.com)
# 4. Run full test suite
# 5. Update sprint tracking in ACT Notion
```

### Deploying to Production

```bash
# End of sprint (every 2 weeks)
# Create release PR from develop to main

gh pr create \
  --base main \
  --head develop \
  --title "Release: Sprint 1 (Jan 6-17, 2026)" \
  --body "$(cat <<'EOF'
## Sprint 1 Release

### Features
- ✅ Profile pages with privacy controls
- ✅ Avatar system with cultural fallbacks
- ✅ ALMA settings panel
- ✅ Profile editing

### Testing
- ✅ All tests passing (125/125)
- ✅ Lighthouse score: 94/100
- ✅ Security audit: No high/critical issues
- ✅ Accessibility: WCAG 2.1 AA compliant

### Database Migrations
- 20260106_add_avatar_fallback.sql
- 20260110_add_alma_settings.sql

### Preview
https://develop.empathy-ledger.com

### Rollback Plan
Tag: v1.1.0-sprint-1
Previous tag: v1.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# After approval and merge:
# 1. Deploys to production automatically
# 2. Creates GitHub release tag
# 3. Updates ACT Notion deployment log
# 4. Sends Slack notification
```

---

## Automated Workflows

### GitHub Actions

#### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Check build size
        run: |
          SIZE=$(du -sh .next | cut -f1)
          echo "Build size: $SIZE"

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://empathy-ledger-git-${{ github.head_ref }}.vercel.app
          uploadArtifacts: true
          temporaryPublicStorage: true
```

#### 2. Deploy to Vercel (Automatic via Vercel GitHub App)

Vercel automatically:
- Deploys every PR to unique preview URL
- Deploys `develop` branch to staging
- Deploys `main` branch to production
- Runs build checks
- Comments PR with preview URL

#### 3. Notion Sprint Tracking (`.github/workflows/notion-sync.yml`)

```yaml
name: Sync to ACT Notion

on:
  pull_request:
    types: [opened, closed]
  push:
    branches: [develop, main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Update Sprint Tracking
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
        run: |
          # Update sprint board with PR status
          # Log deployment to Deployments database
          # Update velocity metrics
          node scripts/sync-notion.js
```

---

## Deployment Checklist

### Before Creating PR

- [ ] All tests passing locally (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Manual testing on localhost
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables documented (if new)

### Before Merging to Develop

- [ ] PR approved by reviewer
- [ ] All CI/CD checks green
- [ ] Lighthouse score > 90
- [ ] No accessibility regressions
- [ ] No security vulnerabilities
- [ ] Vercel preview tested by reviewer
- [ ] Database migrations safe for staging
- [ ] Cultural safety review passed (if applicable)

### Before Merging to Main

- [ ] Full sprint deliverables completed
- [ ] Staging environment tested thoroughly
- [ ] All acceptance criteria met
- [ ] Database migrations tested on staging
- [ ] Rollback plan documented
- [ ] Stakeholders notified
- [ ] Documentation updated
- [ ] Release notes prepared

---

## Emergency Rollback

### Via Vercel Dashboard

1. Go to Vercel dashboard
2. Select `empathy-ledger` project
3. Go to Deployments
4. Find previous stable deployment
5. Click "Promote to Production"
6. Confirm rollback

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# List deployments
vercel ls

# Rollback to specific deployment
vercel promote <deployment-url> --prod
```

### Via Git Revert

```bash
# Revert merge commit on main
git checkout main
git pull origin main
git revert -m 1 HEAD
git push origin main

# This triggers automatic redeploy of previous version
```

---

## Environment Variables

### Local Development (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Staging (Vercel Preview - `.env.staging`)

```bash
# Supabase Staging
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://develop.empathy-ledger.com
NODE_ENV=production
```

### Production (Vercel Production - `.env.production`)

```bash
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://empathy-ledger.com
NODE_ENV=production
```

### Adding New Environment Variable

1. Add to `.env.example` with description
2. Add to Vercel project settings (Preview + Production)
3. Document in this guide
4. Update in local `.env.local`
5. Redeploy affected environments

---

## Testing Strategy

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/storyteller-profile.spec.ts

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui
```

### Visual Regression (Playwright)

```bash
# Generate baseline screenshots
npm run test:visual:baseline

# Run visual regression tests
npm run test:visual

# Update snapshots
npm run test:visual:update
```

---

## Monitoring & Logging

### Vercel Analytics

- Real User Monitoring (RUM)
- Web Vitals tracking
- Automatic Lighthouse audits
- Error tracking

### Supabase Logs

```bash
# View database logs
npx supabase logs db

# View API logs
npx supabase logs api

# View auth logs
npx supabase logs auth
```

### Custom Logging

```typescript
// Use structured logging
import { logger } from '@/lib/logger'

logger.info('User profile loaded', {
  storytellerId: id,
  loadTime: performance.now() - start,
  hasAvatar: !!profile.avatar_url
})

logger.error('Profile load failed', {
  storytellerId: id,
  error: error.message,
  stack: error.stack
})
```

---

## Sprint Deployment Schedule

### Sprint Cadence (Every 2 weeks)

| Sprint | Dates | Develop Deploy | Main Deploy |
|--------|-------|----------------|-------------|
| Sprint 1 | Jan 6-17 | Daily (on merge) | Jan 17 (end of sprint) |
| Sprint 2 | Jan 20-31 | Daily (on merge) | Jan 31 (end of sprint) |
| Sprint 3 | Feb 3-14 | Daily (on merge) | Feb 14 (end of sprint) |
| Sprint 4 | Feb 17-28 | Daily (on merge) | Feb 28 (end of sprint) |
| Sprint 5 | Mar 3-14 | Daily (on merge) | Mar 14 (end of sprint) |
| Sprint 6 | Mar 17-28 | Daily (on merge) | Mar 28 (end of sprint) |
| Sprint 7 | Mar 31-Apr 11 | Daily (on merge) | Apr 11 (end of sprint) |
| Sprint 8 | Apr 14-25 | Daily (on merge) | Apr 25 (LAUNCH!) |

### Deployment Windows

- **Develop**: Anytime (automatic on merge)
- **Production**: End of sprint only (Fridays, 10am PST)
- **Hotfixes**: Immediate (any time, requires approval)

---

## Quick Commands

```bash
# Start development
npm run dev

# Run all checks before PR
npm run pre-pr

# Build for production
npm run build

# Start production build locally
npm run start

# Run full test suite
npm run test:all

# Deploy to Vercel (manual)
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Create PR with checks
gh pr create --fill

# Merge PR
gh pr merge --squash --delete-branch

# Create release
gh release create v1.1.0 --generate-notes
```

---

**This workflow ensures:**
- ✅ Stable production on `main`
- ✅ Integration testing on `develop`
- ✅ Feature previews for every PR
- ✅ Automatic deployments
- ✅ Comprehensive testing
- ✅ Easy rollbacks
- ✅ Sprint-based releases
