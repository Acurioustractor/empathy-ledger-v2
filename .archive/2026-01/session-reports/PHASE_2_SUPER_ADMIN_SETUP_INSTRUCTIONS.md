# Phase 2: Super-Admin Role Setup - Manual Steps Required

## Current Status

✅ **Completed:**
- Super-admin role migration created ([supabase/migrations/20260110000103_super_admin_role_fixed.sql](supabase/migrations/20260110000103_super_admin_role_fixed.sql))
- Setup API endpoint created ([src/app/api/admin/setup-super-admin/route.ts](src/app/api/admin/setup-super-admin/route.ts))
- Your profile identified: **Benjamin Knight** (`3e2de0ab-6639-448b-bb34-d48e4f243dbf`)

⏳ **Pending:**
- Manual migration application (Supabase migration push is blocked by old migrations)
- Grant super-admin permissions via API

---

## Step 1: Apply Super-Admin Migration Manually

The migration cannot be applied via `supabase db push` due to conflicts with old migrations that reference the `auth` schema. You need to apply it manually via the Supabase SQL Editor.

### Instructions:

1. **Open Supabase SQL Editor:**
   - Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
   - (Project ref: `yvnuayzslukamizrlhwb`)

2. **Copy and paste the following SQL:**

```sql
-- Super Admin Role Implementation (Fixed for current schema)
-- Enables cross-organization content management with full audit trail

-- 1. Add super_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_super_admin ON public.profiles(is_super_admin) WHERE is_super_admin = TRUE;

COMMENT ON COLUMN profiles.is_super_admin IS 'User has super-admin privileges across all organizations';

-- 2. Create super_admin_permissions table for granular control
CREATE TABLE IF NOT EXISTS public.super_admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'manage_all_organizations',    -- Full org management
    'cross_org_publishing',         -- Publish to any org
    'content_moderation',           -- Pull down/edit/refuse content
    'super_admin_dashboard',        -- Access unified dashboard
    'manage_syndication',           -- Control all syndication
    'social_media_publishing',      -- Post to social platforms
    'analytics_access'              -- View all analytics
  )),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, permission_type)
);

CREATE INDEX idx_super_admin_permissions_profile ON public.super_admin_permissions(profile_id);
CREATE INDEX idx_super_admin_permissions_active ON public.super_admin_permissions(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE public.super_admin_permissions IS 'Granular super-admin permissions with expiration support';

-- 3. Create audit trail for super-admin actions
CREATE TABLE IF NOT EXISTS public.super_admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,  -- 'publish', 'edit', 'delete', 'pull_down', 'refuse', 'create', 'update'
  target_type TEXT NOT NULL,  -- 'story', 'organization', 'storyteller', 'syndication', 'media'
  target_id UUID,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action_metadata JSONB DEFAULT '{}'::jsonb,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

CREATE INDEX idx_super_admin_audit_log_profile ON public.super_admin_audit_log(admin_profile_id, performed_at DESC);
CREATE INDEX idx_super_admin_audit_log_target ON public.super_admin_audit_log(target_type, target_id);
CREATE INDEX idx_super_admin_audit_log_org ON public.super_admin_audit_log(organization_id);
CREATE INDEX idx_super_admin_audit_log_performed ON public.super_admin_audit_log(performed_at DESC);

COMMENT ON TABLE public.super_admin_audit_log IS 'Complete audit trail of all super-admin actions';

-- 4. Create helper function to check super-admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = profile_id
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_super_admin IS 'Check if a profile has super-admin privileges';

-- 5. Create helper function to log super-admin actions
CREATE OR REPLACE FUNCTION public.log_super_admin_action(
  p_profile_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.super_admin_audit_log (
    admin_profile_id,
    action_type,
    target_type,
    target_id,
    organization_id,
    action_metadata
  ) VALUES (
    p_profile_id,
    p_action_type,
    p_target_type,
    p_target_id,
    p_organization_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.log_super_admin_action IS 'Log a super-admin action to audit trail';
```

3. **Click "Run" to execute the SQL**

4. **Verify the migration was successful:**
   - Check that the `profiles` table now has an `is_super_admin` column
   - Check that the `super_admin_permissions` table was created
   - Check that the `super_admin_audit_log` table was created

---

