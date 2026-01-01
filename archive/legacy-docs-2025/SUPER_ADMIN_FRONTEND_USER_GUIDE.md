# Super Admin Frontend User Guide

**How to Use the Super Admin Multi-Tenant Interface**

---

## Prerequisites

1. **Dev Server Running**: `npm run dev` on port 3030
2. **Authenticated as Super Admin**: Email `benjamin@act.place`
3. **Browser**: Chrome, Firefox, or Safari

---

## Step-by-Step Guide

### Step 1: Log In as Super Admin

1. Open your browser to: **http://localhost:3030**
2. Click "Sign In" or navigate to login page
3. Log in with super admin credentials:
   - Email: `benjamin@act.place`
   - Password: (your password)

### Step 2: Navigate to Admin Panel

1. Once logged in, navigate to: **http://localhost:3030/admin**
2. You should see the admin interface load

### Step 3: Observe the Super Admin Interface

When the `/admin` page loads, you should see:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Super Admin Mode: You have full access to all           │
│    organizations. All actions are logged.                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Admin Panel                                                 │
│  Platform Management - All Organizations                     │
│                                                               │
│  🏢 [All Organizations (Platform View) ▼]                    │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- 🟨 **Yellow Warning Banner** at the very top
- 📋 **Header** showing "Admin Panel"
- 🏢 **Organization Selector** dropdown on the right side

### Step 4: View Platform-Wide Stats

By default, "All Organizations (Platform View)" is selected.

You should see stats cards showing:

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Total Users      │ │ Total Stories    │ │ Pending Reviews  │
│ 247              │ │ 301              │ │ 0                │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌──────────────────┐
│ Organizations    │
│ 18               │
└──────────────────┘
```

These are **aggregated across ALL organizations**.

### Step 5: Switch to Oonchiumpa Organization

1. Click the **Organization Selector** dropdown (shows "All Organizations (Platform View)")
2. Scroll through the list of organizations
3. Click on **"Oonchiumpa"**

**What Happens:**
- The page automatically refetches data
- Dashboard updates to show only Oonchiumpa's data
- Header changes to: **"Oonchiumpa Dashboard"**
- Subtitle changes to: **"Organization-specific data and management"**

You should now see:

```
┌──────────────────────────────────────────────────────────────┐
│  Oonchiumpa Dashboard                                         │
│  Organization-specific data and management                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Total Users      │ │ Total Stories    │ │ Pending Reviews  │
│ 0                │ │ 6                │ │ 0                │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

Notice:
- **Stories: 6** (down from 301)
- Only Oonchiumpa's data is shown

### Step 6: Try Different Organizations

1. Click the dropdown again
2. Select **"A Curious Tractor"**

You should see:
- **Stories: 0** (A Curious Tractor has no stories yet)
- **Projects: 1**

3. Select **"Community Elder"**

You should see:
- **Stories: 10**
- **Projects: 0**

### Step 7: Return to Platform View

1. Click the dropdown
2. Select **"All Organizations (Platform View)"**
3. Dashboard returns to showing all 301 stories across all orgs

---

## What You're Seeing in the Browser Console

Open **Developer Tools** (F12) and check the Console tab. You should see logs like:

```
🔧 AdminDashboard: Component rendering with orgId: all
🔧 AdminDashboard: Organization changed, fetching data...
🔧 AdminDashboard: Fetching stats for: all

(After selecting Oonchiumpa)
🔧 AdminDashboard: Component rendering with orgId: c53077e1-98de-4216-9149-6268891ff62e
🔧 AdminDashboard: Organization changed, fetching data...
🔧 AdminDashboard: Fetching stats for: c53077e1-98de-4216-9149-6268891ff62e
```

---

## Troubleshooting

### Issue: Warning banner doesn't appear
**Solution:** Make sure you're logged in as `benjamin@act.place` (super admin)

### Issue: Organization selector doesn't show
**Solution:**
1. Check browser console for errors
2. Verify `/api/admin/organizations` returns data
3. Test: `curl http://localhost:3030/api/admin/organizations` (should require auth)

### Issue: Stats show 0 for everything
**Possible causes:**
1. Not authenticated as super admin
2. API endpoints returning errors
3. Check Network tab in DevTools for failed requests

### Issue: Can't see the dropdown list
**Solution:** Click the dropdown - it should expand showing:
```
All Organizations (Platform View)
A Curious Tractor
Beyond Shadows
Community Elder
... (more organizations)
Oonchiumpa
... (more organizations)
```

### Issue: Stats don't update when switching organizations
**Check:**
1. Browser console for errors
2. Network tab - should see new API calls
3. Look for errors in the API response

---

## Testing Checklist

Use this checklist to verify everything is working:

