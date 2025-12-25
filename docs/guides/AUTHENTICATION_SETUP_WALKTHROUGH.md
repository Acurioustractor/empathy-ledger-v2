# Authentication Setup - Complete Walkthrough

Step-by-step guide to set up GitHub, Microsoft, and Google OAuth for Empathy Ledger.

**Time Required:** 40 minutes total
- GitHub OAuth: 5 minutes
- Microsoft OAuth: 10 minutes
- Google OAuth: 10 minutes
- Testing: 10 minutes
- Email Templates: 5 minutes

---

## Before You Start

**What You'll Need:**
- Access to your Supabase Dashboard
- A GitHub account
- A Microsoft account (for Azure Portal)
- A Google account (for Google Cloud Console)

**Current Status:**
- ✅ Code updated with GitHub, Microsoft, Google OAuth
- ✅ Magic links working as default
- ⏳ Need to configure GitHub OAuth provider in Supabase
- ⏳ Need to configure Microsoft OAuth provider in Supabase
- ⏳ Need to configure Google OAuth provider in Supabase

---

## Part 1: GitHub OAuth Setup (5 minutes)

### Step 1.1: Create GitHub OAuth App

1. **Go to GitHub Developer Settings**
   ```
   https://github.com/settings/developers
   ```

2. **Click "OAuth Apps" in left sidebar**

3. **Click "New OAuth App" button** (green button, top right)

4. **Fill in the form:**

   ```
   Application name: Empathy Ledger

   Homepage URL: https://empathyledger.com
   (or your production domain)

   Application description: (optional)
   Indigenous storytelling and cultural preservation platform

   Authorization callback URL:
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

5. **Click "Register application"**

### Step 1.2: Get GitHub Credentials

After registration, you'll see:

1. **Copy the Client ID**
   - It looks like: `Iv1.a1b2c3d4e5f6g7h8`
   - Save it somewhere temporarily

2. **Generate a Client Secret**
   - Click "Generate a new client secret"
   - **IMPORTANT:** Copy the secret immediately!
   - It looks like: `abc123def456ghi789jkl012mno345pqr678stu901vwx234`
   - You can only see it once!

### Step 1.3: Configure in Supabase

1. **Go to Supabase Auth Providers**
   ```
   https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers
   ```

2. **Scroll down to find "GitHub"**

3. **Toggle "GitHub enabled" to ON**

4. **Paste your credentials:**
   - **Client ID**: [paste from GitHub]
   - **Client Secret**: [paste from GitHub]

5. **Verify the Redirect URL shows:**
   ```
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

6. **Click "Save"** (bottom right)

### ✅ GitHub OAuth Complete!

Test it later in Part 4.

---

## Part 2: Microsoft OAuth Setup (10 minutes)

### Step 2.1: Go to Azure Portal

1. **Open Azure Active Directory**
   ```
   https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
   ```

2. **Sign in with your Microsoft account**
   - Personal account works fine
   - Work/school account also works

### Step 2.2: Register New Application

1. **Click "New registration"** (top left)

2. **Fill in the registration form:**

   ```
   Name: Empathy Ledger

   Supported account types:
   ☑️ Accounts in any organizational directory
      (Any Azure AD directory - Multitenant)
      and personal Microsoft accounts
      (e.g. Skype, Xbox)

   Redirect URI:
   Platform: Web
   URL: https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

3. **Click "Register"** (bottom)

### Step 2.3: Get Application ID

After registration, you'll see the Overview page:

1. **Copy these values:**
   - **Application (client) ID**: `12345678-90ab-cdef-1234-567890abcdef`
   - **Directory (tenant) ID**: (for reference only)

### Step 2.4: Create Client Secret

1. **In left sidebar, click "Certificates & secrets"**

2. **Click "New client secret"**

3. **Fill in:**
   ```
   Description: Empathy Ledger Auth
   Expires: 24 months (recommended)
   ```

4. **Click "Add"**

5. **IMMEDIATELY COPY THE SECRET VALUE!**
   - Looks like: `abc~123_def456ghi789JKL012MNO345pqr678STU901`
   - You can NEVER see it again after you leave this page!
   - **DO NOT copy the "Secret ID" - copy the "Value"**

### Step 2.5: Verify API Permissions

1. **In left sidebar, click "API permissions"**

2. **You should see:**
   ```
   Microsoft Graph
   - User.Read (Delegated)
   ```

3. **This is already correct!** No changes needed.

### Step 2.6: Configure in Supabase

1. **Go to Supabase Auth Providers**
   ```
   https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers
   ```

2. **Scroll down to find "Azure"**

3. **Toggle "Azure enabled" to ON**

4. **Paste your credentials:**
   - **Client ID**: [paste Application (client) ID]
   - **Secret**: [paste Client Secret VALUE]

5. **Azure Tenant URL: Leave BLANK**
   - Blank allows both personal and work accounts
   - This is what you want!

6. **Verify the Redirect URL shows:**
   ```
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

