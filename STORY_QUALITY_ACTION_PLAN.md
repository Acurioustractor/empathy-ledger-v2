# Story Quality Improvement - Action Plan

## Current State

**Audit Date**: 2025-12-23
**Total Stories**: 318

### Quality Breakdown

| Category | Count | % | Priority |
|----------|-------|---|----------|
| ✅ Clean Stories | 96 | 30% | Keep as-is |
| ⚠️ Needs Review | 101 | 32% | Manual review |
| 🔄 Needs Transform | 54 | 17% | **HIGH - Use story-craft skill** |
| ❌ Delete (Test) | 8 | 3% | **IMMEDIATE - Delete** |
| 📝 Other Issues | 59 | 19% | Minor fixes |

### Key Issues Found

**High Severity (Needs Transformation):**
- 54 stories with timecodes, speaker labels, raw transcripts
- No narrative structure or flow
- Reads like interview Q&A, not stories
- Examples: "Paul Marchesi", "Shayne Bloomfield", "Kate Bjur"

**Medium Severity (Needs Review):**
- 101 stories with minor issues
- Some transcript artifacts
- Could use better structure
- Mostly salvageable

**Delete Immediately:**
- 8 test stories ("Story by Test", "E2E Test Story")

## Action Plan

### Phase 1: Immediate Cleanup (Today)

**1. Delete Test Stories** ⏱️ 5 minutes

```bash
node scripts/data-management/audit-story-quality.js --delete-flagged
```

This removes the 8 test/junk stories.

### Phase 2: Transform Raw Transcripts (This Week)

**2. Use story-craft Skill to Transform Stories** ⏱️ 2-4 hours

For each of the 54 stories needing transformation:

```
1. Open the story in admin panel
2. Copy the raw transcript
3. Launch story-craft skill:

   /skill story-craft

   Task: Transform this transcript into an authentic Empathy Ledger story:

   Transcript:
   [paste content]

   Cultural Context:
   - Storyteller: [name from title]
   - Topic: [infer from content]

   Create a story following Empathy Ledger principles.

4. Review the generated story
5. Update in database
```

**Priority Stories to Transform First:**

Top 20 (highest severity 10/10):
1. Shayne Bloomfield - ID: 7d07f582-cf89-41f6-b43f-2b5647bc1c8b
2. Tarren — Key Story - ID: f24cc3e4-2dc6-4c1f-bd7f-c54d6ab5f0f9
3. Kate Bjur — Key Story - ID: 3b819185-2de5-43c2-8a84-d669b06bf0b1
4. Neilson Naje — Key Story - ID: 3ee2fae2-0c5d-49e3-b2fd-ac5621868e08
5. Freddy Wai — Key Story - ID: a4973fc3-d45f-49aa-bac4-799131d82b7a
6. Chris Mourad — Key Story - ID: a2e90253-4d50-437f-bd49-e6c9e27ff486
7. David Allen — Key Story - ID: 267a525b-dd29-4bf6-b7a7-78581d64ef6c

_(Continue with remaining 47 stories)_

### Phase 3: Review & Polish (Next Week)

**3. Manual Review of 101 Stories**

Review stories with minor issues:
- Check for any remaining transcript artifacts
- Improve paragraph structure where needed
- Ensure cultural sensitivity
- Polish language and flow

### Phase 4: Quality Assurance

**4. Establish Ongoing Quality Standards**

- All new stories must pass quality checks before publishing
- Use story-craft skill for transcript → story conversion
- Regular audits (monthly)
- Training for content creators

## Tools & Resources

### Scripts

**Audit Tool:**
```bash
# Run full audit
node scripts/data-management/audit-story-quality.js

# Export to CSV for tracking
node scripts/data-management/audit-story-quality.js --export-csv

# Delete flagged stories
node scripts/data-management/audit-story-quality.js --delete-flagged
```

### Claude Skills

**story-craft Skill:**
Location: `.claude/skills/story-craft/skill.md`

Use this skill to:
- Transform raw transcripts into authentic stories
- Review story quality
- Apply Empathy Ledger voice and principles
- Ensure cultural sensitivity

**Invoke with:**
```
/skill story-craft
```

### Quality Checklist

Before publishing any story, ensure:

- [ ] No timecodes `[00:00:00]`
- [ ] No speaker labels (`Speaker 1:`, `Interviewer:`)
- [ ] No transcript artifacts (`[inaudible]`, `um, uh`)
- [ ] Has paragraph structure (not wall of text)
- [ ] Has narrative flow (beginning, middle, end)
- [ ] Includes cultural context where appropriate
- [ ] Uses authentic voice (not AI-generated feel)
- [ ] Emotionally resonant and specific
- [ ] Respectful of cultural protocols
- [ ] Stands alone (no interviewer questions)

## Empathy Ledger Story Standards

### The Voice

- **Authentic** - Real experiences, specific details
- **Respectful** - Culturally sensitive, honors Elders
- **Human** - Emotional truth, vulnerability, strength
- **Grounded** - Place, time, cultural context

### Story Structure

1. **Opening** - Hook with a moment or scene
2. **Context** - Who, where, when, cultural background
3. **Journey** - What happened (with arc)
4. **Insight** - What was learned or felt
5. **Resonance** - Why it matters

### Examples

**Good Story Opening:**
```
The first time I returned to Palm Island after the cyclone,
I couldn't recognize the shoreline. The mangroves—those
ancient sentinels that had stood for generations—were
stripped bare, their branches reaching skyward like
desperate prayers.
```

**Bad (Raw Transcript):**
```
Speaker 1: [00:00:15] So yeah, um, we came back after the
cyclone and, you know, like, everything was just, um, gone
basically.
```

## Metrics & Progress Tracking

### Current Baseline (2025-12-23)

- Total Stories: 318
- Clean: 96 (30%)
- Needs Work: 222 (70%)

### Target State (End of Week 1)

- Total Stories: 310 (after deleting 8 test stories)
- Clean: 150 (48%) - after transforming top 54
- Needs Work: 160 (52%)

### Target State (End of Month)

- Total Stories: 310
- Clean: 280 (90%)
- Needs Work: 30 (10%)

## Next Steps

### Immediate (Today)

1. ✅ Run audit script
2. ⏳ Delete 8 test stories
3. ⏳ Export CSV for tracking

### This Week

4. ⏳ Transform top 20 high-priority stories
5. ⏳ Review and test story-craft skill workflow
6. ⏳ Document transformation process

### Next Week

7. ⏳ Continue transforming remaining 34 stories
8. ⏳ Begin manual review of 101 minor-issue stories
9. ⏳ Establish quality gates for new stories

## Support & Documentation

- **Story Craft Skill**: `.claude/skills/story-craft/skill.md`
- **Quality Audit Script**: `scripts/data-management/audit-story-quality.js`
- **This Action Plan**: `STORY_QUALITY_ACTION_PLAN.md`

---

**Remember**: Every story represents a real person's truth. Our job is to honor that truth with craft, respect, and authenticity.
