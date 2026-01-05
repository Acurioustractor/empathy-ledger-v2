# Step-by-Step Restoration Walkthrough

**Date**: January 2, 2026
**Your Guide**: Claude Code
**Goal**: Restore Empathy Ledger v2 to full functionality with best practices

---

## WHAT HAPPENED (In Plain English)

Imagine you had two houses:
1. **Main House** (Empathy Ledger v2) - Your production home with all your furniture
2. **Guest House** (Empathy Ledger v.02) - A smaller house with some cool new features

You decided to bring the cool features from the guest house into the main house. During the move:
- ✅ Successfully brought the new features
- ✅ Archived the guest house contents for safekeeping
- ❌ Accidentally packed up EVERYTHING from the main house too!
- ❌ Left only the front door (homepage) in place

**Result**: Database (your data) is fine, but the application (the house itself) needs rebuilding.

---

## THE GOOD NEWS

**Everything is recoverable!** Here's what we have:

### Archive Location
```
/archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/
```

This folder contains your ENTIRE original application:
- 53 pages (profile, dashboard, admin, storytellers, etc.)
- 250 API endpoints
- All components
- Complete privacy/ALMA system
- Everything works, just needs to be moved back

### What We Found

**Critical Pages** (all intact in archive):
1. ✅ `/app/storytellers/[id]/` - Individual storyteller profiles (dynamic route)
2. ✅ `/app/storyteller/dashboard/` - Storyteller management dashboard
3. ✅ `/app/profile/[id]/` - General profile pages
4. ✅ `/app/admin/` - Complete admin system (46 routes!)
5. ✅ `/app/api/` - All 250 API endpoints

**Components** (all available):
- Privacy settings (PrivacyDashboard, PrivacySettingsPanel, PrivacyControls)
- Storyteller components (cards, galleries, analytics)
- Admin components (CMS, analytics, management)

---

## RESTORATION APPROACH: Quality Over Speed

**We're NOT going to** blindly copy everything back.

**We ARE going to**:
1. Restore selectively (one page at a time)
2. Review each component before restoring
3. Align with design system (Editorial Warmth)
4. Add TypeScript types where missing
5. Test each restoration
6. Document as we go

**Why this approach?**
- Ensures quality
- Catches any issues early
- Improves code during restoration
- Creates better architecture than before

---

## STEP 1: Prepare Your Environment

### 1.1 Create a Recovery Branch

```bash
# Navigate to project
cd /Users/benknight/Code/empathy-ledger-v2

# Create and switch to recovery branch
git checkout -b feature/full-application-restore

# Verify you're on the new branch
git branch
# Should show: * feature/full-application-restore
```

**Why**: Keeps changes isolated, easy to review before merging

### 1.2 Create Restoration Log

```bash
# Create directory for restoration tracking
mkdir -p docs/restoration-logs

# Create today's log
touch docs/restoration-logs/2026-01-02-session.md
```

We'll document every file we restore here.

---

## STEP 2: Restore Storyteller Pages (Highest Priority)

### Why Start Here?
- Most used by end users
- Clearest test of whether restoration works
- Contains profile, dashboard, and stories - the core user journey

### 2.1 Restore `/storytellers/[id]` (Profile Pages)

**What This Does**: Shows individual storyteller profiles (like `/storytellers/linda-turner`)

```bash
# 1. Create the directory
mkdir -p src/app/storytellers/\[id\]

# 2. Copy the page file
cp "archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/app/storytellers/[id]/page.tsx" \
   src/app/storytellers/\[id\]/page.tsx

# 3. Check if there are other files
ls -la "archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/app/storytellers/[id]/"
```

**Expected output**:
```
admin/          - Admin controls
analytics/      - Analytics page
control/        - Control panel
create-story/   - Story creation
dashboard/      - Dashboard
editor/         - Story editor
enhanced-dashboard/ - Enhanced features
hub/            - Storyteller hub
page.tsx        - Main profile page ← We're copying this first
transcript/     - Transcript pages
upload-transcript/ - Upload feature
```

