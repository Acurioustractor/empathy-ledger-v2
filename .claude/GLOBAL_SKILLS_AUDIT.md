# Global Skills Audit - Empathy Ledger v2

**Date:** January 2, 2026
**Purpose:** Review all global skills for relevance, completeness, and value

---

## Executive Summary

**Total Global Skills:** 11 items (3 symlinks, 5 local copies, 3 standalone files)

**Status:**
- ✅ **3 Active & Valuable** - Keep and use
- ⚠️ **2 Empty Placeholders** - Delete (no content)
- 📦 **3 Project-Specific** - Move to local or archive
- 🔄 **3 Symlinked** - Keep (true global skills)

**Recommendation:** Consolidate from 11 items to 6 focused global skills

---

## Skills Inventory

### TRUE GLOBAL SKILLS (Symlinked from act-global-infrastructure)

These are maintained centrally and available across all ACT projects via symlinks.

#### 1. `act-brand-alignment` ⭐⭐⭐⭐⭐
**Location:** Symlink → `/Users/benknight/act-global-infrastructure/.claude/skills/act-brand-alignment`

**Status:** ✅ **KEEP** - Essential

**Purpose:** ACT voice, tone, LCAA methodology, farm metaphors, visual language

**Quality:** Excellent - Comprehensive (documented in ACT_SKILLS_SUMMARY.md as 245 lines)

**Relevance to Empathy Ledger:**
- High - Empathy Ledger is an ACT project
- Brand alignment critical for all content
- LCAA methodology guides feature development
- Farm metaphors inform storytelling approach

**Usage:** Content writing, design work, grant applications, strategic planning

**Recommendation:** **KEEP - USE FREQUENTLY**

---

#### 2. `act-sprint-workflow` ⭐⭐⭐⭐
**Location:** Symlink → `/Users/benknight/act-global-infrastructure/.claude/skills/act-sprint-workflow`

**Status:** ✅ **KEEP** - Valuable

**Purpose:** Sprint planning, task management, velocity tracking across ACT projects

**Quality:** Good (not deeply reviewed but symlink exists)

**Relevance to Empathy Ledger:**
- Medium-High - Useful for sprint planning
- Could inform Sprint 1 (Privacy & Cultural Controls) execution
- Cross-project coordination

**Potential Overlap:** May overlap with local `deployment-workflow` skill

**Recommendation:** **KEEP** - Use for sprint planning, but check for overlap with local workflow docs

---

#### 3. `ghl-crm-advisor` ⭐⭐⭐
**Location:** Symlink → `/Users/benknight/act-global-infrastructure/.claude/skills/ghl-crm-advisor`

**Status:** ✅ **KEEP** - Specialized

**Purpose:** GoHighLevel CRM implementation, pipelines, workflows

**Quality:** Good (exists in global infrastructure)

**Relevance to Empathy Ledger:**
- Low-Medium - Only if GoHighLevel integration active
- Local skill `gohighlevel-oauth` is more specific
- CRM strategy could be useful for storyteller outreach

**Recommendation:** **KEEP** - Low priority for Empathy Ledger, but useful for ACT ecosystem coordination

---

### LOCAL GLOBAL SKILLS (Copied to .claude/skills/global/)

These are stored locally but claim to be "global." Should be moved or removed.

#### 4. `act-github-pm` ⭐⭐⭐⭐
**Location:** `.claude/skills/global/act-github-pm/SKILL.md`

**Status:** ⚠️ **MOVE TO LOCAL** or symlink from global infrastructure

**Purpose:** GitHub project management, issue templates, labels, PR best practices

**Quality:** Very Good - Comprehensive label taxonomy (37 labels), issue templates, ACT conventions

**Relevance to Empathy Ledger:**
- High - GitHub is primary PM tool (user requested, not Beads)
- PR template created today references this approach
- Cross-repo coordination for ACT ecosystem

**Problem:** Stored locally instead of symlinked

**Recommendation:**
- **Option A:** Move to act-global-infrastructure and symlink (if used across projects)
- **Option B:** Move to `.claude/skills/local/` (if Empathy Ledger-specific)
- **Preference:** Option A - This is truly cross-project

---

#### 5. `act-project-enrichment.md` ⭐⭐
**Location:** `.claude/skills/global/act-project-enrichment.md` (451 lines)

**Status:** 📦 **ARCHIVE** - Project-specific to ACT Main Website

**Purpose:** Notion data extraction, Empathy Ledger story connection, blog linking, gallery management

**Quality:** Good - Comprehensive workflow documentation

**Relevance to Empathy Ledger:**
- Very Low - This is for ACT Main Website enriching project pages
- References Empathy Ledger as a DATA SOURCE, not consumer
- Specific to ACT Main CMS workflow

**Problem:** This is ACT Main Website-specific, not a global cross-project skill

