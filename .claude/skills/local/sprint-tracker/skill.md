# Sprint Tracker Skill

**Purpose:** Instant access to current sprint status, track progress, and recommend next actions aligned with sprint goals.

**Auto-Invoke When User Says:**
- "Where are we in the sprint?"
- "What's next?"
- "Sprint status"
- "What should I work on?"
- "Show me the backlog"
- "Are we on track?"

---

## 🎯 Quick Status Command

**Invoke this skill to get:**
1. Current sprint number and dates
2. Days remaining
3. Completion percentage
4. Next recommended tasks
5. Blockers/risks

**Files:**
- [SPRINT_STATUS.md](../../../SPRINT_STATUS.md) - **Real-time** progress tracking (updated daily)
- [docs/SPRINT_PLAN_DETAILED.md](../../../docs/SPRINT_PLAN_DETAILED.md) - Full 8-sprint roadmap

---

## 📊 Current Sprint Quick Reference

**Current Sprint:** Sprint 4 - Sharing & Syndication
**Dates:** Jan 2-5, 2026
**Status:** Phase 2 Complete (66%), Phase 3 Starting

**Today's Priority:**
- Build Syndication Dashboard UI for storytellers
- Display consent status, embed tokens, and revocation controls

---

## 🔍 Sprint Status Workflow

### 1. Check Current Status
```
Read: SPRINT_STATUS.md
```

**Shows:**
- Sprint goal and theme
- Overall completion percentage
- Day-by-day breakdown
- Components created vs. pending
- Next actions

### 2. Review Detailed Plan
```
Read: docs/SPRINT_PLAN_DETAILED.md
```

**Shows:**
- All 8 sprints overview
- Detailed tasks for current sprint
- Acceptance criteria
- Database tables involved

### 3. Check Mission Alignment
```
Invoke: empathy-ledger-mission skill
```

**Before starting any task, verify:**
- Does this advance narrative sovereignty?
- Is cultural safety foundational?
- Do storytellers retain control?

### 4. Cultural Review (If storyteller-facing)
```
Invoke: cultural-review skill
```

**Mandatory for:**
- Privacy/consent features
- Cultural protocols
- Elder review workflows
- Data sovereignty controls

---

## 📋 Sprint 4 Status (Current)

### ✅ Completed Phase 1: Story Sharing System
**Theme:** Internal sharing with cultural safety

**Features:**
- Share tracking database (embed_tokens, embed_token_access_log)
- Share API with 4-level cultural safety checks
- Frontend integration with ShareStoryDialog
- End-to-end tested and working

**Outcome:** Storytellers can share stories internally with cultural safety protocols

---

### ✅ Completed Phase 2: JusticeHub Syndication (January 5, 2026)
**Theme:** External syndication with OCAP consent

**Features:**
- Complete consent API (create, check, revoke)
- Secure embed token generation (SHA-256 hashed, time-limited)
- Automatic token revocation cascade
- Cultural permission levels (public, community, restricted, sacred)
- Elder approval workflow ready

**API Endpoints:**
- POST `/api/syndication/consent` - Create consent + embed token
- GET `/api/syndication/consent?storyId=xxx&siteSlug=xxx` - Check status
- POST `/api/syndication/consent/[consentId]/revoke` - Revoke consent

**Critical Fixes Applied (6 issues):**
1. Fixed Supabase client imports (server → client-ssr)
2. Added `organization_id` column to syndication_consent
3. Added `tenant_id` to consent insert
4. Removed invalid `token_type` column from embed service
5. Updated story publication requirements
6. Added RLS policy for syndication_sites

**Registered Sites:**
- JusticeHub, ACT Farm, The Harvest, ACT Placemat

**Session Duration:** ~4 hours
**Files Modified:** 5 files
**Test Results:** All endpoints tested and working ✅

**See:** [SYNDICATION_CONSENT_COMPLETE.md](../../../SYNDICATION_CONSENT_COMPLETE.md)

---

### 🟡 In Progress Phase 3: Syndication Dashboard UI
**Theme:** Storyteller control panel for consent management

**Pending Components:**
- SyndicationConsentList.tsx (show all consents for storyteller)
- ConsentStatusCard.tsx (individual consent card with site info)
- CreateConsentDialog.tsx (request syndication to a site)
- RevokeConsentDialog.tsx (revoke with reason input)
- EmbedTokenDetails.tsx (show token info, usage stats)

**Next Steps:**
1. Design dashboard layout (invoke design-component skill)
2. Create consent list component with filtering
3. Build consent card with status badges
4. Implement revocation dialog with cultural messaging
5. Add embed token analytics view
6. Cultural review (CRITICAL - OCAP consent UX)
7. Test with real consent data

---

## 🚀 Recommended Next Actions

### Today (January 5, 2026)

**Priority 1: Build Syndication Dashboard UI**

1. **Create SyndicationConsentList.tsx**
   - Display all consents for current storyteller
   - Filter by status (approved, pending, revoked)
   - Filter by site (JusticeHub, ACT Farm, etc.)
   - Sort by date created/updated
   - Invoke: `design-component` skill for layout

