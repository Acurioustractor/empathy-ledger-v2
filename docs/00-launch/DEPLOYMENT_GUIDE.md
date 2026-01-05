# Deployment Guide - Empathy Ledger v2

**Last Updated**: January 5, 2026
**Platform Version**: v2.0.0
**Deployment Target**: Vercel + Supabase

---

## 🚀 Quick Start (Production Deployment)

**Time Required**: 30-45 minutes

```bash
# 1. Clone repository
git clone https://github.com/your-org/empathy-ledger-v2.git
cd empathy-ledger-v2

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run database migrations
npx supabase db push

# 5. Build application
npm run build

# 6. Deploy to Vercel
vercel --prod
```

---

## 📋 Prerequisites

### Required Accounts
1. **Supabase Account** (Database & Auth)
   - Sign up at https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Vercel Account** (Hosting)
   - Sign up at https://vercel.com
   - Connect GitHub repository

3. **GitHub Account** (Version Control)
   - Repository forked or cloned

### Optional Services
- **Anthropic API** (AI features) - https://console.anthropic.com
- **OpenAI API** (Alternative AI) - https://platform.openai.com
- **Mapbox** (Interactive maps) - https://mapbox.com
- **SendGrid** (Email) - https://sendgrid.com

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: `empathy-ledger-v2-prod`
   - Database Password: (generate strong password)
   - Region: Choose closest to users
4. Wait for project to be created (~2 minutes)

### Step 2: Get Connection Details

From Supabase Dashboard → Settings → API:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Verify migrations
supabase db migrations list
```

**Migrations to be applied:**
- ✅ `20250101000000_initial_schema.sql` - Core tables
- ✅ `20260102120000_syndication_system_schema.sql` - Syndication
- ✅ `20260105000000_sprint3_comments_system.sql` - Comments
- ✅ `20260105120000_sprint4_story_versions.sql` - Versions
- ✅ `20260105120001_sprint4_story_collaborators.sql` - Collaborators
- ✅ `20260105120002_sprint4_media_enhancements.sql` - Media

### Step 4: Verify Database

```bash
# Test connection
npx supabase db ping

# Check tables
npx supabase db dump --schema public
```

**Expected tables:** ~30 tables including:
- profiles, organizations, projects
- stories, transcripts, media_assets
- story_versions, story_collaborators
- comments, comment_likes
- syndication_consent, embed_tokens

---

## ⚙️ Environment Variables

### Step 1: Copy Template

```bash
cp .env.example .env.local
```

### Step 2: Configure Variables

Edit `.env.local`:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration (Required)
NEXT_PUBLIC_APP_URL=https://empathy-ledger.vercel.app
NODE_ENV=production

# AI Services (Optional - for Sprint 7 features)
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Map Services (Optional - for Sprint 7 features)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token-here

# Email Service (Optional)
SENDGRID_API_KEY=SG.your-key-here
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-your-id-here
```

### Step 3: Set Vercel Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

Add all variables from `.env.local` to Vercel.

**Important**: Mark sensitive variables as "Encrypted"

---

## 🏗️ Build & Test Locally

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build Application

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (131/131)
✓ Finalizing page optimization

Route (app)                                Size     First Load JS
┌ ○ /                                      1.2 kB          85 kB
├ ○ /browse                                2.4 kB          87 kB
├ ○ /stories/[id]                          3.1 kB          88 kB
└ ...
```

### Step 3: Test Locally

```bash
npm run start
```

Visit `http://localhost:3000` and verify:
- ✅ Homepage loads
- ✅ Can login/signup
- ✅ Can create story
- ✅ Can view analytics
- ✅ No console errors

---

## 🚀 Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select your `empathy-ledger-v2` repo
4. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables (from .env.local)
6. Click "Deploy"

**Automatic deployments:**
- `main` branch → Production
- Other branches → Preview deployments

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No (first time)
# - What's your project's name? empathy-ledger-v2
# - In which directory is your code located? ./
# - Want to override settings? No
```

**Deployment URL**: https://empathy-ledger-v2.vercel.app

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `empathy-ledger.org`
3. Vercel provides DNS instructions

### Step 2: Configure DNS

At your domain registrar, add:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Step 3: Enable SSL

Vercel automatically provisions SSL certificate via Let's Encrypt.

**Verify**: Visit `https://empathy-ledger.org` - should show 🔒

