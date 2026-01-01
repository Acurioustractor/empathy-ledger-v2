# JusticeHub Integration - Setup Complete

## ✅ What's Been Done

### 1. Database Migration Created
**File:** `supabase/migrations/20251027_justicehub_integration.sql`

**Columns Added:**
- **profiles table:**
  - `justicehub_enabled` (boolean) - Controls if profile appears on JusticeHub
  - `justicehub_role` (text) - Role: founder, leader, advocate, practitioner, researcher, lived-experience, community-member
  - `justicehub_featured` (boolean) - Show prominently on JusticeHub
  - `justicehub_synced_at` (timestamptz) - Last sync timestamp

- **organizations table:**
  - `justicehub_enabled` (boolean)
  - `justicehub_synced_at` (timestamptz)

- **projects table:**
  - `justicehub_enabled` (boolean)
  - `justicehub_program_type` (text) - Program categorization
  - `justicehub_synced_at` (timestamptz)

**Helper Functions Created:**
- `get_justicehub_profiles()` - Get all JusticeHub-enabled profiles
- `get_justicehub_organizations()` - Get all JusticeHub-enabled organizations
- `get_justicehub_projects()` - Get all JusticeHub-enabled projects

### 2. Admin UI Updated
**File:** `src/app/admin/storytellers/page.tsx`

**Changes:**
- Added JusticeHub column to storytellers table
- Added checkbox toggle for enabling/disabling JusticeHub display
- Shows "Synced" badge when profile has been synced
- Added `handleJusticeHubToggle()` function to update profile settings
- Updated Storyteller interface to include JusticeHub fields

---

## 🚀 Next Steps to Complete Setup

### Step 1: Apply Database Migration

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your Empathy Ledger project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20251027_justicehub_integration.sql`
6. Paste into the SQL editor
7. Click **Run**
8. Verify success: You should see "Success. No rows returned"

**Option B: Via Command Line (If Supabase CLI is linked)**
```bash
npx supabase db push
```

### Step 2: Update Database Types (TypeScript)

After applying the migration, update your TypeScript types:

1. Go to Supabase Dashboard → **Database** → **Tables**
2. Select the **profiles** table
3. Verify the new columns appear
4. Navigate to **Project Settings** → **API**
5. Scroll to **TypeScript Types**
6. Click **Generate Types**
7. Copy the generated types
8. Update `src/types/database/user-profile.ts` to include:

```typescript
justicehub_enabled: boolean | null
justicehub_role: string | null
justicehub_featured: boolean | null
justicehub_synced_at: string | null
```

### Step 3: Update API Endpoint

Update the storytellers PATCH endpoint to accept JusticeHub fields:

**File:** `src/app/api/admin/storytellers/[id]/route.ts`

Add to the allowed update fields:
```typescript
// In the PATCH handler
if (justicehub_enabled !== undefined) {
  updateData.justicehub_enabled = justicehub_enabled
}
```

### Step 4: Test the Integration

1. Start your dev server: `npm run dev`
2. Navigate to http://localhost:3030/admin/storytellers
3. You should see a new "JusticeHub" column
4. Click the checkbox for a storyteller to enable them on JusticeHub
5. Verify the checkbox state persists after page refresh

---

## 📊 How It Works

### Admin Workflow

1. **Enable Profile on JusticeHub:**
   - Admin checks the JusticeHub checkbox for a storyteller
   - `justicehub_enabled` is set to `true` in the database
   - Profile becomes visible in the JusticeHub sync queue

2. **Sync Process:**
   - JusticeHub API polls for `justicehub_enabled = true` profiles
   - Syncs profile data (name, bio, image, role)
   - Updates `justicehub_synced_at` timestamp
   - "Synced" badge appears in admin UI

3. **Disable Profile:**
   - Admin unchecks the checkbox
   - Profile is removed from JusticeHub on next sync

### User Workflow (Future Enhancement)

Add a JusticeHub settings section to user profile pages where they can:
- Enable/disable their own JusticeHub display
- Choose their role
- Opt into featured display
- See sync status

---

## 🎨 UI Features

### Admin Storytellers Table

**Column:** JusticeHub
- **Checkbox:** Enable/disable JusticeHub display
- **Badge:** Shows "Synced" when `justicehub_synced_at` is set
- **Tooltip:** Explains what the checkbox does on hover

**Styling:**
- Checkbox: 16px, rounded, gray border
- Synced Badge: Purple background (#E9D5FF), purple text (#7C3AED)
- Hover states for better UX

---

## 🔍 Database Queries

### Get All JusticeHub-Enabled Profiles
```sql
SELECT * FROM get_justicehub_profiles();
```

### Manually Enable a Profile
```sql
UPDATE profiles
SET justicehub_enabled = true,
    justicehub_role = 'practitioner'
