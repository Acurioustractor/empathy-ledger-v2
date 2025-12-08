# Generate E2E Test

Generate a Playwright E2E test for the specified feature or component.

## Test Generation Guidelines

1. **Analyze the feature**: Understand what needs to be tested
2. **Identify test cases**: List all scenarios to cover
3. **Use Page Object pattern**: Create or update page objects
4. **Include accessibility checks**: Add axe-core testing
5. **Add visual regression**: Screenshot comparisons where appropriate

## Test Structure

```typescript
import { test, expect } from '@playwright/test'
import { PageObject } from '../pages/PageObject'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup and authentication
  })

  test('should do expected behavior', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  })
})
```

## Test Categories to Include

1. **Happy Path**: Main user flows
2. **Edge Cases**: Empty states, errors
3. **Authentication**: Protected routes
4. **Responsiveness**: Mobile/tablet breakpoints
5. **Accessibility**: WCAG compliance

## Output

Generate:
1. **Test file** in `tests/e2e/`
2. **Page object** if needed in `tests/e2e/pages/`
3. **Test data fixtures** if needed

## Reference

- See `.claude/agents/testing-automation.md` for patterns
- Check `playwright.config.ts` for configuration
- Follow existing test patterns in `tests/e2e/`

---

**Feature to test:** $ARGUMENTS