7. **Click "Save"** (bottom right)

### ✅ Microsoft OAuth Complete!

Test it later in Part 4.

---

## Part 3: Google OAuth Setup (10 minutes)

### Step 3.1: Go to Google Cloud Console

1. **Open Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Sign in with your Google account**
   - Personal Gmail account works fine
   - Work/school Google Workspace account also works

### Step 3.2: Create or Select a Project

1. **Click the project dropdown** (top left, next to "Google Cloud")

2. **Either:**
   - **Create new project:**
     - Click "New Project"
     - Name: `Empathy Ledger`
     - Click "Create"
     - Wait for project creation (~30 seconds)

   - **Use existing project:**
     - Select your existing project from the list

3. **Make sure you're in the correct project** (check top bar)

### Step 3.3: Enable Google+ API (Required)

1. **Go to APIs & Services**
   ```
   https://console.cloud.google.com/apis/library
   ```

2. **Search for "Google+ API"** in the search box

3. **Click "Google+ API"** from results

4. **Click "Enable"** button

5. **Wait for activation** (~10 seconds)

### Step 3.4: Configure OAuth Consent Screen

1. **Go to OAuth consent screen**
   ```
   https://console.cloud.google.com/apis/credentials/consent
   ```

2. **Choose User Type:**
   - **External** (recommended - allows any Google account)
   - Click "Create"

3. **Fill in App Information:**
   ```
   App name: Empathy Ledger

   User support email: [your email]

   App logo: (optional - skip for now)

   Application home page:
   - Use your GitHub repository: https://github.com/Acurioustractor/empathy-ledger-v2
   - OR GitHub Pages: https://[your-github-username].github.io
   - OR your domain: https://empathyledger.com

   Authorized domains:
   - github.com (if using GitHub repo URL)
   - OR [your-github-username].github.io (if using GitHub Pages)
   - OR empathyledger.com (if you have it)

   Developer contact email: [your email]
   ```

   **Recommended Options:**
   1. **GitHub Repository** (Best for this project):
      - Home page: `https://github.com/Acurioustractor/empathy-ledger-v2`
      - Authorized domain: `github.com`
      - Professional and links to your actual project

   2. **GitHub Pages** (Alternative):
      - Home page: `https://benknight.github.io`
      - Authorized domain: `benknight.github.io`
      - No setup needed

4. **Click "Save and Continue"**

5. **Scopes page:**
   - Click "Add or Remove Scopes"
   - Search and select:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

6. **Test users page:**
   - For development, add your email as a test user
   - Click "Add Users"
   - Enter your email
   - Click "Add"
   - Click "Save and Continue"

7. **Summary page:**
   - Review settings
   - Click "Back to Dashboard"

### Step 3.5: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Click "Create Credentials" → "OAuth client ID"**

3. **Configure OAuth Client:**
   ```
   Application type: Web application

   Name: Empathy Ledger Web App

   Authorized JavaScript origins:
   - http://localhost:3000
   - https://empathyledger.com
   - https://your-project.vercel.app

   Authorized redirect URIs:
   - https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

4. **Click "Create"**

### Step 3.6: Copy Credentials

After creation, a modal appears with your credentials:

1. **Copy the Client ID**
   - Looks like: `123456789-abc123def456.apps.googleusercontent.com`
   - Save it temporarily

2. **Copy the Client Secret**
   - Looks like: `GOCSPX-abc123def456ghi789`
   - Save it temporarily

3. **Click "OK"** to close modal

**Don't worry if you close it** - you can always view them again from the Credentials page.

### Step 3.7: Configure in Supabase

1. **Go to Supabase Auth Providers**
   ```
   https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers
   ```

2. **Scroll down to find "Google"**

3. **Toggle "Google enabled" to ON**

4. **Paste your credentials:**
   - **Client ID (for OAuth)**: [paste from Google Cloud Console]
   - **Client Secret (for OAuth)**: [paste from Google Cloud Console]

5. **Verify the Redirect URL shows:**
   ```
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

6. **Click "Save"** (bottom right)

