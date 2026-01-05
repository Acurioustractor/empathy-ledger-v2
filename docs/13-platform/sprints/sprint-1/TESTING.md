# Sprint 1 Testing Guide - Ready to Test!

**Date:** January 3, 2026
**Status:** 🟢 Ready for Manual Testing
**Sprint:** Sprint 1 - Foundation & Profile

---

## ✅ Environment Setup Complete

### Local Development Server
- **Status**: ✅ Running
- **URL**: http://localhost:3030
- **Database**: Online Supabase (yvnuayzslukamizrlhwb.supabase.co)
- **Connection**: Verified working

### Staging Deployment
- **Status**: ✅ Deployed
- **URL**: https://empathy-ledger-v2-i97f6j8m4-benjamin-knights-projects.vercel.app
- **Build**: Passed (78/78 pages)
- **Database**: Same online Supabase

---

## 🎯 What to Test

All 14 Sprint 1 components are ready for testing:

### Profile Display Components (3)
1. **PrivacyBadge** - Shows privacy level on profile
2. **ProtocolsBadge** - Shows cultural protocols status
3. **CulturalAffiliations** - Displays Indigenous identity

### Privacy Settings Panel (6)
4. **VisibilitySelector** - Story visibility defaults
5. **DataSovereigntyPreferences** - OCAP controls
6. **ContactPermissions** - Who can contact me
7. **ExportDataDialog** - GDPR data export
8. **DeleteAccountDialog** - GDPR account deletion
9. **PrivacySettingsPanel** - Main settings container

### ALMA Settings Panel (5)
10. **ALMASettingsPanel** - Main ALMA container
11. **AIConsentControls** - Granular AI opt-in
12. **SacredKnowledgeProtection** - Sacred content protection
13. **ElderReviewPreferences** - Elder review workflow
14. **CulturalSafetySettings** - Cultural protocols

---

## 🧪 Quick Start Testing

### Option 1: Test Locally (Recommended)
1. **Open Browser**: http://localhost:3030
2. **Login**: Use existing storyteller account
3. **Navigate to Profile**: `/storytellers/[your-id]`
4. **Check Profile Display**:
   - ✓ PrivacyBadge visible
   - ✓ ProtocolsBadge visible
   - ✓ CulturalAffiliations visible
5. **Navigate to Dashboard**: `/storytellers/[your-id]/dashboard`
6. **Test Settings Tab**:
   - ✓ PrivacySettingsPanel loads
   - ✓ All 6 sub-components visible
   - ✓ Save settings works
7. **Test ALMA Tab**:
   - ✓ ALMASettingsPanel loads
   - ✓ All 5 sub-components visible
   - ✓ Save settings works

### Option 2: Test on Staging
Same steps as above, but use staging URL instead of localhost.

---

## 📋 Full Test Checklist

Follow the comprehensive manual test checklist:
👉 [SPRINT_1_MANUAL_TEST_CHECKLIST.md](docs/testing/SPRINT_1_MANUAL_TEST_CHECKLIST.md)

**15 Test Scenarios:**
1. Profile Display Components
2. Privacy Settings Panel
3. Export Data (GDPR Article 15)
4. Delete Account (GDPR Article 17)
5. ALMA Settings Panel
6. AI Consent Controls
7. Sacred Knowledge Protection
8. Elder Review Preferences
9. Cultural Safety Settings
10. ALMA Settings Save
11. Cross-Tab Integration
12. Tablet Responsiveness
13. Keyboard Navigation (Accessibility)
14. Console Error Check
15. Database Persistence

---

## 🔍 Key Things to Verify