**Recommendation:** **MOVE** to ACT Main Website `.claude/skills/local/`
- Remove from Empathy Ledger global skills
- Not relevant to Empathy Ledger development

---

#### 6. `multi-repo-sync.md` ⭐⭐⭐
**Location:** `.claude/skills/global/multi-repo-sync.md` (287 lines)

**Status:** ⚠️ **ARCHIVE OR MOVE** - Outdated

**Purpose:** Manage code changes across ACT's interconnected codebases (Empathy Ledger v.02, ACT Main, ACT Placemat)

**Quality:** Good - Detailed workflow for API contracts, shared types, coordinated deployments

**Relevance:**
- Medium - Useful IF making API changes that affect multiple codebases
- References "Empathy Ledger v.02" (old path `/Users/benknight/Code/Empathy Ledger v.02`)
- Current project is "Empathy Ledger v2" at different path

**Problems:**
1. Outdated paths
2. Unclear if multi-repo sync is still active workflow
3. Could conflict with single-repo focus

**Recommendation:**
- **Option A:** Update paths and keep if multi-repo sync is active
- **Option B:** Archive as reference if no longer actively syncing
- **Preference:** Archive - Focus on single-repo Empathy Ledger v2 for now

---

#### 7. `act-knowledge-base/` ⭐⭐
**Location:** `.claude/skills/global/act-knowledge-base/` (9 archived docs)

**Status:** 📦 **ARCHIVE ENTIRELY** - ACT Main-specific

**Purpose:** Knowledge extraction, Living Wiki improvements, Gmail/Notion scanner

**Quality:** Unknown - Contains 9 archived documents

**Files:**
- LLM_TRAINING_STRATEGY.md
- archive/ folder with 8 implementation docs

**Relevance to Empathy Ledger:**
- Very Low - This is ACT Main Website knowledge management
- Not relevant to Empathy Ledger storytelling platform

**Problem:** ACT Main-specific, mostly archived content

**Recommendation:** **REMOVE FROM EMPATHY LEDGER**
- Move to ACT Main Website
- Keep only if actively used for ACT-wide knowledge management

---

#### 8. `dist/` folder
**Location:** `.claude/skills/global/dist/`

**Status:** ❓ **CHECK CONTENTS**

**Purpose:** Unclear - possibly packaged skills

**Recommendation:** Check contents, likely can be removed

---

### EMPTY PLACEHOLDER SKILLS (No Content)

#### 9. `act-deployment-helper/` ❌
**Location:** `.claude/skills/global/act-deployment-helper/` (EMPTY)

**Status:** 🗑️ **DELETE** - No content

**Intended Purpose:** Deployment troubleshooting and guidance (per README.md)

**Problem:** Directory exists but completely empty

**Overlap:** Local `deployment-workflow` skill (509 lines) covers this comprehensively

**Recommendation:** **DELETE**
- No content to preserve
- Local deployment-workflow skill is superior
- Placeholder creating confusion

---

#### 10. `act-security-advisor/` ❌
**Location:** `.claude/skills/global/act-security-advisor/` (EMPTY)

**Status:** 🗑️ **DELETE** - No content

**Intended Purpose:** Security best practices and vulnerability scanning (per README.md)

**Problem:** Directory exists but completely empty

**Overlap:**
- PR template includes security checklist
- Local `gdpr-compliance` and `cultural-review` cover security aspects

**Recommendation:** **DELETE**
- No content to preserve
- Security covered by other mechanisms
- Create only if needed later

---

### DOCUMENTATION FILES

#### 11. `README.md` ⭐⭐⭐⭐⭐
**Location:** `.claude/skills/global/README.md` (306 lines)

**Status:** ✅ **KEEP & UPDATE**

**Purpose:** Documentation of global skills system, usage instructions, naming conventions

**Quality:** Excellent - Comprehensive guide

**Problem:** Lists skills that don't exist (act-deployment-helper, act-security-advisor)

**Recommendation:** **UPDATE**
- Remove references to empty skills
- Add accurate inventory
- Update project paths

---

#### 12. `ACT_SKILLS_SUMMARY.md` ⭐⭐⭐⭐
**Location:** `.claude/skills/global/ACT_SKILLS_SUMMARY.md` (251 lines)

**Status:** ✅ **KEEP** - Historical reference

**Purpose:** Documentation of act-brand-alignment skill enhancement

**Quality:** Excellent - Detailed enhancement summary

**Relevance:** Good reference for brand alignment skill usage

**Recommendation:** **KEEP** - Useful reference for understanding act-brand-alignment skill depth

---

## Recommendations Summary

### IMMEDIATE ACTIONS

**DELETE (Empty - No Value):**
- ❌ `act-deployment-helper/` - Empty directory
- ❌ `act-security-advisor/` - Empty directory

**ARCHIVE (Not Relevant to Empathy Ledger):**
- 📦 `act-project-enrichment.md` → Move to ACT Main Website
- 📦 `act-knowledge-base/` → Move to ACT Main Website
- 📦 `multi-repo-sync.md` → Archive (outdated paths) or update if still active

