# Phase 2 Implementation Summary
**"This Is Consensual" - Trust Indicators**

**Status:** ✅ Core components complete
**Date:** December 24, 2025

---

## What Was Built

### 1. Permission Tier System ✅

**5 Graduated Levels of Control:**

| Tier | Emoji | Who Can Access | Sharing Allowed | Can Withdraw |
|------|-------|----------------|-----------------|--------------|
| 🔴 **Private** | Private | Only storyteller | None | Yes |
| 🟡 **Trusted Circle** | Selective | People with access codes | Direct links, email only | Yes |
| 🟢 **Community** | Community | Community spaces/events | No social media/embed | Yes |
| 🔵 **Public** | Open | Anyone | Full sharing (social, embed, etc) | Yes |
| ⚪ **Archive** | Permanent | Anyone | Full sharing | **No** - Permanent record |

**Database Schema:**
- Enum type: `permission_tier`
- New columns on `stories` table:
  - `permission_tier` - Current sharing level
  - `consent_verified_at` - Last consent verification timestamp
  - `archive_consent_given` - Explicit consent for permanent archival
  - `elder_reviewed` - Community elder approval flag
  - `elder_reviewed_at` - Review timestamp
  - `elder_reviewer_id` - Which elder approved

**Business Logic:**
- Archive tier requires `archive_consent_given = true`
- Archived stories cannot be withdrawn (database constraint)
- Consent timestamp updates automatically when tier changes
- View: `stories_with_trust_indicators` for easy UI queries

**Files Created:**
- `supabase/migrations/20251224000000_permission_tiers.sql`
- `src/types/database/permission-tiers.ts`

---

### 2. Trust Badge Components ✅

**PermissionTierBadge**
- Shows tier with emoji and label
- Color-coded (red/yellow/green/blue/gray)
- Tooltip with explanation
- 3 sizes (sm/md/lg)

**TrustBadges** (Composite)
- Permission tier badge
- Elder Reviewed badge (👑 if applicable)
- Public Sharing Approved (✅ for public tiers)
- Recently Verified (🕐 if < 30 days)
- Consent Needs Renewal (⚠️ if > 30 days)

**Usage:**
```tsx
<TrustBadges
  permissionTier="public"
  elderReviewed={true}
  elderReviewedAt="2025-12-01"
  consentVerifiedAt="2025-12-15"
  status="published"
/>

// Renders:
// 🔵 Public  👑 Elder Reviewed  ✅ Public Sharing Approved  🕐 Updated 9d ago
```

**Files Created:**
- `src/components/story/permission-tier-badge.tsx`
- `src/components/story/trust-badges.tsx`

---

### 3. Consent Footer ✅

**Full Footer** (for story pages)
- Consent statement with storyteller name
- Last verified date
- Elder review indicator (if applicable)
- Shared by organization (if applicable)
- Sharing guidelines (attribution requirements)
- Archive notice (for permanent records)
- Link to ethical guidelines
- Report concerns email

**Compact Footer** (for embeds)
- Single-line consent notice
- Storyteller name + verification date
- Minimal footprint

**Usage:**
```tsx
<ConsentFooter
  storyId={story.id}
  storyTitle={story.title}
  storytellerName="Aunty June Thompson"
  permissionTier="public"
  consentVerifiedAt="2025-12-15"
  elderReviewed={true}
  sharedBy={{ name: "Community Health Org", id: "org-123" }}
/>
```

**Renders:**
```
───────────────────────────────────────────
🛡 This Story is Shared with Permission

✓ Aunty June Thompson approved this story for public sharing
✓ Last consent verified: December 15, 2025
✓ Can be withdrawn at any time by the storyteller
✓ Reviewed and approved by community Elders
✓ Shared by: Community Health Org (with permission)

When Sharing This Story Elsewhere:
• Include attribution: "Aunty June Thompson, shared with permission via Empathy Ledger"
• Link back to the original story
• Include this consent notice and date
• Do not edit or take quotes out of context
• Remove immediately if storyteller withdraws consent

Learn about our ethical storytelling practices →
Report concerns: safety@empathy-ledger.org
───────────────────────────────────────────
```

**Files Created:**
- `src/components/story/consent-footer.tsx`

---

## Database Functions

### can_create_share_link()
**Purpose:** Validates if share link can be created based on permission tier

