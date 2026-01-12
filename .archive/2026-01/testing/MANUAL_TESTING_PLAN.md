# Manual Testing Plan - Empathy Ledger v2

**Comprehensive page-by-page testing checklist**

---

## 🎯 Testing Overview

**Purpose:** Verify all components and features work correctly before production launch

**Approach:** Test one page at a time, checking all interactive elements and data flows

**Prerequisites:**
- Local dev server running (`npm run dev`)
- Demo data seeded (`npx tsx scripts/seed-uat-demo-data.ts`)
- Test user accounts created in Supabase Auth

---

## 📋 Testing Session Setup

### Before Each Testing Session

```bash
# 1. Start dev server
npm run dev

# 2. Open in browser
# http://localhost:3000

# 3. Have these ready:
# - Browser DevTools (Console tab for errors)
# - Screen reader (optional - for accessibility testing)
# - Mobile device or responsive mode
```

### Testing Checklist Key

- ✅ **Pass** - Feature works as expected
- ⚠️ **Warning** - Works but has minor issues
- ❌ **Fail** - Broken or not working
- ⏭️ **Skip** - Not applicable or dependencies missing

---

## 🏠 PUBLIC PAGES (Unauthenticated)

### 1. Homepage / Landing Page
**URL:** [http://localhost:3000](http://localhost:3000)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Header** | Logo displays, navigation links work | [ ] |
| **Hero Section** | Main heading, call-to-action buttons | [ ] |
| **Story Preview** | Stories load, cards display correctly | [ ] |
| **Footer** | Links work, social icons display | [ ] |
| **Responsive** | Test on mobile view (360px width) | [ ] |
| **Performance** | Page loads < 3 seconds | [ ] |

**Critical Flows:**
1. Click "Sign Up" → Should navigate to signup page
2. Click "View Stories" → Should show public stories
3. Scroll down → Lazy loading should work

**Screenshot:** Take if any visual issues

---

### 2. Public Stories List
**URL:** [http://localhost:3000/stories](http://localhost:3000/stories)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Story Cards** | All 5 demo stories display | [ ] |
| **Thumbnails** | Images load or show fallback | [ ] |
| **Metadata** | Storyteller name, date, themes visible | [ ] |
| **Filters** | Theme filter works (if present) | [ ] |
| **Search** | Search box filters stories | [ ] |
| **Pagination** | "Load More" or pagination works | [ ] |
| **Empty State** | Shows message if no results | [ ] |

**Critical Flows:**
1. Click a story card → Should open story detail page
2. Filter by theme → Should update results
3. Search for "teachings" → Should show relevant stories

**Notes:**
- Check console for any 404s or API errors
- Verify RLS policies allow public story access

---

### 3. Story Detail Page (Public)
**URL:** [http://localhost:3000/stories/[id]](http://localhost:3000/stories)
*(Click any story from list to get ID)*

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Story Content** | Title, story arc display | [ ] |
| **Storyteller Info** | Name, avatar, bio visible | [ ] |
| **Cultural Themes** | Theme badges display | [ ] |
| **Media Gallery** | Photos/videos show (if any) | [ ] |
| **Consent Badge** | "Consent Given" badge shows | [ ] |
| **Protocol Info** | Cultural protocols display | [ ] |
| **Share Button** | Share dialog opens | [ ] |
| **Back Button** | Returns to stories list | [ ] |

**Critical Flows:**
1. Read full story arc → Should be readable
2. Click storyteller name → Should go to storyteller profile
3. Click theme badge → Should filter by theme
4. Click share → Should show share options

**Accessibility:**
- Tab through page → Focus visible on all interactive elements
- Screen reader → Headings announced correctly

---

## 🔐 AUTHENTICATION PAGES

### 4. Sign Up Page
**URL:** [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Form Fields** | Email, password, name inputs work | [ ] |
| **Validation** | Shows errors for invalid email | [ ] |
| **Password Strength** | Indicator shows strength | [ ] |
| **Submit Button** | Disabled until form valid | [ ] |
| **Loading State** | Shows spinner during submission | [ ] |
| **Success** | Redirects to onboarding or dashboard | [ ] |
| **Error Handling** | Shows error if email exists | [ ] |
| **Sign In Link** | "Already have account?" works | [ ] |

**Critical Flows:**
1. Enter invalid email → Should show error
2. Enter weak password → Should show strength warning
3. Submit valid form → Should create account
4. Try duplicate email → Should show "Email already exists"

**Test Data:**
```
Email: test-signup-{timestamp}@demo.test
Password: TestPassword123!
Name: Test User
```

---

### 5. Sign In Page
**URL:** [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Form Fields** | Email and password inputs | [ ] |
| **Remember Me** | Checkbox works (optional) | [ ] |
| **Submit** | Authenticates and redirects | [ ] |
| **Error Messages** | Shows "Invalid credentials" | [ ] |
| **Forgot Password** | Link works | [ ] |
| **Loading State** | Shows during authentication | [ ] |
| **Redirect** | Goes to intended page after login | [ ] |

**Critical Flows:**
1. Enter wrong password → Should show error
2. Enter correct credentials → Should login
3. Check "Remember me" → Should persist session

**Test Credentials:**
```
Email: elder.grace.thompson@demo.test
Password: [Set in Supabase Auth]
```

---

## 👤 STORYTELLER PROFILE PAGES (Sprint 1)

### 6. Storyteller Dashboard
**URL:** [http://localhost:3000/storytellers/[id]/dashboard](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Welcome Banner** | Greeting with storyteller name | [ ] |
| **Stats Cards** | Stories count, drafts, views | [ ] |
| **Recent Stories** | Last 3 stories display | [ ] |
| **Quick Actions** | "New Story", "View Profile" buttons | [ ] |
| **Activity Feed** | Recent activity items | [ ] |
| **Privacy Status** | Privacy level indicator | [ ] |

**Critical Flows:**
1. Click "New Story" → Should go to story creation
2. Click "View Profile" → Should show public profile
3. Click a recent story → Should open story editor

---

### 7. Profile Display Page
**URL:** [http://localhost:3000/storytellers/[id]/profile](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Avatar** | Profile photo or fallback initials | [ ] |
| **Display Name** | Name shows correctly | [ ] |
| **Bio** | Biography text displays | [ ] |
| **Cultural Background** | Shows cultural affiliations | [ ] |
| **Privacy Badge** | Privacy level visible | [ ] |
| **Protocols Badge** | Cultural protocols listed | [ ] |
| **Preferred Language** | Language displayed | [ ] |
| **Edit Button** | Shows for own profile only | [ ] |
| **Stories Tab** | All storyteller's stories | [ ] |

**Critical Flows:**
1. View as owner → Should see "Edit Profile" button
2. View as guest → Should NOT see edit button
3. Click "Edit Profile" → Should go to edit page
4. Click Stories tab → Should show all stories

**Components to Test:**
- PrivacyBadge component
- ProtocolsBadge component
- CulturalAffiliations component

---

### 8. Profile Edit Page
**URL:** [http://localhost:3000/storytellers/[id]/edit](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Avatar Upload** | Click to upload, drag-drop works | [ ] |
| **Display Name** | Edit and save | [ ] |
| **Bio Textarea** | Multi-line editing | [ ] |
| **Cultural Background** | Add/remove affiliations | [ ] |
| **Preferred Language** | Dropdown selection | [ ] |
| **Contact Info** | Email, phone (optional) | [ ] |
| **Save Button** | Saves changes and shows success | [ ] |
| **Cancel Button** | Discards changes | [ ] |
| **Validation** | Required fields enforced | [ ] |
| **Unsaved Changes** | Warning if navigating away | [ ] |

**Critical Flows:**
1. Upload avatar → Should preview and save
2. Edit bio → Should save changes
3. Add cultural affiliation → Should appear in list
4. Save → Should update and redirect to profile
5. Cancel → Should discard changes

---

### 9. Privacy Settings Panel
**URL:** [http://localhost:3000/storytellers/[id]/settings/privacy](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Privacy Level** | Radio buttons: Public, Community, Private | [ ] |
| **Profile Visibility** | Toggles for avatar, bio, contact | [ ] |
| **Story Visibility** | Default privacy for new stories | [ ] |
| **Data Sharing** | Consent checkboxes | [ ] |
| **Download Data** | "Download My Data" button | [ ] |
| **Delete Account** | Warning dialog shows | [ ] |
| **Save Changes** | Updates settings | [ ] |

**Components to Test (6 components):**
- PrivacyLevelSelector
- ProfileVisibilityToggles
- StoryPrivacyDefaults
- DataSharingConsent
- DownloadMyDataButton
- DeleteAccountSection

**Critical Flows:**
1. Change privacy level to "Private" → Save → Verify profile hidden from public
2. Toggle off "Show avatar" → Save → Verify avatar hidden on public profile
3. Click "Download My Data" → Should trigger download (GDPR compliance)
4. Click "Delete Account" → Should show confirmation warning

---

### 10. ALMA Settings Panel
**URL:** [http://localhost:3000/storytellers/[id]/settings/alma](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Learning Preferences** | Checkboxes for learning areas | [ ] |
| **Accountability Settings** | Who can see your progress | [ ] |
| **Notification Preferences** | Email, in-app toggles | [ ] |
| **Cultural Protocols** | Add/edit protocols | [ ] |
| **Elder Review** | Request elder review toggle | [ ] |
| **Save Changes** | Updates ALMA settings | [ ] |

**Components to Test (5 components):**
- LearningPreferences
- AccountabilitySettings
- NotificationPreferences
- CulturalProtocolsManager
- ElderReviewRequests

**Critical Flows:**
1. Select learning areas → Save → Should persist
2. Enable elder review → Should appear in profile
3. Add cultural protocol → Should display on stories

---

## 📝 STORY CREATION & MANAGEMENT (Sprint 2)

### 11. Quick Story Creation
**URL:** [http://localhost:3000/stories/new](http://localhost:3000/stories/new)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **3-Step Wizard** | Steps: Basics → Details → Review | [ ] |
| **Step 1: Basics** | Title, short summary inputs | [ ] |
| **Step 2: Details** | Full story arc textarea | [ ] |
| **Cultural Themes** | Multi-select theme picker | [ ] |
| **Language** | Language dropdown | [ ] |
| **Step 3: Review** | Preview of all entered data | [ ] |
| **Save as Draft** | Creates draft story | [ ] |
| **Submit** | Creates published story | [ ] |
| **Progress Bar** | Shows current step | [ ] |
| **Back Button** | Returns to previous step | [ ] |

**Critical Flows:**
1. Fill step 1 → Click Next → Should go to step 2
2. Select themes → Should show in review
3. Save as Draft → Should create with "draft" status
4. Submit for Review → Should create with "pending" status

---

### 12. Story Editor (Full)
**URL:** [http://localhost:3000/stories/[id]/edit](http://localhost:3000/stories)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Rich Text Editor** | Bold, italic, lists work | [ ] |
| **Auto-Save** | Drafts save every 30 seconds | [ ] |
| **Version History** | Previous versions accessible | [ ] |
| **Media Attachments** | Upload photos/videos | [ ] |
| **Theme Suggestions** | AI suggests themes (if enabled) | [ ] |
| **Cultural Protocols** | Add protocol requirements | [ ] |
| **Consent Section** | Consent checkbox and signature | [ ] |
| **Publish Settings** | Public, community, private options | [ ] |
| **Save Draft** | Saves without publishing | [ ] |
| **Publish** | Publishes story | [ ] |

**Critical Flows:**
1. Type text → Wait 30s → Should see "Saved" indicator
2. Upload image → Should appear in gallery
3. Add cultural protocol → Should appear in preview
4. Publish → Should change status to "published"

---

### 13. Story Drafts List
**URL:** [http://localhost:3000/storytellers/[id]/drafts](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Draft Cards** | All drafts display | [ ] |
| **Last Edited** | Shows relative time | [ ] |
| **Continue Editing** | Opens draft in editor | [ ] |
| **Delete Draft** | Removes draft with confirmation | [ ] |
| **Empty State** | Shows message if no drafts | [ ] |

**Critical Flows:**
1. Click draft → Should open in editor
2. Delete draft → Confirm → Should remove from list

---

## 🎨 MEDIA & GALLERY (Sprint 3)

### 14. Media Upload Page
**URL:** [http://localhost:3000/media/upload](http://localhost:3000/media/upload)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Drag & Drop Zone** | Drag files to upload | [ ] |
| **File Browser** | Click to select files | [ ] |
| **Multiple Files** | Upload multiple at once | [ ] |
| **File Preview** | Thumbnails show before upload | [ ] |
| **Progress Bars** | Upload progress per file | [ ] |
| **File Type Validation** | Rejects invalid types | [ ] |
| **Size Validation** | Rejects files > 10MB | [ ] |
| **AI Captioning** | Generates captions (if enabled) | [ ] |
| **Manual Caption** | Edit AI-generated captions | [ ] |
| **Cultural Tags** | Tag with cultural significance | [ ] |
| **Upload** | Completes successfully | [ ] |

**Critical Flows:**
1. Drag image file → Should show preview
2. Upload large file (>10MB) → Should show error
3. Upload PDF → Should reject (images only)
4. Upload multiple → All should process
5. Generate caption → Should use AI vision

**Files to Test:**
- Small image (< 1MB)
- Large image (5-10MB)
- Invalid format (PDF, TXT)

---

### 15. Smart Gallery View
**URL:** [http://localhost:3000/storytellers/[id]/gallery](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Grid View** | Photos display in responsive grid | [ ] |
| **Lightbox** | Click photo → Opens fullscreen | [ ] |
| **Navigation** | Arrow keys navigate in lightbox | [ ] |
| **Zoom** | Pinch or +/- to zoom | [ ] |
| **Captions** | AI captions display | [ ] |
| **Metadata** | Date, location, cultural tags | [ ] |
| **Download** | Download original file | [ ] |
| **Share** | Share photo dialog | [ ] |
| **Delete** | Remove photo with confirmation | [ ] |
| **Filter** | Filter by cultural tags | [ ] |
| **Sort** | Sort by date, name, cultural significance | [ ] |
| **Search** | Search captions and tags | [ ] |

**Critical Flows:**
1. Click photo → Lightbox opens
2. Press right arrow → Next photo
3. Press ESC → Close lightbox
4. Filter by tag → Grid updates
5. Download photo → File downloads

**Performance:**
- Grid should lazy-load images
- Lightbox should load quickly
- Navigation should be smooth

---

## ✅ CONSENT & PROTOCOLS (Sprint 4)

### 16. Consent Workflow
**URL:** [http://localhost:3000/stories/[id]/consent](http://localhost:3000/stories)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Consent Form** | All consent options listed | [ ] |
| **Checkboxes** | Individual permissions | [ ] |
| **Purpose Statement** | Why consent is needed | [ ] |
| **Signature Pad** | Digital signature works | [ ] |
| **Date Stamp** | Auto-fills current date | [ ] |
| **Download PDF** | Consent form downloadable | [ ] |
| **Revoke Option** | Can revoke consent | [ ] |
| **Submit** | Saves consent record | [ ] |

**Consent Options to Test:**
- [ ] Share publicly
- [ ] Share within organization
- [ ] Allow AI analysis
- [ ] Allow in research
- [ ] Allow in presentations

**Critical Flows:**
1. Check permissions → Sign → Submit → Should save
2. Download PDF → Should generate consent form
3. Revoke consent → Should update status

---

### 17. Cultural Protocols Manager
**URL:** [http://localhost:3000/storytellers/[id]/protocols](http://localhost:3000/storytellers)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Protocol List** | All protocols display | [ ] |
| **Add Protocol** | Create new protocol | [ ] |
| **Protocol Types** | Gender-specific, seasonal, sacred | [ ] |
| **Requirements** | Elder approval, permissions | [ ] |
| **Edit** | Modify existing protocol | [ ] |
| **Delete** | Remove protocol (if unused) | [ ] |
| **Apply to Stories** | Link to specific stories | [ ] |

**Critical Flows:**
1. Add protocol "Elder approval required" → Save
2. Edit protocol → Update description
3. Apply to story → Protocol shows on story

---

### 18. Elder Review Queue
**URL:** [http://localhost:3000/organizations/[id]/elder-review](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Pending Items** | Stories awaiting review | [ ] |
| **Story Preview** | Click to view full story | [ ] |
| **Cultural Notes** | Reviewer can add notes | [ ] |
| **Approve Button** | Approves story | [ ] |
| **Request Changes** | Sends back to storyteller | [ ] |
| **Reject** | Rejects with reason | [ ] |
| **Notifications** | Storyteller notified of decision | [ ] |

**Critical Flows:**
1. View pending story → Read content
2. Add cultural note → Save
3. Approve → Story status updates
4. Request changes → Storyteller receives notification

---

## 🏢 ORGANIZATION PAGES (Sprint 5)

### 19. Organization Dashboard
**URL:** [http://localhost:3000/organizations/[id]/dashboard](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Org Overview** | Name, logo, description | [ ] |
| **Stats Cards** | Members, stories, projects counts | [ ] |
| **Recent Activity** | Latest stories and updates | [ ] |
| **Quick Actions** | Add member, create project | [ ] |
| **Announcements** | Org announcements display | [ ] |
| **Navigation Tabs** | Members, Projects, Settings | [ ] |

**Critical Flows:**
1. Click "Add Member" → Member invitation form
2. Click "New Project" → Project creation
3. Click Members tab → Member list

---

### 20. Organization Members
**URL:** [http://localhost:3000/organizations/[id]/members](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Member List** | All members display | [ ] |
| **Member Cards** | Avatar, name, role | [ ] |
| **Role Badges** | Admin, Editor, Viewer | [ ] |
| **Invite Member** | Email invitation form | [ ] |
| **Change Role** | Update member permissions | [ ] |
| **Remove Member** | Remove with confirmation | [ ] |
| **Search** | Filter members by name | [ ] |
| **Sort** | Sort by name, role, join date | [ ] |

**Critical Flows:**
1. Invite new member → Email sent
2. Change member role → Permissions update
3. Remove member → Removed from org

---

### 21. Organization Settings
**URL:** [http://localhost:3000/organizations/[id]/settings](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Basic Info** | Name, description, logo | [ ] |
| **Contact Info** | Email, phone, website | [ ] |
| **Cultural Protocols** | Default org protocols | [ ] |
| **Privacy Settings** | Org visibility settings | [ ] |
| **Branding** | Logo upload, color scheme | [ ] |
| **Delete Org** | Warning and confirmation | [ ] |
| **Save Changes** | Updates settings | [ ] |

**Critical Flows:**
1. Upload logo → Should preview and save
2. Edit description → Should update
3. Add default protocol → Should apply to new stories

---

## 📊 ANALYTICS & SROI (Sprint 6)

### 22. Analytics Dashboard
**URL:** [http://localhost:3000/organizations/[id]/analytics](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Date Range Picker** | Select time period | [ ] |
| **KPI Cards** | Total stories, views, impact | [ ] |
| **Story Trends Chart** | Line chart with data | [ ] |
| **Theme Distribution** | Pie/bar chart | [ ] |
| **Engagement Metrics** | Views, shares, saves | [ ] |
| **Export Data** | Download CSV/PDF | [ ] |
| **Filter by Project** | Dropdown filter | [ ] |

**Charts to Test:**
- [ ] Stories over time (line chart)
- [ ] Themes distribution (bar chart)
- [ ] Engagement metrics (area chart)
- [ ] SROI calculations (if enabled)

**Critical Flows:**
1. Change date range → Charts update
2. Filter by project → Data updates
3. Export CSV → File downloads

---

### 23. Community Interpretation Sessions
**URL:** [http://localhost:3000/organizations/[id]/interpretation](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Session List** | All sessions display | [ ] |
| **Create Session** | 7-step wizard form | [ ] |
| **Session Details** | Date, facilitator, participants | [ ] |
| **Story Selection** | Select stories to interpret | [ ] |
| **Key Interpretations** | Add interpretation notes | [ ] |
| **Consensus Points** | Document agreements | [ ] |
| **Divergent Views** | Capture different perspectives | [ ] |
| **Cultural Context** | Add cultural insights | [ ] |
| **Recommendations** | Action items | [ ] |
| **Save Session** | Creates session record | [ ] |

**Critical Flows:**
1. Create session → Complete all 7 steps → Save
2. View session → See all interpretation data
3. Edit session → Update interpretations

---

### 24. Harvested Outcomes Tracker
**URL:** [http://localhost:3000/organizations/[id]/outcomes](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Outcome List** | All outcomes display | [ ] |
| **Add Outcome** | Create new outcome | [ ] |
| **Outcome Types** | Unexpected benefit, impact, etc. | [ ] |
| **Linked Stories** | Connect to related stories | [ ] |
| **People Affected** | Number input | [ ] |
| **Geographic Scope** | Location selector | [ ] |
| **Time Lag** | Months since story | [ ] |
| **Evidence** | Upload evidence documents | [ ] |
| **Edit Outcome** | Modify existing outcome | [ ] |
| **Delete** | Remove outcome | [ ] |

**Critical Flows:**
1. Add unexpected benefit → Link to story → Save
2. Upload evidence → Document attaches
3. View outcome → All data displays

---

### 25. Funder Report Generator
**URL:** [http://localhost:3000/organizations/[id]/reports](http://localhost:3000/organizations)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Report Templates** | 4 templates available | [ ] |
| **Date Range** | Select reporting period | [ ] |
| **Options** | Include financials, stories, quotes | [ ] |
| **Preview** | Shows report preview | [ ] |
| **Generate** | Creates report | [ ] |
| **Export PDF** | Downloads PDF | [ ] |
| **Export PowerPoint** | Downloads PPTX (if enabled) | [ ] |
| **Embed Code** | Generates embed snippet | [ ] |

**Templates to Test:**
- [ ] Executive Summary
- [ ] Detailed Impact Report
- [ ] Storyteller Highlights
- [ ] Outcomes & SROI

**Critical Flows:**
1. Select template → Choose date range → Generate
2. Preview report → Check all sections
3. Export PDF → File downloads

---

## 🔍 SEARCH & DISCOVERY (Sprint 7)

### 26. Global Search
**URL:** [http://localhost:3000/search](http://localhost:3000/search)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Search Input** | Auto-complete suggestions | [ ] |
| **Search Types** | Keyword, semantic, both | [ ] |
| **Results Tabs** | All, Stories, Storytellers, Media | [ ] |
| **Result Cards** | Preview of each result | [ ] |
| **Highlights** | Search terms highlighted | [ ] |
| **Filters** | Sidebar filters work | [ ] |
| **Sort** | Relevance, date, popularity | [ ] |
| **Pagination** | Load more results | [ ] |
| **No Results** | Shows helpful message | [ ] |
| **Recent Searches** | Saves last 5 searches | [ ] |

**Test Queries:**
- "teachings" (should find "Seven Grandfather Teachings")
- "youth" (should find "Walking Two Paths")
- "medicine" (should find "Medicine Garden Memories")
- "language" (should find "The Language Keeper")

**Critical Flows:**
1. Type query → See suggestions
2. Search → Results display
3. Filter by theme → Results update
4. Switch to semantic search → Different results

---

### 27. Advanced Filters Panel
**URL:** [http://localhost:3000/search?filters=open](http://localhost:3000/search)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Content Type** | Stories, transcripts, media | [ ] |
| **Date Range** | From/to date pickers | [ ] |
| **Date Presets** | Today, week, month, quarter | [ ] |
| **Cultural Groups** | Multi-select | [ ] |
| **Languages** | Filter by language | [ ] |
| **Protocols** | Filter by cultural protocols | [ ] |
| **Themes** | Theme multi-select | [ ] |
| **Themes Operator** | AND/OR toggle | [ ] |
| **Media Types** | Photo, video, audio | [ ] |
| **Has Media** | Yes/no/either | [ ] |
| **Story Length** | Min characters slider | [ ] |
| **Publish Status** | Published, draft, pending | [ ] |
| **Consent Status** | Approved, pending, revoked | [ ] |
| **Apply Filters** | Updates search results | [ ] |
| **Clear Filters** | Resets all filters | [ ] |

**Filter Combinations to Test:**
1. Theme: "Traditional Teachings" + Date: Last month
2. Cultural Group: "Anishinaabe" + Has Media: Yes
3. Theme: "Youth" OR "Identity" (operator test)

---

### 28. Discovery Feed
**URL:** [http://localhost:3000/discover](http://localhost:3000/discover)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Feed Types** | Personalized, Trending, New, Popular | [ ] |
| **Content Cards** | Stories/storytellers display | [ ] |
| **Recommendation Reason** | "Because you liked..." | [ ] |
| **Save for Later** | Bookmark button | [ ] |
| **Dismiss** | Hide item from feed | [ ] |
| **Infinite Scroll** | Loads more on scroll | [ ] |
| **Refresh** | Pull to refresh (mobile) | [ ] |

**Critical Flows:**
1. Switch feed type → Content updates
2. Save item → Appears in saved list
3. Dismiss → Item removed from feed
4. Scroll to bottom → More items load

---

### 29. Saved Searches
**URL:** [http://localhost:3000/search/saved](http://localhost:3000/search)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Saved List** | All saved searches display | [ ] |
| **Create Alert** | Save search with alert | [ ] |
| **Alert Frequency** | Daily, weekly, monthly | [ ] |
| **Run Search** | Execute saved search | [ ] |
| **Edit** | Modify search parameters | [ ] |
| **Delete** | Remove saved search | [ ] |
| **Email Notifications** | Receives alert emails | [ ] |

**Critical Flows:**
1. Save current search → Name it → Create alert
2. Run saved search → Results display
3. Edit search → Update filters
4. Delete → Removed from list

---

### 30. Search Analytics
**URL:** [http://localhost:3000/search/analytics](http://localhost:3000/search/analytics)

**Key Areas to Test:**

| Area | What to Check | Status |
|------|---------------|--------|
| **KPI Cards** | Total searches, avg results, etc. | [ ] |
| **Trends Chart** | Searches over time | [ ] |
| **Top Queries** | Most popular searches | [ ] |
| **Filter Usage** | Which filters used most | [ ] |
| **Search Types** | Keyword vs semantic usage | [ ] |
| **Export** | Download analytics CSV | [ ] |

**Charts to Test:**
- [ ] Search trends over time (line chart)
- [ ] Top queries (bar chart)
- [ ] Filter usage (pie chart)
- [ ] Search type distribution (donut chart)

---

## 🎨 FINAL POLISH (Sprint 8)

### 31. Error Pages

**404 Not Found**
**URL:** [http://localhost:3000/this-does-not-exist](http://localhost:3000/this-does-not-exist)

| Area | What to Check | Status |
|------|---------------|--------|
| **Error Message** | "Page not found" message | [ ] |
| **Illustration** | Error illustration/icon | [ ] |
| **Home Link** | "Go Home" button works | [ ] |
| **Search** | Search box to find content | [ ] |

**500 Server Error**
**URL:** Trigger by causing server error

| Area | What to Check | Status |
|------|---------------|--------|
| **Error Boundary** | Catches and displays error | [ ] |
| **Error Message** | User-friendly message | [ ] |
| **Details** | Stack trace in dev mode only | [ ] |
| **Reload Button** | "Try Again" button | [ ] |
| **Report Bug** | Link to report issue | [ ] |

---

### 32. Loading States

**Test Across All Pages:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Skeleton Screens** | Show while loading | [ ] |
| **Spinners** | Appropriate size and color | [ ] |
| **Progressive Loading** | Content appears incrementally | [ ] |
| **Lazy Images** | Blur-up or fade-in effect | [ ] |
| **Loading Text** | "Loading..." appropriate | [ ] |

**Pages to Test:**
- Dashboard (slow API response)
- Gallery (many images)
- Analytics (data processing)
- Search results (large result set)

---

### 33. Accessibility Testing

**Keyboard Navigation:**

| Area | What to Check | Status |
|------|---------------|--------|
| **Tab Order** | Logical order through page | [ ] |
| **Focus Indicators** | Visible outline on focus | [ ] |
| **Skip Links** | "Skip to main content" works | [ ] |
| **Modal Trapping** | Focus stays in modal | [ ] |
| **Escape Key** | Closes modals/dialogs | [ ] |

**Screen Reader (Optional):**

| Area | What to Check | Status |
|------|---------------|--------|
| **Headings** | Proper h1-h6 hierarchy | [ ] |
| **Alt Text** | All images have alt text | [ ] |
| **ARIA Labels** | Buttons properly labeled | [ ] |
| **Live Regions** | Announces updates | [ ] |
| **Form Labels** | All inputs have labels | [ ] |

**Tools to Use:**
- Tab key for navigation
- Chrome DevTools Accessibility pane
- WAVE browser extension
- VoiceOver (Mac) or NVDA (Windows)

---

### 34. Responsive Design

**Test on Multiple Viewports:**

| Viewport | What to Check | Status |
|----------|---------------|--------|
| **Mobile (375px)** | Layout stacks, text readable | [ ] |
| **Tablet (768px)** | 2-column layouts | [ ] |
| **Desktop (1280px)** | Full layout with sidebar | [ ] |
| **Wide (1920px)** | Content doesn't stretch too wide | [ ] |

**Critical Pages:**
- Homepage
- Stories list
- Story detail
- Dashboard
- Gallery

**Responsive Elements:**
- [ ] Navigation menu (hamburger on mobile)
- [ ] Data tables (horizontal scroll or cards)
- [ ] Charts (scale appropriately)
- [ ] Modals (full-screen on mobile)
- [ ] Forms (single column on mobile)

---

### 35. Performance Testing

**Page Load Speed:**

| Page | Target | Actual | Status |
|------|--------|--------|--------|
| Homepage | < 2s | ___s | [ ] |
| Stories List | < 2s | ___s | [ ] |
| Story Detail | < 1.5s | ___s | [ ] |
| Dashboard | < 2.5s | ___s | [ ] |
| Gallery | < 3s | ___s | [ ] |

**Tools:**
- Chrome DevTools Network tab
- Lighthouse (Chrome DevTools)
- PageSpeed Insights

**Metrics to Check:**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Total Blocking Time (TBT) < 300ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

---

## 🔒 SECURITY TESTING

### 36. Authentication & Authorization

**Test Access Control:**

| Scenario | Expected Behavior | Status |
|----------|-------------------|--------|
| **Unauthenticated** | Cannot access dashboard | [ ] |
| **Unauthenticated** | Can view public stories | [ ] |
| **Storyteller** | Can edit own profile | [ ] |
| **Storyteller** | Cannot edit others' profiles | [ ] |
| **Org Admin** | Can manage org members | [ ] |
| **Org Member** | Cannot delete org | [ ] |
| **Super Admin** | Can access all orgs | [ ] |

**Test RLS Policies:**
1. Try accessing another storyteller's dashboard → Should redirect
2. Try editing another user's story → Should show error
3. Try viewing private story → Should show "No access"

---

### 37. Data Validation

**Test Input Validation:**

| Field Type | Test Case | Expected | Status |
|------------|-----------|----------|--------|
| **Email** | Invalid format | Show error | [ ] |
| **Email** | Already exists | "Email taken" | [ ] |
| **Password** | Too short | Strength error | [ ] |
| **URL** | Invalid format | Format error | [ ] |
| **Number** | Non-numeric | Type error | [ ] |
| **Required** | Leave blank | "Required" error | [ ] |

**SQL Injection Test:**
- Try entering `'; DROP TABLE stories; --` in search
- Should be sanitized/escaped

**XSS Test:**
- Try entering `<script>alert('XSS')</script>` in bio
- Should be escaped/stripped

---

## 📱 CROSS-BROWSER TESTING

**Test on Multiple Browsers:**

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| **Chrome** | Latest | [ ] | |
| **Firefox** | Latest | [ ] | |
| **Safari** | Latest | [ ] | |
| **Edge** | Latest | [ ] | |
| **Mobile Safari** | iOS 15+ | [ ] | |
| **Chrome Mobile** | Android | [ ] | |

**Key Features to Test:**
- [ ] File uploads
- [ ] Date pickers
- [ ] Drag & drop
- [ ] Video playback
- [ ] Animations
- [ ] CSS Grid/Flexbox

---

## 📝 TESTING SESSION LOG

### Session Template

```markdown
## Testing Session: [Date]

**Tester:** [Your Name]
**Duration:** [Start Time] - [End Time]
**Environment:** Local dev / Staging / Production
**Browser:** Chrome 120 / Firefox 121 / Safari 17

### Pages Tested
- [ ] Page 1 - Status
- [ ] Page 2 - Status

### Issues Found

#### Issue #1: [Title]
- **Severity:** Critical / High / Medium / Low
- **Page:** [URL]
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected:** [What should happen]
- **Actual:** [What actually happened]
- **Screenshot:** [Link or attachment]
- **Console Errors:** [Any errors in console]

### Notes
[Any observations, suggestions, or questions]
```

---

## 🎯 TESTING PRIORITIES

### Critical (Must Fix Before Launch)
- [ ] Authentication works
- [ ] Story creation/editing works
- [ ] Data saves correctly
- [ ] No console errors on key pages
- [ ] RLS policies prevent unauthorized access

### High (Should Fix Before Launch)
- [ ] All forms validate properly
- [ ] Images load correctly
- [ ] Search returns results
- [ ] Analytics display data
- [ ] Mobile responsive

### Medium (Can Fix After Launch)
- [ ] Minor UI alignment issues
- [ ] Loading state polish
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Low (Nice to Have)
- [ ] Animation polish
- [ ] Additional features
- [ ] Edge case handling

---

## 📊 TESTING PROGRESS TRACKER

**Overall Progress:**

| Sprint | Pages | Tested | Issues | Status |
|--------|-------|--------|--------|--------|
| Sprint 1 (Profile) | 5 | __ / 5 | __ | [ ] |
| Sprint 2 (Stories) | 3 | __ / 3 | __ | [ ] |
| Sprint 3 (Media) | 2 | __ / 2 | __ | [ ] |
| Sprint 4 (Consent) | 3 | __ / 3 | __ | [ ] |
| Sprint 5 (Org) | 3 | __ / 3 | __ | [ ] |
| Sprint 6 (Analytics) | 4 | __ / 4 | __ | [ ] |
| Sprint 7 (Search) | 5 | __ / 5 | __ | [ ] |
| Sprint 8 (Polish) | 7 | __ / 7 | __ | [ ] |
| **Total** | **32** | **__ / 32** | **__** | **[ ]** |

---

## 🚀 READY FOR PRODUCTION?

**Pre-Launch Checklist:**

- [ ] All critical issues fixed
- [ ] All high-priority issues fixed
- [ ] No console errors on key pages
- [ ] Authentication and authorization working
- [ ] Data persistence verified
- [ ] RLS policies tested
- [ ] Mobile responsive on key pages
- [ ] Page load times acceptable
- [ ] Accessibility basics covered
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] User flows tested end-to-end
- [ ] Error handling works gracefully
- [ ] Deployment tested on staging

---

**Good luck with testing! 🎉**

*Remember: It's better to find issues during testing than after launch. Take your time and be thorough!*
