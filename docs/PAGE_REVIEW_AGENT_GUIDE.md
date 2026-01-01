# Page Review Agent - Complete Audit System

**Date**: January 2, 2026
**Purpose**: Automated auditing of all Empathy Ledger pages
**Focus**: Profiles, Dashboards, Images, Privacy Settings, ALMA Controls

---

## 🎯 What It Audits

### 1. Profile Pages
**Checks:**
- ✅ Profile image loads correctly
- ✅ All required fields present (name, cultural background, bio, story count)
- ✅ Images optimized (WebP/AVIF, lazy loading)
- ✅ Alt text on all images (accessibility)
- ✅ Privacy indicator visible
- ✅ Cultural protocols badge showing
- ✅ Contact/connect button functional

**Critical Issues Detected:**
- 🔴 Profile photo missing or broken
- 🔴 Display name missing
- 🟠 Cultural background not shown
- 🟠 Missing alt text (accessibility)

### 2. Storyteller Dashboard
**Checks:**
- ✅ My Stories list visible
- ✅ Create Story button present
- ✅ Edit Story functionality available
- ✅ Privacy Settings panel accessible
- ✅ ALMA Settings panel accessible
- ✅ Delete story with confirmation
- ✅ Publish/Unpublish toggle
- ✅ Privacy level selector (Public/Private/Community)
- ✅ Elder review flag

**Critical Issues Detected:**
- 🔴 Cannot edit stories
- 🔴 Privacy settings not accessible
- 🔴 ALMA settings missing
- 🟠 Story management features incomplete

### 3. Privacy & ALMA Controls
**Checks:**
- ✅ Who can view selector
- ✅ Allow comments toggle
- ✅ Allow sharing toggle
- ✅ Allow AI analysis toggle
- ✅ Require Elder approval toggle
- ✅ Public/private toggle
- ✅ Cultural protocol preferences
- ✅ Sacred knowledge protection
- ✅ Auto trigger warning setting
- ✅ Consent tracking visible

### 4. Images & Performance
**Checks:**
- ✅ All images load successfully
- ✅ Lazy loading enabled
- ✅ Optimized formats (WebP/AVIF preferred)
- ✅ Appropriate dimensions
- ✅ File size under limits (profiles: 2MB, stories: 5MB)
- ✅ Placeholders for missing images

### 5. Accessibility (WCAG 2.1 AA)
**Checks:**
- ✅ H1 heading present
- ✅ Skip to main content link
- ✅ Form inputs have labels
- ✅ Images have alt text
- ✅ Buttons have accessible text
- ✅ Color contrast sufficient
- ✅ Keyboard navigation works

### 6. Mobile Responsiveness
**Checks:**
- ✅ No horizontal scroll on mobile (375px)
- ✅ Text readable (min 12px on mobile)
- ✅ Touch targets large enough (44x44px)
- ✅ Images scale properly
- ✅ Navigation accessible on small screens

---

## 🚀 How to Run

### Option 1: Playwright Automated Audit (Recommended)

**Install Playwright:**
```bash
cd /Users/benknight/Code/empathy-ledger-v2
npm install -D playwright
npx playwright install chromium
```

**Run Full Audit:**
```bash
# Audit all pages with screenshots
npx tsx scripts/audit-all-pages-playwright.ts

# Output:
# - Console report (critical issues highlighted)
# - JSON report: /tmp/empathy-ledger-audit-report.json
# - Screenshots: /tmp/empathy-ledger-audit-screenshots/
```

**What It Does:**
1. Fetches sample storytellers from database
2. Visits each profile page
3. Checks all required elements
4. Audits storyteller dashboard
5. Tests accessibility
6. Tests mobile responsiveness
7. Captures screenshots
8. Generates comprehensive report

### Option 2: Farmhand API Endpoint

**Deploy PageReviewAgent to Farmhand API:**

Add to `/Users/benknight/act-global-infrastructure/act-personal-ai/api/main.py`:

```python
from agents.page_review_agent import PageReviewAgent

page_agent = PageReviewAgent(base_url='https://empathy-ledger.vercel.app')

@app.post("/page/audit-profile", tags=["Page Review"])
async def audit_profile(storyteller_id: str, page_html: str):
    """Audit a profile page for completeness"""
    result = await page_agent.audit_profile_page(storyteller_id, page_html)
    return result

@app.post("/page/audit-dashboard", tags=["Page Review"])
async def audit_dashboard(dashboard_html: str):
    """Audit storyteller dashboard"""
    result = await page_agent.audit_storyteller_dashboard(dashboard_html)
    return result
```

---

## 📊 Sample Report

### Console Output

