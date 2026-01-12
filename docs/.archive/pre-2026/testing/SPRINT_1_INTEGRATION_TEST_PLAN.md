# Sprint 1 Integration Test Plan

**Test Date:** January 3, 2026
**Sprint:** Sprint 1 - Foundation & Profile
**Components:** 14 components across 3 work packages
**Test Type:** Integration + UAT validation

---

## Test Objectives

1. **Component Integration:** Verify all Sprint 1 components work together seamlessly
2. **Data Flow:** Ensure settings save to database and persist across sessions
3. **User Experience:** Validate complete storyteller workflows
4. **Cultural Safety:** Verify OCAP principles and cultural protocols are enforced
5. **Accessibility:** Confirm WCAG 2.1 AA compliance across all components

---

## Test Scenarios

### Scenario 1: New Storyteller Profile Setup
**Goal:** Test complete onboarding flow for a new storyteller

**Steps:**
1. View storyteller profile page
   - ✓ PrivacyBadge displays default status
   - ✓ ProtocolsBadge shows initial state
   - ✓ CulturalAffiliations display (if set)

2. Navigate to Settings tab
   - ✓ PrivacySettingsPanel loads correctly
   - ✓ Default visibility settings displayed
   - ✓ Data sovereignty preferences accessible

3. Configure privacy settings
   - ✓ Change story visibility default
   - ✓ Set contact permissions
   - ✓ Test export data functionality
   - ✓ Verify audit log entry created

4. Navigate to ALMA tab
   - ✓ ALMASettingsPanel loads correctly
   - ✓ All AI consent toggles default to OFF
   - ✓ Sacred knowledge protection available

5. Configure ALMA settings
   - ✓ Enable AI consent for specific features
   - ✓ Set sacred knowledge protection level
   - ✓ Configure Elder review preferences
   - ✓ Add cultural protocol notes
   - ✓ Verify audit log entry created

**Expected Result:** Settings persist across page refreshes

---

### Scenario 2: Sacred Knowledge Protection Workflow
**Goal:** Test strict sacred knowledge protection

**Steps:**
1. Navigate to ALMA Settings
2. Enable Sacred Knowledge Protection
3. Select "Strict Protection" level
4. Verify warning message displays
5. Enable AI-assisted detection
6. Navigate to Privacy Settings
7. Verify privacy defaults updated automatically

**Expected Result:**
- Stories default to private
- AI analysis disabled regardless of consent toggles
- Elder review required before sharing
- Manual approval needed to make public

---

### Scenario 3: Elder Review Configuration
**Goal:** Test Elder review workflow setup

**Steps:**
1. Navigate to ALMA Settings
2. Enable Elder Review
3. Test each trigger option:
   - Manual request only
   - Sacred content auto-route
   - Review all stories
4. Set notification preferences:
   - Immediate
   - Daily digest
   - Weekly summary
5. Verify settings save correctly

**Expected Result:** Notification preferences persist and trigger correctly

---

### Scenario 4: Privacy Settings & Data Export
**Goal:** Test GDPR Article 15 compliance

**Steps:**
1. Navigate to Privacy Settings
2. Click "Export My Data"
3. Verify export dialog displays
4. Select export format (JSON)
5. Confirm export includes:
   - Profile data
   - Story data
   - Media metadata
   - Privacy settings
   - ALMA settings
   - Audit logs

**Expected Result:** Complete data export in machine-readable format

---

### Scenario 5: Account Deletion Workflow
**Goal:** Test GDPR Article 17 compliance

**Steps:**
1. Navigate to Privacy Settings
2. Click "Delete My Account"
3. Verify warning dialog displays
4. Review deletion consequences
5. Confirm deletion request
6. Verify deletion request created
7. Test cancellation within 30-day window

**Expected Result:**
- Deletion request logged
- 30-day grace period active
- Cancellation option available
- Audit trail complete

---

### Scenario 6: AI Consent Granularity
**Goal:** Test opt-in AI features

**Steps:**
1. Navigate to ALMA Settings
2. Verify all AI toggles default to OFF
3. Enable individual features:
   - Theme extraction only
   - Network discovery only
   - Impact analytics only
   - Voice analysis only
4. Verify "Benefit" messages display when enabled
5. Disable features individually
6. Verify consent withdrawal tracked

**Expected Result:**
- Granular control over each AI feature
- Clear benefit explanations
- Consent changes logged

---

### Scenario 7: Cultural Protocol Notes
**Goal:** Test custom cultural protocol configuration

**Steps:**
1. Navigate to ALMA Settings → Cultural Safety
2. Enable Cultural Protocols
3. Add free-text protocol notes:
   - Gender-specific content rules
   - Seasonal restrictions
   - Clan-specific protocols
4. Save settings
5. Verify notes persist
6. Edit notes
7. Verify changes saved

