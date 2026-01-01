# Trust and Control Framework
**Building a Safe Platform for Marginalized Voices**

## The Core Challenge

Marginalized people have historically had their stories taken, misrepresented, exploited, and used without consent. Organizations want to share powerful stories but often inadvertently perpetuate harm through lack of control mechanisms.

**The Question:** How do we build a platform where:
1. Storytellers feel **safe** sharing their truth
2. Organizations can share stories **with permission** and trust
3. The broader community can witness authentic stories knowing they're **ethically sourced**

## Three Audiences, Three Needs

### 1. Storytellers (The Vulnerable)
**"Can I trust you with my story?"**

#### What They Fear
- Story being shared without permission
- Story being edited or misrepresented
- Story being used to profit others
- Story being permanent when they've changed their mind
- Story being taken out of context
- Not knowing who has seen their story
- Losing ownership of their own narrative

#### What They Need to Feel Safe
✅ **Visible Control** - Clear buttons: "Share", "Stop Sharing", "Delete Forever"
✅ **Real-time Knowledge** - "47 people have viewed your story today"
✅ **Expiring Permissions** - "This link works for 7 days, then stops automatically"
✅ **The Nuclear Option** - "Withdraw Story" button that works IMMEDIATELY
✅ **Transparency** - "Your story was shared on Twitter by [Organization Name]"
✅ **No Surprises** - Email when someone requests to use their story
✅ **Cultural Safety** - Stories reviewed by Elders before going public (if requested)

#### Communication Language
**❌ Don't Say:**
- "Your content is stored securely" (technical, cold)
- "You retain intellectual property rights" (legal jargon)
- "Data privacy compliant" (corporate speak)

**✅ Do Say:**
- "You can take your story down at any time - it stops working within seconds"
- "You'll know exactly who has seen your story and when"
- "Your story stays yours. Always."
- "If someone screenshots it before you take it down, we can't delete that - but we can stop anyone new from seeing it"

### 2. Organizations (The Amplifiers)
**"Can we share these stories without causing harm?"**

#### What They Fear
- Accidentally sharing a story that was withdrawn
- Using a story that wasn't properly consented
- Being accused of exploitation
- Story being taken down mid-campaign
- Not knowing if they have permission
- Liability for misuse

#### What They Need to Feel Confident
✅ **Clear Permission Status** - Green badge: "Approved for Public Sharing"
✅ **Consent Receipts** - Timestamped proof of permission
✅ **Automatic Revocation** - If storyteller withdraws, their shared links stop working
✅ **Notification System** - Email if a story they're using gets withdrawn
✅ **Ethical Guidelines** - Clear rules on how to attribute and share
✅ **Tiered Access** - Some stories for "Internal Use Only", others "Public OK"

#### Communication Language
**❌ Don't Say:**
- "Stories are pre-approved" (implies no ongoing consent)
- "Use any story on the platform" (too permissive)
- "Stories are verified" (what does that mean?)

**✅ Do Say:**
- "Each story shows exactly what you're allowed to do with it"
- "If a storyteller changes their mind, you'll know immediately"
- "Green badge = safe to share publicly. Orange = ask first."
- "Every use is tracked, so storytellers know you respected their wishes"

### 3. Community/Public (The Witnesses)
**"Are these stories authentic and ethically shared?"**

#### What They Question
- Is this story real?
- Did the person consent to this being shared?
- Is this organization exploiting this person's trauma?
- Can I trust this is their actual words, not edited?

#### What They Need to Trust
✅ **Authenticity Markers** - "Told by [Name], recorded [Date]"
✅ **Consent Indicators** - "Storyteller approved for public sharing"
✅ **Cultural Review Badges** - "Reviewed and approved by Elders"
✅ **Source Transparency** - "Shared by [Organization] with permission"
✅ **Storyteller Voice** - Unedited, in their own words

## The Implementation Journey

### Phase 1: Foundation of Control (NOW - Essential)
**Goal:** Storytellers can share and withdraw stories immediately

