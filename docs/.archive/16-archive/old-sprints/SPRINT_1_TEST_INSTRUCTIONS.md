# Sprint 1 Testing Instructions

**Issue Found:** The storyteller profile API is returning 500 errors, likely due to database queries or RLS policies.

**Sprint 1 Focus:** We don't need the full profile page to work - we just need to test the 14 Sprint 1 components.

---

## ✅ Two Options to Test Sprint 1 Components

### Option 1: Fix the API Endpoint (Recommended for full testing)

The API at `/api/storytellers/[id]/route.ts` is failing. This needs investigation to understand why the database queries are failing.

**Quick Fix Needed:**
1. Check dev server console for actual error
2. Likely RLS policy blocking the query
3. May need to adjust query or RLS policies

### Option 2: Create Standalone Test Page (Quick testing)

Create a dedicated test page that loads Sprint 1 components directly without needing the full storyteller API.

**Test Page Structure:**
```typescript
// src/app/test/sprint-1/page.tsx
// Directly render:
// - PrivacySettingsPanel
// - ALMASettingsPanel
// - PrivacyBadge
// - ProtocolsBadge
// - CulturalAffiliations
```

This would let you test all Sprint 1 functionality immediately without fixing the existing API.

---

## 🔍 Root Cause Analysis Needed

**The storyteller profiles exist in the database** (confirmed via direct query), but the API endpoint `/api/storytellers/[id]` returns:
```json
{"error":"Failed to fetch storyteller profile"}
```

**Possible causes:**
1. **RLS Policies** - Row Level Security may be blocking unauthenticated access
2. **Missing Relations** - The query joins multiple tables that may not have data
3. **Auth Required** - The API may require authentication
4. **Database Schema Mismatch** - Column names may have changed

**Next Step:** Check the actual error in the server console or create a test page.

---

## 🎯 Immediate Action

**Choose one:**

**A. Debug the API** (15-30 minutes)
- Check server console for actual error message
- Test API with authentication
- Adjust RLS policies if needed

**B. Create test page** (5 minutes)
- Build standalone Sprint 1 component test page
- Test all 14 components in isolation
- Faster path to validation

---

## 📝 Sprint 1 Components to Test

Regardless of approach, we need to verify these 14 components work:

### Profile Display (3)
- [ ] PrivacyBadge
- [ ] ProtocolsBadge
- [ ] CulturalAffiliations

### Privacy Settings (6)
- [ ] VisibilitySelector
- [ ] DataSovereigntyPreferences
- [ ] ContactPermissions
- [ ] ExportDataDialog
- [ ] DeleteAccountDialog
- [ ] PrivacySettingsPanel

### ALMA Settings (5)
- [ ] AIConsentControls
- [ ] SacredKnowledgeProtection
- [ ] ElderReviewPreferences
- [ ] CulturalSafetySettings
- [ ] ALMASettingsPanel

---

**Which approach would you like to take?**
