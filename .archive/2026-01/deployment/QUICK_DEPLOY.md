# 🚀 Quick Deploy to Production - 5 Minutes!

**Last Updated:** January 6, 2026
**Estimated Time:** 5-10 minutes

---

## 🎯 Prerequisites

Before you start, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (free tier works!)
- [ ] Supabase account (free tier works!)
- [ ] OpenAI API key (for AI features)

---

## Step 1: Prepare Supabase (2 minutes)

### 1.1 Create Supabase Project
```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Fill in:
# - Name: empathy-ledger-v2-prod
# - Database Password: (generate strong password)
# - Region: (choose closest to your users)
```

### 1.2 Run Database Migrations
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Verify
supabase db diff
```

### 1.3 Get Your Credentials
```bash
# Go to Project Settings > API
# Copy these values:
# - Project URL: https://YOUR_PROJECT.supabase.co
# - anon/public key: eyJhbG...
# - service_role key: eyJhbG... (keep this secret!)
```

---

## Step 2: Deploy to Vercel (3 minutes)

### 2.1 Push to GitHub
```bash
# Make sure all changes are committed
git add .
git commit -m "feat: ready for production deployment"

# Push to GitHub
git push origin main
```

### 2.2 Import to Vercel
```bash
# Go to https://vercel.com/new
# Click "Import Git Repository"
# Select your GitHub repo
# Click "Import"
```

### 2.3 Configure Environment Variables

**In Vercel dashboard, add these:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (service role key - keep secret!)

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-...

# App URL (will be provided by Vercel after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### 2.4 Deploy!
```bash
# Click "Deploy"
# Wait 2-3 minutes for build
# ✅ Done! Your app is live!
```

---

## Step 3: Post-Deployment Setup (Optional - 2 minutes)

### 3.1 Enable Row Level Security
```sql
-- Run this in Supabase SQL Editor
-- Enable RLS on all tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create basic policies (customize as needed)
-- Allow users to read their organization's data
CREATE POLICY "Users can view own org data" ON stories
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Allow users to create in their organization
CREATE POLICY "Users can create in own org" ON stories
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);
```

### 3.2 Set Up Custom Domain (Optional)
```bash
# In Vercel dashboard:
# Settings > Domains
# Add your custom domain: stories.your-domain.com
# Follow DNS configuration instructions
# Wait for SSL certificate (automatic)
```

### 3.3 Configure Authentication Providers
```bash
# In Supabase dashboard:
# Authentication > Providers
# Enable providers you want:
# - Email (enabled by default)
# - Google OAuth (optional)
# - GitHub OAuth (optional)
# - Magic Link (optional)
```

---

## 🧪 Verify Deployment

### Check These URLs:

1. **Homepage**
   ```
   https://your-app.vercel.app
   ```
   Should show: Landing page

2. **Health Check**
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return: `{ "status": "ok" }`

3. **Database Connection**
   ```
   https://your-app.vercel.app/api/stories?organization_id=test
   ```
   Should return: JSON response (empty array is fine)

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies

# Fix locally first:
npm run type-check
npm run build
npm test
```

### Database Connection Fails
```bash
# Verify environment variables are set correctly
# Check Supabase project is active
# Verify API keys are correct
# Check RLS policies aren't blocking access
```

### Page Loads But Shows Errors
```bash
# Check browser console for errors
# Check Vercel function logs
# Verify all API routes are working
# Check environment variables are set
```

---

## ✅ Deployment Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] User can sign up/login
- [ ] Database queries work
- [ ] File uploads work
- [ ] Search functionality works
- [ ] Analytics load
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (if using)

---

## 📊 Monitor Your Deployment

### Vercel Dashboard
```
https://vercel.com/dashboard
```
- Check deployment status
- View function logs
- Monitor analytics
- Check error rates

### Supabase Dashboard
```
https://supabase.com/dashboard
```
- Monitor database usage
- Check API requests
- View auth users
- Check storage usage

---

## 🚀 You're Live!

**Congratulations! Your Empathy Ledger v2 is now live in production!**

Share your deployment URL with your team and start testing!

### Next Steps:
1. ✅ Create admin account
2. ✅ Set up first organization
3. ✅ Invite team members
4. ✅ Start user testing
5. ✅ Collect feedback

---

## 📞 Need Help?

- **Deployment Issues:** Check Vercel docs or GitHub Issues
- **Database Issues:** Check Supabase docs
- **General Help:** See DEPLOYMENT_GUIDE.md for detailed info

---

**Deployment Time:** ~5 minutes
**Status:** ✅ LIVE
**URL:** https://your-app.vercel.app

🎉 **Welcome to production!** 🎉
