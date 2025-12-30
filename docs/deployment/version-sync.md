# Version Sync Strategy - One Codebase, All Platforms

## The Problem You're Avoiding

**BAD**: Multiple codebases that get out of sync
```
❌ Web version (Next.js)
❌ iOS version (React Native)
❌ Android version (React Native)
❌ Different features on each
❌ Different bugs on each
❌ Update one → manually update others
❌ NIGHTMARE to maintain
```

**GOOD**: One codebase, auto-syncs everywhere
```
✅ Single Next.js app
✅ Deploy once → updates everywhere
✅ Same features on all platforms
✅ Same bugs (easier to fix once!)
✅ Zero maintenance overhead
✅ EASY
```

---

## How It Works: Progressive Web App (PWA)

### The Magic

Your app is **just a website** that acts like a native app. When you deploy:

```
You push to GitHub
    ↓
Vercel auto-deploys (30 seconds)
    ↓
EVERYONE gets the update automatically:
    ├─ Desktop users (browser)
    ├─ iPhone users ("Add to Home Screen")
    ├─ Android users ("Install App")
    └─ Future: App Store users (wrapped PWA)
```

**ONE codebase → ALL platforms → INSTANT updates**

---

## Your Deployment Flow

### Current Setup (What We Built)

```
/Users/benknight/Code/empathy-ledger-v2/
├─ src/                 ← Your Next.js app
├─ public/              ← Icons, manifest.json
├─ .git/                ← Git repository
└─ vercel.json          ← We'll create this
```

### How Updates Work

```bash
# 1. You make a change locally
vim src/app/auth/signup/page.tsx
# → Fix a bug or add feature

# 2. Commit to Git
git add .
git commit -m "Fix signup button color"

# 3. Push to GitHub
git push origin main

# 4. Vercel auto-deploys (connected to GitHub)
# → Builds in 30 seconds
# → Auto-deployed to production
# → DONE

# 5. Users get the update:
# → Web users: Next page load (instant)
# → PWA users: Background update (next app open)
# → App Store users: Background update (same!)
```

**NO manual syncing. NO version conflicts. NO multiple codebases.**

---

## Setting Up Auto-Deploy

### Step 1: Connect GitHub to Vercel (One-time setup)

```bash
# 1. Push your code to GitHub (if not already)
git remote add origin https://github.com/YOUR-USERNAME/empathy-ledger-v2.git
git push -u origin main

# 2. Go to Vercel Dashboard
https://vercel.com/dashboard

# 3. Click "Import Project"
# 4. Connect GitHub account
# 5. Select "empathy-ledger-v2" repository
# 6. Click "Import"
# 7. Configure:
#    Framework Preset: Next.js (auto-detected)
#    Build Command: npm run build
#    Output Directory: .next
# 8. Add Environment Variables:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
# 9. Click "Deploy"

# ✅ DONE! Now every git push auto-deploys
```

