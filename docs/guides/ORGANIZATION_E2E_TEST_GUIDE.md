# Organization End-to-End Testing Guide

## Test Results Summary

✅ **All automated tests passed!** (18/18 tests)

The automated test script verified:
- ✅ Organization creation (tenant + organization)
- ✅ Database integrity (proper relationships)
- ✅ Data isolation (no cross-tenant contamination)
- ✅ Stats API functionality
- ✅ Multi-tenant system integrity

## Manual UI Testing Steps

Now let's verify the Super Admin UI works correctly with organization creation:

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Super Admin Dashboard

Open: [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Test Organization Creation UI

#### Step 3.1: Navigate to Organizations Page
- Click on "Organizations" in the left sidebar
- URL should be: `http://localhost:3000/admin/organisations`
- You should see the list of existing organizations (currently 18 organizations)

#### Step 3.2: Create a New Organization
1. Click the "Create New Organization" button (or similar)
2. Fill in the form with test data:
   - **Name**: `UI Test Organization`
   - **Description**: `Testing organization creation via Super Admin UI`
   - **Type**: Select `Community` (or `Aboriginal Community` or `Philanthropy`)
   - **Location**: `Brisbane, QLD, Australia`
   - **Website URL**: `https://ui-test.example.com`
   - **Contact Email**: `ui-test@example.com`

   **Note**: Only three organization types are allowed by the database:
   - `Community` - General community organizations
   - `Aboriginal Community` - Indigenous/Aboriginal community organizations
   - `Philanthropy` - Philanthropic foundations and grant-makers
3. Click "Create Organization"

#### Step 3.3: Verify Organization Appears
- You should be redirected back to the organizations list
- The new "UI Test Organization" should appear at the top (most recent)
- Verify the organization card shows:
  - Name: UI Test Organization
  - Type: Community
  - Location: Brisbane, QLD, Australia
  - 0 stories
  - 0 members

### 4. Test Organization Selector

#### Step 4.1: Open Organization Selector
- Look for the organization selector dropdown (usually at the top of the dashboard)
- Click to open it

#### Step 4.2: Verify New Organization Appears
- The dropdown should include "UI Test Organization"
- The list should now show 19 organizations (was 18 before)

#### Step 4.3: Select the New Organization
- Click on "UI Test Organization" in the dropdown
- The dashboard should update to show stats for that organization
- All stats should be zero (0 stories, 0 members, 0 projects, etc.)

### 5. Test Data Isolation

#### Step 5.1: Switch Between Organizations
- Select "UI Test Organization" - should show all zeros
- Select "Platform (All Organizations)" - should show total counts across all orgs
- Select a different existing organization (e.g., "Oonchiumpa") - should show that org's data only

#### Step 5.2: Verify Stats Accuracy
- Platform view: Should show 302 total stories (or current count)
- UI Test Organization: Should show 0 stories, 0 members, 0 projects
- Other organizations: Should show their respective counts

### 6. Test Organization Management

#### Step 6.1: View Organization Details
- Click on "UI Test Organization" from the list
- Verify all details are displayed correctly
- Check that tenant_id is properly set

#### Step 6.2: Test Edit Functionality (if available)
- Try editing the organization details
- Save changes
- Verify changes are reflected

### 7. Test API Endpoints

You can also test the API endpoints directly:

#### Get All Organizations
```bash
curl http://localhost:3000/api/admin/orgs | jq
```

Should return array with 19 organizations including "UI Test Organization"

#### Get Platform Stats
```bash
curl http://localhost:3000/api/admin/stats/platform | jq
```

Should show updated org count (19) and total stats

#### Get Organization-Specific Stats
First, get the organization ID from the organizations list, then:

```bash
curl "http://localhost:3000/api/admin/stats/organization?organizationId=<ORG_ID>" | jq
```

Should return stats for that specific organization (all zeros for new org)

## Expected Results

### ✅ Success Criteria

1. **Organization Creation**
   - New organization appears in list immediately
   - Both tenant and organization records created in database
   - Organization properly linked to tenant

2. **Data Isolation**
   - New organization shows 0 stories, 0 members, 0 projects
   - Other organizations' data remains unchanged
   - Switching organizations updates stats correctly

3. **UI Functionality**
   - Organization selector includes new organization
   - Dashboard updates when switching organizations
   - Stats are accurate for each organization context

4. **Multi-Tenant System**
   - Platform view shows aggregated stats across all 19 organizations
   - Organization-specific views show isolated data
   - No data leakage between organizations

## Cleanup

After testing, you can delete the test organization:

### Option 1: Via UI (if delete functionality exists)
- Navigate to Organizations list
- Find "UI Test Organization"
- Click delete/remove button
- Confirm deletion

### Option 2: Via API
```bash
curl -X DELETE "http://localhost:3000/api/admin/orgs?id=<ORG_ID>"
```

### Option 3: Via Database Script
```bash
npx tsx scripts/delete-test-org.ts
```

Or directly in SQL:
```sql
-- Get the org ID first
SELECT id, tenant_id FROM organizations WHERE name = 'UI Test Organization';

-- Delete organization
DELETE FROM organizations WHERE name = 'UI Test Organization';

-- Delete associated tenant
DELETE FROM tenants WHERE name = 'UI Test Organization';
```

## What Was Tested

The automated test script (`scripts/test-org-e2e.ts`) verified:

1. ✅ Baseline stats capture
2. ✅ Tenant creation with proper settings
3. ✅ Organization creation linked to tenant
4. ✅ Database integrity (both records exist)
5. ✅ Proper relationship (org.tenant_id → tenant.id)
6. ✅ Count increases (orgs: 18→19, tenants: 32→33)
7. ✅ Data isolation (new org has 0 stories/members/projects)
8. ✅ Other organizations' data intact
9. ✅ Multi-tenant queries work correctly
10. ✅ Organization appears in list
11. ✅ All organizations have unique IDs
12. ✅ Organization-specific stats query works
13. ✅ Platform-wide stats include new organization
14. ✅ Cleanup (test data removed)

## Troubleshooting

### Issue: Organization doesn't appear in list
- Check browser console for errors
- Verify API is running: `curl http://localhost:3000/api/admin/orgs`
- Check database: `SELECT * FROM organizations ORDER BY created_at DESC LIMIT 5;`

### Issue: Stats showing wrong numbers
- Refresh the page
- Check organization selector is set correctly
- Verify API response: `curl http://localhost:3000/api/admin/stats/platform`

### Issue: Can't delete test organization
- Check for foreign key constraints
- Use service role client for cleanup
- Run: `npx tsx scripts/test-org-e2e.ts` (includes cleanup)

## Next Steps

After successful testing:

1. ✅ Organization creation system verified working
2. 📋 Proceed with Phase 3: Stories management with organization filtering
3. 📋 Extend pattern to other admin pages (transcripts, blog posts, users)
4. 📋 Add audit logging for organization operations
5. 📋 Implement bulk operations for organization management

## Related Documentation

- [SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md](docs/SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md)
- [MULTI_TENANT_BEST_PRACTICES.md](docs/MULTI_TENANT_BEST_PRACTICES.md)
- [NEXT_STEPS_CHECKLIST.md](docs/NEXT_STEPS_CHECKLIST.md)
