---
name: visual-testing
description: Capture screenshots, run visual tests, and view page designs using Playwright.
---

# Visual Testing

Capture and compare screenshots of all pages using Playwright.

## When to Use
- Need to see current page designs
- Visual regression testing
- Responsive design verification
- Before/after comparisons

## Quick Commands
```bash
# Run all visual tests (captures screenshots)
npm run test:visual

# Update baseline snapshots
npm run test:visual:update

# Run with UI for interactive testing
npm run test:e2e:ui

# Capture specific page
npx playwright test e2e/pages/public-pages.spec.ts --grep "homepage"
```

## Captured Screenshots Location
```
e2e/
├── snapshots/           # Baseline images for comparison
├── test-results/        # Test outputs & diffs
└── visual/              # Visual test specs
```

## Capture Custom Screenshot
```typescript
// In any test file
import { test, expect } from '@playwright/test';

test('capture my page', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page).toHaveScreenshot('my-page.png', { fullPage: true });
});
```

## View Screenshots
After running tests, open the HTML report:
```bash
npx playwright show-report
```

## Viewports Tested
| Viewport | Size |
|----------|------|
| Desktop | 1440×900 |
| Laptop | 1280×800 |
| Tablet | 768×1024 |
| Mobile | 375×812 |

## Reference Files
| Topic | File |
|-------|------|
| Screenshot utilities | `e2e/fixtures/screenshot-utils.ts` |
| Public page tests | `e2e/pages/public-pages.spec.ts` |
| Homepage visual tests | `e2e/visual/homepage.spec.ts` |

## Related Skills
- `design-system-guardian` - Design token enforcement
- `design-component` - Component creation