### Step 2: Configure Auto-Deploy Settings

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "feature/*": true
    }
  },
  "github": {
    "autoAlias": true,
    "enabled": true,
    "silent": false
  },
  "regions": ["sfo1", "iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Step 3: Verify Auto-Deploy Works

```bash
# 1. Make a small change
echo "// Version 1.0.1" >> src/app/page.tsx

# 2. Commit
git add .
git commit -m "test: verify auto-deploy"

# 3. Push
git push origin main

# 4. Watch Vercel Dashboard
# → See "Building..." (30 seconds)
# → See "Ready" ✅
# → Visit URL → Change is live!

# 5. Check on phone
# → Open PWA app
# → Pull down to refresh (or close/reopen)
# → New version loads automatically!
```

---

## Version Management

### How PWAs Update

**Service Worker Pattern** (Automatic):

```javascript
// How it works behind the scenes:

// 1. User opens PWA app
app.open()

// 2. Service worker checks for updates
if (newVersionAvailable) {
  // Downloads new version in background
  downloadInBackground()

  // Waits for user to close app
  waitForAppClose()

  // Next time user opens app
  app.open() // → New version!
}
```

**User Experience**:
- Opens app → Sees current version
- App checks for updates in background
- Downloads new version silently
- Next time they open app → New version automatically!

**NO user action required. NO "Update Available" prompts.**

### Force Immediate Update (Optional)

If you need to push a critical fix:

```javascript
// Add to src/app/layout.tsx

'use client'

useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update()
      }, 60000)
    })
  }
}, [])
```

---

## App Store Version Control

### When You Add App Stores Later

**Good News**: Still ONE codebase!

```
Your Next.js App (ONE codebase)
    ↓
    ├─ Web (Vercel) ← Direct
    │   → Updates: Instant
    │
    ├─ Google Play (TWA) ← Wrapper
    │   → Points to: https://empathyledger.com
    │   → Updates: Automatic (pulls from web)
    │
    └─ Apple App Store (Capacitor) ← Wrapper
        → Embeds: Your web app
        → Updates: Automatic (pulls from web)
```

**Trusted Web Activity (Android)** and **Capacitor (iOS)** are just WRAPPERS around your web app. They don't duplicate code!

### How Updates Work with App Stores

**PWA Only** (Now):
```
You: git push
Vercel: Auto-deploy (30s)
Users: Auto-update (next open)
Total time: 30 seconds
```

**With App Stores** (Later):
```
You: git push
Vercel: Auto-deploy (30s)
Web users: Auto-update (30s)
PWA users: Auto-update (next open)
App Store users: Auto-update (next open) ← SAME!
Total time: 30 seconds
```

**The app store wrapper just displays your website**. When your website updates, the app automatically shows the new version!

---

## Version Numbering

### Semantic Versioning

Use in `package.json`:

```json
{
  "name": "empathy-ledger",
  "version": "1.0.0",
  "description": "Indigenous Stories & Cultural Wisdom"
}
```

**Format**: `MAJOR.MINOR.PATCH`

- **1**.0.0 → Breaking changes (major redesign)
- 1.**1**.0 → New features (magic link added)
- 1.0.**1** → Bug fixes (button color fixed)

### Auto-Version on Deploy

Add to `package.json` scripts:

```json
{
  "scripts": {
    "version:patch": "npm version patch && git push && git push --tags",
    "version:minor": "npm version minor && git push && git push --tags",
    "version:major": "npm version major && git push && git push --tags"
  }
}
```

Usage:

```bash
# Bug fix
npm run version:patch
# 1.0.0 → 1.0.1
# Auto commits, tags, and pushes
# Vercel auto-deploys

# New feature
npm run version:minor
# 1.0.1 → 1.1.0

# Breaking change
npm run version:major
# 1.1.0 → 2.0.0
```

---

## Preventing Version Conflicts

### Single Source of Truth

**ONE place for everything**:

```
GitHub Repository (main branch)
    ↓
    ├─ Source code
    ├─ Environment variables (Vercel)
    ├─ Database migrations
    └─ Version number (package.json)

Everything else DERIVES from this.
```

### Environment Variables

**Problem**: Different environments need different configs

**Solution**: One set of variables, environment-aware

```bash
# Vercel Dashboard → Environment Variables

# Production (main branch)
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key

# Preview (feature branches)
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_key

# Development (local)
NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_key
```

**Benefit**: Same code, different data based on environment

---

## Database Migrations

### Keep Database in Sync

**Your Workflow**:

```bash
# 1. Make database change locally
supabase migration new add_story_field

# 2. Write migration
vim supabase/migrations/20251226000001_add_story_field.sql

# 3. Test locally
supabase db reset

# 4. Commit and push
git add supabase/migrations/
git commit -m "feat: add story field"
git push origin main

# 5. Run migration on production
supabase db push

# ✅ Database and code now in sync
```

**Critical**: Migration files in Git = version controlled

---

## Deployment Environments

### Branch-Based Deployments

```
main branch
  → Production (empathyledger.com)
  → Users see this
  → Stable, tested code

feature/magic-link branch
  → Preview (empathy-ledger-git-feature-magic-link.vercel.app)
  → Testing only
  → Your team sees this

develop branch
  → Staging (empathy-ledger-git-develop.vercel.app)
  → Pre-production testing
  → Stakeholders see this
```

**How it works**:
```bash
# Working on a feature
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# → Vercel auto-creates preview URL
# → Test at: empathy-ledger-git-feature-new-feature.vercel.app

# When ready
git checkout main
git merge feature/new-feature
git push origin main
# → Vercel auto-deploys to production
# → Live at: empathyledger.com
```

**ONE codebase, MULTIPLE environments, ZERO confusion**

---

## Rollback Strategy

### If You Deploy a Bug

**Option 1: Revert in Vercel Dashboard** (30 seconds)

```
Vercel Dashboard
  → Deployments
  → Find last good deployment
  → Click "..." menu
  → Click "Promote to Production"
  → ✅ Rolled back instantly
```

**Option 2: Git Revert** (2 minutes)

```bash
# Find bad commit
git log --oneline
# abc123 feat: broken feature ← This one
# def456 feat: good feature

# Revert it
git revert abc123
git push origin main
# → Vercel auto-deploys the revert
# → Users get fixed version in 30 seconds
```

**Option 3: Hotfix** (5 minutes)

```bash
# If the bug is small, just fix it
vim src/app/component.tsx
git add .
git commit -m "hotfix: fix critical bug"
git push origin main
# → Deployed in 30 seconds
```

---

## Testing Before Production

### Preview Deployments

**Every pull request gets a unique URL**:

```bash
# 1. Create feature branch
git checkout -b feature/new-signup

# 2. Make changes
vim src/app/auth/signup/page.tsx

# 3. Push to GitHub
git push origin feature/new-signup

# 4. Create Pull Request on GitHub
# → Vercel auto-creates preview URL
# → https://empathy-ledger-git-feature-new-signup-abc.vercel.app

# 5. Test thoroughly on preview URL
# → Test on phone
# → Test magic links
# → Get feedback

# 6. When ready, merge PR
# → Auto-deploys to production

# ✅ Never deploy untested code to production
```

---

## Monitoring Deployments

### Vercel Dashboard

Shows you:
- ✅ Build status (building, ready, error)
- ✅ Deploy time (usually 30-60 seconds)
- ✅ Build logs (if something fails)
- ✅ Preview URLs for branches
- ✅ Analytics (page views, performance)

### Git Commit Messages

Link deployments to changes:

```bash
# Good commit messages
git commit -m "feat: add magic link authentication"
git commit -m "fix: signup button color on mobile"
git commit -m "docs: update field workflow guide"

# In Vercel, you see:
# ✅ Deployment #47: "feat: add magic link authentication"
# ✅ Deployment #48: "fix: signup button color on mobile"

# If #48 breaks something:
# → Easy to identify what changed
# → Easy to revert just that commit
```

---

## Best Practices

### 1. Always Deploy from `main` Branch

```bash
# ✅ Good
git checkout main
git merge feature/new-thing
git push origin main
# → Predictable deployments

# ❌ Bad
git checkout random-branch
git push origin random-branch
# → Unclear what's in production
```

### 2. Use Feature Flags for Big Changes

```typescript
// src/lib/features.ts
export const FEATURES = {
  MAGIC_LINK: process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK === 'true',
  NEW_DESIGN: process.env.NEXT_PUBLIC_ENABLE_NEW_DESIGN === 'true',
}

// In component
import { FEATURES } from '@/lib/features'

{FEATURES.MAGIC_LINK && <MagicLinkButton />}
```

**Benefit**: Deploy code without enabling it

```bash
# Deploy with feature disabled
NEXT_PUBLIC_ENABLE_MAGIC_LINK=false vercel --prod

# Test in production (but users can't see it)

# When ready, flip the switch
NEXT_PUBLIC_ENABLE_MAGIC_LINK=true vercel --prod

# ✅ Feature goes live, no new deploy needed
```

### 3. Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update safely
npm update

# Test locally
npm run build
npm run dev

# If works, commit and push
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push origin main
```

---

## Summary: Your Update Flow

### Now (PWA)

```
1. Edit code locally
2. git push
3. Vercel auto-deploys (30s)
4. All users auto-update
   ├─ Desktop: Next page load
   ├─ PWA iPhone: Next app open
   └─ PWA Android: Next app open
```

**ONE codebase. ONE deployment. ZERO version conflicts.**

### Later (With App Stores)

**SAME EXACT FLOW**

The app store versions are just wrappers. They point to your website. When your website updates, they automatically show the new version.

**NO separate app store builds. NO manual syncing.**

---

## Configuration Checklist

Set these up once, then forget about them:

- [x] Code in Git repository
- [ ] GitHub repository created and pushed
- [ ] Vercel connected to GitHub
- [ ] Auto-deploy enabled for `main` branch
- [ ] Environment variables in Vercel
- [ ] Preview deployments enabled
- [ ] `vercel.json` configured
- [ ] Version in `package.json`
- [ ] Rollback strategy tested

---

## Questions Answered

**Q: If I update the web version, does the phone app update?**
A: Yes, automatically. It's the same app.

**Q: What if users have the old version cached?**
A: Next time they open the app, it checks for updates and auto-loads the new version.

**Q: Do I need to rebuild for iOS and Android separately?**
A: No. ONE build, ALL platforms.

**Q: What about app store versions?**
A: They're just wrappers pointing to your website. Update website = update app.

**Q: Can I test before going live?**
A: Yes. Feature branches get preview URLs. Test there first.

**Q: What if I deploy a bug?**
A: Rollback in 30 seconds via Vercel dashboard or git revert.

**Q: How do I know what version is live?**
A: Check `package.json` version + Vercel dashboard deployment list.

**Q: Do users need to manually update?**
A: No. Updates are automatic and silent.

---

**Bottom Line**:

You have **ONE codebase** that **auto-deploys** to **ALL platforms** with **ZERO manual version management**.

This is the beauty of PWAs + Vercel. 🚀
