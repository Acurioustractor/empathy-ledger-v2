# Authentication Setup - Empathy Ledger v2

Complete guide to setting up and understanding authentication in Empathy Ledger.

## Overview

Empathy Ledger uses **Supabase Auth** for secure authentication with:
- Email/password authentication
- Role-based access control (RBAC)
- Multi-tenant organization isolation
- Row-level security (RLS) enforcement

## Architecture

```
User Login
    ↓
Supabase Auth (JWT)
    ↓
Profile Creation (automatic)
    ↓
Organization Assignment
    ↓
Role Assignment
    ↓
RLS Policies Enforce Access
```

## Step 1: Enable Authentication in Supabase

### Configure Auth Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Settings**

### Email Auth Configuration

**Enable Email Provider**:
- ✅ **Enable Email provider**: On
- ✅ **Enable Email Confirmations**: Recommended for production
- ⚠️ **Disable Email Confirmations**: OK for local development

**Recommended Settings**:
```
Confirmation URL: http://localhost:3005/auth/confirm
Site URL: http://localhost:3005
Redirect URLs: http://localhost:3005/*, http://localhost:3005/auth/callback
```

### Email Templates (Optional)

Customize email templates:
- **Authentication** → **Email Templates**
- **Confirm signup**: Welcome message
- **Magic link**: Passwordless login
- **Reset password**: Password recovery

## Step 2: Test Authentication Locally

### Create Test User

```bash
# Start your dev server if not running
npm run dev
```

1. **Navigate to**: [http://localhost:3005](http://localhost:3005)
2. **Click "Sign In"** (top right)
3. **Register new account**:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Display Name: `Test User`

### Verify User Creation

**Check in Supabase Dashboard**:
1. **Authentication** → **Users**
2. You should see your new user
3. Note the **User UID**

**Check Profile Creation**:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM profiles WHERE email = 'test@example.com';
```

**Expected result**:
```
id          | email              | display_name | tenant_id | role
------------|--------------------|--------------|-----------|--------------
uuid-here   | test@example.com   | Test User    | null      | guest
```

## Step 3: Assign Organization and Role

New users start with `guest` role and no organization. To give them access:

### Option A: Use Admin UI (Recommended)

1. **Login as admin** (if you have one)
2. **Navigate to**: `/admin/users`
3. **Find user** in list
4. **Assign organization** and **role**

### Option B: Directly in Database

```sql
-- 1. Find or create an organization
INSERT INTO organisations (name, slug, type, status)
VALUES ('Test Organization', 'test-org', 'ngo', 'active')
RETURNING id;

-- 2. Get tenant_id for that organization
SELECT tenant_id FROM organisations WHERE slug = 'test-org';

-- 3. Update user profile
UPDATE profiles
SET
  tenant_id = 'tenant-uuid-from-step-2',
  role = 'community_member'
WHERE email = 'test@example.com';

-- 4. Verify
SELECT id, email, display_name, tenant_id, role
FROM profiles
WHERE email = 'test@example.com';
```

### Option C: Use Script (Fastest)

```bash
# Run the user setup script
npm run setup:user -- test@example.com --role community_member --org test-org
```

## Step 4: Understand Roles

Empathy Ledger has a hierarchical role system:

### Role Hierarchy (highest → lowest)

| Role | Level | Permissions |
|------|-------|-------------|
| `elder` | 100 | Cultural authority, all permissions, special designation |
| `cultural_keeper` | 90 | Knowledge preservation, cultural oversight |
| `admin` | 70 | System management, user management |
| `project_leader` | 60 | Project creation, team management |
| `storyteller` | 50 | Story creation, editing |
| `community_member` | 40 | View content, participate |
| `guest` | 10 | Read-only access to public content |

### Role Permissions

**Elder** (100):
- All permissions of all lower roles
- Cultural protocol oversight
- Final approval authority
- Special badge/designation

**Cultural Keeper** (90):
- Review culturally sensitive content
- Approve cultural protocols
- Manage knowledge preservation
- Cultural safety moderation

**Admin** (70):
- Manage users and roles
- Manage organization settings
- Access admin dashboard
- View all content in organization

**Project Leader** (60):
- Create and manage projects
- Invite participants
- Approve stories for projects
- Assign roles within project

**Storyteller** (50):
- Create and edit own stories
- Upload media
- Manage transcripts
- Share stories

**Community Member** (40):
- View organization content
- Comment on stories
- Participate in projects
- Basic profile

**Guest** (10):
- View public content only
- No creation abilities
- Limited profile

## Step 5: Configure Row-Level Security (RLS)

### How RLS Works

Every database query automatically filters by:
1. **Tenant ID**: User can only see data from their organization
2. **Role**: User can only perform actions their role allows

### Example RLS Policy

```sql
-- Stories table: users can only see stories in their organization
CREATE POLICY "tenant_isolation_stories"
ON stories FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  )
);