**What to Build:**
1. ✅ **Story Status Dashboard** (storyteller sees)
   - "Your Story Status: Published / Private / Withdrawn"
   - "47 people viewed this story this week"
   - "Currently shared on: Your personal link"
   - Big red button: "Withdraw This Story"

2. ✅ **Share Link Generator** (we built this!)
   - "Create a link to share your story"
   - Choose: 1 hour, 1 day, 7 days, 30 days, or Forever
   - Choose: Maximum views (1 time, 10 times, 100 times, unlimited)
   - Choose: Who can see it (Anyone, People I email, Partner organizations)

3. ✅ **Immediate Revocation** (we built this!)
   - Click "Withdraw" → All links stop working within seconds
   - Click "Revoke Link" → That specific link stops working

**User Flows:**

```
STORYTELLER JOURNEY: "Sharing My Story at a Community Event"

1. Dashboard → "My Story: Life as a Torres Strait Islander in Melbourne"
2. Click "Share This Story"
3. Modal appears:
   ┌─────────────────────────────────────────────┐
   │ How long should this link work?             │
   │ ○ 1 day (link expires tomorrow)             │
   │ ● 1 week (link expires Dec 30) [SELECTED]   │
   │ ○ 1 month                                    │
   │                                              │
   │ Maximum views: [___] (leave blank for ∞)    │
   │                                              │
   │ Purpose: [Community Event ▼]                │
   │                                              │
   │        [Generate Link]                       │
   └─────────────────────────────────────────────┘

4. Link appears: https://empathy-ledger.org/s/abc123xyz
5. Click "Copy Link"
6. Share at event: "Here's my story - the link works for a week"
7. Next week: Link automatically expires
8. Storyteller sees: "Link expired Dec 30 - 34 people viewed"
```

```
STORYTELLER JOURNEY: "I Changed My Mind"

1. Phone rings: "Did you know your story is on Twitter?"
2. Opens app → Dashboard → "My Story"
3. Sees: "Shared on Twitter by Community Org - 847 views"
4. Clicks: "Withdraw This Story" button
5. Confirmation:
   ┌─────────────────────────────────────────────┐
   │ Are you sure?                               │
   │                                              │
   │ This will immediately stop all links from   │
   │ working. Anyone who tries to view your      │
   │ story will see "Story withdrawn".           │
   │                                              │
   │ Note: People who already saw it might have  │
   │ screenshots. We can't delete those, but     │
   │ we can stop new people from seeing it.      │
   │                                              │
   │   [Cancel]    [Yes, Withdraw My Story]      │
   └─────────────────────────────────────────────┘

6. Clicks "Yes, Withdraw My Story"
7. Within seconds: All links show "Story has been withdrawn"
8. Email sent to Community Org: "Story withdrawn - please remove from Twitter"
```

### Phase 2: Trust Indicators (NEXT - Critical)
**Goal:** Organizations and public can see consent status

**What to Build:**

1. **Story Card Badges**
   ```
   ┌───────────────────────────────────────┐
   │ 📖 Life on Wurundjeri Country        │
   │ by Aunty June Thompson                │
   │                                        │
   │ [Photo]                                │
   │                                        │
   │ ✅ Public Sharing Approved             │
   │ 👑 Elder Reviewed                      │
   │ 🔄 Updated 2 days ago                  │
   │                                        │
   │ "Growing up, we didn't have words..." │
   │                                        │
   │ [Read Story →]                         │
   └───────────────────────────────────────┘
   ```

2. **Permission Tiers** (visible on every story)
   ```
   🔴 PRIVATE
   "This story is private. Only the storyteller can see it."

   🟡 TRUSTED CIRCLE
   "Storyteller will share with specific people/organizations.
    Contact them to request access."

   🟢 COMMUNITY APPROVED
   "OK to share within community spaces and events.
    Please attribute: [Name], [Community], [Date]"

   🔵 PUBLIC USE
   "OK to share publicly (social media, websites, publications).
    Must include attribution and consent notice."

   ⚪ ARCHIVE
   "Historical record. Storyteller has given permanent permission.
    Cannot be withdrawn (explicit consent obtained)."
   ```