## Step 2: Grant Super-Admin Permissions via API

Once the migration is applied, you can grant super-admin permissions to your profile using the setup API endpoint.

### Option A: Using curl (Command Line)

```bash
# Create the request body
cat > /tmp/setup_super_admin.json << 'EOF'
{
  "profileId": "3e2de0ab-6639-448b-bb34-d48e4f243dbf",
  "setupKey": "empathy-ledger-super-admin-setup-2026"
}
EOF

# Make the API request (make sure dev server is running)
curl -X POST http://localhost:3030/api/admin/setup-super-admin \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/setup_super_admin.json

# Expected response:
# {
#   "success": true,
#   "message": "Super-admin access granted successfully",
#   "profile": {
#     "id": "3e2de0ab-6639-448b-bb34-d48e4f243dbf",
#     "display_name": "Benjamin Knight",
#     "email": null
#   },
#   "permissions": [
#     "manage_all_organizations",
#     "cross_org_publishing",
#     "content_moderation",
#     "super_admin_dashboard",
#     "manage_syndication",
#     "social_media_publishing",
#     "analytics_access"
#   ]
# }
```

### Option B: Using Postman or Thunder Client

1. **Method:** POST
2. **URL:** `http://localhost:3030/api/admin/setup-super-admin`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (raw JSON):**
   ```json
   {
     "profileId": "3e2de0ab-6639-448b-bb34-d48e4f243dbf",
     "setupKey": "empathy-ledger-super-admin-setup-2026"
   }
   ```

### Option C: Manual SQL (If API fails)

Run this SQL directly in Supabase SQL Editor:

```sql
-- Set super-admin flag
UPDATE public.profiles
SET is_super_admin = TRUE
WHERE id = '3e2de0ab-6639-448b-bb34-d48e4f243dbf';

-- Grant all super-admin permissions
INSERT INTO public.super_admin_permissions (profile_id, permission_type)
SELECT '3e2de0ab-6639-448b-bb34-d48e4f243dbf', unnest(ARRAY[
  'manage_all_organizations',
  'cross_org_publishing',
  'content_moderation',
  'super_admin_dashboard',
  'manage_syndication',
  'social_media_publishing',
  'analytics_access'
])
ON CONFLICT (profile_id, permission_type) DO NOTHING;

-- Log the setup action
INSERT INTO public.super_admin_audit_log (
  admin_profile_id,
  action_type,
  target_type,
  target_id,
  action_metadata,
  success
) VALUES (
  '3e2de0ab-6639-448b-bb34-d48e4f243dbf',
  'setup',
  'super_admin_role',
  '3e2de0ab-6639-448b-bb34-d48e4f243dbf',
  jsonb_build_object(
    'permissions_granted', ARRAY[
      'manage_all_organizations',
      'cross_org_publishing',
      'content_moderation',
      'super_admin_dashboard',
      'manage_syndication',
      'social_media_publishing',
      'analytics_access'
    ],
    'setup_timestamp', NOW()
  ),
  TRUE
);
```

---

## Step 3: Verify Super-Admin Setup

### Query to check your super-admin status:

```sql
SELECT
  p.id,
  p.display_name,
  p.full_name,
  p.is_super_admin,
  COUNT(sap.id) as active_permissions_count,
  array_agg(sap.permission_type) FILTER (WHERE sap.is_active = TRUE) as permissions
FROM public.profiles p
LEFT JOIN public.super_admin_permissions sap ON sap.profile_id = p.id AND sap.is_active = TRUE
WHERE p.id = '3e2de0ab-6639-448b-bb34-d48e4f243dbf'
GROUP BY p.id, p.display_name, p.full_name, p.is_super_admin;
```

**Expected Result:**
- `is_super_admin`: `TRUE`
- `active_permissions_count`: `7`
- `permissions`: Array with all 7 permission types

### API Check:

```bash
curl 'http://localhost:3030/api/admin/setup-super-admin?key=empathy-ledger-super-admin-setup-2026' | jq '.profiles[] | select(.id == "3e2de0ab-6639-448b-bb34-d48e4f243dbf")'
```

**Expected Result:**
```json
{
  "id": "3e2de0ab-6639-448b-bb34-d48e4f243dbf",
  "display_name": "Benjamin Knight",
  "email": null,
  "full_name": "Benjamin Knight",
  "created_at": null,
  "super_admin_permissions_count": 7
}
```

