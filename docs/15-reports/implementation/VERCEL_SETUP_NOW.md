# Fix Vercel Deployment NOW

**Current Error**: Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase-url", which does not exist.

**Solution**: Add environment variables to Vercel project

---

## Step 1: Get Your Supabase Keys

### Option A: From Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
2. Click **"Settings"** (gear icon in sidebar)
3. Click **"API"**
4. Copy these values:

```
Project URL: https://yvnuayzslukamizrlhwb.supabase.co
anon/public key: eyJhbG... (long string starting with eyJ)
service_role key: eyJhbG... (different long string, keep this SECRET!)
```

### Option B: From Local .env.local

If you have a working local setup:

```bash
cat .env.local | grep SUPABASE
```

---

## Step 2: Add Variables to Vercel

### Go to Vercel Project Settings

1. **Open Vercel**: https://vercel.com/dashboard
2. **Find your project**: `empathy-ledger-v2`
3. **Click Settings** → **Environment Variables**

### Add These Variables

Click **"Add New"** for each:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://yvnuayzslukamizrlhwb.supabase.co`
- **Environment**: Check all (Production, Preview, Development)
- Click **"Save"**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbG...` (your anon key from Supabase)
- **Environment**: Check all (Production, Preview, Development)
- Click **"Save"**

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbG...` (your service_role key - KEEP SECRET!)
- **Environment**: Check all (Production, Preview, Development)
- Click **"Save"**

#### Variable 4: NEXT_PUBLIC_APP_URL (Optional but recommended)
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value for Production**: `https://empathy-ledger.com`
- **Value for Preview**: `https://empathy-ledger-v2.vercel.app`
- **Environment**: Production + Preview
- Click **"Save"**

---

## Step 3: Redeploy

After adding all variables:

### Option A: Via Vercel Dashboard

1. Go to **"Deployments"** tab
2. Find the latest failed deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**
5. Check **"Use existing Build Cache"** (faster)
6. Click **"Redeploy"**

### Option B: Push a Small Change

```bash
git checkout develop
git pull origin develop

# Make a small change
echo "# Vercel env vars configured" >> README.md
git add README.md
git commit -m "chore: trigger redeployment with env vars"
git push origin develop
```

---

## Step 4: Verify Deployment

1. **Watch deployment**: https://vercel.com/dashboard
2. **Wait for "Building..."** → **"Deployed"** (2-3 minutes)
3. **Click the deployment URL** when ready
4. **Test the site loads**

---

## Expected Result

✅ Deployment succeeds
✅ Site loads at: `https://empathy-ledger-v2-git-develop-[your-username].vercel.app`
✅ Homepage displays
✅ No environment variable errors

---

## Quick Visual Guide

### Where to Find Supabase Keys

```
Supabase Dashboard
└── Project: empathy-ledger-v2
    └── Settings (⚙️)
        └── API
            ├── Project URL: https://yvnuayzslukamizrlhwb.supabase.co
            ├── anon public key: eyJhbG... (COPY THIS)
            └── service_role key: eyJhbG... (COPY THIS - KEEP SECRET)
```

### Where to Add in Vercel

```
Vercel Dashboard
└── Your Project: empathy-ledger-v2
    └── Settings
        └── Environment Variables
            └── Add New
                ├── Key: NEXT_PUBLIC_SUPABASE_URL
                ├── Value: https://yvnuayzslukamizrlhwb.supabase.co
                └── Environments: ☑ Production ☑ Preview ☑ Development
```

---

## Troubleshooting

### If deployment still fails:

**Check the build logs**:
1. Go to Vercel Deployments
2. Click the failed deployment
3. Click "View Function Logs" or "Build Logs"
4. Look for the specific error

**Common issues**:
- ❌ Forgot to check all environments → Re-add variable with all checked
- ❌ Typo in variable name → Must be exact: `NEXT_PUBLIC_SUPABASE_URL`
- ❌ Missing quotes in value → Don't add quotes, just paste the value
- ❌ Wrong Supabase URL → Must end in `.supabase.co`

---

## Once Deployment Succeeds

You'll see:
```
✅ Build Completed
✅ Deployed to: https://empathy-ledger-v2-git-develop.vercel.app
```

Then you can:
1. ✅ Test the staging site
2. ✅ Verify all pages load
3. ✅ Continue with Sprint 1 setup

---

**Need the Supabase keys? I can help you find them!**

Let me know when variables are added and I'll help verify the deployment! 🚀
