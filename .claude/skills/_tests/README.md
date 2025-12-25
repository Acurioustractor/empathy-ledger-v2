# Skills Testing Framework

## Purpose

Test that Claude Code skills work correctly:
- Auto-invoke on correct keywords
- Provide accurate guidance
- Execute correctly
- Handle edge cases

---

## Test Structure

Each skill has a test file: `skill-name.test.md`

**Format**:
```markdown
# Skill Name Test Suite

## Test 1: Auto-Invocation
**Input**: "User phrase here"
**Expected**: Skill invoked
**Result**: ✅ Pass / ❌ Fail

## Test 2: Functionality
**Input**: Specific command/request
**Expected**: Correct output
**Result**: ✅ Pass / ❌ Fail
```

---

## Running Tests

### Manual Testing

1. Open Claude Code
2. Try each test input
3. Mark result (✅/❌)
4. Document any issues

### Automated (Future)

```bash
# Future: automated skill testing
./scripts/test-skills.sh
```

---

## Test Categories

### 1. Invocation Tests

**Purpose**: Verify skill auto-loads on keywords

**Example**:
```markdown
## Test: Deployment Keyword
**Input**: "I need to deploy to production"
**Expected**: deployment-workflow skill invoked
**How to verify**: Claude mentions deployment checklist
```

### 2. Functionality Tests

**Purpose**: Verify skill provides correct guidance

**Example**:
```markdown
## Test: Pre-Flight Checks
**Input**: "Run deployment checks"
**Expected**: Lists build, lint, migration verification
**How to verify**: Output includes specific commands
```

### 3. Edge Case Tests

**Purpose**: Handle unusual scenarios

**Example**:
```markdown
## Test: No Database Migrations
**Input**: "Deploy but no migrations exist"
**Expected**: Graceful handling, proceeds without migration step
```

### 4. Integration Tests

**Purpose**: Skills work together

**Example**:
```markdown
## Test: Deploy + Database Skills
**Input**: "Deploy with new migration"
**Expected**: Both deployment-workflow and database-navigator skills used
```

---

## Example Test Files

See:
- `deployment-workflow.test.md` - Complete example
- `design-component.test.md` - UI skill example
- `cultural-review.test.md` - Sensitivity checks

---

## Creating New Tests

### 1. Copy Template

```bash
cp .claude/skills/_tests/template.test.md .claude/skills/_tests/new-skill.test.md
```

### 2. Fill in Tests

Based on skill functionality:
- Common use cases (3-5 tests)
- Edge cases (2-3 tests)
- Integration scenarios (1-2 tests)

### 3. Run Tests

Manually or with test script (when available)

### 4. Document Results

Update test file with ✅ or ❌

---

## Test Template

```markdown
# [Skill Name] Test Suite

**Skill**: `skill-name`
**Category**: [category]
**Last Tested**: YYYY-MM-DD
**Tester**: [Your Name]

---

## Invocation Tests

### Test 1.1: Primary Keyword
**Input**: "Main trigger phrase"
**Expected**: Skill invoked
**Result**: [ ] Pass / [ ] Fail
**Notes**:

### Test 1.2: Alternative Keyword
**Input**: "Alternative phrase"
**Expected**: Skill invoked
**Result**: [ ] Pass / [ ] Fail
**Notes**:

---

## Functionality Tests

### Test 2.1: [Feature Name]
**Setup**: Prerequisites if any
**Input**: "Request here"
**Expected**: Specific output
**Result**: [ ] Pass / [ ] Fail
**Notes**:

### Test 2.2: [Another Feature]
**Input**: "Different request"
**Expected**: Different output
**Result**: [ ] Pass / [ ] Fail
**Notes**:

---

## Edge Case Tests

### Test 3.1: [Edge Case]
**Scenario**: Unusual situation
**Input**: "Request in edge case"
**Expected**: Graceful handling
**Result**: [ ] Pass / [ ] Fail
**Notes**:

---

## Integration Tests

### Test 4.1: [Integration Scenario]
**Skills Involved**: skill-1, skill-2
**Input**: "Request needing multiple skills"
**Expected**: Both skills work together
**Result**: [ ] Pass / [ ] Fail
**Notes**:

---

## Summary

**Total Tests**: X
**Passed**: X
**Failed**: X
**Pass Rate**: X%

**Issues Found**:
1. Issue description
2. Issue description

**Action Items**:
- [ ] Fix issue 1
- [ ] Improve documentation for issue 2
```

---

## Regression Testing

### When to Test

**Always test after**:
- Updating skill documentation
- Changing trigger keywords
- Modifying skill behavior
- Major Claude Code updates

**Schedule**:
- **Weekly**: High-priority skills
- **Monthly**: All skills
- **After incidents**: Related skills

---

## Test Results Tracking

### Test Log Format

```markdown
## Test Run: 2025-12-26

**Tester**: Your Name
**Claude Code Version**: 1.x.x
**Test Duration**: 30 minutes

### Results

| Skill | Tests Run | Passed | Failed | Pass Rate |
|-------|-----------|--------|--------|-----------|
| deployment-workflow | 8 | 8 | 0 | 100% |
| design-component | 6 | 5 | 1 | 83% |
| supabase | 7 | 7 | 0 | 100% |

### Issues

1. **design-component**: Theme badge colors not showing
   - **Severity**: Low
   - **Action**: Update documentation

### Summary

- **Overall Pass Rate**: 95%
- **Critical Issues**: 0
- **Action Items**: 1
```

---

## Continuous Improvement

### Metrics to Track

- Invocation accuracy (% of time correct skill loads)
- Guidance completeness (% providing full answer)
- Error rate (% of skill executions failing)
- User satisfaction (from feedback)

### Review Process

**Quarterly**:
1. Review all test results
2. Identify patterns in failures
3. Update skills or tests
4. Document improvements

---

## Tools

### Current

- Manual testing via Claude Code
- Test files in `.claude/skills/_tests/`
- Results tracked in test files

### Future

- Automated test runner script
- CI/CD integration
- Test coverage reports
- Performance benchmarks

---

**Last Updated**: 2025-12-26
