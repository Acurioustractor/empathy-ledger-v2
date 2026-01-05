# Goods Project Setup Guide
**Organization:** A Curious Tractor
**Project:** Goods.
**Status:** 🟡 Needs Storytellers

---

## Current State

### ✅ What's Already Set Up

**Organization:** A Curious Tractor
- **ID:** `db0de7bd-eb10-446b-99e9-0f3b7c199b8a`
- **Tenant ID:** `5f1314c1-ffe9-4d8f-944b-6cdf02d4b943`
- **Status:** Active
- **Members:** 5 total (1 admin, 4 members)

**Project:** Goods.
- **ID:** `6bd47c8a-e676-456f-aa25-ddcbb5a31047`
- **Status:** Active
- **Description:** Supporting communities
- **Organization:** A Curious Tractor ✅

---

## 🔴 What's Missing

### 1. Storytellers for Goods Project

**Current Storytellers:** 1 total
- **Sarah Johnson** - Has storyteller role but:
  - ❌ No bio
  - ✅ Has cultural background (Indigenous Canadian)
  - ❌ No transcripts
  - ❌ Not assigned to Goods project

**Gap:** Need storytellers with:
- Complete profiles (bio, cultural background)
- Transcripts/stories to share
- Connection to the Goods project mission

---

### 2. Potential Storytellers in Organization

**Current Members (not storytellers):**
1. **Mary Storyteller** (`mary.storyteller@curioustractor.org`)
   - ✅ Has bio (41 chars - needs expansion)
   - ❌ Missing cultural background
   - ❌ Not marked as storyteller
   - 💡 Name suggests potential storyteller role

2. **John Community** (`john.member@curioustractor.org`)
   - ✅ Has bio (40 chars - needs expansion)
   - ❌ Missing cultural background
   - Standard member role

3. **Sarah Coordinator** (`sarah.coordinator@curioustractor.org`)
   - ✅ Has bio (41 chars - needs expansion)
   - ❌ Missing cultural background
   - Standard member role

---

## 🎯 Setup Options

### Option 1: Promote Existing Member to Storyteller

**Best Candidate: Mary Storyteller**
- Already has "Storyteller" in name
- Has basic bio started
- Just needs:
  1. Add 'storyteller' to tenant_roles
  2. Expand bio with full story
  3. Add cultural background
  4. Assign to Goods project
  5. Create first transcript

**How to do this:**

```sql
-- 1. Add storyteller role
UPDATE profiles
SET tenant_roles = array_append(tenant_roles, 'storyteller')
WHERE id = '63d85a87-3671-4412-9c9b-e8bed6d6ff8b'
AND NOT ('storyteller' = ANY(tenant_roles));

-- 2. Assign to Goods project
INSERT INTO project_storytellers (project_id, storyteller_id)
VALUES ('6bd47c8a-e676-456f-aa25-ddcbb5a31047', '63d85a87-3671-4412-9c9b-e8bed6d6ff8b');
```

---

### Option 2: Improve Existing Storyteller (Sarah Johnson)

**Current Storyteller: Sarah Johnson**
- Already has storyteller role ✅
- Has cultural background ✅
- Needs:
  1. Bio creation/expansion
  2. Assignment to Goods project
  3. First transcript

**How to do this:**

```sql
-- 1. Assign to Goods project
INSERT INTO project_storytellers (project_id, storyteller_id)
VALUES ('6bd47c8a-e676-456f-aa25-ddcbb5a31047', 'd7caa214-69a8-4497-83d2-0a68af32eb20');
```

Then add bio and transcripts through the admin interface.

---

### Option 3: Create New Storytellers

**If you have new community members to add:**

1. Create profile via admin interface or API
2. Add to A Curious Tractor organization
3. Set tenant_roles to include 'storyteller'
4. Add bio and cultural background
5. Assign to Goods project
6. Create transcripts

**SQL Template:**

```sql
-- After creating profile through UI, add storyteller role
UPDATE profiles
SET tenant_roles = array_append(tenant_roles, 'storyteller')
WHERE id = 'new-profile-id';

-- Add to organization
INSERT INTO profile_organizations (profile_id, organization_id, role, is_active)
VALUES ('new-profile-id', 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a', 'member', true);

-- Assign to Goods project
INSERT INTO project_storytellers (project_id, storyteller_id)
VALUES ('6bd47c8a-e676-456f-aa25-ddcbb5a31047', 'new-profile-id');
```

---

## 📋 Recommended Workflow

### Phase 1: Setup Foundation (Immediate)

1. **Decision: Who should be the first Goods storyteller?**
   - [ ] Sarah Johnson (already storyteller, needs bio)
   - [ ] Mary Storyteller (needs role upgrade)
   - [ ] New external storyteller

2. **Complete Profile:**
   - [ ] Write comprehensive bio (500-1000 chars)
   - [ ] Add cultural background information
   - [ ] Upload profile photo (optional but recommended)

3. **Assign to Project:**
   - [ ] Add storyteller to Goods project via `project_storytellers`
   - [ ] Verify assignment in admin interface

---

### Phase 2: Content Creation (Week 1)

1. **Create First Transcript:**
   - [ ] Conduct interview/recording session
   - [ ] Transcribe or upload existing transcript
   - [ ] Link to Goods project
   - [ ] Set status to 'pending'