2. **Create ConsentStatusCard.tsx**
   - Show site name, logo, allowed domains
   - Display consent status with color-coded badges
   - Show cultural permission level
   - Display embed token status (active, revoked, expired)
   - Show usage stats (view count, last used)
   - Revoke button with confirmation
   - Invoke: `design-component` skill for cultural colors

3. **Create RevokeConsentDialog.tsx**
   - Confirm revocation with clear messaging
   - Input for revocation reason (optional but encouraged)
   - Explain consequences: "JusticeHub will immediately lose access to this story"
   - Cultural messaging: "You maintain full control over your story"
   - Invoke: `cultural-review` skill - OCAP consent UX (CRITICAL)

**Skills to Invoke:**
- `design-component` - Design dashboard with cultural colors
- `cultural-review` - OCAP consent UX review (CRITICAL)
- `empathy-ledger-mission` - Check data sovereignty alignment

---

### This Week (Jan 5-6)

**Priority 2: Add Analytics & Advanced Features**

After completing core dashboard:

1. **Create EmbedTokenDetails.tsx**
   - Show token string (masked: `LRK...XA`)
   - Display expiration date
   - Show allowed domains list
   - Usage analytics: view count, last accessed, accessing domains
   - Copy token button (for manual testing)
   - Invoke: `analytics-dashboard-dev` skill

2. **Create CreateConsentDialog.tsx** (Optional)
   - Select site from dropdown (active syndication sites only)
   - Select cultural permission level
   - Add optional message/reason for request
   - Auto-approve for public content
   - Pending approval for community/restricted/sacred
   - Invoke: `cultural-review` skill (elder approval workflow)

**Skills to Invoke:**
- `analytics-dashboard-dev` - Usage analytics display
- `cultural-review` - Elder approval workflow (CRITICAL)

---

### Next Steps (Post-Sprint 4)

**Priority 3: Webhooks & External Integration**

1. Add webhook notifications to JusticeHub on consent changes
2. Build JusticeHub embed widget (external project)
3. Add domain validation and CORS enforcement
4. Build analytics dashboard for storytellers
5. Add batch revocation operations

---

## 📈 Sprint Metrics

### Velocity Tracking

**Sprint 4 Planned:**
- 4 days (Jan 2-5, 2026)
- 3 phases (Sharing System, Syndication API, Dashboard UI)
- Target: Production-ready syndication system

**Current Progress:**
- Days used: 4/4
- Phases completed: 2/3 (66%)
- Phase 1: ✅ Complete (Story Sharing System)
- Phase 2: ✅ Complete (JusticeHub Syndication API - 4 hours)
- Phase 3: 🟡 In Progress (Dashboard UI)

**On Track:** Yes ✅
- Phase 1 & 2 complete and tested
- All API endpoints working
- 6 critical issues fixed
- Ready for Phase 3 UI work

**Burndown:**
```
Phase         | Status    | Time Spent
--------------|-----------|------------
Phase 1       | ✅ Done   | ~3 hours
Phase 2       | ✅ Done   | ~4 hours
Phase 3       | 🟡 Pending| TBD
```

**Quality Metrics:**
- API test coverage: 100% (all endpoints tested)
- OCAP compliance: ✅ Full
- Cultural safety: ✅ Integrated
- Security: ✅ Production-ready (SHA-256, time-limited tokens)

---

## 🛡️ Cultural Safety Gates

**Before ANY component ships:**

### Gate 1: Mission Alignment
- [ ] Invoke `empathy-ledger-mission` skill
- [ ] Check which strategic pillar (1-8)
- [ ] Verify storyteller control maintained
- [ ] Confirm cultural safety foundational

### Gate 2: Cultural Review (If Applicable)
- [ ] Invoke `cultural-review` skill
- [ ] OCAP principles verified
- [ ] Elder authority respected
- [ ] Sacred content protocols in place

### Gate 3: GDPR Compliance (If Handling Data)
- [ ] Invoke `gdpr-compliance` skill
- [ ] Consent explicit and revocable
- [ ] Data export implemented
- [ ] Deletion cascades properly

### Gate 4: Design System
- [ ] Invoke `design-component` skill
- [ ] Cultural color palette used
- [ ] WCAG 2.1 AA accessibility
- [ ] Trauma-informed design

---

## 🔗 Integration Checklist

**For Each Component:**

1. **Create Component**
   - TypeScript with proper types
   - 'use client' directive if interactive
   - Export interface for props