### Privacy Settings
- [ ] Story visibility selector works
- [ ] Data sovereignty preferences save
- [ ] Contact permissions update
- [ ] Export data downloads JSON file
- [ ] Delete account shows warning (DON'T COMPLETE)
- [ ] Settings persist after page refresh

### ALMA Settings
- [ ] All AI toggles default to OFF
- [ ] AI consent counter shows "0/4 AI Features Enabled"
- [ ] Sacred knowledge protection has 3 levels
- [ ] Elder review preferences configurable
- [ ] Cultural protocol notes save
- [ ] Plain-language tooltips display
- [ ] Touch targets are ≥44px (tablet)
- [ ] Confirmation messages show for 5 seconds

### Cultural Safety
- [ ] OCAP principles clear ("You own your data")
- [ ] Sacred knowledge overrides AI consent
- [ ] Elder authority respected but advisory
- [ ] Cultural color palette applied (clay, sage, sky)

### Accessibility
- [ ] Keyboard navigation works (Tab key)
- [ ] Focus indicators visible
- [ ] Screen reader labels present
- [ ] All text meets 4.5:1 contrast ratio

---

## 🐛 Bug Reporting

If you find issues, document them using this format:

```markdown
### Bug #[NUMBER]: [Title]

**Severity:** Critical / High / Medium / Low
**Component:** [Component name]
**Environment:** Local / Staging

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Observe...

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Impact:**
- [ ] Blocks Sprint 1 deployment
- [ ] Cultural safety concern
- [ ] Accessibility issue
- [ ] Can be deferred to Sprint 2
```

---

## 📊 Test Progress Tracker

**Environment Setup:**
- [x] Local dev server running
- [x] Staging deployed successfully
- [x] Database connection verified
- [ ] Test data seeded (optional)

**Component Testing:**
- [ ] Profile Display Components (3/3)
- [ ] Privacy Settings Panel (6/6)
- [ ] ALMA Settings Panel (5/5)

**Integration Testing:**
- [ ] Cross-tab navigation
- [ ] Settings persistence
- [ ] API endpoints responding

**Acceptance Criteria:**
- [ ] All 14 components functional
- [ ] Zero critical bugs
- [ ] Cultural safety verified
- [ ] Accessibility compliant

---

## ✅ Test Sign-Off

**When all tests pass:**

1. Mark all checklist items complete
2. Document any bugs found (non-critical)
3. Update [SPRINT_1_READY_FOR_DEPLOYMENT.md](SPRINT_1_READY_FOR_DEPLOYMENT.md)
4. Approve for production deployment

**Expected Timeline:**
- Manual testing: 1-2 hours
- Bug fixes (if any): 0-4 hours
- UAT with real users: 3-5 days
- Production deployment: Jan 13, 2026

---

## 🚀 Next Steps After Testing

### If All Tests Pass:
1. ✅ Update deployment readiness doc
2. ✅ Invite test storytellers for UAT
3. ✅ Schedule production deployment (Jan 13)
4. ✅ Begin Sprint 2 planning (Jan 6)

### If Issues Found:
1. 🐛 Document all bugs
2. 🔧 Fix critical issues
3. ♻️ Re-test after fixes
4. ✅ Repeat sign-off process

---

## 📞 Support

**Questions or Issues?**
- Review: [SPRINT_1_MANUAL_TEST_CHECKLIST.md](docs/testing/SPRINT_1_MANUAL_TEST_CHECKLIST.md)
- Check: [SPRINT_1_INTEGRATION_TEST_PLAN.md](docs/testing/SPRINT_1_INTEGRATION_TEST_PLAN.md)
- Reference: [SPRINT_1_COMPLETE.md](SPRINT_1_COMPLETE.md)

---

## 🎉 You're Ready!

**Local Testing URL**: http://localhost:3030

**Staging URL**: https://empathy-ledger-v2-i97f6j8m4-benjamin-knights-projects.vercel.app

**Start Testing Now** 🚀

Follow the [15-point manual test checklist](docs/testing/SPRINT_1_MANUAL_TEST_CHECKLIST.md) to verify all Sprint 1 components are working correctly.

---

**Sprint 1 Status:** ✅ DEPLOYED & READY FOR TESTING
**Environment:** ✅ CONFIGURED & RUNNING
**Next Action:** Begin manual integration testing

**Happy Testing!** 🎯