-- Stories table: only storytellers+ can create stories
CREATE POLICY "storytellers_can_create_stories"
ON stories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role_level >= 50  -- storyteller or higher
  )
);
```

### Test RLS

```bash
# Run RLS audit script
npm run db:audit

# Expected output: Shows all 273 RLS policies and their status
```

## Step 6: Implement Auth in Components

### Client-Side Authentication

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Get Current User

```typescript
// In a React component
import { supabase } from '@/lib/supabase/client'

export default function MyComponent() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <div>{user ? `Hello ${user.email}` : 'Not logged in'}</div>
}
```

### Get User Profile

```typescript
// Get full profile with role and organization
const { data: profile } = await supabase
  .from('profiles')
  .select('*, organisation:organisations(*)')
  .eq('id', user.id)
  .single()

console.log(profile.role)              // 'community_member'
console.log(profile.organisation.name) // 'Test Organization'
```

### Check Permissions

```typescript
// Check if user has permission
function hasPermission(profile: Profile, requiredLevel: number): boolean {
  return profile.role_level >= requiredLevel
}

// Usage
if (hasPermission(profile, 50)) {
  // User is storyteller or higher
  <CreateStoryButton />
}
```

### Protected Route

```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_level')
    .eq('id', session.user.id)
    .single()

  if (profile.role_level < 70) {  // Admin level
    redirect('/')
  }

  return <div>{children}</div>
}
```

## Step 7: Sign In/Sign Out

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

if (error) {
  console.error('Login failed:', error.message)
} else {
  console.log('Logged in:', data.user)
}
```

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'password123',
  options: {
    data: {
      display_name: 'New User'
    }
  }
})
```

### Sign Out

```typescript
await supabase.auth.signOut()
```

### Password Reset

```typescript
// Send reset email
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'http://localhost:3005/auth/reset-password'
})

// Update password (after clicking reset link)
await supabase.auth.updateUser({
  password: 'newpassword123'
})
```

## Troubleshooting

### "User already registered" Error

**Cause**: Email already exists in Supabase Auth

**Solution**:
```bash
# Delete user from Supabase Dashboard
# Authentication → Users → Find user → Delete

# OR use SQL
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### "RLS policy violation" Error

**Cause**: User doesn't have permission or tenant_id mismatch

**Solution**:
1. Check user's `tenant_id` matches resource's `tenant_id`
2. Check user's `role_level` is sufficient
3. Verify RLS policies are correct

```sql
-- Check user's profile
SELECT id, email, tenant_id, role, role_level
FROM profiles
WHERE email = 'user@example.com';

-- Check resource's tenant
SELECT id, tenant_id FROM stories WHERE id = 'story-uuid';
```

### "Invalid JWT" Error

**Cause**: Token expired or malformed

**Solution**:
```typescript
// Force refresh session
const { data: { session }, error } = await supabase.auth.refreshSession()
```

### Email Confirmations Not Working

**Cause**: Email provider not configured

**Solution**:
1. **Supabase Dashboard** → **Authentication** → **Settings**
2. Disable email confirmations for local dev:
   - Uncheck **Enable Email Confirmations**
3. For production, configure SMTP or use Supabase's email service

## Security Best Practices

### Do's ✅
- ✅ Use server-side auth checks for protected routes
- ✅ Verify user role/permissions on API routes
- ✅ Use RLS policies for all database tables
- ✅ Hash passwords (Supabase does this automatically)
- ✅ Use HTTPS in production
- ✅ Validate user input

### Don'ts ❌
- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser
- ❌ Don't trust client-side permission checks alone
- ❌ Don't store sensitive data in JWT claims
- ❌ Don't disable RLS without good reason
- ❌ Don't use weak passwords in production

## Testing Authentication

### Manual Testing Checklist

- [ ] User can sign up
- [ ] User receives confirmation email (if enabled)
- [ ] User can sign in
- [ ] User can sign out
- [ ] User can reset password
- [ ] Protected routes redirect unauthenticated users
- [ ] Users can only see their organization's data
- [ ] Role-based permissions work correctly

### Automated Tests

```bash
# Run auth tests
npm run test -- auth.test.ts

# Run E2E auth flow
npm run test:e2e -- tests/auth/
```

## Next Steps

- **Create Stories**: [common-tasks.md](common-tasks.md)
- **Understand Architecture**: [../architecture/](../architecture/)
- **API Routes**: [../api/](../api/)
- **Database Schema**: [../database/](../database/)

---

**Setup Time**: ~10 minutes
**Complexity**: Intermediate
**Next**: [Common Tasks](common-tasks.md) →