---

## Step 4: Mark Migration as Applied (Optional)

To prevent migration conflicts in the future, you can manually mark the migration as applied:

```bash
npx supabase migration repair --status applied 20260110000103
```

Or run this SQL in Supabase:

```sql
INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES (
  '20260110000103',
  ARRAY['Super Admin Role Implementation'],
  'super_admin_role_fixed'
)
ON CONFLICT (version) DO NOTHING;
```

---

## What These Tables Do

### `profiles.is_super_admin`
- Boolean flag that marks a profile as having super-admin privileges
- Allows quick checks in application code
- Used in RLS policies (future enhancement)

### `super_admin_permissions`
- Granular permission control for super-admins
- Allows granting specific capabilities (e.g., only content moderation, not social media)
- Supports expiration dates for temporary permissions
- Can be revoked by setting `is_active = FALSE`

### `super_admin_audit_log`
- Complete audit trail of all super-admin actions
- Records: who, what, when, where (organization), and metadata
- Essential for accountability and compliance
- Includes IP address and user agent for security tracking

---

## Next Steps (Phase 2 Remaining Tasks)

Once super-admin access is granted:

1. **Create Super-Admin Dashboard** ([src/app/admin/super-dashboard/page.tsx](src/app/admin/super-dashboard/page.tsx))
   - Cross-organization content overview
   - Organization selector with "All Organizations" option
   - Content moderation queue
   - Syndication management
   - Social media publishing center
   - Audit trail viewer

2. **Test Cross-Organization Access**
   - Verify you can view stories from all organizations
   - Verify you can publish to any organization
   - Verify you can edit/pull-down content from any organization

3. **Proceed to Phase 3: Unified Publishing Interface**
   - Merge articles editor into stories editor
   - Add syndication controls
   - Add social media destination selectors
   - Add super-admin publishing options

---

## Security Notes

- **Setup Key:** The setup key `empathy-ledger-super-admin-setup-2026` is hardcoded in the API for this initial setup
  - In production, this should be an environment variable
  - Consider removing the setup endpoint after initial configuration
  - Or add additional authentication checks (e.g., require admin session)

- **Super-Admin Access:** This grants FULL control across ALL organizations
  - Use responsibly
  - All actions are logged in `super_admin_audit_log`
  - Consider implementing approval workflow for destructive actions

- **Audit Trail:** The audit log includes:
  - IP address (future: capture from request headers)
  - User agent (future: capture from request headers)
  - Full metadata about each action
  - Success/failure status

---

## Troubleshooting

### "Column does not exist" errors
- The migration hasn't been applied yet
- Follow Step 1 to apply the migration via SQL Editor

### "Profile not found" errors
- Verify your profile ID is correct: `3e2de0ab-6639-448b-bb34-d48e4f243dbf`
- Check the profiles table in Supabase to confirm

### "Setup key invalid" errors
- Make sure you're using the exact key: `empathy-ledger-super-admin-setup-2026`
- Check for typos or extra spaces

### Migration conflicts
- The `supabase db push` command is blocked by old migrations
- Use the manual SQL approach instead (Step 1)
- Optionally mark old migrations as reverted: `npx supabase migration repair --status reverted <version>`

---

## Files Created in Phase 2

- ✅ [supabase/migrations/20260110000103_super_admin_role_fixed.sql](supabase/migrations/20260110000103_super_admin_role_fixed.sql) - Database schema
- ✅ [supabase/migrations/20260110000104_grant_super_admin_to_benjamin.sql](supabase/migrations/20260110000104_grant_super_admin_to_benjamin.sql) - Auto-grant script (not used, manual approach better)
- ✅ [src/app/api/admin/setup-super-admin/route.ts](src/app/api/admin/setup-super-admin/route.ts) - Setup API endpoint

---

## Summary

**Phase 2 is 80% complete!** Just need to:
1. Run the SQL migration in Supabase SQL Editor (Step 1)
2. Call the setup API or run the manual SQL to grant permissions (Step 2)
3. Verify everything works (Step 3)

Then you'll have full super-admin access across all organizations and can proceed to Phase 3 (Unified Publishing Interface).