**Logic:**
- Private tier → No sharing allowed
- Trusted Circle → Only direct-share, email
- Community → No social-media, embed
- Public → All purposes allowed
- Archive → All purposes allowed

**Usage:**
```sql
SELECT * FROM can_create_share_link(
  'story-id-123',
  'social-media'
);

-- Returns:
-- allowed | reason | tier
-- false   | "Community tier does not allow social media" | community
```

### validate_archive_consent()
**Purpose:** Enforces archive tier rules

**Prevents:**
- Setting archive tier without explicit consent
- Withdrawing archived stories
- Changing tier from archive to anything else

---

## TypeScript Utilities

### Permission Tier Config
```typescript
import {
  PERMISSION_TIERS,
  getPermissionTierConfig,
  isPurposeAllowed,
  getTierExplanation,
  getRecommendedTier,
} from '@/types/database/permission-tiers'

// Get full config
const config = getPermissionTierConfig('public')
// { label: "Public", emoji: "🔵", description: "...", allowedPurposes: [...] }

// Check if purpose allowed
const canEmbed = isPurposeAllowed('community', 'embed')
// false

// Get user-facing explanation
const explanation = getTierExplanation('trusted_circle')
// {
//   title: "Trusted Circle - Limited Sharing",
//   whatYouCan: [...],
//   whatYouCant: [...],
// }

// Get recommended tier based on content
const tier = getRecommendedTier({
  hasSacredKnowledge: true,
  hasDeceasedNames: false,
})
// 'community'
```

---

## Integration Examples

### Add Trust Badges to Story Card

```tsx
import TrustBadges from '@/components/story/trust-badges'

export function StoryCard({ story }) {
  return (
    <div className="story-card">
      <h3>{story.title}</h3>
      <TrustBadges
        permissionTier={story.permission_tier}
        elderReviewed={story.elder_reviewed}
        elderReviewedAt={story.elder_reviewed_at}
        consentVerifiedAt={story.consent_verified_at}
        status={story.status}
      />
      {/* Rest of card... */}
    </div>
  )
}
```

### Add Consent Footer to Public Story Page

```tsx
import ConsentFooter from '@/components/story/consent-footer'

export default function StoryPage({ story }) {
  return (
    <article>
      <StoryView story={story} />

      {/* Only show for public/archive tiers */}
      {(story.permission_tier === 'public' || story.permission_tier === 'archive') && (
        <ConsentFooter
          storyId={story.id}
          storyTitle={story.title}
          storytellerName={story.storyteller.display_name}
          permissionTier={story.permission_tier}
          consentVerifiedAt={story.consent_verified_at}
          elderReviewed={story.elder_reviewed}
        />
      )}
    </article>
  )
}
```

### Update Token-Based Story Route

Update `/src/app/s/[token]/page.tsx` to include consent footer:

```tsx
// Add to bottom of StoryView component
<ConsentFooterCompact
  storytellerName={story.storyteller.display_name}
  consentVerifiedAt={story.consent_verified_at}
/>
```

---

## What This Achieves

### For Storytellers
✅ **Visible Control** - Can see exactly what sharing level is set
✅ **Graduated Options** - Not just "public" or "private", 5 levels of control
✅ **Archive Safety** - Cannot accidentally archive (requires explicit flag)
✅ **Elder Integration** - Cultural review visible to all viewers
✅ **Consent Tracking** - Timestamp of last verification shown

### For Public/Viewers
✅ **Trust Indicators** - Badges show consent status at a glance
✅ **Transparency** - Consent footer explains permission and attribution
✅ **Cultural Respect** - Elder review badge shows cultural protocols followed
✅ **Honest Limitations** - Archive tier clearly states "cannot be withdrawn"

### For Organizations
✅ **Clear Permissions** - Can see what tier allows before requesting access
✅ **Attribution Guidance** - Consent footer provides exact attribution template
✅ **Consent Proof** - Verification date provides audit trail
✅ **Elder Approval** - Can see culturally appropriate stories

---

## Next Steps (To Complete Phase 2)

### Still Needed:

1. **Permission Tier Selector Component**
   - UI for storytellers to choose tier when creating/editing story
   - Shows explanation of each tier
   - Archive tier requires confirmation checkbox

