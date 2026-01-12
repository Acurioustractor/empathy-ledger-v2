# Sprint 1 Manual Integration Test Checklist

**Test Date:** _______________
**Tester:** _______________
**Environment:** Local Development / Staging / Production

---

## Pre-Test Setup

- [ ] Local development server running (`npm run dev`)
- [ ] Database accessible (Supabase local or remote)
- [ ] Test user account created
- [ ] Browser: Chrome/Firefox/Safari
- [ ] Browser DevTools open (Console tab)

---

## Test 1: Profile Display Components

**Goal:** Verify all profile display components render correctly

### Steps:
1. [ ] Navigate to a storyteller profile page (e.g., `/storytellers/[test-id]`)
2. [ ] **PrivacyBadge** displays with correct visibility status
3. [ ] **ProtocolsBadge** displays with cultural protocols status
4. [ ] **CulturalAffiliations** displays nations, territories, languages
5. [ ] All components use correct cultural color palette (Clay, Sage, Sky)
6. [ ] No console errors

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 2: Privacy Settings Panel

**Goal:** Test complete privacy settings workflow

### Steps:
1. [ ] Navigate to Storyteller Dashboard (`/storytellers/[id]/dashboard`)
2. [ ] Click **Settings** tab
3. [ ] PrivacySettingsPanel loads without errors
4. [ ] **VisibilitySelector:** Change story visibility default
5. [ ] **DataSovereigntyPreferences:** Enable OCAP controls
6. [ ] **ContactPermissions:** Select who can contact
7. [ ] Click **Save Privacy Settings**
8. [ ] Success message displays for 5 seconds (extended from UAT)
9. [ ] Refresh page - settings persist
10. [ ] Check browser Network tab - API call to `/api/user/privacy-settings`

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 3: Export Data (GDPR Article 15)

**Goal:** Verify data export functionality

### Steps:
1. [ ] In Privacy Settings tab, click **Export My Data**
2. [ ] **ExportDataDialog** displays
3. [ ] Review data export contents list
4. [ ] Select **JSON** format
5. [ ] Click **Export**
6. [ ] Download completes
7. [ ] Open exported JSON file
8. [ ] Verify includes: profile data, stories, settings, audit logs

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 4: Delete Account (GDPR Article 17)

**Goal:** Verify account deletion workflow (DO NOT COMPLETE - JUST TEST UI)

### Steps:
1. [ ] In Privacy Settings tab, click **Delete My Account**
2. [ ] **DeleteAccountDialog** displays with warning
3. [ ] Warning explains 30-day grace period
4. [ ] Warning lists what will be deleted
5. [ ] Cancellation option visible
6. [ ] **DO NOT CLICK CONFIRM** (this will actually delete!)

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 5: ALMA Settings Panel

**Goal:** Test complete ALMA settings workflow

### Steps:
1. [ ] Navigate to Storyteller Dashboard
2. [ ] Click **ALMA** tab
3. [ ] **ALMASettingsPanel** loads without errors
4. [ ] Plain-language tooltips display on hover
5. [ ] Tab triggers are ≥44px (tablet-friendly from UAT)
6. [ ] All AI consent toggles default to OFF

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 6: AI Consent Controls

**Goal:** Test granular AI consent toggles

### Steps:
1. [ ] In ALMA tab, view **AIConsentControls** section
2. [ ] Verify 4 toggles: Theme Extraction, Network Discovery, Impact Analytics, Voice Analysis
3. [ ] All toggles OFF by default
4. [ ] Enable **Theme Extraction** only
5. [ ] "Benefit" message displays
6. [ ] Counter shows "1/4 AI Features Enabled"
7. [ ] Disable **Theme Extraction**
8. [ ] Counter returns to "0/4"

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 7: Sacred Knowledge Protection

**Goal:** Test sacred knowledge protection levels

### Steps:
1. [ ] In ALMA tab, scroll to **SacredKnowledgeProtection**
2. [ ] Enable Sacred Knowledge Protection toggle
3. [ ] Select "None" protection level
4. [ ] Description explains "Stories are public by default"
5. [ ] Select "Moderate" protection level
6. [ ] Description explains "Community membership required"
7. [ ] Select "Strict" protection level
8. [ ] **Warning displays** explaining: NO AI, private, Elder review required
9. [ ] Enable "AI-Assisted Detection"
10. [ ] Explanation shows how AI suggestions work

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 8: Elder Review Preferences

**Goal:** Test Elder review configuration

### Steps:
1. [ ] In ALMA tab, scroll to **ElderReviewPreferences**
2. [ ] Enable Elder Review toggle
3. [ ] Select "Manual Request Only" trigger
4. [ ] Description shows storyteller controls when to request
5. [ ] Select "Sacred Content Auto-Route" trigger
6. [ ] Description shows automatic routing for sacred stories
7. [ ] Select "Review All Stories" trigger
8. [ ] Description shows every story goes to Elders
9. [ ] Change notification frequency to "Immediate"
10. [ ] Info alert explains "You'll receive a notification as soon as..."

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 9: Cultural Safety Settings

**Goal:** Test cultural protocols configuration