3. **Consent Footer** (on every public story page)
   ```
   ─────────────────────────────────────────
   This story shared with permission

   ✓ Storyteller approved for public sharing
   ✓ Last consent verified: Dec 23, 2025
   ✓ Attribution required when sharing
   ✓ Storyteller can withdraw at any time

   Learn about our ethical storytelling practices →
   ─────────────────────────────────────────
   ```

### Phase 3: Organization Tools (ESSENTIAL FOR SCALE)
**Goal:** Organizations can confidently and ethically use stories

**What to Build:**

1. **Organization Dashboard**
   ```
   EMPATHY LEDGER PARTNERS DASHBOARD

   Stories You Can Use:

   ┌─────────────────────────────────────────────┐
   │ 🟢 54 Stories Available for Public Use      │
   │ 🟡 12 Stories Require Individual Approval   │
   │ 🔴 3 Stories Recently Withdrawn             │
   └─────────────────────────────────────────────┘

   Recently Withdrawn:
   ⚠️ "Journey to Australia" - withdrawn Dec 22
      → Action: Remove from website, social media
      → Deadline: Immediate
   ```

2. **Story Usage Request Flow**
   ```
   ORGANIZATION WANTS TO USE A STORY:

   1. Find story: "Healing Through Culture"
   2. Status: 🟡 Trusted Circle Only
   3. Click: "Request Permission to Share"
   4. Form appears:
      ┌──────────────────────────────────────┐
      │ Request to Share Story               │
      │                                       │
      │ How will you use this story?         │
      │ [Website about mental health ...]    │
      │                                       │
      │ Where will it be shared?              │
      │ ☑ Organization website                │
      │ ☑ Social media                        │
      │ ☐ Print materials                     │
      │ ☐ Presentations                       │
      │                                       │
      │ How long: [6 months ▼]               │
      │                                       │
      │     [Send Request to Storyteller]     │
      └──────────────────────────────────────┘

   5. Storyteller gets email:
      "Youth Mental Health Org wants to share your story
       on their website and social media for 6 months.

       [View Full Request] [Approve] [Decline] [Ask Questions]"

   6. Storyteller approves → Org gets access token
   7. Org embeds story with token → Works for 6 months
   8. After 6 months → Auto-expires → Org gets reminder to renew
   ```

3. **Ethical Use Guidelines** (built into platform)
   ```
   WHEN SHARING STORIES, YOU MUST:

   ✓ Include attribution: "Story told by [Name], shared with permission"
   ✓ Link back to original story or Empathy Ledger
   ✓ Include consent date: "Consent given Dec 2025"
   ✓ Do not edit the story or take quotes out of context
   ✓ Remove immediately if storyteller withdraws consent

   ✓ GOOD EXAMPLE:
   "As Aunty June Thompson shared in her story on Empathy Ledger
    (with her permission, Dec 2025): 'We learned to heal through
    connection to Country...'"

   ✗ BAD EXAMPLE:
   "One Aboriginal woman said healing comes from land"
   (No name, no consent notice, no attribution)
   ```

### Phase 4: Cultural Safety Layer (CRITICAL FOR TRUST)
**Goal:** Indigenous and marginalized communities can set their own rules

**What to Build:**

1. **Elder Review Queue** (Optional per storyteller)
   ```
   STORYTELLER POSTS NEW STORY:

   "Do you want this story reviewed by community Elders
    before it becomes public?"

   ○ No thanks, publish now
   ● Yes, send for Elder review (story stays private until approved)

   [Next]

   → Story goes to Elder Review Queue
   → Elder receives notification
   → Elder can:
      - Approve: "This story is culturally appropriate to share"
      - Request changes: "Please adjust [specific part]"
      - Mark sensitive: "This story should only be shared within community"
      - Archive review: "This story contains sacred knowledge"

   → Storyteller gets response
   → Story published with badge: "👑 Elder Reviewed & Approved"
   ```

2. **Cultural Sensitivity Markers**
   ```
   PLATFORM ASKS STORYTELLER:

   "Does your story contain any of the following?"

   ☐ Sacred cultural knowledge
   ☐ Names of deceased persons
   ☐ Sensitive family matters
   ☐ Trauma or violence
   ☐ Children under 18
   ☐ Cultural practices that shouldn't be photographed

   Based on answers:
   → Auto-sets appropriate sharing tier
   → Suggests Elder review
   → Adds content warnings
   → Restricts certain uses (e.g., no social media for sacred knowledge)
   ```