**MOVE TO LOCAL:**
- 🔄 `act-github-pm/` → Either symlink from global infrastructure OR move to `.claude/skills/local/`

**KEEP (Active Use):**
- ✅ `act-brand-alignment` (symlink)
- ✅ `act-sprint-workflow` (symlink)
- ✅ `ghl-crm-advisor` (symlink)
- ✅ `README.md` (update to match reality)
- ✅ `ACT_SKILLS_SUMMARY.md` (reference)

**CHECK:**
- ❓ `dist/` - Inspect contents, likely remove

---

## Proposed Final Structure

```
.claude/skills/global/
├── README.md (updated)
├── ACT_SKILLS_SUMMARY.md (reference)
├── act-brand-alignment -> /Users/benknight/act-global-infrastructure/.claude/skills/act-brand-alignment
├── act-sprint-workflow -> /Users/benknight/act-global-infrastructure/.claude/skills/act-sprint-workflow
├── ghl-crm-advisor -> /Users/benknight/act-global-infrastructure/.claude/skills/ghl-crm-advisor
└── act-github-pm -> /Users/benknight/act-global-infrastructure/.claude/skills/act-github-pm (IF moved to global)
```

**Result:** 6 items (4 symlinks + 2 docs) vs. current 11 items

---

## Value Assessment by Use Case

### For Empathy Ledger Development

| Skill | Value | Usage Frequency |
|-------|-------|-----------------|
| act-brand-alignment | ⭐⭐⭐⭐⭐ High | Weekly |
| deployment-workflow (local) | ⭐⭐⭐⭐⭐ High | Weekly |
| cultural-review (local) | ⭐⭐⭐⭐⭐ Critical | Every storyteller feature |
| act-github-pm | ⭐⭐⭐⭐ High | Weekly |
| act-sprint-workflow | ⭐⭐⭐ Medium | Bi-weekly (sprint planning) |
| ghl-crm-advisor | ⭐⭐ Low | Rarely (if integration active) |

### Not Valuable for Empathy Ledger

| Skill | Reason |
|-------|--------|
| act-project-enrichment | ACT Main Website-specific |
| act-knowledge-base | ACT Main Website-specific |
| multi-repo-sync | Outdated, unclear if active |
| act-deployment-helper | Empty |
| act-security-advisor | Empty |

---

## Next Steps

### 1. Clean Up Global Skills (Today)
```bash
# Delete empty placeholders
rm -rf .claude/skills/global/act-deployment-helper
rm -rf .claude/skills/global/act-security-advisor

# Archive ACT Main-specific skills
mkdir -p .claude/skills/global/_archived
mv .claude/skills/global/act-project-enrichment.md .claude/skills/global/_archived/
mv .claude/skills/global/act-knowledge-base .claude/skills/global/_archived/
mv .claude/skills/global/multi-repo-sync.md .claude/skills/global/_archived/

# Check dist folder
ls -la .claude/skills/global/dist/
# If not needed: rm -rf .claude/skills/global/dist/
```

### 2. Update README.md
- Remove act-deployment-helper and act-security-advisor
- Update project paths
- Reflect current reality

### 3. Decide on act-github-pm
**Option A:** Request to add to act-global-infrastructure, then symlink
**Option B:** Move to local skills

**Recommendation:** Move to act-global-infrastructure
- GitHub PM is cross-project
- Label taxonomy applies to all ACT projects
- Useful for ecosystem coordination

### 4. Update DEVELOPMENT_WORKFLOW.md
Reference only the skills that exist and are relevant

---

## Impact Assessment

### Before Cleanup
- 11 global skills items
- 2 completely empty
- 3 not relevant to Empathy Ledger
- Confusion about what's available
- README lists non-existent skills

### After Cleanup
- 6 focused global skills (4 symlinks + 2 docs)
- 100% actually exist and have content
- 100% relevant to Empathy Ledger development
- Clear understanding of purpose
- Accurate documentation

### Developer Experience Improvement
- ✅ Less confusion about which skills to use
- ✅ Faster skill discovery (6 vs 11)
- ✅ Clearer separation: global vs local
- ✅ Accurate README documentation
- ✅ Focus on high-value skills

---

## Questions for Decision

1. **act-github-pm**: Move to global infrastructure or keep local?
   - **Recommendation:** Global infrastructure (cross-project value)

2. **multi-repo-sync**: Update or archive?
   - **Recommendation:** Archive (unclear if still active)

3. **dist/ folder**: What's in it?
   - **Action:** Check contents before deciding

4. **act-sprint-workflow**: Is this actively used?
   - **Action:** Clarify if sprint workflow differs from DEVELOPMENT_WORKFLOW.md

---

**This audit ensures Empathy Ledger has a clean, focused set of global skills that are actually valuable and actively maintained.**
