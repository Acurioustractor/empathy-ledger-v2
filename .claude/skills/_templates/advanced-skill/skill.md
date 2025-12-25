# Advanced Skill Template

This template includes additional sections for complex skills with multiple features, examples, and integrations.

**Purpose**: Comprehensive skill for [complex task description]

**Use When**:
- Complex scenario 1
- Complex scenario 2
- Multi-step workflow

**Invocation Examples**:
- "Detailed phrase 1"
- "Detailed phrase 2"

---

## Table of Contents

1. [Context & Background](#context--background)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Common Patterns](#common-patterns)
5. [Advanced Features](#advanced-features)
6. [Integrations](#integrations)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)
9. [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)

---

## Context & Background

### Why This Skill Exists

[Detailed explanation of the problem this skill solves]

### Domain Knowledge

[Relevant technical or business context]

### Architecture Overview

```
[ASCII diagram or description of system architecture]
```

---

## Prerequisites

Before using this skill, ensure:

- [ ] Prerequisite 1 (with verification command)
- [ ] Prerequisite 2 (with verification command)
- [ ] Prerequisite 3

**Verification**:
```bash
# Check prerequisites
command --check
```

---

## Step-by-Step Guide

### Phase 1: Setup

#### Step 1.1: [Action Name]

Detailed description...

```typescript
// Code example
const setup = () => {
  // Implementation
};
```

**Why**: Explanation of why this step is necessary

#### Step 1.2: [Action Name]

Next step...

### Phase 2: Execution

#### Step 2.1: [Action Name]

Main workflow step...

```bash
# Shell command
command --with flags
```

**Expected Output**:
```
Sample output...
```

**If errors occur**: See [Troubleshooting](#troubleshooting)

### Phase 3: Verification

#### Step 3.1: [Verification Step]

How to confirm success...

---

## Common Patterns

### Pattern 1: [Basic Pattern]

**Use Case**: When to use this pattern

```typescript
// Pattern implementation
interface Pattern1 {
  field: string;
  method(): void;
}
```

**Benefits**:
- Benefit 1
- Benefit 2

**Trade-offs**:
- Consideration 1
- Consideration 2

### Pattern 2: [Advanced Pattern]

**Use Case**: Complex scenario

```typescript
// Advanced implementation
class AdvancedPattern {
  // Full implementation
}
```

---

## Advanced Features

### Feature 1: [Feature Name]

**Purpose**: What this feature does

**Usage**:
```typescript
// Feature code
const feature = useFeature();
```

**Configuration**:
```json
{
  "option1": "value",
  "option2": true
}
```

### Feature 2: [Feature Name]

[Another advanced feature]

---

## Integrations

### Integration 1: [Tool/Service Name]

**Setup**:
```bash
# Integration setup
npm install integration-package
```

**Configuration**:
```typescript
// Integration code
import { Integration } from 'package';

const setup = new Integration({
  // Config
});
```

**Example Usage**:
```typescript
// How to use with this skill
await setup.execute();
```

### Integration 2: [Another Integration]

[Details...]

---

## Examples

### Example 1: [Real-World Scenario]

**Scenario**: Detailed description of realistic use case

**Context**:
- Background info
- Requirements
- Constraints

**Implementation**:

```typescript
// Step 1
const step1 = () => {
  // Code
};

// Step 2
const step2 = () => {
  // Code
};

// Step 3
const result = step2(step1());
```

**Result**:
- Outcome 1
- Outcome 2

**Lessons Learned**:
- Insight 1
- Insight 2

### Example 2: [Another Scenario]

[Full example...]

### Example 3: [Edge Case]

**Scenario**: Unusual but important case

[Implementation and notes...]

---

## Troubleshooting

### Category 1: Common Issues

#### Issue: [Specific Problem]

**Symptoms**:
- Error message: `Error text here`
- Behavior: Description

**Root Cause**: Explanation

**Solution**:
```bash
# Fix steps
command --fix
```

**Prevention**: How to avoid this issue

#### Issue: [Another Problem]

[Details...]

### Category 2: Performance Issues

#### Issue: [Slow Performance]

**Symptoms**: Description

**Diagnosis**:
```bash
# Performance profiling
tool --profile
```

**Solution**: Optimization steps

---

## Performance Optimization

### Optimization 1: [Technique Name]

**Problem**: What slows things down

**Solution**:
```typescript
// Optimized code
const optimized = useMemo(() => {
  // Implementation
}, [deps]);
```

**Impact**: Performance improvement metrics

### Optimization 2: [Another Technique]

[Details...]

---

## Best Practices

### Do's ✅

1. **Always [Action]** - Why this is important
2. **Prefer [Pattern]** - Reasoning
3. **Use [Tool/Method]** - Benefits

### Don'ts ❌

1. **Never [Anti-Pattern]** - Why to avoid
2. **Avoid [Practice]** - Alternative approach
3. **Don't [Action]** - Consequences

### Code Quality Checklist

- [ ] Follows naming conventions
- [ ] Has proper error handling
- [ ] Includes tests
- [ ] Documented edge cases
- [ ] Performance optimized

---

## Testing

### Unit Tests

```typescript
describe('Feature', () => {
  it('should [behavior]', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

```typescript
// Integration test example
```

### Manual Testing Checklist

- [ ] Test case 1
- [ ] Test case 2
- [ ] Edge case testing

---

## Related Skills

| Skill | Relationship | When to Use Instead |
|-------|--------------|---------------------|
| [skill-1] | Complementary | Use for [scenario] |
| [skill-2] | Alternative | Use when [condition] |
| [skill-3] | Dependency | Required first for [reason] |

---

## Maintenance

### Regular Updates Needed

- [ ] Review quarterly for accuracy
- [ ] Update examples with latest patterns
- [ ] Check integrations still work
- [ ] Verify links and references

### Version History

- **1.0.0** (2025-12-26) - Initial release
- **[Future]** - Planned improvements

---

## References

- [Documentation Link 1](https://example.com)
- [Documentation Link 2](https://example.com)
- [Related Article](https://example.com)

---

## Appendix

### Glossary

- **Term 1**: Definition
- **Term 2**: Definition

### Configuration Reference

```json
{
  "complete": "configuration",
  "schema": "here"
}
```

---

**Last Updated**: 2025-12-26
**Version**: 1.0.0
**Complexity**: Advanced
**Estimated Time**: 30-60 minutes