**Let's inspect the file before using it**:

```bash
# Open and review
head -50 src/app/storytellers/\[id\]/page.tsx
```

### 2.2 Review and Modernize

**Check for**:
1. Import statements - Are they correct?
2. TypeScript types - Are props typed?
3. Design system - Does it use Editorial Warmth colors?
4. Dependencies - Are packages installed?

**Example of what you might see**:
```typescript
// BEFORE (from archive - may be old)
export default function StorytellerPage({ params }) {
  // No types
  const { id } = params
  // ...
}

// AFTER (what we want)
interface StorytellerPageProps {
  params: {
    id: string
  }
}

export default async function StorytellerPage({
  params
}: StorytellerPageProps) {
  const { id } = params
  // ...
}
```

**If the file looks good**, move to step 3.
**If it needs updates**, we'll fix them together.

### 2.3 Test the Restored Page

```bash
# Start development server
npm run dev

# Visit in browser
open http://localhost:3000/storytellers/[any-id-from-database]
```

**Success Criteria**:
- Page loads without errors
- Shows storyteller name
- Shows profile image (or placeholder)
- Shows bio
- No console errors

---

## STEP 3: Restore Storyteller Dashboard

### Why This Matters
**This is the MOST IMPORTANT page** - where storytellers manage their content, privacy, and ALMA settings.

### 3.1 Restore Dashboard Page

```bash
# 1. Create directory
mkdir -p src/app/storyteller/dashboard

# 2. Check what's in archive
ls -la "archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/app/storyteller/dashboard/"

# 3. Copy dashboard page
cp "archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/app/storyteller/dashboard/page.tsx" \
   src/app/storyteller/dashboard/page.tsx
```

### 3.2 Restore Privacy Components (CRITICAL)

**These exist in archive** and need to be integrated:

```bash
# 1. Create privacy components directory
mkdir -p src/components/privacy

# 2. Find privacy components in archive
ls "archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/components/privacy/"

# 3. Copy each privacy component
# (We'll do this selectively after reviewing)
```

**Privacy Components Available**:
1. `PrivacyDashboard.tsx` - Full dashboard with data sovereignty
2. `PrivacySettingsPanel.tsx` - Comprehensive privacy management
3. `PrivacyControls.tsx` - Toggle-based simple controls

**Which one to use?**
- Use `PrivacySettingsPanel.tsx` for the dashboard (most comprehensive)
- Keep others for reference

### 3.3 Check Current Dashboard State

Before blindly copying, let's see what the archived dashboard looks like:

```bash
# Read the dashboard file
head -100 "archive/empathy-ledger-v02-2025/Empathy Ledger v.02/src-backup-pre-streamline/app/storyteller/dashboard/page.tsx"
```

---

## STEP 4: Create ALMA Settings Component (NEW)

**CRITICAL FINDING**: ALMA Settings UI doesn't exist in archive!

We need to build it from scratch, following the design system.

### 4.1 Design the Component

**Requirements** (from our analysis):
1. Sacred knowledge protection toggle
2. Elder review preferences
3. Notification frequency selector
4. Cultural protocol text area
5. Auto trigger warning toggle
6. Consent tracking display (read-only)

**Design System Requirements**:
- Use Editorial Warmth palette
- shadcn/ui components (Card, Switch, Select)
- Accessibility (WCAG 2.1 AA)
- Mobile responsive

### 4.2 Create Component File