- [ ] Login as super admin successful
- [ ] Navigate to `/admin` loads without errors
- [ ] Yellow warning banner appears at top
- [ ] Organization selector visible in header
- [ ] Dropdown shows "All Organizations (Platform View)" by default
- [ ] Dashboard shows platform stats (301 stories, 18 organizations)
- [ ] Click organization dropdown opens list
- [ ] Can see all 18 organizations in list
- [ ] Click "Oonchiumpa" switches to that org
- [ ] Header changes to "Oonchiumpa Dashboard"
- [ ] Stats update to show 6 stories
- [ ] Click "A Curious Tractor" switches to that org
- [ ] Stats update to show 0 stories
- [ ] Click "All Organizations" returns to platform view
- [ ] Stats return to 301 stories
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

---

## Expected API Calls

When you switch organizations, you should see these API calls in the Network tab:

### When "All Organizations" selected:
```
GET /api/admin/stats/platform
Status: 200 OK
Response: {
  platform: {
    totalOrganizations: 18,
    stories: { total: 301, draft: 3, published: 298, ... },
    transcripts: { total: 222 },
    members: { total: 247 }
  }
}
```

### When "Oonchiumpa" selected:
```
GET /api/admin/organizations/c53077e1-98de-4216-9149-6268891ff62e/stats
Status: 200 OK
Response: {
  organizationId: "c53077e1-98de-4216-9149-6268891ff62e",
  organizationName: "Oonchiumpa",
  stories: { total: 6, published: 6, ... },
  transcripts: { total: 0 },
  projects: { total: 2 }
}
```

---

## Visual Guide

### Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│                      Header (existing)                      │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ ⚠️ Super Admin Mode: Full access to all organizations      │ ← NEW
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ Admin Panel              🏢 [All Organizations... ▼]       │ ← NEW
│ Platform Management                                         │
└────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────────────────┐
│          │                                                  │
│ Sidebar  │         Dashboard Stats Cards                   │
│          │                                                  │
│ • Dash   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│ • Users  │  │ Users  │ │Stories │ │Reviews │ │  Orgs  │  │
│ • Stories│  │  247   │ │  301   │ │   0    │ │   18   │  │
│ • Orgs   │  └────────┘ └────────┘ └────────┘ └────────┘  │
│ • ...    │                                                  │
│          │         Quick Actions & Workflow Guide           │
│          │                                                  │
└──────────┴─────────────────────────────────────────────────┘
```

### Organization Selector (Expanded)

When you click the dropdown:

```
┌──────────────────────────────────────────┐
│ 🏢  All Organizations (Platform View) ▼  │
├──────────────────────────────────────────┤
│ ✓ All Organizations (Platform View)      │ ← Currently selected
│   A Curious Tractor                      │
│   Beyond Shadows                         │
│   Community Elder                        │
│   Independent Storytellers               │
│   Oonchiumpa                            │ ← Click this
│   ... (13 more organizations)            │
└──────────────────────────────────────────┘
```

---

## Advanced Usage

### Keyboard Navigation
- Press `Tab` to focus on organization selector
- Press `Enter` or `Space` to open dropdown
- Use `Arrow Up/Down` to navigate organizations
- Press `Enter` to select

### Quick Organization Switch
The selector remembers your last selection (in component state), so:
1. Select organization
2. Navigate to different admin page
3. Return to dashboard
4. Organization selection persists during the session

### URL Parameters (Future Enhancement)
Currently, organization selection is stored in React state.
In Phase 3+, we could add URL parameters like:
- `/admin?org=oonchiumpa`
- `/admin/stories?org=c53077e1-98de-4216-9149-6268891ff62e`

---

## What Each Organization Shows

Based on current database:

| Organization | Stories | Transcripts | Projects |
|--------------|---------|-------------|----------|
| Oonchiumpa | 6 | 0 | 2 |
| Community Elder | 10 | 0 | 0 |
| A Curious Tractor | 0 | 0 | 1 |
| Beyond Shadows | 0 | 0 | 0 |
| ... (14 more) | ... | ... | ... |

**Total Platform:** 301 stories, 222 transcripts, 18 organizations

---

## Next Features (Coming Soon)

After you verify the dashboard works:

### Phase 3: Stories Management
- Stories list page will filter by selected organization
- You'll be able to edit stories for specific organizations
- Organization column in stories table

### Phase 4: Other Pages
- All admin pages will respect organization selection
- Transcripts, blog posts, users filtered by org

### Phase 5: Enhanced Features
- Audit log of all super admin actions
- Bulk operations across organizations
- Data export per organization

---

## Summary

The Super Admin interface allows you to:

1. ✅ **View platform-wide data** - Select "All Organizations"
2. ✅ **View organization-specific data** - Select any organization
3. ✅ **Switch seamlessly** - Dropdown updates dashboard instantly
4. ✅ **See clear context** - Warning banner + dynamic header
5. ✅ **Maintain data isolation** - Each org's data completely separate

**Start by trying the organization selector and watching the stats update!**
