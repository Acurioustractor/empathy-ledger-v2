# Deployment Workflow Skill - Quick Reference

## Usage

### Via Claude Code Skill
```
User: "I need to deploy to production"
Claude: [Invokes deployment-workflow skill]
```

### Via Script
```bash
# Run interactive deployment workflow
./scripts/deploy.sh
```

### Manual Commands
```bash
# Quick deploy (all in one)
npm run build && \
npm version patch && \
git push origin main && \
vercel --prod

# Step-by-step
npm run build              # Verify build
npm run lint               # Check code quality
supabase db push           # Apply migrations
npm version patch          # Bump version
git push origin main       # Push to GitHub
vercel --prod              # Deploy to Vercel
```

## Key Features

### Automated Checks
- ✅ TypeScript type checking
- ✅ Linting
- ✅ PWA file verification (manifest.json, icons)
- ✅ Database migration status
- ✅ Environment variable checks

### Version Management
- Semantic versioning (patch/minor/major)
- Auto-commit with conventional format
- Git tag creation

### Deployment Options
- Preview deployment (testing)
- Production deployment
- Auto-deploy via GitHub integration

### Safety Features
- Pre-flight checks prevent bad deploys
- Easy rollback instructions
- Post-deployment verification checklist

## Common Workflows

### Bug Fix Deployment
```bash
# 1. Fix the bug
vim src/path/to/file.tsx

# 2. Run deployment script
./scripts/deploy.sh

# 3. Select: patch version
# 4. Push to GitHub: yes
# 5. Deploy to Vercel: production
```

### New Feature Release
```bash
# 1. Merge feature branch to main
git checkout main
git merge feature/new-feature

# 2. Run deployment
./scripts/deploy.sh

# 3. Select: minor version
# 4. Deploy to preview first (test)
# 5. Then promote to production
```

### Emergency Hotfix
```bash
# Quick rollback
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version

# Or manual rollback via Vercel Dashboard
# → Deployments → Previous good deploy → Promote
```

## Pre-Deployment Checklist

Before running deployment:
- [ ] All code committed
- [ ] Tests passing locally
- [ ] Database migrations created (if needed)
- [ ] Environment variables configured in Vercel
- [ ] PWA icons generated (`ls public/*.png` shows 10+ files)

## Post-Deployment Testing

After deployment completes:

**Desktop** (2 minutes):
1. Visit production URL
2. Check console (F12) for errors
3. Test core features
4. Verify manifest.json loads

**Mobile** (5 minutes):
1. Visit on iPhone/Android
2. "Add to Home Screen"
3. Open app from home screen
4. Test camera, core features
5. Confirm full-screen mode

## Version Sync Verification

Ensure ONE codebase deployed:
- ✅ No separate `/ios/` or `/android/` directories
- ✅ PWA manifest.json valid
- ✅ Auto-update enabled in vercel.json
- ✅ All platforms point to same website

## Troubleshooting

### Build Failed
```bash
# Run locally first
npm run build

# Fix errors shown
# Commit fixes
# Re-run deployment
```

### Migration Failed
```bash
# Check migration status
supabase db diff

# Apply manually
supabase db push

# Then re-deploy
```

### Icons Missing
```bash
# Regenerate icons
./scripts/create-icons.sh

# Commit
git add public/
git commit -m "fix: regenerate app icons"

# Re-deploy
```

### Environment Variables Not Set
```bash
# Via Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Or via dashboard:
# Vercel → Project → Settings → Environment Variables
```

## Integration with Claude Code

This skill is automatically invoked when you mention:
- "deploy to production"
- "ready to release"
- "publish updates"
- "push to Vercel"
- "deployment workflow"

The skill provides:
1. Pre-deployment verification
2. Version bumping guidance
3. GitHub commit/push instructions
4. Vercel deployment steps
5. Post-deployment testing checklist
6. Rollback procedures

## Files Modified by Deployment

- `package.json` - Version number updated
- `package-lock.json` - Lockfile updated
- `.git/` - Commits, tags created
- Vercel - New deployment created

## Monitoring Post-Deploy

```bash
# Watch Vercel logs
vercel logs --follow

# Check build status
vercel inspect URL

# View deployments
vercel ls
```

## Success Indicators

After deployment, confirm:
- ✅ Build time < 2 minutes
- ✅ Zero downtime
- ✅ No error spike in logs
- ✅ PWA installation works
- ✅ Mobile users can access
- ✅ Auto-updates functioning

## Related Documentation

- [READY_TO_DEPLOY.md](../../../READY_TO_DEPLOY.md) - Initial deployment guide
- [DEPLOY_TO_PHONE.md](../../../DEPLOY_TO_PHONE.md) - Mobile deployment setup
- [VERSION_SYNC_STRATEGY.md](../../../docs/VERSION_SYNC_STRATEGY.md) - Version management
- [MOBILE_DEPLOYMENT_GUIDE.md](../../../docs/MOBILE_DEPLOYMENT_GUIDE.md) - PWA technical guide

## Quick Commands Reference

```bash
# Full deployment
./scripts/deploy.sh

# Just build check
npm run build

# Just version bump
npm version patch

# Just deploy
vercel --prod

# Check deployment
vercel ls

# View logs
vercel logs

# Rollback
git revert HEAD && git push
```
