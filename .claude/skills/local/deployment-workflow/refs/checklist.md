# Deployment Checklist Reference

## Pre-Deployment

### Code Quality
```bash
npm run build     # TypeScript type checking
npm run lint      # Check for lint errors
npm test          # Run tests (if available)
```

### Environment Variables
Required in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional)

### Database Migration
```bash
supabase db diff    # Check pending migrations
supabase db push    # Apply migrations BEFORE code
```

### PWA Configuration
```bash
ls -la public/manifest.json          # Verify manifest exists
ls -1 public/*.png public/*.ico      # Verify icons (12+ files)
```

## GitHub Process

### Version Bump
```bash
npm version patch   # Bug fixes: 1.0.0 → 1.0.1
npm version minor   # Features: 1.0.0 → 1.1.0
npm version major   # Breaking: 1.0.0 → 2.0.0
```

### Commit Format
```
<type>(<scope>): <subject>

feat: New feature
fix: Bug fix
docs: Documentation
refactor: Code refactoring
perf: Performance
chore: Maintenance
```

### Push
```bash
git push origin main              # Auto-deploys to production
git push origin feature/name      # Creates preview URL
```

## Vercel Deployment

### Auto-Deploy (Recommended)
Push to `main` → auto-deploys to production

### Manual Deploy
```bash
vercel              # Deploy to preview
vercel --prod       # Deploy to production
```

## Post-Deployment Testing

### Desktop
- [ ] Homepage loads
- [ ] Signup flow works
- [ ] Magic link email sends
- [ ] No console errors

### Mobile (iPhone/Android)
- [ ] "Add to Home Screen" works
- [ ] Opens full-screen
- [ ] Camera access works
- [ ] All features functional

## Rollback

### Vercel Dashboard (Fastest)
1. Deployments → Find good version
2. Click "..." → "Promote to Production"

### Git Revert
```bash
git revert HEAD && git push origin main
```

### Hotfix
```bash
git checkout -b hotfix/critical-bug
# Fix issue
git push origin hotfix/critical-bug
git checkout main && git merge hotfix/critical-bug
git push origin main
```

## Quick Deploy Command
```bash
npm run build && npm version patch && git push origin main && vercel --prod
```
