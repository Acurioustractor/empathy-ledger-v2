# Deployment Workflow Skill

This skill provides a comprehensive deployment workflow for Empathy Ledger, ensuring proper GitHub commits, Vercel deployments, and app/web version synchronization.

## When to Use This Skill

Use this skill when:
- Ready to deploy code to production
- Need to create a release
- Want to ensure proper version sync
- Deploying PWA updates
- Need deployment checklist verification

## Deployment Philosophy

**ONE CODEBASE, ALL PLATFORMS**
- Single Next.js app deployed to Vercel
- PWA on phones = the website
- Future app stores = wrappers pointing to website
- Git push → Vercel auto-deploys → everyone auto-updates

## Pre-Deployment Checklist

### 1. Code Quality Checks

```bash
# Run TypeScript type checking
npm run build

# Check for lint errors
npm run lint

# Run tests (if available)
npm test
```

**Required**: All must pass before deployment.

### 2. Environment Variables Verification

```bash
# Check local .env.local has required vars
cat .env.local | grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Required Vercel Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

**Verify in Vercel Dashboard**:
1. Go to Project → Settings → Environment Variables
2. Confirm all required variables present
3. Check they're set for Production, Preview, Development

### 3. Database Migration Status

```bash
# Check if migrations need to be applied
supabase db diff

# If there are pending migrations, apply them
supabase db push
```

**Critical**: Database migrations MUST be applied before deploying code that depends on them.

### 4. PWA Configuration Check

```bash
# Verify manifest.json exists
ls -la public/manifest.json