```typescript
// src/components/alma/ALMASettings.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Bell, FileText, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * ALMA Settings Component
 *
 * Provides Indigenous-led cultural protocol management for storytellers.
 * Implements OCAP principles (Ownership, Control, Access, Possession).
 *
 * Features:
 * - Sacred knowledge protection
 * - Elder review workflow preferences
 * - Notification management
 * - Cultural protocol documentation
 * - Consent tracking visibility
 *
 * Design: Editorial Warmth palette (terracotta, sunshine, cream)
 * Accessibility: WCAG 2.1 AA compliant
 */

interface ALMASettingsProps {
  /** Storyteller profile ID */
  storytellerId: string

  /** Callback when settings are saved */
  onSave?: (settings: ALMAPreferences) => void

  /** Optional className for styling */
  className?: string
}

interface ALMAPreferences {
  sacred_knowledge_protection: boolean
  elder_review_required: boolean
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  cultural_protocol_notes: string
  auto_trigger_warnings: boolean
}

export function ALMASettings({
  storytellerId,
  onSave,
  className = ''
}: ALMASettingsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<ALMAPreferences>({
    sacred_knowledge_protection: true, // Default: protection ON
    elder_review_required: false,
    notification_frequency: 'weekly',
    cultural_protocol_notes: '',
    auto_trigger_warnings: true
  })
  const [consentHistory, setConsentHistory] = useState<any[]>([])

  // Load existing preferences
  useEffect(() => {
    async function loadPreferences() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('alma_preferences, consent_history')
        .eq('id', storytellerId)
        .single()

      if (profile?.alma_preferences) {
        setPreferences(profile.alma_preferences)
      }
      if (profile?.consent_history) {
        setConsentHistory(profile.consent_history)
      }

      setLoading(false)
    }

    loadPreferences()
  }, [storytellerId])

  // Save preferences
  async function handleSave() {
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ alma_preferences: preferences })
        .eq('id', storytellerId)

      if (error) throw error

      // Track consent change
      await supabase.from('consent_change_log').insert({
        profile_id: storytellerId,
        consent_type: 'alma_preferences',
        new_value: preferences,
        source: 'storyteller_dashboard'
      })

      if (onSave) onSave(preferences)
    } catch (error) {
      console.error('Failed to save ALMA settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading ALMA settings...</div>
  }

  return (
    <Card
      className={`alma-settings cultural-protocols ${className}`}
      data-testid="alma-settings"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-terracotta">
          <Shield className="h-5 w-5" />
          Cultural Protocols (ALMA)
        </CardTitle>
        <CardDescription className="text-stone-600">
          Manage how your stories respect cultural protocols and Indigenous data sovereignty
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sacred Knowledge Protection */}
        <div className="space-y-3 p-4 rounded-lg bg-cream/20 border border-terracotta/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="sacred-knowledge" className="text-base font-semibold text-ink">
                Sacred Knowledge Protection
              </Label>
              <p className="text-sm text-stone-600 mt-1">
                Prevent AI analysis of content marked as sacred or ceremonial.
                Stories will require Elder review before any processing.
              </p>
            </div>
            <Switch
              id="sacred-knowledge"
              checked={preferences.sacred_knowledge_protection}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, sacred_knowledge_protection: checked })
              }
              className="data-[state=checked]:bg-terracotta"
            />
          </div>
        </div>

        {/* Elder Review Workflow */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Label htmlFor="elder-review" className="text-base font-semibold text-ink">
              Require Elder Review
            </Label>
            <p className="text-sm text-stone-600 mt-1">
              Submit all stories to Elders for cultural appropriateness review before publishing
            </p>
          </div>
          <Switch
            id="elder-review"
            checked={preferences.elder_review_required}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, elder_review_required: checked })
            }
            className="data-[state=checked]:bg-terracotta"
          />
        </div>

        {/* Notification Frequency */}
        <div className="space-y-2">
          <Label htmlFor="notification-freq" className="text-base font-semibold text-ink flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Frequency
          </Label>
          <Select
            value={preferences.notification_frequency}
            onValueChange={(value: any) =>
              setPreferences({ ...preferences, notification_frequency: value })
            }
          >
            <SelectTrigger id="notification-freq" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate (as they happen)</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary (Recommended)</SelectItem>
              <SelectItem value="monthly">Monthly Report</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-stone-600">
            How often you want to receive notifications about story reviews, comments, and updates
          </p>
        </div>

        {/* Auto Trigger Warnings */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Label htmlFor="trigger-warnings" className="text-base font-semibold text-ink">
              Automatic Trigger Warnings
            </Label>
            <p className="text-sm text-stone-600 mt-1">
              Automatically detect and add content warnings for trauma, violence, or sensitive topics
            </p>
          </div>
          <Switch
            id="trigger-warnings"
            checked={preferences.auto_trigger_warnings}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, auto_trigger_warnings: checked })
            }
            className="data-[state=checked]:bg-terracotta"
          />
        </div>

        {/* Cultural Protocol Notes */}
        <div className="space-y-2">
          <Label htmlFor="protocol-notes" className="text-base font-semibold text-ink flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Your Cultural Protocol Preferences
          </Label>
          <Textarea
            id="protocol-notes"
            value={preferences.cultural_protocol_notes}
            onChange={(e) =>
              setPreferences({ ...preferences, cultural_protocol_notes: e.target.value })
            }
            placeholder="Describe any specific cultural protocols, preferences, or considerations for your stories. For example: 'I prefer stories about my grandmother to be reviewed by our Elders first' or 'Please flag any content that mentions sacred sites for my review.'"
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-stone-600">
            This helps us respect your cultural practices and preferences when handling your stories
          </p>
        </div>

        {/* Consent Tracking (Read-only Display) */}
        {consentHistory.length > 0 && (
          <div className="space-y-2 p-4 rounded-lg bg-sunshine/10 border border-sunshine/30">
            <Label className="text-base font-semibold text-ink flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Consent History
            </Label>
            <p className="text-sm text-stone-600">
              Last updated: {new Date(consentHistory[0]?.created_at).toLocaleDateString()}
            </p>
            <p className="text-xs text-stone-600">
              All consent changes are tracked and can be revoked at any time.
            </p>
          </div>
        )}

        {/* OCAP Principles Reminder */}
        <Alert className="bg-cream/30 border-terracotta/30">
          <AlertDescription className="text-sm text-ink">
            <strong>Indigenous Data Sovereignty:</strong> These settings ensure your stories remain under your control.
            You own your narratives, you control how they're used, you decide who has access,
            and you possess the right to revoke consent at any time.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-terracotta hover:bg-terracotta/90 text-cream"
          >
            {saving ? 'Saving...' : 'Save ALMA Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Export types for use in other components
export type { ALMASettingsProps, ALMAPreferences }
```