2. **AI Analysis:**
   - [ ] Run transcript through AI analyzer
   - [ ] Generate summary, themes, key quotes
   - [ ] Review for accuracy and cultural sensitivity

3. **Quality Check:**
   - [ ] Review transcript completeness
   - [ ] Verify cultural information accuracy
   - [ ] Check project linkage

---

### Phase 3: Expansion (Weeks 2-4)

1. **Add More Storytellers:**
   - [ ] Identify 2-3 additional community members
   - [ ] Complete profile setup for each
   - [ ] Assign to Goods project

2. **Build Content Library:**
   - [ ] Aim for 2-3 transcripts per storyteller
   - [ ] Ensure diverse perspectives/themes
   - [ ] Analyze all for cross-cutting insights

3. **Project Development:**
   - [ ] Define Goods project scope/goals
   - [ ] Create project description
   - [ ] Plan storytelling events/outputs

---

## 🛠️ Technical Setup Scripts

### Check Current Status
```bash
node scripts/analyze-curious-tractor-goods.js
```

### Promote Mary to Storyteller
```typescript
// Run this in a script or admin interface
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

async function promoteMaryToStoryteller() {
  const MARY_ID = '63d85a87-3671-4412-9c9b-e8bed6d6ff8b';
  const GOODS_PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

  // Add storyteller role
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_roles')
    .eq('id', MARY_ID)
    .single();

  if (!profile.tenant_roles.includes('storyteller')) {
    await supabase
      .from('profiles')
      .update({
        tenant_roles: [...profile.tenant_roles, 'storyteller']
      })
      .eq('id', MARY_ID);
  }

  // Assign to Goods project
  await supabase
    .from('project_storytellers')
    .insert({
      project_id: GOODS_PROJECT_ID,
      storyteller_id: MARY_ID
    });

  console.log('✅ Mary promoted to storyteller and assigned to Goods');
}
```

### Assign Sarah Johnson to Goods
```typescript
async function assignSarahToGoods() {
  const SARAH_ID = 'd7caa214-69a8-4497-83d2-0a68af32eb20';
  const GOODS_PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

  await supabase
    .from('project_storytellers')
    .insert({
      project_id: GOODS_PROJECT_ID,
      storyteller_id: SARAH_ID
    });

  console.log('✅ Sarah assigned to Goods project');
}
```

---

## 📊 Success Metrics

### Immediate Goals (Week 1)
- [ ] At least 1 storyteller assigned to Goods
- [ ] Storyteller has complete profile
- [ ] First transcript created and analyzed

### Short-term Goals (Month 1)
- [ ] 2-3 storytellers active in Goods
- [ ] 5-7 transcripts total
- [ ] All transcripts fully analyzed
- [ ] Project description expanded

### Long-term Goals (Quarter 1)
- [ ] 5+ storytellers
- [ ] 15+ transcripts
- [ ] Cross-storyteller themes identified
- [ ] Public-facing content created
- [ ] Storytelling event/workshop held

---

## 🤔 Key Questions to Answer

1. **Who is the Goods project for?**
   - What communities does it serve?
   - What's the mission/purpose?

2. **What stories should we capture?**
   - What themes are important?
   - What impact do you want to create?

3. **Who are the storytellers?**
   - Do you have community members ready to share?
   - Need to recruit new storytellers?

4. **What's the timeline?**
   - Urgent launch or gradual build?
   - Any specific milestones/events?

---

## 💡 Recommendations

### Based on Current State:

1. **Start with Sarah Johnson:**
   - She's already a storyteller
   - Just needs bio and project assignment
   - Quickest path to first story

2. **Upgrade Mary Storyteller:**
   - Name suggests storytelling role intended
   - Already has basic bio
   - Easy promotion to storyteller

3. **Define Goods Project Scope:**
   - Current description ("Supporting communities") is vague
   - Need clear mission and goals
   - Will help recruit appropriate storytellers

4. **Use Oonchiumpa as Template:**
   - They have 4 storytellers with 7 transcripts
   - All fully analyzed with insights
   - Can replicate their workflow

---

## 📁 Related Documentation

- **Organization System:** [ORGANIZATION_MEMBERSHIP_SYSTEM.md](ORGANIZATION_MEMBERSHIP_SYSTEM.md)
- **Oonchiumpa Success Story:** [OONCHIUMPA_COMPLETE_ANALYSIS.md](OONCHIUMPA_COMPLETE_ANALYSIS.md)
- **Transcript Workflow:** [TRANSCRIPT_TO_STORY_WORKFLOW.md](TRANSCRIPT_TO_STORY_WORKFLOW.md)

---

## 🚀 Next Steps

**Immediate Actions:**
1. Decide: Sarah or Mary as first Goods storyteller?
2. Complete their profile (bio + cultural background)
3. Assign to Goods project
4. Create first transcript

**This Week:**
1. Set up admin interface access for profile management
2. Prepare interview questions/recording setup
3. Draft Goods project description
4. Plan storytelling approach

**This Month:**
1. Add 2-3 storytellers total
2. Create 5+ transcripts
3. Run AI analysis on all
4. Generate insights report

---

*Ready to build! Let me know which option you'd like to pursue and I'll help execute it.* 🎯
