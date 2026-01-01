# Email Field Policy

## Decision: Email is OPTIONAL

**Date**: 2025-09-30
**Rationale**: Storytellers do not require user accounts. Many profiles represent individuals who share stories but do not log into the platform.

---

## Database Schema

```sql
-- Email field is nullable
profiles.email TEXT NULL
```

**Coverage**: 22/235 profiles (9%) have emails

---

## Code Requirements

All code MUST handle null emails gracefully:

### ✅ Good Examples

```typescript
// Display email with fallback
const emailDisplay = profile.email || 'No email on file'

// Optional chaining
const isVerified = profile.email?.includes('@verified.com')

// Conditional logic
if (profile.email) {
  await sendEmail(profile.email, subject, body)
} else {
  console.log('Profile has no email, skipping notification')
}

// Type-safe null checking
if (profile.email !== null && profile.email !== '') {
  // Safe to use email
}
```

### ❌ Bad Examples (Will Break)

```typescript
// Assumes email exists - will crash!
const domain = profile.email.split('@')[1] // ❌

// No null check before use
await sendEmail(profile.email, ...) // ❌

// Concatenation without check
const greeting = `Welcome ${profile.email}!` // Shows "Welcome null!"
```

---

## API Response Handling

### Frontend Components

```typescript
interface Profile {
  id: string
  display_name: string
  email: string | null  // ✅ Explicitly nullable
  // ...
}

// Component example
function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div>
      <h2>{profile.display_name}</h2>
      {profile.email && (
        <p>Email: {profile.email}</p>
      )}
    </div>
  )
}
```

### API Routes

```typescript
// Always check before sending emails
export async function POST(request: NextRequest) {
  const { profile_id } = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', profile_id)
    .single()

  if (!profile.email) {
    return NextResponse.json(
      { error: 'Profile has no email address' },
      { status: 400 }
    )
  }

  // Safe to send email
  await sendEmail(profile.email, ...)
}
```

---

## Common Patterns

### Email-Based Features

These features should gracefully handle missing emails:

1. **Email Notifications**
   ```typescript
   async function notifyProfile(profileId: string) {
     const profile = await getProfile(profileId)
     if (profile.email) {
       await sendEmail(profile.email, ...)
     } else {
       // Log or use alternative notification (SMS, in-app, etc.)
       await createInAppNotification(profileId, ...)
     }
   }
   ```

2. **Account Invitations**
   ```typescript
   // Require email for account creation
   if (!email || email.trim() === '') {
     throw new Error('Email required to create user account')
   }
   ```

3. **Profile Export**
   ```typescript
   const profileData = {
     name: profile.display_name,
     email: profile.email || 'N/A',  // Provide fallback
     // ...
   }
   ```

### Display in Tables

```typescript
// Admin storytellers table
{
  header: 'Email',
  cell: (row) => row.email || <Badge variant="secondary">No email</Badge>
}
```

---

## Authentication Logic

### Profiles vs User Accounts

**Key Distinction**:
- **Profile**: Represents a storyteller (may or may not have login)
- **User Account**: Requires email for authentication

```typescript
// Check if profile has associated user account
const hasAccount = profile.email !== null && profile.user_id !== null

if (hasAccount) {
  // User can log in
} else {
  // Profile-only (no login capability)
}
```

### Creating Accounts for Existing Profiles

```typescript
async function createAccountForProfile(profileId: string, email: string) {
  // Validate email not already in use
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    throw new Error('Email already in use')
  }

  // Update profile with email
  await supabase
    .from('profiles')
    .update({ email })
    .eq('id', profileId)

  // Create auth user
  // (implementation depends on auth system)
}
```

---

## Migration Notes

No migration needed - email field is already nullable in database.

**Action Items**:
1. ✅ Audit all code for unsafe email usage
2. ✅ Add null checks where missing
3. ✅ Update TypeScript types to reflect `email: string | null`
4. ✅ Test email-dependent features with profiles that lack emails

---

## Related Fields

Other optional contact fields:
- `phone_number` - Also optional
- `website` - Optional
- `social_links` - Optional

All follow same null-handling pattern.