2. **Style with Cultural Colors**
   - Clay (#D97757) - Indigenous/cultural
   - Sage (#6B8E72) - Supportive/growth
   - Sky (#4A90A4) - Trust/transparency
   - Ember (#C85A54) - Important actions

3. **Add to Parent**
   - Import component
   - Pass props from database
   - Handle loading/error states

4. **Test**
   - Unit test component
   - Integration test with parent
   - Manual test with real data
   - Accessibility test (keyboard, screen reader)

5. **Cultural Review**
   - Invoke relevant skills
   - Get Indigenous Advisory Board approval (if needed)
   - Document cultural decisions

6. **Update Sprint Status**
   - Mark task complete in SPRINT_STATUS.md
   - Update completion percentage
   - Add to "Completed" section

---

## 📝 Daily Update Template

**Use this to update SPRINT_STATUS.md daily:**

```markdown
### [Date] Daily Update

**Completed Today:**
- ✅ [Component/Task name]
- ✅ [Component/Task name]

**In Progress:**
- 🟡 [Component/Task name] - [% complete]

**Blocked:**
- 🚨 [Blocker description]

**Next Day Plan:**
- [ ] [Task 1]
- [ ] [Task 2]

**Skills Invoked:**
- empathy-ledger-mission - [Result]
- cultural-review - [Result]

**Notes:**
- [Any important decisions or learnings]
```

---

## 🎯 Sprint Planning Process

### Every 2 Weeks (Sprint Planning)

1. **Review Last Sprint**
   - What went well?
   - What didn't?
   - Velocity: planned vs. actual

2. **Plan Next Sprint**
   - Read next sprint in SPRINT_PLAN_DETAILED.md
   - Break down into daily tasks
   - Identify dependencies
   - Assign skills to invoke

3. **Update SPRINT_STATUS.md**
   - Copy template from SPRINT_PLAN_DETAILED.md
   - Set current sprint number and dates
   - Reset completion to 0%
   - List all pending tasks

4. **Invoke `act-sprint-workflow` (Global Skill)**
   - Sprint planning guidance
   - Velocity tracking
   - Cross-project coordination

---

## 🚨 Red Flags - Stop and Reassess

If you see these, STOP and invoke this skill:

- **Scope Creep:** "Let's add just one more feature"
  - Check: Is this in SPRINT_PLAN_DETAILED.md?
  - If no: Defer to backlog

- **Skipping Cultural Review:** "We can review this later"
  - NO. Cultural safety is foundational, not optional.
  - Invoke: `cultural-review` skill NOW

- **Behind Schedule:** "We're 3 days behind"
  - Check: What's blocking us?
  - Option A: Descope (remove P2/P3 features)
  - Option B: Add resources
  - Option C: Extend sprint (last resort)

- **Missing Acceptance Criteria:** "Is this done?"
  - Check: SPRINT_PLAN_DETAILED.md acceptance criteria
  - If unclear: Add criteria, then assess

---

## 📚 Quick Command Reference

**Check Sprint Status:**
```
Read: SPRINT_STATUS.md
```

**See Full Sprint Plan:**
```
Read: docs/SPRINT_PLAN_DETAILED.md
```

**Check Mission Alignment:**
```
Invoke: empathy-ledger-mission
```

**Cultural Review:**
```
Invoke: cultural-review
```

**GDPR Compliance:**
```
Invoke: gdpr-compliance
```

**Design Guidance:**
```
Invoke: design-component
```

**Database Work:**
```
Invoke: supabase-deployment
```

---

## ✅ Success Criteria for Sprint 4

**By Jan 5, 2026:**

### Phase 1: Story Sharing System ✅
- [x] Share tracking database deployed
- [x] Share API with cultural safety checks
- [x] Frontend integration working
- [x] End-to-end tested

### Phase 2: JusticeHub Syndication ✅
- [x] Consent creation API working
- [x] Embed token generation working
- [x] Consent revocation working (with cascade)
- [x] All 6 critical issues fixed
- [x] End-to-end tested and verified
- [x] OCAP compliance verified
- [x] 4 syndication sites registered

### Phase 3: Dashboard UI (In Progress)
- [ ] SyndicationConsentList component created
- [ ] ConsentStatusCard component created
- [ ] RevokeConsentDialog component created
- [ ] EmbedTokenDetails component created (optional)
- [ ] CreateConsentDialog component created (optional)
- [ ] Cultural review completed (OCAP consent UX)
- [ ] Integrated into storyteller dashboard
- [ ] Tested with real consent data
- [ ] Deployed to staging

---

**Remember:** Sprint tracking is a tool for mission delivery, not an end in itself. If we're building features that don't advance narrative sovereignty, we're off course.

🌾 **"Every sprint is a season. Every feature is a seed. Every decision either cultivates community power or extracts from it."**

---

## 📚 Sprint 4 Reference Documents

**Completion Summary:**
- [SYNDICATION_CONSENT_COMPLETE.md](../../../SYNDICATION_CONSENT_COMPLETE.md) - Phase 2 complete session summary

**Progress Tracking:**
- [docs/13-platform/SPRINT_STATUS.md](../../../docs/13-platform/SPRINT_STATUS.md) - Real-time sprint status

**Architecture:**
- [docs/05-features/](../../../docs/05-features/) - Feature specifications
- [docs/08-integrations/](../../../docs/08-integrations/) - JusticeHub integration docs