3. **Community-Specific Permissions**
   ```
   WURUNDJERI COMMUNITY SETTINGS:

   All stories from Wurundjeri members:
   ✓ Must be Elder-reviewed before public sharing
   ✓ Cannot be used in commercial contexts without extra consent
   ✓ Must include cultural context footer
   ✓ Images of sacred sites require separate approval

   → Platform enforces these rules automatically
   → Organizations can't accidentally violate community protocols
   ```

## Communication Strategy

### For Storytellers

#### Onboarding Message
```
Welcome to Your Story Space

This is YOUR story. Here's what that means:

✓ You decide who sees it
✓ You can change your mind at any time
✓ You'll know exactly who viewed it
✓ If you take it down, it stops working immediately

We can't promise:
✗ We can't delete screenshots people already took
✗ We can't remove copies if someone saved it elsewhere

But we CAN promise:
✓ No new people will see it after you withdraw it
✓ Organizations will be notified immediately if you withdraw
✓ Your story stays in your control

Questions? Ask your community coordinator or email safety@empathy-ledger.org
```

#### Dashboard Language
```
YOUR STORY STATUS DASHBOARD

📖 "Journey to Healing"
Status: 🟢 Published - Community Use

SHARING:
- 2 active share links
- 147 total views
- Last viewed: 2 hours ago
- Shared by: Community Health Org (approved Dec 15)

CONTROLS:
[Edit Story]  [Change Privacy]  [View Share Links]  [Withdraw Story]

RECENT ACTIVITY:
Dec 23: Community Health Org shared on Facebook
Dec 22: 34 people viewed via your personal link
Dec 20: You approved Community Health Org to share
```

### For Organizations

#### Partner Dashboard Language
```
ETHICAL STORY SHARING DASHBOARD

Your Organization: Youth Mental Health Network

AVAILABLE STORIES: 54 stories approved for your use

ACTIVE USES:
✓ 12 stories currently on your website (all approved)
✓ 8 stories shared on social media this month (all approved)
✓ All consents valid for next 3+ months

ALERTS:
⚠️ 1 story withdrawn - action needed
   "Maria's Story" was withdrawn yesterday
   → Remove from: Website (2 pages), Instagram (1 post)
   → Deadline: Immediate

REQUESTS PENDING:
🟡 2 storytellers reviewing your access requests
   - "Healing Journey" (requested Dec 20)
   - "Finding Strength" (requested Dec 19)

[Browse Available Stories]  [Request New Access]  [Ethical Guidelines]
```

#### Request Template
```
WHEN YOU REQUEST TO USE A STORY:

Template sent to storyteller:

─────────────────────────────────────
[Organization Name] would like to share your story

Story: "[Story Title]"

How they'll use it:
"We want to feature your story on our mental health resources
 website to show young people that healing is possible."

Where it will appear:
• Organization website (www.example.org/stories)
• Social media (Facebook, Instagram)
• Monthly newsletter

How long:
• 6 months (expires June 2026)

They will:
✓ Include your full name and photo (or "Anonymous" if you prefer)
✓ Link back to your full story on Empathy Ledger
✓ Include consent notice and date
✓ Remove immediately if you withdraw consent

You can:
✓ Approve or decline
✓ Ask questions first
✓ Request changes (e.g., "Use my first name only")
✓ Set a shorter time period
✓ Withdraw approval at any time

[Approve]  [Decline]  [Ask Questions]  [Modify Request]
─────────────────────────────────────
```

### For Public/Community