```
🔍 Empathy Ledger - Comprehensive Page Audit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Auditing Profile Pages...
    ✅ Linda Turner: Score 100%
    ✅ Uncle Robert: Score 95%
    ⚠️  Anonymous: Score 60% (missing image)
    ✅ Aunt Bev: Score 100%
    ✅ Shaun Full: Score 90%

2️⃣  Auditing Storyteller Dashboard...
    ✅ Dashboard: Score 85%

3️⃣  Running Accessibility Audits...
  ♿ Checking h1 headings...
  ♿ Checking form labels...
  ♿ Checking image alt text...

4️⃣  Testing Mobile Responsiveness...
  📱 Testing mobile (375px)...
  📱 Testing tablet (768px)...
  📱 Testing desktop (1920px)...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Pages Audited: 6
Average Score: 88.3%

Issues Found:
  🔴 Critical: 2
  🟠 High:     5
  🟡 Medium:   8
  🟢 Low:      3

🚨 CRITICAL ISSUES:

PROFILE (http://localhost:3000/profile/abc-123):
  • Profile photo failed to load
    → Check image URL: /uploads/missing.jpg

DASHBOARD (http://localhost:3000/dashboard):
  • ALMA settings panel not accessible
    → Implement ALMA settings in storyteller dashboard

📄 Full report saved: /tmp/empathy-ledger-audit-report.json
📸 Screenshots saved: /tmp/empathy-ledger-audit-screenshots/

✅ Audit complete!
```

### JSON Report Structure

```json
{
  "summary": {
    "total_pages": 6,
    "average_score": 0.883,
    "critical_issues": 2,
    "high_issues": 5,
    "medium_issues": 8,
    "low_issues": 3
  },
  "results": [
    {
      "page_type": "profile",
      "url": "http://localhost:3000/profile/abc-123",
      "timestamp": "2026-01-02T07:00:00Z",
      "score": 0.6,
      "issues": [
        {
          "severity": "critical",
          "category": "Image Loading",
          "description": "Profile photo failed to load",
          "recommendation": "Check image URL and network connectivity"
        },
        {
          "severity": "high",
          "category": "Accessibility",
          "description": "Image missing alt text",
          "recommendation": "Add descriptive alt text for screen readers"
        }
      ],
      "elements_found": ["display_name", "cultural_background", "bio_summary"],
      "elements_missing": ["profile_image", "story_count", "privacy_indicator"],
      "images": [
        {
          "src": "/uploads/profile.jpg",
          "alt": null,
          "loaded": false,
          "dimensions": { "width": 0, "height": 0 },
          "lazy": false
        }
      ],
      "screenshot": "/tmp/empathy-ledger-audit-screenshots/profile-abc-123.png"
    }
  ]
}
```

---

## 🎯 Audit Checklist

### Profile Page Completeness

- [ ] **Profile Image**
  - [ ] Loads successfully
  - [ ] Optimized format (WebP/AVIF)
  - [ ] Lazy loading enabled
  - [ ] Alt text present
  - [ ] Fallback placeholder if missing

- [ ] **Required Information**
  - [ ] Display name visible
  - [ ] Cultural background shown
  - [ ] Bio/summary present
  - [ ] Story count displayed
  - [ ] Connection to Country shown
  - [ ] Cultural protocols badge visible

- [ ] **Privacy & Safety**
  - [ ] Privacy indicator shown
  - [ ] Contact method available
  - [ ] Share profile button works
  - [ ] Cultural sensitivity indicator

### Storyteller Dashboard Functionality

- [ ] **Story Management**
  - [ ] My Stories list displays
  - [ ] Create Story button present
  - [ ] Edit Story button functional
  - [ ] Delete Story with confirmation
  - [ ] Publish/Unpublish toggle works
  - [ ] Privacy level selector accessible

- [ ] **Privacy Controls**
  - [ ] Who can view selector
  - [ ] Allow comments toggle
  - [ ] Allow sharing toggle
  - [ ] Allow AI analysis toggle
  - [ ] Require Elder approval setting
  - [ ] Public/private toggle

- [ ] **ALMA Settings**
  - [ ] Cultural protocol preferences
  - [ ] Sacred knowledge protection
  - [ ] Auto trigger warning toggle
  - [ ] Elder review workflow
  - [ ] Consent tracking visible
  - [ ] Data sovereignty controls

- [ ] **Profile Management**
  - [ ] Edit profile link accessible
  - [ ] Upload profile image
  - [ ] Update cultural background
  - [ ] Change display name
  - [ ] Update bio

### Accessibility Compliance

- [ ] **Keyboard Navigation**
  - [ ] Skip to main content link
  - [ ] All interactive elements focusable
  - [ ] Focus indicators visible
  - [ ] Logical tab order

- [ ] **Screen Readers**
  - [ ] H1 heading present
  - [ ] All images have alt text
  - [ ] Form inputs have labels
  - [ ] ARIA labels on complex widgets
  - [ ] Buttons have accessible text

- [ ] **Visual**
  - [ ] Color contrast sufficient (4.5:1)
  - [ ] Text resizable to 200%
  - [ ] No information conveyed by color alone

### Mobile Responsiveness

- [ ] **Layout**
  - [ ] No horizontal scroll on mobile
  - [ ] Content fits viewport (375px, 768px, 1920px)
  - [ ] Images scale appropriately
  - [ ] Navigation accessible