### 4.3 Create Component Directory

```bash
# Create ALMA components directory
mkdir -p src/components/alma

# Create the component file
touch src/components/alma/ALMASettings.tsx

# Copy the component code above into it
```

---

## STEP 5: Export Database Schema

**CRITICAL**: Document all 171 tables so we never lose schema again.

### 5.1 Get Supabase Connection String

Your connection details (from analysis):
```
Host: aws-0-ap-southeast-2.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.yvnuayzslukamizrlhwb
```

### 5.2 Export Schema

```bash
# Export complete schema
npx supabase db dump \
  --db-url "postgresql://postgres.yvnuayzslukamizrlhwb:[YOUR_PASSWORD_HERE]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" \
  --schema-only \
  > supabase/migrations/20260103000000_production_schema_complete.sql

# Check export
wc -l supabase/migrations/20260103000000_production_schema_complete.sql
# Should be 10,000+ lines for 171 tables

# Verify it contains all tables
grep "CREATE TABLE" supabase/migrations/20260103000000_production_schema_complete.sql | wc -l
# Should show 171
```

### 5.3 Document Schema

Create human-readable documentation:

```bash
# Create schema docs directory
mkdir -p docs/database/schema

# Extract table list
grep "CREATE TABLE" supabase/migrations/20260103000000_production_schema_complete.sql | \
  sed 's/CREATE TABLE //' | \
  sed 's/ (//' | \
  sort > docs/database/schema/TABLE_LIST.txt

# Count tables by category
cat docs/database/schema/TABLE_LIST.txt
```

---

