# Authentication Setup Guide

Complete guide to setting up GitHub, Microsoft, and Google OAuth for Empathy Ledger.

---

## Overview

Empathy Ledger uses a **flexible, inclusive authentication system** aligned with:
- **OCAP Principles** (Indigenous data sovereignty)
- **WCAG AAA** (highest accessibility standard)
- **Cultural Safety** (respects diverse technology access)

### Authentication Methods (Priority Order)

1. ✅ **Email Magic Links** (Default, Recommended)
   - No password to remember
   - WCAG AAA compliant
   - Perfect for elders and low tech literacy
   - No third-party dependency

2. ✅ **Password Authentication** (Fallback)
   - Works offline after initial login
   - No email dependency
   - Traditional method for those who prefer it

3. ⚙️ **Social OAuth** (Optional)
   - **GitHub** - Developer community
   - **Microsoft** - Enterprise users, better privacy
   - **Google** - Already configured
   - ⚠️ Data sovereignty concerns - always optional

---

## Step 1: Configure OAuth Providers in Supabase

### A. GitHub OAuth Setup

**1. Create GitHub OAuth App**

Go to: https://github.com/settings/developers

Click "New OAuth App" and configure:

```
Application name: Empathy Ledger
Homepage URL: https://your-domain.com
Authorization callback URL: https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
```

**2. Get Credentials**
- After creating, note your **Client ID**
- Click "Generate a new client secret" → note the **Client Secret**

**3. Configure in Supabase**

Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers

Find "GitHub" and configure:
- **GitHub enabled**: ON
- **Client ID**: [paste from GitHub]
- **Client Secret**: [paste from GitHub]
- **Redirect URL**: `https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback` (pre-filled)

Click "Save"

---

### B. Microsoft (Azure) OAuth Setup

**1. Register Application in Azure**

Go to: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

Click "New registration" and configure:

```
Name: Empathy Ledger
Supported account types: Accounts in any organizational directory and personal Microsoft accounts
Redirect URI:
  - Type: Web
  - URL: https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback
```

**2. Get Application (Client) ID**
- After registration, copy the **Application (client) ID**
- Copy the **Directory (tenant) ID** (for reference)