#### Public Story Page
```
┌────────────────────────────────────────────┐
│  JOURNEY TO HEALING                        │
│  by Maria Santos                           │
│  Told: October 2025                        │
│                                             │
│  ✅ Approved for Public Sharing            │
│  👑 Elder Reviewed                          │
│  🌍 Shared by Youth Mental Health Network  │
│                                             │
│  [Photo of Maria]                           │
│                                             │
│  "When I arrived in Australia at 15..."    │
│                                             │
│  [Continue Reading →]                       │
└────────────────────────────────────────────┘

[At bottom of story]

─────────────────────────────────────────────
ABOUT THIS STORY

This story is shared with Maria's informed consent.

✓ Maria approved this story for public sharing
✓ She can withdraw this story at any time
✓ Last consent verified: Dec 23, 2025
✓ Elder reviewed for cultural appropriateness
✓ Shared by: Youth Mental Health Network (with permission)

Empathy Ledger is committed to ethical storytelling.
Learn about our Trust & Safety framework →

If you're sharing this story elsewhere, please:
• Include Maria's name and this consent notice
• Link back to the original story
• Do not edit or take quotes out of context

Report concerns: safety@empathy-ledger.org
─────────────────────────────────────────────
```

## Technical Implementation Roadmap

### IMMEDIATE (This Week)
- ✅ Database migration (DONE!)
- ✅ Share link API (DONE!)
- ✅ Token validation (DONE!)
- ✅ Auto-revocation trigger (DONE!)
- [ ] Storyteller dashboard page
- [ ] Integrate ShareLinkManager component
- [ ] Create withdrawal confirmation flow

### URGENT (Next 2 Weeks)
- [ ] Story status badges (Private/Community/Public)
- [ ] Permission tier system in database
- [ ] Consent verification timestamps
- [ ] Organization dashboard (basic)
- [ ] Email notifications (withdrawals, requests)

### CRITICAL (Next Month)
- [ ] Elder review workflow
- [ ] Cultural sensitivity markers
- [ ] Organization access request system
- [ ] Consent receipt generation
- [ ] Public trust indicators (badges on story cards)

### IMPORTANT (Next Quarter)
- [ ] Analytics dashboard (who viewed, when)
- [ ] Community-specific permission rules
- [ ] Automated consent renewal reminders
- [ ] Ethical use guidelines enforcement
- [ ] Multi-language support

## Success Metrics

### For Storytellers
- **Feel in control:** 90%+ say "I feel I have control over my story"
- **Trust the platform:** 85%+ say "I trust Empathy Ledger with my story"
- **Would recommend:** 80%+ would recommend to friends
- **Active management:** Average storyteller checks dashboard monthly
- **Withdrawal confidence:** 100% of withdrawals work within 60 seconds

### For Organizations
- **Confidence:** 95%+ say "I'm confident stories are ethically sourced"
- **Compliance:** 100% remove stories within 24hrs of withdrawal
- **Active use:** Average organization shares 5+ stories monthly
- **Renewal rate:** 80%+ renew access when it expires
- **Zero incidents:** No cases of unauthorized use reported

### For Platform
- **Consent rate:** 70%+ of stories approved for some level of sharing
- **Elder review:** 40%+ of stories go through cultural review
- **Withdrawal rate:** <5% of stories withdrawn (shows trust)
- **Re-publication:** 60%+ of withdrawn stories eventually re-published (shows safety)
- **Zero data breaches:** No unauthorized access to stories

## The Bigger Vision

This isn't just about technology. It's about **rebalancing power**.

For centuries, marginalized people's stories have been:
- Taken without consent
- Edited to fit dominant narratives
- Used to profit others
- Stripped of cultural context
- Made permanent without permission

This platform flips that script:

✓ **Storyteller-first:** Control lives with the person who lived the experience
✓ **Consent-based:** Every use requires explicit permission
✓ **Revocable:** Past consent doesn't bind future self
✓ **Transparent:** Everyone knows who has access and why
✓ **Culturally safe:** Community protocols built into the system
✓ **Honest:** We tell people what we CAN'T control (screenshots, etc.)

**The message to storytellers:**
"Your story is yours. We're just the tool you use to share it safely."

**The message to organizations:**
"These stories are gifts, not resources. Treat them accordingly."

**The message to the world:**
"These are authentic voices, shared with dignity, on their own terms."

---

**Next Step:** Build the storyteller dashboard that makes all this control *visible and accessible*, not buried in settings.