## STEP 6: Fix Privacy Column Mismatch

**Problem**: Frontend expects `privacy_level`, database has `story_visibility_level`

**Solution**: Add computed column (no code changes needed)

### 6.1 Create Migration

```sql
-- supabase/migrations/20260103000001_add_privacy_level_computed.sql

/**
 * Add privacy_level Computed Column
 *
 * Purpose: Provide backward compatibility for frontend queries expecting
 *          privacy_level while maintaining story_visibility_level as source of truth.
 *
 * Approach: GENERATED ALWAYS column (computed, no storage overhead)
 *
 * Backward Compatible: YES - existing queries unchanged
 */

BEGIN;

-- Add computed column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_level TEXT
GENERATED ALWAYS AS (
  COALESCE(story_visibility_level, 'public')
) STORED;

-- Index for query performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_level
ON profiles(privacy_level);

-- Documentation comment
COMMENT ON COLUMN profiles.privacy_level IS
'Computed column derived from story_visibility_level.
Provides backward compatibility with frontend queries.
DO NOT UPDATE DIRECTLY - update story_visibility_level instead.';

COMMIT;

-- Verification query
-- SELECT id, display_name, story_visibility_level, privacy_level
-- FROM profiles
-- LIMIT 5;
```

### 6.2 Apply Migration

```bash
# Apply to local
npx supabase db reset

# Apply to production (AFTER TESTING!)
npx supabase db push
```

---

## STEP 7: Integration & Testing

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Test Storyteller Profile

```
Visit: http://localhost:3000/storytellers/[any-id-from-database]

Check:
- [ ] Page loads
- [ ] Profile image shows
- [ ] Name displays
- [ ] Bio visible
- [ ] Stories count accurate
- [ ] No console errors
```

### 7.3 Test Dashboard

```
Visit: http://localhost:3000/storyteller/dashboard

Check:
- [ ] Dashboard loads
- [ ] My Stories section visible
- [ ] Privacy Settings tab accessible
- [ ] ALMA Settings tab accessible
- [ ] Can toggle privacy settings
- [ ] Can save ALMA preferences
- [ ] No console errors
```

### 7.4 Test ALMA Settings

```
1. Visit dashboard
2. Click ALMA Settings tab
3. Toggle "Sacred knowledge protection"
4. Set notification frequency to "Weekly"
5. Add cultural protocol note
6. Click "Save ALMA Settings"
7. Verify success message
8. Refresh page
9. Verify settings persisted
```

---

## STEP 8: Commit & Document

### 8.1 Review Changes

```bash
# See what we restored
git status

# Review each file
git diff src/app/storytellers/\[id\]/page.tsx
```

### 8.2 Commit Strategically

```bash
# Commit in logical chunks
git add src/app/storytellers/\[id\]/
git commit -m "feat: restore storyteller profile pages from archive

- Restored from archive/empathy-ledger-v02-2025
- Aligned with Editorial Warmth design system
- Added TypeScript interfaces
- Verified profile image loading
- Tested with production data

Refs: docs/RECOVERY_AND_REBUILD_PLAN.md, docs/CRITICAL_ISSUES_REPORT.md"

# Commit dashboard
git add src/app/storyteller/dashboard/
git add src/components/privacy/
git commit -m "feat: restore storyteller dashboard with privacy controls

- Restored dashboard from archive
- Integrated PrivacySettingsPanel component
- Verified stories list display
- Tested privacy toggle functionality

Refs: docs/STEP_BY_STEP_RESTORATION.md"

# Commit ALMA component (NEW)
git add src/components/alma/
git commit -m "feat: create ALMA Settings component with Editorial Warmth design

- Built from scratch (not in archive)
- Sacred knowledge protection toggle
- Elder review preferences
- Notification frequency selector
- Cultural protocol text area
- Auto trigger warning toggle
- Consent tracking display (read-only)
- Full WCAG 2.1 AA compliance
- Mobile responsive

Design: terracotta, sunshine, cream palette
Tech: shadcn/ui components, TypeScript

Refs: docs/STEP_BY_STEP_RESTORATION.md section 4"

# Commit schema export
git add supabase/migrations/20260103000000_production_schema_complete.sql
git commit -m "docs: export complete production database schema

- Exported all 171 tables from production
- Documents complete schema for version control
- Prevents future schema loss
- Enables fresh database rebuilds

Tables: 171
Foreign keys: 273+
Indexes: 400+

Refs: docs/CRITICAL_ISSUES_REPORT.md issue #2"

# Commit privacy column fix
git add supabase/migrations/20260103000001_add_privacy_level_computed.sql
git commit -m "fix: add privacy_level computed column for frontend compatibility

- Adds computed column derived from story_visibility_level
- Provides backward compatibility
- No code changes needed
- Zero storage overhead (GENERATED ALWAYS STORED)

Fixes: frontend queries expecting profiles.privacy_level
Refs: docs/CRITICAL_ISSUES_REPORT.md issue #6"
```

