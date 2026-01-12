# 🚀 DEPLOY NOW - Empathy Ledger v2

**Date**: January 6, 2026
**Status**: Ready to Deploy
**Platform**: Supabase + Vercel

---

## ✅ PRE-FLIGHT CHECKS COMPLETE

- ✅ Build succeeds
- ✅ 41 database migrations ready
- ✅ Environment variables configured
- ✅ Supabase project: `yvnuayzslukamizrlhwb.supabase.co`
- ✅ Code organized and production-ready

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Verify Supabase Connection

```bash
# Check your current Supabase project
npx supabase projects list

# You should see: yvnuayzslukamizrlhwb
```

---

### Step 2: Deploy Database Migrations

**Option A: Using Supabase Dashboard (Recommended for First Deploy)**

1. Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. For each migration file (in order), copy and paste the SQL and execute:
   - Start with `supabase/migrations/20250101000000_initial_schema.sql`
   - Continue through all 41 migrations in chronological order
5. Verify no errors

**Option B: Using Supabase CLI (if you have project linked)**

```bash
# Link to your production project
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Push all migrations
npx supabase db push

# Verify migrations
npx supabase db migrations list
```

**⚠️ Important**: If migrations fail, check:
- Are you connected to the correct project?
- Have some migrations already been run?
- Check Supabase dashboard for error messages

---

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Login to Vercel (if needed)
npx vercel login

# Link to existing project or create new one
npx vercel link

# Deploy to production
npx vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? Yes/No (choose based on your setup)
# - What's your project's name? empathy-ledger-v2
# - In which directory is your code located? ./
```

**Option B: Using Git + Vercel (Automatic)**

```bash
# Commit all changes
git add .
git commit -m "feat: production-ready deployment - 8 sprints complete

- 131 components built
- Security audit: 98/100
- Codebase organized
- Documentation complete
- Ready for production

🚀 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to main branch
git push origin main

# Vercel will automatically deploy from your main branch
# Check: https://vercel.com/dashboard
```

---

### Step 4: Set Environment Variables in Vercel

Go to https://vercel.com/your-project/settings/environment-variables

Add these variables (copy from your .env.local):

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Optional (for advanced features):**
```
ANTHROPIC_API_KEY=your_anthropic_key  # For AI features
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token  # For maps
SENDGRID_API_KEY=your_sendgrid_key  # For emails
```

**⚠️ Important**:
- Mark sensitive keys as "Sensitive" in Vercel
- Add to all environments (Production, Preview, Development)

---

### Step 5: Verify Deployment

Once deployed, Vercel will give you a URL (e.g., `empathy-ledger-v2.vercel.app`)

**Smoke Tests:**

1. **Visit Homepage**
   ```
   https://your-deployment-url.vercel.app
   ```
   - Should load without errors
   - Check browser console for errors

2. **Test Login**
   ```
   https://your-deployment-url.vercel.app/auth/login
   ```
   - Try to login with test credentials
   - Verify Supabase auth works

3. **Check API Routes**
   ```
   https://your-deployment-url.vercel.app/api/health
   ```
   - Should return 200 OK

4. **Verify Database Connection**
   - Try to load a page that queries the database
   - Check Vercel logs for database connection errors

---

## 🔍 POST-DEPLOYMENT CHECKLIST

### Immediate Checks (First 5 Minutes)

- [ ] Homepage loads successfully
- [ ] No 500 errors in Vercel logs
- [ ] Login/signup pages load
- [ ] Database queries work
- [ ] Images load correctly

### First Hour Checks

- [ ] Create a test storyteller account
- [ ] Create a test story
- [ ] Upload test media
- [ ] Verify privacy settings work
- [ ] Check analytics load

### Performance Checks

- [ ] Run Lighthouse audit (target: 90+)
- [ ] Check Core Web Vitals
- [ ] Monitor response times in Vercel
- [ ] Check database query performance in Supabase

---

## 🚨 IF SOMETHING GOES WRONG

### Rollback Options

**Vercel Rollback:**
```bash
# View deployments
npx vercel ls

# Rollback to previous deployment
npx vercel rollback [deployment-url]
```

**Or use Vercel Dashboard:**
1. Go to https://vercel.com/your-project/deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

### Common Issues

**Issue: Build fails in Vercel**
- Check Vercel build logs
- Verify environment variables are set
- Make sure Node version matches (18+)

**Issue: Database connection fails**
- Check Supabase project is running
- Verify environment variables are correct
- Check Supabase dashboard for connection errors

**Issue: 500 errors on pages**
- Check Vercel function logs
- Verify RLS policies allow access
- Check for missing migrations

---

## 📊 MONITORING

### Vercel Dashboard
- Monitor deployments: https://vercel.com/dashboard
- Check function logs
- View analytics

### Supabase Dashboard
- Monitor database: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
- Check API logs
- Monitor storage usage

---

## 🎉 AFTER SUCCESSFUL DEPLOYMENT

Once everything is working:

1. **Update DNS (if using custom domain)**
   - Point your domain to Vercel
   - Configure SSL certificate

2. **Announce Launch**
   - Send announcement emails
   - Share on social media
   - Notify stakeholders

3. **Monitor for 24 Hours**
   - Check error rates
   - Monitor performance
   - Collect user feedback

4. **Celebrate!** 🎊
   - 8 sprints complete
   - 131 components built
   - Platform launched
   - Indigenous voices amplified!

---

## 📞 NEED HELP?

If you encounter issues:

1. **Check the logs**
   - Vercel: https://vercel.com/your-project/logs
   - Supabase: Check dashboard logs

2. **Review documentation**
   - [DEPLOYMENT_GUIDE.md](docs/00-launch/DEPLOYMENT_GUIDE.md)
   - [SECURITY_AUDIT.md](docs/00-launch/SECURITY_AUDIT.md)

3. **Check common issues**
   - Build errors: Usually environment variables
   - Database errors: Usually migrations or RLS policies
   - 500 errors: Check Vercel function logs

---

## 🚀 READY TO DEPLOY?

**Your deployment checklist:**
- [x] Build succeeds locally
- [x] Environment variables ready
- [x] Database migrations ready
- [x] Supabase project configured
- [ ] Vercel project configured
- [ ] Environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Run smoke tests
- [ ] Monitor for issues

**Let's launch and amplify Indigenous voices!** 🚀

---

**Next**: Execute Steps 2-5 above to complete your deployment.

**Remember**: Take it step by step, verify each stage, and don't hesitate to rollback if needed.

**The Empathy Ledger v2 is ready. Let's make it live!** 🌟
