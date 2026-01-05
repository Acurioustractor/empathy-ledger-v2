# GoHighLevel OAuth Integration Skill

Complete OAuth 2.0 implementation guide for GoHighLevel marketplace integrations.

## OAuth Flow Overview

GoHighLevel uses OAuth 2.0 authorization code flow with refresh tokens. Tokens are scoped to either Agency (Company) level or Sub-Account (Location) level.

## Key Endpoints

### 1. Authorization URL
**User triggers installation** → App redirects to GoHighLevel installation URL (obtained from marketplace dashboard Auth config)

**Redirect back to your app:**
```
https://myapp.com/oauth/callback/highlevel?code=[authorization_code]
```

### 2. Token Exchange
**Endpoint:** `POST https://services.leadconnectorhq.com/oauth/token`

**Initial Token Request (Authorization Code Grant):**
```typescript
const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    client_id: process.env.GHL_CLIENT_ID!,
    client_secret: process.env.GHL_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code: authorizationCode,
    user_type: 'Company', // or 'Location' for sub-account
    redirect_uri: process.env.GHL_REDIRECT_URI!,
  }),
})

const tokens = await response.json()
// {
//   access_token: "...",
//   token_type: "Bearer",
//   expires_in: 86399, // ~24 hours
//   refresh_token: "...",
//   scope: "calendars.readonly calendars/events.write ...",
//   userType: "Company",
//   companyId: "..."
// }
```

### 3. Token Refresh
**Endpoint:** `POST https://services.leadconnectorhq.com/oauth/token`

**Refresh Token Request:**
```typescript
const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    client_id: process.env.GHL_CLIENT_ID!,
    client_secret: process.env.GHL_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken,
    user_type: 'Company',
    redirect_uri: process.env.GHL_REDIRECT_URI!,
  }),
})

const newTokens = await response.json()
// Returns new access_token AND new refresh_token
// Old refresh token is now invalid
```

**CRITICAL:** Each token refresh returns a NEW refresh token. You must store the new refresh token and discard the old one.

### 4. Sub-Account Token Generation
**Endpoint:** `POST https://services.leadconnectorhq.com/oauth/locationToken`

Convert agency-level access token to location-specific token:

```typescript
const response = await fetch('https://services.leadconnectorhq.com/oauth/locationToken', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${agencyAccessToken}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  },
  body: JSON.stringify({
    companyId: companyId,
    locationId: locationId,
  }),
})

const locationToken = await response.json()
// {
//   access_token: "...",
//   token_type: "Bearer",
//   expires_in: 86399,
//   scope: "...",
//   userType: "Location",
//   locationId: "..."
// }
```

## Token Lifecycle

| Token Type | Duration | Notes |
|------------|----------|-------|
| Access Token | ~24 hours (86,399 seconds) | Use for API calls |
| Refresh Token | Up to 1 year or until used | Single-use, new one issued on refresh |

## Scopes

Request **minimum scopes needed**. Example scopes:

- `calendars.readonly` - Read calendar data
- `calendars/events.write` - Create/update calendar events
- `businesses.write` - Modify business settings
- `companies.readonly` - Read company/agency data
- `locations.readonly` - Read location/sub-account data
- `contacts.write` - Create/update contacts
- `conversations.readonly` - Read conversations
- `conversations/message.write` - Send messages

