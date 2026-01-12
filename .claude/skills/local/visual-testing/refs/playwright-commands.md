# Playwright Commands Reference

## Running Tests

### Basic Commands
```bash
# Run all tests
npm run test:e2e

# Run visual tests only
npm run test:visual

# Update snapshots (when design changes are intentional)
npm run test:visual:update

# Run with UI (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Filtering Tests
```bash
# Run specific test file
npx playwright test e2e/visual/homepage.spec.ts

# Run by test name pattern
npx playwright test --grep "homepage"

# Run visual tests only (tagged with @visual)
npx playwright test --grep @visual

# Exclude visual tests
npx playwright test --grep-invert @visual
```

### Browser Selection
```bash
# Chromium only (fastest)
npx playwright test --project=chromium

# All desktop browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Mobile only
npx playwright test --project=mobile-chrome --project=mobile-safari
```

## Screenshot Options

### Full Page
```typescript
await expect(page).toHaveScreenshot('name.png', { fullPage: true });
```

### Element Only
```typescript
const element = page.locator('.hero-section');
await expect(element).toHaveScreenshot('hero.png');
```

### Custom Viewport
```typescript
await page.setViewportSize({ width: 375, height: 812 });
await expect(page).toHaveScreenshot('mobile.png');
```

### With Tolerance
```typescript
await expect(page).toHaveScreenshot('name.png', {
  maxDiffPixels: 100,      // Allow 100 pixels to differ
  threshold: 0.2,          // 20% color difference threshold
});
```

## Viewing Results

### HTML Report
```bash
# Open report after tests complete
npx playwright show-report
```

### Trace Viewer
```bash
# View trace from failed test
npx playwright show-trace e2e/test-results/test-name/trace.zip
```

## Directory Structure
```
e2e/
├── visual/              # Visual regression tests
│   └── homepage.spec.ts
├── pages/               # Page-specific tests
│   └── public-pages.spec.ts
├── fixtures/            # Test utilities
│   └── screenshot-utils.ts
├── snapshots/           # Baseline screenshots (committed)
│   └── homepage-chromium.png
└── test-results/        # Test outputs (gitignored)
    └── homepage-diff.png
```

## CI Integration

### GitHub Actions Example
```yaml
- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Flaky Screenshots
- Add `await page.waitForLoadState('networkidle')` before capture
- Add `await page.waitForTimeout(500)` for animations
- Use `maxDiffPixels` for acceptable variance

### Missing Browsers
```bash
npx playwright install
```

### Port Conflicts
The config uses port 3030 (PM2 dev server). Ensure server is running:
```bash
pm2 status
pm2 start npm --name "empathy-ledger" -- run dev
```