---

## ✅ Post-Deployment Verification

### Health Checks

```bash
# 1. Check homepage
curl https://empathy-ledger-v2.vercel.app

# 2. Check API
curl https://empathy-ledger-v2.vercel.app/api/health

# 3. Check database connection
# (Login to app, create test story)
```

### Smoke Tests

- [ ] Homepage loads
- [ ] Login/signup works
- [ ] Create story works
- [ ] Upload image works
- [ ] Analytics dashboard loads
- [ ] Search works
- [ ] No console errors
- [ ] No 500 errors in Vercel logs

### Performance Check

Run Lighthouse audit:

```bash
npx lighthouse https://empathy-ledger-v2.vercel.app --view
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

---

## 📊 Monitoring & Logging

### Vercel Analytics

Vercel Dashboard → Project → Analytics

**Metrics to monitor:**
- Pageviews
- Unique visitors
- Top pages
- Devices

### Error Tracking (Optional - Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

Add to `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  silent: true,
  org: 'your-org',
  project: 'empathy-ledger-v2',
})
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- Push to `main` → Production
- Pull request → Preview deployment
- Tagged release → Production deployment

### Manual Deployment

```bash
# Deploy specific branch
vercel --prod --branch feature-branch

# Rollback to previous deployment
vercel rollback
```

---

## 🚨 Rollback Plan

### Immediate Rollback (< 5 minutes)

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find previous stable deployment
3. Click "..." → "Promote to Production"

**Via CLI:**
```bash
vercel rollback
```

### Database Rollback

**Warning**: Database rollbacks are complex!

```bash
# Revert specific migration
supabase db reset --version 20260105120001

# Full database reset (DESTRUCTIVE)
supabase db reset
```

**Recommendation**: Use database backups instead of rollbacks.

---

## 💾 Backup Strategy

### Database Backups

**Supabase Automatic Backups:**
- Daily backups (retained 7 days)
- Weekly backups (retained 4 weeks)
- Enabled by default on paid plans

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup_20260105.sql
```

### Media Backups

Media stored in Supabase Storage:
- Automatic replication across zones
- Manual export via Supabase Dashboard

---

## 🎯 Production Checklist

Before going live:

**Environment:**
- [ ] All environment variables set
- [ ] Production Supabase project created
- [ ] Database migrations run
- [ ] Vercel project configured

**Security:**
- [ ] Environment variables encrypted
- [ ] RLS policies enabled
- [ ] Sacred content protection verified
- [ ] HTTPS enforced

**Performance:**
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Lighthouse score > 90
- [ ] Images optimized

**Testing:**
- [ ] Smoke tests pass
- [ ] Login/signup works
- [ ] Story creation works
- [ ] Analytics load

**Monitoring:**
- [ ] Vercel analytics enabled
- [ ] Error tracking configured
- [ ] Health checks set up

**Documentation:**
- [ ] User guide complete
- [ ] FAQ published
- [ ] Support contact ready

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Build fails with TypeScript errors
```bash
# Solution: Check for type errors
npm run type-check
```

**Issue**: Database connection fails
```bash
# Solution: Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Issue**: 500 errors in production
```bash
# Solution: Check Vercel logs
vercel logs
```

### Getting Help

- **Documentation**: `/docs` folder
- **GitHub Issues**: Create issue with `bug` label
- **Email Support**: support@empathy-ledger.org

---

## 🎉 Deployment Complete!

Your Empathy Ledger v2 platform is now live!

**Next Steps:**
1. Review [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)
2. Monitor analytics and errors
3. Collect user feedback
4. Plan post-launch enhancements

---

**Deployed by:** [Your Name]
**Deployment Date:** January 5, 2026
**Platform Version:** v2.0.0
**Deployment URL:** https://empathy-ledger-v2.vercel.app