- [ ] **Typography**
  - [ ] Text min 12px on mobile
  - [ ] Line height appropriate
  - [ ] Readable font family

- [ ] **Touch Targets**
  - [ ] Buttons min 44x44px
  - [ ] Links adequately spaced
  - [ ] Form inputs large enough

---

## 🛠️ Common Issues & Fixes

### Issue: Profile Image Not Loading

**Symptoms:**
- Broken image icon
- Alt text showing but no image
- `elements_missing: ['profile_image']`

**Causes:**
- Incorrect image URL
- Image file deleted
- CORS issue
- Missing Supabase storage permission

**Fix:**
```typescript
// 1. Check if image URL is valid
const profile = await supabase
  .from('profiles')
  .select('profile_image_url')
  .eq('id', storyteller_id)
  .single()

console.log('Image URL:', profile.data?.profile_image_url)

// 2. Verify Supabase storage
const { data, error } = await supabase.storage
  .from('profiles')
  .list(storyteller_id)

// 3. Add fallback
<img
  src={profileImageUrl || '/images/default-avatar.png'}
  alt={`${storytellerName} profile`}
  loading="lazy"
/>
```

### Issue: Privacy Settings Not Accessible

**Symptoms:**
- `elements_missing: ['privacy_settings']`
- Dashboard score < 70%
- Critical issue in report

**Fix:**
```typescript
// Add privacy settings panel to dashboard
<Card>
  <CardHeader>
    <CardTitle>Privacy Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <PrivacySettingsForm storytellerId={id} />
  </CardContent>
</Card>
```

### Issue: ALMA Settings Missing

**Symptoms:**
- `elements_missing: ['alma_settings']`
- Critical issue

**Fix:**
```typescript
// Add ALMA settings panel
<Card>
  <CardHeader>
    <CardTitle>Cultural Protocols (ALMA)</CardTitle>
  </CardHeader>
  <CardContent>
    <ALMASettingsForm storytellerId={id} />
  </CardContent>
</Card>
```

### Issue: Missing Alt Text

**Symptoms:**
- High severity accessibility issues
- `images_have_alt: false`

**Fix:**
```typescript
// Add alt text to all images
<img
  src={imageSrc}
  alt={`${storytellerName} - ${imageDescription}`}
  loading="lazy"
/>
```

---

## 📈 Success Criteria

### Excellent Score (90-100%)
- ✅ All required elements present
- ✅ All images loading with alt text
- ✅ Privacy and ALMA settings accessible
- ✅ Accessibility compliant
- ✅ Mobile responsive
- ✅ < 5 medium issues, 0 critical/high

### Good Score (70-89%)
- ✅ Most required elements present
- ⚠️  Minor image issues
- ✅ Key functionality working
- ⚠️  Some accessibility improvements needed
- ✅ < 10 medium issues, 0 critical

### Needs Improvement (< 70%)
- ❌ Missing critical elements
- ❌ Images not loading
- ❌ Privacy/ALMA settings missing
- ❌ Accessibility issues
- ❌ Mobile usability problems

---

## 🎬 Next Steps

### After Running Audit

1. **Review Critical Issues** - Fix immediately
   - Profile images not loading
   - Privacy settings inaccessible
   - ALMA settings missing

2. **Fix High Priority Issues** - Within 1 week
   - Missing required elements
   - Accessibility violations
   - Story management incomplete

3. **Address Medium Issues** - Within 2 weeks
   - Image optimization
   - Mobile responsiveness tweaks
   - Performance improvements

4. **Continuous Monitoring**
   - Run audit weekly
   - Track score trends
   - Monitor new pages

### Integration with CI/CD

```yaml
# .github/workflows/audit-pages.yml
name: Page Audit

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm install && npx playwright install chromium
      - name: Run audit
        run: npx tsx scripts/audit-all-pages-playwright.ts
      - name: Check critical issues
        run: |
          CRITICAL=$(jq '.summary.critical_issues' /tmp/empathy-ledger-audit-report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ $CRITICAL critical issues found"
            exit 1
          fi
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: audit-screenshots
          path: /tmp/empathy-ledger-audit-screenshots/
```

---

## 📞 Support

**Files:**
- Page Review Agent: `/Users/benknight/act-global-infrastructure/act-personal-ai/agents/page_review_agent.py`
- Playwright Script: `/Users/benknight/Code/empathy-ledger-v2/scripts/audit-all-pages-playwright.ts`
- This Guide: `/Users/benknight/Code/empathy-ledger-v2/docs/PAGE_REVIEW_AGENT_GUIDE.md`

**Run Audit:**
```bash
cd /Users/benknight/Code/empathy-ledger-v2
npx tsx scripts/audit-all-pages-playwright.ts
```

**View Results:**
- Console: Real-time output
- JSON: `/tmp/empathy-ledger-audit-report.json`
- Screenshots: `/tmp/empathy-ledger-audit-screenshots/`

---

✅ **Ready to audit all pages and ensure everything works perfectly for storytellers!**