**3. Create Client Secret**
- Go to "Certificates & secrets"
- Click "New client secret"
- Description: "Empathy Ledger Auth"
- Expires: 24 months (recommended)
- Click "Add"
- **IMMEDIATELY COPY THE SECRET VALUE** (you can't see it again!)

**4. Configure API Permissions**
- Go to "API permissions"
- Should already have "User.Read" - that's all you need
- If not, click "Add a permission" → Microsoft Graph → Delegated → User.Read

**5. Configure in Supabase**

Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers

Find "Azure" and configure:
- **Azure enabled**: ON
- **Client ID**: [paste Application (client) ID]
- **Secret**: [paste Client Secret value]
- **Redirect URL**: `https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback` (pre-filled)
- **Azure Tenant URL**: Leave blank (allows both work and personal accounts)

Click "Save"

---

### C. Google OAuth (Already Configured)

Your Google OAuth is already set up. Verify configuration:

Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/providers

Find "Google" and verify:
- **Google enabled**: ON
- **Client ID**: [your existing client ID]
- **Client Secret**: [configured]

If you need to update:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Update Authorized redirect URIs to include:
   - `https://yvnuayzslukamizrlhwb.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)

---

## Step 2: Update Environment Variables

Add OAuth configuration to your `.env.local`:

```bash
# Authentication
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OAuth Providers (configured in Supabase Dashboard)
# GitHub - enabled
# Microsoft Azure - enabled
# Google - enabled

# Authentication Settings
NEXT_PUBLIC_AUTH_DEFAULT_METHOD=magic_link
NEXT_PUBLIC_AUTH_MAGIC_LINK_EXPIRY=600 # 10 minutes (elder-friendly)
NEXT_PUBLIC_AUTH_ALLOW_SIGNUPS=true
```

---

## Step 3: Update Authentication Component

The authentication form at [src/components/auth/SimpleSignInForm.tsx](../../src/components/auth/SimpleSignInForm.tsx) needs enhancements for GitHub and Microsoft.

**Current State:**
- ✅ Magic links (default)
- ✅ Password fallback
- ✅ Google OAuth

**Enhancements Needed:**
- Add GitHub OAuth button
- Add Microsoft OAuth button
- Improve accessibility (ARIA labels, help text)
- Add progressive enhancement

See implementation in next section.

---

## Step 4: Test Authentication Flow

### Testing Checklist

**Magic Links:**
- [ ] Enter email → receive magic link within 1 minute
- [ ] Click link → automatically logged in
- [ ] Check spam folder if not received
- [ ] Verify 10-minute expiration works
- [ ] Test with screen reader

**Password:**
- [ ] Toggle to password mode
- [ ] Create account with password
- [ ] Login with password
- [ ] Password reset flow works
- [ ] Password strength validation

**GitHub OAuth:**
- [ ] Click "Continue with GitHub"
- [ ] Redirects to GitHub
- [ ] Authorize application
- [ ] Redirects back, logged in
- [ ] Email from GitHub account populated

**Microsoft OAuth:**
- [ ] Click "Continue with Microsoft"
- [ ] Choose personal or work account
- [ ] Authorize application
- [ ] Redirects back, logged in
- [ ] Email from Microsoft account populated

**Google OAuth:**
- [ ] Click "Continue with Google"
- [ ] Choose Google account
- [ ] Authorize application
- [ ] Redirects back, logged in

**Accessibility:**
- [ ] Tab navigation works correctly
- [ ] Screen reader announces all elements
- [ ] High contrast mode works
- [ ] Large text setting increases font sizes
- [ ] Keyboard-only navigation possible

---

## Step 5: Configure Email Templates (Magic Links)

### Customize Magic Link Emails

Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/templates

**Email Templates to Customize:**

**1. Magic Link Email**
```html
<h2>Welcome to Empathy Ledger</h2>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to Empathy Ledger</a></p>
<p>This link will expire in 10 minutes.</p>
<p>If you didn't request this link, you can safely ignore this email.</p>
<p><small>Having trouble? Contact us at support@empathyledger.com</small></p>
```

**2. Confirmation Email** (for password signups)
```html
<h2>Confirm your email</h2>
<p>Thank you for joining Empathy Ledger. Please confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

**3. Password Reset**
```html
<h2>Reset your password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link will expire in 10 minutes.</p>
```

**Customization Tips:**
- Use plain language
- Include organization branding (logo)
- Add support contact information
- Consider Indigenous language translations
- Keep email file size small for slow connections

---

## Step 6: Configure Row Level Security

Ensure authentication data respects data sovereignty:

```sql
-- Only users can see their own auth data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Store OAuth provider info for transparency
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_metadata JSONB;

-- Update on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, auth_provider, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_app_meta_data->>'provider',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Step 7: Add Multi-Factor Authentication (Optional, Admins Only)

For organization administrators who want extra security:

### Enable MFA in Supabase

Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/auth/settings

Under "Multi-Factor Authentication":
- Enable TOTP (Time-based One-Time Password)

### Implementation
```typescript
// In admin settings page
const enableMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Empathy Ledger Admin'
  })

  if (data) {
    // Show QR code for user to scan with authenticator app
    return data.totp.qr_code
  }
}
```

**MFA should be:**
- ✅ Optional for regular users
- ✅ Recommended for organization admins
- ✅ Required for super admins
- ✅ User's choice of method (authenticator app, email, SMS where available)

---

## Accessibility Checklist

Ensure authentication meets WCAG AAA:

### Visual
- [ ] Minimum 7:1 contrast ratio for text
- [ ] Font size minimum 16px (body text)
- [ ] Button touch targets minimum 44x44px
- [ ] Clear focus indicators (keyboard navigation)
- [ ] No information conveyed by color alone

### Cognitive
- [ ] Clear, simple language (no jargon)
- [ ] Progressive disclosure (one step at a time)
- [ ] Error messages are specific and helpful
- [ ] Success states are clearly indicated
- [ ] No time pressure (extended timeouts)

### Motor
- [ ] All functionality available via keyboard
- [ ] Large click/touch targets
- [ ] No required fine motor skills
- [ ] Generous spacing between interactive elements

### Screen Readers
- [ ] All images have alt text
- [ ] ARIA labels on all form fields
- [ ] Proper heading hierarchy
- [ ] Form validation errors announced
- [ ] Loading states announced

---

## Cultural Safety Considerations

### Data Sovereignty

**Make it clear what data goes where:**

```
When you sign in with [Provider]:
✓ We receive: Your email and name
✓ We do NOT receive: Your password, browsing history, or contacts
✓ [Provider] knows: You have an Empathy Ledger account
✓ Your stories stay on Empathy Ledger servers