### ✅ Google OAuth Complete!

---

## Part 4: Test All Authentication Methods (10 minutes)

### Step 4.1: Start Your Dev Server

```bash
# Navigate to project
cd /Users/benknight/Code/empathy-ledger-v2

# Start dev server
npm run dev
```

Wait for: "Ready on http://localhost:3000"

### Step 4.2: Open Sign-In Page

```bash
# Open in browser
open http://localhost:3000/signin
```

Or manually navigate to: http://localhost:3000/signin

### Step 4.3: Test Magic Link (Default)

**This should already be the default view.**

1. **Enter your email** (e.g., your.email@example.com)

2. **Click "✨ Send Magic Link"**

3. **Check your email** (within 1-2 minutes)
   - Check spam folder if not in inbox
   - Email from: noreply@mail.app.supabase.io

4. **Click the link in the email**

5. **Should redirect you back, logged in!**

✅ **Expected:** Logged in successfully
❌ **If fails:** Check email spelling, spam folder, wait 5 minutes

### Step 4.4: Test Password Authentication

1. **Click "Use password instead"** (below the form)

2. **Enter email and create a password**

3. **Click "Sign In with Password"**

4. **Should log you in**

✅ **Expected:** Logged in successfully
❌ **If fails:** Check console for errors

### Step 4.5: Test GitHub OAuth

1. **Scroll down to "Or continue with" section**

2. **Click the black "Continue with GitHub" button**

3. **GitHub authorization page should open**
   - If you're already logged into GitHub, it skips to next step
   - If not, log in to GitHub first

4. **Click "Authorize [your app name]"**

5. **Redirects back to your app, logged in!**

✅ **Expected:** Logged in with GitHub account
❌ **If fails:** See troubleshooting below

### Step 4.6: Test Microsoft OAuth

1. **Click "Continue with Microsoft"** (white button with colorful squares)

2. **Microsoft login page should open**

3. **Choose an account:**
   - Personal Microsoft account (Outlook, Hotmail, etc.)
   - OR Work/School account

4. **Sign in if needed**

5. **Click "Yes" to grant permissions**

6. **Redirects back to your app, logged in!**

✅ **Expected:** Logged in with Microsoft account
❌ **If fails:** See troubleshooting below

### Step 4.7: Test Google OAuth

1. **Click "Continue with Google"** (white button with Google logo)

2. **Google account chooser should appear**

3. **Select your Google account**

4. **Click "Continue" to grant permissions**

5. **Redirects back to your app, logged in!**

✅ **Expected:** Logged in with Google account
❌ **If fails:** Already working, check console

---

## Part 5: Customize Email Templates (5 minutes)

Make your magic link emails more welcoming!

### Step 5.1: Go to Email Templates

```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/templates
```

### Step 5.2: Customize Magic Link Email

1. **Click on "Magic Link" template**

2. **Replace the default content with:**

```html
<h2 style="color: #2c5530; font-family: sans-serif;">Welcome to Empathy Ledger</h2>

<p style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
  Click the button below to sign in to your account:
</p>

<p style="margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}"
     style="background-color: #2c5530;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-family: sans-serif;
            display: inline-block;">
    Sign in to Empathy Ledger
  </a>
</p>

<p style="font-family: sans-serif; font-size: 14px; color: #666;">
  This link will expire in 10 minutes for your security.
</p>

<p style="font-family: sans-serif; font-size: 14px; color: #666;">
  If you didn't request this link, you can safely ignore this email.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: sans-serif; font-size: 12px; color: #999;">
  Having trouble? Contact us at support@empathyledger.com
</p>
```

3. **Click "Save"**

### Step 5.3: Customize Confirmation Email (Optional)

1. **Click on "Confirm signup" template**

2. **Customize similarly** (same style as above)

3. **Click "Save"**

### Step 5.4: Test the New Email

1. **Go back to your sign-in page**

2. **Request a new magic link**

3. **Check your email** - should look much nicer now!

---

## Troubleshooting

### Issue: GitHub OAuth Shows "Redirect URI Mismatch"

**Cause:** The callback URL in GitHub doesn't match Supabase

**Fix:**
1. Go to https://github.com/settings/developers
2. Click your app
3. Verify Authorization callback URL is EXACTLY:
   ```
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```
4. Save changes
5. Try again

### Issue: Microsoft OAuth Shows "AADSTS50011" Error

**Cause:** Redirect URI not configured in Azure

