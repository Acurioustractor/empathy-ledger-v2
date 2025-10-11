# Add Storyteller Workflow - Complete Guide

## Overview

Organization members can add storytellers in two ways:
1. **Add Existing User**: Search and add users who already have accounts
2. **Create New Storyteller**: Create a new profile and send them an invitation to claim their account

## User Flow

### Method 1: Add Existing User

1. Click "Add Storyteller" button on the storytellers page
2. Select "Existing User" tab (default)
3. Search for user by name or email
4. Click "Add" next to the desired user
5. User is immediately added as a storyteller
6. Success message appears and page refreshes

**What happens behind the scenes:**
- Profile's `tenant_id` is set to organization's tenant_id
- `"storyteller"` role is added to profile's `tenant_roles` array
- Entry created in `profile_organizations` table
- No invitation needed - user already has account access

### Method 2: Create New Storyteller

1. Click "Add Storyteller" button on the storytellers page
2. Select "New Storyteller" tab
3. Fill in the form:
   - **Full Name** (required): Legal or preferred full name
   - **Email** (required): Where invitation will be sent
   - **Display Name** (optional): How they prefer to be called
   - **Bio** (optional): Initial profile information
4. Click "Create & Invite"
5. System creates profile and sends invitation
6. Success message appears with invitation details

**What happens behind the scenes:**
- New profile created with `profile_status: 'pending_activation'`
- Profile's `tenant_id` set to organization's tenant_id
- `"storyteller"` role added to `tenant_roles` array
- Entry created in `profile_organizations` table
- Invitation record created in `organization_invitations` table
- Invitation expires in 30 days
- **TODO**: Email with magic link sent to user (not yet implemented)

## API Endpoints

### Add Existing User
```
POST /api/organisations/[id]/storytellers
Body: { "userId": "profile-uuid" }
```

### Create New Storyteller
```
POST /api/organisations/[id]/storytellers/create
Body: {
  "fullName": "Sarah Johnson",
  "email": "sarah@example.com",
  "displayName": "Sarah", // optional
  "bio": "Community leader..." // optional
}
```

## Components

### `AddStorytellerDialog`
- Location: `src/components/organization/AddStorytellerDialog.tsx`
- Two-tab dialog for adding storytellers
- Manages both existing user search and new user creation
- Props:
  - `open`: boolean
  - `onOpenChange`: (open: boolean) => void
  - `organizationId`: string
  - `onAdd`: (userId: string, userName: string) => Promise<void>

### `AddNewStorytellerForm`
- Location: `src/components/organization/AddNewStorytellerForm.tsx`
- Form for creating new storyteller profiles
- Validates email format and required fields
- Shows clear feedback for errors
- Props:
  - `organizationId`: string
  - `onSuccess`: (data) => void
  - `onCancel`: () => void

## Magic Link / Account Claim Process (TODO)

### Current State
- ✅ Profile created with `profile_status: 'pending_activation'`
- ✅ Invitation record created in `organization_invitations` table
- ✅ Invitation code generated
- ❌ **Email sending not implemented**
- ❌ **Magic link generation not implemented**
- ❌ **Account claim page not implemented**

### Recommended Implementation

#### 1. Email System
Use Supabase Auth's built-in magic link functionality:

```typescript
// In create storyteller API
const { data, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: body.email,
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/claim-account?invitation=${invitation.id}`,
  }
})

// Send email with the magic link
await sendInvitationEmail({
  to: body.email,
  storytellerName: body.fullName,
  organizationName: organisation.name,
  magicLink: data.properties.action_link
})
```

#### 2. Account Claim Page
Create `src/app/auth/claim-account/page.tsx`:
- Verify magic link token
- Display invitation details
- Allow user to set display preferences
- Update `profile_status` to 'active'
- Mark invitation as `used_at`
- Redirect to their new storyteller profile

#### 3. Email Template
Create professional email with:
- Welcome message
- Organization context
- Magic link button
- Link expiration notice (30 days)
- Support contact info

## Database Schema

### Profiles Table
```sql
- id: UUID (primary key)
- full_name: TEXT
- display_name: TEXT
- email: TEXT (unique)
- bio: TEXT
- tenant_id: UUID (foreign key to tenants)
- tenant_roles: JSONB array (['storyteller', ...])
- is_storyteller: BOOLEAN
- profile_status: TEXT ('active', 'pending_activation', etc.)
- onboarding_completed: BOOLEAN
```

### Organization Invitations Table
```sql
- id: UUID (primary key)
- organization_id: UUID (foreign key)
- email: TEXT
- role: TEXT ('storyteller', 'admin', 'member')
- profile_id: UUID (foreign key - nullable)
- invitation_code: TEXT (unique)
- invited_by: UUID (foreign key to profiles)
- created_at: TIMESTAMP
- expires_at: TIMESTAMP
- used_at: TIMESTAMP (nullable)
```

### Profile Organizations Table
```sql
- id: UUID (primary key)
- profile_id: UUID (foreign key)
- organization_id: UUID (foreign key)
- role: TEXT
- is_active: BOOLEAN
- joined_at: TIMESTAMP
```

## Security Considerations

1. **Email Validation**: Email format validated before profile creation
2. **Duplicate Prevention**: System checks for existing profiles with same email
3. **Invitation Expiry**: Invitations expire after 30 days
4. **Organization Verification**: Organization existence verified before profile creation
5. **Single Active Invitation**: Only one pending invitation per email per organization

## Future Enhancements

1. **Email Notifications**
   - Welcome email with magic link
   - Reminder emails for unclaimed invitations
   - Invitation expiry notifications

2. **Bulk Import**
   - CSV upload for multiple storytellers
   - Validation and preview before import
   - Batch invitation sending

3. **Custom Invitation Messages**
   - Allow organization admins to customize invitation text
   - Add organization-specific welcome content

4. **Onboarding Workflow**
   - Guided profile completion after account claim
   - Organization-specific onboarding steps
   - Cultural protocols acknowledgment

5. **Invitation Management Dashboard**
   - View pending/expired/accepted invitations
   - Resend invitations
   - Revoke unused invitations
   - Track invitation analytics

## Testing Checklist

- [ ] Add existing user successfully
- [ ] Search finds correct users
- [ ] Create new storyteller with all fields
- [ ] Create new storyteller with only required fields
- [ ] Email validation rejects invalid formats
- [ ] Duplicate email handling works correctly
- [ ] Success messages display correctly
- [ ] Error messages display correctly
- [ ] Page refreshes after adding storyteller
- [ ] Storyteller appears in list immediately
- [ ] Profile has correct tenant_id and roles
- [ ] profile_organizations entry created
- [ ] Invitation record created (for new storytellers)
- [ ] Tab switching works smoothly
- [ ] Form clears after successful submission
- [ ] Cancel button closes dialog
- [ ] Dialog closes after successful add

## Support

For issues or questions about the add storyteller workflow:
1. Check server logs for detailed error messages
2. Verify organization exists and has tenant_id
3. Ensure user has permissions to add storytellers
4. Check database constraints and foreign keys
