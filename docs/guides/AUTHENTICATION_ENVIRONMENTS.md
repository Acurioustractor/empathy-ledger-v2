# Authentication Across Environments

How OAuth and magic links work with localhost, Vercel, and production domains.

---

## How OAuth Flow Works

### The Magic of the Callback URL

**Key Insight:** The OAuth callback **always goes to Supabase first**, not directly to your app!

```
Your App → OAuth Provider (GitHub/Microsoft/Google) → Supabase → Your App
```

### Detailed Flow

1. **User clicks "Sign in with GitHub"** on your app
   - Could be: `localhost:3000`, `your-app.vercel.app`, or `empathyledger.com`

2. **Your app redirects to GitHub OAuth**
   - URL includes: `redirect_to=http://localhost:3000/auth/callback`

3. **User authorizes on GitHub**
   - GitHub doesn't care where the user came from

4. **GitHub redirects to Supabase** (the callback URL)
   - Always: `https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback`
   - This is **hardcoded in the OAuth app settings**

5. **Supabase processes the authorization**
   - Creates session
   - Generates auth tokens
   - Reads the `redirect_to` parameter

6. **Supabase redirects back to your app**
   - Goes to wherever you specified in `redirect_to`
   - Could be: `localhost:3000`, Vercel, or production!

---

## Why This Works Everywhere

### The Callback URL Never Changes

```
GitHub OAuth app callback:
https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback

Microsoft Azure app callback:
https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback

Google OAuth app callback:
https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
```

**This stays the same for:**
- ✅ Local development (localhost:3000)
- ✅ Vercel preview deployments
- ✅ Vercel production
- ✅ Custom domain (empathyledger.com)
- ✅ Multiple custom domains

### The redirect_to Parameter Does Change