**Fix:**
1. Go to Azure Portal → Your App → Authentication
2. Click "Add a platform" → Web
3. Enter redirect URI:
   ```
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```
4. Save
5. Try again

### Issue: Microsoft OAuth Shows "Need admin approval"

**Cause:** Work account requires admin consent

**Solutions:**
- Use a personal Microsoft account instead (Outlook, Hotmail)
- OR ask your IT admin to approve the app
- OR change to "Single tenant" in Azure (limits to your org only)

### Issue: Magic Link Not Received

**Check:**
1. ✅ Spam/junk folder
2. ✅ Email address spelling
3. ✅ Wait full 5 minutes (can be slow)
4. ✅ Check Supabase email quota (Dashboard → Settings)

**Fix:**
- Add `noreply@mail.app.supabase.io` to contacts/safe senders
- Use password authentication temporarily
- Configure custom SMTP (advanced)

### Issue: "Invalid provider" Error

**Cause:** Provider not enabled in Supabase

**Fix:**
1. Go to Supabase → Auth → Providers
2. Find the provider (GitHub/Azure/Google)
3. Toggle to ON
4. Paste credentials
5. Save
6. Try again

### Issue: OAuth Opens Then Immediately Closes

**Cause:** Pop-up blocker or redirect URL mismatch

**Fix:**
1. Allow pop-ups for localhost:3000
2. Verify redirect URLs in all providers match exactly
3. Check browser console for errors
4. Try in incognito/private mode

---

## Next Steps

### Immediate (After Setup)

1. ✅ **Test all 5 authentication methods**
   - Magic link
   - Password
   - GitHub
   - Microsoft
   - Google

2. ✅ **Verify user profiles are created**
   - Go to Supabase → Authentication → Users
   - Should see new users from OAuth

3. ✅ **Check that redirects work**
   - After login, should redirect to intended page

### Short-term (This Week)

1. **Configure Production URLs**
   - Update OAuth apps with production domain
   - Update Supabase redirect URLs
   - Test on production

2. **Add Custom SMTP** (Optional)
   - For branded emails
   - Better deliverability
   - See: https://supabase.com/docs/guides/auth/auth-smtp

3. **Set Up MFA for Admins** (Optional)
   - See: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md#step-7-add-multi-factor-authentication-optional-admins-only)

### Long-term (Next Month)

1. **Monitor Authentication Metrics**
   - Track which methods users prefer
   - Monitor completion rates
   - Identify pain points

2. **Gather User Feedback**
   - Especially from elders
   - Test with low-tech users
   - Iterate based on feedback

3. **Add Localization**
   - Translate auth UI to Indigenous languages
   - Customize for different communities
   - Allow organization-level customization

---

## Quick Reference

### OAuth Callback URL (All Providers)
```
https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
```

### Supabase Dashboard Links

**Auth Providers:**
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers
```

**Email Templates:**
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/templates
```

**Users:**
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/users
```

### Provider Setup Links

**GitHub OAuth:**
```
https://github.com/settings/developers
```

**Microsoft Azure:**
```
https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
```

**Google Cloud:**
```
https://console.cloud.google.com/apis/credentials
```

---

## Success Checklist

Use this to verify everything is working:

### Setup Complete
- [ ] GitHub OAuth app created in GitHub
- [ ] GitHub credentials added to Supabase
- [ ] Microsoft app registered in Azure Portal
- [ ] Microsoft credentials added to Supabase
- [ ] Google Cloud project created
- [ ] Google OAuth consent screen configured
- [ ] Google OAuth credentials created
- [ ] Google credentials added to Supabase
- [ ] Email templates customized

### Testing Complete
- [ ] Magic link works
- [ ] Password auth works
- [ ] GitHub OAuth works
- [ ] Microsoft OAuth works
- [ ] Google OAuth works
- [ ] Redirects work correctly
- [ ] User profiles created in database

### Production Ready
- [ ] Production URLs added to all OAuth apps
- [ ] Tested on production environment
- [ ] Documentation shared with team
- [ ] Support process established
- [ ] Monitoring set up

---

## Getting Help

**Documentation:**
- Full guide: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
- Supabase Auth: https://supabase.com/docs/guides/auth

**Common Issues:**
- See "Troubleshooting" section above
- Check browser console for errors
- Review Supabase logs: Dashboard → Logs

**Support:**
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Your repo

---

**Estimated Total Time:** 30 minutes

**Status After Completion:** ✅ Full flexible authentication ready!

**Next:** Test with real users and gather feedback

---

**Last Updated:** December 25, 2025
**Version:** 1.0.0