2. **Integrate Tiers into Share Link API**
   - Update `/api/stories/[id]/share-link/route.ts`
   - Call `can_create_share_link()` before creating token
   - Return error if purpose not allowed for tier

3. **Ethical Guidelines Page**
   - `/ethical-guidelines` route
   - Explains consent model
   - Attribution examples
   - Cultural protocols

4. **Email Notifications** (Basic)
   - Story withdrawn → email storyteller
   - Story withdrawn → email organizations using it
   - Consent renewal reminder (30 days)

---

## Database Migration

To apply permission tiers:

```bash
# Run migration
psql -h [HOST] -U [USER] -d [DATABASE] -f supabase/migrations/20251224000000_permission_tiers.sql

# Verify
psql -c "SELECT permission_tier, count(*) FROM stories GROUP BY permission_tier;"

# Should show:
#  permission_tier | count
# -----------------+-------
#  public          |   154
#  private         |   156
```

**Migration automatically sets:**
- Published stories → `public`
- Draft/withdrawn → `private`
- All stories get `consent_verified_at` = `updated_at`

---

## Testing Checklist

### Database
- [ ] Permission tier enum created
- [ ] Stories table has new columns
- [ ] Indexes created
- [ ] `can_create_share_link()` function works
- [ ] Archive consent validation works
- [ ] Cannot withdraw archived story
- [ ] Consent timestamp updates on tier change

### Components
- [ ] PermissionTierBadge displays all 5 tiers correctly
- [ ] Tooltip shows on hover
- [ ] TrustBadges shows all indicators
- [ ] Elder badge appears when `elder_reviewed = true`
- [ ] Consent renewal badge appears after 30 days
- [ ] ConsentFooter renders correctly
- [ ] Compact variant works
- [ ] Archive notice shows for archive tier

### UI Integration
- [ ] Add TrustBadges to story cards
- [ ] Add ConsentFooter to `/s/[token]` route
- [ ] Add ConsentFooter to public story pages
- [ ] Test all permission tiers display
- [ ] Test mobile responsive

### User Flows
- [ ] Storyteller sees permission tier badge on their stories
- [ ] Public user sees consent footer on shared stories
- [ ] Elder reviewed stories show crown badge
- [ ] Archive stories show permanent notice
- [ ] Consent renewal warning appears after 30 days

---

## Files Reference

### New Files
```
supabase/migrations/20251224000000_permission_tiers.sql
src/types/database/permission-tiers.ts
src/components/story/permission-tier-badge.tsx
src/components/story/trust-badges.tsx
src/components/story/consent-footer.tsx
```

### Files to Update (Next)
```
src/app/s/[token]/page.tsx - Add consent footer
src/components/story/story-card.tsx - Add trust badges
src/app/api/stories/[id]/share-link/route.ts - Validate tier before creating link
```

---

## Key Design Decisions

### 1. Five Tiers, Not Three
**Decision:** Offer 5 permission levels instead of just private/community/public.

**Rationale:** Different comfort levels exist. Some people want to share with friends (trusted circle) but not publicly. Some want community-only. Rigid categories don't respect nuance.

### 2. Archive Tier is Permanent
**Decision:** Archive tier cannot be withdrawn, requires explicit consent flag.

**Rationale:** Historical record has value, but must be fully informed consent. Making it permanent (with warning) is more honest than allowing withdrawal then having cached copies anyway.

### 3. Consent Verification Timestamp
**Decision:** Track when consent was last verified, show warning after 30 days.

**Rationale:** Consent isn't permanent. People's comfort levels change. Checking in after 30 days respects ongoing consent.

### 4. Elder Review as Separate Flag
**Decision:** Elder review is orthogonal to permission tier (can have private + elder reviewed).

**Rationale:** Elder review is about cultural appropriateness, not sharing level. A story can be culturally appropriate but still private.

---

## Success Criteria

**Phase 2 is successful if:**
- [ ] Storytellers understand the 5 tiers
- [ ] 80% of stories set to public or community tier
- [ ] Public users see consent badges on all shared stories
- [ ] 0 complaints about unclear permissions
- [ ] Organizations request access to stories with confidence
- [ ] Elder review visible and respected

---

**Status:** ✅ Core functionality ready for integration
**Next Step:** Run migration, integrate components into existing pages, test with users