**Expected Result:** Cultural protocol notes save and persist correctly

---

### Scenario 8: Accessibility Testing
**Goal:** Verify WCAG 2.1 AA compliance

**Steps:**
1. Test keyboard navigation:
   - Tab through all form fields
   - Activate toggles with spacebar
   - Navigate tabs with arrow keys

2. Test screen reader:
   - All controls have labels
   - Focus indicators visible
   - ARIA attributes present

3. Test touch targets:
   - All buttons ≥44px
   - Toggle switches large enough
   - Tab triggers adequate size

4. Test color contrast:
   - All text meets 4.5:1 ratio
   - Focus indicators visible
   - Disabled states distinguishable

**Expected Result:** Full WCAG 2.1 AA compliance

---

### Scenario 9: Cross-Tab Integration
**Goal:** Test navigation between related settings

**Steps:**
1. View Profile page
2. Click ProtocolsBadge
3. Verify navigation to ALMA Settings
4. Click PrivacyBadge
5. Verify navigation to Privacy Settings
6. Navigate back to Profile
7. Verify badges reflect current settings

**Expected Result:** Seamless navigation with accurate status indicators

---

### Scenario 10: Tablet Responsiveness
**Goal:** Test tablet-specific improvements from UAT

**Steps:**
1. Resize viewport to tablet (768px)
2. Verify touch targets ≥44px:
   - Tab triggers
   - Toggle switches
   - Buttons
3. Test ALMA Settings tooltips
4. Verify confirmation messages display for 5s
5. Test media uploader progress indicator

**Expected Result:**
- All controls tablet-friendly
- Tooltips display correctly
- Confirmation messages extended
- Progress indicators accurate

---

## Sample Test Profiles

### Profile 1: Elder Grace (Sacred Knowledge Focus)
**Demographics:**
- Age: 68
- Role: Elder & Knowledge Keeper
- Cultural Background: Anishinaabe

**Configuration:**
- Sacred Knowledge: Strict protection
- Elder Review: Review all stories
- AI Consent: All disabled
- Cultural Protocols: Detailed gender-specific notes

**Test Focus:** Sacred knowledge protection workflows

---

### Profile 2: Marcus (Privacy-Conscious)
**Demographics:**
- Age: 32
- Role: Community Advocate
- Cultural Background: Torres Strait Islander

**Configuration:**
- Privacy: Community-only visibility
- Data Sovereignty: Full OCAP controls enabled
- Elder Review: Sacred content auto-route
- AI Consent: Theme extraction only

**Test Focus:** Privacy settings and data sovereignty

---

### Profile 3: Sarah (Tech-Savvy Storyteller)
**Demographics:**
- Age: 24
- Role: Youth Storyteller
- Cultural Background: Māori

**Configuration:**
- Privacy: Public visibility
- AI Consent: All features enabled
- Elder Review: Manual request only
- Sacred Knowledge: Moderate protection

**Test Focus:** AI consent granularity and network discovery

---

### Profile 4: David (Minimalist)
**Demographics:**
- Age: 45
- Role: Traditional Storyteller
- Cultural Background: Yolŋu

**Configuration:**
- Privacy: Default settings
- AI Consent: All disabled
- Elder Review: Disabled
- Sacred Knowledge: None

**Test Focus:** Default behavior and minimal configuration

---

### Profile 5: Kim (Collaborative)
**Demographics:**
- Age: 38
- Role: Cultural Program Manager
- Cultural Background: Cree

**Configuration:**
- Privacy: Community visibility
- AI Consent: Theme extraction + Impact analytics
- Elder Review: Always enabled
- Cultural Protocols: Extensive clan-specific notes

**Test Focus:** Elder review workflows and cultural protocols

---

## Database Validation Queries

### Check Privacy Settings
```sql
SELECT
  id,
  default_story_visibility,
  contact_permissions,
  data_sovereignty_preferences,
  updated_at
FROM profiles
WHERE id IN (test_profile_ids);
```

### Check ALMA Settings
```sql
SELECT
  id,
  consent_preferences,
  cultural_permissions,
  updated_at
FROM profiles
WHERE id IN (test_profile_ids);
```

### Check Audit Logs
```sql
SELECT
  user_id,
  action,
  resource_type,
  details,
  created_at
FROM audit_logs
WHERE user_id IN (test_profile_ids)
ORDER BY created_at DESC;
```

### Check Consent Changes
```sql
SELECT
  user_id,
  consent_type,
  consent_value,
  changed_at
FROM consent_change_log
WHERE user_id IN (test_profile_ids)
ORDER BY changed_at DESC;
```

---

## API Endpoint Testing