# Verify all required icons exist
ls -1 public/*.png public/*.ico | wc -l
# Should show at least 12 files

# Check vercel.json has PWA headers
grep -A 5 "manifest.json" vercel.json
```

**Required PWA Files**:
- `/public/manifest.json`
- `/public/icon-192.png`
- `/public/icon-512.png`
- `/public/apple-touch-icon.png`
- `/public/favicon.ico`
- `/public/icon-maskable-512.png`

### 5. Cultural Sensitivity Review

Before deploying features affecting storytellers:
- [ ] Reviewed cultural protocols implementation
- [ ] Verified consent mechanisms working
- [ ] Checked privacy controls functional
- [ ] Tested permission tiers (Private → Public)
- [ ] Verified notification language respectful

## GitHub Deployment Process

### Step 1: Version Bump

```bash
# Determine version type:
# - patch (1.0.0 → 1.0.1) - Bug fixes, small changes
# - minor (1.0.0 → 1.1.0) - New features, backward compatible
# - major (1.0.0 → 2.0.0) - Breaking changes

# For bug fixes:
npm version patch

# For new features:
npm version minor

# For breaking changes:
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag

### Step 2: Craft Commit Message

Use conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example**:
```bash
git commit -m "feat(auth): complete field storytelling workflow with magic links

- Implement magic link authentication routes
- Add auto notification triggers for storyteller events
- Create Find My Stories UI for claiming content
- Configure PWA with app icons and manifest
- Add deployment documentation

Closes #123

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 3: Push to GitHub

```bash
# If working on feature branch
git push origin feature/your-feature-name

# Create pull request for review
gh pr create --title "Your Feature Title" --body "Description"

# After PR approved, merge to main
git checkout main
git merge feature/your-feature-name
git push origin main
```

**Branch Strategy**:
- `main` → Production (empathyledger.com)
- `develop` → Staging (auto-deploy to preview URL)
- `feature/*` → Feature branches (auto-deploy to preview URL)

## Vercel Deployment Process

### Option 1: Auto-Deploy (Recommended)

**GitHub Integration** (one-time setup):
1. Connect Vercel to GitHub repository
2. Configure auto-deploy settings in `vercel.json`
3. Push to `main` → auto-deploys to production
4. Push to other branches → auto-creates preview URLs

**Result**: Every `git push origin main` triggers automatic deployment.

### Option 2: Manual Deploy via CLI

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Login (one-time)
vercel login

# Deploy to preview (for testing)
vercel

# Test preview URL thoroughly
# Visit: https://empathy-ledger-git-{branch}-{user}.vercel.app

# If preview looks good, deploy to production
vercel --prod
```

### Step 4: Post-Deploy Verification

#### A. Desktop Testing

```bash
# 1. Visit production URL
open https://empathyledger.com  # or your custom domain

# 2. Check manifest.json accessible
curl https://empathyledger.com/manifest.json

# 3. Verify icons load
curl -I https://empathyledger.com/icon-192.png
```

**Test Checklist**:
- [ ] Homepage loads
- [ ] Signup flow works
- [ ] Magic link email sends
- [ ] Database connections work
- [ ] No console errors
- [ ] Manifest.json returns valid JSON

#### B. Mobile Testing (iPhone)

1. Visit production URL in Safari
2. Tap Share button → "Add to Home Screen"
3. Tap app icon on home screen
4. Verify:
   - [ ] Opens full-screen (no Safari UI)
   - [ ] Theme color correct (#96643a clay)
   - [ ] App icon displays correctly
   - [ ] Camera access prompts work
   - [ ] Signup flow functional
   - [ ] Magic link QR scanning works

#### C. Mobile Testing (Android)

1. Visit production URL in Chrome
2. Look for "Add to Home Screen" banner
3. Tap "Install"
4. Verify:
   - [ ] Opens full-screen (no Chrome UI)
   - [ ] Maskable icon displays correctly
   - [ ] Camera access works
   - [ ] All features functional

## Version Sync Verification

### Critical: Ensure ONE Codebase Strategy

```bash
# 1. Verify no separate mobile codebase exists
# Should NOT have:
# - /ios/ directory (unless using Capacitor wrapper later)
# - /android/ directory (unless using TWA wrapper later)
# - react-native dependencies in package.json

# 2. Verify PWA configuration
cat public/manifest.json | jq '.name, .short_name, .start_url, .display'

# 3. Check service worker registration (if implemented)
grep -r "serviceWorker.register" src/

# 4. Verify auto-update mechanism
# In vercel.json, check Cache-Control headers
grep -A 3 "Cache-Control" vercel.json
```

### Auto-Update Flow Confirmation

After deployment, confirm users will auto-update:

**PWA Update Pattern**:
1. User opens app
2. Service worker checks for new version
3. Downloads update in background
4. Next app open → new version loads

**No manual user action required.**

## Rollback Procedure

### If Deployment Has Issues

**Option 1: Vercel Dashboard Rollback (30 seconds)**

1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click "..." menu → "Promote to Production"
4. Done - rolled back instantly

**Option 2: Git Revert (2 minutes)**

```bash
# Find problematic commit
git log --oneline -n 5

# Revert it
git revert <commit-hash>

# Push - Vercel auto-deploys the revert
git push origin main
```

**Option 3: Hotfix (5 minutes)**

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix the issue
vim src/path/to/file.tsx

# Commit and push
git add .
git commit -m "hotfix: fix critical production bug"
git push origin hotfix/critical-bug

# Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main

# Vercel auto-deploys fixed version
```

## Deployment Monitoring

### Check Deployment Status

```bash
# Via Vercel CLI
vercel logs --follow

# Via Vercel Dashboard
# → Project → Deployments → Click latest
# → View build logs
# → Check for errors
```

### Success Indicators

- ✅ Build completed in 30-90 seconds
- ✅ No build errors in logs
- ✅ "Ready" status in Vercel dashboard
- ✅ Production URL accessible
- ✅ Manifest.json returns valid JSON
- ✅ Icons load correctly
- ✅ "Add to Home Screen" works on mobile

### Common Issues and Fixes

#### Build Failed - Type Errors

```bash
# Run locally first
npm run build

# Fix type errors shown
# Commit fixes
# Push again
```

#### Environment Variables Missing

```bash
# Add via Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Or via dashboard:
# Settings → Environment Variables → Add
```

#### Icons Not Loading

```bash
# Verify icons exist
ls -la public/*.png

# Regenerate if needed
./scripts/create-icons.sh

# Commit and push
git add public/
git commit -m "fix: regenerate app icons"
git push origin main
```

## Complete Deployment Workflow

### Full Checklist

```bash
# 1. PRE-DEPLOYMENT
[ ] npm run build (passes)
[ ] npm run lint (passes)
[ ] Database migrations applied (supabase db push)
[ ] Environment variables verified (Vercel dashboard)
[ ] PWA icons exist (ls public/*.png shows 10+ files)
[ ] vercel.json configured with PWA headers

# 2. VERSION & COMMIT
[ ] Version bumped (npm version patch/minor/major)
[ ] Meaningful commit message written
[ ] Changes committed to feature branch

# 3. GITHUB
[ ] Pushed to GitHub (git push origin branch-name)
[ ] Pull request created (if using PR workflow)
[ ] PR approved and merged to main

# 4. VERCEL DEPLOYMENT
[ ] Auto-deploy triggered (or manual: vercel --prod)
[ ] Build succeeded (check Vercel dashboard)
[ ] Production URL accessible

# 5. POST-DEPLOYMENT TESTING
[ ] Desktop: Homepage loads, no errors
[ ] Desktop: Manifest.json accessible
[ ] Desktop: All features work
[ ] Mobile (iPhone): "Add to Home Screen" works
[ ] Mobile (iPhone): App opens full-screen
[ ] Mobile (iPhone): Camera access works
[ ] Mobile (Android): "Install App" works
[ ] Mobile (Android): All features functional

# 6. VERSION SYNC VERIFICATION
[ ] Confirmed ONE codebase (no separate mobile code)
[ ] PWA manifest.json valid
[ ] Auto-update mechanism working
[ ] Users will get update on next app open

# 7. MONITORING
[ ] No errors in Vercel logs
[ ] Analytics show traffic
[ ] No user reports of issues
```

## Deployment Frequency

### Recommended Cadence

**Development Phase**:
- Deploy to preview: Multiple times per day
- Deploy to production: 1-2 times per week
- Critical fixes: Immediately

**Production Phase**:
- Feature releases: Weekly
- Bug fixes: As needed (same day)
- Security patches: Immediately

### Continuous Deployment Benefits

With ONE codebase strategy:
- Push code → Everyone updates automatically
- No app store approval delays
- No version fragmentation
- Instant bug fixes
- Rapid iteration

## Special Considerations

### Database Migrations

**Critical Rule**: Always deploy migrations BEFORE code that uses them.

**Workflow**:
```bash
# 1. Create migration
supabase migration new add_new_feature

# 2. Write migration SQL
vim supabase/migrations/XXXXXX_add_new_feature.sql

# 3. Test locally
supabase db reset

# 4. Deploy migration to production
supabase db push

# 5. THEN deploy code
git push origin main
```

### Breaking Changes

If deploying breaking changes:

1. **Version bump to MAJOR** (1.x.x → 2.0.0)
2. **Create migration plan** (how existing data migrates)
3. **Test thoroughly** on preview deployment
4. **Document changes** in CHANGELOG.md
5. **Notify users** (if affects their workflow)

### Cultural Content Updates

When deploying changes affecting storytellers:

1. **Review with cultural advisor** (if available)
2. **Test with small group** first (5-10 users)
3. **Monitor feedback** closely
4. **Be ready to rollback** if issues arise
5. **Document cultural considerations** in commit message

## Automation Opportunities

### GitHub Actions (Future Enhancement)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npm run lint
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Pre-commit Hooks

Install Husky for automated checks:

```bash
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run build"
```

## Quick Reference Commands

```bash
# Complete deployment in one workflow
npm run build && \
npm version patch && \
git push origin main && \
vercel --prod

# Check deployment status
vercel logs --follow

# Rollback via git
git revert HEAD && git push origin main

# Verify PWA config
curl https://empathyledger.com/manifest.json | jq

# Test mobile locally
ipconfig getifaddr en0  # Get your IP
# Visit http://YOUR-IP:3005 on phone
```

## Success Metrics

Track these after deployment:

- ✅ Build time (should be < 2 minutes)
- ✅ Zero downtime during deploy
- ✅ All tests passing
- ✅ No increase in error rates
- ✅ PWA installation working
- ✅ Mobile users can access app
- ✅ Auto-updates functioning

## Summary

This deployment workflow ensures:
1. **Quality**: All checks pass before deploy
2. **Sync**: ONE codebase updates everywhere
3. **Speed**: Auto-deploy in 30 seconds
4. **Safety**: Easy rollback if issues
5. **Monitoring**: Clear success indicators

**Result**: Reliable, repeatable deployments that keep app and web versions perfectly synchronized.