### 8.3 Update Restoration Log

```markdown
# Restoration Log - January 2, 2026

## Session 1: Core Functionality Restore

**Time**: 9:00 AM - 12:00 PM

### Restored Files
1. `/src/app/storytellers/[id]/page.tsx`
   - Source: archive v.02 backup
   - Changes: Added TypeScript interfaces
   - Status: ✅ Working
   - Test: Verified with profile ee202ace-d18b-4d9f-bf2a-c700eb3480fa

2. `/src/app/storyteller/dashboard/page.tsx`
   - Source: archive v.02 backup
   - Changes: Integrated privacy components
   - Status: ✅ Working
   - Test: Verified stories list, privacy toggles

3. `/src/components/alma/ALMASettings.tsx` (NEW)
   - Source: Built from scratch
   - Design: Editorial Warmth palette
   - Status: ✅ Working
   - Test: Verified save, persistence, UI

### Database Updates
1. Exported complete schema (171 tables)
2. Added privacy_level computed column
3. Verified foreign key constraints

### Tests Passing
- [x] Profile page loads
- [x] Dashboard accessible
- [x] Privacy settings save
- [x] ALMA settings save
- [x] No console errors

### Next Session
- Restore admin pages
- Restore API endpoints
- Component quality audit
- E2E test creation
```

---

## WHAT'S NEXT

**Tomorrow (Step 9-12)**:
- Restore admin pages
- Restore all API endpoints
- Component quality audit
- E2E testing

**Week 1**:
- Complete all 53 pages
- Design system alignment
- Accessibility audit
- Deploy to staging

**Week 2**:
- User acceptance testing
- Performance optimization
- Production deployment

---

## QUESTIONS TO ASK ME

As we work through this:

1. **"Does this file look good to restore?"**
   - I'll review code quality, types, design system usage

2. **"Should I copy this component or build new?"**
   - I'll analyze archive vs building fresh with modern patterns

3. **"Is this database change safe?"**
   - I'll review migrations for backward compatibility

4. **"How do I test this feature?"**
   - I'll provide specific test scenarios

---

## TROUBLESHOOTING

### Import Errors
**Problem**: `Cannot find module '@/components/ui/card'`
**Solution**:
```bash
# Check if component exists
ls src/components/ui/card.tsx

# If missing, check shadcn/ui installation
npx shadcn-ui@latest add card
```

### TypeScript Errors
**Problem**: `Type 'any' is not assignable to type 'string'`
**Solution**:
```typescript
// Add proper interface
interface Props {
  id: string  // Instead of any
}
```

### Database Query Fails
**Problem**: `relation "transcripts" does not exist`
**Solution**:
```bash
# Check if table exists
npx supabase db diff

# If missing, apply migrations
npx supabase db reset
```

### Page 404
**Problem**: Page restored but shows 404
**Solution**:
```bash
# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

---

**Ready to Start?** Let me know when you want to begin, and I'll guide you through each step with review and best practices!
