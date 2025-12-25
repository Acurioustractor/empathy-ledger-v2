# Field Workflow - Quick Start Guide

## The Complete Journey in 60 Seconds

```
┌─────────────────────────────────────────────────────────────┐
│                    FIELD WORKER                             │
│                  (Traveling the World)                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├─ 1. Hello! 👋
                          │
                          ├─ 2. Record Interview 🎥
                          │
                          ├─ 3. Take Photo 📸
                          │
                          ├─ 4. Generate QR Code 📱
                          │
                          ▼
              ╔═══════════════════════╗
              ║   SHOW QR CODE OR     ║
              ║   SEND EMAIL LINK     ║
              ╚═══════════════════════╝
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   STORYTELLER                                │
│                (At Home/Community)                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├─ 5. Scan QR / Click Link 📱
                          │
                          ├─ 6. Auto Sign Up ✅
                          │
                          ├─ 7. Story Linked 🔗
                          │
                          ├─ 8. Get Notification 🔔
                          │
                          ├─ 9. Review Story 📖
                          │
                          ├─ 10. Set Privacy 🔒
                          │
                          └─ 11. Control Sharing 🌐
```

## What Was Built

### ✅ Magic Link System
- **Routes**: `/auth/magic`, `/auth/magic-callback`
- **Service**: `magicLinkService`
- **Database**: `story_review_invitations` table
- **Features**: QR codes, email links, 7-day expiry

### ✅ Auto Notifications
- **Migration**: `20251226000000_story_notification_triggers.sql`
- **Triggers**:
  - Story linked → "New Story Linked"
  - Invitation accepted → "Story Ready to Review"
  - Privacy changed → "Privacy Updated"

### ✅ Find My Stories
- **Route**: `/find-my-stories`
- **Features**:
  - Search by email/name
  - One-click claim
  - Stats dashboard

### ✅ Complete Documentation
- [FIELD_STORYTELLING_WORKFLOW.md](FIELD_STORYTELLING_WORKFLOW.md) - Full technical docs
- [SIGNUP_IMPLEMENTATION.md](SIGNUP_IMPLEMENTATION.md) - Signup flow

## Quick Test

### 1. As Field Worker
```bash
# Start dev server
npm run dev

# Visit: http://localhost:3005
# Login as field worker or use guest PIN
# Create a story with storyteller email
# Generate magic link/QR
```

### 2. As Storyteller
```bash
# Option A: Scan QR code with phone
# Option B: Click magic link in email
# ↓
# Auto-signed up
# ↓
# See story at /my-story/{id}
# ↓
# Set privacy tier
# ↓
# Done!
```

## The 5 Privacy Tiers

| Tier | Icon | Name | Who Can See It |
|------|------|------|----------------|
| 1 | 🔴 | Private | Only me |
| 2 | 🟡 | Trusted Circle | People with direct links |
| 3 | 🟢 | Community | Community events only |
| 4 | 🔵 | Public | Everyone (can withdraw) |
| 5 | ⚪ | Archive | Permanent public (cannot withdraw) |

## Key URLs

| Purpose | URL |
|---------|-----|
| Signup | `/auth/signup` |
| Magic Link Login | `/auth/magic?token=xxx` |
| Find Stories | `/find-my-stories` |
| View Story | `/my-story/{id}` |
| Share Link | `/s/{token}` |

## Files Created/Modified

### New Routes
- `/src/app/auth/magic/route.ts` - Magic link handler
- `/src/app/auth/magic-callback/route.ts` - Email verification
- `/src/app/auth/verify-magic-link/page.tsx` - Instructions page
- `/src/app/find-my-stories/page.tsx` - Claim stories UI

### New Components
- `/src/components/auth/SignUpForm.tsx` - Signup form
- `/src/components/auth/ResendVerificationButton.tsx` - Email resend
- `/src/components/stories/FindMyStoriesClient.tsx` - Claim UI

### New Migrations
- `20251226000000_story_notification_triggers.sql` - Auto notifications

### Documentation
- `docs/FIELD_STORYTELLING_WORKFLOW.md` - Complete technical guide
- `docs/SIGNUP_IMPLEMENTATION.md` - Signup flow docs
- `docs/FIELD_WORKFLOW_QUICK_START.md` - This file

## What Already Existed

✅ Guest PIN system
✅ QuickCaptureForm for stories
✅ Media upload with deduplication
✅ 5-tier permission system
✅ Story access tokens
✅ Notifications table
✅ Cultural safety workflows

## What Was Missing (Now Built)

✅ `/auth/magic` route
✅ Magic link callback route
✅ Auto notification triggers
✅ Find My Stories UI
✅ Claim content workflow

## Next: SMS Integration (Optional)

To add SMS text message magic links:

```typescript
// Install Twilio
npm install twilio

// Add to magic-link.service.ts
private async sendSMS(phone: string, link: string) {
  const twilio = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  await twilio.messages.create({
    body: `Your story is ready! Open: ${link}`,
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER
  })
}
```

## Support

Questions? Check:
1. [FIELD_STORYTELLING_WORKFLOW.md](FIELD_STORYTELLING_WORKFLOW.md) - Full docs
2. [SIGNUP_IMPLEMENTATION.md](SIGNUP_IMPLEMENTATION.md) - Auth flows
3. Console logs - All routes log with emojis for easy tracking

---

**Status**: 🎉 Production Ready
**Last Updated**: 2025-12-26