### Steps:
1. [ ] In ALMA tab, scroll to **CulturalSafetySettings**
2. [ ] Enable Content Warnings toggle
3. [ ] Info explains warnings protect community
4. [ ] Enable Cultural Protocols toggle
5. [ ] Protocol Notes text area appears
6. [ ] Enter example protocol: "Gender-specific content requires Elder review"
7. [ ] Verify text saves (min 120px height from UAT)
8. [ ] Enable Sensitive Content Notifications
9. [ ] Info explains AI detection suggestions

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 10: ALMA Settings Save

**Goal:** Verify ALMA settings persist correctly

### Steps:
1. [ ] Configure all ALMA settings:
   - AI Consent: Theme Extraction + Impact Analytics
   - Sacred Knowledge: Moderate protection
   - Elder Review: Sacred-only auto-route
   - Cultural Safety: All enabled with protocol notes
2. [ ] Click **Save ALMA Settings**
3. [ ] Success message displays for 5 seconds (extended from UAT)
4. [ ] Refresh page
5. [ ] All settings persist correctly
6. [ ] Check browser Network tab - API call to `/api/user/alma-settings`

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 11: Cross-Tab Integration

**Goal:** Test navigation between related settings

### Steps:
1. [ ] View storyteller profile page
2. [ ] Click on **ProtocolsBadge**
3. [ ] Should navigate to Dashboard → ALMA tab
4. [ ] Return to profile page
5. [ ] Click on **PrivacyBadge**
6. [ ] Should navigate to Dashboard → Settings tab
7. [ ] Badges reflect current settings accurately

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 12: Tablet Responsiveness (UAT Improvements)

**Goal:** Verify tablet-specific enhancements

### Steps:
1. [ ] Resize browser to 768px width (tablet viewport)
2. [ ] Navigate to ALMA Settings tab
3. [ ] Measure tab triggers (should be ≥44px height)
4. [ ] Hover over tooltip icons
5. [ ] Tooltips display correctly on tablet
6. [ ] All toggles large enough to tap (44px)
7. [ ] No horizontal scrolling required

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 13: Keyboard Navigation (Accessibility)

**Goal:** Test keyboard accessibility

### Steps:
1. [ ] Navigate to Privacy Settings tab
2. [ ] Press **Tab** key repeatedly
3. [ ] Focus indicators visible on all form elements
4. [ ] Press **Spacebar** on toggle switches - they activate
5. [ ] Press **Enter** on buttons - they activate
6. [ ] Navigate to ALMA tab using keyboard only
7. [ ] All controls accessible via keyboard

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Test 14: Console Error Check

**Goal:** Verify no JavaScript errors

### Steps:
1. [ ] Open browser DevTools → Console tab
2. [ ] Clear console
3. [ ] Navigate through all Sprint 1 features:
   - Profile page
   - Privacy Settings tab
   - ALMA Settings tab
4. [ ] Change settings and save
5. [ ] **Zero errors in console**
6. [ ] Warnings acceptable (document any)

**✅ PASS | ❌ FAIL**

**Console Warnings:** _______________________________________________________________

---

## Test 15: Database Persistence (Optional - Requires DB Access)

**Goal:** Verify settings save to database correctly

### SQL Queries to Run:

```sql
-- Check privacy settings
SELECT
  id,
  default_story_visibility,
  contact_permissions,
  data_sovereignty_preferences
FROM profiles
WHERE id = 'test-user-id';

-- Check ALMA settings
SELECT
  id,
  consent_preferences,
  cultural_permissions
FROM profiles
WHERE id = 'test-user-id';

-- Check audit logs
SELECT
  user_id,
  action,
  resource_type,
  created_at
FROM audit_logs
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC
LIMIT 10;
```

**✅ PASS | ❌ FAIL**

**Notes:** _______________________________________________________________

---

## Sprint 1 Acceptance Criteria

### Component Delivery
- [ ] 14/14 components built and functional
- [ ] 2/2 API endpoints working
- [ ] 100% build passing
- [ ] Zero TypeScript errors

### Cultural Safety
- [ ] OCAP principles fully implemented
- [ ] Sacred knowledge protection working
- [ ] Elder authority clearly communicated
- [ ] AI opt-in only (default: OFF)
- [ ] Cultural color palette applied correctly

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation functional
- [ ] Touch targets ≥44px (tablet)
- [ ] Screen reader labels present
- [ ] Focus indicators visible

### User Experience (UAT Improvements)
- [ ] Plain-language tooltips working
- [ ] Confirmation messages 5 seconds (extended)
- [ ] Media upload progress indicator (if tested)
- [ ] Help button accessible globally

---

## Overall Test Results

**Tests Passed:** _____ / 15

**Critical Issues Found:** _____

**Medium Issues Found:** _____

**Low Issues Found:** _____

---

## Sign-Off

**Approved for Staging:** ☐ YES  ☐ NO  ☐ CONDITIONAL

**Conditional Requirements:** _______________________________________________

**Tester Signature:** _____________________
**Date:** _____________________

**Reviewer Signature:** _____________________
**Date:** _____________________

---

## Next Steps

If all tests pass:
1. [ ] Document any minor issues as GitHub issues (not blockers)
2. [ ] Deploy Sprint 1 to staging environment
3. [ ] Run UAT with real storyteller profiles
4. [ ] Gather user feedback
5. [ ] Plan Sprint 2 kickoff (Jan 6, 2026)

If critical issues found:
1. [ ] Document all bugs with screenshots
2. [ ] Prioritize fixes
3. [ ] Re-test after fixes
4. [ ] Repeat sign-off process