Alternative: Use magic links - no data shared with third parties
```

### Community Control

Allow organizations to customize:
- Which authentication methods are available
- Whether OAuth is allowed (data sovereignty)
- Custom email templates in Indigenous languages
- Trusted email domains (tribal organization emails)

### Progressive Enhancement

Ensure authentication works for users with:
- Slow internet connections
- Basic mobile phones
- Limited tech literacy
- No JavaScript (graceful degradation)

---

## Troubleshooting

### Magic Links Not Received

**Check:**
1. Spam/junk folder
2. Email address spelling
3. SMTP configuration in Supabase
4. Email provider blocking automated emails
5. Wait full 5 minutes (delivery can be slow)

**Solutions:**
- Add noreply@mail.app.supabase.io to contacts
- Use password fallback temporarily
- Configure custom SMTP for reliable delivery

### OAuth Redirect Errors

**Common causes:**
1. Redirect URL not configured in provider (GitHub/Microsoft/Google)
2. Localhost vs production URL mismatch
3. HTTPS required (HTTP won't work in production)

**Fix:**
- Add both localhost and production URLs to provider settings
- Ensure using HTTPS in production
- Check Supabase callback URL matches exactly

### Users Can't Remember Passwords

**Solution:**
- Promote magic links as primary method
- Make "Forgot password?" link very visible
- Consider passwordless-only for elder-focused communities

### Accessibility Issues

**Test with:**
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Browser zoom to 200%
- High contrast mode
- Voice control software

---

## Security Best Practices

### Protecting User Data

1. **Never log passwords or tokens**
2. **Use HTTPS everywhere** (enforced)
3. **Implement rate limiting** on auth endpoints
4. **Monitor for suspicious activity**
5. **Regular security audits**

### Indigenous Data Sovereignty

1. **Minimize data collection** - only what's necessary
2. **Transparent about data sharing** - clear what goes to OAuth providers
3. **User control** - easy to delete account and data
4. **Community control** - organizations can disable OAuth
5. **Local data storage** - keep stories on Indigenous-controlled infrastructure

---

## Success Metrics

Track these to ensure authentication is accessible:

**Completion Rates:**
- % of users successfully logging in by method
- % of users completing signup flow
- Time to complete authentication

**Accessibility:**
- % of users using magic links (should be highest)
- Support requests by authentication method
- Screen reader user success rate

**Cultural:**
- % of organizations customizing auth settings
- Feedback on data sovereignty concerns
- Indigenous language adoption (when available)

---

## Resources

**Supabase Documentation:**
- [Auth Setup](https://supabase.com/docs/guides/auth)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Magic Links](https://supabase.com/docs/guides/auth/passwordless-login)
- [MFA](https://supabase.com/docs/guides/auth/auth-mfa)

**Accessibility:**
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)

**Indigenous Data Governance:**
- [OCAP® Principles](https://fnigc.ca/ocap-training/)
- [CARE Principles](https://www.gida-global.org/care)

---

**Last Updated**: December 25, 2025
**Status**: ✅ Ready for implementation