WHERE email = 'user@example.com';
```

### Check Sync Status
```sql
SELECT
  display_name,
  justicehub_enabled,
  justicehub_role,
  justicehub_synced_at
FROM profiles
WHERE justicehub_enabled = true
ORDER BY justicehub_synced_at DESC NULLS LAST;
```

### Count Enabled Profiles
```sql
SELECT COUNT(*) as enabled_profiles
FROM profiles
WHERE justicehub_enabled = true;
```

---

## 📝 Future Enhancements

### Short-Term
- [ ] Add role selector dropdown in admin UI
- [ ] Add featured toggle in admin UI
- [ ] Show last sync time in tooltip
- [ ] Add bulk enable/disable actions

### Medium-Term
- [ ] Add JusticeHub settings section to user profile pages
- [ ] Add onboarding prompt for new users
- [ ] Create dedicated JusticeHub management page in admin
- [ ] Add organization-level JusticeHub controls

### Long-Term
- [ ] Implement actual JusticeHub sync API
- [ ] Add webhook notifications for sync events
- [ ] Create JusticeHub analytics dashboard
- [ ] Support custom profile fields for JusticeHub

---

## 🐛 Troubleshooting

### Migration Fails
**Error:** "Column already exists"
**Solution:** The migration uses `IF NOT EXISTS`, so this shouldn't happen. If it does, manually check if columns exist:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name LIKE 'justicehub%';
```

### Checkbox Doesn't Persist
**Cause:** API endpoint not handling `justicehub_enabled` field
**Solution:** Verify the PATCH endpoint in `src/app/api/admin/storytellers/[id]/route.ts` accepts and saves the field

### Types Not Matching
**Cause:** Database types not regenerated after migration
**Solution:** Regenerate types from Supabase dashboard

### No Synced Badge Showing
**Cause:** `justicehub_synced_at` is null
**Solution:** This is expected until JusticeHub actually syncs the profile. The timestamp is set by the JusticeHub sync process, not by Empathy Ledger.

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Database migration applied successfully
- [ ] New columns visible in Supabase dashboard
- [ ] TypeScript types updated
- [ ] API endpoint accepts `justicehub_enabled` field
- [ ] JusticeHub column visible in admin storytellers table
- [ ] Checkbox toggles correctly
- [ ] Checkbox state persists after page refresh
- [ ] No console errors when toggling
- [ ] Synced badge appears (once `justicehub_synced_at` is set)

---

## 📚 Related Files

- **Migration:** `supabase/migrations/20251027_justicehub_integration.sql`
- **Admin UI:** `src/app/admin/storytellers/page.tsx`
- **API Endpoint:** `src/app/api/admin/storytellers/[id]/route.ts`
- **Types:** `src/types/database/user-profile.ts`
- **Guide:** `EMPATHY_LEDGER_JUSTICEHUB_INTEGRATION.md` (reference guide)

---

**Setup Status:** ✅ UI Complete, ⏳ Migration Pending, ⏳ API Update Pending

Once you apply the migration and update the API endpoint, the JusticeHub integration will be fully functional!