### Privacy Settings API
```bash
# Test save privacy settings
curl -X PUT http://localhost:3000/api/user/privacy-settings \
  -H "Content-Type: application/json" \
  -d '{
    "storytellerId": "test-id",
    "settings": {
      "visibility": "community",
      "contactPermissions": ["verified_users"],
      "dataSovereignty": true
    },
    "timestamp": "2026-01-03T09:00:00Z"
  }'
```

### ALMA Settings API
```bash
# Test save ALMA settings
curl -X PUT http://localhost:3000/api/user/alma-settings \
  -H "Content-Type: application/json" \
  -d '{
    "storytellerId": "test-id",
    "settings": {
      "aiConsent": {
        "themeExtraction": true,
        "networkDiscovery": false,
        "impactAnalytics": true,
        "voiceAnalysis": false
      },
      "sacredKnowledge": {
        "protectionEnabled": true,
        "defaultProtection": "moderate",
        "autoDetect": false
      },
      "elderReview": {
        "autoRouteToElders": true,
        "reviewTrigger": "sacred-only",
        "notificationFrequency": "daily"
      },
      "culturalSafety": {
        "enableContentWarnings": true,
        "enableCulturalProtocols": true,
        "protocolNotes": "Gender-specific protocols apply",
        "notifyOnSensitiveContent": true
      }
    },
    "timestamp": "2026-01-03T09:00:00Z"
  }'
```

---

## Performance Benchmarks

| Component | Load Time Target | Actual | Status |
|-----------|-----------------|--------|--------|
| Profile Page | < 2s | TBD | ⏳ |
| Privacy Settings Panel | < 1s | TBD | ⏳ |
| ALMA Settings Panel | < 1s | TBD | ⏳ |
| Settings Save (API) | < 200ms | TBD | ⏳ |
| Data Export | < 5s | TBD | ⏳ |

---

## Cultural Safety Validation

### OCAP Principles Checklist
- [ ] **Ownership:** "You own your data" messaging clear
- [ ] **Control:** All settings user-controlled
- [ ] **Access:** Stories accessible regardless of settings
- [ ] **Possession:** Data export and deletion functional

### Sacred Knowledge Protection
- [ ] Strict mode prevents ALL AI analysis
- [ ] Sacred flag overrides consent settings
- [ ] Elder review enforced when required
- [ ] Clear guidance: "When in doubt, protect it"

### Elder Authority
- [ ] Elder review clearly advisory, not mandatory
- [ ] Storyteller has final authority
- [ ] Cultural guidance respected
- [ ] Review timeline transparent (2-7 days)

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Local development environment running
- [ ] Database seeded with test profiles
- [ ] Browser dev tools configured
- [ ] Screen reader software ready (if testing accessibility)

### Test Execution
- [ ] Scenario 1: New Storyteller Profile Setup
- [ ] Scenario 2: Sacred Knowledge Protection
- [ ] Scenario 3: Elder Review Configuration
- [ ] Scenario 4: Privacy Settings & Data Export
- [ ] Scenario 5: Account Deletion Workflow
- [ ] Scenario 6: AI Consent Granularity
- [ ] Scenario 7: Cultural Protocol Notes
- [ ] Scenario 8: Accessibility Testing
- [ ] Scenario 9: Cross-Tab Integration
- [ ] Scenario 10: Tablet Responsiveness

### Post-Test Validation
- [ ] All database queries return expected data
- [ ] Audit logs complete and accurate
- [ ] No console errors during testing
- [ ] Performance benchmarks met
- [ ] Cultural safety validation passed

---

## Bug Tracking Template

```markdown
### Bug #[NUMBER]: [Title]

**Severity:** Critical / High / Medium / Low
**Component:** [Component name]
**Scenario:** [Test scenario]

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Impact:**
- [ ] Blocks Sprint 1 completion
- [ ] Cultural safety concern
- [ ] Accessibility issue
- [ ] Can be deferred to Sprint 2
```

---

## Success Criteria

Sprint 1 integration testing is considered successful when:

1. ✅ All 10 test scenarios pass
2. ✅ All 5 sample profiles work correctly
3. ✅ Database validation queries return expected data
4. ✅ API endpoints return correct responses
5. ✅ Performance benchmarks met
6. ✅ Cultural safety validation complete
7. ✅ Zero critical or high-severity bugs
8. ✅ Accessibility compliance verified

---

## Test Sign-Off

**Tested By:** [Name]
**Test Date:** [Date]
**Test Duration:** [Duration]

**Results:**
- Scenarios Passed: __/10
- Bugs Found: __
- Critical Bugs: __
- Performance: Pass/Fail
- Cultural Safety: Pass/Fail
- Accessibility: Pass/Fail

**Overall Status:** PASS / FAIL / CONDITIONAL PASS

**Approved for Staging:** YES / NO

**Approver:** [Name]
**Date:** [Date]