In your code ([SimpleSignInForm.tsx:153](../../src/components/auth/SimpleSignInForm.tsx#L153)):

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    // This dynamically uses wherever your app is running!
    redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(defaultRedirect)}`,
  }
})
```

**What `window.location.origin` resolves to:**

| Environment | `window.location.origin` | Where user ends up |
|-------------|-------------------------|-------------------|
| Local dev | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Vercel preview | `https://empathy-ledger-abc123.vercel.app` | `https://empathy-ledger-abc123.vercel.app/auth/callback` |
| Vercel prod | `https://empathy-ledger.vercel.app` | `https://empathy-ledger.vercel.app/auth/callback` |
| Custom domain | `https://empathyledger.com` | `https://empathyledger.com/auth/callback` |

---

## Environment-Specific Setup

### Localhost Development

**No special setup needed!** Just works.

**Flow:**
```
localhost:3000
  → GitHub (authorize)
  → Supabase (callback)
  → localhost:3000/auth/callback (back to your app)
```

**Environment variables (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# No need to specify localhost anywhere!
```

### Vercel Preview Deployments

**Automatic!** Every preview deployment works with OAuth.

**Flow:**
```
https://empathy-ledger-pr-123.vercel.app
  → GitHub (authorize)
  → Supabase (callback)
  → https://empathy-ledger-pr-123.vercel.app/auth/callback
```

**Why it works:**
- Supabase reads `redirectTo` from the auth request
- `window.location.origin` automatically resolves to the Vercel preview URL
- No configuration needed!

### Vercel Production

**Same as preview, just different URL.**

**Flow:**
```
https://empathy-ledger.vercel.app
  → GitHub (authorize)
  → Supabase (callback)
  → https://empathy-ledger.vercel.app/auth/callback
```

### Custom Domain (empathyledger.com)

**Also automatic!**

**Flow:**
```
https://empathyledger.com
  → GitHub (authorize)
  → Supabase (callback)
  → https://empathyledger.com/auth/callback
```

**Setup needed:**
1. Point your domain to Vercel (DNS records)
2. Add domain in Vercel settings
3. **That's it!** OAuth automatically works.

---

## Magic Links Across Environments

### How Magic Links Work

Magic links are **simpler** than OAuth because there's no third-party provider.

**Flow:**
```
1. User enters email
2. Supabase sends email with link
3. Link format: https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/verify?token=...&redirect_to=YOUR_APP
4. User clicks link
5. Supabase verifies token
6. Redirects to YOUR_APP
```

### Environment Variables

Same code works everywhere:

```typescript
await supabase.auth.signInWithOtp({
  email: email.trim(),
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(defaultRedirect)}`,
  }
})
```

### Testing Magic Links Locally

**Challenge:** Email links won't work with `localhost` on a different device.

**Solution 1: Use the same device**
```
1. Request magic link on localhost:3000
2. Check email on same computer
3. Click link → opens localhost:3000 (works!)
```

**Solution 2: Use ngrok for testing on mobile**
```bash
# Install ngrok
brew install ngrok

# Start your app
npm run dev

# Create tunnel
ngrok http 3000

# Use the ngrok URL (https://abc123.ngrok.io) to test on mobile
```

**Solution 3: Use Vercel preview for mobile testing**
```bash
# Push to git branch
git push origin feature-branch

# Vercel auto-deploys
# Test on https://empathy-ledger-feature-branch.vercel.app
```

---

## Common Scenarios

### Scenario 1: Testing OAuth on localhost

**Setup:** One-time only

1. Configure OAuth providers (GitHub, Microsoft, Google)
2. Set callback URL to: `https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback`

**Development:**
```bash
npm run dev
# Open http://localhost:3000/signin
# Click GitHub/Microsoft/Google
# Works automatically!
```

### Scenario 2: Deploying to Vercel

**Setup:** None needed!

```bash
# Push to main branch
git push origin main

# Vercel auto-deploys to:
# https://empathy-ledger.vercel.app

# OAuth automatically works
# Magic links automatically work
```

### Scenario 3: Adding Custom Domain

**Setup:**

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add domain: `empathyledger.com`
   - Follow DNS instructions

2. **In Supabase:** (Optional but recommended)
   - Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/url-configuration
   - Add to "Site URL": `https://empathyledger.com`
   - Add to "Redirect URLs": `https://empathyledger.com/**`

3. **Test:**
   - Visit `https://empathyledger.com/signin`
   - OAuth works automatically!

### Scenario 4: Multiple Developers (localhost)

**Each developer:**
```bash
git clone repo
npm install
cp .env.example .env.local
# Add Supabase credentials
npm run dev
# OAuth works on their localhost:3000!
```

**No conflicts!** Each developer's OAuth redirects to their own localhost.

---

## Supabase Redirect URL Configuration

### Site URL Setting

**Location:**
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/url-configuration

**Site URL:**
```
https://empathyledger.com
```
(Your primary production domain)

**Redirect URLs (Whitelist):**
```
http://localhost:3000/**
http://localhost:*/**
https://*.vercel.app/**
https://empathyledger.com/**
https://www.empathyledger.com/**
```

**What this does:**
- Allows redirects to any of these URLs
- Blocks redirects to other domains (security)
- Wildcards (`*`) make it flexible

### Why Wildcards Are Safe

```
https://*.vercel.app/**
```

**Allows:**
- ✅ `https://empathy-ledger.vercel.app/auth/callback`
- ✅ `https://empathy-ledger-pr-123.vercel.app/auth/callback`
- ✅ Any Vercel preview deployment

**Blocks:**
- ❌ `https://evil-site.com/auth/callback`
- ❌ `https://phishing.com/auth/callback`

---

## Security Considerations

### HTTPS in Production

**localhost:** HTTP is fine (development only)
**Vercel:** Always HTTPS (automatic)
**Custom domain:** Always HTTPS (Vercel provides SSL)

**OAuth providers require HTTPS** in production (won't work with HTTP).

### CSRF Protection

Supabase automatically includes CSRF tokens in the auth flow:

```
1. User clicks OAuth button
2. Supabase generates state token (random)
3. Stores in session cookie
4. Sends to OAuth provider
5. OAuth provider returns state token
6. Supabase verifies it matches
7. Only then creates session
```

**You don't need to do anything!** This is built into Supabase.

### Redirect URL Validation

**Why we whitelist redirect URLs:**

Without whitelist:
```typescript
// Attacker could do:
redirectTo: 'https://evil-site.com/steal-session'
```

With whitelist (Supabase settings):
```
Allowed: https://empathyledger.com/**
Blocked: https://evil-site.com/**
```

**Protection:** Supabase checks `redirectTo` against your whitelist before redirecting.

---

## Troubleshooting

### Issue: OAuth redirects to wrong URL

**Symptoms:**
- Clicks GitHub → authorizes → lands on wrong domain
- Expected: `localhost:3000`
- Actual: `empathyledger.com`

**Cause:** `redirectTo` is hardcoded or wrong

**Fix:** Ensure code uses `window.location.origin`:
```typescript
redirectTo: `${window.location.origin}/auth/callback`
// NOT hardcoded:
// redirectTo: 'https://empathyledger.com/auth/callback'
```

### Issue: "Invalid redirect URL" error

**Symptoms:**
- OAuth fails with error message
- "The redirect_uri does not match"

**Cause:** URL not in Supabase whitelist

**Fix:**
1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/url-configuration
2. Add to Redirect URLs:
   ```
   http://localhost:3000/**
   https://*.vercel.app/**
   https://your-domain.com/**
   ```
3. Save
4. Try again

### Issue: Magic link opens on wrong device

**Symptoms:**
- Request magic link on phone
- Email opens on computer
- Click link → tries to open localhost on computer (fails)

**Solution 1:** Request magic link on same device you'll click it

**Solution 2:** Use Vercel preview URL on phone instead of localhost

**Solution 3:** Use ngrok tunnel for cross-device testing

### Issue: OAuth works on localhost but not Vercel

**Symptoms:**
- localhost:3000 OAuth: ✅ Works
- vercel.app OAuth: ❌ Fails

**Check:**
1. Is `*.vercel.app` in Supabase redirect whitelist?
2. Is HTTPS being used? (should be automatic on Vercel)
3. Are environment variables set in Vercel dashboard?

**Fix:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Redeploy

---

## Environment Variables Checklist

### Required Everywhere

**.env.local (local development):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel Environment Variables:**
```
Production:
  NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

Preview:
  (same values)

Development:
  (same values)
```

**Why same values everywhere:**
- You're using the **same Supabase project** for all environments
- Auth flow works because `redirectTo` changes dynamically
- No need for multiple Supabase projects!

### Optional: Environment-Specific Features

If you want different behavior per environment:

```bash
# .env.local (local)
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG=true

# Vercel preview
NEXT_PUBLIC_ENV=preview
NEXT_PUBLIC_ENABLE_DEBUG=true

# Vercel production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG=false
```

Then in code:
```typescript
if (process.env.NEXT_PUBLIC_ENV === 'development') {
  console.log('Running in development mode')
}
```

---

## Best Practices

### 1. Use Dynamic Origins

✅ **Good:**
```typescript
redirectTo: `${window.location.origin}/auth/callback`
```

❌ **Bad:**
```typescript
redirectTo: 'https://empathyledger.com/auth/callback'
```

### 2. Whitelist All Your Domains

In Supabase redirect URLs:
```
http://localhost:3000/**
http://localhost:*/**
https://*.vercel.app/**
https://empathyledger.com/**
https://www.empathyledger.com/**
```

### 3. Test on Multiple Environments

Before going live:
- ✅ Test OAuth on localhost
- ✅ Test OAuth on Vercel preview
- ✅ Test OAuth on production domain
- ✅ Test magic links on each
- ✅ Test on mobile devices

### 4. Monitor Auth Errors

Use Supabase logs:
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/logs/explorer
```

Filter for auth errors:
```sql
SELECT * FROM auth.logs
WHERE level = 'error'
ORDER BY created_at DESC
LIMIT 100
```

---

## Quick Reference

### OAuth Callback URL (Never Changes)
```
https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
```

Use this in:
- GitHub OAuth app settings
- Microsoft Azure app registration
- Google Cloud Console

### Redirect URLs in Supabase (Whitelist)
```
http://localhost:3000/**
https://*.vercel.app/**
https://empathyledger.com/**
```

### Code Pattern (Always Use)
```typescript
// Dynamic origin
redirectTo: `${window.location.origin}/auth/callback`

// NOT hardcoded
// redirectTo: 'https://empathyledger.com/auth/callback'
```

---

## Summary

**The Beautiful Part:**

You configure OAuth providers **once** with the Supabase callback URL, and it works everywhere:
- ✅ localhost (all developers)
- ✅ Vercel previews (all PRs)
- ✅ Vercel production
- ✅ Custom domains
- ✅ Multiple domains

**No environment-specific configuration needed in OAuth providers!**

The magic is:
1. OAuth callback **always** goes to Supabase (fixed URL)
2. Supabase reads `redirectTo` parameter (dynamic URL)
3. Redirects user back to wherever they came from
4. Works seamlessly across all environments!

---

**Questions about specific environments?** Check the troubleshooting section or test the flow yourself!

**Next:** Follow the [Authentication Setup Walkthrough](./AUTHENTICATION_SETUP_WALKTHROUGH.md) to configure OAuth providers.
