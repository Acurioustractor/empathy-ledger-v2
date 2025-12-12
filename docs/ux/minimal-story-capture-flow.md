# Minimal Story Capture → Publish → Share Flow

## The Journey

```
FIELD CAPTURE                EMPATHY LEDGER                    DISTRIBUTION
─────────────                ─────────────────                 ────────────

1. Take photo ───────┐
2. Record interview ─┼──▶ 3. Operator uploads ──▶ 4. Storyteller receives
3. Get name/contact ─┘       story + media           magic link
                                                         │
                                                         ▼
                                                    5. Storyteller logs in
                                                       (first time = onboard)
                                                         │
                                                         ▼
                                                    6. Reviews their story
                                                         │
                                                         ▼
                                                    7. Chooses platforms ────▶ act.place
                                                       (consent toggles)       JusticeHub
                                                         │                     Social media
                                                         ▼
                                                    8. Story goes live
                                                       (can revoke anytime)
```

---

## Current State vs Needed

| Step | Exists? | What's Missing |
|------|---------|----------------|
| Operator uploads story | ✅ Yes | Need simpler "quick add" form |
| Storyteller receives magic link | ❌ No | Need magic link auth |
| Storyteller onboards | ❌ Partial | Need profile setup wizard |
| Reviews their story | ✅ Yes | `/storytellers/[id]/stories` exists |
| Chooses platforms | ❌ No | Need consent toggle UI for external apps |
| Story appears on platforms | ✅ Yes | API + embed ready |
| Can revoke | ✅ Yes | Webhook system ready |

---

## Implementation Plan

### Phase 1: Quick Add Form (Operator Side)

**New page:** `/admin/quick-add` or `/stories/quick-add`

```
┌─────────────────────────────────────────────────────────────┐
│  QUICK ADD STORY                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STORYTELLER                                                │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Name: [_______________________]                        ││
│  │ Email/Phone: [________________]  (for magic link)      ││
│  │ Photo: [📷 Upload]                                     ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  STORY                                                      │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Title: [_______________________]  [✨ AI Generate]     ││
│  │                                                         ││
│  │ Transcript:                                             ││
│  │ ┌─────────────────────────────────────────────────────┐││
│  │ │ [Paste transcript here...]                          │││
│  │ │                                                      │││
│  │ │                                                      │││
│  │ └─────────────────────────────────────────────────────┘││
│  │                                                         ││
│  │ Video: [🎬 Upload or paste URL]                        ││
│  │ Photos: [📷 Upload]                                    ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ [x] Send magic link to storyteller for approval        ││
│  │ [ ] Publish immediately (skip storyteller review)      ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [Save Draft]                    [Create & Send Link]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Magic Link Authentication

**Flow:**
```
Operator creates story with storyteller's email
         │
         ▼
System sends email: "Review your story on Empathy Ledger"
         │
         ▼
Storyteller clicks link: empathyledger.com/auth/magic?token=xxx
         │
         ▼
Token validated → Auto-login → Redirect to /my-story/[id]
         │
         ▼
First time? → Quick onboarding (name confirmation, photo)
         │
         ▼
Review story → Approve/Edit → Choose sharing
```

**Technical:**
- Supabase `signInWithOtp({ email, options: { emailRedirectTo } })`
- Custom email template with story preview
- Redirect to story review page

### Phase 3: Storyteller Dashboard (Simple)

**New page:** `/my-stories` (simplified view for storytellers)

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, Sarah! 👋                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  YOUR STORIES                                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │ 📖 "Finding Home After Removal"                         │
│  │    Created: Dec 10, 2024                                │
│  │                                                         │
│  │    SHARING                                              │
│  │    ┌─────────────────────────────────────────────────┐ │
│  │    │ [x] JusticeHub     - Full story, with my name   │ │
│  │    │ [ ] act.place      - Summary only, anonymous    │ │
│  │    │ [ ] Snow Foundation - Awaiting approval         │ │
│  │    └─────────────────────────────────────────────────┘ │
│  │                                                         │
│  │    ACTIVITY                                             │
│  │    👁️ 47 views on JusticeHub                           │
│  │    👁️ 12 views via direct link                         │
│  │                                                         │
│  │    [Edit Story]  [Manage Sharing]  [View Story]        │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 4: Platform Consent UI

**Component:** `PlatformConsentManager`

```
┌─────────────────────────────────────────────────────────────┐
│  WHERE SHOULD YOUR STORY APPEAR?                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │ 🏛️ JusticeHub                                           │
│  │    First Nations justice advocacy platform              │
│  │                                                         │
│  │    [====== ON ======]                                   │
│  │                                                         │
│  │    What to share:                                       │
│  │    ○ Full story                                         │
│  │    ● Summary only                                       │
│  │                                                         │
│  │    ○ Show my name                                       │
│  │    ● Keep me anonymous                                  │
│  │                                                         │
│  │    [ ] Include photos/video                             │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │ 🌍 act.place                                            │
│  │    Community action and advocacy                        │
│  │                                                         │
│  │    [      OFF      ]                                    │
│  │                                                         │
│  │    Click to enable sharing                              │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ⚡ Changes take effect immediately                         │
│  🔒 You can turn off sharing anytime - your story will     │
│     be removed from these platforms                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Distribution Integration

### act.place (Webflow)

**Option A: Embed Widget**
```html
<!-- Paste in Webflow embed block -->
<iframe
  src="https://empathyledger.com/embed/story/abc123?theme=earth"
  width="100%"
  height="400"
  frameborder="0">
</iframe>
```

**Option B: Story Gallery Widget**
```html
<!-- Shows all public stories from an organization -->
<iframe
  src="https://empathyledger.com/embed/gallery?org=act-place&limit=6"
  width="100%"
  height="800"
  frameborder="0">
</iframe>
```

### JusticeHub (API)

Already implemented - uses the external API:
```typescript
const client = new EmpathyLedgerClient(API_KEY)
const stories = await client.getStories({ type: 'testimony' })
```

JusticeHub receives webhook when:
- New story with consent is available
- Story is updated
- Consent is revoked (must remove immediately)

---

## Database Changes Needed

```sql
-- Add magic link fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  pending_story_review_id UUID REFERENCES stories(id);

-- Track magic link invitations
CREATE TABLE IF NOT EXISTS story_review_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id),
  storyteller_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '7 days',
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id)
);
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `/app/admin/quick-add/page.tsx` | CREATE | Operator quick-add form |
| `/app/auth/magic/route.ts` | CREATE | Magic link handler |
| `/app/my-stories/page.tsx` | CREATE | Simple storyteller dashboard |
| `/components/consent/PlatformConsentManager.tsx` | CREATE | Platform toggle UI |
| `/app/embed/gallery/page.tsx` | CREATE | Gallery widget |
| `/lib/services/magic-link.service.ts` | CREATE | Magic link utilities |
| `/app/api/invitations/route.ts` | CREATE | Invitation management |

---

## Priority Order

1. **Magic Link Auth** - Unblocks everything else
2. **Quick Add Form** - Enables rapid story capture
3. **Platform Consent UI** - Storyteller control
4. **My Stories Dashboard** - Storyteller home
5. **Gallery Widget** - For act.place embedding

---

## Success Criteria

**Test scenario:**
1. Operator meets storyteller, captures photo + interview
2. Operator uploads to Empathy Ledger via quick-add
3. Storyteller receives email "Your story is ready to review"
4. Storyteller clicks link, logs in (first time = creates account)
5. Storyteller sees their story, enables JusticeHub sharing
6. Story appears on JusticeHub within minutes
7. Storyteller later disables sharing → story removed from JusticeHub