**Full scopes list:** See [GoHighLevel Scopes Documentation](https://marketplace.gohighlevel.com/docs/ghl/scopes/scopes)

## Database Schema

Store tokens securely with encryption:

```sql
CREATE TABLE gohighlevel_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organisations(id) ON DELETE CASCADE,

  -- OAuth data
  company_id TEXT NOT NULL, -- GHL agency ID
  location_id TEXT, -- Optional, for sub-account tokens
  user_type TEXT NOT NULL CHECK (user_type IN ('Company', 'Location')),

  -- Tokens (ENCRYPT THESE!)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',

  -- Expiry tracking
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ,

  -- Unique constraint
  UNIQUE(company_id, location_id)
);

-- Index for token lookup
CREATE INDEX idx_ghl_tokens_tenant ON gohighlevel_tokens(tenant_id);
CREATE INDEX idx_ghl_tokens_company ON gohighlevel_tokens(company_id);

-- Auto-update timestamp
CREATE TRIGGER update_ghl_tokens_updated_at
  BEFORE UPDATE ON gohighlevel_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Implementation Pattern

### 1. OAuth Callback Handler

**File:** `src/app/api/oauth/gohighlevel/callback/route.ts`

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // Use for CSRF protection

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        user_type: 'Company',
        redirect_uri: process.env.GHL_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    const tokens = await tokenResponse.json()

    // Store tokens in database (with encryption!)
    const supabase = createSupabaseServerClient()

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    const { error } = await supabase
      .from('gohighlevel_tokens')
      .upsert({
        company_id: tokens.companyId,
        user_type: tokens.userType,
        access_token: tokens.access_token, // ENCRYPT THIS!
        refresh_token: tokens.refresh_token, // ENCRYPT THIS!
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
        last_refreshed_at: new Date().toISOString(),
      })

    if (error) throw error

    // Redirect to success page
    return NextResponse.redirect(new URL('/integrations/gohighlevel/success', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/integrations/gohighlevel/error', request.url))
  }
}
```

### 2. Token Refresh Service

**File:** `src/lib/services/gohighlevel.service.ts`

```typescript
import { createSupabaseServiceClient } from '@/lib/supabase/service-role-client'

export class GoHighLevelService {
  /**
   * Get valid access token, refreshing if needed
   */
  static async getAccessToken(companyId: string): Promise<string> {
    const supabase = createSupabaseServiceClient()

    // Get current token
    const { data: tokenRecord, error } = await supabase
      .from('gohighlevel_tokens')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_type', 'Company')
      .single()

    if (error || !tokenRecord) {
      throw new Error('No token found for company')
    }

    // Check if token is expired (refresh 5 minutes early for safety)
    const expiresAt = new Date(tokenRecord.expires_at)
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    if (expiresAt > fiveMinutesFromNow) {
      // Token still valid
      return tokenRecord.access_token // DECRYPT THIS!
    }

    // Token expired, refresh it
    const refreshResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: tokenRecord.refresh_token, // DECRYPT THIS!
        user_type: 'Company',
        redirect_uri: process.env.GHL_REDIRECT_URI!,
      }),
    })

    if (!refreshResponse.ok) {
      throw new Error('Token refresh failed')
    }

    const newTokens = await refreshResponse.json()

    // Update database with NEW tokens (both access and refresh)
    const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000)

    await supabase
      .from('gohighlevel_tokens')
      .update({
        access_token: newTokens.access_token, // ENCRYPT THIS!
        refresh_token: newTokens.refresh_token, // ENCRYPT THIS!
        expires_at: newExpiresAt.toISOString(),
        last_refreshed_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)

    return newTokens.access_token
  }

  /**
   * Make authenticated API call to GoHighLevel
   */
  static async apiCall(companyId: string, endpoint: string, options: RequestInit = {}) {
    const accessToken = await this.getAccessToken(companyId)

    const response = await fetch(`https://services.leadconnectorhq.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.statusText}`)
    }

    return response.json()
  }
}
```

## Security Best Practices

### 1. Token Encryption
**CRITICAL:** Encrypt `access_token` and `refresh_token` before storing in database.

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.GHL_TOKEN_ENCRYPTION_KEY! // 32-byte key
const IV_LENGTH = 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encryptedText = Buffer.from(parts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
```

### 2. CSRF Protection
Use `state` parameter during authorization:

```typescript
// Generate random state
const state = crypto.randomBytes(32).toString('hex')

// Store in session/database
await storeOAuthState(userId, state)

// Add to authorization URL
const authUrl = `${installationUrl}&state=${state}`

// Verify in callback
const receivedState = searchParams.get('state')
const isValid = await verifyOAuthState(userId, receivedState)
```

### 3. Environment Variables
```env
# .env.local
GHL_CLIENT_ID=your_client_id_from_marketplace
GHL_CLIENT_SECRET=your_client_secret_from_marketplace
GHL_REDIRECT_URI=https://yourdomain.com/api/oauth/gohighlevel/callback
GHL_TOKEN_ENCRYPTION_KEY=generate_a_32_byte_random_key_here
```

## Testing Checklist

- [ ] Authorization flow redirects correctly
- [ ] Code exchange returns valid tokens
- [ ] Tokens stored encrypted in database
- [ ] Access token auto-refreshes before expiry
- [ ] New refresh token stored after refresh
- [ ] Location token generation works
- [ ] API calls use correct Bearer token
- [ ] CSRF state validation works
- [ ] Error handling for expired/invalid tokens

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_grant` | Authorization code already used | Code is single-use, regenerate |
| `invalid_client` | Wrong client_id or client_secret | Check environment variables |
| `invalid_redirect_uri` | Redirect URI mismatch | Must match registered URI exactly |
| `invalid_refresh_token` | Refresh token already used | Each refresh token is single-use |

## When to Use This Skill

Invoke when:
- Setting up GoHighLevel OAuth integration
- Implementing token refresh logic
- Debugging OAuth callback issues
- Creating API endpoints for GHL data sync
- Building GoHighLevel marketplace apps

---

**Documentation:** https://marketplace.gohighlevel.com/docs/oauth/GettingStarted
**Support:** https://help.gohighlevel.com/support/solutions
