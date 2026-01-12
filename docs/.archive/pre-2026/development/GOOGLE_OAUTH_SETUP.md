# Google OAuth Setup Guide for Empathy Ledger

## 🎯 Goal
Enable "Continue with Google" login for the easiest user authentication experience.

## 📋 Prerequisites
- Google account
- Access to Google Cloud Console
- Access to your Supabase dashboard

## 🚀 Step-by-Step Setup

### Step 1: Get Your Supabase OAuth Redirect URL

1. Go to your Supabase project dashboard: https://app.supabase.com/
2. Navigate to **Authentication** → **Providers**
3. Find the **Google** provider section
4. You'll see a redirect URL like: `https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback`
5. **Copy this URL** - you'll need it for Google Cloud Console

### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **OAuth 2.0 Client IDs**
5. If prompted, configure OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "Empathy Ledger"
   - Add your email as support email
   - Add authorized domains: `localhost` and your domain
   - Save

6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Empathy Ledger Web Client"
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-domain.com (if you have one)
   ```
   
   **Authorized redirect URIs:**
   ```
   https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
   ```

7. Click **Create**
8. **Copy the Client ID and Client Secret** - you'll need these for Supabase

### Step 3: Configure Supabase

1. Back in your Supabase dashboard
2. Go to **Authentication** → **Providers**
3. Find **Google** and click to configure
4. Enable the Google provider
5. Paste your **Google Client ID**
6. Paste your **Google Client Secret**
7. Click **Save**

### Step 4: Test the Integration

1. Go to: http://localhost:3000/auth/signin
2. You should see the "Continue with Google" button
3. Click it to test the OAuth flow

## 🔧 Environment Variables (Optional)

Add to your `.env.local` for better admin management:

```bash
# Super Admin Configuration
SUPER_ADMIN_EMAILS=benjamin@act.place,admin@yourdomain.com

# OAuth Configuration (optional - handled by Supabase)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that your redirect URI in Google Cloud Console exactly matches Supabase's callback URL
- Make sure there are no trailing slashes or typos

### Error: "OAuth not configured"
- Verify Google provider is enabled in Supabase
- Check that Client ID and Secret are correctly pasted

### Error: "Invalid origin"
- Add `http://localhost:3000` to Authorized JavaScript origins in Google Cloud Console
- For production, add your actual domain

## ✅ Success Indicators

When working correctly, you'll see:
1. Google OAuth button on sign-in page
2. Clicking it redirects to Google's consent screen
3. After granting permission, user is redirected back to your app
4. User is automatically signed in and redirected to dashboard

## 🎉 What Happens After Setup

Once configured, users can:
- Sign in with Google in one click
- Automatically get a profile created
- Skip password management entirely
- Use the same account across devices seamlessly

The system will automatically:
- Create user profiles for new Google users
- Handle admin permissions based on email
- Redirect to appropriate dashboard after login